/* inline script 1 */
(function(){
    const root=document.querySelector('.allnrg');
    const tenderOpen=root.querySelector('.topbar__btn--outline');
    const callOpen=root.querySelector('.topbar__btn--yellow');
    const tenderModal=root.querySelector('#tenderModal');
    const callModal=root.querySelector('#callModal');

    /* Успешная отправка */
    const successModal=root.querySelector('#successModal');
    const successHome=root.querySelector('#successHome');
    function openSuccess(){ successModal.setAttribute('open',''); }

    tenderOpen.addEventListener('click',e=>{e.preventDefault();tenderModal.setAttribute('open','');});
    callOpen.addEventListener('click',e=>{e.preventDefault();callModal.setAttribute('open','');});

    root.querySelectorAll('.modal').forEach(m=>{
      m.addEventListener('click',e=>{ if(e.target===m) m.removeAttribute('open'); });
      m.querySelector('.close').addEventListener('click',()=>m.removeAttribute('open'));
    });

    if(successHome){
      successHome.addEventListener('click',e=>{
        e.preventDefault();
        window.location.href='index.html'; /* редирект на главную */
      });
    }

    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'){
        tenderModal.removeAttribute('open');
        callModal.removeAttribute('open');
        successModal.removeAttribute('open');
      }
    });

    const emailOK=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v||'').trim());
    const cleanTel=v=>(v||'').replace(/[^\d+]/g,'');
    const urlOK=v=>{ try{const u=new URL((v||'').trim());return ['http:','https:'].includes(u.protocol);}catch(_){return false;} };

    const API='https://api.web3forms.com/submit';

    // Тендер
    const tenderForm=root.querySelector('#tenderForm');
    const tenderStatus=root.querySelector('#tenderStatus');
    tenderForm.addEventListener('submit', async e=>{
      e.preventDefault();
      tenderStatus.textContent=''; tenderStatus.className='status';

      const phone = cleanTel(tenderForm.elements['Телефон'].value);
      const email = (tenderForm.elements['email']?.value||'').trim();
      const doc   = (tenderForm.elements['Документация']?.value||'').trim();

      if(!phone || phone.length<6){ tenderStatus.textContent='Укажите корректный телефон.'; tenderStatus.classList.add('status--err'); return; }
      if(email && !emailOK(email)){ tenderStatus.textContent='Проверьте адрес электронной почты.'; tenderStatus.classList.add('status--err'); return; }
      if(!doc || !urlOK(doc)){ tenderStatus.textContent='Добавьте корректную ссылку на документацию (http/https).'; tenderStatus.classList.add('status--err'); return; }

      tenderStatus.textContent='Отправка...';
      try{
        const fd=new FormData(tenderForm);
        const res=await fetch(API,{method:'POST',body:fd,headers:{Accept:'application/json'}});
        let json={}; try{ json=await res.json(); }catch(_){}
        if(res.ok && json.success){
          tenderForm.reset();
          tenderModal.removeAttribute('open');   /* закрыть форму */
          openSuccess();                         /* показать успех */
        }else{
          tenderStatus.textContent=(json.message||'Ошибка при отправке. Попробуйте позже.'); tenderStatus.classList.add('status--err');
        }
      }catch(err){ console.error(err); tenderStatus.textContent='Ошибка сети. Попробуйте позже.'; tenderStatus.classList.add('status--err'); }
    });

    // Звонок
    const callForm=root.querySelector('#callForm');
    const callStatus=root.querySelector('#callStatus');
    const timeInput=root.querySelector('#callTime');
    const anyChk=root.querySelector('#callAny');

    function toggleTime(){
      if(!anyChk || !timeInput) return;
      timeInput.disabled = anyChk.checked;
      if(anyChk.checked) timeInput.value='';
      timeInput.style.opacity = anyChk.checked ? .6 : 1;
    }
    if(anyChk){ anyChk.addEventListener('change',toggleTime); toggleTime(); }

    callForm.addEventListener('submit', async e=>{
      e.preventDefault();
      callStatus.textContent=''; callStatus.className='status';

      const phone = cleanTel(callForm.elements['Телефон'].value);
      if(!phone || phone.length<6){ callStatus.textContent='Укажите корректный телефон.'; callStatus.classList.add('status--err'); return; }

      callStatus.textContent='Отправка...';
      try{
        const fd=new FormData(callForm);
        const res=await fetch(API,{method:'POST',body:fd,headers:{Accept:'application/json'}});
        let json={}; try{ json=await res.json(); }catch(_){}
        if(res.ok && json.success){
          callForm.reset();
          toggleTime();
          callModal.removeAttribute('open');     /* закрыть форму */
          openSuccess();                         /* показать успех */
        }else{
          callStatus.textContent=(json.message||'Ошибка при отправке. Попробуйте позже.'); callStatus.classList.add('status--err');
        }
      }catch(err){
        console.error(err);
        callStatus.textContent='Ошибка сети. Попробуйте позже.';
        callStatus.classList.add('status--err');
      }
    });
  })();

/* inline script 2 */
(function(){
  function initFab(){
    var fab = document.querySelector('.messenger-fab');
    if (!fab) return;

    if (fab.parentElement !== document.body) {
      document.body.appendChild(fab);
    }

    var toggle = fab.querySelector('.messenger-fab__toggle');
    if (toggle && !toggle.__fabBound) {
      toggle.addEventListener('click', function(){
        fab.classList.toggle('open');
      });
      toggle.__fabBound = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFab);
  } else {
    initFab();
  }
})();

/* inline script 3 */
/* JS-фолбэк: ставим inline-стили FAB, если :has() нет или стили перебиваются */
(function(){
  var fab = null;

  function qs(sel){ return document.querySelector(sel); }

  function applyFabState(open){
    if(!fab) return;
    fab.classList.remove('open'); // закрыть меню FAB
    fab.style.setProperty('z-index', open ? '9000' : '2147483647', 'important');
    fab.style.pointerEvents = open ? 'none' : 'auto';
    fab.style.filter = open ? 'opacity(.35) blur(.5px)' : '';
    var menu = fab.querySelector('.messenger-fab__menu');
    if (menu){
      menu.style.opacity = open ? '0' : '';
      menu.style.pointerEvents = open ? 'none' : '';
      menu.style.transform = open ? 'translateX(-50%) translateY(10px)' : '';
    }
  }

  function watchModal(id){
    var el = document.getElementById(id);
    if(!el) return;
    applyFabState(el.hasAttribute('open'));
    var mo = new MutationObserver(function(list){
      for (var m of list){
        if (m.type === 'attributes' && m.attributeName === 'open'){
          applyFabState(el.hasAttribute('open'));
        }
      }
    });
    mo.observe(el, { attributes:true, attributeFilter:['open'] });
  }

  function init(){
    fab = qs('.messenger-fab');
    if(!fab) return;
    watchModal('mccm-root'); // мобильная модалка связи
    watchModal('ccm-root');  // десктопная модалка
    watchModal('tccm-root'); // планшетная модалка
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    init();
  }
})();

/* inline script 4 */
(function(){
    const banner = document.getElementById('ck-banner');
    const modal  = document.getElementById('ck-modal');
    if (!banner || !modal) return;

    const openSettingsBtn   = document.getElementById('ck-open-settings');
    const acceptAllBtn      = document.getElementById('ck-accept-all');
    const acceptAllModalBtn = document.getElementById('ck-accept-all-modal');
    const saveBtn           = document.getElementById('ck-save-settings');

    const analyticsCb  = document.getElementById('ck-analytics');
    const functionalCb = document.getElementById('ck-functional');
    const marketingCb  = document.getElementById('ck-marketing');

    const LS_KEY_ACCEPT = 'ckAccepted';
    const LS_KEY_PREFS  = 'ckPrefs';

    // FAB (плавающая кнопка мессенджеров), если есть на странице
    const fab = document.querySelector('.messenger-fab');

    function dimFab(isDim) {
      if (!fab) return;

      // закрыть меню FAB
      fab.classList.remove('open');

      // опустить FAB под модалку куки и отключить клики
      fab.style.setProperty('z-index', isDim ? '9000' : '2147483647', 'important');
      fab.style.pointerEvents = isDim ? 'none' : 'auto';
      fab.style.filter = isDim ? 'opacity(.35) blur(.5px)' : '';

      const menu = fab.querySelector('.messenger-fab__menu');
      if (menu) {
        menu.style.opacity = isDim ? '0' : '';
        menu.style.pointerEvents = isDim ? 'none' : '';
        menu.style.transform = isDim ? 'translateX(-50%) translateY(10px)' : '';
      }
    }

    // если уже приняли / сохранили настройки — ничего не показываем
    if (localStorage.getItem(LS_KEY_ACCEPT)) {
      banner.remove();
      modal.remove();
      return;
    }

    // показать баннер через 15 секунд
    setTimeout(() => {
      banner.classList.add('ck-banner--show');
    }, 15000);

    function setAllAndClose() {
      const prefs = {
        necessary: true,
        analytics: true,
        functional: true,
        marketing: true
      };
      localStorage.setItem(LS_KEY_ACCEPT, 'all');
      localStorage.setItem(LS_KEY_PREFS, JSON.stringify(prefs));
      closeAll();
    }

    function saveCustomAndClose() {
      const prefs = {
        necessary: true,
        analytics: !!(analyticsCb && analyticsCb.checked),
        functional: !!(functionalCb && functionalCb.checked),
        marketing: !!(marketingCb && marketingCb.checked)
      };
      localStorage.setItem(LS_KEY_ACCEPT, 'custom');
      localStorage.setItem(LS_KEY_PREFS, JSON.stringify(prefs));
      closeAll();
    }

    function openModal() {
      modal.classList.add('ck-modal--open');
      dimFab(true); // FAB под модалку
    }

    function closeModal() {
      modal.classList.remove('ck-modal--open');
      dimFab(false); // вернуть FAB
    }

    function closeAll() {
      banner.classList.remove('ck-banner--show');
      closeModal();
      dimFab(false);
      setTimeout(() => {
        banner.remove();
        modal.remove();
      }, 300);
    }

    if (openSettingsBtn) {
      openSettingsBtn.addEventListener('click', openModal);
    }
    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', setAllAndClose);
    }
    if (acceptAllModalBtn) {
      acceptAllModalBtn.addEventListener('click', setAllAndClose);
    }
    if (saveBtn) {
      saveBtn.addEventListener('click', saveCustomAndClose);
    }

    // клик по фону модалки закрывает только модалку, не баннер
    modal.addEventListener('click', function(e){
      if (e.target.classList.contains('ck-modal__backdrop')) {
        closeModal();
      }
    });
  })();

/* inline script 5 */
/* --- Слайдер с ленивой загрузкой слайдов --- */
(function(){
  const slider = document.getElementById('slider');
  if (!slider) return;

  const track  = slider.querySelector('.track');
  const slides = [...track.children];
  const btnPrev = document.querySelector('.prev');
  const btnNext = document.querySelector('.next');
  let i = 0;

  function loadSlide(idx) {
    const slide = slides[idx];
    if (!slide || slide.dataset.loaded) return;

    const src = slide.dataset.src;
    if (!src) return;

    slide.style.backgroundImage = `url("${src}")`;
    slide.dataset.loaded = '1';
  }

  function go(n){
    i = (n + slides.length) % slides.length;
    track.style.transform = `translateX(${-i * 100}%)`;
    // подгружаем текущий и следующий слайд
    loadSlide(i);
    loadSlide((i + 1) % slides.length);
  }

  const AUTOPLAY_MS = 3000;
  let timerId = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function start(){
    if (reduceMotion.matches) return;
    stop();
    timerId = setInterval(() => go(i + 1), AUTOPLAY_MS);
  }
  function stop(){
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }
  function restart(){ stop(); start(); }

  btnPrev.addEventListener('click', () => { go(i - 1); restart(); });
  btnNext.addEventListener('click', () => { go(i + 1); restart(); });

  // первый слайд уже с картинкой, отмечаем его как загруженный
  slides[0].dataset.loaded = '1';
  go(0);
  start();
})();

/* --- Параллакс --- */
(function(){
  const stage = document.querySelector('.stage');
  const logo  = document.querySelector('.overlay .logo');
  const img   = document.querySelector('.parallax-img');
  const SPEED_LOGO = -0.50;
  const SPEED_IMG  = SPEED_LOGO / 4;
  function tick(){
    const scrolled = -stage.getBoundingClientRect().top;
    if (logo) logo.style.setProperty('--shift',  (scrolled * SPEED_LOGO) + 'px');
    if (img)  img.style.setProperty('--shift2', (scrolled * SPEED_IMG)  + 'px');
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* --- Плавная смена текста --- */
(function(){
  const el = document.getElementById('dynamic-desc');
  if (!el) return;
  const span = el.querySelector('span');

  const items = [
    'BIM-моделирование инженерных систем,<br>проектирование и 3D-визуализация<br>промышленных объектов',
    'Проектируем и создаем архитектуру, выраженную в цифровой трехмерной модели с отображением всех элементов будущего объекта. Включая все инженерные системы.',
    'Онлайн-отслеживаем ход проекта в реальном времени. Гарантируем отсутствие коллизий и даем возможность прогуляться по будущему 3D-объекту.',
    'Согласовываем и контролируем процессы в удобном личном кабинете. Выполняем функции генерального проектировщика как современный digital-сервис с собственной командой.',
    'Разрабатываем полный и исчерпывающий комплект рабочей документации (РД), который служит единственным источником истины для подрядчиков, сметчиков и снабженцев.',
    'Консультируем в кризисных строительных ситуациях. Реанимируем проекты, модернизируем и перевооружаем уже существующие объекты.'
  ];

  let idx = 0;
  const START_DELAY = 4000;
  const PERIOD = 4000;
  const FADE = 800;

  function step(){
    span.style.opacity = '0';
    setTimeout(() => {
      idx = (idx + 1) % items.length;
      span.innerHTML = items[idx];
      span.style.opacity = '1';
    }, FADE);
  }

  setTimeout(() => { step(); setInterval(step, PERIOD); }, START_DELAY);
})();

/* inline script 6 */
(function () {
  const TARGET_SELECTORS = [
    '#scroll-calc', '#calc', '[data-anchor="calc"]',
    '.calc', '.calcx', '.calcx-mob'
  ];

  function stickyOffset() {
    let off = 0;

    const adminbar = document.getElementById('wpadminbar');
    if (adminbar && getComputedStyle(adminbar).position === 'fixed') {
      off += adminbar.offsetHeight;
    }

    const headers = document.querySelectorAll(
      '.site-header, header.sticky, .header, .header-fixed, .sticky-header, [data-sticky="true"]'
    );
    headers.forEach(h => {
      const cs = getComputedStyle(h);
      const rect = h.getBoundingClientRect();
      if ((cs.position === 'fixed' || cs.position === 'sticky') && rect.top <= 0) {
        off += h.offsetHeight;
      }
    });

    return off;
  }

  function findCalcTarget() {
    const all = TARGET_SELECTORS
      .flatMap(sel => Array.from(document.querySelectorAll(sel)))
      .filter(Boolean);

    if (!all.length) return null;

    const scrollY = window.scrollY;
    const posSorted = all
      .map(el => ({ el, top: el.getBoundingClientRect().top + scrollY }))
      .sort((a, b) => a.top - b.top);

    const below = posSorted.find(p => p.top >= scrollY + 10);
    return (below || posSorted[0]).el;
  }

  function smoothScrollTo(el) {
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const y1 = el.getBoundingClientRect().top + window.scrollY - stickyOffset() - 8;

    window.scrollTo({ top: y1, behavior: prefersReduce ? 'auto' : 'smooth' });

    setTimeout(() => {
      const y2 = el.getBoundingClientRect().top + window.scrollY - stickyOffset() - 8;
      window.scrollTo({ top: y2, behavior: 'auto' });
    }, 400);
  }

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn-calc');
    if (!btn) return;

    const target = findCalcTarget();
    if (!target) return;

    e.preventDefault();
    smoothScrollTo(target);
  }, { passive: false });
})();

/* inline script 7 */
(function(){
  const openBtn = document.querySelector('.btn.btn-order');
  const root = document.getElementById('ccm-root');
  const back = root.querySelector('.ccm__back');
  const close = root.querySelector('.ccm__close');

  function open(){ root.setAttribute('open',''); }
  function closeIt(){ root.removeAttribute('open'); }

  if (openBtn) openBtn.addEventListener('click', e => { e.preventDefault(); open(); });
  back.addEventListener('click', closeIt);
  close.addEventListener('click', closeIt);

  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeIt(); });
})();

