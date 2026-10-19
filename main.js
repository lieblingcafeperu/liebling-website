/* LIEBLING · main.js */
(() => {
  /* E-Mail-Adresse, an die Vorbestellungen gehen (per mailto). */
  const ORDER_EMAIL = 'lieblingcafeperu@gmail.com';

  document.documentElement.classList.replace('no-js', 'js');
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  /* ---------- Sprache ES / EN ---------- */
  const UI = {
    es: { added: 'Agregado al carrito', empty: 'Tu carrito está vacío.<br>Tu próximo Liebling te espera.', bag: 'Bolsa 250 g · Grano entero',
          go: 'Ir a la tienda', invalid: 'Por favor completa los campos marcados.',
          subject: 'Pre-pedido', mail: (o) => `Hola Liebling,

quiero hacer el siguiente pre-pedido:

Pedido: ${o.id}
Producto: ${o.items}
Total: ${o.total}

Nombre: ${o.nombre}
Correo: ${o.email}
Teléfono / WhatsApp: ${o.telefono}
Dirección: ${o.direccion}
Distrito / Ciudad: ${o.distrito}
Nota: ${o.nota}

Quedo atento/a a su confirmación para coordinar el pago y la entrega.

¡Gracias!
${o.nombre}` },
    en: { added: 'Added to cart', empty: 'Your cart is empty.<br>Your next Liebling is waiting.', bag: '250 g bag · Whole bean',
          go: 'Go to shop', invalid: 'Please fill in the highlighted fields.',
          subject: 'Pre-order', mail: (o) => `Hi Liebling,

I'd like to place the following pre-order:

Order: ${o.id}
Product: ${o.items}
Total: ${o.total}

Name: ${o.nombre}
Email: ${o.email}
Phone / WhatsApp: ${o.telefono}
Address: ${o.direccion}
District / City: ${o.distrito}
Note: ${o.nota}

Looking forward to your confirmation to arrange payment and delivery.

Thank you!
${o.nombre}` }
  };
  let lang = store.get('liebling-lang', 'es');
  const i18nEls = $$('[data-en]');
  i18nEls.forEach(el => { el.dataset.es = el.innerHTML; });

  function setLang(l) {
    lang = l;
    document.documentElement.lang = l;
    i18nEls.forEach(el => { el.innerHTML = l === 'en' ? el.dataset.en : el.dataset.es; });
    $$('.lang button').forEach(b => b.classList.toggle('active', b.dataset.lang === l));
    store.set('liebling-lang', l);
    renderCart();
    $$('.mark').forEach(m => { if (m.closest('.in')) m.classList.add('in'); });
  }
  $$('.lang button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));

  /* ---------- Header + Fortschritt ---------- */
  const nav = $('#nav'), bar = $('.progress');
  function onScrollUI() {
    const h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? h.scrollTop / max * 100 : 0) + '%';
    nav.classList.toggle('scrolled', scrollY > 24);
    document.body.classList.toggle('at-top', scrollY <= 24);
    placeMark();
  }

  /* ---------- Schrumpf-Wortmarke (Cinematic Clean) ----------
     Die Marke sitzt immer an der Header-Position; im großen Zustand
     wird sie per transform an die Unterkante der Bühne gezoomt. */
  const mark = $('#brandMark'), navLogo = $('.nav-logo'), RATIO = 876 / 359;
  function placeMark() {
    const small = innerWidth <= 600 ? 34 : 38;               // Logo-Höhe im Header
    const navH = innerWidth <= 600 ? 70 : 70;                 // Header-Höhe (scrolled)
    const dockW = small * RATIO, dockL = navLogo.getBoundingClientRect().left, dockT = (navH - small) / 2;
    mark.style.width = dockW + 'px'; mark.style.left = dockL + 'px'; mark.style.top = dockT + 'px';
    navLogo.style.width = dockW + 'px';
    const big = scrollY < innerHeight * 0.22 && !document.body.classList.contains('menu-open');
    mark.classList.toggle('big', big);
    if (big) {
      const w = Math.min(innerWidth * (innerWidth <= 600 ? 0.9 : 0.86), innerHeight * 0.44 * RATIO, 1240);
      const hgt = w / RATIO, left = (innerWidth - w) / 2, top = innerHeight - hgt - Math.max(22, innerHeight * 0.05);
      mark.style.transform = `translate3d(${left - dockL}px, ${top - dockT}px, 0) scale(${w / dockW})`;
    } else {
      mark.style.transform = 'none';
    }
  }

  /* ---------- Mobile-Menü ---------- */
  $('#burger').addEventListener('click', () => { document.body.classList.toggle('menu-open'); placeMark(); });
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => { document.body.classList.remove('menu-open'); placeMark(); }));

  /* ---------- Reveal (scroll-basiert, gestaffelt) ---------- */
  const groups = new Map();
  $$('.reveal').forEach(el => {
    const p = el.parentElement; const i = groups.get(p) || 0; groups.set(p, i + 1);
    if (i) el.style.transitionDelay = Math.min(i * 0.09, .45) + 's';
  });
  $$('.coffee-media .frame, .origin-banner').forEach(el => el.classList.add('reveal-img'));

  function countUp(el) {
    const m = el.textContent.match(/(\d+)(\D*)/); if (!m) return;
    const end = +m[1], suf = m[2] || '', steps = 38; let i = 0;
    const fmt = n => end >= 1000 ? n.toLocaleString('en-US') : n;
    const t = setInterval(() => { i++; el.textContent = fmt(Math.min(end, Math.round(end / steps * i))) + suf; if (i >= steps) clearInterval(t); }, 24);
  }

  function check() {
    const trigger = innerHeight * 0.88;
    $$('.reveal:not(.in), .reveal-img:not(.in)').forEach(el => {
      if (el.getBoundingClientRect().top < trigger) {
        el.classList.add('in');
        if (el.style.transitionDelay) setTimeout(() => { el.style.transitionDelay = ''; }, 1400);
        $$('.count', el).forEach(c => { if (!c.dataset.done) { c.dataset.done = 1; countUp(c); } });
      }
    });
    const hero = $('.hero'); if (!hero.classList.contains('in') && hero.getBoundingClientRect().top < innerHeight * 0.75) hero.classList.add('in');
    $$('.mark:not(.in)').forEach(el => { if (el.getBoundingClientRect().top < innerHeight * 0.8) el.classList.add('in'); });
  }

  /* ---------- Parallax ---------- */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const px = $$('.parallax');
  function parallax() {
    if (reduce) return;
    px.forEach(el => {
      const r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > innerHeight + 200) return;
      const d = (r.top + r.height / 2 - innerHeight / 2) * parseFloat(el.dataset.speed || 0);
      const rot = el.classList.contains('p1') ? 'rotate(3deg) ' : el.classList.contains('p2') ? 'rotate(-5deg) ' : '';
      el.style.transform = rot + `translate3d(0, ${d.toFixed(1)}px, 0)`;
    });
  }

  function onScroll() { onScrollUI(); check(); parallax(); }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });

  /* ---------- Flip-Karten (Touch / Tastatur) ---------- */
  $$('.flip').forEach(f => {
    f.addEventListener('click', () => f.classList.toggle('flipped'));
    f.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f.classList.toggle('flipped'); } });
  });

  /* ---------- Origin-Journey (Drag + Buttons) ---------- */
  const j = $('#journey'), jBar = $('#jBar');
  const stepW = () => ($('.step', j)?.offsetWidth || 340) + 20;
  $('#jPrev').addEventListener('click', () => j.scrollBy({ left: -stepW(), behavior: 'smooth' }));
  $('#jNext').addEventListener('click', () => j.scrollBy({ left: stepW(), behavior: 'smooth' }));
  function jProgress() {
    const max = j.scrollWidth - j.clientWidth;
    const vis = j.clientWidth / j.scrollWidth;
    jBar.style.width = (vis * 100) + '%';
    jBar.style.left = (max > 0 ? j.scrollLeft / max * (100 - vis * 100) : 0) + '%';
  }
  j.addEventListener('scroll', jProgress, { passive: true });
  let down = false, sx = 0, sl = 0, moved = false;
  j.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = j.scrollLeft; });
  addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; j.classList.add('drag'); } j.scrollLeft = sl - dx; });
  addEventListener('pointerup', () => { if (!down) return; down = false; j.classList.remove('drag'); });
  j.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

  /* ---------- Produkt-Ansichten ---------- */
  const views = $$('#views img'), thumbs = $$('#thumbs button');
  thumbs.forEach((t, i) => t.addEventListener('click', () => {
    views.forEach((v, k) => v.classList.toggle('active', k === i));
    thumbs.forEach((b, k) => b.classList.toggle('active', k === i));
  }));

  /* ---------- Guía: Tabs + Quiz ---------- */
  function showMethod(t, scroll) {
    $$('#tabList button').forEach(b => b.classList.toggle('active', b.dataset.t === t));
    $$('.panel').forEach(p => p.classList.toggle('active', p.dataset.p === t));
    $$('#quiz button').forEach(b => b.classList.toggle('active', b.dataset.t === t));
    const tb = $(`#tabList button[data-t="${t}"]`); tb && tb.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    if (scroll) { const p = $(`.panel[data-p="${t}"]`); const y = p.getBoundingClientRect().top + scrollY - 110; if (p.getBoundingClientRect().top > innerHeight * .6) scrollTo({ top: y, behavior: 'smooth' }); }
  }
  $$('#tabList button').forEach(b => b.addEventListener('click', () => showMethod(b.dataset.t)));
  $$('#quiz button').forEach(b => b.addEventListener('click', () => showMethod(b.dataset.t, true)));

  /* ---------- Warenkorb ---------- */
  const PRICE = 35;
  let cart = store.get('liebling-cart', 0);
  let qty = 1;
  const qtyVal = $('#qtyVal');
  $$('#qty button').forEach(b => b.addEventListener('click', () => { qty = Math.max(1, Math.min(20, qty + +b.dataset.d)); qtyVal.textContent = qty; }));

  const drawer = $('#drawer'), overlay = $('#overlay');
  const openCart = () => { $('#toast').classList.remove('show'); drawer.classList.add('open'); overlay.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); };
  const closeCart = () => {
    drawer.classList.remove('open'); overlay.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
    if (drawer.dataset.step === 'done') setTimeout(() => { drawer.dataset.step = 'cart'; }, 600);
  };
  $('#cartOpen').addEventListener('click', openCart);
  $('#cartClose').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  addEventListener('keydown', e => { if (e.key === 'Escape') { closeCart(); document.body.classList.remove('menu-open'); } });

  function renderCart() {
    const t = UI[lang];
    const cnt = $('#cartCount');
    cnt.textContent = cart; cnt.classList.toggle('show', cart > 0);
    $('#cartTotal').textContent = 'S/ ' + cart * PRICE;
    $('#checkout').disabled = !cart; $('#checkout').style.opacity = cart ? 1 : .45;
    const body = $('#cartBody');
    if (!cart) {
      body.innerHTML = `<div class="empty"><img src="assets/img/abuela.webp" alt=""><p>${t.empty}</p><a href="#tienda" class="link-arrow" id="goShop">${t.go} →</a></div>`;
      $('#goShop').addEventListener('click', closeCart);
      return;
    }
    body.innerHTML = `<div class="line-item"><img src="assets/img/bolsa.webp" alt=""><div><b>Liebling</b><small>${t.bag}</small>
      <div class="qty"><button type="button" data-d="-1">−</button><output>${cart}</output><button type="button" data-d="1">+</button></div></div>
      <b>S/ ${cart * PRICE}</b></div>`;
    $$('.qty button', body).forEach(b => b.addEventListener('click', () => { cart = Math.max(0, Math.min(50, cart + +b.dataset.d)); store.set('liebling-cart', cart); renderCart(); }));
  }

  let toastT;
  function toast(msg) { const el = $('#toast'); $('span', el).textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2600); }

  const addBtn = $('#addToCart');
  addBtn.addEventListener('click', () => {
    cart = Math.min(50, cart + qty); store.set('liebling-cart', cart); renderCart();
    const c = $('#cartCount'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    addBtn.classList.add('ok'); setTimeout(() => addBtn.classList.remove('ok'), 1200);
    toast(UI[lang].added + ' · ' + qty + ' × Liebling 250 g');
    qty = 1; qtyVal.textContent = 1;
  });
  /* ---------- Checkout: Bestellung per Mail (FormSubmit) ---------- */
  const form = $('#orderForm'), errEl = $('#formError'), submitBtn = $('#orderSubmit');
  const money = n => 'S/ ' + n;
  $('#checkout').addEventListener('click', () => {
    if (!cart) return;
    $('#orderMini').innerHTML = `<span>${cart} × Liebling 250 g · ${lang === 'en' ? 'Whole bean' : 'Grano entero'}</span><b>${money(cart * PRICE)}</b>`;
    $('#formTotal').textContent = money(cart * PRICE);
    errEl.textContent = '';
    drawer.dataset.step = 'form';
    setTimeout(() => $('#f-name').focus(), 450);
  });
  $('#checkoutBack').addEventListener('click', () => { drawer.dataset.step = 'cart'; });

  function orderId() {
    const d = new Date(), p = n => String(n).padStart(2, '0');
    return 'LB-' + String(d.getFullYear()).slice(2) + p(d.getMonth() + 1) + p(d.getDate()) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  }

  let lastMailto = '';
  form.addEventListener('submit', e => {
    e.preventDefault();
    const t = UI[lang];
    let ok = true;
    $$('input[required]', form).forEach(i => { const bad = !i.value.trim() || (i.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim())); i.classList.toggle('bad', bad); if (bad) ok = false; });
    if (!ok) { errEl.textContent = t.invalid; return; }
    if (form._honey.value) return;

    const f = Object.fromEntries(new FormData(form));
    const o = {
      id: orderId(), nombre: f.nombre.trim(), email: f.email.trim(), telefono: f.telefono.trim(),
      direccion: f.direccion.trim(), distrito: f.distrito.trim(), nota: f.nota.trim() || '—',
      items: `${cart} × Liebling 250 g (${lang === 'en' ? 'whole bean' : 'grano entero'}) · S/ ${PRICE} ${lang === 'en' ? 'each' : 'c/u'}`,
      total: money(cart * PRICE)
    };
    const subject = `${t.subject} ${o.id} · ${o.nombre} · ${o.total}`;
    lastMailto = `mailto:${ORDER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(t.mail(o))}`;
    $('#doneId').textContent = o.id;
    $('#mailAgain').href = lastMailto;
    errEl.textContent = '';
    window.location.href = lastMailto;
    drawer.dataset.step = 'done';
    cart = 0; store.set('liebling-cart', 0); renderCart(); form.reset();
  });
  $$('input', form).forEach(i => i.addEventListener('input', () => i.classList.remove('bad')));

  /* ---------- Start ---------- */
  if (lang !== 'es') setLang(lang); else renderCart();
  jProgress();
  // Erste Platzierung ohne Flug-Animation (z. B. beim Neuladen mitten auf der Seite)
  mark.style.transition = 'none';
  onScroll();
  requestAnimationFrame(() => requestAnimationFrame(() => { mark.style.transition = ''; }));
  addEventListener('load', onScroll);
  addEventListener('pageshow', onScroll);
})();
