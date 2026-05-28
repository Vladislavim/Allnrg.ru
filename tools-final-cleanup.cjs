const fs = require('fs');
const path = require('path');

const root = __dirname;
const pages = fs.readdirSync(root).filter((file) => file.endsWith('.html'));

const replacements = [
  [/href="index\.htmlcases"/g, 'href="projects.html"'],
  [/href='index\.htmlcases'/g, "href='projects.html'"],
  [/href="index\.htmlprojectirovanie-promishlenih-zdanii"/g, 'href="projectirovanie-promishlennih-zdaniipredpriyatii.html"'],
  [/href='index\.htmlprojectirovanie-promishlenih-zdanii'/g, "href='projectirovanie-promishlennih-zdaniipredpriyatii.html'"],
  [/href="author-admin\.htmlpage\/2\/"/g, 'href="author-admin.html"'],
  [/href='author-admin\.htmlpage\/2\/'/g, "href='author-admin.html'"],
  [/href="index\.htmlwp-json\/?"/g, 'href="#"'],
  [/href='index\.htmlwp-json\/?'/g, "href='#'"],
  [/href='index\.html\?p=3671'/g, "href='vodoprovod-i-kanalizacziya.html'"],
  [/href="index\.html\?p=3671"/g, 'href="vodoprovod-i-kanalizacziya.html"'],
  [/src="assets\/optimized\/2020\/1vodoprovod-i-kanalizacziya-300x150\.webp"/g, 'src="assets/optimized/2020/10/vodoprovod-i-kanalizacziya-300x150.webp"'],
  [/src='assets\/optimized\/2020\/1vodoprovod-i-kanalizacziya-300x150\.webp'/g, "src='assets/optimized/2020/10/vodoprovod-i-kanalizacziya-300x150.webp'"],
  [/href="assets\/img\/2020\/1vodoprovod-i-kanalizacziya\.jpg"/g, 'href="assets/img/2020/10/vodoprovod-i-kanalizacziya.jpg"'],
  [/href='assets\/img\/2020\/1vodoprovod-i-kanalizacziya\.jpg'/g, "href='assets/img/2020/10/vodoprovod-i-kanalizacziya.jpg'"],
];

const removeScriptBlocks = [
  /<script[^>]*>\s*var\s+EssentialBlocksLocalize\s*=\s*[\s\S]*?<\/script>\s*/g,
  /<script[^>]*>\s*var\s+pum_vars\s*=\s*[\s\S]*?<\/script>\s*/g,
  /<script[^>]*>\s*var\s+elementorFrontendConfig\s*=\s*[\s\S]*?<\/script>\s*/g,
  /<script[^>]*>\s*var\s+ElementorProFrontendConfig\s*=\s*[\s\S]*?<\/script>\s*/g,
  /<link\s+rel=["']https:\/\/api\.w\.org\/["'][^>]*>\s*/g,
  /<link\s+rel=["']shortlink["'][^>]*>\s*/g,
];

let touched = 0;
for (const page of pages) {
  const file = path.join(root, page);
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  for (const [from, to] of replacements) html = html.replace(from, to);
  for (const re of removeScriptBlocks) html = html.replace(re, '');
  if (html !== before) {
    fs.writeFileSync(file, html);
    touched += 1;
  }
}

console.log(`Final cleanup touched ${touched} pages.`);
