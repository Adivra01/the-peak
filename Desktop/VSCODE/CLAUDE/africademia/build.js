#!/usr/bin/env node
/**
 * Africademia — Production Build
 * Génère dist/ avec assets hashés (cache-busting), CSS extrait, JS minifié
 * Structure identique à un build Vite :  dist/assets/[name]-[hash].[ext]
 */
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { minify: minifyHTML } = require('html-minifier-terser');
const { minify: minifyJS }   = require('terser');

const SRC  = __dirname;
const DIST = path.join(__dirname, 'dist');

/* ── Helpers ────────────────────────────────────────────────────────────────── */
function hash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
}
function kb(n) { return (n / 1024).toFixed(0) + ' KB'; }
function gain(a, b) { return '-' + (((a - b) / a) * 100).toFixed(0) + '%'; }

/* ── Reset dist ─────────────────────────────────────────────────────────────── */
if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true });
fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true });

/* ══════════════════════════════════════════════════════════════════════════════
   1. ASSETS JS — minifier + hasher → dist/assets/[name]-[hash].js
══════════════════════════════════════════════════════════════════════════════ */
const JS_FILES = [
  { src: 'js/config.js',              name: 'config'              },
  { src: 'js/auth.js',                name: 'auth'                },
  { src: 'js/db.js',                  name: 'db'                  },
  { src: 'js/premium-animations.js',  name: 'premium-animations'  },
  { src: 'js/tracker.js',             name: 'tracker'             },
  { src: 'data/formations.js',        name: 'formations'          },
  { src: 'data/services.js',          name: 'services'            },
];

const jsMap = {};   // { 'js/config.js': 'assets/config-a1b2c3d4.js' }

async function buildJS() {
  console.log('\n── JS ──────────────────────────────────────────────────────');
  for (const f of JS_FILES) {
    const raw    = fs.readFileSync(path.join(SRC, f.src), 'utf8');
    const result = await minifyJS(raw, { compress: true, mangle: true });
    const min    = result.code || raw;
    const h      = hash(min);
    const outName = `assets/${f.name}-${h}.js`;
    fs.writeFileSync(path.join(DIST, outName), min);
    jsMap[f.src] = outName;
    console.log(`✓ ${f.src.padEnd(30)} ${kb(raw.length)} → ${kb(min.length)}  (${gain(raw.length, min.length)})  → ${outName}`);
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   2. ASSETS CSS — minifier + hasher → dist/assets/[name]-[hash].css
══════════════════════════════════════════════════════════════════════════════ */
const cssMap = {};  // { 'src/css/direction-afromodern.css': 'assets/direction-afromodern-xxxx.css' }

async function buildCSS() {
  console.log('\n── CSS ─────────────────────────────────────────────────────');
  const cssDir = path.join(SRC, 'src', 'css');
  if (!fs.existsSync(cssDir)) { console.warn('⚠ src/css/ manquant'); return; }
  const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
  for (const file of files) {
    const raw    = fs.readFileSync(path.join(cssDir, file), 'utf8');
    // Minifier CSS avec clean-css via subprocess (évite dep complexe)
    const tmpIn  = path.join(SRC, '.tmp-css-in.css');
    const tmpOut = path.join(SRC, '.tmp-css-out.css');
    fs.writeFileSync(tmpIn, raw);
    try {
      execSync(`npx cleancss -o "${tmpOut}" "${tmpIn}"`, { stdio: 'pipe' });
    } catch (_) {
      fs.writeFileSync(tmpOut, raw); // fallback : CSS brut
    }
    const min  = fs.readFileSync(tmpOut, 'utf8');
    fs.unlinkSync(tmpIn); fs.unlinkSync(tmpOut);
    const h    = hash(min);
    const name = path.basename(file, '.css');
    const outName = `assets/${name}-${h}.css`;
    fs.writeFileSync(path.join(DIST, outName), min);
    cssMap[`/src/css/${file}`] = outName;
    console.log(`✓ ${file.padEnd(35)} ${kb(raw.length)} → ${kb(min.length)}  (${gain(raw.length, min.length)})  → ${outName}`);
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   3. HTML — réécrire refs JS/CSS + minifier
══════════════════════════════════════════════════════════════════════════════ */
const HTML_FILES = [
  'index.html',
  'direction-afromodern.html',
  'connexion.html',
  'espace-client.html',
  'admin.html',
  'admin-formations.html',
  'formations.html',
  'formation-detail.html',
  'notre-histoire.html',
  'service-web.html',
  'service-ia.html',
  'service-marketing.html',
  'service-publicite.html',
  'service-hebergement.html',
  'service-detail.html',
  'projet-detail.html',
];

const HTML_OPTS = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: false, // garder type="application/ld+json"
  removeStyleLinkTypeAttributes: true,
  minifyCSS: true,
  minifyJS: true,
  useShortDoctype: true,
  sortAttributes: true,
  sortClassName: false,
};

async function buildHTML() {
  console.log('\n── HTML ────────────────────────────────────────────────────');
  for (const file of HTML_FILES) {
    const fp = path.join(SRC, file);
    if (!fs.existsSync(fp)) { console.warn(`⚠ ${file} introuvable`); continue; }
    let html = fs.readFileSync(fp, 'utf8');

    // 3a. Remplacer <link rel="stylesheet" href="/src/css/xxx.css"> par le hash
    html = html.replace(/<link rel="stylesheet" href="(\/src\/css\/[^"]+)"/g, (_, ref) => {
      const hashed = cssMap[ref];
      return hashed
        ? `<link rel="stylesheet" href="${hashed}"`
        : `<link rel="stylesheet" href="${ref}"`;
    });

    // 3b. Remplacer <script src="js/xxx.js"> par le hash
    html = html.replace(/<script src="(js\/[^"]+)"/g, (_, ref) => {
      const hashed = jsMap[ref];
      return hashed ? `<script src="${hashed}"` : `<script src="${ref}"`;
    });

    // 3c. Remplacer <script src="data/xxx.js"> par le hash
    html = html.replace(/<script src="(data\/[^"]+)"/g, (_, ref) => {
      const hashed = jsMap[ref];
      return hashed ? `<script src="${hashed}"` : `<script src="${ref}"`;
    });

    // 3d. Minifier
    const min = await minifyHTML(html, HTML_OPTS);
    fs.writeFileSync(path.join(DIST, file), min);
    console.log(`✓ ${file.padEnd(35)} ${kb(html.length)} → ${kb(min.length)}  (${gain(html.length, min.length)})`);
  }
}

