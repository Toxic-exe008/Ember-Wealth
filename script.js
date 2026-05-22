/* ═══════════════════════════════════════════════════════════════
   MERIDIAN WEALTH ADVISORY — script.js  ✦ PREMIUM EDITION
   Vanilla JS · No frameworks · No dependencies
   Arjun Mehta / Meridian Wealth Advisory personal brand site
   ═══════════════════════════════════════════════════════════════ */

'use strict';


/* ══════════════════════════════════════════════════════
   §0 — PAGE PRELOADER
   Branded entrance with animated bar, fades on load
══════════════════════════════════════════════════════ */
(function initPreloader() {
  const loader = document.getElementById('preloader');
  if (!loader) return;
  document.body.style.overflow = 'hidden';

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.style.transition = 'opacity 0.5s cubic-bezier(0.76,0,0.24,1), visibility 0.5s';
      loader.style.opacity    = '0';
      loader.style.visibility = 'hidden';
      document.body.style.overflow = '';
      setTimeout(() => {
        loader.remove();
        _triggerHeroEntrance();
      }, 520);
    }, 600);
  });
})();


/* ══════════════════════════════════════════════════════
   §1 — THEME SYSTEM
   Full-page circular ripple explosion + burst particles
   on every theme switch. LocalStorage persistence.
══════════════════════════════════════════════════════ */
const ThemeManager = (function () {
  const KEY        = 'meridian-theme';
  const DARK       = 'dark-theme';
  const body       = document.body;
  let   animating  = false;

  /* ── Helpers ── */
  function isDark() { return body.classList.contains(DARK); }

  function _setToggleLabel(dark) {
    const btn = document.getElementById('themeToggle');
    if (btn) btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  /* ── Explosion burst: N particles fly from origin ── */
  function _burst(ox, oy, toDark) {
    const css = document.createElement('style');
    css.textContent = `
      @keyframes mwBurst {
        0%   { transform:translate(-50%,-50%) scale(0); opacity:1; }
        70%  { opacity:0.6; }
        100% { transform:translate(-50%,-50%) scale(1); opacity:0; }
      }`;
    document.head.appendChild(css);

    const col = toDark ? 'rgba(201,169,110,' : 'rgba(197,148,58,';
    for (let i = 0; i < 10; i++) {
      const el  = document.createElement('div');
      const ang = (i / 10) * Math.PI * 2;
      const d   = 55 + Math.random() * 90;
      const sz  = 14 + Math.random() * 36;
      el.style.cssText = `
        position:fixed;
        left:${ox + Math.cos(ang) * d}px;
        top:${oy  + Math.sin(ang) * d}px;
        width:${sz}px; height:${sz}px;
        border-radius:50%;
        background:${col}${0.35 + Math.random() * 0.3});
        pointer-events:none; z-index:99992;
        animation: mwBurst 0.65s cubic-bezier(0.16,1,0.3,1) ${i * 38}ms forwards;
      `;
      document.body.appendChild(el);
      el.addEventListener('animationend', () => el.remove(), { once: true });
    }
  }

  /* ── Full-page radial ripple from toggle position ── */
  function _ripple(toDark, originEl) {
    animating = true;
    let ox = window.innerWidth / 2, oy = 80;
    if (originEl) {
      const r = originEl.getBoundingClientRect();
      ox = r.left + r.width  / 2;
      oy = r.top  + r.height / 2;
    }

    _burst(ox, oy, toDark);

    const maxR = Math.hypot(
      Math.max(ox, window.innerWidth  - ox),
      Math.max(oy, window.innerHeight - oy)
    ) * 1.08;

    const wave = document.createElement('div');
    wave.style.cssText = `
      position:fixed; left:${ox}px; top:${oy}px;
      width:0; height:0; border-radius:50%;
      transform:translate(-50%,-50%);
      background:${toDark ? '#141210' : '#F7F4EF'};
      z-index:99990; pointer-events:none;
      transition: width 0.72s cubic-bezier(0.76,0,0.24,1),
                  height 0.72s cubic-bezier(0.76,0,0.24,1);
    `;
    document.body.appendChild(wave);

    /* double rAF — forces repaint before CSS transition fires */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      wave.style.width  = maxR * 2 + 'px';
      wave.style.height = maxR * 2 + 'px';
    }));

    /* switch theme at midpoint so reveal feels simultaneous */
    setTimeout(() => {
      body.classList.toggle(DARK, toDark);
      _setToggleLabel(toDark);
      localStorage.setItem(KEY, toDark ? 'dark' : 'light');
    }, 360);

    /* fade wave out after it covers the screen */
    setTimeout(() => {
      wave.style.transition = 'opacity 0.5s ease';
      wave.style.opacity    = '0';
      setTimeout(() => { wave.remove(); animating = false; }, 520);
    }, 680);
  }

  /* ── Init: read saved preference ── */
  function init() {
    const stored   = localStorage.getItem(KEY);
    const prefDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark     = stored ? stored === 'dark' : prefDark;
    body.classList.toggle(DARK, dark);
    _setToggleLabel(dark);

    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', () => {
        if (animating) return;
        _ripple(!isDark(), btn);
      });
    }
  }

  return { init };
})();

