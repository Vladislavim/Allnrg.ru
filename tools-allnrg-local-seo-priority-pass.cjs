const fs = require('fs');
const path = require('path');

const root = __dirname;
const touched = new Set();
let metaChanges = 0;
let altChanges = 0;

const metaUpdates = {
  'index.html': {
    from: 'Проектная организация в Волгограде: промышленное проектирование, инженерные системы, проектная и рабочая документация, BIM, экспертиза и обследование зданий.',
    to: 'Проектная организация в Волгограде: проектирование зданий и сооружений, проектная и рабочая документация, BIM, экспертиза и решения для эксплуатации объектов.'
  },
  'services.html': {
    from: 'Услуги проектной организации: промышленное проектирование, BIM, инженерные системы, экспертиза, обследование зданий и расчет конструкций.',
    to: 'Услуги проектной организации: промышленное проектирование, BIM, инженерные системы, экспертиза, обследование, расчет конструкций и сопровождение эксплуатации объектов.'
  },
  'promishlennoe-projectirovaniye.html': {
    from: 'Промышленное проектирование зданий, предприятий и производственных объектов: проектная и рабочая документация, BIM и инженерные системы.',
    to: 'Промышленное проектирование зданий и производственных объектов: проектная и рабочая документация, BIM, инженерные системы и решения для эксплуатации.'
  },
  'tehnicheskoe-obsledovanie.html': {
    from: 'Техническое обследование зданий и сооружений: оценка конструкций, дефектов, состояния инженерных систем и подготовка заключений.',
    to: 'Техническое обследование зданий и сооружений: оценка конструкций, дефектов, инженерных систем и подготовка заключений для дальнейшей эксплуатации.'
  },
  'kapremont.html': {
    from: 'Проектирование и сопровождение капитального ремонта зданий и сооружений: обследование, документация, инженерные решения и контроль.',
    to: 'Проектирование и сопровождение капитального ремонта зданий и сооружений: обследование, документация, инженерные решения и подготовка к эксплуатации.'
  },
  'about.html': {
    from: 'Альянс Энерджи — проектная организация в Волгограде: промышленное проектирование, BIM, экспертиза и инженерное сопровождение объектов.',
    to: 'Альянс Энерджи — проектная организация в Волгограде: промышленное проектирование, BIM, экспертиза и решения для строительства и эксплуатации объектов.'
  }
};

const altUpdates = {
  'index.html': [
    ['alt="Этапы работ"', 'alt="Этапы проектирования и сопровождения объекта"'],
    ['alt="Производственно-логистический комплекс на территории АО «Северсталь Канаты»"', 'alt="Проектирование производственно-логистического комплекса для эксплуатации объекта"'],
    ['alt="Техническое перевооружение травильного отделения листопрокатного цеха АО «Корпорация Красный Октябрь»"', 'alt="Проект технического перевооружения травильного отделения для эксплуатации производства"']
  ],
  'services.html': [
    ['alt="Услуги"', 'alt="Услуги проектирования и сопровождения эксплуатации объектов"']
  ],
  'promishlennoe-projectirovaniye.html': [
    ['alt="Производственный цех"', 'alt="Производственный объект для промышленного проектирования"'],
    ['alt="Инженер с проектной документацией"', 'alt="Проектная и рабочая документация для объекта"'],
    ['alt="Инженерные системы"', 'alt="Проектирование инженерных систем для эксплуатации объекта"'],
    ['alt="Экспертиза и безопасность"', 'alt="Проверка проектных решений и требований эксплуатации"']
  ],
  'tehnicheskoe-obsledovanie.html': [
    ['alt="Техническое обследование зданий и сооружений"', 'alt="Техническое обследование зданий и сооружений для дальнейшей эксплуатации"']
  ],
  'kapremont.html': [
    ['alt="Объект после капитального ремонта"', 'alt="Объект после капитального ремонта для дальнейшей эксплуатации"'],
    ['alt="Капитальный ремонт зданий"', 'alt="Капитальный ремонт зданий для дальнейшей эксплуатации"']
  ]
};

function updateMetaAndSchema(file, from, to) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, 'utf8');
  const before = html;
  html = html.split(from).join(to);
  if (html !== before) {
    const count = before.split(from).length - 1;
    metaChanges += count;
    fs.writeFileSync(full, html, 'utf8');
    touched.add(file);
  }
}

function updateAlt(file, pairs) {
  const full = path.join(root, file);
  let html = fs.readFileSync(full, 'utf8');
  const before = html;
  for (const [from, to] of pairs) {
    const count = html.split(from).length - 1;
    if (count) {
      html = html.split(from).join(to);
      altChanges += count;
    }
  }
  if (html !== before) {
    fs.writeFileSync(full, html, 'utf8');
    touched.add(file);
  }
}

for (const [file, item] of Object.entries(metaUpdates)) updateMetaAndSchema(file, item.from, item.to);
for (const [file, pairs] of Object.entries(altUpdates)) updateAlt(file, pairs);

