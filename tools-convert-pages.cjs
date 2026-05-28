const fs = require('fs');
const path = require('path');

const root = path.resolve('source-extract/wp-content/cache/wp-rocket/allnrg.ru');
const outRoot = path.resolve('clean');
const aliases = new Map([
  ['', 'index.html'],
  ['uslugi-2', 'services.html'],
  ['our_projects', 'projects.html'],
  ['news', 'news.html'],
  ['o-nas', 'about.html'],
  ['kontakty', 'contacts.html'],
]);

function pageName(slug) {
  if (aliases.has(slug)) return aliases.get(slug);
  return slug.replace(/[\\/]+/g, '-').replace(/^-|-$/g, '') + '.html';
}

const pages = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === 'index-https.html') {
      const relDir = path.relative(root, path.dirname(full)).replace(/\\/g, '/');
      pages.push({ slug: relDir === '' ? '' : relDir, src: full, dest: path.join(outRoot, pageName(relDir === '' ? '' : relDir)) });
    }
  }
}
walk(root);
const slugToFile = new Map(pages.map(p => [p.slug, path.basename(p.dest)]));
const sortedSlugs = [...slugToFile.keys()].filter(Boolean).sort((a,b)=>b.length-a.length);

function localize(html) {
  html = html.replace(/https?:\/\/allnrg\.ru\/wp-content\/uploads\//g, 'assets/img/');
  html = html.replace(/\/wp-content\/uploads\//g, 'assets/img/');
  html = html.replace(/https?:\/\/allnrg\.ru\/wp-content\//g, 'assets/vendor/wp-content/');
  html = html.replace(/\/wp-content\//g, 'assets/vendor/wp-content/');
  html = html.replace(/https?:\/\/allnrg\.ru\/wp-includes\//g, 'assets/vendor/wp-includes/');
  html = html.replace(/\/wp-includes\//g, 'assets/vendor/wp-includes/');
  html = html.replace(/\/\/allnrg\.ru\/wp-content\/uploads\//g, 'assets/img/');
  html = html.replace(/\/\/allnrg\.ru\/wp-content\//g, 'assets/vendor/wp-content/');
  html = html.replace(/\/\/allnrg\.ru\/wp-includes\//g, 'assets/vendor/wp-includes/');
  html = html.replace(/https?:\/\/allnrg\.ru\/wp-admin\/admin-ajax\.php/g, '#');
  html = html.replace(/assets\/vendorassets\/vendor\//g, 'assets/vendor/');
  html = html.replace(/<script\b(?=[^>]*\bsrc=)[^>]*><\/script>\s*/gi, '');
  html = html.replace(/<link\s+rel=["'](?:alternate|EditURI)[^>]*>\s*/gi, '');
  html = html.replace(/<meta\s+name=["']generator["'][^>]*>\s*/gi, '');

  for (const slug of sortedSlugs) {
    const file = slugToFile.get(slug);
    const escaped = slug.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(`https?:\\/\\/allnrg\\.ru\\/${escaped}\\/?`, 'g'), file);
    html = html.replace(new RegExp(`\.\\/${escaped}\\/?`, 'g'), file);
    html = html.replace(new RegExp(`href=["']?\\/${escaped}\\/?["']?`, 'g'), `href="${file}"`);
    html = html.replace(new RegExp(`href=["']?${escaped}\\/?["']?`, 'g'), `href="${file}"`);
  }
  html = html.replace(/https?:\/\/allnrg\.ru\//g, 'index.html');
  html = html.replace(/href=["']?\.?\/["']?/g, 'href="index.html"');
  html = html.replace(/href=([a-z0-9._-]+\.html)"/gi, 'href="$1"');
  html = html.replace(/href=([a-z0-9._-]+\.html)'/gi, "href='$1'");
  html = html.replace(/window\.location\.href\s*=\s*([a-z0-9._-]+\.html)'/gi, "window.location.href = '$1'");
  html = html.replace(/href\.endsWith\(([a-z0-9._-]+\.html)'\)/gi, "href.endsWith('$1')");
  return html;
}

for (const page of pages) {
  const html = localize(fs.readFileSync(page.src, 'utf8'));
  fs.writeFileSync(page.dest, html, 'utf8');
}
fs.writeFileSync(path.join(outRoot, 'PAGE_MAP.json'), JSON.stringify(pages.map(p => ({ slug: p.slug || '/', file: path.basename(p.dest) })).sort((a,b)=>a.file.localeCompare(b.file)), null, 2));
console.log(`converted ${pages.length} pages`);
