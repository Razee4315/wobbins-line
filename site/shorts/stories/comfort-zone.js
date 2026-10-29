/* comfort-zone: extracted from ../comfort-zone.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['comfort-zone'] = story; } });
  // Bo walks into a warm, glowing dome. Inside it's cosy; outside, the world goes grey. A butterfly
  // flies out; Bo follows and bounces off the edge. Friends call: "come play!" "maybe later." The
  // dome shrinks, the way they do. So Bo takes one step out, and colour floods back where the foot
  // lands. Another step, and the zone grows to fit the whole world.
  // Button: Bo heads the ball sky-high. Everyone looks up... and waits... and it drops back down and
  // lands balanced on Bo's head. Cheers! Bo pops it over to a friend and the three skip off together.
  const { PAL, SPRITES, sprite, butterfly, sun, cloud, lerp, seg, sine, outBack, clamp, hash, spring, mix, GROUND } = Shorts;
  const V = 150, C = 900, R0 = 230;
  const ENTER = 4.4, BONK = 10.0, SHRINK = [16.6, 18.6], STEP1 = 22.0, STEP2 = 23.8, FREE = 27.4, LEAVE = 36.0, LOOP = LEAVE + 7.0;
  // the button: the ball is scripted from here on: in to Bo's head, sky-high, back down, balanced, passed on
  const HEADER = 32.2, SKY_V = 2000, SKY_G = 2600, LANDS = HEADER + 2 * SKY_V / SKY_G, PASS = 35.2;
  const FRIENDS_X = [1300, 1520];   // far enough apart that nobody's body overlaps

  Shorts.play({
    title: 'Comfort Zone',
    accent: PAL.orange,
    voice: { pitch: 1 },
    loopAfter: LOOP,
    captions: [
      [10.4, 11.8, "it's nice in here."],
      [12.8, 14.0, 'come play!', null, { pitch: 1.3 }],
      [14.4, 15.8, 'maybe... *later.*'],
      [18.6, 20.2, 'it keeps getting *smaller.*'],
      [STEP1 + .2, STEP1 + 1.2, 'one step.'],
      [24.3, 25.4, '*oh.*'],
      [28.2, 31.9, 'comfort zones grow *every time you step out.*'],
      [34.4, 35.2, '*nice!*', null, { pitch: 1.35 }],
    ],
    init(S) {
      S.fr = FRIENDS_X.map((x, i) => S.addChar({ x, face: i ? -1 : 1, gain: .4, ...[{ hair: 'curl', blush: PAL.pink, fill: '#ffe9f2' }, { hairColor: PAL.orange, blush: '#ffb08a', fill: '#fff4d6' }][i] }));
      S.bo = S.addChar({ x: 0, walk: V }); S.focus = S.bo;
      S.R = { x: R0, v: 0 }; S.bulge = { x: 0, v: 0 }; S.ball = { x: FRIENDS_X[0], y: GROUND - 420, vx: 0, vy: 0 }; S.hits = 0; S.blooms = []; S.bounceT = 0; S.ballFrom = null;
    },
    update(S, t, dt) {
      const bo = S.bo, c = bo.cmd, [f1, f2] = S.fr;
      S.plan(bo, t, [
        [0, { x: C, speed: V, accel: 450 }],
        [ENTER + 1.4, { eye: 'happy' }], [ENTER + 2.2, () => S.sfx('hum', { notes: [2, 4, 5, 4, 2], gap: .34, g: .04 }, bo.x)],
        [7.6, { eye: 'open', lookX: .6, lookY: -.6 }],                              // a butterfly...
        [9.2, { x: C + R0 + 60, speed: 170, accel: 500 }],                            // follows it to the edge
        [BONK, () => { S.bulge.v += 14; bo.jump(-160, -260); S.sfx('boing', { pitch: 200, g: .09 }, bo.x); S.sfx('squish', {}, bo.x); }],
        [BONK + .1, { x: C + 80, speed: 120 }],
        [11.0, { eye: 'flat', face: 1, lookX: .4 }],
        [12.8, { eye: 'open', lookX: .8 }],
        [14.4, { eye: 'flat', lookX: 0 }],
        [16.0, { x: C, speed: 90, accel: 300 }],
        [SHRINK[0] + .2, { crouch: .22, eye: 'sad' }],
        [20.4, { crouch: 0, eye: 'open', lookX: .8 }],
        [20.8, () => S.sfx('breathIn', { d: 1.2 }, bo.x)],
        [21.3, { x: C + 240, speed: 60, accel: 250, eye: 'squeeze' }],                // one small step
        [STEP1 + .3, { eye: 'wide' }],
        [STEP2, { x: C + 330, speed: 120, accel: 400, eye: 'open' }],
        [24.3, { eye: 'happy' }],
        [25.4, { x: FRIENDS_X[0] - 180, speed: 200, accel: 600 }],
        [26.6, { crouch: .2 }], [26.85, { crouch: 0 }], [26.85, () => bo.jump(0, -460)],
        [HEADER - .25, { crouch: .2, lookY: -.8 }], [HEADER, { crouch: 0, eye: 'happy' }],      // big header
        [HEADER + .3, { lookY: -1, eye: 'open' }],                                // ...up... and up...
        [LANDS - .5, { eye: 'squeeze', crouch: .1 }],                             // here it comes
        [LANDS, { eye: 'wide', crouch: 0, lookY: -.5 }],                          // ...it's balanced
        [LANDS + .5, { eye: 'happy' }],
        [PASS - .3, { crouch: .2, lookX: .8, lookY: -.2 }], [PASS, { crouch: 0 }], [PASS, () => bo.jump(0, -420)],   // pop it over
        [LEAVE, { x: 1e6, speed: V, accel: 450, eye: 'open', lookX: 0, lookY: 0 }],
        [LEAVE + .1, () => S.sfx('hum', { notes: [2, 4, 5, 7, 5], gap: .3, g: .04 }, bo.x)],
      ]);
      // the dome's edge pushes back (until Bo steps out for real)
      const R = S.R.x;
      if (t > ENTER + .6 && t < STEP1 - .2 && bo.x > C + R - 75 && bo.mode === 'ground') bo.cmd.x = Math.min(bo.cmd.x, C + R - 75);
      const target = t < SHRINK[0] ? R0 : t < STEP1 ? lerp(R0, 140, sine(seg(t, SHRINK[0], SHRINK[1]))) : t < STEP2 ? 430 : t < FREE ? 900 : 6000;
      spring(S.R, target, t > STEP1 ? 4 : 2.5, .6, dt); spring(S.bulge, 0, 50, .2, dt);
      if (t > SHRINK[0]) S.once('shrink', () => { S.sfx('drain', {}, C); S.sfx('creak', {}, C); });
      if (t > SHRINK[0] + 1) S.once('shrink2', () => S.sfx('creak', {}, C));
      // stepping out: colour blooms out from the foot
      const bloom = (x, at, root) => { if (t > at) S.once('bloom' + at, () => { S.blooms.push({ x, t0: t }); S.sfx('swell', { root }); S.sfx('chime', { n: 4 }, x); S.sfx('sparkle', { n: 7 }, x); }); };
      bloom(C + 160, STEP1, 329.63); bloom(C + 330, STEP2 + 1.2, 392); bloom(FRIENDS_X[0], FREE, 523.25);
      // friends play catch outside; muffled while Bo is inside the dome, bright once Bo's out
      const b = S.ball;
      if (t < HEADER - .6) {
        b.vy += 1500 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
        // each player keeps to its own spot; every header is aimed at the next head (airtime ~1 s)
        const players = [f1, f2, ...(t > 25.8 ? [bo] : [])];
        for (const m of players) {
          const h = m.top();
          if (b.vy > 0 && Math.abs(b.x - h.x) < 46 && Math.abs(b.y - (h.y - 18)) < 18) {
            const next = m === f1 ? f2 : m === f2 ? (t > 25.8 && S.hits % 2 ? bo : f1) : f1;
            S.hits++; b.vy = -760; b.vx = (next.top().x - h.x) / (2 * 760 / 1500);
            S.sfx('boing', { pitch: 300, g: t > STEP2 ? .08 : .03 }, b.x);
          }
        }
        if (b.y > GROUND - 22) { b.y = GROUND - 22; b.vy = -700; b.vx = (FRIENDS_X[0] + FRIENDS_X[1]) / 2 > b.x ? 140 : -140; }
        [f1, f2].forEach((f, i) => { f.cmd.x = clamp(b.vy > 0 && Math.abs(b.x - FRIENDS_X[i]) < 90 ? b.x : FRIENDS_X[i], FRIENDS_X[i] - 50, FRIENDS_X[i] + 50); f.cmd.speed = 160; f.cmd.accel = 600; f.cmd.eye = 'happy'; f.cmd.face = b.x > f.x ? 1 : -1; f.cmd.lookY = -.8; });
      } else {
        // the button, scripted: the last pass arcs in to Bo's head; the header sends it sky-high (out of
        // frame); it drops straight back onto Bo's head and sits there; then Bo pops it to the first friend,
        // who bounces it on its head while the friends skip off ahead
        const top = bo.top(), head = { x: top.x, y: top.y - 20 }, ft = f1.top();
        S.ballFrom ??= { x: b.x, y: b.y };
        if (t < HEADER) { const u = seg(t, HEADER - .6, HEADER); b.x = lerp(S.ballFrom.x, head.x, u); b.y = lerp(S.ballFrom.y, head.y, u) - Math.sin(Math.PI * u) * 160; }
        else if (t < LANDS) { const u = t - HEADER; b.x = head.x; b.y = head.y - (SKY_V * u - SKY_G * u * u / 2); }
        else if (t < PASS) { b.x = head.x + Math.sin((t - LANDS) * 9) * 5 * Math.exp(-(t - LANDS) * 2); b.y = head.y; }
        else if (t < PASS + .5) { const u = seg(t, PASS, PASS + .5); b.x = lerp(head.x, ft.x, sine(u)); b.y = lerp(head.y, ft.y - 20, u) - Math.sin(Math.PI * u) * 140; }
        else { b.x = ft.x; b.y = ft.y - 20 - Math.abs(Math.sin((t - PASS - .5) * 4.4)) * 90; }
        [f1, f2].forEach((f, i) => S.plan(f, t, [
          [HEADER - .6, { x: FRIENDS_X[i], speed: 160, accel: 600, face: -1, eye: 'happy', lookY: -.3 }],
          [HEADER + .2, { lookY: -1, eye: 'open' }],
          [LANDS, { eye: 'wide', lookY: -.3 }],
          [LANDS + .4, { eye: 'happy', lookY: 0 }], [LANDS + .45 + i * .1, { crouch: .2 }], [LANDS + .7 + i * .1, { crouch: 0 }], [LANDS + .7 + i * .1, () => f.jump(0, -400)],   // cheer
          [PASS + .1, { lookY: -.8 }],
          [LEAVE - .4 + (1 - i) * .15, { x: 1e6, speed: 290 + i * 15, accel: 700, face: 1, eye: 'happy', lookY: i ? 0 : -.8 }],
        ]));
        if (t > LEAVE && f2.mode === 'ground' && hash(Math.floor(t * 2.5)) > .7) S.once(`skip:${Math.floor(t * 2.5)}`, () => f2.jump(f2.vx, -300));
      }
      if (t > HEADER) S.once('header', () => { S.sfx('boing', { pitch: 260, g: .09 }, bo.x); S.sfx('whoosh', { d: .6 }, bo.x); });
      if (t > LANDS - .9) S.once('fall', () => S.sfx('whistle', { f: 1800, f2: 900, d: .8 }, bo.x));
      if (t > LANDS) S.once('lands', () => { S.sfx('tock', { f: 520, gain: .7 }, bo.x); S.sfx('chime', { n: 5, g: .08 }, bo.x); });
      if (t > LANDS + .6) S.once('cheer', () => { S.sfx('laugh', { n: 3, k: 1.3, g: .7 }, f1.x); S.sfx('sparkle', { n: 5 }, bo.x); });
      if (t > PASS + .5 && t < LEAVE + 2) { const k = Math.floor((t - PASS - .5) * 4.4 / Math.PI); if (k >= 0) S.once('dribble' + k, () => S.sfx('boing', { pitch: 300, g: .05 }, f1.x)); }
      if (t > 12.6 && t < 14.2) { f1.cmd.face = -1; f1.cmd.lookY = 0; }
      // ambience: muffled and close inside the dome, open air outside
      if (t > ENTER) S.once('in', () => S.sfx('room', { d: STEP1 - ENTER + 1, g: 1.2 }));
      S.once('out0', () => S.sfx('birds', { d: ENTER + 1.4, g: .8 }));
      if (t > STEP1) S.once('out1', () => S.sfx('birds', { d: LOOP - STEP1, g: 1 }));
      if (t > 7.2 && t < 9.8) { S.fl = (S.fl ?? 0) + dt; if (S.fl > .3) { S.fl = 0; S.sfx('flap', {}); } }

      if (t > 3.6 && t < STEP2) { S.camGoal.x = C + 190; S.camGoal.z = t > SHRINK[0] && t < STEP1 ? 1.05 : .9; S.camGoal.kz = 1.2; S.camGoal.kx = 1.6; }
      else if (t >= STEP2 && t < LEAVE) { S.camGoal.x = (bo.x + FRIENDS_X[1]) / 2; S.camGoal.z = .82; S.camGoal.kx = 1.4; }
    },
    drawSky(S, ctx, t, v) {
      sun(ctx, C + 560, v.top + (GROUND - v.top) * .32, 10, { X: PAL.orange });
      for (let i = 0; i < 3; i++) {
        const W = v.right - v.left + 400, x = v.left - 200 + (1 - ((t / 39 + i / 3 + .5) % 1)) * W;
        cloud(ctx, x, v.top + (v.bottom - v.top) * (.15 + i * .06), 9, { X: '#ebe8f4' });
      }
    },
    drawBack(S, ctx, t) {
      // flowers and grass along the line (the colourful world, greyed by the veil when outside)
      for (let i = 0; i < 18; i++) {                                            // (ends before the walk-off, so the seam is bare paper)
        const x = 300 + i * 70 + hash(i) * 30, h = hash(i + .3);
        if (h < .45) { ctx.strokeStyle = PAL.green; ctx.lineWidth = 4; for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(x + k * 4, GROUND + 2); ctx.lineTo(x + k * 4 + Math.sin(t * 1.4 + i) * 2, GROUND - 14); ctx.stroke(); } }
        else if (h < .75) { const col = [PAL.pink, PAL.sky, PAL.yellow, PAL.violet][i % 4]; ctx.strokeStyle = PAL.green; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, GROUND + 2); ctx.lineTo(x, GROUND - 34); ctx.stroke(); sprite(ctx, ['.X.', 'XCX', '.X.'], x, GROUND - 36, 6, { X: col, C: PAL.yellow === col ? PAL.orange : PAL.yellow }); }
      }
      // the cosy things inside the dome: a little rug, a mug, a lamp
      for (let k = 0; k < 10; k++) { ctx.fillStyle = k % 2 ? PAL.orange : PAL.red; ctx.fillRect(C - 110 + k * 22, GROUND - 4, 22, 6); }
      sprite(ctx, ['XXXX.', 'XWWXX', 'XWWX.', 'XXXX.'], C - 150, GROUND - 14, 5, { X: PAL.sky, W: '#fff' });
      ctx.lineWidth = 5; ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(C + 130, GROUND + 2); ctx.lineTo(C + 130, GROUND - 120); ctx.stroke();
      ctx.fillStyle = PAL.yellow; ctx.beginPath(); ctx.moveTo(C + 106, GROUND - 120); ctx.lineTo(C + 116, GROUND - 150); ctx.lineTo(C + 144, GROUND - 150); ctx.lineTo(C + 154, GROUND - 120); ctx.closePath(); ctx.fill(); ctx.stroke();
    },
    drawFront(S, ctx, t, v) {
      // the friends' ball and the butterfly (drawn before the veil, so they grey outside the dome)
      sprite(ctx, ['.XXX.', 'XXWXX', 'XXXXX', 'XXXXX', '.XXX.'], S.ball.x, S.ball.y, 10, { X: PAL.red, W: '#fff' });
      if (t > 7.0 && t < 12) {
        const u = t - 7, x = u < 2 ? lerp(C + 600, C - 40, sine(u / 2)) + Math.sin(u * 3) * 30 : lerp(C - 40, C + 700, sine(clamp((u - 2) / 3))), y = GROUND - 240 + Math.sin(u * 2.6) * 40;
        butterfly(ctx, x, y, 5, { X: PAL.violet }, 1, 10);
      }
      // the veil: outside the dome the world is greyed and faded
      const R = S.R.x, veil = sine(seg(t, ENTER, ENTER + 1)) * (1 - seg(R, 1300, 3600));
      const bul = S.bulge.x;
      const dome = () => { ctx.beginPath(); for (let i = 0; i <= 60; i++) { const a = Math.PI + i / 60 * Math.PI, push = Math.max(0, Math.cos(a)) ** 6 * bul * 8; ctx.lineTo(C + Math.cos(a) * (R + push), GROUND + Math.sin(a) * (R * .92 + push * .3)); } ctx.closePath(); };
      if (veil > .01) {
        ctx.save(); ctx.fillStyle = '#d9d9de'; ctx.globalAlpha = .62 * veil;
        ctx.beginPath(); ctx.rect(v.left - 20, v.top - 20, v.right - v.left + 40, GROUND - v.top + 24);
        for (let i = 60; i >= 0; i--) { const a = Math.PI + i / 60 * Math.PI, push = Math.max(0, Math.cos(a)) ** 6 * bul * 8; const x = C + Math.cos(a) * (R + push), y = GROUND + Math.sin(a) * (R * .92 + push * .3); i === 60 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.closePath(); ctx.fill('evenodd'); ctx.restore();
        // the warm inside, and its soft glowing edge
        ctx.save(); ctx.globalAlpha = .1 * veil; ctx.fillStyle = PAL.yellow; dome(); ctx.fill(); ctx.restore();
        ctx.save(); ctx.globalAlpha = .9 * veil; ctx.strokeStyle = PAL.orange; ctx.lineWidth = 6; ctx.setLineDash([18, 12]); ctx.lineDashOffset = -t * 20; dome(); ctx.stroke(); ctx.restore();
      }
      // colour blooming out from each step
      for (const bl of S.blooms) { const u = (t - bl.t0) / 1.2; if (u > 1) continue; ctx.save(); ctx.globalAlpha = (1 - u) * .7; ctx.strokeStyle = [PAL.pink, PAL.yellow, PAL.sky][S.blooms.indexOf(bl) % 3]; ctx.lineWidth = 10 * (1 - u) + 2; ctx.beginPath(); ctx.ellipse(bl.x, GROUND, 40 + u * 520, 30 + u * 300, 0, Math.PI, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    },
  });
})();
