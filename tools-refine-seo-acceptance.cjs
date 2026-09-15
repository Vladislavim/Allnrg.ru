const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const root = __dirname;
const site = 'https://allnrg.ru';
const today = new Date().toISOString().slice(0, 10);

const seeds = [
  'проектирование промышленных объектов',
  'промышленное проектирование',
  'проектирование зданий и сооружений',
  'проектная документация',
  'рабочая документация',
  'BIM-проектирование',
  'BIM-моделирование',
  'инженерные системы',
  'проектирование инженерных систем',
  'строительная экспертиза',
  'строительный консалтинг',
  'техническое обследование зданий',
  'расчет конструкций',
  'негосударственная экспертиза',
  'инженерно-техническая экспертиза',
  'лаборатория неразрушающего контроля',
  'проектирование спортивных сооружений',
  'проектирование медицинских учреждений',
  'проектирование объектов туризма',
  'проектирование объектов инфраструктуры',
  'проектирование торговых объектов',
  'проектирование объектов общественного питания',
  'проектирование сельскохозяйственных объектов',
  'проектирование лесного хозяйства',
  'проектная организация Волгоград',
  'проектирование Волгоград',
  'строительная экспертиза Волгоград',
  'проектирование промышленных объектов Волгоград'
];

const pages = [
  { file: 'index.html', slug: '', type: 'home', cluster: 'core_design', primary: 'проектирование зданий и сооружений', secondary: ['проектная организация Волгоград', 'проектирование Волгоград', 'промышленное проектирование', 'проектная документация'], title: 'Проектирование зданий и сооружений в Волгограде | Альянс Энерджи', description: 'Проектная организация в Волгограде: промышленное проектирование, инженерные системы, проектная и рабочая документация, BIM, экспертиза и обследование зданий.', h1: 'Проектирование зданий и сооружений: разработка проектной документации', schema: ['WebPage', 'BreadcrumbList'] },
  { file: 'services.html', slug: 'uslugi-2', type: 'services', cluster: 'services_hub', primary: 'услуги проектной организации', secondary: ['проектирование промышленных объектов', 'BIM-проектирование', 'проектирование инженерных систем', 'строительная экспертиза'], title: 'Услуги проектной организации в Волгограде | Альянс Энерджи', description: 'Услуги проектной организации: промышленное проектирование, BIM, инженерные системы, экспертиза, обследование зданий и расчет конструкций.', h1: 'Услуги проектной организации', schema: ['CollectionPage', 'Service', 'BreadcrumbList'] },
  { file: 'promishlennoe-projectirovaniye.html', slug: 'promishlennoe-projectirovaniye', type: 'service', cluster: 'industrial_design', primary: 'промышленное проектирование', secondary: ['проектирование промышленных объектов', 'проектирование промышленных зданий', 'проектирование промышленных предприятий', 'рабочая документация'], title: 'Промышленное проектирование зданий и объектов | Альянс Энерджи', description: 'Промышленное проектирование зданий, предприятий и производственных объектов: проектная и рабочая документация, BIM и инженерные системы.', schema: ['Service', 'BreadcrumbList'] },
  { file: 'projectirovanie-promishlennih-zdaniipredpriyatii.html', slug: 'projectirovanie-promishlennih-zdaniipredpriyatii', type: 'service', cluster: 'retail_design', primary: 'проектирование торговых объектов', secondary: ['проектирование торговых центров', 'проектирование магазинов', 'проектирование объектов ритейла', 'инженерные системы торговых объектов'], title: 'Проектирование торговых объектов и магазинов | Альянс Энерджи', description: 'Проектирование торговых центров, магазинов и объектов ритейла: планировки, инженерные разделы, рабочая документация и сопровождение.', schema: ['Service', 'BreadcrumbList'] },
  { file: 'projectirovanie-sport-soroozhenii.html', slug: 'projectirovanie-sport-soroozhenii', type: 'service', cluster: 'sport_design', primary: 'проектирование спортивных сооружений', secondary: ['проектирование ФОК', 'проектирование физкультурно-оздоровительных комплексов', 'BIM спортивных объектов'], title: 'Проектирование спортивных сооружений и ФОК | Альянс Энерджи', description: 'Проектирование спортивных сооружений и физкультурно-оздоровительных комплексов: проектная документация, BIM и сопровождение.', schema: ['Service', 'BreadcrumbList'] },
  { file: 'projectirovanie-med-ucherezhdenii.html', slug: 'projectirovanie-med-ucherezhdenii', type: 'service', cluster: 'medical_design', primary: 'проектирование медицинских учреждений', secondary: ['проектирование поликлиник', 'проектирование объектов здравоохранения', 'инженерные системы медицинских объектов'], title: 'Проектирование медицинских учреждений | Альянс Энерджи', description: 'Проектирование медицинских учреждений, поликлиник и объектов здравоохранения с учетом инженерных требований, BIM и нормативов.', schema: ['Service', 'BreadcrumbList'] },
  { file: 'projectirovanie-objectov-turizma.html', slug: 'projectirovanie-objectov-turizma', type: 'service', cluster: 'tourism_design', primary: 'проектирование объектов туризма', secondary: ['проектирование гостиниц', 'проектирование отелей', 'проектирование туристических комплексов'], title: 'Проектирование объектов туризма и гостиниц | Альянс Энерджи', description: 'Проектирование гостиниц, отелей, туристических комплексов и объектов отдыха: архитектурные, конструктивные и инженерные решения.', schema: ['Service', 'BreadcrumbList'] },
  { file: 'objecti-infrastrukturi.html', slug: 'objecti-infrastrukturi', type: 'service', cluster: 'infrastructure_design', primary: 'проектирование объектов инфраструктуры', secondary: ['проектирование дорог', 'проектирование вокзалов', 'проектирование депо', 'проектирование парковок'], title: 'Проектирование объектов инфраструктуры | Альянс Энерджи', description: 'Проектирование объектов инфраструктуры, дорог, развязок, парковок, вокзалов и депо с разработкой проектной и рабочей документации.', schema: ['Service', 'BreadcrumbList'] },
  { file: 'projectirovanie-barov-restoranov.html', slug: 'projectirovanie-barov-restoranov', type: 'service', cluster: 'horeca_design', primary: 'проектирование ресторанов', secondary: ['проектирование кафе', 'проектирование баров', 'проектирование объектов общественного питания'], title: 'Проектирование ресторанов, кафе и баров | Альянс Энерджи', description: 'Проектирование ресторанов, кафе, баров и предприятий общественного питания: планировки, инженерные системы, документация и сопровождение.', schema: ['Service', 'BreadcrumbList'] },
  { file: 'projectirovanie-selskogo-lesnogo-hozyastva.html', slug: 'projectirovanie-selskogo-lesnogo-hozyastva', type: 'service', cluster: 'agro_forestry_design', primary: 'проектирование сельскохозяйственных объектов', secondary: ['проектирование объектов лесного хозяйства', 'проектирование агропромышленных объектов', 'производственные здания сельского хозяйства'], title: 'Проектирование сельскохозяйственных объектов | Альянс Энерджи', description: 'Проектирование объектов сельского и лесного хозяйства: производственные здания, инфраструктура, инженерные системы и документация.', schema: ['Service', 'BreadcrumbList'] },
  { file: 'tehnicheskoe-obsledovanie.html', slug: 'tehnicheskoe-obsledovanie', type: 'service', cluster: 'technical_survey', primary: 'техническое обследование зданий', secondary: ['обследование зданий и сооружений', 'техническое заключение', 'обследование строительных конструкций'], title: 'Техническое обследование зданий и сооружений | Альянс Энерджи', description: 'Техническое обследование зданий и сооружений: оценка конструкций, дефектов, состояния инженерных систем и подготовка заключений.', schema: ['Service', 'BreadcrumbList'] },
  { file: 'raschet-konstrukcij.html', slug: 'raschet-konstrukcij', type: 'service', cluster: 'structural_calculation', primary: 'расчет строительных конструкций', secondary: ['расчет конструкций', 'расчет нагрузок', 'проверка прочности конструкций', 'расчет устойчивости'], title: 'Расчет строительных конструкций | Альянс Энерджи', description: 'Расчет строительных конструкций для зданий и сооружений: проверка прочности, устойчивости, нагрузок и проектных решений.', schema: ['Service', 'BreadcrumbList'] },
  { file: 'negosudarstvennaya-ekspertiza.html', slug: 'negosudarstvennaya-ekspertiza', type: 'service', cluster: 'non_state_expertise', primary: 'негосударственная экспертиза проектной документации', secondary: ['негосударственная экспертиза', 'экспертиза проектной документации', 'строительная экспертиза'], title: 'Негосударственная экспертиза проектной документации | Альянс Энерджи', description: 'Негосударственная экспертиза проектной документации: проверка разделов проекта, нормативов и подготовка официального заключения.', schema: ['Service', 'BreadcrumbList'] },
  { file: 'laboratoriya-kontrolya.html', slug: 'laboratoriya-kontrolya', type: 'service', cluster: 'ndt_laboratory', primary: 'лаборатория неразрушающего контроля', secondary: ['неразрушающий контроль конструкций', 'обследование прочности конструкций', 'инструментальные измерения'], title: 'Лаборатория неразрушающего контроля | Альянс Энерджи', description: 'Лаборатория неразрушающего контроля: обследование прочности конструкций, инструментальные измерения и технические заключения.', schema: ['Service', 'BreadcrumbList'] },
  { file: 'kapremont.html', slug: 'kapremont', type: 'service', cluster: 'capital_repair', primary: 'капитальный ремонт зданий и сооружений', secondary: ['проектирование капитального ремонта', 'капремонт зданий', 'проектная документация на капитальный ремонт'], title: 'Капитальный ремонт зданий и сооружений | Альянс Энерджи', description: 'Проектирование и сопровождение капитального ремонта зданий и сооружений: обследование, документация, инженерные решения и контроль.', schema: ['Service', 'BreadcrumbList'] },
  { file: 'projects.html', slug: 'our_projects', type: 'projects', cluster: 'projects_portfolio', primary: 'проекты проектной организации', secondary: ['реализованные проекты', 'промышленное проектирование проекты', 'проектирование объектов Волгоград'], title: 'Проекты и выполненные работы | Альянс Энерджи', description: 'Проекты Альянс Энерджи: промышленные, общественные, медицинские, инфраструктурные и инженерные объекты в Волгограде и России.', schema: ['CollectionPage', 'CreativeWork', 'BreadcrumbList'] },
  { file: 'bombonera.html', slug: 'bombonera', type: 'project', cluster: 'sport_project', primary: 'проект комплекса Бомбонера', secondary: ['проектирование спортивного комплекса', 'проектная документация спортивного объекта'], title: 'Проект комплекса «Бомбонера» | Альянс Энерджи', description: 'Проектирование и реализация комплекса «Бомбонера»: проектная документация, инженерные решения и сопровождение объекта.', schema: ['CreativeWork', 'BreadcrumbList'] },
  { file: 'poliklinika.html', slug: 'poliklinika', type: 'project', cluster: 'medical_project', primary: 'проект поликлиники', secondary: ['проектирование медицинского учреждения', 'инженерные системы поликлиники'], title: 'Проект поликлиники | Альянс Энерджи', description: 'Проект поликлиники: документация для медицинского учреждения, инженерные системы, BIM-решения и сопровождение проектирования.', schema: ['CreativeWork', 'BreadcrumbList'] },
  { file: 'proizvodstvenno-logisticheskii-kompleks.html', slug: 'proizvodstvenno-logisticheskii-kompleks', type: 'project', cluster: 'industrial_project', primary: 'проект производственно-логистического комплекса', secondary: ['проектирование производственных объектов', 'промышленное проектирование комплекса'], title: 'Производственно-логистический комплекс | Альянс Энерджи', description: 'Проект производственно-логистического комплекса: промышленное проектирование, инженерные системы и рабочая документация.', schema: ['CreativeWork', 'BreadcrumbList'] },
  { file: 'tehnicheskoe-perevooruzhenie-travilnogo-otdeleniya.html', slug: 'tehnicheskoe-perevooruzhenie-travilnogo-otdeleniya', type: 'project', cluster: 'industrial_reequipment_project', primary: 'проект технического перевооружения', secondary: ['техническое перевооружение производства', 'проектная документация промышленного объекта'], title: 'Техническое перевооружение травильного отделения | Альянс Энерджи', description: 'Проект технического перевооружения травильного отделения: промышленная документация, инженерные решения и сопровождение реализации.', schema: ['CreativeWork', 'BreadcrumbList'] },
  { file: 'disign-and-realizaciya-evrohim.html', slug: 'disign-and-realizaciya-evrohim', type: 'project', cluster: 'office_project', primary: 'дизайн и реализация офиса', secondary: ['проект офиса ЕвроХим ВолгаКалий', 'инженерные решения офиса'], title: 'Дизайн и реализация офиса ЕвроХим ВолгаКалий | Альянс Энерджи', description: 'Дизайн и реализация офиса компании ЕвроХим ВолгаКалий: проектные решения, инженерное сопровождение и реализация пространства.', schema: ['CreativeWork', 'BreadcrumbList'] },
  { file: 'news.html', slug: 'news', type: 'news', cluster: 'news', primary: 'новости проектирования', secondary: ['новости строительной экспертизы', 'новости BIM', 'новости Альянс Энерджи'], title: 'Новости проектирования и экспертизы | Альянс Энерджи', description: 'Новости Альянс Энерджи о проектировании, экспертизе, BIM, инженерных системах и реализованных объектах компании.', schema: ['CollectionPage', 'BreadcrumbList'] },
  { file: 'about.html', slug: 'o-nas', type: 'about', cluster: 'company', primary: 'проектная организация Волгоград', secondary: ['Альянс Энерджи', 'BIM-проектирование', 'промышленное проектирование Волгоград'], title: 'Проектная организация в Волгограде | Альянс Энерджи', description: 'Альянс Энерджи — проектная организация в Волгограде: промышленное проектирование, BIM, экспертиза и инженерное сопровождение объектов.', schema: ['AboutPage', 'BreadcrumbList'] },
  { file: 'contacts.html', slug: 'kontakty', type: 'contact', cluster: 'contacts', primary: 'проектная организация Волгоград контакты', secondary: ['проектирование Волгоград', 'строительная экспертиза Волгоград', 'Альянс Энерджи контакты'], title: 'Контакты проектной организации | Альянс Энерджи', description: 'Контакты проектной организации Альянс Энерджи в Волгограде: телефон, почта, адрес и форма обратной связи для проектирования и экспертизы.', schema: ['ContactPage', 'BreadcrumbList'] },
  { file: 'privacy.html', slug: 'privacy', type: 'legal', cluster: 'legal', primary: 'политика конфиденциальности', secondary: ['обработка персональных данных', 'условия конфиденциальности'], title: 'Политика конфиденциальности | Альянс Энерджи', description: 'Политика конфиденциальности сайта Альянс Энерджи: условия обработки персональных данных и обращения пользователей.', schema: ['WebPage', 'BreadcrumbList'] },
  { file: 'obrabotka-pers-dannih.html', slug: 'obrabotka-pers-dannih', type: 'legal', cluster: 'legal', primary: 'политика обработки персональных данных', secondary: ['персональные данные', 'защита персональных данных'], title: 'Политика обработки персональных данных | Альянс Энерджи', description: 'Политика обработки персональных данных ООО «Альянс Энерджи»: порядок обработки, хранения и защиты персональной информации.', schema: ['WebPage', 'BreadcrumbList'] }
];

