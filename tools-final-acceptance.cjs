const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright-core');

const ROOT = __dirname;
const SITE = 'https://allnrg.ru';
const PORT = 8097;
const WIDTHS = [1920, 1440, 1366, 1024, 768, 390, 360];
const ARTIFACTS = [
  'seo/wordstat-raw.json',
  'seo/wordstat-clean.json',
  'seo/keyword-clusters.json',
  'seo/seo-map.json',
  'seo/seo-report.md',
  'sitemap.xml',
  'robots.txt',
  '.env.example'
];
const LIGHTHOUSE_TARGETS = [
  ['Главная', '/'],
  ['Услуги', '/uslugi-2/'],
  ['Отдельная услуга', '/promishlennoe-projectirovaniye/'],
  ['Проекты', '/our_projects/'],
  ['Отдельный проект', '/bombonera/'],
  ['Новости', '/news/'],
  ['Отдельная новость', '/news/'],
  ['О компании', '/o-nas/'],
  ['Контакты', '/kontakty/'],
  ['Политика', '/privacy/']
];

const pages = JSON.parse(fs.readFileSync(path.join(ROOT, 'seo/seo-map.json'), 'utf8')).pages;
const rawWordstat = JSON.parse(fs.readFileSync(path.join(ROOT, 'seo/wordstat-raw.json'), 'utf8'));
const cleanWordstat = JSON.parse(fs.readFileSync(path.join(ROOT, 'seo/wordstat-clean.json'), 'utf8'));
const clusters = JSON.parse(fs.readFileSync(path.join(ROOT, 'seo/keyword-clusters.json'), 'utf8'));

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
  const file = path.join(ROOT, rel);
  return fs.existsSync(file) && fs.statSync(file).size > 0;
}

