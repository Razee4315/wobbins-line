// Brand kit for the social accounts: profile picture, banners in each platform's size and GIF sticker
// frames, all drawn with the show's own engine. Writes to exports/00 - Brand kit/ (tools/dev_server.py).
//   await import('/tools/brand.js'); await brandAll();     // avatar + banners
//   await stickers();                                     // frames for the GIPHY stickers (ffmpeg joins them)
const { Show, PAL, GROUND, sun, cloud, bird, zzz, clamp } = Shorts;
const DIR = '00 - Brand kit', CREAM = '#fdf8ef';
const FRIENDS = [
  { hair: 'curl', blush: PAL.pink, fill: '#ffe9f2' }, { hair: 'antenna', hairColor: PAL.blue, fill: '#e6f0ff' },
  { hairColor: PAL.orange, blush: '#ffb08a', fill: '#fff4d6' }, { hair: 'curl', hairColor: PAL.green, fill: '#e3fbef' },
];
const save = async (name, blob) => { const r = await fetch(`/export/${encodeURIComponent(DIR)}/${encodeURIComponent(name)}`, { method: 'POST', body: blob }); if (!r.ok) throw new Error('save failed: ' + name); };
const png = c => new Promise(r => c.toBlob(r, 'image/png'));

// a still scene: chars [{x, look, face, eye}] standing on the line, framed so that world point (wx, wy)
// lands on pixel (px, py) at `unit` pixels per world unit. Sky extras go in `sky(S, ctx, t)`.
function scene({ w, h, chars, unit, wx = 0, wy = GROUND, px = w / 2, py = h * .7, paper = CREAM, sky, front, clear, update, at = 4 }) {
  const base = Math.min(w / (h > w ? 640 : 1200), h / (h > w ? 640 * 16 / 9 : 600)), gy = h * (h > w ? .64 : .7);
  const cam = { x: wx - (px - w / 2) / unit, y: wy - (py - gy) / unit, z: unit / base };
  const story = {
    paper, clear, captions: [], boil: false,
    init(S) { S.cs = chars.map(c => S.addChar({ x: c.x, face: c.face ?? 1, ...c.look })); S.focus = S.cs[0]; },
    update(S, t, dt) {
      S.camGoal = { x: cam.x, y: cam.y, z: cam.z, kx: 400, kz: 400 };
      S.cs.forEach((c, i) => Object.assign(c.cmd, { x: chars[i].x, face: chars[i].face ?? 1, eye: chars[i].eye ?? 'happy', lookX: chars[i].lookX ?? 0, lookY: chars[i].lookY ?? 0, sit: chars[i].sit ?? 0 }));
      update && update(S, t, dt);
    },
    drawSky: sky && ((S, ctx, t) => sky(S, ctx, t)), drawFront: front && ((S, ctx, t) => front(S, ctx, t)),
  };
  const S = new Show(story, { loop: { T: 99, startState: null } });
  Object.assign(S.cam, { x: { x: cam.x, v: 0 }, y: { x: cam.y, v: 0 }, z: { x: cam.z, v: 0 } });
  S.advance(at);
  return S;
}
const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

// ---- profile picture: Bo, big and centred, on warm paper with a sunny disc behind (reads in a tiny circle)
export async function avatar(size = 1080) {
  const c = canvas(size, size), ctx = c.getContext('2d'), U = size / 290;
  const S = scene({
    w: size, h: size, unit: U, chars: [{ x: 0, eye: 'happy' }], wx: 0, wy: GROUND - 84, px: size / 2, py: size * .53,
    sky: (S, ctx) => { ctx.save(); ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(0, GROUND - 84 - 0.03 * size / U, size * .41 / U, 0, Math.PI * 2); ctx.fill(); ctx.restore(); },
  });
  S.render(ctx, size, size);
  return c;
}