const clusterRules = [
  ['industrial_design', /промышлен|производствен|предприят|завод|цех|техническ.*перевооруж/i],
  ['core_design', /проектирован|проектная документац|рабочая документац|зданий|сооружений|bim|бим/i],
  ['engineering_systems', /инженерн.*систем/i],
  ['technical_survey', /обследован|техническое заключ|дефект/i],
  ['structural_calculation', /расчет конструкц|расч[её]т нагруз|прочност|устойчивост/i],
  ['non_state_expertise', /экспертиз|негосударствен/i],
  ['ndt_laboratory', /неразрушающ|лаборатор|контрол/i],
  ['sport_design', /спорт|фок|физкультур/i],
  ['medical_design', /медицин|поликлиник|здравоохран/i],
  ['tourism_design', /туризм|гостиниц|отел|турист/i],
  ['infrastructure_design', /инфраструкт|дорог|развяз|парков|вокзал|депо/i],
  ['retail_design', /торгов|магазин|ритейл/i],
  ['horeca_design', /ресторан|кафе|бар|общепит|общественного питания/i],
  ['agro_forestry_design', /сельск|лесн|агро/i],
  ['capital_repair', /капитальн|капремонт/i],
  ['company', /проектная организация|волгоград/i]
];

const forbidden = [
  /сетевой город/i, /(^|\s)оценки?($|\s)/i, /^рассчитать$/i, /^посчитать$/i,
  /время в волгограде/i, /ивц|жкх|тэк/i, /госуслуг|дневник|школ/i,
  /авито|работа|ваканси/i, /реферат|курсов|диплом|презентац/i,
  /википед|форум|скачать|калькулятор/i, /цель применения|объект исследования|сооружение это/i,
  /новости волгоград/i, /погода|карта|расписание/i
];

