/* imposter: extracted from ../imposter.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['imposter'] = story; } });
  // Bo breaks the finish tape and the friends crown Bo. Bo is sure it's a mistake: gives it back,
  // passes it on, buries it, throws it away. It keeps landing back on Bo's head. Until Bo keeps it.
  // Button: a bow-off. A friend bows, Bo bows lower, all three bow lower still, and Bo out-bows
  // them all with a front flip. Ta-da! The friends cheer and skip off ahead, Bo hums after them.
  const { PAL, SPRITES, sprite, cloud, lerp, seg, sine, outBack, clamp, hash, spring, mix, GROUND } = Shorts;
  const V = 130, POST_A = 820, POST_B = 900, SPOT = 990, SPOTS = [1170, 1345, 1520];   // ~175 apart, nobody overlapping
  const BOW = 27.2, FLIP = 29.35, TADA = 30.0, LEAVE = 31.8;
  const CROWN = ['X...X...X', 'XX.XXX.XX', 'XXXXXXXXX', 'XRXXRXXRX', 'XXXXXXXXX'];
  // where the crown goes: [time it leaves, destination, flight seconds, arc]
  const MOVES = [
    [6.7, 'bo', .5, 90], [9.3, 'f0', .45, 80], [10.1, 'bo', .4, 80],
    [11.6, 'f1', .45, 90], [12.6, 'bo', .3, 80], [13.85, 'ground', .3, 40], [15.2, 'bo', .45, 160],
    [16.8, 'away', .8, 0], [18.1, 'bo', .7, 0],
  ];

  function crownPos(S, where) {
    if (where === 'bo') { const p = S.bo.top(); return { x: p.x, y: p.y - 14 }; }
    if (where[0] === 'f') { const p = S.friends[+where[1]].top(); return { x: p.x, y: p.y - 14 }; }
    if (where === 'ground') return { x: SPOT + 95, y: GROUND - 10 + 26 * sine(seg(S.t, 14.15, 14.5)) - 26 * outBack(seg(S.t, 15.05, 15.2)) };
    return { x: S.bo.x - 900, y: GROUND - 700 };                                // thrown far away
  }

  Shorts.play({
    title: 'Imposter',
    accent: PAL.orange,
    loopAfter: LEAVE + 7.0,
    captions: [
      [7.2, 8.8, 'for... me?'],
      [9.4, 11.0, 'no... not me.'],
      [11.8, 13.4, "it's a *mistake.*"],
      [14.0, 15.8, "they'll find out I'm *not good enough.*"],
      [20.6, 22.4, '...maybe I *did* earn it.'],
      [23.2, 27.0, 'you did earn it. *you belong here.*'],
    ],
    init(S) {
      const look = [{ hair: 'curl', blush: PAL.pink, fill: '#ffe9f2' }, { hair: 'antenna', hairColor: PAL.blue, fill: '#e6f0ff' }, { hairColor: PAL.orange, blush: '#ffb08a', fill: '#fff4d6' }];
      S.friends = SPOTS.map((x, i) => S.addChar({ x, face: -1, gain: .4, ...look[i] }));
      S.bo = S.addChar({ x: 0, walk: V }); S.focus = S.bo;
      S.tape = { a: { x: 0, v: 0 }, b: { x: 0, v: 0 }, broke: false };
      S.crown = { at: 'f0', from: null, t0: 0, dur: 1, arc: 0, to: 'f0' };
    },
    update(S, t, dt) {
      const bo = S.bo;
      S.plan(bo, t, [
        [0, { x: SPOT, speed: V, accel: 450 }],
        [7.8, { eye: 'wide', lookY: -1, lookX: 0 }],
        [8.4, { eye: 'sad', lookY: 0 }],
        [8.6, { face: -1 }], [8.8, { face: 1 }], [9.0, { face: -1 }], [9.2, { face: 1 }],        // no no no
        [11.2, { tilt: .3, lookX: .8 }], [11.7, { tilt: 0 }],
        [13.5, { crouch: .25, eye: 'squeeze' }], [13.8, { crouch: 0 }], [13.8, () => bo.jump(0, -380)],   // hide it
        [15.3, { eye: 'wide', lookY: -.6 }], [16.0, { eye: 'squeeze' }],
        [16.5, { crouch: .2 }], [16.75, { crouch: 0, tilt: -.3 }], [16.75, () => bo.jump(0, -520)],      // throw it
        [17.4, { tilt: 0, eye: 'open', lookX: -.6, lookY: -.6 }],
        [18.2, { lookX: .8, lookY: -.3, eye: 'wide' }],
        [19.6, { lookX: 0, lookY: -1, eye: 'open' }],
        [20.4, { crouch: -.12, eye: 'happy' }],                              // stands tall
        [22.0, { crouch: 0 }],
        [24.0, { tilt: .3 }], [24.4, { tilt: 0 }],                           // a little bow
        [BOW + .1, { eye: 'wide' }], [BOW + .4, { eye: 'happy' }],             // oh, a bow back?
        [BOW + .6, { tilt: .45, eye: 'closed' }], [BOW + 1.1, { tilt: 0, eye: 'open' }],   // lower
        [BOW + 1.3, { eye: 'wide' }], [BOW + 1.8, { eye: 'flat' }],            // lower still?!
        [FLIP - .3, { crouch: .25, eye: 'squeeze' }], [FLIP, { crouch: 0 }],
        [FLIP, () => { bo.jump(0, -780, 2 * Math.PI / .6); S.sfx('whoosh', { d: .5, v: .4 }, bo.x); }],   // the deepest bow there is
        [TADA, { crouch: -.12, eye: 'happy' }],                               // ta-da
        [TADA + .1, () => { const B = bo.top(); S.burst(B.x, B.y - 30, 10, [PAL.yellow, PAL.orange, PAL.pink, PAL.sky], { speed: 300, gravity: 500, size: 9, life: 1.1 }); S.sfx('arp', { notes: [2, 4, 7], g: .07 }, bo.x); }],
        [31.0, { crouch: .2 }], [31.25, { crouch: 0 }], [31.25, () => bo.jump(0, -460)],
        [LEAVE, { x: 1e6, speed: V, accel: 450, eye: 'open', lookX: 0, lookY: 0 }],
        [LEAVE + .1, () => S.sfx('hum', { notes: [2, 4, 5, 7, 5], gap: .3, g: .04 }, bo.x)],
      ]);
      // the bow-off: one friend bows, then all three bow deeper; after the flip they cheer and skip off ahead
      S.friends.forEach((f, i) => {
        S.plan(f, t, [
          ...(i === 0 ? [[BOW, { tilt: .35, eye: 'closed' }], [BOW + .5, { tilt: 0, eye: 'open' }]] : []),
          [BOW + 1.3 + i * .06, { tilt: .8, eye: 'closed' }], [BOW + 1.9, { tilt: 0, eye: 'open' }],
          [FLIP + .1, { eye: 'wide' }], [TADA, { eye: 'happy' }],
          [TADA + .05 + i * .08, () => f.jump(0, -420 - i * 20)],
          [TADA + .9 + (2 - i) * .3, { face: 1, x: 1e6, speed: 290, accel: 700 }],   // front one first, so nobody runs into anybody
        ]);
        if (t > TADA + 1.3 && f.mode === 'ground' && hash(Math.floor(t * 2.5) + i) > .7) S.once(`skip${i}:${Math.floor(t * 2.5)}`, () => f.jump(f.vx, -300));
      });
      if (t > TADA + .1) S.once('laugh', () => { S.sfx('laugh', { n: 3, k: 1.3 }, SPOTS[1]); S.sfx('laugh', { n: 3, k: 1.1, g: .8 }, SPOTS[0]); });
      // the finish tape snaps as Bo walks through it
      if (!S.tape.broke && bo.x > (POST_A + POST_B) / 2) {
        S.tape.broke = true; S.tape.a.v = 7; S.tape.b.v = -7;
        S.burst(bo.x, GROUND - 160, 46, [PAL.red, PAL.orange, PAL.yellow, PAL.lime, PAL.sky, PAL.violet, PAL.pink], { speed: 560, gravity: 700, size: 10, life: 1.8 });
        S.sfx('pop', { pitch: 700 }, bo.x); S.sfx('arp', { notes: [0, 2, 4, 7] }); S.sfx('sparkle', { n: 8 }, bo.x);
        S.friends.forEach((f, i) => S.once('cheer' + i, () => f.jump(0, -460 - i * 30)));
      }
      spring(S.tape.a, S.tape.broke ? 1.4 : 0, 40, .25, dt); spring(S.tape.b, S.tape.broke ? -1.4 : 0, 40, .25, dt);

      // the crown's journey
      MOVES.forEach(([at, to, dur, arc], i) => {
        if (t < at) return;
        S.once('mv' + i, () => {
          const from = crownPos(S, S.crown.at);
          Object.assign(S.crown, { from, to, t0: t, dur, arc, at: 'fly' });
          if (to === 'bo') S.sfx(i === MOVES.length - 1 ? 'sparkle' : 'boing', { pitch: 240 + i * 20, n: 6 }, bo.x); else S.sfx('whoosh', { d: dur, v: .5 }, bo.x);
          if (i === 0) S.friends[0].jump(0, -380);
          if (to === 'bo' && i > 0 && S.crown.from && i !== 6 && i !== 8) { const f = S.friends[i === 2 ? 0 : 1]; f.jump(0, -380); }
        });
      });
      if (S.crown.at === 'fly' && t >= S.crown.t0 + S.crown.dur) {
        S.crown.at = S.crown.to;
        if (S.crown.to === 'bo') { S.sfx('tock', { f: 1200 }, bo.x); bo.q.v += 2; }
        if (S.crown.to === 'ground') S.sfx('squish', {}, bo.x);
      }
      if (t > 15.05) S.once('popUp', () => { S.sfx('rumble', { d: .5 }); S.shake(2); });
      if (t > 18.9) S.once('allCheer', () => S.friends.forEach((f, i) => f.jump(0, -420 - i * 20)));
      // keeping it: the crown melts into a glow inside Bo
      if (t > 21.8) S.once('melt', () => { S.sfx('swell', { root: 523.25 }); S.sfx('charge', { n: 6 }, bo.x); });
      if (t > 22.6) S.once('melt2', () => S.sfx('charge', { n: 9 }, bo.x));
      if (t > 24.2) S.once('bow', () => S.friends.forEach((f, i) => f.jump(0, -380)));
      if (t > 5 && t < LEAVE) { S.camGoal.x = 1250; S.camGoal.z = .78; S.camGoal.kx = 2.4; }
    },
    drawSky(S, ctx, t, v) {
      for (let i = 0; i < 3; i++) {
        const W = v.right - v.left + 400, x = v.left - 200 + (1 - ((t / S.T + i / 3 + .35) % 1)) * W;
        cloud(ctx, x, v.top + (v.bottom - v.top) * (.25 + i * .06), 9, { X: '#ebe8f4' });
      }
    },
    drawBack(S, ctx, t) {
      ctx.lineWidth = 6;
      for (const x of [POST_A, POST_B]) { ctx.beginPath(); ctx.moveTo(x, GROUND + 2); ctx.lineTo(x, GROUND - 120); ctx.stroke(); }
      // tape: two halves swinging down once it snaps
      ctx.strokeStyle = PAL.red; ctx.lineWidth = 7; const ty = GROUND - 104, half = (POST_B - POST_A) / 2;
      for (const [px, ang] of [[POST_A, S.tape.a.x], [POST_B, S.tape.b.x]]) {
        const dir = px === POST_A ? 1 : -1, ex = px + Math.cos(ang) * half * dir, ey = ty + Math.sin(Math.abs(ang)) * half;
        ctx.beginPath(); ctx.moveTo(px, ty); ctx.lineTo(ex, ey); ctx.stroke();
      }
      // the glow left when the crown sinks in
      const g = sine(seg(t, 21.9, 22.8)) * (1 - sine(seg(t, 24, 26.5)));
      if (g > 0) { ctx.fillStyle = PAL.yellow; ctx.globalAlpha = .28 * g * (.8 + .2 * Math.sin(t * 8)); ctx.beginPath(); ctx.arc(S.bo.x, S.bo.y, 120 + 10 * Math.sin(t * 5), 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
    },
    drawFront(S, ctx, t) {
      const cr = S.crown;
      let p, spin = 0, k = 1;
      if (cr.at === 'fly') {
        const u = clamp((t - cr.t0) / cr.dur), e = sine(u), to = crownPos(S, cr.to);
        p = { x: lerp(cr.from.x, to.x, e), y: lerp(cr.from.y, to.y, e) - Math.sin(Math.PI * u) * cr.arc };
        spin = cr.to === 'away' || cr.dur >= .7 ? u * Math.PI * 4 : u * Math.PI * .5;
      } else p = crownPos(S, cr.at);
      if (t > 21.8) k = 1 - seg(t, 21.8, 22.6);                                 // dissolving into Bo
      if (k > 0) {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(spin); ctx.scale(k, k);
        sprite(ctx, CROWN, 0, 0, 5.6, { X: PAL.yellow, R: PAL.red });
        ctx.restore();
        if (cr.at === 'bo' && t > 18.8) for (let i = 0; i < 3; i++) sprite(ctx, SPRITES.sparkle, p.x - 30 + i * 30, p.y - 24 - Math.abs(Math.sin(t * 3 + i)) * 12, 2.4, { X: PAL.yellow }, Math.max(0, Math.sin(t * 4 + i * 2)));
      }
      if (t > 21.8 && t < 23) for (let i = 0; i < 10; i++) {
        const u = clamp((t - 21.8 - i * .06) / .6), bo = S.bo;
        if (u <= 0 || u >= 1) continue;
        sprite(ctx, SPRITES.sparkle, lerp(p.x + (hash(i) - .5) * 60, bo.x, u), lerp(p.y, bo.y, u), 2.6, { X: PAL.yellow }, 1 - u);
      }
      // friends' hearts while they cheer
      if (t > TADA && t < TADA + 1.6) S.friends.forEach((f, i) => { const tp = f.top(); sprite(ctx, SPRITES.heart, tp.x, tp.y - 40 - ((t * 60 + i * 20) % 50), 3.2, { X: PAL.pink }, Math.sin(Math.PI * seg(t, TADA, TADA + 1.6))); });
      if (t > 18.9 && t < 21.5) S.friends.forEach((f, i) => { const tp = f.top(); sprite(ctx, SPRITES.heart, tp.x, tp.y - 40 - ((t * 60 + i * 20) % 50), 3.2, { X: PAL.pink }, Math.sin(Math.PI * seg(t, 18.9, 21.5))); });
    },
  });
})();
