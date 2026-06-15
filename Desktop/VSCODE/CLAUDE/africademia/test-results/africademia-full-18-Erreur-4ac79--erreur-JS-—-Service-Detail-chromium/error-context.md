# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: africademia-full.spec.js >> 18. Erreurs JavaScript >> Pas d'erreur JS — Service Detail
- Location: tests/africademia-full.spec.js:928:5

# Error details

```
Error: Erreurs JS sur Service Detail : console.error: Failed to load resource: the server responded with a status of 500 ()

expect(received).toHaveLength(expected)

Expected length: 0
Received length: 1
Received array:  ["console.error: Failed to load resource: the server responded with a status of 500 ()"]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic:
    - button "":
      - generic: 
  - navigation [ref=e2]:
    - generic [ref=e3]:
      - link "Africa demia" [ref=e4] [cursor=pointer]:
        - /url: direction-afromodern.html
        - text: Africa
        - generic [ref=e6]: demia
      - link " Tous les services" [ref=e7] [cursor=pointer]:
        - /url: direction-afromodern.html#services
        - generic [ref=e8]: 
        - text: Tous les services
      - generic [ref=e9]:
        - link " Connexion" [ref=e10] [cursor=pointer]:
          - /url: connexion.html
          - generic [ref=e11]: 
          - generic [ref=e12]: Connexion
        - link "Nous contacter" [ref=e13] [cursor=pointer]:
          - /url: direction-afromodern.html#contact
        - text: 
  - generic [ref=e15]:
    - paragraph [ref=e16]: Service introuvable.
    - link "← Voir tous les services" [ref=e17] [cursor=pointer]:
      - /url: direction-afromodern.html#services
  - contentinfo [ref=e18]:
    - generic [ref=e20]:
      - generic [ref=e22]:
        - text: Africa
        - generic [ref=e24]: demia
      - generic [ref=e25]: © 2025 Africademia
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
       |                                                                     ^ Error: Erreurs JS sur Service Detail : console.error: Failed to load resource: the server responded with a status of 500 ()
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