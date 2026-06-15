const AUTH = (() => {
  let _sb    = null;
  let _user    = null;
  let _profile = null;
  const _callbacks = [];

  function _client() {
    if (_sb) return _sb;
    if (window.DB?.client) { _sb = window.DB.client; return _sb; }
    const url = window.SUPABASE_URL;
    const key = window.SUPABASE_ANON_KEY;
    if (!url || !key || typeof window.supabase === 'undefined') return null;
    try { _sb = window.supabase.createClient(url, key); } catch(e) { console.error('[AUTH] client init:', e); }
    return _sb;
  }

  async function _loadProfile() {
    if (!_user) return;
    const c = _client();
    if (!c) return;

    // 1er essai : client courant (anon ou service_role selon contexte)
    try {
      const { data, error } = await c.from('profiles').select('*').eq('id', _user.id).single();
      if (!error && data) { _profile = data; return; }
    } catch(e) {}

    // 2ème essai : service_role key (bypass RLS) — clé déjà exposée dans config.js
    if (window.SUPABASE_SERVICE_KEY && window.SUPABASE_URL && typeof window.supabase !== 'undefined') {
      try {
        const adminSb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_SERVICE_KEY);
        const { data, error } = await adminSb.from('profiles').select('*').eq('id', _user.id).single();
        if (!error && data) { _profile = data; return; }
      } catch(e) {}
    }

    _profile = null;
  }

  async function init() {
    const c = _client();
    if (!c) { console.warn('[AUTH] Supabase non disponible'); return null; }
    try {
      const { data: { session } } = await c.auth.getSession();
      if (session?.user) {
        _user = session.user;
        await _loadProfile();
      }
      c.auth.onAuthStateChange(async (_event, session) => {
        _user = session?.user || null;
        if (_user) await _loadProfile(); else _profile = null;
        _callbacks.forEach(fn => fn(_user, _profile));
      });
    } catch(e) {
      console.error('[AUTH] init error:', e);
    }
    return _user;
  }

  async function login(email, password) {
    const c = _client();
    if (!c) throw new Error('Supabase non configuré — rechargez la page.');
    const { data, error } = await c.auth.signInWithPassword({ email, password });
    if (error) throw error;
    _user = data.user;
    await _loadProfile();
    return { user: _user, profile: _profile };
  }

  async function register(email, password, meta = {}) {
    const c = _client();
    if (!c) throw new Error('Supabase non configuré — rechargez la page.');
    const { data, error } = await c.auth.signUp({
      email, password,
      options: { data: meta }
    });
    if (error) throw error;
    _user = data.user;
    return _user;
  }

  async function logout() {
    const c = _client();
    if (!c) return;
    try { await c.auth.signOut(); } catch(e) {}
    _user = null;
    _profile = null;
    _sb = null;
  }

  async function updatePassword(newPassword) {
    const c = _client();
    if (!c) throw new Error('Supabase non configuré');
    const { error } = await c.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  async function updateEmail(newEmail) {
    const c = _client();
    if (!c) throw new Error('Supabase non configuré');
    const { error } = await c.auth.updateUser({ email: newEmail });
    if (error) throw error;
  }

  async function updateProfile(payload) {
    if (!_user || !_client()) throw new Error('Non connecté');
    const { data, error } = await _client().from('profiles').update(payload).eq('id', _user.id).select().single();
    if (error) throw error;
    _profile = data;
    return data;
  }

  function onAuthChange(fn) { _callbacks.push(fn); }
  function isAdmin() {
    // Priorité 1 : app_metadata dans le JWT (sans requête DB)
    if (_user?.app_metadata?.role === 'admin') return true;
    // Priorité 2 : table profiles
    if (_profile?.role === 'admin') return true;
    // Priorité 3 : email admin (fallback si DB non configurée — nécessite session valide)
    if (_user?.email && window.SUPABASE_ADMIN_EMAIL && _user.email === window.SUPABASE_ADMIN_EMAIL) return true;
    return false;
  }

  function requireAuth(redirectTo = 'connexion.html') {
    if (!_user) { location.href = redirectTo; return false; }
    return true;
  }

  function requireAdmin(redirectTo = 'connexion.html') {
    if (!_user || !isAdmin()) { location.href = redirectTo; return false; }
    return true;
  }

  return {
    init,
    login,
    register,
    logout,
    updatePassword,
    updateEmail,
    updateProfile,
    onAuthChange,
    isAdmin,
    requireAuth,
    requireAdmin,
    get user()    { return _user; },
    get profile() { return _profile; },
  };
})();

window.AUTH = AUTH;
