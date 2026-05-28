const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const SITE = 'https://allnrg.ru';
const LOCAL = 'http://127.0.0.1:8098';
const OUT_DIR = path.join(ROOT, 'reports', 'lighthouse-acceptance');
const TARGETS = [
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

function edgePath() {
  return [
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ].find((p) => fs.existsSync(p));
}

function slugName(type, formFactor) {
  return `${type}-${formFactor}`.replace(/[^\p{L}\p{N}-]+/gu, '-').toLowerCase();
}

function scoresFrom(file) {
  const lhr = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (lhr.runtimeError) {
    return {
      performance: 0,
      accessibility: 0,
      'best-practices': 0,
      seo: 0,
      issues: [lhr.runtimeError.message || lhr.runtimeError.code]
    };
  }
  const scores = Object.fromEntries(Object.entries(lhr.categories).map(([key, cat]) => [key, Math.round((cat.score || 0) * 100)]));
  const issues = Object.values(lhr.audits)
    .filter((audit) => audit.score !== null && audit.score !== 1 && audit.scoreDisplayMode !== 'notApplicable')
    .sort((a, b) => (a.score || 0) - (b.score || 0))
    .slice(0, 4)
    .map((audit) => audit.title);
  return { ...scores, issues };
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const bin = path.join(ROOT, 'node_modules', 'lighthouse', 'cli', 'index.js');
  const env = { ...process.env, CHROME_PATH: edgePath() };
  const results = [];

  for (const [type, slug] of TARGETS) {
    for (const formFactor of ['desktop', 'mobile']) {
      const outputPath = path.join(OUT_DIR, `${slugName(type, formFactor)}.json`);
      try { fs.rmSync(outputPath, { force: true }); } catch {}
      const args = [
        bin,
        `${LOCAL}${slug}`,
        '--quiet',
        '--output=json',
        `--output-path=${outputPath}`,
        '--only-categories=performance,accessibility,best-practices,seo',
        '--chrome-flags=--headless=new --no-sandbox --ignore-certificate-errors'
      ];
      if (formFactor === 'desktop') args.push('--preset=desktop');
      try {
        execFileSync(process.execPath, args, { cwd: ROOT, env, stdio: 'pipe', timeout: 120000 });
      } catch {
        // Lighthouse on Windows may return non-zero after writing JSON because it cannot remove a temp profile.
      }
      if (fs.existsSync(outputPath)) {
        results.push({ type, url: `${SITE}${slug}`, formFactor, ...scoresFrom(outputPath) });
      } else {
        results.push({ type, url: `${SITE}${slug}`, formFactor, performance: 0, accessibility: 0, 'best-practices': 0, seo: 0, issues: ['Lighthouse report file was not created'] });
      }
    }
  }

  const dataPath = path.join(ROOT, 'reports', 'final-acceptance-data.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  data.lighthouse = results;
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(JSON.stringify(results.map((r) => ({
    type: r.type,
    formFactor: r.formFactor,
    performance: r.performance,
    accessibility: r.accessibility,
    bestPractices: r['best-practices'],
    seo: r.seo
  })), null, 2));
}

main();
