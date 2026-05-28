const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const root = path.resolve('clean');
const htmlFiles = fs.readdirSync(root).filter(f => f.endsWith('.html')).map(f => path.join(root, f));
const imageExt = /\.(png|jpe?g)$/i;
const skipName = /(favicon|cropped-fav|apple-touch|tileimage)/i;
const metaCache = new Map();

(async () => {

function cleanRef(ref) {
  return ref.replace(/&amp;/g, '&').replace(/&#038;/g, '&').split('?')[0].split('#')[0];
}
function abs(ref) { return path.join(root, ref.replace(/\//g, path.sep)); }
function toWebpRef(ref) {
  const clean = cleanRef(ref);
  if (!clean.startsWith('assets/img/') || !imageExt.test(clean) || skipName.test(clean)) return null;
  const rel = clean.replace(/^assets\/img\//, '').replace(imageExt, '.webp');
  return 'assets/optimized/' + rel.replace(/\\/g, '/');
}
async function metadata(ref) {
  const p = abs(cleanRef(ref));
  if (!fs.existsSync(p)) return null;
  if (metaCache.has(p)) return metaCache.get(p);
  try {
    const m = await sharp(p).metadata();
    const data = { width: m.width, height: m.height };
    metaCache.set(p, data);
    return data;
  } catch { return null; }
}

const refs = new Set();
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(/(?:src=["']([^"']+)["'])|(?:url\(["']?([^"')]+)["']?\))/g)) {
    const ref = cleanRef(m[1] || m[2] || '');
    if (toWebpRef(ref) && fs.existsSync(abs(ref))) refs.add(ref);
  }
}

let converted = 0;
let before = 0;
let after = 0;
for (const ref of refs) {
  const src = abs(ref);
  const outRef = toWebpRef(ref);
  const out = abs(outRef);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const srcSize = fs.statSync(src).size;
  before += srcSize;
  if (!fs.existsSync(out)) {
    await sharp(src).webp({ quality: 82, effort: 5 }).toFile(out);
  }
  const outSize = fs.statSync(out).size;
  after += outSize;
  converted++;
}

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');

  html = html.replace(/url\((["']?)(assets\/img\/[^"')]+?\.(?:png|jpe?g)(?:\?[^"')]+)?)\1\)/gi, (match, q, ref) => {
    const out = toWebpRef(ref);
    return out ? `url(${q}${out}${q})` : match;
  });

  html = html.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/\ssrc=["']([^"']+)["']/i);
    let newTag = tag;
    if (!srcMatch) return newTag;
    const oldSrc = srcMatch[1];
    const out = toWebpRef(oldSrc);
    if (out) newTag = newTag.replace(oldSrc, out);
    if (!/\salt=/i.test(newTag)) newTag = newTag.replace(/<img\b/i, '<img alt=""');
    if (!/\sdecoding=/i.test(newTag)) newTag = newTag.replace(/<img\b/i, '<img decoding="async"');
    if (!/\sloading=/i.test(newTag)) newTag = newTag.replace(/<img\b/i, '<img loading="lazy"');
    return newTag;
  });

  fs.writeFileSync(file, html, 'utf8');
}

// second async pass for width/height; keep it conservative and only add when both are missing
for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');
  const tags = [...html.matchAll(/<img\b[^>]*>/gi)].map(m => m[0]);
  for (const tag of tags) {
    if (/\swidth=/i.test(tag) && /\sheight=/i.test(tag)) continue;
    const src = tag.match(/\ssrc=["']([^"']+)["']/i)?.[1];
    if (!src || !src.startsWith('assets/')) continue;
    const m = await metadata(src);
    if (!m?.width || !m?.height) continue;
    let next = tag;
    if (!/\swidth=/i.test(next)) next = next.replace(/<img\b/i, `<img width="${m.width}"`);
    if (!/\sheight=/i.test(next)) next = next.replace(/<img\b/i, `<img height="${m.height}"`);
    html = html.replace(tag, next);
  }
  fs.writeFileSync(file, html, 'utf8');
}

console.log(JSON.stringify({ pages: htmlFiles.length, converted, beforeMB: +(before/1048576).toFixed(2), afterMB: +(after/1048576).toFixed(2), savedMB: +((before-after)/1048576).toFixed(2) }, null, 2));

})().catch(err => { console.error(err); process.exit(1); });

