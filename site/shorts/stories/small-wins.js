/* small-wins: extracted from ../small-wins.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['small-wins'] = story; } });
  // Graphite into crayon. The world is a pencil sketch, and every tiny win Wobbin hops about scribbles a piece of it
  // into colour. Matching socks. Toast not burnt. The bus, on time. Then a bird. A friend calls it good luck, and the
  // biggest hop of the day takes the whole street. Button: the bird does it again, to the friend.
  const { lerp, seg, sine, outBack, outCubic, hash, mix, clamp, GROUND, INK } = Shorts;
  const hand = (...a) => Sketch.hand(...a), lump = (...a) => Sketch.lump(...a), grass = (...a) => Sketch.grass(...a), tiles = (...a) => Sketch.tiles(...a);
  const V = 150, SPLAT = 11.9, BIG = 15.2, LEAVE = 23.2, OUT = LEAVE + 1.4, LOOP = OUT + 1;
  const K = ['#ff5a4d', '#ffb12e', '#ffe03d', '#3fc66b', '#3f9be8', '#a06be0'];
  const TOAST = 560, STOP = 1010;

  function pop(S, x, y, R, dur, n) {
    S.sp.push({ x, y, R, t0: S.t, dur });
    S.burst(x, y + 20, n, K, { speed: 420 + R * .1, size: 13, life: .8, gravity: 1200 });
    S.sfx('sparkle', { n: 4 }, x);
  }
  function house(ctx, x0, x1, roof, wall, seed) {
    ctx.lineWidth = 6; hand(ctx, [[x0, GROUND + 3], [x0, GROUND - 320], [x1, GROUND - 318], [x1, GROUND + 3]], { fill: wall, seed });
  }

  Shorts.play({
    title: 'Small Wins',
    style: { a: 'sketch', b: 'crayon' },
    accent: '#e8503f',
    hook: 1.5,
    page: [.8, OUT - 1.2, OUT],
    wash: 0,
    loopAfter: LOOP,
    paper: '#ffffff',
    captions: [
      [.2, 3, "today's win: *matching socks.*", null, false],
      [5.2, 6.8, 'toast: *not burnt.*'],
      [9.3, 10.8, 'the bus: *on time.*'],
      [12.3, 13.3, '...*oh.*'],
      [13.7, 15, "that's good luck!", null, { pitch: 1.3 }],
      [15.8, 16.8, '*win!*'],
      [17.4, 21.4, 'small wins count. *so count them.*'],
    ],
    init(S) {
      S.bo = S.addChar({ x: 0, walk: V });
      S.pal = S.addChar({ x: 1380, hair: 'tuft', hairColor: '#e8504a', fill: '#ffd84d', blush: '#ff8a7a', face: -1 }); S.pal.hidden = true; S.pal.gain = .5;
      S.sp = []; S.lands = 0; S.drop = 0;
    },
    mix(S, m, t) { Sketch.reveal(m, S.sp, t); },
    update(S, t, dt) {
      const bo = S.bo, pal = S.pal;
      S.plan(bo, t, [
        [0, { x: 120, speed: V, accel: 900 }],
        [.9, { lookY: 1, lookX: .4, eye: 'wide' }],
        [1.3, { eye: 'happy', lookY: .6 }], [1.3, () => { bo.jump(0, -780); pop(S, 120, GROUND - 60, 300, .8, 16); S.sfx('chime', { n: 7, g: .12 }); }],
        [2.25, () => bo.jump(0, -520)],
        [3.3, { x: 470, speed: 240, accel: 700, eye: 'open', lookX: 0, lookY: 0 }],
        [4.9, () => { S.sfx('ding', { pitch: 1568, g: .14 }, TOAST); }], [5, { lookX: 1, lookY: -.5, eye: 'wide' }],
        [5.6, { eye: 'happy' }], [5.6, () => { bo.jump(0, -780); pop(S, TOAST - 20, GROUND - 90, 320, .8, 16); }],
        [7.1, { x: 880, speed: 280, accel: 800, eye: 'open', lookX: 0, lookY: 0 }],
        [9.6, { eye: 'happy', lookX: 1 }], [9.6, () => { bo.jump(0, -840); pop(S, STOP - 40, GROUND - 90, 380, .8, 18); }],
        [10.9, { x: 1190, speed: 220, accel: 700, eye: 'open', lookX: 0 }],
        [SPLAT, { eye: 'wide' }], [SPLAT, () => { S.sfx('squish', {}, bo.x); bo.q.v += 2.6; S.shake(3); }],
        [12.6, { eye: 'sad', lookY: -.8, tilt: .06 }],
        [15, { eye: 'squeeze', crouch: .24, tilt: 0, lookX: 1, lookY: 0 }],
        [BIG, { crouch: 0, eye: 'happy' }], [BIG, () => { bo.jump(0, -1150, Math.PI * 2); S.sfx('whoosh', { d: .6 }, bo.x); }],
        [17, { lookX: 1 }],
        [21.7, { eye: 'wide', lookX: 1, lookY: -.3 }], [22.4, { eye: 'happy' }],
        [LEAVE, { x: 1e6, speed: V, accel: 450, eye: 'open', lookX: 0, lookY: 0 }], [LEAVE, () => bo.jump(640, -1040)],
      ]);
      S.plan(pal, t, [[13.2, { x: 1380, face: -1, eye: 'happy' }], [15.3, () => pal.jump(0, -760)], [21.7, { eye: 'wide', lookY: -.8 }], [22.4, { eye: 'flat' }]]);
      pal.hidden = t < 13 || t > OUT;
      if (bo.lands > S.lands) { const was = S.lands; S.lands = bo.lands; if (t > BIG && t < BIG + 1.3) { pop(S, 1300, GROUND - 60, 1700, 1.8, 40); S.shake(8); S.sfx('splash', {}, bo.x); S.sfx('swell', { root: 392 }); S.sfx('birds', { d: 8, g: .8 }); } else if (t > 1) S.sfx('tap', {}, bo.x); }
      if (t > 3.1) S.once('w1', () => S.sfx('tock', { f: 520 }));
      if (t > 8.2) S.once('bus', () => S.sfx('bus', {}, STOP + 100));
      if (t > 17.5) S.once('q', () => S.sfx('pad', { root: 293.66, d: 3.6 }));
      if (t > 22) S.once('s2', () => { S.sfx('squish', {}, pal.x); pal.q.v += 2.4; });
      if (t > 22.5) S.once('l', () => S.sfx('laugh', { n: 3 }));
      if (t > .5 && t < 3.3) { S.camGoal.x = 190; S.camGoal.z = 1; }
      else if (t >= 3.3 && t < 12) { S.camGoal.x = bo.x + 80; S.camGoal.z = .94; S.camGoal.kx = 3; }
      else if (t >= 12 && t < LEAVE) { S.camGoal.x = 1290; S.camGoal.z = t > BIG ? .82 : .96; S.camGoal.y = t > BIG ? GROUND - 90 : GROUND; S.camGoal.kx = 3; S.camGoal.kz = 1.6; }
    },
    drawBack(S, ctx, t, v) {
      // everything is always painted in full colour. The mask decides what shows as crayon
      ctx.fillStyle = '#9ed8f7'; ctx.fillRect(v.left - 20, v.top - 20, v.right - v.left + 40, GROUND - v.top + 24);
      ctx.lineWidth = 5; ctx.fillStyle = '#ffe03d'; ctx.beginPath(); ctx.arc(1180, GROUND - 470, 62, 0, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#ffb12e'; ctx.lineWidth = 10; ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; ctx.moveTo(1180 + Math.cos(a) * 80, GROUND - 470 + Math.sin(a) * 80); ctx.lineTo(1180 + Math.cos(a) * 108, GROUND - 470 + Math.sin(a) * 108); } ctx.stroke(); ctx.strokeStyle = INK;
      lump(ctx, [[820, 250, 34], [868, 232, 48], [920, 250, 34]], '#ffffff', 5); lump(ctx, [[1500, 220, 34], [1550, 204, 44], [1596, 222, 32]], '#ffffff', 5);
      ctx.fillStyle = '#8fd878'; ctx.fillRect(v.left - 20, GROUND + 60, v.right - v.left + 40, 800);
      ctx.fillStyle = '#d9d2c6'; ctx.fillRect(v.left - 20, GROUND + 4, v.right - v.left + 40, 56);
      ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(v.left - 20, GROUND + 60); ctx.lineTo(v.right + 20, GROUND + 60); for (let x = -80; x < 1700; x += 150) { ctx.moveTo(x, GROUND + 6); ctx.lineTo(x - 18, GROUND + 58); } ctx.stroke();
      for (let i = 0; i < 26; i++) { const x = -60 + i * 72 + hash(i) * 30, y = GROUND + 100 + hash(i + .4) * 250; ctx.fillStyle = K[i % 5]; for (let k = 0; k < 5; k++) { const a = k * 1.257; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 9, y + Math.sin(a) * 9, 7, 0, 7); ctx.fill(); } ctx.fillStyle = '#ffe03d'; ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fill(); }
      // the house, cut open: bedroom, then the kitchen with its toaster
      ctx.lineWidth = 6; hand(ctx, [[-110, GROUND + 3], [-110, GROUND - 330], [730, GROUND - 328], [730, GROUND + 3]], { fill: '#ffe08a', seed: 3 });
      hand(ctx, [[-140, GROUND - 328], [310, GROUND - 470], [760, GROUND - 326]], { fill: '#ef8a3c', seed: 4, over: 10 });
      ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(330, GROUND); ctx.lineTo(330, GROUND - 330); ctx.stroke();
      // a bed, a drawer open, and socks on the floor where the pairs were found
      hand(ctx, [[-80, GROUND - 62], [70, GROUND - 62], [70, GROUND - 22], [-80, GROUND - 22]], { fill: '#ffffff', seed: 6 }); hand(ctx, [[-96, GROUND + 1], [-96, GROUND - 130], [-74, GROUND - 130], [-74, GROUND + 1]], { fill: '#a56a3a', seed: 7 });
      ctx.lineWidth = 5; hand(ctx, [[-60, GROUND - 240], [40, GROUND - 240], [40, GROUND - 160], [-60, GROUND - 160]], { fill: '#bfe6ff', seed: 8 });
      hand(ctx, [[220, GROUND + 1], [220, GROUND - 120], [312, GROUND - 120], [312, GROUND + 1]], { fill: '#a56a3a', seed: 9 }); hand(ctx, [[228, GROUND - 98], [304, GROUND - 98], [316, GROUND - 76], [216, GROUND - 76]], { fill: '#d4985c', seed: 10 });
      // the kitchen: the counter, the toaster, a window
      hand(ctx, [[420, GROUND + 1], [420, GROUND - 106], [716, GROUND - 106], [716, GROUND + 1]], { fill: '#ffb7b0', seed: 11 }); hand(ctx, [[406, GROUND - 106], [728, GROUND - 106], [728, GROUND - 120], [406, GROUND - 120]], { fill: '#e8e0d2', seed: 12 });
      const pu = seg(t, 4.9, 5.15), py = GROUND - 170 - (pu - (pu > .7 ? (pu - .7) * 1 : 0)) * 54;
      if (pu > 0) { ctx.lineWidth = 4; hand(ctx, [[TOAST - 26, py + 30], [TOAST - 28, py - 12], [TOAST + 28, py - 13], [TOAST + 26, py + 30]], { fill: '#e8a54c', seed: 13, wob: 1.2 }); }
      ctx.lineWidth = 5; hand(ctx, [[TOAST - 58, GROUND - 120], [TOAST - 54, GROUND - 180], [TOAST + 54, GROUND - 180], [TOAST + 58, GROUND - 120]], { fill: '#d7dde0', seed: 14 });
      hand(ctx, [[480, GROUND - 290], [660, GROUND - 290], [660, GROUND - 180], [480, GROUND - 180]], { fill: '#9ed8f7', seed: 15 });
      // the street: a tree, a stop sign for the bus, a low wall
      ctx.lineWidth = 6; hand(ctx, [[770, GROUND + 3], [778, GROUND - 130], [794, GROUND - 130], [802, GROUND + 3]], { fill: '#a56a3a', seed: 16, over: 3 }); lump(ctx, [[786, GROUND - 200, 74], [740, GROUND - 142, 46], [832, GROUND - 142, 46]], '#49c06a', 6);
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(STOP, GROUND + 2); ctx.lineTo(STOP, GROUND - 210); ctx.stroke();
      hand(ctx, [[STOP - 38, GROUND - 210], [STOP + 38, GROUND - 212], [STOP + 38, GROUND - 268], [STOP - 38, GROUND - 266]], { fill: '#3f9be8', seed: 18 }); grass(ctx, [[790, GROUND], [STOP + 6, GROUND], [1440, GROUND]]);
      // the houses across the road, and the bird's perch
      ctx.lineWidth = 6; hand(ctx, [[1120, GROUND + 3], [1120, GROUND - 240], [1460, GROUND - 238], [1460, GROUND + 3]], { fill: '#a8e4d8', seed: 19 });
      hand(ctx, [[1094, GROUND - 238], [1290, GROUND - 380], [1486, GROUND - 236]], { fill: '#3f8fb8', seed: 20, over: 10 });
      ctx.lineWidth = 5; for (const [a, b] of [[1170, 1250], [1340, 1420]]) hand(ctx, [[a, GROUND - 200], [b, GROUND - 200], [b, GROUND - 120], [a, GROUND - 120]], { fill: '#ffe9a6', seed: a });
      hand(ctx, [[1560, GROUND + 3], [1560, GROUND - 280], [1960, GROUND - 278], [1960, GROUND + 3]], { fill: '#d8c3f2', seed: 22 });
      // the bus rolls in right on time, and away again
      const bx = lerp(1900, STOP + 200, outCubic(seg(t, 8.1, 9.5))) + (t > 10.9 ? (seg(t, 10.9, 12.2) ** 2) * 1400 : 0);
      if (t > 8) { ctx.lineWidth = 6; hand(ctx, [[bx - 170, GROUND - 26], [bx - 170, GROUND - 190], [bx + 230, GROUND - 188], [bx + 230, GROUND - 26]], { fill: '#ff7a4d', seed: 23 }); ctx.lineWidth = 5; for (let i = 0; i < 4; i++) hand(ctx, [[bx - 150 + i * 92, GROUND - 170], [bx - 80 + i * 92, GROUND - 170], [bx - 80 + i * 92, GROUND - 110], [bx - 150 + i * 92, GROUND - 110]], { fill: '#d9f1ff', seed: i + 24 }); for (const x of [bx - 100, bx + 160]) { ctx.fillStyle = '#3f3a44'; ctx.beginPath(); ctx.arc(x, GROUND - 24, 26, 0, 7); ctx.fill(); ctx.stroke(); } }
    },
    drawFront(S, ctx, t, v) {
      const bo = S.bo;
      // the matching socks, on Wobbin's feet the whole film, colour showing only once it's been won
      if (t > .75 && t < OUT) { ctx.fillStyle = '#ff5a4d'; ctx.lineWidth = 3; for (const F of bo.feet) { ctx.beginPath(); ctx.arc(F.x + 2, F.y - 18, 8.4, 0, 7); ctx.fill(); ctx.stroke(); } }
      // the bird, and what it does
      const bir = seg(t, 10.6, 11.5), fly = t > 22.6 ? seg(t, 22.6, 23.4) : 0, x = lerp(1560, S.bo.x + 34, sine(bir)) + fly * 500, y = lerp(GROUND - 420, GROUND - 330, sine(bir)) - fly * 240;
      if (t > 10.6 && t < 23.4) Shorts.bird(ctx, x, y, 6, { X: '#3f9be8', O: '#ffb12e' }, 1, t > 11.6 && t < 21.5 ? 0 : 9, -1);
      if (t > SPLAT - .4 && t < 15) { const top = bo.top(), k = seg(t, SPLAT - .4, SPLAT), yy = lerp(y + 12, top.y + 2, k * k); if (k < 1) { ctx.fillStyle = '#ffffff'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.ellipse(lerp(x, top.x, k), yy, 7, 10, 0, 0, 7); ctx.fill(); ctx.stroke(); } else { lump(ctx, [[top.x - 8, top.y + 8, 11], [top.x + 8, top.y + 12, 13], [top.x, top.y + 22, 8]], '#ffffff', 3.5); } }
      if (t > 22 && t < 23.2) { const p = S.pal.top(); lump(ctx, [[p.x - 8, p.y + 8, 11], [p.x + 8, p.y + 12, 13], [p.x, p.y + 22, 8]], '#ffffff', 3.5); }
    },
  });
})();
