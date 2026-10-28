/* perfect: extracted from ../perfect.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['perfect'] = story; } });
  // Bo paints a pixel heart, dab by dab, with its hair. One pixel is wrong: wipe it all. Again.
  // Faster. Meanwhile a friend happily finishes painting after painting. The "wrong" pixel
  // turns out to be a ladybug.
  // Button: Bo calls it done (the heart joins Mo's pile) and dabs a quick, wobbly heart just for fun,
  // leaving one gap on purpose. The ladybug flies back and settles right into the gap.
  const { PAL, SPRITES, sprite, lerp, seg, sine, outBack, clamp, hash, spring, GROUND } = Shorts;
  const V = 130, EASEL = 900, CELL = 22, MO_EASEL = 1220, MO_CELL = 16, STACK_X = 1080;
  const CMAP = { R: PAL.red, P: PAL.pink, Y: PAL.yellow, O: PAL.orange, G: PAL.green, B: PAL.brown, S: PAL.sky, K: '#111', V: PAL.violet };
  const HEART = ['.RR..RR.', 'RPPRRRRR', 'RPRRRRRR', 'RRRRRRRR', '.RRRRRR.', '..RRRR..', '...RR...', '........'];
  const MO_ART = [
    ['...YY...', '.Y.YY.Y.', '..YYYY..', 'YYYOOYYY', 'YYYOOYYY', '..YYYY..', '.Y.YY.Y.', '...YY...'],
    ['...GG...', '..GGGG..', '.GGGGGG.', 'GGGGGGGG', '.GGGGGG.', '...BB...', '...BB...', '...BB...'],
    ['..SSSS..', '.SSSSSS.', 'SSKSSKSS', 'SSSSSSSS', 'SKSSSSKS', 'SSKKKKSS', '.SSSSSS.', '..SSSS..'],
    ['...VV...', '...VV...', 'VVVVVVVV', '.VVVVVV.', '..VVVV..', '.VV..VV.', 'VV....VV', '........'],
  ];
  const cellsOf = art => { const out = []; art.forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') out.push({ r, c, col: CMAP[ch] }); })); return out; };
  const HEART_CELLS = cellsOf(HEART);
  // Bo's three tries: when they start, how fast, which pixel goes wrong, when Bo wipes it
  const TRIES = [
    { start: 6.4, every: .1, wrong: [3, 5, PAL.blue], erase: 11.6 },
    { start: 12.4, every: .065, wrong: [2, 6, PAL.lime], erase: 15.8 },
    { start: 16.6, every: .04, wrong: [4, 2, '#111'], erase: null },
  ];
  const MO_CYCLES = [6.0, 9.6, 13.2];
  // the button: Bo's heart goes on the pile, a wobbly one gets painted, the ladybug comes home
  const FRESH = 23.3, WOB0 = 24.5, WOB_EVERY = .11, BUG = 28.4, LAND = 29.5, LEAVE = 31.3;
  const WOBBLY = ['.XX.XX.', 'XXXXXXX', 'XXXX.XX', '.XXXXX.', '..XXX..', '...X...'], GAP = { r: 2, c: 4 };
  const WOB_COLS = [PAL.pink, PAL.red, PAL.pink, PAL.orange, PAL.red];
  const WOB_CELLS = cellsOf(WOBBLY).map(({ r, c }, i) => ({
    r, c, col: WOB_COLS[Math.floor(hash(i * 2.7) * WOB_COLS.length)],
    dx: (hash(i * 1.3) - .5) * 9 + Math.sin(r * 1.4) * 5, dy: (hash(i * 3.9) - .5) * 9, s: 17 + hash(i * 5.1) * 8, rot: (hash(i * .7) - .5) * .5,
  }));
  const WOB_END = WOB0 + WOB_CELLS.length * WOB_EVERY;
  const wobXY = (r, c) => ({ x: EASEL + (c - 3) * CELL, y: GROUND - 164 + (r - 2.5) * CELL });
  const canvasXY = (r, c) => ({ x: EASEL - 4 * CELL + c * CELL + CELL / 2, y: GROUND - 252 + r * CELL + CELL / 2 });

  function tryAt(t) { for (let i = TRIES.length - 1; i >= 0; i--) if (t >= TRIES[i].start) return i; return -1; }
  function painted(t, k) {
    const T = TRIES[k], n = Math.floor((t - T.start) / T.every) + 1;
    if (T.erase !== null && t >= T.erase) return 0;
    return clamp(n, 0, HEART_CELLS.length);
  }

  Shorts.play({
    title: 'Perfect',
    accent: PAL.violet,
    loopAfter: LEAVE + 10.1,                 // a long walk-off: Mo and both easels must be out of view
    captions: [
      [6.6, 8.6, 'just *right*...'],
      [10.6, 12.2, 'no. *again.*'],
      [15.1, 16.4, '*AGAIN.*'],
      [18.3, 19.7, 'it has to be *perfect*—'],
      [21.4, 23.0, 'oh.'],
      [24.2, 28.6, 'done is better than *perfect.*'],
    ],
    init(S) {
      S.mo = S.addChar({ x: 1360, face: -1, hair: 'curl', blush: PAL.pink, fill: '#f1ebff', gain: .7 });
      S.bo = S.addChar({ x: 0, walk: V }); S.focus = S.bo;
      S.dabN = 0; S.lastPainted = 0; S.moDone = 0; S.flying = []; S.flapT = 0; S.mo0 = S.mo1 = S.mo2 = undefined;
    },
    update(S, t, dt) {
      const bo = S.bo, mo = S.mo, k = tryAt(t);
      S.plan(bo, t, [
        [0, { x: 735, speed: V, accel: 450 }],
        [5.6, { lookX: .8, lookY: -.3 }],
        [10.3, { eye: 'wide', lookX: 1, lookY: -.2 }], [11.0, { eye: 'sad' }],
        [11.6, { eye: 'squeeze' }], [12.3, { eye: 'open' }],
        [15.0, { eye: 'wide' }], [15.4, { eye: 'squeeze', crouch: .2 }],
        [15.6, { crouch: 0 }], [15.6, () => bo.jump(0, -360)],             // stomp
        [16.4, { eye: 'open' }],
        [18.2, { eye: 'wide' }], [18.8, { eye: 'squeeze', crouch: .24 }],   // winding up to wipe it again...
        [19.5, { crouch: 0, eye: 'open', lookX: 1, lookY: 0 }],             // ...wait
        [20.9, { eye: 'wide', lookY: -.6 }],
        [21.8, { eye: 'happy' }],
        [22.3, { crouch: .2 }], [22.5, { crouch: 0 }], [22.5, () => bo.jump(0, -470)],
        [FRESH - .1, { eye: 'happy', lookX: .9, lookY: 0 }],                // done! onto the pile
        [WOB0 - .3, { lookX: .8, lookY: -.3 }],                             // and one more, just for fun
        [WOB_END + .2, { eye: 'open', tilt: 0 }],
        [BUG + .3, { eye: 'wide', lookX: 1, lookY: -.8 }],                  // it's back!
        [LAND + .2, { eye: 'happy', lookX: .8, lookY: -.3 }],
        [30.5, { crouch: .2 }], [30.75, { crouch: 0 }], [30.75, () => bo.jump(0, -440)],
        [LEAVE, { x: 1e6, speed: V, accel: 450, eye: 'open', lookX: 0, lookY: 0, tilt: 0 }],
        [LEAVE + .1, () => S.sfx('hum', { notes: [2, 4, 5, 7, 5], gap: .3, g: .04 }, bo.x)],
      ]);
      S.plan(mo, t, [
        [0, { lookX: .6, lookY: -.2 }],
        [18.6, { x: 1075, speed: 200, accel: 700, eye: 'wide', lookX: 0 }],   // "wait!"
        [19.5, () => mo.jump(0, -420)],
        [19.9, { eye: 'heart', lookX: .9, lookY: -.3 }],
        [22.6, () => mo.jump(0, -440)], [22.7, { eye: 'happy' }],
        [LAND + .1, { eye: 'heart' }], [LAND + .2, () => mo.jump(0, -400)], [LAND + 1.2, { eye: 'happy' }],
        [33.5, () => mo.jump(0, -340)], [34.3, { face: 1, lookX: .3, lookY: 0 }],   // waves Bo off
      ]);

      // dab, dab, dab: Bo paints with its hair, a pixel per dip, faster and faster
      if (k >= 0) {
        const T = TRIES[k], n = painted(t, k);
        if (n > S.lastPainted && n <= HEART_CELLS.length) { S.sfx('dab', { k: S.dabN++, oct: .5 + k * .25 }, EASEL); }
        S.lastPainted = n;
        const phase = ((t - T.start) / T.every) % 1, painting = n < HEART_CELLS.length && (T.erase === null || t < T.erase);
        if (t < FRESH) bo.cmd.tilt = painting ? .1 + .16 * (1 - phase) : 0;
        if (T.erase !== null && t >= T.erase) S.once('erase' + k, () => {
          S.sfx('erase', {}, EASEL); S.shake(2);
          HEART_CELLS.forEach((cell, i) => {
            const p = canvasXY(cell.r, cell.c), wrong = cell.r === T.wrong[0] && cell.c === T.wrong[1];
            S.parts.push({ x: p.x, y: p.y, vx: (hash(i + k) - .5) * 260, vy: -120 - hash(i * 2 + k) * 220, g: 1400, drag: .8, life: 1 + hash(i) * .4, t0: t, c: wrong ? T.wrong[2] : cell.col, s: CELL - 2, shape: 'square' });
          });
        });
        if (t >= T.start + HEART_CELLS.length * T.every + .2) S.once('notice' + k, () => S.sfx(k < 2 ? 'slip' : 'heart', { g: .2 }, EASEL));
      }
      // Mo just paints, finishes, and moves on to the next one
      MO_CYCLES.forEach((st, i) => {
        const cells = cellsOf(MO_ART[i]), n = Math.floor((t - st) / .075);
        if (t >= st && n < cells.length && t < 18.6) { mo.cmd.tilt = .08 + .12 * (1 - ((t - st) / .075) % 1); if (n !== S['mo' + i]) { S['mo' + i] = n; if (n % 2 === 0) S.sfx('dab', { k: n + 3, oct: 1, g: .5 }, MO_EASEL); } }
        if (t >= st + cells.length * .075 + .3) S.once('moDone' + i, () => {
          S.moDone++; mo.cmd.tilt = 0; S.sfx('pop', { pitch: 880, g: .1 }, MO_EASEL); S.sfx('chime', { n: 4 + i, g: .07 }, MO_EASEL);
          S.flying.push({ art: i, t0: t });
        });
      });
      if (t > 18.6) mo.cmd.tilt = 0;
      // the button: the imperfect heart goes on the pile; a quick wobbly one, gap and all
      if (t > FRESH) S.once('fresh', () => { S.flying.push({ art: 'bo', t0: t }); S.sfx('pop', { pitch: 880, g: .1 }, EASEL); S.sfx('chime', { n: 7, g: .07 }, EASEL); });
      if (t >= WOB0 && t < WOB_END) {
        const n = Math.floor((t - WOB0) / WOB_EVERY), ph = ((t - WOB0) / WOB_EVERY) % 1;
        bo.cmd.tilt = .1 + .16 * (1 - ph);
        if (n !== S.wobN) { S.wobN = n; S.sfx('dab', { k: n, oct: .75 }, EASEL); }
      }
      if (t > BUG) S.once('bugBack', () => S.sfx('flap', {}, EASEL));
      if (t > LAND) S.once('bugLand', () => { S.sfx('twinkle', { pitch: 2349 }, EASEL); S.sfx('sparkle', { n: 3 }, EASEL); });
      // the wrong pixel was a ladybug all along
      if (t > 20.8) S.once('bug', () => { S.sfx('twinkle', { pitch: 2349 }, EASEL); S.sfx('swell', { root: 392 }); });
      if ((t > 20.9 && t < 25) || (t > BUG && t < LAND)) { S.flapT = (S.flapT || 0) + dt; if (S.flapT > .22) { S.flapT = 0; S.sfx('flap', {}, EASEL); } }
      if (t > 5.6 && t < LEAVE) { S.camGoal.x = t < 23.4 ? 1040 : 1000; S.camGoal.z = t < 23.4 ? .85 : .8; S.camGoal.kx = 2.5; }   // wider for the button so Bo isn't cut off in 9:16
    },
    drawSky(S, ctx, t, v) {
      for (let i = 0; i < 3; i++) {
        const W = v.right - v.left + 400, x = v.left - 200 + (1 - ((t / S.T + i / 3 + .3) % 1)) * W;
        sprite(ctx, SPRITES.cloud, x, v.top + (v.bottom - v.top) * (.25 + i * .06), 9, { X: '#ebe8f4' });
      }
    },
    drawBack(S, ctx, t) {
      // Bo's easel
      const k = tryAt(t), shake = k === 2 && t < 19.5 ? Math.sin(t * 60) * 1.6 : 0;
      drawEasel(ctx, EASEL + shake, GROUND - 252, CELL * 8);
      if (k >= 0 && t < FRESH) {
        const T = TRIES[k], n = painted(t, k);
        HEART_CELLS.slice(0, n).forEach((cell, i) => {
          const wrong = cell.r === T.wrong[0] && cell.c === T.wrong[1];
          if (wrong && k === 2 && t > 20.8) return;                         // it flew away
          const age = t - (T.start + i * T.every), s = outBack(clamp(age / .12));
          const p = canvasXY(cell.r, cell.c);
          ctx.fillStyle = wrong ? T.wrong[2] : cell.col;
          const w = (CELL - 2) * s; ctx.fillRect(p.x - w / 2 + shake, p.y - w / 2, w, w);
          if (wrong && k === 2 && t > 20.2) { ctx.fillStyle = PAL.red; ctx.globalAlpha = .5 + .5 * Math.sin(t * 16); ctx.fillRect(p.x - w / 2, p.y - w / 2, w, w); ctx.globalAlpha = 1; }
        });
      }
      // the wobbly heart, painted on purpose (with one gap left open)
      if (t >= WOB0) WOB_CELLS.slice(0, Math.floor((t - WOB0) / WOB_EVERY) + 1).forEach((cell, i) => {
        const p = wobXY(cell.r, cell.c), sz = cell.s * outBack(clamp((t - WOB0 - i * WOB_EVERY) / .12));
        ctx.save(); ctx.translate(p.x + cell.dx, p.y + cell.dy); ctx.rotate(cell.rot);
        ctx.fillStyle = cell.col; ctx.fillRect(-sz / 2, -sz / 2, sz, sz); ctx.restore();
      });
      // Mo's easel and the growing stack of finished paintings
      drawEasel(ctx, MO_EASEL, GROUND - 202, MO_CELL * 8);
      MO_CYCLES.forEach((st, i) => {
        const cells = cellsOf(MO_ART[i]), n = clamp(Math.floor((t - st) / .075) + 1, 0, cells.length);
        if (t < st || S.flying.some(f => f.art === i)) return;
        cells.slice(0, n).forEach(c => { ctx.fillStyle = c.col; ctx.fillRect(MO_EASEL - 64 + c.c * MO_CELL + 1, GROUND - 202 + c.r * MO_CELL + 1, MO_CELL - 2, MO_CELL - 2); });
      });
      S.flying.forEach((f, j) => {
        const bo = f.art === 'bo', u = sine(clamp((t - f.t0) / (bo ? .7 : .5))), k0 = bo ? 1.33 : 1;   // Bo's canvas is bigger
        const x = lerp(bo ? EASEL : MO_EASEL, STACK_X + j * 26, u), y = lerp(bo ? GROUND - 164 : GROUND - 138, GROUND - 46, u) - Math.sin(Math.PI * u) * (bo ? 140 : 90);
        ctx.save(); ctx.translate(x, y); ctx.rotate(lerp(0, bo ? .14 : -.18, u)); ctx.scale(lerp(k0, .55, u), lerp(k0, .55, u));
        ctx.fillStyle = '#fff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.rect(-66, -66, 132, 132); ctx.fill(); ctx.stroke();
        const cells = bo ? HEART_CELLS.filter(c => !(c.r === TRIES[2].wrong[0] && c.c === TRIES[2].wrong[1])) : cellsOf(MO_ART[f.art]);
        cells.forEach(c => { ctx.fillStyle = c.col; ctx.fillRect(-64 + c.c * MO_CELL + 1, -64 + c.r * MO_CELL + 1, MO_CELL - 2, MO_CELL - 2); });
        ctx.restore();
      });
    },
    drawFront(S, ctx, t) {
      // the ladybug escapes and loops around before flying off
      if (t > 20.8 && t < 25.5) {
        const p = canvasXY(TRIES[2].wrong[0], TRIES[2].wrong[1]), u = t - 20.8, out = Math.max(0, t - 23.2);
        const x = p.x + Math.sin(u * 2.6) * 70 * Math.min(1, u) + out * 240, y = p.y - Math.min(1, u) * 60 + Math.cos(u * 2.6) * 40 * Math.min(1, u) - out * out * 120;
        const open = Math.floor(t * 14) % 2;
        sprite(ctx, open ? ['X...X', '.KKK.', 'KRKRK', 'RRKRR', '.RRR.'] : ['.....', '.KKK.', 'KRKRK', 'RRKRR', '.RRR.'], x, y, 6.5, { X: PAL.sky, K: '#111', R: PAL.red });
      }
      // ...and comes home: it loops in and settles into the gap Bo left in the wobbly heart
      if (t > BUG) {
        const g = wobXY(GAP.r, GAP.c), u = seg(t, BUG, LAND), e = sine(u), sx = EASEL + 760, sy = GROUND - 720;
        const x = lerp(sx, g.x, e) + Math.sin(u * Math.PI * 2) * 60 * (1 - e), y = lerp(sy, g.y, e) - Math.sin(Math.PI * e) * 50;
        const open = t < LAND && Math.floor(t * 14) % 2;
        sprite(ctx, open ? ['X...X', '.KKK.', 'KRKRK', 'RRKRR', '.RRR.'] : ['.....', '.KKK.', 'KRKRK', 'RRKRR', '.RRR.'], x, y, lerp(6.5, 5, seg(t, LAND - .3, LAND)), { X: PAL.sky, K: '#111', R: PAL.red });
      }
    },
  });

  function drawEasel(ctx, x, top, size) {
    ctx.lineWidth = 6; ctx.strokeStyle = '#111';
    ctx.beginPath(); ctx.moveTo(x - size * .35, GROUND + 2); ctx.lineTo(x, top - 14); ctx.lineTo(x + size * .35, GROUND + 2);
    ctx.moveTo(x, top + size); ctx.lineTo(x + 8, GROUND + 2); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.rect(x - size / 2 - 2, top - 2, size + 4, size + 4); ctx.fill(); ctx.stroke();
  }
})();
