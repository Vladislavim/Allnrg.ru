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
        return node instanceof HTMLElement && !node.closest(blocked);
      });

    const unique = Array.from(new Set(nodes));

    unique.forEach(function (node) {
      node.classList.add('reveal-item');
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
        node.style.setProperty('--reveal-delay', Math.min(index * 55, 220) + 'ms');
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
  });
})();