ThemeManager.init();


/* ══════════════════════════════════════════════════════
   §2 — CUSTOM CURSOR
   Gold dot + lagging ring with lerp. Inflates on hover.
══════════════════════════════════════════════════════ */
(function initCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const css = document.createElement('style');
  css.textContent = `
    *, *::before, *::after { cursor: none !important; }
    #mw-dot {
      position:fixed; top:0; left:0; z-index:99997;
      width:6px; height:6px; border-radius:50%;
      background:var(--accent); pointer-events:none;
      transform:translate(-50%,-50%);
      transition:width .2s,height .2s,opacity .2s;
      will-change:left,top;
    }
    #mw-ring {
      position:fixed; top:0; left:0; z-index:99996;
      width:36px; height:36px; border-radius:50%;
      border:1.5px solid rgba(var(--accent-rgb),.5);
      pointer-events:none;
      transform:translate(-50%,-50%);
      will-change:left,top;
      transition:width .35s cubic-bezier(.16,1,.3,1),
                 height .35s cubic-bezier(.16,1,.3,1),
                 border-color .25s, background .25s;
    }
    #mw-ring.hovered {
      width:54px; height:54px;
      border-color:rgba(var(--accent-rgb),.85);
      background:rgba(var(--accent-rgb),.07);
    }
    #mw-dot.clicking  { width:3px; height:3px; }
    #mw-ring.clicking { width:44px; height:44px; opacity:.6; }
  `;
  document.head.appendChild(css);

  const dot  = Object.assign(document.createElement('div'), { id: 'mw-dot'  });
  const ring = Object.assign(document.createElement('div'), { id: 'mw-ring' });
  document.body.append(dot, ring);

  let mx = -300, my = -300, rx = -300, ry = -300;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
  }, { passive: true });

  (function lerpRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(lerpRing);
  })();

  const HOVER = 'a,button,label,input,select,textarea,.service-card,.feature-card,.testimonial-card,.faq__question,.timeline__item,.stat-card';
  document.addEventListener('mouseover', e => { if (e.target.closest(HOVER)) ring.classList.add('hovered'); });
  document.addEventListener('mouseout',  e => { if (e.target.closest(HOVER)) ring.classList.remove('hovered'); });
  document.addEventListener('mousedown', () => { dot.classList.add('clicking'); ring.classList.add('clicking'); });
  document.addEventListener('mouseup',   () => { dot.classList.remove('clicking'); ring.classList.remove('clicking'); });
})();


/* ══════════════════════════════════════════════════════
   §3 — SCROLL PROGRESS BAR
   Gold shimmer gradient line pinned at viewport top
══════════════════════════════════════════════════════ */
(function initProgressBar() {
  const css = document.createElement('style');
  css.textContent = `
    #mw-prog {
      position:fixed; top:0; left:0; z-index:99998;
      height:2px; width:0%;
      background:linear-gradient(90deg,var(--accent-dark),var(--accent),var(--accent-light),var(--accent),var(--accent-dark));
      background-size:200% 100%;
      box-shadow:0 0 10px rgba(var(--accent-rgb),.5);
      animation:mwProgShim 2.8s linear infinite;
      transition:width .08s linear;
    }
    @keyframes mwProgShim { 0%{background-position:0 0} 100%{background-position:200% 0} }
  `;
  document.head.appendChild(css);

  const bar = document.createElement('div');
  bar.id = 'mw-prog';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    bar.style.width = Math.min(pct * 100, 100) + '%';
  }, { passive: true });
})();


/* ══════════════════════════════════════════════════════
   §4 — NAVBAR: SCROLL HIDE/SHOW + ACTIVE LINK
══════════════════════════════════════════════════════ */
const navLinks = Array.from(document.querySelectorAll('.navbar__link'));
const sections = navLinks.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);

