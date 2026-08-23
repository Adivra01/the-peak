import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find events that ended more than 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: expiredEvents, error: eventsError } = await supabase
      .from('events')
      .select('id, name')
      .lt('event_date', cutoffDate);

    if (eventsError) throw eventsError;
    if (!expiredEvents || expiredEvents.length === 0) {
      return new Response(JSON.stringify({ message: 'No events to purge', purged: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const eventIds = expiredEvents.map(e => e.id);
    let totalPurged = 0;

    // Anonymize tickets
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('tickets')
      .update({
        customer_first_name: 'ANONYMISÉ',
        customer_last_name: 'ANONYMISÉ',
        customer_phone: null,
        customer_email: null,
      })
      .in('event_id', eventIds)
      .not('customer_first_name', 'eq', 'ANONYMISÉ')
      .select('id');

    if (ticketsError) throw ticketsError;
    totalPurged += ticketsData?.length ?? 0;

    // Anonymize payment transactions
    const { data: txData, error: txError } = await supabase
      .from('payment_transactions')
      .update({
        customer_first_name: 'ANONYMISÉ',
        customer_last_name: 'ANONYMISÉ',
        customer_phone: '0000000000',
        customer_email: null,
      })
      .in('event_id', eventIds)
      .not('customer_first_name', 'eq', 'ANONYMISÉ')
      .select('id');

    if (txError) throw txError;
    totalPurged += txData?.length ?? 0;

    console.log(`GDPR purge: ${totalPurged} records anonymized for ${expiredEvents.length} events`);

    return new Response(JSON.stringify({
      message: 'GDPR purge completed',
      events_processed: expiredEvents.length,
      records_anonymized: totalPurged,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GDPR purge error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
