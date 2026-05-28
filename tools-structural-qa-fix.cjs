const fs = require('fs');
const path = require('path');

const root = __dirname;
const pages = fs.readdirSync(root).filter((file) => file.endsWith('.html'));

const contentStart = /(\s*)(<div\s+data-elementor-type=|<div\s+class=["']messenger-fab|<main\b|<header\b|<section\b)/i;

function ensureDocumentStructure(html) {
  if (html.includes('</head>') && /<body[\s>]/i.test(html)) return html;
  const match = html.match(contentStart);
  if (!match || match.index == null) return html;
  const insert = '\n  </head>\n  <body>\n';
  return html.slice(0, match.index) + insert + html.slice(match.index);
}

function removeCreditsAndDebug(html) {
  return html
    .replace(/<div\s+class=["']imanakov-credit-bottom["'][\s\S]*?<\/script>\s*/gi, '')
    .replace(/<div\s+class=["']imanakov-credit-bottom["'][\s\S]*?<\/div>\s*/gi, '')
    .replace(/<style>\s*\.imanakov-credit-bottom[\s\S]*?<\/style>\s*/gi, '')
    .replace(/<!--\s*This website is like a Rocket[\s\S]*?-->\s*/gi, '')
    .replace(/<!--\s*All in One SEO Pack Pro[\s\S]*?-->\s*/gi, '')
    .replace(/<!--\s*\/Yandex\.Metrika counter\s*-->\s*/gi, '')
    .replace(/<!--\s*[^-]*(?:WordPress|WP Rocket|Debug|Отладка|Остат|темы)[\s\S]*?-->\s*/gi, '')
    .replace(/Theme by WordPress/gi, '')
    .replace(/Themes\s+by\s+WordPress/gi, '')
    .replace(/Разработано\s*<a[^>]*>\s*Imanakov Vladislav\s*<\/a>/gi, '')
    .replace(/obrabotka-pers-dannih\.html"\.html/g, 'obrabotka-pers-dannih.html');
}

let changed = 0;
for (const page of pages) {
  const file = path.join(root, page);
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  html = ensureDocumentStructure(html);
  html = removeCreditsAndDebug(html);
  if (!html.includes('assets/css/fixes.css')) {
    html = html.replace('</head>', '  <link rel="stylesheet" href="assets/css/fixes.css">\n  </head>');
  }
  if (html !== before) {
    fs.writeFileSync(file, html);
    changed += 1;
  }
}

console.log(`Structural QA fixes applied to ${changed} pages.`);
