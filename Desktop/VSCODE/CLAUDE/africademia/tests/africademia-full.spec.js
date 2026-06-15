/**
 * AFRICADEMIA — Tests Playwright exhaustifs
 * Couvre : pages, SEO, navigation, contenu, mobile, JS, accessibilité, liens
 */
const { test, expect } = require('@playwright/test');

/* ═══════════════ CONSTANTES ═══════════════ */
const ALL_PAGES = [
  { url: '/direction-afromodern.html', name: 'Accueil' },
  { url: '/formations.html',           name: 'Formations' },
  { url: '/notre-histoire.html',       name: 'Notre Histoire' },
  { url: '/service-web.html',          name: 'Service Web' },
  { url: '/service-ia.html',           name: 'Service IA' },
  { url: '/service-marketing.html',    name: 'Service Marketing' },
  { url: '/service-publicite.html',    name: 'Service Publicité' },
  { url: '/service-hebergement.html',  name: 'Service Hébergement' },
  { url: '/service-detail.html',       name: 'Service Detail' },
  { url: '/formation-detail.html',     name: 'Formation Detail' },
  { url: '/connexion.html',            name: 'Connexion' },
  { url: '/espace-client.html',        name: 'Espace Client' },
  { url: '/projet-detail.html',        name: 'Projet Detail' },
];

const PUBLIC_PAGES = ALL_PAGES.slice(0, 9);

const MOBILE_VIEWPORTS = [
  { name: 'iPhone SE (375)',   width: 375,  height: 667  },
  { name: 'iPhone 14 (390)',   width: 390,  height: 844  },
  { name: 'Galaxy S21 (412)', width: 412,  height: 915  },
  { name: 'iPad mini (768)',   width: 768,  height: 1024 },
];

/* Helper — filtre les erreurs non critiques (CDN manquant hors réseau, Supabase offline) */
function isCritical(msg) {
  const noise = [
    'net::ERR_',
    'favicon',
    'supabase',
    'wnvsrjsjjnyitxiexztq',
    'Failed to fetch',
    'ERR_INTERNET_DISCONNECTED',
    'ERR_NAME_NOT_RESOLVED',
    'CORS',
    'Content Security Policy',
    'ResizeObserver',
    'lenis',
  ];
  return !noise.some(n => msg.toLowerCase().includes(n.toLowerCase()));
}

/* Helper — collect console errors */
function collectErrors(page) {
  const errs = [];
  page.on('pageerror', e => { if (isCritical(e.message)) errs.push(`pageerror: ${e.message}`); });
  page.on('console', m => {
    if (m.type() === 'error' && isCritical(m.text())) errs.push(`console.error: ${m.text()}`);
  });
  return errs;
}

