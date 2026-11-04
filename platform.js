/* Platform page: interactive mockups (sample data only) */
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

  /* ---- portfolio grid ---- */
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const named = ['Maple Grove Care', 'Cedar Ridge', 'Willow Bend', 'Pine Crest', 'Birch Meadow', 'Oak Hollow', 'Riverside Terrace', 'Sunset Commons'];
  // fixed pattern: 31 green, 12 yellow, 5 red
  const pattern = 'ggyggrggygrgggygyggyrggggggyggygggyrgggyggyyrggy'.split('');
  const regs = ['Regional 1', 'Regional 2', 'Regional 3', 'Regional 4'];
  const stTxt = { g: 'Green', y: 'Yellow', r: 'Red' };
  const grid = $('.fac-grid'), detail = $('.fac-detail');
  const facs = pattern.map((s, i) => {
    const name = i % 6 === 1 ? named[(i / 6 | 0) % named.length] : 'Sample Facility ' + letters[i % 26] + (i >= 26 ? '2' : '');
    return { s, name, reg: regs[i % 4], last: (i * 7) % 13 + 1, visits: s === 'r' ? 1 : 2 };
  });
  facs.forEach((f, i) => {
    const b = d.createElement('button');
    b.type = 'button'; b.className = 'fac ' + f.s; b.setAttribute('role', 'listitem');
    b.style.setProperty('--d', (reduce ? 0 : (i % 12) * 0.03 + (i / 12 | 0) * 0.06) + 's');
    b.setAttribute('aria-label', f.name + ', ' + stTxt[f.s]);
    b.addEventListener('click', () => pick(i, b));
    grid.appendChild(b);
  });
  const spark = s => {
    const pts = s === 'g' ? [22, 20, 18, 14, 10, 6] : s === 'y' ? [10, 12, 16, 14, 18, 16] : [6, 10, 14, 18, 22, 24];
    const c = s === 'g' ? 'var(--g)' : s === 'y' ? 'var(--y)' : 'var(--r)';
    const p = pts.map((y, i) => (i ? 'L' : 'M') + (i * 60) + ',' + y).join(' ');
    return `<svg viewBox="-4 0 308 30" preserveAspectRatio="none" aria-hidden="true"><path d="${p}" style="stroke:${c}"/></svg>`;
  };
  const pick = (i, b) => {
    const f = facs[i];
    $$('.fac.sel', grid).forEach(x => x.classList.remove('sel'));
    b.classList.add('sel');
    detail.innerHTML = `<div class="fd"><b>${f.name}</b><small>${f.reg} &middot; last visit ${f.last}d ago &middot; ${f.visits} of 2 visits this month</small><span class="st ${f.s}">${stTxt[f.s]}</span>${spark(f.s)}</div>`;
  };
  // filters
  $$('.chip').forEach(c => c.addEventListener('click', () => {
    $$('.chip').forEach(x => { x.classList.toggle('on', x === c); x.setAttribute('aria-pressed', x === c); });
    const f = c.dataset.f;
    $$('.fac', grid).forEach((b, i) => b.classList.toggle('dim', f !== 'all' && facs[i].s !== f));
  }));
  // auto-preview a red facility once the dashboard is in view
  const dash = $('.dash');
  const dio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; dio.disconnect();
    dash.classList.add('in');
    setTimeout(() => { const i = pattern.indexOf('r'); pick(i, $$('.fac', grid)[i]); }, reduce ? 0 : 1600);
  }), { threshold: 0.2 });
  dio.observe(dash);

  /* ---- phone app ---- */
  const scrs = $$('.scr'), flow = $$('.flow li');
  let cur = 0, typedDone = false;
  const typed = $('.typed');
  const type = () => {
    if (typedDone) return; typedDone = true;
    const t = typed.dataset.text;
    if (reduce) { typed.textContent = t; return; }
    let n = 0; const step = () => { typed.textContent = t.slice(0, ++n); if (n < t.length) setTimeout(step, 22); };
    setTimeout(step, 350);
  };
  const go = n => {
    n = +n; if (n === cur) return;
    scrs.forEach((s, i) => { s.classList.toggle('on', i === n); s.classList.toggle('out', i < n); });
    flow.forEach((f, i) => f.classList.toggle('on', i === n));
    cur = n;
    if (n === 1) type();
  };
  $$('[data-go]').forEach(el => el.addEventListener('click', () => go(el.dataset.go)));
  const single = (sel) => $$(sel).forEach(b => b.addEventListener('click', () => {
    $$(sel, b.parentElement).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
  }));
  single('.vt'); single('.hb');

  /* ---- reports: draw in ---- */
  const turn = $('.turn');
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
})();
