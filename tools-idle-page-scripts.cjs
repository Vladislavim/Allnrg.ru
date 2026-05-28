const fs = require('fs');
const path = require('path');

const root = __dirname;
const pages = fs.readdirSync(root).filter((name) => name.endsWith('.html'));

for (const file of pages) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, 'utf8');
  const base = file.replace(/\.html$/, '');
  const src = `js/pages/${base}.js`;
  const direct = `<script src="${src}" defer></script>`;
  if (!html.includes(direct)) continue;
  const loader = `<script>window.addEventListener('load',function(){setTimeout(function(){var s=document.createElement('script');s.src='${src}';s.defer=true;document.body.appendChild(s);},900);});</script>`;
  html = html.replace(direct, loader);
  fs.writeFileSync(full, html, 'utf8');
}

console.log(JSON.stringify({ pages: pages.length, mode: 'page scripts load after first render' }, null, 2));
