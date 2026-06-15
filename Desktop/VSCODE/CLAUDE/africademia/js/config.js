/* ═══════════════════════════════════════════════════════════════════
   AFRICADEMIA — Configuration centrale
   Modifiez CE SEUL FICHIER pour mettre à jour tout le site.
═══════════════════════════════════════════════════════════════════ */

/* ── Paramètres du site ─────────────────────────────────────────── */
window.AF_CONFIG = {
  whatsapp:  '22369656610',         /* Numéro WhatsApp (sans + ni espaces) */
  email:     'contact@africademia.com',
  instagram: 'africademia',
  devise:    'FCFA',

  /* Génère un lien wa.me complet */
  wa(message) {
    const msg = message || 'Bonjour+Khadidja+%F0%9F%91%8B+Je+souhaite+en+savoir+plus+sur+vos+services.';
    return `https://wa.me/${this.whatsapp}?text=${msg}`;
  },

  /* Messages pré-remplis par contexte */
  msg: {
    general:     'Bonjour+Khadidja+%F0%9F%91%8B+Je+souhaite+en+savoir+plus+sur+vos+services.',
    web:         'Bonjour+Khadidja+%F0%9F%91%8B+Je+suis+int%C3%A9ress%C3%A9(e)+par+la+cr%C3%A9ation+d%27un+site+web.+Pouvez-vous+m%27accompagner+%3F',
    marketing:   'Bonjour+Khadidja+%F0%9F%91%8B+Je+suis+int%C3%A9ress%C3%A9(e)+par+le+marketing+digital.+Pouvez-vous+m%27accompagner+%3F',
    publicite:   'Bonjour+Khadidja+%F0%9F%91%8B+Je+suis+int%C3%A9ress%C3%A9(e)+par+la+publicit%C3%A9+digitale.+Pouvez-vous+m%27accompagner+%3F',
    hebergement: 'Bonjour+Khadidja+%F0%9F%91%8B+Je+suis+int%C3%A9ress%C3%A9(e)+par+l%27h%C3%A9bergement+de+mon+site.+Pouvez-vous+m%27accompagner+%3F',
    ia:          'Bonjour+Khadidja+%F0%9F%91%8B+Je+suis+int%C3%A9ress%C3%A9(e)+par+vos+formations+IA.+Pouvez-vous+m%27orienter+%3F',
    devis:       'Bonjour+Khadidja+%F0%9F%91%8B+Je+souhaite+un+devis+gratuit+pour+mon+projet.',
    incubateur:  'Bonjour+Khadidja+%F0%9F%91%8B+Je+suis+int%C3%A9ress%C3%A9(e)+par+le+programme+incubateur.',
  },
};

/* ── Supabase ───────────────────────────────────────────────────── */
window.SUPABASE_URL         = 'https://wnvsrjsjjnyitxiexztq.supabase.co';
window.SUPABASE_ANON_KEY    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndudnNyanNqam55aXR4aWV4enRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTcxMTgsImV4cCI6MjA4OTk3MzExOH0.cl-zRjcI_IPXRc3igd0iN1nM_ChSBQSzFVMPTJrLq6Q';
window.SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndudnNyanNqam55aXR4aWV4enRxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM5NzExOCwiZXhwIjoyMDg5OTczMTE4fQ.lazEViFgprSu3q8x3HbO3OS9xkCJMVfBSshgTx6aIXY'; /* Admin seulement — ne pas exposer sur le site public */
window.SUPABASE_ADMIN_EMAIL = 'adiatourepro@gmail.com';
