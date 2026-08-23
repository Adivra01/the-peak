# 🎫 Guide d'intégration — Validation de billets via API externe (Tuscan ou autre)

## 1. Architecture sécurisée

```
┌──────────────────┐         HTTPS POST          ┌─────────────────────────┐
│  App Tuscan       │ ──────────────────────────▶ │  Edge Function          │
│  (scanner QR)     │                             │  /validate-ticket       │
│                   │ ◀────────────────────────── │                         │
│  Affiche résultat │         JSON response       │  Lit/modifie la table   │
└──────────────────┘                              │  public.tickets         │
                                                  └─────────────────────────┘

⚠️ Un téléphone standard scannant le QR code ne verra qu'un code brut
   inutilisable (ex: TKT-6A668601). Aucune donnée client n'est exposée.
```

---

## 2. Contenu du QR code

Chaque billet génère un QR code contenant **uniquement le code brut** du billet :

```
TKT-XXXXXXXX
```

> **Sécurité** : Le QR ne contient **aucune URL** et **aucune donnée personnelle**.
> Un téléphone standard qui scanne ce QR verra uniquement une chaîne de caractères sans signification.
> Seule l'application dédiée (Tuscan ou autre) sait interpréter ce code via l'API.

---

## 3. Endpoint API

### URL

```
POST https://fjmprtqglmmlmgdddkoq.supabase.co/functions/v1/validate-ticket
```

### Headers requis

| Header         | Valeur |
|----------------|--------|
| `Content-Type` | `application/json` |
| `Authorization`| `Bearer <ANON_KEY>` |
| `apikey`       | `<ANON_KEY>` |

> Clé publique (anon key) — pas de secret à protéger côté headers.

---

## 4. Corps de la requête (JSON)

### Option A — Vérifier ET valider le billet (marquer comme utilisé)

```json
{
  "qr_data": "TKT-XXXXXXXX",
  "action": "mark_used"
}
```

### Option B — Vérifier uniquement (sans marquer comme utilisé)

```json
{
  "qr_data": "TKT-XXXXXXXX"
}
```

> `qr_data` accepte le code brut tel que lu par le scanner QR.

---

## 5. Réponses de l'API

### ✅ Billet validé avec succès (1er scan)

```json
{
  "valid": true,
  "message": "Accès autorisé ✅ Billet validé",
  "used_at": "2026-03-06T10:30:00.000Z",
  "ticket_info": {
    "ticket_code": "TKT-6A668601",
    "event_name": "DIABISSE VOYAGE",
    "event_date": "2026-03-06",
    "event_time": "09:00:00",
    "event_location": "ZIGUINCHOR",
    "ticket_type": "VIP",
    "price": 270,
    "customer_name": "Adiaratou Toure",
    "customer_phone": "+22375329164",
    "status": "used"
  }
}
```

### ❌ Billet déjà utilisé (2e scan et suivants)

```json
{
  "valid": false,
  "message": "Billet déjà utilisé",
  "used_at": "2026-03-06T10:30:00.000Z",
  "ticket_info": { "..." }
}
```

### ❌ Mauvaise date (pas le jour de l'événement)

```json
{
  "valid": false,
  "message": "Billet non valide pour cette date. Valable uniquement le 6 mars 2026",
  "ticket_info": { "..." }
}
```

### ❌ Billet introuvable

```json
{
  "valid": false,
  "message": "Billet introuvable"
}
```

### ❌ Billet annulé

```json
{
  "valid": false,
  "message": "Billet annulé",
  "ticket_info": { "..." }
}
```

---

## 6. Sécurité anti-fraude

| Menace | Protection |
|--------|-----------|
| Téléphone standard scanne le QR | Ne voit qu'un code brut (`TKT-XXXXXXXX`) — aucune donnée exploitable |
| Tentative d'accès via navigateur web | La page `/ticket/TKT-...` affiche "Accès non autorisé" sans aucune donnée |
| Double scan du même billet | Mise à jour atomique — seul le 1er scan valide, les suivants → "Déjà utilisé" |
| Scan un jour différent de l'événement | Refusé — validation uniquement le jour exact |
| Billet annulé | Refusé avec message explicite |

---

## 7. Logique de validation

1. L'application scanne le QR → obtient `TKT-XXXXXXXX`
2. Envoie un `POST` à l'API avec `action: "mark_used"`
3. L'API cherche le billet par `ticket_code`
4. Si `status = 'used'` → "Déjà utilisé"
5. Si `status = 'cancelled'` → "Annulé"
6. Si `event_date ≠ aujourd'hui` → "Mauvaise date"
7. Si tout OK → UPDATE atomique : `status = 'used'`, `used_at = now()`
8. Retourne les infos du billet au contrôleur

> **Atomicité** : Même si deux scanners valident le même billet simultanément, un seul passera.

---

## 8. Exemple d'intégration (pseudo-code Python)

```python
import requests

API_URL = "https://fjmprtqglmmlmgdddkoq.supabase.co/functions/v1/validate-ticket"
ANON_KEY = "<ANON_KEY>"

def scanner_billet(qr_data: str):
    response = requests.post(
        API_URL,
        json={"qr_data": qr_data, "action": "mark_used"},
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {ANON_KEY}",
            "apikey": ANON_KEY
        }
    )
    result = response.json()
    
    if result.get("valid"):
        print(f"✅ ACCÈS AUTORISÉ — {result['ticket_info']['customer_name']}")
    else:
        print(f"❌ ACCÈS REFUSÉ — {result['message']}")
    
    return result

# Le scanner lit "TKT-6A668601" depuis le QR
scanner_billet("TKT-6A668601")
```

---

## 9. Résumé

| Étape | Action |
|-------|--------|
| 1     | Le scanner lit le QR → obtient `TKT-XXXXXXXX` (code brut) |
| 2     | L'app envoie un `POST` à l'API avec `action: "mark_used"` |
| 3     | L'API vérifie le billet, le statut, la date |
| 4     | Si OK → statut passe à `used` |
| 5     | L'API retourne `valid: true/false` avec les détails |
| 6     | Un 2e scan → toujours `valid: false, "Billet déjà utilisé"` |
| 7     | Un téléphone standard → ne voit rien d'exploitable |
