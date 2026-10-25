/* comfort-zone: extracted from ../comfort-zone.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['comfort-zone'] = story; } });
  // Bo walks into a warm, glowing dome. Inside it's cosy; outside, the world goes grey. A butterfly
  // flies out; Bo follows and bounces off the edge. Friends call: "come play!" "maybe later." The
  // dome shrinks, the way they do. So Bo takes one step out, and colour floods back where the foot
  // lands. Another step, and the zone grows to fit the whole world.
  const { PAL, SPRITES, sprite, lerp, seg, sine, outBack, clamp, hash, spring, mix, GROUND } = Shorts;
  const V = 150, C = 900, R0 = 230;
  const ENTER = 4.4, BONK = 10.0, SHRINK = [16.6, 18.6], STEP1 = 22.0, STEP2 = 23.8, FREE = 27.4, LEAVE = 31.6, LOOP = LEAVE + 7.4;
  const FRIENDS_X = [1330, 1500];

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
      [28.4, 35.6, 'comfort zones grow *every time you step out.*'],
    ],
    init(S) {
      S.fr = FRIENDS_X.map((x, i) => S.addChar({ x, face: i ? -1 : 1, gain: .4, ...[{ hair: 'curl', blush: PAL.pink, fill: '#ffe9f2' }, { hairColor: PAL.orange, blush: '#ffb08a', fill: '#fff4d6' }][i] }));
      S.bo = S.addChar({ x: 0, walk: V }); S.focus = S.bo;
      S.R = { x: R0, v: 0 }; S.bulge = { x: 0, v: 0 }; S.ball = { x: FRIENDS_X[0] + 60, y: GROUND - 260, vx: 160, vy: 0 }; S.blooms = []; S.bounceT = 0;
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
        [25.4, { x: FRIENDS_X[0] - 110, speed: 200, accel: 600 }],
        [26.6, { crouch: .2 }], [26.85, { crouch: 0 }], [26.85, () => bo.jump(0, -460)],
        [LEAVE - .6, { crouch: .2 }], [LEAVE - .35, { crouch: 0 }], [LEAVE - .35, () => bo.jump(0, -420)],
        [LEAVE, { x: 1e6, speed: V, accel: 450, eye: 'open', lookX: 0, lookY: 0 }],
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
      const b = S.ball; b.vy += 1500 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
      const heads = [f1, f2, ...(t > 25.8 ? [bo] : [])].map(m => m.top());
      for (const h of heads) if (b.vy > 0 && Math.abs(b.x - h.x) < 46 && Math.abs(b.y - (h.y - 18)) < 18) { b.vy = -760; b.vx = (h.x < (f1.x + f2.x) / 2 ? 1 : -1) * 120 * (.8 + hash(t) * .4); S.sfx('boing', { pitch: 300, g: t > STEP2 ? .08 : .03 }, b.x); }
      if (b.y > GROUND - 22) { b.y = GROUND - 22; b.vy = -700; b.vx = (FRIENDS_X[0] + FRIENDS_X[1]) / 2 > b.x ? 140 : -140; }
      [f1, f2].forEach((f, i) => { f.cmd.x = clamp(b.x + (i ? 40 : -40), FRIENDS_X[0] - 60, FRIENDS_X[1] + 60); f.cmd.speed = 160; f.cmd.accel = 600; f.cmd.eye = 'happy'; f.cmd.face = b.x > f.x ? 1 : -1; f.cmd.lookY = -.8; });
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
      sprite(ctx, SPRITES.sun, C + 700, v.top + (GROUND - v.top) * .32, 10, { X: PAL.orange });
      for (let i = 0; i < 3; i++) {
        const W = v.right - v.left + 400, x = v.left - 200 + (1 - ((t / 39 + i / 3 + .5) % 1)) * W;
        sprite(ctx, SPRITES.cloud, x, v.top + (v.bottom - v.top) * (.15 + i * .06), 9, { X: '#ebe8f4' });
      }
    },
    drawBack(S, ctx, t) {
      // flowers and grass along the line (the colourful world, greyed by the veil when outside)
      for (let i = 0; i < 28; i++) {
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
        sprite(ctx, Math.floor(t * 10) % 2 ? SPRITES.flyA : SPRITES.flyB, x, y, 5, { X: PAL.violet, B: '#111' });
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
