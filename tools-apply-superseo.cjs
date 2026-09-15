const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SITE = 'https://allnrg.ru';
const TODAY = '2026-05-27';
const SEO_DIR = path.join(ROOT, 'seo');

const ORG = {
  name: 'ООО «Альянс Энерджи»',
  legalName: 'Общество с ограниченной ответственностью «Альянс Энерджи»',
  url: SITE,
  telephone: '+7 (937) 096-10-00',
  email: 'dr@allnrg.ru',
  address: '400005, Волгоград, пр-т им. В.И. Ленина, 86',
  locality: 'Волгоград',
  taxID: '3444219320',
  logo: `${SITE}/css/images/logo_transparent.png`
};

const PAGES = [
  ['index.html', '/', 'home', 'Проектирование зданий и сооружений в Волгограде', 'Проектирование зданий и сооружений в Волгограде | Альянс Энерджи', 'Проектная организация в Волгограде: промышленное проектирование, инженерные системы, проектная и рабочая документация, BIM, экспертиза и обследование зданий.'],
  ['services.html', '/uslugi-2/', 'services', 'Услуги проектной организации', 'Услуги проектной организации в Волгограде | Альянс Энерджи', 'Проектирование промышленных объектов, инженерных систем, BIM, экспертиза, обследование зданий, расчет конструкций и сопровождение проектов.'],
  ['promishlennoe-projectirovaniye.html', '/promishlennoe-projectirovaniye/', 'service', 'Промышленное проектирование', 'Промышленное проектирование объектов | Альянс Энерджи', 'Промышленное проектирование зданий и предприятий: проектная и рабочая документация, BIM-моделирование, инженерные системы и сопровождение строительства.'],
  ['projectirovanie-promishlennih-zdaniipredpriyatii.html', '/projectirovanie-promishlennih-zdaniipredpriyatii/', 'service', 'Проектирование торговых объектов', 'Проектирование торговых объектов | Альянс Энерджи', 'Проектирование торговых центров, магазинов и объектов ритейла: планировочные решения, инженерные разделы, рабочая документация и сопровождение.'],
  ['projectirovanie-sport-soroozhenii.html', '/projectirovanie-sport-soroozhenii/', 'service', 'Проектирование спортивных сооружений', 'Проектирование спортивных сооружений | Альянс Энерджи', 'Проектирование спортивных сооружений и ФОК: проектная документация, инженерные системы, BIM и сопровождение до разрешения на строительство.'],
  ['projectirovanie-med-ucherezhdenii.html', '/projectirovanie-med-ucherezhdenii/', 'service', 'Проектирование медицинских учреждений', 'Проектирование медицинских учреждений | Альянс Энерджи', 'Проектирование медицинских учреждений, поликлиник и объектов здравоохранения с учетом инженерных требований, BIM и нормативной документации.'],
  ['projectirovanie-objectov-turizma.html', '/projectirovanie-objectov-turizma/', 'service', 'Проектирование объектов туризма', 'Проектирование объектов туризма | Альянс Энерджи', 'Проектирование гостиниц, туристических комплексов и объектов отдыха: архитектурные, конструктивные и инженерные решения для строительства.'],
  ['objecti-infrastrukturi.html', '/objecti-infrastrukturi/', 'service', 'Проектирование объектов инфраструктуры', 'Проектирование объектов инфраструктуры | Альянс Энерджи', 'Проектирование объектов инфраструктуры, дорог, развязок, парковок, вокзалов и депо с разработкой проектной и рабочей документации.'],
  ['projectirovanie-barov-restoranov.html', '/projectirovanie-barov-restoranov/', 'service', 'Проектирование объектов общественного питания', 'Проектирование ресторанов, кафе и баров | Альянс Энерджи', 'Проектирование ресторанов, кафе, баров и предприятий общественного питания: планировки, инженерные системы, документация и сопровождение.'],
  ['projectirovanie-selskogo-lesnogo-hozyastva.html', '/projectirovanie-selskogo-lesnogo-hozyastva/', 'service', 'Проектирование сельскохозяйственных объектов', 'Проектирование сельскохозяйственных объектов | Альянс Энерджи', 'Проектирование объектов сельского и лесного хозяйства: производственные здания, инфраструктура, инженерные системы и документация.'],
  ['tehnicheskoe-obsledovanie.html', '/tehnicheskoe-obsledovanie/', 'service', 'Техническое обследование зданий', 'Техническое обследование зданий | Альянс Энерджи', 'Техническое обследование зданий и сооружений: оценка конструкций, дефектов, состояния инженерных систем и подготовка заключений.'],
  ['raschet-konstrukcij.html', '/raschet-konstrukcij/', 'service', 'Расчет строительных конструкций', 'Расчет строительных конструкций | Альянс Энерджи', 'Расчет строительных конструкций для зданий и сооружений: проверка прочности, устойчивости, нагрузок и проектных решений.'],
  ['negosudarstvennaya-ekspertiza.html', '/negosudarstvennaya-ekspertiza/', 'service', 'Негосударственная экспертиза проектной документации', 'Негосударственная экспертиза проектной документации | Альянс Энерджи', 'Негосударственная экспертиза проектной документации: проверка разделов проекта, нормативов и подготовка официального заключения.'],
  ['laboratoriya-kontrolya.html', '/laboratoriya-kontrolya/', 'service', 'Лаборатория неразрушающего контроля', 'Лаборатория неразрушающего контроля | Альянс Энерджи', 'Лаборатория неразрушающего контроля: обследование прочности конструкций, инструментальные измерения и технические заключения.'],
  ['kapremont.html', '/kapremont/', 'service', 'Капитальный ремонт зданий и сооружений', 'Капитальный ремонт зданий и сооружений | Альянс Энерджи', 'Проектирование и сопровождение капитального ремонта зданий и сооружений: обследование, документация, инженерные решения и контроль.'],
  ['projects.html', '/our_projects/', 'projects', 'Наши проекты', 'Проекты и выполненные работы | Альянс Энерджи', 'Проекты Альянс Энерджи: промышленные, общественные, медицинские, инфраструктурные и инженерные объекты в Волгограде и России.'],
  ['bombonera.html', '/bombonera/', 'project', 'Проект комплекса «Бомбонера»', 'Проект комплекса «Бомбонера» | Альянс Энерджи', 'Проектирование и реализация комплекса «Бомбонера»: проектная документация, инженерные решения и сопровождение объекта.'],
  ['poliklinika.html', '/poliklinika/', 'project', 'Проект поликлиники', 'Проект поликлиники | Альянс Энерджи', 'Проект поликлиники: документация для медицинского учреждения, инженерные системы, BIM-решения и сопровождение проектирования.'],
  ['proizvodstvenno-logisticheskii-kompleks.html', '/proizvodstvenno-logisticheskii-kompleks/', 'project', 'Производственно-логистический комплекс', 'Производственно-логистический комплекс | Альянс Энерджи', 'Проект производственно-логистического комплекса: промышленное проектирование, инженерные системы и рабочая документация.'],
  ['tehnicheskoe-perevooruzhenie-travilnogo-otdeleniya.html', '/tehnicheskoe-perevooruzhenie-travilnogo-otdeleniya/', 'project', 'Техническое перевооружение травильного отделения', 'Техническое перевооружение травильного отделения | Альянс Энерджи', 'Проект технического перевооружения травильного отделения: промышленная документация, инженерные решения и сопровождение реализации.'],
  ['news.html', '/news/', 'news', 'Новости', 'Новости проектирования и экспертизы | Альянс Энерджи', 'Новости Альянс Энерджи о проектировании, экспертизе, BIM, инженерных системах и реализованных объектах компании.'],
  ['about.html', '/o-nas/', 'about', 'О компании Альянс Энерджи', 'О компании | Альянс Энерджи', 'Альянс Энерджи — проектная организация в Волгограде: промышленное проектирование, BIM, экспертиза и инженерное сопровождение объектов.'],
  ['contacts.html', '/kontakty/', 'contact', 'Контакты Альянс Энерджи', 'Контакты | Альянс Энерджи', 'Контакты проектной организации Альянс Энерджи в Волгограде: телефон, почта, адрес и форма обратной связи для проектирования и экспертизы.'],
  ['obrabotka-pers-dannih.html', '/obrabotka-pers-dannih/', 'legal', 'Политика обработки персональных данных', 'Политика обработки персональных данных | Альянс Энерджи', 'Политика обработки персональных данных ООО «Альянс Энерджи»: порядок обработки, хранения и защиты персональной информации.'],
  ['privacy.html', '/privacy/', 'legal', 'Политика конфиденциальности', 'Политика конфиденциальности | Альянс Энерджи', 'Политика конфиденциальности сайта Альянс Энерджи: условия обработки персональных данных и обращения пользователей.']
].map(([file, slug, type, h1, title, description]) => ({ file, slug, type, h1, title, description }));

