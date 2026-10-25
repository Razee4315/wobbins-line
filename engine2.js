/* engine2.js — v2 of the line-shorts engine.
   Same idea as engine.js (stories set goals, springs + physics make the motion),
   plus: a following camera that frames any aspect ratio (phone or laptop),
   terrain, pixel sprites + particles, typed subtitles, seamless loops (the
   engine finds the frame where Bo's walk matches the opening frame), and a
   frame-exact MP4 export through WebCodecs. */
(function () {
  const GROUND = 620, BODY_H = 60, HIP_Y = 44, LEG = 66, STAND = 10 + 58 + HIP_Y;
  const GRAV = 2600, DT = 1 / 240, INK = '#111', PAPER = '#ffffff';
  // a small retro (PICO-8 flavoured) palette for accents
  const PAL = {
    red: '#ff004d', orange: '#ffa300', yellow: '#ffec27', green: '#00b543', lime: '#00e436',
    blue: '#3b7dd8', sky: '#29adff', violet: '#7b5cff', pink: '#ff77a8', peach: '#ffccaa',
    lav: '#b9b1d6', grey: '#c2c3c7', dim: '#9a9aa2', navy: '#1d2b53', plum: '#7e2553', brown: '#ab5236',
  };
  const FONT = 'Silkscreen, "Courier New", monospace';

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const sine = k => -(Math.cos(Math.PI * k) - 1) / 2;
  const outCubic = k => 1 - Math.pow(1 - k, 3);
  const inCubic = k => k * k * k;
  const outBack = k => { const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  function spring(s, target, k, z, dt) {
    s.v += (k * (target - s.x) - 2 * z * Math.sqrt(k) * s.v) * dt;
    s.x += s.v * dt;
  }
  const mix = (a, b, k) => {
    const p = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16));
    const A = p(a), B = p(b);
    return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join('');
  };

  // pixel sprites: rows of chars, '.' is empty, other chars map to colours
  const SPRITES = {
    heart: ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'],
    sparkle: ['..X..', '..X..', 'XXXXX', '..X..', '..X..'],
    dot: ['XX', 'XX'],
    cloud: ['.....XXXX.......', '...XXXXXXXX.XX..', '..XXXXXXXXXXXXX.', 'XXXXXXXXXXXXXXXX', '.XXXXXXXXXXXXXX.'],
    flyA: ['XX...XX', 'XXX.XXX', '.XXBXX.', 'XX.B.XX', 'X..B..X'],
    flyB: ['.......', '..XBX..', '.XXBXX.', '..XBX..', '...B...'],
    birdA: ['X.....X', '.X...X.', '..XXX..'],
    birdB: ['.......', 'XX...XX', '..XXX..'],
    check: ['....X', '...X.', 'X.X..', '.X...'],
    note: ['..XX', '..X.', '..X.', 'XXX.', 'XXX.'],
    star: ['..X..', '.XXX.', 'XXXXX', '.XXX.', '..X..'],
    moon: ['..XXX..', '.XXX...', 'XXX....', 'XXX....', 'XXX....', '.XXX...', '..XXX..'],
    sun: ['X..X..X', '.XXXXX.', '.XXXXX.', 'XXXXXXX', '.XXXXX.', '.XXXXX.', 'X..X..X'],
    bang: ['XX', 'XX', 'XX', 'XX', '..', 'XX'],
    ask: ['.XXX.', 'X...X', '...X.', '..X..', '.....', '..X..'],
    bulb: ['.XXX.', 'XXXXX', 'XXXXX', '.XXX.', '..B..', '.BBB.'],
    d0: ['XXX', 'X.X', 'X.X', 'X.X', 'XXX'], d1: ['.X.', 'XX.', '.X.', '.X.', 'XXX'], d2: ['XXX', '..X', 'XXX', 'X..', 'XXX'],
    d3: ['XXX', '..X', 'XXX', '..X', 'XXX'], d4: ['X.X', 'X.X', 'XXX', '..X', '..X'], d5: ['XXX', 'X..', 'XXX', '..X', 'XXX'],
    d6: ['XXX', 'X..', 'XXX', 'X.X', 'XXX'], d7: ['XXX', '..X', '.X.', '.X.', '.X.'],
  };
  // floating "z z z" above a sleeper's head
  function zzz(ctx, x, y, t, alpha = 1) {
    ctx.save(); ctx.lineWidth = 4; ctx.strokeStyle = INK;
    for (let k = 0; k < 3; k++) {
      const p = (t / 1.8 + k / 3) % 1, s = 10 + p * 10, zx = x + 30 + p * 40, zy = y - 20 - p * 90;
      ctx.globalAlpha = Math.sin(Math.PI * p) * alpha;
      ctx.beginPath(); ctx.moveTo(zx - s / 2, zy - s / 2); ctx.lineTo(zx + s / 2, zy - s / 2); ctx.lineTo(zx - s / 2, zy + s / 2); ctx.lineTo(zx + s / 2, zy + s / 2); ctx.stroke();
    }
    ctx.restore();
  }
  // colour over time: stops = [[t, '#hex'], ...], eased between neighbours (for skies and paper)
  function ramp(t, stops) {
    if (t <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], sine(seg(t, stops[i - 1][0], stops[i][0])));
    return stops[stops.length - 1][1];
  }
  function sprite(ctx, rows, x, y, px, colors, alpha = 1) {
    const h = rows.length, w = rows[0].length;
    if (alpha <= 0) return;
    ctx.save(); ctx.globalAlpha *= alpha;
    for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
      const ch = rows[r][c]; if (ch === '.') continue;
      ctx.fillStyle = colors[ch] || colors.X;
      ctx.fillRect(x + (c - w / 2) * px, y + (r - h / 2) * px, px + .4, px + .4);
    }
    ctx.restore();
  }

  // body outline (facing right): a bean with a soft forehead bump
  const N_SHAPE = 44;
  const SHAPE = Array.from({ length: N_SHAPE }, (_, i) => {
    const th = i / N_SHAPE * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
    const bump = 10 * Math.pow(Math.max(0, Math.cos(th + .85)), 3);
    return [(72 + bump) * c * (1 + .08 * s), (60 + bump) * s];
  });
  const shapeAt = f => {
    const k = (1 - clamp(f, -1, 1)) / 2;
    return SHAPE.map(([x, y], i) => {
      const [mx, my] = SHAPE[(N_SHAPE / 2 - i + N_SHAPE) % N_SHAPE];
      return [lerp(x, -mx, k), lerp(y, my, k)];
    });
  };

  class Character {
    constructor(S, o = {}) {
      const f = o.face ?? 1;
      this.S = S; this.hair = o.hair ?? 'tuft'; this.blush = o.blush ?? null; this.hairColor = o.hairColor ?? INK;
      this.gain = o.gain ?? 1; this.stepN = 0; this.fill = o.fill ?? PAPER;
      this.x = o.x ?? 0; this.y = S.groundAt(this.x) - STAND; this.vx = 0; this.vy = 0; this.axs = 0;
      this.mode = 'ground'; this.t = 0; this.lastPuff = -1; this.lands = 0; this.spin = 0;
      this.hx = this.x; this.hy = this.y; this.heldFeet = null;
      this.face = { x: f, v: 0 }; this.q = { x: 0, v: 0 }; this.rot = { x: 0, v: 0 };
      this.lookX = { x: 0, v: 0 }; this.lookY = { x: 0, v: 0 }; this.sit = { x: 0, v: 0 }; this.bob = 0;
      this.cmd = { x: this.x, speed: 140, accel: 700, face: f, crouch: 0, sit: 0, tilt: 0, lookX: 0, lookY: 0, eye: 'open' };
      if (o.walk) Object.assign(this.cmd, { x: this.x + 1e6 * f, speed: o.walk, accel: 500 });
      this.feet = [0, 1].map(i => ({
        x: this.x + (i ? 11 : -11) * f, y: S.groundAt(this.x), vx: 0, vy: 0, rot: 0,
        state: 'planted', planted: 1, s: 0, dur: .3, fromX: 0, fromY: 0, toX: 0,
      }));
      this.tuft = null;
    }
    get dir() { return this.face.x >= 0 ? 1 : -1; }
    get fw() { return clamp(this.face.x, -1, 1); }
    toWorld(lx, ly) {
      const q = this.q.x, sx = 1 + q * .7, sy = 1 - q;
      const x = lx * sx, y = ly * sy, c = Math.cos(this.rot.x), s = Math.sin(this.rot.x);
      return { x: this.x + x * c - y * s, y: this.y + x * s + y * c };
    }
    hip(i) { return this.toWorld((i ? 9 : -9) * this.fw, HIP_Y); }
    outline() { return shapeAt(this.fw).map(([x, y]) => this.toWorld(x, y)); }
    top() { return this.toWorld(0, -BODY_H); }
    jump(vx, vy, spin = 0) {
      this.mode = 'air'; this.vx = vx; this.vy = vy; this.spin = spin; this.q.v -= 2.5;
      this.S.sfx('jump', { v: clamp(-vy / 900), gain: this.gain }, this.x);
    }
    hold(x, y) { if (this.mode !== 'held') { this.mode = 'held'; this.hx = this.x; this.hy = this.y; } this.hx = x; this.hy = y; }
    release(vx, vy, spin = 0) { this.heldFeet = null; this.jump(vx, vy, spin); }

    step(dt) {
      const c = this.cmd, S = this.S; this.t += dt;
      spring(this.face, c.face, 320, 1, dt);
      spring(this.lookX, c.lookX, 240, .9, dt);
      spring(this.lookY, c.lookY, 240, .9, dt);
      spring(this.sit, this.mode === 'ground' ? c.sit : 0, 120, .7, dt);
      const pvx = this.vx, px = this.x, py = this.y;

      if (this.mode === 'ground') {
        const dx = c.x - this.x;
        if (Math.abs(dx) < .8 && Math.abs(this.vx) < c.accel * dt * 2) this.vx = 0;
        else {
          const want = Math.sign(dx) * Math.min(c.speed, Math.sqrt(2 * c.accel * Math.abs(dx)));
          this.vx += clamp(want - this.vx, -c.accel * dt, c.accel * dt);
        }
        this.x += this.vx * dt;
        // standing still, the body breathes a little, so a held pose never looks frozen
        const still = 1 - clamp(Math.abs(this.vx) / 30);
        spring(this.q, c.crouch + still * (this.breathe ?? .011) * Math.sin(this.t * 2.5 + (this.seed ?? 0)), 340, .3, dt);
      } else if (this.mode === 'air') {
        this.vy += GRAV * dt; this.x += this.vx * dt; this.y += this.vy * dt;
        spring(this.q, -clamp(Math.abs(this.vy) / 2800, 0, .13), 340, .45, dt);
        if (this.spin) { this.rot.x += this.spin * dt; this.rot.v = 0; }
        if (this.vy > 0 && this.y >= S.groundAt(this.x) - STAND + BODY_H * this.q.x) {
          this.mode = 'ground'; this.q.v += this.vy * .004; this.landV = this.vy; this.vy = 0;
          this.landedAt = this.t; this.lands++;
          if (this.spin) { this.rot.x = Math.atan2(Math.sin(this.rot.x), Math.cos(this.rot.x)); this.rot.v = this.spin * .2; this.spin = 0; }
          S.puff(this.x, -1); S.puff(this.x, 1);
          if (this === S.focus) S.shake(clamp(this.landV / 300, 0, 6));   // only Bo's landings move the camera
          S.sfx('land', { v: this.landV / 1300, gain: this.gain }, this.x);
        }
      } else {
        this.x = this.hx; this.y = this.hy;
        this.vx = (this.x - px) / dt; this.vy = (this.y - py) / dt;
        spring(this.q, c.crouch, 340, .3, dt);
      }

      this.axs += ((this.vx - pvx) / dt - this.axs) * Math.min(1, dt * 14);
      const braking = this.axs * this.vx < 0 && Math.abs(this.axs) > 900 && Math.abs(this.vx) > 140;
      if (this.mode === 'ground' && braking && this.t - this.lastPuff > .07) {
        this.lastPuff = this.t; S.puff(this.x + Math.sign(this.vx) * 30, Math.sign(this.vx), .7);
        S.sfx('skid', { gain: this.gain }, this.x);
      }

      if (!(this.mode === 'air' && this.spin)) {
        const lean = this.mode === 'ground'
          ? clamp(this.vx * .00045, -.17, .17) - clamp(this.axs * .0001, -.18, .18)
          : clamp(this.vx * .0003, -.12, .12);
        spring(this.rot, lean + c.tilt * this.dir, 210, .38, dt);
      }

      this.stepFeet(dt);
      if (this.mode === 'ground') this.y = S.groundAt(this.x) - STAND + BODY_H * this.q.x + this.sit.x * 28 - this.bob;
      this.stepTuft(dt);
    }

    stepFeet(dt) {
      const S = this.S, spd = Math.abs(this.vx), d = this.fw;
      const lead = clamp(this.vx * .22, -60, 60), thresh = Math.max(16, Math.abs(lead));
      const settle = 1 - clamp(spd / 60);
      this.bob = 0;
      this.feet.forEach((F, i) => {
        const hip = this.hip(i);
        if (this.mode === 'held' && this.heldFeet) {
          const p = this.heldFeet(i); F.state = 'air'; F.x = p.x; F.y = p.y; F.rot = p.rot ?? 0; F.vx = this.vx; F.vy = this.vy;
          return;
        }
        if (this.mode !== 'ground') {
          if (F.state !== 'air') { F.state = 'air'; F.vx = this.vx; F.vy = this.vy; }
          const tx = hip.x - this.vx * .04 + (i ? 6 : -6) * d, ty = hip.y + LEG - 4, k = 260, z = 2 * .5 * Math.sqrt(k);
          F.vx += (k * (tx - F.x) - z * F.vx) * dt; F.vy += (k * (ty - F.y) - z * F.vy) * dt;
          F.x += F.vx * dt; F.y += F.vy * dt;
          F.rot += (d * .35 - F.rot) * Math.min(1, dt * 10);
          return;
        }
        if (F.state === 'air') { F.state = 'swing'; F.s = 0; F.dur = .1; F.fromX = F.x; F.fromY = Math.min(F.y, S.groundAt(F.x)); }
        const stance = (i ? 11 : -11) * d * settle;
        if (F.state === 'planted') {
          F.planted += dt; F.y = S.groundAt(F.x);
          const o = this.feet[1 - i];
          if (Math.abs(hip.x + stance - F.x) > thresh && o.state === 'planted' && o.planted > .05) {
            F.state = 'swing'; F.s = 0; F.fromX = F.x; F.fromY = F.y; F.dur = clamp(.3 - spd * .00045, .13, .3);
          }
        }
        if (F.state === 'swing') {
          F.s = Math.min(1, F.s + dt / F.dur);
          const e = sine(F.s), arc = Math.sin(Math.PI * F.s);
          const lift = clamp(12 + spd * .06, 12, 32) * (F.dur > .1 ? 1 : .4);
          F.toX = hip.x + this.vx * (1 - F.s) * F.dur + lead + stance;
          F.x = lerp(F.fromX, F.toX, e); F.y = lerp(F.fromY, S.groundAt(F.toX), e) - arc * lift;
          F.rot = -d * .45 * arc;
          this.bob += arc * clamp(2.5 + spd * .018, 2.5, 8);
          if (F.s >= 1) {
            F.state = 'planted'; F.planted = 0; F.y = S.groundAt(F.x); F.rot = 0;
            if (F.dur > .1) S.sfx('step', { v: clamp(spd / 450) * .8 + .12, seed: ++this.stepN, gain: this.gain }, F.x);
          }
        }
      });
    }

    stepTuft(dt) {
      const b = this.toWorld(-12 * this.fw, -BODY_H + 1), a = -Math.PI / 2 - .5 * this.fw + this.rot.x;
      const tx = b.x + Math.cos(a) * 30, ty = b.y + Math.sin(a) * 30;
      if (!this.tuft) this.tuft = { x: tx, y: ty, vx: 0, vy: 0 };
      const T = this.tuft, k = 150, z = 2 * .22 * Math.sqrt(k);
      T.vx += (k * (tx - T.x) - z * T.vx) * dt; T.vy += (k * (ty - T.y) - z * T.vy) * dt;
      T.x += T.vx * dt; T.y += T.vy * dt;
      const ox = T.x - b.x, oy = T.y - b.y, dd = Math.hypot(ox, oy) || 1, cd = clamp(dd, 16, 40);
      T.x = b.x + ox / dd * cd; T.y = b.y + oy / dd * cd;
    }
  }

  class Show {
    constructor(story, opts = {}) {
      // hand-drawn line boil is on unless a story turns it off
      this.story = story; this.boil = story.boil ?? true;
      if (opts.loop) { this.T = opts.loop.T; this.startState = opts.loop.startState; } else this.computeLoop();
      this.reset();
    }
    groundAt(x) { return this.story.ground ? this.story.ground(x, this.t ?? 0, this) : GROUND; }
    reset() {
      this.t = 0; this.fired = new Set(); this.fx = []; this.parts = []; this.pn = 0; this.chars = []; this.focus = null; this.capShown = [];
      const listener = this.onSfx; this.onSfx = null;   // no sounds from setup / warm-up
      this.cam = { x: { x: 0, v: 0 }, y: { x: GROUND, v: 0 }, z: { x: 1, v: 0 }, shake: 0 }; this.camGoal = {};
      this.story.init(this);
      this.focus = this.focus || this.chars[0];
      this.cam.x.x = this.focus.x; this.cam.y.x = this.camTargetY();
      if (this.startState) this.applyState(this.startState);
      else this.warm(this.story.warmup ?? 3);
      this.onSfx = listener;
    }
    // seamless loops: the film opens on the exact state it ends on (Bo, feet, hair, camera)
    captureState() {
      const f = this.focus, copy = o => JSON.parse(JSON.stringify(o));
      const keys = ['x', 'y', 'vx', 'vy', 'axs', 'mode', 'bob', 'face', 'q', 'rot', 'lookX', 'lookY', 'sit', 'feet', 'tuft'];
      return { char: Object.fromEntries(keys.map(k => [k, copy(f[k])])), cam: copy(this.cam) };
    }
    applyState(s) {
      const f = this.focus, dx = -s.char.x;
      Object.assign(f, JSON.parse(JSON.stringify(s.char)));
      f.x += dx; f.hx = f.x; if (f.tuft) f.tuft.x += dx;
      for (const F of f.feet) { F.x += dx; F.fromX += dx; F.toX += dx; }
      this.cam = JSON.parse(JSON.stringify(s.cam)); this.cam.x.x += dx;
    }
    // let the opening walk settle into its rhythm, then move the world so Bo is at x = 0
    warm(sec) {
      const n = Math.round(sec / DT);
      for (let i = 0; i < n; i++) { for (const c of this.chars) c.step(DT); this.stepCam(DT); }
      const dx = -this.focus.x;
      for (const c of this.chars) {
        if (c !== this.focus && !c.warmWithFocus) continue;
        c.x += dx; c.hx += dx; if (c.tuft) c.tuft.x += dx;
        for (const F of c.feet) { F.x += dx; F.fromX += dx; F.toX += dx; }
        if (c.cmd.x < 1e5) c.cmd.x += dx;
      }
      this.cam.x.x += dx;
      for (const c of this.chars) c.t = 0;
      this.fx = []; this.parts = [];
    }
    addChar(o) { const c = new Character(this, o); c.seed = this.chars.length * 1.7; this.chars.push(c); return c; }
    once(key, fn) { if (!this.fired.has(key)) { this.fired.add(key); fn(); } }
    plan(c, t, list) {
      list.forEach(([at, v], i) => {
        if (t < at) return;
        if (typeof v === 'function') this.once(`plan${this.chars.indexOf(c)}:${i}`, v);
        else Object.assign(c.cmd, v);
      });
    }
    puff(x, side, size = 1) { this.fx.push({ x, y: this.groundAt(x), side, size, t0: this.t }); }
    // sound events: the player plays them live, the exporter mixes them into the MP4
    sfx(name, p = {}, x) {
      if (!this.onSfx) return;
      const pan = x === undefined ? 0 : clamp((x - this.cam.x.x) / 520, -.7, .7);
      this.onSfx({ t: this.t, name, p, pan });
    }
    // typed captions make a sound as they appear: a soft murmured voice (story.voice = { pitch },
    // or per caption as its 5th item; false = silent); story.voice: false falls back to a muted key click
    captionBlips() {
      (this.story.captions || []).forEach(([a, b, text, , vo], i) => {
        const plain = text.replace(/\*/g, ''), n = this.t < a || this.t > b ? 0 : Math.floor(plain.length * seg(this.t, a, a + Math.min(1.3, plain.length * .055)) + 1e-6);
        const prev = this.capShown[i] ?? 0, ch = plain[n - 1];
        if (n > prev && ch !== ' ') {
          const voice = vo === undefined ? (this.story.voice ?? { pitch: 1 }) : vo;   // everyone murmurs unless a story sets voice: false
          if (voice) { if (n % 2 === 0 || n === plain.length) this.sfx('voice', { k: n + i * 7, ch, pitch: voice.pitch ?? 1, g: voice.g ?? 1, rise: /\?\W*$/.test(plain) && n > plain.length - 4 ? 1 : 0, last: n === plain.length }); }
          else if (vo === undefined) this.sfx('blip', { k: n });
        }
        this.capShown[i] = n;
      });
    }
    shake(a) { this.cam.shake = Math.max(this.cam.shake, a); }
    burst(x, y, n, colors, o = {}) {
      for (let i = 0; i < n; i++) {
        const k = ++this.pn * 1.37, ang = (o.angle ?? -Math.PI / 2) + (hash(k) - .5) * (o.spread ?? Math.PI * 2);
        const sp = (o.speed ?? 320) * (.35 + .65 * hash(k + .3));
        this.parts.push({
          x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, g: o.gravity ?? 900, drag: o.drag ?? 1.6,
          life: (o.life ?? 1) * (.6 + .4 * hash(k + .6)), t0: this.t, c: colors[Math.floor(hash(k + .9) * colors.length)],
          s: (o.size ?? 8) * (.6 + .4 * hash(k + .4)), shape: o.shape ?? 'square',
        });
      }
    }
    camTargetY() { return GROUND + (this.groundAt(this.focus.x) - GROUND) * .75; }
    stepCam(dt) {
      const f = this.focus, g = this.camGoal;
      const tx = g.x ?? f.x + clamp(f.vx * .3, -140, 140);
      spring(this.cam.x, tx, g.kx ?? 6, 1, dt);
      spring(this.cam.y, g.y ?? this.camTargetY(), 5, 1, dt);
      spring(this.cam.z, g.z ?? 1, g.kz ?? 3, 1, dt);
      this.cam.shake *= Math.exp(-dt * 7);
    }
    advance(dt) {
      if (dt <= 0) return;
      const n = Math.ceil(dt / DT - 1e-6), h = dt / n;
      for (let i = 0; i < n; i++) {
        this.camGoal = {};
        this.story.update(this, this.t, h);
        for (const c of this.chars) c.step(h);
        this.stepCam(h);
        for (const p of this.parts) { const dr = Math.exp(-p.drag * h); p.vx *= dr; p.vy = p.vy * dr + p.g * h; p.x += p.vx * h; p.y += p.vy * h; }
        this.t += h;
        if (this.onSfx) this.captionBlips();
      }
      this.fx = this.fx.filter(p => this.t - p.t0 < .6);
      this.parts = this.parts.filter(p => this.t - p.t0 < p.life);
    }
    seek(t) {
      const listener = this.onSfx; this.onSfx = null;
      this.reset(); this.advance(t);
      this.onSfx = () => {}; this.captionBlips();   // catch the typing counters up without sound
      this.onSfx = listener;
    }

    // ---- seamless loop: find the frame (on the 60fps grid) that best matches frame 0 ----
    snapshot() {
      const f = this.focus, g = this.groundAt(f.x), v = [
        f.y - g, f.rot.x * 120, f.q.x * 120, f.vx * .3, f.face.x * 60, f.sit.x * 60, f.lookX.x * 20, f.lookY.x * 20,
        this.cam.x.x - f.x, this.cam.x.v * .3, this.cam.z.x * 300, this.cam.y.x - g,
      ];
      for (const F of f.feet) v.push(F.x - f.x, F.y - this.groundAt(F.x), F.rot * 30);
      if (f.tuft) v.push(f.tuft.x - f.x, f.tuft.y - f.y);
      return v;
    }
    // run the film, take its final state as the opening state, repeat until the
    // ending stops changing (Bo stops during each story, so it settles at once)
    computeLoop() {
      const st = this.story;
      if (!st.loopAfter) { this.T = st.T; return; }
      const T = Math.round(st.loopAfter * 60) / 60;
      this.T = Infinity; this.startState = null;
      for (let i = 0; i < 3; i++) { this.reset(); this.advance(T); this.startState = this.captureState(); }
      this.reset(); const s0 = this.snapshot(); this.advance(T); const s1 = this.snapshot();
      this.loopErr = Math.sqrt(s0.reduce((a, v, k) => a + (v - s1[k]) ** 2, 0));
      this.T = T;
    }
    canBlink() { return this.t > .6 && this.t < this.T - .6; }
    // blinks come at uneven gaps (2.4–4.6 s), and now and then twice in a row, like a living face
    blinking(c) {
      const t = c.t + .9, k = Math.floor(t / 3.4), at = k * 3.4 + hash(k * 1.3 + (c.seed ?? 0)) * 1.8, u = t - at;
      return (u >= 0 && u < .12) || (hash(k + .7) > .72 && u >= .24 && u < .34);
    }

    // ---- rendering ----
    viewFor(cw, ch) {
      const portrait = ch > cw;
      const unit = Math.min(cw / (portrait ? 640 : 1200), ch / 600) * this.cam.z.x;
      const gy = ch * (portrait ? .64 : .7);
      const k = this.t * 31, a = this.cam.shake;
      const sx = (hash(Math.floor(k)) - .5) * 2 * a, sy = (hash(Math.floor(k) + .5) - .5) * 2 * a;
      const cx = this.cam.x.x, cy = this.cam.y.x;
      return {
        portrait, unit, cw, ch, cx, cy, ox: cw / 2 - cx * unit + sx * unit, oy: gy - cy * unit + sy * unit,
        left: cx - cw / 2 / unit, right: cx + cw / 2 / unit, top: cy - gy / unit, bottom: cy + (ch - gy) / unit,
      };
    }
    J(i) { return this.boil ? (hash(i * 3.17 + this.boilFrame * 31.7) - .5) * (this.story.boilAmt ?? 2.0) : 0; }
    ink(ctx) { ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.globalAlpha = 1; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; }

    render(ctx, cw, ch) {
      const st = this.story, t = this.t, v = this.view = this.viewFor(cw, ch);
      this.ctx = ctx; this.boilFrame = Math.floor(t * 12);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      ctx.fillStyle = st.paperAt ? st.paperAt(t, this) : st.paper || PAPER; ctx.fillRect(0, 0, cw, ch);
      ctx.setTransform(v.unit, 0, 0, v.unit, v.ox, v.oy);
      const layer = fn => { if (fn) { this.ink(ctx); fn(this, ctx, t, v); } };
      layer(st.drawSky);
      this.ink(ctx); this.drawGround(ctx, v);
      layer(st.drawBack);
      this.ink(ctx); for (const c of this.chars) if (!c.hidden) this.drawChar(ctx, c);
      layer(st.drawFront);
      this.ink(ctx); this.drawFx(ctx); this.drawParts(ctx);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      layer(st.drawOverlay);
      this.ink(ctx); this.drawCaptions(ctx, cw, ch);
    }

    drawGround(ctx, v) {
      ctx.lineWidth = 6; ctx.beginPath();
      // stories can stand things on the ground (a bed) without bending the drawn line
      const line = this.story.lineAt ? x => this.story.lineAt(x, this.t, this) : x => this.groundAt(x);
      const a = v.left - 20, b = v.right + 20, step = this.story.ground ? 10 : 80;
      for (let x = a, i = 0; x <= b + step; x += step, i++) {
        const y = line(x) + 4 + this.J(600 + i) * .35;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }

    drawChar(ctx, c) {
      c.feet.forEach((F, i) => this.drawLeg(ctx, c, c.hip(i), F, i));
      const b = c.toWorld(-12 * c.fw, -BODY_H + 1), T = c.tuft;
      if (T) {
        const ox = T.x - b.x, oy = T.y - b.y; ctx.lineWidth = 5; ctx.strokeStyle = c.hairColor;
        const hairs = c.hair === 'curl' || c.hair === 'antenna' ? [[0, 1]] : [[-.38, .72], [0, 1], [.38, .72]];
        for (const [ang, sc] of hairs) {
          const ca = Math.cos(ang), sa = Math.sin(ang);
          const ex = b.x + (ox * ca - oy * sa) * sc, ey = b.y + (ox * sa + oy * ca) * sc;
          ctx.beginPath(); ctx.moveTo(b.x, b.y);
          ctx.quadraticCurveTo((b.x + ex) / 2 - oy * .12 * c.fw, (b.y + ey) / 2 + ox * .12 * c.fw, ex, ey);
          ctx.stroke();
          if (c.hair === 'curl') { ctx.beginPath(); ctx.arc(ex - 6 * c.fw, ey, 6, 0, Math.PI * 2); ctx.stroke(); }
          if (c.hair === 'antenna') { ctx.fillStyle = c.hairColor; ctx.beginPath(); ctx.arc(ex, ey, 7, 0, Math.PI * 2); ctx.fill(); }
        }
        ctx.strokeStyle = INK;
      }
      const pts = shapeAt(c.fw).map(([x, y], i) => { const w = c.toWorld(x, y); return [w.x + this.J(i), w.y + this.J(i + 50)]; });
      const n = pts.length, mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], m0 = mid(pts[n - 1], pts[0]);
      ctx.beginPath(); ctx.moveTo(m0[0], m0[1]);
      for (let i = 0; i < n; i++) { const m = mid(pts[i], pts[(i + 1) % n]); ctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); }
      ctx.closePath(); ctx.fillStyle = c.fill; ctx.fill(); ctx.lineWidth = 6; ctx.stroke(); ctx.fillStyle = INK;
      if (c.blush) {
        const bl = c.toWorld(40 * c.fw, 4);
        ctx.fillStyle = c.blush; ctx.globalAlpha = .85;
        ctx.beginPath(); ctx.ellipse(bl.x, bl.y, 9, 5, c.rot.x, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.fillStyle = INK;
      }
      this.drawEye(ctx, c);
    }

    drawLeg(ctx, c, h, F, i) {
      const ax = F.x, ay = F.y - 10, dx = ax - h.x, dy = ay - h.y, d = Math.hypot(dx, dy) || 1;
      const bend = (Math.sqrt(Math.max(0, LEG * LEG - d * d)) * .55 + 4) * c.fw;
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(h.x, h.y);
      ctx.quadraticCurveTo((h.x + ax) / 2 - dy / d * bend + this.J(100 + i), (h.y + ay) / 2 + dx / d * bend + this.J(110 + i), ax, ay);
      ctx.stroke();
      ctx.save(); ctx.translate(F.x + 5 * c.fw, F.y - 9); ctx.rotate(F.rot);
      ctx.beginPath(); ctx.ellipse(0, 0, 17, 10.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }

    drawEye(ctx, c) {
      const e = c.toWorld(32 * c.fw, -20);
      ctx.save(); ctx.translate(e.x + this.J(300) * .3, e.y + this.J(301) * .3); ctx.rotate(c.rot.x); ctx.scale(c.dir, 1);
      ctx.lineWidth = 4.5;
      let state = c.cmd.eye;
      if (state === 'open' && this.canBlink() && this.blinking(c)) state = 'blink';
      const px = clamp(1.5 + c.lookX.x * 4, -5, 5.5) * Math.abs(c.fw), py = clamp(c.lookY.x * 4.5, -5, 5);
      const ball = (r, pr, ox, oy) => {
        ctx.fillStyle = PAPER; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ox, oy, pr, 0, Math.PI * 2); ctx.fill();
      };
      const lid = y => {
        ctx.save(); ctx.beginPath(); ctx.rect(-20, y, 40, 30); ctx.clip(); ball(11, 4.5, px, Math.max(y + 5, py)); ctx.restore();
        ctx.beginPath(); ctx.moveTo(-12, y); ctx.lineTo(12, y); ctx.stroke();
      };
      if (state === 'open') ball(11, 4.5, px, py);
      else if (state === 'wide') ball(14, 3.5, px * .8, py * .8);
      else if (state === 'sad') lid(-3);
      else if (state === 'flat') lid(1.5);
      else if (state === 'blink') { ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke(); }
      else if (state === 'closed') { ctx.beginPath(); ctx.arc(0, -3, 10, Math.PI * .15, Math.PI * .85); ctx.stroke(); }
      else if (state === 'happy') { ctx.beginPath(); ctx.arc(0, 6, 10, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
      else if (state === 'squeeze') { ctx.beginPath(); ctx.moveTo(-7, -8); ctx.lineTo(6, 0); ctx.lineTo(-7, 8); ctx.stroke(); }
      else if (state === 'heart') { const p = 1 + .12 * Math.sin(c.t * 14); sprite(ctx, SPRITES.heart, 0, 0, 3.6 * p, { X: PAL.pink }); }
      else if (state === 'dizzy') {
        ctx.rotate(c.t * 7); ctx.lineWidth = 3.5; ctx.beginPath();
        for (let a = 0; a < Math.PI * 4; a += .2) a ? ctx.lineTo(Math.cos(a) * a, Math.sin(a) * a) : ctx.moveTo(0, 0);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawFx(ctx) {
      for (const p of this.fx) {
        const u = (this.t - p.t0) / .55, e = outCubic(u);
        ctx.lineWidth = (3.5 * (1 - u) + .5) * p.size;
        for (let j = 0; j < 3; j++) {
          ctx.beginPath();
          ctx.arc(p.x + p.side * (34 + j * 16 + 60 * e) * p.size, p.y - 8 - j * 5 - 14 * u, (5 + j * 2) * (1 - u * .5) * p.size, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
    drawParts(ctx) {
      for (const p of this.parts) {
        const u = (this.t - p.t0) / p.life; ctx.globalAlpha = 1 - u * u; ctx.fillStyle = p.c;
        if (p.shape === 'heart') sprite(ctx, SPRITES.heart, p.x, p.y, p.s / 7, { X: p.c });
        else ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
      }
      ctx.globalAlpha = 1;
    }

    drawCaptions(ctx, cw, ch) {
      const caps = this.story.captions || [], t = this.t, portrait = ch > cw;
      const fs = Math.round(Math.min(cw, ch) * (portrait ? .05 : .04));
      ctx.font = `${fs}px ${FONT}`; ctx.textBaseline = 'middle';
      for (const [a, b, text, color] of caps) {
        if (t < a || t > b) continue;
        const plain = text.replace(/\*/g, ''), typeDur = Math.min(1.3, plain.length * .055);
        const shown = Math.floor(plain.length * seg(t, a, a + typeDur) + 1e-6);
        const out = sine(seg(t, b - .5, b)), alpha = 1 - out;
        // word-wrap, then lay out each run of text with its colour
        const words = text.split(' '), lines = [[]]; let w = 0;
        const space = ctx.measureText(' ').width, maxW = cw * .82;
        for (const word of words) {
          const ww = ctx.measureText(word.replace(/\*/g, '')).width;
          if (w > 0 && w + space + ww > maxW) { lines.push([]); w = 0; }
          lines[lines.length - 1].push(word); w += (w > 0 ? space : 0) + ww;
        }
        const lh = fs * 1.5, y0 = ch * (portrait ? .15 : .12) - (lines.length - 1) * lh / 2 - out * fs * .5;
        let idx = 0, cursor = null;
        ctx.globalAlpha = alpha;
        lines.forEach((ln, li) => {
          const full = ln.join(' ').replace(/\*/g, ''), lw = ctx.measureText(full).width;
          let x = cw / 2 - lw / 2; const y = y0 + li * lh;
          let accent = false;
          ln.forEach((word, wi) => {
            const parts = (wi ? ' ' : '') + word;
            for (const chr of parts) {
              if (chr === '*') { accent = !accent; continue; }
              if (idx >= shown) { if (!cursor) cursor = [x, y]; idx++; continue; }
              ctx.fillStyle = accent ? (color || this.story.accent || PAL.blue) : INK;
              ctx.fillText(chr, x, y); x += ctx.measureText(chr).width; idx++;
            }
          });
          if (!cursor && li === lines.length - 1) cursor = [x, y];
        });
        const typing = shown < plain.length, blinkOn = ((t - a) % .7) < .4;
        if (cursor && (typing || (blinkOn && t < b - .5))) {
          ctx.fillStyle = color || this.story.accent || PAL.blue;
          ctx.fillRect(cursor[0] + fs * .15, cursor[1] - fs * .45, fs * .5, fs * .9);
        }
        ctx.globalAlpha = 1;
      }
    }
  }

  // ---------------- page + export ----------------
  const CSS = `
  :root { --paper:#fbfbf8; --ink:#111; --muted:#8a8a84; --line:#e3e3dd; }
  * { box-sizing: border-box; }
  html, body { height: 100%; }
  body { margin:0; background:var(--paper); color:var(--ink); font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;
         display:flex; flex-direction:column; overflow:hidden; }
  .top { display:flex; align-items:center; gap:14px; padding:12px 16px 8px; }
  .top a { color:var(--muted); text-decoration:none; } .top a:hover { color:var(--ink); }
  .top h1 { font: 16px ${FONT}; margin:0; letter-spacing:.02em; }
  .stage { flex:1; min-height:0; position:relative; margin:0 16px; }
  .stage canvas { position:absolute; background:#fff; border:1px solid var(--line); border-radius:6px; touch-action:manipulation; }
  .bar { padding:10px 16px calc(12px + env(safe-area-inset-bottom)); display:flex; flex-wrap:wrap; align-items:center; gap:8px 12px; }
  .bar .grow { flex:1 1 160px; display:flex; align-items:center; gap:10px; min-width:160px; }
  button, select { font:inherit; border:2px solid var(--ink); background:#fff; color:var(--ink); border-radius:999px; padding:6px 12px; cursor:pointer; }
  button:hover { background:var(--ink); color:#fff; } button:disabled { opacity:.45; cursor:default; background:#fff; color:var(--ink); }
  button.primary { background:var(--ink); color:#fff; }
  input[type=range] { flex:1; min-width:100px; accent-color:var(--ink); }
  .time { font-variant-numeric:tabular-nums; color:var(--muted); white-space:nowrap; }
  .exporting { position:fixed; inset:0; background:rgba(251,251,248,.92); display:none; place-items:center; z-index:9; }
  .exporting.on { display:grid; }
  .exporting .box { width:min(360px, calc(100vw - 32px)); text-align:center; }
  .exporting .meter { height:10px; border:2px solid var(--ink); border-radius:999px; overflow:hidden; margin:14px 0; }
  .exporting .meter i { display:block; height:100%; width:0; background:var(--ink); }
  @media (max-width: 600px) { .top { padding:10px 12px 6px; } .stage { margin:0 8px; } .bar { padding-left:12px; padding-right:12px; } .hide-sm { display:none; } }`;

  let muxerReady = null;
  const loadMuxer = () => muxerReady ??= new Promise((res, rej) => {
    if (window.Mp4Muxer) return res();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/build/mp4-muxer.min.js';
    s.onload = res; s.onerror = () => { muxerReady = null; rej(new Error('Could not load the MP4 muxer (needs an internet connection).')); };
    document.head.appendChild(s);
  });

  async function exportMP4(story, loop, { w, h, fps, loops }, onProgress) {
    if (!('VideoEncoder' in window)) throw new Error('This browser cannot encode MP4. Use Chrome or Edge on a laptop.');
    await loadMuxer();
    await document.fonts.load(`40px Silkscreen`).catch(() => {});
    const bitrate = Math.round(w * h * fps * .14);
    let codec = null;
    for (const c of ['avc1.640034', 'avc1.640033', 'avc1.4d0034', 'avc1.42003e']) {
      const r = await VideoEncoder.isConfigSupported({ codec: c, width: w, height: h, bitrate, framerate: fps }).catch(() => null);
      if (r && r.supported) { codec = c; break; }
    }
    if (!codec) throw new Error('No H.264 encoder available for this size.');

    // soundtrack: collect the film's sound events, mix them offline into one seamless loop
    let audio = null;
    const AAC = { codec: 'mp4a.40.2', sampleRate: 48000, numberOfChannels: 2, bitrate: 192000 };
    if (window.SFX && 'AudioEncoder' in window && (await AudioEncoder.isConfigSupported(AAC).catch(() => ({}))).supported) {
      const events = [], A = new Show(story, { loop });
      A.onSfx = e => events.push(e);
      for (let i = 0, n = Math.round(loop.T * fps); i < n; i++) A.advance(1 / fps);
      audio = await SFX.renderLoop(events, loop.T, AAC.sampleRate);
      let peak = 0; for (const c of audio.ch) for (const v of c) peak = Math.max(peak, Math.abs(v));
      // normalise every short to the same peak so they sound equally loud on social
      if (peak > 0) for (const c of audio.ch) for (let i = 0; i < c.length; i++) c[i] *= .89 / peak;
    }

    const target = new Mp4Muxer.ArrayBufferTarget();
    const muxer = new Mp4Muxer.Muxer({
      target, fastStart: 'in-memory',
      video: { codec: 'avc', width: w, height: h, frameRate: fps },
      ...(audio ? { audio: { codec: 'aac', numberOfChannels: 2, sampleRate: AAC.sampleRate } } : {}),
    });
    let failure = null;
    if (audio) {
      const aenc = new AudioEncoder({ output: (c, m) => muxer.addAudioChunk(c, m), error: e => failure = e });
      aenc.configure(AAC);
      const { ch, sr, N } = audio, total = N * loops, CH = 4800;
      for (let s = 0; s < total; s += CH) {
        const n = Math.min(CH, total - s), data = new Float32Array(n * 2);
        for (let i = 0; i < n; i++) { const k = (s + i) % N; data[i] = ch[0][k]; data[n + i] = ch[1][k]; }
        const ad = new AudioData({ format: 'f32-planar', sampleRate: sr, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round(s / sr * 1e6), data });
        aenc.encode(ad); ad.close();
      }
      await aenc.flush(); aenc.close();
    }
    const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: e => failure = e });
    enc.configure({ codec, width: w, height: h, bitrate, framerate: fps, latencyMode: 'quality', avc: { format: 'avc' } });
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d');
    const S = new Show(story, { loop });
    const perLoop = Math.round(loop.T * fps), total = perLoop * loops;
    for (let i = 0; i < total; i++) {
      if (failure) throw failure;
      if (i % perLoop === 0) S.reset(); else S.advance(1 / fps);
      S.render(ctx, w, h);
      const frame = new VideoFrame(cv, { timestamp: Math.round(i * 1e6 / fps), duration: Math.round(1e6 / fps) });
      enc.encode(frame, { keyFrame: i % (fps * 2) === 0 }); frame.close();
      while (enc.encodeQueueSize > 6) await new Promise(r => setTimeout(r, 2));
      if (i % 15 === 0) { onProgress(i / total); await new Promise(r => setTimeout(r)); }
    }
    await enc.flush(); muxer.finalize(); enc.close();
    onProgress(1);
    return new Blob([target.buffer], { type: 'video/mp4' });
  }

  function play(story) {
    document.title = story.title;
    const fl = document.createElement('link'); fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Silkscreen&display=swap'; document.head.appendChild(fl);
    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', `
      <header class="top"><a href="index.html">&larr; All shorts</a><h1>${story.title}</h1></header>
      <div class="stage"><canvas></canvas></div>
      <div class="bar">
        <button data-k="play">Pause</button>
        <button data-k="snd">Tap for sound</button>
        <div class="grow"><input data-k="scrub" type="range" min="0" max="1000" value="0" aria-label="Timeline"><span class="time" data-k="time"></span></div>
        <select data-k="frame" aria-label="Frame">
          <option value="fit">Fit screen</option><option value="9:16" selected>9:16 Shorts</option><option value="16:9">16:9</option><option value="1:1">1:1</option>
        </select>
        <select data-k="speed" class="hide-sm" aria-label="Speed"><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1" selected>1×</option></select>
        <select data-k="out" aria-label="Export size">
          <option value="1080x1920">MP4 1080×1920</option><option value="1920x1080">MP4 1920×1080</option><option value="1080x1080">MP4 1080×1080</option>
        </select>
        <button data-k="export" class="primary">Export MP4</button>
      </div>
      <div class="exporting" data-k="dlg"><div class="box"><b>Rendering MP4…</b><div class="meter"><i data-k="bar"></i></div><span data-k="pct">0%</span></div></div>`);
    const $ = k => document.querySelector(`[data-k="${k}"]`);
    const stage = document.querySelector('.stage'), cv = stage.querySelector('canvas'), ctx = cv.getContext('2d');
    const S = new Show(story);
    console.log(`[${story.title}] loop T=${S.T.toFixed(3)}s, seam error ${S.loopErr?.toFixed(2) ?? 'n/a'}`);

    let mode = window.matchMedia('(max-width: 600px)').matches ? 'fit' : '9:16';
    $('frame').value = mode;
    let cssW = 0, cssH = 0;
    const layout = () => {
      const r = stage.getBoundingClientRect(), ratio = { '9:16': 9 / 16, '16:9': 16 / 9, '1:1': 1 }[mode];
      let w = r.width, h = r.height;
      if (ratio) { if (w / h > ratio) w = h * ratio; else h = w / ratio; }
      cssW = Math.floor(w); cssH = Math.floor(h);
      Object.assign(cv.style, { width: cssW + 'px', height: cssH + 'px', left: (r.width - cssW) / 2 + 'px', top: (r.height - cssH) / 2 + 'px' });
      const d = Math.min(2.5, window.devicePixelRatio || 1);
      cv.width = Math.round(cssW * d); cv.height = Math.round(cssH * d);
    };
    addEventListener('resize', layout); layout();
    $('frame').onchange = e => { mode = e.target.value; layout(); };

    let playing = true, speed = 1, last = performance.now(), busy = false;
    // sound: browsers only allow audio after a tap/click, so the first interaction unlocks it
    let actx = null, soundOn = true;
    const sndLabel = () => $('snd').textContent = !actx || actx.state !== 'running' ? 'Tap for sound' : soundOn ? 'Sound: on' : 'Sound: off';
    const unlock = () => {
      if (!window.SFX) return;
      if (!actx) actx = new AudioContext({ latencyHint: 'interactive' });
      if (actx.state !== 'running') actx.resume().then(sndLabel);
      sndLabel();
    };
    addEventListener('pointerdown', unlock, { capture: true });
    addEventListener('keydown', unlock, { capture: true });
    $('snd').onclick = () => { if (actx && actx.state === 'running' && $('snd').textContent !== 'Tap for sound') soundOn = !soundOn; setTimeout(sndLabel, 30); };
    S.onSfx = ev => { if (soundOn && actx && actx.state === 'running' && playing && !busy && speed === 1) SFX.play(actx, ev, actx.currentTime + .02); };
    if (!window.SFX) $('snd').style.display = 'none';
    function frame(now) {
      const dt = Math.min(.05, (now - last) / 1000) * (playing && !busy ? speed : 0); last = now;
      if (dt > 0) { if (S.t + dt >= S.T) S.reset(); else S.advance(dt); }
      S.render(ctx, cv.width, cv.height);
      $('scrub').value = Math.round(S.t / S.T * 1000);
      $('time').textContent = `${S.t.toFixed(1)} / ${S.T.toFixed(1)}s`;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    $('play').onclick = () => { playing = !playing; $('play').textContent = playing ? 'Pause' : 'Play'; };
    cv.onclick = () => $('play').click();
    $('scrub').oninput = e => S.seek(e.target.value / 1000 * S.T);
    $('speed').onchange = e => speed = +e.target.value;
    $('export').onclick = async () => {
      const [w, h] = $('out').value.split('x').map(Number);
      busy = true; $('dlg').classList.add('on'); $('export').disabled = true;
      try {
        const blob = await exportMP4(story, { T: S.T, startState: S.startState }, { w, h, fps: 60, loops: 1 }, p => {
          $('bar').style.width = (p * 100).toFixed(1) + '%'; $('pct').textContent = Math.round(p * 100) + '%';
        });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
        a.download = `${story.title.toLowerCase().replace(/\s+/g, '-')}-${w}x${h}.mp4`; a.click();
      } catch (err) { alert(err.message || err); }
      busy = false; $('dlg').classList.remove('on'); $('export').disabled = false;
    };
    window.show = S;
  }

  window.Shorts = {
    play, exportMP4, Show, GROUND, STAND, BODY_H, GRAV, INK, PAPER, PAL, SPRITES, sprite, zzz, ramp,
    clamp, lerp, seg, sine, outCubic, inCubic, outBack, hash, spring, mix,
  };
})();
