/* Wobbin's Line — boot, layout and motion. Load order: libraries + engine + stories (with real
   progress on the preloader line), then build the page, start the scenes, then choreograph. */
(function () {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  root.classList.add('js'); if (reduced) root.classList.add('reduced');
  const WL = window.WL = window.WL || {};
  WL.pointer = { x: innerWidth / 2, y: innerHeight / 2 };
  addEventListener('pointermove', e => { WL.pointer.x = e.clientX; WL.pointer.y = e.clientY; }, { passive: true });

  const VERSION = 30;   // bump with the ?v= in index.html when site files change
  const STORY_IDS = WL_EPISODES.map(e => e.id);
  const SCRIPTS = [
    'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js',
    'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js',
    'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js',
    'https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js',
    ...['shorts/sfx.js', 'shorts/engine2.js', 'shorts/sketch.js', ...STORY_IDS.map(id => `shorts/stories/${id}.js`), 'js/scenes.js', 'js/player.js'].map(f => f + '?v=' + VERSION),
  ];

  // ---------- preloader: an ink line that draws with real progress ----------
  const pre = document.querySelector('.preloader'), preLine = pre.querySelector('path'), prePct = pre.querySelector('.preloader__pct');
  preLine.setAttribute('pathLength', '1');
  let done = 0; const total = SCRIPTS.length + 1, t0 = performance.now();
  const progress = () => { const p = done / total; preLine.style.strokeDashoffset = String(1 - p); prePct.textContent = Math.round(p * 100) + '%'; prePct.style.left = (p * 100) + '%'; };
  const load = src => new Promise(res => {
    const s = document.createElement('script'); s.src = src; s.async = false;   // download in parallel, run in order
    s.onload = () => { done++; progress(); res(true); }; s.onerror = () => { done++; progress(); console.warn('failed to load', src); res(false); };
    document.head.appendChild(s);
  });
  Promise.all([...SCRIPTS.map(load), document.fonts.ready.then(() => { done++; progress(); })]).then(() => {
    const wait = reduced ? 0 : Math.max(0, 700 - (performance.now() - t0));
    setTimeout(start, wait);
  });

  function start() {
    const libs = { gsap: !!window.gsap, ScrollTrigger: !!window.ScrollTrigger, SplitText: !!window.SplitText, Lenis: !!window.Lenis, engine: !!window.Shorts, stories: Object.keys(window.WL_STORIES || {}).length };
    WL.libs = libs; console.log('[Wobbin\'s Line] loaded', libs);
    const G = libs.gsap;
    if (G) gsap.registerPlugin(...[window.ScrollTrigger, window.SplitText].filter(Boolean));

    buildSeasons(); buildCast(); buildProps(); drawUnderlines();

    // ---------- scenes ----------
    // the one line: hero stage at the top, walking band below (same canvas, same Wobbin),
    // and the block wordmark standing on it
    const heroEl = document.querySelector('.hero');
    const band = WL.bandScene(document.querySelector('.band'));
    const mark = WL.markScene(document.querySelector('.hero__mark'), band, heroEl);
    WL.markScene(document.querySelector('.foot__mark canvas'), band, document.querySelector('.foot'), { foot: true });
    const meet = WL.meetScene(document.querySelector('.meet__canvas'));
    const cast = WL.castScene([...document.querySelectorAll('.cast__face canvas')]);
    [band, meet].forEach(s => { s.running = !reduced; s.draw(); });
    cast.running = !reduced;
    heroEl.addEventListener('click', e => { if (!e.target.closest('a, button')) band.hop(); });
    document.querySelector('.meet__stage').addEventListener('click', () => meet.hop());
    watchVisible(document.querySelector('.meet'), v => meet.visible = v);
    watchVisible(document.querySelector('.cast'), v => cast.visible = v);
    if (reduced || !G) { band.show.go = true; band.show.advance(9); band.draw(); if (!reduced) mark.drop(); }

    // one clock for everything: the GSAP ticker (or rAF without GSAP)
    let lastY = scrollY, lastT = performance.now(), vel = 0, lastK = -1;
    const tick = () => {
      const now = performance.now(), dt = Math.max(1e-3, (now - lastT) / 1000), y = scrollY;
      vel += ((y - lastY) / dt - vel) * Math.min(1, dt * 10); WL.scrollVel = Math.abs(vel) < 2 ? 0 : vel; lastY = y; lastT = now;
      WL.bandK = Math.min(1, Math.max(0, y / (heroEl.offsetHeight * .6)));
      if (!WL.paused) WL.tickStages(now);
      if (reduced && WL.bandK !== lastK) band.draw();
      lastK = WL.bandK;
      moveCursor();
    };
    if (G) gsap.ticker.add(tick); else (function loop() { tick(); requestAnimationFrame(loop); })();

    // ---------- smooth scroll (desktop only), on the same ticker ----------
    let lenis = null;
    if (G && libs.Lenis && fine && !reduced) {
      lenis = new Lenis({ lerp: .1, smoothWheel: true, allowNestedScroll: true });
      if (libs.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
      document.querySelectorAll('a[href^="#"]:not([href^="#ep/"])').forEach(a => a.addEventListener('click', e => {
        const el = document.querySelector(a.getAttribute('href')); if (!el) return; e.preventDefault(); lenis.scrollTo(el, { offset: -76 });
      }));
    }
    WL.onPlayer = open => {
      WL.paused = open; band.cv.classList.toggle('is-hidden', open);
      if (lenis) open ? lenis.stop() : lenis.start();
      if (!open) setLive(null);
    };

    // ---------- motion ----------
    if (G && !reduced) motion({ band, mark });
    hidePreloader(G);
    setupCursor();
    WL.player.fromHash();
  }

  // ---------- page building ----------
  function buildSeasons() {
    const holder = document.querySelector('.seasons');
    WL_SEASONS.forEach(season => {
      const row = document.createElement('div'); row.className = 'season';
      row.innerHTML = `<div class="wrap season__head"><div><p class="kicker">Season ${season.n} · ${season.episodes.length} episodes</p><h3 class="season__title">${season.title}</h3></div>
        <div class="season__arrows"><button class="icon-btn" type="button" aria-label="Scroll season ${season.n} left" data-dir="-1"><svg class="ico"><use href="#i-left"/></svg></button><button class="icon-btn" type="button" aria-label="Scroll season ${season.n} right" data-dir="1"><svg class="ico"><use href="#i-right"/></svg></button></div></div>
        <div class="track" role="list" aria-label="Season ${season.n} episodes"></div>`;
      const track = row.querySelector('.track');
      season.episodes.forEach(ep => {
        const a = document.createElement('a'); a.className = 'card reveal'; a.href = `#ep/${ep.id}`; a.setAttribute('role', 'listitem');
        a.style.setProperty('--ep', ep.accent);
        a.innerHTML = `<span class="card__frame"><canvas aria-hidden="true"></canvas><span class="card__play" aria-hidden="true"><svg class="ico"><use href="#i-play"/></svg></span></span>
          <span class="card__meta"><span class="chip${dark(ep.accent) ? ' is-dark' : ''}">EP ${String(ep.ep).padStart(2, '0')}</span><span class="kicker card__time">${ep.theme}</span></span>
          <span class="card__title">${ep.title}</span><span class="card__line">${ep.line}</span>`;
        a.setAttribute('aria-label', `Play episode ${ep.ep}, ${ep.title}: ${ep.line}`);
        track.appendChild(a);
        lazyPreview(a, ep);
      });
      row.querySelectorAll('[data-dir]').forEach(b => b.onclick = () => track.scrollBy({ left: +b.dataset.dir * (track.querySelector('.card').offsetWidth + 24) * 2, behavior: reduced ? 'auto' : 'smooth' }));
      holder.appendChild(row);
    });
  }
  const dark = hex => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 140; };

  // previews: a poster frame when the card comes near, the live episode on hover / when centred
  let live = null;
  const posterQueue = [];
  const idle = cb => (window.requestIdleCallback || (f => setTimeout(f, 60)))(cb);
  const pumpPosters = () => { const job = posterQueue.shift(); if (!job) return; job(); idle(pumpPosters); };
  function setLive(stage) {
    if (live && live !== stage) { live.running = false; live.card.classList.remove('is-live'); }
    live = stage; if (stage) { stage.running = true; stage.card.classList.add('is-live'); }
  }
  function lazyPreview(card, ep) {
    const io = new IntersectionObserver(es => {
      if (!es[0].isIntersecting) return; io.disconnect();
      posterQueue.push(() => {
        const st = WL.previewScene(card.querySelector('canvas'), ep); st.card = card; card._stage = st; st.poster();
        if (fine && !reduced) { card.addEventListener('pointerenter', () => setLive(st)); card.addEventListener('pointerleave', () => { if (live === st) setLive(null); }); card.addEventListener('focus', () => setLive(st)); card.addEventListener('blur', () => { if (live === st) setLive(null); }); }
        else if (!reduced) new IntersectionObserver(e2 => { if (e2[0].intersectionRatio > .9) setLive(st); else if (live === st) setLive(null); }, { threshold: [0, .9] }).observe(card);
      });
      if (posterQueue.length === 1) idle(pumpPosters);
    }, { rootMargin: '600px 600px' });
    io.observe(card);
  }

  function buildCast() {
    const list = document.querySelector('.cast__list');
    [['Wobbin', 'Walks in, figures it out, walks on.'], ['Pink curl', 'Always waving. Bakes cakes.'], ['Blue antenna', 'Will hand you a box.'],
     ['Orange tuft', 'Holds up the big pictures.'], ['Green curl', 'First on the dance floor.']].forEach(([name, line]) => {
      const li = document.createElement('li'); li.className = 'cast__item reveal';
      li.innerHTML = `<span class="cast__face"><canvas role="img" aria-label="${name}"></canvas></span><h3 class="cast__name">${name}</h3><p class="cast__line">${line}</p>`;
      list.appendChild(li);
    });
  }

  // pixel props drifting at the hero's edges
  function buildProps() {
    const { sprite, SPRITES, PAL } = Shorts, box = document.querySelector('.hero__props');
    const CLOCK = ['..XXX..', '.XYYYX.', 'XYYKYYX', 'XYYKKYX', 'XYYYYYX', '.XYYYX.', '..XXX..'];
    const CROWN = ['X...X...X', 'XX.XXX.XX', 'XXXXXXXXX', 'XRXXRXXRX', 'XXXXXXXXX'];
    const BALL = ['..XXX..', '.XXXXX.', 'XWXXXXX', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..'];
    const DROP = ['..X..', '.XXX.', 'XXXXX', 'XXWXX', '.XXX.'];
    const items = [
      [SPRITES.heart, { X: PAL.pink }, 6, '9%', '31%', .5], [CLOCK, { X: '#111', Y: PAL.yellow, K: '#111' }, 6, '91%', '30%', .35],
      [CROWN, { X: PAL.yellow, R: PAL.red }, 6, '81%', '50%', .6], [BALL, { X: PAL.red, W: '#fff' }, 6, '95%', '58%', .25],
      [DROP, { X: PAL.sky, W: '#fff' }, 6, '64%', '30%', .4], [SPRITES.note, { X: PAL.violet }, 7, '47%', '14%', .3],
      [SPRITES.sparkle, { X: PAL.orange }, 6, '33%', '26%', .55],
    ];
    items.forEach(([rows, cols, px, left, top, depth], i) => {
      const c = document.createElement('canvas'), w = rows[0].length * px, h = rows.length * px;
      c.width = w * 2; c.height = h * 2; c.className = 'prop'; Object.assign(c.style, { left, top, width: w + 'px', height: h + 'px' });
      c.dataset.depth = depth; const ctx = c.getContext('2d'); ctx.scale(2, 2); sprite(ctx, rows, w / 2, h / 2, px, cols); box.appendChild(c);
    });
  }

  function drawUnderlines() {
    document.querySelectorAll('.ul').forEach((a, i) => {
      const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('class', 'ul__line'); s.setAttribute('viewBox', '0 0 100 8'); s.setAttribute('preserveAspectRatio', 'none'); s.setAttribute('aria-hidden', 'true');
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); const w = 1 + (i % 3) * .6;
      p.setAttribute('d', `M1 ${4 + w * .4} C 22 ${2 + w} 44 ${6 - w} 62 ${4} S 90 ${3 + w * .6} 99 ${4.5}`); p.setAttribute('pathLength', '1'); p.setAttribute('vector-effect', 'non-scaling-stroke');
      s.appendChild(p); a.appendChild(s);
    });
  }

  function watchVisible(el, cb) { new IntersectionObserver(es => cb(es[0].isIntersecting), { rootMargin: '120px' }).observe(el); }

  // ---------- motion (all inside a reduced-motion gate) ----------
  function motion({ band, mark }) {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ST = window.ScrollTrigger, Split = window.SplitText;
      // masked line reveals on section titles
      if (Split) document.querySelectorAll('.split').forEach(h => {
        h.setAttribute('aria-label', h.textContent);
        const sp = Split.create(h, { type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'split-line' });
        gsap.from(sp.lines, { yPercent: 110, duration: 1, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: h, start: 'top 82%', once: true } });
      });
      // reveals, staggered per batch
      gsap.set('.reveal', { opacity: 0, y: 40 });
      if (ST) ST.batch('.reveal', { start: 'top 88%', once: true, onEnter: els => gsap.to(els, { y: 0, opacity: 1, duration: .9, ease: 'expo.out', stagger: .06, overwrite: true }) });
      // hero exit: the copy lifts away (the wordmark's blocks tumble off on their own), props drift at their depths
      if (ST) {
        gsap.to('.hero__inner', { y: -120, opacity: 0, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: true } });
        document.querySelectorAll('.prop').forEach(p => gsap.to(p, { y: -360 * +p.dataset.depth, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }));
        gsap.from('.meet__stage', { yPercent: 10, rotate: -1.5, ease: 'none', scrollTrigger: { trigger: '.meet', start: 'top bottom', end: 'bottom top', scrub: true } });
      }
      // the rotating word
      rotor();
      // hero entrance (runs after the preloader): the wordmark's blocks rain onto the line, then Wobbin walks in past them
      WL.heroIntro = () => {
        gsap.timeline({ defaults: { ease: 'expo.out' } })
          .add(() => mark.drop(), 0)
          .from('.nav > *', { y: -12, opacity: 0, duration: .7, stagger: .05 }, .1)
          .from('.hero__kicker', { y: 16, opacity: 0, duration: .8 }, .2)
          .from('.hero__pill', { y: 24, opacity: 0, duration: .9 }, .35)
          .from('.hero__ctas .btn', { y: 24, opacity: 0, duration: .9, stagger: .08 }, .45)
          .add(() => band.walkIn(), .9)
          .from('.prop', { scale: .4, opacity: 0, duration: .9, stagger: .05 }, 1.1)
          .from('.hero__hint', { y: 10, opacity: 0, duration: .8 }, 2.4);
      };
      ST && ST.refresh();
    });
  }
  function rotor() {
    const pill = document.querySelector('[data-rotor]'), word = pill.querySelector('.pill__word');
    const words = [['putting it off', '#ffa300'], ['saying yes', '#ff77a8'], ['overthinking', '#7b5cff'], ['waiting for a reply', '#29adff'],
      ['five more minutes', '#ff004d'], ['wanting it perfect', '#ffec27'], ['comparing', '#00e436'], ['bad days', '#3b7dd8'],
      ['losing your keys', '#ffa300'], ['awkward silences', '#ff77a8'], ['3am thoughts', '#7b5cff'], ['asking for help', '#29adff']];
    let i = 0;
    const fit = () => { pill.style.width = (word.offsetWidth + parseFloat(getComputedStyle(pill).paddingLeft) * 2) + 'px'; };
    pill.style.setProperty('--ep', words[0][1]); fit();
    setInterval(() => {
      if (document.hidden || WL.paused) return;
      i = (i + 1) % words.length;
      gsap.timeline()
        .to(word, { yPercent: -120, duration: .3, ease: 'power3.in' })
        .add(() => { word.textContent = words[i][0]; pill.style.setProperty('--ep', words[i][1]); fit(); })
        .fromTo(word, { yPercent: 120 }, { yPercent: 0, duration: .6, ease: 'expo.out' });
    }, 2200);
  }

  function hidePreloader(G) {
    if (reduced || !G) { pre.remove(); return; }
    gsap.to(pre, { opacity: 0, duration: .5, ease: 'power3.in', delay: .15, onComplete: () => pre.remove() });
    gsap.delayedCall(.25, () => WL.heroIntro && WL.heroIntro());
  }

  // ---------- the ink cursor ----------
  let cur = null, trail = [], cx = innerWidth / 2, cy = innerHeight / 2, hist = [];
  function setupCursor() {
    if (!fine || reduced) return;
    root.classList.add('has-cursor'); cur = document.querySelector('.cursor');
    for (let i = 0; i < 6; i++) { const t = document.createElement('span'); t.className = 'cursor__trail'; t.style.opacity = '0'; document.body.appendChild(t); trail.push(t); }
    document.addEventListener('pointerover', e => cur.classList.toggle('is-big', !!e.target.closest('a, button, .card, .meet__stage')));
  }
  function moveCursor() {
    if (!cur) return;
    cx += (WL.pointer.x - cx) * .22; cy += (WL.pointer.y - cy) * .22;
    cur.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
    hist.unshift([cx, cy]); hist.length = 24;
    trail.forEach((t, i) => { const h = hist[(i + 1) * 3]; if (!h) return; const moving = Math.hypot(WL.pointer.x - cx, WL.pointer.y - cy) > 2; t.style.transform = `translate3d(${Math.round(h[0] / 4) * 4 - 3}px, ${Math.round(h[1] / 4) * 4 - 3}px, 0)`; t.style.opacity = moving ? String(.7 - i * .1) : '0'; });
  }
})();