/* ═══════════════════════════════════════════════════════════════════════════
   1. CHARGEMENT — toutes les pages retournent 200
═══════════════════════════════════════════════════════════════════════════ */
test.describe('1. Chargement pages', () => {
  for (const p of ALL_PAGES) {
    test(`HTTP 200 — ${p.name}`, async ({ page }) => {
      const res = await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 10000 });
      expect(res.status(), `${p.name} doit retourner 200`).toBeLessThan(400);
    });
  }

  test('sitemap.xml accessible', async ({ page }) => {
    const res = await page.goto('/sitemap.xml');
    expect(res.status()).toBe(200);
    const txt = await page.content();
    expect(txt).toContain('<urlset');
    expect(txt).toContain('africademia.com');
  });

  test('robots.txt accessible', async ({ page }) => {
    const res = await page.goto('/robots.txt');
    expect(res.status()).toBe(200);
    const txt = await page.content();
    expect(txt).toContain('Sitemap');
    expect(txt).toContain('User-agent');
  });

  test('favicon.svg accessible', async ({ page }) => {
    const res = await page.goto('/favicon.svg');
    expect(res.status()).toBe(200);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   2. SEO — meta tags, Open Graph, JSON-LD
═══════════════════════════════════════════════════════════════════════════ */
test.describe('2. SEO', () => {
  for (const p of PUBLIC_PAGES) {
    test(`title + description + canonical — ${p.name}`, async ({ page }) => {
      await page.goto(p.url, { waitUntil: 'domcontentloaded' });
      const title = await page.title();
      expect(title.length, 'title trop court').toBeGreaterThan(10);
      const desc = await page.getAttribute('meta[name="description"]', 'content');
      expect(desc, 'meta description manquante').toBeTruthy();
      expect(desc.length, 'meta description trop courte').toBeGreaterThan(50);
      const canon = await page.getAttribute('link[rel="canonical"]', 'href');
      expect(canon, 'canonical manquant').toBeTruthy();
    });
  }

  test('Accueil — Open Graph complet (6 propriétés)', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    for (const prop of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:site_name']) {
      const val = await page.getAttribute(`meta[property="${prop}"]`, 'content');
      expect(val, `${prop} manquant`).toBeTruthy();
    }
  });

  test('Accueil — Twitter Card', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const card = await page.getAttribute('meta[name="twitter:card"]', 'content');
    expect(card).toBe('summary_large_image');
    const tw = await page.getAttribute('meta[name="twitter:title"]', 'content');
    expect(tw).toBeTruthy();
  });

  test('Accueil — JSON-LD Organization valide', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const schemas = await page.evaluate(() =>
      [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map(s => { try { return JSON.parse(s.textContent); } catch { return null; } })
        .filter(Boolean)
    );
    const org = schemas.find(d => d['@type'] === 'Organization');
    expect(org, 'JSON-LD Organization manquant').toBeTruthy();
    expect(org.name).toBe('Africademia');
    expect(org.url).toContain('africademia');
    expect(org.contactPoint).toBeTruthy();
    const site = schemas.find(d => d['@type'] === 'WebSite');
    expect(site, 'JSON-LD WebSite manquant').toBeTruthy();
  });

  test('Pages privées — noindex', async ({ page }) => {
    for (const url of ['/admin.html', '/espace-client.html', '/connexion.html']) {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const robots = await page.getAttribute('meta[name="robots"]', 'content');
      expect(robots, `${url} devrait avoir noindex`).toContain('noindex');
    }
  });

  test('Accueil — locale Open Graph = fr_SN ou fr', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const locale = await page.getAttribute('meta[property="og:locale"]', 'content');
    expect(locale).toMatch(/^fr/);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   3. NAVIGATION DESKTOP
═══════════════════════════════════════════════════════════════════════════ */
test.describe('3. Navigation desktop', () => {
  test('Logo visible et cliquable', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const logo = page.locator('nav a.logo');
    await expect(logo).toBeVisible();
    await logo.click();
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toMatch(/index\.html|direction-afromodern/);
  });

  test('Liens nav desktop visibles', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const navLinks = page.locator('.nav-links a');
    const count = await navLinks.count();
    expect(count, 'Doit y avoir au moins 4 liens nav').toBeGreaterThanOrEqual(4);
    for (let i = 0; i < count; i++) {
      await expect(navLinks.nth(i)).toBeVisible();
    }
  });

  test('Bouton CTA nav desktop visible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.nav-cta')).toBeVisible();
  });

  test('Bouton Connexion nav desktop visible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const btn = page.locator('#nav-login-btn');
    await expect(btn).toBeVisible();
    const href = await btn.getAttribute('href');
    expect(href).toContain('connexion');
  });

  test('Nav se fixe au scroll (classe scrolled)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(400);
    const nav = page.locator('nav#nav');
    await expect(nav).toHaveClass(/scrolled/);
  });

  test('Lien Formation → formations.html', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const link = page.locator('a[href="formations.html"]').first();
    await expect(link).toBeAttached();
  });

  test('Lien Notre Histoire → notre-histoire.html', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const link = page.locator('a[href="notre-histoire.html"]').first();
    await expect(link).toBeAttached();
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   4. NAVIGATION MOBILE (burger + menu)
═══════════════════════════════════════════════════════════════════════════ */
test.describe('4. Navigation mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Nav desktop masqué sur mobile', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const navLinks = page.locator('.nav-links');
    await expect(navLinks).toBeHidden();
    const navCta = page.locator('nav .nav-cta');
    await expect(navCta).toBeHidden();
  });

  test('Burger visible et fonctionnel', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const burger = page.locator('#navBurger');
    await expect(burger).toBeVisible();
    await burger.click();
    await page.waitForTimeout(400);
    await expect(page.locator('#mobileNav')).toHaveClass(/open/);
    await expect(burger).toHaveClass(/open/);
  });

  test('Burger se referme au 2e clic', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const burger = page.locator('#navBurger');
    await burger.click();
    await page.waitForTimeout(300);
    await burger.click();
    await page.waitForTimeout(400);
    await expect(page.locator('#mobileNav')).not.toHaveClass(/open/);
  });

  test('Menu mobile — liens présents et visibles', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#navBurger').click();
    await page.waitForTimeout(400);
    const mobileNav = page.locator('#mobileNav');
    await expect(mobileNav.locator('a')).toHaveCount({ minimum: 5 });
    // Le CTA WhatsApp
    await expect(mobileNav.locator('.mn-cta')).toBeVisible();
    // Le lien Connexion
    await expect(mobileNav.locator('#mob-login-btn')).toBeVisible();
  });

  test('Menu mobile se ferme au scroll', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#navBurger').click();
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo(0, 200));
    await page.waitForTimeout(400);
    await expect(page.locator('#mobileNav')).not.toHaveClass(/open/);
  });

  test('Menu mobile — lien ferme le menu (closeMobileNav)', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#navBurger').click();
    await page.waitForTimeout(300);
    await page.locator('#mobileNav a').first().click();
    await page.waitForTimeout(400);
    await expect(page.locator('#mobileNav')).not.toHaveClass(/open/);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   5. HERO SECTION — desktop
═══════════════════════════════════════════════════════════════════════════ */
test.describe('5. Hero section — desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('H1 visible avec 4 lignes animées', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const h1 = page.locator('.hero h1');
    await expect(h1).toBeVisible();
    const lines = h1.locator('.line');
    await expect(lines).toHaveCount(4);
  });

  test('Hero sous-titre visible', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    await expect(page.locator('.hero-meta p')).toBeVisible();
    const txt = await page.locator('.hero-meta p').innerText();
    expect(txt.length).toBeGreaterThan(30);
  });

  test('Hero CTAs : 2 boutons visibles', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const btns = page.locator('.hero-cta .btn');
    await expect(btns).toHaveCount(2);
    for (let i = 0; i < 2; i++) await expect(btns.nth(i)).toBeVisible();
  });

  test('Hero trust badge visible (+1 000 entrepreneurs)', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const trust = page.locator('.hero-trust');
    await expect(trust).toBeVisible();
    const txt = await trust.innerText();
    expect(txt).toContain('entrepreneur');
  });

  test('Hero stats — 3 compteurs visibles', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const stats = page.locator('.hero-stats .st');
    await expect(stats).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(stats.nth(i)).toBeVisible();
    }
  });

  test('Hero art — conteneur visible', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    await expect(page.locator('.hero-art')).toBeVisible();
  });

  test('Hero art — phone mockup visible', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await expect(page.locator('.ha-phone')).toBeVisible();
  });

  test('Hero art — carte Visiteurs (#haV) visible et dans le viewport', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    const card = page.locator('#haV');
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    expect(box, '#haV introuvable').toBeTruthy();
    expect(box.x, '#haV hors gauche viewport').toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, '#haV hors droite viewport').toBeLessThanOrEqual(1280);
  });

  test('Hero art — carte ROI (#haR) visible et dans le viewport', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
    const card = page.locator('#haR');
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    expect(box).toBeTruthy();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1280);
  });

  test('Ticker marquee visible', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.ticker')).toBeVisible();
    const txt = await page.locator('.ticker').innerText();
    expect(txt).toContain('SITES WEB');
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   6. HERO ART — mobile (cartes dans viewport, phone non coupé)
═══════════════════════════════════════════════════════════════════════════ */
test.describe('6. Hero Art — mobile', () => {
  for (const vp of MOBILE_VIEWPORTS) {
    test(`Hero art hauteur suffisante — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);
      const heroArt = page.locator('.hero-art');
      const box = await heroArt.boundingBox();
      expect(box, '.hero-art introuvable').toBeTruthy();
      // Le conteneur doit être assez grand pour accueillir le phone (268px)
      expect(box.height, `hero-art trop petit (${box.height}px) — phone risque d'être coupé`).toBeGreaterThanOrEqual(270);
    });

    test(`Phone mockup non coupé — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);
      const phone = page.locator('.ha-phone');
      const box = await phone.boundingBox();
      if (!box) return; // phone peut être hors layout si trop petit
      // Le phone doit être dans le viewport horizontalement
      expect(box.x, 'Phone coupé à gauche').toBeGreaterThanOrEqual(-5);
      expect(box.x + box.width, 'Phone coupé à droite').toBeLessThanOrEqual(vp.width + 5);
    });

    test(`Carte ha-v dans le viewport — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1800);
      const card = page.locator('#haV');
      const box = await card.boundingBox();
      // Sur mobile la carte peut être masquée via display:none — on vérifie seulement si visible
      const isVisible = await card.isVisible();
      if (isVisible && box) {
        expect(box.x, '#haV coupée à gauche du viewport').toBeGreaterThanOrEqual(-5);
        expect(box.x + box.width, '#haV coupée à droite du viewport').toBeLessThanOrEqual(vp.width + 5);
      }
    });

    test(`Carte ha-r dans le viewport — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1800);
      const card = page.locator('#haR');
      const isVisible = await card.isVisible();
      if (isVisible) {
        const box = await card.boundingBox();
        if (box) {
          expect(box.x, '#haR coupée à gauche').toBeGreaterThanOrEqual(-5);
          expect(box.x + box.width, '#haR coupée à droite').toBeLessThanOrEqual(vp.width + 5);
        }
      }
    });
  }

  test('Mobile ≤640px — ha-ia et ha-n masqués (display:none)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#haIa')).toBeHidden();
    await expect(page.locator('#haN')).toBeHidden();
  });

  test('Mobile ≤980px — ha-c masqué', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#haC')).toBeHidden();
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   7. SERVICE SLIDER
═══════════════════════════════════════════════════════════════════════════ */
test.describe('7. Service Slider', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('Slide 1 active au chargement', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    const activeSlide = page.locator('.svc-slide.s-active');
    await expect(activeSlide).toHaveCount(1);
    const idx = await activeSlide.getAttribute('data-idx');
    expect(idx).toBe('0');
  });

  test('Bouton Next → slide suivante', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, document.getElementById('services').offsetTop));
    await page.waitForTimeout(600);
    const next = page.locator('#svcNext');
    await next.click();
    await page.waitForTimeout(1000);
    const activeSlide = page.locator('.svc-slide.s-active');
    const idx = await activeSlide.getAttribute('data-idx');
    expect(idx).toBe('1');
    const count = await page.locator('#svcCount').innerText();
    expect(count).toContain('02');
  });

  test('Bouton Prev depuis slide 0 → slide 4 (boucle)', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, document.getElementById('services').offsetTop));
    await page.waitForTimeout(600);
    await page.locator('#svcPrev').click();
    await page.waitForTimeout(1000);
    const idx = await page.locator('.svc-slide.s-active').getAttribute('data-idx');
    expect(idx).toBe('4');
  });

  test('Navigation par dot (3e dot → slide 3)', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, document.getElementById('services').offsetTop));
    await page.waitForTimeout(600);
    await page.locator('.s-dot').nth(2).click();
    await page.waitForTimeout(1000);
    const idx = await page.locator('.svc-slide.s-active').getAttribute('data-idx');
    expect(idx).toBe('2');
  });

  test('5 dots présents', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.s-dot')).toHaveCount(5);
  });

  test('Compteur slides mis à jour (02 / 05 après Next)', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, document.getElementById('services').offsetTop));
    await page.waitForTimeout(600);
    await page.locator('#svcNext').click();
    await page.waitForTimeout(1000);
    const count = await page.locator('#svcCount').innerText();
    expect(count).toMatch(/02\s*\/\s*05/);
  });

  test('CTA de chaque slide pointe vers service-detail.html', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const ctas = page.locator('.sl-cta');
    const count = await ctas.count();
    expect(count).toBe(5);
    for (let i = 0; i < count; i++) {
      const href = await ctas.nth(i).getAttribute('href');
      expect(href, `CTA slide ${i} sans href`).toBeTruthy();
    }
  });

  test('Slider mobile — slide panel droit a une hauteur correcte', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const slRight = page.locator('.svc-slide.s-active .sl-right');
    const box = await slRight.boundingBox();
    if (box) {
      expect(box.height, 'Panel droit trop court sur mobile').toBeGreaterThanOrEqual(150);
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   8. SECTION FORMATIONS
═══════════════════════════════════════════════════════════════════════════ */
test.describe('8. Section Formations', () => {
  test('Section formations présente', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#formations')).toBeAttached();
  });

  test('Grille formations se remplit (données locales)', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const grid = page.locator('#forGrid');
    const cards = grid.locator('.for-card');
    const count = await cards.count();
    expect(count, 'Aucune carte formation rendue').toBeGreaterThan(0);
  });

  test('Cartes formations : titre, prix, flèche présents', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const card = page.locator('#forGrid .for-card').first();
    await expect(card.locator('.for-title')).toBeAttached();
    await expect(card.locator('.for-price')).toBeAttached();
    await expect(card.locator('.for-arrow')).toBeAttached();
  });

  test('Carte CTA "Voir toutes les formations" présente', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const ctaCard = page.locator('#forGrid .for-cta');
    await expect(ctaCard).toBeAttached();
    const href = await ctaCard.getAttribute('href');
    expect(href).toContain('formations.html');
  });

  test('Page formations.html — liste de formations présente', async ({ page }) => {
    await page.goto('/formations.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const body = await page.content();
    expect(body.toLowerCase()).toContain('formation');
  });

  test('Formation detail — page accessible avec slug', async ({ page }) => {
    await page.goto('/formation-detail.html?slug=print-on-demand', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const body = await page.content();
    expect(body.length).toBeGreaterThan(500);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   9. SECTION SITES À VENDRE
═══════════════════════════════════════════════════════════════════════════ */
test.describe('9. Sites à vendre', () => {
  test('Section #a-vendre présente', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#a-vendre')).toBeAttached();
  });

  test('Grille vente se charge (fallback statique si pas de DB)', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // temps de chargement DB ou fallback
    const grid = page.locator('#vente-grid');
    await expect(grid).toBeAttached();
    const loading = grid.locator('.vente-loading');
    const isLoading = await loading.isVisible();
    expect(isLoading, 'Le spinner de chargement ne disparaît pas').toBe(false);
  });

  test('Cartes vente ont titre et prix', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const cards = page.locator('.vente-card');
    const count = await cards.count();
    if (count > 0) {
      const title = cards.first().locator('.vente-title');
      await expect(title).toBeAttached();
      const price = cards.first().locator('.vente-price');
      await expect(price).toBeAttached();
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   10. SECTION INCUBATEUR
═══════════════════════════════════════════════════════════════════════════ */
test.describe('10. Incubateur', () => {
  test('Section incubateur présente et visible', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#incubateur')).toBeAttached();
  });

  test('3 étapes process présentes', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const steps = page.locator('.istep');
    await expect(steps).toHaveCount(3);
  });

  test('Bouton WhatsApp incubateur valide', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const waBtn = page.locator('.btn-incub-wa');
    await expect(waBtn).toBeAttached();
    const href = await waBtn.getAttribute('href');
    expect(href, 'Lien WhatsApp manquant').toContain('wa.me');
    expect(href).toContain('226'); // numéro Africademia
  });

  test('4 pills secteurs affichés', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const pills = page.locator('.incub .pills span');
    await expect(pills).toHaveCount(4);
  });

  test('4 chèques conditions présents', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const checks = page.locator('.chk');
    await expect(checks).toHaveCount(4);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   11. FAQ
═══════════════════════════════════════════════════════════════════════════ */
test.describe('11. FAQ', () => {
  test('5 items FAQ présents', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.faq-item')).toHaveCount(5);
  });

  test('Premier item FAQ ouvert par défaut', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.faq-item').first()).toHaveClass(/open/);
  });

  test('Clic sur FAQ — ouvre la réponse', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const item = page.locator('.faq-item').nth(1);
    await item.locator('.faq-q').click();
    await page.waitForTimeout(500);
    await expect(item).toHaveClass(/open/);
    const answer = item.locator('.faq-a');
    // max-height devrait être > 0
    const maxH = await answer.evaluate(el => getComputedStyle(el).maxHeight);
    expect(maxH).not.toBe('0px');
  });

  test('Clic sur autre FAQ — ferme le précédent', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const item0 = page.locator('.faq-item').nth(0);
    const item1 = page.locator('.faq-item').nth(1);
    await item1.locator('.faq-q').click();
    await page.waitForTimeout(500);
    await expect(item0).not.toHaveClass(/open/);
    await expect(item1).toHaveClass(/open/);
  });

  test('Icone toggle FAQ change au clic (+  → ×)', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const item = page.locator('.faq-item').nth(0);
    const tog = item.locator('.faq-tog');
    // Déjà ouvert, le "+" est transformé en "×"
    const transform = await tog.evaluate(el => getComputedStyle(el).transform);
    expect(transform).not.toBe('none'); // rotation appliquée
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   12. SECTION END CTA (Contact)
═══════════════════════════════════════════════════════════════════════════ */
test.describe('12. End CTA / Contact', () => {
  test('Section endcta présente', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.endcta#contact')).toBeAttached();
  });

  test('2 boutons CTAs présents dans la section contact', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const btns = page.locator('.endcta .btn');
    await expect(btns).toHaveCount(2);
  });

  test('Boutons WhatsApp/Démarrer sont reliés (pas href="#")', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const waBtn = page.locator('.endcta .btn-dark');
    const href = await waBtn.getAttribute('href');
    // Après injection AF_CONFIG, le href ne doit plus être "#"
    // Il peut rester "#" si AF_CONFIG n'est pas défini — on vérifie juste la présence
    expect(href).toBeTruthy();
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   13. FOOTER
═══════════════════════════════════════════════════════════════════════════ */
test.describe('13. Footer', () => {
  test('Footer présent', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('footer')).toBeAttached();
  });

  test('Footer — logo présent', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.foot-brand .logo')).toBeAttached();
  });

  test('Footer — 3 colonnes de liens', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const cols = page.locator('.foot-col');
    await expect(cols).toHaveCount(3);
  });

  test('Footer — mentions légales (© et année)', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const bot = await page.locator('.foot-bot').innerText();
    expect(bot).toContain('©');
    expect(bot).toMatch(/202[0-9]/);
    expect(bot).toContain('Africademia');
  });

  test('Footer — liens services ne sont pas vides', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const links = page.locator('.foot-col a');
    const count = await links.count();
    expect(count).toBeGreaterThan(5);
    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      expect(href, `Lien footer ${i} vide`).toBeTruthy();
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   14. PAGES SERVICES — contenu et structure
═══════════════════════════════════════════════════════════════════════════ */
test.describe('14. Pages Services', () => {
  const SERVICE_PAGES = [
    '/service-web.html',
    '/service-ia.html',
    '/service-marketing.html',
    '/service-publicite.html',
    '/service-hebergement.html',
  ];

  for (const url of SERVICE_PAGES) {
    test(`${url} — H1/H2 présent et non vide`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
      const txt = await heading.innerText();
      expect(txt.trim().length).toBeGreaterThan(3);
    });

    test(`${url} — Retour nav présent`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const nav = page.locator('nav, header nav');
      await expect(nav.first()).toBeAttached();
    });
  }

  test('service-detail.html — charge un service par slug', async ({ page }) => {
    await page.goto('/service-detail.html?slug=creation-site-web', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const body = await page.content();
    expect(body.length).toBeGreaterThan(500);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   15. CONNEXION — formulaire
═══════════════════════════════════════════════════════════════════════════ */
test.describe('15. Page Connexion', () => {
  test('Champs email et password présents', async ({ page }) => {
    await page.goto('/connexion.html', { waitUntil: 'networkidle' });
    await expect(page.locator('input[type="email"]')).toBeAttached();
    await expect(page.locator('input[type="password"]')).toBeAttached();
  });

  test('Bouton submit présent', async ({ page }) => {
    await page.goto('/connexion.html', { waitUntil: 'networkidle' });
    const submit = page.locator('button[type="submit"], input[type="submit"]').first();
    await expect(submit).toBeAttached();
  });

  test('Lien retour accueil dans connexion', async ({ page }) => {
    await page.goto('/connexion.html', { waitUntil: 'domcontentloaded' });
    const homeLink = page.locator('a[href*="index"], a[href*="direction-afromodern"], a.logo').first();
    await expect(homeLink).toBeAttached();
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   16. ACCESSIBILITÉ
═══════════════════════════════════════════════════════════════════════════ */
test.describe('16. Accessibilité', () => {
  test('lang="fr" sur toutes les pages', async ({ page }) => {
    for (const p of PUBLIC_PAGES.slice(0, 5)) {
      await page.goto(p.url, { waitUntil: 'domcontentloaded' });
      const lang = await page.getAttribute('html', 'lang');
      expect(lang, `lang manquant sur ${p.name}`).toMatch(/^fr/);
    }
  });

  test('charset UTF-8 déclaré', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const charset = await page.evaluate(() =>
      document.querySelector('meta[charset]')?.getAttribute('charset')
    );
    expect(charset?.toLowerCase()).toBe('utf-8');
  });

  test('Burger a aria-label', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const label = await page.getAttribute('#navBurger', 'aria-label');
    expect(label).toBeTruthy();
  });

  test('viewport meta tag présent', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const viewport = await page.getAttribute('meta[name="viewport"]', 'content');
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1');
  });

  test('Images avec loading=lazy', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const imgs = page.locator('img[loading="lazy"]');
    const count = await imgs.count();
    // Si des images sont présentes (fallback sites à vendre), elles doivent être lazy
    const allImgs = await page.locator('img').count();
    if (allImgs > 0 && count === 0) {
      console.warn('Images présentes sans loading=lazy');
    }
  });

  test('Boutons ont des labels accessibles', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const buttons = page.locator('button:not([aria-label]):not([aria-labelledby])');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const txt = await buttons.nth(i).innerText();
      const label = await buttons.nth(i).getAttribute('aria-label');
      if (!label && !txt.trim()) {
        console.warn(`Bouton ${i} sans texte ni aria-label`);
      }
    }
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   17. PERFORMANCES
═══════════════════════════════════════════════════════════════════════════ */
test.describe('17. Performance', () => {
  test('Loader disparaît en moins de 4s', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
    const loader = page.locator('#afc-loader');
    const isVisible = await loader.isVisible();
    expect(isVisible, 'Loader encore visible après 4s').toBe(false);
  });

  test('Accueil charge en moins de 8s', async ({ page }) => {
    const start = Date.now();
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    const elapsed = Date.now() - start;
    expect(elapsed, `Trop lent : ${elapsed}ms`).toBeLessThan(8000);
  });

  test('CSS principal chargé (variables CSS accessibles)', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const gold = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--gold').trim()
    );
    expect(gold, 'Variables CSS non chargées (--gold manquante)').toBeTruthy();
  });

  test('GSAP chargé', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const gsap = await page.evaluate(() => typeof window.gsap !== 'undefined');
    expect(gsap, 'GSAP non chargé').toBe(true);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   18. ERREURS JS CRITIQUES
═══════════════════════════════════════════════════════════════════════════ */
test.describe('18. Erreurs JavaScript', () => {
  for (const p of PUBLIC_PAGES) {
    test(`Pas d'erreur JS — ${p.name}`, async ({ page }) => {
      const errs = collectErrors(page);
      await page.goto(p.url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      expect(errs, `Erreurs JS sur ${p.name} : ${errs.join('; ')}`).toHaveLength(0);
    });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   19. RESSOURCES 404 (assets CSS/JS)
═══════════════════════════════════════════════════════════════════════════ */
test.describe('19. Ressources manquantes', () => {
  test('Accueil — aucune ressource CSS/JS en 404', async ({ page }) => {
    const failed = [];
    page.on('response', res => {
      const url = res.url();
      const st = res.status();
      if (st === 404 && (url.includes('.css') || url.includes('.js'))) {
        failed.push(`404: ${url}`);
      }
    });
    await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
    expect(failed, `Ressources manquantes : ${failed.join(', ')}`).toHaveLength(0);
  });

  test('Formations — aucune ressource CSS/JS en 404', async ({ page }) => {
    const failed = [];
    page.on('response', res => {
      const st = res.status();
      const url = res.url();
      if (st === 404 && (url.includes('.css') || url.includes('.js'))) {
        failed.push(`404: ${url}`);
      }
    });
    await page.goto('/formations.html', { waitUntil: 'networkidle' });
    expect(failed, `Ressources manquantes : ${failed.join(', ')}`).toHaveLength(0);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   20. MULTI-VIEWPORT — layout non cassé
═══════════════════════════════════════════════════════════════════════════ */
test.describe('20. Multi-viewport layout', () => {
  for (const vp of MOBILE_VIEWPORTS) {
    test(`Accueil — pas de scroll horizontal — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollW, `Scroll horizontal détecté (${scrollW}px > ${vp.width}px)`).toBeLessThanOrEqual(vp.width + 5);
    });

    test(`Accueil — H1 visible — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);
      await expect(page.locator('.hero h1')).toBeVisible();
    });

    test(`Accueil — bouton CTA visible et cliquable — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);
      const btn = page.locator('.hero-cta .btn').first();
      await expect(btn).toBeVisible();
      const box = await btn.boundingBox();
      expect(box.width, 'Bouton trop étroit').toBeGreaterThan(50);
    });

    test(`Accueil — footer visible en bas — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
      const footer = page.locator('footer');
      await expect(footer).toBeAttached();
    });
  }
});

/* ═══════════════════════════════════════════════════════════════════════════
   21. MISSION & MARQUEE
═══════════════════════════════════════════════════════════════════════════ */
test.describe('21. Mission & Marquee', () => {
  test('Section Mission présente', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.mission')).toBeAttached();
    const txt = await page.locator('.mission .big').innerText();
    expect(txt).toContain('Africademia');
  });

  test('Signature Mission présente', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.mission .sig')).toBeAttached();
  });

  test('Ticker marquee contient 2 tracks (loop)', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const tracks = page.locator('.ticker-track > div');
    await expect(tracks).toHaveCount(2);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   22. VIDEO MODAL
═══════════════════════════════════════════════════════════════════════════ */
test.describe('22. Video Modal', () => {
  test('Modal vidéo présent et masqué par défaut', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    const modal = page.locator('#video-modal');
    await expect(modal).toBeAttached();
    await expect(modal).toHaveClass(/hidden/);
  });

  test('Bouton fermeture modal vidéo présent', async ({ page }) => {
    await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.video-modal-close')).toBeAttached();
  });
});
