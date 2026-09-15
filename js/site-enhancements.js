(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const metrikaCounterId = 109573051;

  function initMetrikaCounter() {
    if (!metrikaCounterId || typeof window === 'undefined' || window.__allnrgMetrikaLoaded) return;
    window.__allnrgMetrikaLoaded = true;

    window.ym = window.ym || function () {
      (window.ym.a = window.ym.a || []).push(arguments);
    };
    window.ym.l = window.ym.l || Number(new Date());

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://mc.yandex.ru/metrika/tag.js';
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }

    window.ym(metrikaCounterId, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true
    });
  }

  function reachMetrikaGoal(goal, params) {
    if (!goal || typeof window.ym !== 'function') return;

    try {
      window.ym(metrikaCounterId, 'reachGoal', goal, params || {});
    } catch (error) {
      // Analytics must never block the visible site behavior.
    }
  }

  function initMetrikaGoals() {
    let lastFormGoal = 'ae_form_request_success';
    const sentAt = Object.create(null);

    function sendOnce(goal, params) {
      const now = Date.now();
      if (sentAt[goal] && now - sentAt[goal] < 800) return;
      sentAt[goal] = now;
      reachMetrikaGoal(goal, params);
    }

    function inferFormGoal(form) {
      if (!(form instanceof HTMLFormElement)) return 'ae_form_request_success';

      const subject = form.querySelector('input[name="subject"], input[name="from_name"]');
      const submit = form.querySelector('button[type="submit"], input[type="submit"]');
      const text = [
        form.id,
        form.className,
        subject && subject.value,
        submit && (submit.textContent || submit.value)
      ].filter(Boolean).join(' ').toLowerCase();

      if (/тендер|участ/.test(text)) return 'ae_form_tender_success';
      if (/расч/.test(text)) return 'ae_form_calc_success';
      if (/звон|callback|call/.test(text)) return 'ae_form_callback_success';
      return 'ae_form_request_success';
    }

    document.addEventListener('click', function (event) {
      const contactLink = event.target.closest('a[href]');
      if (contactLink) {
        const href = (contactLink.getAttribute('href') || '').toLowerCase();
        if (href.startsWith('tel:')) sendOnce('ae_click_phone', { href: href });
        else if (href.startsWith('mailto:')) sendOnce('ae_click_email', { href: href });
        else if (href.includes('t.me/') || href.includes('telegram')) sendOnce('ae_click_telegram', { href: href });
        else if (href.includes('wa.me/') || href.includes('whatsapp')) sendOnce('ae_click_whatsapp', { href: href });
        else if (href.includes('max.ru/')) sendOnce('ae_click_max', { href: href });
      }

      const orderButton = event.target.closest('.btn-order, .hmob__btn--light, .mhero__btn--secondary');
      if (!orderButton) return;

      const label = (orderButton.textContent || '').toLowerCase();
      if (label.includes('заказать проект')) {
        sendOnce('ae_open_contact_modal', { label: label.trim() });
      }
    }, true);

    document.addEventListener('submit', function (event) {
      lastFormGoal = inferFormGoal(event.target);
    }, true);

    if (typeof window.fetch === 'function' && !window.fetch.__allnrgMetrikaWrapped) {
      const originalFetch = window.fetch.bind(window);
      const wrappedFetch = function () {
        const request = arguments[0];
        const requestUrl = typeof request === 'string' ? request : (request && request.url) || '';
        return originalFetch.apply(null, arguments).then(function (response) {
          if (!String(requestUrl).includes('api.web3forms.com/submit')) return response;

          response.clone().json().then(function (data) {
            if (response.ok && (!data || data.success !== false)) {
              sendOnce(lastFormGoal || 'ae_form_request_success', { source: 'web3forms' });
              if (lastFormGoal !== 'ae_form_request_success') {
                sendOnce('ae_form_request_success', { source: 'web3forms' });
              }
            }
          }).catch(function () {
            if (response.ok) sendOnce(lastFormGoal || 'ae_form_request_success', { source: 'web3forms' });
          });

          return response;
        });
      };

      wrappedFetch.__allnrgMetrikaWrapped = true;
      window.fetch = wrappedFetch;
    }
  }

  function initPersonalDataConsent() {
    const policyUrl = '/obrabotka-pers-dannih/';
    const consentMessage = '\u041f\u043e\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u0441\u043e\u0433\u043b\u0430\u0441\u0438\u0435 \u043d\u0430 \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0443 \u043f\u0435\u0440\u0441\u043e\u043d\u0430\u043b\u044c\u043d\u044b\u0445 \u0434\u0430\u043d\u043d\u044b\u0445.';

    document.querySelectorAll('form').forEach(function (form) {
      let consent = form.querySelector('input[name="personal_data_consent"]');

      form.querySelectorAll('a[href="#"], a[href="/privacy/"]').forEach(function (link) {
        link.setAttribute('href', policyUrl);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener');
      });

      if (!consent) {
        const note = form.querySelector('.note, .agree, .axm__note, .cb-note, .calcx-agree, .expsT__note, .cbT__note, .calcx-mob__agree, .axmM__note, .cbM__note');
        if (note) {
          const label = document.createElement('label');
          label.className = (note.className || '') + ' consent-check';

          consent = document.createElement('input');
          consent.className = 'consent-check__input';
          consent.type = 'checkbox';
          consent.name = 'personal_data_consent';
          consent.value = 'yes';
          consent.required = true;
          consent.setAttribute('aria-required', 'true');

          const text = document.createElement('span');
          text.className = 'consent-check__text';
          while (note.firstChild) text.appendChild(note.firstChild);

          label.appendChild(consent);
          label.appendChild(text);
          note.replaceWith(label);
        }
      }

      if (consent) {
        consent.required = true;
        consent.setAttribute('aria-required', 'true');
        consent.addEventListener('change', function () {
          consent.setCustomValidity('');
        });
      }
    });

    document.addEventListener('submit', function (event) {
      const form = event.target;
      if (!(form instanceof HTMLFormElement)) return;

      const consent = form.querySelector('input[name="personal_data_consent"]');
      if (!consent || consent.checked) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      consent.setCustomValidity(consentMessage);
      consent.reportValidity();
    }, true);
  }

  function initLenis() {
    if (reduceMotion || !window.Lenis) return;

    const isHomePage = location.pathname === '/' || location.pathname.endsWith('/index.html');
    const lenis = new window.Lenis({
      duration: isHomePage ? 2 : undefined,
      lerp: isHomePage ? undefined : 0.075,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
      wheelMultiplier: 0.78,
      touchMultiplier: 1,
      syncTouch: false,
      autoResize: true
    });

    window.allnrgLenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    document.addEventListener('click', function (event) {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target, { offset: -10 });
      history.pushState(null, '', hash);
    });
  }

  function initReveal() {
    const mobileReveal = window.matchMedia('(max-width: 767px)');
    const selectors = [
      '.hero', '.heroD', '.mhero', '.pdii', '.pdii-tab', '.pdii-mob',
      '.srv', '.srvx', '.services-mob', '.project-card', '.projtab-card', '.projmob-card',
      '.srv-card', '.srvx-card', '.srv-tab__card', '.srv-mob__card', '.services-mob__card',
      '.card', '.exps-card', '.exps-mob__card',
      '.ps__card', '.ps-tab__card', '.psx-mobile__card',
      '.callback', '.cbT', '.cbM', '.contacts-wrapper', '.contacts-wrapper-tab', '.contacts-wrapper-mob',
      '.partners', '.ptT', '.ptM2', '.steps', '.stage', '.stat', '.stats',
      '.news-card', '.project-card', '.section-title', 'h1', 'h2'
    ];

    const blocked = '.topbar, .nav, .mnavM, .allnrg-footer, .footer, .ftb, .ftM, .chat-widget, [data-no-reveal]';
    const nodes = Array.from(document.querySelectorAll(selectors.join(',')))
      .filter(function (node) {
        return node instanceof HTMLElement && node.getClientRects().length > 0 && !node.closest(blocked);
      });

    const unique = Array.from(new Set(nodes));

    function revealKind(node) {
      if (node.matches('.hero, .heroD, .mhero')) return 'reveal-hero';
      if (node.matches('h1, h2, .section-title')) return 'reveal-title';
      if (node.matches('.project-card, .projtab-card, .projmob-card, .srv-card, .srvx-card, .srv-tab__card, .srv-mob__card, .services-mob__card, .card, .exps-card, .exps-mob__card, .ps__card, .ps-tab__card, .psx-mobile__card, .news-card')) return 'reveal-card';
      if (node.matches('.callback, .cbT, .cbM, .contacts-wrapper, .contacts-wrapper-tab, .contacts-wrapper-mob')) return 'reveal-form';
      if (node.matches('.partners, .ptT, .ptM2')) return 'reveal-quiet';
      if (node.matches('.pdii, .pdii-tab, .pdii-mob, .stage, .stat, .stats')) return 'reveal-media';
      return 'reveal-copy';
    }

    unique.forEach(function (node) {
      node.classList.add('reveal-item', revealKind(node));
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      unique.forEach(function (node) {
        node.classList.add('is-revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        const node = entry.target;
        const siblings = Array.from((node.parentElement || document).children).filter(function (item) {
          return item.classList && item.classList.contains('reveal-item');
        });
        const index = Math.max(0, siblings.indexOf(node));
        const isCard = node.classList.contains('reveal-card');
        const isHero = node.classList.contains('reveal-hero');
        const isTitle = node.classList.contains('reveal-title');
        const isQuiet = node.classList.contains('reveal-quiet');
        const step = mobileReveal.matches ? 42 : (isCard ? 72 : 54);
        const cap = mobileReveal.matches ? 126 : (isCard ? 260 : 180);
        const base = isHero || isTitle || isQuiet ? 0 : 24;
        node.style.setProperty('--reveal-delay', Math.min(base + index * step, cap) + 'ms');
        node.classList.add('is-revealed');
        observer.unobserve(node);
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px'
    });

    unique.forEach(function (node) {
      observer.observe(node);
    });
  }

  function initCopyButtons() {
    document.addEventListener('click', async function (event) {
      const button = event.target.closest('.copy-trigger, .copy-trigger-tab, .copy-trigger-mob');
      if (!button) return;

      const value = button.getAttribute('data-copy');
      if (!value) return;

      event.preventDefault();

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value);
        } else {
          const input = document.createElement('textarea');
          input.value = value;
          input.setAttribute('readonly', '');
          input.style.position = 'fixed';
          input.style.left = '-9999px';
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          input.remove();
        }

        button.classList.add('is-copied');
        window.setTimeout(function () {
          button.classList.remove('is-copied');
        }, 900);
      } catch (error) {
        button.classList.remove('is-copied');
      }
    });
  }

  function initHeaderModalButtons() {
    document.addEventListener('click', function (event) {
      const tenderButton = event.target.closest('.topbar__btn--outline');
      const callButton = event.target.closest('.topbar__btn--yellow');
      if (!tenderButton && !callButton) return;

      const root = (tenderButton || callButton).closest('.allnrg') || document;
      const modal = tenderButton
        ? root.querySelector('#tenderModal')
        : root.querySelector('#callModal');

      if (!modal) return;

      event.preventDefault();
      modal.setAttribute('open', '');
    });
  }

  function initMobileMenuPolish() {
    const menuQuery = window.matchMedia('(max-width: 767px)');

    document.addEventListener('click', function (event) {
      const button = event.target.closest('.mbarM__burger');
      if (!button || !menuQuery.matches) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      const open = document.body.classList.toggle('mbnav-open');
      button.setAttribute('aria-expanded', String(open));
    }, true);

    document.addEventListener('click', function (event) {
      if (!menuQuery.matches || !document.body.classList.contains('mbnav-open')) return;
      if (!event.target.closest('.mnavM a')) return;

      document.body.classList.remove('mbnav-open');
      const button = document.querySelector('.mbarM__burger');
      if (button) button.setAttribute('aria-expanded', 'false');
    }, true);

    function isOpen() {
      return menuQuery.matches && document.body.classList.contains('mbnav-open');
    }

    function lockPage() {
      if (document.body.dataset.menuScrollLock) return;

      document.body.dataset.menuScrollLock = '1';
      document.documentElement.classList.add('mobile-menu-open');

      if (window.allnrgLenis && typeof window.allnrgLenis.stop === 'function') {
        window.allnrgLenis.stop();
      }
    }

    function unlockPage() {
      if (!document.body.dataset.menuScrollLock) return;

      delete document.body.dataset.menuScrollLock;
      document.documentElement.classList.remove('mobile-menu-open');

      if (window.allnrgLenis && typeof window.allnrgLenis.start === 'function') {
        window.allnrgLenis.start();
      }
    }

    function sync() {
      if (isOpen()) {
        lockPage();
      } else {
        unlockPage();
      }
    }

    new MutationObserver(sync).observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    menuQuery.addEventListener('change', sync);
    window.addEventListener('resize', sync);

    document.addEventListener('touchmove', function (event) {
      if (!isOpen() || event.target.closest('.mnavM')) return;
      event.preventDefault();
    }, { passive: false });

    sync();
  }

  function initMobileFooterDev() {
    const menuQuery = window.matchMedia('(max-width: 767px)');

    function syncVideo() {
      document.querySelectorAll('.ftM .liquid-name-video').forEach(function (video) {
        if (!(video instanceof HTMLVideoElement)) return;

        if (menuQuery.matches) {
          if (!video.dataset.desktopSrc) {
            video.dataset.desktopSrc = video.getAttribute('src') || video.dataset.src || '/assets/background-imanakov-vlad-main.mp4';
          }

          const mobileSrc = '/assets/background-imanakov-vlad-main-mobile.mp4';
          video.dataset.src = mobileSrc;
          if (video.dataset.loaded === '1' && video.getAttribute('src') !== mobileSrc) {
            video.setAttribute('src', mobileSrc);
            video.setAttribute('preload', 'metadata');
            video.load();
            video.play().catch(function () {});
          }
          return;
        }

        const desktopSrc = video.dataset.desktopSrc || '/assets/background-imanakov-vlad-main.mp4';
        video.dataset.src = desktopSrc;
        if (video.dataset.loaded === '1' && video.getAttribute('src') !== desktopSrc) {
          video.setAttribute('src', desktopSrc);
          video.load();
          video.play().catch(function () {});
        }
      });
    }

    function movePolicyBeforeDev() {
      document.querySelectorAll('.ftM__copy').forEach(function (copy) {
        const policy = copy.querySelector('.ftM__policy');
        const dev = copy.querySelector('.footer-dev');
        if (policy && dev && dev.previousElementSibling !== policy) {
          copy.insertBefore(policy, dev);
        }
      });
    }

    function sync() {
      syncVideo();
      movePolicyBeforeDev();
    }

    menuQuery.addEventListener('change', sync);
    sync();
  }

  function initLazyFooterVideos() {
    const videos = Array.from(document.querySelectorAll('.liquid-name-video'));
    if (!videos.length) return;

    function loadVideo(video) {
      if (!(video instanceof HTMLVideoElement) || video.dataset.loaded === '1') return;
      const src = video.dataset.src || video.getAttribute('src');
      if (!src) return;
      video.dataset.loaded = '1';
      if (video.getAttribute('src') !== src) video.setAttribute('src', src);
      video.setAttribute('preload', 'metadata');
      video.load();
      video.play().catch(function () {});
    }

    if (!('IntersectionObserver' in window)) {
      window.setTimeout(function () { videos.forEach(loadVideo); }, 2500);
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        loadVideo(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '480px 0px' });

    videos.forEach(function (video) {
      if (!(video instanceof HTMLVideoElement)) return;
      if (!video.dataset.src && video.getAttribute('src')) {
        video.dataset.src = video.getAttribute('src');
        video.removeAttribute('src');
      }
      video.setAttribute('preload', 'none');
      observer.observe(video);
    });
  }

  function initFooterTyping() {
    const titles = Array.from(document.querySelectorAll('.footer-video-title'));
    if (!titles.length) return;

    const phrases = [
      'Понравился сайт?',
      'Хотите такой же?',
      'Сделаем под ваш бюджет.'
    ];
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    function setupTitle(title) {
      if (!(title instanceof HTMLElement) || title.dataset.typingReady === '1') return;

      title.dataset.typingReady = '1';
      title.classList.add('footer-typing-title');
      title.setAttribute('aria-label', 'Понравился сайт? Хотите такой же? Сделаем под ваш бюджет.');

      const text = document.createElement('span');
      text.className = 'footer-typing-text';
      text.setAttribute('aria-hidden', 'true');
      title.replaceChildren(text);

      if (reduceMotionQuery.matches) {
        text.textContent = phrases[2];
        return;
      }

      let phraseIndex = 0;
      let characterIndex = 0;
      let deleting = false;

      function tick() {
        const phrase = phrases[phraseIndex];

        if (!deleting) {
          characterIndex += 1;
          text.textContent = phrase.slice(0, characterIndex);

          if (characterIndex === phrase.length) {
            deleting = true;
            window.setTimeout(tick, phraseIndex === phrases.length - 1 ? 2600 : 1700);
            return;
          }

          window.setTimeout(tick, 68);
          return;
        }

        characterIndex -= 1;
        text.textContent = phrase.slice(0, characterIndex);

        if (characterIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          window.setTimeout(tick, 420);
          return;
        }

        window.setTimeout(tick, 38);
      }

      window.setTimeout(tick, 450);
    }

    titles.forEach(setupTitle);
  }

  function initStableMobileHero() {
    const text = document.querySelector('.mhero__text');
    if (!text) return;

    const panel = text.closest('.mhero__panel');
    const currentHeight = Math.ceil(text.getBoundingClientRect().height);
    if (currentHeight > 0) {
      text.style.minHeight = Math.max(currentHeight, 126) + 'px';
    }

    if (panel instanceof HTMLElement) {
      const height = Math.ceil(panel.getBoundingClientRect().height);
      if (height > 0) {
        panel.style.minHeight = Math.max(height, 430) + 'px';
      }
    }
  }

  function initProjectMediaFallbacks() {
    const sliderSelectors = [
      '.case-ko__slider',
      '.eh-tab__slider',
      '.eh-mob__slider',
      '.plk-tab__slider',
      '.plk-mob__slider',
      '.ko-tab__slider'
    ];

    function initSlider(slider) {
      if (!(slider instanceof HTMLElement) || slider.dataset.mediaFallbackReady === '1') return;

      const track = slider.querySelector('[class*="__slider-track"]');
      const slides = Array.from(slider.querySelectorAll('[class*="__slide"]'));
      if (!(track instanceof HTMLElement) || slides.length < 2) return;

      slider.dataset.mediaFallbackReady = '1';
      const prev = slider.querySelector('[class*="--prev"]');
      const next = slider.querySelector('[class*="--next"]');
      const dotsWrap = slider.querySelector('[class*="__dots"]');
      let index = 0;
      let timer = null;

      if (dotsWrap instanceof HTMLElement && !dotsWrap.children.length) {
        slides.forEach(function (_, i) {
          const dot = document.createElement('span');
          if (i === 0) dot.classList.add('is-active');
          dotsWrap.appendChild(dot);
        });
      }

      function sync() {
        track.style.transform = 'translateX(' + (-index * 100) + '%)';
        if (dotsWrap instanceof HTMLElement) {
          Array.from(dotsWrap.children).forEach(function (dot, i) {
            dot.classList.toggle('is-active', i === index);
          });
        }
      }

      function go(to) {
        index = (to + slides.length) % slides.length;
        sync();
      }

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () { go(index + 1); }, 4500);
      }

      if (prev) prev.addEventListener('click', function () { go(index - 1); restart(); });
      if (next) next.addEventListener('click', function () { go(index + 1); restart(); });

      let startX = 0;
      slider.addEventListener('touchstart', function (event) {
        if (!event.touches.length) return;
        startX = event.touches[0].clientX;
        window.clearInterval(timer);
      }, { passive: true });
      slider.addEventListener('touchend', function (event) {
        const point = event.changedTouches && event.changedTouches[0];
        if (point && Math.abs(point.clientX - startX) > 36) {
          go(point.clientX < startX ? index + 1 : index - 1);
        }
        restart();
      }, { passive: true });

      sync();
      restart();
    }

    function imageFromItem(item) {
      const direct = item.getAttribute('data-full');
      if (direct) return direct;

      const bg = window.getComputedStyle(item).backgroundImage || '';
      const match = bg.match(/url\(["']?(.+?)["']?\)/);
      return match ? match[1] : '';
    }

    function isLightboxRoot(node) {
      if (!(node instanceof HTMLElement)) return false;
      const className = String(node.className || '');
      return className.includes('__lightbox') &&
        !className.includes('__lightbox-close') &&
        !className.includes('__lightbox-backdrop') &&
        !className.includes('__lightbox-img-wrap') &&
        !!node.querySelector('img');
    }

    function findLightboxRoot(node) {
      let current = node instanceof HTMLElement ? node : null;
      while (current && current !== document.body) {
        if (isLightboxRoot(current)) return current;
        current = current.parentElement;
      }
      return null;
    }

    function openLightbox(item) {
      const src = imageFromItem(item);
      if (!src) return;

      const section = item.closest('section, .case-ko, .plk-tab, .plk-mob, .eh-tab, .eh-mob, .ko-tab');
      const lightbox = section && Array.from(section.querySelectorAll('[class*="__lightbox"]')).find(isLightboxRoot);
      if (!(lightbox instanceof HTMLElement)) return;

      const img = lightbox.querySelector('img');
      if (!(img instanceof HTMLImageElement)) return;

      lightbox.removeAttribute('inert');
      img.src = src;
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('project-lightbox-open');
    }

    function closeLightbox(lightbox) {
      if (lightbox.contains(document.activeElement)) {
        document.activeElement.blur();
      }
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      lightbox.setAttribute('inert', '');
      document.documentElement.classList.remove('project-lightbox-open');
    }

    document.querySelectorAll('[class*="__lightbox"]').forEach(function (lightbox) {
      if (!isLightboxRoot(lightbox)) return;
      if (!lightbox.classList.contains('is-open')) {
        lightbox.setAttribute('inert', '');
      }
    });

    new MutationObserver(function (records) {
      records.forEach(function (record) {
        const lightbox = record.target;
        if (!isLightboxRoot(lightbox)) return;

        const isHidden = lightbox.getAttribute('aria-hidden') === 'true' || !lightbox.classList.contains('is-open');
        if (isHidden) {
          if (lightbox.contains(document.activeElement) && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
          lightbox.setAttribute('inert', '');
          return;
        }

        lightbox.removeAttribute('inert');
      });
    }).observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-hidden', 'class']
    });

    window.addEventListener('load', function () {
      window.setTimeout(function () {
        document.querySelectorAll(sliderSelectors.join(',')).forEach(initSlider);
      }, 800);
    });

    document.addEventListener('click', function (event) {
      const earlyClose = event.target.closest('[class*="__lightbox-close"]');
      if (earlyClose && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, true);

    document.addEventListener('click', function (event) {
      const galleryItem = event.target.closest('[class*="__gallery-item"]');
      if (galleryItem instanceof HTMLElement) {
        openLightbox(galleryItem);
        return;
      }

      const closeTarget = event.target.closest('[class*="__lightbox-close"], [class*="__lightbox-backdrop"]');
      if (closeTarget) {
        const lightbox = findLightboxRoot(closeTarget);
        if (lightbox instanceof HTMLElement) closeLightbox(lightbox);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (document.activeElement instanceof HTMLElement && document.activeElement.closest('[class*="__lightbox"]')) {
        document.activeElement.blur();
      }
      document.querySelectorAll('[class*="__lightbox"].is-open').forEach(closeLightbox);
    }, true);
  }

  function initA11yPolish() {
    if (!document.querySelector('main, [role="main"]')) {
      const mainHost = document.querySelector('[data-page-type="page"], .elementor, .stage, .contacts-page, .services-page, .projects-page');
      if (mainHost instanceof HTMLElement) {
        mainHost.setAttribute('role', 'main');
        if (!mainHost.id) mainHost.id = 'main-content';
      }
    }

    document.querySelectorAll('input, textarea, select').forEach(function (control, index) {
      if (!(control instanceof HTMLElement)) return;
      const type = (control.getAttribute('type') || '').toLowerCase();
      if (['hidden', 'submit', 'button', 'reset'].includes(type)) return;
      if (type === 'checkbox' && control.closest('label')) return;
      if (control.id && document.querySelector('label[for="' + CSS.escape(control.id) + '"]')) return;
      if (control.getAttribute('aria-label') || control.getAttribute('aria-labelledby')) return;

      const label = control.getAttribute('placeholder') ||
        control.getAttribute('name') ||
        (type === 'tel' ? 'Телефон' : '') ||
        (type === 'email' ? 'Почта' : '') ||
        (type === 'time' ? 'Удобное время для звонка' : '') ||
        'Поле формы ' + (index + 1);

      control.setAttribute('aria-label', label);
    });

    document.querySelectorAll('button, a').forEach(function (el) {
      if (!(el instanceof HTMLElement)) return;
      if (el.textContent.trim() || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return;
      const title = el.getAttribute('title');
      const img = el.querySelector('img[alt]');
      const label = title || (img && img.getAttribute('alt')) || 'Открыть';
      el.setAttribute('aria-label', label);
    });
  }

  function initCookieConsentBanner() {
    const LS_KEY_ACCEPT = 'ckAccepted';
    const LS_KEY_PREFS = 'ckPrefs';
    const LS_KEY_SHOWN = 'ckPromptShown';

    if (!document.getElementById('ck-global-critical-styles')) {
      const style = document.createElement('style');
      style.id = 'ck-global-critical-styles';
      style.textContent = [
        '.ck-banner{position:fixed!important;left:50%!important;bottom:24px!important;transform:translate3d(-50%,40px,0)!important;width:min(1200px,calc(100% - 32px))!important;box-sizing:border-box!important;padding:24px 32px 20px!important;background:#363636!important;color:#fff!important;font-family:Montserrat,Arial,sans-serif!important;box-shadow:0 14px 40px rgba(0,0,0,.45)!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important;z-index:2147483646!important}',
        '.ck-banner.ck-banner--show{transform:translate3d(-50%,0,0)!important;opacity:1!important;visibility:visible!important;pointer-events:auto!important}',
        '.ck-banner__inner{display:flex!important;flex-direction:column!important;gap:20px!important}',
        '.ck-banner__title{margin:0 0 10px!important;color:#e4e35a!important;font-size:18px!important}',
        '.ck-banner__text{margin:0!important;color:#e5e5e5!important;font-size:13px!important;line-height:1.5!important}',
        '.ck-banner__btns,.ck-modal__btns{display:flex!important;justify-content:flex-end!important;gap:14px!important;flex-wrap:wrap!important}',
        '.ck-btn{min-width:170px!important;padding:10px 22px!important;border:1px solid #e4e35a!important;background:transparent!important;color:#e4e35a!important;font:600 13px/1.2 Montserrat,Arial,sans-serif!important;cursor:pointer!important}',
        '.ck-btn--yellow{background:#e4e35a!important;color:#000!important}',
        '.ck-modal{position:fixed!important;inset:0!important;display:none!important;align-items:center!important;justify-content:center!important;z-index:2147483647!important;font-family:Montserrat,Arial,sans-serif!important}',
        '.ck-modal.ck-modal--open{display:flex!important}',
        '.ck-modal__backdrop{position:absolute!important;inset:0!important;background:rgba(0,0,0,.55)!important}',
        '.ck-modal__dialog{position:relative!important;z-index:1!important;width:min(620px,calc(100% - 32px))!important;max-height:calc(100dvh - 32px)!important;overflow:auto!important;box-sizing:border-box!important;padding:24px!important;background:#2b2b2b!important;color:#fff!important}',
        '.ck-modal__title{margin:0 0 10px!important;color:#e4e35a!important;font-size:18px!important}',
        '.ck-modal__intro{margin:0 0 18px!important;color:#e5e5e5!important;font-size:13px!important;line-height:1.5!important}',
        '.ck-modal__group{display:flex!important;align-items:flex-start!important;gap:12px!important;margin-bottom:14px!important}',
        '.ck-modal__group-text{flex:1 1 auto!important}.ck-modal__group-title{margin-bottom:4px!important;font-size:14px!important;font-weight:600!important}.ck-modal__group-desc{color:#d0d0d0!important;font-size:12px!important;line-height:1.45!important}',
        '.ck-switch{position:relative!important;display:inline-block!important;flex:0 0 auto!important;width:36px!important;height:20px!important}.ck-switch input{width:0!important;height:0!important;opacity:0!important}.ck-switch__slider{position:absolute!important;inset:0!important;border-radius:10px!important;background:#555!important}.ck-switch__slider:before{content:""!important;position:absolute!important;top:3px!important;left:3px!important;width:14px!important;height:14px!important;border-radius:50%!important;background:#f1f1f1!important}.ck-switch input:checked+.ck-switch__slider{background:#e4e35a!important}.ck-switch input:checked+.ck-switch__slider:before{transform:translateX(16px)!important}',
        '@media(max-width:600px){.ck-banner{bottom:12px!important;width:calc(100% - 24px)!important;padding:18px!important}.ck-banner__btns,.ck-modal__btns{flex-direction:column!important}.ck-btn{width:100%!important}}'
      ].join('');
      document.head.appendChild(style);
    }

    let banner = document.getElementById('ck-banner');
    let modal = document.getElementById('ck-modal');

    if (!banner || !modal) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = [
        '<div class="ck-banner" id="ck-banner">',
        '  <div class="ck-banner__inner">',
        '    <div class="ck-banner__text-wrap">',
        '      <h3 class="ck-banner__title">Помогаем сделать сайт удобнее</h3>',
        '      <p class="ck-banner__text">Мы используем файлы cookie, чтобы сайт работал стабильно, быстрее открывался и помогал понять, какие разделы стоит улучшить. Вы можете принять все cookie или настроить использование по своему желанию.</p>',
        '    </div>',
        '    <div class="ck-banner__btns">',
        '      <button class="ck-btn ck-btn--outline" type="button" id="ck-open-settings">Настроить</button>',
        '      <button class="ck-btn ck-btn--yellow" type="button" id="ck-accept-all">Принять все</button>',
        '    </div>',
        '  </div>',
        '</div>',
        '<div class="ck-modal" id="ck-modal">',
        '  <div class="ck-modal__backdrop"></div>',
        '  <div class="ck-modal__dialog">',
        '    <h3 class="ck-modal__title">Выберите, какие cookie разрешить</h3>',
        '    <p class="ck-modal__intro">Обязательные cookie нужны для работы сайта и включены всегда. Остальные помогают улучшать сайт; личные данные и пароли в cookie мы не сохраняем.</p>',
        '    <div class="ck-modal__group ck-modal__group--locked">',
        '      <label class="ck-switch"><input type="checkbox" checked disabled><span class="ck-switch__slider"></span></label>',
        '      <div class="ck-modal__group-text"><div class="ck-modal__group-title">Обязательные</div><div class="ck-modal__group-desc">Обеспечивают базовую работу сайта и сохранение выбранных настроек.</div></div>',
        '    </div>',
        '    <div class="ck-modal__group">',
        '      <label class="ck-switch"><input type="checkbox" id="ck-analytics" checked><span class="ck-switch__slider"></span></label>',
        '      <div class="ck-modal__group-text"><div class="ck-modal__group-title">Аналитические</div><div class="ck-modal__group-desc">Помогают понять, какие страницы смотрят чаще и что стоит улучшить. Используются только в обобщенном виде.</div></div>',
        '    </div>',
        '    <div class="ck-modal__group">',
        '      <label class="ck-switch"><input type="checkbox" id="ck-functional" checked><span class="ck-switch__slider"></span></label>',
        '      <div class="ck-modal__group-text"><div class="ck-modal__group-title">Функциональные</div><div class="ck-modal__group-desc">Запоминают удобные настройки, чтобы не приходилось выбирать их заново.</div></div>',
        '    </div>',
        '    <div class="ck-modal__btns">',
        '      <button class="ck-btn ck-btn--outline" type="button" id="ck-save-settings">Сохранить выбор</button>',
        '      <button class="ck-btn ck-btn--yellow" type="button" id="ck-accept-all-modal">Принять все</button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');

      document.body.appendChild(wrapper);
      banner = document.getElementById('ck-banner');
      modal = document.getElementById('ck-modal');
    }

    if (!banner || !modal || banner.dataset.cookieConsentReady === 'true') return;
    banner.dataset.cookieConsentReady = 'true';

    const openSettingsBtn = document.getElementById('ck-open-settings');
    const acceptAllBtn = document.getElementById('ck-accept-all');
    const acceptAllModalBtn = document.getElementById('ck-accept-all-modal');
    const saveBtn = document.getElementById('ck-save-settings');
    const analyticsCb = document.getElementById('ck-analytics');
    const functionalCb = document.getElementById('ck-functional');

    if (localStorage.getItem(LS_KEY_ACCEPT)) {
      banner.remove();
      modal.remove();
      return;
    }

    function closeAll() {
      banner.classList.remove('ck-banner--show');
      modal.classList.remove('ck-modal--open');
      window.setTimeout(function () {
        banner.remove();
        modal.remove();
      }, 300);
    }

    function setAllAndClose() {
      localStorage.setItem(LS_KEY_ACCEPT, 'all');
      localStorage.setItem(LS_KEY_PREFS, JSON.stringify({
        necessary: true,
        analytics: true,
        functional: true
      }));
      closeAll();
    }

    function saveCustomAndClose() {
      localStorage.setItem(LS_KEY_ACCEPT, 'custom');
      localStorage.setItem(LS_KEY_PREFS, JSON.stringify({
        necessary: true,
        analytics: !!(analyticsCb && analyticsCb.checked),
        functional: !!(functionalCb && functionalCb.checked)
      }));
      closeAll();
    }

    if (openSettingsBtn) {
      openSettingsBtn.addEventListener('click', function () {
        modal.classList.add('ck-modal--open');
      });
    }
    if (acceptAllBtn) acceptAllBtn.addEventListener('click', setAllAndClose);
    if (acceptAllModalBtn) acceptAllModalBtn.addEventListener('click', setAllAndClose);
    if (saveBtn) saveBtn.addEventListener('click', saveCustomAndClose);
    modal.addEventListener('click', function (event) {
      if (event.target.classList.contains('ck-modal__backdrop')) {
        modal.classList.remove('ck-modal--open');
      }
    });

    const showDelay = 15000;
    window.setTimeout(function () {
      localStorage.setItem(LS_KEY_SHOWN, '1');
      if (document.body.contains(banner)) banner.classList.add('ck-banner--show');
    }, showDelay);
  }

  function initCookieFabLayer() {
    const banner = document.getElementById('ck-banner');
    const modal = document.getElementById('ck-modal');
    const fab = document.querySelector('.messenger-fab');
    const chat = document.querySelector('.chat-widget');
    if (!(banner instanceof HTMLElement)) return;

    function setFloatingBlocked(node, blocked) {
      if (!(node instanceof HTMLElement)) return;

      if (blocked) {
        node.style.setProperty('z-index', '100', 'important');
        node.style.setProperty('pointer-events', 'none', 'important');
      } else {
        node.style.removeProperty('z-index');
        node.style.removeProperty('pointer-events');
      }
    }

    function sync() {
      const bannerStyle = getComputedStyle(banner);
      const bannerRect = banner.getBoundingClientRect();
      const bannerVisible = bannerStyle.display !== 'none' &&
        bannerStyle.visibility !== 'hidden' &&
        banner.getClientRects().length > 0 &&
        bannerRect.bottom > 0 &&
        bannerRect.top < window.innerHeight &&
        (banner.classList.contains('ck-banner--show') || Number(bannerStyle.opacity) > 0.05);
      const modalOpen = modal instanceof HTMLElement && modal.classList.contains('ck-modal--open');
      const cookieOpen = bannerVisible || modalOpen;

      document.documentElement.classList.toggle('cookie-layer-open', cookieOpen);
      banner.style.setProperty('z-index', '2147483646', 'important');
      if (modal instanceof HTMLElement) {
        modal.style.setProperty('z-index', '2147483647', 'important');
      }

      setFloatingBlocked(fab, cookieOpen);
      setFloatingBlocked(chat, cookieOpen);
    }

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(banner, { attributes: true, attributeFilter: ['class', 'style'] });
    if (modal instanceof HTMLElement) {
      observer.observe(modal, { attributes: true, attributeFilter: ['class', 'style'] });
    }

    window.addEventListener('resize', sync, { passive: true });
    window.setTimeout(sync, 250);
    window.setTimeout(sync, 1000);
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    initPersonalDataConsent();
    initCookieConsentBanner();
    initMetrikaCounter();
    initMetrikaGoals();
    initLenis();
    initReveal();
    initCopyButtons();
    initHeaderModalButtons();
    initMobileMenuPolish();
    initMobileFooterDev();
    initLazyFooterVideos();
    initFooterTyping();
    initStableMobileHero();
    initA11yPolish();
    initCookieFabLayer();
    initProjectMediaFallbacks();
  });
})();
