/* The episode player: a full-screen sheet addressed by #ep/<id>. Seasons 2–5 render on the site's
   engine: seamless loop, sound, MP4 export incl. 4K. */
(function () {
  const WL = window.WL, P = document.querySelector('.player'), $ = s => P.querySelector(s);
  const cv = $('.player__canvas'), ctx = cv.getContext('2d');
  const scrub = $('.player__scrub input'), timeEl = $('.player__time'), note = $('.player__note');
  const btn = a => $(`[data-act="${a}"]`), menu = $('.dl__menu');
  const loops = {};                      // computed seamless-loop data per episode, reused
  let ep = null, show = null, playing = true, wide = false, actx = null, soundOn = false, last = 0, busy = false, opener = null, raf = 0;

  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const darkAccent = hex => { const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (r * 299 + g * 587 + b * 114) / 1000 < 140; };
  const setIcon = (b, id) => b.querySelector('use').setAttribute('href', '#' + id);

  function size() {
    const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.max(2, Math.round(r.width * d)); cv.height = Math.max(2, Math.round(r.height * d));
  }
  new ResizeObserver(size).observe(cv);

  function setPlaying(on) {
    playing = on; setIcon(btn('play'), on ? 'i-pause' : 'i-play'); btn('play').setAttribute('aria-label', on ? 'Pause' : 'Play');
  }
  function setSound(on) {
    if (on && !actx) actx = new AudioContext({ latencyHint: 'interactive' });
    if (on && actx.state !== 'running') actx.resume();
    soundOn = on; setIcon(btn('sound'), on ? 'i-sound' : 'i-mute'); btn('sound').setAttribute('aria-label', on ? 'Turn sound off' : 'Turn sound on');
  }
  function setWide(on) {
    wide = on; P.classList.toggle('is-wide', on); setIcon(btn('aspect'), on ? 'i-aspect' : 'i-wide');
    btn('aspect').setAttribute('aria-label', on ? 'Switch to 9:16' : 'Switch to 16:9'); requestAnimationFrame(size);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!show || busy) return;
    if (playing) { if (show.t + dt >= show.T) show.reset(); else show.advance(dt); }
    show.render(ctx, cv.width, cv.height);
    scrub.value = Math.round(show.t / show.T * 1000); timeEl.textContent = `${fmt(show.t)} / ${fmt(show.T)}`;
  }

  function open(id) {
    const next = WL_EPISODES.find(e => e.id === id); if (!next) return false;
    const first = P.hidden;
    ep = next; show = null; menu.hidden = true; btn('dl').setAttribute('aria-expanded', 'false');
    $('.player__chip').textContent = `EP ${String(ep.ep).padStart(2, '0')} · season ${ep.season}`;
    $('.player__chip').style.setProperty('--ep', ep.accent); $('.player__chip').classList.toggle('is-dark', darkAccent(ep.accent));
    $('.player__title').textContent = ep.title; $('.player__theme').textContent = ep.theme; $('.player__quote').textContent = ep.quote;
    if (first) {
      opener = document.activeElement; P.hidden = false; document.documentElement.classList.add('is-player-open');
      WL.onPlayer && WL.onPlayer(true);
      if (window.gsap && !WL.reduced) gsap.fromTo(P, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: .7, ease: 'power4.inOut' });
      btn('play').focus({ preventScroll: true });
      last = performance.now(); raf = requestAnimationFrame(frame);
    }
    if (!P.classList.contains('was-user-wide')) setWide(false);
    note.textContent = loops[ep.id] ? '' : 'Getting the loop ready…';
    const story = WL_STORIES[ep.id], target = ep;
    setTimeout(() => {                                   // let the sheet open before the loop is computed
      if (ep !== target) return;
      if (!loops[ep.id]) { const s = new Shorts.Show(story); loops[ep.id] = { T: s.T, startState: s.startState }; }
      show = new Shorts.Show(story, { loop: loops[ep.id] }); show.seek(show.hook);   // open on the hook, not the walk-in
      show.onSfx = ev => { if (soundOn && playing && actx && actx.state === 'running' && !busy) SFX.play(actx, ev, actx.currentTime + .02); };
      note.textContent = ''; setPlaying(true);
    }, first ? 120 : 0);
    return true;
  }

  function close() {
    if (P.hidden) return;
    const done = () => { P.hidden = true; show = null; cancelAnimationFrame(raf); document.documentElement.classList.remove('is-player-open'); WL.onPlayer && WL.onPlayer(false); if (opener) opener.focus({ preventScroll: true }); };
    if (window.gsap && !WL.reduced) gsap.to(P, { clipPath: 'inset(0 0 100% 0)', duration: .5, ease: 'power3.in', onComplete: done }); else done();
    if (location.hash.startsWith('#ep/')) history.replaceState(null, '', location.pathname + location.search + '#episodes');
  }
  function step(d) {
    const i = WL_EPISODES.indexOf(ep), n = WL_EPISODES[(i + d + WL_EPISODES.length) % WL_EPISODES.length];
    history.replaceState(null, '', '#ep/' + n.id); open(n.id);
  }

  async function download(sizeStr) {
    if (!show || busy) return;
    const [w, h] = sizeStr.split('x').map(Number);
    menu.hidden = true; busy = true; $('.player__busy').hidden = false;
    const bar = $('.meter i'), pct = $('.player__pct');
    try {
      const blob = await Shorts.exportMP4(WL_STORIES[ep.id], loops[ep.id], { w, h, fps: 60, loops: 1 }, p => { bar.style.width = (p * 100).toFixed(1) + '%'; pct.textContent = Math.round(p * 100) + '%'; });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
      a.download = `wobbins-line-ep${String(ep.ep).padStart(2, '0')}-${ep.id}-${w}x${h}.mp4`; a.click();
      note.textContent = `Saved ${w}×${h} MP4.`;
    } catch (err) { note.textContent = (err && err.message) || String(err); }
    busy = false; $('.player__busy').hidden = true; bar.style.width = '0';
  }

  // ---------- wiring ----------
  btn('play').onclick = () => setPlaying(!playing);
  btn('sound').onclick = () => setSound(!soundOn);
  btn('aspect').onclick = () => { setWide(!wide); P.classList.toggle('was-user-wide', wide); };
  btn('prev').onclick = () => step(-1);
  btn('next').onclick = () => step(1);
  btn('dl').onclick = () => { const o = menu.hidden; menu.hidden = !o; btn('dl').setAttribute('aria-expanded', String(o)); if (o) menu.querySelector('button').focus(); };
  menu.querySelectorAll('button').forEach(b => b.onclick = () => download(b.dataset.size));
  $('.player__close').onclick = close;
  scrub.oninput = () => { if (show) show.seek(scrub.value / 1000 * show.T); };
  if (!('VideoEncoder' in window)) menu.querySelectorAll('button').forEach(b => { b.disabled = true; b.title = 'Export needs Chrome or Edge'; });

  P.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!menu.hidden) { menu.hidden = true; btn('dl').focus(); } else close(); return; }
    const tag = e.target.tagName;
    if (e.key === ' ' && tag !== 'BUTTON' && tag !== 'INPUT') { e.preventDefault(); setPlaying(!playing); }
    if (tag !== 'INPUT' && e.key === 'ArrowRight') step(1);
    if (tag !== 'INPUT' && e.key === 'ArrowLeft') step(-1);
    if (e.key === 'm' || e.key === 'M') setSound(!soundOn);
    if (e.key === 'Tab') {                                       // keep focus inside the sheet
      const f = [...P.querySelectorAll('button:not([disabled]), input:not([disabled]), [href]')].filter(x => x.offsetParent);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  const fromHash = () => { const m = location.hash.match(/^#ep\/([\w-]+)$/); if (m) { if (!open(m[1])) document.getElementById('episodes').scrollIntoView(); } else if (!P.hidden) close(); };
  addEventListener('hashchange', fromHash);
  WL.player = { open: id => { if (location.hash !== '#ep/' + id) location.hash = '#ep/' + id; else open(id); }, fromHash, close };
})();