function _highlightNav() {
  const mid = window.scrollY + window.innerHeight * 0.42;
  let   cur = '';
  sections.forEach(s => { if (s.offsetTop <= mid) cur = s.id; });
  navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${cur}`));
}

(function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  /* inject hide-on-scroll-down CSS */
  const css = document.createElement('style');
  css.textContent = `
    #navbar { transition: transform .4s cubic-bezier(.23,1,.32,1),
                          background .3s ease, box-shadow .3s ease !important; }
    #navbar.nav-hidden { transform: translateY(-105%) !important; }
  `;
  document.head.appendChild(css);

  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 55);
    nav.classList.toggle('nav-hidden', y > 300 && y > lastY + 6);
    if (y < lastY || y < 300) nav.classList.remove('nav-hidden');
    lastY = y;
    _highlightNav();
  }, { passive: true });

  navLinks.forEach(l => l.addEventListener('click', () => {
    navLinks.forEach(n => n.classList.remove('is-active'));
    l.classList.add('is-active');
  }));
})();


/* ══════════════════════════════════════════════════════
   §5 — MOBILE HAMBURGER MENU
══════════════════════════════════════════════════════ */
(function initMobileMenu() {
  const ham     = document.getElementById('hamburger');
  const menu    = document.getElementById('mobileMenu');
  const overlay = document.getElementById('mobileOverlay');
  const mLinks  = document.querySelectorAll('.mobile-menu__link');
  if (!ham || !menu) return;

  function open()  {
    menu.classList.add('is-open'); overlay?.classList.add('is-open');
    ham.classList.add('is-open'); ham.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    menu.classList.remove('is-open'); overlay?.classList.remove('is-open');
    ham.classList.remove('is-open'); ham.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  ham.addEventListener('click', () => menu.classList.contains('is-open') ? close() : open());
  overlay?.addEventListener('click', close);
  mLinks.forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();


/* ══════════════════════════════════════════════════════
   §6 — HERO PARTICLE CANVAS
   55 gold dust motes that drift, fade, and scatter
   from the cursor. Disabled on mobile for perf.
══════════════════════════════════════════════════════ */
(function initParticles() {
  const hero = document.getElementById('home');
  if (!hero || window.matchMedia('(max-width: 767px)').matches) return;

  const canvas = document.createElement('canvas');
  Object.assign(canvas.style, {
    position:'absolute', inset:'0',
    width:'100%', height:'100%',
    pointerEvents:'none', zIndex:'1', opacity:'0.5',
  });
  hero.style.position = 'relative';
  hero.insertBefore(canvas, hero.firstChild);

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  let mx = -9999, my = -9999;

  function resize() {
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }
  resize();
  new ResizeObserver(resize).observe(hero);

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
  }, { passive: true });
  hero.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

  class Mote {
    constructor() { this.spawn(true); }
    spawn(init = false) {
      this.x   = Math.random() * W;
      this.y   = init ? Math.random() * H : H + 8;
      this.vx  = (Math.random() - 0.5) * 0.4;
      this.vy  = -(0.28 + Math.random() * 0.55);
      this.r   = 0.8 + Math.random() * 2;
      this.peak= 0.18 + Math.random() * 0.5;
      this.life = 0;
      this.max  = 110 + Math.random() * 210;
    }
    tick() {
      /* gentle cursor repulsion */
      const dx = this.x - mx, dy = this.y - my;
      const d  = Math.hypot(dx, dy);
      if (d < 130) {
        const f = (130 - d) / 130 * 0.45;
        this.vx += (dx / d) * f; this.vy += (dy / d) * f;
      }
      this.vx *= 0.968; this.vy *= 0.968;
      this.x  += this.vx; this.y  += this.vy; this.life++;
      const t  = this.life / this.max;
      this.a   = t < 0.2 ? (t / 0.2) * this.peak
               : t > 0.72 ? ((1 - t) / 0.28) * this.peak
               : this.peak;
    }
    draw() {
      const dark = document.body.classList.contains('dark-theme');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = dark
        ? `rgba(201,169,110,${this.a})`
        : `rgba(197,148,58,${this.a * 0.75})`;
      ctx.fill();
    }
  }

  const motes = Array.from({ length: 55 }, () => new Mote());

  (function frame() {
    ctx.clearRect(0, 0, W, H);
    motes.forEach(m => {
      m.tick(); m.draw();
      if (m.life >= m.max || m.y < -8) m.spawn();
    });
    requestAnimationFrame(frame);
  })();
})();


/* ══════════════════════════════════════════════════════
   §7 — MAGNETIC BUTTONS
   Elastic pull toward cursor on .magnetic-btn elements
══════════════════════════════════════════════════════ */
(function initMagnetic() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  document.querySelectorAll('.magnetic-btn').forEach(btn => {
    let raf, tx = 0, ty = 0, cx = 0, cy = 0;

    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'none';
      (function loop() {
        cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
        btn.style.transform = `translate(${cx}px,${cy}px) scale(1.045)`;
        raf = requestAnimationFrame(loop);
      })();
    });

    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      tx = (e.clientX - r.left - r.width  / 2) * 0.28;
      ty = (e.clientY - r.top  - r.height / 2) * 0.28;
    });

    btn.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      tx = 0; ty = 0;
      btn.style.transition = 'transform .55s cubic-bezier(.23,1,.32,1)';
      btn.style.transform  = 'translate(0,0) scale(1)';
    });
  });
})();


/* ══════════════════════════════════════════════════════
   §8 — SCROLL REVEAL SYSTEM
   IntersectionObserver — fade / slide / scale in.
   Hero elements handled separately by §24.
══════════════════════════════════════════════════════ */
(function initReveal() {
  const css = document.createElement('style');
  css.textContent = `
    .reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-fade, .reveal-scale {
      opacity:0; will-change:opacity,transform;
      transition:opacity .75s cubic-bezier(.23,1,.32,1),
                 transform .75s cubic-bezier(.23,1,.32,1);
    }
    .reveal       { transform:translateY(28px); }
    .reveal-up    { transform:translateY(38px); }
    .reveal-left  { transform:translateX(-46px); }
    .reveal-right { transform:translateX(46px); }
    .reveal-scale { transform:scale(0.94); }
    .reveal-fade  { transform:none; }
    .is-visible {
      opacity:1 !important;
      transform:translate(0,0) scale(1) !important;
    }
  `;
  document.head.appendChild(css);

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });

  /* Observe all reveal elements OUTSIDE the hero (hero is staggered separately) */
  document.querySelectorAll(
    '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-fade, .reveal-scale'
  ).forEach(el => {
    if (!el.closest('#home')) obs.observe(el);
  });
})();


/* ══════════════════════════════════════════════════════
   §9 — AUTO-ASSIGN REVEAL CLASSES + STAGGER
   Cards that lack a reveal class get one, with delay.
══════════════════════════════════════════════════════ */
(function autoReveal() {
  const REVEAL_CLASSES = ['reveal','reveal-up','reveal-left','reveal-right','reveal-fade','reveal-scale'];
  function hasReveal(el) { return REVEAL_CLASSES.some(c => el.classList.contains(c)); }

  const targets = [
    '.service-card', '.feature-card', '.timeline__item',
    '.stat-card', '.testimonial-card', '.faq__item',
    '.section__header', '.contact__info-item', '.contact__form-card',
    '.footer__brand', '.footer__nav', '.footer__contact',
    '.about__cards',
  ];

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-visible');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  targets.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (hasReveal(el) || el.closest('#home')) return;
      el.classList.add('reveal-up');
      /* stagger siblings in a shared parent */
      const siblings = Array.from(el.parentElement?.children ?? []);
      const idx      = siblings.indexOf(el);
      el.style.transitionDelay = (idx % 5) * 85 + 'ms';
      obs.observe(el);
    });
  });
})();


/* ══════════════════════════════════════════════════════
   §10 — ANIMATED STAT COUNTERS
   .counter elements with data-target animate on entry
══════════════════════════════════════════════════════ */
(function initCounters() {
  const items = document.querySelectorAll('.counter[data-target]');
  if (!items.length) return;

  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

  function count(el) {
    const target = parseFloat(el.dataset.target) || 0;
    const isFloat = String(target).includes('.');
    const dur   = 1700;
    const start = performance.now();

    (function step(now) {
      const t   = Math.min((now - start) / dur, 1);
      const val = easeOut(t) * target;
      el.textContent = isFloat ? val.toFixed(1) : Math.round(val);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = isFloat ? target.toFixed(1) : target;
    })(start);
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { count(e.target); obs.unobserve(e.target); }
    });
  }, { threshold: 0.55 });

  items.forEach(el => obs.observe(el));
})();


/* ══════════════════════════════════════════════════════
   §11 — 3D CARD TILT  (desktop only)
   Perspective tilt + dynamic shadow on service/feature cards
══════════════════════════════════════════════════════ */
(function initTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  document.querySelectorAll('.service-card, .feature-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width  - 0.5;   /* -0.5 → +0.5 */
      const ny = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transition = 'box-shadow .1s ease';
      card.style.transform  = `perspective(620px) rotateX(${ny * -9}deg) rotateY(${nx * 9}deg) translateY(-5px)`;
      card.style.boxShadow  = `${-nx * 18}px ${ny * -10 + 20}px 40px rgba(0,0,0,.18)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .55s cubic-bezier(.23,1,.32,1), box-shadow .55s ease';
      card.style.transform  = '';
      card.style.boxShadow  = '';
    });
  });
})();


