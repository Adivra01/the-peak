/* ═══════════════════════════════════════════════════
   AFRICADEMIA — Base de données services (fallback local)
   Éditez ce fichier ou utilisez admin.html
   TOUS LES SERVICES SONT SUR DEVIS — pas de prix affiché
═══════════════════════════════════════════════════ */

const SERVICES_BASE = [
  {
    id: 1, slug: 'creation-site-web',
    titre: 'Création de Site Web',
    sous_titre: 'Sites web professionnels qui convertissent',
    categorie: 'web',
    sur_devis: true,
    prix: null, devise: 'FCFA',
    description_courte: 'Sites web sur-mesure, modernes et optimisés pour convertir vos visiteurs en clients.',
    description: 'Nous concevons des sites web qui allient esthétique premium et performance technique. Chaque projet est pensé pour votre marché, votre audience et vos objectifs de conversion.',
    description_longue: 'De la landing page au site e-commerce complet, nous construisons votre présence en ligne avec les meilleures pratiques du secteur.\n\nChaque site est développé avec des technologies modernes (Next.js, React, ou HTML/CSS/JS selon vos besoins), optimisé pour la vitesse, le SEO et le mobile.\n\nNous livrons des sites clé en main avec : design personnalisé, intégration de votre contenu, optimisation SEO de base, et formation à la gestion du site.',
    icon: 'ri-code-box-line',
    duree_estimee: '7–14 jours',
    points_forts: [
      'Design sur-mesure à votre image',
      'Optimisé mobile & SEO',
      'Livré clé en main avec formation',
      'Technologies modernes (Next.js, React)',
      'Hébergement inclus 1 an'
    ],
    inclus: [
      'Maquette validée avant développement',
      'Jusqu\'à 8 pages incluses',
      'Formulaire de contact & WhatsApp',
      'Google Analytics configuré',
      'SSL & nom de domaine',
      '3 mois de support'
    ],
    formations_liees: ['sites-web-ia'],
    actif: true, ordre: 1
  },
  {
    id: 2, slug: 'marketing-digital',
    titre: 'Marketing Digital',
    sous_titre: 'Visibilité, audience et conversions au rendez-vous',
    categorie: 'marketing',
    sur_devis: true,
    prix: null, devise: 'FCFA',
    description_courte: 'Stratégies Meta Ads, TikTok Ads, Google Ads et contenu organique pour booster votre présence.',
    description: 'Nous déployons des stratégies marketing digitales complètes, adaptées à votre budget et votre marché cible en Afrique et dans la diaspora.',
    description_longue: 'Le marketing digital, c\'est bien plus que publier du contenu. C\'est construire une stratégie cohérente qui touche votre audience au bon moment, au bon endroit, avec le bon message.\n\nNous gérons l\'ensemble de votre présence digitale : campagnes payantes (Meta Ads, TikTok Ads, Google Ads), gestion des réseaux sociaux, création de contenu, et reporting mensuel détaillé.\n\nChaque stratégie est personnalisée selon votre secteur, votre budget et vos objectifs de croissance.',
    icon: 'ri-megaphone-line',
    duree_estimee: 'Mensuel',
    points_forts: [
      'Campagnes Meta Ads & TikTok Ads',
      'Gestion des réseaux sociaux',
      'Création de contenu mensuelle',
      'Reporting & analytics',
      'Optimisation continue du ROI'
    ],
    inclus: [
      '8 publications/mois minimum',
      '2 campagnes publicitaires',
      'Rapport mensuel détaillé',
      'Réponse aux commentaires',
      'Stories & Reels',
      'Consultation stratégique mensuelle'
    ],
    formations_liees: ['produits-digitaux', 'print-on-demand'],
    actif: true, ordre: 2
  },
  {
    id: 3, slug: 'hebergement',
    titre: 'Hébergement & Domaine',
    sous_titre: 'Votre site en ligne, sécurisé et performant',
    categorie: 'hebergement',
    sur_devis: true,
    prix: null, devise: 'FCFA',
    description_courte: 'Hébergement haute performance, nom de domaine, certificat SSL et emails pro.',
    description: 'Nous hébergeons votre site sur des serveurs haute performance avec garantie de disponibilité 99.9%, SSL inclus et support technique réactif.',
    description_longue: 'Votre site web mérite une infrastructure fiable. Nous proposons des solutions d\'hébergement adaptées à chaque type de projet : site vitrine, e-commerce, application web.\n\nTous nos serveurs sont localisés en Europe avec des CDN globaux pour une performance optimale en Afrique et partout dans le monde.\n\nInclus : panneau de gestion cPanel, sauvegardes automatiques quotidiennes, protection anti-DDoS, et support technique disponible 24/7.',
    icon: 'ri-server-line',
    duree_estimee: 'Annuel',
    points_forts: [
      '99.9% de disponibilité garantie',
      'SSL inclus & renouvelé automatiquement',
      'Emails professionnels illimités',
      'Sauvegardes quotidiennes',
      'Support technique 24/7'
    ],
    inclus: [
      'Nom de domaine (.com, .net, .africa)',
      'Hébergement 1 an',
      'Certificat SSL/HTTPS',
      '5 adresses email professionnelles',
      'Panneau de contrôle cPanel',
      'Migration gratuite si déjà hébergé'
    ],
    formations_liees: ['sites-web-ia'],
    actif: true, ordre: 3
  },
  {
    id: 4, slug: 'publicite',
    titre: 'Publicité Digitale',
    sous_titre: 'Campagnes qui convertissent, audiences qui achètent',
    categorie: 'publicite',
    sur_devis: true,
    prix: null, devise: 'FCFA',
    description_courte: 'Campagnes publicitaires ciblées avec ciblage précis, créatifs optimisés et ROAS garanti.',
    description: 'Nous créons et gérons vos campagnes publicitaires sur Meta, TikTok et Google pour maximiser votre retour sur investissement.',
    description_longue: 'La publicité digitale est le levier le plus puissant pour acquérir des clients rapidement. Mais mal configurée, elle brûle votre budget sans résultats.\n\nNous prenons en charge l\'ensemble du processus : analyse de votre audience cible, création des visuels et copies publicitaires, paramétrage des campagnes, A/B testing, et optimisation continue.\n\nNos experts Meta Ads et TikTok Ads ont généré des millions de FCFA de chiffre d\'affaires pour nos clients en Afrique de l\'Ouest.',
    icon: 'ri-advertisement-line',
    duree_estimee: 'Par campagne',
    points_forts: [
      'Ciblage précis par audience',
      'Créatifs optimisés (vidéo + image)',
      'A/B testing systématique',
      'Optimisation ROAS en temps réel',
      'Rapport de performance hebdomadaire'
    ],
    inclus: [
      'Audit de votre compte publicitaire',
      'Création de 4 visuels publicitaires',
      '2 campagnes configurées',
      'Pixel/Tag installé et testé',
      'Ciblage audience personnalisé',
      'Rapport hebdomadaire + mensuel'
    ],
    formations_liees: ['produits-digitaux', 'print-on-demand'],
    actif: true, ordre: 4
  },
  {
    id: 5, slug: 'ia-sites',
    titre: 'Création avec l\'IA',
    sous_titre: 'Sites web générés en quelques heures avec l\'IA',
    categorie: 'ia',
    sur_devis: true,
    prix: null, devise: 'FCFA',
    description_courte: 'Créez votre site web complet en 24–72h avec les derniers outils IA — Bolt, Cursor, Lovable.',
    description: 'Grâce aux outils IA de dernière génération, nous créons votre site web professionnel en quelques heures à un coût réduit, sans sacrifier la qualité.',
    description_longue: 'La révolution IA a transformé le développement web. Ce qui prenait 3 semaines prend maintenant 24 à 72 heures.\n\nNous utilisons des outils comme Bolt.new, Cursor, Lovable et Claude pour générer des sites web complets, personnalisés et professionnels à une fraction du coût traditionnel.\n\nIdéal pour les entrepreneurs qui veulent tester une idée rapidement, les petites entreprises qui ont besoin d\'une présence en ligne immédiate, ou les projets avec un budget limité.',
    icon: 'ri-robot-line',
    duree_estimee: '24–72 heures',
    points_forts: [
      'Livraison ultra-rapide 24–72h',
      'Coût réduit vs développement traditionnel',
      'Entièrement personnalisable',
      'Design moderne & responsive',
      'Code source livré'
    ],
    inclus: [
      'Site web complet jusqu\'à 5 pages',
      'Design personnalisé à votre marque',
      'Mobile & tablette responsive',
      'Formulaire de contact',
      'Intégration WhatsApp',
      '1 mois de support inclus'
    ],
    formations_liees: ['sites-web-ia', 'musique-ia'],
    actif: true, ordre: 5
  }
];

try {
  const extra = JSON.parse(localStorage.getItem('AF_SRV_EXTRA') || '[]');
  const merged = SERVICES_BASE.concat(extra);
  window.AF_SERVICES = merged.filter(function(s){ return s.actif !== false; });
} catch(e) {
  window.AF_SERVICES = SERVICES_BASE.filter(function(s){ return s.actif !== false; });
}
