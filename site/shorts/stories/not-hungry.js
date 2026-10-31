/* not-hungry: extracted from ../not-hungry.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['not-hungry'] = story; } });
  // Pen and coloured pencil, result first. Opens on the empty box and a friend still chewing, then goes back ten minutes.
  // "not hungry." Every time Wobbin looks away a long curl of hair creeps over the table, and the little flag in the fries
  // counts down: 30, 28, 19. A pigeon warned us. Then the stand-off over the last one, cut close like a western. The friend
  // comes back with a bucket, and the curl hands Wobbin the first fry. Button: the pigeon was never hungry either.
  const { lerp, seg, sine, outBack, hash, mix, clamp, GROUND, INK } = Shorts;
  const hand = (...a) => Sketch.hand(...a), hatch = (...a) => Sketch.hatch(...a), lump = (...a) => Sketch.lump(...a), grass = (...a) => Sketch.grass(...a);
  const V = 150, BACK = 3.1, LAST = 15, BUCKET = 18.3, LEAVE = 23.9, OUT = LEAVE + 1.4, LOOP = OUT + 1;
  const WO = 120, PX = 424, TX = 272, TOPY = GROUND - 86, ROSE = '#e8a0a0', RED = '#e8503f', FRY = '#f6c56a', HAIR = '#9a5a3a', POST = [52, GROUND - 236];
  const STEALS = [[6.7, 7.4, 2], [8.9, 10.2, 6], [11.6, 13, 10], [14.86, LAST + .1, 1]];
  const count = t => t < BACK ? 0 : t < 6.95 ? 30 : t < 7.3 ? 29 : t < 8.9 ? 28 : t < 10.2 ? 28 - Math.floor(seg(t, 8.9, 10.2) * 9) : t < 11.6 ? 19 : t < 13 ? 19 - Math.floor(seg(t, 11.6, 13) * 18) : t < LAST ? 1 : 0;
  // how far the curl has reached: 0 is home on the friend's head, 1 is in the box
  function reach(t) { for (const [a, b, n] of STEALS) if (t > a && t < b) return { r: Math.abs(Math.sin(seg(t, a, b) * n * Math.PI)) ** .7, back: (seg(t, a, b) * n) % 1 > .5 }; return { r: 0, back: false }; }
  const gift = t => sine(seg(t, 19.5, 20)) * (1 - sine(seg(t, 20.5, 20.9)));

  const on = (x, y, z, f = .5) => [x, y + (.64 - f) * 1138 / z, z];   // a spot in the frame: f is how far down it sits
  const RESULT = on(TX, GROUND - 150, 1.3, .55), WIDE = on(TX, GROUND - 170, 1.14, .58), BOX = on(TX + 66, GROUND - 170, 1.75, .55), EYEW = on(152, GROUND - 106, 3, .5), EYEP = on(392, GROUND - 106, 3, .5), PAL = on(PX, GROUND - 130, 2, .62);
  const SHOTS = [
    [BACK, ...WIDE], [4.3, ...PAL], [5.6, ...on(82, GROUND - 180, 1.9, .55)], [6.7, ...BOX], [7.4, ...EYEP], [7.8, ...WIDE],
    [8.9, ...BOX], [10.2, ...EYEW], [10.7, ...PAL], [11.6, ...WIDE],
    [13, ...on(TX + 34, GROUND - 200, 3, .5)], [13.5, ...EYEW], [13.9, ...EYEP], [14.25, ...on(TX, GROUND - 146, 3, .5)], [14.55, ...EYEW], [14.75, ...EYEP],
    [LAST, ...RESULT], [16.4, ...PAL], [17, ...WIDE], [17.3, ...EYEW], [18.1, ...WIDE], [22, ...on(TX, GROUND - 190, 1.7, .55)],
  ];
  function cut(S, t) {
    if (t >= LEAVE) return;
    let s = null; for (const q of SHOTS) if (t >= q[0]) s = q;
    if (!s) return;
    const c = S.cam; c.x.x = s[1]; c.y.x = s[2]; c.z.x = s[3]; c.x.v = c.y.v = c.z.v = 0; S.camGoal.x = s[1]; S.camGoal.y = s[2]; S.camGoal.z = s[3];
  }

  function fry(ctx, x, y, r, l = 40) { ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.fillStyle = FRY; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-5, 0); ctx.lineTo(-5, -l); ctx.lineTo(5, -l); ctx.lineTo(5, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  // a paper box of fries with a little flag in it. The flag is the score
  function box(ctx, x, y, s, n, max, seed) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const K = 18, shown = Math.ceil(n / max * K);
    for (let i = 0; i < shown; i++) { const k = (i * 7) % K, u = k / (K - 1) - .5, h = hash(k + seed); fry(ctx, u * 62, -36, u * .5 + (h - .5) * .28, 32 + h * 18); }
    ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(26, -40); ctx.lineTo(34, -112); ctx.stroke();
    ctx.lineWidth = 4; hand(ctx, [[34, -112], [88, -112], [88, -72], [34, -72]], { fill: '#fffaf0', seed: 3 + seed, wob: .9, over: 1 });
    ctx.font = '700 33px "Kevin Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = n < 5 ? RED : INK; ctx.fillText(String(n), 61, -80); ctx.textAlign = 'start';
    ctx.lineWidth = 5; hand(ctx, [[-42, -48], [42, -48], [33, 1], [-33, 1]], { fill: RED, seed: 4 + seed, wob: 1, over: 1 });
    ctx.strokeStyle = '#fffaf0'; ctx.lineWidth = 7; ctx.beginPath(); for (const o of [-20, 0, 20]) { ctx.moveTo(o * 1.25, -44); ctx.lineTo(o, -3); } ctx.stroke(); ctx.strokeStyle = INK;
    ctx.restore();
  }
  function curl(ctx, S, x, y, carry) {
    const T = S.pal.tuft, mid = [(T.x + x) / 2, Math.min(T.y, y) - 60];
    ctx.strokeStyle = HAIR; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(T.x, T.y); ctx.quadraticCurveTo(mid[0], mid[1], x, y); ctx.stroke();
    ctx.beginPath(); ctx.arc(x - 8, y, 8, 0, 7); ctx.stroke(); ctx.strokeStyle = INK;
    if (carry) fry(ctx, x - 8, y + 26, .4, 42);
  }

  // close up, the paper's shader blurs lines by the camera's zoom and thin letters fade, so thicken them for those shots
  function bold(s, x, y) { const l = this.l, caption = this.on && this.m.fillStyle === '#0000ff'; if (caption) { l.strokeStyle = this.p.fillStyle; l.lineJoin = 'round'; l.lineWidth = l.canvas.width * .0042; l.strokeText(s, x, y); } Object.getPrototypeOf(this).fillText.call(this, s, x, y); }

  Shorts.play({
    title: 'Not Hungry',
    style: 'pencil',
    accent: '#c9503f',
    hook: 1.5,
    page: [.8, OUT - 1.2, OUT],
    wash: 0,
    loopAfter: LOOP,
    paper: '#ffffff',
    captions: [
      [.2, 3, '"i\'m not hungry," *they said.*', null, false],
      [BACK, 4.2, '*10 minutes earlier*'],
      [4.3, 5.5, 'no thanks. *not hungry.*', null, { pitch: 1.3 }],
      [5.7, 7, "i'd watch those *fries.*", null, { pitch: 1.6 }],
      [7.8, 8.8, '...just *one.*', null, { pitch: 1.3 }],
      [10.75, 11.6, 'one *more.*', null, { pitch: 1.3 }],
      [11.7, 12.9, 'you said *not hungry.*'],
      [LAST + .2, 16.3, '*...*'],
      [16.4, 17.4, 'okay. a *bit* hungry.', null, { pitch: 1.3 }],
      [18.7, 21.8, 'order two. *they\'re never "not hungry".*'],
      [22.3, 23.5, '*not hungry.*', null, { pitch: 1.6 }],
    ],
    init(S) {
      S.bo = S.addChar({ x: 0, walk: V });
      S.pal = S.addChar({ x: PX, hair: 'curl', hairColor: HAIR, fill: '#ffe0c8', blush: ROSE, face: -1 }); S.pal.gain = .5; S.pal.hidden = true;
      S.lastN = 0; S.lastC = 0; S.mine = 0;
    },
    drawOverlay(S, ctx) { if (ctx.sketch) { if (S.cam.z.x > 1.7) ctx.fillText = bold; else delete ctx.fillText; } },
    update(S, t, dt) {
      const bo = S.bo, pal = S.pal, chew = (t < BACK || (t > LAST && t < 16.3));
      S.plan(bo, t, [
        [0, { x: WO, speed: V, accel: 900 }],
        [.7, { sit: 1, eye: 'flat', lookX: 1 }],
        [BACK, { eye: 'happy', lookX: 1, lookY: .2 }],
        [5.65, { eye: 'open', face: -1, lookX: 1, lookY: -.8 }],
        [7.6, { eye: 'flat', face: 1, lookX: 1, lookY: .3 }],
        [8.8, { eye: 'open', face: -1, lookY: -.8 }],
        [10.15, { eye: 'wide', face: 1, lookX: 1, lookY: .4 }],
        [11.6, { eye: 'sad', lookY: .4 }],
        [13, { eye: 'squeeze', tilt: .1 }],
        [14.9, { tilt: .34, eye: 'wide' }],
        [LAST, { tilt: 0, eye: 'flat', lookX: 1, lookY: 0 }],
        [16.3, { eye: 'sad', lookY: .4 }],
        [18.15, { eye: 'wide', lookY: -.2 }],
        [18.6, { eye: 'happy', lookY: .2 }],
        [22.2, { eye: 'wide', lookX: 1, lookY: .2 }],
        [23.5, { eye: 'flat' }],
        [LEAVE - .25, { sit: 0, eye: 'happy', lookY: 0, lookX: 0 }],
        [LEAVE, { x: 1e6, speed: V, accel: 450 }], [LEAVE, () => bo.jump(1000, -1170)],
      ]);
      S.plan(pal, t, [
        [.1, { sit: 1, eye: 'happy', lookX: -1 }],
        [BACK, { eye: 'open', lookX: 1 }],
        [4.3, { eye: 'closed', lookX: 1 }],
        [5.5, { eye: 'open', lookX: 1 }], [6.7, { eye: 'closed', lookX: -1 }],
        [7.8, { eye: 'open', lookX: 1 }], [8.9, { eye: 'closed', lookX: -1 }],
        [10.2, { eye: 'happy', lookX: 1 }],
        [11.6, { eye: 'open', lookX: 1, lookY: .3 }],
        [13, { eye: 'squeeze', tilt: .1 }],
        [LAST, { tilt: 0, eye: 'happy', lookX: -1 }],
        [16.3, { eye: 'sad', lookX: 1 }],
        [16.9, { sit: 0, eye: 'open' }], [17, { x: 660, speed: 520, accel: 1400, face: 1 }],
        [17.45, { x: PX, speed: 680, accel: 1600, face: -1 }],
        [18.15, { sit: 1, eye: 'happy', lookX: 1 }],
        [22.2, { eye: 'wide', lookX: -1, lookY: -.2 }],
        [23.5, { eye: 'flat', lookX: 1 }],
      ]);
      pal.hidden = t > OUT || t < .03;
      // chewing, and crumbs
      if (chew && t - S.lastC > .28) { S.lastC = t; pal.q.v += 1.3; S.sfx('tock', { f: 760 }, pal.x); }
      if (t > 20.9 && t < 21.9 && t - S.lastC > .28) { S.lastC = t; bo.q.v += 1.3; S.sfx('tock', { f: 760 }, bo.x); }
      const n = count(t);
      if (n !== S.lastN) { if (t > BACK + .1) { S.sfx('pop', {}, TX); if (S.lastN > n) pal.q.v += .9; } S.lastN = n; }
      if (t > 5.05) S.once('pg', () => S.sfx('flap', {}, 60));
      if (t > 5.3) S.once('pg2', () => S.sfx('flap', {}, 60));
      if (t > 7.45) S.once('wh', () => S.sfx('whistle', { d: .4, f: 1180, f2: 1420 }, pal.x));
      if (t > 8.95) S.once('sn', () => S.sfx('slip', {}, TX));
      for (const a of [13, 13.5, 13.9, 14.25, 14.55, 14.75]) if (t > a) S.once('h' + a, () => S.sfx('thump', { g: .3 }));
      if (t > LAST) S.once('got', () => { S.sfx('whoosh', { d: .3, v: .5 }, TX); S.shake(3); });
      if (t > 17.4) S.once('door', () => S.sfx('rustle', {}, 640));
      if (t > 18.4) S.once('th', () => { S.sfx('thump', { g: .22 }, TX); S.shake(2); });
      if (t > 18.8) S.once('q', () => S.sfx('pad', { root: 293.66, d: 3 }));
      if (t > 22.05) S.once('pg3', () => S.sfx('flap', {}, TX));
      if (t > 23.3) S.once('pg4', () => S.sfx('flap', {}, TX));
      if (t > 23.6) S.once('l', () => S.sfx('laugh', { n: 3 }, pal.x));
      if (t > .2 && t < BACK) { S.camGoal.x = RESULT[0]; S.camGoal.y = RESULT[1]; S.camGoal.z = RESULT[2]; S.camGoal.kx = 7; S.camGoal.kz = 6; }
      if (t >= LEAVE) { S.camGoal.kx = 14; S.camGoal.kz = 8; }
      cut(S, t);
    },
    drawSky(S, ctx, t, v) {
      ctx.fillStyle = '#dcecf2'; ctx.fillRect(v.left - 20, v.top - 20, v.right - v.left + 40, GROUND - v.top + 24);
      lump(ctx, [[-300, 130, 30], [-254, 112, 42], [-206, 130, 30]], '#ffffff', 4); lump(ctx, [[760, 150, 26], [800, 136, 34], [840, 152, 26]], '#ffffff', 4);
    },
    drawBack(S, ctx, t, v) {
      // the grass, then the paved yard in front of the stand
      ctx.fillStyle = '#d9d2c6'; ctx.fillRect(v.left - 20, GROUND + 4, v.right - v.left + 40, 74);
      ctx.fillStyle = '#bfe3a8'; ctx.fillRect(v.left - 20, GROUND + 78, v.right - v.left + 40, v.bottom - GROUND);
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(v.left - 20, GROUND + 78); ctx.lineTo(v.right + 20, GROUND + 78); for (let x = -340; x < 900; x += 132) { ctx.moveTo(x, GROUND + 6); ctx.lineTo(x - 16, GROUND + 76); } ctx.stroke();
      ctx.lineWidth = 4; for (const [x, y, s] of [[60, 130, 1], [330, 190, 1.2], [520, 120, 1], [180, 250, 1.3]]) { ctx.beginPath(); ctx.moveTo(x - 9 * s, GROUND + y); ctx.lineTo(x - 13 * s, GROUND + y - 14 * s); ctx.moveTo(x, GROUND + y); ctx.lineTo(x + 1, GROUND + y - 18 * s); ctx.moveTo(x + 9 * s, GROUND + y); ctx.lineTo(x + 14 * s, GROUND + y - 13 * s); ctx.stroke(); }
      // the stand behind the table: walls to the ground, a hatch, a striped awning on two poles
      ctx.lineWidth = 6; hand(ctx, [[-30, GROUND + 3], [-30, GROUND - 330], [640, GROUND - 328], [640, GROUND + 3]], { fill: '#f3dcc4', seed: 3 });
      ctx.lineWidth = 3; ctx.beginPath(); for (const [x, y] of [[40, 70], [110, 170], [560, 90], [600, 220], [20, 260], [480, 50]]) { ctx.moveTo(x, GROUND - y); ctx.lineTo(x + 26, GROUND - y); ctx.moveTo(x + 8, GROUND - y + 13); ctx.lineTo(x + 34, GROUND - y + 13); } ctx.stroke();
      ctx.lineWidth = 5; hand(ctx, [[150, GROUND - 306], [400, GROUND - 306], [400, GROUND - 176], [150, GROUND - 176]], { fill: '#5b4a52', seed: 4 });
      hand(ctx, [[136, GROUND - 176], [414, GROUND - 176], [414, GROUND - 160], [136, GROUND - 160]], { fill: '#c98f5a', seed: 5, wob: 1, over: 2 });
      for (let i = 0; i < 7; i++) hand(ctx, [[120 + i * 46, GROUND - 366], [166 + i * 46, GROUND - 366], [166 + i * 46, GROUND - 306], [120 + i * 46, GROUND - 306]], { fill: i % 2 ? '#fffaf0' : RED, seed: 6 + i, wob: 1, over: 1 });
      ctx.fillStyle = '#fff3c4'; ctx.font = '700 40px "Kevin Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('FRIES', TX + 2, GROUND - 228); ctx.textAlign = 'start';
      ctx.lineWidth = 6; hand(ctx, [[-60, GROUND - 330], [670, GROUND - 330], [670, GROUND - 346], [-60, GROUND - 346]], { fill: '#c98f5a', seed: 15, wob: 1, over: 3 });
      grass(ctx, [[-20, GROUND + 3], [630, GROUND + 3]]);
      // the sign post the pigeon sits on
      ctx.fillStyle = '#c98f5a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(POST[0] - 8, GROUND + 3); ctx.lineTo(POST[0] - 6, POST[1]); ctx.lineTo(POST[0] + 6, POST[1]); ctx.lineTo(POST[0] + 8, GROUND + 3); ctx.closePath(); ctx.fill(); ctx.stroke();
      // the table on its two legs, and what's on it
      ctx.lineWidth = 6; ctx.beginPath(); for (const x of [TX - 78, TX + 78]) { ctx.moveTo(x, TOPY + 12); ctx.lineTo(x - Math.sign(x - TX) * 6, GROUND + 3); } ctx.stroke();
      hand(ctx, [[TX - 110, TOPY], [TX + 110, TOPY - 1], [TX + 110, TOPY + 14], [TX - 110, TOPY + 15]], { fill: '#fffaf0', seed: 17, over: 3 });
      ctx.lineWidth = 3.5; ctx.beginPath(); for (let x = TX - 100; x < TX + 100; x += 34) { ctx.moveTo(x, TOPY + 2); ctx.lineTo(x + 12, TOPY + 2); } ctx.stroke();
      if (t < BUCKET + .12) box(ctx, TX, TOPY, 1, count(t), 30, 0);
      if (t > 17.5) { const k = seg(t, BUCKET, BUCKET + .2), p = S.pal.top(); box(ctx, lerp(p.x - 4, TX, sine(k)), lerp(p.y + 4, TOPY, k * k) - Math.sin(k * Math.PI) * 60, 1.5, t > 22.4 ? 57 : t > 20.2 ? 59 : 60, 60, 2); }
      // the crumbs of the empty box
      if (count(t) === 0 && t < BUCKET) { ctx.fillStyle = FRY; ctx.lineWidth = 2.6; for (const [x, r] of [[TX - 72, .3], [TX + 66, -.5], [TX - 44, 1.1]]) { ctx.save(); ctx.translate(x, TOPY - 3); ctx.rotate(r); ctx.fillRect(-7, -3, 14, 6); ctx.strokeRect(-7, -3, 14, 6); ctx.restore(); } }
      // the pigeon: lands on its post, and comes for the bucket at the end
      const here = t < BACK || t > 5.05, inK = seg(t, 5.05, 5.6), tk = seg(t, 22, 22.3), away = seg(t, 23.3, 24);
      const px = t < 22 ? lerp(-200, POST[0], t < BACK ? 1 : sine(inK)) : lerp(POST[0], TX - 8, sine(tk)) + away * 700, py = (t < 22 ? lerp(GROUND - 520, POST[1] - 18, t < BACK ? 1 : sine(inK)) : lerp(POST[1] - 18, TOPY - 112, sine(tk))) - Math.sin(tk * Math.PI) * 40 - away * 420;
      const flying = (t >= BACK && t < 5.6) || (t > 22 && t < 22.3) || t > 23.3;
      if (here) { Shorts.bird(ctx, px, py, 7, { X: '#9aa7b8', O: '#ffb12e' }, 1, flying ? 9 : 0, 1); if (t > 22.35) for (const o of [-.5, 0, .5]) fry(ctx, px + 33, py + 4, 1.57 + o * .18, 30); }
    },
    drawFront(S, ctx, t, v) {
      const pal = S.pal, bo = S.bo, edge = S.pageEdge(v, t);
      if (pal.hidden || (edge && (edge.side > 0 ? pal.x > edge.x : pal.x < edge.x))) return;
      const { r, back } = reach(t), mouth = pal.toWorld(68 * pal.fw, 14);
      if (r > .01) { const T = pal.tuft; curl(ctx, S, lerp(T.x, TX + 8, r), lerp(T.y, TOPY - 62, r), back); }
      const g = gift(t);
      if (g > .01) { const T = pal.tuft; curl(ctx, S, lerp(T.x, 190, g), lerp(T.y, GROUND - 118, g), t > 19.5 && t < 20.7); }
      if (t > 20.7 && t < 21.9) { const m = bo.toWorld(68, 14); fry(ctx, m.x - 8, m.y + 2, 1.5, lerp(34, 6, seg(t, 20.7, 21.9))); }
      // a fry still going in
      const chewing = t < BACK || (t > LAST && t < 16.3), l = t < BACK ? lerp(38, 14, seg(t, .8, 3)) : lerp(38, 8, seg(t, LAST, 16.3));
      if (chewing) fry(ctx, mouth.x + 8, mouth.y + 2, -1.5, l);
    },
  });
})();
