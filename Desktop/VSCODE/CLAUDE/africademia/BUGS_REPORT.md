# AFRICADEMIA — Rapport de Bugs & Problèmes
> Généré par Playwright (162 tests, Chromium) — 2026-06-15
> **Résultat global : 151 ✓ passés / 8 ✘ échecs (5 bugs réels + 3 erreurs de test)**

---

## ────────────────────────────────────────────────
## 🔴 BUGS CRITIQUES (impactent directement l'utilisateur)
## ────────────────────────────────────────────────

### BUG-01 — Erreurs HTTP 500 Supabase sur 3 pages
**Fichiers :** `js/db.js`, `js/config.js`
**Pages affectées :** Accueil (2× erreurs), Formations (1× erreur), Service Detail (1× erreur)
**Symptôme :**
```
console.error: Failed to load resource: the server responded with a status of 500 ()
```
**Cause :** Le projet Supabase (`wnvsrjsjjnyitxiexztq`) retourne HTTP 500 lors des requêtes
de données (formations, projets vente, services). Soit les tables n'ont pas été migrées,
soit le projet est suspendu ou la clé API est expirée.
**Impact utilisateur :** Les données dynamiques (formations, sites à vendre) se chargent
depuis le fallback statique au lieu de la base de données réelle. Des erreurs muettes
se produisent en arrière-plan sans feedback visible.
**Correction nécessaire :**
- Vérifier que les migrations Supabase 001–005 ont bien été exécutées
- Vérifier le statut du projet Supabase sur le dashboard
- Ajouter un `try/catch` avec message d'erreur visible si Supabase est indisponible

---

### BUG-02 — Bouton play vidéo (Sites à vendre) non fonctionnel
**Fichier :** `direction-afromodern.html` ligne ~1102
**Symptôme :** Le bouton ▶ sur les cartes "Sites à vendre" s'affiche mais ne joue pas la vidéo.
Cliquer dessus redirige vers la page de détail du projet au lieu d'ouvrir la modal vidéo.
**Cause :** Le HTML généré dynamiquement crée le bouton sans `onclick` :
```html
<!-- ACTUEL (cassé) -->
<div class="vente-play"><div class="vente-play-btn"><i class="ri-play-fill"></i></div></div>

<!-- CORRIGÉ -->
<div class="vente-play" onclick="event.stopPropagation(); openVideoModal('${p.video_url}')">
  <div class="vente-play-btn"><i class="ri-play-fill"></i></div>
</div>
```
La fonction `openVideoModal(url)` est définie mais jamais appelée.
**Impact utilisateur :** Fonctionnalité preview vidéo complètement cassée.
**Correction :** Ajouter `onclick="event.stopPropagation(); openVideoModal('${p.video_url}')"` sur `.vente-play`

---

### BUG-03 — Formulaire Connexion : boutons sans `type="submit"`
**Fichier :** `connexion.html` lignes 111, 154
**Symptôme :** Les boutons "Se connecter" et "Créer mon compte" n'ont pas `type="submit"`.
Ils utilisent uniquement `onclick="doLogin()"` / `onclick="doRegister()"`.
**Cause :**
```html
<!-- ACTUEL (problématique) -->
<button class="sbtn" id="l-btn" onclick="doLogin()">Se connecter</button>

<!-- CORRIGÉ -->
<button class="sbtn" id="l-btn" type="submit" onclick="doLogin()">Se connecter</button>
```
**Impact utilisateur :**
- La touche **Entrée** dans les champs email/mot de passe ne soumet pas le formulaire
- Certains gestionnaires de mots de passe ne reconnaissent pas le formulaire
- Échec accessibilité : les lecteurs d'écran ne détectent pas le bouton comme "submit"
**Correction :** Ajouter `type="submit"` aux 2 boutons de soumission

---

## ────────────────────────────────────────────────
## 🟠 BUGS MINEURS (impactent l'expérience mais non bloquants)
## ────────────────────────────────────────────────

### BUG-04 — Incohérence numéro de contact WhatsApp / JSON-LD
**Fichiers :** `js/config.js` ligne 9, `direction-afromodern.html` JSON-LD
**Symptôme :**
- WhatsApp configuré : `22369656610` → indicatif **+223** (Mali)
- JSON-LD Schema.org : `"+221 77 000 00 00"` → indicatif **+221** (Sénégal)
- Site basé à Dakar → indicatif attendu **+221** (Sénégal)
**Impact :** Les clients cherchant à contacter via le JSON-LD Schema (Google) obtiennent
un numéro sénégalais, mais le lien WhatsApp du site pointe vers un numéro malien.
**Correction :** Harmoniser les numéros ou confirmer le bon numéro dans `config.js`
```js
// Si le numéro correct est malien (+223) :
"telephone": "+223 69 65 66 10"  // dans JSON-LD

// Si le numéro correct est sénégalais (+221) :
whatsapp: '221XXXXXXXX'  // dans config.js
```

---

