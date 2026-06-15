/* ═══════════════════════════════════════════════════════════════════
   AFRICADEMIA — Module base de données
   Utilise Supabase si configuré, sinon données locales (data/formations.js)
═══════════════════════════════════════════════════════════════════ */

const DB = (() => {

  /* ── Initialisation du client Supabase ─────────────────────────── */
  let _client = null;
  let _ready  = false;

  function _init(serviceKey = false) {
    const url = window.SUPABASE_URL;
    const key = serviceKey ? window.SUPABASE_SERVICE_KEY : window.SUPABASE_ANON_KEY;

    if (!url || url.includes('VOTRE') || !key || key.includes('VOTRE')) {
      console.warn('[DB] Supabase non configuré — mode données locales actif.');
      return false;
    }
    if (typeof window.supabase === 'undefined') {
      console.error('[DB] Librairie Supabase JS non chargée.');
      return false;
    }
    try {
      _client = window.supabase.createClient(url, key);
      _ready  = true;
      console.info('[DB] Supabase connecté ✓');
      return true;
    } catch (e) {
      console.error('[DB] Erreur init:', e);
      return false;
    }
  }

  /* ── Utilitaires ────────────────────────────────────────────────── */
  function _fallbackFormations(filters = {}) {
    let items = window.AF_FORMATIONS || [];
    const { categorie, format, recommande, search } = filters;
    if (categorie && categorie !== 'all') {
      if (['pdf', 'live', 'hybrid'].includes(categorie)) items = items.filter(f => f.format === categorie);
      else items = items.filter(f => f.categorie === categorie);
    }
    if (format)     items = items.filter(f => f.format === format);
    if (recommande) items = items.filter(f => f.recommande);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(f =>
        f.titre.toLowerCase().includes(q) ||
        (f.description_courte || '').toLowerCase().includes(q) ||
        (f.categorie || '').toLowerCase().includes(q)
      );
    }
    return items;
  }

  /* ══════════════════════════════════════════════════════════════════
     FORMATIONS
  ══════════════════════════════════════════════════════════════════ */
  async function getFormations(filters = {}) {
    if (!_client) return _fallbackFormations(filters);

    try {
      let q = _client.from('formations').select('*').order('ordre', { ascending: true });
      // Essai 1 : filtre active (colonne d'origine)
      let q2 = q.or('active.eq.true,actif.eq.true');

      const { categorie, format, recommande, search } = filters;
      if (categorie && categorie !== 'all') {
        if (['pdf', 'live', 'hybrid'].includes(categorie)) q2 = q2.eq('format', categorie);
        else q2 = q2.eq('categorie', categorie);
      }
      if (format)     q2 = q2.eq('format', format);
      if (recommande) q2 = q2.eq('recommande', true);
      if (search)     q2 = q2.ilike('titre', `%${search}%`);

      const { data, error } = await q2;
      if (!error && data && data.length > 0) return data;
    } catch(e) {}

    // Fallback local si DB vide ou erreur
    return _fallbackFormations(filters);
  }

  async function getFormation(slug) {
    if (!_client) return (window.AF_FORMATIONS || []).find(f => f.slug === slug) || null;
    try {
      // Essai avec active OU actif selon le schéma en place
      const { data, error } = await _client.from('formations').select('*').eq('slug', slug).single();
      if (!error && data && (data.active !== false || data.actif !== false)) return data;
    } catch(e) {}
    // Fallback données locales
    return (window.AF_FORMATIONS || []).find(f => f.slug === slug) || null;
  }

  async function createFormation(payload) {
    if (!_client) throw new Error('Supabase non configuré');
    const { data, error } = await _client.from('formations').insert([payload]).select().single();
    if (error) throw error;
    return data;
  }

  async function updateFormation(id, payload) {
    if (!_client) throw new Error('Supabase non configuré');
    const { data, error } = await _client.from('formations').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async function deleteFormation(id) {
    if (!_client) throw new Error('Supabase non configuré');
    const { error } = await _client.from('formations').update({ active: false }).eq('id', id);
    if (error) throw error;
  }

  async function getAllFormationsAdmin() {
    if (!_client) return window.AF_FORMATIONS_ALL || window.AF_FORMATIONS || [];
    const { data, error } = await _client.from('formations').select('*').order('ordre', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  /* ══════════════════════════════════════════════════════════════════
     SERVICES
  ══════════════════════════════════════════════════════════════════ */
  async function getServices(filters = {}) {
    if (!_client) return (window.AF_SERVICES || []);
    try {
      let q = _client.from('services').select('*').eq('actif', true).order('ordre', { ascending: true });
      if (filters.categorie) q = q.eq('categorie', filters.categorie);
      const { data, error } = await q;
      if (!error && data && data.length > 0) return data;
    } catch(e) {}
    return (window.AF_SERVICES || []);
  }

  async function getService(slug) {
    if (!_client) return (window.AF_SERVICES || []).find(s => s.slug === slug) || null;
    try {
      const { data, error } = await _client.from('services').select('*').eq('slug', slug).single();
      if (!error && data) return data;
    } catch(e) {}
    return (window.AF_SERVICES || []).find(s => s.slug === slug) || null;
  }

  async function createService(payload) {
    if (!_client) throw new Error('Supabase non configuré');
    const { data, error } = await _client.from('services').insert([payload]).select().single();
    if (error) throw error;
    return data;
  }

  async function updateService(id, payload) {
    if (!_client) throw new Error('Supabase non configuré');
    const { data, error } = await _client.from('services').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  /* ══════════════════════════════════════════════════════════════════
     CONTACTS
  ══════════════════════════════════════════════════════════════════ */
  async function createContact(payload) {
    if (!_client) { console.log('[DB] Contact (local):', payload); return { ...payload, id: Date.now() }; }
    const { data, error } = await _client.from('contacts').insert([{ ...payload, source: payload.source || 'site' }]).select().single();
    if (error) throw error;
    return data;
  }

  async function getContacts(filters = {}) {
    if (!_client) return [];
    let q = _client.from('v_contacts_recents').select('*');
    if (filters.statut) q = q.eq('statut', filters.statut);
    if (filters.nonLus) q = q.eq('lu', false);
    if (filters.limit)  q = q.limit(filters.limit);
    const { data, error } = await q;
    if (error) { console.error('[DB] getContacts:', error); return []; }
    return data || [];
  }

  async function updateContact(id, payload) {
    if (!_client) throw new Error('Supabase non configuré');
    const { data, error } = await _client.from('contacts').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  async function markContactLu(id) {
    return updateContact(id, { lu: true });
  }

  /* ══════════════════════════════════════════════════════════════════
     RENDEZ-VOUS
  ══════════════════════════════════════════════════════════════════ */
  async function createRendezVous(payload) {
    if (!_client) { console.log('[DB] RDV (local):', payload); return { ...payload, id: Date.now() }; }
    const { data, error } = await _client.from('rendez_vous').insert([payload]).select().single();
    if (error) throw error;
    return data;
  }

  async function getRendezVous(filters = {}) {
    if (!_client) return [];
    let q = _client.from('v_rdv_a_venir').select('*');
    if (filters.statut) q = q.eq('statut', filters.statut);
    if (filters.limit)  q = q.limit(filters.limit);
    const { data, error } = await q;
    if (error) { console.error('[DB] getRendezVous:', error); return []; }
    return data || [];
  }

  async function updateRendezVous(id, payload) {
    if (!_client) throw new Error('Supabase non configuré');
    const { data, error } = await _client.from('rendez_vous').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  /* ══════════════════════════════════════════════════════════════════
     PORTFOLIO
  ══════════════════════════════════════════════════════════════════ */
  async function getPortfolio(filters = {}) {
    if (!_client) return [];
    let q = _client.from('portfolio').select('*').eq('actif', true).order('ordre', { ascending: true });
    if (filters.categorie) q = q.eq('categorie', filters.categorie);
    if (filters.featured)  q = q.eq('featured', true);
    const { data, error } = await q;
    if (error) { console.error('[DB] getPortfolio:', error); return []; }
    return data || [];
  }

  /* ══════════════════════════════════════════════════════════════════
     ARTICLES
  ══════════════════════════════════════════════════════════════════ */
  async function getArticles(filters = {}) {
    if (!_client) return [];
    let q = _client.from('articles').select('id,slug,titre,sous_titre,extrait,image_url,categorie,tags,date_publication,auteur,lecture_min,vues').eq('publie', true).order('date_publication', { ascending: false });
    if (filters.categorie) q = q.eq('categorie', filters.categorie);
    if (filters.limit)     q = q.limit(filters.limit);
    const { data, error } = await q;
    if (error) { console.error('[DB] getArticles:', error); return []; }
    return data || [];
  }

  /* ══════════════════════════════════════════════════════════════════
     TÉMOIGNAGES
  ══════════════════════════════════════════════════════════════════ */
  async function getTemoignages() {
    if (!_client) return [];
    const { data, error } = await _client.from('temoignages').select('*').eq('actif', true).eq('verifie', true).order('created_at', { ascending: false });
    if (error) { console.error('[DB] getTemoignages:', error); return []; }
    return data || [];
  }

  /* ══════════════════════════════════════════════════════════════════
     STATS ADMIN
  ══════════════════════════════════════════════════════════════════ */
  async function getStats() {
    if (!_client) return null;
    const { data, error } = await _client.from('v_stats').select('*').single();
    if (error) { console.error('[DB] getStats:', error); return null; }
    return data;
  }

  /* ══════════════════════════════════════════════════════════════════
     PARAMÈTRES
  ══════════════════════════════════════════════════════════════════ */
  async function getParametre(cle) {
    if (!_client) return null;
    const { data, error } = await _client.from('parametres').select('valeur').eq('cle', cle).single();
    if (error) return null;
    return data?.valeur || null;
  }

  async function setParametre(cle, valeur) {
    if (!_client) throw new Error('Supabase non configuré');
    const { error } = await _client.from('parametres').upsert({ cle, valeur, updated_at: new Date().toISOString() });
    if (error) throw error;
  }

  /* ══════════════════════════════════════════════════════════════════
     PAIEMENTS
  ══════════════════════════════════════════════════════════════════ */
  async function createPaiement(payload) {
    if (!_client) throw new Error('Supabase non configuré');
    const { data, error } = await _client.from('paiements').insert([payload]).select().single();
    if (error) throw error;
    return data;
  }

  async function getPaiements(filters = {}) {
    if (!_client) return [];
    let q = _client.from('paiements').select('*, contacts(nom,email), formations(titre), services(titre)').order('created_at', { ascending: false });
    if (filters.statut) q = q.eq('statut', filters.statut);
    if (filters.limit)  q = q.limit(filters.limit);
    const { data, error } = await q;
    if (error) { console.error('[DB] getPaiements:', error); return []; }
    return data || [];
  }

  /* ══════════════════════════════════════════════════════════════════
     ACHATS (espace client)
  ══════════════════════════════════════════════════════════════════ */
  async function getAchats(filters = {}) {
    if (!_client) return [];
    let q = _client.from('v_achats_detail').select('*').order('created_at', { ascending: false });
    if (filters.userId)    q = q.eq('user_id', filters.userId);
    if (filters.statut)    q = q.eq('statut', filters.statut);
    if (filters.acces)     q = q.eq('acces_actif', true);
    const { data, error } = await q;
    if (error) { console.error('[DB] getAchats:', error); return []; }
    return data || [];
  }

  async function createAchat(payload) {
    if (!_client) throw new Error('Supabase non configuré');
    const { data, error } = await _client.from('achats').insert([payload]).select().single();
    if (error) throw error;
    return data;
  }

  async function updateAchat(id, payload) {
    if (!_client) throw new Error('Supabase non configuré');
    const { data, error } = await _client.from('achats').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  /* ══════════════════════════════════════════════════════════════════
     FICHIERS FORMATION (espace client)
  ══════════════════════════════════════════════════════════════════ */
  async function getFichiersFormation(formationId, clientOnly = false) {
    if (!_client) return [];
    let q = _client.from('fichiers_formation').select('*').eq('formation_id', formationId).order('ordre', { ascending: true });
    if (clientOnly) q = q.eq('gratuit', false);
    const { data, error } = await q;
    if (error) { console.error('[DB] getFichiersFormation:', error); return []; }
    return data || [];
  }

  async function createFichierFormation(payload) {
    if (!_client) throw new Error('Supabase non configuré');
    const { data, error } = await _client.from('fichiers_formation').insert([payload]).select().single();
    if (error) throw error;
    return data;
  }

  async function deleteFichierFormation(id) {
    if (!_client) throw new Error('Supabase non configuré');
    const { error } = await _client.from('fichiers_formation').delete().eq('id', id);
    if (error) throw error;
  }

  async function getAllAchatsAdmin(filters = {}) {
    if (!_client) return [];
    let q = _client.from('v_achats_detail').select('*').order('created_at', { ascending: false });
    if (filters.statut) q = q.eq('statut', filters.statut);
    if (filters.limit)  q = q.limit(filters.limit);
    const { data, error } = await q;
    if (error) { console.error('[DB] getAllAchatsAdmin:', error); return []; }
    return data || [];
  }

  async function getClients() {
    if (!_client) return [];
    const { data, error } = await _client.from('profiles').select('*').eq('role', 'client').order('created_at', { ascending: false });
    if (error) { console.error('[DB] getClients:', error); return []; }
    return data || [];
  }

  /* ── Init + health check ─────────────────────────────────────────── */
  async function _initWithHealthCheck() {
    if (!_init()) return;
    const url = window.SUPABASE_URL;
    try {
      const res = await fetch(`${url}/rest/v1/formations?limit=1`, {
        headers: { apikey: window.SUPABASE_ANON_KEY, Authorization: `Bearer ${window.SUPABASE_ANON_KEY}` }
      });
      if (res.status >= 500) {
        console.warn('[DB] Supabase indisponible (HTTP ' + res.status + ') — mode données locales actif.');
        _client = null;
        _ready  = false;
      }
    } catch (e) {
      console.warn('[DB] Supabase inaccessible — mode données locales actif.');
      _client = null;
      _ready  = false;
    }
  }
  _initWithHealthCheck();

  /* ── API publique ──────────────────────────────────────────────── */
  return {
    get ready()  { return _ready; },
    get client() { return _client; },
    initAdmin()  { return _init(true); }, /* Réinitialise avec service_role pour l'admin */

    /* Formations */
    getFormations,
    getFormation,
    createFormation,
    updateFormation,
    deleteFormation,
    getAllFormationsAdmin,

    /* Services */
    getServices,
    getService,
    createService,
    updateService,

    /* Contacts */
    createContact,
    getContacts,
    updateContact,
    markContactLu,

    /* Rendez-vous */
    createRendezVous,
    getRendezVous,
    updateRendezVous,

    /* Portfolio */
    getPortfolio,

    /* Articles */
    getArticles,

    /* Témoignages */
    getTemoignages,

    /* Stats */
    getStats,

    /* Paramètres */
    getParametre,
    setParametre,

    /* Paiements */
    createPaiement,
    getPaiements,

    /* Achats */
    getAchats,
    createAchat,
    updateAchat,
    getAllAchatsAdmin,
    getClients,

    /* Fichiers formation */
    getFichiersFormation,
    createFichierFormation,
    deleteFichierFormation,
  };
})();

window.DB = DB;
