const fs = require('fs');
const path = require('path');

const seo = JSON.parse(fs.readFileSync(path.join(__dirname, 'seo', 'seo-map.json'), 'utf8'));

const serviceFiles = new Set([
  'services.html',
  'promishlennoe-projectirovaniye.html',
  'projectirovanie-promishlennih-zdaniipredpriyatii.html',
  'projectirovanie-sport-soroozhenii.html',
  'projectirovanie-med-ucherezhdenii.html',
  'projectirovanie-objectov-turizma.html',
  'objecti-infrastrukturi.html',
  'projectirovanie-barov-restoranov.html',
  'projectirovanie-selskogo-lesnogo-hozyastva.html',
  'tehnicheskoe-obsledovanie.html',
  'raschet-konstrukcij.html',
  'negosudarstvennaya-ekspertiza.html',
  'laboratoriya-kontrolya.html',
  'kapremont.html'
]);

const pages = (seo.pages || []).filter((page) => serviceFiles.has(page.file));

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function text(value) {
  return esc(String(value || '').replace(/\s+/g, ' ').trim());
}

function serviceName(page) {
  return String(page.primaryKeyword || page.title || 'проектные услуги').replace(/\s+/g, ' ').trim();
}

function description(page) {
  const base = String(page.description || page.title || page.primaryKeyword || '')
    .replace(/\s+/g, ' ')
    .replace(/\s*\|\s*Альянс Энерджи\s*$/i, '')
    .trim();
  const service = serviceName(page);
  return `${service}. ${base}`;
}

function offerName(page) {
  return `${serviceName(page)} — ООО «Альянс Энерджи»`;
}

function startingPrice(page) {
  const key = `${page.primaryKeyword || ''} ${page.title || ''} ${page.url || ''}`.toLowerCase();
  if (/капитальн|ремонт/.test(key)) return 100000;
  if (/обследован|экспертиз|лаборатор|расчет|расч[её]т/.test(key)) return 30000;
  if (/проектирован|документац|bim/.test(key)) return 70000;
  return 50000;
}

function param(name, value) {
  return `        <param name="${esc(name)}">${text(value)}</param>`;
}

const now = new Date();
const pad = (number) => String(number).padStart(2, '0');
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

const offerLines = [];

pages.forEach((page, index) => {
  const number = index + 1;
  const offerId = `ae-service-${number}`;
  const url = page.url;
  const picture = 'https://allnrg.ru/assets/images/og-allnrg.jpg';

  offerLines.push(`      <offer id="${offerId}" available="true">`);
  offerLines.push(`        <name>${text(offerName(page))}</name>`);
  offerLines.push(`        <url>${esc(url)}</url>`);
  offerLines.push(`        <price>${startingPrice(page)}</price>`);
  offerLines.push('        <currencyId>RUR</currencyId>');
  offerLines.push('        <categoryId>1</categoryId>');
  offerLines.push(`        <picture>${picture}</picture>`);
  offerLines.push(`        <description>${text(description(page))}</description>`);
  offerLines.push('        <sales_notes>Индивидуальный расчет после заявки</sales_notes>');
  offerLines.push(param('Регион', 'Волгоград'));
  offerLines.push(param('Организация', 'ООО «Альянс Энерджи»'));
  offerLines.push(param('Телефон', '+7 937 096-10-00'));
  offerLines.push(param(
    'Об исполнителе',
    'Проектная организация в Волгограде: промышленное проектирование, рабочая документация, BIM, обследование и инженерно-строительная экспертиза.'
  ));
  offerLines.push('      </offer>');
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${date}">
  <shop>
    <name>Альянс Энерджи</name>
    <company>ООО «Альянс Энерджи»</company>
    <url>https://allnrg.ru/</url>
    <currencies>
      <currency id="RUR" rate="1"/>
    </currencies>
    <categories>
      <category id="1">Проектные услуги</category>
    </categories>
    <offers>
${offerLines.join('\n')}
    </offers>
  </shop>
</yml_catalog>
`;

fs.writeFileSync(path.join(__dirname, 'yandex-services-feed.yml'), xml, 'utf8');
fs.writeFileSync(path.join(__dirname, 'yandex-services-feed1.yml'), xml, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'yandex-services-feed-notes-20260601.txt'), [
  'Yandex Webmaster feed for allnrg.ru',
  'Category in Webmaster: Исполнители',
  'Feed URL after upload to hosting: https://allnrg.ru/yandex-services-feed.yml',
  'Duplicate URL after upload to hosting: https://allnrg.ru/yandex-services-feed1.yml',
  `Offers: ${pages.length}`,
  'Primary feed URL: https://allnrg.ru/yandex-services-feed.yml',
  'Offer names include the service plus ООО «Альянс Энерджи».',
  'Prices are starting estimates; final price is individual and explained in sales_notes.',
  'No artificial zero ratings, review counts, or conversion values are exported.'
].join('\n'), 'utf8');

console.log(`created clean/yandex-services-feed.yml and clean/yandex-services-feed1.yml offers=${pages.length}`);
