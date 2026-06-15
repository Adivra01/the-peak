# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: africademia-full.spec.js >> 18. Erreurs JavaScript >> Pas d'erreur JS — Formations
- Location: tests/africademia-full.spec.js:928:5

# Error details

```
Error: Erreurs JS sur Formations : console.error: Failed to load resource: the server responded with a status of 500 ()

expect(received).toHaveLength(expected)

Expected length: 0
Received length: 1
Received array:  ["console.error: Failed to load resource: the server responded with a status of 500 ()"]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e3]:
      - link "Africa demia" [ref=e4] [cursor=pointer]:
        - /url: direction-afromodern.html
        - text: Africa
        - generic [ref=e6]: demia
      - generic [ref=e7]:
        - link "Accueil" [ref=e8] [cursor=pointer]:
          - /url: direction-afromodern.html
        - link "Formations" [ref=e9] [cursor=pointer]:
          - /url: formations.html
        - link "Notre histoire" [ref=e10] [cursor=pointer]:
          - /url: notre-histoire.html
      - generic [ref=e11]:
        - link " Connexion" [ref=e12] [cursor=pointer]:
          - /url: connexion.html
          - generic [ref=e13]: 
          - generic [ref=e14]: Connexion
        - link "Démarrer un projet" [ref=e15] [cursor=pointer]:
          - /url: direction-afromodern.html#contact
        - text: 
  - banner [ref=e16]:
    - generic [ref=e18]:
      - generic [ref=e19]:
        - generic [ref=e20]: Catalogue formations
        - heading "Apprenez. Lancez. Encaissez." [level=1] [ref=e22]:
          - text: Apprenez.
          - text: Lancez.
          - text: Encaissez.
        - paragraph [ref=e23]: Des formations à prix fixe et paiement direct. Du PDF complet aux sessions live — vous choisissez votre rythme.
        - generic [ref=e24]:
          - generic [ref=e25]: 
          - textbox "Rechercher une formation…" [ref=e26]
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]:
            - generic [ref=e30]: "5"
            - generic [ref=e31]: Formations
          - generic [ref=e32]:
            - generic [ref=e33]: "2"
            - generic [ref=e34]: Séances live
          - generic [ref=e35]:
            - generic [ref=e36]: "3"
            - generic [ref=e37]: Modules PDF
          - generic [ref=e38]:
            - generic [ref=e39]: 100%
            - generic [ref=e40]: Sur-mesure
        - generic [ref=e41]: Accès immédiat dès le paiement · Prix fixes
  - generic [ref=e43]:
    - generic [ref=e44] [cursor=pointer]: Toutes 5
    - generic [ref=e45] [cursor=pointer]: Live 2
    - generic [ref=e46] [cursor=pointer]: PDF 3
    - generic [ref=e47] [cursor=pointer]: Web 1
    - generic [ref=e48] [cursor=pointer]: IA 1
    - generic [ref=e49] [cursor=pointer]: Business 3
  - main [ref=e50]:
    - generic [ref=e51]:
      - generic [ref=e52]:
        - generic [ref=e53]:
          - text: Recommandés pour vous
          - generic [ref=e54]: Sélection
        - generic [ref=e55]:
          - link " Débutant PDF Populaire Print On Demand Créez et vendez votre marque de vêtements en ligne sans jamais stocker une seule unité. 40 000 FCFA 25 000 FCFA 4 modules PDF Démarrer " [ref=e56] [cursor=pointer]:
            - /url: formation-detail.html?slug=print-on-demand&t=afro
            - generic: Print
            - generic [ref=e58]: 
            - generic [ref=e59]:
              - generic [ref=e60]: Débutant
              - generic [ref=e61]: PDF
              - generic [ref=e62]: Populaire
            - generic [ref=e63]: Print On Demand
            - generic [ref=e64]: Créez et vendez votre marque de vêtements en ligne sans jamais stocker une seule unité.
            - generic [ref=e65]:
              - generic [ref=e66]:
                - generic [ref=e67]: 40 000 FCFA
                - generic [ref=e68]: 25 000 FCFA
                - generic [ref=e69]: 4 modules PDF
              - generic [ref=e70]:
                - text: Démarrer
                - generic [ref=e71]: 
          - link " Débutant Live Live Sites Web avec l'IA Créez votre site web professionnel en 3 sessions accompagnées, même sans expérience technique. 45 000 FCFA 3 séances live d'1h Démarrer " [ref=e72] [cursor=pointer]:
            - /url: formation-detail.html?slug=sites-web-ia&t=afro
            - generic: Sites
            - generic [ref=e74]: 
            - generic [ref=e75]:
              - generic [ref=e76]: Débutant
              - generic [ref=e77]: Live
              - generic [ref=e78]: Live
            - generic [ref=e79]: Sites Web avec l'IA
            - generic [ref=e80]: Créez votre site web professionnel en 3 sessions accompagnées, même sans expérience technique.
            - generic [ref=e81]:
              - generic [ref=e82]:
                - generic [ref=e83]: 45 000 FCFA
                - generic [ref=e84]: 3 séances live d'1h
              - generic [ref=e85]:
                - text: Démarrer
                - generic [ref=e86]: 
      - generic [ref=e87]:
        - generic [ref=e88]: Toutes les formations
        - generic [ref=e89]:
          - link " Débutant PDF Populaire Print On Demand Créez et vendez votre marque de vêtements en ligne sans jamais stocker une seule unité. 40 000 FCFA 25 000 FCFA 4 modules PDF " [ref=e90] [cursor=pointer]:
            - /url: formation-detail.html?slug=print-on-demand&t=afro
            - generic [ref=e92]: 
            - generic [ref=e93]:
              - generic [ref=e94]: Débutant
              - generic [ref=e95]: PDF
              - generic [ref=e96]: Populaire
            - generic [ref=e97]: Print On Demand
            - generic [ref=e98]: Créez et vendez votre marque de vêtements en ligne sans jamais stocker une seule unité.
            - generic [ref=e99]:
              - generic [ref=e100]:
                - generic [ref=e101]: 40 000 FCFA
                - generic [ref=e102]: 25 000 FCFA
                - generic [ref=e103]: 4 modules PDF
              - generic [ref=e105]: 
          - link " Intermédiaire ● Live Nouveau Musique & IA Créez de la musique professionnelle avec l'IA et transformez-la en source de revenus durables. 35 000 FCFA 3 séances live " [ref=e106] [cursor=pointer]:
            - /url: formation-detail.html?slug=musique-ia&t=afro
            - generic [ref=e108]: 
            - generic [ref=e109]:
              - generic [ref=e110]: Intermédiaire
              - generic [ref=e111]: ● Live
              - generic [ref=e112]: Nouveau
            - generic [ref=e113]: Musique & IA
            - generic [ref=e114]: Créez de la musique professionnelle avec l'IA et transformez-la en source de revenus durables.
            - generic [ref=e115]:
              - generic [ref=e116]:
                - generic [ref=e117]: 35 000 FCFA
                - generic [ref=e118]: 3 séances live
              - generic [ref=e120]: 
          - link " Débutant PDF Produits Digitaux Ebooks, templates, tunnels de vente — créez une source de revenus 100% automatisée. 35 000 FCFA 20 000 FCFA 5 modules PDF " [ref=e121] [cursor=pointer]:
            - /url: formation-detail.html?slug=produits-digitaux&t=afro
            - generic [ref=e123]: 
            - generic [ref=e124]:
              - generic [ref=e125]: Débutant
              - generic [ref=e126]: PDF
            - generic [ref=e127]: Produits Digitaux
            - generic [ref=e128]: Ebooks, templates, tunnels de vente — créez une source de revenus 100% automatisée.
            - generic [ref=e129]:
              - generic [ref=e130]:
                - generic [ref=e131]: 35 000 FCFA
                - generic [ref=e132]: 20 000 FCFA
                - generic [ref=e133]: 5 modules PDF
              - generic [ref=e135]: 
          - link " Débutant ● Live Live Sites Web avec l'IA Créez votre site web professionnel en 3 sessions accompagnées, même sans expérience technique. 45 000 FCFA 3 séances live d'1h " [ref=e136] [cursor=pointer]:
            - /url: formation-detail.html?slug=sites-web-ia&t=afro
            - generic [ref=e138]: 
            - generic [ref=e139]:
              - generic [ref=e140]: Débutant
              - generic [ref=e141]: ● Live
              - generic [ref=e142]: Live
            - generic [ref=e143]: Sites Web avec l'IA
            - generic [ref=e144]: Créez votre site web professionnel en 3 sessions accompagnées, même sans expérience technique.
            - generic [ref=e145]:
              - generic [ref=e146]:
                - generic [ref=e147]: 45 000 FCFA
                - generic [ref=e148]: 3 séances live d'1h
              - generic [ref=e150]: 
          - link " Intermédiaire PDF Immobilier Locatif Maîtrisez les stratégies de sous-location et d'investissement immobilier rentable. 50 000 FCFA 30 000 FCFA 6 modules PDF " [ref=e151] [cursor=pointer]:
            - /url: formation-detail.html?slug=immobilier-locatif&t=afro
            - generic [ref=e153]: 
            - generic [ref=e154]:
              - generic [ref=e155]: Intermédiaire
              - generic [ref=e156]: PDF
            - generic [ref=e157]: Immobilier Locatif
            - generic [ref=e158]: Maîtrisez les stratégies de sous-location et d'investissement immobilier rentable.
            - generic [ref=e159]:
              - generic [ref=e160]:
                - generic [ref=e161]: 50 000 FCFA
                - generic [ref=e162]: 30 000 FCFA
                - generic [ref=e163]: 6 modules PDF
              - generic [ref=e165]: 
  - generic [ref=e167]:
    - heading "Pas sûr de quelle formation choisir ? On vous guide." [level=2] [ref=e168]:
      - text: Pas sûr de quelle
      - text: formation choisir ? On vous guide.
    - paragraph [ref=e169]: Décrivez votre situation à Khadidja — elle vous oriente vers la formation la plus adaptée à vos objectifs.
    - generic [ref=e170]:
      - link "Parler à Khadidja " [ref=e171] [cursor=pointer]:
        - /url: direction-afromodern.html#contact
        - text: Parler à Khadidja
        - generic [ref=e172]: 
      - link "Voir les services " [ref=e173] [cursor=pointer]:
        - /url: direction-afromodern.html
        - text: Voir les services
        - generic [ref=e174]: 
  - contentinfo [ref=e175]:
    - generic [ref=e177]:
      - generic [ref=e179]:
        - text: Africa
        - generic [ref=e181]: demia
      - generic [ref=e182]:
        - link "Accueil" [ref=e183] [cursor=pointer]:
          - /url: direction-afromodern.html
        - link "Notre histoire" [ref=e184] [cursor=pointer]:
          - /url: notre-histoire.html
        - link "Admin" [ref=e185] [cursor=pointer]:
          - /url: admin-formations.html
      - generic [ref=e186]: © 2025 Africademia
```