// ---- banners: the gang on the line on the right, the name on the left, everything inside the safe box
// (sw x sh, centred) that every device shows; the paper, line and sky run on to the full edges
export async function banner(w, h, sw, sh, { tag = 'tiny stories on one line · a new one every day', textY = .52 } = {}) {
  await document.fonts.load('80px Silkscreen').catch(() => {});
  const c = canvas(w, h), ctx = c.getContext('2d');
  const L = (w - sw) / 2, T = (h - sh) / 2, U = Math.min(sh * .5 / 172, sw * .42 / 740), groundPx = T + sh * .8;
  const gang = [FRIENDS[0], {}, FRIENDS[1], FRIENDS[2]];
  // the gang fills the right ~42% of the safe box, 190 apart (no touching), all turned to look at the name
  const xr = (L + sw * .97 - w / 2) / U - 85;
  const chars = gang.map((look, i) => ({ x: xr - (3 - i) * 190, face: -1, look, eye: i === 1 ? 'happy' : i % 2 ? 'open' : 'happy' }));
  const S = scene({
    w, h, unit: U, chars, wx: 0, wy: GROUND, px: w / 2, py: groundPx,
    sky: (S, ctx) => {
      // the sun and the birds sit just outside the safe box on the right: a bonus where the banner shows in full
      const v = S.view, wxp = p => (p - w / 2) / U + 0, wyp = p => GROUND - (groundPx - p) / U;
      const sx = wxp(Math.min(w - 70 * sh / 423, L + sw + (w - L - sw) * .45)), sy = wyp(T + sh * .2);
      sun(ctx, sx, sy, 11, { X: PAL.yellow });
      for (let i = 0; i < 6; i++) cloud(ctx, v.left + (v.right - v.left) * (.06 + i * .17), v.top + (v.bottom - v.top) * (.08 + (i % 3) * .06), 8, { X: '#ebe8f4' });
      bird(ctx, wxp(L + sw * .5), wyp(T + sh * .1), 6, { X: PAL.sky }, 1, 8, -1); bird(ctx, wxp(L + sw * .58), wyp(T + sh * .16), 5, { X: PAL.pink }, 1, 8, -1);
    },
  });
  S.render(ctx, w, h);
  // the name, left half of the safe box
  const k = sh / 423, x = L + sw * .05;
  let fs = 92 * k; ctx.font = `${fs}px Silkscreen, monospace`;
  while (ctx.measureText("WOBBIN'S LINE").width > sw * .43) { fs -= 2; ctx.font = `${fs}px Silkscreen, monospace`; }
  ctx.fillStyle = '#111'; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  const y = T + sh * textY; ctx.fillText("WOBBIN'S LINE", x, y);
  const tw = ctx.measureText("WOBBIN'S LINE").width;
  ctx.strokeStyle = PAL.orange; ctx.lineWidth = 9 * k; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i <= 24; i++) { const xx = x + tw * i / 24, yy = y + 22 * k + Math.sin(i * 1.7) * 2.5 * k; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
  let ts = 30 * k; ctx.font = `${ts}px Silkscreen, monospace`;
  while (ctx.measureText(tag).width > sw * .45) { ts -= 1; ctx.font = `${ts}px Silkscreen, monospace`; }
  ctx.fillStyle = '#555'; ctx.fillText(tag, x, y + 22 * k + 58 * k);
  return c;
}

export const BANNERS = [
  // name, w, h, safe w, safe h, options (X and Bluesky put the profile picture over the bottom-left)
  ['YouTube 2560x1440', 2560, 1440, 1546, 423],
  ['Facebook cover 1640x924', 1640, 924, 1200, 500],
  ['X header 1500x500', 1500, 500, 1100, 340, { textY: .42 }],
  ['Bluesky banner 3000x1000', 3000, 1000, 2300, 700, { textY: .42 }],
  ['Tumblr header 3000x1055', 3000, 1055, 2300, 700],
  ['Pinterest cover 1920x1080', 1920, 1080, 1700, 560],
];

export async function brandAll() {
  await document.fonts.load('80px Silkscreen').catch(() => {});
  await save('profile picture 1080.png', await png(await avatar(1080)));
  for (const [name, w, h, sw, sh, o] of BANNERS) await save(`banner ${name}.png`, await png(await banner(w, h, sw, sh, o)));
  return 'ok';
}

