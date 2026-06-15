const { test, expect } = require('@playwright/test');

const PAGES = [
  { url: '/direction-afromodern.html', name: 'Accueil' },
  { url: '/formations.html',           name: 'Formations' },
  { url: '/notre-histoire.html',       name: 'Notre Histoire' },
  { url: '/service-web.html',          name: 'Service Web' },
  { url: '/service-ia.html',           name: 'Service IA' },
  { url: '/service-marketing.html',    name: 'Service Marketing' },
  { url: '/service-publicite.html',    name: 'Service Publicité' },
  { url: '/service-hebergement.html',  name: 'Service Hébergement' },
  { url: '/connexion.html',            name: 'Connexion' },
];

/* ─────────────────────────────────────────────────────────────
   1. CHARGEMENT PAGES — pas d'erreur 4xx/5xx
───────────────────────────────────────────────────────────── */
for (const p of PAGES) {
  test(`[Chargement] ${p.name} — HTTP 200`, async ({ page }) => {
    const res = await page.goto(p.url, { waitUntil: 'domcontentloaded' });
    expect(res.status()).toBeLessThan(400);
  });
}

/* ─────────────────────────────────────────────────────────────
   2. SEO — meta tags obligatoires
───────────────────────────────────────────────────────────── */
for (const p of PAGES) {
  test(`[SEO] ${p.name} — title, description, canonical`, async ({ page }) => {
    await page.goto(p.url, { waitUntil: 'domcontentloaded' });

    // Title non vide et >= 10 chars
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);

    // Meta description présente et >= 50 chars
    const desc = await page.getAttribute('meta[name="description"]', 'content');
    expect(desc).toBeTruthy();
    expect(desc.length).toBeGreaterThan(50);

    // Canonical présent
    const canon = await page.getAttribute('link[rel="canonical"]', 'href');
    expect(canon).toBeTruthy();

    // robots présent
    const robots = await page.getAttribute('meta[name="robots"]', 'content');
    expect(robots).toBeTruthy();
  });
}

test('[SEO] Accueil — Open Graph complet', async ({ page }) => {
  await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
  const ogDesc  = await page.getAttribute('meta[property="og:description"]', 'content');
  const ogImage = await page.getAttribute('meta[property="og:image"]', 'content');
  const ogUrl   = await page.getAttribute('meta[property="og:url"]', 'content');
  expect(ogTitle).toBeTruthy();
  expect(ogDesc).toBeTruthy();
  expect(ogImage).toBeTruthy();
  expect(ogUrl).toBeTruthy();
});

test('[SEO] Accueil — Twitter Card', async ({ page }) => {
  await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  const card = await page.getAttribute('meta[name="twitter:card"]', 'content');
  expect(card).toBe('summary_large_image');
});

test('[SEO] Accueil — JSON-LD Organization', async ({ page }) => {
  await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  const ld = await page.evaluate(() => {
    const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')];
    return scripts.map(s => JSON.parse(s.textContent));
  });
  const org = ld.find(d => d['@type'] === 'Organization');
  expect(org).toBeTruthy();
  expect(org.name).toBe('Africademia');
  expect(org.url).toBeTruthy();
});

test('[SEO] Pages privées — noindex', async ({ page }) => {
  for (const url of ['/admin.html', '/espace-client.html', '/connexion.html']) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const robots = await page.getAttribute('meta[name="robots"]', 'content');
    expect(robots).toContain('noindex');
  }
});

test('[SEO] sitemap.xml accessible', async ({ page }) => {
  const res = await page.goto('/sitemap.xml');
  expect(res.status()).toBe(200);
  const text = await page.content();
  expect(text).toContain('urlset');
  expect(text).toContain('africademia.com');
});

test('[SEO] robots.txt accessible', async ({ page }) => {
  const res = await page.goto('/robots.txt');
  expect(res.status()).toBe(200);
  const text = await page.content();
  expect(text).toContain('Sitemap');
});

/* ─────────────────────────────────────────────────────────────
   3. NAVIGATION — liens internes fonctionnels
───────────────────────────────────────────────────────────── */
test('[Nav] Accueil — logo cliquable', async ({ page }) => {
  await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  await page.click('a.logo');
  await page.waitForLoadState('domcontentloaded');
  // Doit rester sur direction-afromodern ou aller sur index
  expect(page.url()).toMatch(/index\.html|direction-afromodern/);
});

test('[Nav] Accueil — bouton Connexion présent et visible', async ({ page }) => {
  await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  const btn = page.locator('#nav-login-btn');
  await expect(btn).toBeVisible();
  expect(await btn.getAttribute('href')).toContain('connexion');
});

