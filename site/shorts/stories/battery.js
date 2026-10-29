/* battery: extracted from ../battery.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['battery'] = story; } });
  // A party: lights, music, friends. Bo loves it, and Bo's little battery drains with every
  // "hey!!". At 0% Bo slips away to a quiet tree and charges back up while the party plays on.
  // Button: two friends notice, tiptoe over and sit quietly beside Bo. "shh..." "quiet party?"
  // Bo, fully charged: "yes." Then the three of them skip off together.
  const { PAL, SPRITES, sprite, lerp, seg, sine, outBack, clamp, hash, spring, mix, GROUND } = Shorts;
  // Staging keeps everyone ~175 apart (bodies are ~160 wide) and nobody walks through anybody: Bo
  // hurries to the far end of the party first, the friends run in behind, and at the end the two
  // sitters leapfrog over Bo to lead the way.
  const V = 130, BO_X = 1620, POLE_A = 850, POLE_B = 1800, BOOM = 1735, TREE = 2200, SEAT = 2090;
  const QUIET = 24.0, WAKE = 29.4, LEAVE = 33.6;
  // the two friends who come over: [friend, seat x]
  const SITTERS = [[0, 1915], [1, 1740]];
  const SPOTS = [1445, 1270, 1095, 920], ARRIVE = 2.0;
  // battery level changes: [time, bars]
  const LEVELS = [[0, 4], [9.9, 3], [12.6, 2], [15.2, 1], [17.4, 0], [25.6, 1], [26.8, 2], [28.0, 3], [29.2, 4]];
  const level = t => LEVELS.filter(([a]) => t >= a).pop()[1];
  // friends coming over to Bo: [friend, from, to, x]
  // (each friend bounces over at its own spot; everyone at once is the rush)
  const VISITS = [[0, 9.4, 10.9, 1445], [1, 12.0, 13.4, 1270], [2, 12.1, 13.4, 1095], [0, 14.6, 16.2, 1445], [1, 14.6, 16.2, 1270], [2, 14.6, 16.2, 1095], [3, 14.6, 16.2, 920], [0, 16.8, 17.8, 1445]];
  const BUBBLES = ['heart', 'note', 'bang'];
  // the battery rides above Bo, swinging back with speed and bouncing with the squash
  const batteryPos = bo => { const top = bo.top(); return { x: top.x - clamp(bo.vx * .07 + bo.axs * .012, -30, 30), y: top.y - 54 + clamp(bo.q.v * 3, -14, 14) }; };
  const beatLen = t => t < 12 ? .5 : t < 15 ? .44 : t < 17.4 ? .38 : .5;

  Shorts.play({
    title: 'Battery',
    accent: PAL.lime,
    paper: '#f8f5ff',
    loopAfter: LEAVE + 7.0,
    captions: [
      [1.4, 3.6, 'party tonight!'],
      [7.4, 9.2, '*fun!*'],
      [12.8, 14.4, 'still fun...'],
      [15.4, 17.0, 'so. much. fun.'],
      [17.6, 19.0, '*0%*'],
      [24.6, 26.2, 'recharging...'],
      [26.9, 27.9, '*shh...*', null, { pitch: 1.3, g: .6 }],
      [30.2, 31.3, 'quiet party?', null, { pitch: 1.2, g: .7 }],
      [31.6, 32.4, '*yes.*'],
      [33.2, 38.6, "it's okay to need quiet. *real friends get it.*"],
    ],
    init(S) {
      const look = [
        { hair: 'curl', blush: PAL.pink, fill: '#ffe9f2' }, { hair: 'antenna', hairColor: PAL.blue, fill: '#e6f0ff' },
        { hairColor: PAL.orange, blush: '#ffb08a', fill: '#fff4d6' }, { hair: 'curl', hairColor: PAL.green, fill: '#e3fbef' },
      ];
      S.friends = SPOTS.map((x, i) => S.addChar({ x: -680 - i * 210, face: 1, gain: .3, ...look[i] }));   // off screen behind Bo
      S.bo = S.addChar({ x: 0, walk: V }); S.focus = S.bo;
      S.beat = 0; S.beatN = 0; S.beatT0 = 0; S.notes = []; S.bubble = []; S.lastLevel = 4; S.blink = 0; S.breath = 0;
    },
    update(S, t, dt) {
      const bo = S.bo;
      // the beat: a little faster as the night gets louder
      S.beat += dt;
      if (S.beat >= beatLen(t)) {
        S.beat = 0; S.beatN++; S.beatT0 = t;
        const near = clamp(1 - Math.abs(bo.x - BOOM) / 1100);
        S.sfx('thump', { g: .15 + .85 * near * near }, BOOM);
        S.notes.push({ t0: t, x: BOOM + (hash(S.beatN) - .5) * 40, c: [PAL.pink, PAL.sky, PAL.yellow, PAL.violet][S.beatN % 4] });
      }
      S.notes = S.notes.filter(n => t - n.t0 < 2);
      const pulse = Math.max(0, 1 - (t - S.beatT0) / .18);

      S.plan(bo, t, [
        [0, { x: BO_X, speed: 260, accel: 400 }],                               // can't wait
        [5.0, { lookX: .7, lookY: -.3, eye: 'happy' }],
        [7.2, { crouch: .2 }], [7.45, { crouch: 0 }], [7.45, () => bo.jump(0, -520)],    // yay!
        [8.2, { eye: 'happy', lookX: .6, lookY: 0 }],
        [15.3, { eye: 'happy' }],
        [17.4, { eye: 'flat', sit: .6, tilt: .16, lookX: 0 }],                   // empty
        [17.9, { face: 1, lookX: 0 }],
        [18.6, { sit: 0, tilt: .08, x: SEAT, speed: 135, accel: 300, eye: 'flat' }],   // slipping away
        [23.9, { sit: 1.1, tilt: .05, eye: 'closed', crouch: .05 }],
        [WAKE, { eye: 'open', crouch: 0 }],
        [29.8, { face: -1, lookX: .5, eye: 'wide' }],                           // oh! company
        [30.3, { eye: 'happy', lookX: .3 }],
        [31.6, { sit: 0, tilt: 0 }], [31.7, () => { const B = bo.top(); S.burst(B.x - 60, B.y - 20, 6, [PAL.pink], { speed: 160, gravity: -60, size: 22, life: 1.4, shape: 'heart' }); S.sfx('sparkle', { n: 4 }, bo.x); }],
        [32.6, { face: 1, crouch: .2 }], [32.85, { crouch: 0 }], [32.85, () => bo.jump(0, -480)],
        [LEAVE, { x: 1e6, speed: V, accel: 450, eye: 'open', lookX: 0, lookY: 0 }],
        [LEAVE + .1, () => S.sfx('hum', { notes: [2, 4, 5, 7, 5], gap: .3, g: .04 }, bo.x)],
      ]);
      if (t > 7.8 && t < 15.2) bo.cmd.crouch = .14 * pulse;                    // dancing
      if (t > 15.2 && t < 17.4) bo.cmd.tilt = .05 * Math.sin(t * 34);         // forced smile, shaking
      if (t > 24.4 && t < 29.4) {                                            // slow breaths while charging
        const ph = (t - 24.4) / 2.4; bo.cmd.crouch = .05 - .05 * Math.sin(2 * Math.PI * ph);
        const n = Math.floor(ph); S.once('in' + n, () => S.sfx('breathIn', { d: 1.1 }, bo.x));
        if (ph - n > .5) S.once('out' + n, () => S.sfx('breathOut', { d: 1.2 }, bo.x));
      }

      // friends dance on the beat, and keep coming over to say hi
      S.friends.forEach((f, i) => {
        const v = VISITS.filter(([w, a, b]) => w === i && t >= a && t < b).pop(), sitter = SITTERS.find(([w]) => w === i);
        if (sitter && t >= QUIET) {
          // tiptoe over, sit quietly beside Bo, wake up happy, then skip off ahead
          const [, seat] = sitter, k = SITTERS.indexOf(sitter);
          S.plan(f, t, [
            [QUIET, { x: seat, speed: 115, accel: 300, face: 1, eye: 'happy', crouch: .1, tilt: 0 }],
            [27.6 + k * .3, { sit: 1.1, crouch: 0, eye: 'closed' }],
            [29.9 + k * .2, { eye: 'happy' }],
            [31.6, { sit: 0 }],
            [32.7 + k * .12, { crouch: .2 }], [32.95 + k * .12, { crouch: 0 }], [32.95 + k * .12, () => f.jump(0, -420)],
            [LEAVE - .2 + k * .3, { x: 1e6, speed: 290, accel: 700, eye: 'happy' }],
          ]);
          // leapfrog over Bo to lead the way (never through)
          if (t > LEAVE - .2 && f.mode === 'ground' && bo.x - f.x > 0 && bo.x - f.x < 205) S.once('frog' + i, () => { f.jump(640, -1050); S.sfx('whoosh', { d: .4, v: .5 }, f.x); });
          if (t > LEAVE + .4 && f.mode === 'ground' && f.x > bo.x + 150 && hash(Math.floor(t * 2.5) + i) > .7) S.once(`skip${i}:${Math.floor(t * 2.5)}`, () => f.jump(f.vx, -300));
          return;
        }
        if (v) {
          Object.assign(f.cmd, { x: v[3], speed: 260, accel: 900, face: -1, eye: 'happy', crouch: 0, tilt: 0 });
          const k = `v${i}-${v[1]}`;
          if (t > v[1] + .45 && Math.abs(f.x - v[3]) < 20) S.once(k, () => { f.jump(0, -380); S.sfx('pop', { pitch: 760 + i * 110, g: .1 }, f.x); S.bubble = S.bubble || []; S.bubble.push({ f: i, t0: t, kind: BUBBLES[(i + S.beatN) % 3] }); });
          if (t > v[1] + 1.05 && Math.abs(f.x - v[3]) < 20) S.once(k + 'b', () => f.jump(0, -320));
        } else if (t < ARRIVE || Math.abs(f.x - SPOTS[i]) > 60 && t < 9) {
          Object.assign(f.cmd, { x: t < ARRIVE ? f.x : SPOTS[i], speed: 420, accel: 700, face: 1, eye: 'happy', crouch: 0, tilt: 0 });   // running in
          if (t > ARRIVE && f.mode === 'ground' && hash(Math.floor(t * 3) + i * 7) > .82) S.once(`run${i}:${Math.floor(t * 3)}`, () => f.jump(f.vx, -260));
        } else {
          Object.assign(f.cmd, { x: SPOTS[i], speed: 200, accel: 600, face: i % 2 ? 1 : -1, eye: 'happy' });
          f.cmd.crouch = .16 * Math.max(0, 1 - ((t - S.beatT0 + i * .09) % beatLen(t)) / .2);
          f.cmd.tilt = .1 * Math.sin(t * Math.PI * 2 / (beatLen(t) * 2) + i);
          if (S.beatN % 4 === i && t - S.beatT0 < dt * 1.5 && t > 9) S.once('hop' + S.beatN, () => f.jump(0, -280));
        }
      });

      // every lost bar is a little sad blip
      const L = level(t);
      if (L !== S.lastLevel) {
        if (L < S.lastLevel) { S.sfx(L === 0 ? 'powerDown' : 'drain', {}, bo.x); if (L === 0) S.shake(2); }
        else { S.sfx('charge', { n: L * 2 }, bo.x); { const B = batteryPos(bo); S.burst(B.x, B.y, 8, [PAL.lime, PAL.yellow, '#fff'], { speed: 200, gravity: 300, size: 6, life: .8 }); } }
        S.lastLevel = L;
      }
      if (L === 1 && t < 20) { S.blink += dt; if (S.blink > .8) { S.blink = 0; S.sfx('beep', { pitch: 440 }, bo.x); } }
      if (t > 29.2) S.once('full', () => { S.sfx('swell', { root: 523.25 }); S.sfx('sparkle', { n: 6 }, bo.x); });
      if (t > 24.6) S.once('ff', () => S.sfx('twinkle', { pitch: 2093, gain: .6 }, TREE));

      if (t > 5.5 && t < 18.6) { S.camGoal.x = 1330; S.camGoal.z = .8; S.camGoal.kx = 2.5; }
      if (t > 23 && t < LEAVE) { S.camGoal.x = t > 25.4 ? 1965 : 2000; S.camGoal.z = 1; S.camGoal.kx = 2; }
    },
    drawSky(S, ctx, t, v) {
      const w = 2 * Math.PI * Math.round(S.T / Math.PI) / S.T;              // ~2 rad/s, a whole number of twinkles per loop
      for (let i = 0; i < 22; i++) {
        const x = v.left + hash(i) * (v.right - v.left), y = v.top + hash(i + .5) * (GROUND - v.top) * .6;
        sprite(ctx, i % 5 ? SPRITES.dot : SPRITES.sparkle, x, y, i % 5 ? 2.6 : 2, { X: '#c9bff0' }, .5 + .5 * Math.sin(t * w + i * 1.7));
      }
    },
    drawBack(S, ctx, t) {
      const pulse = Math.max(0, 1 - (t - S.beatT0) / .2), hype = seg(t, 7, 16) * (1 - seg(t, 17.4, 19));
      // poles + string lights, chasing with the beat
      ctx.lineWidth = 5;
      for (const px of [POLE_A, POLE_B]) { ctx.beginPath(); ctx.moveTo(px, GROUND + 2); ctx.lineTo(px, GROUND - 230); ctx.stroke(); }
      ctx.lineWidth = 3; ctx.beginPath();
      for (let i = 0; i <= 30; i++) { const u = i / 30, x = lerp(POLE_A, POLE_B, u), y = GROUND - 226 + 60 * 4 * u * (1 - u); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
      const BULBS = [PAL.red, PAL.yellow, PAL.lime, PAL.sky, PAL.pink, PAL.violet];
      for (let i = 1; i < 14; i++) {
        const u = i / 14, x = lerp(POLE_A, POLE_B, u), y = GROUND - 226 + 60 * 4 * u * (1 - u) + 10;
        const on = (i + S.beatN) % 3 === 0 ? 1 : .45 + .2 * hype;
        ctx.globalAlpha = .25 * on * (.5 + hype); ctx.fillStyle = BULBS[i % 6];
        ctx.beginPath(); ctx.arc(x, y, 16 + 8 * pulse * on, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; sprite(ctx, ['XX', 'XX'], x, y, 5, { X: BULBS[i % 6] });
      }
      // boombox
      const s = 1 + .08 * pulse;
      ctx.save(); ctx.translate(BOOM, GROUND - 26); ctx.scale(s, s);
      ctx.fillStyle = '#fff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(-38, -24, 76, 48, 6); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 4; for (const sx of [-18, 18]) { ctx.beginPath(); ctx.arc(sx, 4, 11 + 2 * pulse, 0, Math.PI * 2); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-20, -24); ctx.lineTo(-14, -38); ctx.lineTo(14, -38); ctx.lineTo(20, -24); ctx.stroke();
      ctx.restore();
      for (const n of S.notes) {
        const u = (t - n.t0) / 2;
        sprite(ctx, SPRITES.note, n.x + Math.sin(u * 7 + n.x) * 30, GROUND - 70 - u * 230, 5, { X: n.c }, 1 - u);
      }
      // the quiet tree, with fireflies while Bo recharges
      // an ink tree (trunk, three leafy lumps that sway a little)
      const sw = Math.sin(t * .8) * 3;
      ctx.fillStyle = PAL.brown; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(TREE - 13, GROUND + 4); ctx.lineTo(TREE - 7, GROUND - 190); ctx.lineTo(TREE + 7, GROUND - 190); ctx.lineTo(TREE + 13, GROUND + 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = PAL.green;
      for (const [dx, dy, rx, ry] of [[-52, -222, 70, 56], [50, -226, 72, 58], [0, -278, 84, 66]]) { ctx.beginPath(); ctx.ellipse(TREE + dx + sw * (1 + dy / -300), GROUND + dy, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      ctx.fillStyle = mix(PAL.green, '#ffffff', .35); ctx.globalAlpha = .5;
      ctx.beginPath(); ctx.ellipse(TREE - 22 + sw, GROUND - 300, 26, 14, -.4, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      const ff = sine(seg(t, 24, 25.5)) * (1 - sine(seg(t, 30, 31.5)));
      if (ff > 0) for (let i = 0; i < 7; i++) {
        const x = TREE - 120 + hash(i) * 240 + Math.sin(t * .9 + i * 2) * 30, y = GROUND - 60 - hash(i + .3) * 160 + Math.cos(t * 1.3 + i) * 20;
        sprite(ctx, SPRITES.dot, x, y, 3.5, { X: PAL.yellow }, ff * (.5 + .5 * Math.sin(t * 4 + i)));
      }
    },
    drawFront(S, ctx, t) {
      // speech bubbles from friends
      for (const b of S.bubble || []) {
        const u = (t - b.t0) / 1.1; if (u > 1) continue;
        const f = S.friends[b.f], top = f.top(), k = outBack(clamp(u / .25)) * (1 - seg(u, .8, 1));
        ctx.save(); ctx.translate(top.x - 10, top.y - 60); ctx.scale(k, k);
        ctx.fillStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(-24, -20, 48, 38, 10); ctx.fill(); ctx.stroke();
        if (b.kind === 'heart') sprite(ctx, SPRITES.heart, 0, -1, 3.4, { X: PAL.pink });
        else if (b.kind === 'note') sprite(ctx, SPRITES.note, 0, -1, 4.6, { X: PAL.violet });
        else sprite(ctx, ['XX', 'XX', 'XX', '..', 'XX'], 0, -1, 4.4, { X: PAL.red });
        ctx.restore();
      }
      // the battery
      const L = level(t), blinkOff = L === 1 && t < 20 && Math.floor(t * 3) % 2;
      const col = L >= 3 ? PAL.lime : L === 2 ? PAL.yellow : PAL.red, B = batteryPos(S.bo);
      sprite(ctx, ['XXXXXXXXXXX.', 'X.........XX', 'X.........XX', 'X.........XX', 'XXXXXXXXXXX.'], B.x, B.y, 5, { X: '#111' });
      ctx.fillStyle = col;
      for (let i = 0; i < L; i++) if (!blinkOff) ctx.fillRect(B.x - 25 + i * 11 - 2, B.y - 7.5, 9, 15);
    },
  });
})();
