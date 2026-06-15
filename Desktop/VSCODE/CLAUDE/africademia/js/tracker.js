const TRACKER = (() => {
  function _sessionId() {
    let sid = sessionStorage.getItem('af_sid');
    if (!sid) { sid = crypto.randomUUID(); sessionStorage.setItem('af_sid', sid); }
    return sid;
  }

  function _page() {
    return location.pathname.split('/').pop() || 'index.html';
  }

  async function trackPage() {
    if (!window.DB?.client) return;
    const sid  = _sessionId();
    const page = _page();
    const ref  = document.referrer || null;
    const ua   = navigator.userAgent;
    const uid  = window.AUTH?.user?.id || null;
    try {
      await window.DB.client.from('analytics_visites').insert([{
        session_id: sid, page, referrer: ref, user_agent: ua, user_id: uid
      }]);
    } catch(e) {}
  }

  async function trackEvent(type, data = {}) {
    if (!window.DB?.client) return;
    const sid  = _sessionId();
    const page = _page();
    const uid  = window.AUTH?.user?.id || null;
    try {
      await window.DB.client.from('analytics_events').insert([{
        session_id: sid, type, data, page, user_id: uid
      }]);
    } catch(e) {}
  }

  function autoTrack() {
    if (!window.DB?.ready) {
      window.addEventListener('load', () => { if (window.DB?.ready) { trackPage(); _bindClicks(); } });
    } else {
      trackPage();
      _bindClicks();
    }
  }

  function _bindClicks() {
    document.querySelectorAll('[data-track]').forEach(el => {
      el.addEventListener('click', () => {
        trackEvent(el.dataset.track, { label: el.dataset.trackLabel || el.textContent.trim().slice(0,60) });
      });
    });
    document.querySelectorAll('a[href*="wa.me"]').forEach(el => {
      el.addEventListener('click', () => trackEvent('whatsapp_click', { page: _page() }));
    });
    document.querySelectorAll('a[href*="formation-detail"]').forEach(el => {
      el.addEventListener('click', () => {
        const slug = new URLSearchParams(el.href.split('?')[1]).get('slug');
        trackEvent('formation_view', { slug });
      });
    });
  }

  return { trackPage, trackEvent, autoTrack };
})();

window.TRACKER = TRACKER;
