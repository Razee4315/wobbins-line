/* just-in-case: extracted from ../just-in-case.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['just-in-case'] = story; } });
  // Bo stops at an umbrella and hops it onto its head. Then a sweater. A lamp. A rubber duck.
  // A ladder. Why? Friends skip past with nothing: it's a picnic on the hill. Bo can't get up the
  // hill under all that, slides back, sits, and lets it all go. Light again, Bo bounds to the top.
  // Button: Bo kept just one thing, the umbrella. A little cloud rains on the picnic, the umbrella
  // pops open over everyone ("just in case!"), then Bo pops it onto a friend's head as a gift.
  const { PAL, SPRITES, sprite, lerp, seg, sine, outBack, clamp, hash, spring, mix, GROUND, GRAV } = Shorts;
  const V = 140, HILL_A = 1560, HILL_TOP = 1900, HILL_B = 2160, HILL_END = 2520, HILL_H = 160, PICNIC = 2030;
  const s3 = k => k * k * (3 - 2 * k);
  const groundAt = x => GROUND - HILL_H * (x < HILL_A ? 0 : x < HILL_TOP ? s3((x - HILL_A) / (HILL_TOP - HILL_A)) : x < HILL_B ? 1 : x < HILL_END ? 1 - s3((x - HILL_B) / (HILL_END - HILL_B)) : 0);
  const ITEMS = [
    { k: 'umbrella', x: 760, h: 96, rows: ['..X..', '.XXX.', '.XXX.', 'XXXXX', '..H..', '..H..', '..H..', '.HH..'], px: 12, c: { X: PAL.red, H: '#111' } },
    { k: 'sweater', x: 900, h: 52, rows: ['XXXXXXXX', 'XWXXXXWX', 'XXXXXXXX', 'XXXXXXXX'], px: 13, c: { X: PAL.green, W: '#fff' } },
    { k: 'lamp', x: 1040, h: 64, rows: ['.YYYY.', 'YYYYYY', 'YYYYYY', '..KK..', '..KK..', '.KKKK.'], px: 11, c: { Y: PAL.yellow, K: '#111' } },
    { k: 'duck', x: 1180, h: 60, rows: ['.XX...', 'XXXO..', '.XXXX.', 'XXXXXX', '.XXXX.'], px: 12, c: { X: PAL.yellow, O: PAL.orange } },
    { k: 'ladder', x: 1320, h: 236, rows: ['X.X', 'XXX', 'X.X', 'X.X', 'XXX', 'X.X', 'X.X', 'XXX', 'X.X', 'X.X', 'XXX', 'X.X', 'X.X', 'XXX', 'X.X'], px: 16, c: { X: PAL.brown } },
  ];
  const GRAB = [4.9, 7.6, 10.3, 13.0, 15.7];         // when Bo hops each one up
  const SLIDE = 22.6, SIT = 23.8, DROP = 27.8, LIGHT = 30.0, UPHILL = 31.0, LEAVE = 42.2, LOOP = LEAVE + 9.1;   // long walk-off: hill, tree and sun out of view at the seam
  const CLOUD_IN = 36.4, RAIN = [37.6, 40.6], POP = 38.2, HUDDLE = 38.4, HEARTS = 39.7, CLOSE = 40.8, GIVE = 41.2;
  const HUDDLE_X = [1985, 2070, 2150];
  // the open umbrella, leaning over the friends: canopy centre, half-width and tilt, from Bo's head top
  const canopy = (top, k) => ({ x: top.x + 105 * k, y: top.y - 18 - 77 * k, rx: 210 * k, ry: 80 * k, rot: .12 * k });

  Shorts.play({
    title: 'Just in Case',
    accent: PAL.orange,
    voice: { pitch: 1 },
    loopAfter: LOOP,
    ground: x => groundAt(x),
    captions: [
      [5.3, 6.7, 'in case it rains.'],
      [8.0, 9.3, "in case it's cold."],
      [10.7, 12.1, 'in case it gets dark.'],
      [13.4, 14.9, 'in case of... *ducks?*'],
      [16.1, 17.2, '*just in case.*'],
      [18.6, 19.9, 'picnic! come on!', null, { pitch: 1.3 }],
      [24.0, 25.4, "it's all *too heavy.*"],
      [26.0, 27.6, 'do i *really* need all this?'],
      [LIGHT, LIGHT + 1, '*ahh.*'],
      [33.6, 37.2, 'pack light. keep *one umbrella.*'],
      [37.8, 38.7, '*rain?!*', null, { pitch: 1.3 }],
      [38.9, 40.2, '*just in case!*'],
    ],
    init(S) {
      const look = [{ hair: 'curl', blush: PAL.pink, fill: '#ffe9f2' }, { hair: 'antenna', hairColor: PAL.blue, fill: '#e6f0ff' }, { hairColor: PAL.orange, blush: '#ffb08a', fill: '#fff4d6' }];
      S.friends = look.map((o, i) => S.addChar({ x: -900 - i * 150, face: 1, gain: .4, ...o }));
      S.bo = S.addChar({ x: 0, walk: V }); S.focus = S.bo;
      S.stack = []; S.loose = []; S.sway = { x: 0, v: 0 }; S.creak = 0; S.gift = null;
    },
    update(S, t, dt) {
      const bo = S.bo, c = bo.cmd, n = S.stack.length;
      const grab = i => () => { S.stack.push({ ...ITEMS[i], t0: t }); S.sfx('toss', { pitch: 300 + i * 40 }, bo.x); S.sway.v += 40; };
      S.plan(bo, t, [
        [0, { x: ITEMS[0].x - 40, speed: V, accel: 450 }],   // (sorted by time below: plan applies steps in list order)
        ...GRAB.map((g, i) => [g - .8, { lookX: .8, lookY: .5 }]),
        ...GRAB.map((g, i) => [g - .3, { crouch: .2 }]),
        ...GRAB.map((g, i) => [g, { crouch: 0, lookX: 0, lookY: 0 }]),
        ...GRAB.map((g, i) => [g, () => { bo.jump(0, -380); grab(i)(); }]),
        ...GRAB.slice(0, 4).map((g, i) => [g + 1.0, { x: ITEMS[i + 1].x - 40, speed: 120 - i * 14, accel: 300 }]),
        [GRAB[4] + 1.0, { x: HILL_A + 120, speed: 70, accel: 200, eye: 'flat' }],
        [19.0, { lookX: .7, eye: 'sad' }], [20.0, { lookX: 0, eye: 'flat' }],
        [SLIDE, { x: HILL_A - 60, speed: 120, accel: 400, eye: 'wide' }], [SLIDE, () => S.sfx('slip', {}, bo.x)],
        [SIT, { sit: 1, eye: 'sad', tilt: .08 }], [SIT, () => S.sfx('breathOut', { d: 1.4 }, bo.x)],
        [25.8, { lookY: -1, lookX: -.2, eye: 'open', tilt: -.1 }],
        [DROP - .2, { tilt: 0, lookY: 0 }],
        [29.3, { lookY: -1, lookX: .2 }], [29.8, { lookY: 0, lookX: 0 }],                // ...but keeps the umbrella
        [LIGHT, { eye: 'happy', sit: 0 }], [LIGHT, () => { S.sfx('swell', { root: 392 }); S.sfx('laugh', { n: 3 }, bo.x); }],
        [LIGHT + .4, { crouch: .2 }], [LIGHT + .65, { crouch: 0 }], [LIGHT + .65, () => bo.jump(120, -560)],
        [UPHILL, { x: PICNIC - 110, speed: 230, accel: 700, eye: 'happy' }],
        [33.0, () => { S.sfx('arp', { notes: [0, 2, 4, 7, 9] }); S.sfx('sparkle', { n: 8 }, PICNIC); }],
        [33.2, { crouch: .2 }], [33.45, { crouch: 0 }], [33.45, () => bo.jump(0, -520)],
        [RAIN[0] + .1, { eye: 'wide', lookY: -.8 }],
        [POP - .25, { crouch: .2 }], [POP, { crouch: 0, eye: 'happy', lookY: -.4, lookX: .5 }],
        [CLOSE, { lookX: .8, lookY: 0 }],
        [GIVE - .25, { crouch: .2 }], [GIVE, { crouch: 0 }], [GIVE, () => bo.jump(0, -420)],   // here, you have it
        [LEAVE, { x: 1e6, speed: V, accel: 450, eye: 'open', lookX: 0, lookY: 0 }],
        [LEAVE + .1, () => S.sfx('hum', { notes: [2, 4, 5, 7, 5], gap: .3, g: .04 }, bo.x)],
      ].sort((a, b) => a[0] - b[0]));
      // the stack sways with every step; it creaks when Bo is struggling
      spring(S.sway, clamp(-bo.vx * .1 - bo.axs * .012, -30, 30) + (n > 3 ? Math.sin(t * 3.2) * (n - 3) * 6 : 0), 30, .25, dt);
      if (n > 2 && t > 16 && t < DROP) { S.creak += dt; if (S.creak > 1.3) { S.creak = 0; S.sfx('creak', {}, bo.x); } }
      S.stack.forEach((it, i) => { if (t > it.t0 + .4) S.once('stacked' + i, () => S.sfx('tock', { f: 520 + i * 60, gain: .7 }, bo.x)); });
      if (n >= 4 && t > 14 && t < SIT) bo.cmd.crouch = .08 + .03 * Math.sin(t * 5);   // heavy
      // the struggle up the hill, then the slide back down
      if (t > GRAB[4] + 1.0 && t < SLIDE && bo.x > HILL_A + 40) bo.cmd.speed = 20;
      // letting go: one thing at a time slides off and tumbles away
      if (t > DROP && S.stack.length) {
        const k = Math.floor((t - DROP) / .42);
        while (S.stack.length > 1 && ITEMS.length - S.stack.length <= k) {   // all but the umbrella
          const it = S.stack.pop(), top = bo.top(), j = S.stack.length;
          S.loose.push({ ...it, x: top.x, y: top.y - 30 - j * 30, vx: (j % 2 ? -1 : 1) * (160 + hash(j) * 160), vy: -420, rot: 0, spin: (hash(j + .3) - .5) * 10, rest: false });
          S.sfx('whoosh', { d: .3 }, bo.x); bo.q.v -= 1.6; S.sway.v += 30;
        }
      }
      for (const it of S.loose) {
        if (it.rest) continue;
        it.vy += GRAV * .8 * dt; it.x += it.vx * dt; it.y += it.vy * dt; it.rot += it.spin * dt;
        const g = groundAt(it.x) - it.h / 2;
        if (it.y > g && it.vy > 0) { it.y = g; it.vy *= -.3; it.vx *= .5; it.spin *= .4; S.sfx('thump', { g: .35 }, it.x); S.sfx('tock', { f: 380 + hash(it.x) * 300, gain: .6 }, it.x); if (Math.abs(it.vy) < 80) { it.rest = true; it.rot = it.k === 'ladder' ? Math.PI / 2 : 0; it.y = groundAt(it.x) - (it.k === 'ladder' ? 12 : it.h / 2); } }
      }
      // friends: skip past with nothing, picnic at the top, cheer when Bo makes it
      // ...then huddle under Bo's umbrella in the rain, and skip off ahead (one of them wearing it)
      S.friends.forEach((f, i) => {
        S.plan(f, t, [[13.6 + i * .25, { x: PICNIC - 40 + i * 90, speed: 520, accel: 900, eye: 'happy' }], [24.0, { face: -1, eye: 'open', lookX: .6, lookY: .4 }], [LIGHT + .6, { eye: 'happy' }],
          [RAIN[0] + .1 + i * .08, { eye: 'squeeze', crouch: .15, lookY: -.6, lookX: 0 }],
          [HUDDLE + i * .1, { x: HUDDLE_X[i], speed: 120, accel: 600, crouch: 0, eye: 'happy', lookY: -.5 }],
          [HEARTS + .2, { lookY: 0, lookX: .5 }],
          ...(i === 2 ? [[GIVE + .5, { eye: 'heart', lookY: -.6 }], [GIVE + .7, { crouch: .2 }], [GIVE + .9, { crouch: 0 }], [GIVE + .9, () => f.jump(0, -360)]] : []),
          [LEAVE - .3 + (2 - i) * .15, { x: 1e6, speed: 280 + i * 12, accel: 700, face: 1, eye: 'happy', lookX: 0, lookY: 0 }]]);
        if (t > 33.0) S.once('cheer' + i, () => f.jump(0, -420 - i * 30));
        if (t > 24 && t < LIGHT && i === 1) f.cmd.tilt = .1 * Math.sin(t * 2);
        if (t > LEAVE + .4 && f.mode === 'ground' && hash(Math.floor(t * 2.5) + i) > .7) S.once(`skip${i}:${Math.floor(t * 2.5)}`, () => f.jump(f.vx, -300));
      });
      // the button: rain, the umbrella pops open, a laugh, and the umbrella goes to the friend
      if (t > RAIN[0]) S.once('rain', () => S.sfx('rainbed', { d: RAIN[1] - RAIN[0], g: .8 }));
      if (t > POP) S.once('pop', () => S.sfx('umbrella', {}, bo.x));
      if (t > HEARTS) S.once('hearts', () => { const top = bo.top(); S.burst(top.x + 100, top.y - 40, 7, [PAL.pink, PAL.red], { speed: 170, gravity: -50, size: 22, life: 1.4, shape: 'heart' }); S.sfx('sparkle', { n: 5 }, bo.x); S.sfx('laugh', { n: 3 }, bo.x); S.sfx('laugh', { n: 3, k: 1.3, g: .7 }, bo.x + 150); });
      if (t > CLOSE) S.once('close', () => S.sfx('flip', {}, bo.x));
      if (t > GIVE && S.stack.length) S.once('give', () => { S.stack.pop(); S.gift = t; S.sfx('toss', { pitch: 340 }, bo.x); });
      if (t > GIVE + .5) S.once('gift', () => S.sfx('tock', { f: 760, gain: .6 }, S.friends[2].x));
      if (t > 17.8) S.once('friendsLaugh', () => S.sfx('laugh', { k: 1.3, n: 3, g: .6 }, bo.x + 200));
      S.once('amb', () => S.sfx('birds', { d: LOOP, g: .9 }));
      if (t > 31.6) S.once('wind', () => S.sfx('windbed', { d: 8, g: .7 }));

      if (t > 3 && t < 18) { S.camGoal.x = bo.x + 80; S.camGoal.z = .95; }
      else if (t >= 18 && t < UPHILL) { S.camGoal.x = (bo.x + HILL_TOP) / 2; S.camGoal.z = .72; S.camGoal.kx = 1.6; S.camGoal.kz = 1.3; }
      else if (t >= UPHILL && t < LEAVE + 1) { S.camGoal.x = PICNIC - 60; S.camGoal.z = .82; S.camGoal.kx = 1.6; }
    },
    drawSky(S, ctx, t, v) {
      sprite(ctx, SPRITES.sun, HILL_TOP + 420, v.top + (GROUND - HILL_H - v.top) * .35, 10, { X: PAL.orange });
      for (let i = 0; i < 3; i++) {
        const W = v.right - v.left + 400, x = v.left - 200 + (1 - ((t / 44 + i / 3 + .4) % 1)) * W;
        sprite(ctx, SPRITES.cloud, x, v.top + (v.bottom - v.top) * (.18 + i * .06), 9, { X: '#ebe8f4' });
      }
    },
    drawBack(S, ctx, t) {
      // grass on the hill, a tree and the picnic blanket at the top
      ctx.strokeStyle = PAL.green; ctx.lineWidth = 4;
      for (let i = 0; i < 24; i++) { const x = HILL_A - 40 + i * 40 + hash(i) * 20, g = groundAt(x); for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(x + k * 4, g + 2); ctx.lineTo(x + k * 4 + Math.sin(t * 1.3 + i + k) * 3, g - 12 - (k === 0 ? 4 : 0)); ctx.stroke(); } }
      ctx.strokeStyle = '#111';
      const tx = HILL_B + 40, tg = groundAt(tx); ctx.lineWidth = 6; ctx.fillStyle = PAL.brown;
      ctx.beginPath(); ctx.moveTo(tx - 12, tg + 4); ctx.lineTo(tx - 7, tg - 160); ctx.lineTo(tx + 7, tg - 160); ctx.lineTo(tx + 12, tg + 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = PAL.lime; ctx.beginPath(); ctx.ellipse(tx, tg - 210, 90, 72, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      const pg = groundAt(PICNIC); for (let c2 = 0; c2 < 12; c2++) { ctx.fillStyle = c2 % 2 ? '#fff' : PAL.red; ctx.fillRect(PICNIC - 84 + c2 * 14, pg - 5, 14, 6); }
      sprite(ctx, ['.XXX.', 'XXXXX', 'WWWWW', 'XXXXX'], PICNIC + 70, pg - 20, 5, { X: PAL.brown, W: PAL.yellow });
      // the things by the path, waiting to be picked up
      ITEMS.forEach((it, i) => { if (t < GRAB[i]) { if (it.k === 'ladder') { ctx.save(); ctx.translate(it.x + 60, GROUND - it.h / 2 + 4); ctx.rotate(.12); sprite(ctx, it.rows, 0, 0, it.px, it.c); ctx.restore(); } else sprite(ctx, it.rows, it.x + 40, GROUND - it.h / 2 - 2, it.px, it.c); } });
    },
    drawFront(S, ctx, t) {
      const bo = S.bo, top = bo.top();
      let y = top.y - 6;
      S.stack.forEach((it, j) => {
        const fly = clamp((t - it.t0) / .4), x0 = it.x + 40;
        const tx = top.x + S.sway.x * (j + 1) * .3, ty = y - it.h / 2;
        const x = lerp(x0, tx, sine(fly)), yy = lerp(GROUND - it.h / 2, ty, sine(fly)) - Math.sin(Math.PI * fly) * 120;
        const opened = it.k === 'umbrella' && t > POP && t < CLOSE + .25;   // drawn open below
        if (!opened) { ctx.save(); ctx.translate(x, yy); ctx.rotate(S.sway.x * .004 * (j + 1)); sprite(ctx, it.rows, 0, 0, it.px, it.c); ctx.restore(); }
        y -= it.h + 2;
      });
      for (const it of S.loose) { ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot); sprite(ctx, it.rows, 0, 0, it.px, it.c); ctx.restore(); }
      // the button: a little rain cloud over the picnic; the rain stops on the open umbrella
      const open = S.stack.length ? outBack(seg(t, POP, POP + .3)) * (1 - seg(t, CLOSE, CLOSE + .25)) : 0, U = canopy(top, open);
      if (t > CLOUD_IN && t < RAIN[1] + 1.6) {
        const cx = lerp(PICNIC + 800, PICNIC, sine(seg(t, CLOUD_IN, RAIN[0]))) - 500 * Math.pow(seg(t, RAIN[1], RAIN[1] + 1.6), 2), cy = groundAt(PICNIC) - 410;
        const rk = seg(t, RAIN[0], RAIN[0] + .3) * (1 - seg(t, RAIN[1] - .3, RAIN[1]));
        if (rk > 0) {
          ctx.strokeStyle = '#7f94b0'; ctx.lineWidth = 3; ctx.globalAlpha = rk;
          for (let i = 0; i < 26; i++) {
            const x = cx + (hash(i) - .5) * 250, y = cy + 20 + ((t * 700 + hash(i + .3) * 400) % 400);
            const dx = (x - U.x) / (U.rx || 1), stop = open > .3 && Math.abs(dx) < 1 ? U.y + (x - U.x) * Math.tan(U.rot) - U.ry * Math.sqrt(1 - dx * dx) : groundAt(x);
            if (y < stop) { ctx.beginPath(); ctx.moveTo(x, Math.max(cy + 20, y - 18)); ctx.lineTo(x, y); ctx.stroke(); }
          }
          ctx.globalAlpha = 1; ctx.strokeStyle = '#111';
        }
        sprite(ctx, SPRITES.cloud, cx, cy, 16, { X: '#a7abb2' }, 1 - seg(t, RAIN[1] + .8, RAIN[1] + 1.6));
      }
      // the umbrella opens over everyone (in place of the folded one on Bo's head)
      if (open > .02) {
        ctx.lineWidth = 5; ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(top.x, top.y - 4); ctx.lineTo(U.x, U.y); ctx.stroke();
        ctx.save(); ctx.translate(U.x, U.y); ctx.rotate(U.rot); ctx.fillStyle = PAL.red;
        ctx.beginPath(); ctx.ellipse(0, 0, U.rx, U.ry, 0, Math.PI, Math.PI * 2);
        for (let k = 4; k >= 0; k--) ctx.arc(-U.rx + (k + .5) * U.rx * .4, 0, U.rx * .2, 0, Math.PI, true);
        ctx.fill(); ctx.stroke();
        ctx.beginPath(); for (const a of [-.4, .4]) { ctx.moveTo(0, -U.ry); ctx.quadraticCurveTo(a * U.rx * .6, -U.ry * .5, a * U.rx, 0); } ctx.stroke();
        ctx.restore();
      }
      // given away: the folded umbrella hops over onto the wet friend's head
      if (S.gift) {
        const f = S.friends[2], ft = f.top(), u = clamp((t - S.gift) / .5), it = ITEMS[0];
        const x = lerp(top.x, ft.x, sine(u)), y = lerp(top.y - 6, ft.y - 6, sine(u)) - it.h / 2 - Math.sin(Math.PI * u) * 110;
        ctx.save(); ctx.translate(x, y); ctx.rotate(u >= 1 ? f.rot.x : 0); sprite(ctx, it.rows, 0, 0, it.px, it.c); ctx.restore();
      }
    },
  });
})();
