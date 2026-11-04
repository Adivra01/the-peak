(() => {
  const $ = id => document.getElementById(id);
  const number = value => new Intl.NumberFormat(document.documentElement.lang || 'fr').format(Number(value) || 0);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const words = {
    fr:{empty:'Aucune donnée pour cette période.',noTrend:'Aucune donnée sur la période',first:'Premières données disponibles',previous:'par rapport à la période précédente',updated:'Données mises à jour à',loading:'Actualisation des statistiques…',unavailable:'Statistiques indisponibles',chartEmpty:'Les visites apparaîtront ici dès que le site recevra du trafic.',chartDays:'jours de trafic',unknown:'Pays inconnu',home:'Accueil',visitors:'Visiteurs',views:'Pages vues',services:'Pages services',whatsapp:'Clics WhatsApp',sent:'Demandes envoyées',direct:'Accès direct',social:'Réseaux sociaux',other:'Autre',mobile:'Mobile',tablet:'Tablette',desktop:'Ordinateur'},
    en:{empty:'No data for this period.',noTrend:'No data for this period',first:'First data available',previous:'compared with the previous period',updated:'Updated at',loading:'Refreshing analytics…',unavailable:'Analytics unavailable',chartEmpty:'Visits will appear here as soon as the site receives traffic.',chartDays:'days of traffic',unknown:'Unknown country',home:'Home',visitors:'Visitors',views:'Page views',services:'Service pages',whatsapp:'WhatsApp clicks',sent:'Inquiries sent',direct:'Direct',social:'Social media',other:'Other',mobile:'Mobile',tablet:'Tablet',desktop:'Desktop'},
    es:{empty:'No hay datos para este período.',noTrend:'Sin datos en este período',first:'Primeros datos disponibles',previous:'frente al período anterior',updated:'Actualizado a las',loading:'Actualizando estadísticas…',unavailable:'Estadísticas no disponibles',chartEmpty:'Las visitas aparecerán aquí cuando el sitio reciba tráfico.',chartDays:'días de tráfico',unknown:'País desconocido',home:'Inicio',visitors:'Visitantes',views:'Páginas vistas',services:'Páginas de servicios',whatsapp:'Clics en WhatsApp',sent:'Solicitudes enviadas',direct:'Acceso directo',social:'Redes sociales',other:'Otro',mobile:'Móvil',tablet:'Tableta',desktop:'Ordenador'},
    it:{empty:'Nessun dato per questo periodo.',noTrend:'Nessun dato nel periodo',first:'Primi dati disponibili',previous:'rispetto al periodo precedente',updated:'Aggiornato alle',loading:'Aggiornamento statistiche…',unavailable:'Statistiche non disponibili',chartEmpty:'Le visite appariranno qui quando il sito riceverà traffico.',chartDays:'giorni di traffico',unknown:'Paese sconosciuto',home:'Home',visitors:'Visitatori',views:'Pagine viste',services:'Pagine servizi',whatsapp:'Clic WhatsApp',sent:'Richieste inviate',direct:'Accesso diretto',social:'Social media',other:'Altro',mobile:'Mobile',tablet:'Tablet',desktop:'Computer'}
  };
  const w = key => (words[document.documentElement.lang] || words.fr)[key] || key;
  const languageNames = { fr:'Français', en:'English', es:'Español', it:'Italiano' };
  let client, busy = false, lastData = null;

  function trend(current, previous) {
    if (!previous) return current ? w('first') : w('noTrend');
    const change = Math.round((current - previous) * 100 / previous);
    return `${change >= 0 ? '↗ +' : '↘ '}${change} % ${w('previous')}`;
  }

  function rows(id, data, total, mapLabel = x => x, limit = 8) {
    const target = $(id);
    const items = (data || []).slice(0, limit);
    if (!items.length) { target.innerHTML = `<p class="analytics-empty">${w('empty')}</p>`; return; }
    target.innerHTML = items.map((item, index) => {
      const count = Number(item.count) || 0;
      const pct = total ? Math.max(2, Math.round(count / total * 100)) : 0;
      return `<div class="analytics-row"><div><span class="analytics-row-label"><i>${String(index + 1).padStart(2, '0')}</i>${escape(mapLabel(item.label))}</span><strong>${number(count)}</strong></div><div class="analytics-track"><span style="width:${pct}%"></span></div></div>`;
    }).join('');
  }

  function chart(daily) {
    const target = $('analytics-chart');
    if (!daily?.length || !daily.some(item => Number(item.views))) {
      target.innerHTML = `<div class="analytics-chart-empty">${w('chartEmpty')}</div>`;
      return;
    }
    const width = 800, height = 250, left = 12, right = 16, top = 24, bottom = 26;
    const max = Math.max(1, ...daily.map(item => Number(item.views) || 0));
    const x = index => left + (width-left-right) * (daily.length === 1 ? 0.5 : index / (daily.length - 1));
    const y = value => height-bottom-(height-top-bottom) * Number(value || 0) / max;
    const line = key => daily.map((item,index) => `${index?'L':'M'}${x(index).toFixed(1)},${y(item[key]).toFixed(1)}`).join(' ');
    const area = `${line('views')} L${x(daily.length-1)},${height-bottom} L${x(0)},${height-bottom} Z`;
    const grid = [0,.25,.5,.75,1].map(part => {
      const gy = y(max * part);
      return `<line x1="${left}" x2="${width-right}" y1="${gy}" y2="${gy}" stroke="#e7edf0" stroke-width="1"/><text x="${width-right}" y="${gy-5}" text-anchor="end" fill="#82929e" font-size="10">${number(Math.round(max*part))}</text>`;
    }).join('');
    target.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escape(daily.length)} ${w('chartDays')}"><defs><linearGradient id="analytics-area" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#ff6a00" stop-opacity=".24"/><stop offset="1" stop-color="#ff6a00" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#analytics-area)"/><path d="${line('views')}" fill="none" stroke="#ff6a00" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="${line('visitors')}" fill="none" stroke="#0b2d5b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const format = date => new Date(`${String(date).slice(0,10)}T12:00:00`).toLocaleDateString(document.documentElement.lang || 'fr', { day:'numeric', month:'short' });
    $('analytics-chart-start').textContent = format(daily[0].day);
    $('analytics-chart-end').textContent = format(daily[daily.length-1].day);
  }

  function funnel(data) {
    const stages = [
      [w('visitors'), Number(data.visitors)],
      [w('views'), Number(data.views)],
      [w('services'), (data.service_pages || []).reduce((sum,row) => sum + Number(row.count || 0), 0)],
      [w('whatsapp'), Number(data.whatsapp)],
      [w('sent'), Number(data.contacts)]
    ];
    const maximum = Math.max(1, ...stages.map(([,value]) => value));
    $('analytics-funnel').innerHTML = stages.map(([label,value],index) => `<div class="funnel-stage"><div><span>${String(index+1).padStart(2,'0')} / ${escape(label)}</span><strong>${number(value)}</strong></div><div class="analytics-track"><span style="width:${Math.max(value ? 3 : 0, Math.round(value / maximum * 100))}%"></span></div></div>`).join('');
  }

  function render(data) {
      $('analytics-views').textContent = number(data.views);
      $('analytics-visitors').textContent = number(data.visitors);
      $('analytics-leads').textContent = number(data.contacts);
      $('analytics-conversion').textContent = data.visitors ? `${new Intl.NumberFormat(document.documentElement.lang || 'fr',{maximumFractionDigits:1}).format(Number(data.contacts) * 100 / Number(data.visitors))} %` : '0 %';
      $('analytics-whatsapp').textContent = number(data.whatsapp);
      $('analytics-services').textContent = number((data.service_pages || []).reduce((sum,row) => sum + Number(row.count || 0),0));
      $('analytics-views-trend').textContent = trend(Number(data.views), Number(data.previous_views));
      $('analytics-visitors-trend').textContent = trend(Number(data.visitors), Number(data.previous_visitors));
      chart(data.daily);
      funnel(data);
      const sourceNames = {direct:w('direct'),google:'Google',bing:'Bing',social:w('social'),whatsapp:'WhatsApp',email:'E-mail',other:w('other')};
      const deviceNames = {mobile:w('mobile'),tablet:w('tablet'),desktop:w('desktop')};
      const countryNames = new Intl.DisplayNames([document.documentElement.lang || 'fr'], {type:'region'});
      rows('analytics-sources', data.sources, Number(data.views), value => sourceNames[value] || value);
      rows('analytics-pages', data.pages, Number(data.views), value => value === '/index.html' || value === '/' ? w('home') : value, 10);
      rows('analytics-countries', data.countries, Number(data.views), value => value === 'XX' ? w('unknown') : (countryNames.of(value) || value));
      rows('analytics-devices', data.devices, Number(data.views), value => deviceNames[value] || value);
      rows('analytics-languages', data.languages, Number(data.views), value => languageNames[value] || value);
      $('analytics-status').textContent = `${w('updated')} ${new Date().toLocaleTimeString(document.documentElement.lang || 'fr', {hour:'2-digit',minute:'2-digit'})}.`;
  }

  async function load(sb = client) {
    if (!sb || busy || !$('analytics-period')) return;
    client = sb;
    busy = true;
    const status = $('analytics-status');
    const refresh = $('analytics-refresh');
    refresh.disabled = true;
    status.textContent = w('loading');
    try {
      const { data, error } = await sb.rpc('analytics_overview', { p_days: Number($('analytics-period').value) });
      if (error) throw error;
      lastData = data;
      render(data);
    } catch (error) {
      status.textContent = `${w('unavailable')} : ${error.message || 'SQL'}`;
    } finally { busy = false; refresh.disabled = false; }
  }

  $('analytics-period')?.addEventListener('change', () => load());
  $('analytics-refresh')?.addEventListener('click', () => load());
  window.addEventListener('peak:languagechange', () => { if(lastData) render(lastData); });
  window.peakDashboard = { load };
})();
