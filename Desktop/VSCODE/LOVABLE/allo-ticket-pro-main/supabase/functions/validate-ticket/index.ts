import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TICKET_SELECT = `*, events:event_id (name, event_date, event_time, location), ticket_types:ticket_type_id (name, price)`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Configuration missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { qr_data, action } = await req.json();

    if (!qr_data) {
      throw new Error('QR data is required');
    }

    const ticketCode = extractTicketCode(qr_data);

    if (!ticketCode) {
      return new Response(
        JSON.stringify({ valid: false, message: 'QR code invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('validate-ticket request:', JSON.stringify({ ticketCode, action }));

    // Find ticket
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(TICKET_SELECT)
      .eq('ticket_code', ticketCode)
      .maybeSingle();

    if (error || !ticket) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Billet introuvable' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentStatus = String(ticket.status ?? '').toLowerCase();

    // Check status
    if (currentStatus === 'used') {
      return new Response(
        JSON.stringify({
          valid: false,
          message: 'Billet déjà utilisé',
          used_at: ticket.used_at,
          ticket_info: formatTicketInfo(ticket),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (currentStatus === 'cancelled') {
      return new Response(
        JSON.stringify({ valid: false, message: 'Billet annulé', ticket_info: formatTicketInfo(ticket) }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CRITICAL: Date validation
    const today = new Date().toISOString().split('T')[0];
    const eventDate = ticket.events?.event_date;

    if (eventDate && eventDate !== today) {
      const eventDateFormatted = new Date(eventDate).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      return new Response(
        JSON.stringify({
          valid: false,
          message: `Billet non valide pour cette date. Valable uniquement le ${eventDateFormatted}`,
          ticket_info: formatTicketInfo(ticket),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If action is 'mark_used', mark the ticket as used atomically
    if (action === 'mark_used') {
      const nowIso = new Date().toISOString();

      const { data: updatedTicket, error: updateError } = await supabase
        .from('tickets')
        .update({ status: 'used', used_at: nowIso })
        .eq('id', ticket.id)
        .in('status', ['valid', 'active'])
        .select(TICKET_SELECT)
        .maybeSingle();

      if (updateError) {
        console.error('Failed to mark ticket as used:', updateError);
        return new Response(
          JSON.stringify({ valid: false, message: 'Erreur serveur pendant la validation du billet' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!updatedTicket) {
        // Could be already consumed by another scanner/device: re-read latest state
        const { data: latestTicket } = await supabase
          .from('tickets')
          .select(TICKET_SELECT)
          .eq('id', ticket.id)
          .maybeSingle();

        if (latestTicket && String(latestTicket.status ?? '').toLowerCase() === 'used') {
          return new Response(
            JSON.stringify({
              valid: false,
              message: 'Billet déjà utilisé',
              used_at: latestTicket.used_at,
              ticket_info: formatTicketInfo(latestTicket),
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            valid: false,
            message: 'Impossible de valider ce billet pour le moment',
            ticket_info: latestTicket ? formatTicketInfo(latestTicket) : formatTicketInfo(ticket),
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Ticket marked as used:', updatedTicket.ticket_code);
      return new Response(
        JSON.stringify({
          valid: true,
          message: 'Accès autorisé ✅ Billet validé',
          used_at: updatedTicket.used_at,
          ticket_info: formatTicketInfo(updatedTicket),
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Just validate without marking
    return new Response(
      JSON.stringify({
        valid: true,
        message: 'Billet valide ✅',
        ticket_info: formatTicketInfo(ticket),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Validation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ valid: false, message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractTicketCode(qrData: unknown): string | null {
  if (typeof qrData === 'string') {
    const raw = qrData.trim();

    const directMatch = raw.match(/\bTKT-[A-Z0-9]+\b/i);
    if (directMatch) return directMatch[0].toUpperCase();

    if (raw.includes('/ticket/')) {
      const urlMatch = raw.match(/\/ticket\/(TKT-[A-Z0-9]+)/i);
      if (urlMatch) return urlMatch[1].toUpperCase();
    }

    try {
      return extractTicketCode(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  if (qrData && typeof qrData === 'object') {
    const obj = qrData as Record<string, unknown>;
    const candidate = obj.ticket_id ?? obj.ticket_code ?? obj.code;

    if (typeof candidate === 'string') {
      const match = candidate.match(/\bTKT-[A-Z0-9]+\b/i);
      return match ? match[0].toUpperCase() : null;
    }
  }

  return null;
}

function formatTicketInfo(ticket: any) {
  return {
    ticket_code: ticket.ticket_code,
    event_name: ticket.events?.name,
    event_date: ticket.events?.event_date,
    event_time: ticket.events?.event_time,
    event_location: ticket.events?.location,
    ticket_type: ticket.ticket_types?.name,
    price: Number(ticket.price_paid),
    customer_name: `${ticket.customer_first_name || ''} ${ticket.customer_last_name || ''}`.trim(),
    customer_phone: ticket.customer_phone,
    status: ticket.status,
  };
}