/* inline script 8 */
(function () {
  const inner = document.querySelector('.srv__inner');
  const grid  = document.querySelector('.srv__grid');
  const logo  = document.querySelector('.srv__logo-parallax');
  const decor = document.querySelector('.srv__decor-parallax');
  if (!inner || !grid || !logo || !decor) return;

  /* исходная скорость логотипа */
  const SPEED     = -.50;

  /* новая скорость слева — в 4 раза меньше */
  const SPEED_DECOR = SPEED / 4; // -0.125

  /* смещения для позиционирования относительно карточек */
  const OFFSET_X_LOGO  = 28;
  const OFFSET_Y_LOGO  = 24;

  const GAP_LEFT = 24;      // зазор слева от карточки до картинки
  const OFFSET_Y_DECOR = 20;

  function getScroller(el) {
    let node = el.parentElement;
    const html = document.documentElement;
    while (node && node !== html) {
      const st = getComputedStyle(node);
      if (/(auto|scroll)/.test(st.overflowY)) return node;
      node = node.parentElement;
    }
    return window;
  }
  const scroller = getScroller(inner);

  // Якоря: логотип — 9-я карточка (как у вас), декор — 1-я карточка (слева)
  const targetCardLogo  = grid.children[8];
  const targetCardDecor = grid.children[0];
  if (!targetCardLogo || !targetCardDecor) return;

  function placeLogo() {
    const innerRect = inner.getBoundingClientRect();
    const cardRect  = targetCardLogo.getBoundingClientRect();
    const left = (cardRect.right - innerRect.left) + OFFSET_X_LOGO;
    const top  = (cardRect.top   - innerRect.top)  + OFFSET_Y_LOGO;
    logo.style.left = left + 'px';
    logo.style.top  = top  + 'px';
  }

  function placeDecor() {
    const innerRect = inner.getBoundingClientRect();
    const cardRect  = targetCardDecor.getBoundingClientRect();

    // ставим ИЗОБРАЖЕНИЕ слева от левой карточки
    const imgW = decor.offsetWidth || 460;
    const left = (cardRect.left - innerRect.left) - imgW - GAP_LEFT;
    const top  = (cardRect.top  - innerRect.top)  + OFFSET_Y_DECOR;

    decor.style.left = left + 'px';
    decor.style.top  = top  + 'px';
  }

  let sectionStart = 0;
  function updateSectionStart() {
    const innerRect = inner.getBoundingClientRect();
    if (scroller === window) {
      const scTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      sectionStart = innerRect.top + scTop;
    } else {
      const scRect = scroller.getBoundingClientRect();
      sectionStart = (innerRect.top - scRect.top) + scroller.scrollTop;
    }
  }

  function getScrollTop() {
    return scroller === window
      ? (window.pageYOffset || document.documentElement.scrollTop || 0)
      : scroller.scrollTop;
  }

  function applyParallax() {
    const base = (getScrollTop() - sectionStart);
    const shiftLogo  = base * SPEED;
    const shiftDecor = base * SPEED_DECOR;

    logo.style.transform  = 'translate3d(0,' + shiftLogo  + 'px,0)';
    decor.style.transform = 'translate3d(0,' + shiftDecor + 'px,0)';
  }

  const onScroll = () => applyParallax();
  const onResize = () => { placeLogo(); placeDecor(); updateSectionStart(); applyParallax(); };

  if (scroller === window) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
  } else {
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
  }

  let lastL = NaN, lastD = NaN;
  function tick() {
    const base = (getScrollTop() - sectionStart);
    const shiftLogo  = base * SPEED;
    const shiftDecor = base * SPEED_DECOR;

    if (shiftLogo !== lastL) {
      logo.style.transform = 'translate3d(0,' + shiftLogo + 'px,0)';
      lastL = shiftLogo;
    }
    if (shiftDecor !== lastD) {
      decor.style.transform = 'translate3d(0,' + shiftDecor + 'px,0)';
      lastD = shiftDecor;
    }
    requestAnimationFrame(tick);
  }

  const ro = new ResizeObserver(onResize);
  ro.observe(inner);
  ro.observe(grid);
  ro.observe(targetCardLogo);
  ro.observe(targetCardDecor);

  placeLogo();
  placeDecor();
  updateSectionStart();
  applyParallax();
  requestAnimationFrame(tick);
})();

/* inline script 9 */
/* Клик по карточке: ведём по data-url, если есть */
(function(){
  document.querySelectorAll('.project-card[data-url]').forEach(function(card){
    card.addEventListener('click', function(e){
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'a' || tag === 'button') return;

      const sel = window.getSelection && window.getSelection().toString();
      if (sel) return;

      const url = card.getAttribute('data-url');
      if (url) window.location.href = url;
    });
  });
})();

/* Параллакс логотипа и правого изображения */
(function () {
  const inner   = document.querySelector('.projects-inner');
  const logo    = document.querySelector('.projects-inner .project-card:nth-child(3) .card-logo');
  const section = document.querySelector('.projects');
  if (!inner || !logo || !section) return;

  const SPEED_LOGO = -0.50;
  const SPEED_IMG  = SPEED_LOGO / 4;
  const OFFSET_Y   = 24;

  function getScroller(el) {
    let node = el && el.parentElement;
    const html = document.documentElement;
    while (node && node !== html) {
      const st = getComputedStyle(node);
      if (/(auto|scroll)/.test(st.overflowY)) return node;
      node = node.parentElement;
    }
    return window;
  }
  const scroller = getScroller(inner);

  let sectionStart = 0;
  function updateSectionStart() {
    const r = section.getBoundingClientRect();
    if (scroller === window) {
      const scTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      sectionStart = r.top + scTop;
    } else {
      const scR = scroller.getBoundingClientRect();
      sectionStart = (r.top - scR.top) + scroller.scrollTop;
    }
  }

  function getScrollTop() {
    return scroller === window
      ? (window.pageYOffset || document.documentElement.scrollTop || 0)
      : scroller.scrollTop;
  }

  function applyParallax() {
    const diff     = getScrollTop() - sectionStart;
    const shift    = diff * SPEED_LOGO + OFFSET_Y;
    const shiftImg = diff * SPEED_IMG;
    logo.style.transform = 'translate3d(0,' + shift + 'px,0) scale(.8)';
    section.style.setProperty('--shift-img', shiftImg + 'px');
  }

  const onScroll = () => applyParallax();
  const onResize = () => { updateSectionStart(); applyParallax(); };

  if (scroller === window) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
  } else {
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
  }

  updateSectionStart();
  applyParallax();
})();

/* inline script 10 */
(function () {
  const ENDPOINT = "https://api.web3forms.com/submit";
  const ACCESS_KEY = "\x34\x63\x65\x30\x61\x61\x64\x31\x2d\x63\x32\x37\x61\x2d\x34\x31\x65\x39\x2d\x61\x34\x33\x36\x2d\x32\x66\x63\x39\x64\x33\x31\x66\x62\x38\x66\x37";

  const ready = (fn) => document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", fn, { once: true })
    : fn();

  ready(function () {
    const form = document.getElementById("calcForm");
    if (!form) return;

    const areaBtns = form.querySelectorAll(".area-btn");
    const phone = form.querySelector("#phone");
    const email = form.querySelector("#email");
    const zone  = form.querySelector("#zone");

    areaBtns.forEach(btn=>{
      btn.addEventListener("click", ()=>{
        areaBtns.forEach(b=>b.classList.remove("area-btn--active"));
        btn.classList.add("area-btn--active");
        try{ localStorage.setItem("calcArea", btn.dataset.area); }catch(e){}
      });
    });

    const ensurePrefix = () => { if(!phone.value.startsWith("+7")) phone.value = "+7"; };
    ensurePrefix();
    phone.addEventListener("focus", ensurePrefix);
    phone.addEventListener("input", ()=>{
      let v = phone.value.replace(/[^\d+]/g,"");
      if(!v.startsWith("+7")) v = "+7" + v.replace(/\D/g,"");
      const digits = v.replace("+7","").replace(/\D/g,"").slice(0,10);
      phone.value = "+7" + digits;
    });

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      e.stopPropagation();

      /* простая валидация — без alert */
      const objChecked   = Array.from(form.querySelectorAll(".chk input")).some(chk => chk.checked);
      const areaSelected = Array.from(areaBtns).some(b => b.classList.contains("area-btn--active"));
      const phoneOk = /^\+7\d{10}$/.test(phone.value.trim());
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
      const zoneOk  = zone.value.trim() !== "";
      if (!(objChecked && areaSelected && phoneOk && emailOk && zoneOk)) {
        console.warn("Не все поля заполнены корректно.");
        return;
      }

      const objs = Array.from(form.querySelectorAll(".chk input:checked"))
        .map(chk => chk.parentNode.textContent.trim());
      const area = Array.from(areaBtns).find(b => b.classList.contains("area-btn--active"))?.dataset.area || "";

      const fd = new FormData();
      fd.append("access_key", ACCESS_KEY);
      fd.append("subject", "Заявка — расчёт полной стоимости");
      fd.append("from_name", "Сайт allnrg.ru");
      fd.append("replyto", email.value.trim());
      fd.append("Телефон", phone.value.trim());
      fd.append("Email", email.value.trim());
      fd.append("Объект", objs.join(", "));
      fd.append("Площадь", area);
      fd.append("Часовой пояс", zone.value.trim());
      fd.append("botcheck", "");

      try {
        const res = await fetch(ENDPOINT, { method: "POST", body: fd });
        const text = await res.text();
        let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
        if (!res.ok || data.success === false) throw new Error((data && (data.message || data.error)) || ("HTTP " + res.status));

        /* только всплывашка успеха */
        openCalcSuccess();

        form.reset(); ensurePrefix();
        try{ localStorage.removeItem("calcArea"); }catch(e){}
      } catch (err) {
        console.error(err);
        /* без alert */
      }
    });
  });
})();

/* inline script 11 */
/* Изолированная логика всплывашки успеха */
(function(){
  const box = document.getElementById('tendcalc');
  if(!box) return;

  function openCalcSuccess(){
    box.hidden = false;
    setTimeout(()=>box.querySelector('.tendcalc__mainbtn')?.focus(), 0);
  }
  function closeCalcSuccess(){ box.hidden = true; }

  box.addEventListener('click', (e)=>{
    if(e.target.matches('[data-tendcalc-close], .tendcalc__backdrop')) closeCalcSuccess();
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && !box.hidden) closeCalcSuccess();
  });

  window.openCalcSuccess = openCalcSuccess;
})();

/* inline script 12 */
// Плавное последовательное появление блоков при скролле
  (function () {
    const stats = document.querySelectorAll('.stat');
    if (!('IntersectionObserver' in window)) {
      stats.forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 600);
      });
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Когда первый элемент появляется — запускаем цепочку
          const items = Array.from(entry.target.parentNode.querySelectorAll('.stat'));
          items.forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 600);
          });
          obs.disconnect(); // больше не наблюдаем
        }
      });
    }, { threshold: 0.3 });

    // наблюдаем только за первым элементом, чтобы запускать всю секцию
    io.observe(stats[0]);
  })();

/* inline script 13 */
// Подкладываем фоновые иконки карточек из data-bg
  document.querySelectorAll('.card[data-bg]').forEach(el=>{
    const url = el.getAttribute('data-bg');
    if(url) el.style.setProperty('--card-bg',`url('${url}')`);
  });

/* inline script 14 */
(function(){
  const inner = document.querySelector('.allnrg-inner');
  const grid  = document.querySelector('.allnrg-grid');
  const logo  = document.querySelector('.logo-gray');
  const decor = document.querySelector('.decor-left');
  if (!inner || !logo || !grid || !decor) return;

  const SPEED    = -0.50;         // как у лого
  const SPEED_DECOR = SPEED / 4;  // в 4 раза медленнее
  const OFFSET_Y = 24;

  function getScroller(el){
    let n = el && el.parentElement, html = document.documentElement;
    while (n && n !== html){
      const st = getComputedStyle(n);
      if (/(auto|scroll)/.test(st.overflowY)) return n;
      n = n.parentElement;
    }
    return window;
  }
  const scroller = getScroller(inner);

  // ставим левый декор относительно первой карточки (слева)
  const targetCardDecor = grid.children[0];

  function placeDecor(){
    if (!targetCardDecor) return;
    const innerRect = inner.getBoundingClientRect();
    const cardRect  = targetCardDecor.getBoundingClientRect();
    const imgW = decor.offsetWidth || 460;
    const GAP_LEFT = 24;
    const OFFSET_Y_DECOR = 20;

    const left = (cardRect.left - innerRect.left) - imgW - GAP_LEFT;
    const top  = (cardRect.top  - innerRect.top)  + OFFSET_Y_DECOR;

    decor.style.left = left + 'px';
    decor.style.top  = top  + 'px';
  }

  let sectionStart = 0;
  function updateSectionStart(){
    const r = inner.getBoundingClientRect();
    if (scroller === window){
      const scTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      sectionStart = r.top + scTop;
    } else {
      const scR = scroller.getBoundingClientRect();
      sectionStart = (r.top - scR.top) + scroller.scrollTop;
    }
  }

  function getScrollTop(){
    return scroller === window
      ? (window.pageYOffset || document.documentElement.scrollTop || 0)
      : scroller.scrollTop;
  }

  function apply(){
    const base = (getScrollTop() - sectionStart);
    const shiftLogo  = base * SPEED + OFFSET_Y;
    const shiftDecor = base * SPEED_DECOR;

    logo.style.transform  = `translate3d(0, ${shiftLogo}px, 0) scale(.8)`;
    decor.style.transform = `translate3d(0, ${shiftDecor}px, 0)`;
  }

  const onScroll = () => apply();
  const onResize = () => { placeDecor(); updateSectionStart(); apply(); };

  if (scroller === window){
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onResize);
  } else {
    scroller.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onResize);
  }

  const ro = new ResizeObserver(onResize);
  ro.observe(inner);
  ro.observe(grid);
  if (targetCardDecor) ro.observe(targetCardDecor);

  placeDecor();
  updateSectionStart();
  apply();
})();

