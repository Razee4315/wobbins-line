/* the-mosquito: extracted from ../the-mosquito.html by scripts/sync-shorts.py. Do not edit here. */
(function () {
  const Shorts = Object.assign(Object.create(window.Shorts), { play: story => { (window.WL_STORIES ||= {})['the-mosquito'] = story; } });
  // Pen and coloured pencil, in a lavender night. Opens bolt upright in bed, eye wide, with the bzzz circling. It goes
  // quiet when the light comes on and sits on the lampshade the moment Wobbin looks away. A tally appears on the
  // wall. Then the net comes down, and peace, and the button: it was inside all along.
  const { lerp, seg, sine, outBack, hash, mix, clamp, GROUND, INK } = Shorts;
  const hand = (...a) => Sketch.hand(...a), hatch = (...a) => Sketch.hatch(...a), tiles = (...a) => Sketch.tiles(...a), lump = (...a) => Sketch.lump(...a);
  const V = 150, NET = 15.5, BUTTON = 22.4, LEAVE = 23.6, OUT = LEAVE + 1.4, LOOP = OUT + 1;
  const NIGHT = '#d8d3ee', WARM = '#fbe8bd', BED0 = 70, BED1 = 340, SLAPS = [9.4, 10, 10.6];
  const lamp = t => t > 5.4 && t < 7.4;
  const hit = t => SLAPS.filter(a => t > a).length;

  function mosquito(ctx, x, y, s, dir, t, grin) {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s); ctx.lineCap = 'round';
    ctx.lineWidth = 2.6; ctx.beginPath(); for (const [ax, ay] of [[-8, 6], [0, 7], [8, 6]]) { ctx.moveTo(ax, ay); ctx.lineTo(ax - 7, ay + 15); ctx.lineTo(ax - 11, ay + 20); } ctx.stroke();
    const w = Math.sin(t * 70) * .5; ctx.lineWidth = 2.4; ctx.fillStyle = '#e9f0f7'; ctx.save(); ctx.translate(-2, -7); ctx.rotate(-.7 + w); ctx.beginPath(); ctx.ellipse(0, -14, 8, 17, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
    ctx.fillStyle = '#6b5a78'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(-4, 0, 16, 8, .15, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(13, -5, 8, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(19, -3); ctx.lineTo(38, 3); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(14, -7, 4.2, 0, 7); ctx.fill(); ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(15, -7, 2.1, 0, 7); ctx.fill();
    if (grin) { ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(14, -3, 4, .2, 2.2); ctx.stroke(); }
    ctx.restore();
  }

  Shorts.play({
    title: 'The Mosquito',
    style: 'pencil',
    accent: '#8a4fc9',
    hook: 1.25,
    page: [.8, OUT - 1.2, OUT],
    wash: 0,
    loopAfter: LOOP,
    paper: '#ffffff',
    ground: x => x > BED0 && x < BED1 ? GROUND - 66 : GROUND,
    lineAt: () => GROUND,
    captions: [
      [.2, 2.7, '*you again.*', null, false],
      [3.7, 4.6, '...gone.'],
      [5.8, 7.1, 'where *are* you?'],
      [8.4, 9.2, 'right.'],
      [11.5, 13.6, 'mosquito: *3.* me: *0.*'],
      [17, 17.9, '*peace.*'],
      [18.2, 22.4, "you can't win every fight. *get a net.*"],
    ],
    init(S) { S.bo = S.addChar({ x: 0, walk: V }); S.flyAt = { x: 0, y: 0 }; S.lastBzz = 0; },
    update(S, t, dt) {
      const bo = S.bo;
      S.plan(bo, t, [
        [0, { x: 200, speed: V, accel: 900 }],
        [.28, () => bo.jump(230, -640, 0, false)],
        [.95, { sit: 1, eye: 'wide', lookX: -.6, lookY: -.5 }],
        [2.7, { sit: 1, crouch: .34, eye: 'closed', lookX: 0, lookY: 0 }], [2.7, () => S.sfx('rustle', { n: 3 }, bo.x)],
        [4.7, { eye: 'wide', crouch: .2, lookX: 1 }],
        [5.4, { sit: .7, crouch: 0, lookX: -1 }], [5.4, () => S.sfx('tap', {}, 330)],
        [5.9, { lookX: 1 }], [6.3, { lookX: -1, lookY: -.6 }], [6.7, { lookX: 1, lookY: .5 }],
        [7.4, { eye: 'wide', lookX: 0, lookY: 0 }], [7.4, () => S.sfx('tap', {}, 330)],
        [8.3, { sit: 0, crouch: 0, eye: 'squeeze', tilt: -.1 }],
        [9, () => { bo.jump(40, -660); }], [9.58, () => { bo.jump(-60, -560); }], [10.18, () => { bo.jump(30, -460); }],
        [10.75, { eye: 'dizzy', tilt: .1 }],
        [11.8, { sit: 1, eye: 'flat', tilt: .06 }],
        [13.9, { eye: 'flat', lookX: -1, lookY: -1, tilt: 0 }],
        [NET, { eye: 'wide', lookY: -1 }], [NET + .5, { eye: 'open', lookX: 1, lookY: .2 }],
        [16.9, { eye: 'happy', crouch: .08 }],
        [BUTTON, { eye: 'wide', crouch: 0, lookX: 1, lookY: .7 }], [BUTTON, () => S.sfx('gasp', {}, bo.x)],
        [LEAVE - .25, { sit: 0 }],
        [LEAVE, { x: 1e6, speed: 240, accel: 500, eye: 'wide', lookX: 0, lookY: 0 }], [LEAVE, () => bo.jump(420, -760)],
      ]);
      // the bzzz: little soft whines that come and go
      const flying = (t > .4 && t < 2.8) || (t > 4.4 && t < 5.4) || (t > 7.4 && t < 11.2) || t > BUTTON;
      if (flying && t - S.lastBzz > .55) { S.lastBzz = t; S.sfx('whistle', { d: .4, f: 1180 + hash(t) * 120, f2: 1100 }); }
      if (t > SLAPS[0]) S.once('s1', () => { S.sfx('thump', { g: .3 }); S.shake(4); });
      if (t > SLAPS[1]) S.once('s2', () => { S.sfx('thump', { g: .3 }); S.sfx('crash', {}, 300); S.shake(4); });
      if (t > SLAPS[2]) S.once('s3', () => { S.sfx('thump', { g: .4 }); S.sfx('dizzy', {}, bo.x); S.shake(6); });
      [11.8, 12.2, 12.6].forEach((a, i) => { if (t > a) S.once('tally' + i, () => S.sfx('scribble', {}, 140)); });
      if (t > 14.6) S.once('drawer', () => S.sfx('rustle', { n: 3 }, 100));
      if (t > NET) S.once('net', () => { S.sfx('whoosh', { d: .6 }); bo.q.v += 1.6; });
      [16.4, 16.8, 17.3].forEach((a, i) => { if (t > a) S.once('bump' + i, () => S.sfx('tap', {}, 340)); });
      if (t > 18.3) S.once('q', () => S.sfx('pad', { root: 293.66, d: 3 }));
      if (t > .6 && t < LEAVE) { S.camGoal.x = 205; S.camGoal.y = GROUND - 110; S.camGoal.z = 1.12; S.camGoal.kz = 3; }
    },
    drawBack(S, ctx, t, v) {
      const on = lamp(t), wall = on ? WARM : NIGHT;
      ctx.fillStyle = wall; ctx.fillRect(v.left - 20, v.top - 20, v.right - v.left + 40, GROUND - v.top + 24);
      tiles(ctx, -240, 660, 200, on ? '#f0d6a2' : '#c1badf', on ? '#fff2d6' : '#e6e2f4');
      ctx.fillStyle = on ? '#ecd0a0' : '#c7c0e2'; ctx.fillRect(v.left - 20, GROUND - 36, v.right - v.left + 40, 38); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(v.left - 20, GROUND - 36); ctx.lineTo(v.right + 20, GROUND - 36); ctx.stroke();
      // the window, with the moon going across it as the night goes on
      ctx.lineWidth = 6; hand(ctx, [[-30, GROUND - 400], [120, GROUND - 402], [122, GROUND - 240], [-28, GROUND - 238]], { fill: on ? '#a9a8d8' : '#8f8dc9', seed: 3 });
      ctx.save(); ctx.beginPath(); ctx.rect(-30, GROUND - 400, 150, 160); ctx.clip(); const mx = lerp(90, 0, t / LOOP); ctx.fillStyle = '#fff6d0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(mx, GROUND - 342, 24, 0, 7); ctx.fill(); ctx.stroke(); ctx.restore();
      ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(45, GROUND - 400); ctx.lineTo(46, GROUND - 240); ctx.moveTo(-29, GROUND - 320); ctx.lineTo(121, GROUND - 320); ctx.stroke();
      // the picture that doesn't survive the second swing
      if (hit(t) < 2) { ctx.lineWidth = 5; hand(ctx, [[176, GROUND - 368], [266, GROUND - 370], [266, GROUND - 290], [176, GROUND - 288]], { fill: '#f6e3a8', seed: 5 }); ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(190, GROUND - 304); ctx.lineTo(214, GROUND - 340); ctx.lineTo(232, GROUND - 318); ctx.lineTo(244, GROUND - 330); ctx.lineTo(256, GROUND - 304); ctx.stroke(); }
      else { const u = seg(t, SLAPS[1], SLAPS[1] + .4), a = 1 - (1 - u) * (1 - u); ctx.save(); ctx.translate(226, lerp(GROUND - 330, GROUND - 118, a)); ctx.rotate(a * .3); ctx.lineWidth = 5; hand(ctx, [[-44, -40], [46, -42], [46, 38], [-44, 40]], { fill: '#f6e3a8', seed: 5 }); ctx.restore(); }
      // the score on the wall
      ctx.lineWidth = 6; ctx.strokeStyle = '#8a4fc9'; ctx.beginPath(); [11.8, 12.2, 12.6].forEach((a, i) => { const u = seg(t, a, a + .22); if (u > 0) { const x = 298 + i * 26; ctx.moveTo(x, GROUND - 368); ctx.lineTo(x + 4, GROUND - 368 + 66 * u); } }); ctx.stroke(); ctx.strokeStyle = INK;
      // the nightstand and its lamp, with a little pull cord
      ctx.lineWidth = 5; hand(ctx, [[360, GROUND - 92], [456, GROUND - 93], [456, GROUND + 1], [360, GROUND + 1]], { fill: '#c9a07a', seed: 9 }); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(364, GROUND - 48); ctx.lineTo(452, GROUND - 48); ctx.stroke(); ctx.beginPath(); ctx.arc(408, GROUND - 70, 4, 0, 7); ctx.stroke();
      ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(408, GROUND - 93); ctx.lineTo(408, GROUND - 166); ctx.stroke();
      hand(ctx, [[366, GROUND - 158], [386, GROUND - 216], [430, GROUND - 216], [450, GROUND - 158]], { fill: on ? '#ffd86b' : '#e6b5c8', seed: 11 });
      if (on) { const g = ctx.createRadialGradient(408, GROUND - 170, 30, 408, GROUND - 170, 420); g.addColorStop(0, 'rgba(255,226,140,.5)'); g.addColorStop(1, 'rgba(255,226,140,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(408, GROUND - 170, 420, 0, 7); ctx.fill(); }
      // the bed: headboard against the wall, legs on the floor, a pillow with a dent in it
      ctx.lineWidth = 6; hand(ctx, [[46, GROUND + 2], [46, GROUND - 158], [78, GROUND - 156], [78, GROUND + 2]], { fill: '#b5805a', seed: 13 });
      hand(ctx, [[338, GROUND + 2], [338, GROUND - 92], [364, GROUND - 90], [364, GROUND + 2]], { fill: '#b5805a', seed: 14 });
      hand(ctx, [[60, GROUND - 68], [352, GROUND - 68], [352, GROUND - 22], [60, GROUND - 22]], { fill: '#efe3cf', seed: 15 });
      lump(ctx, [[110, GROUND - 92, 26], [142, GROUND - 88, 22]], '#ffffff', 4);
      // the net: all the mesh hangs behind Wobbin, so nothing crosses the eye
      const nu = seg(t, NET - .35, NET + .1), drop = 1 - (1 - nu) ** 3;
      if (nu > 0 && t < LEAVE) {
        const top = GROUND - 390, bot = lerp(top + 40, GROUND - 2, drop);
        ctx.save(); ctx.lineWidth = 2.2; ctx.beginPath(); for (let i = 0; i <= 12; i++) { const x = lerp(52, 352, i / 12); ctx.moveTo(200, top); ctx.lineTo(x, bot); } for (let i = 1; i < 7; i++) { const k = i / 7 * drop; ctx.moveTo(lerp(200, 52, k), lerp(top, bot, i / 7)); ctx.lineTo(lerp(200, 352, k), lerp(top, bot, i / 7)); } ctx.stroke(); ctx.restore();
      }
    },
    drawFront(S, ctx, t, v) {
      const bo = S.bo, on = lamp(t), hideBlanket = bo.mode === 'air' || t > LEAVE - .3 || t < .9 || (t > 8.2 && t < 11.7);
      // the blanket over Wobbin's legs: it rumples up when Wobbin hides under it
      if (!hideBlanket) {
        const up = t > 2.7 && t < 4.7 ? sine(seg(t, 2.7, 3)) : 0, top = GROUND - 92 - up * 30;
        ctx.lineWidth = 6; ctx.fillStyle = '#9fb0e0'; ctx.beginPath(); ctx.moveTo(84, GROUND - 22); ctx.quadraticCurveTo(100, top + 8, 180, top); ctx.quadraticCurveTo(280, top + 4, 344, GROUND - 60); ctx.lineTo(346, GROUND - 22); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.lineWidth = 3.5; ctx.beginPath(); for (let i = 0; i < 6; i++) { const x = 118 + i * 38; ctx.moveTo(x, GROUND - 74 + (i % 2) * 22 - up * 12); ctx.lineTo(x + 14, GROUND - 62 + (i % 2) * 22 - up * 12); } ctx.stroke();
      }
      // the net drops from a hook on the ceiling, and hangs round the bed
      const nu = seg(t, NET - .35, NET + .1), drop = 1 - (1 - nu) ** 3;
      if (nu > 0 && t < LEAVE) {
        const top = GROUND - 390, bot = lerp(top + 40, GROUND - 2, drop);
        ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(52, bot); ctx.lineTo(200, top); ctx.lineTo(352, bot); ctx.stroke();
        ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(200, top - 6, 7, 0, 7); ctx.stroke();
      }
      // where the mosquito is. It has a route through the whole night
      const inNet = t > BUTTON, cx = bo.x, cy = bo.y - 30; let fx = 0, fy = 0, sh = true, dir = 1, grin = false;
      if (t > .4 && t < 2.8) { fx = cx + Math.cos(t * 3.1) * 118; fy = cy - 34 + Math.sin(t * 5.3) * 62; dir = Math.sin(t * 3.1) > 0 ? -1 : 1; }
      else if (t >= 2.8 && t < 4.4) sh = false;
      else if (t >= 4.4 && t < 5.4) { const u = sine(seg(t, 4.4, 5.2)); fx = lerp(420, cx + 86, u); fy = lerp(GROUND - 300, cy - 56, u) + Math.sin(t * 16) * 6; dir = -1; }
      else if (t >= 5.4 && t < 7.4) { fx = 412; fy = GROUND - 234; grin = true; dir = -1; sh = t > 6.2; }
      else if (t >= 7.4 && t < 11.2) { fx = cx + Math.cos(t * 4.2) * 150; fy = GROUND - 240 + Math.sin(t * 6) * 80; dir = Math.sin(t * 4.2) > 0 ? -1 : 1; }
      else if (t >= 11.2 && t < 13.8) { fx = 372; fy = GROUND - 330; grin = true; dir = -1; }
      else if (t >= 13.8 && t < NET + .7) { fx = lerp(372, 420, sine(seg(t, 14, 16))); fy = GROUND - 260 + Math.sin(t * 7) * 40; dir = -1; }
      else if (t >= NET + .7 && t < BUTTON) { fx = 374 - 8 * Math.abs(Math.sin(t * 3)); fy = GROUND - 190 + Math.sin(t * 2) * 20; dir = -1; }
      else { fx = lerp(290, bo.x + 58, seg(t, BUTTON - .2, BUTTON + .5)); fy = bo.y - 44 + Math.sin(t * 12) * 8; dir = -1; grin = true; }
      if (sh && t < LEAVE + .6) {
        mosquito(ctx, fx, fy, 1.15, dir, t, grin);
        if (!grin) { ctx.font = '700 24px "Kevin Sans", sans-serif'; ctx.fillStyle = '#5a4a68'; for (let i = 0; i < 3; i++) { const p = (t * 1.6 + i / 3) % 1; ctx.globalAlpha = 1 - p; ctx.fillText('z', fx - dir * (30 + p * 56) + i * 6, fy - 8 - p * 26 + i * 5); } ctx.globalAlpha = 1; }
      }
      if (t > SLAPS[0] - .25 && t < 11.3) { const a = bo.top(); ctx.lineWidth = 4; hand(ctx, [[a.x - 16, a.y + 2], [a.x - 12, a.y - 96], [a.x + 14, a.y - 96], [a.x + 16, a.y + 2]], { fill: '#f4e7c6', seed: 21, wob: 1.2, over: 1 }); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(a.x - 8, a.y - 22); ctx.lineTo(a.x + 8, a.y - 22); ctx.moveTo(a.x - 7, a.y - 46); ctx.lineTo(a.x + 7, a.y - 46); ctx.stroke(); }
    },
  });
})();
