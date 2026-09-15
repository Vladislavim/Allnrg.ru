const fs = require('fs');
const path = require('path');

const root = __dirname;
const pageMap = JSON.parse(fs.readFileSync(path.join(root, 'PAGE_MAP.json'), 'utf8'));

let written = 0;

for (const page of pageMap) {
  if (page.slug === '/' || !page.file) continue;

  const source = path.join(root, page.file);
  if (!fs.existsSync(source)) continue;

  const slug = String(page.slug).replace(/^\/+|\/+$/g, '');
  const targetDir = path.join(root, slug);
  const target = path.join(targetDir, 'index.html');

  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(source, target);
  written += 1;
}

console.log(`Generated ${written} clean URL page copies.`);