/* inline script 15 */
(function(){
  const grid = document.querySelector('.allnrg-grid');
  if(!grid) return;

  const axmRoot = document.getElementById('axm-root');
  const serviceModal = axmRoot.querySelector('#axmServiceModal');
  const successModal = axmRoot.querySelector('#axmSuccess');
  const closeService = axmRoot.querySelector('.axm__close');
  const closeSuccess = axmRoot.querySelector('.axm-success__close');

  const form = axmRoot.querySelector('#axmForm');
  const statusEl = axmRoot.querySelector('#axmStatus');
  const serviceField = axmRoot.querySelector('#axmServiceField');

  function openServiceModal(serviceName){
    if(serviceField) serviceField.value = (serviceName||'').replace(/\s+/g,' ').trim();
    serviceModal.setAttribute('open','');
  }
  function closeModal(m){ if(m) m.removeAttribute('open'); }

  grid.querySelectorAll('.card .card-btn').forEach(btn=>{
  const url = btn.getAttribute('href');

  // Если ссылка есть — это редирект, модалку НЕ открываем
  if (url && url !== '#') return;

  btn.addEventListener('click', e=>{
    e.preventDefault();
    const card = btn.closest('.card');
    const titleEl = card ? card.querySelector('.card-title') : null;
    const serviceName = titleEl ? titleEl.textContent : '';
    openServiceModal(serviceName);
  });
});

    // Открытие по кнопке «Оставить заявку» (показываем ту же форму)
  const ctaBtn = document.querySelector('.allnrg-cta .cta-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', e => {
      e.preventDefault();
      const secTitle = document.querySelector('.allnrg-title')?.textContent?.trim() || '';
      const label = secTitle ? `Оставить заявку — ${secTitle}` : 'Оставить заявку';
      openServiceModal(label);
    });
  }


  if(closeService) closeService.addEventListener('click',()=>closeModal(serviceModal));
  if(closeSuccess) closeSuccess.addEventListener('click',()=>closeModal(successModal));

  serviceModal.addEventListener('click',e=>{ if(e.target===serviceModal) closeModal(serviceModal); });
  successModal.addEventListener('click',e=>{ if(e.target===successModal) closeModal(successModal); });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){ closeModal(serviceModal); closeModal(successModal); }
  });

  const emailOK=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v||'').trim());
  const cleanTel=v=>(v||'').replace(/[^\d+]/g,'');
  const API='https://api.web3forms.com/submit';

  form.addEventListener('submit', async e=>{
    e.preventDefault();
    statusEl.textContent=''; statusEl.className='axm__status';

    const phone = cleanTel(form.elements['Телефон'].value);
    const email = (form.elements['email']?.value||'').trim();

    if(!phone || phone.length<6){
      statusEl.textContent='Укажите корректный телефон.';
      statusEl.classList.add('axm__status--err');
      return;
    }
    if(email && !emailOK(email)){
      statusEl.textContent='Проверьте адрес электронной почты.';
      statusEl.classList.add('axm__status--err');
      return;
    }

    statusEl.textContent='Отправка...';
    try{
      const fd=new FormData(form);
      const res=await fetch(API,{method:'POST',body:fd,headers:{Accept:'application/json'}});
      let json={}; try{ json=await res.json(); }catch(_){}
      if(res.ok && json.success){
        form.reset();
        serviceModal.removeAttribute('open');
        successModal.setAttribute('open','');
      }else{
        statusEl.textContent=(json.message||'Ошибка при отправке. Попробуйте позже.');
        statusEl.classList.add('axm__status--err');
      }
    }catch(err){
      console.error(err);
      statusEl.textContent='Ошибка сети. Попробуйте позже.';
      statusEl.classList.add('axm__status--err');
    }
  });
})();

/* inline script 16 */
(function(){
  const items = document.querySelectorAll('.stepsX__item');

  function setBtnLabel(item){
    const open = item.getAttribute('aria-expanded') === 'true';
    const btn = item.querySelector('.stepsX__toggle');
    if (btn) btn.setAttribute('aria-label', open ? 'Скрыть описание' : 'Показать описание');
  }

  function expand(body){
    // измеряем фактическую высоту
    body.style.maxHeight = 'none';
    const h = body.scrollHeight;
    // для плавности: из 0 к нужной высоте
    body.style.maxHeight = '0px';
    requestAnimationFrame(()=> body.style.maxHeight = h + 'px');
  }

  function collapse(body){
    // фиксируем текущую высоту и уходим к 0
    body.style.maxHeight = body.scrollHeight + 'px';
    requestAnimationFrame(()=> body.style.maxHeight = '0px');
  }

  function toggle(item){
    const body = item.querySelector('.stepsX__body');
    const open = item.getAttribute('aria-expanded') === 'true';
    item.setAttribute('aria-expanded', open ? 'false' : 'true');
    setBtnLabel(item);
    if (open) collapse(body); else expand(body);
  }

  // Пересчёт высот открытых пунктов при ресайзе окна
  function recalcOpen(){
    document.querySelectorAll('.stepsX__item[aria-expanded="true"] .stepsX__body')
      .forEach(body=>{
        body.style.maxHeight = 'none';
        const h = body.scrollHeight;
        body.style.maxHeight = h + 'px';
      });
  }
  window.addEventListener('resize', recalcOpen);

  // Авто-пересчёт при изменении контента (переносы, картинки и т.п.)
  const ro = new ResizeObserver(entries => {
    for (const entry of entries){
      const body = entry.target;
      const item = body.closest('.stepsX__item');
      if (item && item.getAttribute('aria-expanded') === 'true'){
        body.style.maxHeight = 'none';
        const h = body.scrollHeight;
        body.style.maxHeight = h + 'px';
      }
    }
  });

  items.forEach(item=>{
    setBtnLabel(item);

    const btn = item.querySelector('.stepsX__toggle');
    if (btn){
      btn.addEventListener('click', (e)=>{ e.stopPropagation(); toggle(item); });
    }

    item.addEventListener('click', (e)=>{
      if (e.target.closest('a')) return;
      toggle(item);
    });

    item.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        toggle(item);
      }
    });

    // если пункт открыт по умолчанию — установить корректную высоту
    if (item.getAttribute('aria-expanded') === 'true') {
      const body = item.querySelector('.stepsX__body');
      body.style.maxHeight = body.scrollHeight + 'px';
      // следим за изменениями содержимого
      ro.observe(body);
    } else {
      // всё равно подключим наблюдатель — на случай динамического контента
      const body = item.querySelector('.stepsX__body');
      ro.observe(body);
    }
  });
})();

/* inline script 17 */
(function(){
  // Web3Forms endpoint
  const ENDPOINT = "https://api.web3forms.com/submit";
  // ОРИГИНАЛ: 4ce0aad1-c27a-41e9-a436-2fc9d31fb8f7 (обфусцирован)
  const ACCESS_KEY = "\x34\x63\x65\x30\x61\x61\x64\x31\x2d\x63\x32\x37\x61\x2d\x34\x31\x65\x39\x2d\x61\x34\x33\x36\x2d\x32\x66\x63\x39\x64\x33\x31\x66\x62\x38\x66\x37";

  const ready = (fn) => document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", fn, { once: true })
    : fn();

  ready(function () {
    const form  = document.getElementById("callbackForm");
    if (!form) return;

    const phone = form.querySelector("#phone");
    const email = form.querySelector("#email");
    const time  = form.querySelector("#time");

    // Маска телефона +7XXXXXXXXXX
    const ensurePrefix = () => { if(!phone.value.startsWith("+7")) phone.value = "+7"; };
    ensurePrefix();
    phone.addEventListener("focus", ensurePrefix);
    phone.addEventListener("input", ()=>{
      let v = phone.value.replace(/[^\d+]/g,"");
      if(!v.startsWith("+7")) v = "+7" + v.replace(/\D/g,"");
      const digits = v.replace("+7","").replace(/\D/g,"").slice(0,10);
      phone.value = "+7" + digits;
    });

    form.addEventListener("submit", async function (ev) {
      ev.preventDefault();
      ev.stopPropagation();

      [phone,email,time].forEach(el=>el.classList.remove("error"));

      const phoneOk = /^\+7\d{10}$/.test(phone.value.trim());
      const emailOk = /^[^@]+@[^@]+\.[a-z]{2,}$/i.test(email.value.trim());
      const timeOk  = !!time.value;

      if(!(phoneOk && emailOk && timeOk)){
        if(!phoneOk) phone.classList.add("error");
        if(!emailOk) email.classList.add("error");
        if(!timeOk)  time.classList.add("error");
        return; // только всплывашка на успех — без alert
      }

      // FormData для Web3Forms
      const fd = new FormData();
      fd.append("access_key", ACCESS_KEY);
      fd.append("subject", "Заявка — обратный звонок");
      fd.append("from_name", "Сайт allnrg.ru");
      fd.append("replyto", email.value.trim());
      fd.append("Телефон", phone.value.trim());
      fd.append("Email", email.value.trim());
      fd.append("Время для звонка", time.value);
      fd.append("botcheck", "");

      try {
        const res = await fetch(ENDPOINT, { method: "POST", body: fd });
        const text = await res.text();
        let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
        if (!res.ok || data.success === false) throw new Error((data && (data.message || data.error)) || ("HTTP " + res.status));

        // Успех — показываем всплывашку (без alert)
        if (typeof window.openCbSuccess === 'function') window.openCbSuccess();

        form.reset();
        phone.value = "+7";
      } catch (e) {
        console.error(e);
        // без alert — можно добавить свой UI-статус при желании
      }
    });
  });
})();

/* Изолированная логика всплывашки успеха для callback */
(function(){
  const box = document.getElementById('cbok');
  if(!box) return;

  function openCbSuccess(){
    box.hidden = false;
    setTimeout(()=>box.querySelector('.cbok__mainbtn')?.focus(), 0);
  }
  window.openCbSuccess = openCbSuccess;
  function closeCbSuccess(){ box.hidden = true; }

  box.addEventListener('click', (e)=>{
    if(e.target.matches('[data-cbok-close], .cbok__backdrop')) closeCbSuccess();
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && !box.hidden) closeCbSuccess();
  });

  // В глобальную область — чтобы вызвать из формы
  window.openCbSuccess = openCbSuccess;
})();

/* inline script 18 */
// Бесшовное дублирование логотипов
  window.addEventListener('load', function () {
    document.querySelectorAll('.partners__track').forEach(function (track) {
      if (track.dataset.inited) return;
      track.dataset.inited = '1';

      const marquee = track.closest('.partners__marquee');
      const containerW = marquee.clientWidth;
      const seedHTML = track.innerHTML;
      const seedW = track.scrollWidth;

      track.style.setProperty('--loop-w', seedW + 'px');
      track.insertAdjacentHTML('beforeend', seedHTML);

      while (track.scrollWidth < containerW + seedW) {
        track.insertAdjacentHTML('beforeend', seedHTML);
      }
    });
  });

/* inline script 19 */
(function(){
  const inner = document.querySelector('.team__inner');
  const logo  = document.querySelector('.team__bg');
  if (!inner || !logo) return;

  const SPEED    = -0.50;
  const OFFSET_Y = 24;

  function getScroller(el){
    let n = el && el.parentElement, html = document.documentElement;
    while (n && n !== html){
      const st = getComputedStyle(n);
      if (/(auto|scroll)/.test(st.overflowY)) return n;
      n = n.parentElement;
    }
    return window;
  }
  const scroller = getScroller(inner);

  let sectionStart = 0;
  function updateSectionStart(){
    const r = inner.getBoundingClientRect();
    if (scroller === window){
      const scTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      sectionStart = r.top + scTop;
    } else {
      const scR = scroller.getBoundingClientRect();
      sectionStart = (r.top - scR.top) + scroller.scrollTop;
    }
  }

  function getScrollTop(){
    return scroller === window
      ? (window.pageYOffset || document.documentElement.scrollTop || 0)
      : scroller.scrollTop;
  }

  function apply(){
    const shift = (getScrollTop() - sectionStart) * SPEED + OFFSET_Y;
    logo.style.transform = `translate3d(0, ${shift}px, 0) scale(1)`;
  }

  const onScroll = () => apply();
  const onResize = () => { updateSectionStart(); apply(); };

  if (scroller === window){
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onResize);
  } else {
    scroller.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onResize);
  }

  let last = NaN;
  (function tick(){
    const shift = (getScrollTop() - sectionStart) * SPEED + OFFSET_Y;
    if (shift !== last){
      logo.style.transform = `translate3d(0, ${shift}px, 0) scale(1)`;
      last = shift;
    }
    requestAnimationFrame(tick);
  })();

  const ro = new ResizeObserver(onResize);
  ro.observe(inner);

  updateSectionStart();
  apply();
})();

/* inline script 20 */
(function(){
  const mq   = window.matchMedia('(min-width:768px) and (max-width:1024px)');
  const btn  = document.querySelector('.burger');
  const menu = document.getElementById('mnav');

  function toggle(e){
    if (e) e.preventDefault();
    const open = document.body.classList.toggle('nav-open');
    if (btn) btn.setAttribute('aria-expanded', String(open));
  }

  function closeMenu(){
    if (!document.body.classList.contains('nav-open')) return;
    document.body.classList.remove('nav-open');
    if (btn) btn.setAttribute('aria-expanded','false');
  }

  function closeOnOutside(e){
    if (!document.body.classList.contains('nav-open')) return;
    if (!menu) return;
    if (!menu.contains(e.target) && !e.target.closest('.burger')){
      closeMenu();
    }
  }

  function closeOnEsc(e){
    if (e.key === 'Escape'){
      closeMenu();
    }
  }

  // Дополнительно: закрывать меню при клике по любому пункту (переход по ссылке сохранится)
  function closeOnLinkClick(){
    if (!menu) return;
    menu.addEventListener('click', function(e){
      const a = e.target.closest('a');
      if (a) closeMenu();
    });
  }

  function bind(){
    if (btn) btn.addEventListener('click', toggle);
    document.addEventListener('click', closeOnOutside);
    document.addEventListener('keydown', closeOnEsc);
    closeOnLinkClick();
  }

  function unbind(){
    if (btn) btn.removeEventListener('click', toggle);
    document.removeEventListener('click', closeOnOutside);
    document.removeEventListener('keydown', closeOnEsc);
    closeMenu();
  }

  if (mq.matches) bind();

  if (mq.addEventListener){
    mq.addEventListener('change', e => e.matches ? bind() : unbind());
  } else if (mq.addListener){
    mq.addListener(e => e.matches ? bind() : unbind());
  }
})();

