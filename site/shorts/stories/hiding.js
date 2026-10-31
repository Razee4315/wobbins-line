/* hiding: extracted from ../hiding.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['hiding'] = story; } });
  // Pen and coloured pencil. Aisle three, and someone you know. Wobbin hides behind a display, a cereal box (upside
  // down, nobody checks) and a freezer, and backs away down the aisle, straight into someone else backing away.
  // Same box, same way up. The turn is one long look. Button: a third pair of eyes behind the shelf.
  const { lerp, seg, sine, outBack, hash, mix, clamp, GROUND, INK, PAL } = Shorts;
  const hand = (...a) => Sketch.hand(...a), hatch = (...a) => Sketch.hatch(...a), tiles = (...a) => Sketch.tiles(...a);
  const V = 150, MEET = 15.4, LEAVE = 25, OUT = LEAVE + 1.4, LOOP = OUT + 1;
  const SHELF = ['#e8a0a0', '#e6c78e', '#a9c9a4', '#7fa3b8', '#f3c9b6', '#c9a0d8', '#f6e3a8'];
  const FZ = 560, ROLLS = 830, BOX = '#ffc23e';

  function shelf(ctx, x0, x1, seed) {
    ctx.lineWidth = 5; hand(ctx, [[x0, GROUND + 2], [x0, GROUND - 352], [x1, GROUND - 350], [x1, GROUND + 2]], { fill: '#efe2c8', seed });
    for (let r = 0; r < 4; r++) {
      const y = GROUND - 12 - r * 84;
      let x = x0 + 8, i = 0;
      while (x < x1 - 34) {
        const w = 26 + hash(seed + r * 7 + i) * 26, h = 42 + hash(seed + r * 3 + i * 2) * 28, c = SHELF[Math.floor(hash(seed + r + i * 5.3) * SHELF.length)];
        ctx.fillStyle = c; ctx.lineWidth = 3.5; ctx.fillRect(x, y - h, w, h); ctx.strokeRect(x, y - h, w, h);
        ctx.beginPath(); ctx.moveTo(x + 5, y - h * .6); ctx.lineTo(x + w - 6, y - h * .6); ctx.stroke();
        x += w + 2; i++;
      }
      ctx.fillStyle = '#c98f5a'; ctx.lineWidth = 4; ctx.fillRect(x0, y, x1 - x0, 10); ctx.strokeRect(x0, y, x1 - x0, 10);
    }
  }
  function cereal(ctx, x, y, rot, s = 1) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.lineWidth = 4;
    hand(ctx, [[-30, 0], [-30, -74], [30, -73], [30, 0]], { fill: BOX, seed: 3, wob: 1.2, over: 2 });
    ctx.save(); ctx.translate(0, -37); ctx.rotate(Math.PI);   // the whole front is upside down: nobody has noticed
    ctx.fillStyle = '#fff6e0'; ctx.beginPath(); ctx.arc(0, 10, 15, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#e8503f'; for (const d of [-7, 0, 7]) { ctx.beginPath(); ctx.arc(d, 6 - Math.abs(d) * .2, 4, 0, 7); ctx.fill(); }
    ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-18, -18); ctx.lineTo(18, -18); ctx.moveTo(-12, -24); ctx.lineTo(12, -24); ctx.stroke();
    ctx.restore(); ctx.restore();
  }

  Shorts.play({
    title: 'Hiding',
    style: 'pencil',
    accent: '#c9503f',
    hook: 1.55,
    page: [.8, OUT - 1.2, OUT],
    wash: 0,
    loopAfter: LOOP,
    paper: '#ffffff',
    captions: [
      [.2, 3, 'oh no. *someone i know.*', null, false],
      [3.3, 4.7, '*act natural.*'],
      [7.7, 9.1, '...so *cold.*'],
      [10.5, 11.5, 'gone?'],
      [12.7, 13.8, 'shhh. *shhh.*'],
      [17.4, 18.8, 'i was hiding from *you.*', null, { pitch: 1.3 }],
      [19, 19.9, '*same.*'],
      [20.3, 24.3, 'everyone is hiding from someone. *say hi.*'],
    ],
    init(S) {
      S.bo = S.addChar({ x: 0, walk: V });
      S.pal = S.addChar({ x: -360, hair: 'antenna', hairColor: '#5c7f96', fill: '#cfe3ef', walk: 0 }); S.pal.gain = .4; S.pal.hidden = true; S.pal.space = 0;
      S.rolls = []; S.boxT = 0;
    },
    update(S, t, dt) {
      const bo = S.bo, pal = S.pal;
      S.plan(bo, t, [
        [0, { x: 190, speed: V, accel: 900 }],
        [.85, { lookX: -1, eye: 'wide' }], [.85, () => S.sfx('gasp', {}, bo.x)],
        [1.7, { face: -1, crouch: .2, tilt: .1 }], [1.7, () => bo.jump(-40, -330)],
        [3.25, () => { bo.jump(0, -420); S.sfx('rustle', { n: 2 }, bo.x); }],
        [3.6, { face: 1, crouch: 0, tilt: 0, eye: 'flat', lookX: 0, lookY: -1 }],
        [5.3, { face: -1, x: 530, speed: 170, accel: 700, lookX: 1, lookY: 0, eye: 'wide' }],
        [7.4, { x: 590, speed: 90 }], [7.5, () => { S.sfx('door', {}, FZ); }],
        [7.7, { eye: 'squeeze', tilt: .08 }],
        [10.1, { eye: 'open', x: 680, speed: 120, tilt: 0 }], [10.5, { lookX: 1, lookY: 0 }],
        [11.4, { face: -1, x: 1010, speed: 120, accel: 500, eye: 'wide' }],
        [12.5, { eye: 'squeeze' }], [13, { eye: 'wide' }],
        [MEET, { eye: 'wide', tilt: -.12 }], [MEET, () => { S.sfx('tap', {}, bo.x); bo.q.v -= 2; }],
        [16.1, { face: 1, tilt: 0 }],
        [19, { eye: 'flat' }], [19.7, { eye: 'happy' }],
        [LEAVE, { x: 1e6, speed: V, accel: 450, eye: 'open', face: 1, lookX: 0 }], [LEAVE, () => bo.jump(620, -1060)],
      ]);
      S.plan(pal, t, [
        [.9, { x: -40, speed: 80, accel: 300, lookX: -.8 }],
        [5, { x: 330, speed: 120, lookX: 1 }],
        [13.5, { face: 1, x: 1190, speed: 120, accel: 500, eye: 'wide', lookX: 0 }],
        [MEET, { eye: 'wide', tilt: .12 }],
        [16.5, { face: -1, tilt: 0 }],
        [19.7, { eye: 'happy' }],
      ]);
      // Dave goes behind the shelf and comes back round the far end of the aisle
      if (t > 8.4) S.once('behind', () => { pal.x = 1420; pal.cmd.x = 1420; pal.hx = 1420; pal.feet.forEach((F, i) => { F.x = 1420 + (i ? 11 : -11); }); pal.cmd.face = 1; pal.face.x = 1; });
      pal.hidden = t < .7 || (t > 8.4 && t < 13.4) || t > OUT;
      if (t > 8.4 && t < 13.5) pal.cmd.x = 1420;
      if (t > MEET && pal.mode === 'ground') S.once('pad', () => { pal.q.v -= 2; });
      if (t > 2.6) S.once('pose', () => S.sfx('tick', {}, bo.x));
      if (t > 6.6) S.once('a1', () => S.sfx('slip', {}, bo.x));
      if (t > 16.1) S.once('t1', () => S.sfx('tock', { f: 420 }));
      if (t > 16.5) S.once('t2', () => S.sfx('tock', { f: 520 }));
      if (t > 19.7) S.once('l', () => { S.sfx('laugh', { n: 3 }); S.boxT = t; });
      if (t > 20.4) S.once('q', () => S.sfx('pad', { root: 293.66, d: 3.4 }));
      if (t > 24.4) S.once('peek', () => S.sfx('tick', {}));
      // the tower of toilet rolls goes over
      if (bo.x > ROLLS - 104) S.once('rolls', () => {
        S.sfx('crash', {}, ROLLS); S.shake(3); bo.q.v += 2;
        for (let i = 0; i < 14; i++) S.rolls.push({ x: ROLLS + 12 + hash(i) * 70, y: GROUND - 20 - (i % 5) * 34, vx: (hash(i + .3) - .3) * 300 + 80, vy: -160 - hash(i + .6) * 220, r: i });
      });
      for (const q of S.rolls) { q.vy += 1500 * dt; q.y += q.vy * dt; q.x += q.vx * dt; q.r += q.vx * dt * .02; if (q.y > GROUND - 20) { q.y = GROUND - 20; q.vy *= -.28; q.vx *= .86; } }
      if (t > 1 && t < 5) { S.camGoal.x = 90; S.camGoal.z = .94; S.camGoal.kz = 3; }
      else if (t >= 5 && t < 14) { S.camGoal.x = bo.x - 40; S.camGoal.z = .94; }
      else if (t >= 14 && t < LEAVE) { S.camGoal.x = 1100; S.camGoal.z = .92; S.camGoal.kx = 3; }
    },
    drawBack(S, ctx, t, v) {
      ctx.fillStyle = '#f7ecd6'; ctx.fillRect(v.left - 20, v.top - 20, v.right - v.left + 40, GROUND - v.top + 24);
      tiles(ctx, -420, 1560, 560, '#dbe6e4', '#fff8ea');
      // hanging aisle signs and the strip lights above
      ctx.lineWidth = 4; ctx.beginPath(); for (const x of [120, 700, 1240]) { ctx.moveTo(x - 40, GROUND - 480); ctx.lineTo(x - 40, GROUND - 420); ctx.moveTo(x + 40, GROUND - 480); ctx.lineTo(x + 40, GROUND - 420); } ctx.stroke();
      for (const [x, n] of [[120, '3'], [700, '4'], [1240, '5']]) { hand(ctx, [[x - 62, GROUND - 420], [x + 62, GROUND - 421], [x + 62, GROUND - 376], [x - 62, GROUND - 375]], { fill: '#fff4e0', seed: x, wob: 1.4 }); ctx.font = '700 32px "Kevin Sans", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = INK; ctx.fillText(n, x, GROUND - 388); ctx.textAlign = 'start'; }
      shelf(ctx, -420, 200, 2); shelf(ctx, 240, 500, 7); shelf(ctx, 720, 1000, 11); shelf(ctx, 1030, 1560, 17);
      // the freezer: a big humming glass door, frost at the corners
      ctx.lineWidth = 6; hand(ctx, [[510, GROUND + 2], [510, GROUND - 330], [706, GROUND - 328], [706, GROUND + 2]], { fill: '#bfe0ee', seed: 31 });
      ctx.lineWidth = 3.5; ctx.beginPath(); for (let r = 0; r < 4; r++) { const y = GROUND - 44 - r * 76; ctx.moveTo(522, y); ctx.lineTo(694, y); for (let i = 0; i < 5; i++) { const x = 532 + i * 34; ctx.moveTo(x, y); ctx.lineTo(x, y - 40); ctx.lineTo(x + 24, y - 40); ctx.lineTo(x + 24, y); } } ctx.stroke();
      // the tower of toilet rolls, until it isn't
      const cyl = (x, y, f) => { ctx.fillStyle = '#ffffff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x, y - 34, 40, 34, 6); ctx.fill(); ctx.stroke(); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x + 20, y - 34, 8, 3, 0, 0, 7); ctx.stroke(); };
      if (!S.rolls.length) for (let r = 0; r < 6; r++) for (let i = 0; i < 3 - (r > 3 ? 1 : 0); i++) cyl(ROLLS + i * 42 + (r % 2 ? 10 : 0), GROUND - r * 35, 0);
      for (const q of S.rolls) cyl(q.x, q.y + 20, 0);
      // the cardboard display Wobbin ducks behind is drawn in front
    },
    drawFront(S, ctx, t, v) {
      const bo = S.bo, pal = S.pal, top = bo.top();
      // the little cardboard display, with a brave smile printed on it
      ctx.lineWidth = 5; hand(ctx, [[126, GROUND + 2], [126, GROUND - 84], [258, GROUND - 83], [258, GROUND + 2]], { fill: '#f4b36b', seed: 41 });
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(146, GROUND - 58); ctx.lineTo(238, GROUND - 58); ctx.moveTo(158, GROUND - 40); ctx.lineTo(226, GROUND - 40); ctx.stroke();
      // the freezer door shuts over Wobbin: pale glass, so the eye still shows
      if (t > 7.5 && t < 10.1) { ctx.save(); ctx.globalAlpha = .34; ctx.fillStyle = '#d5edf6'; ctx.fillRect(510, GROUND - 330, 196, 332); ctx.restore(); ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 9; i++) { const a = i * .7 + 1, x = bo.x + Math.cos(a) * (64 + hash(i) * 28) + Math.sin(t * 30 + i) * 2, y = bo.y + Math.sin(a) * 60; ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); } ctx.stroke(); }
      // the boxes ride on the head, and go up in the air together when the laughing starts
      const off = S.boxT ? seg(t, S.boxT, S.boxT + .7) : 0, u = off * (2 - off);
      if (t > 3.45 && off < 1) cereal(ctx, top.x + off * 90, top.y + 4 - u * 170 + off * off * 520, -.1 + off * 4, 1);
      if (t > 13.4 && off < 1 && !pal.hidden) { const p = pal.top(); cereal(ctx, p.x - off * 80, p.y + 4 - u * 170 + off * off * 520, .1 - off * 4, 1); }
      // the third one, peeking over the top of the shelf at the end
      const k = sine(seg(t, 24.2, 24.6)) * (1 - sine(seg(t, 25.5, 25.9)));
      if (k > .01) { const x = 1296, y = GROUND - 350 - 44 * k; ctx.save(); ctx.beginPath(); ctx.rect(x - 70, y - 120, 140, GROUND - 350 - y + 120); ctx.clip(); ctx.lineWidth = 5; ctx.fillStyle = '#dcefd2'; ctx.beginPath(); ctx.ellipse(x, y + 34, 54, 46, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x - 16, y + 10, 11, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(x - 19, y + 10, 4.5, 0, 7); ctx.fill(); ctx.restore(); cereal(ctx, x + 10, y - 12, -.1, .7); }
    },
  });
})();