/* ══════════════════════════════════════════════════════════════════════════════
   4. FICHIERS STATIQUES
══════════════════════════════════════════════════════════════════════════════ */
function buildStatic() {
  console.log('\n── Static ──────────────────────────────────────────────────');
  const statics = ['favicon.svg', 'sitemap.xml', 'robots.txt'];
  for (const f of statics) {
    const src = path.join(SRC, f);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(DIST, f));
      console.log(`✓ ${f} (copié)`);
    }
  }

  // favicon.ico : créer un placeholder binaire 1x1 (évite 404)
  // Un vrai ICO 16x16 en base64 (format ICO minimal)
  const icoB64 = 'AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYWFg8WFhaPFhYWzxYWFs8WFhaPFhYWDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWFhaPFhYW/xYWFv8WFhb/FhYW/xYWFv8WFhaPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYWFo8WFhb/FhYW/xYWFv8WFhb/FhYW/xYWFo8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQED0BAQA/AQEBDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
  fs.writeFileSync(path.join(DIST, 'favicon.ico'), Buffer.from(icoB64, 'base64'));
  console.log('✓ favicon.ico (généré)');
}

/* ══════════════════════════════════════════════════════════════════════════════
   5. RAPPORT FINAL + ZIP
══════════════════════════════════════════════════════════════════════════════ */
async function run() {
  console.log('🏗  Africademia — Production Build\n' + '═'.repeat(55));

  await buildJS();
  await buildCSS();
  await buildHTML();
  buildStatic();

  // ZIP
  console.log('\n── ZIP ─────────────────────────────────────────────────────');
  const zipOut = path.join(SRC, '..', 'africademia-dist.zip');
  if (fs.existsSync(zipOut)) fs.unlinkSync(zipOut);
  execSync(`cd "${DIST}" && zip -r "${zipOut}" . -x "*.DS_Store"`, { stdio: 'inherit' });

  // Stats
  const distSize = execSync(`du -sh "${DIST}"`).toString().split('\t')[0];
  const zipSize  = execSync(`du -sh "${zipOut}"`).toString().split('\t')[0];
  const nbAssets = fs.readdirSync(path.join(DIST, 'assets')).length;
  console.log('\n' + '═'.repeat(55));
  console.log(`✅  Build OK`);
  console.log(`    dist/           ${distSize.padEnd(10)} (${nbAssets} assets hashés)`);
  console.log(`    africademia-dist.zip  ${zipSize}`);
  console.log(`    → ${zipOut}`);
}

run().catch(e => { console.error(e); process.exit(1); });