### BUG-05 — Classe CSS `.hero-cta` partagée entre deux sections
**Fichier :** `src/css/direction-afromodern.css`
**Symptôme :** La classe `.hero-cta` est utilisée dans le Hero ET dans la section End CTA
(#contact). Les sélecteurs CSS globaux touchent les 2 zones simultanément.
**Cause :** Le HTML de `#contact` réutilise `<div class="hero-cta">` au lieu d'une
classe dédiée (ex: `.endcta-cta`).
**Impact :** Ambiguïté sélecteur, style maintenu en double si on modifie l'un ou l'autre.
Pas d'impact visuel immédiat mais fragilise la maintenabilité.
**Correction :** Renommer en `.endcta-btns` dans le HTML et CSS de la section contact

---

## ────────────────────────────────────────────────
## 🟡 PROBLÈMES DE PERFORMANCE
## ────────────────────────────────────────────────

### PERF-01 — 4 dépendances CDN externes bloquantes au chargement
**Fichier :** `direction-afromodern.html` `<head>`
**Ressources concernées :**
- `fonts.googleapis.com` — Google Fonts (Bricolage Grotesque + Hanken Grotesk)
- `cdn.jsdelivr.net` — RemixIcon CSS
- `cdnjs.cloudflare.com` — GSAP + ScrollTrigger
- `unpkg.com` — Lenis smooth scroll
**Impact :** Si l'un de ces CDN est lent (fréquent en Afrique), la page peut mettre
>10s à devenir interactive. Le loader reste affiché longtemps.
**Recommandation :** Auto-héberger GSAP, Lenis et RemixIcon dans `dist/assets/`.
Pour les fonts, utiliser `font-display: swap` (déjà en place dans le lien Google Fonts).

---

### PERF-02 — Animations GSAP peuvent bloquer sur connexion lente
**Fichier :** `direction-afromodern.html` (script inline)
**Symptôme :** Les cartes du Hero Art (`#haV`, `#haR`) dépendent de GSAP pour être
visibles (`opacity:0` par défaut en CSS). Si GSAP ne charge pas (CDN inaccessible),
les cartes restent invisibles indéfiniment.
**Recommandation :** Ajouter un fallback CSS :
```css
/* Si GSAP non chargé, les cartes restent visibles */
.ha-card { opacity: 1 }  /* surcharge après délai */
```
Ou déclencher un `setTimeout` de secours pour forcer `opacity:1` après 5s.

---

## ────────────────────────────────────────────────
## ✅ CE QUI FONCTIONNE PARFAITEMENT (151 tests passés)
## ────────────────────────────────────────────────

- Toutes les pages HTML chargent en HTTP 200 (13 pages)
- SEO complet : title, description, canonical, robots sur toutes les pages
- Open Graph 6 propriétés + Twitter Card + JSON-LD Organization/WebSite
- noindex sur admin/espace-client/connexion ✓
- sitemap.xml + robots.txt accessibles ✓
- Navigation desktop (logo, liens, CTA, scroll "scrolled") ✓
- Navigation mobile : burger ouvre/ferme, ferme au scroll, liens corrects ✓
- Hero H1 (4 lignes animées), subtitle, trust badge, 3 stats ✓
- Hero art : phone visible, cartes haV et haR dans le viewport ✓
- Cartes haIa et haN masquées sur mobile ≤640px ✓ (fix appliqué)
- haC masquée sur ≤980px ✓ (fix appliqué)
- Phone mockup non coupé sur tous les viewports ✓ (fix appliqué)
- Ticker marquee (2 tracks loop) ✓
- Service slider : Next/Prev/Dots/boucle/compteur tous fonctionnels ✓
- Grille formations se remplit depuis données locales (6 cartes) ✓
- Carte CTA "Voir toutes les formations" → formations.html ✓
- Section Sites à vendre : grille chargée (fallback statique) ✓
- Incubateur : 3 étapes, 4 pills, 4 conditions ✓
- FAQ : 5 items, toggle ouvert/fermé, un seul item ouvert à la fois ✓
- End CTA : 2 boutons présents ✓
- Footer : 3 colonnes, mentions légales, liens non vides ✓
- Pages services : H1 présent, nav présente ✓
- Connexion : 2 onglets (login + register) ✓
- lang="fr", charset=UTF-8, viewport, aria-label burger ✓
- Loader disparaît en < 4s ✓
- CSS variables chargées (--gold etc.) ✓
- GSAP chargé ✓
- Aucune ressource CSS/JS en 404 ✓
- Zéro scroll horizontal sur 375/390/412/768px ✓
- H1, CTA, footer visibles sur tous les viewports mobiles ✓
- Mission + signature + marquee (2 tracks) ✓
- Video modal présente et masquée par défaut ✓

---

## ────────────────────────────────────────────────
## 📋 RÉCAPITULATIF PRIORITÉS
## ────────────────────────────────────────────────

| # | Sévérité | Bug | Fichier |
|---|----------|-----|---------|
| BUG-01 | 🔴 Critique | Erreurs 500 Supabase | js/db.js, config.js |
| BUG-02 | 🔴 Critique | Play vidéo non fonctionnel | direction-afromodern.html |
| BUG-03 | 🔴 Critique | Boutons form sans type=submit | connexion.html |
| BUG-04 | 🟠 Mineur | Incohérence numéro WhatsApp | config.js / JSON-LD |
| BUG-05 | 🟠 Mineur | Classe .hero-cta partagée | CSS + HTML |
| PERF-01 | 🟡 Perf | 4 CDN externes bloquants | direction-afromodern.html |
| PERF-02 | 🟡 Perf | GSAP sans fallback | direction-afromodern.html |

---

*Testé sur : Chromium desktop (1280×800) + mobile iPhone SE 375px, iPhone 14 390px, Galaxy S21 412px, iPad mini 768px*
