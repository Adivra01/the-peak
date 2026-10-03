# Vérification de la refonte THEPEEAK — 3 octobre 2026

## Périmètre

Accueil, six services, contact, guides (hub + trois articles), réalisations, sites à vendre et habillage des politiques. Les espaces admin/client et leur logique de facturation/authentification n’ont pas été refondus dans cette intervention.

## Contrôles réalisés

- 14 pages contrôlées automatiquement : un H1 par page, identifiants uniques, JSON-LD valide, 534 liens et ressources internes sans cible manquante. Contrôle distinct des 15 URL du sitemap.
- Six services : 7 FAQ chacune ; contrôle de largeur à 320, 768 et 1440 px, sans débordement horizontal détecté.
- Accueil, contact, réalisations, catalogue, politiques et guides : contrôle à 320 et 768 px sans débordement horizontal détecté.
- Menu mobile : ouverture, navigation et fermeture ; orientation du besoin vers service et formulaire ; service/objet correctement préremplis et modifiables.
- FAQ : ouverture de la réponse sur le délai vitrine, texte 48–72 heures présent.
- Portfolio : filtres, fenêtre de détails, fermeture, image chargée avec `object-fit: contain`.
- Code JavaScript de la nouvelle interface et du portfolio : syntaxe vérifiée avec Node.
- Session de prévisualisation HTTP locale. Aucun envoi réel de formulaire, e-mail ou WhatsApp lors de ces contrôles.

## Correctif de production Supabase

La lecture anonyme échouait avec `permission denied for function is_admin`. Les règles SELECT anonymes sont maintenant séparées des règles authentifiées. Les règles d’écriture et les données n’ont pas été modifiées. Test sous rôle `anon` : 1 réalisation publiée visible, 0 brouillon, 0 produit privé ou vendu. Migration distante : `20261003150155_fix_anon_published_catalog_read` ; copie locale créée via CLI avec l’identifiant distant indiqué en commentaire.

## À vérifier sur le domaine publié

- DNS, HTTPS, redirections, Search Console/Bing et récupération du sitemap.
- Performances réelles et Core Web Vitals : aucun score Lighthouse ou résultat terrain n’est revendiqué.
- Remplacer la réalisation de test actuellement publiée par un cas réel autorisé. Aucun avis ni résultat client n’a été fabriqué.
- Parcours connecté complet, commandes, factures, envois et téléversements : hors de ces tests de refonte éditoriale. Les fonctionnalités existantes sont conservées, mais ce rapport ne constitue pas une nouvelle recette de ces parcours.
- Le portfolio reste dynamique. Pour référencer chaque réalisation individuellement, prévoir des fiches HTML publiques lorsque les vrais cas sont prêts.
- Audit Supabase : protection contre les mots de passe compromis désactivée, réglage non modifié. Documentation : https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
