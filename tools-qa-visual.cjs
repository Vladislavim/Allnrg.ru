const fs = require('fs');
const path = require('path');

const pages = fs.readdirSync(__dirname).filter((file) => file.endsWith('.html'));
const widths = [1920, 1440, 1366, 1024, 768, 390, 360];
const base = 'http://127.0.0.1:8090/';

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    return await import('playwright-core');
  }
}

async function main() {
const { chromium } = await loadPlaywright();
const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  args: ['--disable-gpu', '--no-sandbox'],
});

const report = [];
const outDir = path.join(__dirname, 'reports');
fs.mkdirSync(outDir, { recursive: true });

for (const pageName of pages) {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const url = base + pageName;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
      await page.waitForTimeout(250);
      const data = await page.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const footer = [...document.querySelectorAll('footer')].at(-1);
        const footerRect = footer ? footer.getBoundingClientRect() : null;
        const afterFooter = footer
          ? [...body.children].filter((el) => {
              const r = el.getBoundingClientRect();
              const styles = getComputedStyle(el);
              if (el.classList.contains('messenger-fab')) return false;
              return r.top > footerRect.bottom + 2 && r.height > 2 && styles.display !== 'none' && styles.visibility !== 'hidden' && styles.position !== 'fixed';
            }).map((el) => ({ tag: el.tagName, cls: el.className, text: (el.innerText || '').slice(0, 80) }))
          : [];
        const text = (body.innerText || '').toLowerCase();
        const visibleBadText = [
          'theme by wordpress',
          'themes by wordpress',
          'imanakov',
          'wp rocket',
          '[contact-form-7',
          'pum-',
          'popmake',
        ].some((needle) => text.includes(needle));
        const brokenImages = [...document.images]
          .filter((img) => {
            const r = img.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) return false;
            return img.complete && img.naturalWidth === 0;
          })
          .map((img) => img.getAttribute('src'));
        const visibleHugeLogos = [...document.images]
          .filter((img) => {
            const r = img.getBoundingClientRect();
            const src = img.getAttribute('src') || '';
            if (!/sinij-logo-scaled/i.test(src)) return false;
            if (img.closest('[hidden], .modal, .success, .cbok, .cbTok, .cbMok')) return false;
            return r.width > innerWidth * 0.65 || r.height > 180;
          })
          .map((img) => {
            const r = img.getBoundingClientRect();
            return { src: img.getAttribute('src'), w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y) };
          });
        return {
          title: document.title,
          width: innerWidth,
          scrollWidth: doc.scrollWidth,
          bodyWidth: body.scrollWidth,
          overflowX: doc.scrollWidth - innerWidth,
          footerCount: document.querySelectorAll('footer').length,
          headerCount: document.querySelectorAll('header, .topbar, .mbarM').length,
          visibleBadText,
          brokenImages,
          visibleHugeLogos,
          afterFooter,
        };
      });
      const issues = [];
      if (data.overflowX > 2) issues.push(`horizontal +${data.overflowX}px`);
      if (data.visibleBadText) issues.push('visible WP/debug/form text');
      if (data.brokenImages.length) issues.push(`broken images ${data.brokenImages.length}`);
      if (data.visibleHugeLogos.length) issues.push(`huge logos ${data.visibleHugeLogos.length}`);
      if (data.afterFooter.length) issues.push(`content after footer ${data.afterFooter.length}`);
      report.push({ page: pageName, width, issues, data });
    } catch (error) {
      report.push({ page: pageName, width, issues: ['load failed'], error: String(error.message || error) });
    } finally {
      await page.close();
    }
    fs.writeFileSync(path.join(outDir, 'qa-visual.json'), JSON.stringify(report, null, 2));
  }
}

await browser.close();

fs.writeFileSync(path.join(outDir, 'qa-visual.json'), JSON.stringify(report, null, 2));

const problemRows = report.filter((row) => row.issues.length);
let md = '# QA visual report\n\n';
md += `Checked pages: ${pages.length}\n\n`;
md += `Checked widths: ${widths.join(', ')}\n\n`;
md += '| Page | Width | Issues |\n|---|---:|---|\n';
for (const row of problemRows) md += `| ${row.page} | ${row.width} | ${row.issues.join('; ')} |\n`;
if (!problemRows.length) md += '| all | all | no issues detected |\n';
fs.writeFileSync(path.join(outDir, 'qa-visual.md'), md);

console.log(JSON.stringify({ checked: report.length, problems: problemRows.length, report: 'reports/qa-visual.md' }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
