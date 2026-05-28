const fs = require('fs');
const path = require('path');

const root = __dirname;
const htmlFiles = fs.readdirSync(root).filter((file) => file.endsWith('.html'));
let changed = 0;

for (const file of htmlFiles) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, 'utf8');
  const before = html;

  html = html
    .replace(/\sdata-elementor-type="wp-page"/g, ' data-page-type="page"')
    .replace(/\sdata-elementor-post-type="page"/g, ' data-content-type="page"')
    .replace(/<style[^>]*id=['"]wp-img-auto-sizes-contain-inline-css['"][^>]*>[\s\S]*?<\/style>\s*/gi, '')
    .replace(/<style[^>]*id=['"]wp-emoji-styles-inline-css['"][^>]*>[\s\S]*?<\/style>\s*/gi, '')
    .replace(/<link[^>]*id=['"]wp-block-library-css['"][^>]*>\s*/gi, '')
    .replace(/<style[^>]*id=['"]classic-theme-styles-inline-css['"][^>]*>[\s\S]*?<\/style>\s*/gi, '')
    .replace(/<style[^>]*id=['"]global-styles-inline-css['"][^>]*>[\s\S]*?<\/style>\s*/gi, '')
    .replace(/\/\*# sourceURL=wp-[\s\S]*?\*\/\s*/gi, '');

  if (html !== before) {
    fs.writeFileSync(full, html);
    changed += 1;
  }
}

console.log(JSON.stringify({ htmlFiles: htmlFiles.length, changed }, null, 2));
