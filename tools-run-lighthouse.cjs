const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = __dirname;
const reportDir = path.join(root, 'reports', 'lighthouse-final');
fs.mkdirSync(reportDir, { recursive: true });

const pages = [
  'index.html',
  'services.html',
  'promishlennoe-projectirovaniye.html',
  'projectirovanie-sport-soroozhenii.html',
  'projectirovanie-med-ucherezhdenii.html',
  'projects.html',
  'bombonera.html',
  'tehnicheskoe-perevooruzhenie-travilnogo-otdeleniya.html',
  'news.html',
  'about.html',
  'contacts.html',
  'privacy.html',
  'obrabotka-pers-dannih.html',
];

const modes = [
  { name: 'mobile', flags: ['--preset=perf'] },
  { name: 'desktop', flags: ['--preset=desktop'] },
];

const chromeFlags = '--headless=new --disable-gpu --no-sandbox --disable-dev-shm-usage';
const results = [];

for (const page of pages) {
  for (const mode of modes) {
    const name = `${page.replace(/\.html$/, '')}-${mode.name}`;
    const outputPath = path.join(reportDir, `${name}.json`);
    const url = page === 'index.html' ? 'http://127.0.0.1:8090/' : `http://127.0.0.1:8090/${page}`;
    const lighthouseBin = path.join(root, 'node_modules', 'lighthouse', 'cli', 'index.js');
    const args = [
      url,
      '--quiet',
      '--output=json',
      `--output-path=${outputPath}`,
      '--only-categories=performance,accessibility,best-practices,seo',
      `--chrome-flags=${chromeFlags}`,
      ...mode.flags,
    ];
    const env = {
      ...process.env,
      CHROME_PATH: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    };
    const run = spawnSync(process.execPath, [lighthouseBin, ...args], { cwd: root, encoding: 'utf8', shell: false, timeout: 180000, env });
    if (!fs.existsSync(outputPath)) {
      results.push({ page, mode: mode.name, error: run.error?.message || run.stderr || run.stdout || `exit ${run.status}` });
      continue;
    }
    const json = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
    results.push({
      page,
      mode: mode.name,
      performance: Math.round(json.categories.performance.score * 100),
      accessibility: Math.round(json.categories.accessibility.score * 100),
      bestPractices: Math.round(json.categories['best-practices'].score * 100),
      seo: Math.round(json.categories.seo.score * 100),
      lcp: json.audits['largest-contentful-paint']?.displayValue || '',
      cls: json.audits['cumulative-layout-shift']?.displayValue || '',
    });
  }
}

const byPage = {};
for (const item of results) {
  byPage[item.page] ||= { page: item.page };
  if (item.error) {
    byPage[item.page][`${item.mode}Error`] = item.error.slice(0, 180);
  } else {
    byPage[item.page][`${item.mode}Performance`] = item.performance;
    byPage[item.page][`${item.mode}Accessibility`] = item.accessibility;
    byPage[item.page][`${item.mode}BestPractices`] = item.bestPractices;
    byPage[item.page][`${item.mode}Seo`] = item.seo;
    byPage[item.page][`${item.mode}Lcp`] = item.lcp;
    byPage[item.page][`${item.mode}Cls`] = item.cls;
  }
}

const table = Object.values(byPage);
fs.writeFileSync(path.join(reportDir, 'summary.json'), JSON.stringify(table, null, 2), 'utf8');
console.log(JSON.stringify(table, null, 2));
