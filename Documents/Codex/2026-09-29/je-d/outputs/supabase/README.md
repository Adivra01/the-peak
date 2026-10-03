# THEPEEAK · Supabase

Le site utilise exclusivement le nouveau projet Supabase `bntsczbnrehkqmbbvtci`. La clé publiée dans `assets/supabase-config.js` est une clé **publishable** prévue pour le navigateur; aucune clé `service_role` n’est nécessaire côté site.

Les migrations datées de `supabase/migrations/` ont été appliquées au projet via l’intégration Supabase. Elles créent Auth/profils, demandes, projets clients, actualités de projet, catégories/réalisations, produits à vendre, factures, Storage et règles RLS. La sécurité de l’espace client repose sur `auth.uid()` et les administrateurs sont identifiés par `profiles.role`.

## Premier compte administrateur

1. Créer un compte depuis `connexion.html` avec l’adresse qui administrera le site, puis confirmer le lien reçu par e-mail.
2. Dans le SQL Editor du projet Supabase, remplacer l’adresse ci-dessous par cette adresse, puis exécuter la requête :

```sql
update public.profiles
set role = 'admin'
where lower(email) = lower('votre-adresse@exemple.com');
```

Le formulaire public ne permet pas de s’attribuer ce rôle. Le rôle est ensuite utilisé pour protéger l’admin, les fichiers portfolio, les demandes et la gestion des projets clients.

## Mise en service de l’authentification

Dans Supabase Dashboard → Authentication → URL Configuration, définir l’URL du site après déploiement et ajouter les URL de redirection autorisées (dont `connexion.html`). Le formulaire de contact enregistre les demandes dans Supabase et envoie une notification à Formspree (`mpwyoyln`). Vérifier que cette destination transfère bien les demandes vers l’adresse de contact souhaitée.

Le changement de mot de passe fonctionne depuis **Mon profil · Paramètres** pour tout compte connecté; le lien « Mot de passe oublié » utilise le flux de récupération Auth Supabase. Pour envoyer les e-mails de confirmation/récupération depuis `contact@thepeeak.com`, Supabase demande un SMTP personnalisé : les paramètres de ce compte (hôte, identifiant, mot de passe/app-password, expéditeur) ne sont pas présents dans le projet. Le SMTP gratuit intégré par Supabase n’envoie qu’aux adresses autorisées de l’équipe et n’est pas un relais de production. Option gratuite adaptée à faible volume : Resend indique actuellement une offre gratuite de 3 000 e-mails/mois, plafonnée à 100/jour et trois domaines. Pour envoyer en tant que `contact@thepeeak.com`, il faut ajouter puis vérifier `thepeeak.com` dans Resend, publier les enregistrements DNS demandés, récupérer ses paramètres SMTP et les saisir dans Authentication → SMTP Settings de Supabase. Supabase n’acceptera pas de message d’auth vers n’importe quelle adresse avec son SMTP intégré gratuit : il est limité aux adresses autorisées de l’équipe et à un faible quota. Aucun secret SMTP n’est enregistré dans les fichiers du site. Voir [offre Resend](https://resend.com/pricing) et [configuration SMTP Supabase](https://supabase.com/docs/guides/auth/auth-smtp).

## Tables et médias

- `profiles`: profil, adresse e-mail et rôle du compte.
- `service_requests`: demandes de contact entrantes.
- `client_projects`, `project_updates`: projets, progression, étapes et nouvelles visibles dans l’espace client.
- `portfolio_categories`, `portfolio_projects`: catégories et projets publiés.
- `digital_products`: catalogue de sites/produits à vendre, prix, description, démo et médias.
- `invoices`: factures et lignes flexibles en XOF, avec numérotation automatique; lecture et gestion réservées aux administrateurs.
- Storage `peak-portfolio`: visuels publics; écriture réservée aux administrateurs.
- Storage `peak-client-files`: espace privé cloisonné par identifiant de compte.

Les fichiers de migration restent la référence versionnée pour recréer le schéma.

La migration `20260929213000_invoice_payment_date.sql` ajoute `paid_on` pour enregistrer et afficher la date de règlement d'une facture.