/* ══════════════════════════════════════════════════════
   §12 — FAQ ACCORDION
   aria-controlled smooth height animation
══════════════════════════════════════════════════════ */
(function initFAQ() {
  const items = document.querySelectorAll('.faq__item');
  if (!items.length) return;

  /* prep each answer for height animation */
  items.forEach(item => {
    const ans = item.querySelector('.faq__answer');
    if (!ans) return;
    ans.hidden = false;                  /* remove HTML hidden so we control via CSS */
    ans.style.cssText = `
      overflow:hidden; max-height:0; opacity:0;
      transition: max-height .52s cubic-bezier(.23,1,.32,1),
                  opacity .38s ease;
    `;
  });

  items.forEach(item => {
    const btn = item.querySelector('.faq__question');
    const ans = item.querySelector('.faq__answer');
    const ico = item.querySelector('.faq__icon');
    if (!btn || !ans) return;

    btn.setAttribute('tabindex', '0');
    btn.setAttribute('role', 'button');

    function toggle(open) {
      item.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      ans.style.maxHeight = open ? ans.scrollHeight + 24 + 'px' : '0';
      ans.style.opacity   = open ? '1' : '0';
      if (ico) ico.style.transform = open ? 'rotate(45deg)' : 'rotate(0deg)';
      if (ico) ico.style.transition = 'transform .35s ease';

      if (open) {
        /* nudge into view if clipped */
        setTimeout(() => {
          const rect = item.getBoundingClientRect();
          if (rect.bottom > window.innerHeight - 24) {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 320);
      }
    }

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      /* close all */
      items.forEach(it => {
        if (it !== item) {
          const a = it.querySelector('.faq__answer');
          const b = it.querySelector('.faq__question');
          const ic= it.querySelector('.faq__icon');
          it.classList.remove('open');
          b?.setAttribute('aria-expanded', 'false');
          if (a) { a.style.maxHeight = '0'; a.style.opacity = '0'; }
          if (ic) { ic.style.transform = 'rotate(0deg)'; }
        }
      });
      toggle(!isOpen);
    });

    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });
})();


