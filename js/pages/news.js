function __allnrgReady(fn){ document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn, { once: true }) : fn(); }
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
        window.location.href='/'; /* редирект на главную */
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
(function() {
  document.addEventListener('DOMContentLoaded', function () {
    // Ищем ссылку "Контакты" только в верхнем меню
    const contactsLink = Array.from(document.querySelectorAll('.menubar__menu a'))
      .find(a => a.textContent.trim().toLowerCase() === 'контакты');

    if (!contactsLink) return;

    // Находим контейнер контактов / футера
    const footerContainer =
      document.querySelector('[data-id="646c680"]') ||
      document.querySelector('.elementor-element-646c680') ||
      document.querySelector('.allnrg-footer');

    if (!footerContainer) return;

    // Создаём якорь над футером (если ещё нет)
    if (!document.getElementById('footer-contacts-anchor')) {
      const anchor = document.createElement('div');
      anchor.id = 'footer-contacts-anchor';
      anchor.style.position = 'relative';
      anchor.style.top = '-1px';
      footerContainer.parentNode.insertBefore(anchor, footerContainer);
    }

    function getHeaderOffset() {
      const header = document.querySelector(
        '.elementor-location-header, header.site-header, header.sticky-header, header[data-elementor-type="header"]'
      );
      return header ? header.offsetHeight : 0;
    }

    // Клик по "Контакты" — только плавный скролл к футеру
    contactsLink.addEventListener('click', function(e) {
      e.preventDefault();

      const anchor = document.getElementById('footer-contacts-anchor') || footerContainer;
      const rect = anchor.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      const offset = getHeaderOffset();

      const targetY = rect.top + scrollTop - offset - 10;

      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    });
  });
})();

/* inline script 3 */
// Параллакс-эффект логотипа
  (function(){
    const logo = document.querySelector('.news__parallax');
    if(!logo) return;
    const speed = -0.5;
    window.addEventListener('scroll', () => {
      logo.style.transform = `translateY(${window.scrollY * speed}px)`;
    }, { passive:true });
  })();

  // Клик по карточке -> переход на Дзен-новость
  (function(){
    const card = document.querySelector('.news-card');
    if(!card) return;
    card.addEventListener('click', function(){
      window.open(
        'https://dzen.ru/a/aOlPi0LzGDeoaNdS?feed_exp=ordinary_feed&from=channel&integration=site_desktop&place=layout&secdata=CJi7%2Bv%2BcMyABUA9qAQGQAQA%3D&rid=3287074240.1693.1763042767919.42344&referrer_clid=1400&',
        '_blank'
      );
    });
  })();