function esc(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function attr(s) {
  return esc(s).replace(/\n/g, ' ');
}

function stripTags(s) {
  return String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function urlFor(page) {
  return page.slug === '/' ? `${SITE}/` : `${SITE}${page.slug}`;
}

function hrefForFile(file) {
  const page = PAGES.find((item) => item.file === file);
  return page ? page.slug : file;
}

function schemaFor(page) {
  const url = urlFor(page);
  const graph = [
    {
      '@type': ['Organization', 'LocalBusiness', 'ProfessionalService'],
      '@id': `${SITE}/#organization`,
      name: ORG.name,
      legalName: ORG.legalName,
      url: ORG.url,
      logo: ORG.logo,
      telephone: ORG.telephone,
      email: ORG.email,
      taxID: ORG.taxID,
      address: {
        '@type': 'PostalAddress',
        streetAddress: ORG.address,
        addressLocality: ORG.locality,
        addressCountry: 'RU'
      }
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: SITE,
      name: 'Альянс Энерджи',
      publisher: { '@id': `${SITE}/#organization` },
      inLanguage: 'ru-RU'
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: page.slug === '/'
        ? [{ '@type': 'ListItem', position: 1, name: 'Главная', item: `${SITE}/` }]
        : [
            { '@type': 'ListItem', position: 1, name: 'Главная', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: page.h1, item: url }
          ]
    }
  ];

  const webPageType = page.type === 'contact' ? 'ContactPage' : page.type === 'news' ? 'CollectionPage' : 'WebPage';
  graph.push({
    '@type': webPageType,
    '@id': `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    isPartOf: { '@id': `${SITE}/#website` },
    about: { '@id': `${SITE}/#organization` },
    breadcrumb: { '@id': `${url}#breadcrumb` },
    inLanguage: 'ru-RU'
  });

  if (page.type === 'service') {
    graph.push({
      '@type': 'Service',
      '@id': `${url}#service`,
      name: page.h1,
      description: page.description,
      provider: { '@id': `${SITE}/#organization` },
      areaServed: [{ '@type': 'City', name: 'Волгоград' }, { '@type': 'Country', name: 'Россия' }],
      serviceType: page.h1,
      url
    });
  }

  if (page.type === 'project') {
    graph.push({
      '@type': 'CreativeWork',
      '@id': `${url}#project`,
      name: page.h1,
      description: page.description,
      creator: { '@id': `${SITE}/#organization` },
      url,
      inLanguage: 'ru-RU'
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

function headBlock(page) {
  const url = urlFor(page);
  return [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${attr(page.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:locale" content="ru_RU" />`,
    `<meta property="og:type" content="${page.type === 'project' ? 'article' : 'website'}" />`,
    `<meta property="og:title" content="${attr(page.title)}" />`,
    `<meta property="og:description" content="${attr(page.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:site_name" content="Альянс Энерджи" />`,
    `<meta property="og:image" content="${SITE}/css/images/logo_transparent.png" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${attr(page.title)}" />`,
    `<meta name="twitter:description" content="${attr(page.description)}" />`,
    `<script type="application/ld+json">${schemaFor(page)}</script>`
  ].join('\n    ');
}

function normalizeHead(html, page) {
  html = html.replace(/<html(?![^>]*\blang=)([^>]*)>/i, '<html lang="ru"$1>');
  html = html.replace(/<head>\s*/i, '<head>\n    <meta charset="UTF-8" />\n');
  html = html.replace(/<meta\s+charset=["'][^"']+["']\s*\/?>/gi, '');
  html = html.replace(/<head>\s*/i, '<head>\n    <meta charset="UTF-8" />\n');
  html = html.replace(/<title[\s\S]*?<\/title>/i, '');
  html = html.replace(/<base\b[^>]*>\s*/gi, '');
  html = html.replace(/<meta\s+name=["']description["'][^>]*>\s*/gi, '');
  html = html.replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '');
  html = html.replace(/<meta\s+(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi, '');
  html = html.replace(/<script[^>]+type=["']application\/ld\+json["'][\s\S]*?<\/script>\s*/gi, '');
  html = html.replace(/<meta\s+name=["']generator["'][^>]*>\s*/gi, '');
  html = html.replace(/<head>\s*/i, `<head>\n    <meta charset="UTF-8" />\n    <base href="/" />\n    ${headBlock(page)}\n`);
  html = html.replace(/(<meta charset="UTF-8" \/>\s*){2,}/i, '<meta charset="UTF-8" />\n    ');
  return html;
}

function fixH1(html, page) {
  let count = 0;
  html = html.replace(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/gi, (m, attrs, body) => {
    count += 1;
    if (count === 1) return `<h1${attrs}>${body}</h1>`;
    return `<div${attrs} role="heading" aria-level="2">${body}</div>`;
  });
  if (count === 0) {
    html = html.replace(/<body([^>]*)>/i, `<body$1>\n    <h1 class="seo-visually-hidden">${esc(page.h1)}</h1>`);
  }
  return html;
}

function fixImages(html, page) {
  let imgIndex = 0;
  return html.replace(/<img\b([^>]*)>/gi, (m, attrs) => {
    imgIndex += 1;
    let next = attrs;
    const src = (attrs.match(/\bsrc=["']([^"']+)["']/i) || [])[1] || '';
    if (!/\balt\s*=/.test(next)) {
      const alt = /logo/i.test(src) ? 'Альянс Энерджи' : (imgIndex <= 3 ? page.h1 : '');
      next += ` alt="${attr(alt)}"`;
    }
    if (imgIndex > 3 && !/\bloading\s*=/.test(next)) next += ' loading="lazy"';
    if (!/\bdecoding\s*=/.test(next)) next += ' decoding="async"';
    return `<img${next}>`;
  });
}

function fixA11y(html) {
  html = html.replace(/<select\b(?![^>]*\baria-label=)([^>]*\bid=["']zone["'][^>]*)>/gi, '<select aria-label="Выберите часовой пояс"$1>');
  html = html.replace(/<select\b(?![^>]*\baria-label=)([^>]*\bid=["']calcxZone["'][^>]*)>/gi, '<select aria-label="Выберите часовой пояс"$1>');
  html = html.replace(/<select\b(?![^>]*\baria-label=)([^>]*\bid=["']calcxMobZone["'][^>]*)>/gi, '<select aria-label="Выберите часовой пояс"$1>');
  html = html.replace(/<button\b(?![^>]*\baria-label=)([^>]*class=["'][^"']*\bclose\b[^"']*["'][^>]*)>/gi, '<button aria-label="Закрыть окно"$1>');
  html = html.replace(/<a\b([^>]*href=["']#["'][^>]*)>\s*<\/a>/gi, '<a$1 aria-label="Перейти к разделу"></a>');
  html = html.replace(/<a\b((?![^>]*\baria-label=)[^>]*)>\s*<\/a>/gi, (m, attrs) => {
    const href = (attrs.match(/\bhref=["']([^"']+)["']/i) || [])[1] || '';
    const label = /index\.html|^\//.test(href) ? 'На главную страницу' : 'Открыть ссылку';
    return `<a aria-label="${label}"${attrs}></a>`;
  });
  html = html.replace(/<a\b((?![^>]*\baria-label=)[^>]*)>(\s*<img\b[\s\S]*?<\/a>)/gi, (m, attrs, body) => {
    const href = (attrs.match(/\bhref=["']([^"']+)["']/i) || [])[1] || '';
    const label = /index\.html|^\//.test(href) ? 'На главную страницу' : 'Открыть ссылку партнера';
    return `<a aria-label="${label}"${attrs}>${body}`;
  });
  return html;
}

function injectCss(html) {
  const css = '<style id="seo-technical-css">html,body{max-width:100%!important;overflow-x:hidden!important}@media (min-width:1025px){footer.ftb,footer.ftM{display:none!important}}@media (min-width:768px) and (max-width:1024px){footer.allnrg-footer,footer.ftM{display:none!important}}@media (max-width:767px){footer.allnrg-footer,footer.ftb{display:none!important}}.seo-visually-hidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}</style>';
  html = html.replace(/<style id="seo-technical-css">[\s\S]*?<\/style>\s*/gi, '');
  return html.replace(/<\/head>/i, `    ${css}\n</head>`);
}

function pageKeywords(page, clusters) {
  const serviceMap = {
    services: ['general', 'industrial_design', 'building_design'],
    service: [],
    projects: ['industrial_design', 'building_design'],
    project: ['industrial_design', 'building_design'],
    home: ['building_design', 'industrial_design', 'engineering_systems'],
    about: ['bim', 'industrial_design'],
    contact: ['general'],
    news: ['general'],
    legal: ['general']
  };
  const slug = page.slug;
  const hints = [];
  if (slug.includes('promish')) hints.push('industrial_design');
  if (slug.includes('sport')) hints.push('sports');
  if (slug.includes('med') || slug.includes('poliklinika')) hints.push('medical');
  if (slug.includes('turizma')) hints.push('tourism');
  if (slug.includes('infrastrukturi')) hints.push('infrastructure');
  if (slug.includes('barov')) hints.push('horeca');
  if (slug.includes('selskogo')) hints.push('agriculture_forestry');
  if (slug.includes('obsledovanie')) hints.push('technical_inspection');
  if (slug.includes('raschet')) hints.push('structural_calculation');
  if (slug.includes('ekspertiza')) hints.push('construction_expertise');
  if (slug.includes('laboratoriya')) hints.push('ndt_lab');
  if (slug.includes('vodoprovod')) hints.push('engineering_systems');
  const wanted = [...hints, ...(serviceMap[page.type] || [])];
  const kws = clusters.clusters
    .filter((c) => wanted.includes(c.service) || (!wanted.length && c.service === 'general'))
    .flatMap((c) => c.keywords)
    .sort((a, b) => b.countMax - a.countMax)
    .slice(0, 12);
  return kws;
}

function buildSeoMap(clusters) {
  const pages = PAGES.map((page) => {
    const kws = pageKeywords(page, clusters);
    const primary = kws[0]?.phrase || page.h1.toLowerCase();
    return {
      file: page.file,
      url: urlFor(page),
      type: page.type,
      primaryKeyword: primary,
      secondaryKeywords: kws.slice(1, 6).map((k) => k.phrase),
      longTailKeywords: kws.filter((k) => k.normalized.split(' ').length >= 4).slice(0, 5).map((k) => k.phrase),
      geoKeywords: kws.filter((k) => k.geo).slice(0, 5).map((k) => k.phrase),
      title: page.title,
      description: page.description,
      h1: page.h1,
      h2h3: 'Сохранена текущая визуальная структура страницы; дубли h1 в адаптивных версиях понижены до role=heading.',
      imageAlt: `Логотипы: "Альянс Энерджи"; первые содержательные изображения: "${page.h1}"; декоративные изображения: пустой alt.`,
      canonical: urlFor(page),
      schemaType: page.type === 'service' ? 'Service + WebPage + BreadcrumbList' : page.type === 'project' ? 'CreativeWork + WebPage + BreadcrumbList' : page.type === 'contact' ? 'ContactPage + Organization + LocalBusiness' : 'WebPage + BreadcrumbList',
      internalLinks: recommendedLinks(page),
      cannibalizationRisk: cannibalizationRisk(page),
      textRecommendations: 'Радикальные переписывания не нужны. Допустимы только точечные фразы внутри существующих блоков при следующей контентной итерации.'
    };
  });
  return { generatedAt: new Date().toISOString(), pages };
}

function recommendedLinks(page) {
  const files = page.type === 'service'
    ? ['services.html', 'projects.html', 'contacts.html']
    : page.type === 'project'
      ? ['projects.html', 'services.html', 'contacts.html']
      : page.type === 'home'
        ? ['services.html', 'projects.html', 'contacts.html']
        : ['index.html', 'services.html', 'contacts.html'];
  return files.map(hrefForFile);
}

function cannibalizationRisk(page) {
  if (page.file === 'promishlennoe-projectirovaniye.html' || page.file === 'projectirovanie-promishlennih-zdaniipredpriyatii.html') {
    return 'Средний: промышленное проектирование и торговые/производственные объекты разведены по title/h1 и интенту.';
  }
  if (page.file === 'privacy.html' || page.file === 'obrabotka-pers-dannih.html') {
    return 'Средний: две юридические страницы имеют близкую тему, canonical и title разведены.';
  }
  return 'Низкий';
}

function writeSitemap() {
  const urls = PAGES.map((page) => `  <url>\n    <loc>${urlFor(page)}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${page.type === 'news' ? 'weekly' : 'monthly'}</changefreq>\n    <priority>${page.slug === '/' ? '1.0' : page.type === 'service' ? '0.8' : '0.6'}</priority>\n  </url>`).join('\n');
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /seo/.cache/\nDisallow: /node_modules/\nDisallow: /reports/\n\nSitemap: ${SITE}/sitemap.xml\n`, 'utf8');
}

function writeReport(seoMap, clusters) {
  const report = [
    '# SEO report',
    '',
    `Дата: ${TODAY}`,
    '',
    '## Wordstat API',
    '',
    'Использован Yandex Search API Wordstat через переменные окружения YANDEX_SEARCH_API_KEY и YANDEX_CLOUD_FOLDER_ID. Реальные ключи в проект не записывались.',
    '',
    `Seed-запросов: ${JSON.parse(fs.readFileSync(path.join(SEO_DIR, 'wordstat-raw.json'), 'utf8')).seeds.length}.`,
    `Уникальных ключей: ${JSON.parse(fs.readFileSync(path.join(SEO_DIR, 'wordstat-clean.json'), 'utf8')).totalKeywords}.`,
    `Кластеров: ${clusters.totalClusters}.`,
    '',
    '## Кластеры',
    '',
    ...clusters.clusters.slice(0, 22).map((c) => `- ${c.id}: ${c.keywordCount} ключей, primary: ${c.primaryKeyword}, частотность кластера: ${c.totalFrequency}`),
    '',
    '## Страницы',
    '',
    ...seoMap.pages.map((p) => `- ${p.url}: ${p.primaryKeyword}; title: ${p.title}`),
    '',
    '## Изменения',
    '',
    '- Обновлены уникальные title и description для рабочих страниц.',
    '- Добавлены canonical, Open Graph, Twitter Card и JSON-LD.',
    '- Добавлены Organization, LocalBusiness, ProfessionalService, WebSite, WebPage, BreadcrumbList, Service, CreativeWork и ContactPage по типу страницы.',
    '- Сгенерированы sitemap.xml и robots.txt без localhost URL.',
    '- Дублирующиеся h1 в адаптивных копиях понижены до role=heading без визуального изменения.',
    '- Добавлены alt/loading/decoding для изображений и aria-label для критичных элементов форм.',
    '- Реальные тексты страниц не переписывались радикально.',
    '',
    '## WordPress cleanup',
    '',
    'WordPress runtime, wp-json, generator и theme-credit в рабочих HTML не используются. Legacy class names Elementor оставлены там, где они участвуют в текущей пиксельной верстке.',
    '',
    '## QA',
    '',
    'Автоматически проверяются: h1, title, description, canonical, JSON-LD, sitemap, robots, WP-маркеры, footer-tail и горизонтальный скролл в QA-скрипте.'
  ].join('\n');
  fs.writeFileSync(path.join(SEO_DIR, 'seo-report.md'), report, 'utf8');
}

function main() {
  const clusters = JSON.parse(fs.readFileSync(path.join(SEO_DIR, 'keyword-clusters.json'), 'utf8'));
  for (const page of PAGES) {
    const file = path.join(ROOT, page.file);
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    html = normalizeHead(html, page);
    html = fixH1(html, page);
    html = fixImages(html, page);
    html = fixA11y(html);
    html = injectCss(html);
    fs.writeFileSync(file, html, 'utf8');
  }
  const seoMap = buildSeoMap(clusters);
  fs.writeFileSync(path.join(SEO_DIR, 'seo-map.json'), JSON.stringify(seoMap, null, 2), 'utf8');
  writeSitemap();
  writeReport(seoMap, clusters);
  console.log(JSON.stringify({ pages: PAGES.length, sitemap: true, robots: true, seoMap: true }, null, 2));
}

main();
