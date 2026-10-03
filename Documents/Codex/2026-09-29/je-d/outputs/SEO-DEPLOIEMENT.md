# SEO, Google Search et GEO

## Modifications préparées

- Les six pages de service ont un titre, une description, un H1, des sections, une FAQ visible et des données structurées propres à leur sujet.
- Les pages de service distinguent leurs livrables et leur méthode, et les liens de contact transmettent le service avec une demande WhatsApp contextualisée.
- Les listes de mots-clés visibles qui ressemblaient à du bourrage ont été remplacées par une information de zone de service lisible. Les balises `meta keywords` ont été retirées : Google Search ne les utilise pas.
- La page d’accueil déclare l’activité et les zones desservies (Bamako et Mali). Les pages publiques sont configurées pour l’indexation ; l’administration et les espaces de compte sont en `noindex`.
- `robots.txt` laisse les pages explorables ; les pages d’administration et de compte portent `noindex,nofollow` afin que Google puisse lire leur directive d’exclusion.

## Domaine et enregistrement Google

Le domaine prévu est `thepeeak.com`. Les balises canonical, les URL sociales, `sitemap.xml` et `robots.txt` utilisent déjà `https://thepeeak.com`. Cette refonte a été préparée et contrôlée localement. Sa disponibilité sur le domaine public et sa récupération par Google restent à vérifier après déploiement.

Après publication :

1. Configurer HTTPS et rediriger `www.thepeeak.com` vers `thepeeak.com` (ou l’inverse si l’éditeur choisit `www`, puis aligner toutes les URL canoniques et le sitemap).
2. Ajouter le domaine à Google Search Console et le vérifier via DNS. L’accès au compte de domaine/DNS ou à Search Console n’est pas disponible dans ce projet ; aucune propriété n’a donc été vérifiée et aucune soumission n’a encore été effectuée.
3. Dans Search Console, soumettre `https://thepeeak.com/sitemap.xml`, inspecter la page d’accueil et les pages de service, puis suivre les rapports d’indexation.
4. Une soumission aide Google à découvrir les pages mais ne garantit ni exploration immédiate, ni indexation, ni position.
5. Pour la visibilité locale, créer ou revendiquer un profil Google uniquement si l’activité remplit ses règles d’éligibilité, notamment un contact en personne avec les clients. Utiliser le nom réel, les catégories utiles, les horaires exacts et une adresse ou une zone desservie exacte. Une activité qui ne reçoit pas de clients à son adresse peut masquer cette adresse ; une adresse virtuelle ne convient pas. Les résultats locaux reposent entre autres sur la pertinence, la distance et la notoriété, sans classement garanti.

## GEO et moteurs de réponse

Pour Google AI Overviews et AI Mode, Google indique que les fondamentaux SEO s’appliquent et qu’il n’existe pas de balisage GEO ou de fichier spécial à ajouter. Les pages sont donc préparées autour d’informations lisibles, de réponses concrètes, de titres descriptifs, de coordonnées cohérentes et de contenu visible correspondant aux données structurées. Il faut publier des preuves réelles — cas clients autorisés, résultats mesurés, expertise et sources — au fur et à mesure qu’elles sont disponibles. Ne pas fabriquer d’avis, de références ou de chiffres.

Bing Webmaster Tools propose un tableau AI Performance pour observer les citations de pages sur Copilot et d’autres expériences prises en charge. IndexNow peut notifier les moteurs participants lorsqu’une page est ajoutée, modifiée ou supprimée ; ce signal ne garantit pas l’exploration, l’indexation ou une citation et ne soumet pas les pages à Google. Pour ce site statique, l’activer nécessiterait une clé publique hébergée à la racine du domaine et des notifications lors des mises à jour. C’est une option après publication, pas une condition SEO.

La page Réalisations charge son contenu depuis Supabase côté navigateur. Pour une indexation complète des fiches de projet, les pages des projets devront être rendues en HTML accessible aux robots ou pré-générées, en plus du rendu dynamique actuel.

## Limites de référencement

Le référencement et la présence dans les réponses génératives ne peuvent garantir un nombre de clients, un classement ou une apparition. Les performances dépendent notamment du domaine, de son historique, de l’indexation, de la concurrence et de la qualité des preuves et contenus publiés.

