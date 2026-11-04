/* Platform page: view toggle, real-screen carousels, report draw-in */
(() => {
  const d = document;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];

  /* ---- view toggle ---- */
  const seg = $('.seg'), tabs = $$('.seg-btn');
  const show = (id) => {
    tabs.forEach(t => {
      const on = t.id === id;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      const p = d.getElementById(t.getAttribute('aria-controls'));
      p.hidden = !on;
      if (on) $$('.reveal', p).forEach(el => { requestAnimationFrame(() => el.classList.add('in')); });
    });
    seg.classList.toggle('reg', id === 'tab-reg');
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => show(t.id));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = tabs[(i + 1) % 2]; show(n.id); n.focus(); }
    });
  });
  if (location.hash === '#regional') show('tab-reg');

  /* ---- screen carousels ---- */
  $$('.carousel').forEach(car => {
    const track = $('.shots', car), imgs = $$('img', track), dots = $$('.sd', car);
    const cap = $('.cap-t', car), prev = $('.prev', car), next = $('.next', car);
    let cur = 0;
    const set = (n) => {
      cur = n;
      dots.forEach((x, i) => { x.classList.toggle('on', i === n); x.setAttribute('aria-current', i === n ? 'true' : 'false'); });
      if (cap) cap.textContent = imgs[n].dataset.cap || '';
      if (prev) prev.disabled = n === 0;
      if (next) next.disabled = n === imgs.length - 1;
    };
    const go = (n) => {
      n = Math.max(0, Math.min(imgs.length - 1, n));
      track.scrollTo({ left: n * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
      set(n);
    };
    let raf = 0;
    track.addEventListener('scroll', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = track.clientWidth || 1, n = Math.round(track.scrollLeft / w);
        if (n !== cur && n >= 0 && n < imgs.length) set(n);
      });
    }, { passive: true });
    dots.forEach((x, i) => x.addEventListener('click', () => go(i)));
    if (prev) prev.addEventListener('click', () => go(cur - 1));
    if (next) next.addEventListener('click', () => go(cur + 1));
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
    });
    addEventListener('resize', () => { track.scrollLeft = cur * track.clientWidth; });
    set(0);
  });

  /* ---- reports: draw in ---- */
  const turn = $('.turn');
  if (turn) {
    const N = 24;
    for (let i = 0; i < N; i++) turn.appendChild(d.createElement('i'));
    const tio = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return; tio.disconnect();
      const dots = $$('i', turn);
      dots.forEach((dot, i) => {
        if (reduce) { dot.className = i % 5 === 4 ? 'y' : 'g'; return; }
        setTimeout(() => dot.className = 'y', 300 + i * 70);
        if (i % 5 !== 4) setTimeout(() => dot.className = 'g', 900 + i * 70);
      });
    }), { threshold: 0.3 });
    tio.observe(turn);
  }
})();
