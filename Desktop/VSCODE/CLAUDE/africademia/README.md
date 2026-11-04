# Africademia

Refonte centrée exclusivement sur deux activités : les formations et l’incubateur.

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrez ensuite `http://localhost:3000`.

## Production

```bash
npm run build
npm start
```

## Contenu

- `/` — accueil
- `/formations` — catalogue
- `/formations/[slug]` — fiches détaillées
- `/incubateur` — programme et candidature
- `/connexion` et `/inscription` — authentification
- `/espace` — tableau de bord client
- `/admin` — tableau de bord administrateur

Les formations sont centralisées dans `lib/data.ts` pour faciliter les mises à jour.

## Base de données et inscriptions

La plateforme utilise SQLite. La base `data/africademia.db` est créée automatiquement au premier démarrage. Copiez `.env.example` vers `.env.local` pour définir le compte administrateur.

Toutes les demandes d’inscription et les candidatures sont dirigées vers WhatsApp au `+226 69 65 66 10`. Aucun lien de paiement n’est affiché sur le site.

Les paiements effectués ensuite sur Chariow sont confirmés par un Pulse signé unique : `POST /api/webhooks/chariow`. Le guide de configuration se trouve dans `WEBHOOK.md`. L’identifiant du produit Chariow peut être associé à chaque formation depuis l’administration.

La table `formations` permet d’activer sans modifier le code :

- le lien du workbook (`workbook_url`) ;
- le tarif affiché (`price_label`) ;
- l’ouverture des inscriptions (`enrollment_open`).

La route `/api/health/db` vérifie l’état de SQLite.

En développement uniquement, deux comptes de démonstration sont créés :

- `admin@africademia.local` / `Africademia2026!`
- `client@africademia.local` / `Client2026!`

Ils sont désactivables avec `SEED_DEMO_ACCOUNTS=false`.