/* inline script 4 */
(function(){
  // Web3Forms endpoint
  const ENDPOINT = "https://api.web3forms.com/submit";
  // ОРИГИНАЛ: 4ce0aad1-c27a-41e9-a436-2fc9d31fb8f7 (обфусцирован)
  const ACCESS_KEY = "\x34\x63\x65\x30\x61\x61\x64\x31\x2d\x63\x32\x37\x61\x2d\x34\x31\x65\x39\x2d\x61\x34\x33\x36\x2d\x32\x66\x63\x39\x64\x33\x31\x66\x62\x38\x66\x37";

  __allnrgReady(function () {
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
        openCbSuccess();

        form.reset();
        phone.value = "+7";
        if (typeof window.openCbSuccess === 'function') window.openCbSuccess();
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

/* inline script 5 */
(function(){
  const mq   = window.matchMedia('(min-width:768px) and (max-width:1024px)');
  const btn  = document.querySelector('.burger');
  const menu = document.getElementById('mnav');
  const FOOTER_SELECTOR = '.ftT';

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

  // Плавный скролл к футеру
  function scrollToContactsBlock(){
    const footer = document.querySelector(FOOTER_SELECTOR);
    if (!footer) return;

    const rect   = footer.getBoundingClientRect();
    const offset = window.pageYOffset + rect.top;

    window.scrollTo({
      top: offset,
      behavior: 'smooth'
    });
  }

  // Вешаем обработчик только на пункт "Контакты" в выпадающем меню
  function bindContactsLink(){
    if (!menu) return;
    const links = menu.querySelectorAll('a');

    links.forEach(link => {
      if (link.dataset.contactsBound) return;

      const text = (link.textContent || '').trim().toLowerCase();
      const href = (link.getAttribute('href') || '').toLowerCase();

      if (
        text === 'контакты' ||
        href.endsWith('/kontakty/') || href.endsWith('/kontakty') ||
        href === '#kontakty' ||
        href === '#contacts'
      ){
        link.addEventListener('click', function(e){
          e.preventDefault();
          closeMenu();
          scrollToContactsBlock();
        });
        link.dataset.contactsBound = '1';
      }
    });
  }

  function bind(){
    if (btn) btn.addEventListener('click', toggle);
    document.addEventListener('click', closeOnOutside);
    document.addEventListener('keydown', closeOnEsc);
    bindContactsLink();
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

/* inline script 6 */
// параллакс
  (function(){
    const logo = document.querySelector('.news-tblt__parallax');
    if(!logo) return;
    const speed = -0.5;
    window.addEventListener('scroll', ()=>{
      logo.style.transform = `translateY(${window.scrollY * speed}px)`;
    }, {passive:true});
  })();

  // клик по карточке
  (function(){
    const card = document.querySelector('.news-tblt-card');
    if(!card) return;
    card.addEventListener('click',()=>{
      window.open(
        'https://dzen.ru/a/aOlPi0LzGDeoaNdS',
        '_blank'
      );
    });
  })();

/* inline script 7 */
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

/* inline script 8 */
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

/* inline script 9 */
(function(){
  const mq = window.matchMedia('(max-width:767px)');
  const btn = document.querySelector('.mbarM__burger');
  const menu = document.getElementById('mnavM');
  const FOOTER_SELECTOR = '.ftM';

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
    if (e.key === 'Escape'){
      closeMenu();
    }
  }

  function scrollToContactsBlock(){
    const footer = document.querySelector(FOOTER_SELECTOR);
    if (!footer) return;

    const rect = footer.getBoundingClientRect();
    const offset = window.pageYOffset + rect.top;

    window.scrollTo({
      top: offset,
      behavior: 'smooth'
    });
  }

  function bindContactsLink(){
    if (!menu) return;
    const links = menu.querySelectorAll('a');

    links.forEach(link => {
      if (link.dataset.contactsBound) return;

      const text = (link.textContent || '').trim().toLowerCase();
      const href = (link.getAttribute('href') || '').toLowerCase();

      if (
        text === 'контакты' ||
        href.endsWith('/kontakty/') || href.endsWith('/kontakty') ||
        href === '#kontakty' ||
        href === '#contacts'
      ){
        link.addEventListener('click', function(e){
          e.preventDefault();
          closeMenu();
          scrollToContactsBlock();
        });
        link.dataset.contactsBound = '1';
      }
    });
  }

  function bind(){
    if (btn) btn.addEventListener('click', toggle);
    document.addEventListener('click', closeOnOutside);
    document.addEventListener('keydown', closeOnEsc);
    bindContactsLink();
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

/* inline script 10 */
// параллакс
  (function(){
    const logo = document.querySelector('.news-mbl__parallax');
    if(!logo) return;
    const speed = -0.4;
    window.addEventListener('scroll', ()=>{
      logo.style.transform = `translateY(${window.scrollY * speed}px)`;
    }, {passive:true});
  })();

  // клик по карточке
  (function(){
    const card = document.querySelector('.news-mbl-card');
    if(!card) return;
    card.addEventListener('click',()=>{
      window.open(
        'https://dzen.ru/a/aOlPi0LzGDeoaNdS',
        '_blank'
      );
    });
  })();

/* inline script 11 */
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

/* inline script 12 */
/* Изолированная логика модалки cbMok: открываем по reset формы */
  (function(){
    const box = document.getElementById('cbMok');
    if(!box) return;

    function openCbMok(){
      box.hidden = false;
      setTimeout(()=> box.querySelector('.cbMok__mainbtn')?.focus(), 0);
    }
    function closeCbMok(){ box.hidden = true; }

    box.addEventListener('click', (e)=>{
      if(e.target.matches('[data-cbmok-close], .cbMok__backdrop')) closeCbMok();
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape' && !box.hidden) closeCbMok();
    });

    __allnrgReady(()=>{
      const form = document.getElementById('cbMForm');
      if(form){
        form.addEventListener('reset', openCbMok);
      }
    });
  })();

/* inline script 13 */
document.addEventListener('click', function (e) {
            const target = e.target.closest('a, button, [role="button"]');
            if (!target) return;

            const text = (target.textContent || '').trim().toLowerCase();

            if (text === 'контакты' || text.includes('контакты')) {
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                window.location.href = '/kontakty/';
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
                window.location.href = '/privacy/';
                return;
            }
        }, true);

/* inline script 14 */
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

/* inline script 15 */
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

/* inline script 16 */
(function () {
        function initFab() {
            var fab = document.querySelector('.messenger-fab');
            if (!fab) return;

            if (fab.parentElement !== document.body) {
                document.body.appendChild(fab);
            }

            var toggle = fab.querySelector('.messenger-fab__toggle');

            if (toggle && !toggle.__fabBound) {
                toggle.addEventListener('click', function () {
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

    (function () {
        var fab = null;

        function qs(sel) {
            return document.querySelector(sel);
        }

        function applyFabState(open) {
            if (!fab) return;

            fab.classList.remove('open');
            fab.style.setProperty('z-index', open ? '9000' : '2147483647', 'important');
            fab.style.pointerEvents = open ? 'none' : 'auto';
            fab.style.filter = open ? 'opacity(.35) blur(.5px)' : '';

            var menu = fab.querySelector('.messenger-fab__menu');

            if (menu) {
                menu.style.opacity = open ? '0' : '';
                menu.style.pointerEvents = open ? 'none' : '';
                menu.style.transform = open ? 'translateX(-50%) translateY(10px)' : '';
            }
        }

        function watchModal(id) {
            var el = document.getElementById(id);
            if (!el) return;

            applyFabState(el.hasAttribute('open'));

            var mo = new MutationObserver(function (list) {
                for (var i = 0; i < list.length; i++) {
                    var m = list[i];

                    if (m.type === 'attributes' && m.attributeName === 'open') {
                        applyFabState(el.hasAttribute('open'));
                    }
                }
            });

            mo.observe(el, { attributes: true, attributeFilter: ['open'] });
        }

        function init() {
            fab = qs('.messenger-fab');
            if (!fab) return;

            watchModal('mccm-root');
            watchModal('ccm-root');
            watchModal('tccm-root');
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init, { once: true });
        } else {
            init();
        }
    })();