/* missed-the-bus: extracted from ../missed-the-bus.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['missed-the-bus'] = story; } });
  // Pen and coloured pencil. Opens at the second it's lost: the doors closing on Wobbin's nose, and the driver saw. Then
  // the hope everyone knows: it has stopped at a red light, just up there. Three stops, each closer, and the third is the
  // first shot again. The driver finally opens up, right outside work, where Wobbin no longer needs it.
  // Button: the note on the office door.
  const { lerp, seg, sine, outBack, hash, mix, clamp, GROUND, INK } = Shorts;
  const hand = (...a) => Sketch.hand(...a), hatch = (...a) => Sketch.hatch(...a), lump = (...a) => Sketch.lump(...a), grass = (...a) => Sketch.grass(...a);
  const V = 150, GO1 = 7.05, GO2 = 10.1, SHUT = 12.42, LEAVE = 24, OUT = LEAVE + 1.4, LOOP = OUT + 1;
  const L1 = 1170, L2 = 2510, WORK = [2980, 3740], OFFICE = 3620, RED = '#e8503f', BUS = '#e9a23b', CREAM = '#fff6e2', SLATE = '#7fa3b8';
  const LEGS = [[3.7, 5, 253, 800], [GO1, 9.5, 800, 2145], [GO2, 11.9, 2145, 3156], [12.8, 13.5, 3156, 3276], [16.8, 19, 3276, 5300]];
  const busX = t => { let x = 253; for (const [a, b, p, q] of LEGS) if (t >= a) x = lerp(p, q, sine(seg(t, a, b))); return x; };
  const doorOpen = t => t < 2 ? 1 - seg(t, 1.2, 1.78) : t < 12.6 ? (t > 11.9 ? 1 - seg(t, 12.05, SHUT) : 0) : t < 16.7 ? seg(t, 13.7, 14) * (1 - seg(t, 16.3, 16.6)) : 0;

  const on = (x, y, z, f = .5) => [x, y + (.64 - f) * 1138 / z, z];   // a spot in the frame: f is how far down it sits
  const FIRST = on(212, GROUND - 150, 1.6, .55), CHASE = (o = 170) => [S => S.bo.x + o, GROUND - 170, .86];
  const SHOTS = [
    [2.7, ...on(197, GROUND - 134, 3, .5)], [3.15, S => busX(3.15) + 214, GROUND - 170, 2.6], [3.7, S => S.bo.x + 120, GROUND - 150, 1.1],
    [5, ...on(L1, GROUND - 330, 2.2, .5)], [5.45, ...on(197, GROUND - 134, 2.6, .5)], [5.8, ...CHASE()],
    [6.95, ...on(L1, GROUND - 330, 2.2, .5)], [7.35, ...CHASE()],
    [9.9, S => S.bo.x + 90, GROUND - 170, 1.25], [10.35, S => S.bo.x + 32, GROUND - 90, 2.6], [10.8, ...CHASE()],
    [12.2, ...on(3115, GROUND - 150, 1.6, .55)], [13.1, ...on(3100, GROUND - 134, 3, .5)], [13.6, S => busX(14) + 214, GROUND - 170, 2.6],
    [14.2, ...on(3170, GROUND - 170, 1.1, .6)], [15.1, ...on(3160, GROUND - 400, 1.9, .55)], [15.7, ...on(3170, GROUND - 170, 1.1, .6)],
    [17, ...on(3120, GROUND - 200, 1.2, .6)], [20.8, S => S.bo.x + 90, GROUND - 180, 1.25], [22.3, ...on(OFFICE, GROUND - 150, 2.2, .52)], [22.9, S => S.bo.x + 10, GROUND - 130, 2.2],
  ];
  function cut(S, t) {
    if (t >= LEAVE) return;
    let s = null; for (const q of SHOTS) if (t >= q[0]) s = q;
    if (!s) return;
    const c = S.cam, x = typeof s[1] === 'function' ? s[1](S) : s[1];
    c.x.x = x; c.y.x = s[2]; c.z.x = s[3]; c.x.v = c.y.v = c.z.v = 0; S.camGoal.x = x; S.camGoal.y = s[2]; S.camGoal.z = s[3];
  }

  function face(ctx, x, y, r, look, lid, fill) {
    ctx.fillStyle = fill; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, y, r, r * .92, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(x - look * r * .2, y - r * .9); ctx.quadraticCurveTo(x - look * r * .3, y - r * 1.25, x - look * r * .05, y - r * 1.4); ctx.stroke();
    const e = x + look * r * .46, ey = y - r * .2, er = r * .24;
    ctx.fillStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(e, ey, er, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(e + look * er * .4, ey, er * .42, 0, 7); ctx.fill();
    if (lid) { ctx.fillStyle = fill; ctx.beginPath(); ctx.rect(e - er - 1, ey - er - 1, er * 2 + 2, er * lid); ctx.fill(); ctx.beginPath(); ctx.moveTo(e - er, ey - er + er * lid); ctx.lineTo(e + er, ey - er + er * lid); ctx.stroke(); }
  }
  function bus(ctx, x, t, S) {
    const o = doorOpen(t), D = x, y = GROUND - 8;
    ctx.lineWidth = 7; hand(ctx, [[x - 312, y - 28], [x - 312, y - 296], [x + 292, y - 294], [x + 318, y - 190], [x + 318, y - 28]], { fill: BUS, seed: 3, over: 3 });
    ctx.fillStyle = CREAM; ctx.fillRect(x - 308, y - 150, 620, 24); ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(x - 308, y - 150); ctx.lineTo(x + 314, y - 150); ctx.moveTo(x - 308, y - 126); ctx.lineTo(x + 316, y - 126); ctx.stroke();
    // windows, and the passengers, who are watching this as closely as we are
    const look = t < GO1 ? .2 : -1;
    for (const [i, wx] of [x - 296, x - 188, x + 66].entries()) { ctx.lineWidth = 5; hand(ctx, [[wx, y - 272], [wx + 96, y - 272], [wx + 96, y - 172], [wx, y - 172]], { fill: '#d9ecf5', seed: i + 5, wob: 1, over: 2 }); }
    face(ctx, x - 248, y - 200, 34, look, 0, '#ffe0c8'); face(ctx, x + 114, y - 200, 32, look, 0, '#c9e8c4');
    // the doors: a dark gap, and two leaves that meet in the middle
    ctx.fillStyle = '#4a3f4a'; ctx.fillRect(D - 48, y - 264, 96, 236);
    ctx.lineWidth = 3; ctx.fillStyle = '#6a5a62'; ctx.fillRect(D - 48, y - 60, 96, 32);
    const lw = 48 * (1 - o * .9);
    for (const s of [-1, 1]) { const a = D + s * 48, b = a - s * lw; ctx.lineWidth = 5; hand(ctx, [[a, y - 266], [b, y - 266], [b, y - 28], [a, y - 28]], { fill: '#d9ecf5', seed: s + 13, wob: .8, over: 1 }); }
    // the cab, the driver in it, and the mirror
    ctx.lineWidth = 5; hand(ctx, [[x + 176, y - 272], [x + 282, y - 272], [x + 306, y - 182], [x + 176, y - 172]], { fill: '#e4f2f8', seed: 16, wob: 1, over: 2 });
    const stare = t < 3.5 ? -1 : t < 13.6 ? 1 : t < 16.7 ? -1 : 1, lid = t > 3.3 && t < 13.6 ? .9 : t < 14.6 ? 0 : .6;
    face(ctx, x + 232, y - 214, 34, stare, lid, '#c9d6f0');
    ctx.fillStyle = '#3f4a6a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 196, y - 234); ctx.quadraticCurveTo(x + 232, y - 276, x + 268, y - 234); ctx.lineTo(x + 280, y - 230); ctx.lineTo(x + 192, y - 232); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 318, y - 210); ctx.lineTo(x + 340, y - 226); ctx.stroke(); ctx.fillStyle = '#d7dde0'; ctx.fillRect(x + 332, y - 262, 16, 40); ctx.strokeRect(x + 332, y - 262, 16, 40);
    ctx.fillStyle = '#fff3c4'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x + 306, y - 64, 12, 0, 7); ctx.fill(); ctx.stroke();
    ctx.font = '700 44px "Kevin Sans", sans-serif'; ctx.fillStyle = RED; ctx.textAlign = 'center'; ctx.fillText('12', x - 120, y - 58); ctx.textAlign = 'start';
    // wheels that really turn, and a rim of shade under the bus so it sits on the road
    hatch(ctx, x - 300, y - 40, 600, 14, { gap: 8, width: 2.6 });
    for (const wx of [x - 236, x + 196]) { const a = wx * .018; ctx.fillStyle = '#3f3a44'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(wx, y - 34, 40, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#d7dde0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(wx, y - 34, 17, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(wx + Math.cos(a) * 14, y - 34 + Math.sin(a) * 14); ctx.lineTo(wx - Math.cos(a) * 14, y - 34 - Math.sin(a) * 14); ctx.stroke(); }
  }
  function light(ctx, x, t, go) {
    ctx.fillStyle = '#5f6b70'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 8, GROUND + 5); ctx.lineTo(x - 6, GROUND - 270); ctx.lineTo(x + 6, GROUND - 270); ctx.lineTo(x + 8, GROUND + 5); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 6; hand(ctx, [[x - 34, GROUND - 400], [x + 34, GROUND - 400], [x + 34, GROUND - 256], [x - 34, GROUND - 256]], { fill: '#3f3a44', seed: x, wob: 1, over: 2 });
    const lamp = (y, col, onn) => { ctx.fillStyle = onn ? col : '#6a6470'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(x, y, 18, 0, 7); ctx.fill(); ctx.stroke(); };
    lamp(GROUND - 366, RED, t < go); lamp(GROUND - 328, '#ffc23e', t > go - .25 && t < go); lamp(GROUND - 290, '#4fbe6c', t >= go);
  }

  // close up, the paper's shader blurs lines by the camera's zoom and thin letters fade, so thicken them for those shots
  function bold(s, x, y) { const l = this.l, caption = this.on && this.m.fillStyle === '#0000ff'; if (caption) { l.strokeStyle = this.p.fillStyle; l.lineJoin = 'round'; l.lineWidth = l.canvas.width * .0042; l.strokeText(s, x, y); } Object.getPrototypeOf(this).fillText.call(this, s, x, y); }

  Shorts.play({
    title: 'Missed the Bus',
    style: 'pencil',
    accent: '#c9503f',
    hook: 1.5,
    page: [.8, OUT - 1.2, OUT],
    wash: 0,
    loopAfter: LOOP,
    paper: '#ffffff',
    captions: [
      [.2, 2.7, 'by *one second.*', null, false],
      [2.8, 3.7, 'the driver *saw me.*'],
      [5, 5.7, '*a red light!*'],
      [5.8, 6.9, 'i can *make it.*'],
      [7.1, 8.1, '*no.*'],
      [8.6, 9.7, 'the next one. *the next one!*'],
      [10.2, 11, '*no no no.*'],
      [12.5, 13.4, 'by *one second.*'],
      [13.85, 15, 'getting on?', null, { pitch: .85 }],
      [15.15, 16.5, '...i work *here.*'],
      [17, 20.4, 'missed the bus. *beat the bus.*'],
      [22.9, 23.9, "it's *sunday.*"],
    ],
    init(S) {
      S.bo = S.addChar({ x: 0, walk: V });
      S.panted = 0;
    },
    drawOverlay(S, ctx) { if (ctx.sketch) { if (S.cam.z.x > 1.7) ctx.fillText = bold; else delete ctx.fillText; } },
    update(S, t, dt) {
      const bo = S.bo;
      S.plan(bo, t, [
        [0, { x: 165, speed: V, accel: 700 }],
        [1, { eye: 'wide', lookX: 1, tilt: .16 }],
        [2.1, { tilt: 0, eye: 'flat' }],
        [2.75, { eye: 'wide', lookX: 1 }],
        [3.7, { eye: 'squeeze', tilt: -.1 }], [4.6, { eye: 'open', tilt: 0, lookX: 1 }],
        [5.45, { eye: 'wide' }],
        [5.7, { x: 1e5, speed: 440, accel: 900, eye: 'squeeze', tilt: .1 }],
        [GO1, { eye: 'wide' }], [7.6, { eye: 'squeeze' }],
        [GO2, { eye: 'wide' }], [10.5, { eye: 'squeeze' }],
        [12.1, { x: 3068, speed: 380, accel: 1800, eye: 'wide', tilt: .16 }],
        [12.9, { tilt: 0, crouch: .2, eye: 'squeeze' }],
        [13.75, { eye: 'open', crouch: .12, lookX: 1 }],
        [15, { crouch: 0, eye: 'wide', lookX: .4, lookY: -1 }], [15.5, { eye: 'open', lookY: 0, lookX: 1 }],
        [16.4, { eye: 'happy' }],
        [17, () => bo.jump(0, -640)],
        [18.2, () => bo.jump(0, -760, Math.PI * 2)],
        [19.8, { eye: 'happy' }],
        [20.7, { x: OFFICE - 120, speed: 230, accel: 700, lookX: 1 }],
        [22.3, { eye: 'wide', lookX: 1 }],
        [22.9, { face: .06, eye: 'flat', lookX: 0, lookY: 0 }],
        [LEAVE - .1, { face: 1, eye: 'happy' }],
        [LEAVE, { x: 1e6, speed: V, accel: 450, lookX: 0 }], [LEAVE, () => bo.jump(700, -1000)],
      ]);
      // exhaust, in Wobbin's face
      if (t > 12.9 && t < 15 && t > 12.9 + S.panted * .42) { S.panted++; bo.q.v += 1.2; S.sfx('breathOut', { d: .22 }, bo.x); }
      if (t > 1.2) S.once('h1', () => S.sfx('hiss', {}, 250));
      if (t > 1.78) S.once('t1', () => { S.sfx('tock', { f: 300 }, 250); bo.q.v += .8; });
      if (t > 3.2) S.once('dr', () => S.sfx('tick', {}));
      if (t > 3.7) S.once('b1', () => S.sfx('bus', { d: 1.3 }, 300));
      if (t > 4) S.once('co', () => S.sfx('squish', {}, bo.x));
      if (t > 5) S.once('r1', () => S.sfx('chime', { n: 5, g: .08 }, L1));
      if (t > GO1) S.once('g1', () => { S.sfx('tap', {}, L1); S.sfx('bus', { d: 1.3 }, 800); });
      if (t > 8.6) S.once('r2', () => S.sfx('chime', { n: 6, g: .08 }, L2));
      if (t > GO2) S.once('g2', () => { S.sfx('tap', {}, L2); S.sfx('bus', { d: 1.3 }, 2200); });
      if (t > 11.5) S.once('h2', () => S.sfx('hiss', {}, 3200));
      if (t > 12.05) S.once('h3', () => S.sfx('hiss', {}, 3150));
      if (t > SHUT) S.once('t2', () => { S.sfx('tock', { f: 300 }, 3150); bo.q.v += 1; S.shake(2); });
      if (t > 12.8) S.once('b3', () => S.sfx('bus', { d: .9 }, 3300));
      if (t > 13.7) S.once('h4', () => S.sfx('hiss', {}, 3270));
      if (t > 15.2) S.once('sg', () => S.sfx('tick', {}));
      if (t > 16.3) S.once('h5', () => S.sfx('hiss', {}, 3270));
      if (t > 16.9) S.once('hk', () => { S.sfx('honk', {}, 3400); S.sfx('bus', { d: 1.4 }, 3500); });
      if (t > 17.1) S.once('q', () => S.sfx('pad', { root: 293.66, d: 3 }));
      if (t > 22.35) S.once('stop', () => { S.sfx('slip', {}, bo.x); });
      if (t > .2 && t < 2.7) { S.camGoal.x = FIRST[0]; S.camGoal.y = FIRST[1]; S.camGoal.z = FIRST[2]; S.camGoal.kx = 7; S.camGoal.kz = 6; }
      if (t >= LEAVE) { S.camGoal.kx = 14; S.camGoal.kz = 8; }
      cut(S, t);
    },
    drawSky(S, ctx, t, v) {
      ctx.fillStyle = '#dcecf2'; ctx.fillRect(v.left - 20, v.top - 20, v.right - v.left + 40, GROUND - v.top + 24);
      for (let i = Math.floor(v.left / 700) - 1; i * 700 < v.right + 200; i++) { const x = i * 700 + hash(i) * 200, y = 90 + hash(i + .3) * 60; lump(ctx, [[x, y + 14, 26], [x + 42, y, 36], [x + 86, y + 16, 26]], '#ffffff', 4); }
    },
    drawBack(S, ctx, t, v) {
      // the pavement and the verge
      ctx.fillStyle = '#d9d2c6'; ctx.fillRect(v.left - 20, GROUND + 4, v.right - v.left + 40, 64);
      ctx.fillStyle = '#bfe3a8'; ctx.fillRect(v.left - 20, GROUND + 68, v.right - v.left + 40, v.bottom - GROUND);
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(v.left - 20, GROUND + 68); ctx.lineTo(v.right + 20, GROUND + 68); for (let i = Math.floor(v.left / 132); i * 132 < v.right + 40; i++) { ctx.moveTo(i * 132, GROUND + 6); ctx.lineTo(i * 132 - 16, GROUND + 66); } ctx.stroke();
      // the street: houses down to the ground, a tree now and then
      const W = 320; for (let i = Math.floor((v.left - 170) / W); i * W < v.right + 170; i++) {
        const x = i * W; if (x > WORK[0] - 200 && x < WORK[1] + 120) continue;
        const k = hash(i * 2.3), wall = ['#f3dcc4', '#d9e7ef', '#f6e3a8', '#cfe3c8', '#f3c9b6'][Math.floor(k * 5)], h = 250 + hash(i) * 110;
        ctx.lineWidth = 6; hand(ctx, [[x - 130, GROUND + 3], [x - 130, GROUND - h], [x + 130, GROUND - h - 2], [x + 130, GROUND + 3]], { fill: wall, seed: i + 40 });
        hand(ctx, [[x - 152, GROUND - h], [x, GROUND - h - 92], [x + 152, GROUND - h]], { fill: '#d97a5c', seed: i + 60, over: 8 });
        ctx.lineWidth = 5; hand(ctx, [[x - 90, GROUND - h + 40], [x - 26, GROUND - h + 40], [x - 26, GROUND - h + 104], [x - 90, GROUND - h + 104]], { fill: '#fdeeb5', seed: i + 80, over: 2 });
        hand(ctx, [[x + 30, GROUND - h + 40], [x + 94, GROUND - h + 40], [x + 94, GROUND - h + 104], [x + 30, GROUND - h + 104]], { fill: '#cfe4ee', seed: i + 90, over: 2 });
        if (hash(i + .5) > .45) lump(ctx, [[x + 160, GROUND - 176, 50], [x + 128, GROUND - 130, 34], [x + 194, GROUND - 130, 34]], '#8fce7c', 5);
      }
      // work: a big plain block, with a door at the far end
      ctx.lineWidth = 7; hand(ctx, [[WORK[0], GROUND + 3], [WORK[0], GROUND - 590], [WORK[1], GROUND - 588], [WORK[1], GROUND + 3]], { fill: '#d7dde0', seed: 21 });
      ctx.lineWidth = 5; for (let i = 0; i < 6; i++) for (const y of [560, 300]) hand(ctx, [[WORK[0] + 40 + i * 120, GROUND - y], [WORK[0] + 110 + i * 120, GROUND - y], [WORK[0] + 110 + i * 120, GROUND - y + 90], [WORK[0] + 40 + i * 120, GROUND - y + 90]], { fill: '#cfe4ee', seed: i + y, wob: 1, over: 2 });
      ctx.lineWidth = 6; hand(ctx, [[3010, GROUND - 398], [3310, GROUND - 400], [3310, GROUND - 322], [3010, GROUND - 320]], { fill: RED, seed: 23 });
      ctx.fillStyle = '#fff3c4'; ctx.font = '700 58px "Kevin Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('WORK', 3160, GROUND - 340); ctx.textAlign = 'start';
      ctx.lineWidth = 6; hand(ctx, [[OFFICE - 62, GROUND + 2], [OFFICE - 62, GROUND - 216], [OFFICE + 62, GROUND - 214], [OFFICE + 62, GROUND + 2]], { fill: '#7fb8a8', seed: 25 });
      ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(OFFICE, GROUND - 216); ctx.lineTo(OFFICE, GROUND); ctx.stroke();
      // the note taped to the door, big enough to read
      ctx.lineWidth = 4; hand(ctx, [[OFFICE - 54, GROUND - 172], [OFFICE + 54, GROUND - 174], [OFFICE + 52, GROUND - 92], [OFFICE - 52, GROUND - 90]], { fill: '#fffaf0', seed: 26, wob: 1, over: 1 });
      ctx.fillStyle = INK; ctx.font = '700 22px "Kevin Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('CLOSED', OFFICE, GROUND - 138); ctx.fillStyle = RED; ctx.fillText('SUNDAY', OFFICE, GROUND - 108); ctx.textAlign = 'start';
      // the stop, and the two lights
      light(ctx, L1, t, GO1); light(ctx, L2, t, GO2);
      grass(ctx, [[120, GROUND + 3], [1500, GROUND + 3], [2500, GROUND + 3]]);
      // the bus
      const x = busX(t); if (x - 330 < v.right && x + 350 > v.left) bus(ctx, x, t, S);
      ctx.fillStyle = '#5f6b70'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(58, GROUND + 5); ctx.lineTo(61, GROUND - 240); ctx.lineTo(71, GROUND - 240); ctx.lineTo(74, GROUND + 5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 5; hand(ctx, [[28, GROUND - 300], [104, GROUND - 302], [104, GROUND - 236], [28, GROUND - 234]], { fill: '#3f8fb8', seed: 27, wob: 1, over: 2 });
      ctx.fillStyle = '#fffaf0'; ctx.font = '700 30px "Kevin Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('BUS', 66, GROUND - 258); ctx.textAlign = 'start';
      // exhaust: three low puffs, left behind as it pulls away, well under Wobbin's eye
      const u = seg(t, 4.2, 5.1); if (u > 0 && u < 1) for (const [i, o] of [-50, 0, 50].entries()) { const k = clamp(u * 1.5 - i * .2), r = (10 + k * 24) * (1 - k * k); if (r > 1) lump(ctx, [[S.bo.x + o - 10 + k * 16, GROUND - 26 - k * 30 - i * 6, r]], '#cfcac2', 3); }
    },
  });
})();
