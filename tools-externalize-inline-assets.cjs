const fs = require('fs');
const path = require('path');

const root = __dirname;
const cssDir = path.join(root, 'css', 'pages');
const jsDir = path.join(root, 'js', 'pages');
fs.mkdirSync(cssDir, { recursive: true });
fs.mkdirSync(jsDir, { recursive: true });

const pages = fs.readdirSync(root).filter((name) => name.endsWith('.html')).sort();
const summary = [];

for (const file of pages) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, 'utf8');
  const base = file.replace(/\.html$/, '');
  const cssHref = `css/pages/${base}.css`;
  const jsSrc = `js/pages/${base}.js`;

  if (html.includes(cssHref) || html.includes(jsSrc)) {
    summary.push({ file, skipped: true });
    continue;
  }

  const styles = [];
  html = html.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
    if (!css.trim()) return '';
    styles.push(css.trim());
    return '';
  });

  const scripts = [];
  html = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (match, attrs, js) => {
    if (/\bsrc=/i.test(attrs)) return match;
    if (/type=["']application\/ld\+json["']/i.test(attrs)) return match;
    if (!js.trim()) return '';
    scripts.push(js.trim());
    return '';
  });

  if (styles.length) {
    fs.writeFileSync(path.join(cssDir, `${base}.css`), styles.map((css, i) => `/* inline style ${i + 1} */\n${css}`).join('\n\n'), 'utf8');
    html = html.replace(/<\/head>/i, `  <link rel="stylesheet" href="${cssHref}">\n</head>`);
  }

  if (scripts.length) {
    fs.writeFileSync(path.join(jsDir, `${base}.js`), scripts.map((js, i) => `/* inline script ${i + 1} */\n${js}`).join('\n\n'), 'utf8');
    html = html.replace(/<\/body>/i, `  <script src="${jsSrc}" defer></script>\n</body>`);
  }

  fs.writeFileSync(full, html, 'utf8');
  summary.push({ file, styles: styles.length, scripts: scripts.length });
}

console.log(JSON.stringify(summary, null, 2));
