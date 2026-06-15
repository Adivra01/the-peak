#!/usr/bin/env node
/**
 * SEO Injector — Africademia
 * Ajoute meta tags, Open Graph, Twitter Card, JSON-LD, canonical sur chaque page
 */
const fs   = require('fs');
const path = require('path');

const BASE_URL  = 'https://africademia.com';
const OG_IMAGE  = `${BASE_URL}/og-image.jpg`;
const ORG_NAME  = 'Africademia';
const PHONE     = '+221 77 000 00 00';
const EMAIL     = 'contact@africademia.com';
const ADDRESS   = 'Dakar, Sénégal';

/* ── Données SEO par page ──────────────────────────────────────────────────── */
const PAGES = {
  'direction-afromodern.html': {
    title:       'Africademia | Agence Digitale Africaine — Sites Web, IA, Marketing, Formations',
    description: 'Africademia propulse les entrepreneurs africains avec des sites web premium, des solutions IA, du marketing digital et des formations. Résultats concrets, tarifs accessibles.',
    keywords:    'agence digitale Afrique, site web Sénégal, marketing digital Dakar, formation numérique Afrique, intelligence artificielle entreprise africaine, création site web Dakar',
    canonical:   `${BASE_URL}/`,
    robots:      'index, follow',
    type:        'website',
    jsonld:      'organization+website',
  },
  'formations.html': {
    title:       'Formations Digitales en Afrique | Web, IA, Marketing — Africademia',
    description: 'Formations pratiques en création de sites web, intelligence artificielle, marketing digital et business pour entrepreneurs africains. En ligne et en présentiel.',
    keywords:    'formation web Afrique, formation marketing digital Sénégal, formation IA Dakar, apprendre numérique Afrique, formation business digital',
    canonical:   `${BASE_URL}/formations.html`,
    robots:      'index, follow',
    type:        'webpage',
    jsonld:      'itemlist',
  },
  'notre-histoire.html': {
    title:       'Notre Histoire | Africademia — Agence Digitale Made in Africa',
    description: 'Découvrez l\'histoire d\'Africademia, agence fondée avec la mission d\'accélérer la transformation digitale des entrepreneurs et entreprises africaines.',
    keywords:    'histoire Africademia, agence digitale africaine, transformation digitale Sénégal, équipe Africademia',
    canonical:   `${BASE_URL}/notre-histoire.html`,
    robots:      'index, follow',
    type:        'webpage',
    jsonld:      'aboutpage',
  },
  'service-web.html': {
    title:       'Création Sites Web & Applications Mobile en Afrique | Africademia',
    description: 'Africademia crée des sites web professionnels, e-commerce et applications mobiles pour les entreprises africaines. Design premium, livraison rapide, résultats mesurables.',
    keywords:    'création site web Dakar, développement application mobile Afrique, agence web Sénégal, e-commerce Afrique, site web entreprise africaine',
    canonical:   `${BASE_URL}/service-web.html`,
    robots:      'index, follow',
    type:        'webpage',
    jsonld:      'service',
    serviceType: 'Création de Sites Web & Applications',
  },
  'service-ia.html': {
    title:       'Intelligence Artificielle pour Entreprises Africaines | Africademia',
    description: 'Intégrez l\'IA dans votre business : chatbots, automatisation, analyse de données, sites IA. Africademia vous accompagne dans votre transformation IA.',
    keywords:    'intelligence artificielle Afrique, chatbot entreprise Sénégal, automatisation IA Dakar, transformation IA entreprise africaine',
    canonical:   `${BASE_URL}/service-ia.html`,
    robots:      'index, follow',
    type:        'webpage',
    jsonld:      'service',
    serviceType: 'Solutions Intelligence Artificielle',
  },
  'service-marketing.html': {
    title:       'Marketing Digital & Image de Marque en Afrique | Africademia',
    description: 'Construisez une image de marque forte et une présence digitale percutante. Logo, identité visuelle, stratégie de contenu et community management pour entreprises africaines.',
    keywords:    'marketing digital Sénégal, image de marque Afrique, identité visuelle Dakar, stratégie digitale entreprise africaine, community management Dakar',
    canonical:   `${BASE_URL}/service-marketing.html`,
    robots:      'index, follow',
    type:        'webpage',
    jsonld:      'service',
    serviceType: 'Marketing Digital & Branding',
  },
  'service-publicite.html': {
    title:       'Publicité Meta Ads & TikTok Ads pour PME Africaines | Africademia',
    description: 'Campagnes publicitaires performantes sur Facebook, Instagram et TikTok. ROI optimisé, ciblage précis, gestion experte pour les entreprises africaines.',
    keywords:    'publicité Facebook Afrique, Meta Ads Sénégal, TikTok Ads Dakar, campagne publicitaire Afrique, publicité digitale PME africaine',
    canonical:   `${BASE_URL}/service-publicite.html`,
    robots:      'index, follow',
    type:        'webpage',
    jsonld:      'service',
    serviceType: 'Publicité Digitale Meta & TikTok Ads',
  },
  'service-hebergement.html': {
    title:       'Hébergement Web Professionnel & Maintenance | Africademia',
    description: 'Hébergement sécurisé, rapide et fiable avec maintenance mensuelle. Uptime garanti, SSL, sauvegardes automatiques pour vos sites et applications.',
    keywords:    'hébergement web Afrique, maintenance site web Sénégal, hosting Dakar, SSL certificat Afrique, hébergement professionnel',
    canonical:   `${BASE_URL}/service-hebergement.html`,
    robots:      'index, follow',
    type:        'webpage',
    jsonld:      'service',
    serviceType: 'Hébergement Web & Maintenance',
  },
  'formation-detail.html': {
    title:       'Détail Formation — Africademia',
    description: 'Découvrez le programme complet, les objectifs et les modalités de cette formation digitale proposée par Africademia.',
    keywords:    'formation digitale Afrique, programme formation Africademia',
    canonical:   `${BASE_URL}/formation-detail.html`,
    robots:      'index, follow',
    type:        'webpage',
    jsonld:      'course',
  },
  'service-detail.html': {
    title:       'Détail Service — Africademia',
    description: 'Découvrez en détail ce service digital proposé par Africademia pour les entrepreneurs et entreprises africaines.',
    keywords:    'service digital Afrique, Africademia service',
    canonical:   `${BASE_URL}/service-detail.html`,
    robots:      'index, follow',
    type:        'webpage',
    jsonld:      'none',
  },
  'projet-detail.html': {
    title:       'Projet Digital à Vendre — Africademia',
    description: 'Acquérez ce projet digital clé en main. Africademia vous propose des projets web prêts à l\'emploi pour accélérer votre démarrage.',
    keywords:    'projet digital vente Afrique, site web clé en main Sénégal',
    canonical:   `${BASE_URL}/projet-detail.html`,
    robots:      'index, follow',
    type:        'webpage',
    jsonld:      'none',
  },
  'connexion.html': {
    title:       'Connexion — Africademia',
    description: 'Connectez-vous à votre espace personnel Africademia pour accéder à vos formations et ressources.',
    keywords:    '',
    canonical:   `${BASE_URL}/connexion.html`,
    robots:      'noindex, nofollow',
    type:        'webpage',
    jsonld:      'none',
  },
  'espace-client.html': {
    title:       'Mon Espace Client — Africademia',
    description: 'Gérez vos formations, suivez vos projets et accédez à vos ressources depuis votre espace client Africademia.',
    keywords:    '',
    canonical:   `${BASE_URL}/espace-client.html`,
    robots:      'noindex, nofollow',
    type:        'webpage',
    jsonld:      'none',
  },
  'admin.html': {
    title:       'Administration — Africademia',
    description: 'Panneau d\'administration Africademia.',
    keywords:    '',
    canonical:   `${BASE_URL}/admin.html`,
    robots:      'noindex, nofollow',
    type:        'webpage',
    jsonld:      'none',
  },
  'admin-formations.html': {
    title:       'Gestion Formations — Africademia',
    description: 'Administration des formations Africademia.',
    keywords:    '',
    canonical:   `${BASE_URL}/admin-formations.html`,
    robots:      'noindex, nofollow',
    type:        'webpage',
    jsonld:      'none',
  },
  'index.html': {
    title:       'Africademia | Agence Digitale Africaine',
    description: 'Africademia — Agence digitale africaine spécialisée en création web, IA, marketing et formations.',
    keywords:    'agence digitale Afrique, Africademia',
    canonical:   `${BASE_URL}/`,
    robots:      'index, follow',
    type:        'website',
    jsonld:      'none',
  },
};