# Test source

```ts
  832  | test.describe('16. Accessibilité', () => {
  833  |   test('lang="fr" sur toutes les pages', async ({ page }) => {
  834  |     for (const p of PUBLIC_PAGES.slice(0, 5)) {
  835  |       await page.goto(p.url, { waitUntil: 'domcontentloaded' });
  836  |       const lang = await page.getAttribute('html', 'lang');
  837  |       expect(lang, `lang manquant sur ${p.name}`).toMatch(/^fr/);
  838  |     }
  839  |   });
  840  | 
  841  |   test('charset UTF-8 déclaré', async ({ page }) => {
  842  |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  843  |     const charset = await page.evaluate(() =>
  844  |       document.querySelector('meta[charset]')?.getAttribute('charset')
  845  |     );
  846  |     expect(charset?.toLowerCase()).toBe('utf-8');
  847  |   });
  848  | 
  849  |   test('Burger a aria-label', async ({ page }) => {
  850  |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  851  |     const label = await page.getAttribute('#navBurger', 'aria-label');
  852  |     expect(label).toBeTruthy();
  853  |   });
  854  | 
  855  |   test('viewport meta tag présent', async ({ page }) => {
  856  |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  857  |     const viewport = await page.getAttribute('meta[name="viewport"]', 'content');
  858  |     expect(viewport).toContain('width=device-width');
  859  |     expect(viewport).toContain('initial-scale=1');
  860  |   });
  861  | 
  862  |   test('Images avec loading=lazy', async ({ page }) => {
  863  |     await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  864  |     await page.waitForTimeout(1000);
  865  |     const imgs = page.locator('img[loading="lazy"]');
  866  |     const count = await imgs.count();
  867  |     // Si des images sont présentes (fallback sites à vendre), elles doivent être lazy
  868  |     const allImgs = await page.locator('img').count();
  869  |     if (allImgs > 0 && count === 0) {
  870  |       console.warn('Images présentes sans loading=lazy');
  871  |     }
  872  |   });
  873  | 
  874  |   test('Boutons ont des labels accessibles', async ({ page }) => {
  875  |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  876  |     const buttons = page.locator('button:not([aria-label]):not([aria-labelledby])');
  877  |     const count = await buttons.count();
  878  |     for (let i = 0; i < count; i++) {
  879  |       const txt = await buttons.nth(i).innerText();
  880  |       const label = await buttons.nth(i).getAttribute('aria-label');
  881  |       if (!label && !txt.trim()) {
  882  |         console.warn(`Bouton ${i} sans texte ni aria-label`);
  883  |       }
  884  |     }
  885  |   });
  886  | });
  887  | 
  888  | /* ═══════════════════════════════════════════════════════════════════════════
  889  |    17. PERFORMANCES
  890  | ═══════════════════════════════════════════════════════════════════════════ */
  891  | test.describe('17. Performance', () => {
  892  |   test('Loader disparaît en moins de 4s', async ({ page }) => {
  893  |     await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  894  |     await page.waitForTimeout(4000);
  895  |     const loader = page.locator('#afc-loader');
  896  |     const isVisible = await loader.isVisible();
  897  |     expect(isVisible, 'Loader encore visible après 4s').toBe(false);
  898  |   });
  899  | 
  900  |   test('Accueil charge en moins de 8s', async ({ page }) => {
  901  |     const start = Date.now();
  902  |     await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  903  |     const elapsed = Date.now() - start;
  904  |     expect(elapsed, `Trop lent : ${elapsed}ms`).toBeLessThan(8000);
  905  |   });
  906  | 
  907  |   test('CSS principal chargé (variables CSS accessibles)', async ({ page }) => {
  908  |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  909  |     const gold = await page.evaluate(() =>
  910  |       getComputedStyle(document.documentElement).getPropertyValue('--gold').trim()
  911  |     );
  912  |     expect(gold, 'Variables CSS non chargées (--gold manquante)').toBeTruthy();
  913  |   });
  914  | 
  915  |   test('GSAP chargé', async ({ page }) => {
  916  |     await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  917  |     await page.waitForTimeout(500);
  918  |     const gsap = await page.evaluate(() => typeof window.gsap !== 'undefined');
  919  |     expect(gsap, 'GSAP non chargé').toBe(true);
  920  |   });
  921  | });
  922  | 
  923  | /* ═══════════════════════════════════════════════════════════════════════════
  924  |    18. ERREURS JS CRITIQUES
  925  | ═══════════════════════════════════════════════════════════════════════════ */
  926  | test.describe('18. Erreurs JavaScript', () => {
  927  |   for (const p of PUBLIC_PAGES) {
  928  |     test(`Pas d'erreur JS — ${p.name}`, async ({ page }) => {
  929  |       const errs = collectErrors(page);
  930  |       await page.goto(p.url, { waitUntil: 'networkidle' });
  931  |       await page.waitForTimeout(1500);
