/* dance-break: extracted from ../dance-break.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['dance-break'] = story; } });
  // Pencil into crayon. A grey office, and under one desk a foot is tapping, with colour coming off it. The colour grows
  // with the dance and snaps back every time the boss turns round. Third time, Wobbin's in the air when it happens.
  // The boss walks over, stares... and the boss's foot starts tapping. Button: the phone rings, one tuft keeps going.
  const { lerp, seg, sine, outBack, hash, mix, clamp, spring, GROUND, INK } = Shorts;
  const hand = (...a) => Sketch.hand(...a), lump = (...a) => Sketch.lump(...a), tiles = (...a) => Sketch.tiles(...a);
  const V = 150, LEAVE = 23, OUT = LEAVE + 1.4, LOOP = OUT + 1, BX = 110;
  const K = ['#ff5a4d', '#ffb12e', '#ffe03d', '#3fc66b', '#3f9be8', '#a06be0'];
  const WATCH = [[3.4, 5], [7.6, 8.8], [11.8, 15]];   // when the boss is facing us
  const watching = t => WATCH.some(([a, b]) => t > a && t < b);
  const level = t => t < 3.4 ? 1 : t < 5 ? 0 : t < 7.6 ? 2 : t < 8.8 ? 0 : t < 11.8 ? 3 : t < 15 ? 0 : t < 21.2 ? 4 : 0;
  const AIM = [0, 170, 300, 460, 0];

  function desk(ctx, x, col, seed) {
    ctx.lineWidth = 5; hand(ctx, [[x + 34, GROUND - 92], [x + 176, GROUND - 93], [x + 176, GROUND - 78], [x + 34, GROUND - 77]], { fill: '#d4985c', seed, over: 3 });
    ctx.beginPath(); ctx.moveTo(x + 50, GROUND - 78); ctx.lineTo(x + 46, GROUND + 1); ctx.moveTo(x + 160, GROUND - 78); ctx.lineTo(x + 164, GROUND + 1); ctx.stroke();
    hand(ctx, [[x + 100, GROUND - 200], [x + 176, GROUND - 201], [x + 176, GROUND - 124], [x + 100, GROUND - 123]], { fill: '#3a3f4a', seed: seed + 1, wob: 1.3, over: 2 });
    hand(ctx, [[x + 108, GROUND - 192], [x + 168, GROUND - 192], [x + 168, GROUND - 132], [x + 108, GROUND - 132]], { fill: col, seed: seed + 2, wob: 1, over: 1 });
    ctx.beginPath(); ctx.moveTo(x + 138, GROUND - 123); ctx.lineTo(x + 138, GROUND - 93); ctx.moveTo(x + 116, GROUND - 93); ctx.lineTo(x + 160, GROUND - 93); ctx.stroke();
    // chair behind the sitter
    hand(ctx, [[x - 74, GROUND - 40], [x - 84, GROUND - 158], [x - 56, GROUND - 158], [x - 42, GROUND - 58], [x + 40, GROUND - 58], [x + 40, GROUND - 40]], { fill: '#3f9be8', seed: seed + 3, wob: 1.4, over: 2 });
    ctx.beginPath(); ctx.moveTo(x - 16, GROUND - 40); ctx.lineTo(x - 16, GROUND - 8); ctx.moveTo(x - 48, GROUND - 2); ctx.lineTo(x + 18, GROUND - 2); ctx.stroke();
  }

  Shorts.play({
    title: 'Dance Break',
    style: { a: 'sketch', b: 'crayon' },
    accent: '#e8503f',
    hook: 1.3,
    page: [.8, OUT - 1.2, OUT],
    wash: 0,
    loopAfter: LOOP,
    paper: '#ffffff',
    captions: [
      [.2, 3.1, 'nobody is *looking.*', null, false],
      [3.7, 4.8, '...spreadsheets.'],
      [5.4, 6.5, 'just *a little.*'],
      [9.3, 10.4, '*who cares!*'],
      [14.1, 15.3, 'is that... *my song?*', null, { pitch: .75 }],
      [17, 21, 'dance a little. *nobody minds.*'],
    ],
    init(S) {
      S.bo = S.addChar({ x: 0, walk: V }); S.bo.space = 0; S.bo.breathe = 0;
      S.team = [[-290, '#ffc9dc', 'curl', '#a06be0'], [-90, '#bfe6ff', 'antenna', '#3fc66b']].map(([x, fill, hair, hairColor], i) => { const c = S.addChar({ x, fill, hair, hairColor, blush: i ? null : '#ff8a7a' }); c.hidden = true; c.space = 0; c.gain = .3; c.cmd.sit = 1; c.sit.x = 1; return c; });
      S.boss = S.addChar({ x: 610, hair: 'tuft', hairColor: '#8a4f3a', fill: '#e8dcc8', face: 1 }); S.boss.hidden = true; S.boss.space = 0; S.boss.gain = .6;
      S.glow = { x: BX, y: GROUND - 50, R: 0, t0: -9, dur: .01 }; S.glowR = { x: 0, v: 0 }; S.bossSpot = { x: 300, y: GROUND - 60, R: 0, t0: -9, dur: .01 }; S.sp = [S.glow, S.bossSpot]; S.beat = 0;
    },
    mix(S, m, t) { Sketch.reveal(m, S.sp, t); },
    update(S, t, dt) {
      const bo = S.bo, boss = S.boss, lv = level(t), frozen = watching(t);
      S.plan(bo, t, [
        [0, { x: BX, speed: V, accel: 1000 }],
        [.75, { sit: 1, lookX: .4, eye: 'happy' }],
        [3.4, { eye: 'wide', sit: 1, lookX: 0 }], [4.2, { eye: 'flat' }],
        [5, { eye: 'happy' }], [5.2, { sit: 0 }],
        [7.6, { eye: 'wide' }], [7.7, { sit: 1, eye: 'flat', lookX: 1 }],
        [8.8, { eye: 'happy', sit: 0 }],
        [14.9, { eye: 'wide', lookX: 1 }], [15.5, { eye: 'happy' }],
        [21.2, { eye: 'wide', sit: 1, lookX: 0 }], [21.7, { eye: 'flat' }],
        [22.6, { sit: 0, eye: 'open' }],
        [LEAVE, { x: 1e6, speed: V, accel: 450, eye: 'happy', lookX: 0 }], [LEAVE, () => { bo.jump(780, -1070); S.sfx('whoosh', { d: .5, v: .5 }, bo.x); }],
      ]);
      S.plan(boss, t, [
        [.5, { face: 1, x: 640, speed: 40, eye: 'open' }],
        [3.4, { face: -1, eye: 'flat' }], [5, { face: 1 }],
        [7.6, { face: -1, eye: 'flat' }], [8.8, { face: 1 }],
        [11.8, { face: -1, eye: 'wide' }], [12.3, { x: 320, speed: 130, accel: 300, eye: 'flat' }],
        [14.9, { eye: 'wide' }], [15.3, { eye: 'happy' }],
        [21.3, { x: 300, eye: 'flat' }],
      ]);
      boss.hidden = t < .5 || t > OUT;
      // the groove: the same beat for everyone, bigger with each level. Anyone being watched stops dead
      const b = t * 2.6, on = !frozen && lv > 0, hit = Math.floor(b);
      if (on && hit !== S.beat) { S.beat = hit; S.sfx('pluck', { pitch: [392, 494, 587, 659][hit % 4] }, bo.x); S.sfx('tap', {}, bo.x); bo.q.v += .35 + lv * .3; if (lv >= 3 && hit % 2 === 0 && bo.mode === 'ground') bo.jump(0, -560 - (lv - 3) * 180); }
      bo.cmd.tilt = on ? Math.sin(b * Math.PI) * (.04 + lv * .05) : 0;
      bo.cmd.lookY = on ? Math.sin(b * Math.PI) * .3 : 0;
      if (t > 3.4) S.once('t1', () => S.sfx('tock', { f: 420 })); if (t > 7.6) S.once('t2', () => S.sfx('tock', { f: 420 }));
      if (t > 11.8) S.once('t3', () => { S.sfx('tock', { f: 420 }); S.sfx('slip', {}); });
      [12.6, 13.2, 13.8].forEach((a, i) => { if (t > a) S.once('st' + i, () => S.sfx('tick', {}, boss.x)); });
      // the team, then the boss, join in
      S.team.forEach((c, i) => { const j = lv >= 3 && !frozen; c.cmd.eye = lv === 4 ? 'happy' : j ? 'open' : 'open'; c.cmd.tilt = j || lv === 4 ? Math.sin(b * Math.PI + i) * .1 : 0; c.cmd.sit = lv === 4 ? 0 : 1; c.hidden = t < .35 || t > OUT; });
      if (t > 15.4 && t < 21.2) { boss.cmd.tilt = Math.sin(b * Math.PI) * .12; boss.q.v += Math.sin(b * Math.PI * 2) * .02; } else if (t >= 21.2) boss.cmd.tilt = 0;
      if (t > 15.4) S.once('flood', () => { S.sp.push({ x: 200, y: GROUND - 80, R: 1500, t0: t, dur: 1.2, end: 21.2 }); S.burst(320, GROUND - 40, 24, K, { speed: 620, size: 14, life: 1, gravity: 1200 }); S.sfx('swell', { root: 392 }); S.sfx('sparkle', { n: 8 }); });
      if (t > 21.2) { for (const s of S.sp) if (s.end) s.R = 0; }
      if (t > 21.2) S.once('ring', () => { S.sfx('ring', {}); });
      if (t > 22.2) S.once('l', () => S.sfx('laugh', { n: 2 }, boss.x));
      if (t > 17.1) S.once('q', () => S.sfx('pad', { root: 293.66, d: 3.6 }));
      // the colour follows the dance, and snaps back when the boss looks
      spring(S.glowR, frozen ? 0 : AIM[lv], frozen ? 300 : 40, 1, dt); S.glow.R = Math.max(0, S.glowR.x); S.glow.x = bo.x;
      S.bossSpot.R = t > 14.9 && t < 21.2 ? 200 * seg(t, 14.9, 15.4) : 0; S.bossSpot.x = boss.x;
      if (t > .5 && t < 11.8) { S.camGoal.x = 190; S.camGoal.y = GROUND - 100; S.camGoal.z = .94; S.camGoal.kz = 3; }
      else if (t >= 11.8 && t < 15.2) { S.camGoal.x = 230; S.camGoal.y = GROUND - 100; S.camGoal.z = lerp(.94, 1.06, seg(t, 12, 14.6)); }
      else if (t >= 15.2 && t < LEAVE) { S.camGoal.x = 80; S.camGoal.y = GROUND - 100; S.camGoal.z = .74; S.camGoal.kx = 2; S.camGoal.kz = 1.6; }
    },
    drawBack(S, ctx, t, v) {
      ctx.fillStyle = '#ffe9b0'; ctx.fillRect(v.left - 20, v.top - 20, v.right - v.left + 40, GROUND - v.top + 24);
      tiles(ctx, -560, 900, 190, '#a8e4d8', '#fff3cf');
      ctx.fillStyle = '#ffc48a'; ctx.fillRect(v.left - 20, GROUND - 40, v.right - v.left + 40, 42); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(v.left - 20, GROUND - 40); ctx.lineTo(v.right + 20, GROUND - 40); ctx.stroke();
      // the windows with a town in them
      for (const [x, s] of [[-340, 3], [70, 6], [480, 9]]) {
        ctx.lineWidth = 6; hand(ctx, [[x, GROUND - 400], [x + 300, GROUND - 402], [x + 302, GROUND - 240], [x + 2, GROUND - 238]], { fill: '#9ed8f7', seed: s });
        ctx.lineWidth = 4; for (let i = 0; i < 4; i++) { const bh = 40 + hash(i + s) * 70; hand(ctx, [[x + 10 + i * 72, GROUND - 240], [x + 10 + i * 72, GROUND - 240 - bh], [x + 70 + i * 72, GROUND - 240 - bh], [x + 70 + i * 72, GROUND - 240]], { fill: K[(i + s) % 6], seed: i + s, wob: 1.2, over: 1 }); }
        ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 150, GROUND - 400); ctx.lineTo(x + 151, GROUND - 240); ctx.stroke();
      }
      // the clock, a plant, the water cooler
      ctx.lineWidth = 6; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(420, GROUND - 330, 34, 0, 7); ctx.fill(); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(420, GROUND - 330); ctx.lineTo(420, GROUND - 354); ctx.moveTo(420, GROUND - 330); ctx.lineTo(436, GROUND - 322); ctx.stroke();
      ctx.lineWidth = 5; hand(ctx, [[440, GROUND + 1], [440, GROUND - 112], [494, GROUND - 112], [494, GROUND + 1]], { fill: '#d7dde0', seed: 11 }); ctx.fillStyle = '#bfe6ff'; ctx.beginPath(); ctx.roundRect(446, GROUND - 192, 42, 80, 12); ctx.fill(); ctx.stroke();
      lump(ctx, [[-470, GROUND - 110, 34], [-504, GROUND - 76, 30], [-436, GROUND - 76, 30]], '#49c06a', 4);
      ctx.lineWidth = 5; hand(ctx, [[-498, GROUND + 1], [-504, GROUND - 56], [-438, GROUND - 56], [-444, GROUND + 1]], { fill: '#ef8a3c', seed: 13 });
      desk(ctx, S.team[0].x, '#bfe6ff', 21); desk(ctx, S.team[1].x, '#ffc9dc', 31); desk(ctx, BX, '#c9efc0', 41);
      // Bo's screen: rows and rows of a spreadsheet, whatever's happening in the room
      ctx.lineWidth = 2.6; ctx.beginPath(); for (let i = 0; i < 4; i++) { ctx.moveTo(BX + 112, GROUND - 180 + i * 13); ctx.lineTo(BX + 164, GROUND - 180 + i * 13); } ctx.moveTo(BX + 128, GROUND - 188); ctx.lineTo(BX + 128, GROUND - 136); ctx.moveTo(BX + 146, GROUND - 188); ctx.lineTo(BX + 146, GROUND - 136); ctx.stroke();
    },
    drawFront(S, ctx, t, v) {
      // little notes coming off the dance
      const lv = level(t), on = !watching(t) && lv > 0;
      if (on) { const b = S.bo.top(); ctx.lineWidth = 4; ctx.fillStyle = INK; for (let i = 0; i < lv + 1; i++) { const p = (t * .8 + i * .37) % 1, x = b.x + 40 + i * 26 - p * 30, y = b.y - 10 - p * 110; ctx.globalAlpha = Math.sin(p * Math.PI); ctx.beginPath(); ctx.ellipse(x, y, 7, 5.5, -.3, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + 6, y - 1); ctx.lineTo(x + 7, y - 24); ctx.lineTo(x + 18, y - 18); ctx.stroke(); } ctx.globalAlpha = 1; }
      // the phone rings on the desk, and the last tuft keeps going
      if (t > 21.2 && t < 22.8) { const x = BX + 70, y = GROUND - 96, s = Math.sin(t * 40) * 3; ctx.lineWidth = 4; hand(ctx, [[x - 22 + s, y], [x - 22 + s, y - 20], [x + 22 + s, y - 20], [x + 22 + s, y]], { fill: '#ff5a4d', seed: 51, wob: 1, over: 1 }); }
      if (t > 21.8 && !S.boss.hidden) { const T = S.boss.tuft; if (T) T.x += Math.sin(t * 16) * 1.4; }
    },
  });
})();
