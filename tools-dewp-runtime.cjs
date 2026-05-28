const fs = require('fs');
const path = require('path');

const root = __dirname;
const cssDir = path.join(root, 'css');
fs.mkdirSync(cssDir, { recursive: true });

function copyFileIfExists(from, to) {
  if (!fs.existsSync(from)) return false;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  return true;
}

function copyDirIfExists(from, to) {
  if (!fs.existsSync(from)) return false;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copyDirIfExists(src, dest);
    else fs.copyFileSync(src, dest);
  }
  return true;
}

copyFileIfExists(
  path.join(root, 'assets/vendor/wp-content/themes/zaglushka/style.css'),
  path.join(cssDir, 'theme.css')
);
copyFileIfExists(
  path.join(root, 'assets/vendor/wp-content/themes/zaglushka/fonts.css'),
  path.join(cssDir, 'theme-fonts.css')
);
copyDirIfExists(
  path.join(root, 'assets/vendor/wp-content/themes/zaglushka/fonts'),
  path.join(cssDir, 'fonts')
);
copyDirIfExists(
  path.join(root, 'assets/vendor/wp-content/themes/zaglushka/images'),
  path.join(cssDir, 'images')
);
copyFileIfExists(
  path.join(root, 'assets/vendor/wp-includes/css/dist/block-library/style.min.css'),
  path.join(cssDir, 'block-library.css')
);
copyFileIfExists(
  path.join(root, 'assets/vendor/wp-content/cache/busting/1/sccss.css'),
  path.join(cssDir, 'site-extra.css')
);
copyFileIfExists(
  path.join(root, 'assets/vendor/wp-content/plugins/elementor/assets/css/frontend.min.css'),
  path.join(cssDir, 'elementor-frontend.css')
);

const themeCss = path.join(cssDir, 'theme.css');
if (fs.existsSync(themeCss)) {
  let css = fs.readFileSync(themeCss, 'utf8');
  css = css.replace(/\/\*[\s\S]*?Theme Name:[\s\S]*?\*\//i, '').trimStart();
  fs.writeFileSync(themeCss, css);
}

const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html'));
let changed = 0;

for (const file of htmlFiles) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, 'utf8');
  const before = html;

  html = html
    .replace(/href="assets\/vendor\/wp-content\/themes\/zaglushka\/style\.css\?[^"]*"/g, 'href="css/theme.css"')
    .replace(/href="assets\/vendor\/wp-content\/themes\/zaglushka\/fonts\.css"/g, 'href="css/theme-fonts.css"')
    .replace(/href='assets\/vendor\/wp-includes\/css\/dist\/block-library\/style\.min\.css\?[^']*'/g, "href='css/block-library.css'")
    .replace(/href='assets\/vendor\/wp-content\/cache\/busting\/1\/sccss\.css\?[^']*'/g, "href='css/site-extra.css'")
    .replace(/href='assets\/vendor\/wp-content\/plugins\/elementor\/assets\/css\/frontend\.min\.css\?[^']*'/g, "href='css/elementor-frontend.css'");

  html = html.replace(/<script\s+type=["']speculationrules["'][\s\S]*?<\/script>\s*/gi, '');
  html = html.replace(/<script\b[^>]*id=["'](?:elementor-frontend-js-before|elementor-pro-frontend-js-before|wp-i18n-js-after)["'][^>]*>[\s\S]*?<\/script>\s*/gi, '');
  html = html.replace(/\/\*# sourceURL=assets\/vendor\/wp-includes\/css\/classic-themes\.min\.css \*\/\s*/g, '');
  html = html.replace(/<meta\s+name=["']generator["'][^>]*>\s*/gi, '');
  html = html.replace(/<!--\s*(?:WP|WordPress|Elementor|WP Rocket)[\s\S]*?-->\s*/gi, '');

  if (html !== before) {
    fs.writeFileSync(full, html);
    changed += 1;
  }
}

console.log(JSON.stringify({ htmlFiles: htmlFiles.length, changed }, null, 2));
