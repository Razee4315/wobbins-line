/* Live scenes for the site, all running on the episodes' own engine (shorts/engine2.js):
   the hero walk-in and the walking band (the signature), the block wordmark that stands on
   the same line, the Meet Wobbin stage, the cast portraits and the episode-card previews. */
(function () {
  const { Show, GROUND, PAL, SPRITES, sprite, clamp, lerp, hash, mix } = Shorts;
  const PAPER = '#FBF8F2';
  const WL = window.WL = window.WL || {};
  WL.pointer = WL.pointer || { x: innerWidth / 2, y: innerHeight / 2 };
  WL.scrollVel = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- a canvas driven by one Show ----------
  class Stage {
    constructor(canvas, story, { T, fps = 60, cam } = {}) {
      this.cv = canvas; this.ctx = canvas.getContext('2d'); this.story = story; this.cam = cam;
      this.show = new Show(story, { loop: { T: T ?? story.loopAfter ?? story.T ?? 1e9, startState: null } });
      this.running = false; this.visible = true; this.step = 1 / fps; this.acc = 0;
      this.resize(); new ResizeObserver(() => { this.resize(); this.draw(); }).observe(canvas);
      WL.stages.add(this);
    }
    resize() {
      const r = this.cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1);
      this.cv.width = Math.max(2, Math.round(r.width * d)); this.cv.height = Math.max(2, Math.round(r.height * d));
      this.rect = r;
    }
    tick(dt) {
      if (!this.running || !this.visible) return;
      this.acc += dt; if (this.acc < this.step * .98) return;
      const d = Math.min(this.acc, .1); this.acc = 0;
      this.show.advance(d); this.draw();
    }
    draw() { if (this.cam) this.cam(this.show); this.show.render(this.ctx, this.cv.width, this.cv.height); this.view = this.show.view; }
    // world x/y of the mouse pointer, using this canvas's view from its last render
    pointerWorld() {
      const v = this.view, r = this.cv.getBoundingClientRect(); if (!v) return null;
      return { x: v.left + (WL.pointer.x - r.left) / r.width * (v.right - v.left), y: v.top + (WL.pointer.y - r.top) / r.height * (v.bottom - v.top) };
    }
  }
  WL.Stage = Stage;
  WL.stages = new Set();
  let last = performance.now();
  WL.tickStages = now => { const dt = Math.min(.1, (now - last) / 1000); last = now; for (const s of WL.stages) s.tick(dt); };

  // characters look at the pointer, and turn round if it's far behind them
  function lookAtPointer(stage, c, turn = true) {
    const p = stage.pointerWorld(); if (!p) return;
    const dx = p.x - c.x, dy = p.y - (c.y - 30);
    if (turn && Math.abs(dx) > 260 && Math.sign(dx) !== c.dir) c.cmd.face = Math.sign(dx);
    c.cmd.lookX = clamp(dx * c.dir / 320, -1, 1); c.cmd.lookY = clamp(dy / 320, -1, 1);
  }
  // move a character instantly, feet and hair included
  function moveTo(c, x) {
    const dx = x - c.x; c.x += dx; c.hx += dx; c.vx = 0;
    if (c.tuft) c.tuft.x += dx;
    for (const F of c.feet) { F.x += dx; F.fromX += dx; F.toX += dx; }
  }
  const FRIENDS = [
    { hair: 'curl', blush: PAL.pink, fill: '#ffe9f2' }, { hair: 'antenna', hairColor: PAL.blue, fill: '#e6f0ff' },
    { hairColor: PAL.orange, blush: '#ffb08a', fill: '#fff4d6' }, { hair: 'curl', hairColor: PAL.green, fill: '#e3fbef' },
  ];

  // ---------- the one line (the signature) ----------
  // A single fixed, transparent canvas: at the top of the page it is the hero stage, with Wobbin
  // walking in past the block wordmark; as the hero scrolls away (WL.bandK 0 → 1) the same line
  // and the same Wobbin shrink into the walking band, which then follows the scroll for the whole page.
  WL.bandK = 0;
  WL.STACKED = '(max-width: 899px), (max-aspect-ratio: 11/10)';
  const smooth = k => k * k * (3 - 2 * k);
  const heroUnit = (cw, ch) => Math.min(ch / 440, cw / 300);
  const HERO_GROUND = .86;
  const homeFrac = () => matchMedia(WL.STACKED).matches ? .74 : .87;   // Wobbin's spot in the hero, across the view
  WL.bandScene = canvas => {
    let lastCh = 1, bandBack = 112;
    const story = {
      clear: true, warmup: 0, maxLead: 30,   // short strides, whatever the scroll speed
      unit(cw, ch) { lastCh = ch; bandBack = stage.bandCss * stage.dpr; return lerp(heroUnit(cw, ch), bandBack / 250, smooth(WL.bandK)); },
      get groundFrac() { return lerp(HERO_GROUND, 1 - .1 * bandBack / lastCh, smooth(WL.bandK)); },
      init(S) {
        S.bo = S.addChar({ x: 0 }); S.idle = 0; S.go = false; S.arrived = false; S.free = false; S.hop = false; S.fidget = 0; S.lands = 0;
      },
      update(S, t, dt) {
        const bo = S.bo, c = bo.cmd, v = S.view;
        stomps(S, bo);
        if (!S.free && (Math.abs(WL.scrollVel) > 40 || WL.bandK > .04) && S.arrived) S.free = true;
        if (!S.free) {
          S.camGoal.x = 0; S.camGoal.kx = 30;
          if (!S.go) { if (v && bo.x > v.left - 200) moveTo(bo, v.left - 200); c.x = bo.x; return; }
          const tx = v ? lerp(v.left, v.right, homeFrac()) : 0;
          if (!S.arrived) {
            Object.assign(c, { x: tx, speed: 150, accel: 480, eye: 'open', face: 1 });
            if (Math.abs(bo.x - tx) < 3 && Math.abs(bo.vx) < 5) { S.arrived = true; S.fidget = 5.8; }   // a little hop on arrival
          } else {
            lookAtPointer(stage, bo); S.fidget += dt;
            if (S.fidget > 6.5) { S.fidget = 0; bo.jump(0, -360); }
          }
        } else {
          // back near the top, the camera puts Wobbin on his spot beside the wordmark again
          // (the ground slides under him instead); down in the band it just follows him
          const home = 1 - clamp(WL.bandK / .35);
          if (home > 0 && v) { S.camGoal.x = lerp(bo.x + clamp(bo.vx * .3, -140, 140), bo.x + (.5 - homeFrac()) * (v.right - v.left), smooth(home)); S.camGoal.kx = 12; }
          const sv = clamp(WL.scrollVel * .35, -220, 220);
          if (Math.abs(sv) > 24) { Object.assign(c, { x: bo.x + Math.sign(sv) * 1e5, speed: Math.abs(sv), accel: 900, face: Math.sign(sv), lookX: 0, lookY: 0, eye: Math.abs(sv) > 190 ? 'squeeze' : 'open' }); S.idle = 0; }
          else {
            c.x = bo.x + bo.vx * .08; c.accel = 900; S.idle += dt;
            if (S.idle > .8) { c.eye = 'open'; lookAtPointer(stage, bo); c.lookY = clamp(c.lookY, -1, .2); }
            if (home > .99 && S.idle > 7.3 && bo.mode === 'ground') { S.idle = .9; bo.jump(0, -360); }   // the hero fidget hop, again
          }
        }
        if (S.hop && bo.mode === 'ground') { S.hop = false; bo.jump(0, -560); c.eye = 'happy'; setTimeout(() => { if (c.eye === 'happy') c.eye = 'open'; }, 900); }
      },
      drawSky(S, ctx, t, v) {
        // once Wobbin is down in the band, the band gets its own strip of paper so content slides under it
        const a = clamp((WL.bandK - .55) / .45); if (a <= 0) return;
        const top = v.top + (1 - bandBack / v.ch) * (v.bottom - v.top);
        ctx.globalAlpha = a; ctx.fillStyle = PAPER; ctx.fillRect(v.left - 10, top, v.right - v.left + 20, v.bottom - top + 10); ctx.globalAlpha = 1;
      },
      drawBack(S, ctx, t, v) {
        // ground details that scroll by, so walking reads: tufts, pebbles, tiny pixel flowers
        const a = Math.floor(v.left / 90) - 1, b = Math.ceil(v.right / 90) + 1;
        for (let i = a; i <= b; i++) {
          const h = hash(i * 1.7), x = i * 90 + hash(i + .3) * 60;
          if (h < .38) {
            ctx.strokeStyle = PAL.green; ctx.lineWidth = 4;
            for (let k = -1; k <= 1; k++) { const an = k * .35 + Math.sin(t * 1.4 + i) * .08; ctx.beginPath(); ctx.moveTo(x + k * 4, GROUND + 2); ctx.lineTo(x + k * 4 + Math.sin(an) * 13, GROUND - Math.cos(an) * 13); ctx.stroke(); }
          } else if (h < .5) { ctx.fillStyle = PAL.grey; ctx.beginPath(); ctx.ellipse(x, GROUND - 2, 10, 6, 0, Math.PI, 0); ctx.fill(); }
          else if (h < .6) {
            const col = [PAL.pink, PAL.yellow, PAL.sky, PAL.orange][Math.floor(hash(i + .9) * 4)];
            ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, GROUND + 2); ctx.lineTo(x, GROUND - 26); ctx.stroke();
            sprite(ctx, ['.X.', 'XCX', '.X.'], x, GROUND - 28, 5, { X: col, C: PAL.yellow === col ? PAL.orange : PAL.yellow });
          }
        }
      },
    };
    // footsteps and landings shake the wordmark that stands on the same line
    function stomps(S, bo) {
      const v = stage.view, r = stage.rect; if (!v || !WL.markStomp || WL.bandK > .3) return;
      const css = x => r.left + (v.ox + x * v.unit) * r.width / stage.cv.width;
      if (bo.lands !== S.lands) { S.lands = bo.lands; WL.markStomp(css(bo.x), clamp((bo.landV || 0) / 600, .3, 1.2), 520, true); }
      else if (bo.mode === 'ground') for (const F of bo.feet) if (F.state === 'planted' && F.planted === 0) WL.markStomp(css(F.x), .22, 70, false);
    }
    const stage = new Stage(canvas, story);
    const measure = () => { stage.bandCss = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--band-h')) || 112; stage.dpr = canvas.height / Math.max(1, canvas.getBoundingClientRect().height); };
    measure(); new ResizeObserver(measure).observe(canvas);
    stage.walkIn = () => { stage.show.go = true; };
    stage.hop = () => { stage.show.hop = true; };
    // where the top edge of the line sits in the hero (viewport px at scroll 0), and the hero's world scale
    stage.heroLine = () => { const r = canvas.getBoundingClientRect(), u = heroUnit(r.width, r.height); return { top: r.top + r.height * HERO_GROUND + u, unit: u }; };
    return stage;
  };

  // ---------- the hero wordmark: ink blocks standing on Wobbin's line ----------
  // Built from little cut-paper squares. They drop in, lift and light up near the pointer, jump when
  // poked, ripple when Wobbin lands, jiggle under Wobbin's feet, and float off as the hero scrolls away.
  const GLYPHS = {
    W: ['XX....XX', 'XX....XX', 'XX....XX', 'XX.XX.XX', 'XX.XX.XX', 'XXXXXXXX', '.XX..XX.'],
    O: ['.XXXX.', 'XX..XX', 'XX..XX', 'XX..XX', 'XX..XX', 'XX..XX', '.XXXX.'],
    B: ['XXXXX.', 'XX..XX', 'XX..XX', 'XXXXX.', 'XX..XX', 'XX..XX', 'XXXXX.'],
    I: ['XX', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
    N: ['XX..XX', 'XXX.XX', 'XXXXXX', 'XX.XXX', 'XX..XX', 'XX..XX', 'XX..XX'],
    "'": ['XX', 'XX', '.X', 'X.', '..', '..', '..'],
    S: ['.XXXXX', 'XX....', 'XX....', '.XXXX.', '....XX', '....XX', 'XXXXX.'],
    L: ['XX....', 'XX....', 'XX....', 'XX....', 'XX....', 'XX....', 'XXXXXX'],
    E: ['XXXXXX', 'XX....', 'XX....', 'XXXXX.', 'XX....', 'XX....', 'XXXXXX'],
  };
  const ROWS = [
    { text: "WOBBIN'S", scale: 1, colors: [PAL.pink, PAL.orange, PAL.yellow, PAL.lime, PAL.sky, PAL.blue, PAL.red, PAL.violet] },
    { text: 'LINE', scale: 2, colors: [PAL.red, PAL.orange, PAL.sky, PAL.pink] },
  ];
  const MARK_COLS = 49, MARK_H = 7 + 1.4 + 14;   // in row-one blocks
  // The footer gets a second, smaller copy ({ foot: true }): same blocks and pointer play, dropping in
  // when it scrolls into view, with no line to stand on and no exit.
  WL.markScene = (canvas, band, hero, { foot = false } = {}) => {
    const ctx = canvas.getContext('2d'), hint = hero.querySelector('.hero__hint'), slot = hero.querySelector('.hero__slot');
    let blocks = [], letters = [], b = 10, d = 1, W = 0, H = 0, top = 0, ripples = [], t = 0, dropAt = null, poked = false;
    // one block per filled glyph cell; each keeps its own spring (dy), heat (colour) and a few random numbers
    function build() {
      blocks = []; letters = [];
      ROWS.forEach((row, ri) => {
        let col = 0;
        [...row.text].forEach((ch, k) => {
          const g = GLYPHS[ch], L = { i: letters.length, color: row.colors[k], blocks: [] };
          g.forEach((line, r) => [...line].forEach((cell, c) => {
            if (cell !== 'X') return;
            const n = blocks.length;
            const B = { row: ri, col: col + c, r, li: L.i, dy: 0, vy: 0, heat: 0, rot: (hash(n * 1.31) - .5) * .035, jx: hash(n * 2.7) - .5, jy: hash(n * 3.9) - .5, rnd: hash(n * 5.3), rnd2: hash(n * 7.1) };
            blocks.push(B); L.blocks.push(B);
          }));
          letters.push(L); col += g[0].length + 1;
        });
      });
    }
    function layout() {
      d = Math.min(2, devicePixelRatio || 1);
      let x0, bottom;
      if (foot) {
        // room above the letters for them to jump into
        W = canvas.getBoundingClientRect().width; b = Math.max(4, Math.floor(Math.min(W / MARK_COLS, 15)));
        H = Math.round(b * (MARK_H + 4)); canvas.style.height = H + 'px';
        canvas.width = Math.round(W * d); canvas.height = Math.round(H * d);
        x0 = 0; bottom = H;
      } else {
      const r = hero.getBoundingClientRect(); W = r.width; H = r.height;
      canvas.width = Math.round(W * d); canvas.height = Math.round(H * d);
      const side = parseFloat(getComputedStyle(hero.querySelector('.hero__inner')).paddingLeft) || 16;
      x0 = side;
      if (matchMedia(WL.STACKED).matches) {
        b = Math.max(4, Math.floor((W - side * 2) / MARK_COLS));
        slot.style.setProperty('--slot-h', Math.round(b * MARK_H) + 'px');
        bottom = slot.getBoundingClientRect().bottom - r.top;
        hint.hidden = true;
      } else {
        const line = band.heroLine(), inner = hero.querySelector('.hero__inner').getBoundingClientRect();
        bottom = line.top;   // the hero is the first thing on the page, so at scroll 0 its coords are the viewport's
        b = Math.max(6, Math.floor(Math.min((W * .74 - side) / MARK_COLS, (bottom - (inner.bottom - r.top) - 56) / MARK_H)));
        hint.hidden = false;
      }
      }
      top = bottom - b * MARK_H;
      for (const B of blocks) {
        const s = b * ROWS[B.row].scale, rowTop = B.row ? bottom - 14 * b : top;
        B.s = s; B.x = x0 + B.col * s; B.y = rowTop + B.r * s;
      }
      for (const L of letters) {
        const xs = L.blocks.map(B => B.x), ys = L.blocks.map(B => B.y);
        L.box = [Math.min(...xs), Math.min(...ys), Math.max(...xs) + L.blocks[0].s, Math.max(...ys) + L.blocks[0].s];
      }
      if (!foot) hero.style.setProperty('--hint-y', Math.round(top - 34) + 'px');
      draw();
    }
    // a wave travelling out from x along the line
    if (!foot) WL.markStomp = (x, power, reach, warm) => { if (!reduced) ripples.push({ x: x - canvas.getBoundingClientRect().left, t0: t, power, reach, warm, front: 0 }); };
    function poke(L) {
      for (const B of L.blocks) { B.vy -= b * (34 + 10 * B.rnd) * (1 - .25 * B.r / 7); B.heat = 1.4; }
      ripples.push({ x: (L.box[0] + L.box[2]) / 2, t0: t, power: .35, reach: 260, warm: true, front: 0 });
      if (!poked && hint) { poked = true; hint.classList.add('is-gone'); }
    }
    canvas.addEventListener('pointerdown', e => {
      const r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, pad = b * .6;
      const L = letters.find(L => x > L.box[0] - pad && x < L.box[2] + pad && y > L.box[1] - pad && y < L.box[3] + pad);
      if (L) poke(L);
    });

    const K = 420, Z = 2 * .36 * Math.sqrt(K);
    const mark = {
      running: !reduced, visible: true,
      drop() { dropAt = t + .05; },
      tick(dt) {
        if (!this.running || !this.visible || (!foot && scrollY > H * 1.1)) return;
        dt = Math.min(dt, 1 / 30); t += dt;
        const hr = canvas.getBoundingClientRect(), px = WL.pointer.x - hr.left, py = WL.pointer.y - hr.top, R = b * 3.6;
        const near = px > -R && px < W + R && py > top - R && py < H;
        for (const rp of ripples) rp.last = rp.front, rp.front = (t - rp.t0) * 1300;
        ripples = ripples.filter(rp => rp.front < W * 1.2 + rp.reach * 3);
        for (const B of blocks) {
          const cx = B.x + B.s / 2, cy = B.y + B.s / 2;
          let target = 0;
          if (near) {
            const dd = Math.hypot(px - cx, py - cy);
            if (dd < R) { const k = 1 - dd / R; target = -b * .7 * k * k; B.heat = Math.max(B.heat, k * 1.6); }
          }
          for (const rp of ripples) {
            const dist = Math.abs(cx - rp.x);
            if (dist > rp.last && dist <= rp.front) {
              const f = rp.power * Math.exp(-dist / rp.reach);
              B.vy -= b * 22 * f * (.8 + .4 * B.rnd);
              if (rp.warm) B.heat = Math.max(B.heat, f * 2.2); else if (f > .12) B.heat = Math.max(B.heat, .8);
            }
          }
          B.vy += (-K * (B.dy - target) - Z * B.vy) * dt; B.dy += B.vy * dt;
          B.heat = Math.max(0, B.heat - dt * 1.3);
        }
        draw();
      },
    };
    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
      const p = reduced || foot ? 0 : clamp(scrollY / (H * .7)), inset = Math.max(1, b * .07), frame = Math.floor(t * 8);
      for (const B of blocks) {
        let oy = B.dy, ox = 0, rot = B.rot, alpha = 1;
        // the drop-in: bottom rows first, left to right, each block falling from above the hero
        if (!reduced) {
          if (dropAt === null) continue;
          const delay = (B.x / W) * .75 + (6 - B.r) * .045 + B.rnd * .04, td = t - dropAt - delay;
          if (td < 0) continue;
          const fall = Math.min(B.y + B.s, b * 16), dur = .42, g = 2 * fall / (dur * dur);
          if (td < dur) { oy += -fall + .5 * g * td * td; rot += (1 - td / dur) * (B.rnd - .5) * .8; alpha = Math.min(1, td / (dur * .35)); }
          else if (!B.landed) { B.landed = true; B.vy += b * 9; B.heat = Math.max(B.heat, .9); }
        }
        // leaving: blocks lift off one by one and float up out of the top as the hero scrolls away
        if (p > 0) {
          const q = clamp((p - .06 - B.li / letters.length * .34 - B.rnd * .12) / .42);   // letter by letter, left to right
          oy -= q * q * H * .7; ox += (B.rnd2 - .5) * q * b * 8; rot += (B.rnd2 - .5) * q * 3; alpha *= 1 - q * q;
          if (alpha <= 0) continue;
        }
        const wob = B.heat > .2 ? (hash(B.li * 9.1 + frame) - .5) * .05 : 0;   // a lit block boils a little
        const half = B.s / 2 - inset, x = B.x + B.s / 2 + ox + B.jx * b * .03, y = B.y + B.s / 2 + oy + B.jy * b * .03, c = Math.cos(rot + wob), sn = Math.sin(rot + wob);
        ctx.setTransform(c * d, sn * d, -sn * d, c * d, x * d, y * d);
        ctx.globalAlpha = alpha; ctx.fillStyle = B.heat > .35 ? letters[B.li].color : INK;
        ctx.fillRect(-half, -half, half * 2, half * 2);
      }
      ctx.globalAlpha = 1;
    }
    const INK = '#141210';
    build(); layout();
    new ResizeObserver(() => layout()).observe(foot ? canvas.parentElement : hero);
    if (foot) new IntersectionObserver(es => { mark.visible = es[0].isIntersecting; if (mark.visible && dropAt === null) mark.drop(); }, { threshold: .35 }).observe(canvas);
    addEventListener('scroll', () => { if (!mark.running) draw(); }, { passive: true });
    WL.stages.add(mark);
    if (reduced) { dropAt = 0; draw(); }
    return mark;
  };

  // ---------- Meet Wobbin: a big idle Wobbin who notices you ----------
  WL.meetScene = canvas => {
    const story = {
      paper: PAPER, unit: (cw, ch) => Math.min(ch / 360, cw / 300), groundFrac: .8, warmup: 0,
      init(S) { S.bo = S.addChar({ x: 0 }); S.t2 = 0; S.hop = false; },
      update(S, t, dt) {
        const bo = S.bo; S.camGoal.x = 0; S.camGoal.kx = 20; bo.cmd.x = 0;
        lookAtPointer(stage, bo);
        S.t2 += dt;
        if (S.t2 > 5.2) { S.t2 = 0; bo.cmd.crouch = .18; setTimeout(() => { bo.cmd.crouch = 0; if (bo.mode === 'ground') bo.jump(0, -300); }, 220); }
        if (S.hop && bo.mode === 'ground') { S.hop = false; bo.cmd.eye = 'happy'; bo.jump(0, -640, Math.random() < .35 ? (bo.dir > 0 ? 11 : -11) : 0); setTimeout(() => bo.cmd.eye = 'open', 1100); }
      },
    };
    const stage = new Stage(canvas, story);
    stage.hop = () => { stage.show.hop = true; };
    return stage;
  };

  // ---------- the cast: one show, five portraits (the camera visits each) ----------
  WL.castScene = canvases => {
    const looks = [{}, ...FRIENDS];
    const story = {
      paper: PAPER, unit: (cw, ch) => ch / 250, groundFrac: .86, warmup: 0,
      init(S) { S.cast = looks.map((o, i) => S.addChar({ x: i * 500, ...o })); S.focus = S.cast[0]; S.fid = looks.map((_, i) => 2 + i * 1.3); },
      update(S, t, dt) {
        S.cast.forEach((c, i) => {
          c.cmd.x = i * 500;
          const st = stages[i], p = st && st.pointerWorld();
          if (p) { const dx = p.x - c.x; c.cmd.lookX = clamp(dx * c.dir / 400, -1, 1); c.cmd.lookY = clamp((p.y - c.y) / 400, -1, 1); }
          S.fid[i] -= dt; if (S.fid[i] < 0) { S.fid[i] = 4 + hash(i + t) * 4; if (c.mode === 'ground') c.jump(0, -300); }
        });
      },
    };
    const show = new Show(story, { loop: { T: 1e9, startState: null } });
    const stages = canvases.map((cv, i) => {
      const s = Object.create(Stage.prototype);
      Object.assign(s, { cv, ctx: cv.getContext('2d'), show, running: true, visible: true, step: 1 / 30, acc: 0, story, cam: sh => { sh.cam.x.x = i * 500; sh.cam.y.x = GROUND - 70; sh.cam.z.x = 1; sh.cam.shake = 0; } });
      s.resize(); new ResizeObserver(() => s.resize()).observe(cv);
      return s;
    });
    // advance the shared show once per frame, draw each portrait
    const driver = { running: true, visible: true, acc: 0, tick(dt) {
      if (!this.running || !this.visible) return; this.acc += dt; if (this.acc < 1 / 30) return;
      show.advance(Math.min(this.acc, .1)); this.acc = 0; stages.forEach(s => s.draw());
    } };
    WL.stages.add(driver);
    stages.forEach(s => s.draw());
    return driver;
  };

  // ---------- episode previews ----------
  // Season 1 runs on the older engine, so its cards get a little engine2 still life instead.
  const S1_POSTERS = {
    'the-cloud': (S, ctx, t) => {
      const b = S.bo; ctx.fillStyle = '#a7abb2';
      for (const [ox, oy, r] of [[-50, 8, 26], [-20, -8, 34], [16, -14, 38], [48, 0, 30], [0, 14, 30]]) { ctx.beginPath(); ctx.arc(b.x + ox, GROUND - 380 + oy, r, 0, Math.PI * 2); ctx.fill(); }
      ctx.strokeStyle = '#7f94b0'; ctx.lineWidth = 3;
      for (let i = 0; i < 12; i++) { const x = b.x - 60 + hash(i) * 120, y = GROUND - 340 + ((t * 300 + hash(i + .5) * 200) % 200); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 16); ctx.stroke(); }
      ctx.strokeStyle = '#3aa655'; ctx.fillStyle = '#3aa655'; ctx.lineWidth = 5; const sx = b.x + 120;
      ctx.beginPath(); ctx.moveTo(sx, GROUND + 1); ctx.quadraticCurveTo(sx - 6, GROUND - 40, sx, GROUND - 72); ctx.stroke();
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sx, GROUND - 72); ctx.quadraticCurveTo(sx + s * 12, GROUND - 94, sx + s * 32, GROUND - 88); ctx.quadraticCurveTo(sx + s * 18, GROUND - 68, sx, GROUND - 72); ctx.fill(); }
    },
    'the-seed': (S, ctx) => {
      const b = S.bo, x = b.x + 150; ctx.lineWidth = 6; ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(x - 12, GROUND + 4); ctx.lineTo(x - 6, GROUND - 240); ctx.lineTo(x + 6, GROUND - 240); ctx.lineTo(x + 12, GROUND + 4); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x, GROUND - 300, 120, 90, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f08a24'; for (const [fx, fy] of [[-50, 20], [30, -40], [60, 30]]) { ctx.beginPath(); ctx.arc(x + fx, GROUND - 300 + fy, 13, 0, Math.PI * 2); ctx.fill(); }
    },
    'the-gap': (S, ctx) => {
      const b = S.bo; ctx.fillStyle = PAPER; ctx.fillRect(b.x + 110, GROUND - 4, 170, 20);
      ctx.strokeStyle = '#111'; ctx.lineWidth = 5; const fx = b.x + 400;
      ctx.beginPath(); ctx.moveTo(fx, GROUND + 2); ctx.lineTo(fx, GROUND - 70); ctx.stroke();
      ctx.fillStyle = '#3b7dd8'; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; ctx.beginPath(); ctx.arc(fx + Math.cos(a) * 14, GROUND - 70 + Math.sin(a) * 14, 10, 0, Math.PI * 2); ctx.fill(); }
    },
  };
  WL.previewScene = (canvas, ep) => {
    let story;
    if (ep.s1) story = {
      paper: PAPER, warmup: 0, T: 1e9,
      init(S) { S.bo = S.addChar({ x: 0 }); }, update(S) { S.camGoal.x = 140; S.bo.cmd.lookX = .6; S.bo.cmd.lookY = ep.id === 'the-cloud' ? -.8 : .2; S.bo.cmd.eye = ep.id === 'the-cloud' ? 'sad' : 'open'; },
      drawFront: (S, ctx, t) => S1_POSTERS[ep.id](S, ctx, t),
    };
    else story = window.WL_STORIES[ep.id];
    const stage = new Stage(canvas, story, { fps: 60 });
    stage.poster = () => { stage.show.seek(ep.s1 ? 1.5 : ep.poster); stage.draw(); stage.posted = true; };
    return stage;
  };

  WL.reduced = reduced;
})();
