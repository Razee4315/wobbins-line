/* engine.js — shared character rig, physics and player for the line shorts.
   Nothing is keyframed directly: stories give the character goals (walk to x,
   crouch, look, jump) and springs + simple physics produce the motion. The
   whole show is simulated in small steps from t = 0, so scrubbing is
   deterministic and every movement stays continuous. */
(function () {
  const W = 1600, H = 800, GROUND = 620;
  const BODY_H = 60, HIP_Y = 44, LEG = 66;
  const STAND_Y = GROUND - 10 - 58 - HIP_Y;   // body centre when standing
  const GRAV = 2600, DT = 1 / 240, INK = '#111';

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const sine = k => -(Math.cos(Math.PI * k) - 1) / 2;
  const outCubic = k => 1 - Math.pow(1 - k, 3);
  const outBack = k => { const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  // damped spring on {x, v}; z < 1 wobbles, z = 1 settles without overshoot
  function spring(s, target, k, z, dt) {
    s.v += (k * (target - s.x) - 2 * z * Math.sqrt(k) * s.v) * dt;
    s.x += s.v * dt;
  }

  // body outline in local space (facing right): a bean with a soft forehead bump up-front
  const N_SHAPE = 44;
  const SHAPE = Array.from({ length: N_SHAPE }, (_, i) => {
    const th = i / N_SHAPE * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
    const bump = 10 * Math.pow(Math.max(0, Math.cos(th + .85)), 3);
    return [(72 + bump) * c * (1 + .08 * s), (60 + bump) * s];
  });
  // turning morphs towards the mirrored outline point by point (same angle),
  // so the forehead slides round the body instead of the body flipping
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
      this.S = S;
      this.x = o.x ?? -120; this.y = STAND_Y; this.vx = 0; this.vy = 0; this.axs = 0;
      this.mode = 'ground'; this.t = 0; this.lastPuff = -1;
      this.face = { x: f, v: 0 }; this.q = { x: 0, v: 0 }; this.rot = { x: 0, v: 0 };
      this.lookX = { x: 0, v: 0 }; this.lookY = { x: 0, v: 0 }; this.sit = { x: 0, v: 0 }; this.bob = 0;
      this.cmd = { x: this.x, speed: 140, accel: 700, face: f, crouch: 0, sit: 0, tilt: 0, lookX: 0, lookY: 0, eye: 'open' };
      this.feet = [0, 1].map(i => ({
        x: this.x + (i ? 11 : -11) * f, y: GROUND, vx: 0, vy: 0, rot: 0,
        state: 'planted', planted: 1, s: 0, dur: .3, fromX: 0, fromY: GROUND, toX: 0,
      }));
      this.tuft = null;
    }
    get dir() { return this.face.x >= 0 ? 1 : -1; }
    // continuous facing in [-1, 1]; features placed with it pass smoothly through 0 mid-turn
    get fw() { return clamp(this.face.x, -1, 1); }
    toWorld(lx, ly) {
      const q = this.q.x, sx = 1 + q * .7, sy = 1 - q;
      const x = lx * sx, y = ly * sy, c = Math.cos(this.rot.x), s = Math.sin(this.rot.x);
      return { x: this.x + x * c - y * s, y: this.y + x * s + y * c };
    }
    hip(i) { return this.toWorld((i ? 9 : -9) * this.fw, HIP_Y); }
    top() { return this.toWorld(0, -BODY_H); }
    jump(vx, vy) { this.mode = 'air'; this.vx = vx; this.vy = vy; this.q.v -= 2.5; }

    step(dt) {
      const c = this.cmd; this.t += dt;
      spring(this.face, c.face, 320, 1, dt);
      spring(this.lookX, c.lookX, 240, .9, dt);
      spring(this.lookY, c.lookY, 240, .9, dt);
      spring(this.sit, this.mode === 'ground' ? c.sit : 0, 120, .7, dt);
      const pvx = this.vx;

      if (this.mode === 'ground') {
        const dx = c.x - this.x;
        if (Math.abs(dx) < .8 && Math.abs(this.vx) < c.accel * dt * 2) this.vx = 0;
        else {
          const want = Math.sign(dx) * Math.min(c.speed, Math.sqrt(2 * c.accel * Math.abs(dx)));
          this.vx += clamp(want - this.vx, -c.accel * dt, c.accel * dt);
        }
        this.x += this.vx * dt;
        spring(this.q, c.crouch, 340, .3, dt);
      } else {
        this.vy += GRAV * dt; this.x += this.vx * dt; this.y += this.vy * dt;
        spring(this.q, -clamp(Math.abs(this.vy) / 2800, 0, .13), 340, .45, dt);
        if (this.vy > 0 && this.y >= STAND_Y + BODY_H * this.q.x) {
          this.mode = 'ground'; this.q.v += this.vy * .004; this.vy = 0; this.landedAt = this.t;
          this.S.puff(this.x, -1); this.S.puff(this.x, 1);
        }
      }

      this.axs += ((this.vx - pvx) / dt - this.axs) * Math.min(1, dt * 14);
      const braking = this.axs * this.vx < 0 && Math.abs(this.axs) > 900 && Math.abs(this.vx) > 140;
      if (this.mode === 'ground' && braking && this.t - this.lastPuff > .07) {
        this.lastPuff = this.t; this.S.puff(this.x + Math.sign(this.vx) * 30, Math.sign(this.vx), .7);
      }

      // lean into speed; braking tips the body forward (inertia), speeding up drags it back
      const lean = this.mode === 'ground'
        ? clamp(this.vx * .00045, -.17, .17) - clamp(this.axs * .0001, -.18, .18)
        : clamp(this.vx * .0003, -.12, .12);
      spring(this.rot, lean + c.tilt * this.dir, 210, .38, dt);

      this.stepFeet(dt);
      // sit lowers the body on bent knees; crouch squashes it
      if (this.mode === 'ground') this.y = STAND_Y + BODY_H * this.q.x + this.sit.x * 28 - this.bob;
      this.stepTuft(dt);
    }

    // procedural stepping: a planted foot stays put until the hip drifts too far,
    // then it swings to where the hip will be when it lands
    stepFeet(dt) {
      const spd = Math.abs(this.vx), d = this.fw;
      const lead = clamp(this.vx * .22, -60, 60), thresh = Math.max(16, Math.abs(lead));
      const settle = 1 - clamp(spd / 60);
      this.bob = 0;
      this.feet.forEach((F, i) => {
        const hip = this.hip(i);
        if (this.mode === 'air') {
          if (F.state !== 'air') { F.state = 'air'; F.vx = this.vx; F.vy = this.vy; }
          const tx = hip.x - this.vx * .04 + (i ? 6 : -6) * d, ty = hip.y + LEG - 4, k = 260, z = 2 * .5 * Math.sqrt(k);
          F.vx += (k * (tx - F.x) - z * F.vx) * dt; F.vy += (k * (ty - F.y) - z * F.vy) * dt;
          F.x += F.vx * dt; F.y += F.vy * dt;
          F.rot += (d * .35 - F.rot) * Math.min(1, dt * 10);
          return;
        }
        if (F.state === 'air') { F.state = 'swing'; F.s = 0; F.dur = .1; F.fromX = F.x; F.fromY = Math.min(F.y, GROUND); }
        const stance = (i ? 11 : -11) * d * settle;
        if (F.state === 'planted') {
          F.planted += dt;
          const o = this.feet[1 - i];
          if (Math.abs(hip.x + stance - F.x) > thresh && o.state === 'planted' && o.planted > .05) {
            F.state = 'swing'; F.s = 0; F.fromX = F.x; F.fromY = GROUND; F.dur = clamp(.3 - spd * .00045, .13, .3);
          }
        }
        if (F.state === 'swing') {
          F.s = Math.min(1, F.s + dt / F.dur);
          const e = sine(F.s), arc = Math.sin(Math.PI * F.s);
          const lift = clamp(12 + spd * .06, 12, 32) * (F.dur > .1 ? 1 : .4);
          F.toX = hip.x + this.vx * (1 - F.s) * F.dur + lead + stance;
          F.x = lerp(F.fromX, F.toX, e); F.y = lerp(F.fromY, GROUND, e) - arc * lift;
          F.rot = -d * .45 * arc;
          this.bob += arc * clamp(2.5 + spd * .018, 2.5, 8);
          if (F.s >= 1) { F.state = 'planted'; F.planted = 0; F.y = GROUND; F.rot = 0; }
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
    constructor(story, canvas) {
      this.story = story; this.cv = canvas; this.ctx = canvas.getContext('2d'); this.boil = false;
      this.reset();
    }
    reset() {
      this.t = 0; this.fired = new Set(); this.fx = []; this.ground = [[-60, W + 60]]; this.chars = [];
      this.story.init(this);
    }
    addChar(o) { const c = new Character(this, o); this.chars.push(c); return c; }
    once(key, fn) { if (!this.fired.has(key)) { this.fired.add(key); fn(); } }
    // list of [time, cmdPatch | fn]: patches apply cumulatively, functions fire once
    plan(c, t, list) {
      list.forEach(([at, v], i) => {
        if (t < at) return;
        if (typeof v === 'function') this.once(`plan${this.chars.indexOf(c)}:${i}`, v);
        else Object.assign(c.cmd, v);
      });
    }
    puff(x, side, size = 1) { this.fx.push({ x, side, size, t0: this.t }); }
    advance(dt) {
      if (dt <= 0) return;
      const n = Math.ceil(dt / DT - 1e-6), h = dt / n;
      for (let i = 0; i < n; i++) {
        this.story.update(this, this.t, h);
        for (const c of this.chars) c.step(h);
        this.t += h;
      }
      this.fx = this.fx.filter(p => this.t - p.t0 < .6);
    }
    seek(t) { this.reset(); this.advance(t); }

    J(i) { return this.boil ? (hash(i * 3.17 + this.boilFrame * 31.7) - .5) * 2.4 : 0; }
    ink() { const c = this.ctx; c.strokeStyle = INK; c.fillStyle = INK; c.globalAlpha = 1; c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round'; }

    render() {
      const { ctx, cv, story } = this, t = this.t;
      this.boilFrame = Math.floor(t * 12);
      ctx.setTransform(cv.width / W, 0, 0, cv.height / H, 0, 0);
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
      this.ink(); if (story.drawBack) { story.drawBack(this, ctx, t); this.ink(); }
      this.drawGround();
      if (story.drawMid) { story.drawMid(this, ctx, t); this.ink(); }
      for (const c of this.chars) this.drawChar(c);
      if (story.drawFront) { story.drawFront(this, ctx, t); this.ink(); }
      this.drawFx();
    }

    drawGround() {
      const ctx = this.ctx; ctx.lineWidth = 6;
      this.ground.forEach(([a, b], k) => {
        if (b - a < 1) return;
        const n = Math.max(1, Math.round((b - a) / 80));
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const x = lerp(a, b, i / n), y = GROUND + 4 + this.J(600 + k * 40 + i) * .35;
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      });
    }

    drawChar(c) {
      const ctx = this.ctx;
      c.feet.forEach((F, i) => this.drawLeg(c, c.hip(i), F, i));
      const b = c.toWorld(-12 * c.fw, -BODY_H + 1), T = c.tuft;
      if (T) {
        const ox = T.x - b.x, oy = T.y - b.y; ctx.lineWidth = 5;
        for (const [ang, sc] of [[-.38, .72], [0, 1], [.38, .72]]) {
          const ca = Math.cos(ang), sa = Math.sin(ang);
          const ex = b.x + (ox * ca - oy * sa) * sc, ey = b.y + (ox * sa + oy * ca) * sc;
          ctx.beginPath(); ctx.moveTo(b.x, b.y);
          ctx.quadraticCurveTo((b.x + ex) / 2 - oy * .12 * c.fw, (b.y + ey) / 2 + ox * .12 * c.fw, ex, ey);
          ctx.stroke();
        }
      }
      const pts = shapeAt(c.fw).map(([x, y], i) => { const w = c.toWorld(x, y); return [w.x + this.J(i), w.y + this.J(i + 50)]; });
      const n = pts.length, mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], m0 = mid(pts[n - 1], pts[0]);
      ctx.beginPath(); ctx.moveTo(m0[0], m0[1]);
      for (let i = 0; i < n; i++) { const m = mid(pts[i], pts[(i + 1) % n]); ctx.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); }
      ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 6; ctx.stroke(); ctx.fillStyle = INK;
      this.drawEye(c);
    }

    drawLeg(c, h, F, i) {
      const ctx = this.ctx, ax = F.x, ay = F.y - 10, dx = ax - h.x, dy = ay - h.y, d = Math.hypot(dx, dy) || 1;
      const bend = (Math.sqrt(Math.max(0, LEG * LEG - d * d)) * .55 + 4) * c.fw;
      ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(h.x, h.y);
      ctx.quadraticCurveTo((h.x + ax) / 2 - dy / d * bend + this.J(100 + i), (h.y + ay) / 2 + dx / d * bend + this.J(110 + i), ax, ay);
      ctx.stroke();
      ctx.save(); ctx.translate(F.x + 5 * c.fw, F.y - 9); ctx.rotate(F.rot);
      ctx.beginPath(); ctx.ellipse(0, 0, 17, 10.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }

    drawEye(c) {
      // the eye rides round with the facing, front-on (x = 0) mid-turn
      const ctx = this.ctx, e = c.toWorld(32 * c.fw, -20);
      ctx.save(); ctx.translate(e.x + this.J(300) * .3, e.y + this.J(301) * .3); ctx.rotate(c.rot.x); ctx.scale(c.dir, 1);
      ctx.lineWidth = 4.5;
      let state = c.cmd.eye;
      if (state === 'open' && ((c.t + .9) % 3.7) < .13) state = 'blink';
      const px = clamp(1.5 + c.lookX.x * 4, -5, 5.5) * Math.abs(c.fw), py = clamp(c.lookY.x * 4.5, -5, 5);
      const ball = (r, pr, ox, oy) => {
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(ox, oy, pr, 0, Math.PI * 2); ctx.fill();
      };
      if (state === 'open') ball(11, 4.5, px, py);
      else if (state === 'wide') ball(14, 3.5, px * .8, py * .8);
      else if (state === 'sad') {
        ctx.save(); ctx.beginPath(); ctx.rect(-20, -3, 40, 30); ctx.clip(); ball(11, 4.5, px, Math.max(2, py)); ctx.restore();
        ctx.beginPath(); ctx.moveTo(-12, -3); ctx.lineTo(12, -3); ctx.stroke();
      } else if (state === 'blink') { ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke(); }
      else if (state === 'closed') { ctx.beginPath(); ctx.arc(0, -3, 10, Math.PI * .15, Math.PI * .85); ctx.stroke(); }
      else if (state === 'happy') { ctx.beginPath(); ctx.arc(0, 6, 10, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
      else if (state === 'squeeze') { ctx.beginPath(); ctx.moveTo(-7, -8); ctx.lineTo(6, 0); ctx.lineTo(-7, 8); ctx.stroke(); }
      else if (state === 'dizzy') {
        ctx.rotate(c.t * 7); ctx.lineWidth = 3.5; ctx.beginPath();
        for (let a = 0; a < Math.PI * 4; a += .2) a ? ctx.lineTo(Math.cos(a) * a, Math.sin(a) * a) : ctx.moveTo(0, 0);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawFx() {
      const ctx = this.ctx;
      for (const p of this.fx) {
        const u = (this.t - p.t0) / .55, e = outCubic(u);
        ctx.lineWidth = (3.5 * (1 - u) + .5) * p.size;
        for (let j = 0; j < 3; j++) {
          ctx.beginPath();
          ctx.arc(p.x + p.side * (34 + j * 16 + 60 * e) * p.size, GROUND - 8 - j * 5 - 14 * u, (5 + j * 2) * (1 - u * .5) * p.size, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }

  const CSS = `
  :root { --paper:#fbfbf8; --ink:#111; --muted:#8a8a84; --line:#e3e3dd; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--paper); color:var(--ink); font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;
         display:flex; flex-direction:column; align-items:center; min-height:100vh; }
  .top, .stage, .bar { width:min(calc(100vw - 32px), 1200px); }
  .top { display:flex; align-items:baseline; gap:16px; margin-top:20px; }
  .top a { color:var(--muted); text-decoration:none; } .top a:hover { color:var(--ink); }
  .top h1 { font-size:18px; margin:0; font-weight:600; }
  .stage { aspect-ratio:2/1; margin-top:12px; background:#fff; border:1px solid var(--line); }
  canvas { width:100%; height:100%; display:block; }
  .bar { padding:14px 0; display:flex; flex-wrap:wrap; align-items:center; gap:10px 16px; }
  button { font:inherit; border:2px solid var(--ink); background:#fff; color:var(--ink); border-radius:999px; padding:6px 14px; cursor:pointer; }
  button:hover { background:var(--ink); color:#fff; }
  button:disabled { opacity:.4; cursor:default; background:#fff; color:var(--ink); }
  input[type=range] { flex:1; min-width:160px; accent-color:var(--ink); }
  label { display:flex; gap:6px; align-items:center; color:#444; } select { font:inherit; }
  .time { font-variant-numeric:tabular-nums; color:var(--muted); min-width:92px; }`;

  function play(story) {
    document.title = story.title;
    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', `
      <header class="top"><a href="index.html">&larr; All shorts</a><h1>${story.title}</h1></header>
      <div class="stage"><canvas></canvas></div>
      <div class="bar">
        <button data-k="play">Pause</button><button data-k="restart">Restart</button>
        <input data-k="scrub" type="range" min="0" max="1000" value="0" aria-label="Timeline">
        <span class="time" data-k="time"></span>
        <label>Speed <select data-k="speed"><option value="0.25">0.25×</option><option value="0.5">0.5×</option><option value="1" selected>1×</option></select></label>
        <label><input data-k="boil" type="checkbox"> Line boil</label>
        <button data-k="rec">Record video</button>
      </div>`);
    const $ = k => document.querySelector(`[data-k="${k}"]`);
    const cv = document.querySelector('canvas'), S = new Show(story, cv);
    const resize = () => {
      const r = cv.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d);
    };
    addEventListener('resize', resize); resize();

    let playing = true, speed = 1, last = performance.now(), rec = null, chunks = [];
    const stopRec = () => { rec.stop(); rec = null; $('rec').disabled = false; $('rec').textContent = 'Record video'; };
    function frame(now) {
      const dt = Math.min(.05, (now - last) / 1000) * (playing ? speed : 0); last = now;
      if (dt > 0) {
        if (S.t + dt >= story.T) { if (rec) stopRec(); S.reset(); } else S.advance(dt);
      }
      S.render();
      $('scrub').value = Math.round(S.t / story.T * 1000);
      $('time').textContent = `${S.t.toFixed(1)} / ${story.T.toFixed(1)}s`;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    $('play').onclick = () => { playing = !playing; $('play').textContent = playing ? 'Pause' : 'Play'; };
    $('restart').onclick = () => S.reset();
    $('scrub').oninput = e => S.seek(e.target.value / 1000 * story.T);
    $('speed').onchange = e => speed = +e.target.value;
    $('boil').onchange = e => S.boil = e.target.checked;
    $('rec').onclick = () => {
      const type = ['video/webm;codecs=vp9', 'video/webm'].find(m => MediaRecorder.isTypeSupported(m));
      rec = new MediaRecorder(cv.captureStream(60), { mimeType: type, videoBitsPerSecond: 8e6 });
      chunks = []; rec.ondataavailable = e => chunks.push(e.data);
      rec.onstop = () => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
        a.download = story.title.toLowerCase().replace(/\s+/g, '-') + '.webm'; a.click();
      };
      S.reset(); playing = true; speed = 1; $('speed').value = '1'; $('play').textContent = 'Pause';
      rec.start(); $('rec').disabled = true; $('rec').textContent = 'Recording…';
    };
    window.show = S;   // handy for poking at it from the console
  }

  window.LineShort = { play, W, H, GROUND, STAND_Y, BODY_H, GRAV, INK, clamp, lerp, seg, sine, outCubic, outBack, hash, spring };
})();
