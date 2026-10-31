// Dev helpers for checking an episode page served by tools/dev_server.py.
// In the console: await import('/tools/sheet.js'); then sheet(), seamDiff(), measure(), render().

// Contact sheet: render the episode at each time into a grid, save it as tools/out/sheets/<name>.png.
window.sheet = async (name, times, { w = 216, h = 384, cols = 8 } = {}) => {
  const st = window.show.story, rows = Math.ceil(times.length / cols);
  const out = document.createElement('canvas'); out.width = cols * w; out.height = rows * (h + 22);
  const o = out.getContext('2d'); o.fillStyle = '#888'; o.fillRect(0, 0, out.width, out.height);
  const c = document.createElement('canvas'); c.width = w * 2; c.height = h * 2; const ctx = c.getContext('2d');
  const sh = new Shorts.Show(st, { loop: { T: window.show.T, startState: window.show.startState } });
  const errs = []; let last = 0;
  for (const [i, t] of times.entries()) {
    try { if (t < last) { sh.reset(); last = 0; } sh.advance(t - last); last = t; sh.render(ctx, c.width, c.height); } catch (e) { errs.push(t + ': ' + e.message); }
    const x = (i % cols) * w, y = Math.floor(i / cols) * (h + 22);
    o.drawImage(c, x + 2, y, w - 4, h); o.fillStyle = '#fff'; o.font = '14px monospace'; o.fillText(t.toFixed(1) + 's', x + 6, y + h + 16);
  }
  const blob = await new Promise(r => out.toBlob(r, 'image/png'));
  await fetch('/save/sheets/' + name + '.png', { method: 'POST', body: blob });
  return { T: +window.show.T.toFixed(2), err: +(window.show.loopErr ?? -1).toFixed(3), errs };
};

// One moment in several art styles, side by side: looks('gap', 20, ['pencil', 'charcoal']) -> tools/out/sheets/gap.png
window.looks = async (name, t, styles, { w = 540, h = 960 } = {}) => {
  await Sketch.ready();
  const out = document.createElement('canvas'); out.width = styles.length * (w + 8); out.height = h;
  const o = out.getContext('2d'), c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d');
  const sh = new Shorts.Show(show.story, { loop: { T: show.T, startState: show.startState } }); sh.advance(t);
  for (const [i, s] of styles.entries()) { Sketch.override = s; sh.render(ctx, w, h); o.drawImage(c, i * (w + 8), 0); }
  Sketch.override = null;
  const blob = await new Promise(r => out.toBlob(r, 'image/png'));
  await fetch('/save/sheets/' + name + '.png', { method: 'POST', body: blob });
  return 'ok';
};

// Which parts of Bo's state don't match at the loop seam ([] = perfect).
window.seamDiff = () => {
  const s = new Shorts.Show(show.story, { loop: { T: show.T, startState: show.startState } });
  const a = s.snapshot(); s.advance(show.T); const b = s.snapshot();
  const names = ['y', 'rot', 'q', 'vx', 'face', 'sit', 'lookX', 'lookY', 'camdx', 'camv', 'camz', 'camy', 'f0x', 'f0y', 'f0r', 'f1x', 'f1y', 'f1r', 'tx', 'ty'];
  return names.map((n, i) => [n, +(b[i] - a[i]).toFixed(2)]).filter(([, d]) => Math.abs(d) > .05);
};

// Loudness (RMS dB) of a list of sound events [[name, params, time], ...], rendered offline.
window.measure = async (events, dur = 1.2) => {
  const ctx = new OfflineAudioContext(2, 48000 * dur, 48000);
  for (const [name, p = {}, t = .05] of events) SFX.play(ctx, { name, p, pan: 0 }, t);
  const d = (await ctx.startRendering()).getChannelData(0); let s = 0; for (const v of d) s += v * v;
  return +(10 * Math.log10(s / d.length + 1e-12)).toFixed(1);
};

// Render this episode to an MP4 and save it as tools/out/renders/<name>.
window.render = async (w = 1080, h = 1920) => {
  const blob = await Shorts.exportMP4(show.story, { T: show.T, startState: show.startState }, { w, h, fps: 60, loops: 1 }, () => {});
  const name = `${show.story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${w}x${h}.mp4`;
  await fetch('/save/renders/' + name, { method: 'POST', body: blob });
  return name + ' ' + (blob.size / 1e6).toFixed(1) + ' MB';
};

// Frames from several episodes in one image: grid('name', [['the-gap', 5.8], ['yes', 12], ...]) -> tools/out/sheets/name.png
window.grid = async (name, shots, W = 300, H = 533, cols = 6) => {
  const rows = Math.ceil(shots.length / cols), out = document.createElement('canvas'); out.width = W * cols; out.height = rows * (H + 20);
  const o = out.getContext('2d'); o.fillStyle = '#888'; o.fillRect(0, 0, out.width, out.height);
  const c = document.createElement('canvas'); c.width = W * 2; c.height = H * 2; const ctx = c.getContext('2d'), cache = {};
  for (const [i, [id, t]] of shots.entries()) {
    if (!cache[id]) {
      const html = await (await fetch('/' + id + '.html', { cache: 'no-store' })).text(); let story;
      new Function('Shorts', html.match(/<script>\r?\n([\s\S]*?)<\/script>/)[1])(Object.assign(Object.create(Shorts), { play: s => { story = s; } }));
      const S0 = new Shorts.Show(story); cache[id] = { story, loop: { T: S0.T, startState: S0.startState } };
    }
    const S = new Shorts.Show(cache[id].story, { loop: cache[id].loop }); S.advance(t); S.render(ctx, c.width, c.height);
    const x = (i % cols) * W, y = Math.floor(i / cols) * (H + 20); o.drawImage(c, x + 2, y, W - 4, H);
    o.fillStyle = '#fff'; o.font = '13px monospace'; o.fillText(id + ' ' + t, x + 6, y + H + 15);
  }
  const blob = await new Promise(r => out.toBlob(r, 'image/png')); await fetch('/save/sheets/' + name + '.png', { method: 'POST', body: blob }); return 'ok';
};
