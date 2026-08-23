// Send ticket confirmation email via Resend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Payload {
  to: string;
  customerName: string;
  ticketCode: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketType: string;
  pricePaid: number;
  qrCodeData?: string;
  eventImageUrl?: string;
}

const BRAND_LOGO = 'https://fjmprtqglmmlmgdddkoq.supabase.co/storage/v1/object/public/event-media/brand/alloticketpro-logo.png';
const BRAND_NAME = 'Allô Ticket Pro';
const BRAND_SITE = 'https://alloticketpro.online';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');

    const body: Payload = await req.json();
    if (!body.to || !body.ticketCode) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isFree = !body.pricePaid || body.pricePaid === 0;
    const qrUrl = body.qrCodeData
      ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(body.qrCodeData)}`
      : null;

    const eventImg = body.eventImageUrl
      ? `<tr><td style="padding:0;"><img src="${body.eventImageUrl}" alt="${body.eventName}" width="600" style="display:block;width:100%;max-width:600px;height:auto;object-fit:cover;max-height:240px;" /></td></tr>`
      : '';

    const html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
        <tr><td style="background:#1a1a2e;padding:24px;text-align:center;">
          <img src="${BRAND_LOGO}" alt="${BRAND_NAME}" height="48" style="display:inline-block;height:48px;width:auto;margin-bottom:8px;" />
          <p style="margin:8px 0 0;color:#d4af37;font-size:13px;letter-spacing:2px;text-transform:uppercase;">${BRAND_NAME}</p>
        </td></tr>
        <tr><td style="background:linear-gradient(135deg,#d4af37,#b8941f);padding:24px;text-align:center;color:#fff;">
          <h1 style="margin:0;font-size:24px;">🎉 Billet confirmé</h1>
          <p style="margin:8px 0 0;opacity:.95;font-size:14px;">${isFree ? 'Votre billet gratuit a été généré' : 'Merci pour votre réservation'}</p>
        </td></tr>
        ${eventImg}
        <tr><td style="padding:28px;">
          <p style="font-size:16px;color:#333;margin:0 0 16px;">Bonjour <strong>${body.customerName || 'Client'}</strong>,</p>
          <p style="color:#555;line-height:1.6;margin:0 0 24px;">Voici les détails de votre billet pour <strong>${body.eventName}</strong>. Présentez le QR code ci-dessous à l'entrée de l'événement.</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7ec;border:2px dashed #d4af37;border-radius:10px;margin-bottom:24px;">
            <tr><td style="padding:20px;">
              <p style="margin:0 0 6px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Code du billet</p>
              <p style="margin:0 0 18px;font-size:24px;font-weight:bold;color:#1a1a2e;letter-spacing:2px;">${body.ticketCode}</p>
              <p style="margin:0 0 6px;color:#555;font-size:14px;"><strong>📅 Date :</strong> ${body.eventDate} à ${body.eventTime}</p>
              <p style="margin:0 0 6px;color:#555;font-size:14px;"><strong>📍 Lieu :</strong> ${body.eventLocation}</p>
              <p style="margin:0 0 6px;color:#555;font-size:14px;"><strong>🎟️ Type :</strong> ${body.ticketType}</p>
              <p style="margin:0;color:#555;font-size:14px;"><strong>💰 Montant :</strong> ${isFree ? 'Gratuit (code promo)' : body.pricePaid.toLocaleString() + ' FCFA'}</p>
            </td></tr>
          </table>

          ${qrUrl ? `
          <div style="text-align:center;margin:24px 0;">
            <p style="color:#555;margin:0 0 12px;font-size:14px;">Présentez ce QR code à l'entrée :</p>
            <img src="${qrUrl}" alt="QR Code" width="220" height="220" style="border:1px solid #eee;border-radius:8px;display:inline-block;" />
            <p style="color:#999;margin:10px 0 0;font-size:11px;">Code : ${body.ticketCode}</p>
          </div>` : ''}

          <div style="background:#fff8e1;border-left:4px solid #d4af37;padding:12px 16px;border-radius:6px;margin:24px 0;">
            <p style="margin:0;color:#5d4e00;font-size:13px;line-height:1.5;">
              ⚠️ <strong>Important :</strong> Conservez précieusement cet email. Ce billet est strictement personnel et nécessaire pour accéder à l'événement.
            </p>
          </div>

          <p style="color:#888;font-size:12px;line-height:1.5;margin:24px 0 0;text-align:center;">
            Une question ? Contactez-nous via <a href="${BRAND_SITE}" style="color:#d4af37;">${BRAND_SITE}</a>
          </p>
        </td></tr>
        <tr><td style="background:#1a1a2e;color:#999;padding:18px;text-align:center;font-size:12px;">
          © ${new Date().getFullYear()} ${BRAND_NAME} — Sénégal
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Allô Ticket Pro <billets@contact.alloticketpro.online>',
        to: [body.to],
        subject: `🎫 Votre billet pour ${body.eventName}`,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Resend error:', data);
      return new Response(JSON.stringify({ success: false, error: data }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('send-ticket-email error:', msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
