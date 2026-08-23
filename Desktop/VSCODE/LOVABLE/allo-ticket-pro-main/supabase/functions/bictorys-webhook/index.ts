import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-secret-key',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const WEBHOOK_SECRET = Deno.env.get('BYCTORY_SECRET_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Backend configuration missing');
    }

    // Validate X-Secret-Key header
    const secretKey = req.headers.get('X-Secret-Key') || req.headers.get('x-secret-key');
    if (WEBHOOK_SECRET && secretKey !== WEBHOOK_SECRET) {
      console.error('Invalid webhook secret key');
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const payload = await req.json();
    console.log('Bictorys webhook received:', JSON.stringify(payload));

    const status = payload.status?.toLowerCase();
    const paymentReference = payload.paymentReference;
    const transactionId = payload.id;
    const amount = payload.amount;

    if (!status || !paymentReference) {
      console.log('Missing required fields: status or paymentReference');
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the transaction
    let transaction = null;
    if (paymentReference) {
      const { data } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('reference', paymentReference)
        .maybeSingle();
      transaction = data;
    }

    if (!transaction && transactionId) {
      const { data } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('transaction_id', transactionId.toString())
        .maybeSingle();
      transaction = data;
    }

    if (!transaction) {
      console.error('Transaction not found for reference:', paymentReference);
      return new Response(
        JSON.stringify({ success: false, message: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Don't re-process already completed transactions
    if (transaction.status === 'completed') {
      console.log('Transaction already completed:', transaction.id);
      return new Response(
        JSON.stringify({ success: true, message: 'Already processed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify amount matches
    if (amount && Number(amount) !== Number(transaction.amount)) {
      console.error('Amount mismatch:', amount, '!=', transaction.amount);
      await supabase
        .from('payment_transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id);
      return new Response(
        JSON.stringify({ success: false, message: 'Amount mismatch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process based on status
    if (status === 'succeeded' || status === 'authorized') {
      // Mark transaction as completed
      await supabase
        .from('payment_transactions')
        .update({ status: 'completed' })
        .eq('id', transaction.id);

      console.log('Transaction marked as completed:', transaction.id);

      // === CREATE THE TICKET ===
      const { data: eventData } = await supabase
        .from('events')
        .select('name, event_date, event_time, location')
        .eq('id', transaction.event_id)
        .maybeSingle();

      const { data: ticketType } = await supabase
        .from('ticket_types')
        .select('name, price, quantity_available')
        .eq('id', transaction.ticket_type_id)
        .maybeSingle();

      if (!eventData || !ticketType) {
        console.error('Event or ticket type not found for ticket creation');
      } else {
        const ticketCode = `TKT-${uuidv4().slice(0, 8).toUpperCase()}`;
        const qrCodeData = `https://radiologie-senegal-connect.lovable.app/ticket/${ticketCode}`;

        const { data: ticket, error: ticketError } = await supabase
          .from('tickets')
          .insert({
            ticket_code: ticketCode,
            event_id: transaction.event_id,
            ticket_type_id: transaction.ticket_type_id,
            user_id: transaction.user_id || '00000000-0000-0000-0000-000000000000',
            customer_first_name: transaction.customer_first_name,
            customer_last_name: transaction.customer_last_name,
            customer_phone: transaction.customer_phone,
            customer_email: transaction.customer_email,
            price_paid: transaction.amount,
            status: 'valid',
            qr_code_data: qrCodeData,
          })
          .select()
          .single();

        if (ticketError) {
          console.error('Failed to create ticket:', ticketError);
        } else {
          console.log('Ticket created via webhook:', ticket.id, ticketCode);

          // Decrement available quantity
          if (ticketType.quantity_available > 0) {
            await supabase
              .from('ticket_types')
              .update({ quantity_available: ticketType.quantity_available - 1 })
              .eq('id', transaction.ticket_type_id);
          }

          // Send WhatsApp notification (non-blocking)
          try {
            await sendWhatsAppNotification(supabase, {
              ticket_id: ticketCode,
              event_name: eventData.name,
              ticket_type: ticketType.name,
              price: Number(transaction.amount),
              event_date: eventData.event_date,
              event_time: eventData.event_time,
              event_location: eventData.location,
              customer_name: transaction.customer_last_name,
              customer_firstname: transaction.customer_first_name,
              customer_phone: transaction.customer_phone,
              customer_email: transaction.customer_email,
              qr_code_data: qrCodeData,
            });
          } catch (whatsappError) {
            console.error('WhatsApp notification failed (non-blocking):', whatsappError);
          }

          // Send SMS confirmation via Africa's Talking (non-blocking)
          try {
            await sendSmsConfirmation({
              phone: transaction.customer_phone,
              ticketCode,
              eventName: eventData.name,
              eventDate: eventData.event_date,
              eventTime: eventData.event_time,
              eventLocation: eventData.location,
              ticketTypeName: ticketType.name,
              customerName: `${transaction.customer_first_name || ''} ${transaction.customer_last_name || ''}`.trim(),
              price: Number(transaction.amount),
            });
          } catch (smsError) {
            console.error('SMS notification failed (non-blocking):', smsError);
          }
        }
      }
    } else if (status === 'failed' || status === 'cancelled' || status === 'reversed') {
      await supabase
        .from('payment_transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id);
      console.log('Transaction marked as failed:', transaction.id);
    } else {
      console.log('Transaction status update:', status, 'for', transaction.id);
    }

    // Always respond 200 to Bictorys
    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Bictorys webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendWhatsAppNotification(supabase: any, ticket: any) {
  const INFOBIP_API = Deno.env.get('iNFOBIP_API');
  const INFOBIP_URLBASE = Deno.env.get('INFOBIP_URLBASE');

  if (!INFOBIP_API || !INFOBIP_URLBASE) {
    console.log('Infobip not configured, skipping WhatsApp');
    return;
  }

  let phone = ticket.customer_phone?.replace(/\D/g, '') || '';
  if (!phone) return;

  const customMessage = `🎫 *ALLO TICKET PRO - Confirmation de réservation*

✅ Votre paiement a été confirmé avec succès !

📌 *Détails de l'événement :*
• Événement : ${ticket.event_name || ''}
• Date : ${ticket.event_date || ''}
• Heure : ${ticket.event_time || ''}
• Lieu : ${ticket.event_location || ''}

🎟 *Votre billet :*
• Type : ${ticket.ticket_type || ''}
• Prix : ${ticket.price} FCFA
• Code : ${ticket.ticket_id || ''}
• Participant : ${ticket.customer_firstname || ''} ${ticket.customer_name || ''}

⚠️ Présentez le QR code à l'entrée de l'événement.
📅 Valable uniquement pour la date indiquée.

Merci pour votre confiance ! 🎉`;

  const infobipUrl = INFOBIP_URLBASE.startsWith('http') ? INFOBIP_URLBASE : `https://${INFOBIP_URLBASE}`;
  const textResponse = await fetch(`${infobipUrl}/whatsapp/1/message/text`, {
    method: 'POST',
    headers: {
      'Authorization': `App ${INFOBIP_API}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: '447860089236',
      to: phone,
      content: { text: customMessage },
    }),
  });

  const textResult = await textResponse.json();
  console.log('WhatsApp result:', JSON.stringify(textResult));
}

async function sendSmsConfirmation(data: {
  phone: string;
  ticketCode: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketTypeName: string;
  customerName: string;
  price: number;
}) {
  const username = Deno.env.get('AFRICA_TALKING_USERNAME');
  const apiKey = Deno.env.get('AFRICA_TALKING_API');

  if (!username || !apiKey) {
    console.log('Africa\'s Talking not configured, skipping SMS');
    return;
  }

  let phone = data.phone?.replace(/\D/g, '') || '';
  if (!phone) return;
  if (!phone.startsWith('+')) phone = `+${phone}`;

  const message = `ALLO TICKET PRO - Confirmation\n\nVotre réservation ${data.ticketCode} pour ${data.eventName} est confirmée !\n\nDate: ${data.eventDate}\nHeure: ${data.eventTime}\nLieu: ${data.eventLocation}\nBillet: ${data.ticketTypeName}\nPrix: ${data.price} FCFA\n\nPrésentez votre QR code à l'entrée. Merci !`;

  const response = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      'apiKey': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: new URLSearchParams({
      username,
      to: phone,
      message,
    }),
  });

  const result = await response.json();
  console.log('SMS result:', JSON.stringify(result));
}