const relevant = /проект|проектир|документац|bim|бим|инженер|экспертиз|обследован|конструкц|здан|сооруж|промышлен|медицин|спорт|туризм|инфраструкт|торгов|ресторан|кафе|бар|сельск|лесн|контрол|капитальн|волгоград|строитель|объект|комплекс|систем/i;

function urlFor(page) {
  return page.slug ? `${site}/${page.slug}/` : `${site}/`;
}

function hrefForFile(file) {
  const page = pages.find((item) => item.file === file);
  return page ? (page.slug ? `/${page.slug}/` : '/') : file;
}

function textFromFirstH1(html) {
  const m = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : '';
}

function classifyKeyword(keyword) {
  const phrase = keyword.normalized || keyword.phrase || '';
  for (const [id, re] of clusterRules) if (re.test(phrase)) return id;
  return null;
}

function cleanWordstat() {
  const current = JSON.parse(fs.readFileSync(path.join(root, 'seo', 'wordstat-clean.json'), 'utf8'));
  let raw = current;
  try {
    const fromGit = cp.execFileSync('git', ['show', 'HEAD:seo/wordstat-clean.json'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const parsed = JSON.parse(fromGit);
    if ((parsed.keywords || []).length >= (current.keywords || []).length) raw = parsed;
  } catch (_) {
    raw = current;
  }
  const seen = new Set();
  const removed = [];
  const keywords = [];
  for (const item of raw.keywords || []) {
    const phrase = (item.normalized || item.phrase || '').trim().toLowerCase();
    const isBad = forbidden.some((re) => re.test(phrase)) || !relevant.test(phrase);
    if (isBad) {
      removed.push({ phrase: item.phrase, normalized: item.normalized, reason: 'irrelevant_or_informational_noise' });
      continue;
    }
    if (seen.has(phrase)) continue;
    seen.add(phrase);
    const service = classifyKeyword(item) || item.service || 'general';
    keywords.push({
      ...item,
      service,
      intent: /купить|заказать|стоимость|цена|под ключ|услуг|компан|организац/i.test(phrase) ? 'commercial' : (item.intent || 'mixed'),
      commercial: /купить|заказать|стоимость|цена|под ключ|услуг|компан|организац/i.test(phrase) || !!item.commercial,
      geo: /волгоград|волгоградск/i.test(phrase) || !!item.geo
    });
  }
  keywords.sort((a, b) => (b.countMax || 0) - (a.countMax || 0));
  const out = { generatedAt: new Date().toISOString(), sourceTotalKeywords: raw.totalKeywords || raw.keywords?.length || 0, totalKeywords: keywords.length, removedNoiseCount: removed.length, removedNoiseExamples: removed.slice(0, 80), seeds, regions: ['Волгоград', 'Волгоградская область', 'Россия'], keywords };
  fs.writeFileSync(path.join(root, 'seo', 'wordstat-clean.json'), JSON.stringify(out, null, 2), 'utf8');
  return out;
}

function buildClusters(clean) {
  const by = new Map();
  for (const item of clean.keywords) {
    const id = classifyKeyword(item) || item.service || 'general';
    if (!by.has(id)) by.set(id, []);
    by.get(id).push(item);
  }
  const clusters = [...by.entries()].map(([id, keywords]) => {
    const assignedPages = pages.filter((p) => p.cluster === id).map((p) => p.file);
    return {
      id,
      intent: keywords.some((k) => k.commercial) ? 'commercial/mixed' : 'informational/mixed',
      pageType: assignedPages.length ? 'assigned' : 'supporting',
      geo: keywords.some((k) => k.geo),
      totalFrequency: keywords.reduce((sum, k) => sum + (k.countMax || 0), 0),
      assignedPages,
      primaryCandidates: keywords.slice(0, 8).map((k) => k.phrase),
      keywords: keywords.slice(0, 60)
    };
  }).sort((a, b) => b.totalFrequency - a.totalFrequency);

  const curatedClusters = pages.filter((p) => !clusters.some((c) => c.id === p.cluster)).map((p) => ({
    id: p.cluster,
    intent: p.type === 'legal' ? 'legal/navigation' : 'commercial/navigational',
    pageType: p.type,
    geo: p.secondary.some((k) => /волгоград/i.test(k)),
    totalFrequency: 0,
    assignedPages: [p.file],
    primaryCandidates: [p.primary, ...p.secondary],
    keywords: [p.primary, ...p.secondary].map((phrase) => ({ phrase, normalized: phrase.toLowerCase(), sourceTypes: ['curated'], countMax: 0, countSum: 0 }))
  }));

  const out = { generatedAt: new Date().toISOString(), totalClusters: clusters.length + curatedClusters.length, clusters: [...clusters, ...curatedClusters] };
  fs.writeFileSync(path.join(root, 'seo', 'keyword-clusters.json'), JSON.stringify(out, null, 2), 'utf8');
  return out;
}

function buildSchema(page, html) {
  const url = urlFor(page);
  const name = page.title;
  const h1 = textFromFirstH1(html) || page.h1 || page.title.replace(/\s*\|\s*Альянс Энерджи$/, '');
  const graph = [
    {
      '@type': ['Organization', 'LocalBusiness', 'ProfessionalService'],
      '@id': `${site}/#organization`,
      name: 'ООО «Альянс Энерджи»',
      legalName: 'Общество с ограниченной ответственностью «Альянс Энерджи»',
      url: site,
      logo: `${site}/css/images/logo_transparent.png`,
      telephone: '+7 (937) 096-10-00',
      email: 'dr@allnrg.ru',
      taxID: '3445123098',
      address: { '@type': 'PostalAddress', streetAddress: '400074, г. Волгоград, ул. Баррикадная, д. 1К, офис 2', addressLocality: 'Волгоград', addressRegion: 'Волгоградская область', addressCountry: 'RU' },
      areaServed: [{ '@type': 'City', name: 'Волгоград' }, { '@type': 'Country', name: 'Россия' }]
    },
    { '@type': 'WebSite', '@id': `${site}/#website`, url: site, name: 'Альянс Энерджи', publisher: { '@id': `${site}/#organization` }, inLanguage: 'ru-RU' },
    { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Главная', item: `${site}/` }, { '@type': 'ListItem', position: 2, name: h1, item: url }] },
    { '@type': page.schema.includes('CollectionPage') ? 'CollectionPage' : (page.schema.includes('ContactPage') ? 'ContactPage' : (page.schema.includes('AboutPage') ? 'AboutPage' : 'WebPage')), '@id': `${url}#webpage`, url, name, headline: h1, description: page.description, isPartOf: { '@id': `${site}/#website` }, about: { '@id': `${site}/#organization` }, breadcrumb: { '@id': `${url}#breadcrumb` }, inLanguage: 'ru-RU' }
  ];
  if (page.type === 'service' || page.type === 'services') {
    graph.push({ '@type': 'Service', '@id': `${url}#service`, name: h1, serviceType: page.primary, description: page.description, provider: { '@id': `${site}/#organization` }, areaServed: [{ '@type': 'City', name: 'Волгоград' }, { '@type': 'AdministrativeArea', name: 'Волгоградская область' }, { '@type': 'Country', name: 'Россия' }], url });
  }
  if (page.type === 'project' || page.type === 'projects') {
    graph.push({ '@type': 'CreativeWork', '@id': `${url}#creativework`, name: h1, headline: h1, description: page.description, creator: { '@id': `${site}/#organization` }, publisher: { '@id': `${site}/#organization` }, about: page.primary, url, inLanguage: 'ru-RU' });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

function replaceOrAdd(html, re, replacement, before = '</head>') {
  if (re.test(html)) return html.replace(re, replacement);
  return html.replace(before, `${replacement}\n${before}`);
}

function updateHtml() {
  for (const page of pages) {
    const file = path.join(root, page.file);
    if (!fs.existsSync(file)) continue;
    let html = fs.readFileSync(file, 'utf8');
    const url = urlFor(page);
    html = replaceOrAdd(html, /<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${page.title}</title>`);
    html = replaceOrAdd(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${page.description}">`);
    html = replaceOrAdd(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${url}">`);
    html = replaceOrAdd(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${page.title}">`);
    html = replaceOrAdd(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${page.description}">`);
    html = replaceOrAdd(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${url}">`);
    html = replaceOrAdd(html, /<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${page.title}">`);
    html = replaceOrAdd(html, /<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${page.description}">`);
    const schema = `<script type="application/ld+json">\n${buildSchema(page, html)}\n</script>`;
    html = /<script[^>]+application\/ld\+json[^>]*>[\s\S]*?<\/script>/i.test(html)
      ? html.replace(/<script[^>]+application\/ld\+json[^>]*>[\s\S]*?<\/script>/i, schema)
      : html.replace('</head>', `${schema}\n</head>`);
    html = html.replace(/<img\b(?![^>]*\salt=)([^>]*\bsrc=["'][^"']*logo[^"']*["'][^>]*)>/gi, '<img alt="Альянс Энерджи"$1>');
    html = html.replace(/<img\b(?![^>]*\salt=)([^>]*)>/gi, `<img alt="${page.primary}"$1>`);
    fs.writeFileSync(file, html, 'utf8');
  }
}

function buildSeoMap() {
  const mapped = pages.map((p) => {
    const html = fs.existsSync(path.join(root, p.file)) ? fs.readFileSync(path.join(root, p.file), 'utf8') : '';
    const h1 = textFromFirstH1(html) || p.h1 || '';
    return {
      file: p.file,
      url: urlFor(p),
      type: p.type,
      clusterId: p.cluster,
      primaryKeyword: p.primary,
      secondaryKeywords: p.secondary,
      longTailKeywords: p.secondary.filter((k) => k.split(/\s+/).length >= 3),
      geoKeywords: [p.primary, ...p.secondary].filter((k) => /волгоград/i.test(k)),
      title: p.title,
      description: p.description,
      h1,
      h2h3: 'Визуальная структура сохранена; SEO-правки ограничены метаданными, JSON-LD и атрибутами изображений.',
      imageAlt: `Значимые изображения: "${p.primary}"; логотипы: "Альянс Энерджи"; декоративные изображения допускаются с пустым alt.`,
      canonical: urlFor(p),
      schemaType: p.schema.join(' + '),
      internalLinks: ['index.html', 'services.html', 'projects.html', 'contacts.html'].filter((x) => x !== p.file).map(hrefForFile),
      cannibalizationRisk: p.type === 'legal' ? 'Нет коммерческого пересечения' : 'Низкий: primary keyword закреплен за одной основной страницей',
      textRecommendations: 'Радикальные переписывания не требуются; при будущей контентной итерации допустимы только точечные естественные уточнения.'
    };
  });
  fs.writeFileSync(path.join(root, 'seo', 'seo-map.json'), JSON.stringify({ generatedAt: new Date().toISOString(), pages: mapped }, null, 2), 'utf8');
  return mapped;
}

function buildSitemapRobots() {
  const urls = pages.map((p) => `  <url><loc>${urlFor(p)}</loc><lastmod>${today}</lastmod></url>`).join('\n');
  fs.writeFileSync(path.join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, 'utf8');
  fs.writeFileSync(path.join(root, 'robots.txt'), `User-agent: *\nDisallow:\nSitemap: ${site}/sitemap.xml\n`, 'utf8');
}

function buildSeoReport(clean, clusters, map) {
  const lines = [
    '# SEO semantic refinement',
    '',
    `Дата обновления: ${today}`,
    '',
    '## WordStat',
    `Seed-запросов: ${seeds.length}.`,
    `Исходно ключей: ${clean.sourceTotalKeywords}.`,
    `После очистки: ${clean.totalKeywords}.`,
    `Удалено мусорных/нерелевантных фраз: ${clean.removedNoiseCount}.`,
    'Регионы: Волгоград, Волгоградская область, Россия.',
    '',
    '## Удаленный шум',
    ...clean.removedNoiseExamples.slice(0, 20).map((x) => `- ${x.phrase}`),
    '',
    '## Кластеры',
    ...clusters.clusters.map((c) => `- ${c.id}: ${c.assignedPages.join(', ') || 'supporting'}, ${c.keywords.length} keywords`),
    '',
    '## SEO-map',
    '| Страница | Primary keyword | Cluster | Canonical |',
    '|---|---|---|---|',
    ...map.map((p) => `| ${p.file} | ${p.primaryKeyword} | ${p.clusterId} | ${p.canonical} |`),
    '',
    '## Каннибализация',
    'Primary keywords закреплены за одной основной страницей. Пересечения между hub-страницами и service/project-страницами оставлены как поддерживающие secondary keywords.'
  ];
  fs.writeFileSync(path.join(root, 'seo', 'seo-report.md'), lines.join('\n') + '\n', 'utf8');
}

function main() {
  const clean = cleanWordstat();
  const clusters = buildClusters(clean);
  updateHtml();
  const map = buildSeoMap();
  buildSitemapRobots();
  buildSeoReport(clean, clusters, map);
  console.log(`Refined SEO: ${clean.sourceTotalKeywords} -> ${clean.totalKeywords} keywords, ${clusters.totalClusters} clusters, ${map.length} pages.`);
}

main();
