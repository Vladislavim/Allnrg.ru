const fs = require('fs');
const path = require('path');
const root = 'clean';
const imageExt = /\.(png|jpe?g)(\?[^"']*)?$/i;
const skipName = /(favicon|cropped-fav|apple-touch|tileimage)/i;
function toWebp(ref) {
  const clean = ref.replace(/&amp;/g,'&').replace(/&#038;/g,'&');
  const base = clean.split('?')[0].split('#')[0];
  if (!base.startsWith('assets/img/') || !imageExt.test(base) || skipName.test(base)) return null;
  const out = 'assets/optimized/' + base.replace(/^assets\/img\//,'').replace(/\.(png|jpe?g)$/i,'.webp');
  return fs.existsSync(path.join(root, out)) ? out : null;
}
for (const file of fs.readdirSync(root).filter(f => f.endsWith('.html'))) {
  const p = path.join(root, file);
  let html = fs.readFileSync(p, 'utf8');
  html = html.replace(/\b(src|href|data-src|data-bg)=(["'])(assets\/img\/[^"']+?\.(?:png|jpe?g)(?:\?[^"']*)?)\2/gi, (m, attr, q, ref) => {
    const out = toWebp(ref);
    return out ? `${attr}=${q}${out}${q}` : m;
  });
  html = html.replace(/url\((["']?)(assets\/img\/[^"')]+?\.(?:png|jpe?g)(?:\?[^"')]+)?)\1\)/gi, (m, q, ref) => {
    const out = toWebp(ref);
    return out ? `url(${q}${out}${q})` : m;
  });
  fs.writeFileSync(p, html, 'utf8');
}
console.log('rewrote image-like attributes to webp');