/* ══════════════════════════════════════════════════════
   §13 — TESTIMONIAL SLIDER
   Auto-cycle fade+slide on mobile. Touch-swipe support.
══════════════════════════════════════════════════════ */
(function initSlider() {
  const grid = document.querySelector('.testimonials__grid');
  if (!grid) return;

  /* Only activate slider on narrow viewports */
  if (!window.matchMedia('(max-width: 860px)').matches) return;

  const cards = Array.from(grid.querySelectorAll('.testimonial-card'));
  if (cards.length < 2) return;

  /* Build dot indicators */
  const dotsEl = document.createElement('div');
  dotsEl.style.cssText = 'display:flex;justify-content:center;gap:10px;margin-top:1.75rem;';
  grid.parentElement.appendChild(dotsEl);

  const dots = cards.map((_, i) => {
    const d = document.createElement('button');
    d.style.cssText = `
      width:8px; height:8px; border-radius:50%; border:none;
      background:rgba(var(--accent-rgb),.22); cursor:pointer;
      transition:background .3s,transform .3s;
      padding:0;
    `;
    d.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dotsEl.appendChild(d);
    return d;
  });

  let cur = 0;
  cards.forEach((c, i) => { if (i !== 0) c.style.display = 'none'; });
  dots[0].style.cssText += 'background:var(--accent);transform:scale(1.38);';

  function goTo(next) {
    if (next === cur) return;
    const prev = cur;
    cur = ((next % cards.length) + cards.length) % cards.length;

    cards[prev].style.cssText += 'transition:opacity .4s ease,transform .4s ease;opacity:0;transform:translateY(10px);';
    setTimeout(() => { cards[prev].style.display = 'none'; cards[prev].style.opacity = ''; cards[prev].style.transform = ''; }, 390);

    cards[cur].style.display = 'block';
    cards[cur].style.opacity = '0'; cards[cur].style.transform = 'translateY(-14px)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      cards[cur].style.cssText += 'transition:opacity .5s ease,transform .5s ease;opacity:1;transform:translateY(0);';
    }));

    dots.forEach((d, i) => {
      d.style.background = i === cur ? 'var(--accent)' : 'rgba(var(--accent-rgb),.22)';
      d.style.transform  = i === cur ? 'scale(1.38)' : 'scale(1)';
    });
  }

  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  let timer = setInterval(() => goTo(cur + 1), 5200);
  grid.addEventListener('mouseenter', () => clearInterval(timer));
  grid.addEventListener('mouseleave', () => { timer = setInterval(() => goTo(cur + 1), 5200); });

  /* Swipe */
  let sx = 0;
  grid.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  grid.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 48) goTo(dx < 0 ? cur + 1 : cur - 1);
  }, { passive: true });
})();


