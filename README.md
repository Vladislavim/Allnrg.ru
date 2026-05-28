# Allnrg.ru clean static version

Чистая статическая версия сайта allnrg.ru без WordPress-зависимостей.  
Задача проекта: сохранить визуал продакшн-сайта 1в1, но держать код в нормальной самописной структуре для дальнейшей поддержки.

## Что внутри

- Статические HTML-страницы без WordPress.
- Локальные CSS, JS, шрифты, изображения и видео.
- Те же визуальные ассеты, что использовались при переносе сайта.
- Оптимизированные изображения в `assets/optimized`.
- Lenis smooth scroll подключен локально из `assets/vendor/lenis`.
- Умеренные reveal-анимации через CSS и легкий JS.
- SEO-файлы: `robots.txt`, `sitemap.xml`, metadata в HTML.

## Запуск локально

Из папки проекта:

```bash
python -m http.server 8090
```

Открыть:

```text
http://127.0.0.1:8090/index.html
```

Сайт статический, сборка для обычного просмотра не нужна.

## Структура

```text
clean/
  assets/
    css/
      fixes.css
      motion.css
      production-overrides.css
    img/
    optimized/
    vendor/
      lenis/
    background-imanakov-vlad-main.mp4
    background-imanakov-vlad-main-mobile.mp4
  css/
    theme.css
    theme-fonts.css
    pages/
  js/
    pages/
    partners-marquee.js
    site-enhancements.js
  seo/
  index.html
  services.html
  projects.html
  news.html
  about.html
  contacts.html
  privacy.html
  robots.txt
  sitemap.xml
```

## Основные страницы

- `index.html` — главная.
- `services.html` — услуги.
- `projects.html` — проекты / работы.
- `news.html` — новости.
- `about.html` — о компании.
- `contacts.html` — контакты.
- `privacy.html` и `obrabotka-pers-dannih.html` — политика обработки персональных данных.

Внутренние страницы услуг и проектов:

- `promishlennoe-projectirovaniye.html`
- `projectirovanie-sport-soroozhenii.html`
- `projectirovanie-med-ucherezhdenii.html`
- `projectirovanie-objectov-turizma.html`
- `objecti-infrastrukturi.html`
- `projectirovanie-barov-restoranov.html`
- `projectirovanie-selskogo-lesnogo-hozyastva.html`
- `raschet-konstrukcij.html`
- `tehnicheskoe-obsledovanie.html`
- `negosudarstvennaya-ekspertiza.html`
- `laboratoriya-kontrolya.html`
- `kapremont.html`
- `proizvodstvenno-logisticheskii-kompleks.html`
- `tehnicheskoe-perevooruzhenie-travilnogo-otdeleniya.html`
- `poliklinika.html`
- `bombonera.html`

## CSS

Основные стили лежат в:

- `css/theme.css` — базовая тема и общая верстка.
- `css/theme-fonts.css` — подключение шрифтов.
- `css/pages/*.css` — стили конкретных страниц.
- `assets/css/production-overrides.css` — production-правки и точечные исправления визуального соответствия.
- `assets/css/motion.css` — reveal-анимации.
- `assets/css/fixes.css` — дополнительные фиксирующие стили.

Приоритет поддержки: не менять дизайн произвольно. Если нужен фикс, сначала сверять визуал с продом allnrg.ru.

## JS

Основные скрипты:

- `js/site-enhancements.js` — общие улучшения поведения сайта: меню, формы, копирование контактов, Lenis, reveal, слайдеры и мелкая интерактивность.
- `js/partners-marquee.js` — лента партнеров.
- `js/pages/*.js` — страничные скрипты.

JS подключается локально. CDN для Lenis не используется.

## Ассеты

Изображения лежат в:

- `assets/img`
- `assets/optimized`

Видео для футерной маски:

- `assets/background-imanakov-vlad-main.mp4` — desktop.
- `assets/background-imanakov-vlad-main-mobile.mp4` — mobile, облегченная версия.

Новые изображения не генерировать и не заменять без необходимости. Визуал должен оставаться как на allnrg.ru.

## SEO и служебные файлы

- `robots.txt`
- `sitemap.xml`
- `seo/seo-map.json`
- `seo/seo-report.md`
- `seo/keyword-clusters.json`

Служебный кэш `seo/.cache/` не коммитится.

## NPM-скрипты

В проекте есть вспомогательные скрипты для SEO:

```bash
npm run wordstat
npm run seo:apply
npm run qa:seo
npm run seo:all
```

Для обычного запуска сайта они не нужны.

## Проверка качества

Перед публикацией проверять:

- desktop, tablet, mobile;
- ширины 1920, 1440, 1366, 1024, 768, 390, 360;
- отсутствие горизонтального скролла;
- отсутствие второго внутреннего скролла;
- отсутствие мусора после footer;
- отсутствие WordPress-кредитов и служебных блоков;
- работу меню, форм, слайдеров, кнопок и копирования контактов;
- корректность изображений, декоративных паттернов и параллаксов.

## Правила поддержки

- Не возвращать WordPress-зависимости.
- Не подключать Bootstrap, Tailwind или готовые UI-библиотеки.
- Не менять цвета, шрифты, сетку, композицию и тексты без отдельной задачи.
- Не оставлять debug-фоны, outline, временные рамки и тестовые подписи.
- Не дублировать desktop/tablet/mobile HTML-разметку.
- Не добавлять лишний контент после footer.
- Любые визуальные правки сверять с продакшеном allnrg.ru.

## Git

Репозиторий:

```text
https://github.com/Vladislavim/Allnrg.ru.git
```

Основная ветка:

```text
main
```
