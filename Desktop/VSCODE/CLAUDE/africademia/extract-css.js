#!/usr/bin/env node
/**
 * Extrait les blocs <style> de chaque HTML → src/css/[page].css
 * et remplace par <link rel="stylesheet" href="/src/css/[page].css">
 */
const fs   = require('fs');
const path = require('path');

const SRC_DIR = __dirname;
const CSS_DIR = path.join(__dirname, 'src', 'css');
if (!fs.existsSync(CSS_DIR)) fs.mkdirSync(CSS_DIR, { recursive: true });

const PAGES = [
  'direction-afromodern',
  'connexion',
  'espace-client',
  'admin',
  'admin-formations',
  'formations',
  'formation-detail',
  'notre-histoire',
  'service-web',
  'service-ia',
  'service-marketing',
  'service-publicite',
  'service-hebergement',
  'service-detail',
  'projet-detail',
];

for (const page of PAGES) {
  const htmlPath = path.join(SRC_DIR, `${page}.html`);
  if (!fs.existsSync(htmlPath)) { console.warn(`⚠ ${page}.html manquant`); continue; }

  let html = fs.readFileSync(htmlPath, 'utf8');

  // Extraire TOUS les blocs <style>...</style>
  const styleBlocks = [];
  html = html.replace(/<style>([\s\S]*?)<\/style>/g, (_, css) => {
    styleBlocks.push(css.trim());
    return '';
  });

  if (styleBlocks.length === 0) {
    console.log(`⚠ ${page}.html — aucun bloc <style> trouvé`);
    continue;
  }

  const css = styleBlocks.join('\n\n');
  const cssFile = `${page}.css`;
  const cssPath = path.join(CSS_DIR, cssFile);
  fs.writeFileSync(cssPath, css);

  // Injecter le lien CSS juste après <meta name="viewport"...>
  const linkTag = `<link rel="stylesheet" href="/src/css/${cssFile}">`;
  html = html.replace(/(<meta name="viewport"[^>]*>)/, `$1\n${linkTag}`);

  fs.writeFileSync(htmlPath, html);
  console.log(`✓ ${page}.html → src/css/${cssFile} (${(css.length/1024).toFixed(0)} KB CSS)`);
}

console.log('\n✓ Extraction CSS terminée');
