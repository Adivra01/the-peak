import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const BICTORYS_CHARGES_URL = `${(Deno.env.get('BYCTORY_API_BASE_URL') || 'https://api.bictorys.com').replace(/\/$/, '')}/pay/v1/charges`;

interface PaymentRequest {
  amount: number;
  customer_phone: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  event_id: string;
  ticket_type_id: string;
  event_name: string;
  ticket_type_name: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BICTORYS_PUBLIC_KEY = Deno.env.get('byctory_public_key');
    if (!BICTORYS_PUBLIC_KEY) {
      throw new Error('Bictorys public key is not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Backend configuration missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body: PaymentRequest = await req.json();
    console.log('Bictorys payment request:', JSON.stringify(body));

    if (!body.amount || !body.customer_phone || !body.event_id || !body.ticket_type_id) {
      throw new Error('Missing required fields');
    }

    // Generate unique reference
    const reference = `ATP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const merchantReference = crypto.randomUUID();

    // Get the origin for redirect URLs
    const origin = req.headers.get('origin') || 'https://radiologie-senegal-connect.lovable.app';

    // Checkout mode: NO payment_type parameter
    // Bictorys will show its own payment page where the user picks the method
    const bictorysPayload = {
      merchantReference: merchantReference,
      successRedirectUrl: `${origin}/payment/success?ref=${reference}`,
      errorRedirectUrl: `${origin}/payment/cancel?ref=${reference}`,
      amount: body.amount,
      currency: "XOF",
      country: "SN",
      paymentReference: reference,
      orderDetails: [
        {
          name: `${body.ticket_type_name} - ${body.event_name}`,
          price: body.amount,
          quantity: 1,
          taxRate: 0,
        },
      ],
      customerObject: {
        name: `${body.customer_first_name} ${body.customer_last_name}`,
        phone: body.customer_phone,
        email: body.customer_email || "",
        city: "Dakar",
        postal_code: "",
        country: "SN",
        locale: "fr-FR",
      },
      allowUpdateCustomer: false,
    };

    console.log('Calling Bictorys Checkout API (no payment_type)');

    // Checkout mode: call without payment_type query param
    const bictorysResponse = await fetch(BICTORYS_CHARGES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': BICTORYS_PUBLIC_KEY,
      },
      body: JSON.stringify(bictorysPayload),
    });

    const bictorysData = await bictorysResponse.json();
    console.log('Bictorys API response:', JSON.stringify(bictorysData));

    if (!bictorysResponse.ok) {
      throw new Error(`Bictorys payment failed: ${bictorysData.errorReason || bictorysData.message || JSON.stringify(bictorysData)}`);
    }

    // Get user ID from auth header if available
    const authHeader = req.headers.get('authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Extract checkout link from response
    const paymentUrl = bictorysData.link || bictorysData.paymentUrl || bictorysData.payment_url || null;
    // IMPORTANT: Bictorys Checkout returns chargeId — store it so we can poll status reliably.
    // Never fall back to merchantReference here (it's not a valid Bictorys ID for status lookup).
    const resolvedTransactionId =
      bictorysData.chargeId?.toString() ||
      bictorysData.transactionId?.toString() ||
      bictorysData.id?.toString() ||
      bictorysData?.data?.chargeId?.toString() ||
      bictorysData?.data?.id?.toString() ||
      null;
    console.log('Resolved Bictorys chargeId:', resolvedTransactionId, 'merchantRef:', merchantReference);

    // Store transaction in database with status 'pending'
    const { data: transaction, error: insertError } = await supabase
      .from('payment_transactions')
      .insert({
        reference: reference,
        transaction_id: resolvedTransactionId,
        amount: body.amount,
        status: 'pending',
        method: 'checkout',
        customer_phone: body.customer_phone,
        customer_email: body.customer_email,
        customer_first_name: body.customer_first_name,
        customer_last_name: body.customer_last_name,
        event_id: body.event_id,
        ticket_type_id: body.ticket_type_id,
        payment_url: paymentUrl,
        user_id: userId,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(`Failed to store transaction: ${insertError.message}`);
    }

    console.log('Transaction stored:', transaction.id, 'external_id:', resolvedTransactionId);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          reference: reference,
          payment_url: paymentUrl,
          transaction_id: resolvedTransactionId,
          amount: body.amount,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Error creating Bictorys payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
