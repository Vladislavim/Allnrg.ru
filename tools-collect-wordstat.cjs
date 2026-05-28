const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const SEO_DIR = path.join(ROOT, 'seo');
const CACHE_DIR = path.join(SEO_DIR, '.cache');
const ENV_PATH = process.env.WORDSTAT_ENV_PATH || 'C:\\Users\\viman\\OneDrive\\Рабочий стол\\сайтец\\.env';

const SEEDS = [
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

const REGIONS = [
  { id: '38', name: 'Волгоград' },
  { id: '10950', name: 'Волгоградская область' }
];

function readEnv(file) {
  const env = {};
  if (!fs.existsSync(file)) return env;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line || /^\s*#/.test(line)) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return env;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cacheName(kind, body) {
  const safe = crypto.createHash('sha256').update(JSON.stringify({ kind, body })).digest('hex');
  return path.join(CACHE_DIR, `${safe}.json`);
}

async function requestWordstat(env, kind, endpoint, body, units = 1) {
  const cacheFile = cacheName(kind, body);
  if (fs.existsSync(cacheFile)) {
    return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
  }

  const url = `https://searchapi.api.cloud.yandex.net/v2/wordstat/${endpoint}`;
  let attempt = 0;
  let lastError = null;

  while (attempt < 4) {
    attempt += 1;
    const startedAt = new Date().toISOString();
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Api-Key ${env.YANDEX_SEARCH_API_KEY}`
        },
        body: JSON.stringify(body)
      });
      const text = await res.text();
      const parsed = text ? safeJson(text) : null;
      const payload = {
        ok: res.ok,
        status: res.status,
        endpoint,
        request: maskRequest(body),
        response: parsed || text,
        requestedAt: startedAt,
        quotaUnits: units,
        attempt
      };

      if (res.ok) {
        fs.writeFileSync(cacheFile, JSON.stringify(payload, null, 2), 'utf8');
        return payload;
      }

      lastError = payload;
      if (res.status === 429 || res.status === 503) {
        const retryAfter = Number(res.headers.get('retry-after')) || 3 * attempt;
        await sleep(retryAfter * 1000);
        continue;
      }
      break;
    } catch (error) {
      lastError = {
        ok: false,
        status: 0,
        endpoint,
        request: maskRequest(body),
        response: { message: error.message },
        requestedAt: startedAt,
        attempt
      };
      await sleep(1000 * attempt);
    }
  }

  fs.writeFileSync(cacheFile, JSON.stringify(lastError, null, 2), 'utf8');
  return lastError;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function maskRequest(body) {
  return { ...body };
}

function normalizePhrase(phrase) {
  return String(phrase || '')
    .toLowerCase()
    .replace(/[ё]/g, 'е')
    .replace(/[^\p{L}\p{N}\s-]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function classifyKeyword(phrase) {
  const p = normalizePhrase(phrase);
  const geo = /\bволгоград|волгоградск/.test(p);
  const commercial = /\bцена|стоимость|заказать|купить|под ключ|организация|компания|услуги|разработка|проектирование|экспертиза|обследование|расчет\b/.test(p);
  let intent = 'informational';
  if (commercial) intent = 'commercial';
  if (/\bчто такое|как|правила|требования|сп\b/.test(p)) intent = 'informational';

  let service = 'general';
  const rules = [
    ['industrial_design', /промышлен|производствен/],
    ['building_design', /зданий|сооружен|объект/],
    ['project_documentation', /проектная документация|рабочая документация/],
    ['bim', /\bbim\b|бим|моделирован/],
    ['engineering_systems', /инженерн/],
    ['construction_expertise', /экспертиз|консалтинг/],
    ['technical_inspection', /обследован/],
    ['structural_calculation', /расчет конструкц|расчёт конструкц/],
    ['ndt_lab', /лаборатор|неразрушающ/],
    ['sports', /спорт/],
    ['medical', /медицин|поликлиник/],
    ['tourism', /туризм|гостиниц|санатор/],
    ['infrastructure', /инфраструктур/],
    ['horeca', /ресторан|бар|общественного питания/],
    ['agriculture_forestry', /сельск|лесн/]
  ];
  for (const [name, rx] of rules) {
    if (rx.test(p)) {
      service = name;
      break;
    }
  }
  return { intent, service, geo, commercial };
}

function mergeClean(raw) {
  const byPhrase = new Map();
  for (const item of raw.requests) {
    const data = item.response || {};
    const rows = [
      ...(Array.isArray(data.results) ? data.results.map((row) => ({ ...row, sourceType: 'result' })) : []),
      ...(Array.isArray(data.associations) ? data.associations.map((row) => ({ ...row, sourceType: 'association' })) : [])
    ];
    for (const row of rows) {
      const phrase = normalizePhrase(row.phrase);
      if (!phrase) continue;
      const prev = byPhrase.get(phrase) || {
        phrase: row.phrase,
        normalized: phrase,
        countMax: 0,
        countSum: 0,
        appearances: 0,
        seeds: [],
        regions: [],
        sourceTypes: new Set()
      };
      const count = Number(row.count || 0);
      prev.countMax = Math.max(prev.countMax, count);
      prev.countSum += count;
      prev.appearances += 1;
      prev.seeds.push(item.seed);
      prev.regions.push(item.region.name);
      prev.sourceTypes.add(row.sourceType);
      byPhrase.set(phrase, prev);
    }
  }

  return [...byPhrase.values()]
    .map((row) => ({
      ...row,
      sourceTypes: [...row.sourceTypes],
      seeds: [...new Set(row.seeds)],
      regions: [...new Set(row.regions)],
      ...classifyKeyword(row.phrase)
    }))
    .sort((a, b) => b.countMax - a.countMax || a.normalized.localeCompare(b.normalized, 'ru'));
}

function buildClusters(clean) {
  const groups = new Map();
  for (const kw of clean) {
    const key = `${kw.service}:${kw.intent}:${kw.geo ? 'geo' : 'no_geo'}`;
    const group = groups.get(key) || {
      id: key,
      service: kw.service,
      intent: kw.intent,
      geo: kw.geo,
      commercial: false,
      totalFrequency: 0,
      keywords: []
    };
    group.commercial = group.commercial || kw.commercial;
    group.totalFrequency += kw.countMax;
    group.keywords.push(kw);
    groups.set(key, group);
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      keywordCount: group.keywords.length,
      primaryKeyword: group.keywords[0]?.phrase || '',
      keywords: group.keywords.slice(0, 40)
    }))
    .sort((a, b) => b.totalFrequency - a.totalFrequency);
}

async function main() {
  ensureDir(SEO_DIR);
  ensureDir(CACHE_DIR);
  const env = { ...readEnv(ENV_PATH), ...process.env };
  if (!env.YANDEX_SEARCH_API_KEY || !env.YANDEX_CLOUD_FOLDER_ID) {
    throw new Error('Missing YANDEX_SEARCH_API_KEY or YANDEX_CLOUD_FOLDER_ID');
  }

  const raw = {
    generatedAt: new Date().toISOString(),
    provider: 'Yandex Search API Wordstat',
    auth: 'Authorization: Api-Key ${YANDEX_SEARCH_API_KEY}; folderId=${YANDEX_CLOUD_FOLDER_ID}',
    seeds: SEEDS,
    regions: REGIONS,
    docs: [
      'https://aistudio.yandex.ru/docs/en/search-api/api-ref/Wordstat/getTop.html',
      'https://aistudio.yandex.ru/docs/en/search-api/api-ref/authentication.html'
    ],
    requests: []
  };

  for (const seed of SEEDS) {
    for (const region of REGIONS) {
      const body = {
        phrase: seed,
        numPhrases: '50',
        regions: [region.id],
        devices: ['DEVICE_ALL'],
        folderId: env.YANDEX_CLOUD_FOLDER_ID
      };
      const response = await requestWordstat(env, 'topRequests', 'topRequests', body);
      raw.requests.push({
        seed,
        region,
        ok: response.ok,
        status: response.status,
        response: response.response,
        requestedAt: response.requestedAt,
        cache: true
      });
      await sleep(450);
    }
  }

  const clean = mergeClean(raw);
  const clusters = buildClusters(clean);

  fs.writeFileSync(path.join(SEO_DIR, 'wordstat-raw.json'), JSON.stringify(raw, null, 2), 'utf8');
  fs.writeFileSync(path.join(SEO_DIR, 'wordstat-clean.json'), JSON.stringify({
    generatedAt: raw.generatedAt,
    totalKeywords: clean.length,
    keywords: clean
  }, null, 2), 'utf8');
  fs.writeFileSync(path.join(SEO_DIR, 'keyword-clusters.json'), JSON.stringify({
    generatedAt: raw.generatedAt,
    totalClusters: clusters.length,
    clusters
  }, null, 2), 'utf8');

  console.log(JSON.stringify({
    seeds: SEEDS.length,
    regions: REGIONS.map((r) => r.name),
    requests: raw.requests.length,
    successfulRequests: raw.requests.filter((r) => r.ok).length,
    totalKeywords: clean.length,
    totalClusters: clusters.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