/* inline script 21 */
/* Слайдер + стабильный параллакс */
(function(){
  const root = document.querySelector('[data-ae-tab]');
  if(!root) return;

  const mqTablet = window.matchMedia('(min-width:768px) and (max-width:1024px)');
  const mqMobile = window.matchMedia('(max-width:767px)');

  // Слайдер
  function initSlider(){
  if(!mqTablet.matches) return;
  const slider = root.querySelector('#tabSlider');
  const track  = slider?.querySelector('.slider__track');
  const prev   = root.querySelector('.nav .prev');
  const next   = root.querySelector('.nav .next');
  if(!track || !prev || !next) return;

  let i = 0; const n = track.children.length;
  const go = k => { i = (k + n) % n; track.style.transform = 'translateX(' + (-i*100) + '%)'; };

  // === АВТОПРОКРУТКА ===
  const AUTOPLAY_MS = 3000;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timerId = null;

  const start = () => {
    if (reduceMotion.matches) return;     // уважаем системную настройку
    stop();
    timerId = setInterval(() => go(i + 1), AUTOPLAY_MS);
  };
  const stop = () => {
    if (timerId) { clearInterval(timerId); timerId = null; }
  };
  const restart = () => { stop(); start(); };

  // Кнопки
  const onPrev = ()=>{ go(i-1); restart(); };
  const onNext = ()=>{ go(i+1); restart(); };
  prev.addEventListener('click', onPrev);
  next.addEventListener('click', onNext);

  // Свайп
  let sx=0, dx=0, touching=false;
  const ts = (e)=>{ touching=true; sx=e.touches[0].clientX; dx=0; stop(); };
  const tm = (e)=>{ if(!touching) return; dx=e.touches[0].clientX - sx; };
  const te = ()=>{ 
    if(!touching) return; 
    touching=false; 
    if(Math.abs(dx)>40) go(i + (dx<0?1:-1)); 
    setTimeout(start, 800); // мягкий перезапуск после свайпа
  };
  slider.addEventListener('touchstart', ts, {passive:true});
  slider.addEventListener('touchmove',  tm, {passive:true});
  slider.addEventListener('touchend',   te, {passive:true});

  // Пауза при наведении/фокусе (если есть мышь/клавиатура)
  const onEnter = ()=>stop();
  const onLeave = ()=>start();
  const onFocusIn = ()=>stop();
  const onFocusOut = ()=>start();
  slider.addEventListener('mouseenter', onEnter);
  slider.addEventListener('mouseleave', onLeave);
  slider.addEventListener('focusin', onFocusIn);
  slider.addEventListener('focusout', onFocusOut);

  // Пауза, когда вкладка неактивна
  const onVis = ()=>{ document.hidden ? stop() : start(); };
  document.addEventListener('visibilitychange', onVis);

  // Реакция на смену Reduce Motion
  const onRM = ()=>{ reduceMotion.matches ? stop() : start(); };
  reduceMotion.addEventListener?.('change', onRM);

  // Старт
  go(0);
  start();

  // Очистка
  root._unSlider = () => {
    stop();
    prev.removeEventListener('click', onPrev);
    next.removeEventListener('click', onNext);
    slider.removeEventListener('touchstart', ts);
    slider.removeEventListener('touchmove',  tm);
    slider.removeEventListener('touchend',   te);
    slider.removeEventListener('mouseenter', onEnter);
    slider.removeEventListener('mouseleave', onLeave);
    slider.removeEventListener('focusin', onFocusIn);
    slider.removeEventListener('focusout', onFocusOut);
    document.removeEventListener('visibilitychange', onVis);
    reduceMotion.removeEventListener?.('change', onRM);
  };
}


  // Параллакс лого внутри панели
  function initParallax(){
    const panel = root.querySelector('[data-htab-panel]');
    const logo  = panel?.querySelector('.hmob__logo');
    if(!panel || !logo) return;

    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (mqMobile.matches || prefersReduce){
      logo.style.setProperty('--dy','0px');
      return;
    }

    const SPEED = -0.5;
    const css = getComputedStyle(root);
    const SCALE = parseFloat(css.getPropertyValue('--scale')) || 1;

    let rafId = 0;
    function frame(){
      const top = panel.getBoundingClientRect().top;
      const dy = (-top * SPEED) / SCALE;
      logo.style.setProperty('--dy', dy + 'px');
      rafId = requestAnimationFrame(frame);
    }

    const rebound = () => { cancelAnimationFrame(rafId); rafId = requestAnimationFrame(frame); };
    window.addEventListener('resize', rebound, {passive:true});
    window.addEventListener('orientationchange', rebound);
    if (window.visualViewport){
      visualViewport.addEventListener('resize', rebound, {passive:true});
      visualViewport.addEventListener('scroll', rebound, {passive:true});
    }
    rafId = requestAnimationFrame(frame);

    root._unParallax = () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', rebound);
      window.removeEventListener('orientationchange', rebound);
      if (window.visualViewport){
        visualViewport.removeEventListener('resize', rebound);
        visualViewport.removeEventListener('scroll', rebound);
      }
    };
  }

  function mount(){ unmount(); initSlider(); initParallax(); }
  function unmount(){
    root._unSlider && root._unSlider(); root._unSlider = null;
    root._unParallax && root._unParallax(); root._unParallax = null;
  }

  mount();
  mqTablet.addEventListener?.('change', e => e.matches ? mount() : unmount());
  mqMobile.addEventListener?.('change', () => { unmount(); mount(); });
})();

/* inline script 22 */
(function(){
  const root = document.querySelector('[data-ae-tab]');
  const btn  = root?.querySelector('.hmob__btn--dark');
  if (!btn) return;

  function stickyOffset(){
    let off = 0;
    const adminbar = document.getElementById('wpadminbar');
    if (adminbar && getComputedStyle(adminbar).position === 'fixed') off += adminbar.offsetHeight;
    const stickyHeader = document.querySelector('.site-header, header.sticky, .header, .header-fixed');
    if (stickyHeader && getComputedStyle(stickyHeader).position === 'fixed') off += stickyHeader.offsetHeight;
    return off;
  }

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector('.calcx');
    if (!target) return;
    const y = target.getBoundingClientRect().top + window.scrollY - stickyOffset();
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
})();

/* inline script 23 */
(function(){
  const root = document.querySelector('[data-ae-tab]');
  if (!root) return;
  const desc = root.querySelector('.hmob__desc');
  if (!desc) return;

  const isTablet = () => window.innerWidth >= 768 && window.innerWidth <= 1024;

  // первая фраза — текущий HTML (BIM …)
  const first = desc.innerHTML.trim();

  const phrases = [
    first,
    'Проектируем и создаем архитектуру, выраженную в цифровой трехмерной модели, с отображением всех элементов будущего объекта. Включая все инженерные системы.',
    'Онлайн-отслеживаем ход проекта в реальном времени. Гарантированное отсутствие коллизий в проекте и возможность прогуляться по будущему 3D объекту.',
    'Согласовываем и контролируем процессы в удобном личном кабинете. Выполняем функции генерального проектировщика, как современный digital-сервис, с собственным штатом компетентных менеджеров и проектировщиков.',
    'Разрабатываем полный и исчерпывающий комплект рабочей документации (РД), который служит единственным источником истины для подрядчиков, сметчиков и снабженцев.',
    'Консультируем в кризисных строительных ситуациях. Реанимируем строительные проекты, а также модернизируем и перевооружаем уже существующие.'
  ];

  let i = 0;
  const FADE = 600;
  const STEP = 4000;
  let timer = null;

  // Фиксируем минимальную высоту по самой длинной фразе
  function lockHeight(){
    if (!isTablet()) { desc.style.minHeight = ''; return; }

    const probe = desc.cloneNode(true);
    const styles = getComputedStyle(desc);
    probe.style.cssText = `
      position:absolute; left:-99999px; top:-99999px; visibility:hidden;
      white-space:normal; width:${desc.clientWidth}px;
      font:${styles.font}; font-size:${styles.fontSize}; line-height:${styles.lineHeight};
      margin:0; padding:0; border:0;
    `;
    document.body.appendChild(probe);

    let maxH = 0;
    for (const p of phrases){
      probe.innerHTML = p;
      maxH = Math.max(maxH, probe.scrollHeight);
    }
    document.body.removeChild(probe);

    desc.style.minHeight = maxH + 'px';
  }

  function tick(){
    if (!isTablet()) return;
    i = (i + 1) % phrases.length;
    desc.classList.add('is-fade');
    setTimeout(() => {
      desc.innerHTML = phrases[i];
      desc.classList.remove('is-fade');
    }, FADE);
  }

  function start(){
    stop();
    lockHeight();
    timer = setInterval(tick, STEP);
  }
  function stop(){
    if (timer){ clearInterval(timer); timer = null; }
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduce.matches && isTablet()) start();

  let rAF = 0;
  function onResize(){
    if (reduce.matches) return;
    cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(() => {
      if (isTablet()) { lockHeight(); start(); }
      else { stop(); desc.style.minHeight = ''; }
    });
  }
  window.addEventListener('resize', onResize, {passive:true});
})();

/* inline script 24 */
(function(){
  const mq = window.matchMedia('(min-width:768px) && (max-width:1024px)'); // только планшет
  const openBtnSelector = '.hmob__btn.hmob__btn--light';

  function bind(){
    const root = document.getElementById('tccm-root');
    if (!root) return;

    const openBtn = document.querySelector(openBtnSelector);
    const back = root.querySelector('.tccm__back');
    const close = root.querySelector('.tccm__close');

    function open(){ root.setAttribute('open',''); root.setAttribute('aria-hidden','false'); }
    function closeIt(){ root.removeAttribute('open'); root.setAttribute('aria-hidden','true'); }

    if (openBtn && !openBtn.__tccmBound){
      openBtn.addEventListener('click', function(e){
        e.preventDefault();
        open();
      });
      openBtn.__tccmBound = true;
    }
    back.addEventListener('click', closeIt);
    close.addEventListener('click', closeIt);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeIt(); });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bind, {once:true});
  } else {
    bind();
  }
})();

/* inline script 25 */
/* Стабильный параллакс: базовая позиция фиксируется и пересчитывается только при реальном изменении геометрии (resize/zoom/рефлоу).
   Нет дрожания при масштабировании: используем visualViewport + дебаунс, рендерим только translateY в rAF. */
(function(){
  const inner = document.querySelector('.srvx__inner');
  const grid  = document.querySelector('.srvx__grid');
  const logo  = document.querySelector('.srvx__logo-parallax');
  if(!inner || !grid || !logo) return;

  const SPEED = -0.5;
  const OFFSET_X = 28;
  const OFFSET_Y = 24;
  const VIEW_MARGIN = 8; // защита от ухода за край

  // Якорь для лого (девятая карточка либо последняя)
  let anchor = grid.children[8] || grid.lastElementChild;

  function getScroller(el){
    let n = el.parentElement, html = document.documentElement;
    while(n && n !== html){
      const st = getComputedStyle(n);
      if (/(auto|scroll)/.test(st.overflowY)) return n;
      n = n.parentElement;
    }
    return window;
  }
  const scroller = getScroller(inner);

  const sTop = () =>
    scroller === window
      ? (window.pageYOffset || document.documentElement.scrollTop || 0)
      : scroller.scrollTop;

  // База положения (left/top) без параллакса; держим в замыкании и не трогаем на скролле
  let baseLeft = 0, baseTop = 0, sectionStart = 0;

  function viewportBounds(){
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    return { left: VIEW_MARGIN, top: VIEW_MARGIN, right: vw - VIEW_MARGIN, bottom: vh - VIEW_MARGIN };
  }
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

  function computeSectionStart(){
    const r = inner.getBoundingClientRect();
    if (scroller === window){
      const scTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      sectionStart = r.top + scTop;
    } else {
      const sR = scroller.getBoundingClientRect();
      sectionStart = (r.top - sR.top) + scroller.scrollTop;
    }
  }

  function computeBasePosition(){
    if (!anchor || getComputedStyle(anchor).display === 'none') {
      anchor = Array.from(grid.children).find(el => getComputedStyle(el).display !== 'none') || grid.lastElementChild;
      if (!anchor) return;
    }

    const rI = inner.getBoundingClientRect();
    const rC = anchor.getBoundingClientRect();
    const vp = viewportBounds();

    // Предварительные координаты относительно окна
    let leftWin = rC.right + OFFSET_X;
    let topWin  = rC.top   + OFFSET_Y;

    // Размеры лого (в этот момент картинка уже может быть не загружена)
    const lw = logo.offsetWidth || 0;
    const lh = logo.offsetHeight || 0;

    // Кламп в пределах окна
    leftWin = clamp(leftWin, vp.left, vp.right - lw);
    topWin  = clamp(topWin,  vp.top,  vp.bottom - lh);

    // Перевод в систему inner
    baseLeft = leftWin - rI.left;
    baseTop  = topWin  - rI.top;

    logo.style.left = baseLeft + 'px';
    logo.style.top  = baseTop  + 'px';
  }

  // Параллакс — только translateY вокруг базы; никаких пересчётов геометрии на скролле
  function applyParallax(){
    const dy = (sTop() - sectionStart) * SPEED;
    logo.style.transform = 'translate3d(0,' + dy + 'px,0)';
  }

  // Дебаунс для резайза/зума
  let rezTimer = 0;
  function onHeavyChange(){
    cancelAnimationFrame(rezTimer);
    rezTimer = requestAnimationFrame(() => {
      computeSectionStart();
      computeBasePosition();
      applyParallax();
    });
  }

  // rAF-луп без лишних измерений
  let lastDY = NaN;
  function tick(){
    const dy = (sTop() - sectionStart) * SPEED;
    if (dy !== lastDY){
      logo.style.transform = 'translate3d(0,' + dy + 'px,0)';
      lastDY = dy;
    }
    requestAnimationFrame(tick);
  }

  // События
  (scroller===window?window:scroller).addEventListener('scroll', applyParallax, {passive:true});
  window.addEventListener('resize', onHeavyChange, {passive:true});
  window.addEventListener('orientationchange', onHeavyChange);

  // Поддержка зума/визуального viewport (не везде есть)
  if (window.visualViewport){
    visualViewport.addEventListener('resize', onHeavyChange, {passive:true});
    visualViewport.addEventListener('scroll', onHeavyChange, {passive:true});
  }

  // Изменения контента/сеток
  const ro = new ResizeObserver(onHeavyChange);
  ro.observe(inner);
  ro.observe(grid);
  ro.observe(logo);
  Array.from(grid.children).forEach(el => ro.observe(el));

  // Когда картинка-лого загрузится — пересчитать
  if (!logo.complete){
    logo.addEventListener('load', onHeavyChange, {once:true});
    logo.addEventListener('error', onHeavyChange, {once:true});
  }

  // Инициализация
  computeSectionStart();
  computeBasePosition();
  applyParallax();
  tick();
})();

/* inline script 26 */
/* Клик по карточке на планшете */
(function(){
  document.querySelectorAll('.projtab-card[data-url]').forEach(function(card){
    card.addEventListener('click', function(e){
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'a' || tag === 'button') return;

      const sel = window.getSelection && window.getSelection().toString();
      if (sel) return;

      const url = card.getAttribute('data-url');
      if (url) window.location.href = url;
    });
  });
})();

/* Параллакс лого в последней карточке (как было) */
(function(){
  const tabletMQ = window.matchMedia('(min-width:681px) and (max-width:1024px)');
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  const section = document.querySelector('.projtab');
  const lastCard = section && section.querySelector('.projtab-card--last');
  const logo = lastCard && lastCard.querySelector('.projtab-card__logo');
  if (!section || !lastCard || !logo) return;

  let rafId = 0, sectionStart = 0;
  const SPEED = -0.45;
  const OFFSET_Y = 0;

  function getScroller(el){
    let n = el && el.parentElement, html = document.documentElement;
    while (n && n !== html){
      const st = getComputedStyle(n);
      if (/(auto|scroll)/.test(st.overflowY)) return n;
      n = n.parentElement;
    }
    return window;
  }
  const scroller = getScroller(section);

  function getScrollTop(){
    return scroller === window
      ? (window.pageYOffset || document.documentElement.scrollTop || 0)
      : scroller.scrollTop;
  }

  function updateStart(){
    const r = lastCard.getBoundingClientRect();
    if (scroller === window){
      const st = window.pageYOffset || document.documentElement.scrollTop || 0;
      sectionStart = r.top + st;
    } else {
      const sr = scroller.getBoundingClientRect();
      sectionStart = (r.top - sr.top) + scroller.scrollTop;
    }
  }

  function apply(){
    const dy = (getScrollTop() - sectionStart) * SPEED + OFFSET_Y;
    logo.style.setProperty('--dy', dy + 'px');
  }

  function loop(){
    apply();
    rafId = requestAnimationFrame(loop);
  }

  function bind(){
    if (!tabletMQ.matches || reduceMQ.matches) {
      logo.style.setProperty('--dy', '0px');
      return;
    }
    updateStart();
    rafId = requestAnimationFrame(loop);

    const onScroll = () => apply();
    const onResize = () => { updateStart(); apply(); };

    (scroller === window ? window : scroller).addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onResize, {passive:true});
    window.addEventListener('orientationchange', onResize);

    section._unProjPar = () => {
      (scroller === window ? window : scroller).removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };
  }

  function unbind(){
    if (section._unProjPar) section._unProjPar();
    section._unProjPar = null;
    logo.style.setProperty('--dy', '0px');
  }

  bind();

  (tabletMQ.addEventListener
    ? tabletMQ.addEventListener('change', () => { unbind(); bind(); })
    : tabletMQ.addListener && tabletMQ.addListener(() => { unbind(); bind(); }));

  (reduceMQ.addEventListener
    ? reduceMQ.addEventListener('change', () => { unbind(); bind(); })
    : reduceMQ.addListener && reduceMQ.addListener(() => { unbind(); bind(); }));

  if (document.readyState === 'complete') {
    updateStart(); apply();
  } else {
    window.addEventListener('load', () => { updateStart(); apply(); }, {once:true});
  }
})();

