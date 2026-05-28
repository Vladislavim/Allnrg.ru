# allnrg.ru clean build inventory

## Pages
- `index.html` — главная страница, взята с текущего production HTML и локализована.
- `services.html` — страница услуг из архивного WP Rocket cache.
- `projects.html` — страница проектов из архивного WP Rocket cache.
- `news.html` — страница новостей из архивного WP Rocket cache.
- `about.html` — страница "О нас" из архивного WP Rocket cache.
- `contacts.html` — страница контактов из архивного WP Rocket cache.

## Asset Layout
- `assets/img` — локальная копия `wp-content/uploads`, включая изображения, favicon, Elementor page CSS and local font files.
- `assets/vendor` — локально перенесены только визуальные зависимости, нужные для совпадения: theme/plugin CSS, шрифты, иконки, media.
- `css` — reserved for the next safe extraction pass: reset, variables, base, layout, components, pages, responsive.
- `js` — reserved for the next safe extraction pass: main, forms, sliders.
- `pages` — reserved for future section/component templates if needed.

## Fonts
- Production uses Montserrat in many custom sections.
- Archive also contains local Elementor font CSS under `assets/img/elementor/google-fonts/css`.
- Theme fonts are kept under `assets/vendor/wp-content/themes/zaglushka/fonts`.

## Main Visual Components Found
- Top header with logo, phone, address, tender button, callback button, and navigation.
- Hero slider with dark overlay, grey panel, title, dynamic subtitle, two CTA buttons, and arrows.
- Industrial objects intro block with yellow advantage labels and BIM/industrial illustration.
- Services cards.
- Project cards.
- Cost calculation form.
- Statistics strip.
- Expertise/consulting grid.
- Work stages accordion/list.
- Consultation form.
- Partners row.
- Footer.
- Floating contact button and cookie banner.

## JavaScript Behavior Found
- Hero slider.
- Dynamic hero subtitle.
- Contact method modal.
- Tender/callback/service/calc/consultation modal states.
- Calculator choice states.
- Cookie banner and settings modal.
- Floating contact widget.

## Current Cleanup State
- External production `wp-content` and `wp-includes` URLs in delivered HTML were localized.
- External script tags were removed from delivered HTML.
- Missing local assets check passes for all six HTML pages.
- Legacy PHP/HTML/JS/plugin server files were removed from `assets/vendor`.

## Important Note
The main page intentionally still keeps production inline section CSS/HTML while visual parity is being protected. Further cleanup should be done section-by-section with screenshot comparison after each extraction, because the production page contains separate desktop/tablet/mobile Elementor blocks and many inline custom styles.
