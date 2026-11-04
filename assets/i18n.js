(() => {
  'use strict';
  const supported = ['fr','en','es','it'];
  const labels = {fr:'Français',en:'English',es:'Español',it:'Italiano'};
  const catalog = window.PEAK_I18N_CATALOG || {};
  const originalText = new WeakMap();
  const originalAttrs = new WeakMap();
  const originalWhatsApp = new WeakMap();
  const root = document.documentElement;
  const scriptUrl = new URL(document.currentScript.src);
  const localeUrl = new URL('../api/locale.php', scriptUrl);
  const urlLanguage = new URLSearchParams(location.search).get('lang');
  const pathLanguage = location.pathname.match(/^\/(en|es|it)(?:\/|$)/)?.[1] || null;
  const storedLanguage = (() => { try { return localStorage.getItem('thepeeak-language'); } catch { return null; } })();
  const manualLanguage = supported.includes(urlLanguage) ? urlLanguage : pathLanguage || (supported.includes(storedLanguage) ? storedLanguage : null);
  const browserLanguage = (navigator.languages?.[0] || navigator.language || 'fr').slice(0,2).toLowerCase();
  let language = manualLanguage || (supported.includes(browserLanguage) ? browserLanguage : 'en');
  let country = null;
  let scheduled = false;
  const frenchKeys = new Set(window.PEAK_I18N_FRENCH_KEYS || []);
  const reverseEntries = pathLanguage ? Object.entries(catalog[pathLanguage] || {}) : [];
  // Many dynamic strings are already in English, Spanish or Italian. Prefer the
  // original French page copy when two different source strings share a translation.
  reverseEntries.sort(([a],[b]) => Number(frenchKeys.has(a)) - Number(frenchKeys.has(b)));
  const reverse = new Map(reverseEntries.map(([source,translated]) => [translated,source]));
  const sourceText = value => {
    const trimmed = value.trim();
    const french = reverse.get(trimmed);
    return french ? value.replace(trimmed,french) : value;
  };

  function languageForCountry(code) {
    const fr = new Set(['FR','ML','SN','CI','NE','BF','BJ','TG','GN','CD','CG','GA','CM','TD','CF','DJ','HT','LU','MC']);
    const es = new Set(['ES','MX','AR','CL','CO','PE','VE','EC','BO','PY','UY','CR','PA','GT','HN','SV','NI','DO','CU']);
    const it = new Set(['IT','SM','VA']);
    return fr.has(code) ? 'fr' : es.has(code) ? 'es' : it.has(code) ? 'it' : 'en';
  }
  const translation = original => catalog[language]?.[original] || original;
  function translateWhatsApp(message) {
    if (language === 'fr') return message;
    const intro = message.match(/^Bonjour THEPEEAK, je souhaite échanger sur votre service (.+?)\. Mon projet\s*:/i);
    const service = intro?.[1];
    const serviceName = service ? translation(service) : '';
    if (intro) {
      const lines = {
        en:`Hello THEPEEAK, I would like to discuss your ${serviceName} service. My project:`,
        es:`Hola THEPEEAK, me gustaría hablar sobre su servicio de ${serviceName}. Mi proyecto:`,
        it:`Buongiorno THEPEEAK, vorrei parlare del vostro servizio ${serviceName}. Il mio progetto:`
      };
      return message.replace(intro[0],lines[language]);
    }
    if (message.startsWith('Bonjour THEPEEAK, je souhaite parler de mon projet.')) {
      return ({en:'Hello THEPEEAK, I would like to talk about my project.',es:'Hola THEPEEAK, me gustaría hablar sobre mi proyecto.',it:'Buongiorno THEPEEAK, vorrei parlare del mio progetto.'})[language];
    }
    const product = message.match(/^Bonjour THEPEEAK, je suis intéressé\(e\) par le site « (.+?) »\. Pouvez-vous m’en dire plus sur le prix et les modalités \?/);
    if (product) return ({en:`Hello THEPEEAK, I am interested in the website “${product[1]}”. Could you tell me more about the price and terms?`,es:`Hola THEPEEAK, me interesa el sitio «${product[1]}». ¿Podrían contarme más sobre el precio y las condiciones?`,it:`Buongiorno THEPEEAK, sono interessato al sito «${product[1]}». Potete dirmi di più su prezzo e condizioni?`})[language];
    return translation(message);
  }
  function skip(node) {
    const parent = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return !parent || !!parent.closest('script,style,svg,noscript,code,pre,[data-no-translate],[contenteditable="true"]');
  }
  function translateText(node) {
    if (skip(node)) return;
    let state = originalText.get(node);
    if (!state || (node.nodeValue !== state.rendered && node.nodeValue !== state.original)) {
      state = {original:sourceText(node.nodeValue),rendered:node.nodeValue};
      originalText.set(node,state);
    }
    const original = state.original;
    const trimmed = original.trim();
    if (!trimmed) return;
    const translated = translation(trimmed);
    const leading = original.match(/^\s*/)?.[0] || '';
    const trailing = original.match(/\s*$/)?.[0] || '';
    const next = leading + translated + trailing;
    if (node.nodeValue !== next) node.nodeValue = next;
    state.rendered = next;
  }
  function translateElement(element) {
    if (skip(element)) return;
    if (element.localName === 'a' && /(?:https?:\/\/)?(?:www\.)?wa\.me\//i.test(element.getAttribute('href') || '')) {
      if (!originalWhatsApp.has(element)) originalWhatsApp.set(element,element.getAttribute('href'));
      const original = originalWhatsApp.get(element);
      try {
        const url = new URL(original,location.href);
        const message = url.searchParams.get('text');
        if (message) url.searchParams.set('text',translateWhatsApp(message));
        element.setAttribute('href',language === 'fr' ? original : url.href);
      } catch {}
    }
    let originals = originalAttrs.get(element);
    if (!originals) { originals = {}; originalAttrs.set(element, originals); }
    const attrs = ['placeholder','aria-label','title','alt'];
    if (element.localName === 'meta' && ['description','keywords'].includes(element.getAttribute('name'))) attrs.push('content');
    if (element.localName === 'meta' && ['og:title','og:description','twitter:title','twitter:description'].includes(element.getAttribute('property'))) attrs.push('content');
    for (const attr of attrs) {
      if (!element.hasAttribute(attr)) continue;
      if (!(attr in originals)) originals[attr] = sourceText(element.getAttribute(attr));
      const original = originals[attr];
      const next = translation(original.trim());
      if (element.getAttribute(attr) !== next) element.setAttribute(attr, next);
    }
  }
  function scan(node = root) {
    if (node.nodeType === Node.TEXT_NODE) { translateText(node); return; }
    if (node.nodeType !== Node.ELEMENT_NODE || skip(node)) return;
    translateElement(node);
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (walker.currentNode.nodeType === Node.TEXT_NODE) translateText(walker.currentNode);
      else translateElement(walker.currentNode);
    }
  }
  function apply() {
    root.lang = language;
    root.dataset.language = language;
    const locale = document.querySelector('meta[property="og:locale"]');
    if (locale) locale.content = ({fr:'fr_FR',en:'en_US',es:'es_ES',it:'it_IT'})[language];
    scan();
    document.querySelectorAll('.peak-language-select').forEach(select => { select.value = language; select.setAttribute('aria-label', ({fr:'Langue du site',en:'Site language',es:'Idioma del sitio',it:'Lingua del sito'})[language]); });
    window.dispatchEvent(new CustomEvent('peak:languagechange', {detail:{language,country}}));
  }
  function setLanguage(next, manual = true) {
    if (!supported.includes(next)) return;
    language = next;
    if (manual) { try { localStorage.setItem('thepeeak-language', next); } catch {} }
    if (!document.querySelector('.admin-shell,.auth-shell,.client')) {
      const cleanPath = location.pathname.replace(/^\/(?:en|es|it)(?=\/)/,'') || '/index.html';
      const target = next === 'fr' ? cleanPath : `/${next}${cleanPath}`;
      if (target !== location.pathname) {
        // Keep loaded media at their original absolute URLs when the visible path changes.
        document.querySelectorAll('[src],[poster],link[rel="stylesheet"],link[rel="icon"]').forEach(node => {
          for (const attr of ['src','poster',...(node.localName === 'link' ? ['href'] : [])]) {
            const raw = node.getAttribute(attr);
            if (!raw || /^(?:https?:|data:|\/\/)/.test(raw)) continue;
            node.setAttribute(attr, new URL(raw, document.baseURI).href);
          }
        });
        history.replaceState(history.state, '', target + location.search + location.hash);
      }
    }
    apply();
  }
  function addSwitcher() {
    const host = document.querySelector('.site-nav, .admin-user, .auth-top, .client-head, .head .wrap');
    if (!host || host.querySelector('.peak-language-switcher')) return;
    const wrapper = document.createElement('label');
    wrapper.className = 'peak-language-switcher';
    wrapper.dataset.noTranslate = '';
    wrapper.innerHTML = `<span aria-hidden="true">🌐</span><select class="peak-language-select" aria-label="Langue du site">${supported.map(code => `<option value="${code}">${labels[code]}</option>`).join('')}</select>`;
    if (host.matches('.site-nav')) host.append(wrapper);
    else if (host.matches('.auth-top')) host.insertBefore(wrapper, host.lastElementChild);
    else host.prepend(wrapper);
    wrapper.querySelector('select').addEventListener('change', event => setLanguage(event.target.value));
  }
  addSwitcher();
  apply();
  new MutationObserver(mutations => {
    if (scheduled) return;
    if (!mutations.some(m => m.type === 'childList' || m.type === 'characterData' || m.type === 'attributes')) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; addSwitcher(); scan(); });
  }).observe(root, {subtree:true, childList:true, characterData:true, attributes:true, attributeFilter:['placeholder','aria-label','title','alt','content']});

  if (!manualLanguage && location.protocol !== 'file:') {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);
    fetch(localeUrl, {signal:controller.signal, credentials:'same-origin'})
      .then(response => response.ok && response.headers.get('content-type')?.includes('application/json') ? response.json() : null)
      .then(data => {
        if (data?.country && /^[A-Z]{2}$/.test(data.country)) {
          country = data.country;
          window.peakLocale.country = country;
          setLanguage(languageForCountry(country), false);
        }
      }).catch(() => {}).finally(() => clearTimeout(timeout));
  }
  window.peakLocale = {get language(){return language},get country(){return country},set country(value){country=value},setLanguage,translate:translation};
})();
