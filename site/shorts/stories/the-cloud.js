/* the-cloud: extracted from ../the-cloud.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['the-cloud'] = story; } });
  // A little rain cloud follows Bo everywhere. Nothing shakes it off: walking away, running,
  // hiding, swatting. When Bo finally sits still in the rain, something green comes up,
  // the cloud clears, and Bo walks on. (Season 1, rebuilt on engine 2; the original is in legacy/.)
  // Button: a tiny new cloud drops in over Bo. Bo braces for rain... but it drifts over to the
  // sprout, gives it one drop, and the sprout waves its leaf. Bo laughs and hops off.
  const { PAL, SPRITES, sprite, lerp, seg, sine, outBack, clamp, hash, spring, mix, GROUND, BODY_H } = Shorts;
  const V = 120, GREY = '#a7abb2', RAIN = '#7f94b0';
  const PUFFS = [[-62, 12, 30], [-28, -8, 40], [18, -18, 46], [58, 0, 36], [82, 18, 24], [0, 20, 36], [-40, 22, 28], [40, 22, 30]];
  const SIT = 19.8, SPROUT = 22, CLEAR = 28.2, LEAVE = 38.1;
  // the tiny cloud: drops in over Bo, drifts to the sprout, one drop, waves goodbye, floats off
  const TINY = 33.0, DRIFT = 35.0, DROP = 35.9, WAVE = 36.3, AWAY = 36.6;
  const CLOUD_Y = 300;

  Shorts.play({
    title: 'The Cloud',
    accent: PAL.green,
    loopAfter: LEAVE + 7.4,
    captions: [
      [5.8, 7.4, 'oh. *a cloud.*'],
      [8.2, 9.8, 'go *away.*'],
      [11.3, 12.7, '*nope!*'],
      [16.6, 18.2, 'shoo! *shoo!*'],
      [20.6, 22.2, 'fine. you win.'],
      [25.0, 26.4, 'oh!'],
      [29.0, 33.0, 'sit with it. *something grows.*'],
    ],
    init(S) {
      S.bo = S.addChar({ x: 0, walk: V });
      S.cloud = { x: { x: 1700, v: 0 }, y: { x: -260, v: 0 }, dodge: { x: 0, v: 0 } };
      S.drops = []; S.splashes = []; S.dropN = 0; S.dropClock = 0; S.sproutX = 0; S.splashN = 0; S.breath = 0;
    },
    update(S, t, dt) {
      const bo = S.bo, cl = S.cloud;
      S.plan(bo, t, [
        [0, { x: 590, speed: V, accel: 450 }],
        [5.4, { lookY: -1, lookX: .2, tilt: -.12 }],             // notices the cloud
        [6.4, { eye: 'sad' }], [6.4, () => S.sfx('drain', {}, bo.x)],
        [7.2, { x: 1060, speed: 190, accel: 900, lookY: 0, lookX: 0, tilt: 0 }],   // tries to walk away
        [10.0, { lookY: -1, tilt: -.1 }],
        [10.7, { face: -1, lookY: 0, tilt: 0, eye: 'wide' }], [10.7, () => S.sfx('slip', {}, bo.x)],
        [11.0, { x: 640, speed: 400, accel: 1500 }],             // runs the other way
        [12.9, { lookY: -1, tilt: -.1, eye: 'sad' }],
        [13.9, { crouch: .2, sit: .7, eye: 'squeeze', lookY: 0, tilt: .08 }], [13.9, () => S.sfx('squish', {}, bo.x)],   // hides
        [15.8, { crouch: 0, sit: 0, eye: 'open', tilt: 0 }],
        [16.0, { face: 1, lookY: -1 }],
        [16.3, { crouch: .26 }],
        [16.62, { crouch: 0 }], [16.62, () => bo.jump(0, -980)],   // swats at it
        [17.0, () => S.sfx('poof', {}, bo.x)],
        [17.8, { crouch: .22, eye: 'squeeze' }],
        [18.1, { crouch: 0 }], [18.1, () => bo.jump(0, -720)],
        [18.4, () => S.sfx('poof', {}, bo.x)],
        [18.9, { eye: 'sad', lookY: -.6 }],
        [SIT, { sit: 1, tilt: .1, lookY: .2 }], [SIT, () => S.sfx('breathOut', { d: 1.4 }, bo.x)],   // gives up, sits in the rain
        [21.9, () => S.sproutX = bo.x + 118 * bo.dir],
        [SPROUT + .1, () => S.sfx('pop', { pitch: 520 }, S.sproutX)],
        [23.9, () => S.sfx('pop', { pitch: 780 }, S.sproutX)],
        [24.6, { lookX: 1, lookY: .8, eye: 'open', tilt: .18 }], // ...what's that?
        [24.6, () => S.sfx('twinkle', { pitch: 1568 }, S.sproutX)],
        [25.6, { eye: 'happy' }], [25.6, () => S.sfx('arp', { notes: [0, 2, 4, 7] })],
        [27.6, { tilt: -.06, lookY: -1, lookX: .2, eye: 'open' }],
        [CLEAR, () => { S.sfx('swell', { root: 392 }); S.sfx('sparkle', { n: 8 }, cl.x.x); }],
        [28.6, { eye: 'happy' }],
        [30.4, { sit: 0, tilt: 0, lookY: 0, lookX: 0 }],
        [30.9, { crouch: .2 }], [31.15, { crouch: 0 }], [31.15, () => bo.jump(0, -460)],
        [31.6, { x: S.sproutX + 100, speed: 110, accel: 450, eye: 'open' }],   // walks on past the sprout
        [TINY + .2, () => S.sfx('poof', {}, S.sproutX + 100)],
        [33.6, { lookY: -1, lookX: .1, tilt: -.1, eye: 'wide' }], [33.7, () => S.sfx('slip', {}, bo.x)],   // oh no. not again
        [34.5, { eye: 'squeeze', crouch: .14, lookY: -.4 }],                // braces for the rain...
        [35.3, { eye: 'open', crouch: 0, lookY: -1 }],                      // ...nothing?
        [35.6, { face: -1, lookY: -.3, lookX: .4, tilt: 0 }],               // it's gone over to the sprout
        [WAVE - .05, () => S.sfx('drip', { k: 1.1 }, S.sproutX)],
        [WAVE + .1, () => S.sfx('twinkle', { pitch: 1568, gain: .7 }, S.sproutX)],
        [AWAY, () => S.sfx('whoosh', { d: .7, v: .5 }, S.sproutX)],
        [36.6, { eye: 'happy', lookY: .3 }], [36.7, () => S.sfx('laugh', { n: 3 }, bo.x)],
        [37.3, { face: 1, crouch: .2, lookX: 0, lookY: 0 }], [37.55, { crouch: 0 }], [37.55, () => bo.jump(0, -460)],
        [LEAVE, { x: 1e6, speed: V, accel: 450, eye: 'open' }],
        [LEAVE + .1, () => S.sfx('hum', { notes: [2, 4, 5, 7, 5], gap: .3, g: .04 }, bo.x)],
      ]);
      if (t > SIT && t < 30.4) bo.cmd.crouch = .06 + .025 * Math.sin(t * 2.2);   // tired breathing
      if (t > SIT && t < 30.4) { S.breath += dt; if (S.breath > 3.1) { S.breath = 0; S.sfx('breathOut', { d: .9 }, bo.x); } }

      // the cloud chases on a soft, laggy spring, so it overshoots when Bo turns; once it
      // has rained on the sprout it brightens and floats up and away
      const follow = t >= 2.2 && t < SPROUT + 4.5;
      const tx = follow ? bo.x + 6 * bo.dir : t < 2.2 ? 1700 : S.sproutX + 40;
      const ty = t > CLEAR + .6 ? -700 : t >= 2.2 ? CLOUD_Y + Math.sin(t * 1.4) * 6 : -260;
      spring(cl.x, tx, 4.5, .55, dt);
      spring(cl.y, ty, t > CLEAR + .6 ? 1.4 : 3, .8, dt);
      spring(cl.dodge, bo.mode === 'air' && bo.vy > -500 ? -95 : 0, 90, .5, dt);
      if (t > 2.4) S.once('whoosh', () => S.sfx('whoosh', { d: .9 }, cl.x.x));

      const rate = t < 4 ? 0 : t < 26 ? .045 : t < CLEAR ? .1 : 0;
      if (rate) {
        S.dropClock += dt;
        while (S.dropClock >= rate) {
          S.dropClock -= rate; const n = S.dropN++;
          S.drops.push({ x: cl.x.x + (hash(n) - .5) * 160, y: cl.y.x + cl.dodge.x + 30 + hash(n + .5) * 10 });
        }
      }
      S.drops = S.drops.filter(d => {
        d.y += 950 * dt;
        const dx = d.x - bo.x, hw = 66;
        const hit = (y, onBo) => {
          S.splashes.push({ x: d.x, y, t0: t });
          const k = S.splashN++;
          if (onBo && k % 5 === 0) S.sfx('drip', { k: .9 + hash(k) * .3 }, d.x);
          else if (k % 3 === 0) S.sfx('rain', { v: .9 }, d.x);
          return false;
        };
        if (Math.abs(dx) < hw && bo.mode !== 'held') {
          const topY = bo.y - BODY_H * (1 - bo.q.x) * Math.sqrt(1 - (dx / hw) ** 2);
          if (d.y >= topY) return hit(topY, true);
        }
        if (d.y >= GROUND) return hit(GROUND, false);
        return true;
      });
      S.splashes = S.splashes.filter(s => t - s.t0 < .22);

      // frame Bo and the sprout once it starts; for the tiny cloud, hold on the sprout and Bo
      if (t > SPROUT - 1 && t < LEAVE) { S.camGoal.x = t > TINY ? S.sproutX + 70 : bo.x + 60; S.camGoal.z = 1.12; S.camGoal.kz = 1.5; if (t > TINY) S.camGoal.kx = 2; }
    },
    drawSky(S, ctx, t, v) {
      // once the cloud has gone, a little pixel sun
      const k = sine(seg(t, CLEAR + .4, CLEAR + 2));
      if (k > .01) {
        const x = S.sproutX + 260, y = v.top + (GROUND - v.top) * .28 + (1 - k) * 80;
        sprite(ctx, ['..X.X..', 'X.....X', '..XXX..', '.XXXXX.', '..XXX..', 'X.....X', '..X.X..'], x, y, 9, { X: PAL.yellow }, k);
      }
    },
    drawBack(S, ctx, t) {
      // the sprout: stem first, then two leaves; it keeps growing a little after the rain
      if (t > SPROUT) {
        const sx = S.sproutX, g = seg(t, SPROUT, 24.6), grow = 1 + .35 * sine(seg(t, CLEAR, CLEAR + 2));
        const h = 78 * outBack(g) * grow, sway = Math.sin(t * 2.3) * 3 * g;
        ctx.strokeStyle = PAL.green; ctx.fillStyle = PAL.green; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(sx, GROUND + 1); ctx.quadraticCurveTo(sx - 6, GROUND - h * .5, sx + sway, GROUND - h); ctx.stroke();
        const lf = outBack(seg(t, 23.8, 25.4)) * grow, tx = sx + sway, ty = GROUND - h;
        // after the tiny cloud's drop, the right leaf waves at Bo
        const wv = t > WAVE && t < WAVE + 1.3 ? Math.sin((t - WAVE) * 15) * 16 * (1 - seg(t, WAVE + .7, WAVE + 1.3)) : 0;
        if (lf > 0) for (const s of [-1, 1]) {
          const w = s > 0 ? wv : 0;
          ctx.beginPath(); ctx.moveTo(tx, ty);
          ctx.quadraticCurveTo(tx + s * 12 * lf, ty - 22 * lf - w, tx + s * 34 * lf, ty - 16 * lf - w * 1.8);
          ctx.quadraticCurveTo(tx + s * 20 * lf, ty + 4 * lf - w, tx, ty);
          ctx.fill();
        }
        // and after the rain, a flower (it does a little bounce when the drop lands)
        const fl = outBack(seg(t, CLEAR + .8, CLEAR + 1.6)) * (1 + .35 * Math.sin(Math.PI * seg(t, WAVE - .05, WAVE + .35)));
        if (fl > .05) sprite(ctx, ['..X..', '.XXX.', 'XXCXX', '.XXX.', '..X..'], tx, ty - 4, 6 * fl, { X: PAL.pink, C: PAL.yellow });
      }
    },
    drawFront(S, ctx, t) {
      ctx.strokeStyle = RAIN; ctx.lineWidth = 3;
      for (const d of S.drops) { ctx.beginPath(); ctx.moveTo(d.x, d.y - 18); ctx.lineTo(d.x, d.y); ctx.stroke(); }
      for (const s of S.splashes) {
        const u = (t - s.t0) / .22; ctx.lineWidth = 2.5 * (1 - u) + .5;
        for (const side of [-1, 1]) {
          ctx.beginPath(); ctx.moveTo(s.x + side * 3, s.y - 2);
          ctx.lineTo(s.x + side * (6 + 12 * u), s.y - 6 - 10 * u + 14 * u * u); ctx.stroke();
        }
      }
      // the tiny cloud: a little white puff with a face, outlined so it reads on white paper
      if (t > TINY && t < AWAY + 2.2) {
        const sx = S.sproutX, a = sine(seg(t, TINY, TINY + .9)), d = sine(seg(t, DRIFT, DRIFT + .8)), u = seg(t, AWAY, AWAY + 2.2);
        const x = lerp(sx + 100, sx + 10, d) - 420 * u * u + Math.sin(t * 2.6) * 5;
        const y = lerp(-220, 330, a) - 700 * u * u + Math.sin(t * 3.1) * 6 - 10 * Math.sin(Math.PI * seg(t, DROP - .2, DROP + .1));
        const k = .45 * (1 + .12 * Math.sin(Math.PI * seg(t, DROP - .2, DROP + .1)));   // squeezes out the drop
        ctx.lineWidth = 10; ctx.strokeStyle = '#111';
        for (const [ox, oy, r] of PUFFS) { ctx.beginPath(); ctx.arc(x + ox * k, y + oy * k, r * k, 0, Math.PI * 2); ctx.stroke(); }
        ctx.fillStyle = '#f4f8fd';
        for (const [ox, oy, r] of PUFFS) { ctx.beginPath(); ctx.arc(x + ox * k, y + oy * k, r * k, 0, Math.PI * 2); ctx.fill(); }
        ctx.fillStyle = '#111';
        const happy = t > WAVE;
        for (const ex of [-9, 9]) {
          if (happy) { ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + ex, y + 6, 4, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
          else { ctx.beginPath(); ctx.arc(x + ex, y + 3, 3.2, 0, Math.PI * 2); ctx.fill(); }
        }
        // one drop, onto the sprout
        const p = seg(t, DROP, WAVE - .05);
        if (p > 0 && p < 1) {
          const h = 78 * 1.35, dy = lerp(y + 26, GROUND - h - 6, p * p);
          ctx.strokeStyle = RAIN; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, dy - 16); ctx.lineTo(x, dy); ctx.stroke();
        }
        ctx.strokeStyle = '#111';
      }
      const cl = S.cloud, cx = cl.x.x, cy = cl.y.x + cl.dodge.x;
      ctx.fillStyle = mix(GREY, '#e9eef6', sine(seg(t, CLEAR - .4, CLEAR + .8)));
      for (const [ox, oy, r] of PUFFS) {
        ctx.beginPath(); ctx.arc(cx + ox, cy + oy + Math.sin(t * 2 + ox) * 2, r, 0, Math.PI * 2); ctx.fill();
      }
    },
  });
})();
