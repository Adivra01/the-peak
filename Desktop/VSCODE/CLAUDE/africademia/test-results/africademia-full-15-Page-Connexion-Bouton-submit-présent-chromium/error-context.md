# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: africademia-full.spec.js >> 15. Page Connexion >> Bouton submit présent
- Location: tests/africademia-full.spec.js:816:3

# Error details

```
Error: expect(locator).toBeAttached() failed

Locator: locator('button[type="submit"], input[type="submit"]').first()
Expected: attached
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeAttached" with timeout 5000ms
  - waiting for locator('button[type="submit"], input[type="submit"]').first()

```

```yaml
- text: Africademia
- link " Accueil":
  - /url: index.html
- text: Votre espace personnel
- heading "Transformez votre avenir digital." [level=1]:
  - text: Transformez votre
  - emphasis: avenir
  - text: digital.
- paragraph: Accédez à vos formations, suivez votre progression et gérez tout depuis un seul espace sécurisé.
- text: 500+ Clients actifs 5 Formations 100% En ligne 📦 Print On Demand Accès immédiat 🎵 Musique & IA Nouvelle formation 🏠 Immobilier Locatif Disponible Plateforme sécurisée · Données protégées Bon retour 👋 Connectez-vous pour accéder à votre espace.
- button "Connexion"
- button "Créer un compte"
- text: Email 
- textbox "votre@email.com"
- text: Mot de passe 
- textbox "••••••••"
- button ""
- link "Mot de passe oublié ?":
  - /url: "#"
- button "Se connecter "
- text: ou
- link " Aide via WhatsApp":
  - /url: "#"
- paragraph:
  - text: Problème ?
  - link "Contactez-nous":
    - /url: mailto:contact@africademia.com
```

# Test source