> 932  |       expect(errs, `Erreurs JS sur ${p.name} : ${errs.join('; ')}`).toHaveLength(0);
       |                                                                     ^ Error: Erreurs JS sur Formations : console.error: Failed to load resource: the server responded with a status of 500 ()
  933  |     });
  934  |   }
  935  | });
  936  | 
  937  | /* ═══════════════════════════════════════════════════════════════════════════
  938  |    19. RESSOURCES 404 (assets CSS/JS)
  939  | ═══════════════════════════════════════════════════════════════════════════ */
  940  | test.describe('19. Ressources manquantes', () => {
  941  |   test('Accueil — aucune ressource CSS/JS en 404', async ({ page }) => {
  942  |     const failed = [];
  943  |     page.on('response', res => {
  944  |       const url = res.url();
  945  |       const st = res.status();
  946  |       if (st === 404 && (url.includes('.css') || url.includes('.js'))) {
  947  |         failed.push(`404: ${url}`);
  948  |       }
  949  |     });
  950  |     await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  951  |     expect(failed, `Ressources manquantes : ${failed.join(', ')}`).toHaveLength(0);
  952  |   });
  953  | 
  954  |   test('Formations — aucune ressource CSS/JS en 404', async ({ page }) => {
  955  |     const failed = [];
  956  |     page.on('response', res => {
  957  |       const st = res.status();
  958  |       const url = res.url();
  959  |       if (st === 404 && (url.includes('.css') || url.includes('.js'))) {
  960  |         failed.push(`404: ${url}`);
  961  |       }
  962  |     });
  963  |     await page.goto('/formations.html', { waitUntil: 'networkidle' });
  964  |     expect(failed, `Ressources manquantes : ${failed.join(', ')}`).toHaveLength(0);
  965  |   });
  966  | });
  967  | 
  968  | /* ═══════════════════════════════════════════════════════════════════════════
  969  |    20. MULTI-VIEWPORT — layout non cassé
  970  | ═══════════════════════════════════════════════════════════════════════════ */
  971  | test.describe('20. Multi-viewport layout', () => {
  972  |   for (const vp of MOBILE_VIEWPORTS) {
  973  |     test(`Accueil — pas de scroll horizontal — ${vp.name}`, async ({ page }) => {
  974  |       await page.setViewportSize({ width: vp.width, height: vp.height });
  975  |       await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  976  |       await page.waitForTimeout(600);
  977  |       const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  978  |       expect(scrollW, `Scroll horizontal détecté (${scrollW}px > ${vp.width}px)`).toBeLessThanOrEqual(vp.width + 5);
  979  |     });
  980  | 
  981  |     test(`Accueil — H1 visible — ${vp.name}`, async ({ page }) => {
  982  |       await page.setViewportSize({ width: vp.width, height: vp.height });
  983  |       await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  984  |       await page.waitForTimeout(1200);
  985  |       await expect(page.locator('.hero h1')).toBeVisible();
  986  |     });
  987  | 
  988  |     test(`Accueil — bouton CTA visible et cliquable — ${vp.name}`, async ({ page }) => {
  989  |       await page.setViewportSize({ width: vp.width, height: vp.height });
  990  |       await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  991  |       await page.waitForTimeout(1200);
  992  |       const btn = page.locator('.hero-cta .btn').first();
  993  |       await expect(btn).toBeVisible();
  994  |       const box = await btn.boundingBox();
  995  |       expect(box.width, 'Bouton trop étroit').toBeGreaterThan(50);
  996  |     });
  997  | 
  998  |     test(`Accueil — footer visible en bas — ${vp.name}`, async ({ page }) => {
  999  |       await page.setViewportSize({ width: vp.width, height: vp.height });
  1000 |       await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  1001 |       const footer = page.locator('footer');
  1002 |       await expect(footer).toBeAttached();
  1003 |     });
  1004 |   }
  1005 | });
  1006 | 
  1007 | /* ═══════════════════════════════════════════════════════════════════════════
  1008 |    21. MISSION & MARQUEE
  1009 | ═══════════════════════════════════════════════════════════════════════════ */
  1010 | test.describe('21. Mission & Marquee', () => {
  1011 |   test('Section Mission présente', async ({ page }) => {
  1012 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  1013 |     await expect(page.locator('.mission')).toBeAttached();
  1014 |     const txt = await page.locator('.mission .big').innerText();
  1015 |     expect(txt).toContain('Africademia');
  1016 |   });
  1017 | 
  1018 |   test('Signature Mission présente', async ({ page }) => {
  1019 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  1020 |     await expect(page.locator('.mission .sig')).toBeAttached();
  1021 |   });
  1022 | 
  1023 |   test('Ticker marquee contient 2 tracks (loop)', async ({ page }) => {
  1024 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  1025 |     const tracks = page.locator('.ticker-track > div');
  1026 |     await expect(tracks).toHaveCount(2);
  1027 |   });
  1028 | });
  1029 | 
  1030 | /* ═══════════════════════════════════════════════════════════════════════════
  1031 |    22. VIDEO MODAL
  1032 | ═══════════════════════════════════════════════════════════════════════════ */
```