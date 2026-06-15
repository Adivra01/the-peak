/* ═══════════════════════════════════════════════════
   AFRICADEMIA — Base de données formations
   Éditez ce fichier ou utilisez admin-formations.html
═══════════════════════════════════════════════════ */
(function(){

const BASE = [
  {
    id: 1,
    slug: "print-on-demand",
    titre: "Print On Demand",
    soustitre: "Lancez votre marque de vêtements sans stock",
    categorie: "business",
    niveau: "Débutant",
    duree: "2 semaines",
    seances: "4 modules PDF",
    format: "pdf",
    prix: 25000,
    devise: "FCFA",
    ancien_prix: 40000,
    icon: "ri-t-shirt-line",
    tag: "Populaire",
    description_courte: "Créez et vendez votre marque de vêtements en ligne sans jamais stocker une seule unité.",
    description: "Le Print On Demand révolutionne la mode en ligne. Vous créez des designs, vos clients commandent, et le prestataire imprime et livre directement. Zéro stock, zéro risque, 100% revenu passif.",
    objectifs: [
      "Choisir sa plateforme POD (Printful, Printify, Gelato)",
      "Créer des designs qui se vendent vraiment",
      "Configurer sa boutique Shopify ou Etsy",
      "Attirer ses premiers clients via les réseaux sociaux"
    ],
    programme: [
      { num: "01", titre: "Les bases du POD", contenu: "Choisir sa niche, sa plateforme et ses premiers produits." },
      { num: "02", titre: "Création de designs", contenu: "Canva Pro, tendances du marché, fichiers d'impression parfaits." },
      { num: "03", titre: "Boutique & automatisation", contenu: "Shopify ou Etsy : configuration complète et automatisation." },
      { num: "04", titre: "Premières ventes", contenu: "Publicités ciblées, contenu organique, premières commandes." }
    ],
    recommande: true,
    active: true
  },
  {
    id: 2,
    slug: "musique-ia",
    titre: "Musique & IA",
    soustitre: "Produire et monétiser avec l'intelligence artificielle",
    categorie: "ia",
    niveau: "Intermédiaire",
    duree: "3 semaines",
    seances: "3 séances live",
    format: "live",
    prix: 35000,
    devise: "FCFA",
    ancien_prix: null,
    icon: "ri-music-2-line",
    tag: "Nouveau",
    description_courte: "Créez de la musique professionnelle avec l'IA et transformez-la en source de revenus durables.",
    description: "La révolution musicale est là. Avec les bons outils IA, vous pouvez produire, distribuer et monétiser de la musique professionnelle sans studio coûteux ni label.",
    objectifs: [
      "Maîtriser les outils IA musicaux (Suno, Udio, Soundraw)",
      "Produire des beats et compositions complètes",
      "Distribuer sur Spotify, Apple Music et TikTok",
      "Monétiser via royalties, sync et vente de beats"
    ],
    programme: [
      { num: "01", titre: "Outils IA musicaux", contenu: "Tour d'horizon des meilleures plateformes de génération musicale IA." },
      { num: "02", titre: "Production & arrangement", contenu: "Techniques de production, mixing basique, exports professionnels." },
      { num: "03", titre: "Distribution & monétisation", contenu: "DistroKid, TuneCore, licensing et vente de beats." }
    ],
    recommande: false,
    active: true
  },
  {
    id: 3,
    slug: "produits-digitaux",
    titre: "Produits Digitaux",
    soustitre: "Créez et vendez des produits numériques rentables",
    categorie: "business",
    niveau: "Débutant",
    duree: "2 semaines",
    seances: "5 modules PDF",
    format: "pdf",
    prix: 20000,
    devise: "FCFA",
    ancien_prix: 35000,
    icon: "ri-computer-line",
    tag: null,
    description_courte: "Ebooks, templates, tunnels de vente — créez une source de revenus 100% automatisée.",
    description: "Les produits digitaux sont la forme la plus scalable de business en ligne. Une seule création, vendue à l'infini. Ce guide complet vous montre comment créer, pitcher et vendre efficacement.",
    objectifs: [
      "Identifier les produits digitaux rentables de votre niche",
      "Créer des ebooks, templates et guides professionnels",
      "Mettre en place un tunnel de vente entièrement automatisé",
      "Promouvoir via Instagram, TikTok et email marketing"
    ],
    programme: [
      { num: "01", titre: "Choisir son produit", contenu: "Validation d'idée, étude de marché rapide, positionnement." },
      { num: "02", titre: "Création & packaging", contenu: "Canva, Notion, outils de création de qualité professionnelle." },
      { num: "03", titre: "Tunnel de vente", contenu: "Systeme.io ou Gumroad — page, email, livraison automatique." },
      { num: "04", titre: "Lancement & croissance", contenu: "Stratégie de lancement, témoignages, upsells." },
      { num: "05", titre: "Scaling", contenu: "Publicités, partenariats, programme d'affiliation." }
    ],
    recommande: false,
    active: true
  },
  {
    id: 4,
    slug: "sites-web-ia",
    titre: "Sites Web avec l'IA",
    soustitre: "De l'idée à la mise en ligne en 3 séances",
    categorie: "web",
    niveau: "Débutant",
    duree: "1 semaine",
    seances: "3 séances live d'1h",
    format: "live",
    prix: 45000,
    devise: "FCFA",
    ancien_prix: null,
    icon: "ri-code-box-line",
    tag: "Live",
    description_courte: "Créez votre site web professionnel en 3 sessions accompagnées, même sans expérience technique.",
    description: "En 3 séances live d'1 heure chacune, vous construisez votre site web professionnel de A à Z, guidé par un expert. L'IA s'occupe du code, vous vous concentrez sur votre business.",
    objectifs: [
      "Créer votre site avec les outils IA (Bolt, Cursor, Lovable)",
      "Personnaliser le design à votre image de marque",
      "Connecter un nom de domaine et un hébergeur",
      "Optimiser pour être trouvé sur Google (SEO de base)"
    ],
    programme: [
      { num: "01", titre: "Séance 1 — Structure", contenu: "Créer la structure de votre site avec l'IA, premières pages." },
      { num: "02", titre: "Séance 2 — Design", contenu: "Personnalisation visuelle, images, couleurs, typographie." },
      { num: "03", titre: "Séance 3 — Mise en ligne", contenu: "Domaine, hébergement, SEO de base, analytics." }
    ],
    recommande: true,
    active: true
  },
  {
    id: 5,
    slug: "immobilier-locatif",
    titre: "Immobilier Locatif",
    soustitre: "Stratégies de rentabilité immobilière",
    categorie: "business",
    niveau: "Intermédiaire",
    duree: "3 semaines",
    seances: "6 modules PDF",
    format: "pdf",
    prix: 30000,
    devise: "FCFA",
    ancien_prix: 50000,
    icon: "ri-building-4-line",
    tag: null,
    description_courte: "Maîtrisez les stratégies de sous-location et d'investissement immobilier rentable.",
    description: "L'immobilier locatif, c'est le chemin le plus éprouvé vers la liberté financière. Ce guide vous donne les stratégies concrètes pour commencer sans apport massif.",
    objectifs: [
      "Comprendre les stratégies de sous-location légale",
      "Analyser la rentabilité d'un bien avant d'investir",
      "Négocier efficacement avec propriétaires et agences",
      "Optimiser et scaler ses revenus locatifs sur le long terme"
    ],
    programme: [
      { num: "01", titre: "Bases de l'immobilier locatif", contenu: "Vocabulaire, types de baux, cadre légal." },
      { num: "02", titre: "Trouver les bonnes affaires", contenu: "Où chercher, comment analyser, les critères clés." },
      { num: "03", titre: "La sous-location", contenu: "Stratégie, légalité, négociation avec le propriétaire." },
      { num: "04", titre: "Optimisation & Airbnb", contenu: "Meublé, location courte durée, maximiser les revenus." },
      { num: "05", titre: "Scaling", contenu: "Passer de 1 à plusieurs biens, créer une structure." },
      { num: "06", titre: "Aspects financiers", contenu: "Fiscalité, comptabilité, protéger ses revenus." }
    ],
    recommande: false,
    active: true
  }
];

/* ─ Merge localStorage additions / overrides ─ */
try {
  const extra = JSON.parse(localStorage.getItem('AF_EXTRA') || '[]');
  const overrides = JSON.parse(localStorage.getItem('AF_OVERRIDES') || '{}');
  const merged = BASE.map(f => ({...f, ...(overrides[String(f.id)] || {})})).concat(extra);
  window.AF_FORMATIONS = merged.filter(f => f.active !== false);
  window.AF_FORMATIONS_ALL = merged; // admin: includes inactive
  window.AF_FORMATIONS_BASE = BASE;  // admin: base data only
} catch(e) {
  window.AF_FORMATIONS = BASE.filter(f => f.active !== false);
  window.AF_FORMATIONS_ALL = BASE;
  window.AF_FORMATIONS_BASE = BASE;
}

})();
