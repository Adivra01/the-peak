// Create a free ticket (100% discount) without requiring authentication.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Body {
  event_id: string;
  ticket_type_id: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  discount_code: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    const body: Body = await req.json();
    if (!body.event_id || !body.ticket_type_id || !body.discount_code || !body.customer_phone) {
      return new Response(JSON.stringify({ success: false, error: 'Missing fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify discount code is 100%, active, valid, and (optionally) for this event
    const { data: code, error: codeErr } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', body.discount_code.trim().toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (codeErr || !code) {
      return new Response(JSON.stringify({ success: false, error: 'Code invalide' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (code.percentage !== 100) {
      return new Response(JSON.stringify({ success: false, error: 'Code non gratuit' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (code.event_id && code.event_id !== body.event_id) {
      return new Response(JSON.stringify({ success: false, error: 'Code non valable pour cet événement' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (code.max_uses && code.current_uses >= code.max_uses) {
      return new Response(JSON.stringify({ success: false, error: 'Code épuisé' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (code.valid_until && new Date(code.valid_until) < new Date()) {
      return new Response(JSON.stringify({ success: false, error: 'Code expiré' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate ticket
    const ticketCode = `TKT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    // Try to identify the user if a JWT was passed (optional)
    let userId: string | null = null;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const { data } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
        if (data?.user) userId = data.user.id;
      } catch (_) { /* ignore */ }
    }

    const { data: ticket, error: insertErr } = await supabase.from('tickets').insert({
      user_id: userId || '00000000-0000-0000-0000-000000000000',
      event_id: body.event_id,
      ticket_type_id: body.ticket_type_id,
      ticket_code: ticketCode,
      price_paid: 0,
      customer_first_name: body.customer_first_name,
      customer_last_name: body.customer_last_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone,
      qr_code_data: ticketCode,
      status: 'active',
      discount_code: body.discount_code.trim().toUpperCase(),
      discount_percentage: 100,
    }).select('*, events(name, event_date, event_time, location, image_url), ticket_types(name)').single();

    if (insertErr) throw insertErr;

    // Increment usage
    await supabase.rpc('increment_discount_usage', { _code: body.discount_code.trim().toUpperCase() });

    // Send confirmation email
    if (body.customer_email) {
      const ev = (ticket as any).events;
      const tt = (ticket as any).ticket_types;
      try {
        await supabase.functions.invoke('send-ticket-email', {
          body: {
            to: body.customer_email,
            customerName: `${body.customer_first_name || ''} ${body.customer_last_name || ''}`.trim(),
            ticketCode,
            eventName: ev?.name || '',
            eventDate: ev?.event_date || '',
            eventTime: ev?.event_time || '',
            eventLocation: ev?.location || '',
            ticketType: tt?.name || '',
            pricePaid: 0,
            qrCodeData: ticketCode,
            eventImageUrl: ev?.image_url || undefined,
          },
        });
      } catch (e) {
        console.error('Email send failed:', e);
      }
    }

    return new Response(JSON.stringify({ success: true, ticket_code: ticketCode, ticket_id: ticket.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    const msg =
      err?.message ||
      err?.error_description ||
      err?.hint ||
      err?.details ||
      (typeof err === 'string' ? err : JSON.stringify(err)) ||
      'Unknown error';
    console.error('create-free-ticket error:', msg, JSON.stringify(err));
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