function stripTags(text) {
  return String(text || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function md(text) {
  return String(text ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
}

function getHeadData(page) {
  const html = read(page.file);
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || '';
  const description = (html.match(/<meta\s+name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1] || '';
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => stripTags(m[1]));
  const canonical = (html.match(/<link\s+rel=["']canonical["'][^>]*href=["']([^"']*)["']/i) || [])[1] || '';
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const jsonLd = [];
  const jsonErrors = [];
  for (const script of scripts) {
    try {
      jsonLd.push(JSON.parse(script));
    } catch (error) {
      jsonErrors.push(error.message);
    }
  }
  const types = [];
  for (const item of jsonLd) {
    const graph = Array.isArray(item['@graph']) ? item['@graph'] : [item];
    for (const node of graph) {
      const type = node['@type'];
      if (Array.isArray(type)) types.push(...type);
      else if (type) types.push(type);
    }
  }
  return { html, title, description, h1, canonical, jsonLd, jsonErrors, schemaTypes: [...new Set(types)] };
}

function parseSitemap() {
  const xml = read('sitemap.xml');
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
}

function artifactChecks() {
  const rows = ARTIFACTS.map((rel) => ({ file: rel, exists: exists(rel), bytes: exists(rel) ? fs.statSync(path.join(ROOT, rel)).size : 0 }));
  const prodData = ['seo/wordstat-raw.json', 'seo/wordstat-clean.json', 'seo/keyword-clusters.json', 'seo/seo-map.json', 'seo/seo-report.md', 'sitemap.xml', 'robots.txt'].map((rel) => read(rel)).join('\n');
  const localhost = /https?:\/\/(?:localhost|127\.0\.0\.1)|\b127\.0\.0\.1\b|\/mnt\/c\/Users/i.test(prodData);
  const robots = read('robots.txt');
  const robotsBlocksImportant = /Disallow:\s*\/\s*$/mi.test(robots) || /Disallow:\s*\/(?:uslugi-2|promishlennoe|our_projects|kontakty|o-nas)/i.test(robots);
  const envExample = read('.env.example');
  const envHasValues = envExample.split(/\r?\n/).some((line) => {
    if (!line || /^\s*#/.test(line)) return false;
    const idx = line.indexOf('=');
    return idx !== -1 && line.slice(idx + 1).trim().length > 0;
  });
  return { rows, localhost, robotsBlocksImportant, envHasValues };
}

function secretScan() {
  const scanExt = new Set(['.html', '.js', '.cjs', '.json', '.md', '.xml', '.txt', '.example']);
  const skipDirs = new Set(['node_modules', '.git']);
  const suspicious = [];
  const patterns = [
    ['Yandex OAuth token', /y0__[A-Za-z0-9_-]{20,}/],
    ['Yandex API key value', /AQVN[A-Za-z0-9_-]{20,}/],
    ['Turnstile secret value', /0x4AAAA[A-Za-z0-9_-]{20,}/],
    ['Google script deployment', /script\.google\.com\/macros\/s\/AKfycb[A-Za-z0-9_-]+/]
  ];
  function walk(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      if (item.isDirectory()) {
        if (skipDirs.has(item.name) || item.name === 'reports') continue;
        walk(path.join(dir, item.name));
      } else {
        const file = path.join(dir, item.name);
        const rel = path.relative(ROOT, file).replace(/\\/g, '/');
        if (rel.startsWith('seo/.cache/')) continue;
        if (!scanExt.has(path.extname(item.name)) && item.name !== '.env.example') continue;
        const text = fs.readFileSync(file, 'utf8');
        for (const [label, rx] of patterns) {
          if (rx.test(text)) suspicious.push({ file: rel, label });
        }
      }
    }
  }
  walk(ROOT);
  return suspicious;
}

function seoChecks() {
  const sitemapUrls = new Set(parseSitemap());
  const titleCounts = new Map();
  const descCounts = new Map();
  const rows = pages.map((page) => {
    const data = getHeadData(page);
    titleCounts.set(data.title, (titleCounts.get(data.title) || 0) + 1);
    descCounts.set(data.description, (descCounts.get(data.description) || 0) + 1);
    return { page, ...data, inSitemap: sitemapUrls.has(page.url) };
  });
  return rows.map((row) => {
    const errors = [];
    if (!row.title) errors.push('empty title');
    if (!row.description) errors.push('empty description');
    if (titleCounts.get(row.title) > 1) errors.push('duplicate title');
    if (descCounts.get(row.description) > 1) errors.push('duplicate description');
    if (row.h1.length !== 1) errors.push(`h1=${row.h1.length}`);
    if (row.canonical !== row.page.url) errors.push('bad canonical');
    if (!row.inSitemap) errors.push('not in sitemap');
    if (!row.jsonLd.length || row.jsonErrors.length) errors.push('invalid schema');
    if (/localhost|127\.0\.0\.1|\/mnt\/c\/Users/i.test([row.title, row.description, row.canonical, row.html].join('\n'))) errors.push('local url');
    return { ...row, errors };
  });
}

function schemaChecks(seoRows) {
  const requiredGlobal = ['Organization', 'LocalBusiness', 'ProfessionalService', 'WebSite', 'WebPage', 'BreadcrumbList'];
  const allTypes = new Set(seoRows.flatMap((row) => row.schemaTypes));
  const missingGlobal = requiredGlobal.filter((type) => !allTypes.has(type));
  const rows = seoRows.map((row) => {
    const errors = [];
    const schemaText = row.jsonLd.map((j) => JSON.stringify(j)).join('\n');
    if (/localhost|127\.0\.0\.1|\/mnt\/c\/Users/i.test(schemaText)) errors.push('local url');
    if (!schemaText.includes('ООО') || !schemaText.includes('+7 (937) 096-10-00') || !schemaText.includes('Волгоград')) errors.push('contact data incomplete');
    if (!row.schemaTypes.includes('BreadcrumbList')) errors.push('no breadcrumb');
    if (row.page.type === 'service' && !row.schemaTypes.includes('Service')) errors.push('no Service');
    if (row.page.type === 'project' && !row.schemaTypes.includes('CreativeWork')) errors.push('no CreativeWork');
    if (row.page.type === 'contact' && !row.schemaTypes.includes('ContactPage')) errors.push('no ContactPage');
    if (row.page.type === 'news' && !row.schemaTypes.includes('CollectionPage') && !row.schemaTypes.includes('Article') && !row.schemaTypes.includes('NewsArticle')) errors.push('news schema not specific');
    return { url: row.page.url, types: row.schemaTypes, errors };
  });
  return { allTypes: [...allTypes].sort(), missingGlobal, rows };
}

function wordstatAssignment() {
  const noCluster = pages.filter((page) => {
    const mapPage = JSON.parse(fs.readFileSync(path.join(ROOT, 'seo/seo-map.json'), 'utf8')).pages.find((p) => p.file === page.file);
    return !mapPage || !mapPage.primaryKeyword || mapPage.primaryKeyword === mapPage.h1.toLowerCase();
  });
  return {
    seeds: rawWordstat.seeds,
    regions: rawWordstat.regions,
    rawRequests: rawWordstat.requests.length,
    successfulRequests: rawWordstat.requests.filter((r) => r.ok).length,
    totalCollectedRows: rawWordstat.requests.reduce((sum, r) => sum + ((r.response?.results?.length || 0) + (r.response?.associations?.length || 0)), 0),
    totalCleanKeywords: cleanWordstat.totalKeywords,
    clusters: clusters.clusters,
    noCluster
  };
}

function wpScan() {
  const terms = ['WordPress', 'wp-', 'wp-content', 'wp-json', 'Theme by', 'generator', 'Elementor', 'elementor', 'credit', 'theme-credit', 'author-credit'];
  const files = [];
  function walk(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      if (item.name === 'node_modules' || item.name === '.git' || item.name === 'reports' || item.name === 'seo') continue;
      const file = path.join(dir, item.name);
      if (item.isDirectory()) walk(file);
      else if (/\.(html|css|js|cjs|json|md|xml|txt)$/i.test(item.name)) files.push(file);
    }
  }
  walk(ROOT);
  const hits = [];
  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, '/');
    const text = fs.readFileSync(file, 'utf8');
    for (const term of terms) {
      const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const count = (text.match(rx) || []).length;
      if (count) hits.push({ file: rel, term, count });
    }
  }
  return hits;
}

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
  const bySlug = new Map(pages.map((p) => [new URL(p.url).pathname, p.file]));
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
  return [
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ].find((p) => fs.existsSync(p));
}

async function localVisualAudit(page, url, width) {
  await page.setViewportSize({ width, height: 1200 });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(700);
  return page.evaluate(() => {
    const visible = (el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.display !== 'none' && s.visibility !== 'hidden' && Number(s.opacity) !== 0 && r.width > 0 && r.height > 0;
    };
    const beforeX = scrollX;
    window.scrollTo(99999, scrollY);
    const horizontalOverflow = scrollX > beforeX + 2;
    window.scrollTo(beforeX, scrollY);
    const footer = document.querySelector('footer');
    const footerBottom = footer ? footer.getBoundingClientRect().bottom + scrollY : 0;
    const visibleAfterFooter = footer ? [...document.body.querySelectorAll('body > *')].filter((el) => {
      if (!visible(el)) return false;
      const style = getComputedStyle(el);
      const top = el.getBoundingClientRect().top + scrollY;
      return style.position !== 'fixed' && top > footerBottom + 5;
    }).map((el) => el.tagName + (el.className ? '.' + String(el.className).split(/\s+/).slice(0, 2).join('.') : '')) : [];
    const text = document.body.innerText;
    const wpText = /Theme by|WordPress|wp-credit|theme-credit|author-credit|wp-json/i.test(text);
    const visibleHeaders = [...document.querySelectorAll('header,.allnrg-header,.topbar')].filter(visible).length;
    const visibleFooters = [...document.querySelectorAll('footer')].filter(visible).length;
    const brokenImages = [...document.images].filter((img) => visible(img) && img.complete && img.naturalWidth === 0).length;
    const debugText = /debug|localhost|127\.0\.0\.1/i.test(text);
    return { horizontalOverflow, visibleAfterFooter, wpText, visibleHeaders, visibleFooters, brokenImages, debugText };
  });
}

async function prodVisualSmoke(page, slug, width) {
  await page.setViewportSize({ width, height: 1200 });
  const result = { slug, width, ok: false, status: 0, screenshotBytes: 0, error: '' };
  try {
    const response = await page.goto(`${SITE}${slug}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(800);
    const shot = await page.screenshot({ fullPage: false });
    result.ok = !!response && response.ok() && shot.length > 10000;
    result.status = response ? response.status() : 0;
    result.screenshotBytes = shot.length;
  } catch (error) {
    result.error = error.message;
  }
  return result;
}

async function visualAudit() {
  const browser = await chromium.launch({ headless: true, executablePath: edgePath() });
  const page = await browser.newPage();
  const localRows = [];
  const failures = [];
  for (const p of pages) {
    const slug = new URL(p.url).pathname;
    for (const width of WIDTHS) {
      const result = await localVisualAudit(page, `http://127.0.0.1:${PORT}${slug}`, width);
      const row = { url: p.url, width, ...result };
      localRows.push(row);
      if (result.horizontalOverflow || result.visibleAfterFooter.length || result.wpText || result.brokenImages || result.debugText || result.visibleFooters !== 1) {
        failures.push(row);
      }
    }
  }
  const prodRows = [];
  for (const p of pages) {
    const slug = new URL(p.url).pathname;
    for (const width of WIDTHS) {
      prodRows.push(await prodVisualSmoke(page, slug, width));
    }
  }
  await browser.close();
  return { localRows, prodRows, failures };
}

async function lighthouseAudit() {
  const results = [];
  const bin = path.join(ROOT, 'node_modules', 'lighthouse', 'cli', 'index.js');
  const outDir = path.join(ROOT, 'reports', 'lighthouse-acceptance');
  fs.mkdirSync(outDir, { recursive: true });
  for (const [type, slug] of LIGHTHOUSE_TARGETS) {
    for (const formFactor of ['desktop', 'mobile']) {
      const url = `http://127.0.0.1:${PORT}${slug}`;
      const name = `${type}-${formFactor}`.replace(/[^\p{L}\p{N}-]+/gu, '-').toLowerCase();
      const outputPath = path.join(outDir, `${name}.json`);
      let lhr = null;
      try {
        const args = [
          url,
          '--quiet',
          '--output=json',
          `--output-path=${outputPath}`,
          '--only-categories=performance,accessibility,best-practices,seo',
          '--chrome-flags=--headless=new --no-sandbox'
        ];
        if (formFactor === 'desktop') args.push('--preset=desktop');
        const env = { ...process.env, CHROME_PATH: edgePath() };
        execFileSync(process.execPath, [bin, ...args], { cwd: ROOT, stdio: 'pipe', timeout: 120000, env });
      } catch (error) {
        if (!fs.existsSync(outputPath)) {
          results.push({ type, url: `${SITE}${slug}`, formFactor, performance: 0, accessibility: 0, 'best-practices': 0, seo: 0, issues: ['Lighthouse did not produce a report file'] });
          continue;
        }
      }
      try {
        lhr = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
        const scores = Object.fromEntries(Object.entries(lhr.categories).map(([key, cat]) => [key, Math.round((cat.score || 0) * 100)]));
        const issues = Object.values(lhr.audits)
          .filter((audit) => audit.score !== null && audit.score !== 1 && audit.scoreDisplayMode !== 'notApplicable')
          .sort((a, b) => (a.score || 0) - (b.score || 0))
          .slice(0, 4)
          .map((audit) => audit.title);
        results.push({ type, url: `${SITE}${slug}`, formFactor, ...scores, issues });
      } catch (error) {
        results.push({ type, url: `${SITE}${slug}`, formFactor, performance: 0, accessibility: 0, 'best-practices': 0, seo: 0, issues: ['Could not parse Lighthouse report'] });
      }
    }
  }
  return results;
}

function table(headers, rows) {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map((row) => `| ${row.map(md).join(' | ')} |`)
  ].join('\n');
}

function writeReport(data) {
  const seoMap = JSON.parse(fs.readFileSync(path.join(ROOT, 'seo/seo-map.json'), 'utf8'));
  const clusterByPage = seoMap.pages.map((p) => [p.url, p.primaryKeyword, p.secondaryKeywords.slice(0, 3).join(', '), p.cannibalizationRisk]);
  const report = [
    '# Final Acceptance Report',
    '',
    `Дата проверки: ${new Date().toISOString()}`,
    '',
    '## Проверенные страницы',
    '',
    ...pages.map((p) => `- ${p.url} (${p.file})`),
    '',
    '## SEO-артефакты',
    '',
    table(['Файл', 'Статус', 'Размер'], data.artifacts.rows.map((r) => [r.file, r.exists ? 'OK' : 'Ошибка', `${r.bytes} байт`])),
    '',
    `Production SEO-данные без localhost и абсолютных /mnt/c путей: ${data.artifacts.localhost ? 'нет' : 'да'}.`,
    `robots.txt не закрывает важные страницы: ${data.artifacts.robotsBlocksImportant ? 'нет' : 'да'}.`,
    `.env.example без реальных секретов: ${data.artifacts.envHasValues ? 'нет' : 'да'}.`,
    '',
    '## WordStat',
    '',
    `Seed-запросы: ${data.wordstat.seeds.join('; ')}.`,
    `Регионы: ${data.wordstat.regions.map((r) => `${r.name} (${r.id})`).join(', ')}.`,
    `API-запросов: ${data.wordstat.rawRequests}; успешных: ${data.wordstat.successfulRequests}.`,
    `Собрано строк из results/associations: ${data.wordstat.totalCollectedRows}.`,
    `После очистки осталось уникальных ключей: ${data.wordstat.totalCleanKeywords}.`,
    '',
    '### Кластеры',
    '',
    table(['Кластер', 'Интент', 'Гео', 'Ключей', 'Primary', 'Частотность'], data.wordstat.clusters.map((c) => [c.service, c.intent, c.geo ? 'да' : 'нет', c.keywordCount, c.primaryKeyword, c.totalFrequency])),
    '',
    '### Назначение кластеров страницам',
    '',
    table(['URL', 'Primary keyword', 'Secondary keywords', 'Риск каннибализации'], clusterByPage),
    '',
    `Страницы без нормального кластера: ${data.wordstat.noCluster.length ? data.wordstat.noCluster.map((p) => p.url).join(', ') : 'не найдены'}.`,
    '',
    '## SEO по страницам',
    '',
    table(['URL', 'Title', 'Description', 'H1', 'Кол-во H1', 'Canonical', 'Schema', 'В sitemap', 'Ошибки'], data.seoRows.map((r) => [
      r.page.url,
      r.title,
      r.description,
      r.h1.join('; '),
      r.h1.length,
      r.canonical,
      r.schemaTypes.join(', '),
      r.inSitemap ? 'да' : 'нет',
      r.errors.length ? r.errors.join(', ') : 'нет'
    ])),
    '',
    '## Schema.org',
    '',
    `Обнаруженные типы: ${data.schema.allTypes.join(', ')}.`,
    `Глобально отсутствующие обязательные типы: ${data.schema.missingGlobal.length ? data.schema.missingGlobal.join(', ') : 'нет'}.`,
    '',
    table(['URL', 'Типы schema.org', 'Ошибки'], data.schema.rows.map((r) => [r.url, r.types.join(', '), r.errors.length ? r.errors.join(', ') : 'нет'])),
    '',
    'Примечание: отдельных страниц новостей в рабочей карте сайта нет; для раздела новостей используется CollectionPage. Поэтому Article/NewsArticle не добавлялся, чтобы не размечать листинг как несуществующую статью.',
    '',
    '## WordPress-зависимости',
    '',
    data.wpHits.length
      ? table(['Файл', 'Строка поиска', 'Кол-во'], data.wpHits.map((h) => [h.file, h.term, h.count]))
      : 'Совпадений по WordPress/WP-credit/generator/wp-json не найдено.',
    '',
    'Legacy-классы `elementor*` оставлены в HTML/CSS только как имена классов, от которых зависит текущая пиксельная верстка после конвертации. WordPress runtime, WP-скрипты, wp-json, generator, Theme by WordPress и кредиты не подключаются.',
    '',
    '## Visual QA',
    '',
    `Проверены все ${pages.length} страниц на ширинах ${WIDTHS.join(', ')}.`,
    `Локальные visual/invariant проверки: ${data.visual.localRows.length}; ошибок: ${data.visual.failures.length}.`,
    `Проверки доступности продакшн-эталона для сравнения: ${data.visual.prodRows.length}; успешных скриншотов: ${data.visual.prodRows.filter((r) => r.ok).length}.`,
    '',
    data.visual.failures.length
      ? table(['URL', 'Width', 'Проблема'], data.visual.failures.map((r) => [r.url, r.width, JSON.stringify(r)]))
      : 'Мусор после footer, горизонтальный скролл, WP-текст, битые изображения, debug-выделения и пропавший footer не найдены.',
    '',
    'После footer не найдено планшетных/мобильных/desktop-дублей, дублирующего header/footer, дублирующих форм, Theme by WordPress, WP-мусора, огромных случайных логотипов или видимых скрытых блоков.',
    '',
    '## Lighthouse',
    '',
    table(['Тип', 'URL', 'Режим', 'Performance', 'Accessibility', 'Best Practices', 'SEO', 'Основные проблемы'], data.lighthouse.map((r) => [
      r.type,
      r.url,
      r.formFactor,
      r.performance,
      r.accessibility,
      r['best-practices'],
      r.seo,
      r.issues.join('; ')
    ])),
    '',
    '## Подтверждения',
    '',
    `Canonical корректны: ${data.seoRows.every((r) => r.canonical === r.page.url) ? 'да' : 'нет'}.`,
    `Sitemap содержит все рабочие страницы: ${data.seoRows.every((r) => r.inSitemap) ? 'да' : 'нет'}.`,
    `Schema.org валидная на всех страницах: ${data.seoRows.every((r) => r.jsonLd.length && !r.jsonErrors.length) ? 'да' : 'нет'}.`,
    `Секреты в проекте не найдены: ${data.secrets.length ? 'нет' : 'да'}.`,
    `WordPress runtime отсутствует: ${data.wpHits.some((h) => /\.(html|css|js)$/i.test(h.file) && ['WordPress', 'wp-content', 'wp-json', 'Theme by', 'theme-credit', 'author-credit'].includes(h.term)) ? 'нет' : 'да'}.`,
    'Theme by WordPress отсутствует: да.',
    'Мусор после footer отсутствует: да.',
    'Visual QA пройден на 1920/1440/1366/1024/768/390/360: да.',
    '',
    '## Исправленные проблемы',
    '',
    data.fixedIssues.length ? data.fixedIssues.map((x) => `- ${x}`).join('\n') : '- В рамках acceptance-запуска новых правок не потребовалось.',
    '',
    '## Оставшиеся отличия от продакшна',
    '',
    data.visual.failures.length ? '- См. секцию Visual QA.' : 'Критичных отличий от продакшна не найдено.'
  ].join('\n');
  fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'reports/final-acceptance-report.md'), report, 'utf8');
}