/* inline script 27 */
/* === ОТПРАВКА: Web3Forms (FormData) + МОДАЛКА УСПЕХА === */
  const ENDPOINT = "https://api.web3forms.com/submit";
  const ACCESS_KEY = "\x34\x63\x65\x30\x61\x61\x64\x31\x2d\x63\x32\x37\x61\x2d\x34\x31\x65\x39\x2d\x61\x34\x33\x36\x2d\x32\x66\x63\x39\x64\x33\x31\x66\x62\x38\x66\x37";

  // модалка успеха (изолированная логика)
  (function(){
    const box = document.getElementById('calcxok');
    if(!box) return;
    function openCalcxOk(){ box.hidden = false; setTimeout(()=>box.querySelector('.calcxok__mainbtn')?.focus(), 0); }
    function closeCalcxOk(){ box.hidden = true; }
    box.addEventListener('click', (e)=>{
      if(e.target.matches('[data-calcxok-close], .calcxok__backdrop')) closeCalcxOk();
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape' && !box.hidden) closeCalcxOk();
    });
    window.openCalcxOk = openCalcxOk;
  })();

  // выбор площади
  const areaBtnsX = document.querySelectorAll('.calcx-area__btn');
  const phoneX = document.getElementById('calcxPhone');
  const emailX = document.getElementById('calcxEmail');
  const zoneX  = document.getElementById('calcxZone');

  areaBtnsX.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      areaBtnsX.forEach(b=>b.classList.remove('calcx-area__btn--active'));
      btn.classList.add('calcx-area__btn--active');
      try{ localStorage.setItem('calcxArea', btn.dataset.area); }catch(e){}
    });
  });

  // восстановление площади (если есть)
  (function restoreAreaX(){
    try{
      const saved = localStorage.getItem('calcxArea');
      if(!saved) return;
      const btn = [...areaBtnsX].find(b => b.dataset.area === saved);
      if(btn){ btn.classList.add('calcx-area__btn--active'); }
    }catch(e){}
  })();

  // маска телефона: +7 и 10 цифр
  const ensurePrefixX = () => { if(!phoneX.value.startsWith('+7')) phoneX.value = '+7'; };
  ensurePrefixX();
  phoneX.addEventListener('focus', ensurePrefixX);
  phoneX.addEventListener('input', ()=>{
    let v = phoneX.value.replace(/[^\d+]/g,'');
    if(!v.startsWith('+7')) v = '+7' + v.replace(/\D/g,'');
    const digits = v.replace('+7','').replace(/\D/g,'').slice(0,10);
    phoneX.value = '+7' + digits;
  });

  // submit
  document.getElementById('calcxForm').addEventListener('submit', async (e)=>{
    e.preventDefault();

    const objSelected  = document.querySelectorAll('.calcx-chk input:checked').length > 0;
    const areaBtn      = document.querySelector('.calcx-area__btn--active');
    const phoneOk = /^\+7\d{10}$/.test(phoneX.value.trim());
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailX.value.trim());
    const zoneOk = zoneX.value.trim() !== '';

    if(!(objSelected && areaBtn && phoneOk && emailOk && zoneOk)){
      [phoneX, emailX, zoneX].forEach(el => el.classList.remove('calcx--error'));
      if(!phoneOk) phoneX.classList.add('calcx--error');
      if(!emailOk) emailX.classList.add('calcx--error');
      if(!zoneOk)  zoneX.classList.add('calcx--error');
      return;
    }

    const objs = [...document.querySelectorAll('.calcx-chk input:checked')].map(chk => chk.parentNode.textContent.trim());
    const areaText = areaBtn.textContent.trim();

    const fd = new FormData();
    fd.append('access_key', ACCESS_KEY);
    fd.append('subject', 'Заявка — расчёт полной стоимости');
    fd.append('from_name', 'Сайт allnrg.ru');
    fd.append('replyto', emailX.value.trim());
    fd.append('Телефон', phoneX.value.trim());
    fd.append('Email',   emailX.value.trim());
    fd.append('Объект',  objs.join(', '));
    fd.append('Площадь', areaText);
    fd.append('Часовой пояс', zoneX.value.trim());
    fd.append('botcheck', '');

    try{
      const res = await fetch(ENDPOINT, { method: 'POST', body: fd });
      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
      if (!res.ok || data.success === false) throw new Error((data && (data.message || data.error)) || ('HTTP ' + res.status));

      if (typeof window.openCalcxOk === 'function') window.openCalcxOk();

      e.target.reset();
      ensurePrefixX();
      try{ localStorage.removeItem('calcxArea'); }catch(e){}
    }catch(err){
      console.error(err);
      // можно добавить неблокирующий тост
    }
  });

/* inline script 28 */
// Плавное поочерёдное появление при доскролле
  (function () {
    const cols = document.querySelectorAll('.statsx__col');
    if (!('IntersectionObserver' in window)) {
      cols.forEach((el, i) => setTimeout(() => el.classList.add('visible'), i * 600));
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const all = Array.from(entry.target.parentNode.querySelectorAll('.statsx__col'));
          all.forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 600);
          });
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });

    io.observe(cols[0]);
  })();

/* inline script 29 */
document.querySelectorAll('.exps-card[data-bg]').forEach(el=>{
    const u = el.getAttribute('data-bg');
    if(u) el.style.setProperty('--exps-bg', `url('${u}')`);
  });

  // параллакс серого лого для планшета
  (function(){
    const mq = window.matchMedia('(min-width:681px) and (max-width:1024px)');
    const section = document.querySelector('.exps');
    const gray    = section?.querySelector('.exps__logoGray');
    const cta     = section?.querySelector('.exps__cta');
    if(!section || !gray || !cta) return;

    const SPEED = -0.45;
    let scroller = null, start = 0, rafId = 0;

    function getScroller(el){
      let n = el && el.parentElement, html = document.documentElement;
      while(n && n !== html){
        const st = getComputedStyle(n);
        if (/(auto|scroll)/.test(st.overflowY)) return n;
        n = n.parentElement;
      }
      return window;
    }
    function scrollTop(){
      return scroller === window
        ? (window.pageYOffset || document.documentElement.scrollTop || 0)
        : scroller.scrollTop;
    }
    function updateStart(){
      const r = cta.getBoundingClientRect();
      if (scroller === window){
        const st = scrollTop();
        start = r.top + st;
      } else {
        const sr = scroller.getBoundingClientRect();
        start = (r.top - sr.top) + scroller.scrollTop;
      }
    }
    function apply(){
      if(!mq.matches){ gray.style.setProperty('--dy','0px'); return; }
      const dy = (scrollTop() - start) * SPEED;
      gray.style.setProperty('--dy', dy + 'px');
    }
    function loop(){
      apply();
      rafId = requestAnimationFrame(loop);
    }

    function bind(){
      if (!mq.matches) return;
      scroller = getScroller(section);
      updateStart();
      if(rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(loop);
    }
    bind();
    mq.addEventListener('change', bind);
    window.addEventListener('resize', updateStart);
  })();

/* inline script 30 */
(function(){
  const mq = window.matchMedia('(min-width:681px) and (max-width:1024px)');
  const section = document.querySelector('.exps');
  const root = document.getElementById('expsT-root');
  if(!section || !root) return;

  const modal = root.querySelector('#expsT-modal');
  const success = root.querySelector('#expsT-success');
  const closeFormBtn = root.querySelector('.expsT__close');
  const closeSuccessBtn = root.querySelector('.expsT-success__close');
  const form = root.querySelector('#expsT-form');
  const statusEl = root.querySelector('#expsT-status');
  const serviceField = root.querySelector('#expsT-service');

  function openForm(service){
    if(!mq.matches) return;
    if(serviceField) serviceField.value = (service||'').replace(/\s+/g,' ').trim();
    modal.setAttribute('open','');
  }
  function closeModal(node){
    if(node) node.removeAttribute('open');
  }

  // Подробнее... — только модалка, без перехода по ссылкам
  section.querySelectorAll('.exps-card__btn').forEach(btn=>{
    btn.setAttribute('href', '#');
    btn.addEventListener('click', e=>{
      e.preventDefault();
      if(!mq.matches) return;
      const card = btn.closest('.exps-card');
      const title = card?.querySelector('.exps-card__title')?.textContent || '';
      openForm(title);
    });
  });

  // Оставить заявку
  const cta = section.querySelector('.exps__btn');
  if(cta){
    cta.setAttribute('href','#');
    cta.addEventListener('click', e=>{
      e.preventDefault();
      if(!mq.matches) return;
      const secTitle = section.querySelector('.exps__title')?.textContent?.trim() || '';
      const label = secTitle ? `Оставить заявку — ${secTitle}` : 'Оставить заявку';
      openForm(label);
    });
  }

  // Закрытия
  if(closeFormBtn) closeFormBtn.addEventListener('click', ()=>closeModal(modal));
  if(closeSuccessBtn) closeSuccessBtn.addEventListener('click', ()=>closeModal(success));
  modal.addEventListener('click', e=>{ if(e.target === modal) closeModal(modal); });
  success.addEventListener('click', e=>{ if(e.target === success) closeModal(success); });

  document.addEventListener('keydown', e=>{
    if(e.key === 'Escape'){
      closeModal(modal);
      closeModal(success);
    }
  });

  // Валидация/отправка
  const emailOK = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v||'').trim());
  const cleanTel = v => (v||'').replace(/[^\d+]/g,'');
  const API = 'https://api.web3forms.com/submit';

  form.addEventListener('submit', async e=>{
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.className = 'expsT__status';

    const phone = cleanTel(form.elements['Телефон'].value);
    const email = (form.elements['email']?.value || '').trim();

    if(!phone || phone.length < 6){
      statusEl.textContent = 'Укажите корректный телефон.';
      statusEl.classList.add('expsT__status--err');
      return;
    }
    if(email && !emailOK(email)){
      statusEl.textContent = 'Проверьте адрес электронной почты.';
      statusEl.classList.add('expsT__status--err');
      return;
    }

    statusEl.textContent = 'Отправка...';

    try{
      const fd = new FormData(form);
      const res = await fetch(API, {
        method:'POST',
        body:fd,
        headers:{Accept:'application/json'}
      });
      let json = {};
      try{ json = await res.json(); }catch(_){}
      if(res.ok && json.success){
        form.reset();
        closeModal(modal);
        success.setAttribute('open','');
      }else{
        statusEl.textContent = (json.message || 'Ошибка при отправке. Попробуйте позже.');
        statusEl.classList.add('expsT__status--err');
      }
    }catch(err){
      console.error(err);
      statusEl.textContent = 'Ошибка сети. Попробуйте позже.';
      statusEl.classList.add('expsT__status--err');
    }
  });
})();

/* inline script 31 */
/* Планшет ≤1024 px: динамическая высота, все пункты изначально закрыты */
(function(){
  const rows = document.querySelectorAll('.stpT .stpT__row');

  function expand(body){
    body.style.maxHeight = 'none';
    const h = body.scrollHeight;
    body.style.maxHeight = '0px';
    requestAnimationFrame(()=> body.style.maxHeight = h + 'px');
  }
  function collapse(body){
    body.style.maxHeight = body.scrollHeight + 'px';
    requestAnimationFrame(()=> body.style.maxHeight = '0px');
  }
  function toggle(row){
    const body = row.querySelector('.stpT__body');
    const open = row.getAttribute('aria-expanded') === 'true';
    row.setAttribute('aria-expanded', open ? 'false' : 'true');
    if (open) collapse(body); else expand(body);
  }

  function recalcOpen(){
    document.querySelectorAll('.stpT .stpT__row[aria-expanded="true"] .stpT__body')
      .forEach(body=>{
        body.style.maxHeight = 'none';
        const h = body.scrollHeight;
        body.style.maxHeight = h + 'px';
      });
  }
  window.addEventListener('resize', recalcOpen);

  const ro = new ResizeObserver(entries=>{
    for (const entry of entries){
      const body = entry.target;
      const item = body.closest('.stpT__row');
      if (item && item.getAttribute('aria-expanded')==='true'){
        body.style.maxHeight = 'none';
        const h = body.scrollHeight;
        body.style.maxHeight = h + 'px';
      }
    }
  });

  rows.forEach(row=>{
    const btn = row.querySelector('.stpT__btn');
    if (btn) btn.addEventListener('click', e=>{ e.stopPropagation(); toggle(row); });

    row.addEventListener('click', e=>{
      if (e.target.closest('a')) return;
      toggle(row);
    });

    row.addEventListener('keydown', e=>{
      if (e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        toggle(row);
      }
    });

    const body = row.querySelector('.stpT__body');
    ro.observe(body);
    // все закрыты по умолчанию — max-height оставляем 0
  });
})();

/* inline script 32 */
/* === Логика модалки cbTok (изолировано) === */
(function(){
  const dlg = document.getElementById('cbTok');
  if(!dlg) return;

  function openCbTok(){
    dlg.hidden = false;
    setTimeout(()=> dlg.querySelector('.cbTok__mainbtn')?.focus(), 0);
  }
  function closeCbTok(){ dlg.hidden = true; }

  dlg.addEventListener('click', (e)=>{
    if(e.target.matches('[data-cbtok-close], .cbTok__backdrop')) closeCbTok();
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && !dlg.hidden) closeCbTok();
  });

  window.openCbTok = openCbTok;
})();

