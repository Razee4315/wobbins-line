/* scribble: extracted from ../scribble.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['scribble'] = story; } });
  // Pencil into crayon. One tiny crayon flower on a long grey wall. Wobbin tries to rub it off and only spreads it. A kid
  // adds a sun, Wobbin looks both ways and adds a leaf, and soon the whole street is drawing. Then the neighbour
  // storms out: "who did this?" Everyone points. The neighbour takes the crayon, and adds a cat.
  const { lerp, seg, sine, outBack, outCubic, hash, mix, clamp, GROUND, INK } = Shorts;
  const hand = (...a) => Sketch.hand(...a), lump = (...a) => Sketch.lump(...a), grass = (...a) => Sketch.grass(...a);
  const V = 150, LEAVE = 23, OUT = LEAVE + 1.4, LOOP = OUT + 1;
  const K = ['#ff5a4d', '#ffb12e', '#ffe03d', '#3fc66b', '#3f9be8', '#a06be0'];
  const W0 = -300, W1 = 1200, TOP = GROUND - 330, FX = 240;
  // what gets drawn on the wall, and when. Each one brings its patch of colour with it
  const ART = [
    { t: 3.4, x: FX, y: GROUND - 150, R: 150, what: 'smear' }, { t: 5.2, x: FX + 30, y: GROUND - 150, R: 230, what: 'smear' }, { t: 7, x: FX + 40, y: GROUND - 160, R: 320, what: 'smear' },
    { t: 9.8, x: 640, y: GROUND - 220, R: 180, what: 'sun' }, { t: 11.8, x: 260, y: GROUND - 120, R: 80, what: 'leaf' },
    { t: 13, x: 830, y: GROUND - 130, R: 200, what: 'boat' }, { t: 13.6, x: 40, y: GROUND - 180, R: 210, what: 'whale' }, { t: 14.2, x: 480, y: GROUND - 120, R: 200, what: 'house' }, { t: 14.8, x: 300, y: GROUND - 150, R: 1100, what: 'all' },
  ];

  function art(ctx, a, t) {
    const u = outBack(seg(t, a.t, a.t + .4)), x = a.x, y = a.y; if (u <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(u, u); ctx.lineWidth = 6; ctx.lineJoin = 'round';
    if (a.what === 'sun') { ctx.fillStyle = '#ffe03d'; ctx.beginPath(); ctx.arc(0, 0, 54, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#ffb12e'; ctx.lineWidth = 11; ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i * .628; ctx.moveTo(Math.cos(r) * 68, Math.sin(r) * 68); ctx.lineTo(Math.cos(r) * 94, Math.sin(r) * 94); } ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(-16, -8, 5, 0, 7); ctx.moveTo(21, -8); ctx.arc(16, -8, 5, 0, 7); ctx.moveTo(-20, 14); ctx.quadraticCurveTo(0, 32, 20, 14); ctx.stroke(); }
    if (a.what === 'leaf') { ctx.fillStyle = '#3fc66b'; ctx.beginPath(); ctx.moveTo(-34, 4); ctx.quadraticCurveTo(0, -30, 34, 0); ctx.quadraticCurveTo(0, 28, -34, 4); ctx.fill(); ctx.stroke(); }
    if (a.what === 'boat') { ctx.fillStyle = '#3f9be8'; ctx.beginPath(); ctx.moveTo(-120, 60); ctx.quadraticCurveTo(-40, 26, 40, 60); ctx.quadraticCurveTo(100, 90, 150, 56); ctx.lineTo(150, 110); ctx.lineTo(-120, 110); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ff5a4d'; ctx.beginPath(); ctx.moveTo(-70, 40); ctx.lineTo(70, 40); ctx.lineTo(44, 74); ctx.lineTo(-48, 74); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(0, -60); ctx.stroke(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(4, -56); ctx.lineTo(66, 28); ctx.lineTo(4, 28); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    if (a.what === 'whale') { ctx.fillStyle = '#a06be0'; ctx.beginPath(); ctx.moveTo(-96, 26); ctx.quadraticCurveTo(-90, -48, 0, -48); ctx.quadraticCurveTo(84, -48, 96, 2); ctx.lineTo(136, -36); ctx.lineTo(132, 34); ctx.quadraticCurveTo(40, 64, -40, 56); ctx.quadraticCurveTo(-90, 52, -96, 26); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-50, -8, 10, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(-53, -8, 4.5, 0, 7); ctx.fill(); ctx.strokeStyle = '#3f9be8'; ctx.beginPath(); ctx.moveTo(-10, -52); ctx.quadraticCurveTo(-26, -84, -44, -76); ctx.moveTo(-10, -52); ctx.quadraticCurveTo(6, -84, 22, -76); ctx.stroke(); ctx.strokeStyle = INK; }
    if (a.what === 'house') { ctx.fillStyle = '#ffb7b0'; ctx.fillRect(-50, -20, 100, 86); ctx.strokeRect(-50, -20, 100, 86); ctx.fillStyle = '#d9534f'; ctx.beginPath(); ctx.moveTo(-64, -20); ctx.lineTo(0, -74); ctx.lineTo(64, -20); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#3f9be8'; ctx.fillRect(-14, 16, 28, 50); ctx.strokeRect(-14, 16, 28, 50); }
    ctx.restore();
  }
  function flower(ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineWidth = 5; ctx.strokeStyle = '#3fc66b'; ctx.beginPath(); ctx.moveTo(0, 8); ctx.quadraticCurveTo(-6, 34, 2, 60); ctx.stroke(); ctx.strokeStyle = INK;
    ctx.fillStyle = '#ff5a4d'; for (let k = 0; k < 6; k++) { const a = k * 1.047; ctx.beginPath(); ctx.arc(Math.cos(a) * 15, Math.sin(a) * 15, 11, 0, 7); ctx.fill(); ctx.lineWidth = 3.5; ctx.stroke(); }
    ctx.fillStyle = '#ffe03d'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
  }

  Shorts.play({
    title: 'Scribble',
    style: { a: 'sketch', b: 'crayon' },
    accent: '#e8503f',
    hook: 1.5,
    page: [.8, OUT - 1.2, OUT],
    wash: 0,
    loopAfter: LOOP,
    paper: '#ffffff',
    captions: [
      [.2, 3, 'who drew *on the wall?*', null, false],
      [3.3, 4.4, "i'll rub it off."],
      [7.2, 8.4, "it's *spreading.*"],
      [9.3, 10.5, 'nice!', null, { pitch: 1.45 }],
      [11.1, 11.7, '...'],
      [16.1, 17.5, 'WHO DID THIS?', null, { pitch: .72 }],
      [19.2, 22.7, 'some walls are just *waiting.*'],
    ],
    init(S) {
      S.bo = S.addChar({ x: 0, walk: V }); S.bo.space = 0;
      S.kid = S.addChar({ x: 760, hair: 'curl', hairColor: '#e8504a', fill: '#ffd84d', blush: '#ff8a7a', face: -1 }); S.kid.hidden = true; S.kid.space = 0; S.kid.gain = .5;
      S.old = S.addChar({ x: 1040, hair: 'antenna', hairColor: '#7a7a8a', fill: '#d9c8ef', face: -1 }); S.old.hidden = true; S.old.space = 0; S.old.gain = .6;
      S.sp = [{ x: FX, y: GROUND - 150, R: 70, t0: 0, dur: .6 }];
      S.done = {};
    },
    mix(S, m, t) { Sketch.reveal(m, S.sp, t); },
    update(S, t, dt) {
      const bo = S.bo, kid = S.kid, old = S.old;
      S.plan(bo, t, [
        [0, { x: 96, speed: V, accel: 1000 }],
        [.85, { eye: 'wide', lookX: 1, lookY: -.3 }], [1.6, { eye: 'flat' }],
        [3.1, { x: 150, speed: 150, eye: 'squeeze', tilt: .2 }],
        [3.6, { x: 330, speed: 520, accel: 3000 }], [4.2, { x: 150, speed: 520, accel: 3000 }], [4.8, { x: 340, speed: 620, accel: 3400 }], [5.4, { x: 130, speed: 620, accel: 3400 }],
        [6, { x: 350, speed: 720, accel: 3800 }], [6.6, { x: 120, speed: 720, accel: 3800 }],
        [7.15, { eye: 'wide', tilt: 0, lookX: 1, lookY: 0 }],
        [8.8, { eye: 'flat', lookX: 1 }], [10.6, { eye: 'open' }],
        [10.9, { x: 196, speed: 110, lookX: -1 }], [11.2, { lookX: 1 }], [11.5, { lookX: 0, lookY: -.3 }],
        [12, { eye: 'happy' }],
        [15.9, { eye: 'wide', lookX: 1 }], [16.9, { eye: 'flat', crouch: .12 }], [17.9, { eye: 'wide', crouch: 0 }], [18.8, { eye: 'happy' }],
        [LEAVE, { x: 1e6, speed: V, accel: 450, eye: 'open', lookX: 0 }], [LEAVE, () => { bo.jump(1060, -1090); S.sfx('whoosh', { d: .5, v: .5 }, bo.x); }],
      ]);
      S.plan(kid, t, [[8.7, { x: 640, speed: 260, accel: 900, eye: 'happy' }], [9.5, () => kid.jump(0, -640)], [12.6, { x: 500, speed: 170 }], [16.8, { eye: 'wide', lookX: -1 }], [18.8, { eye: 'happy' }]]);
      kid.hidden = t < 8.6 || t > OUT;
      S.plan(old, t, [[15.6, { x: 830, speed: 240, accel: 900, eye: 'flat' }], [15.5, () => S.sfx('door', {}, 1040)], [17.5, { x: 780, speed: 120, lookX: 0, lookY: 0 }], [18.5, { eye: 'open' }], [18.9, { eye: 'happy' }]]);
      old.hidden = t < 15.5 || t > OUT;
      ART.forEach((a, i) => { if (t > a.t) S.once('art' + i, () => { S.sp.push({ x: a.x, y: a.y, R: a.R, t0: t, dur: a.what === 'all' ? 1.4 : .5 }); if (a.what === 'all') { S.sfx('swell', { root: 392 }); S.burst(400, GROUND - 200, 26, K, { speed: 560, size: 14, life: 1, gravity: 1000 }); } else if (a.what === 'smear') S.sfx('scribble', {}, bo.x); else S.sfx('pop', { pitch: 800 + i * 80, g: .08 }, a.x); }); });
      if (t > 12.6) S.once('c1', () => S.sfx('scribble', {}, 830));
      if (t > 18.4) S.once('cat', () => S.sfx('scribble', {}, 680));
      if (t > 18.9) S.once('l', () => S.sfx('laugh', { n: 3 }));
      if (t > 19.3) S.once('q', () => S.sfx('pad', { root: 293.66, d: 3 }));
      if (t > 22.5) S.once('m', () => S.sfx('hum', { notes: [5, 7, 9], gap: .2, g: .03 }));
      if (t > .5 && t < 8.6) { S.camGoal.x = 240; S.camGoal.y = GROUND - 110; S.camGoal.z = t < 3 ? 1.14 : 1; S.camGoal.kz = 2; }
      else if (t >= 8.6 && t < 12.6) { S.camGoal.x = t < 10.8 ? 460 : 280; S.camGoal.y = GROUND - 110; S.camGoal.z = .96; S.camGoal.kx = 3; }
      else if (t >= 12.6 && t < 16) { S.camGoal.x = 460; S.camGoal.y = GROUND - 120; S.camGoal.z = .66; S.camGoal.kx = 2.4; S.camGoal.kz = 2; }
      else if (t >= 16 && t < LEAVE) { S.camGoal.x = 490; S.camGoal.y = GROUND - 120; S.camGoal.z = .78; S.camGoal.kx = 2; S.camGoal.kz = 2; }
    },
    drawBack(S, ctx, t, v) {
      ctx.fillStyle = '#b8e4fa'; ctx.fillRect(v.left - 20, v.top - 20, v.right - v.left + 40, GROUND - v.top + 24);
      lump(ctx, [[60, 180, 28], [100, 166, 38], [146, 182, 28]], '#ffffff', 4); lump(ctx, [[760, 176, 28], [806, 160, 38], [846, 178, 26]], '#ffffff', 4);
      ctx.fillStyle = '#8fd878'; ctx.fillRect(v.left - 20, GROUND + 60, v.right - v.left + 40, 800);
      ctx.fillStyle = '#d9d2c6'; ctx.fillRect(v.left - 20, GROUND + 4, v.right - v.left + 40, 56);
      ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(v.left - 20, GROUND + 60); ctx.lineTo(v.right + 20, GROUND + 60); for (let x = -300; x < 1300; x += 150) { ctx.moveTo(x, GROUND + 6); ctx.lineTo(x - 18, GROUND + 58); } ctx.stroke();
      // the long wall: hand-laid blocks, a coping along the top, a door at the far end
      ctx.lineWidth = 6; hand(ctx, [[W0, GROUND + 3], [W0, TOP], [W1, TOP + 3], [W1, GROUND + 3]], { fill: '#efe7d6', seed: 3 });
      ctx.lineWidth = 2.6; ctx.beginPath(); for (let r = 0; r < 7; r++) { const y = TOP + 26 + r * 46; for (let i = 0; i < 16; i++) { if (hash(r * 3 + i) < .45) continue; const x = W0 + 20 + i * 104 + (r % 2) * 52; ctx.moveTo(x, y); ctx.lineTo(x + 60, y); } } ctx.stroke();
      ctx.lineWidth = 6; hand(ctx, [[W0 - 12, TOP - 16], [W1 + 12, TOP - 14], [W1 + 12, TOP + 8], [W0 - 12, TOP + 6]], { fill: '#d4c8b4', seed: 4, over: 8 });
      hand(ctx, [[1000, GROUND + 3], [1000, GROUND - 210], [1090, GROUND - 210], [1090, GROUND + 3]], { fill: '#7fb8a8', seed: 5 });
      grass(ctx, [[-240, GROUND], [-30, GROUND], [420, GROUND], [720, GROUND], [960, GROUND], [1150, GROUND]]);
      // the first flower, then everyone else's
      flower(ctx, FX, GROUND - 170, 1.1, t);
      for (const a of ART) if (t > a.t && a.what !== 'smear' && a.what !== 'all') art(ctx, a, t);
      // the neighbour's cat, added with a very straight face
      const c = seg(t, 18.4, 18.8);
      if (c > 0) { const x = 680, y = GROUND - 92; ctx.save(); ctx.translate(x, y); ctx.scale(outBack(c), outBack(c)); ctx.lineWidth = 5; ctx.fillStyle = '#ffb12e'; ctx.beginPath(); ctx.ellipse(0, 18, 34, 22, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(-26, -6, 19, 0, 7); ctx.moveTo(-42, -16); ctx.lineTo(-40, -36); ctx.lineTo(-27, -24); ctx.lineTo(-14, -36); ctx.lineTo(-11, -16); ctx.fill(); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(34, 18); ctx.quadraticCurveTo(60, 10, 52, -14); ctx.moveTo(-34, -8); ctx.lineTo(-28, -8); ctx.moveTo(-22, -8); ctx.lineTo(-16, -8); ctx.stroke(); ctx.restore(); }
    },
    drawFront(S, ctx, t, v) {
      // a crayon on the kid's head, and on Wobbin's from the moment it gets handed over
      const cr = (c, col) => { const a = c.top(); ctx.lineWidth = 4; ctx.save(); ctx.translate(a.x + 6, a.y + 4); ctx.rotate(.2); hand(ctx, [[-8, 0], [-8, -44], [0, -58], [8, -44], [8, 0]], { fill: col, seed: 7, wob: .9, over: 1 }); ctx.restore(); };
      if (!S.kid.hidden) cr(S.kid, '#ff5a4d');
      if (t > 10.9 && t < LEAVE) cr(S.bo, '#3fc66b');
      if (t > 12.5 && t < 16) { for (const [x, c] of [[880, '#c9efc0'], [100, '#bfe6ff']]) { const y = GROUND - 112, s = Math.sin(t * 7 + x) * .08; ctx.lineWidth = 5; ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, 66, 58, s, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 16, y + 56); ctx.lineTo(x - 18, GROUND - 4); ctx.moveTo(x + 16, y + 56); ctx.lineTo(x + 18, GROUND - 4); ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.ellipse(x - 12, GROUND - 8, 16, 9, 0, 0, 7); ctx.ellipse(x + 24, GROUND - 8, 16, 9, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x + (x > 400 ? -30 : 30), y - 18, 10, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x + (x > 400 ? -32 : 32), y - 18, 4.5, 0, 7); ctx.fill(); } }
    },
  });
})();