// ---- GIF stickers: short seamless loops on a transparent background, saved as numbered PNG frames
// (exports/00 - Brand kit/frames <name>/NNN.png); ffmpeg turns each set into a GIF.
// Each motion repeats every P seconds, so after a warm-up the frames at t and t + P match.
// fires fn once per period, `phase` seconds into it
const every = (S, t, P, phase, fn) => { const k = Math.floor((t - phase) / P); S.ev ??= {}; if (S.ev[phase] !== undefined && k > S.ev[phase]) fn(); S.ev[phase] = k; };
const STICKERS = {
  hop: { P: 1.2, chars: [{ x: 0, eye: 'happy' }], update(S, t) { every(S, t, 1.2, 0, () => S.cs[0].jump(0, -720)); } },
  hi: { P: 2.4, say: 'hi!', chars: [{ x: 0, eye: 'happy' }], update(S, t) { every(S, t, 2.4, .2, () => S.cs[0].jump(0, -520)); every(S, t, 2.4, .75, () => S.cs[0].jump(0, -520)); } },
  sleepy: { P: 2.4, chars: [{ x: 0, eye: 'closed', sit: 1 }], front: (S, ctx, t) => { const top = S.cs[0].top(); zzz(ctx, top.x - 10, top.y, t); } },
  flip: { P: 1.6, chars: [{ x: 0, eye: 'happy' }], update(S, t) { every(S, t, 1.6, 0, () => S.cs[0].jump(0, -800, 10.2)); } },
  shy: { P: 3.2, chars: [{ x: 0, eye: 'happy' }], update(S, t) { const b = S.cs[0], u = ((t % 3.2) + 3.2) % 3.2; b.cmd.face = u < 1.6 ? 1 : -1; b.cmd.lookY = u % 1.6 < .8 ? .6 : 0; } },
};
export async function stickers({ size = 480, fps = 25, only } = {}) {
  await document.fonts.load('80px Silkscreen').catch(() => {});
  const out = {}, line = size * .86;
  // mask: everything above the line stays, the line itself fades out toward both edges
  const mask = canvas(size, size), m = mask.getContext('2d');
  m.fillStyle = '#000'; m.fillRect(0, 0, size, line - size * .03);
  const g = m.createLinearGradient(0, 0, size, 0); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.25, '#000'); g.addColorStop(.75, '#000'); g.addColorStop(1, 'rgba(0,0,0,0)');
  m.fillStyle = g; m.fillRect(0, line - size * .03, size, size);
  for (const [name, st] of Object.entries(STICKERS)) {
    if (only && !only.includes(name)) continue;
    const U = size / 420, n = Math.round(st.P * fps);
    const S = scene({
      w: size, h: size, unit: U, chars: st.chars, wx: 0, wy: GROUND, px: size / 2, py: line, at: st.P * 3 + .01,
      paper: 'rgba(0,0,0,0)', clear: true, update: st.update, front: st.front,
    });
    S.advance(Math.ceil(S.t / st.P) * st.P - S.t);   // start exactly on a period boundary
    const c = canvas(size, size), ctx = c.getContext('2d');
    for (let i = 0; i < n; i++) {
      ctx.clearRect(0, 0, size, size); S.render(ctx, size, size);
      ctx.save(); ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(mask, 0, 0); ctx.restore();
      if (st.say) {
        const u = (i / n), a = clamp(Math.min(u * 8, (1 - u) * 6));
        ctx.save(); ctx.globalAlpha = a; ctx.font = `${size * .11}px Silkscreen, monospace`; ctx.textAlign = 'center'; ctx.fillStyle = '#111';
        ctx.fillText(st.say, size / 2, size * .17); ctx.restore();
      }
      await save(`frames ${name} ${String(i).padStart(3, '0')}.png`, await png(c));
      S.advance(1 / fps);
    }
    out[name] = n;
  }
  return out;
}
window.brandAll = brandAll; window.stickers = stickers;
