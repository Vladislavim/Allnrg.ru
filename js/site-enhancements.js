(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
            video.dataset.desktopSrc = video.getAttribute('src') || '/assets/background-imanakov-vlad-main.mp4';
          }

          const mobileSrc = '/assets/background-imanakov-vlad-main-mobile.mp4';
          if (video.getAttribute('src') !== mobileSrc) {
            video.setAttribute('src', mobileSrc);
            video.setAttribute('preload', 'metadata');
            video.load();
            video.play().catch(function () {});
          }
          return;
        }

        const desktopSrc = video.dataset.desktopSrc || '/assets/background-imanakov-vlad-main.mp4';
        if (video.getAttribute('src') !== desktopSrc) {
          video.setAttribute('src', desktopSrc);
          video.load();
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

    function openLightbox(item) {
      const src = imageFromItem(item);
      if (!src) return;

      const section = item.closest('section, .case-ko, .plk-tab, .plk-mob, .eh-tab, .eh-mob, .ko-tab');
      const lightbox = section && section.querySelector('[class*="__lightbox"]');
      if (!(lightbox instanceof HTMLElement)) return;

      const img = lightbox.querySelector('img');
      if (!(img instanceof HTMLImageElement)) return;

      img.src = src;
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('project-lightbox-open');
    }

    function closeLightbox(lightbox) {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('project-lightbox-open');
    }

    window.addEventListener('load', function () {
      window.setTimeout(function () {
        document.querySelectorAll(sliderSelectors.join(',')).forEach(initSlider);
      }, 800);
    });

    document.addEventListener('click', function (event) {
      const galleryItem = event.target.closest('[class*="__gallery-item"]');
      if (galleryItem instanceof HTMLElement) {
        openLightbox(galleryItem);
        return;
      }

      const closeTarget = event.target.closest('[class*="__lightbox-close"], [class*="__lightbox-backdrop"]');
      if (closeTarget) {
        const lightbox = closeTarget.closest('[class*="__lightbox"]');
        if (lightbox instanceof HTMLElement) closeLightbox(lightbox);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      document.querySelectorAll('[class*="__lightbox"].is-open').forEach(closeLightbox);
    });
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    initLenis();
    initReveal();
    initCopyButtons();
    initHeaderModalButtons();
    initMobileMenuPolish();
    initMobileFooterDev();
    initStableMobileHero();
    initProjectMediaFallbacks();
  });
})();
