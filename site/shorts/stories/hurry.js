/* hurry: extracted from ../hurry.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['hurry'] = story; } });
  // A ticking clock hounds Bo from a walk to a jog to a sprint, the world streaking by,
  // until Bo trips. Sitting in the grass, Bo meets a snail and a butterfly.
  // Button: as Bo strolls on, the snail comes zooming up from behind, speed lines and all, and
  // overtakes. Bo stops, stares, deadpan... then laughs, hops, and strolls on anyway.
  const { PAL, SPRITES, sprite, lerp, seg, sine, outBack, clamp, hash, spring, GROUND, BODY_H } = Shorts;
  const V = 130, PEB = 3900, ZONE_END = 3700, STOP = 14.78;   // STOP: when Bo comes to rest after the trip
  // the button, in seconds after STOP: the snail floors it, Bo reacts, Bo walks on
  const ZOOM = 10.7, LEAVE = 14.6;
  const PROPS = [];
  for (let x = 700, i = 0; x <= ZONE_END; x += 160, i++) PROPS.push({ x, kind: i % 3 === 1 ? 'tree' : 'post' });
  const GRASS = Array.from({ length: 14 }, (_, i) => PEB + 40 + i * 48 + hash(i) * 20);
  const CLOCK = ['...XXXXX...', '..XYYYYYX..', '.XYYYYYYYX.', 'XYYYYYYYYYX', 'XYYYYYYYYYX', 'XYYYYYYYYYX', 'XYYYYYYYYYX', 'XYYYYYYYYYX', '.XYYYYYYYX.', '..XYYYYYX..', '...XXXXX...'];

  Shorts.play({
    title: 'Hurry',
    accent: PAL.orange,
    loopAfter: STOP + LEAVE + 6.8,
    captions: [
      [2.9, 4.6, 'tick.'],
      [5.0, 7.4, 'hurry.'],
      [8.4, 10.6, '*faster.*'],
      [11.4, 13.6, '*FASTER!*'],
      [STOP + 2.8, STOP + 5.8, 'slow down.'],
      [STOP + 7.4, STOP + 11.8, "you'll still *get there.*"],
    ],
    init(S) {
      S.bo = S.addChar({ x: 0, walk: V });
      S.clock = { x: { x: 0, v: 0 }, y: { x: 0, v: 0 }, fly: null, gone: false };
      S.stopT = null; S.snail = null; S.tick = 0; S.tickN = 0; S.wind = 0; S.ring = 0;
    },
    update(S, t, dt) {
      const bo = S.bo, ck = S.clock;
      if (S.stopT === null) S.plan(bo, t, [
        [0, { x: 1e6, speed: V, accel: 300 }],
        [3.4, { lookX: .6, lookY: -.6 }],
        [4.4, { eye: 'wide', lookX: 0, lookY: 0 }],
        [4.6, { speed: 220 }],                                     // hurry
        [7.6, { lookX: .6, lookY: -.6 }], [8.0, { speed: 340, accel: 400, lookX: 0, lookY: 0, eye: 'open' }],
        [11.0, { speed: 520, accel: 500, eye: 'squeeze' }],      // sprint
      ]);
      if (t > 11 && S.stopT === null) S.shake(.9);

      // trip on the pebble, tumble twice, end up sitting
      if (bo.x >= PEB - 30) S.once('trip', () => {
        bo.jump(bo.vx * .62, -620, 13); S.shake(4); S.sfx('trip', {}, bo.x);
        ck.fly = { x: ck.x.x, y: ck.y.x, vx: bo.vx * .9, vy: -700 };
      });
      if (S.fired.has('trip') && bo.lands === 1) S.once('bounce', () => { bo.jump(bo.vx * .5, -360, 9); S.shake(3); });
      if (S.fired.has('bounce') && bo.lands === 2) S.once('rest', () => {
        S.stopT = t; S.shake(3);
        S.snail = { x: bo.x + 300 };
        Object.assign(bo.cmd, { x: bo.x + 60, speed: 200, accel: 900, sit: 1, eye: 'dizzy', crouch: 0, lookX: 0, lookY: 0 });
      });
      if (S.stopT !== null) {
        const ts = t - S.stopT, sn = S.snail;
        // the snail crawls... until, off screen behind Bo, it turns round and floors it
        if (ts < ZOOM) sn.x -= 22 * dt;
        else { sn.dir = 1; sn.v = Math.min(460, (sn.v || 0) + 1000 * dt); sn.x += sn.v * dt; }
        const c = bo.cmd;
        if (ts > 1.6) { c.eye = 'sad'; c.lookX = -.5; c.lookY = .2; }
        if (ts > 2.4) { c.lookX = clamp((sn.x - bo.x) / 150, -1, 1); c.lookY = .7; }
        if (ts > 4.6) c.eye = 'happy';
        if (ts > 6.5) { c.sit = 0; c.eye = 'open'; }
        if (ts > 7.2) Object.assign(c, { x: 1e6, speed: V, accel: 300, lookX: 0, lookY: 0, eye: 'open' });
        if (ts > 11.6) Object.assign(c, { eye: 'wide', lookX: clamp((sn.x - bo.x) / 200, -1, 1), lookY: .3 });   // what's that noise?
        if (ts > 11.95) Object.assign(c, { speed: 0, accel: 700, tilt: ts < 12.4 ? -.12 : 0 });                 // whoosh: overtaken
        if (ts > 12.9) c.eye = 'flat';                                                                     // ...really?
        if (ts > 13.4) Object.assign(c, { eye: 'happy', lookX: .4, lookY: 0, crouch: ts < 13.95 ? .08 * Math.abs(Math.sin((ts - 13.4) * 17)) : 0 });
        if (ts > 14.0) c.crouch = ts < 14.25 ? .2 : 0;
        if (ts > 14.25) S.once('hop', () => bo.jump(0, -440));
        if (ts > LEAVE) Object.assign(c, { x: 1e6, speed: V, accel: 450, eye: 'open', lookX: 0, lookY: 0, tilt: 0, crouch: 0 });
        if (sn.dir && sn.x > bo.x - 60) S.once('zoom', () => { S.sfx('whoosh', { d: .35, v: .55 }, sn.x); S.puff(sn.x, -1, .8); bo.q.v += 3; });
        if (ts > 13.4) S.once('laugh', () => S.sfx('laugh', { n: 4 }, bo.x));
        if (ts > LEAVE + .1) S.once('hum', () => S.sfx('hum', { notes: [2, 4, 5, 7, 5], gap: .3, g: .04 }, bo.x));
      }

      // the clock: follows Bo on a springy leash, panics more and more, then flies off and shatters
      if (!ck.fly) {
        const top = bo.top();
        spring(ck.x, top.x + 70, 40, .55, dt); spring(ck.y, top.y - 70 + Math.sin(t * 5) * 6, 40, .55, dt);
      } else if (!ck.gone) {
        const f = ck.fly; f.vy += 2200 * dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= Math.exp(-.6 * dt);
        if (f.y > GROUND - 30 && f.vy > 0) {
          ck.gone = true; S.shake(2); S.sfx('shatter', {}, f.x);
          S.burst(f.x, GROUND - 30, 34, [PAL.yellow, PAL.yellow, '#111', PAL.orange], { speed: 520, gravity: 1400, size: 9, life: 1.2, spread: 2.6 });
        }
      }
      // sound: the tick speeds up with the panic, an alarm trill at a sprint, wind with speed
      const panic = clamp((bo.vx - V) / 390);
      if (t > 2.6) S.once('clockPop', () => S.sfx('pop', { pitch: 880, g: .12 }, ck.x.x));
      if (t > 2.9 && !ck.fly) {
        S.tick += dt;
        if (S.tick >= .5 / (1 + panic * 4)) { S.tick = 0; S.sfx('tick', { tock: S.tickN++ % 2 }, ck.x.x); }
        if (panic > .55) { S.ring += dt; if (S.ring >= .45) { S.ring = 0; S.sfx('ring', {}, ck.x.x); } }
      }
      if (bo.vx > 260 && bo.mode === 'ground') { S.wind += dt; if (S.wind >= .08) { S.wind = 0; S.sfx('wind', { v: clamp((bo.vx - 260) / 260) }); } }
      if (S.stopT !== null) {
        const ts = t - S.stopT;
        if (ts > 4) S.once('flyLand', () => S.sfx('twinkle', { pitch: 2637, gain: .6 }, bo.x));
        if (ts > 4.6) S.once('calm', () => S.sfx('swell', { root: 330 }));
      }
      if (S.stopT === null) S.camGoal.z = 1 - .16 * clamp((bo.vx - V) / 390);
      else S.camGoal.z = 1 + .08 * sine(seg(t, S.stopT + 1, S.stopT + 3)) * (1 - sine(seg(t, S.stopT + 6.5, S.stopT + 9)));
    },
    drawSky(S, ctx, t, v) {
      // clouds drift faster as Bo speeds up; they always keep the loop's rhythm
      for (let i = 0; i < 3; i++) {
        const W = v.right - v.left + 400, x = v.left - 200 + (1 - ((t / S.T * 2 + i / 3 + .15) % 1)) * W;
        sprite(ctx, SPRITES.cloud, x, v.top + (v.bottom - v.top) * (.25 + i * .06), 9, { X: '#ebe8f4' });
      }
    },
    drawBack(S, ctx, t, v) {
      for (const p of PROPS) {
        if (p.x < v.left - 80 || p.x > v.right + 80) continue;
        if (p.kind === 'post') {
          ctx.fillStyle = '#fff'; ctx.lineWidth = 5;
          ctx.beginPath(); ctx.roundRect(p.x - 7, GROUND - 74, 14, 76, 3); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(p.x - 80, GROUND - 52); ctx.lineTo(p.x + 80, GROUND - 52); ctx.stroke();
        } else {
          ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(p.x, GROUND + 2); ctx.lineTo(p.x, GROUND - 90); ctx.stroke();
          sprite(ctx, ['..XXXX..', '.XXXXXX.', 'XXXXXXXX', 'XXXXXXXX', '.XXXXXX.', '..XXXX..'], p.x, GROUND - 120, 11, { X: PAL.green });
        }
      }
      // after the rush: grass, a flower, the pebble
      ctx.strokeStyle = PAL.green; ctx.lineWidth = 4;
      GRASS.forEach((gx, i) => {
        for (let k = -1; k <= 1; k++) {
          const a = k * .35 + Math.sin(t * 1.6 + i) * .12;
          ctx.beginPath(); ctx.moveTo(gx + k * 4, GROUND + 2); ctx.lineTo(gx + k * 4 + Math.sin(a) * 14, GROUND - Math.cos(a) * 14); ctx.stroke();
        }
      });
      const fx = PEB + 380; ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(fx, GROUND + 2); ctx.quadraticCurveTo(fx - 4, GROUND - 30, fx + Math.sin(t * 1.3) * 4, GROUND - 58); ctx.stroke();
      sprite(ctx, ['..X..', '.XXX.', 'XXCXX', '.XXX.', '..X..'], fx + Math.sin(t * 1.3) * 4, GROUND - 58, 6, { X: PAL.orange, C: PAL.yellow });
      ctx.fillStyle = PAL.grey; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.ellipse(PEB, GROUND - 4, 13, 8, 0, Math.PI, 0); ctx.fill(); ctx.stroke();
    },
    drawFront(S, ctx, t) {
      const bo = S.bo, ck = S.clock;
      // speed lines
      const sp = clamp((bo.vx - 260) / 260);
      if (sp > 0 && bo.mode === 'ground') {
        ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
        for (let i = 0; i < 7; i++) {
          const ph = (t * 3 + hash(i)) % 1, y = bo.y - 60 + i * 20 + hash(i + 3) * 10, len = 60 + 140 * sp;
          ctx.globalAlpha = Math.sin(Math.PI * ph) * sp * .7;
          const x0 = bo.x - 110 - ph * 160;
          ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 - len, y); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      // the clock
      if (!ck.gone && t > 2.6) {
        const f = ck.fly, x = f ? f.x : ck.x.x, y = f ? f.y : ck.y.x;
        const panic = clamp((bo.vx - V) / 390), k = outBack(seg(t, 2.6, 3.1));
        const wob = Math.sin(t * (8 + panic * 30)) * (.08 + panic * .25) + (f ? t * 12 : 0);
        ctx.save(); ctx.translate(x, y); ctx.rotate(wob); ctx.scale(k, k);
        sprite(ctx, CLOCK, 0, 0, 5.6, { X: '#111', Y: PAL.yellow });
        ctx.fillRect(-16, -38, 10, 8); ctx.fillRect(6, -38, 10, 8);           // bells
        ctx.lineWidth = 3.5; ctx.strokeStyle = '#111';
        const ha = t * (1 + panic * 14), ma = t * (6 + panic * 70);
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ha) * 12, -Math.cos(ha) * 12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(ma) * 20, -Math.cos(ma) * 20); ctx.stroke();
        ctx.restore();
        if (panic > .5 && !f && Math.floor(t * 6) % 2) sprite(ctx, ['XX', 'XX', 'XX', '..', 'XX'], x + 44, y - 26, 5, { X: PAL.red });
      }
      // snail (green shell, slow... mostly); it faces left until it turns round to zoom
      if (S.snail) {
        const s = S.snail, ts = t - S.stopT, stretch = Math.sin(ts * 3) * 3, fast = clamp(((s.v || 0) - 150) / 300);
        ctx.save(); if (s.dir) { ctx.translate(s.x * 2, 0); ctx.scale(-1, 1); }
        if (fast > 0) {
          ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
          for (let i = 0; i < 4; i++) {
            const ph = (t * 4 + hash(i + 9)) % 1, y = GROUND - 6 - i * 7, x0 = s.x + 44 + ph * 50;
            ctx.globalAlpha = Math.sin(Math.PI * ph) * fast; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + 40 + 60 * fast, y); ctx.stroke();
          }
          ctx.globalAlpha = 1;
        }
        ctx.lineWidth = 5; ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.moveTo(s.x - 26 - stretch, GROUND + 2); ctx.lineTo(s.x + 24, GROUND + 2);
        ctx.quadraticCurveTo(s.x + 30, GROUND - 14, s.x + 14, GROUND - 12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s.x - 22 - stretch, GROUND - 6); ctx.lineTo(s.x - 34 - stretch, GROUND - 26); ctx.stroke();
        ctx.beginPath(); ctx.arc(s.x - 35 - stretch, GROUND - 28, 3, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        sprite(ctx, ['..XXXX..', '.XGGGGX.', 'XGGXXGGX', 'XGXGGXGX', 'XGXXGGGX', '.XGGGGX.', '..XXXX..'], s.x + 6, GROUND - 22, 5, { X: '#111', G: PAL.lime });
        ctx.restore();
      }
      // a butterfly settles on Bo's hair
      if (S.stopT !== null) {
        const ts = t - S.stopT, T = bo.tuft;
        if (ts > 3 && ts < 9) {
          const inK = sine(seg(ts, 3, 4)), outK = sine(seg(ts, 7.5, 9));
          const x = lerp(T.x + 300, T.x, inK) + outK * 420 + Math.sin(ts * 6) * 20 * (1 - inK + outK);
          const y = lerp(T.y - 260, T.y - 10, inK) - outK * 420;
          const flap = ts > 4 && ts < 7.5 ? Math.floor(ts * 3) % 3 === 0 : Math.floor(t * 12) % 2;
          sprite(ctx, flap ? SPRITES.flyA : SPRITES.flyB, x, y, 4.2, { X: PAL.pink, B: '#111' });
        }
      }
    },
  });
})();