/* ══════════════════════════════════════════════════════
   §14 — CONTACT FORM VALIDATION
   Real-time field clearing, shake on error, fake send
══════════════════════════════════════════════════════ */
(function initForm() {
  const form    = document.getElementById('consultationForm');
  const submitBtn = document.getElementById('formSubmitBtn');
  const success   = document.getElementById('formSuccess');
  if (!form) return;

  /* inject form-specific CSS once */
  const css = document.createElement('style');
  css.textContent = `
    @keyframes mwShake {
      0%,100%{transform:translateX(0)}
      18%{transform:translateX(-7px)}
      36%{transform:translateX(7px)}
      54%{transform:translateX(-5px)}
      72%{transform:translateX(5px)}
    }
    .form__input.mw-err   { border-color:#e05757 !important; box-shadow:0 0 0 3px rgba(224,87,87,.15) !important; }
    .form__error          { color:#e05757; font-size:.78rem; margin-top:4px; display:none; }
    .form__error.mw-show  { display:block; }
    @keyframes mwSuccessIn {
      from { opacity:0; transform:translateY(10px); }
      to   { opacity:1; transform:translateY(0); }
    }
    .form__submit .form__submit-loading { display:none !important; }
    .form__submit.mw-sending .form__submit-text    { display:none !important; }
    .form__submit.mw-sending .form__submit-loading { display:inline-flex !important; align-items:center; gap:8px; }
    @keyframes mwSpin { to { transform:rotate(360deg); } }
    .form__submit.mw-sending .ph-spinner { animation:mwSpin .75s linear infinite; display:inline-block; }
  `;
  document.head.appendChild(css);

  function showErr(id, msg) {
    const field = document.getElementById(id);
    const group = field?.closest('.form__group');
    if (!field) return false;
    if (!field.value.trim()) {
      field.classList.add('mw-err');
      const err = group?.querySelector('.form__error');
      if (err) { err.textContent = msg; err.classList.add('mw-show'); }
      field.style.animation = 'mwShake .4s cubic-bezier(.36,.07,.19,.97)';
      field.addEventListener('animationend', () => field.style.animation = '', { once: true });
      return true; /* has error */
    }
    return false;
  }

  function clearErr(field) {
    field.classList.remove('mw-err');
    const err = field.closest('.form__group')?.querySelector('.form__error');
    if (err) err.classList.remove('mw-show');
  }

  function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function validatePhone(v) { return /^[\d\s\+\-\(\)]{7,16}$/.test(v); }

  form.querySelectorAll('.form__input').forEach(f => f.addEventListener('input', () => clearErr(f)));

  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;

    /* required text fields */
    ['fullName','userMessage'].forEach(id => { if (showErr(id, 'This field is required.')) ok = false; });

    /* email */
    const emailEl = document.getElementById('emailAddress');
    if (emailEl) {
      if (!emailEl.value.trim()) {
        emailEl.classList.add('mw-err');
        const err = emailEl.closest('.form__group')?.querySelector('.form__error');
        if (err) { err.textContent = 'This field is required.'; err.classList.add('mw-show'); }
        emailEl.style.animation = 'mwShake .4s cubic-bezier(.36,.07,.19,.97)';
        emailEl.addEventListener('animationend', () => emailEl.style.animation = '', { once: true });
        ok = false;
      } else if (!validateEmail(emailEl.value.trim())) {
        emailEl.classList.add('mw-err');
        const err = emailEl.closest('.form__group')?.querySelector('.form__error');
        if (err) { err.textContent = 'Enter a valid email address.'; err.classList.add('mw-show'); }
        ok = false;
      }
    }

    /* phone (optional but validate if filled) */
    const phoneEl = document.getElementById('phoneNumber');
    if (phoneEl && phoneEl.value.trim() && !validatePhone(phoneEl.value.trim())) {
      phoneEl.classList.add('mw-err');
      const err = phoneEl.closest('.form__group')?.querySelector('.form__error');
      if (err) { err.textContent = 'Enter a valid phone number.'; err.classList.add('mw-show'); }
      ok = false;
    }

    if (!ok) return;

    /* simulate send */
    submitBtn.classList.add('mw-sending');
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.classList.remove('mw-sending');
      submitBtn.disabled = false;
      form.reset();
      success.removeAttribute('hidden');
      success.style.animation = 'mwSuccessIn .5s ease forwards';
      success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => {
        success.style.transition = 'opacity .4s ease';
        success.style.opacity = '0';
        setTimeout(() => { success.setAttribute('hidden', ''); success.style.opacity = ''; }, 420);
      }, 7000);
    }, 1700);
  });
})();


