/* fine: extracted from ../fine.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['fine'] = story; } });
  // Bo walks along, low. A friend is coming, so Bo pops on a painted smile. "how are you?" "fine!"
  // Another friend: "totally fine!" (the mask slips). Another: "never better!" (it cracks). Alone on a
  // bench, the mask comes off and the little rain cloud comes back. A friend comes back too, sits in
  // the rain with Bo, and says the thing. The cloud clears.
  // Button: where the cloud was, a little rainbow. Bo's real smile (no mask needed); the friend
  // bumps shoulders with Bo in a little hop together, then skips off ahead and Bo follows, humming.
  const { PAL, SPRITES, sprite, lerp, seg, sine, outBack, clamp, hash, spring, mix, GROUND, GRAV, BODY_H } = Shorts;
  const V = 110, BENCH = 2150, MASK_ON = 4.9, SLIP = 13.4, CRACK = 18.6, SIT = 22.0, OFF = 22.7, CLOUD = 23.2, RETURN = 25.6, CLEAR = 31.0, LEAVE = 36.4, LOOP = LEAVE + 8.7;   // bench and lamp out of view at the seam
  const STAND_UP = 33.4, BUMP = 34.3, BOW = [31.4, 37.4];   // the shoulder bump; the rainbow comes and goes
  const rainbowAt = t => sine(seg(t, BOW[0], BOW[0] + 1)) * (1 - sine(seg(t, BOW[1], BOW[1] + 1.2)));
  const LOOKS = [{ hair: 'curl', blush: PAL.pink, fill: '#ffe9f2' }, { hair: 'antenna', hairColor: PAL.blue, fill: '#e6f0ff' }, { hairColor: PAL.orange, blush: '#ffb08a', fill: '#fff4d6' }];
  const PUFFS = [[-52, 10, 26], [-22, -6, 34], [14, -14, 38], [46, 0, 30], [0, 16, 30], [-34, 18, 24], [32, 18, 26]];
  const warm = t => sine(seg(t, 19.5, 23)) * (1 - sine(seg(t, 31.5, 36)));

  Shorts.play({
    title: 'Fine',
    accent: PAL.orange,
    voice: { pitch: 1 },
    loopAfter: LOOP,
    paperAt: t => mix('#ffffff', '#ffe7d3', warm(t)),
    captions: [
      [5.9, 7.0, 'hey! how are you?', PAL.pink, { pitch: 1.3 }],
      [7.2, 8.1, '*fine!*', PAL.orange],
      [11.4, 12.6, "how's it going?", PAL.blue, { pitch: 1.15 }],
      [12.8, 14.2, 'great! *totally fine!*', PAL.orange],
      [17.2, 18.2, 'you okay?', PAL.orange, { pitch: 1.22 }],
      [18.4, 19.6, '*never* better!', PAL.orange],
      [24.0, 25.6, '...not fine.', PAL.sky, { pitch: .92, g: .7 }],
      [27.4, 29.4, "you don't have to be fine *with me.*", PAL.pink, { pitch: 1.3 }],
      [31.6, 34.0, "not fine? that's *fine* too."],
    ],
    init(S) {
      S.fr = LOOKS.map((o, i) => S.addChar({ x: 1600 + i * 4000, face: -1, gain: .5, ...o }));
      S.bo = S.addChar({ x: 0, walk: V }); S.focus = S.bo;
      S.mask = { on: false, slip: { x: 0, v: 0 }, crack: 0, fall: null };
      S.cloud = { k: { x: 0, v: 0 } }; S.drops = []; S.dropN = 0; S.dropT = 0;
    },
    update(S, t, dt) {
      const bo = S.bo, c = bo.cmd, [pink, blue, orange] = S.fr;
      // friends: each walks up, says hi, and walks on past
      const moveTo = (f, x) => { const dx = x - f.x; f.x += dx; f.hx += dx; if (f.tuft) f.tuft.x += dx; for (const F of f.feet) { F.x += dx; F.fromX += dx; F.toX += dx; } };
      const visit = (f, at, leaveAt, i) => {
        if (t > at - 3.4) S.once('arrive' + i, () => { moveTo(f, bo.x + 820); f.leaveTo = null; });
        if (t > at - 3.4 && t < leaveAt) Object.assign(f.cmd, { x: bo.x + 170, speed: 200, accel: 500, face: -1 });
        if (t >= leaveAt && t < RETURN) { f.leaveTo ??= bo.x - 2200; Object.assign(f.cmd, { x: f.leaveTo, speed: 150, accel: 450, face: -1, eye: 'happy' }); }
      };
      visit(pink, 5.6, 8.9, 0); visit(blue, 11.2, 14.6, 1); visit(orange, 17.0, 20.0, 2);
      S.plan(bo, t, [
        [0, { x: 600, speed: V, accel: 400, eye: 'sad', lookY: .3 }],
        [4.2, { lookX: .6, lookY: 0, eye: 'wide' }],                               // someone's coming!
        [MASK_ON - .25, { crouch: .2 }], [MASK_ON, { crouch: 0, eye: 'happy' }], [MASK_ON, () => { S.mask.on = t; S.sfx('pop', { pitch: 820 }, bo.x); }],
        [7.2, { crouch: .15 }], [7.45, { crouch: 0 }], [7.45, () => { bo.jump(0, -380); S.sfx('laugh', { k: 1.2, n: 3, g: .7 }, bo.x); }],
        [9.0, { x: 1200, speed: V }],
        [12.8, { crouch: .15 }], [13.05, { crouch: 0 }], [13.05, () => { bo.jump(0, -340); S.sfx('laugh', { k: 1.25, n: 3, g: .7 }, bo.x); }],
        [SLIP, () => { S.mask.slip.v += 8; S.sfx('slip', {}, bo.x); }],
        [15.0, { x: 1800, speed: V }],
        [18.4, { crouch: .12 }], [18.6, { crouch: 0 }],
        [CRACK, () => { S.mask.crack = t; S.sfx('tock', { f: 1400 }, bo.x); S.sfx('shatter', { gain: .25 }, bo.x); }],
        [20.2, { x: BENCH - 20, speed: 90, accel: 300 }],
        [SIT, { sit: 1, face: 1 }],
        [OFF, () => { S.mask.fall = { x: 0, y: 0, vx: 70, vy: -120, rot: 0, t0: t, rest: false }; S.sfx('toss', { pitch: 240 }, bo.x); }],
        [OFF, { eye: 'sad', lookY: .5, tilt: .1 }],
        [CLOUD, () => S.sfx('rumble', { d: 1.6 })],
        [26.6, { face: -1, lookX: .7, lookY: 0 }],
        [29.6, { tilt: .2, eye: 'squeeze' }], [29.6, () => S.sfx('breathOut', { d: 1.6 }, bo.x)],   // leans on the friend
        [30.4, () => S.sfx('breathOut', { d: 1.2, gain: .7 }, bo.x)],
        [CLEAR, { eye: 'happy', tilt: .14 }],
        [CLEAR, () => { S.sfx('swell', { root: 392 }); S.sfx('sparkle', { n: 8 }, bo.x); }],
        [32.0, { tilt: 0, lookY: -.8, lookX: .2 }],                              // a rainbow!
        [STAND_UP, { sit: 0, tilt: 0, lookX: .5, lookY: 0, face: -1 }],
        [BUMP - .25, { crouch: .2 }], [BUMP, { crouch: 0 }], [BUMP, () => bo.jump(-110, -380)],   // bump!
        [BUMP + .35, { tilt: -.16 }], [BUMP + .8, { tilt: 0 }],
        [BUMP + .8, () => { S.sfx('laugh', { n: 3 }, bo.x); S.sfx('laugh', { n: 3, k: 1.3, g: .8 }, S.fr[0].x); }],
        [35.6, { face: 1, lookX: 0, crouch: .2 }], [35.85, { crouch: 0 }], [35.85, () => bo.jump(0, -400)],
        [LEAVE, { x: 1e6, speed: V, accel: 400, eye: 'open' }],
        [LEAVE + .1, () => S.sfx('hum', { notes: [2, 4, 5, 7, 5], gap: .3, g: .04 }, bo.x)],
      ]);
      // everyone stops to talk next to Bo, then leaves; the friend who notices comes back
      if (t > 7.0 && t < 7.5) pink.cmd.eye = 'happy';
      if (t > 8.9) S.once('pinkWave', () => pink.jump(0, -300));
      if (t > RETURN) {
        S.once('pinkBack', () => moveTo(pink, BENCH - 900));
        S.plan(pink, t, [[RETURN, { x: BENCH - 175, speed: 170, accel: 450, face: 1, eye: 'open', lookX: .5 }], [26.8, { sit: 1, eye: 'sad' }], [27.4, { eye: 'open' }], [29.6, { tilt: .12, eye: 'happy' }], [CLEAR, { eye: 'happy' }],
          [32.0, { tilt: 0, lookY: -.8, lookX: .3 }], [STAND_UP, { sit: 0, tilt: 0, lookY: 0, lookX: .5 }],
          [BUMP - .25, { crouch: .2 }], [BUMP, { crouch: 0 }], [BUMP, () => pink.jump(110, -380)], [BUMP + .35, { tilt: -.16 }], [BUMP + .8, { tilt: 0 }],
          [LEAVE - .3, { x: 1e6, face: 1, speed: 250, accel: 700, eye: 'happy', lookX: 0 }]]);
        if (t > BUMP + .25) S.once('bump', () => { S.sfx('thump', { g: .4 }, bo.x); S.sfx('pop', { pitch: 640, g: .07 }, bo.x); const top = bo.top(); S.burst((top.x + pink.top().x) / 2, top.y - 20, 5, [PAL.pink, PAL.orange], { speed: 170, gravity: -60, size: 18, life: 1.1, shape: 'heart' }); });
        // skips off ahead (hops keep the run speed)
        if (t > LEAVE + .2 && pink.mode === 'ground' && hash(Math.floor(t * 2.5)) > .7) S.once(`skip:${Math.floor(t * 2.5)}`, () => pink.jump(pink.vx, -300));
      }
      if (t > BOW[0] + .3) S.once('bow', () => S.sfx('arp', { notes: [5, 7, 9], gap: .1, g: .05 }));
      // the mask: pops on, slips, cracks, then falls off
      spring(S.mask.slip, 0, 40, .25, dt);
      const M = S.mask.fall;
      if (M && !M.rest) { M.vy += GRAV * .7 * dt; M.x += M.vx * dt; M.y += M.vy * dt; M.rot += 4 * dt; const face = bo.toWorld(28, -12); if (face.y + M.y > GROUND - 8) { M.y = GROUND - 8 - face.y; M.rest = true; M.rot = .3; M.fx = face.x + M.x; M.fy = GROUND - 8; S.sfx('tock', { f: 700 }, bo.x); } }
      // the little rain cloud (the one from The Cloud) comes back, and clears
      spring(S.cloud.k, t > CLOUD && t < CLEAR ? 1 : 0, 6, .7, dt);
      const ck = S.cloud.k.x, top = bo.top();
      if (ck > .4 && t < CLEAR) { S.dropT += dt; while (S.dropT > .06) { S.dropT -= .06; const n = S.dropN++; S.drops.push({ x: top.x + (hash(n) - .5) * 140, y: top.y - 160 }); } }
      S.drops = S.drops.filter(d => { d.y += 900 * dt; if (d.y > top.y - 10 && Math.abs(d.x - top.x) < 70) { if (S.dropN % 4 === 0) S.sfx('drip', { k: .9 + hash(S.dropN) * .3, gain: .6 }, d.x); return false; } return d.y < GROUND; });
      if (t > CLOUD + .6) S.once('rainbed', () => S.sfx('rainbed', { d: CLEAR - CLOUD, g: .5, f: 1500 }));
      if (t > RETURN + 1.2) S.once('pad', () => S.sfx('pad', { root: 261.63, d: 7 }));
      S.once('amb', () => S.sfx('birds', { d: LOOP, g: .7 }));

      if (t > 3.6 && t < 20.2) { S.camGoal.x = bo.x + 90; S.camGoal.z = 1.12; S.camGoal.kz = 1.4; }
      else if (t >= 20.2 && t < LEAVE) { S.camGoal.x = BENCH - 80; S.camGoal.z = t > OFF ? 1.25 : 1.05; S.camGoal.kx = 1.4; S.camGoal.kz = 1; }
    },
    drawSky(S, ctx, t, v) {
      const w = warm(t);
      if (w > .02) sprite(ctx, SPRITES.sun, BENCH + 360, v.top + (GROUND - v.top) * .55 + (1 - w) * 60, 10, { X: PAL.orange }, w);
      for (let i = 0; i < 3; i++) {
        const W = v.right - v.left + 400, x = v.left - 200 + (1 - ((t / 42 + i / 3 + .3) % 1)) * W;
        sprite(ctx, SPRITES.cloud, x, v.top + (v.bottom - v.top) * (.16 + i * .06), 9, { X: mix('#ebe8f4', '#ffd8bc', w) });
      }
    },
    drawBack(S, ctx, t) {
      // a little rainbow over the two of them, once the cloud has cleared
      const rb = rainbowAt(t);
      if (rb > .01) {
        ctx.save(); ctx.globalAlpha = .85 * rb; ctx.lineWidth = 10; ctx.lineCap = 'butt';
        [PAL.red, PAL.orange, PAL.yellow, PAL.lime, PAL.sky, PAL.violet].forEach((col, i) => { ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(BENCH - 95, GROUND - 30, (230 - i * 9) * (.85 + .15 * rb), Math.PI, Math.PI * 2); ctx.stroke(); });
        ctx.restore(); ctx.strokeStyle = '#111';
      }
      // the bench under a street lamp
      ctx.fillStyle = PAL.brown; ctx.lineWidth = 5; ctx.strokeStyle = '#111';
      ctx.beginPath(); ctx.roundRect(BENCH - 140, GROUND - 52, 280, 16, 6); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(BENCH - 140, GROUND - 110, 280, 14, 6); ctx.fill(); ctx.stroke();
      for (const x of [BENCH - 120, BENCH + 120]) { ctx.beginPath(); ctx.moveTo(x, GROUND - 110); ctx.lineTo(x, GROUND + 2); ctx.stroke(); }
      const lx = BENCH + 230; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(lx, GROUND + 2); ctx.lineTo(lx + S.J(1) * .3, GROUND - 330); ctx.quadraticCurveTo(lx, GROUND - 360, lx - 40, GROUND - 360); ctx.stroke();
      const on = warm(t); ctx.fillStyle = mix('#ffffff', PAL.yellow, on); ctx.beginPath(); ctx.ellipse(lx - 46, GROUND - 344, 22, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (on > .1) { ctx.fillStyle = PAL.yellow; ctx.globalAlpha = .16 * on; ctx.beginPath(); ctx.moveTo(lx - 66, GROUND - 336); ctx.lineTo(lx - 200, GROUND); ctx.lineTo(lx + 60, GROUND); ctx.lineTo(lx - 26, GROUND - 336); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; }
    },
    drawFront(S, ctx, t) {
      const bo = S.bo, m = S.mask;
      // the painted smile, held over Bo's face; it slips, it cracks, it falls
      const drawMask = (x, y, rot, k) => {
        ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
        ctx.fillStyle = PAL.yellow; ctx.strokeStyle = '#111'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(-13, -10, 5, 0, Math.PI * 2); ctx.arc(13, -10, 5, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 2, 22, .2, Math.PI - .2); ctx.stroke();
        ctx.fillStyle = PAL.pink; ctx.globalAlpha = .7; ctx.beginPath(); ctx.ellipse(-26, 8, 7, 4, 0, 0, Math.PI * 2); ctx.ellipse(26, 8, 7, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        if (m.crack) { const c2 = clamp((t - m.crack) / .2); ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(-6, -40); ctx.lineTo(4, -24 * c2 - 16 * (1 - c2)); if (c2 > .5) { ctx.lineTo(-8, -8); ctx.lineTo(6, 8); ctx.lineTo(-2, 22); } ctx.stroke(); }
        ctx.restore();
      };
      if (m.on && !m.fall) { const f = bo.toWorld(28 * bo.fw, -12), k = outBack(clamp((t - m.on) / .3)); drawMask(f.x, f.y, bo.rot.x + m.slip.x * .09, k); }
      if (m.fall) { const M = m.fall; if (M.rest) drawMask(M.fx, M.fy - 20, M.rot, .9); else { const f = bo.toWorld(28 * bo.fw, -12); drawMask(f.x + M.x, f.y + M.y, M.rot, 1); } }
      // the rain cloud above Bo
      const ck = S.cloud.k.x, top = bo.top();
      if (ck > .02) {
        ctx.strokeStyle = '#7f94b0'; ctx.lineWidth = 3; for (const d of S.drops) { ctx.beginPath(); ctx.moveTo(d.x, d.y - 16); ctx.lineTo(d.x, d.y); ctx.stroke(); }
        const white = sine(seg(t, CLEAR - .4, CLEAR + .8)), cy = top.y - 170 - white * 80;
        ctx.fillStyle = mix('#a7abb2', '#f1f3f8', white); ctx.globalAlpha = Math.min(1, ck * 1.4) * (1 - seg(t, CLEAR + 1, CLEAR + 2.2));
        for (const [ox, oy, r] of PUFFS) { ctx.beginPath(); ctx.arc(top.x + ox * ck, cy + oy * ck + Math.sin(t * 2 + ox) * 2, r * ck, 0, Math.PI * 2); ctx.fill(); }
        ctx.globalAlpha = 1;
      }
    },
  });
})();
