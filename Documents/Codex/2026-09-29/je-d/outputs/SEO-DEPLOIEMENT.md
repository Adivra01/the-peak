# SEO, Google Search et GEO

## Modifications préparées

- Les six pages de service ont un titre, une description, un H1, des sections, une FAQ visible et des données structurées propres à leur sujet.
- Les pages de service distinguent leurs livrables et leur méthode, et les liens de contact transmettent le service avec une demande WhatsApp contextualisée.
- Les listes de mots-clés visibles qui ressemblaient à du bourrage ont été remplacées par une information de zone de service lisible. Les balises `meta keywords` ont été retirées : Google Search ne les utilise pas.
- La page d’accueil déclare l’activité et les zones desservies (Bamako et Mali). Les pages publiques sont configurées pour l’indexation ; l’administration et les espaces de compte sont en `noindex`.
- `robots.txt` laisse les pages explorables ; les pages d’administration et de compte portent `noindex,nofollow` afin que Google puisse lire leur directive d’exclusion.

## Domaine et enregistrement Google

Le domaine prévu est `africademia.com`. Les balises canonical, les URL sociales, `sitemap.xml` et `robots.txt` utilisent déjà `https://africademia.com`. Le site n’étant pas encore hébergé, les URL ne répondent pas encore et le sitemap ne peut pas être récupéré par Google.

Après publication :

1. Configurer HTTPS et rediriger `www.africademia.com` vers `africademia.com` (ou l’inverse si l’éditeur choisit `www`, puis aligner toutes les URL canoniques et le sitemap).
2. Ajouter le domaine à Google Search Console et le vérifier via DNS. L’accès au compte de domaine/DNS ou à Search Console n’est pas disponible dans ce projet ; aucune propriété n’a donc été vérifiée et aucune soumission n’a encore été effectuée.
3. Dans Search Console, soumettre `https://africademia.com/sitemap.xml`, inspecter la page d’accueil et les pages de service, puis suivre les rapports d’indexation.
4. Une soumission aide Google à découvrir les pages mais ne garantit ni exploration immédiate, ni indexation, ni position.
5. Pour la visibilité locale, vérifier ou créer le profil d’établissement Google avec les coordonnées, catégories et zone réellement desservie. L’adresse et les horaires ne doivent être publiés qu’après confirmation des informations de l’entreprise.

## GEO et moteurs de réponse

Pour Google AI Overviews et AI Mode, Google indique que les fondamentaux SEO s’appliquent et qu’il n’existe pas de balisage GEO ou de fichier spécial à ajouter. Les pages sont donc préparées autour d’informations lisibles, de réponses concrètes, de titres descriptifs, de coordonnées cohérentes et de contenu visible correspondant aux données structurées. Il faut publier des preuves réelles — cas clients autorisés, résultats mesurés, expertise et sources — au fur et à mesure qu’elles sont disponibles. Ne pas fabriquer d’avis, de références ou de chiffres.

La page Réalisations charge son contenu depuis Supabase côté navigateur. Pour une indexation complète des fiches de projet, les pages des projets devront être rendues en HTML accessible aux robots ou pré-générées, en plus du rendu dynamique actuel.

## Limites de référencement

Le référencement et la présence dans les réponses génératives ne peuvent garantir un nombre de clients, un classement ou une apparition. Les performances dépendent notamment du domaine, de son historique, de l’indexation, de la concurrence et de la qualité des preuves et contenus publiés.