```ts
  719 |     await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  720 |     await page.waitForTimeout(1200);
  721 |     const waBtn = page.locator('.endcta .btn-dark');
  722 |     const href = await waBtn.getAttribute('href');
  723 |     // Après injection AF_CONFIG, le href ne doit plus être "#"
  724 |     // Il peut rester "#" si AF_CONFIG n'est pas défini — on vérifie juste la présence
  725 |     expect(href).toBeTruthy();
  726 |   });
  727 | });
  728 | 
  729 | /* ═══════════════════════════════════════════════════════════════════════════
  730 |    13. FOOTER
  731 | ═══════════════════════════════════════════════════════════════════════════ */
  732 | test.describe('13. Footer', () => {
  733 |   test('Footer présent', async ({ page }) => {
  734 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  735 |     await expect(page.locator('footer')).toBeAttached();
  736 |   });
  737 | 
  738 |   test('Footer — logo présent', async ({ page }) => {
  739 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  740 |     await expect(page.locator('.foot-brand .logo')).toBeAttached();
  741 |   });
  742 | 
  743 |   test('Footer — 3 colonnes de liens', async ({ page }) => {
  744 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  745 |     const cols = page.locator('.foot-col');
  746 |     await expect(cols).toHaveCount(3);
  747 |   });
  748 | 
  749 |   test('Footer — mentions légales (© et année)', async ({ page }) => {
  750 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  751 |     const bot = await page.locator('.foot-bot').innerText();
  752 |     expect(bot).toContain('©');
  753 |     expect(bot).toMatch(/202[0-9]/);
  754 |     expect(bot).toContain('Africademia');
  755 |   });
  756 | 
  757 |   test('Footer — liens services ne sont pas vides', async ({ page }) => {
  758 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  759 |     const links = page.locator('.foot-col a');
  760 |     const count = await links.count();
  761 |     expect(count).toBeGreaterThan(5);
  762 |     for (let i = 0; i < count; i++) {
  763 |       const href = await links.nth(i).getAttribute('href');
  764 |       expect(href, `Lien footer ${i} vide`).toBeTruthy();
  765 |     }
  766 |   });
  767 | });
  768 | 
  769 | /* ═══════════════════════════════════════════════════════════════════════════
  770 |    14. PAGES SERVICES — contenu et structure
  771 | ═══════════════════════════════════════════════════════════════════════════ */
  772 | test.describe('14. Pages Services', () => {
  773 |   const SERVICE_PAGES = [
  774 |     '/service-web.html',
  775 |     '/service-ia.html',
  776 |     '/service-marketing.html',
  777 |     '/service-publicite.html',
  778 |     '/service-hebergement.html',
  779 |   ];
  780 | 
  781 |   for (const url of SERVICE_PAGES) {
  782 |     test(`${url} — H1/H2 présent et non vide`, async ({ page }) => {
  783 |       await page.goto(url, { waitUntil: 'networkidle' });
  784 |       await page.waitForTimeout(500);
  785 |       const heading = page.locator('h1, h2').first();
  786 |       await expect(heading).toBeVisible();
  787 |       const txt = await heading.innerText();
  788 |       expect(txt.trim().length).toBeGreaterThan(3);
  789 |     });
  790 | 
  791 |     test(`${url} — Retour nav présent`, async ({ page }) => {
  792 |       await page.goto(url, { waitUntil: 'domcontentloaded' });
  793 |       const nav = page.locator('nav, header nav');
  794 |       await expect(nav.first()).toBeAttached();
  795 |     });
  796 |   }
  797 | 
  798 |   test('service-detail.html — charge un service par slug', async ({ page }) => {
  799 |     await page.goto('/service-detail.html?slug=creation-site-web', { waitUntil: 'networkidle' });
  800 |     await page.waitForTimeout(800);
  801 |     const body = await page.content();
  802 |     expect(body.length).toBeGreaterThan(500);
  803 |   });
  804 | });
  805 | 
  806 | /* ═══════════════════════════════════════════════════════════════════════════
  807 |    15. CONNEXION — formulaire
  808 | ═══════════════════════════════════════════════════════════════════════════ */
  809 | test.describe('15. Page Connexion', () => {
  810 |   test('Champs email et password présents', async ({ page }) => {
  811 |     await page.goto('/connexion.html', { waitUntil: 'networkidle' });
  812 |     await expect(page.locator('input[type="email"]')).toBeAttached();
  813 |     await expect(page.locator('input[type="password"]')).toBeAttached();
  814 |   });
  815 | 
  816 |   test('Bouton submit présent', async ({ page }) => {
  817 |     await page.goto('/connexion.html', { waitUntil: 'networkidle' });
  818 |     const submit = page.locator('button[type="submit"], input[type="submit"]').first();
> 819 |     await expect(submit).toBeAttached();
      |                          ^ Error: expect(locator).toBeAttached() failed
  820 |   });
  821 | 
  822 |   test('Lien retour accueil dans connexion', async ({ page }) => {
  823 |     await page.goto('/connexion.html', { waitUntil: 'domcontentloaded' });
  824 |     const homeLink = page.locator('a[href*="index"], a[href*="direction-afromodern"], a.logo').first();
  825 |     await expect(homeLink).toBeAttached();
  826 |   });
  827 | });
  828 | 
  829 | /* ═══════════════════════════════════════════════════════════════════════════
  830 |    16. ACCESSIBILITÉ
  831 | ═══════════════════════════════════════════════════════════════════════════ */
  832 | test.describe('16. Accessibilité', () => {
  833 |   test('lang="fr" sur toutes les pages', async ({ page }) => {
  834 |     for (const p of PUBLIC_PAGES.slice(0, 5)) {
  835 |       await page.goto(p.url, { waitUntil: 'domcontentloaded' });
  836 |       const lang = await page.getAttribute('html', 'lang');
  837 |       expect(lang, `lang manquant sur ${p.name}`).toMatch(/^fr/);
  838 |     }
  839 |   });
  840 | 
  841 |   test('charset UTF-8 déclaré', async ({ page }) => {
  842 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  843 |     const charset = await page.evaluate(() =>
  844 |       document.querySelector('meta[charset]')?.getAttribute('charset')
  845 |     );
  846 |     expect(charset?.toLowerCase()).toBe('utf-8');
  847 |   });
  848 | 
  849 |   test('Burger a aria-label', async ({ page }) => {
  850 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  851 |     const label = await page.getAttribute('#navBurger', 'aria-label');
  852 |     expect(label).toBeTruthy();
  853 |   });
  854 | 
  855 |   test('viewport meta tag présent', async ({ page }) => {
  856 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  857 |     const viewport = await page.getAttribute('meta[name="viewport"]', 'content');
  858 |     expect(viewport).toContain('width=device-width');
  859 |     expect(viewport).toContain('initial-scale=1');
  860 |   });
  861 | 
  862 |   test('Images avec loading=lazy', async ({ page }) => {
  863 |     await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  864 |     await page.waitForTimeout(1000);
  865 |     const imgs = page.locator('img[loading="lazy"]');
  866 |     const count = await imgs.count();
  867 |     // Si des images sont présentes (fallback sites à vendre), elles doivent être lazy
  868 |     const allImgs = await page.locator('img').count();
  869 |     if (allImgs > 0 && count === 0) {
  870 |       console.warn('Images présentes sans loading=lazy');
  871 |     }
  872 |   });
  873 | 
  874 |   test('Boutons ont des labels accessibles', async ({ page }) => {
  875 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  876 |     const buttons = page.locator('button:not([aria-label]):not([aria-labelledby])');
  877 |     const count = await buttons.count();
  878 |     for (let i = 0; i < count; i++) {
  879 |       const txt = await buttons.nth(i).innerText();
  880 |       const label = await buttons.nth(i).getAttribute('aria-label');
  881 |       if (!label && !txt.trim()) {
  882 |         console.warn(`Bouton ${i} sans texte ni aria-label`);
  883 |       }
  884 |     }
  885 |   });
  886 | });
  887 | 
  888 | /* ═══════════════════════════════════════════════════════════════════════════
  889 |    17. PERFORMANCES
  890 | ═══════════════════════════════════════════════════════════════════════════ */
  891 | test.describe('17. Performance', () => {
  892 |   test('Loader disparaît en moins de 4s', async ({ page }) => {
  893 |     await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  894 |     await page.waitForTimeout(4000);
  895 |     const loader = page.locator('#afc-loader');
  896 |     const isVisible = await loader.isVisible();
  897 |     expect(isVisible, 'Loader encore visible après 4s').toBe(false);
  898 |   });
  899 | 
  900 |   test('Accueil charge en moins de 8s', async ({ page }) => {
  901 |     const start = Date.now();
  902 |     await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  903 |     const elapsed = Date.now() - start;
  904 |     expect(elapsed, `Trop lent : ${elapsed}ms`).toBeLessThan(8000);
  905 |   });
  906 | 
  907 |   test('CSS principal chargé (variables CSS accessibles)', async ({ page }) => {
  908 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  909 |     const gold = await page.evaluate(() =>
  910 |       getComputedStyle(document.documentElement).getPropertyValue('--gold').trim()
  911 |     );
  912 |     expect(gold, 'Variables CSS non chargées (--gold manquante)').toBeTruthy();
  913 |   });
  914 | 
  915 |   test('GSAP chargé', async ({ page }) => {
  916 |     await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  917 |     await page.waitForTimeout(500);
  918 |     const gsap = await page.evaluate(() => typeof window.gsap !== 'undefined');
  919 |     expect(gsap, 'GSAP non chargé').toBe(true);
```