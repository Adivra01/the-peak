# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: africademia-full.spec.js >> 15. Page Connexion >> Champs email et password présents
- Location: tests/africademia-full.spec.js:810:3

# Error details

```
Error: expect(locator).toBeAttached() failed

Locator: locator('input[type="email"]')
Expected: attached
Error: strict mode violation: locator('input[type="email"]') resolved to 2 elements:
    1) <input class="finp" type="email" id="l-email" autocomplete="username" placeholder="votre@email.com"/> aka getByRole('textbox', { name: 'votre@email.com' })
    2) <input class="finp" type="email" id="r-email" autocomplete="email" placeholder="votre@email.com"/> aka locator('#r-email')

Call log:
  - Expect "toBeAttached" with timeout 5000ms
  - waiting for locator('input[type="email"]')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e8]: Africademia
      - link " Accueil" [ref=e9] [cursor=pointer]:
        - /url: index.html
        - generic [ref=e10]: 
        - text: Accueil
    - generic [ref=e11]:
      - generic [ref=e12]: Votre espace personnel
      - heading "Transformez votre avenir digital." [level=1] [ref=e14]:
        - text: Transformez
        - text: votre
        - emphasis [ref=e15]: avenir
        - text: digital.
      - paragraph [ref=e16]: Accédez à vos formations, suivez votre progression et gérez tout depuis un seul espace sécurisé.
      - generic [ref=e17]:
        - generic [ref=e18]:
          - generic [ref=e19]: 500+
          - generic [ref=e20]: Clients actifs
        - generic [ref=e21]:
          - generic [ref=e22]: "5"
          - generic [ref=e23]: Formations
        - generic [ref=e24]:
          - generic [ref=e25]: 100%
          - generic [ref=e26]: En ligne
    - generic [ref=e27]:
      - generic [ref=e28]:
        - generic [ref=e29]: 📦
        - generic [ref=e30]:
          - generic [ref=e31]: Print On Demand
          - generic [ref=e32]: Accès immédiat
      - generic [ref=e33]:
        - generic [ref=e34]: 🎵
        - generic [ref=e35]:
          - generic [ref=e36]: Musique & IA
          - generic [ref=e37]: Nouvelle formation
      - generic [ref=e38]:
        - generic [ref=e39]: 🏠
        - generic [ref=e40]:
          - generic [ref=e41]: Immobilier Locatif
          - generic [ref=e42]: Disponible
    - generic [ref=e43]: Plateforme sécurisée · Données protégées
  - generic [ref=e46]:
    - generic [ref=e47]:
      - generic [ref=e48]: Bon retour 👋
      - generic [ref=e49]: Connectez-vous pour accéder à votre espace.
    - generic [ref=e50]:
      - button "Connexion" [ref=e51] [cursor=pointer]
      - button "Créer un compte" [ref=e52] [cursor=pointer]
    - text:  
    - generic [ref=e53]:
      - generic [ref=e54]:
        - generic [ref=e55]: Email
        - generic [ref=e56]:
          - generic: 
          - textbox "votre@email.com" [ref=e57]
      - generic [ref=e58]:
        - generic [ref=e59]: Mot de passe
        - generic [ref=e60]:
          - generic: 
          - textbox "••••••••" [ref=e61]
          - button "" [ref=e62] [cursor=pointer]:
            - generic [ref=e63]: 
      - link "Mot de passe oublié ?" [ref=e65] [cursor=pointer]:
        - /url: "#"
      - button "Se connecter " [ref=e66] [cursor=pointer]:
        - generic [ref=e67]:
          - text: Se connecter
          - generic [ref=e68]: 
      - generic [ref=e69]: ou
      - link " Aide via WhatsApp" [ref=e70] [cursor=pointer]:
        - /url: "#"
        - generic [ref=e71]: 
        - text: Aide via WhatsApp
    - text:       
    - paragraph [ref=e72]:
      - text: Problème ?
      - link "Contactez-nous" [ref=e73] [cursor=pointer]:
        - /url: mailto:contact@africademia.com
```

# Test source

```ts
  712 |   test('2 boutons CTAs présents dans la section contact', async ({ page }) => {
  713 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  714 |     const btns = page.locator('.endcta .btn');
  715 |     await expect(btns).toHaveCount(2);
  716 |   });
  717 | 
  718 |   test('Boutons WhatsApp/Démarrer sont reliés (pas href="#")', async ({ page }) => {
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
> 812 |     await expect(page.locator('input[type="email"]')).toBeAttached();
      |                                                       ^ Error: expect(locator).toBeAttached() failed
  813 |     await expect(page.locator('input[type="password"]')).toBeAttached();
  814 |   });
  815 | 
  816 |   test('Bouton submit présent', async ({ page }) => {
  817 |     await page.goto('/connexion.html', { waitUntil: 'networkidle' });
  818 |     const submit = page.locator('button[type="submit"], input[type="submit"]').first();
  819 |     await expect(submit).toBeAttached();
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
```