const docsDir = path.join(root, 'project_docs');
fs.mkdirSync(docsDir, { recursive: true });

const report = [
  '# AllNRG local SEO pass report',
  '',
  `Дата: ${new Date().toISOString()}`,
  '',
  '## Keyword/semantic files used',
  '- seo/wordstat-clean.json',
  '- seo/keyword-clusters.json',
  '- seo/seo-map.json',
  '- seo/seo-report.md',
  '- project_docs/local_seo_copy_code_pass.md',
  '- reports/final-acceptance-report.md',
  '',
  '## Pages touched',
  ...[...touched].sort().map((file) => `- ${file}`),
  '',
  '## Metadata changed',
  '- index.html: description/OG/Twitter/schema description strengthened with проектирование, проектная и рабочая документация, эксплуатация объектов.',
  '- services.html: description/OG/Twitter/schema description strengthened with проектирование, расчет конструкций and сопровождение эксплуатации объектов.',
  '- promishlennoe-projectirovaniye.html: description/OG/Twitter/schema description clarified around промышленное проектирование, BIM and эксплуатация.',
  '- tehnicheskoe-obsledovanie.html: description/OG/Twitter/schema description clarified around обследование and дальнейшая эксплуатация.',
  '- kapremont.html: description/OG/Twitter/schema description clarified around проектирование капремонта and подготовка к эксплуатации.',
  '- about.html: description/OG/Twitter/schema description clarified around проектная организация and эксплуатация объектов.',
  '',
  '## Text blocks lightly improved',
  '- Видимые блоки в этом priority-pass не расширялись: предыдущий проход уже добавил естественные формулировки в intro/CTA на ключевых страницах. Здесь основной акцент был на metadata и alt, чтобы не менять визуальный объем блоков.',
  '',
  '## Alt attributes changed',
  `Изменено alt: ${altChanges}. Улучшены alt у смысловых изображений на главной, услугах, промышленном проектировании, техническом обследовании и капитальном ремонте.`,
  '',
  '## Technical SEO code changes',
  '- Canonical, robots.txt and sitemap were already corrected in the previous pass and were not changed here.',
  '- Open Graph/Twitter descriptions changed together with meta descriptions by exact replacement.',
  '- Existing JSON-LD descriptions changed only where the same confirmed page description was present.',
  '',
  '## Schema added',
  '- Новые schema-типы не добавлялись. Существующие Organization/WebSite/BreadcrumbList/WebPage/CollectionPage/Service/CreativeWork сохранены; изменены только описания, основанные на текущем содержании страниц.',
  '',
  '## Not changed / needs client confirmation',
  '- Отдельные страницы под направление эксплуатации не создавались: это требует подтверждения клиента.',
  '- Не добавлялись новые услуги, регионы, лицензии, сертификаты, цены, гарантии, годы опыта, отзывы и новые кейсы.',
  '- Не добавлялись новые юридические реквизиты или контакты сверх уже существующих локальных данных.',
  '',
  '## Verification',
  '- Design/layout/code architecture: not intentionally changed.',
  '- No new pages created.',
  '- Keywords are used only in metadata/alt where natural and supported by local content.',
  '- Metadata remains page-specific.',
  '- Important image alt texts were checked and improved selectively.'
].join('\n');

const confirmation = [
  '# AllNRG client confirmation needed',
  '',
  'Эти вопросы блокируют дальнейшее SEO-расширение без риска добавить неподтвержденные факты.',
  '',
  '1. Подтвердить приоритетные услуги для продвижения: проектирование, экспертиза, обследование, BIM, эксплуатация или другие направления.',
  '2. Подтвердить, нужно ли продвигать “эксплуатацию объектов” как отдельное направление или только как связку с проектированием/обследованием.',
  '3. Подтвердить точные регионы продвижения помимо Волгограда, Волгоградской области и России.',
  '4. Подтвердить официальное наименование компании, ИНН, адрес, телефон и email для schema.org и контактных блоков.',
  '5. Подтвердить список кейсов/объектов, которые можно использовать в SEO-текстах и alt без риска раскрытия лишней информации.',
  '6. Подтвердить, какие изображения являются смысловыми, а какие декоративными, если нужен более строгий alt-pass.',
  '7. Подтвердить, можно ли указывать лицензии, свидетельства, допуски, сертификаты или членство в СРО.',
  '8. Подтвердить, допустимы ли отдельные посадочные страницы под “проектирование” и “эксплуатация” в будущей итерации.'
].join('\n');

fs.writeFileSync(path.join(docsDir, 'allnrg_local_seo_pass_report.md'), report + '\n', 'utf8');
fs.writeFileSync(path.join(docsDir, 'allnrg_client_confirmation_needed.md'), confirmation + '\n', 'utf8');

console.log(JSON.stringify({ touched: [...touched].sort(), metaChanges, altChanges }, null, 2));