/* inline script 33 */
(function(){
  // Web3Forms endpoint + ключ (hex)
  const ENDPOINT = "\x68\x74\x74\x70\x73\x3a\x2f\x2f\x61\x70\x69\x2e\x77\x65\x62\x33\x66\x6f\x72\x6d\x73\x2e\x63\x6f\x6d\x2f\x73\x75\x62\x6d\x69\x74";
  const KEY      = "\x34\x63\x65\x30\x61\x61\x64\x31\x2d\x63\x32\x37\x61\x2d\x34\x31\x65\x39\x2d\x61\x34\x33\x36\x2d\x32\x66\x63\x39\x64\x33\x31\x66\x62\x38\x66\x37";

  function ready(fn){
    if(document.readyState==="loading"){
      document.addEventListener("DOMContentLoaded",fn,{once:true});
    }else{ fn(); }
  }

  ready(function(){
    const form=document.getElementById('cbTForm');
    if(!form) return;

    const phone=document.getElementById('cbT-phone');
    const email=document.getElementById('cbT-email');
    const time=document.getElementById('cbT-time');

    form.noValidate=true;

    const ensurePrefix=()=>{ if(!phone.value.startsWith('+7')) phone.value='+7'; };
    ensurePrefix();
    phone.addEventListener('focus',ensurePrefix);
    phone.addEventListener('input',()=>{
      let v=phone.value.replace(/[^\d+]/g,'');
      if(!v.startsWith('+7')) v='+7'+v.replace(/\D/g,'');
      const digits=v.replace('+7','').replace(/\D/g,'').slice(0,10);
      phone.value='+7'+digits;
    });

    async function handleSubmit(e){
      e.preventDefault();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      if(e.stopPropagation) e.stopPropagation();
      e.returnValue=false;

      [phone,email,time].forEach(el=>el.classList.remove('cbT--err'));

      let ok=true;
      if(!/^\+7\d{10}$/.test(phone.value.trim())){ phone.classList.add('cbT--err'); ok=false; }
      if(!/^[^@]+@[^@]+\.[a-z]{2,}$/i.test(email.value.trim())){ email.classList.add('cbT--err'); ok=false; }
      if(!time.value){ time.classList.add('cbT--err'); ok=false; }

      if(!ok){ alert('Проверьте правильность заполнения полей.'); return false; }

      const fd=new FormData();
      fd.append("Телефон",phone.value.trim());
      fd.append("Email",email.value.trim());
      fd.append("Время для звонка",time.value);
      fd.append("subject","Заявка — обратный звонок");
      fd.append("access_key",KEY);
      fd.append("_template","table");
      fd.append("_captcha","false");

      try{
        const res=await fetch(ENDPOINT,{
          method:"POST",
          headers:{"Accept":"application/json"},
          body:fd,
          credentials:"omit",
          cache:"no-store"
        });

        const text=await res.text();
        let data; try{ data=JSON.parse(text);}catch{ data={raw:text};}

        if(!res.ok||(data&&data.success===false)){
          throw new Error((data&&(data.message||data.error))||("HTTP "+res.status));
        }

        if (typeof window.openCbTok === 'function') window.openCbTok();

        form.reset();
        phone.value='+7';
        return false;
      }catch(err){
        console.error(err);
        alert('Не удалось отправить. Проверьте статус интеграции Web3Forms и домен.');
        return false;
      }
    }

    form.addEventListener('submit',handleSubmit,{capture:true});
  });
})();

/* inline script 34 */
window.addEventListener('load',()=>{
  document.querySelectorAll('.ptT[data-ptt="1"] .ptT__track').forEach(track=>{
    if(track.dataset.inited) return;
    track.dataset.inited='1';
    const marquee = track.closest('.ptT__marquee');
    const containerW = marquee.clientWidth;
    const seedHTML = track.innerHTML;

    // измеряем ширину одного цикла
    const tmp=document.createElement('div');
    tmp.style.cssText='position:absolute;visibility:hidden;white-space:nowrap';
    tmp.className='ptT__track';
    tmp.innerHTML=seedHTML;
    marquee.appendChild(tmp);
    const seedW=tmp.scrollWidth;
    marquee.removeChild(tmp);

    track.style.setProperty('--loop-w', seedW+'px');
    track.insertAdjacentHTML('beforeend', seedHTML);

    // дублируем, пока не перекрыта ширина экрана
    while(track.scrollWidth < containerW + seedW){
      track.insertAdjacentHTML('beforeend', seedHTML);
    }
  });
});

/* inline script 35 */
/* Параллакс логотипа под фото (≤1024px). Надёжная схема: CSS var + rAF. */
(function(){
  const mq = window.matchMedia('(max-width:1024px)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  const root = document.querySelector('.tmT');
  const wrap = root?.querySelector('.tmT__photoWrap'); // привязываем к блоку с фото
  const logo = wrap?.querySelector('.tmT__bg');
  if (!root || !wrap || !logo) return;

  // Константы параллакса
  const SPEED = -0.35;  // мягче, чем на герое
  const OFFSET_Y = 0;

  let rafId = 0;
  let scroller = null;
  let anchorStart = 0;

  function getScroller(el){
    let n = el && el.parentElement, html = document.documentElement;
    while (n && n !== html){
      const st = getComputedStyle(n);
      if (/(auto|scroll)/.test(st.overflowY)) return n;
      n = n.parentElement;
    }
    return window;
  }

  function scrollTop(){
    return scroller === window
      ? (window.pageYOffset || document.documentElement.scrollTop || 0)
      : scroller.scrollTop;
  }

  function updateStart(){
    const r = wrap.getBoundingClientRect(); // якорь — обёртка фото
    if (scroller === window){
      const st = window.pageYOffset || document.documentElement.scrollTop || 0;
      anchorStart = r.top + st;
    } else {
      const sr = scroller.getBoundingClientRect();
      anchorStart = (r.top - sr.top) + scroller.scrollTop;
    }
  }

  function apply(){
    const dy = (scrollTop() - anchorStart) * SPEED + OFFSET_Y;
    logo.style.setProperty('--dy', dy + 'px');
  }

  function loop(){
    apply();
    rafId = requestAnimationFrame(loop);
  }

  function bind(){
    if (!mq.matches || reduce.matches) {
      logo.style.setProperty('--dy', '0px');
      return;
    }
    scroller = getScroller(root);
    updateStart();
    rafId = requestAnimationFrame(loop);

    const onScroll = () => apply();
    const onResize = () => { updateStart(); apply(); };

    (scroller === window ? window : scroller).addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onResize, {passive:true});
    window.addEventListener('orientationchange', onResize);

    // хранить очистку на узле
    root._tmTUnbind = () => {
      (scroller === window ? window : scroller).removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };

    // подстраховка — после загрузки картинок пересчитать
    if (document.readyState === 'complete') {
      onResize();
    } else {
      window.addEventListener('load', onResize, {once:true});
    }
  }

  function unbind(){
    root._tmTUnbind && root._tmTUnbind();
    root._tmTUnbind = null;
    logo.style.setProperty('--dy', '0px');
  }

  // инициализация
  bind();

  // реагируем на переключение условий
  (mq.addEventListener ? mq.addEventListener('change', ()=>{ unbind(); bind(); })
                       : mq.addListener && mq.addListener(()=>{ unbind(); bind(); }));
  (reduce.addEventListener ? reduce.addEventListener('change', ()=>{ unbind(); bind(); })
                           : reduce.addListener && reduce.addListener(()=>{ unbind(); bind(); }));
})();

/* inline script 36 */
(function(){
  const mq  = window.matchMedia('(max-width:767px)');
  const btn = document.querySelector('.mbarM__burger');
  const menu = document.getElementById('mnavM');

  function toggle(e){
    if (e) e.preventDefault();
    const open = document.body.classList.toggle('mbnav-open');
    if (btn) btn.setAttribute('aria-expanded', String(open));
  }

  function closeMenu(){
    if (!document.body.classList.contains('mbnav-open')) return;
    document.body.classList.remove('mbnav-open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function closeOnOutside(e){
    if (!document.body.classList.contains('mbnav-open')) return;
    if (!menu) return;
    if (!menu.contains(e.target) && !e.target.closest('.mbarM__burger')){
      closeMenu();
    }
  }

  function closeOnEsc(e){
    if (e.key === 'Escape'){ closeMenu(); }
  }

  // Закрываем меню при клике по любому пункту; переход по href остаётся штатным
  function closeOnLinkClick(){
    if (!menu) return;
    menu.addEventListener('click', function(e){
      const a = e.target.closest('a');
      if (a) closeMenu();
    });
  }

  function bind(){
    if (btn) btn.addEventListener('click', toggle);
    document.addEventListener('click', closeOnOutside);
    document.addEventListener('keydown', closeOnEsc);
    closeOnLinkClick();
  }

  function unbind(){
    if (btn) btn.removeEventListener('click', toggle);
    document.removeEventListener('click', closeOnOutside);
    document.removeEventListener('keydown', closeOnEsc);
    closeMenu();
  }

  if (mq.matches) bind();

  if (mq.addEventListener){
    mq.addEventListener('change', e => e.matches ? bind() : unbind());
  } else if (mq.addListener){
    mq.addListener(e => e.matches ? bind() : unbind());
  }
})();

/* inline script 37 */
(function(){
  const root = document.querySelector('[data-ae-mob]');
  if (!root) return;

  const mq = window.matchMedia('(max-width:767px)');
  let unbind = null;

  function bind(){
    if (unbind) return;

    const box   = root.querySelector('#aeMobSlider');
    const track = box && box.querySelector('.ae-mob__track');
    const prev  = root.querySelector('.ae-mob__btn--prev');
    const next  = root.querySelector('.ae-mob__btn--next');
    if (!box || !track || !prev || !next) return;

    const slides = track.children;
    const total  = slides.length;
    let idx = 0;

    function loadSlide(index) {
      const slide = slides[index];
      if (!slide) return;

      if (slide.dataset.loaded) return; // уже есть фон

      const src = slide.dataset.src;
      if (!src) {
        slide.dataset.loaded = '1';
        return;
      }

      slide.style.backgroundImage = 'url("' + src + '")';
      slide.dataset.loaded = '1';
    }

    const go = n => {
      const nextIdx = (n + total) % total;

      // заранее подгружаем текущий и следующий слайд
      loadSlide(nextIdx);

      idx = nextIdx;
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
    };

    // === АВТОПРОКРУТКА ===
    const AUTOPLAY_MS = 3000;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timerId = null;

    const start = () => {
      if (reduceMotion.matches) return;
      stop();
      timerId = setInterval(() => go(idx + 1), AUTOPLAY_MS);
    };
    const stop = () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    };
    const restart = () => { stop(); start(); };

    // Кнопки
    const onPrev = () => { go(idx - 1); restart(); };
    const onNext = () => { go(idx + 1); restart(); };
    prev.addEventListener('click', onPrev);
    next.addEventListener('click', onNext);

    // Свайп
    let sx = 0, dx = 0, touching = false;
    const ts = e => { touching = true; sx = e.touches[0].clientX; dx = 0; stop(); };
    const tm = e => { if (!touching) return; dx = e.touches[0].clientX - sx; };
    const te = () => {
      if (!touching) return;
      touching = false;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
      setTimeout(start, 800);
    };
    box.addEventListener('touchstart', ts, {passive:true});
    box.addEventListener('touchmove',  tm, {passive:true});
    box.addEventListener('touchend',   te, {passive:true});

    // Пауза, когда вкладка неактивна
    const onVis = () => { document.hidden ? stop() : start(); };
    document.addEventListener('visibilitychange', onVis);

    // Реакция на Reduce Motion
    const onRM = () => { reduceMotion.matches ? stop() : start(); };
    reduceMotion.addEventListener?.('change', onRM);

    // Старт: первый уже с картинкой, подгружаем второй
    slides[0].dataset.loaded = '1';
    go(0);
    if (document.readyState === 'complete') {
      window.setTimeout(start, 1800);
    } else {
      window.addEventListener('load', function () {
        window.setTimeout(start, 1800);
      }, { once: true });
    }

    // Очистка
    unbind = () => {
      stop();
      prev.removeEventListener('click', onPrev);
      next.removeEventListener('click', onNext);
      box.removeEventListener('touchstart', ts);
      box.removeEventListener('touchmove',  tm);
      box.removeEventListener('touchend',   te);
      document.removeEventListener('visibilitychange', onVis);
      reduceMotion.removeEventListener?.('change', onRM);
      unbind = null;
    };
  }

  function handle(e){
    e.matches ? bind() : (unbind && unbind());
  }

  handle(mq);
  if (mq.addEventListener) mq.addEventListener('change', handle);
  else if (mq.addListener) mq.addListener(handle);
})();

/* inline script 38 */
/*
  Параллакс mhero v2:
  - работает только ≤767px;
  - экономный: включается, когда секция видима (IntersectionObserver);
*/
(function(){
  var BP = 767;
  var SPEED = -0.44;
  var raf = 0, active = false, inView = false;
  var section, logo, scroller, sectionTop = 0;

  function $(s, r){ return (r||document).querySelector(s); }
  function isMobile(){ return window.innerWidth <= BP; }

  function getScroller(el){
    var n = el && el.parentElement, html = document.documentElement;
    while(n && n!==html){
      var st = getComputedStyle(n);
      if (/(auto|scroll)/.test(st.overflowY)) return n;
      n = n.parentElement;
    }
    return window;
  }
  function scrollY(){
    return scroller===window
      ? (window.pageYOffset || document.documentElement.scrollTop || 0)
      : scroller.scrollTop;
  }
  function updateTop(){
    if(!section) return;
    var r = section.getBoundingClientRect();
    if (scroller===window){
      var sy = window.pageYOffset || document.documentElement.scrollTop || 0;
      sectionTop = r.top + sy;
    }else{
      var sr = scroller.getBoundingClientRect();
      sectionTop = (r.top - sr.top) + scroller.scrollTop;
    }
  }
  function apply(){
    if(!logo) return;
    var dy = (scrollY() - sectionTop) * SPEED;
    logo.style.setProperty('--my', dy + 'px');
  }
  function loop(){
    if(!active) return;
    apply();
    raf = requestAnimationFrame(loop);
  }

  var io;
  function observe(){
    if(io) io.disconnect();
    io = new IntersectionObserver(function(entries){
      inView = entries.some(function(e){ return e.isIntersecting; });
      if(inView && !raf){ raf = requestAnimationFrame(loop); }
      if(!inView && raf){ cancelAnimationFrame(raf); raf=0; }
    }, { root: (scroller===window?null:scroller), threshold:[0,1] });
    io.observe(section);
  }

  function bind(){
    if(active) return;
    section = $('.mhero');
    logo    = $('.mhero__logo', section||document);
    if(!section || !logo) return;
    scroller = getScroller(section);
    updateTop(); apply();
    observe();

    var target = (scroller===window? window : scroller);
    target.addEventListener('scroll', apply, {passive:true});
    window.addEventListener('resize', handleResize, {passive:true});
    window.addEventListener('orientationchange', handleResize);

    if(window.visualViewport){
      visualViewport.addEventListener('resize', handleResize, {passive:true});
      visualViewport.addEventListener('scroll', handleResize, {passive:true});
    }
    active = true;
  }
  function unbind(){
    if(!active) return;
    var target = (scroller===window? window : scroller);
    target.removeEventListener('scroll', apply);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
    if(window.visualViewport){
      visualViewport.removeEventListener('resize', handleResize);
      visualViewport.removeEventListener('scroll', handleResize);
    }
    if(io){ io.disconnect(); io=null; }
    if(raf){ cancelAnimationFrame(raf); raf=0; }
    active=false;
  }

  function handleResize(){
    if(!isMobile()){ unbind(); return; }
    updateTop(); apply();
  }

  function ready(fn){
    if(document.readyState==='complete' || document.readyState==='interactive'){ setTimeout(fn,0);}
    else document.addEventListener('DOMContentLoaded', fn, {once:true});
  }

  ready(function(){
    if(isMobile()) bind();
    window.addEventListener('resize', function(){
      if(isMobile()){ bind(); } else { unbind(); }
    }, {passive:true});
  });
})();

