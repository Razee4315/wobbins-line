/* the-menu: extracted from ../the-menu.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['the-menu'] = story; } });
  // Pen and coloured pencil on cream paper: a tiny cafe, drawn the way the boba plates are drawn. Wobbin opens
  // the menu. It unrolls to the floor, then along the floor, then out of the door, while a queue grows,
  // the sun sets and the waiter falls asleep. The turn: the menu snaps shut. "the usual."
  // Button: the waiter, unsurprised, had it ready the whole time.
  const { PAL, lerp, seg, sine, outBack, outCubic, hash, mix, clamp, zzz, GROUND, INK } = Shorts;
  const hatch = (...a) => Sketch.hatch(...a);
  const V = 150, LEAVE = 36.4, LOOP = LEAVE + 8;
  const CX0 = 720, CX1 = 1560, CTOP = GROUND - 420;
  const ROSE = '#e8a0a0', SAGE = '#a9c9a4', SAND = '#e6c78e', WOOD = '#c98f5a', SLATE = '#7fa3b8', CREAM = '#fff9ec', INKP = '#3a2f2a';
  const skyOf = t => mix(mix('#fffaf0', '#ffe2c2', sine(seg(t, 14, 19))), '#d7d3ec', sine(seg(t, 19, 24)));
  const day = t => t < 30 ? skyOf(t) : mix(skyOf(29.9), '#fffaf0', sine(seg(t, 30, 37)));
  // how far the menu has unrolled, in world units: down to the floor, along it, and out of the door
  const unroll = t => t < 8.6 ? 0 : t < 28.5 ? 150 * sine(seg(t, 8.6, 10.2)) + 170 * sine(seg(t, 11.6, 13.2)) + 330 * sine(seg(t, 14.6, 17)) + 700 * sine(seg(t, 18.4, 23.5)) : 1350 * (1 - outCubic(seg(t, 28.5, 28.9)));
  // the paper goes down from under the eyes, reaches the floor, then runs along the floor to the right
  const FLOOR_AT = 214, BITES = [32.1, 32.9, 33.7];
  function menuPath(L, x0, y0) { return L < FLOOR_AT ? [[x0, y0], [x0, y0 + L]] : [[x0, y0], [x0, GROUND - 6], [x0 + L - FLOOR_AT, GROUND - 6]]; }

  function lamp(ctx, x, y, col, t, k) {
    const sw = Math.sin(t * .7 + k) * 3;
    ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(x, CTOP); ctx.lineTo(x + sw, y - 26); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x + sw - 11, y - 26); ctx.lineTo(x + sw + 11, y - 26); ctx.lineTo(x + sw + 42, y + 12); ctx.lineTo(x + sw - 42, y + 12); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffe89a'; ctx.beginPath(); ctx.arc(x + sw, y + 15, 12, 0, Math.PI); ctx.fill(); ctx.stroke();
  }
  function table(ctx, x, col) {
    ctx.lineWidth = 5; ctx.fillStyle = WOOD; ctx.beginPath(); ctx.roundRect(x - 88, GROUND - 92, 176, 13, 3); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, GROUND - 79); ctx.lineTo(x, GROUND - 10); ctx.moveTo(x - 36, GROUND); ctx.lineTo(x + 36, GROUND); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - 14, GROUND - 120, 28, 28, 4); ctx.fill(); ctx.lineWidth = 4; ctx.stroke();
  }
  function plant(ctx, x, y, s, t, k) {
    ctx.lineWidth = 4; ctx.fillStyle = '#d98e6a'; ctx.beginPath(); ctx.moveTo(x - 24 * s, y - 40 * s); ctx.lineTo(x + 24 * s, y - 40 * s); ctx.lineTo(x + 18 * s, y); ctx.lineTo(x - 18 * s, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (const [a, l] of [[-1.9, 56], [-1.5, 74], [-1.15, 60], [-2.3, 44], [-.8, 44]]) {
      const w = a + Math.sin(t * 1.1 + k + a) * .05, ex = x + Math.cos(w) * l * s, ey = y - 42 * s + Math.sin(w) * l * s, mx = x + Math.cos(w) * l * .55 * s, my = y - 42 * s + Math.sin(w) * l * .55 * s, nx = -Math.sin(w) * 14 * s, ny = Math.cos(w) * 14 * s;
      ctx.fillStyle = SAGE; ctx.beginPath(); ctx.moveTo(x, y - 42 * s); ctx.quadraticCurveTo(mx + nx, my + ny, ex, ey); ctx.quadraticCurveTo(mx - nx, my - ny, x, y - 42 * s); ctx.fill(); ctx.stroke();
    }
  }

  Shorts.play({
    title: 'The Menu',
    style: 'pencil',
    accent: '#c9503f',
    hook: 6.2,
    loopAfter: LOOP,
    paperAt: day,
    captions: [
      [6.9, 8.4, "ready to order?", null, { pitch: 1.3 }],
      [8.8, 10.4, 'um. *one sec.*'],
      [12, 13.4, 'there is... more.'],
      [15.2, 17, 'soup? *which* soup?'],
      [19.4, 21.4, 'six kinds of *rice.*'],
      [24, 26.4, 'what if the other one is *better?*'],
      [28.4, 30, '...the *usual.*'],
      [30.8, 34.8, 'you were always going to get *the usual.*'],
    ],
    init(S) {
      S.bo = S.addChar({ x: 0, walk: V });
      S.waiter = S.addChar({ x: 1290, hair: 'curl', hairColor: '#9a5a3a', fill: '#ffe0c8', blush: ROSE, face: -1 }); S.waiter.gain = .5; S.waiter.space = 0;
      const q = ['#cfe3ef', '#f6d6dc', '#dcefd2'];
      S.queue = q.map((fill, i) => S.addChar({ x: 560 - i * 230, hair: ['antenna', 'tuft', 'curl'][i], hairColor: ['#5c7f96', '#a8554f', '#5d8a56'][i], fill, blush: i === 1 ? ROSE : null, walk: 0 }));
      for (const c of S.queue) { c.gain = .4; c.warmWithFocus = false; }
      S.queue.forEach(c => { c.hidden = true; });
    },
    update(S, t, dt) {
      const bo = S.bo, w = S.waiter;
      S.once('amb', () => S.sfx('birds', { d: 12, g: .6 }));
      S.plan(bo, t, [
        [0, { x: 1000, speed: V, accel: 520 }],
        [6.6, { lookX: 1, lookY: 0 }],
        [8.6, { lookX: 1, lookY: .4, tilt: .05 }], [8.6, () => S.sfx('rustle', { n: 3 }, bo.x)],
        [11.6, () => S.sfx('rustle', { n: 4 }, bo.x)],
        [11.9, { eye: 'wide', lookY: .8 }], [12.8, { eye: 'open', lookY: .7 }],
        [14.6, () => S.sfx('rustle', { n: 5 }, bo.x)],
        [15.4, { lookX: .9, lookY: .9, eye: 'sad' }],
        [18.4, () => S.sfx('roll', { v: .5 }, bo.x)],
        [19.2, { eye: 'squeeze', tilt: -.08, lookX: 0 }], [21.6, { eye: 'wide', tilt: 0, lookX: -1, lookY: 0 }],
        [22.5, { lookX: 1, lookY: .2 }], [23.3, { lookX: -1, lookY: .1 }], [24.1, { eye: 'dizzy', lookX: 0, tilt: .1 }],
        [26.8, { eye: 'open', tilt: 0, lookX: 1 }], [27.6, { eye: 'flat', lookY: 0 }],
        [28.45, () => { S.sfx('whoosh', { d: .4 }, bo.x); S.sfx('tap', {}, bo.x); S.shake(3); }],
        [29.6, { eye: 'happy', lookX: 1 }],
        [LEAVE - 1.2, { lookX: 0, eye: 'open' }],
        [LEAVE, { x: 1e6, speed: V, accel: 450 }], [LEAVE, () => bo.jump(600, -1000)],
        [LEAVE + 1, () => S.sfx('hum', { notes: [4, 5, 7, 9, 7], gap: .3, g: .04 }, bo.x)],
      ]);
      S.plan(w, t, [
        [6.4, { x: 1250, speed: 120, accel: 500, face: -1, eye: 'open' }],
        [12.2, { eye: 'flat' }],
        [16.4, { sit: .4, eye: 'blink' }], [20.2, { sit: 1, eye: 'closed', tilt: -.1 }], [20.2, () => S.sfx('snore', {}, w.x)],
        [28.6, { sit: 0, eye: 'wide', tilt: 0 }],
        [35.6, { face: 1 }], [29.5, { eye: 'happy' }], [29.5, () => S.sfx('ding', { pitch: 1568, g: .14 }, w.x)],
      ]);
      S.queue.forEach((c, i) => S.plan(c, t, [
        [11.6 + i * 2.6, { x: 815 - i * 182, speed: 170, accel: 500 }],
        [15.4 + i * 2.6, { face: 1, eye: 'flat', lookX: 1 }],
        [28.8, { eye: 'wide' }], [29.8 + i * .2, { eye: 'happy' }],
      ]));
      S.queue.forEach((c, i) => { c.hidden = t < 11.5 + i * 2.6; });
      if (t > 20 && t < 28.5) S.once('snz', () => S.sfx('snore', {}, w.x));
      if (t > 23.4) S.once('bell', () => S.sfx('tock', { f: 420 }));
      if (t > 28.45) S.once('pop', () => S.burst(1128, GROUND - 170, 10, [SAND, CREAM, ROSE], { speed: 300, size: 9, life: .6 }));
      if (t > 30.9) S.once('hop', () => S.sfx('toss', {}, w.x));
      if (t > 31.4) S.once('catch', () => { S.sfx('pop', { pitch: 900, g: .08 }, bo.x); bo.q.v += 1.4; });
      for (const b of BITES) if (t > b) S.once('bite' + b, () => { S.sfx('pop', { pitch: 700 + b * 8, g: .08 }, bo.x); bo.q.v += 2.2; const a = bo.top(); S.burst(a.x, a.y - 14, 5, ['#e8a84c', '#f4f1e8'], { speed: 240, size: 8, life: .5 }); });
      if (t > 34.9) S.once('back', () => S.sfx('toss', {}, bo.x));
      if (t > 35.4) S.once('caught', () => S.sfx('tock', { f: 520 }, w.x));
      // follows the paper: close on Wobbin, wider as the menu runs, out to the door for the longest moment
      if (t > 6 && t < 11) { S.camGoal.x = 1140; S.camGoal.z = 1.08; S.camGoal.kx = 2; }
      else if (t >= 11 && t < 17.6) { S.camGoal.x = 1100; S.camGoal.z = .92; S.camGoal.kx = 2; S.camGoal.kz = 1.2; }
      else if (t >= 17.6 && t < 24) { S.camGoal.x = lerp(1100, 1800, sine(seg(t, 18, 23.5))); S.camGoal.z = .86; S.camGoal.kx = 4; S.camGoal.kz = 1.2; }
      else if (t >= 24 && t < LEAVE) { S.camGoal.x = 1100; S.camGoal.z = .94; S.camGoal.kx = 3; S.camGoal.kz = 1.6; }
    },
    drawSky(S, ctx, t, v) {
      if (v.right < CX0 - 500 || v.left > CX1 + 900) return;
      // the street behind the windows and past the door
      const s = sine(seg(t, 19, 24)) * (1 - sine(seg(t, 30, 36)));
      ctx.lineWidth = 4; ctx.fillStyle = SAGE;
      for (const [x, r] of [[1660, 80]]) {
        ctx.fillStyle = SAGE; ctx.beginPath(); ctx.moveTo(x - 7, GROUND); ctx.lineTo(x - 7, GROUND - 70); ctx.lineTo(x + 7, GROUND - 70); ctx.lineTo(x + 7, GROUND); ctx.closePath();
        ctx.fillStyle = WOOD; ctx.fill(); ctx.stroke();
        ctx.fillStyle = SAGE; ctx.beginPath(); ctx.arc(x, GROUND - 70 - r * .8, r, 0, 7); ctx.moveTo(x + r * 1.3, GROUND - 70 - r * .3); ctx.arc(x + r * .55, GROUND - 70 - r * .3, r * .75, 0, 7); ctx.moveTo(x - r * .1, GROUND - 70 - r * .3); ctx.arc(x - r * .55, GROUND - 70 - r * .3, r * .7, 0, 7); ctx.fill(); ctx.stroke();
      }
      if (s > .02) { ctx.fillStyle = '#fff6d8'; ctx.globalAlpha = s; ctx.beginPath(); ctx.arc(1960, GROUND - 480, 34, 0, 7); ctx.fill(); ctx.stroke(); ctx.globalAlpha = 1; }
    },
    drawBack(S, ctx, t, v) {
      if (v.right < CX0 - 80 || v.left > CX1 + 120) return;
      const s = sine(seg(t, 19, 24)) * (1 - sine(seg(t, 30, 36))), wall = mix('#fbeed6', '#d9c7c9', s * .75);
      // the shop floor comes toward us in tiles, so the bottom of a tall frame is a place, not blank paper
      const tile = (r, k) => { const y0 = GROUND + 8 + 26 * r + 7 * r * r, y1 = GROUND + 8 + 26 * (r + 1) + 7 * (r + 1) * (r + 1), f = y => 1 + (y - GROUND) * .0042, X = (i, y) => 1140 + (CX0 - 20 + i * 82 - 1140) * f(y); return [[X(k, y0), y0], [X(k + 1, y0), y0], [X(k + 1, y1), y1], [X(k, y1), y1]]; };
      ctx.lineWidth = 3;
      for (let r = 0; r < 7; r++) for (let k = 0; k < 11; k++) {
        const P = tile(r, k); ctx.fillStyle = (r + k) % 2 ? mix('#f0d9ae', '#c9b5b6', s * .6) : mix('#fff6e4', '#e2d7da', s * .6);
        ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); for (const q of P.slice(1)) ctx.lineTo(q[0], q[1]); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      // the shop: wall in light pencil, a wainscot, a striped awning for a ceiling edge, windows full of street
      ctx.fillStyle = wall; ctx.fillRect(CX0, CTOP, CX1 - CX0, GROUND - CTOP);
      ctx.fillStyle = mix('#efdcb8', '#c6b4b8', s * .75); ctx.fillRect(CX0, GROUND - 120, CX1 - CX0, 120);
      ctx.lineWidth = 3; ctx.beginPath(); for (let x = CX0 + 30; x < CX1; x += 52) { ctx.moveTo(x, GROUND - 120); ctx.lineTo(x, GROUND); } ctx.stroke();
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(CX0, GROUND - 120); ctx.lineTo(CX1, GROUND - 120); ctx.stroke();

      // chalkboard of specials, nobody has read it either
      ctx.fillStyle = '#4e6660'; ctx.beginPath(); ctx.roundRect(790, CTOP + 60, 170, 124, 4); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = WOOD; ctx.stroke(); ctx.strokeStyle = INK;
      ctx.strokeStyle = '#f2ece0'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 5; i++) { const y = CTOP + 84 + i * 19, r = 70 + hash(i) * 56; ctx.moveTo(812, y); ctx.lineTo(812 + r, y + hash(i + 3) * 3); } ctx.stroke(); ctx.strokeStyle = INK;
      hatch(ctx, 800, CTOP + 186, 170, 12, { gap: 7, width: 2.4 });

      // the window with the sun going down in it
      ctx.fillStyle = mix('#cfe4ee', '#f4b98c', sine(seg(t, 14, 19))); ctx.fillStyle = mix(ctx.fillStyle, '#5e5b96', s); ctx.fillRect(1090, CTOP + 40, 230, 160);
      const sy = lerp(CTOP + 86, CTOP + 214, sine(seg(t, 13, 23)));
      ctx.save(); ctx.beginPath(); ctx.rect(1090, CTOP + 40, 230, 160); ctx.clip();
      ctx.fillStyle = '#ffc44d'; ctx.beginPath(); ctx.arc(1250, sy, 30, 0, 7); ctx.fill(); ctx.lineWidth = 3.5; ctx.stroke();
      ctx.fillStyle = mix(SAGE, '#4d5a78', s); ctx.beginPath(); ctx.ellipse(1190, CTOP + 214, 170, 42, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.lineWidth = 6; ctx.strokeRect(1090, CTOP + 40, 230, 160); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1205, CTOP + 40); ctx.lineTo(1205, CTOP + 200); ctx.stroke();
      ctx.fillStyle = WOOD; ctx.fillRect(1078, CTOP + 200, 254, 12); ctx.strokeRect(1078, CTOP + 200, 254, 12);
      plant(ctx, 1130, CTOP + 200, .55, t, 1); plant(ctx, 1290, CTOP + 200, .45, t, 2);

      // the counter with its bell, the cake dome and the till
      ctx.lineWidth = 6; ctx.fillStyle = SAND; ctx.fillRect(1176, GROUND - 124, 252, 124); ctx.strokeRect(1176, GROUND - 124, 252, 124);
      ctx.lineWidth = 3.5; ctx.beginPath(); for (let x = 1200; x < 1420; x += 28) { ctx.moveTo(x, GROUND - 112); ctx.lineTo(x, GROUND - 8); } ctx.stroke();
      ctx.fillStyle = WOOD; ctx.lineWidth = 5; ctx.fillRect(1162, GROUND - 138, 280, 15); ctx.strokeRect(1162, GROUND - 138, 280, 15);
      hatch(ctx, 1176, GROUND - 122, 252, 16, { gap: 6, width: 2.4 });
      ctx.fillStyle = SLATE; ctx.beginPath(); ctx.roundRect(1356, GROUND - 202, 66, 64, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#eaf1ee'; ctx.fillRect(1368, GROUND - 194, 42, 16); ctx.strokeRect(1368, GROUND - 194, 42, 16);
      ctx.lineWidth = 3.5; ctx.beginPath(); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { ctx.moveTo(1376 + i * 13 + 3, GROUND - 168 + j * 13); ctx.arc(1376 + i * 13, GROUND - 168 + j * 13, 3, 0, 7); } ctx.stroke();

      // door out to the street, on the right, propped open
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(CX1, GROUND); ctx.lineTo(CX1, CTOP + 110); ctx.moveTo(CX1, CTOP + 110); ctx.lineTo(CX1 + 62, CTOP + 134); ctx.lineTo(CX1 + 62, GROUND + 2); ctx.stroke();
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(CX0, GROUND); ctx.lineTo(CX0, CTOP); ctx.lineTo(CX1, CTOP); ctx.lineTo(CX1, CTOP + 110); ctx.stroke();
      for (const [x, y, c, k] of [[860, CTOP + 18, ROSE, 1], [1060, CTOP + 26, SAND, 2], [1450, CTOP + 22, SAGE, 3]]) lamp(ctx, x, y + 26, c, t, k);
      // the awning across the top of the shop
      for (let i = 0; i < 18; i++) {
        const x = CX0 - 26 + i * 50.5; ctx.fillStyle = i % 2 ? '#fff4e0' : ROSE; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(x, CTOP - 60); ctx.lineTo(x + 50.5, CTOP - 60); ctx.lineTo(x + 50.5, CTOP - 10); ctx.arc(x + 25.25, CTOP - 10, 25.25, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(CX0 - 26, CTOP - 60); ctx.lineTo(CX1 + 22, CTOP - 60); ctx.stroke();
      table(ctx, 800, ROSE); plant(ctx, 690, GROUND, 1, t, 4);
      if (t > 20.2 && t < 28.6) zzz(ctx, S.waiter.x - 10, S.waiter.y - 40, t);
    },
    drawFront(S, ctx, t, v) {
      const L = unroll(t), bo = S.bo, a = bo.top();
      const x0 = 1128, y0 = GROUND - 142, wd = 36;
      // the menu lives on a little stand beside Wobbin: it never floats, and it never crosses the eyes
      if (v.right > x0 - 80 && v.left < x0 + 80) {
        ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0 - wd + 2, y0); ctx.lineTo(x0 - wd - 13, GROUND + 1); ctx.moveTo(x0 + wd - 2, y0); ctx.lineTo(x0 + wd + 13, GROUND + 1); ctx.stroke();
      }
      if (t > 8.5 && L > 1) {
        const P = menuPath(L, x0, y0);
        // the scroll: a long paper strip with a little writing on it
        ctx.lineWidth = 4;
        ctx.fillStyle = CREAM; ctx.beginPath();
        if (P.length === 2) ctx.rect(x0 - wd, y0, wd * 2, L); else { ctx.moveTo(x0 - wd, y0); ctx.lineTo(x0 + wd, y0); ctx.lineTo(x0 + wd, GROUND - 26); ctx.lineTo(P[2][0], GROUND - 26); ctx.lineTo(P[2][0], GROUND + 2); ctx.lineTo(x0 - wd, GROUND + 2); ctx.closePath(); }
        ctx.fill(); ctx.stroke();
        ctx.strokeStyle = INKP; ctx.lineWidth = 3; ctx.beginPath();
        for (let k = 0, y = y0 + 16; y < Math.min(y0 + L, GROUND - 16); y += 17, k++) { ctx.moveTo(x0 - 26, y); ctx.lineTo(x0 - 26 + 34 + hash(k) * 16, y); }
        if (P.length === 3) for (let k = 0, x = x0 + 56; x < P[2][0] - 8; x += 24, k++) { ctx.moveTo(x, GROUND - 19); ctx.lineTo(x, GROUND - 7 + hash(k) * 3 - 4); }
        ctx.stroke(); ctx.strokeStyle = INK;
        // the end of the roll, still going
        ctx.lineWidth = 4; ctx.fillStyle = CREAM; const e = P[P.length - 1];
        if (P.length === 3) { ctx.beginPath(); ctx.arc(e[0] + 8, GROUND - 15, 15, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(e[0] + 8, GROUND - 15, 6, 0, 7); ctx.stroke(); }
        else { ctx.beginPath(); ctx.roundRect(x0 - wd - 6, y0 + L - 8, wd * 2 + 12, 16, 8); ctx.fill(); ctx.stroke(); }
      }
      // the rolled-up top of the menu, resting on the stand from the first frame
      if (v.right > x0 - 80 && v.left < x0 + 80) { ctx.fillStyle = WOOD; ctx.beginPath(); ctx.roundRect(x0 - wd - 8, y0 - 9, wd * 2 + 16, 17, 8); ctx.fill(); ctx.lineWidth = 4; ctx.stroke(); }
      // the plate, ready all along: it rides over on the waiter's head, gets eaten, and hops back
      if (t > 29.5) {
        const u = outBack(seg(t, 29.5, 29.85)), A = S.waiter.top(), B = bo.top(), go = seg(t, 30.9, 31.4), ret = seg(t, 34.9, 35.4);
        const k = ret > 0 ? 1 - ret : go, x = lerp(A.x, B.x, k), y = lerp(A.y, B.y, k) - Math.sin(Math.PI * k) * 110 - 2;
        const food = 1 - BITES.filter(b => t > b).length / BITES.length;
        ctx.save(); ctx.translate(x, y); ctx.scale(u, u); ctx.lineWidth = 4;
        ctx.fillStyle = '#f4f1e8'; ctx.beginPath(); ctx.ellipse(0, -5, 48, 11, 0, 0, 7); ctx.fill(); ctx.stroke();
        if (food > 0) {
          ctx.save(); ctx.translate(0, -9); ctx.scale(.4 + .6 * food, .3 + .7 * food); ctx.translate(0, 9);
          ctx.fillStyle = '#e8a84c'; ctx.beginPath(); ctx.moveTo(-34, -9); ctx.quadraticCurveTo(-20, -56, 8, -50); ctx.quadraticCurveTo(38, -42, 34, -9); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-14, -18); ctx.quadraticCurveTo(-6, -34, 6, -30); ctx.moveTo(8, -18); ctx.quadraticCurveTo(16, -30, 22, -22); ctx.stroke(); ctx.restore();
        }
        const s = t * 1.4; ctx.lineWidth = 3; ctx.globalAlpha = .7 * food; ctx.beginPath(); for (const k of [-12, 8]) { ctx.moveTo(k, -64); ctx.quadraticCurveTo(k + 9 * Math.sin(s + k), -76, k, -88); } ctx.stroke(); ctx.globalAlpha = 1;
        ctx.restore();
      }
    },
  });
})();