/* ── Générateurs JSON-LD ───────────────────────────────────────────────────── */
function jsonldOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/favicon.svg`,
    description: 'Agence digitale africaine spécialisée en création web, intelligence artificielle, marketing digital et formations numériques.',
    address: { '@type': 'PostalAddress', addressLocality: 'Dakar', addressCountry: 'SN' },
    contactPoint: { '@type': 'ContactPoint', telephone: PHONE, email: EMAIL, contactType: 'customer service', availableLanguage: ['French'] },
    sameAs: [
      'https://www.facebook.com/africademia',
      'https://www.instagram.com/africademia',
      'https://www.linkedin.com/company/africademia',
    ],
    areaServed: { '@type': 'Place', name: 'Afrique francophone' },
  };
}

function jsonldWebSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ORG_NAME,
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/formations.html?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

function jsonldService(p, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: p.serviceType || p.title,
    description: p.description,
    url,
    provider: { '@type': 'Organization', name: ORG_NAME, url: BASE_URL },
    areaServed: 'Afrique',
    availableLanguage: 'French',
  };
}

function jsonldBreadcrumb(name, url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name, item: url },
    ],
  };
}

function buildJsonLd(key, p, url) {
  const blocks = [];
  if (key === 'organization+website') {
    blocks.push(jsonldOrganization(), jsonldWebSite());
  } else if (key === 'service') {
    blocks.push(jsonldOrganization(), jsonldService(p, url), jsonldBreadcrumb(p.serviceType || 'Service', url));
  } else if (key === 'itemlist') {
    blocks.push(jsonldOrganization(), jsonldBreadcrumb('Formations', url));
  } else if (key === 'aboutpage') {
    blocks.push(jsonldOrganization(), {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: p.title,
      description: p.description,
      url,
      publisher: { '@type': 'Organization', name: ORG_NAME, url: BASE_URL },
    });
  } else if (key === 'course') {
    blocks.push(jsonldOrganization(), {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: 'Formations Africademia',
      description: p.description,
      provider: { '@type': 'Organization', name: ORG_NAME, url: BASE_URL },
    });
  }
  return blocks.map(b => `<script type="application/ld+json">\n${JSON.stringify(b, null, 2)}\n</script>`).join('\n');
}

/* ── Injecteur principal ───────────────────────────────────────────────────── */
function buildSeoBlock(filename, p) {
  const kw   = p.keywords ? `\n<meta name="keywords" content="${p.keywords}">` : '';
  const ld   = p.jsonld !== 'none' ? '\n' + buildJsonLd(p.jsonld, p, p.canonical) : '';
  return `