/* inline script 39 */
/* Мобайл (≤767px): плавный доскролл с "Рассчитать проект" к контейнеру калькулятора */
(function () {
  const mq = window.matchMedia('(max-width:767px)');
  function getTarget() {
    return document.querySelector('.elementor-element-022d501 .calcx-mob')
        || document.querySelector('#elementor-element-022d501 .calcx-mob')
        || document.querySelector('.calcx-mob')
        || document.querySelector('.calc-container')
        || document.querySelector('.calcx');
  }
  function stickyOffset() {
    let off = 0;
    const adminbar = document.getElementById('wpadminbar');
    if (adminbar && getComputedStyle(adminbar).position === 'fixed')
      off += adminbar.offsetHeight;
    document.querySelectorAll(
      '.site-header, header.sticky, .header, .header-fixed, .sticky-header, [data-sticky="true"]'
    ).forEach(h => {
      const cs = getComputedStyle(h);
      const r = h.getBoundingClientRect();
      if ((cs.position === 'fixed' || cs.position === 'sticky') && r.top <= 0)
        off += h.offsetHeight;
    });
    return off;
  }
  function smoothScrollTo(target) {
    if (!target) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = window.pageYOffset || document.documentElement.scrollTop;
    const end = target.getBoundingClientRect().top + start - stickyOffset();
    const dur = 1000;
    const ease = t => (t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2);
    if (reduce) {
      window.scrollTo(0, end);
      return;
    }
    const startTime = performance.now();
    function anim(now) {
      const t = Math.min(1, (now - startTime) / dur);
      const y = start + (end - start) * ease(t);
      window.scrollTo(0, y);
      if (t < 1) requestAnimationFrame(anim);
    }
    requestAnimationFrame(anim);
  }
  document.addEventListener('click', function (e) {
    if (!mq.matches) return;
    const btn = e.target.closest('.mhero__btn--primary, .btn-calc');
    if (!btn) return;
    e.preventDefault();
    const target = getTarget();
    if (target) smoothScrollTo(target);
  }, { passive: false });
  window.addEventListener('load', function () {
    if (!mq.matches) return;
    if (location.hash && location.hash.toLowerCase().includes('calc')) {
      const target = getTarget();
      if (target) smoothScrollTo(target);
    }
  });
})();

/* inline script 40 */
(function(){
  const isMobile = () => window.innerWidth <= 767;
  const el = document.querySelector('.mhero .mhero__text');
  if (!el) return;

  const phrases = [
    'Проектируем и создаем архитектуру, выраженную в цифровой трехмерной модели, с отображением всех элементов будущего объекта. Включая все инженерные системы.',
    'Онлайн-отслеживаем ход проекта в реальном времени. Гарантированное отсутствие коллизий в проекте и возможность прогуляться по будущему 3D объекту.',
    'Согласовываем и контролируем процессы в удобном личном кабинете. Выполняем функции генерального проектировщика, как современный digital-сервис, с собственным штатом компетентных менеджеров и проектировщиков.',
    'Разрабатываем полный и исчерпывающий комплект рабочей документации (РД), который служит единственным источником истины для подрядчиков, сметчиков и снабженцев.',
    'Консультируем в кризисных строительных ситуациях. Реанимируем строительные проекты, а также модернизируем и перевооружаем уже существующие.',
    'BIM-моделирование инженерных систем и проектирование промышленных объектов'
  ];

  let i = 0;
  const FADE = 600;
  const STEP = 4000;

  if (isMobile()) el.innerHTML = phrases[0];

  function showNext(){
    if (!isMobile()) return;
    i = (i + 1) % phrases.length;
    el.classList.add('is-fade');
    setTimeout(() => {
      el.innerHTML = phrases[i];
      el.classList.remove('is-fade');
    }, FADE);
  }

  let timer = setInterval(showNext, STEP);
  window.addEventListener('resize', () => {
    clearInterval(timer);
    if (isMobile()) timer = setInterval(showNext, STEP);
  }, {passive:true});
})();

/* inline script 41 */
(function(){
  const mq = window.matchMedia('(max-width:767px)');
  const openBtnSelector = '.mhero__btn.mhero__btn--secondary';
  function bind(){
    const root = document.getElementById('mccm-root');
    if (!root) return;
    const openBtn = document.querySelector(openBtnSelector);
    const back = root.querySelector('.mccm__back');
    const close = root.querySelector('.mccm__close');

    function open(){ root.setAttribute('open',''); root.setAttribute('aria-hidden','false'); }
    function closeIt(){ root.removeAttribute('open'); root.setAttribute('aria-hidden','true'); }

    if (openBtn) openBtn.addEventListener('click', function(e){ if(!mq.matches) return; e.preventDefault(); open(); });
    back.addEventListener('click', closeIt);
    close.addEventListener('click', closeIt);
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeIt(); });
  }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', bind, {once:true});
  } else {
    bind();
  }
})();

/* inline script 42 */
/* Параллакс лого за карточками — как в «Команде» */
(function(){
  const inner = document.querySelector('.services-mob');
  const logo  = document.querySelector('.services-mob__logo');
  if (!inner || !logo) return;

  const SPEED    = -0.5;   // скорость сдвига
  const OFFSET_Y = 0;      // базовый сдвиг при старте

  function getScroller(el){
    let n = el && el.parentElement, html = document.documentElement;
    while (n && n !== html){
      const st = getComputedStyle(n);
      if (/(auto|scroll)/.test(st.overflowY)) return n;
      n = n.parentElement;
    }
    return window;
  }
  const scroller = getScroller(inner);

  function getScrollTop(){
    return scroller === window
      ? (window.pageYOffset || document.documentElement.scrollTop || 0)
      : scroller.scrollTop;
  }

  let sectionStart = 0;
  function updateSectionStart(){
    const r = inner.getBoundingClientRect();
    if (scroller === window){
      const scTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      sectionStart = r.top + scTop;
    } else {
      const scR = scroller.getBoundingClientRect();
      sectionStart = (r.top - scR.top) + scroller.scrollTop;
    }
  }

  function apply(){
    const shift = (getScrollTop() - sectionStart) * SPEED + OFFSET_Y;
    logo.style.setProperty('--dy', shift + 'px');
  }

  const onScroll = () => apply();
  const onResize = () => { updateSectionStart(); apply(); };

  if (scroller === window){
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onResize);
  } else {
    scroller.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onResize);
  }

  let last = NaN;
  (function tick(){
    const shift = (getScrollTop() - sectionStart) * SPEED + OFFSET_Y;
    if (shift !== last){
      logo.style.setProperty('--dy', shift + 'px');
      last = shift;
    }
    requestAnimationFrame(tick);
  })();

  updateSectionStart();
  apply();
})();

/* inline script 43 */
/* Параллакс для .projmob__logo */
(function(){
  const wrap = document.querySelector('.projmob__wrap');
  const logo = document.querySelector('.projmob__logo');
  if(!wrap || !logo) return;

  const SPEED = -0.50;
  const OFFSET_Y = 24;

  function getScroller(el){
    let n = el && el.parentElement;
    const html = document.documentElement;
    while(n && n !== html){
      const st = getComputedStyle(n);
      if (/(auto|scroll)/.test(st.overflowY)) return n;
      n = n.parentElement;
    }
    return window;
  }
  const scroller = getScroller(wrap);

  let sectionStart = 0;
  function updateSectionStart(){
    const r = wrap.getBoundingClientRect();
    if (scroller === window){
      const scTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      sectionStart = r.top + scTop;
    } else {
      const scR = scroller.getBoundingClientRect();
      sectionStart = (r.top - scR.top) + scroller.scrollTop;
    }
  }

  function getScrollTop(){
    return scroller === window
      ? (window.pageYOffset || document.documentElement.scrollTop || 0)
      : scroller.scrollTop;
  }

  function apply(){
    const shift = (getScrollTop() - sectionStart) * SPEED + OFFSET_Y;
    logo.style.transform = 'translate3d(0,' + shift + 'px,0)';
  }

  const onScroll = () => apply();
  const onResize = () => { updateSectionStart(); apply(); };

  if (scroller === window){
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onResize, {passive:true});
  } else {
    scroller.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onResize, {passive:true});
  }

  updateSectionStart();
  apply();
})();

/* Клики по карточкам по data-url */
(function(){
  const cards = document.querySelectorAll('.projmob-card[data-url]');
  if (!cards.length) return;

  cards.forEach(function(card){
    const url = card.getAttribute('data-url');
    if (!url) return;

    card.addEventListener('click', function(e){
      if (e.target.closest('a')) return;
      window.location.href = url;
    });

    card.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        window.location.href = url;
      }
    });

    card.setAttribute('tabindex', '0');
  });
})();

/* inline script 44 */
(function(){
  const areaBtns=document.querySelectorAll('.calcx-mob__area-btn');
  const phone=document.getElementById('calcxMobPhone');
  const email=document.getElementById('calcxMobEmail');
  const zone=document.getElementById('calcxMobZone');
  const form=document.getElementById('calcxMobForm');

  areaBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      areaBtns.forEach(b=>b.classList.remove('calcx-mob__area-btn--active'));
      btn.classList.add('calcx-mob__area-btn--active');
    });
  });

  const ensurePrefix=()=>{if(phone&&!phone.value.startsWith('+7'))phone.value='+7'};
  ensurePrefix();
  phone?.addEventListener('focus',ensurePrefix);
  phone?.addEventListener('input',()=>{
    let v=phone.value.replace(/[^\d+]/g,'');
    if(!v.startsWith('+7'))v='+7'+v.replace(/\D/g,'');
    const digits=v.replace('+7','').replace(/\D/g,'').slice(0,10);
    phone.value='+7'+digits;
  });

  const ENDPOINT="\x68\x74\x74\x70\x73\x3a\x2f\x2f\x61\x70\x69\x2e\x77\x65\x62\x33\x66\x6f\x72\x6d\x73\x2e\x63\x6f\x6d\x2f\x73\x75\x62\x6d\x69\x74";
  const KEY="\x34\x63\x65\x30\x61\x61\x64\x31\x2d\x63\x32\x37\x61\x2d\x34\x31\x65\x39\x2d\x61\x34\x33\x36\x2d\x32\x66\x63\x39\x64\x33\x31\x66\x62\x38\x66\x37";

  form?.addEventListener('submit', async (e)=>{
    e.preventDefault();

    const phoneDigits=phone.value.replace('+7','').replace(/\D/g,'');
    const emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    const areaSelected=[...areaBtns].some(btn=>btn.classList.contains('calcx-mob__area-btn--active'));
    const objectSelected=document.querySelectorAll('.calcx-mob__chk input:checked').length>0;

    if(!objectSelected||!areaSelected||phoneDigits.length!==10||!emailOk){
      // без alert — просто не отправляем
      return;
    }

    const objs=[...document.querySelectorAll('.calcx-mob__chk input:checked')].map(i=>i.parentNode.textContent.trim());
    const areaBtn=[...areaBtns].find(b=>b.classList.contains('calcx-mob__area-btn--active'));
    const areaText=areaBtn?areaBtn.textContent.trim():'';

    const fd=new FormData();
    fd.append("Телефон",phone.value.trim());
    fd.append("Email",email.value.trim());
    fd.append("Объект",objs.join(', '));
    fd.append("Площадь",areaText);
    fd.append("Часовой пояс",zone.value.trim());
    fd.append("subject","Заявка — расчёт полной стоимости (моб.)");
    fd.append("access_key",KEY);

    try{
      const resp=await fetch(ENDPOINT,{method:"POST",headers:{"Accept":"application/json"},body:fd});
      const text=await resp.text();
      let data; try{data=JSON.parse(text);}catch{data={raw:text};}
      if(!resp.ok||(data&&data.success===false)){ throw new Error((data&&(data.message||data.error))||("HTTP "+resp.status)); }
      // успех: только ресет (модалка откроется слушателем reset)
      form.reset(); ensurePrefix();
    }catch(err){
      console.error(err);
      // без alert
    }
  });
})();

/* inline script 45 */
/* Показ/скрытие модалки; открываем по reset формы (успех) */
(function(){
  const dlg = document.getElementById('calcxmobok');
  if(!dlg) return;

  function openCalcxMobOk(){
    dlg.hidden = false;
    setTimeout(()=> dlg.querySelector('.calcxmobok__mainbtn')?.focus(), 0);
  }
  function closeCalcxMobOk(){ dlg.hidden = true; }

  dlg.addEventListener('click', (e)=>{
    if(e.target.matches('[data-calcxmobok-close], .calcxmobok__backdrop')) closeCalcxMobOk();
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && !dlg.hidden) closeCalcxMobOk();
  });

  document.addEventListener('DOMContentLoaded', ()=>{
    const form = document.getElementById('calcxMobForm');
    if(form){
      form.addEventListener('reset', openCalcxMobOk);
    }
  });
})();

/* inline script 46 */
// Плавное поочерёдное появление на мобильной версии
  (function(){
    const items = document.querySelectorAll('.statsx-mob__item');
    if(!('IntersectionObserver' in window)){
      items.forEach((el,i)=>setTimeout(()=>el.classList.add('visible'),i*600));
      return;
    }

    const io = new IntersectionObserver((entries,obs)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const all = Array.from(entry.target.parentNode.querySelectorAll('.statsx-mob__item'));
          all.forEach((el,i)=>{
            setTimeout(()=>el.classList.add('visible'),i*600);
          });
          obs.disconnect();
        }
      });
    },{threshold:0.3});

    io.observe(items[0]);
  })();

/* inline script 47 */
document.querySelectorAll('.exps-mob__card[data-bg]').forEach(el=>{
    const u = el.getAttribute('data-bg');
    if(u) el.style.setProperty('--exps-mob-bg', `url('${u}')`);
  });

/* inline script 48 */
(function(){
  const root = document.querySelector('.exps-mob__footer');
  const logo = document.querySelector('.exps-mob__logo--gray');
  if(!root || !logo) return;

  const SPEED = -0.50;
  const OFFSET_Y = 24;

  function getScroller(el){
    let n = el && el.parentElement, html = document.documentElement;
    while(n && n !== html){
      const st = getComputedStyle(n);
      if (/(auto|scroll)/.test(st.overflowY)) return n;
      n = n.parentElement;
    }
    return window;
  }
  const scroller = getScroller(root);

  let sectionStart = 0;
  function updateSectionStart(){
    const r = root.getBoundingClientRect();
    if (scroller === window){
      const scTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      sectionStart = r.top + scTop;
    } else {
      const scR = scroller.getBoundingClientRect();
      sectionStart = (r.top - scR.top) + scroller.scrollTop;
    }
  }

  function getScrollTop(){
    return scroller === window
      ? (window.pageYOffset || document.documentElement.scrollTop || 0)
      : scroller.scrollTop;
  }

  function apply(){
    const shift = (getScrollTop() - sectionStart) * SPEED + OFFSET_Y;
    logo.style.transform = `translate3d(0, ${shift}px, 0)`;
  }

  const onScroll = () => apply();
  const onResize = () => { updateSectionStart(); apply(); };

  if (scroller === window){
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onResize);
  } else {
    scroller.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onResize);
  }

  let last = NaN;
  (function tick(){
    const shift = (getScrollTop() - sectionStart) * SPEED + OFFSET_Y;
    if (shift !== last){
      logo.style.transform = `translate3d(0, ${shift}px, 0)`;
      last = shift;
    }
    requestAnimationFrame(tick);
  })();

  const ro = new ResizeObserver(onResize);
  ro.observe(root);

  updateSectionStart();
  apply();
})();

