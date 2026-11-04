(() => {
  'use strict';
  if (!/^(www\.)?thepeeak\.com$/i.test(location.hostname)) return;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl) return;
  const config = window.THE_PEAK_SUPABASE;
  if (!config?.url || !config?.publishableKey) return;
  const supported = new Set(['page_view','contact_submit','whatsapp_click','email_click','service_click','product_view','portfolio_view']);
  const sessionKey = 'thepeeak-analytics-session';
  let session;
  try {
    session = sessionStorage.getItem(sessionKey);
    if (!session) { session = crypto.randomUUID(); sessionStorage.setItem(sessionKey, session); }
  } catch { session = crypto.randomUUID(); }
  const path = location.pathname.replace(/^\/(?:en|es|it)(?=\/)/,'') || '/';
  const device = matchMedia('(max-width: 650px)').matches ? 'mobile' : matchMedia('(max-width: 1024px)').matches ? 'tablet' : 'desktop';
  const source = (() => {
    const params = new URLSearchParams(location.search);
    const utm = params.get('utm_source');
    if (utm) return utm.slice(0,80).toLowerCase().replace(/[^a-z0-9._-]/g,'') || 'other';
    if (!document.referrer) return 'direct';
    try {
      const host = new URL(document.referrer).hostname.toLowerCase();
      if (host === location.hostname) return 'direct';
      if (host.includes('google.')) return 'google';
      if (host.includes('bing.')) return 'bing';
      if (host.includes('facebook.') || host.includes('instagram.') || host.includes('tiktok.') || host.includes('linkedin.')) return 'social';
      if (host.includes('whatsapp.')) return 'whatsapp';
      return host.slice(0,80);
    } catch { return 'other'; }
  })();
  async function track(eventType, pathOverride) {
    if (!supported.has(eventType)) return;
    const country = window.peakLocale?.country;
    const language = window.peakLocale?.language || document.documentElement.lang || 'fr';
    const payload = {
      event_type:eventType,
      page_path:String(pathOverride || path).slice(0,240),
      source,
      country_code:/^[A-Z]{2}$/.test(country || '') ? country : 'XX',
      language_code:['fr','en','es','it'].includes(language) ? language : 'fr',
      device_type:device,
      session_id:session
    };
    try {
      await fetch(`${config.url}/rest/v1/site_events`, {
        method:'POST',
        headers:{'Content-Type':'application/json','apikey':config.publishableKey,'Prefer':'return=minimal'},
        body:JSON.stringify(payload),
        keepalive:true
      });
    } catch { /* Analytics must never interrupt site navigation. */ }
  }
  window.peakAnalytics = { track };
  // The country lookup usually resolves before this first page view; it is bounded to keep the site fast.
  setTimeout(() => track('page_view'), 900);
  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    if (/wa\.me\//i.test(href)) track('whatsapp_click');
    else if (/^mailto:/i.test(href)) track('email_click');
    else if (/services\/[^#?]+\.html/i.test(href)) track('service_click');
  }, {capture:true});
})();