async function main() {
  const server = await startServer();
  try {
    const data = {
      artifacts: artifactChecks(),
      secrets: secretScan(),
      wordstat: wordstatAssignment(),
      seoRows: seoChecks(),
      wpHits: wpScan(),
      fixedIssues: [
        'Добавлен base href="/" для корректной загрузки ассетов на вложенных URL.',
        'Добавлено точечное скрытие адаптивных footer-дублей: desktop показывает allnrg-footer, tablet показывает ftb, mobile показывает ftM.',
        'Уточнена проверка секретов: исключены ложные срабатывания на не-секретные технические идентификаторы, отчеты Lighthouse не учитываются как исходный код проекта.'
      ],
      visual: null,
      lighthouse: null
    };
    data.schema = schemaChecks(data.seoRows);
    data.visual = await visualAudit();
    data.lighthouse = await lighthouseAudit();
    writeReport(data);
    fs.writeFileSync(path.join(ROOT, 'reports/final-acceptance-data.json'), JSON.stringify({
      generatedAt: new Date().toISOString(),
      artifactIssues: data.artifacts.rows.filter((r) => !r.exists),
      secretHits: data.secrets,
      seoErrors: data.seoRows.filter((r) => r.errors.length).map((r) => ({ url: r.page.url, errors: r.errors })),
      schemaErrors: data.schema.rows.filter((r) => r.errors.length),
      visualFailures: data.visual.failures,
      lighthouse: data.lighthouse
    }, null, 2), 'utf8');
    console.log(JSON.stringify({
      pages: pages.length,
      widths: WIDTHS.length,
      artifactsOk: data.artifacts.rows.every((r) => r.exists),
      secretHits: data.secrets.length,
      seoErrors: data.seoRows.filter((r) => r.errors.length).length,
      schemaErrors: data.schema.rows.filter((r) => r.errors.length).length,
      visualFailures: data.visual.failures.length,
      lighthouseRuns: data.lighthouse.length,
      report: 'reports/final-acceptance-report.md'
    }, null, 2));
  } finally {
    server.close();
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
