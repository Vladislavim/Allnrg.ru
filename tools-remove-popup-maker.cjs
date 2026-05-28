const fs = require('fs');
const path = require('path');

const root = __dirname;
const pages = fs.readdirSync(root).filter((file) => file.endsWith('.html'));

const popupPatterns = [
  /<div\s+id=["']pum-\d+["'][\s\S]*?(?=\n\s*<script|\n\s*<div\s+class=["']messenger-fab|\n\s*<\/body>|$)/gi,
  /<script[^>]*id=["']essential-blocks-blocks-localize-js-extra["'][\s\S]*?<\/script>\s*/gi,
  /<script[^>]*id=["']popup-maker-site-js-extra["'][\s\S]*?<\/script>\s*/gi,
  /<script[^>]*>\s*\/\*\s*<!\[CDATA\[\s*\*\/\s*var\s+eb_conditional_localize[\s\S]*?<\/script>\s*/gi,
  /<script[^>]*>\s*\/\*\s*<!\[CDATA\[\s*\*\/\s*var\s+pum_vars[\s\S]*?<\/script>\s*/gi,
  /<p>\s*\[contact-form-7[^\]]*\]\s*<\/p>\s*/gi,
  /\[contact-form-7[^\]]*\]/gi,
  /<script[^>]*id=["']wp-emoji-settings["'][\s\S]*?<\/script>\s*/gi,
  /<script[^>]*type=["']module["'][\s\S]*wpEmojiSettingsSupports[\s\S]*?<\/script>\s*/gi,
];

let touched = 0;
for (const page of pages) {
  const file = path.join(root, page);
  let html = fs.readFileSync(file, 'utf8');
  const before = html;

  for (const re of popupPatterns) html = html.replace(re, '');

  if (!html.includes('assets/css/fixes.css')) {
    if (html.includes('</head>')) {
      html = html.replace('</head>', '  <link rel="stylesheet" href="assets/css/fixes.css">\n</head>');
    } else {
      html = html.replace(/(<meta\s+charset=["']UTF-8["']\s*\/?>)/i, '$1\n<link rel="stylesheet" href="assets/css/fixes.css">');
    }
  }

  if (html !== before) {
    fs.writeFileSync(file, html);
    touched += 1;
  }
}

console.log(`Removed popup-maker leftovers from ${touched} pages.`);