<meta name="description" content="${p.description}">${kw}
<meta name="robots" content="${p.robots}">
<meta name="author" content="${ORG_NAME}">
<link rel="canonical" href="${p.canonical}">
<!-- Open Graph -->
<meta property="og:type" content="${p.type}">
<meta property="og:site_name" content="${ORG_NAME}">
<meta property="og:title" content="${p.title}">
<meta property="og:description" content="${p.description}">
<meta property="og:url" content="${p.canonical}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="fr_SN">
<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@africademia">
<meta name="twitter:title" content="${p.title}">
<meta name="twitter:description" content="${p.description}">
<meta name="twitter:image" content="${OG_IMAGE}">
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="apple-touch-icon" href="apple-touch-icon.png">${ld}`;
}

/* ── Traitement de chaque fichier ──────────────────────────────────────────── */
const SRC  = path.join(__dirname);
let updated = 0;

for (const [filename, seo] of Object.entries(PAGES)) {
  const fp = path.join(SRC, filename);
  if (!fs.existsSync(fp)) { console.warn(`⚠ Fichier introuvable: ${filename}`); continue; }

  let html = fs.readFileSync(fp, 'utf8');

  // 1. Remplacer le titre
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${seo.title}</title>`);

  // 2. Supprimer les meta SEO existantes (si déjà injectées) pour éviter doublons
  html = html.replace(/<!-- SEO-START -->[\s\S]*?<!-- SEO-END -->/g, '');
  html = html.replace(/<meta name="description"[^>]*>/g, '');
  html = html.replace(/<meta name="robots"[^>]*>/g, '');
  html = html.replace(/<meta name="keywords"[^>]*>/g, '');
  html = html.replace(/<meta name="author"[^>]*>/g, '');
  html = html.replace(/<link rel="canonical"[^>]*>/g, '');
  html = html.replace(/<!-- Open Graph -->[\s\S]*?<!-- Twitter Card -->[\s\S]*?<meta name="twitter:image"[^>]*>/g, '');
  html = html.replace(/<meta property="og:[^>]*>/g, '');
  html = html.replace(/<meta name="twitter:[^>]*>/g, '');
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  html = html.replace(/<link rel="icon"[^>]*>/g, '');
  html = html.replace(/<link rel="apple-touch-icon"[^>]*>/g, '');

  // 3. Injecter juste après <meta name="viewport" ...>
  const seoBlock = `<!-- SEO-START -->${buildSeoBlock(filename, seo)}\n<!-- SEO-END -->`;
  html = html.replace(/(<meta name="viewport"[^>]*>)/, `$1\n${seoBlock}`);

  fs.writeFileSync(fp, html);
  console.log(`✓ SEO → ${filename}`);
  updated++;
}

console.log(`\n✓ ${updated} pages mises à jour`);
