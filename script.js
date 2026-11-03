(() => {
  const d = document, root = d.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  requestAnimationFrame(() => setTimeout(() => root.classList.add('loaded'), 60));

  /* reveals */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal').forEach((el, i) => {
    const sib = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains('reveal')) : [];
    const k = sib.indexOf(el);
    if (k > 0 && !reduce) el.style.transitionDelay = Math.min(k, 6) * 70 + 'ms';
    io.observe(el);
  });

  /* counters */
  const fmt = (n, f) => f === 'k' ? Math.round(n / 1000) + 'K' : String(Math.round(n));
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    $$('[data-count]', e.target).forEach(el => {
      const to = +el.dataset.count, f = el.dataset.format;
      if (reduce) { el.textContent = fmt(to, f); return; }
      const from = f === 'k' ? 0 : Math.max(0, Math.round(to * 0.15)), t0 = performance.now(), dur = 1800;
      const step = t => { const p = clamp((t - t0) / dur, 0, 1), ez = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(from + (to - from) * ez, f); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }), { threshold: 0.4 });
  $$('.stat-num').forEach(el => cio.observe(el));

  /* split words for scroll-scrub */
  const scrubs = $$('.scrub');
  scrubs.forEach(el => {
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = d.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(d.createTextNode(part));
          else { const s = d.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el); el._w = $$('.w', el);
  });

  /* pinned horizontal timeline */
  const pin = $('.pin'), sticky = $('.pin-sticky'), steps = $('.steps'), stepEls = $$('.step'), bar = $('.track-bar');
  let pinOn = false, pinStart = 0, pinLen = 0, travel = 0;
  const setupPin = () => {
    pinOn = !reduce && !!pin;
    root.classList.toggle('pin-on', pinOn);
    if (!pinOn) { pin && (pin.style.height = ''); return; }
    steps.style.setProperty('--tx', '0px');
    const wrap = $('.track-wrap').getBoundingClientRect();
    travel = Math.max(0, steps.scrollWidth - wrap.width);
    pin.style.height = (innerHeight + travel * 1.15) + 'px';
    pinStart = pin.getBoundingClientRect().top + scrollY;
    pinLen = pin.offsetHeight - innerHeight;
  };

  /* scroll loop */
  const prog = $('.progress span'), nav = $('.nav');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY, H = d.body.scrollHeight - innerHeight;
    prog && prog.style.setProperty('--p', H > 0 ? (y / H).toFixed(4) : 0);
    nav.classList.toggle('scrolled', y > 10);
    if (pinOn) {
      const p = pinLen > 0 ? clamp((y - pinStart) / pinLen, 0, 1) : 0;
      steps.style.setProperty('--tx', (-p * travel).toFixed(1) + 'px');
      bar.style.setProperty('--tp', p.toFixed(4));
      const lit = Math.round(p * (stepEls.length - 1));
      stepEls.forEach((s, i) => s.classList.toggle('lit', i === lit && y >= pinStart - innerHeight * 0.2));
    }
    scrubs.forEach(el => {
      const r = el.getBoundingClientRect();
      const p = reduce ? 1 : clamp((innerHeight * 0.88 - r.top) / (innerHeight * 0.55 + r.height * 0.5), 0, 1);
      const n = Math.round(p * el._w.length);
      el._w.forEach((w, i) => w.classList.toggle('on', i < n));
    });
    if (mobileTiles) {
      let best = null, bd = 1e9;
      tiles.forEach(t => { const r = t.getBoundingClientRect(), c = Math.abs(r.top + r.height / 2 - innerHeight * 0.5);
        if (c < bd && r.top < innerHeight * 0.8 && r.bottom > innerHeight * 0.2) { bd = c; best = t; } });
      tiles.forEach(t => t.classList.toggle('active', t === best || t === tapped));
    }
  };
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };

  /* challenge tiles: spotlight + tilt (pointer), focus-follow on touch */
  const tiles = $$('.tile');
  const mobileTiles = !fine;
  let tapped = null;
  tiles.forEach(t => {
    t.addEventListener('pointermove', e => {
      const r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      t.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); t.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      if (fine && !reduce) { t.style.setProperty('--ry', ((x - .5) * 8).toFixed(2) + 'deg'); t.style.setProperty('--rx', ((.5 - y) * 8).toFixed(2) + 'deg'); }
    });
    t.addEventListener('pointerleave', () => { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); });
    t.addEventListener('click', () => { tapped = tapped === t ? null : t; if (mobileTiles) req(); else tiles.forEach(o => o.classList.toggle('active', o === tapped)); });
  });

  /* magnetic */
  if (fine && !reduce) $$('.magnetic').forEach(m => {
    const inner = m.firstElementChild;
    m.addEventListener('pointermove', e => {
      const r = m.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      m.style.transform = `translate(${x * .28}px, ${y * .38}px)`; if (inner) inner.style.transform = `translate(${x * .12}px, ${y * .16}px)`;
    });
    m.addEventListener('pointerleave', () => { m.style.transition = 'transform .6s cubic-bezier(.34,1.56,.64,1)'; m.style.transform = ''; if (inner) inner.style.transform = '';
      setTimeout(() => m.style.transition = '', 600); });
  });

  /* cursor ring */
  const cur = $('.cursor');
  if (fine && !reduce && cur) {
    let cx = -100, cy = -100, tx = -100, ty = -100;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; cur.classList.add('on'); }, { passive: true });
    d.addEventListener('pointerleave', () => cur.classList.remove('on'));
    d.addEventListener('pointerover', e => cur.classList.toggle('big', !!e.target.closest('a,button,.tile,.services li')));
    const loop = () => { cx += (tx - cx) * .2; cy += (ty - cy) * .2; cur.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); };
    loop();
  }

  /* contact glow follows pointer/finger */
  const contact = $('.contact');
  const cMove = (x, y) => { const r = contact.getBoundingClientRect();
    contact.style.setProperty('--cx', (x - r.left) + 'px'); contact.style.setProperty('--cy', (y - r.top) + 'px'); };
  contact.addEventListener('pointermove', e => cMove(e.clientX, e.clientY));
  contact.addEventListener('touchmove', e => cMove(e.touches[0].clientX, e.touches[0].clientY), { passive: true });

  /* hero field: dot grid that bends toward the pointer / finger */
  const hero = $('.hero'), cv = $('.field'), glow = $('.hero-glow'), ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, dots = [], gap = 28, px = -1e4, py = -1e4, sx = 0, sy = 0, lastInput = -1e9, heroVisible = true, raf = 0;
  const dotRGB = () => getComputedStyle(root).getPropertyValue('--dot').trim() || '15,26,42';
  let rgb = dotRGB();
  const size = () => {
    const r = hero.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gap = W < 600 ? 24 : 30; dots = [];
    for (let y = gap / 2; y < H; y += gap) for (let x = gap / 2; x < W; x += gap) dots.push(x, y);
    if (!sx) { sx = W * .62; sy = H * .45; }
    rgb = dotRGB();
  };
  const toLocal = (x, y) => { const r = hero.getBoundingClientRect(); px = x - r.left; py = y - r.top; lastInput = performance.now(); };
  hero.addEventListener('pointermove', e => toLocal(e.clientX, e.clientY), { passive: true });
  hero.addEventListener('touchstart', e => toLocal(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  hero.addEventListener('touchmove', e => toLocal(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
  const draw = t => {
    const idle = t - lastInput > 2600;
    let gx = px, gy = py;
    if (idle) { const k = t / 1000; gx = W * (.55 + .3 * Math.sin(k * .45)); gy = H * (.48 + .26 * Math.sin(k * .7 + 1)); }
    sx += (gx - sx) * (idle ? .04 : .14); sy += (gy - sy) * (idle ? .04 : .14);
    ctx.clearRect(0, 0, W, H);
    const R = Math.max(150, Math.min(W, H) * .32), R2 = R * R, k = t / 1000;
    for (let i = 0; i < dots.length; i += 2) {
      let x = dots[i], y = dots[i + 1];
      const wave = reduce ? 0 : Math.sin(x * .012 + k * .9) * Math.cos(y * .014 + k * .7);
      const dx = x - sx, dy = y - sy, dd = dx * dx + dy * dy;
      let a = .17 + wave * .07, s = 1.2, gold = 0;
      if (dd < R2) {
        const dist = Math.sqrt(dd) || 1, f = 1 - dist / R, f2 = f * f;
        x += dx / dist * f2 * 22; y += dy / dist * f2 * 22;
        a = .17 + f * .7; s = 1.2 + f2 * 2.8; gold = f;
      }
      ctx.fillStyle = gold > .08 ? `rgba(${Math.round(150 + 76 * gold)},${Math.round(103 + 86 * gold)},${Math.round(29 + 95 * gold)},${a})` : `rgba(${rgb},${a})`;
      ctx.beginPath(); ctx.arc(x, y, s, 0, 6.283); ctx.fill();
    }
    glow.style.transform = `translate3d(${sx}px,${sy}px,0)`;
    if (!reduce && heroVisible) raf = requestAnimationFrame(draw);
  };
  new IntersectionObserver(es => { heroVisible = es[0].isIntersecting; if (heroVisible && !reduce) { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); } }).observe(hero);
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { rgb = dotRGB(); if (reduce) draw(0); });

  /* copy email */
  const btn = $('.copy'), status = $('.copy-status');
  btn && btn.addEventListener('click', async () => {
    const v = btn.dataset.copy;
    try { await navigator.clipboard.writeText(v); status.textContent = 'Copied ' + v; }
    catch { status.textContent = v; }
    setTimeout(() => status.textContent = '', 3000);
  });

  let rw = innerWidth;
  const onResize = () => { size(); setupPin(); onScroll(); if (reduce) draw(0); };
  addEventListener('resize', () => { if (innerWidth !== rw || fine) { rw = innerWidth; onResize(); } });
  addEventListener('scroll', req, { passive: true });
  addEventListener('load', onResize);
  d.fonts && d.fonts.ready.then(onResize);
  onResize();
})();
