# Confirmation de paiement Chariow

Africademia utilise un seul Pulse Chariow pour confirmer les paiements de toutes les formations.

URL HTTPS à renseigner dans **Automatisations → Pulses** :

```text
POST https://votre-domaine.com/api/webhooks/chariow
```

Sélectionnez l’événement **Vente réussie** (`successful.sale`) et laissez le filtre produit vide pour couvrir tout le catalogue. Copiez ensuite le secret `whsec_…` du Pulse dans :

```text
CHARIOW_PULSE_SECRET=whsec_…
CHARIOW_STORE_ID=store_itj9793a23b3
```

Le webhook vérifie le HMAC-SHA256 du corps brut reçu dans `x-chariow-signature`, puis déduplique les réessais avec `x-pulse-delivery-id`.

## Association produit → formation

L’association est recherchée dans cet ordre :

1. `sale.custom_metadata.formation_slug` ;
2. l’ID du produit Chariow configuré dans **Administration → Formations** ;
3. le nom exact du produit, comparé au titre de la formation.

Exemple de métadonnée recommandée :

```json
{
  "formation_slug": "musique-ia"
}
```

Après une vente confirmée :

- le client est retrouvé ou créé comme profil invité ;
- l’achat est enregistré avec le statut `paid` ;
- la formation apparaît dans son historique ;
- il peut activer son compte avec la même adresse e-mail.

Le MCP public de la boutique est :

```text
https://mcp.chariow.com/public/?store=store_itj9793a23b3
```

Ce MCP nécessite une autorisation OAuth Chariow. Il sert à consulter et administrer la boutique ; la confirmation automatique des paiements repose sur le Pulse signé ci-dessus.
