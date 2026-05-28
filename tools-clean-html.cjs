const fs = require('fs');
const path = require('path');
const root = 'clean';

// Fix local Elementor Google font CSS URLs.
const fontCssDir = path.join(root, 'assets/img/elementor/google-fonts/css');
if (fs.existsSync(fontCssDir)) {
  for (const file of fs.readdirSync(fontCssDir).filter(f => f.endsWith('.css'))) {
    const p = path.join(fontCssDir, file);
    let css = fs.readFileSync(p, 'utf8');
    css = css.replace(/https?:\/\/allnrg\.ru\/wp-content\/uploads\/elementor\/google-fonts\/fonts\//g, '../fonts/');
    fs.writeFileSync(p, css, 'utf8');
  }
}

const removeIds = [
  'rs-plugin-settings-css',
  'wdkit-review-form-plugin-css',
  'popup-maker-site-css',
  'dashicons-css',
  'elementor-icons-css',
  'elementor-pro-css',
  'eael-general-css',
  'sib-front-css-css',
  'elementor-gf-local-roboto-css',
  'elementor-gf-local-robotoslab-css'
];
const removeScriptIds = [
  'sib-front-js-js-extra',
  'wdkit-review-form-plugin-js-extra',
  'eael-general-js-extra',
  'essential-blocks-eb-animation-loadmore-frontend-js-extra'
];

for (const name of fs.readdirSync(root).filter(f => f.endsWith('.html'))) {
  const p = path.join(root, name);
  let html = fs.readFileSync(p, 'utf8');

  // Remove malformed dns-prefetch and external CSS links.
  html = html.replace(/<link\b[^>]*(?:cdnjs\.cloudflare\.com|unpkg\.com|fonts\.googleapis\.com)[^>]*>\s*/gi, '');
  html = html.replace(/@import\s+url\(['"]?https:\/\/fonts\.googleapis\.com[^;]+;?/gi, '');
  html = html.replace(/<link\b[^>]*rel=['"]dns-prefetch['"][^>]*>\s*/gi, '');
  for (const id of removeIds) {
    html = html.replace(new RegExp(`<link\\b[^>]*id=['"]${id}['"][^>]*>\\s*`, 'gi'), '');
  }
  for (const id of removeScriptIds) {
    html = html.replace(new RegExp(`<script\\b[^>]*id=['"]${id}['"][^>]*>[\\s\\S]*?<\\/script>\\s*`, 'gi'), '');
  }

  // Remove Yandex Metrika runtime and noscript pixel.
  html = html.replace(/<script\b[^>]*>[\s\S]*?mc\.yandex\.ru\/metrika\/tag\.js[\s\S]*?<\/script>\s*/gi, '');
  html = html.replace(/<noscript>[\s\S]*?mc\.yandex\.ru\/watch\/[\s\S]*?<\/noscript>\s*/gi, '');

  // Drop broken localized popup-maker URL remnants.
  html = html.replace(/<link\b[^>]*index\.html"\/allnrg\.ruassets\/img\/pum\/pum-site-styles\.css[^>]*>\s*/gi, '');

  // Add one local Montserrat stylesheet after charset/meta area if missing.
  if (!html.includes('assets/img/elementor/google-fonts/css/montserrat.css')) {
    html = html.replace(/(<meta charset=[^>]+>\s*)/i, `$1<link rel="stylesheet" href="assets/img/elementor/google-fonts/css/montserrat.css">\n`);
  }

  fs.writeFileSync(p, html, 'utf8');
}
console.log('cleaned global CSS/script noise');