## Mise à jour éditoriale — 3 octobre 2026

Le sitemap comprend désormais 15 URL publiques, dont le hub de guides et ses trois articles. Les pages de connexion, administration et espace client restent hors sitemap. Les dates de modification correspondent à cette refonte, pas à une actualisation automatique quotidienne.

### Déployer et déclarer le domaine final

1. Mettre les fichiers publics du site directement à la racine du `public_html` associé à **thepeeak.com**. Le fichier `index.html` doit être à ce niveau. Utiliser l’hébergement statique/PHP et le gestionnaire de fichiers, pas la détection d’une application Node.
2. Activer le certificat HTTPS dans Hostinger ; conserver une seule version canonique `https://thepeeak.com` et rediriger les autres variantes après vérification de la configuration réelle de l’hébergement.
3. Ouvrir `https://thepeeak.com/sitemap.xml` et `https://thepeeak.com/robots.txt`. Les pages listées doivent répondre 200 et afficher le contenu attendu.
4. Dans [Google Search Console](https://search.google.com/search-console), ajouter une propriété **Domaine** `thepeeak.com`. Copier le TXT de validation fourni par Google dans la zone DNS réellement autoritaire (Hostinger seulement si les serveurs de noms y pointent). Conserver les enregistrements de messagerie existants. Revenir cliquer sur Vérifier après propagation.
5. Dans Sitemaps, envoyer `https://thepeeak.com/sitemap.xml`. Inspecter l’accueil, les six prestations et les guides ; demander l’indexation des pages importantes. Ne pas soumettre les pages privées.
6. Dans [Bing Webmaster Tools](https://www.bing.com/webmasters/), ajouter le site ou importer la propriété Search Console ; soumettre le même sitemap. Consulter AI Performance si le tableau est disponible pour observer les URL citées et les requêtes d’ancrage ; ces données de citation ne sont pas des positions de classement.
7. Contrôler les canonical, résultats enrichis et performances sur le domaine public. Les données structurées décrivent le contenu visible ; aucun classement ni affichage enrichi n’est garanti.
8. Suivre chaque mois impressions, clics, requêtes, pages de destination et demandes qualifiées. Comparer les demandes reçues par formulaire et WhatsApp sans publier de données personnelles.

### GEO et preuves

Il n’existe pas de guichet universel d’« inscription GEO ». Les réponses utiles, l’identité cohérente, les informations crawlables, les sources et les références authentiques sont prioritaires. Ne pas acheter de fausses citations, ne pas créer de fausses implantations locales. Un fichier `llms.txt` n’est pas une condition d’apparition dans les réponses IA Google.

### Éligibilité à une fiche locale

Google demande un contact en personne avec les clients pour un profil d’établissement. Si THEPEEAK reçoit des clients dans un local réel, utiliser son adresse exacte ; si l’équipe se déplace chez les clients, déclarer une zone desservie et masquer l’adresse si elle ne reçoit pas de visiteurs. Une activité exclusivement en ligne ne doit pas créer de fiche. Vérifier les coordonnées et horaires avant publication et répondre aux avis de façon authentique.

Références officielles : [Google et les fonctionnalités IA](https://developers.google.com/search/docs/appearance/ai-features), [construction d’un sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [éligibilité et règles Google Business Profile](https://support.google.com/business/answer/3038177), [AI Performance dans Bing Webmaster Tools](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/), [configuration d’IndexNow](https://www2.bing.com/indexnow/getstarted).

Cette préparation locale ne valide pas la propriété Search Console, n’envoie pas le sitemap à votre place et ne déploie pas le site. Ces étapes demandent l’accès au domaine et aux comptes concernés.

### Correctif de lecture du catalogue

Le 3 octobre 2026, la règle RLS de lecture du portfolio et du catalogue a été corrigée dans le projet Supabase existant. Les visiteurs anonymes lisent les contenus publiés ; les fonctions d’administration restent réservées aux sessions authentifiées. Vérification : une réalisation publiée visible, zéro brouillon et zéro produit privé visible. La protection des mots de passe compromis est signalée désactivée par l’audit Supabase ; voir [le réglage officiel](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). Ce réglage n’a pas été modifié.
