/* slow-walker: extracted from ../slow-walker.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['slow-walker'] = story; } });
  // Bo is in a hurry, until the path (one line, no overtaking) fills up with someone very, very slow.
  // Bo peeks for a gap: there isn't one. "excuse me..." (nobody hears). Bo winds up to leapfrog, and the
  // slow walker turns round to look at a butterfly: face to face. "...nice clouds." Then they stop dead
  // to smell a flower: "come on..." Bo sighs, stops pushing, and looks where they're looking: a bird
  // sings on a lamp post, the light goes gold. They walk on at the slow pace, and at the bench Bo hops
  // over to the far end (excited, but not through anybody); they share it at sunset.
  // Button: walking on, someone in a hurry gets stuck behind Bo. Bo crouches, "go ahead!", and they
  // leapfrog over and zoom off. Bo and the slow walker laugh; Bo strolls off humming.
  const { PAL, SPRITES, sprite, sun, cloud, butterfly, bird, lerp, seg, sine, outBack, clamp, hash, spring, mix, GROUND } = Shorts;
  const V = 140, GAP = 186, BENCH = 1500, POST = 1200, FLOWERS = [818, 1105, 1240, 1380, 1660];
  const SCREECH = 2.3, PEEK = 4.0, EXCUSE = 8.2, WIND = 11.6, TURN = 12.7, SNIFF = 15.4, SIGH = 19.0, BIRD = 19.9, GOLD = 21.0, SIT = 26.6;
  const UP = 31.8, RUSH = 32.6, LEAVE = 37.2, LOOP = LEAVE + 7.6;
  const goldAt = t => sine(seg(t, GOLD - .5, GOLD + 2.5)) * (1 - sine(seg(t, LEAVE + 1, LOOP - .3)));

  function teleport(c, x) {
    const dx = x - c.x; c.x += dx; c.hx += dx; c.vx = 0; c.cmd.x = x;
    if (c.tuft) c.tuft.x += dx;
    for (const F of c.feet) { F.x += dx; F.fromX += dx; F.toX += dx; }
  }

  Shorts.play({
    title: 'Slow Walker',
    accent: PAL.orange,
    voice: { pitch: 1 },
    loopAfter: LOOP,
    paperAt: t => mix('#ffffff', '#ffe6c9', goldAt(t)),
    captions: [
      [4.0, 5.2, 'ugh. *so slow.*'],
      [EXCUSE + .2, EXCUSE + 1.4, 'excuse me...', null, { pitch: 1, g: .55 }],
      [13.6, 14.7, '...nice *clouds.*'],
      [16.8, 18.0, 'come *on...*'],
      [21.8, 22.9, 'oh. *pretty.*'],
      [27.2, 31.4, 'some days, the slow lane *has the best view.*'],
      [33.9, 34.8, 'go *ahead!*'],
    ],
    init(S) {
      S.bo = S.addChar({ x: 0, walk: V });
      S.slow = S.addChar({ x: 760, face: 1, hair: 'curl', hairColor: PAL.violet, blush: PAL.pink, fill: '#eef7e6', gain: .5 });
      S.rush = S.addChar({ x: -1400, face: 1, hair: 'antenna', hairColor: PAL.red, fill: '#fff0e0', gain: .5 }); S.rush.hidden = true;
      S.focus = S.bo; S.tick = 0; S.notes = [];
    },
    update(S, t, dt) {
      const bo = S.bo, sl = S.slow, ru = S.rush, c = bo.cmd;
      // the slow walker: a few steps, stop, look at something, a few more
      S.plan(sl, t, [
        [0, { x: 800, speed: 34, accel: 120 }],
        [5.0, { tilt: .3, lookY: .7, lookX: .4, eye: 'happy' }],               // a flower
        [7.0, { tilt: 0, lookY: 0, lookX: 0, x: 900, eye: 'open' }],
        [EXCUSE + .3, { lookY: -1, lookX: .2, eye: 'happy' }],                 // the sky (doesn't hear a thing)
        [10.4, { lookY: 0, lookX: 0, x: 990, eye: 'open' }],
        [TURN, { face: -1, lookY: -.6, lookX: .4, eye: 'happy' }],             // a butterfly... behind
        [14.1, { face: 1, lookY: 0, lookX: 0, x: 1085 }],
        [SNIFF, { tilt: .38, crouch: .18, lookY: .8, eye: 'closed' }],         // smells the flower. for a while
        [18.6, { tilt: 0, crouch: 0, lookY: 0, eye: 'happy', x: 1290, speed: 60 }],
        [BIRD + .2, { lookY: -.8, lookX: .3 }], [22.6, { lookY: 0, lookX: 0 }],
        [23.0, { x: BENCH - 90, speed: 82, accel: 200 }],
        [SIT, { sit: 1, eye: 'happy', lookY: -.3, lookX: .3 }],
        [33.6, { lookX: -.8, eye: 'wide' }], [35.0, { eye: 'happy', lookX: .6 }],
      ]);
      // Bo: catches up at a run, then is stuck a polite step behind (there's only one line)
      S.plan(bo, t, [
        [0, { speed: 300, accel: 420, eye: 'squeeze' }],
        [SCREECH, { eye: 'wide', tilt: -.12 }], [SCREECH + .5, { eye: 'flat', tilt: 0 }],
        [PEEK, { tilt: -.2, lookX: -.5, lookY: -.3 }], [PEEK + .5, { tilt: .22, lookX: 1, lookY: -.4 }],   // a gap? any gap?
        [PEEK + 1.1, { tilt: -.2, lookX: -.5 }], [PEEK + 1.6, { tilt: .22, lookX: 1 }], [PEEK + 2.2, { tilt: 0, lookX: 0, lookY: 0, eye: 'flat' }],
        [EXCUSE, { eye: 'open', lookX: .5, crouch: .08 }], [EXCUSE + 1.8, { eye: 'flat', crouch: 0 }],
        [WIND, { crouch: .32, eye: 'squeeze', lookX: .6 }],                     // leapfrog time...
        [TURN + .1, { eye: 'wide' }], [TURN + .9, { crouch: 0, lookY: -1, lookX: -.3, eye: 'happy' }],   // ...nope. look at the sky
        [TURN + .9, () => S.sfx('whistle', { f: 1200, f2: 1700, d: .9 }, bo.x)],
        [14.4, { lookY: 0, lookX: 0, eye: 'flat' }],
        [16.0, { eye: 'squeeze', tilt: .06 }],
        [SIGH, { eye: 'closed', tilt: 0, crouch: .1 }], [SIGH, () => S.sfx('breathOut', { d: 1.4 }, bo.x)],
        [SIGH + 1.0, { eye: 'open', crouch: 0, lookX: .6, lookY: .6 }],          // ...what are they looking at?
        [BIRD + .3, { lookY: -.8, lookX: .4, eye: 'wide' }], [GOLD + .4, { eye: 'happy' }],
        [23.0, { lookY: 0, lookX: .3 }],
        [24.2, { x: BENCH + 200, speed: 90, accel: 900, eye: 'happy' }],   // hops over to the far end
        [SIT + .3, { sit: 1, eye: 'happy', lookY: -.3, lookX: .4 }],
        [UP, { sit: 0, lookY: 0, lookX: 0 }], [UP + .3, { x: BENCH + 640, speed: 190, accel: 400, eye: 'open' }],   // on ahead now
        [33.3, { lookX: -.9, face: 1, eye: 'wide' }],                         // someone's in a hurry
        [33.9, { eye: 'happy', crouch: .32 }],                                // go ahead!
        [35.4, { crouch: 0, lookX: 0 }],
        [36.4, { crouch: .2 }], [36.65, { crouch: 0 }], [36.65, () => bo.jump(0, -430)],
        [LEAVE, { x: 1e6, speed: V, accel: 450, eye: 'open', lookX: 0, lookY: 0, tilt: 0 }],
        [LEAVE + .1, () => S.sfx('hum', { notes: [2, 4, 5, 7, 5], gap: .3, g: .04 }, bo.x)],
      ]);
      if (t < 24.2) { c.x = sl.x - GAP; c.speed = t < SCREECH ? 300 : 70; c.accel = t < SCREECH ? 1100 : 300; }   // a polite step behind, always
      if (t > SCREECH - .3) S.once('screech', () => { S.sfx('skid', {}, bo.x); S.sfx('slip', {}, bo.x); S.shake(1.5); });
      // impatience: a tiny clock over Bo, ticking faster
      if (t > 15.6 && t < SIGH) { S.tick += dt; if (S.tick > lerp(.5, .2, seg(t, 15.6, SIGH))) { S.tick = 0; S.sfx('tick', { tock: Math.round(t * 5) % 2, gain: .55 }, bo.x); } }
      if (t > SIGH) S.once('popClock', () => S.sfx('pop', { pitch: 760, g: .07 }, bo.x));
      if (t > SNIFF + .3) S.once('sniff', () => { S.sfx('breathIn', { d: .8, gain: .7 }, sl.x); });
      if (t > SNIFF + 1.6) S.once('sniff2', () => S.sfx('breathIn', { d: .7, gain: .6 }, sl.x));
      if (t > EXCUSE + .3) S.once('ahem', () => S.sfx('gasp', {}, bo.x));
      if (t > TURN) S.once('turn', () => S.sfx('flap', {}, sl.x));
      // the bird: lands on the fence, sings, flies on; the light goes gold
      if (t > BIRD) S.once('birdIn', () => S.sfx('flap', {}, POST));
      [BIRD + .8, BIRD + 1.5, BIRD + 2.3, BIRD + 3.0].forEach((a, i) => { if (t > a) S.once('song' + i, () => { S.sfx('tweet', { k: 1 + i * .08, g: .9 }, POST); S.notes.push({ t0: t, i }); }); });
      if (t > GOLD) S.once('gold', () => { S.sfx('swell', { root: 349.23 }); S.sfx('sparkle', { n: 6 }, bo.x); });
      if (t > SIT + .6) S.once('sit', () => S.sfx('pad', { root: 261.63, d: 4, g: .7 }));
      // the button: someone in a hurry, stuck behind Bo for a moment, then over the top and away
      if (t > RUSH) S.once('rushIn', () => { teleport(ru, bo.x - 820); ru.hidden = false; Object.assign(ru.cmd, { x: 1e6, speed: 430, accel: 900, eye: 'squeeze' }); S.sfx('whoosh', { d: .6 }, ru.x); });
      if (t > 24.2 && t < 26) S.leapfrog(bo, sl, 'bench', 500);
      if (t > RUSH) { S.leapfrog(ru, sl); S.leapfrog(ru, bo); }
      if (t > RUSH + 2.6) S.once('rushLaugh', () => { S.sfx('laugh', { n: 3 }, bo.x); S.sfx('laugh', { n: 3, k: 1.35, g: .7 }, sl.x); });
      S.notes = S.notes.filter(n => t - n.t0 < 1.4);
      S.once('amb', () => S.sfx('birds', { d: LOOP, g: .9 }));

      if (t > 1) {
        S.camGoal.x = t < SIT - 1 ? (bo.x + sl.x) / 2 : t < UP + .2 ? BENCH : t < LEAVE ? BENCH + 400 : bo.x + 40;
        S.camGoal.z = t > SIT - 1 && t < UP + .2 ? .9 : t > UP && t < LEAVE ? .8 : 1.0; S.camGoal.kx = t > UP && t < LEAVE ? 3.2 : 2; S.camGoal.kz = 1.3;
      }
    },
    drawSky(S, ctx, t, v) {
      const g = goldAt(t);
      sun(ctx, v.left + (v.right - v.left) * .75, v.top + (GROUND - v.top) * (.22 + g * .3), 9 + g * 3, { X: mix(PAL.orange, '#ff8a3d', g) });
      for (let i = 0; i < 3; i++) {
        const W = v.right - v.left + 400, x = v.left - 200 + (1 - ((t / S.T + i / 3 + .7) % 1)) * W;
        cloud(ctx, x, v.top + (v.bottom - v.top) * (.17 + i * .06), 9, { X: mix('#ebe8f4', '#ffd6b8', g) });
      }
    },
    drawBack(S, ctx, t) {
      // a low fence along the path, flowers, and the bench with the view
      ctx.lineWidth = 4; ctx.strokeStyle = mix('#111', PAL.brown, .3);
      for (let x = 700; x < 1760; x += 120) { ctx.beginPath(); ctx.moveTo(x, GROUND + 2); ctx.lineTo(x, GROUND - 92); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(700, GROUND - 70); ctx.lineTo(1660, GROUND - 70); ctx.moveTo(700, GROUND - 40); ctx.lineTo(1660, GROUND - 40); ctx.stroke();
      // a tall old lamp post: the bird's perch, up above everyone's heads
      ctx.strokeStyle = '#111'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(POST, GROUND + 2); ctx.lineTo(POST, GROUND - 270); ctx.stroke();
      ctx.fillStyle = PAL.yellow; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(POST - 24, GROUND - 270); ctx.lineTo(POST + 24, GROUND - 270); ctx.lineTo(POST + 14, GROUND - 240); ctx.lineTo(POST - 14, GROUND - 240); ctx.closePath(); ctx.fill(); ctx.stroke();
      FLOWERS.forEach((x, i) => {
        const sw = Math.sin(t * 1.4 + i) * 4, h = 40 + (i % 2) * 14;
        ctx.strokeStyle = PAL.green; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, GROUND + 2); ctx.quadraticCurveTo(x + sw * .5, GROUND - h / 2, x + sw, GROUND - h); ctx.stroke();
        sprite(ctx, ['.X.X.', 'XXXXX', '.XCX.', 'XXXXX', '.X.X.'], x + sw, GROUND - h - 4, 4.6, { X: [PAL.pink, PAL.violet, PAL.sky, PAL.orange, PAL.pink][i], C: PAL.yellow });
      });
      ctx.strokeStyle = '#111'; ctx.lineWidth = 5; ctx.fillStyle = PAL.brown;
      ctx.beginPath(); ctx.roundRect(BENCH - 210, GROUND - 58, 420, 15, 6); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(BENCH - 200, GROUND - 122, 400, 14, 6); ctx.fill(); ctx.stroke();
      for (const x of [BENCH - 180, BENCH + 180]) { ctx.beginPath(); ctx.moveTo(x, GROUND - 122); ctx.lineTo(x, GROUND + 2); ctx.stroke(); }
    },
    drawFront(S, ctx, t) {
      const bo = S.bo, top = bo.top();
      // the butterfly that turns the slow walker round
      if (t > 11.8 && t < 15) { const u = t - 11.8; butterfly(ctx, S.slow.x - 120 + Math.sin(u * 2) * 50, top.y - 90 - u * 40 + Math.sin(u * 5) * 12, 5, { X: PAL.sky }, clamp(u * 2) * (1 - seg(t, 14.4, 15)), 11); }
      // the songbird on the fence post
      if (t > BIRD - .7 && t < BIRD + 4.6) {
        const inK = sine(seg(t, BIRD - .7, BIRD)), out = Math.max(0, t - (BIRD + 3.8)), px = POST, py = GROUND - 292;
        const x = lerp(px + 260, px, inK) + out * out * 300 + out * 160, y = lerp(py - 220, py, inK) - Math.sin(Math.PI * inK) * 40 - out * 260;
        const perched = t > BIRD && t < BIRD + 3.8, hop = perched && S.notes.length ? Math.sin(Math.PI * clamp((t - S.notes[S.notes.length - 1].t0) / .25)) * 6 : 0;
        bird(ctx, x, y - hop, 6.5, { X: PAL.yellow, O: PAL.orange }, 1, perched ? 0 : 9, perched ? -1 : (out > 0 ? 1 : -1));
        for (const n of S.notes) sprite(ctx, SPRITES.note, px - 30 - n.i * 4, py - 60 - (t - n.t0) * 50, 4.5, { X: [PAL.violet, PAL.pink, PAL.sky, PAL.orange][n.i] }, 1 - seg(t - n.t0, .9, 1.4));
      }
      // impatience: a little clock bubble over Bo
      if (t > 15.6 && t < SIGH + .3) {
        const k = outBack(seg(t, 15.6, 15.9)) * (1 - seg(t, SIGH, SIGH + .3)), bx = top.x + 50, by = top.y - 70 + Math.sin(t * 20) * 2 * seg(t, 16, SIGH);
        ctx.save(); ctx.translate(bx, by); ctx.scale(k, k); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        const a = t * 9; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(a) * 15, -Math.cos(a) * 15); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(a / 12) * 10, -Math.cos(a / 12) * 10); ctx.stroke();
        ctx.restore();
      }
      // speed lines on whoever's rushing
      for (const m of [bo, S.rush]) {
        const sp = clamp((Math.abs(m.vx) - 240) / 200); if (sp <= 0 || m.hidden) continue;
        ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
        for (let i = 0; i < 4; i++) { const ph = (t * 3 + hash(i)) % 1, y = m.y - 40 + i * 24; ctx.globalAlpha = Math.sin(Math.PI * ph) * sp * .6; const x0 = m.x - (95 + ph * 100); ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 - 80 * sp, y); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
    },
  });
})();