/* ══════════════════════════════════════════════════════
   §15 — BACK TO TOP BUTTON
══════════════════════════════════════════════════════ */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  const css = document.createElement('style');
  css.textContent = `
    #backToTop { opacity:0; visibility:hidden; transform:translateY(18px);
      transition:opacity .35s ease, visibility .35s ease, transform .35s ease; }
    #backToTop.mw-show { opacity:1; visibility:visible; transform:translateY(0); }
    #backToTop:hover   { transform:translateY(-4px) !important; }
  `;
  document.head.appendChild(css);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('mw-show', window.scrollY > 480);
  }, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();


/* ══════════════════════════════════════════════════════
   §16 — SMOOTH ANCHOR SCROLL
   Offset for sticky navbar height + 8px breathing room
══════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const navH = document.getElementById('navbar')?.offsetHeight ?? 72;
    window.scrollTo({ top: target.offsetTop - navH - 8, behavior: 'smooth' });
  });
});


/* ══════════════════════════════════════════════════════
   §17 — BUTTON CLICK RIPPLE
   Water-drop ripple on every .btn click
══════════════════════════════════════════════════════ */
(function initBtnRipple() {
  const css = document.createElement('style');
  css.textContent = `
    .btn { position:relative; overflow:hidden; }
    .mw-btn-rip {
      position:absolute; border-radius:50%;
      background:rgba(255,255,255,.26);
      pointer-events:none; transform:scale(0);
      animation:mwBtnRip .58s linear forwards;
    }
    @keyframes mwBtnRip { to { transform:scale(4); opacity:0; } }
  `;
  document.head.appendChild(css);

  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const r   = btn.getBoundingClientRect();
    const sz  = Math.max(r.width, r.height);
    const rip = document.createElement('span');
    rip.className = 'mw-btn-rip';
    rip.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX-r.left-sz/2}px;top:${e.clientY-r.top-sz/2}px;`;
    btn.appendChild(rip);
    rip.addEventListener('animationend', () => rip.remove(), { once: true });
  });
})();


/* ══════════════════════════════════════════════════════
   §18 — CURSOR SPOTLIGHT ON STAT CARDS
   Radial gold gradient that tracks the mouse
══════════════════════════════════════════════════════ */
(function initSpotlight() {
  document.querySelectorAll('.stat-card').forEach(card => {
    card.style.position = 'relative';
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width ) * 100;
      const y = ((e.clientY - r.top ) / r.height) * 100;
      card.style.backgroundImage = `radial-gradient(circle at ${x}% ${y}%, rgba(var(--accent-rgb),.14) 0%, transparent 62%)`;
    });
    card.addEventListener('mouseleave', () => card.style.backgroundImage = '');
  });
})();


/* ══════════════════════════════════════════════════════
   §19 — TIMELINE STAGGERED REVEAL
   Alternating left/right slide-in with cascade delay
══════════════════════════════════════════════════════ */
(function initTimeline() {
  const items = document.querySelectorAll('.timeline__item');
  if (!items.length) return;

  const css = document.createElement('style');
  css.textContent = `
    .timeline__item {
      opacity:0;
      transition: opacity .65s ease, transform .65s cubic-bezier(.23,1,.32,1);
    }
    .timeline__item:nth-child(odd)  { transform:translateX(-28px); }
    .timeline__item:nth-child(even) { transform:translateX(28px);  }
    .timeline__item.is-visible         { opacity:1 !important; transform:translateX(0) !important; }
  `;
  document.head.appendChild(css);

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const idx = Array.from(items).indexOf(e.target);
      setTimeout(() => e.target.classList.add('is-visible'), idx * 110);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.14 });

  items.forEach(i => obs.observe(i));
})();


/* ══════════════════════════════════════════════════════
   §20 — HERO FLOATING CARDS ANIMATION
   Gentle perpetual float on .hero__float-card elements
══════════════════════════════════════════════════════ */
(function initHeroFloat() {
  const css = document.createElement('style');
  css.textContent = `
    @keyframes mwFloatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-13px)} }
    @keyframes mwFloatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-9px)} }
    .hero__float-card--top    { animation: mwFloatA 4.2s ease-in-out infinite; }
    .hero__float-card--bottom { animation: mwFloatB 3.6s ease-in-out 0.8s infinite; }
  `;
  document.head.appendChild(css);
})();


/* ══════════════════════════════════════════════════════
   §21 — SUBTLE HERO PARALLAX
   Visual column drifts slightly on scroll (desktop)
══════════════════════════════════════════════════════ */
(function initParallax() {
  if (window.matchMedia('(max-width: 767px)').matches) return;

  const visual = document.querySelector('.hero__visual');
  const accent = document.querySelector('.hero__bg-accent');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (visual) visual.style.transform = `translateY(${y * 0.07}px)`;
    if (accent) accent.style.transform = `translateY(${y * 0.13}px)`;
  }, { passive: true });
})();


/* ══════════════════════════════════════════════════════
   §22 — SECTION LABEL DECORATIVE LINES
   ::before/::after lines grow in when label scrolls in
══════════════════════════════════════════════════════ */
(function initLabelLines() {
  const css = document.createElement('style');
  css.textContent = `
    .section__label::before, .section__label::after {
      content:''; display:inline-block; vertical-align:middle;
      height:1px; width:0; background:currentColor; opacity:.42;
      margin:0 10px;
      transition: width .72s cubic-bezier(.16,1,.3,1);
    }
    .section__label.mw-lbl-in::before,
    .section__label.mw-lbl-in::after { width:26px; }
  `;
  document.head.appendChild(css);

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('mw-lbl-in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.65 });

  document.querySelectorAll('.section__label').forEach(el => obs.observe(el));
})();


/* ══════════════════════════════════════════════════════
   §23 — FILM GRAIN TEXTURE OVERLAY
   Static SVG noise tile — luxury analog feel.
   PERF: was animating a 200%×200% fixed div every 130ms
   (massive repaint on every frame). Now static + CSS-only
   transform — compositor-only, zero paint cost.
══════════════════════════════════════════════════════ */
(function initGrain() {
  /* Skip entirely on low-end / mobile devices */
  if (window.matchMedia('(max-width: 767px)').matches) return;

  const css = document.createElement('style');
  css.textContent = `
    #mw-grain {
      position:fixed; inset:0; z-index:99989;
      width:100%; height:100%;
      pointer-events:none; opacity:.022;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 256px 256px;
      will-change: transform;
      animation: mwGrain 8s steps(4) infinite;
    }
    @keyframes mwGrain {
      0%   { transform: translate(0,0); }
      25%  { transform: translate(-3px,-3px); }
      50%  { transform: translate(3px,0); }
      75%  { transform: translate(-3px,3px); }
      100% { transform: translate(0,0); }
    }
  `;
  document.head.appendChild(css);

  const grain = document.createElement('div');
  grain.id = 'mw-grain';
  document.body.appendChild(grain);
})();


/* ══════════════════════════════════════════════════════
   §24 — HERO ENTRANCE  (called after preloader fades)
   Staggered visible class with 130ms per element
══════════════════════════════════════════════════════ */
function _triggerHeroEntrance() {
  const heroEls = document.querySelectorAll(
    '#home .reveal-left, #home .reveal-right, #home .reveal-up, #home .reveal, #home .reveal-fade'
  );
  heroEls.forEach((el, i) => setTimeout(() => el.classList.add('is-visible'), 90 + i * 135));
  _highlightNav();
}


/* ══════════════════════════════════════════════════════
   §25 — MISC INIT (footer year, date input min)
══════════════════════════════════════════════════════ */
(function initMisc() {
  const yr = document.getElementById('currentYear');
  if (yr) yr.textContent = new Date().getFullYear();

  const dateIn = document.getElementById('preferredDate');
  if (dateIn) dateIn.setAttribute('min', new Date().toISOString().split('T')[0]);
})();


/* ══════════════════════════════════════════════════════
   §26 — SCROLL HINT FADE-OUT
   Gently hides the scroll indicator after first scroll
══════════════════════════════════════════════════════ */
(function initScrollHint() {
  const hint = document.querySelector('.hero__scroll-hint');
  if (!hint) return;
  hint.style.transition = 'opacity .5s ease';

  window.addEventListener('scroll', function onScroll() {
    if (window.scrollY > 60) {
      hint.style.opacity = '0';
      window.removeEventListener('scroll', onScroll);
    }
  }, { passive: true });
})();


/* ══════════════════════════════════════════════════════
   §27 — IMAGE HOVER LIFT + BRIGHTNESS
   Subtle zoom + warm tone on service/about images
══════════════════════════════════════════════════════ */
(function initImgHover() {
  const css = document.createElement('style');
  css.textContent = `
    .service-card__image, .about__img {
      transition: transform .55s cubic-bezier(.23,1,.32,1),
                  filter .4s ease;
    }
    .service-card:hover .service-card__image {
      transform: scale(1.06);
      filter: brightness(1.06) saturate(1.12);
    }
    .about__image-wrap:hover .about__img {
      transform: scale(1.025);
      filter: brightness(1.04);
    }
  `;
  document.head.appendChild(css);
})();


/* ══════════════════════════════════════════════════════
   §28 — DOM READY + LOAD GUARDS
══════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  _highlightNav();
});

window.addEventListener('load', () => {
  document.body.classList.add('mw-loaded');
  /* Fallback: if preloader was removed externally, still run hero entrance */
  if (!document.getElementById('preloader')) _triggerHeroEntrance();
});
