import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BICTORYS_STATUS_BASE_URLS = Array.from(
  new Set(
    [
      Deno.env.get('BYCTORY_API_BASE_URL'),
      'https://api.bictorys.com',
      'https://api.test.bictorys.com',
    ]
      .filter((url): url is string => Boolean(url))
      .map((url) => url.replace(/\/$/, ''))
  )
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Backend configuration missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { reference } = await req.json();
    console.log('Verifying payment for reference:', reference);

    if (!reference) {
      throw new Error('Reference is required');
    }

    // Find the transaction
    const { data: transaction, error: findError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('reference', reference)
      .maybeSingle();

    if (findError || !transaction) {
      return new Response(
        JSON.stringify({ success: false, status: 'not_found', message: 'Transaction introuvable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If already completed, return the ticket (or recreate it if missing)
    if (transaction.status === 'completed') {
      let ticket = await findTicket(supabase, transaction);

      if (!ticket) {
        console.log('Transaction is completed but ticket is missing. Recreating ticket...');
        ticket = await createTicketFromTransaction(supabase, transaction);
      }

      if (!ticket) {
        return new Response(
          JSON.stringify({ success: false, status: 'ticket_generation_failed', message: 'Paiement confirmé mais génération du billet impossible.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, status: 'completed', ticket }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If failed
    if (transaction.status === 'failed') {
      return new Response(
        JSON.stringify({ success: false, status: 'failed', message: 'Le paiement a échoué ou a été annulé.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // === STILL PENDING: actively check Bictorys transaction status endpoint ===
    if (transaction.status === 'pending') {
      // Try multiple identifiers: real chargeId first, then merchantReference (some endpoints accept it)
      const candidateIds = [transaction.transaction_id, transaction.reference].filter(Boolean) as string[];
      console.log('Transaction pending, candidates to check:', candidateIds);

      let chargeStatus = '';
      for (const id of candidateIds) {
        const statusPayload = await fetchBictorysTransactionStatus(id);
        const s = extractBictorysStatus(statusPayload);
        if (s) {
          console.log('Bictorys status resolved from id', id, '=>', s);
          chargeStatus = s;
          if (s !== 'pending' && s !== '') break;
        }
      }

      if (chargeStatus === 'succeeded' || chargeStatus === 'authorized' || chargeStatus === 'success' || chargeStatus === 'completed' || chargeStatus === 'paid') {
        console.log('Payment confirmed by Bictorys, creating ticket...');
        await supabase.from('payment_transactions').update({ status: 'completed' }).eq('id', transaction.id);
        const ticket = await createTicketFromTransaction(supabase, transaction);
        if (!ticket) {
          return new Response(
            JSON.stringify({ success: false, status: 'ticket_generation_failed', message: 'Paiement confirmé mais génération du billet impossible.' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        return new Response(
          JSON.stringify({ success: true, status: 'completed', ticket }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (chargeStatus === 'failed' || chargeStatus === 'cancelled' || chargeStatus === 'canceled' || chargeStatus === 'reversed' || chargeStatus === 'declined') {
        await supabase.from('payment_transactions').update({ status: 'failed' }).eq('id', transaction.id);
        return new Response(
          JSON.stringify({ success: false, status: 'failed', message: 'Le paiement a échoué.' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Still pending
    return new Response(
      JSON.stringify({
        success: true,
        status: 'pending',
        message: 'Le paiement est en cours de traitement. Veuillez patienter.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchBictorysTransactionStatus(transactionId: string) {
  const PUBLIC_KEY = Deno.env.get('byctory_public_key') || '';
  const SECRET_KEY = Deno.env.get('BYCTORY_SECRET_KEY') || '';
  const encodedId = encodeURIComponent(transactionId);
  const endpoints = BICTORYS_STATUS_BASE_URLS.flatMap((baseUrl) => [
    `${baseUrl}/pay/v1/transactions/${encodedId}/status?by_charge_id=true`,
    `${baseUrl}/pay/v1/transactions/${encodedId}/status`,
    `${baseUrl}/pay/v1/charges/${encodedId}`,
  ]);

  for (const endpoint of endpoints) {
    for (const key of [PUBLIC_KEY, SECRET_KEY, '']) {
      try {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (key) headers['X-Api-Key'] = key;

        const response = await fetch(endpoint, { method: 'GET', headers });
        const rawBody = await response.text();
        let parsedBody: any = {};
        try { parsedBody = rawBody ? JSON.parse(rawBody) : {}; } catch { parsedBody = { rawBody }; }

        if (!response.ok) {
          console.log('Bictorys status check failed:', response.status, endpoint, rawBody?.slice(0, 200));
          continue;
        }
        console.log('Bictorys status payload:', endpoint, JSON.stringify(parsedBody).slice(0, 400));
        // If we got a non-pending real status, return immediately
        const s = extractBictorysStatus(parsedBody);
        if (s && s !== 'pending') return parsedBody;
        // Otherwise keep last-known to return after loop
        if (s === 'pending') return parsedBody;
      } catch (error) {
        console.error('Bictorys status request error:', endpoint, error);
      }
    }
  }
  return null;
}

function extractBictorysStatus(payload: any): string {
  if (!payload) return '';

  const candidates = [
    payload.status,
    payload.transactionStatus,
    payload.paymentStatus,
    payload?.transaction?.status,
    payload?.data?.status,
    payload?.data?.transactionStatus,
    payload?.result?.status,
  ];

  const firstStatus = candidates.find((value) => typeof value === 'string');
  return firstStatus ? firstStatus.toLowerCase() : '';
}

async function findTicket(supabase: any, transaction: any) {
  let ticketQuery = supabase
    .from('tickets')
    .select(`*, events:event_id (name, event_date, event_time, location), ticket_types:ticket_type_id (name, price)`)
    .eq('event_id', transaction.event_id)
    .eq('customer_phone', transaction.customer_phone)
    .order('purchased_at', { ascending: false })
    .limit(1);

  if (transaction.created_at) {
    ticketQuery = ticketQuery.gte('purchased_at', transaction.created_at);
  }

  const { data: ticket } = await ticketQuery.maybeSingle();

  return ticket ? formatTicketResponse(ticket) : null;
}

async function createTicketFromTransaction(supabase: any, transaction: any) {
  // Check if ticket already exists for this transaction
  const existingTicket = await findTicket(supabase, transaction);
  if (existingTicket) {
    console.log('Ticket already exists, returning it');
    return existingTicket;
  }

  // Fetch event and ticket type info
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
    console.error('Event or ticket type not found');
    return null;
  }

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
    .select(`*, events:event_id (name, event_date, event_time, location), ticket_types:ticket_type_id (name, price)`)
    .single();

  if (ticketError) {
    console.error('Failed to create ticket:', ticketError);
    return null;
  }

  console.log('Ticket created via verify-payment:', ticket.id, ticketCode);

  // Decrement available quantity
  if (ticketType.quantity_available > 0) {
    await supabase
      .from('ticket_types')
      .update({ quantity_available: ticketType.quantity_available - 1 })
      .eq('id', transaction.ticket_type_id);
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
      price: transaction.amount,
    });
  } catch (smsError) {
    console.error('SMS notification failed (non-blocking):', smsError);
  }

  return formatTicketResponse(ticket);
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

function formatTicketResponse(ticket: any) {
  return {
    ticket_id: ticket.ticket_code,
    event_id: ticket.event_id,
    event_name: ticket.events?.name,
    ticket_type: ticket.ticket_types?.name,
    price: Number(ticket.price_paid),
    event_date: ticket.events?.event_date,
    event_time: ticket.events?.event_time,
    event_location: ticket.events?.location,
    reservation_date: ticket.purchased_at?.split('T')[0],
    customer_name: ticket.customer_last_name,
    customer_firstname: ticket.customer_first_name,
    customer_phone: ticket.customer_phone,
    customer_email: ticket.customer_email,
    status: ticket.status,
    qr_code_data: ticket.qr_code_data,
  };
}