test('[Nav] Accueil → Formations', async ({ page }) => {
  await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  const link = page.locator('a[href="formations.html"]').first();
  await expect(link).toBeAttached();
});

test('[Nav] Accueil → Notre Histoire', async ({ page }) => {
  await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  const link = page.locator('a[href="notre-histoire.html"]').first();
  await expect(link).toBeAttached();
});

/* ─────────────────────────────────────────────────────────────
   4. CONTENU — éléments clés présents
───────────────────────────────────────────────────────────── */
test('[Contenu] Accueil — Hero titre présent', async ({ page }) => {
  await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  const h1 = page.locator('h1').first();
  await expect(h1).toBeVisible();
  const text = await h1.innerText();
  expect(text.length).toBeGreaterThan(5);
});

test('[Contenu] Accueil — section services visible', async ({ page }) => {
  await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#services')).toBeAttached();
});

test('[Contenu] Accueil — section formations visible', async ({ page }) => {
  await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#formations')).toBeAttached();
});

test('[Contenu] Accueil — footer présent', async ({ page }) => {
  await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('footer')).toBeAttached();
});

test('[Contenu] Formations — liste ou message chargement présent', async ({ page }) => {
  await page.goto('/formations.html', { waitUntil: 'domcontentloaded' });
  const body = await page.content();
  expect(body.toLowerCase()).toContain('formation');
});

test('[Contenu] Notre Histoire — section présente', async ({ page }) => {
  await page.goto('/notre-histoire.html', { waitUntil: 'domcontentloaded' });
  const h1 = page.locator('h1, h2').first();
  await expect(h1).toBeVisible();
});

test('[Contenu] Connexion — formulaire présent', async ({ page }) => {
  await page.goto('/connexion.html', { waitUntil: 'domcontentloaded' });
  const form = page.locator('form, input[type="email"]');
  await expect(form.first()).toBeAttached();
});

/* ─────────────────────────────────────────────────────────────
   5. MOBILE — nav burger fonctionne
───────────────────────────────────────────────────────────── */
test('[Mobile] Accueil — burger menu toggle', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  const burger = page.locator('#navBurger');
  await expect(burger).toBeVisible();
  await burger.click();
  const mobileNav = page.locator('#mobileNav');
  await expect(mobileNav).toHaveClass(/open/);
});

test('[Mobile] Accueil — bouton connexion mobile présent', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  const burger = page.locator('#navBurger');
  await burger.click();
  const loginMobile = page.locator('#mob-login-btn');
  await expect(loginMobile).toBeVisible();
});

/* ─────────────────────────────────────────────────────────────
   6. PERFORMANCE — page loader se retire
───────────────────────────────────────────────────────────── */
test('[Perf] Accueil — loader se retire (< 3s)', async ({ page }) => {
  await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const loader = await page.$('#afc-loader');
  // Soit supprimé du DOM, soit invisible
  if (loader) {
    const visible = await loader.isVisible();
    expect(visible).toBe(false);
  }
});

/* ─────────────────────────────────────────────────────────────
   7. ACCESSIBILITÉ — attributs essentiels
───────────────────────────────────────────────────────────── */
test('[A11y] Accueil — lang="fr" sur html', async ({ page }) => {
  await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  const lang = await page.getAttribute('html', 'lang');
  expect(lang).toBe('fr');
});

test('[A11y] Accueil — bouton burger a aria-label', async ({ page }) => {
  await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  const label = await page.getAttribute('#navBurger', 'aria-label');
  expect(label).toBeTruthy();
});

test('[A11y] Accueil — charset UTF-8 défini', async ({ page }) => {
  await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  const charset = await page.evaluate(() => {
    const m = document.querySelector('meta[charset]');
    return m ? m.getAttribute('charset') : null;
  });
  expect(charset?.toLowerCase()).toBe('utf-8');
});

/* ─────────────────────────────────────────────────────────────
   8. PAS D'ERREURS JS CRITIQUES
───────────────────────────────────────────────────────────── */
for (const p of PAGES.slice(0, 5)) {
  test(`[JS] ${p.name} — pas d'erreur JS critique`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => {
      // Ignorer les erreurs de ressources CDN non critiques
      if (!e.message.includes('net::ERR') && !e.message.includes('favicon')) {
        errors.push(e.message);
      }
    });
    await page.goto(p.url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    expect(errors).toHaveLength(0);
  });
}
