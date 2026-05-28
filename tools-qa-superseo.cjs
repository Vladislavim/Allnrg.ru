const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright-core');

const ROOT = __dirname;
const SITE = 'https://allnrg.ru';
const PORT = 8099;
const VIEWPORTS = [1920, 1440, 1366, 1024, 768, 390, 360];
const PAGES = JSON.parse(fs.readFileSync(path.join(ROOT, 'seo', 'seo-map.json'), 'utf8')).pages;
const VISUAL_COMPARE = ['/', '/uslugi-2/', '/promishlennoe-projectirovaniye/', '/our_projects/', '/o-nas/', '/kontakty/'];

function contentType(file) {
  if (file.endsWith('.html')) return 'text/html; charset=utf-8';
  if (file.endsWith('.css')) return 'text/css; charset=utf-8';
  if (file.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (file.endsWith('.xml')) return 'application/xml; charset=utf-8';
  if (file.endsWith('.txt')) return 'text/plain; charset=utf-8';
  if (file.endsWith('.webp')) return 'image/webp';
  if (file.endsWith('.png')) return 'image/png';
  if (file.endsWith('.jpg') || file.endsWith('.jpeg')) return 'image/jpeg';
  if (file.endsWith('.svg')) return 'image/svg+xml';
  if (file.endsWith('.woff2')) return 'font/woff2';
  if (file.endsWith('.woff')) return 'font/woff';
  return 'application/octet-stream';
}

function startServer() {
  const bySlug = new Map(PAGES.map((p) => [new URL(p.url).pathname, p.file]));
  bySlug.set('/', 'index.html');
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    let rel = bySlug.get(url.pathname) || decodeURIComponent(url.pathname.replace(/^\/+/, ''));
    if (!rel || rel.endsWith('/')) rel = path.join(rel, 'index.html');
    const file = path.resolve(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType(file) });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(PORT, '127.0.0.1', () => resolve(server)));
}

function edgePath() {
  const candidates = [
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ];
  return candidates.find((p) => fs.existsSync(p));
}

async function pageAudit(page, targetUrl, width) {
  await page.setViewportSize({ width, height: 1200 });
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(900);
  return page.evaluate(() => {
    const visible = (el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) !== 0 && r.width > 0 && r.height > 0;
    };
    const h1 = [...document.querySelectorAll('h1')].map((el) => el.textContent.trim()).filter(Boolean);
    const title = document.title;
    const description = document.querySelector('meta[name="description"]')?.content || '';
    const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
    const jsonLd = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => {
      try { JSON.parse(s.textContent); return true; } catch { return false; }
    });
    const footer = document.querySelector('footer');
    const footerBottom = footer ? footer.getBoundingClientRect().bottom + scrollY : 0;
    const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    const visibleAfterFooter = footer ? [...document.body.querySelectorAll('body > *')].filter((el) => {
      if (!visible(el)) return false;
      const r = el.getBoundingClientRect();
      const top = r.top + scrollY;
      const style = getComputedStyle(el);
      return style.position !== 'fixed' && top > footerBottom + 5;
    }).map((el) => el.tagName + (el.className ? '.' + String(el.className).split(/\s+/).slice(0, 2).join('.') : '')) : [];
    const beforeX = scrollX;
    window.scrollTo(99999, scrollY);
    const scrollOverflow = scrollX > beforeX + 2;
    window.scrollTo(beforeX, scrollY);
    const emptyLinks = [...document.querySelectorAll('a')].filter((a) => !a.textContent.trim() && !a.getAttribute('aria-label') && !a.getAttribute('title')).length;
    const badImages = [...document.querySelectorAll('img')].filter((img) => !img.hasAttribute('alt')).length;
    return {
      h1Count: h1.length,
      title,
      descriptionLength: description.length,
      canonical,
      jsonLdValid: jsonLd.length > 0 && jsonLd.every(Boolean),
      horizontalOverflow: scrollOverflow,
      emptyLinks,
      badImages,
      visibleAfterFooter,
      docHeight
    };
  });
}

async function visualMetric(page, localUrl, prodUrl, width) {
  await page.setViewportSize({ width, height: 1200 });
  await page.goto(localUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(1200);
  const local = await page.screenshot({ fullPage: true });
  await page.goto(prodUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(1200);
  const prod = await page.screenshot({ fullPage: true });
  return { width, localBytes: local.length, prodBytes: prod.length, comparable: local.length > 10000 && prod.length > 10000 };
}

async function main() {
  const server = await startServer();
  const executablePath = edgePath();
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage();
  const failures = [];
  const checks = [];

  for (const p of PAGES) {
    const localPath = new URL(p.url).pathname;
    for (const width of VIEWPORTS) {
      const result = await pageAudit(page, `http://127.0.0.1:${PORT}${localPath}`, width);
      checks.push({ file: p.file, width, ...result });
      if (result.h1Count !== 1 || result.descriptionLength < 50 || !result.canonical.startsWith(SITE) || !result.jsonLdValid || result.horizontalOverflow || result.badImages || result.emptyLinks || result.visibleAfterFooter.length) {
        failures.push({ file: p.file, width, result });
      }
    }
  }

  const visual = [];
  for (const slug of VISUAL_COMPARE) {
    for (const width of [1440, 390]) {
      visual.push({ slug, ...(await visualMetric(page, `http://127.0.0.1:${PORT}${slug}`, `${SITE}${slug}`, width)) });
    }
  }

  await browser.close();
  server.close();

  const report = {
    generatedAt: new Date().toISOString(),
    viewportWidths: VIEWPORTS,
    pagesChecked: PAGES.length,
    checks: checks.length,
    failures,
    visualCompare: visual
  };
  fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'reports', 'qa-superseo.json'), JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'reports', 'qa-superseo.md'), [
    '# SuperSEO QA',
    '',
    `Generated: ${report.generatedAt}`,
    `Pages checked: ${report.pagesChecked}`,
    `Viewport checks: ${report.checks}`,
    `Failures: ${failures.length}`,
    '',
    '## Visual smoke compare',
    '',
    ...visual.map((v) => `- ${v.slug} @ ${v.width}px: local ${v.localBytes} bytes, prod ${v.prodBytes} bytes, comparable=${v.comparable}`),
    '',
    '## Failures',
    '',
    failures.length ? JSON.stringify(failures.slice(0, 30), null, 2) : 'No failures.'
  ].join('\n'), 'utf8');

  console.log(JSON.stringify({ pagesChecked: PAGES.length, viewportChecks: checks.length, failures: failures.length, report: 'reports/qa-superseo.md' }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
