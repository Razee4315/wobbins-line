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
