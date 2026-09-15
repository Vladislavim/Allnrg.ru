const fs = require('fs');
const path = require('path');

const root = __dirname;
const pages = fs.readdirSync(root).filter((name) => name.endsWith('.html')).sort();
const site = 'https://allnrg.ru';
const favicon = 'assets/img/2025/11/cropped-fav-2-32x32.png';
const faviconBlock = [
  '<link rel="icon" type="image/png" sizes="32x32" href="/assets/img/2025/11/cropped-fav-2-32x32.png">',
  '<link rel="icon" type="image/png" sizes="192x192" href="/assets/img/2025/11/cropped-fav-2-192x192.png">',
  '<link rel="apple-touch-icon" sizes="180x180" href="/assets/img/2025/11/cropped-fav-2-180x180.png">'
].join('\n');
const pageMapPath = path.join(root, 'PAGE_MAP.json');
const fileToSlug = fs.existsSync(pageMapPath)
  ? new Map(JSON.parse(fs.readFileSync(pageMapPath, 'utf8')).map((page) => [page.file, page.slug]))
  : new Map();

function pageUrl(file) {
  const slug = fileToSlug.get(file);
  if (!slug || slug === '/') return file === 'index.html' ? `${site}/` : `${site}/${file.replace(/\.html$/, '')}/`;
  return `${site}/${String(slug).replace(/^\/+|\/+$/g, '')}/`;
}

function cleanHead(html, file) {
  html = html.replace(/\s*<link\s+rel=["']stylesheet["']\s+href=["']assets\/img\/elementor\/google-fonts\/css\/montserrat\.css["']\s*>\s*/gi, '\n');

  if (!/<link[^>]+rel=["']icon["']/i.test(html)) {
    html = html.replace(/<\/head>/i, `  ${faviconBlock}\n</head>`);
  }

  const canonical = `<link rel="canonical" href="${pageUrl(file)}">`;
  if (/<link[^>]+rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(/<link[^>]+rel=["']canonical["'][^>]*>/i, canonical);
  } else {
    html = html.replace(/<\/head>/i, `  ${canonical}\n</head>`);
  }

  return html;
}

function removeServiceJunk(html) {
  html = html.replace(/<p[^>]*>\s*<a\b[^>]*href=["']https?:\/\/nullgrand\.com\/?["'][^>]*>\s*<\/a>\s*<\/p>/gi, '');
  html = html.replace(/<a\b[^>]*href=["']https?:\/\/nullgrand\.com\/?["'][^>]*>\s*<\/a>/gi, '');
  html = html.replace(/<a\b([^>]*)>\s*<\/a>/gi, (match, attrs) => {
    if (/href=/i.test(attrs)) return '';
    return match;
  });
  html = html.replace(/\[contact-form-7[^\]]*]/gi, '');
  html = html.replace(/Theme by WordPress/gi, '');
  return html;
}

function fixSvgPathData(html) {
  return html.replace(/(<path\b[^>]*\bd=["'])([^"']*)(["'][^>]*>)/gi, (match, before, d, after) => {
    return `${before}${d.replace(/л/g, 'l')}${after}`;
  });
}

function addIframeAttrs(html) {
  return html.replace(/<iframe\b([^>]*)>/gi, (match, attrs) => {
    let next = attrs;
    if (!/\bloading=/i.test(next)) next += ' loading="lazy"';
    if (!/\btitle=/i.test(next)) next += ' title="Карта проезда к офису Альянс Энерджи"';
    return `<iframe${next}>`;
  });
}

function textFromAttributes(attrs) {
  const href = (attrs.match(/\bhref=["']([^"']+)["']/i) || [])[1] || '';
  if (/^tel:/i.test(href)) return 'Позвонить';
  if (/^mailto:/i.test(href)) return 'Написать на почту';
  if (/telegram|t\.me/i.test(href)) return 'Telegram';
  if (/whatsapp|wa\.me/i.test(href)) return 'WhatsApp';
  if (/max\.ru/i.test(href)) return 'MAX';
  if (/vk\.com/i.test(href)) return 'ВКонтакте';
  return '';
}

function addAccessibleNames(html) {
  html = html.replace(/<a\b([^>]*?)>(\s*<img\b[^>]*\balt=["']([^"']*)["'][^>]*>\s*)<\/a>/gi, (match, attrs, body, alt) => {
    if (/\baria-label=/i.test(attrs)) return match;
    const label = (alt || textFromAttributes(attrs) || 'Ссылка').trim();
    return `<a${attrs} aria-label="${label.replace(/"/g, '&quot;')}">${body}</a>`;
  });

  html = html.replace(/<a\b([^>]*\bhref=["'][^"']+["'][^>]*)>/gi, (match, attrs) => {
    if (/\baria-label=/i.test(attrs)) return match;
    const label = textFromAttributes(attrs);
    if (!label) return match;
    return `<a${attrs} aria-label="${label}">`;
  });

  html = html.replace(/<button\b([^>]*)>\s*(<svg\b[\s\S]*?<\/svg>)\s*<\/button>/gi, (match, attrs, svg) => {
    if (/\baria-label=/i.test(attrs)) return match;
    return `<button${attrs} aria-label="Открыть">${svg}</button>`;
  });

  return html;
}

function normalizeBadLinks(html) {
  html = html.replace(/href="privacy\.html"\.html"/g, 'href="/privacy/"');
  html = html.replace(/href="obrabotka-pers-dannih\.html"\.html"/g, 'href="/obrabotka-pers-dannih/"');
  return html;
}

function writeSeoFiles() {
  const urls = pages.map((file) => `  <url><loc>${pageUrl(file)}</loc></url>`).join('\n');
  fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, 'utf8');
  fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`, 'utf8');

  const source = path.join(root, favicon);
  const target = path.join(root, 'favicon.ico');
  if (fs.existsSync(source) && !fs.existsSync(target)) {
    fs.copyFileSync(source, target);
  }
}

let changed = 0;
for (const file of pages) {
  const full = path.join(root, file);
  const before = fs.readFileSync(full, 'utf8');
  let html = before;
  html = cleanHead(html, file);
  html = removeServiceJunk(html);
  html = fixSvgPathData(html);
  html = addIframeAttrs(html);
  html = addAccessibleNames(html);
  html = normalizeBadLinks(html);
  if (html !== before) {
    fs.writeFileSync(full, html, 'utf8');
    changed += 1;
  }
}

writeSeoFiles();
console.log(JSON.stringify({ pages: pages.length, changed, seoFiles: ['robots.txt', 'sitemap.xml', 'favicon.ico'] }, null, 2));
