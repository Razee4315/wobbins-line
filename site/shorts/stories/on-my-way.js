/* on-my-way: extracted from ../on-my-way.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['on-my-way'] = story; } });
  // Pen and coloured pencil, cutting between two places. Wobbin waits outside the cinema while the phone on Wobbin's head
  // says "5 minutes away", and every message cuts to where the friend really is: in bed, in the shower, eating cereal. A
  // snail bets it'll get there first, and does. The friend arrives dripping, with popcorn, and all is forgiven. Button:
  // someone else asks where Wobbin is, and Wobbin looks straight at us.
  const { lerp, seg, sine, outBack, hash, mix, clamp, zzz, GROUND, INK } = Shorts;
  const hand = (...a) => Sketch.hand(...a), hatch = (...a) => Sketch.hatch(...a), lump = (...a) => Sketch.lump(...a), tiles = (...a) => Sketch.tiles(...a), grass = (...a) => Sketch.grass(...a);
  const V = 150, ARRIVE = 14.9, LEAVE = 24.8, OUT = LEAVE + 1.4, LOOP = OUT + 1;
  const B1 = 3000, B2 = 3900, B3 = 4800, CLOCK = [-40, GROUND - 336], DOOR = 470;
  const ROSE = '#e8a0a0', SLATE = '#7fa3b8', WOOD = '#c98f5a', FRIEND = { hair: 'tuft', hairColor: '#e8504a', fill: '#ffd84d', blush: '#ff8a7a' };
  const skyAt = t => t < 9.3 ? '#e4f0f4' : t < 12.3 ? '#fbe3c0' : t < 14.6 ? '#f3b9a0' : '#c9c7e8';
  const snailX = t => lerp(-200, DOOR, seg(t, 1, 13.9));

  const on = (x, y, z, f = .5) => [x, y + (.64 - f) * 1138 / z, z];   // a spot in the frame: f is how far down it sits
  const WAIT = on(60, GROUND - 130, 1.25, .56), WIDE = on(186, GROUND - 150, 1.2, .6);
  const SHOTS = [
    [3.2, ...on(B1 - 70, GROUND - 130, 1.6, .56)], [4.7, ...WAIT], [6, ...on(snailX(6) + 10, GROUND + 10, 2.6, .64)],
    [7.7, ...on(B2, GROUND - 190, 1.6, .55)], [9.3, ...WAIT], [10.7, ...on(B3, GROUND - 130, 1.6, .56)],
    [12.3, ...on(152, GROUND - 108, 3, .5)], [13, ...on(CLOCK[0], CLOCK[1], 2.6, .5)], [13.5, ...on(DOOR - 20, GROUND - 30, 2.2, .62)],
    [14.6, ...WIDE], [15.5, ...on(330, GROUND - 150, 1.8, .64)], [16.5, ...WIDE],
    [21.8, ...on(100, GROUND - 180, 2.3, .55)], [23.15, ...on(104, GROUND - 130, 2.6, .52)], [24.6, ...WIDE],
  ];
  function cut(S, t) {
    if (t >= LEAVE) return;
    let s = null; for (const q of SHOTS) if (t >= q[0]) s = q;
    if (!s) return;
    const c = S.cam; c.x.x = s[1]; c.y.x = s[2]; c.z.x = s[3]; c.x.v = c.y.v = c.z.v = 0; S.camGoal.x = s[1]; S.camGoal.y = s[2]; S.camGoal.z = s[3];
  }
  // where the friend really is
  const room = t => t < 4.7 ? 0 : t < 9.3 ? 1 : 2;

  function phone(ctx, x, y, r, buzz) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(r + Math.sin(buzz * 40) * .07 * clamp(buzz)); ctx.lineWidth = 4;
    hand(ctx, [[-30, -13], [30, -13], [30, 1], [-30, 1]], { fill: '#2c2a33', seed: 9, wob: .8, over: 1 });
    ctx.fillStyle = '#bfe3f0'; ctx.fillRect(-24, -10, 48, 8); ctx.restore();
    if (buzz > 0) { ctx.lineWidth = 3.5; ctx.beginPath(); for (const o of [-1, 1]) for (const k of [0, 1]) { const a = x + o * (42 + k * 12), h = 8 + k * 6; ctx.moveTo(a, y - 6 - h); ctx.quadraticCurveTo(a + o * 5, y - 6, a, y - 6 + h); } ctx.stroke(); }
  }
  function snail(ctx, x, y, t) {
    const s = 1.25 + .05 * Math.sin(t * 5);
    ctx.save(); ctx.translate(x, y); ctx.scale(1, 1); ctx.lineWidth = 3.5; ctx.fillStyle = '#e6c78e';
    ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(0, 4, 26 * s, 0); ctx.quadraticCurveTo(40 * s, -6, 34 * s, -24); ctx.quadraticCurveTo(26, -26, 22, -12); ctx.lineTo(-30, -8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d9825a'; ctx.beginPath(); ctx.arc(-4, -26, 24, 0, 7); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); for (let a = 0; a < 12; a += .3) { const r = 2 + a * 1.5, xx = -4 + Math.cos(a) * r, yy = -26 + Math.sin(a) * r; a ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke();
    for (const o of [0, 12]) { const ex = 30 * s + o + Math.sin(t * 3 + o) * 2, ey = -46; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(29 * s + o * .4, -22); ctx.lineTo(ex, ey); ctx.stroke(); ctx.fillStyle = '#ffffff'; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(ex, ey, 6, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ex + 1, ey, 2.4, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  function hands(ctx, t) {
    const [cx, cy] = CLOCK, min = t < 9.2 ? 0 : t < 12.2 ? 25 : t < 14.6 ? 70 : 72, h = (6 + min / 60) * Math.PI / 6, m = min * Math.PI / 30;
    ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(h) * 32, cy - Math.cos(h) * 32); ctx.stroke();
    ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(m) * 46, cy - Math.cos(m) * 46); ctx.stroke();
  }

  // close up, the paper's shader blurs lines by the camera's zoom and thin letters fade, so thicken them for those shots
  function bold(s, x, y) { const l = this.l, caption = this.on && this.m.fillStyle === '#0000ff'; if (caption) { l.strokeStyle = this.p.fillStyle; l.lineJoin = 'round'; l.lineWidth = l.canvas.width * .0042; l.strokeText(s, x, y); } Object.getPrototypeOf(this).fillText.call(this, s, x, y); }

  Shorts.play({
    title: 'On My Way',
    style: 'pencil',
    accent: '#c9503f',
    hook: 1.5,
    page: [.8, OUT - 1.2, OUT],
    wash: 0,
    loopAfter: LOOP,
    paper: '#ffffff',
    captions: [
      [.2, 3.1, '"i\'m *5 minutes away.*"', null, false],
      [3.25, 4.6, 'still *in bed.*'],
      [4.8, 5.9, 'any minute *now.*'],
      [6.05, 7.6, 'bet i get there *first.*', null, { pitch: 1.6 }],
      [7.75, 9.2, '"*leaving now!*"', null, { pitch: 1.3 }],
      [9.35, 10.6, '*25 minutes later*'],
      [10.75, 12.2, '"*on the bus!*"', null, { pitch: 1.3 }],
      [13.5, 14.6, '*first.*', null, { pitch: 1.6 }],
      [15.5, 16.5, 'sorry sorry *sorry!*', null, { pitch: 1.3 }],
      [16.6, 17.9, 'i got *popcorn.*', null, { pitch: 1.3 }],
      [18.2, 21.6, '5 minutes means an hour. *you wait anyway.*'],
      [21.9, 23, 'where are you?', null, { pitch: 1.45 }],
      [23.2, 24.6, '"*5 minutes away.*"'],
    ],
    init(S) {
      S.bo = S.addChar({ x: 0, walk: V });
      S.fr = S.addChar({ x: B1 - 70, ...FRIEND }); S.fr.gain = .3; S.fr.rot.x = -1.45; S.fr.hold(B1 - 70, GROUND - 118);
      S.pal = S.addChar({ x: 900, ...FRIEND, face: -1 }); S.pal.gain = .5; S.pal.hidden = true;
      S.buzz = [1.15, 7.7, 10.7, 21.75]; S.lastChew = 0;
    },
    drawOverlay(S, ctx) { if (ctx.sketch) { if (S.cam.z.x > 1.7) ctx.fillText = bold; else delete ctx.fillText; } },
    update(S, t, dt) {
      const bo = S.bo, fr = S.fr, pal = S.pal;
      S.plan(bo, t, [
        [0, { x: 120, speed: V, accel: 900 }],
        [.75, { sit: 1, eye: 'happy', lookY: -1, lookX: .2 }],
        [1.7, { eye: 'open', lookY: -.8, lookX: .2 }],
        [3.1, { eye: 'happy' }],
        [4.7, { eye: 'open', lookX: 1, lookY: 0 }],
        [6.05, { lookX: .7, lookY: 1 }],
        [7.7, { eye: 'open', lookX: .2, lookY: -.9 }],
        [9.3, { eye: 'flat', lookY: 0, lookX: 1, tilt: .05 }],
        [10.7, { lookY: -.9, lookX: .2 }],
        [12.3, { eye: 'flat', lookX: 0, lookY: 0, face: .06, tilt: 0 }],
        [13.2, { face: 1, eye: 'sad', lookX: 1, lookY: .4 }],
        [14.6, { sit: 0, eye: 'flat', face: -1, lookY: 0 }], [14.75, { x: 92, speed: 80, accel: 300 }],
        [ARRIVE + .15, { eye: 'wide', face: 1, lookX: 1 }],
        [15.6, { eye: 'flat' }],
        [17, { eye: 'wide' }], [17.5, { eye: 'happy' }], [17.6, () => bo.jump(0, -560)],
        [21.75, { eye: 'open', lookY: -1, lookX: .2 }],
        [23.1, { eye: 'open', face: .06, lookX: 0, lookY: 0 }],
        [24.5, { face: 1, eye: 'happy' }],
        [LEAVE, { x: 1e6, speed: V, accel: 450, lookX: 0, lookY: 0 }], [LEAVE, () => bo.jump(780, -1080)],
      ]);
      // the friend's three rooms. Held in place, so a hard cut can move them
      const r = room(t), lie = r === 0;
      fr.hx = lie ? B1 - 70 : r === 1 ? B2 : B3; fr.hy = lie ? GROUND - 118 : r === 1 ? GROUND - 116 : GROUND - 100;
      fr.cmd.tilt = lie ? -1.45 : 0; fr.rot.x = fr.cmd.tilt; fr.rot.v = 0;
      fr.cmd.eye = lie ? (t > 3.9 ? 'closed' : 'open') : 'happy'; fr.cmd.lookY = lie ? -1 : 0;
      if (r === 1 && t - S.lastChew > .5) { S.lastChew = t; fr.q.v += .8; }
      if (r === 2 && t - S.lastChew > .3) { S.lastChew = t; fr.q.v += 1.5; S.sfx('tock', { f: 620 }, B3); }
      S.plan(pal, t, [
        [ARRIVE, { x: 330, speed: 640, accel: 1700, eye: 'squeeze' }],
        [15.5, { eye: 'wide' }], [16.5, { eye: 'happy' }],
        [21.9, { lookX: 1 }],
      ]);
      pal.hidden = t < ARRIVE - .05 || t > OUT;
      if (t > 15.3 && t < 18 && Math.sin(t * 15) > .9) S.once('pant' + Math.floor(t * 4), () => { pal.q.v += 1.1; S.sfx('breathOut', { d: .18 }, pal.x); });
      for (const [i, b] of S.buzz.entries()) if (t > b) S.once('z' + i, () => { S.sfx('ring', {}, bo.x); bo.q.v += .7; });
      if (t > 3.3) S.once('t1', () => S.sfx('typing', {}, B1));
      if (t > 7.8) S.once('t2', () => S.sfx('hum', { notes: [4, 6, 7], gap: .2, g: .02 }, B2));
      if (t > 8.2) S.once('t3', () => S.sfx('drip', {}, B2));
      if (t > 8.8) S.once('t4', () => S.sfx('drip', {}, B2));
      if (t > 6.2) S.once('sn', () => S.sfx('squish', {}, snailX(t)));
      if (t > 12.4) S.once('sigh', () => S.sfx('breathOut', { d: .7 }, bo.x));
      if (t > 13.05) S.once('clk', () => S.sfx('tick', {}, CLOCK[0]));
      if (t > 13.55) S.once('win', () => S.sfx('chime', { n: 7, g: .08 }, DOOR));
      if (t > 14.3) S.once('dr', () => S.sfx('door', {}, DOOR));
      if (t > ARRIVE) S.once('run', () => S.sfx('whoosh', { d: .4, v: .6 }, 500));
      if (t > 16.7) S.once('pc', () => { S.sfx('pop', {}, pal.x); S.burst(pal.x, pal.top().y - 60, 8, ['#fff3c4', '#ffffff'], { speed: 220, size: 11, life: .6, gravity: 900 }); });
      if (t > 18.3) S.once('q', () => S.sfx('pad', { root: 293.66, d: 3 }));
      if (t > 24.65) S.once('l', () => S.sfx('laugh', { n: 3 }, pal.x));
      if (t > .2 && t < 3.2) { const [x, y, z] = on(66, GROUND - 130, 1.42, .56); S.camGoal.x = x; S.camGoal.y = y; S.camGoal.z = z; S.camGoal.kx = 7; S.camGoal.kz = 6; }
      if (t >= LEAVE) { S.camGoal.kx = 14; S.camGoal.kz = 8; }
      cut(S, t);
    },
    drawBack(S, ctx, t, v) {
      if (v.cx > 2500) return v.cx < 3450 ? bedroom(S, ctx, t, v) : v.cx < 4350 ? shower(S, ctx, t, v) : cereal(S, ctx, t, v);
      // outside the cinema: the sky is the clock, a new colour after every wait
      const sky = skyAt(t), tint = c => mix(c, sky, .18);
      ctx.fillStyle = sky; ctx.fillRect(v.left - 20, v.top - 20, v.right - v.left + 40, GROUND - v.top + 24);
      ctx.fillStyle = '#d9d2c6'; ctx.fillRect(v.left - 20, GROUND + 4, v.right - v.left + 40, 74);
      ctx.fillStyle = '#9fa5ad'; ctx.fillRect(v.left - 20, GROUND + 78, v.right - v.left + 40, v.bottom - GROUND);
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(v.left - 20, GROUND + 78); ctx.lineTo(v.right + 20, GROUND + 78); for (let x = -420; x < 900; x += 132) { ctx.moveTo(x, GROUND + 6); ctx.lineTo(x - 18, GROUND + 76); } ctx.stroke();
      ctx.strokeStyle = '#fbf6e8'; ctx.lineWidth = 9; ctx.beginPath(); for (let x = -420; x < 900; x += 190) { ctx.moveTo(x, GROUND + 190); ctx.lineTo(x + 100, GROUND + 190); } ctx.stroke(); ctx.strokeStyle = INK;
      // the cinema, down to the pavement, with its posters and its door
      ctx.lineWidth = 6; hand(ctx, [[-430, GROUND + 3], [-430, GROUND - 416], [640, GROUND - 414], [640, GROUND + 3]], { fill: tint('#f0d9b8'), seed: 3 });
      ctx.lineWidth = 3; ctx.beginPath(); for (const [x, y] of [[-390, 60], [-300, 150], [-200, 40], [-110, 380], [40, 390], [120, 90], [330, 120], [590, 60], [-360, 300], [200, 370]]) { ctx.moveTo(x, GROUND - y); ctx.lineTo(x + 26, GROUND - y); ctx.moveTo(x + 8, GROUND - y + 13); ctx.lineTo(x + 34, GROUND - y + 13); } ctx.stroke();
      ctx.lineWidth = 5; hand(ctx, [[-270, GROUND - 330], [-150, GROUND - 332], [-150, GROUND - 150], [-270, GROUND - 149]], { fill: '#f6e3a8', seed: 4, over: 3 });
      ctx.fillStyle = '#e8503f'; ctx.lineWidth = 3.5; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? 16 : 38, x = -210 + Math.cos(a) * r, y = GROUND - 262 + Math.sin(a) * r; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-246, GROUND - 190); ctx.lineTo(-174, GROUND - 190); ctx.moveTo(-234, GROUND - 170); ctx.lineTo(-186, GROUND - 170); ctx.stroke();
      ctx.lineWidth = 6; hand(ctx, [[230, GROUND - 400], [640, GROUND - 402], [640, GROUND - 306], [230, GROUND - 304]], { fill: '#e8503f', seed: 5, over: 3 });
      ctx.fillStyle = '#fff3c4'; ctx.font = '700 44px "Kevin Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('FILM AT 6', 436, GROUND - 336); ctx.textAlign = 'start';
      ctx.fillStyle = '#5b4a52'; ctx.fillRect(DOOR - 56, GROUND - 200, 112, 200);
      const dO = sine(seg(t, 14.2, 14.5));
      ctx.lineWidth = 6; ctx.save(); ctx.translate(DOOR - 56, 0); ctx.scale(1 - (t < 14 ? .0 : dO * .75), 1); hand(ctx, [[0, GROUND + 1], [0, GROUND - 200], [112, GROUND - 199], [112, GROUND + 1]], { fill: '#7fb8a8', seed: 6, over: 2 }); ctx.fillStyle = '#e7c35a'; ctx.beginPath(); ctx.arc(94, GROUND - 96, 7, 0, 7); ctx.fill(); ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
      ctx.lineWidth = 5; hand(ctx, [[256, GROUND - 228], [370, GROUND - 228], [370, GROUND - 120], [256, GROUND - 120]], { fill: '#fdeeb5', seed: 7, over: 2 });
      hand(ctx, [[246, GROUND - 120], [380, GROUND - 120], [380, GROUND - 106], [246, GROUND - 106]], { fill: WOOD, seed: 8, wob: 1, over: 2 });
      // the street clock, on its post, set into the pavement
      ctx.fillStyle = '#5f6b70'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(CLOCK[0] - 9, GROUND + 5); ctx.lineTo(CLOCK[0] - 6, CLOCK[1] + 60); ctx.lineTo(CLOCK[0] + 6, CLOCK[1] + 60); ctx.lineTo(CLOCK[0] + 9, GROUND + 5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(CLOCK[0], GROUND + 6, 22, 6, 0, 0, 7); ctx.stroke();
      ctx.fillStyle = '#fffaf0'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(CLOCK[0], CLOCK[1], 66, 0, 7); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 4; ctx.beginPath(); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, s = Math.sin(a), c = Math.cos(a); ctx.moveTo(CLOCK[0] + s * 54, CLOCK[1] - c * 54); ctx.lineTo(CLOCK[0] + s * 60, CLOCK[1] - c * 60); } ctx.stroke();
      hands(ctx, t);
      grass(ctx, [[-340, GROUND + 2], [150, GROUND + 2], [604, GROUND + 2]]);
    },
    drawFront(S, ctx, t, v) {
      if (v.cx > 2500) {
        if (v.cx < 3450) { ctx.lineWidth = 6; hand(ctx, [[B1 - 46, GROUND - 176], [B1 + 184, GROUND - 118], [B1 + 184, GROUND - 22], [B1 - 62, GROUND - 22]], { fill: '#e8a0a0', seed: 41 }); if (t > 3.9) zzz(ctx, B1 - 130, GROUND - 216, t, 1); return; }
        if (v.cx < 4350) { ctx.lineWidth = 6; const fold = i => B2 - 130 + i * 52; const P = [[B2 - 138, GROUND - 124]]; for (let i = 0; i <= 5; i++) P.push([fold(i), GROUND - 118 - (i % 2) * 14]); P.push([B2 + 138, GROUND - 124], [B2 + 138, GROUND - 6], [B2 - 138, GROUND - 6]); hand(ctx, P, { fill: '#a9d9d0', seed: 42, wob: 1.2, over: 2 }); ctx.lineWidth = 3.5; ctx.beginPath(); for (let i = 1; i < 5; i++) { ctx.moveTo(fold(i), GROUND - 108); ctx.lineTo(fold(i) + 3, GROUND - 10); } ctx.stroke(); lump(ctx, [[S.fr.x - 22, S.fr.y - 66, 15], [S.fr.x + 6, S.fr.y - 72, 19], [S.fr.x + 30, S.fr.y - 64, 13]], '#ffffff', 3.5); return; }
        ctx.lineWidth = 6; hand(ctx, [[B3 - 170, GROUND - 92], [B3 + 170, GROUND - 93], [B3 + 170, GROUND - 76], [B3 - 170, GROUND - 75]], { fill: WOOD, seed: 43, over: 3 });
        ctx.lineWidth = 5; ctx.beginPath(); for (const x of [B3 - 150, B3 + 150]) { ctx.moveTo(x, GROUND - 76); ctx.lineTo(x, GROUND + 2); } ctx.stroke();
        const bx = B3 + 96, by = GROUND - 92; ctx.fillStyle = '#ffffff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bx - 46, by - 34); ctx.quadraticCurveTo(bx - 40, by, bx, by); ctx.quadraticCurveTo(bx + 40, by, bx + 46, by - 34); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#f6c56a'; ctx.beginPath(); ctx.ellipse(bx, by - 34, 46, 9, 0, 0, 7); ctx.fill(); ctx.stroke();
        phone(ctx, B3 - 104, GROUND - 92, 0, 0); return;
      }
      // the phone rides on Wobbin's head the whole film, so nothing changes at the seam
      const bo = S.bo, top = bo.top(), b = S.buzz.reduce((a, q) => Math.max(a, t > q && t < q + .7 ? 1 - (t - q) / .7 : 0), 0);
      phone(ctx, top.x + 6, top.y + 2, bo.rot.x * .8, b);
      if (t > .9 && t < 14.2) { const k = seg(t, 13.6, 14), x = snailX(t); snail(ctx, x, lerp(GROUND + 62, GROUND + 2, k), t); }
      const pal = S.pal, edge = S.pageEdge(v, t);
      if (!pal.hidden && !(edge && pal.x < edge.x)) {
        const p = pal.top(); ctx.save(); ctx.translate(p.x, p.y + 2); ctx.rotate(pal.rot.x * .7); ctx.lineWidth = 4;
        hand(ctx, [[-30, 0], [-40, -60], [40, -60], [30, 0]], { fill: '#fffaf0', seed: 44, wob: 1, over: 1 });
        ctx.strokeStyle = '#e8503f'; ctx.lineWidth = 8; ctx.beginPath(); for (const x of [-16, 16]) { ctx.moveTo(x * 1.2, -57); ctx.lineTo(x, -3); } ctx.stroke(); ctx.strokeStyle = INK;
        lump(ctx, [[-22, -66, 13], [0, -72, 15], [22, -66, 13]], '#fff3c4', 3.5); ctx.restore();
        if (t < 18.2) { ctx.fillStyle = '#9ed8f7'; ctx.lineWidth = 3; for (let i = 0; i < 3; i++) { const u = ((t * 1.2 + i * .33) % 1), x = pal.x + [-58, 66, 8][i], y = p.y + 34 + u * 110; ctx.beginPath(); ctx.ellipse(x, y, 6, 9, 0, 0, 7); ctx.fill(); ctx.stroke(); } }
      }
    },
  });
  function bedroom(S, ctx, t, v) {
    ctx.fillStyle = '#f8e7c8'; ctx.fillRect(v.left - 20, v.top - 20, v.right - v.left + 40, GROUND - v.top + 24);
    ctx.fillStyle = '#d8bf98'; ctx.fillRect(v.left - 20, GROUND + 2, v.right - v.left + 40, v.bottom - GROUND + 20);
    ctx.lineWidth = 3; ctx.beginPath(); for (let i = -6; i < 8; i++) { const x = B1 + i * 86; ctx.moveTo(x, GROUND + 4); ctx.lineTo(B1 + (x - B1) * 2.4, GROUND + 420); } ctx.stroke();
    ctx.lineWidth = 5; hand(ctx, [[B1 - 300, GROUND + 2], [B1 - 300, GROUND - 92], [B1 - 214, GROUND - 92], [B1 - 214, GROUND + 2]], { fill: WOOD, seed: 35 });
    ctx.lineWidth = 4; hand(ctx, [[B1 - 280, GROUND - 92], [B1 - 276, GROUND - 170], [B1 - 232, GROUND - 169], [B1 - 228, GROUND - 92]], { fill: '#2c2a33', seed: 36, wob: 1, over: 1 });
    ctx.fillStyle = '#bfe3f0'; ctx.fillRect(B1 - 270, GROUND - 162, 34, 62); ctx.lineWidth = 3; ctx.beginPath(); for (const y of [146, 134, 122]) { ctx.moveTo(B1 - 264, GROUND - y); ctx.lineTo(B1 - 244, GROUND - y); } ctx.stroke();
    ctx.lineWidth = 7; hand(ctx, [[B1 - 206, GROUND + 2], [B1 - 206, GROUND - 190], [B1 - 176, GROUND - 190], [B1 - 176, GROUND + 2]], { fill: '#a56a3a', seed: 37 });
    ctx.lineWidth = 6; hand(ctx, [[B1 - 180, GROUND - 22], [B1 - 180, GROUND - 66], [B1 + 188, GROUND - 66], [B1 + 188, GROUND - 22]], { fill: '#fffaf0', seed: 38 });
    ctx.beginPath(); ctx.moveTo(B1 + 176, GROUND - 22); ctx.lineTo(B1 + 176, GROUND + 2); ctx.moveTo(B1 - 170, GROUND - 22); ctx.lineTo(B1 - 170, GROUND + 2); ctx.stroke();
    lump(ctx, [[B1 - 136, GROUND - 90, 32], [B1 - 96, GROUND - 88, 28]], '#ffffff', 4);
    ctx.lineWidth = 5; hand(ctx, [[B1 - 20, GROUND - 372], [B1 + 150, GROUND - 374], [B1 + 152, GROUND - 228], [B1 - 18, GROUND - 226]], { fill: '#cfe4ee', seed: 39 });
    ctx.fillStyle = '#ffc44d'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(B1 + 80, GROUND - 322, 24, 0, 7); ctx.fill(); ctx.stroke();
  }
  function shower(S, ctx, t, v) {
    ctx.fillStyle = '#e6f1ee'; ctx.fillRect(v.left - 20, v.top - 20, v.right - v.left + 40, v.bottom - v.top + 40);
    ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 14; i++) { const y = GROUND - 520 + i * 80; ctx.moveTo(v.left - 20, y); ctx.lineTo(v.right + 20, y); for (let k = 0; k < 16; k++) { const x = B2 - 640 + k * 80 + (i % 2) * 40; ctx.moveTo(x, y); ctx.lineTo(x, y + 80); } } ctx.stroke();
    ctx.lineWidth = 6; hand(ctx, [[B2 - 200, GROUND + 1], [B2 + 200, GROUND], [B2 + 200, GROUND + 26], [B2 - 200, GROUND + 27]], { fill: '#fffaf0', seed: 45 });
    // the pipe and the shower head, and the water coming off it
    ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(B2 + 150, GROUND - 200); ctx.lineTo(B2 + 150, GROUND - 330); ctx.quadraticCurveTo(B2 + 150, GROUND - 360, B2 + 118, GROUND - 360); ctx.lineTo(B2 + 60, GROUND - 360); ctx.stroke();
    ctx.fillStyle = '#d7dde0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(B2 + 80, GROUND - 360); ctx.lineTo(B2 + 26, GROUND - 360); ctx.lineTo(B2 + 10, GROUND - 340); ctx.lineTo(B2 + 96, GROUND - 340); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 3.5; ctx.strokeStyle = '#6fb2d8'; ctx.beginPath(); for (let i = 0; i < 9; i++) { const u = (t * 1.6 + hash(i)) % 1, x = B2 + 18 + i * 9 - u * 18 + (i - 4) * u * 10, y = GROUND - 334 + u * 180; ctx.moveTo(x, y); ctx.lineTo(x - 1, y + 16); } ctx.stroke(); ctx.strokeStyle = INK;
    // the phone, safe and dry on a shelf, still sending messages
    ctx.lineWidth = 5; hand(ctx, [[B2 - 200, GROUND - 236], [B2 - 96, GROUND - 237], [B2 - 96, GROUND - 224], [B2 - 200, GROUND - 223]], { fill: WOOD, seed: 46, wob: 1, over: 2 });
    ctx.lineWidth = 4; hand(ctx, [[B2 - 168, GROUND - 237], [B2 - 164, GROUND - 312], [B2 - 126, GROUND - 311], [B2 - 122, GROUND - 237]], { fill: '#2c2a33', seed: 47, wob: 1, over: 1 });
    ctx.fillStyle = '#bfe3f0'; ctx.fillRect(B2 - 158, GROUND - 304, 28, 58);
  }
  function cereal(S, ctx, t, v) {
    ctx.fillStyle = '#d4e6cf'; ctx.fillRect(v.left - 20, v.top - 20, v.right - v.left + 40, GROUND - v.top + 24);
    tiles(ctx, B3 - 700, B3 + 700, B3, '#efd6ab', '#fff4dd');
    ctx.lineWidth = 6; hand(ctx, [[B3 - 90, GROUND - 440], [B3 + 90, GROUND - 442], [B3 + 92, GROUND - 280], [B3 - 88, GROUND - 278]], { fill: '#cfe4ee', seed: 48 });
    ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(B3, GROUND - 440); ctx.lineTo(B3 + 1, GROUND - 279); ctx.moveTo(B3 - 89, GROUND - 360); ctx.lineTo(B3 + 90, GROUND - 361); ctx.stroke();
    ctx.lineWidth = 4; hand(ctx, [[B3 - 280, GROUND - 330], [B3 - 180, GROUND - 332], [B3 - 180, GROUND - 170], [B3 - 280, GROUND - 169]], { fill: '#f0b84f', seed: 49, over: 2 });
    ctx.font = '700 22px "Kevin Sans", sans-serif'; ctx.fillStyle = '#c9503f'; ctx.textAlign = 'center'; ctx.fillText('FLAKES', B3 - 230, GROUND - 260); ctx.textAlign = 'start';
    ctx.lineWidth = 5; hand(ctx, [[B3 - 300, GROUND - 168], [B3 - 160, GROUND - 169], [B3 - 160, GROUND - 156], [B3 - 300, GROUND - 155]], { fill: WOOD, seed: 50, wob: 1, over: 2 });
  }
})();
