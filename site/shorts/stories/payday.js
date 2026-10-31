/* payday: extracted from ../payday.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['payday'] = story; } });
  // Pen and coloured pencil. Opens on Wobbin bouncing on a heap of coins. "i am rich." Then the bills arrive on little
  // legs, and the coins, who have legs too, follow them out in a line while the day goes by in the sky. By evening
  // there is one coin left, looking back at Wobbin. It buys two spoons and one ice cream.
  const { lerp, seg, sine, outBack, hash, mix, clamp, GROUND, INK, ramp } = Shorts;
  const hand = (...a) => Sketch.hand(...a), hatch = (...a) => Sketch.hatch(...a), lump = (...a) => Sketch.lump(...a), grass = (...a) => Sketch.grass(...a);
  const V = 150, LEAVE = 24.2, OUT = LEAVE + 1.4, LOOP = OUT + 1;
  const N = 30, X0 = 200, BILLS = [[3.1, 'RENT', 14, 1.5, '#e8a0a0'], [6.1, 'LIGHT', 7, 1.15, '#f6e3a8'], [8.9, 'PHONE', 5, 1, '#bcd8ea'], [11.4, '?!', 3, .8, '#c9b6e8']];
  const sky = t => ramp(t, [[0, '#d7ecf5'], [6, '#dcecf0'], [11, '#fbe0b8'], [15, '#f7c6a9'], [20, '#d9cdea'], [24, '#cdd2ec']]);
  // each coin, in the order they leave: when it goes, and with which bill
  const COINS = (() => { const L = []; let i = 0; for (const [at, , n] of BILLS) for (let k = 0; k < n; k++, i++) L.push({ go: at + 1.1 + k * .13, i }); return L; })();
  const left = t => N - COINS.filter(c => t > c.go).length;
  const ROWS = [8, 7, 6, 4, 3, 2];   // a heap: wide at the bottom, the last coins to go are at the base
  const pile = i => { let r = 0, k = i; while (k >= ROWS[r]) { k -= ROWS[r]; r++; } return [X0 + 24 + (k - (ROWS[r] - 1) / 2) * 35 + (r % 2 ? 6 : -4), GROUND - 19 - r * 25]; };
  const heapTop = n => { let r = 0, c = 0; while (r < ROWS.length && c < n) { c += ROWS[r]; r++; } return r ? 18 + r * 25 : 0; };

  function coin(ctx, x, y, r, t, k, eye, legs) {
    if (legs) { ctx.lineWidth = 3.5; ctx.beginPath(); const s = Math.sin(t * 14 + k) * 6; ctx.moveTo(x - 6, y + r - 2); ctx.lineTo(x - 7 + s, y + r + 11); ctx.moveTo(x + 6, y + r - 2); ctx.lineTo(x + 7 - s, y + r + 11); ctx.stroke(); }
    ctx.fillStyle = '#ffcf4d'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(x, y, r * .68, .6, 3.6); ctx.stroke();
    if (eye) { ctx.fillStyle = '#fff'; ctx.lineWidth = 2.8; ctx.beginPath(); ctx.arc(x + eye * 2, y - 2, 6, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + eye * 3.6, y - 2, 2.8, 0, 7); ctx.fill(); }
  }
  function envelope(ctx, x, y, s, name, col, t, k) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round';
    ctx.lineWidth = 5; ctx.beginPath(); const g = Math.sin(t * 9 + k) * 12; ctx.moveTo(-24, -6); ctx.lineTo(-24 + g, 28); ctx.moveTo(24, -6); ctx.lineTo(24 - g, 28); ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(-24 + g + 5, 30, 12, 7, 0, 0, 7); ctx.ellipse(24 - g + 5, 30, 12, 7, 0, 0, 7); ctx.fill();
    hand(ctx, [[-62, -6], [-62, -82], [62, -81], [62, -6]], { fill: col, seed: k + 3, wob: 1.2 });
    ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-61, -80); ctx.lineTo(0, -44); ctx.lineTo(61, -80); ctx.stroke();
    ctx.font = '700 22px "Kevin Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.fillText(name, 0, -16); ctx.textAlign = 'start';
    ctx.fillStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-26, -56, 7, 0, 7); ctx.arc(-10, -56, 7, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(-29, -56, 3, 0, 7); ctx.arc(-13, -56, 3, 0, 7); ctx.fill();
    ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-36, -68); ctx.lineTo(-22, -63); ctx.moveTo(0, -68); ctx.lineTo(-14, -63); ctx.stroke();
    ctx.restore();
  }

  Shorts.play({
    title: 'Payday',
    style: 'pencil',
    accent: '#c9503f',
    hook: 1.3,
    page: [.8, OUT - 1.2, OUT],
    wash: 0,
    loopAfter: LOOP,
    paper: '#ffffff',
    ground: (x, t) => Math.abs(x - X0 - 24) < 110 && t < 15 ? GROUND - heapTop(left(t ?? 0)) : GROUND,
    lineAt: () => GROUND,
    captions: [
      [.2, 2.9, 'i am *rich!*', null, false],
      [3.9, 4.9, '*rent.*'],
      [6.9, 7.9, 'electricity...'],
      [9.7, 10.7, 'phone. ok.'],
      [12.2, 13.5, 'what is *that* one?'],
      [14.6, 15.8, '...hello, little one.'],
      [18.6, 22.9, 'broke by five. *happy anyway.*'],
    ],
    init(S) {
      S.bo = S.addChar({ x: 0, walk: V }); S.bo.space = 0;
      S.pal = S.addChar({ x: 720, hair: 'curl', hairColor: '#a8554f', fill: '#f6d6dc', blush: '#e8a0a0', face: -1 }); S.pal.hidden = true; S.pal.gain = .5; S.pal.space = 0;
      S.bits = [];
    },
    update(S, t, dt) {
      const bo = S.bo, pal = S.pal;
      S.plan(bo, t, [
        [0, { x: 214, speed: V, accel: 900 }],
        [.34, () => bo.jump(170, -1020, 0, false)],
        [1.3, { eye: 'happy' }], [1.32, () => bo.jump(0, -760)], [2.08, () => bo.jump(0, -640)], [2.72, () => bo.jump(0, -520)],
        [3.3, { eye: 'wide', lookX: 1 }],
        [4.8, { eye: 'sad', lookY: .6 }], [5.6, { lookX: 1, lookY: 0, eye: 'open' }],
        [6.5, { eye: 'flat', lookX: 1 }], [8, { lookY: .7 }], [9.4, { eye: 'flat', lookX: 1, lookY: 0 }],
        [12, { eye: 'wide', lookX: 1 }],
        [13.9, { lookX: 1, lookY: .8, eye: 'sad', tilt: .08 }],
        [15.9, { x: 300, speed: 110, tilt: 0, lookY: .5 }],
        [17, { x: 402, speed: 130, eye: 'open', lookX: 1, lookY: 0 }],
        [18, { eye: 'happy' }],
        [23.2, { eye: 'wide', lookX: 0 }], [23.4, { eye: 'happy' }],
        [LEAVE, { x: 1e6, speed: V, accel: 450, eye: 'open', lookX: 0 }], [LEAVE, () => bo.jump(640, -1040)],
      ]);
      S.plan(pal, t, [[17.6, { eye: 'happy', face: -1 }], [18, { lookX: 1 }]]);
      pal.hidden = t < 17.4 || t > OUT;
      if (t > .75 && t < 3.2) { const k = Math.floor(t * 12); S.once('c' + k, () => { if (k % 3 === 0) S.sfx('ding', { pitch: 1568 + (k % 5) * 90, g: .05 }); S.bits.push({ x: X0 + 24 + (hash(k) - .5) * 120, y: GROUND - 260, vy: 120 + hash(k + 1) * 200, r: 16, life: .7, t0: t }); }); }
      for (const q of S.bits) { q.vy += 1400 * dt; q.y += q.vy * dt; }
      BILLS.forEach(([at], i) => { if (t > at) S.once('b' + i, () => S.sfx('knock', { n: 2 }, 500)); });
      for (const c of COINS) if (t > c.go) S.once('g' + c.i, () => { if (c.i % 2 === 0) S.sfx('pop', { pitch: 1100 + c.i * 12, g: .05 }, X0); });
      if (t > 14.6) S.once('look', () => S.sfx('slip', {}, bo.x));
      if (t > 16.4) S.once('bell', () => S.sfx('ding', { pitch: 1319, g: .14 }, 560));
      if (t > 17.9) S.once('take', () => { S.sfx('pop', { pitch: 900, g: .08 }, 530); S.sfx('chime', { n: 7, g: .12 }); });
      if (t > 18.7) S.once('q', () => S.sfx('pad', { root: 293.66, d: 3.6 }));
      if (t > 23.2) S.once('change', () => S.sfx('ding', { pitch: 1760, g: .12 }, bo.x));
      if (t > .6 && t < LEAVE) { S.camGoal.x = t < 15.8 ? 340 : 480; S.camGoal.y = GROUND - 90; S.camGoal.z = t < 15.8 ? .92 : 1; S.camGoal.kz = 2; S.camGoal.kx = 2; }
    },
    drawBack(S, ctx, t, v) {
      ctx.fillStyle = sky(t); ctx.fillRect(v.left - 20, v.top - 20, v.right - v.left + 40, GROUND - v.top + 24);
      // the sun crosses the sky as the money does
      const u = seg(t, 1, 22), sx = lerp(40, 760, u), sy = GROUND - 200 - Math.sin(u * Math.PI) * 300;
      ctx.fillStyle = '#ffc44d'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(sx, sy, 38, 0, 7); ctx.fill(); ctx.stroke();
      lump(ctx, [[120, 240, 26], [156, 226, 36], [196, 240, 26]], '#ffffff', 4); lump(ctx, [[560, 196, 24], [594, 184, 32], [630, 196, 22]], '#ffffff', 4);
      // pavement and a strip of grass, then shop fronts along the street
      ctx.fillStyle = '#d9d2c6'; ctx.fillRect(v.left - 20, GROUND + 4, v.right - v.left + 40, 60); ctx.fillStyle = '#bfe3a8'; ctx.fillRect(v.left - 20, GROUND + 64, v.right - v.left + 40, 800);
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(v.left - 20, GROUND + 64); ctx.lineTo(v.right + 20, GROUND + 64); for (let x = -160; x < 1120; x += 132) { ctx.moveTo(x, GROUND + 6); ctx.lineTo(x - 16, GROUND + 62); } ctx.stroke();
      ctx.lineWidth = 6; hand(ctx, [[-170, GROUND + 3], [-170, GROUND - 320], [120, GROUND - 318], [120, GROUND + 3]], { fill: '#e7c9a6', seed: 3 });
      hand(ctx, [[-188, GROUND - 318], [138, GROUND - 320], [138, GROUND - 292], [-188, GROUND - 290]], { fill: '#c98f5a', seed: 4 });
      // the cash machine set into the wall: where all the coins came from
      ctx.lineWidth = 5; hand(ctx, [[-90, GROUND - 234], [64, GROUND - 236], [64, GROUND - 78], [-90, GROUND - 76]], { fill: '#7fa3b8', seed: 5 });
      hand(ctx, [[-68, GROUND - 216], [42, GROUND - 216], [42, GROUND - 146], [-68, GROUND - 146]], { fill: '#e8f6df', seed: 6, wob: 1.2 });
      ctx.font = '700 26px "Kevin Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.fillText(t < 3 ? 'PAYDAY' : 'BYE', -13, GROUND - 170); ctx.textAlign = 'start';
      ctx.fillStyle = '#3a2f2a'; ctx.fillRect(-66, GROUND - 120, 106, 14);
      // the ice cream cart rolls in just when it's needed, under its own umbrella
      const cu = 1 - (1 - seg(t, 15.8, 17)) ** 3;
      if (cu > 0) { ctx.save(); ctx.translate((1 - cu) * 520, 0);
      ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(560, GROUND - 74); ctx.lineTo(560, GROUND - 270); ctx.stroke();
      const seg6 = 6; for (let i = 0; i < seg6; i++) { ctx.fillStyle = i % 2 ? '#fff4e0' : '#e8a0a0'; ctx.beginPath(); ctx.moveTo(560, GROUND - 306); ctx.lineTo(480 + i * 160 / seg6, GROUND - 252); ctx.lineTo(480 + (i + 1) * 160 / seg6, GROUND - 252); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      hand(ctx, [[490, GROUND - 26], [490, GROUND - 124], [632, GROUND - 123], [632, GROUND - 26]], { fill: '#fff4e0', seed: 7 });
      ctx.font = '700 22px "Kevin Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#c9503f'; ctx.fillText('ICE CREAM', 561, GROUND - 68); ctx.textAlign = 'start';
      for (const x of [516, 606]) { ctx.fillStyle = '#3f3a44'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, GROUND - 18, 18, 0, 7); ctx.fill(); ctx.stroke(); }
      ctx.restore(); }
      grass(ctx, [[150, GROUND - 1], [440, GROUND - 1], [660, GROUND - 1], [700, GROUND - 1]]);
      // the pile, thinning from the top
      const n = left(t);
      for (let i = 0; i < n; i++) { const [x, y] = pile(i); coin(ctx, x, y, 19, t, i, 0, false); }
      // the coins that fell in the opening
      for (const q of S.bits) { if (t < q.t0 + q.life && q.y < GROUND) coin(ctx, q.x, q.y, 16, t, 1, 0, false); }
      // a line of coins following the bills out
      let i = 0;
      for (const c of COINS) {
        const a = t - c.go, [px, py] = pile(N - 1 - c.i);
        if (a > 0 && a < 2.6) { const k = seg(a, 0, 2.6), x = lerp(px, 900, k), up = Math.abs(Math.sin(a * 9 + c.i)) * 26, y = lerp(py, GROUND - 34, Math.min(1, a * 3)) - up; coin(ctx, x, y, 17, t, c.i, 1, true); }
        i++;
      }
      // the last one: walks a few steps, stops, looks back
      if (t > 14 && t < 17.9) { const x = lerp(pile(0)[0], 372, sine(seg(t, 13.6, 16.8))), y = GROUND - 30 - Math.abs(Math.sin(t * 7)) * (t < 15.5 || t > 16 ? 12 : 0), f = t > 14.6 && t < 15.9 ? -1 : 1; coin(ctx, x, y, 19, t, 0, f, true); }
      if (t >= 17.9 && t < 18.3) { const k = seg(t, 17.9, 18.3); coin(ctx, lerp(372, 540, k), GROUND - 30 - Math.sin(k * Math.PI) * 120, 19, t, 0, 1, false); }
    },
    drawFront(S, ctx, t, v) {
      // each bill walks in from the right, stands there, and leads its coins away
      BILLS.forEach(([at, name, n, s, c], i) => {
        const a = t - at; if (a < 0 || a > 3.6) return;
        const x = a < .8 ? lerp(760, 470, sine(a / .8)) : lerp(470, 980, seg(a, 1.5, 3.4)), y = GROUND - 30 * s;
        envelope(ctx, x, y, s, name, c, t, i);
      });
      // one ice cream, two spoons, on the cart
      if (t > 18) {
        const u = outBack(seg(t, 18, 18.4)), x = 528, y = GROUND - 124;
        ctx.save(); ctx.translate(x, y); ctx.scale(u, u); ctx.lineWidth = 4;
        ctx.fillStyle = '#e9b777'; ctx.beginPath(); ctx.moveTo(-18, -34); ctx.lineTo(0, 2); ctx.lineTo(18, -34); ctx.closePath(); ctx.fill(); ctx.stroke();
        lump(ctx, [[-10, -46, 15], [10, -46, 15], [0, -62, 15]], '#ffc0cf', 4);
        ctx.lineWidth = 4; ctx.strokeStyle = '#8a8f96'; ctx.beginPath(); ctx.moveTo(-26, -84); ctx.lineTo(-8, -62); ctx.moveTo(28, -84); ctx.lineTo(8, -62); ctx.stroke(); ctx.strokeStyle = INK; ctx.restore();
      }
      // the change: one small coin bounces back and everybody cheers
      if (t > 23.2 && t < LEAVE + .3) { const k = seg(t, 23.2, 23.9), b = S.bo.top(); coin(ctx, lerp(540, b.x, k), lerp(GROUND - 150, b.y - 24, k) - Math.sin(k * Math.PI) * 110, 13, t, 0, 0, false); }
    },
  });
})();