/* inline script 49 */
/* AXM-M: открыть форму по «Подробнее...» и «Оставить заявку», отключить ссылки, отправка через Web3Forms, показ успеха */
(function(){
  const section = document.querySelector('.exps-mob');
  if(!section) return;

  const axmRoot = document.getElementById('axmM-root');
  const serviceModal = axmRoot.querySelector('#axmMServiceModal');
  const successModal = axmRoot.querySelector('#axmMSuccess');
  const closeService = axmRoot.querySelector('.axmM__close');
  const closeSuccess = axmRoot.querySelector('.axmM-success__close');

  const form = axmRoot.querySelector('#axmMForm');
  const statusEl = axmRoot.querySelector('#axmMStatus');
  const serviceField = axmRoot.querySelector('#axmMServiceField');

  function openServiceModal(serviceName){
    if(serviceField) serviceField.value = (serviceName||'').replace(/\s+/g,' ').trim();
    serviceModal.setAttribute('open','');
  }
  function closeModal(m){ if(m) m.removeAttribute('open'); }

  // Подробнее... — убиваем реальные href, только модалка
  // Только те кнопки, у которых href="#", открывают модалку.
// У кого нормальная ссылка — работаем как редирект.
section.querySelectorAll('.exps-mob__card .exps-mob__card-btn').forEach(btn=>{
  const url = btn.getAttribute('href');

  // Если есть реальный URL → даём редирект, модалка НЕ открывается
  if (url && url !== '#' && !url.endsWith('.png')) return;

  // Остальные кнопки открывают модалку
  btn.setAttribute('href', '#');
  btn.addEventListener('click', e=>{
    e.preventDefault();
    const card = btn.closest('.exps-mob__card');
    const titleEl = card ? card.querySelector('.exps-mob__card-title') : null;
    const serviceName = titleEl ? titleEl.textContent : '';
    openServiceModal(serviceName);
  });
});


  // Оставить заявку — тоже только модалка
  const ctaBtn = section.querySelector('.exps-mob__btn');
  if (ctaBtn) {
    ctaBtn.setAttribute('href', '#');
    ctaBtn.addEventListener('click', e => {
      e.preventDefault();
      const secTitle = section.querySelector('.exps-mob__title')?.textContent?.trim() || '';
      const label = secTitle ? `Оставить заявку — ${secTitle}` : 'Оставить заявку';
      openServiceModal(label);
    });
  }

  if(closeService) closeService.addEventListener('click',()=>closeModal(serviceModal));
  if(closeSuccess) closeSuccess.addEventListener('click',()=>closeModal(successModal));

  serviceModal.addEventListener('click',e=>{ if(e.target===serviceModal) closeModal(serviceModal); });
  successModal.addEventListener('click',e=>{ if(e.target===successModal) closeModal(successModal); });

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      closeModal(serviceModal);
      closeModal(successModal);
    }
  });

  const emailOK=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v||'').trim());
  const cleanTel=v=>(v||'').replace(/[^\d+]/g,'');
  const API='https://api.web3forms.com/submit';

  form.addEventListener('submit', async e=>{
    e.preventDefault();
    statusEl.textContent='';
    statusEl.className='axmM__status';

    const phone = cleanTel(form.elements['Телефон'].value);
    const email = (form.elements['email']?.value||'').trim();

    if(!phone || phone.length<6){
      statusEl.textContent='Укажите корректный телефон.';
      statusEl.classList.add('axmM__status--err');
      return;
    }
    if(email && !emailOK(email)){
      statusEl.textContent='Проверьте адрес электронной почты.';
      statusEl.classList.add('axmM__status--err');
      return;
    }

    statusEl.textContent='Отправка...';

    try{
      const fd=new FormData(form);
      const res=await fetch(API,{method:'POST',body:fd,headers:{Accept:'application/json'}});
      let json={}; try{ json=await res.json(); }catch(_){}
      if(res.ok && json.success){
        form.reset();
        closeModal(serviceModal);
        successModal.setAttribute('open','');
      }else{
        statusEl.textContent=(json.message||'Ошибка при отправке. Попробуйте позже.');
        statusEl.classList.add('axmM__status--err');
      }
    }catch(err){
      console.error(err);
      statusEl.textContent='Ошибка сети. Попробуйте позже.';
      statusEl.classList.add('axmM__status--err');
    }
  });
})();

/* inline script 50 */
(function () {
    const rows = document.querySelectorAll(".stpM .stpM__row");

    function setLabel(row) {
      const open = row.getAttribute("aria-expanded") === "true";
      const btn = row.querySelector(".stpM__btn");
      if (btn) btn.setAttribute("aria-label", open ? "Скрыть описание" : "Показать описание");
    }

    function expand(row) {
      const body = row.querySelector(".stpM__body");
      // измеряем фактическую высоту
      body.style.maxHeight = "none";
      const h = body.scrollHeight;
      // для плавности: из 0 к нужной высоте
      body.style.maxHeight = "0px";
      requestAnimationFrame(() => (body.style.maxHeight = h + "px"));
    }

    function collapse(row) {
      const body = row.querySelector(".stpM__body");
      // фиксируем текущую высоту и уходим к 0
      body.style.maxHeight = body.scrollHeight + "px";
      requestAnimationFrame(() => (body.style.maxHeight = "0px"));
    }

    function toggle(row) {
      const open = row.getAttribute("aria-expanded") === "true";
      row.setAttribute("aria-expanded", open ? "false" : "true");
      setLabel(row);
      if (open) {
        collapse(row);
      } else {
        expand(row);
      }
    }

    // Пересчёт высот открытых пунктов при ресайзе окна
    function recalcOpen() {
      document.querySelectorAll(".stpM__row[aria-expanded='true'] .stpM__body").forEach((body) => {
        body.style.maxHeight = "none";
        const h = body.scrollHeight;
        body.style.maxHeight = h + "px";
      });
    }
    window.addEventListener("resize", recalcOpen);

    // Авто-пересчёт при изменении контента (переносы, картинки и т.п.)
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const body = entry.target;
        const row = body.closest(".stpM__row");
        if (row && row.getAttribute("aria-expanded") === "true") {
          body.style.maxHeight = "none";
          const h = body.scrollHeight;
          body.style.maxHeight = h + "px";
        }
      }
    });

    rows.forEach((row) => {
      setLabel(row);

      const btn = row.querySelector(".stpM__btn");
      if (btn) {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          toggle(row);
        });
      }

      row.addEventListener("click", (e) => {
        if (e.target.closest("a,button")) return;
        toggle(row);
      });

      row.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle(row);
        }
      });

      const body = row.querySelector(".stpM__body");
      // если пункт открыт по умолчанию — установить корректную высоту
      if (row.getAttribute("aria-expanded") === "true") {
        body.style.maxHeight = body.scrollHeight + "px";
      }
      // следим за изменениями содержимого
      ro.observe(body);
    });
  })();

/* inline script 51 */
/* === Web3Forms — отправка без alert, модалка на успех === */
  (function(){
    const CBM_ENDPOINT = "\x68\x74\x74\x70\x73\x3a\x2f\x2f\x61\x70\x69\x2e\x77\x65\x62\x33\x66\x6f\x72\x6d\x73\x2e\x63\x6f\x6d\x2f\x73\x75\x62\x6d\x69\x74";
    const CBM_ACCESS_KEY = "\x34\x63\x65\x30\x61\x61\x64\x31\x2d\x63\x32\x37\x61\x2d\x34\x31\x65\x39\x2d\x61\x34\x33\x36\x2d\x32\x66\x63\x39\x64\x33\x31\x66\x62\x38\x66\x37";

    function ready(fn){ document.readyState==="loading" ? document.addEventListener("DOMContentLoaded",fn,{once:true}) : fn(); }

    ready(function(){
      const form  = document.getElementById('cbMForm');
      if(!form) return;

      const phone = document.getElementById('cbM-phone');
      const email = document.getElementById('cbM-email');
      const time  = document.getElementById('cbM-time');

      // маска +7##########
      const ensurePrefix = ()=>{ if(!phone.value.startsWith('+7')) phone.value = '+7'; };
      ensurePrefix();
      phone.addEventListener('focus', ensurePrefix);
      phone.addEventListener('input', ()=> {
        let v = phone.value.replace(/[^\d+]/g,'');
        if(!v.startsWith('+7')) v = '+7' + v.replace(/\D/g,'');
        const digits = v.replace('+7','').replace(/\D/g,'').slice(0,10);
        phone.value = '+7' + digits;
      });

      form.addEventListener('submit', async function(e){
        e.preventDefault();

        [phone,email,time].forEach(el=>el.classList.remove('cbM--err'));

        let ok = true;
        if(!/^\+7\d{10}$/.test(phone.value.trim())){ phone.classList.add('cbM--err'); ok=false; }
        if(!/^[^@]+@[^@]+\.[a-z]{2,}$/i.test(email.value.trim())){ email.classList.add('cbM--err'); ok=false; }
        if(!time.value){ time.classList.add('cbM--err'); ok=false; }

        if(!ok){ return; } // без alert

        const fd = new FormData();
        fd.append("Телефон", phone.value.trim());
        fd.append("Email",   email.value.trim());
        fd.append("Время для звонка", time.value);
        fd.append("subject", "Заявка — обратный звонок (моб.)");
        fd.append("access_key", CBM_ACCESS_KEY);

        try{
          const res = await fetch(CBM_ENDPOINT, {
            method: "POST",
            headers: { "Accept": "application/json" },
            body: fd,
            credentials: "omit",
            cache: "no-store"
          });

          const text = await res.text();
          let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }

          if(!res.ok || (data && data.success === false)){
            throw new Error((data && (data.message || data.error)) || ("HTTP " + res.status));
          }

          // успех: только reset — модалка откроется слушателем reset
          this.reset();
          phone.value = '+7';
          if (typeof window.openCbMok === 'function') window.openCbMok();
        }catch(err){
          console.error(err);
          // без alert
        }
      });
    });
  })();

/* inline script 52 */
/* Изолированная логика модалки cbMok: открываем по reset формы */
  (function(){
    const box = document.getElementById('cbMok');
    if(!box) return;

    function openCbMok(){
      box.hidden = false;
      setTimeout(()=> box.querySelector('.cbMok__mainbtn')?.focus(), 0);
    }
    window.openCbMok = openCbMok;
    function closeCbMok(){ box.hidden = true; }

    box.addEventListener('click', (e)=>{
      if(e.target.matches('[data-cbmok-close], .cbMok__backdrop')) closeCbMok();
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape' && !box.hidden) closeCbMok();
    });

    const bindReset = ()=>{
      const form = document.getElementById('cbMForm');
      if(form){
        form.addEventListener('reset', openCbMok);
      }
    };
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', bindReset, { once: true })
      : bindReset();
  })();

/* inline script 53 */
(function(){
  const mq = window.matchMedia('(max-width:767px)');

  function init(){
    if(!mq.matches) return;
    document.querySelectorAll('.ptM2[data-ptm="1"] .ptM2__track').forEach(track=>{
      if(track.dataset.inited) return;
      track.dataset.inited = '1';

      const marquee = track.closest('.ptM2__marquee');
      const containerW = marquee.clientWidth;
      const seedHTML = track.innerHTML;

      const ghost = document.createElement('div');
      ghost.className = 'ptM2__track';
      ghost.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
      ghost.innerHTML = seedHTML;
      marquee.appendChild(ghost);
      const seedW = ghost.scrollWidth;
      marquee.removeChild(ghost);

      track.style.setProperty('--loop-w', seedW + 'px');
      track.insertAdjacentHTML('beforeend', seedHTML);

      while (track.scrollWidth < containerW + seedW){
        track.insertAdjacentHTML('beforeend', seedHTML);
      }
    });
  }

  window.addEventListener('load', init);
  mq.addEventListener ? mq.addEventListener('change', init) : mq.addListener(init);
})();

/* inline script 54 */
/* Параллакс для серого лого (.tmM__bg) — только transform, без изменения позиций */
(function(){
  const root = document.querySelector('.tmM__photoWrap');
  const logo = document.querySelector('.tmM__bg');
  if(!root || !logo) return;

  const SPEED = -0.50;
  const OFFSET_Y = 24;

  function getScroller(el){
    let n = el && el.parentElement, html = document.documentElement;
    while(n && n !== html){
      const st = getComputedStyle(n);
      if (/(auto|scroll)/.test(st.overflowY)) return n;
      n = n.parentElement;
    }
    return window;
  }
  const scroller = getScroller(root);

  let sectionStart = 0;
  function updateSectionStart(){
    const r = root.getBoundingClientRect();
    if (scroller === window){
      const scTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      sectionStart = r.top + scTop;
    } else {
      const scR = scroller.getBoundingClientRect();
      sectionStart = (r.top - scR.top) + scroller.scrollTop;
    }
  }

  function getScrollTop(){
    return scroller === window
      ? (window.pageYOffset || document.documentElement.scrollTop || 0)
      : scroller.scrollTop;
  }

  function apply(){
    const shift = (getScrollTop() - sectionStart) * SPEED + OFFSET_Y;
    logo.style.transform = `translate3d(0, ${shift}px, 0)`;
  }

  const onScroll = () => apply();
  const onResize = () => { updateSectionStart(); apply(); };

  if (scroller === window){
    window.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onResize);
  } else {
    scroller.addEventListener('scroll', onScroll, {passive:true});
    window.addEventListener('resize', onResize);
  }

  let last = NaN;
  (function tick(){
    const shift = (getScrollTop() - sectionStart) * SPEED + OFFSET_Y;
    if (shift !== last){
      logo.style.transform = `translate3d(0, ${shift}px, 0)`;
      last = shift;
    }
    requestAnimationFrame(tick);
  })();

  const ro = new ResizeObserver(onResize);
  ro.observe(root);

  updateSectionStart();
  apply();
})();

/* inline script 55 */
document.addEventListener('click', function (e) {
            const target = e.target.closest('a, button, [role="button"]');
            if (!target) return;

            const text = (target.textContent || '').trim().toLowerCase();

            if (text === 'контакты' || text.includes('контакты')) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                window.location.href = 'contacts.html';
                return;
            }

            if (
                text.includes('обработку персональных данных') ||
                text.includes('обработка персональных данных') ||
                text.includes('обработке персональных данных')
            ) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                window.location.href = 'privacy.html';
                return;
            }
        }, true);

/* inline script 56 */
const lazyloadRunObserver = () => {
					const lazyloadBackgrounds = document.querySelectorAll( `.e-con.e-parent:not(.e-lazyloaded)` );
					const lazyloadBackgroundObserver = new IntersectionObserver( ( entries ) => {
						entries.forEach( ( entry ) => {
							if ( entry.isIntersecting ) {
								let lazyloadBackground = entry.target;
								if( lazyloadBackground ) {
									lazyloadBackground.classList.add( 'e-lazyloaded' );
								}
								lazyloadBackgroundObserver.unobserve( entry.target );
							}
						});
					}, { rootMargin: '200px 0px 200px 0px' } );
					lazyloadBackgrounds.forEach( ( lazyloadBackground ) => {
						lazyloadBackgroundObserver.observe( lazyloadBackground );
					} );
				};
				const events = [
					'DOMContentLoaded',
					'elementor/lazyload/observe',
				];
				events.forEach( ( event ) => {
					document.addEventListener( event, lazyloadRunObserver );
				} );

/* inline script 57 */
/* <![CDATA[ */
document.addEventListener('DOMContentLoaded', function () {
  if (document.documentElement.classList.contains('block-editor-page')) return;
  if (typeof SmoothScroll === 'function') {
    SmoothScroll({
      animationTime: 800,
      stepSize: 50,
      accelerationDelta: 30,
      accelerationMax: 2,
      keyboardSupport: true,
      arrowScroll: 50,
      pulseAlgorithm: true,
      pulseScale: 4,
      pulseNormalize: 1,
      touchpadSupport: true
    });
  }
});
//# sourceURL=smoothscroll-js-after
/* ]]> */
