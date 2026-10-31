/* sketch.js — art styles for the engine: charcoal, coloured pencil, crayon, graphite, riso.
   A story opts in with style: 'charcoal' (or { a: 'graphite', b: 'crayon' } to mix two, or a function of
   time). Any page also takes ?style=charcoal, so the old episodes can be tried in a new look.

   How it works: the engine draws the frame as usual, but into a Pen, which sends fills to one layer and
   strokes to another, so colour and line can be different media. A shader then lays both on simulated
   paper. The rule comes from Kevin Ngo's art kit (github.com/kevintngo/statechart-art, tools/kit): dry
   media don't print a flat colour, they catch on the paper's tooth, so light pressure only touches the
   crests and hard pressure fills the valleys. The kit does that per pixel in Node, one still at a time; here it's
   a fragment shader, so it runs live and in the MP4 export. The riso look comes from his bot-house press:
   overprinted inks, an ordered (Bayer) dither for every tint, and plates a hair off register. */
(function () {
  const SRC = document.currentScript?.src || '', BASE = SRC.slice(0, SRC.lastIndexOf('/') + 1);
  const TILE = 1024, PERIOD = 1820;   // world units; the paper repeats exactly this often, so a loop can line it up

  // ---------------- the looks ----------------
  // paper: sheet colour. mode: 0 colour media, 1 one dry stick (plus chalk) on toned paper, 2 riso.
  // reach, reachK, soft: how far pressure reaches into the tooth (the kit's contact model).
  // hatch, hatchScale, cross: how much the fill shows its strokes. grain: tooth size.
  // lineB, lineK, lineSoft, lineOp: the same contact model for lines. lineVar: pressure wandering along a line.
  // warp: how far edges wander (world units). misreg: fill drawn a little off the line. smudge: dust around marks.
  // sketch: a second, fainter pass of every line. ink: the stick's colour. neutral: the tone of bare paper.
  // accent: how much strong colour survives in a mono look. lw: line width. wash: tone under the ground.
  const LOOKS = {
    pencil: {
      label: 'Pen + coloured pencil', paper: [247, 241, 228], mode: 0, reach: .3, reachK: .88, soft: .2, opac: .94,
      hatch: .62, hatchScale: 1, cross: .4, grain: 1, lineB: .78, lineK: .5, lineSoft: .34, lineOp: .97, lineVar: .3,
      warp: 1.5, misreg: 2.2, smudge: 0, sketch: .16, ink: [30, 26, 24], neutral: 1, accent: 1, lw: .6, wash: .1, font: 'serif', fontK: 1.12,
    },
    crayon: {
      label: 'Crayon + fineliner', paper: [251, 248, 240], mode: 0, reach: .36, reachK: 1.02, soft: .13, opac: 1,
      truth: .8, hatch: .6, hatchScale: .5, cross: .24, grain: 1, lineB: .86, lineK: .5, lineSoft: .4, lineOp: 1, lineVar: .34,
      warp: 3, misreg: 3.4, smudge: 0, sketch: 0, ink: [28, 24, 26], neutral: 1, accent: 1, lw: .72, wash: .08, font: 'sans', fontK: 1.08,
    },
    graphite: {
      label: 'Graphite', paper: [247, 245, 239], mode: 1, reach: .3, reachK: .86, soft: .3, opac: .9,
      hatch: .72, hatchScale: 1, cross: .5, grain: 1, lineB: .5, lineK: .66, lineSoft: .36, lineOp: .94, lineVar: .55,
      warp: 1.7, misreg: 0, smudge: .22, sketch: .5, ink: [62, 62, 70], neutral: 1, accent: 0, lw: .66, wash: .12, font: 'serif', fontK: 1.12,
    },
    charcoal: {
      label: 'Charcoal + chalk', paper: [205, 196, 181], mode: 1, reach: .14, reachK: .98, soft: .26, opac: .97,
      hatch: .26, hatchScale: .5, cross: .2, grain: 1.5, lineB: .3, lineK: .82, lineSoft: .3, lineOp: .98, lineVar: .62,
      warp: 3.2, misreg: 0, smudge: .42, sketch: .4, ink: [38, 35, 36], neutral: .77, accent: 1, lw: 1.1, wash: .16, font: 'serif', fontK: 1.12,
    },
    riso: {
      label: 'Riso print', paper: [243, 235, 221], mode: 2, reach: 0, reachK: 0, soft: 1, opac: 1,
      hatch: 0, hatchScale: 1, cross: 0, grain: 1, lineB: 0, lineK: 0, lineSoft: 1, lineOp: 1, lineVar: 0,
      warp: .5, misreg: 1, smudge: 0, sketch: 0, ink: [52, 74, 128], neutral: 1, accent: 1, lw: .5, wash: 0, font: 'serif', fontK: 1.12,
    },
  };
  const FONTS = { serif: '"Kevin Serif Bold", Georgia, serif', sans: '"Kevin Sans", "Trebuchet MS", sans-serif' };
  const packLook = L => {
    const c = v => v / 255;
    return new Float32Array([
      c(L.paper[0]), c(L.paper[1]), c(L.paper[2]), L.mode, L.reach, L.reachK, L.soft, L.opac,
      L.hatch, L.hatchScale, L.cross, L.grain, L.lineB, L.lineK, L.lineSoft, L.lineOp,
      L.lineVar, L.warp, L.misreg, L.smudge, c(L.ink[0]), c(L.ink[1]), c(L.ink[2]), L.neutral,
      L.sketch, L.accent, L.truth ?? .45, 0,
    ]);
  };

  // ---------------- the sheet of paper ----------------
  // A tiling port of the kit's paper.js. R: tooth (1 = fibre crest, 0 = pit), from blurred noise plus thousands
  // of short curved fibres. G: slow pressure drift. B, A: smooth noise, for edges to wander along.
  function buildTooth() {
    const N = TILE * TILE, W = TILE, m = (a, n = W) => ((a % n) + n) % n;
    let seed = 1779033703; const R = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const gauss = () => { let u = 0, v = 0; while (!u) u = R(); while (!v) v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * v); };
    const blur = f => {
      const t = new Float32Array(N), k = 1 / 3;
      for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) t[y * W + x] = (f[y * W + m(x - 1)] + f[y * W + x] + f[y * W + m(x + 1)]) * k;
      for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) f[y * W + x] = (t[m(y - 1) * W + x] + t[y * W + x] + t[m(y + 1) * W + x]) * k;
    };
    const coarse = (out, cells, amp) => {   // smooth value noise, wrapping at the tile edge
      const g = new Float32Array(cells * cells); for (let i = 0; i < g.length; i++) g[i] = R() * 2 - 1;
      const c = W / cells;
      for (let y = 0; y < W; y++) {
        const fy = y / c, y0 = Math.floor(fy), ty = fy - y0, sy = ty * ty * (3 - 2 * ty), y1 = (y0 + 1) % cells;
        for (let x = 0; x < W; x++) {
          const fx = x / c, x0 = Math.floor(fx), tx = fx - x0, sx = tx * tx * (3 - 2 * tx), x1 = (x0 + 1) % cells;
          const a = g[y0 * cells + x0], b = g[y0 * cells + x1], d = g[y1 * cells + x0], e = g[y1 * cells + x1];
          out[y * W + x] += amp * (a + (b - a) * sx + (d + (e - d) * sx - (a + (b - a) * sx)) * sy);
        }
      }
    };
    const norm = (f, mean, sd) => {
      let a = 0, v = 0; for (let i = 0; i < N; i++) a += f[i]; a /= N;
      for (let i = 0; i < N; i++) v += (f[i] - a) ** 2; v = Math.sqrt(v / N) || 1;
      for (let i = 0; i < N; i++) f[i] = Math.min(1, Math.max(0, mean + (f[i] - a) * sd / v));
    };
    const tooth = new Float32Array(N);
    for (let i = 0; i < N; i++) tooth[i] = R();
    blur(tooth); blur(tooth); norm(tooth, 0, .62);
    coarse(tooth, 512, .46); coarse(tooth, 180, .16); coarse(tooth, 32, .05);
    for (let k = 0; k < 26000; k++) {   // fibres, laid mostly along one direction like a machine-made sheet
      const up = R() < .62, amp = (up ? 1 : -.8) * (.2 + R() * .24), len = Math.min(20, Math.exp(1.6 + gauss() * .5));
      let x = R() * W, y = R() * W, a = -.15 + gauss() * .75 + (R() < .15 ? (R() - .5) * 3 : 0); const da = gauss() * .05;
      for (let s = 0, n = Math.ceil(len); s < n; s++) {
        const e = Math.pow(Math.sin(Math.PI * s / n), .6) * amp, xi = m(Math.floor(x)), yi = m(Math.floor(y));
        tooth[yi * W + xi] += e; x += Math.cos(a) * .7; y += Math.sin(a) * .7; a += da;
      }
    }
    norm(tooth, .5, .21);
    const drift = new Float32Array(N), a = new Float32Array(N), b = new Float32Array(N);
    coarse(drift, 48, 1); coarse(drift, 16, 1); norm(drift, .5, .24);
    coarse(a, 16, 1); coarse(a, 8, 1.2); norm(a, .5, .22);
    coarse(b, 16, 1); coarse(b, 8, 1.2); norm(b, .5, .22);
    const px = new Uint8Array(N * 4);
    for (let i = 0; i < N; i++) { px[i * 4] = tooth[i] * 255; px[i * 4 + 1] = drift[i] * 255; px[i * 4 + 2] = a[i] * 255; px[i * 4 + 3] = b[i] * 255; }
    return px;
  }
  // R and G: two sets of pencil strokes crossing each other, drawn on a tile that wraps
  function buildHatch() {
    const cv = document.createElement('canvas'); cv.width = cv.height = TILE;
    const g = cv.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, TILE, TILE);
    g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    let i = 0; const rnd = () => { const s = Math.sin(++i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
    const set = (ang, col, n) => {
      for (let k = 0; k < n; k++) {
        const x = rnd() * TILE, y = rnd() * TILE, a = ang + (rnd() - .5) * .16, l = 70 + rnd() * 170, b = (rnd() - .5) * 26;
        const dx = Math.cos(a) * l / 2, dy = Math.sin(a) * l / 2;
        g.lineWidth = 1.6 + rnd() * 3.4; g.strokeStyle = `rgba(${col},${(.12 + rnd() * .34).toFixed(3)})`;
        for (const ox of [-TILE, 0, TILE]) for (const oy of [-TILE, 0, TILE]) {
          if (x + ox < -300 || x + ox > TILE + 300 || y + oy < -300 || y + oy > TILE + 300) continue;
          g.beginPath(); g.moveTo(x + ox - dx, y + oy - dy); g.quadraticCurveTo(x + ox - dy / l * b, y + oy + dx / l * b, x + ox + dx, y + oy + dy); g.stroke();
        }
      }
    };
    set(-1.0, '255,0,0', 2300); set(.42, '0,255,0', 2300);
    return cv;
  }

  // ---------------- the shader ----------------
  const VERT = `#version 300 es
  in vec2 p; uniform vec2 uRes; out vec2 vPx;
  void main() { vPx = vec2(p.x * .5 + .5, .5 - p.y * .5) * uRes; gl_Position = vec4(p, 0., 1.); }`;
  const FRAG = `#version 300 es
  precision highp float; precision highp int;
  in vec2 vPx; out vec4 outC;
  uniform sampler2D uPaint, uLine, uMask, uTooth, uHatch;
  uniform vec2 uRes, uBoil; uniform vec3 uView; uniform float uBgL, uPan;
  uniform vec4 uA[7], uB[7]; uniform mat3 uSep; uniform vec3 uInk0, uInk1, uInk2;
  const vec3 LUMA = vec3(.3, .59, .11), CHALK = vec3(.965, .95, .91); const float PERIOD = ${PERIOD}.;
  float lum(vec3 c) { return dot(c, LUMA); }
  // the kit's contact model: paper height h against how far the tip reaches into the tooth
  float dep(float h, float reach, float soft) { return clamp((h - (1. - reach)) / soft + .5, 0., 1.); }
  // the kit's film: a smooth underlayer that barely notices the tooth, so a light touch is a faint tone with
  // grain in it, not hard specks. a is how hard the colour wants to be, p the same after the hatch strokes
  float dry(float h, float a, float p, vec4 P[7]) {
    float g = dep(h, P[1].x + P[1].y * p, P[1].z) * mix(.28, 1., smoothstep(.12, .62, a));
    return max(g, clamp(p, 0., 1.) * .62 * (.55 + .9 * h)) * smoothstep(.0, .04, a);
  }
  float bayer(ivec2 q) { int r = 0, x = q.x ^ q.y; for (int i = 0; i < 3; i++) r = (r << 2) | (((x >> i) & 1) << 1) | ((q.y >> i) & 1); return (float(r) + .5) / 64.; }

  vec3 shade(vec4 P[7], vec2 w, vec2 b, float text) {
    float U = uView.z, mode = P[0].a;
    vec2 tp = w / PERIOD, tc = tp * P[2].a * 2. + b;    // every lookup below repeats a whole number of times in PERIOD
    vec4 T = texture(uTooth, tc, -1.);
    float h = T.r;
    vec2 wn = texture(uTooth, tp * 3. + b * .37).ba - .5, wf = texture(uTooth, tp * 13. + b * .11).ba - .5;
    vec2 wob = (wn + wf * .55) * P[4].y * (1. - text);
    vec2 uvL = (vPx + wob * U) / uRes, off = vec2(1., .62) * P[4].z * U;
    vec2 uvP = (vPx + wob * 1.5 * U + off) / uRes;
    float lod = max(0., log2(U) + .35);
    vec3 paper = P[0].rgb * (1. + (h - .5) * .05 + (texture(uTooth, tp).b - .5) * .05);

    if (mode > 1.5) {                                   // riso: separate into plates, screen each one, overprint
      vec3 c0 = texture(uPaint, uvP).rgb;
      vec3 c1 = texture(uPaint, (vPx + vec2(-.5, .35) * P[4].z * U * 1.6) / uRes).rgb, c2 = texture(uPaint, (vPx + vec2(.4, .55) * P[4].z * U * 1.6) / uRes).rgb;
      vec4 L = texture(uLine, uvL);
      c0 = c0 * (1. - L.a) + L.rgb; c1 = c1 * (1. - L.a) + L.rgb; c2 = c2 * (1. - L.a) + L.rgb;
      vec3 a0 = uSep * -log(max(c0, vec3(.03))), a1 = uSep * -log(max(c1, vec3(.03))), a2 = uSep * -log(max(c2, vec3(.03)));
      vec3 tone = clamp(vec3(a0.x, a1.y, a2.z), 0., 1.);
      float cp = max(1., floor(U * 1.7 + .5)), th = bayer(ivec2(floor((vPx - uView.xy - vec2(uPan * U, 0.)) / cp + 8192.)));
      vec3 col = paper;
      if (tone.x > th) col *= uInk0;
      if (tone.y > th) col *= uInk1;
      if (tone.z > th) col *= uInk2;
      col *= 1. + (h - .5) * .05;                       // ink lying on a paper with a little tooth
      return col;
    }

    vec3 c = texture(uPaint, uvP).rgb;
    vec4 L = texture(uLine, uvL), L2 = texture(uLine, (vPx + (wob.yx * -1.6 + vec2(1.3, -.9)) * U) / uRes);
    vec2 hs = texture(uHatch, tp * P[2].y * 2. + b * 1.7, -.5).rg * 1.9;
    float s = mix(1., hs.r, P[2].x);
    vec3 col = paper;

    if (mode < .5) {                                    // colour media: how hard it was pressed is how far from white
      float a = 1. - min(c.r, min(c.g, c.b));
      vec3 pig = mix(a > .004 ? (c - (1. - a)) / a : vec3(1.), c, P[6].z);   // truth: heavy media print the colour as asked, light ones its pure pigment
      float s2 = mix(1., hs.g, P[2].z * smoothstep(.3, .85, a));
      float d = dry(h, a, a * s * s2, P);
      col *= mix(vec3(1.), pig, d * P[1].a);
    } else {                                            // one stick on toned paper, and chalk for what's lighter than the sheet
      float N = max(P[5].a, uBgL), t = lum(c);
      float da = pow(clamp((N - t) / N, 0., 1.), .85), la = N < .995 ? clamp((t - N) / (1. - N), 0., 1.) : 0.;
      float s2 = mix(1., hs.g, P[2].z * smoothstep(.3, .85, da));
      float d = dry(h, da, da * s * s2, P);
      float ch = dep(h * .85 + T.g * .15, .22 + 1.02 * la, P[1].z) * smoothstep(.01, .12, la);
      col = mix(col, CHALK, ch * .96);
      col = mix(col, P[5].rgb, d * P[1].a);
      float sat = max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b)), keep = smoothstep(.3, .55, sat) * P[6].y;
      if (keep > .001) { float a = dep(h, .34 + .86 * max(c.r, max(c.g, c.b)), P[1].z); col = mix(col, c * (.95 + .1 * h), a * keep); }
      if (P[4].a > .001) {                              // dust: marks shed onto the paper round them, unevenly
        vec3 sm = textureLod(uPaint, uvP + vec2(.0, 7.) * U / uRes, lod + 3.2).rgb;
        float patch_ = smoothstep(.34, .72, T.g * .5 + texture(uTooth, tp * 2.).a * .6), sd = clamp((N - lum(sm)) / N, 0., 1.);
        float ld = textureLod(uLine, uvL + vec2(.0, 4.) * U / uRes, lod + 2.6).a;
        col = mix(col, P[5].rgb, clamp(sd * .6 + ld * 1.1, 0., 1.) * P[4].a * patch_ * (.45 + .9 * h));
      }
    }

    // the line: its width and weight follow a slow pressure drift, and it catches on the tooth too
    float lb = textureLod(uLine, uvL, lod).a, drift = texture(uTooth, tp * 6.).g;
    float th = mix(.42, .16 + .62 * drift, P[4].x * (1. - text)), lc = smoothstep(th - .2, th + .2, lb);
    float dl = dep(h * (1. - text * .6) + text * .3, P[3].x + P[3].y * lc * (.7 + .5 * drift), P[3].z) * lc;
    vec3 lcol = L.a > .003 ? L.rgb / L.a : vec3(0.);
    float lt = lum(lcol), lsat = max(lcol.r, max(lcol.g, lcol.b)) - min(lcol.r, min(lcol.g, lcol.b));
    vec3 ink = lsat > .22 ? mix(P[5].rgb, lcol, mode < .5 ? 1. : P[6].y) : mix(mode < .5 ? lcol * .9 + P[5].rgb * .1 : P[5].rgb, mode < .5 ? lcol : CHALK, smoothstep(.55, .8, lt));
    if (P[6].x > .001) { float d2 = dep(h, .34 + .5 * L2.a, .3) * L2.a * P[6].x * (1. - text); col = mix(col, ink, d2 * smoothstep(.35, .7, drift + .2)); }
    col = mix(col, ink, dl * P[3].a);
    return col;
  }

  void main() {
    vec2 uv = vPx / uRes, w = (vPx - uView.xy) / uView.z - vec2(uPan, 0.);
    vec3 m = texture(uMask, uv).rgb;
    vec2 b = uBoil * step(.25, m.r);                    // only what's on a cel gets redrawn each frame; the background holds
    float text = step(.3, m.b);
    float h = texture(uTooth, w / PERIOD * 2., -1.).r;
    float r = smoothstep(.4, .6, m.g + (h - .5) * .75);
    vec3 col = r < .002 ? shade(uA, w, b, text) : r > .998 ? shade(uB, w, b, text) : mix(shade(uA, w, b, text), shade(uB, w, b, text), r);
    vec2 q = uv - vec2(.5, .47);
    col *= 1. - .1 * pow(dot(q, q) * 2.3, 1.6);
    outC = vec4(col, 1.);
  }`;

  // ---------------- the GL side ----------------
  let G = null;
  function gl0() {
    if (G !== null) return G;
    const cv = document.createElement('canvas'), gl = cv.getContext('webgl2', { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
    if (!gl) { console.warn('sketch: no WebGL2, drawing flat'); return G = false; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(prog, n);
    const tex = (unit, name, wrap) => {
      const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.uniform1i(U(name), unit); return t;
    };
    tex(0, 'uPaint', gl.CLAMP_TO_EDGE); tex(1, 'uLine', gl.CLAMP_TO_EDGE); tex(2, 'uMask', gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    tex(3, 'uTooth', gl.REPEAT); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, TILE, TILE, 0, gl.RGBA, gl.UNSIGNED_BYTE, buildTooth()); gl.generateMipmap(gl.TEXTURE_2D);
    tex(4, 'uHatch', gl.REPEAT); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, buildHatch()); gl.generateMipmap(gl.TEXTURE_2D);
    // the plates: inks overprint (they multiply), so in log space a colour is a sum of inks, and solving
    // that sum says how much of each drum to print: real separations for blue, coral and sun
    const inks = [[52, 74, 128], [238, 104, 82], [255, 212, 40]].map(c => c.map(v => v / 255));
    const A = inks.map(c => c.map(v => -Math.log(v))), [a, b, c] = [A[0], A[1], A[2]];   // columns
    const det = a[0] * (b[1] * c[2] - b[2] * c[1]) - b[0] * (a[1] * c[2] - a[2] * c[1]) + c[0] * (a[1] * b[2] - a[2] * b[1]);
    const inv = [
      (b[1] * c[2] - b[2] * c[1]) / det, (a[2] * c[1] - a[1] * c[2]) / det, (a[1] * b[2] - a[2] * b[1]) / det,
      (b[2] * c[0] - b[0] * c[2]) / det, (a[0] * c[2] - a[2] * c[0]) / det, (a[2] * b[0] - a[0] * b[2]) / det,
      (b[0] * c[1] - b[1] * c[0]) / det, (a[1] * c[0] - a[0] * c[1]) / det, (a[0] * b[1] - a[1] * b[0]) / det,
    ];
    gl.uniformMatrix3fv(U('uSep'), false, inv);   // column-major: this is the inverse of [a b c]
    gl.uniform3fv(U('uInk0'), inks[0]); gl.uniform3fv(U('uInk1'), inks[1]); gl.uniform3fv(U('uInk2'), inks[2]);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    return G = { cv, gl, U: { res: U('uRes'), boil: U('uBoil'), view: U('uView'), bg: U('uBgL'), pan: U('uPan'), a: U('uA'), b: U('uB') } };
  }

  // ---------------- the Pen: the engine's canvas calls, split into paint and line ----------------
  const both = ['save', 'restore', 'translate', 'scale', 'rotate', 'transform', 'beginPath', 'moveTo', 'lineTo', 'quadraticCurveTo', 'bezierCurveTo', 'arc', 'arcTo', 'ellipse', 'rect', 'roundRect', 'closePath', 'setLineDash', 'clip'];
  class Pen {
    constructor(P, L, M) { this.p = P; this.l = L; this.m = M; this.on = false; this.lw = 1; this.sketch = true; }
    cel(col) {   // what's drawn after this also goes on the mask: red for moving things, blue for captions
      const m = this.m; this.on = !!col; if (!col) return;
      const t = this.p.getTransform(); m.setTransform(t.a * .5, t.b * .5, t.c * .5, t.d * .5, t.e * .5, t.f * .5);
      m.fillStyle = col; m.strokeStyle = col; m.globalCompositeOperation = 'lighter'; m.lineCap = 'round'; m.lineJoin = 'round';
    }
    setTransform(a, b, c, d, e, f) { this.p.setTransform(a, b, c, d, e, f); this.l.setTransform(a, b, c, d, e, f); if (this.on) this.m.setTransform(a * .5, b * .5, c * .5, d * .5, e * .5, f * .5); }
    get globalAlpha() { return this.p.globalAlpha; } set globalAlpha(v) { this.p.globalAlpha = v; this.l.globalAlpha = v; }
    get fillStyle() { return this.p.fillStyle; } set fillStyle(v) { this.p.fillStyle = v; }
    get strokeStyle() { return this.l.strokeStyle; } set strokeStyle(v) { this.l.strokeStyle = v; }
    get lineWidth() { return this.l.lineWidth / this.lw; } set lineWidth(v) { this.l.lineWidth = v * this.lw; }
    get globalCompositeOperation() { return this.p.globalCompositeOperation; } set globalCompositeOperation(v) { this.p.globalCompositeOperation = v; }
    createLinearGradient(...a) { return this.p.createLinearGradient(...a); }
    createRadialGradient(...a) { return this.p.createRadialGradient(...a); }
    measureText(s) { return this.p.measureText(s); }
    getTransform() { return this.p.getTransform(); }
    // a fill covers the lines behind it, unless it's see-through
    erase(fn) {
      const fs = this.p.fillStyle; if (typeof fs !== 'string' || fs[0] !== '#') return;
      const l = this.l; l.globalCompositeOperation = 'destination-out'; const old = l.fillStyle; l.fillStyle = '#000'; fn(l); l.fillStyle = old; l.globalCompositeOperation = 'source-over';
    }
    fill(r) { this.p.fill(r); this.erase(l => l.fill(r)); if (this.on) this.m.fill(r); }
    fillRect(x, y, w, h) { this.p.fillRect(x, y, w, h); this.erase(l => l.fillRect(x, y, w, h)); if (this.on) this.m.fillRect(x, y, w, h); }
    stroke() { this.l.stroke(); if (this.on) { this.m.lineWidth = this.l.lineWidth; this.m.stroke(); } }
    strokeRect(x, y, w, h) { this.l.strokeRect(x, y, w, h); }
    fillText(s, x, y) { this.l.fillStyle = this.p.fillStyle; this.l.fillText(s, x, y); if (this.on) this.m.fillText(s, x, y); }
    strokeText(s, x, y) { this.l.strokeText(s, x, y); }
    drawImage(...a) { this.p.drawImage(...a); }
    // a little tone under the line, so the bottom of the frame reads as ground
    floor(v, line, step, amt) {
      if (!amt) return;
      const p = this.p, a = v.left - 20, b = v.right + 20, g = p.createLinearGradient(0, 620, 0, 800);
      g.addColorStop(0, `rgba(0,0,0,${amt})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      p.save(); p.fillStyle = g; p.beginPath(); p.moveTo(a, v.bottom + 20);
      for (let x = a; x <= b + step; x += step) p.lineTo(x, line(x) + 6);
      p.lineTo(b + step, v.bottom + 20); p.closePath(); p.fill(); p.restore();
    }
  }
  for (const k of both) Pen.prototype[k] = function (...a) { this.p[k](...a); this.l[k](...a); if (this.on) this.m[k](...a); };
  for (const k of ['lineCap', 'lineJoin', 'lineDashOffset', 'font', 'textAlign', 'textBaseline', 'miterLimit'])
    Object.defineProperty(Pen.prototype, k, { get() { return this.p[k]; }, set(v) { this.p[k] = v; this.l[k] = v; if (this.on) this.m[k] = v; } });

  const layers = new Map();
  function layersFor(w, h) {
    const key = w + 'x' + h; let L = layers.get(key); if (L) return L;
    const mk = (cw, ch, o) => { const c = document.createElement('canvas'); c.width = cw; c.height = ch; return c.getContext('2d', o); };
    L = { paint: mk(w, h, { alpha: false }), line: mk(w, h), mask: mk(Math.ceil(w / 2), Math.ceil(h / 2), { alpha: false }), w, h };
    L.pen = new Pen(L.paint, L.line, L.mask);
    if (layers.size > 3) layers.clear();
    layers.set(key, L); return L;
  }
  const hexL = c => { if (typeof c !== 'string' || c[0] !== '#') return 1; const n = parseInt(c.slice(1, 7), 16); return (.3 * (n >> 16 & 255) + .59 * (n >> 8 & 255) + .11 * (n & 255)) / 255; };
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const packed = new Map();
  const look = name => {
    const key = typeof name === 'string' ? name : JSON.stringify(name);
    if (!packed.has(key)) { const L = typeof name === 'string' ? LOOKS[name] : Object.assign({}, LOOKS[name.base], name); if (!L) throw new Error('no style ' + key); packed.set(key, { L, v: packLook(L) }); }
    return packed.get(key);
  };

  // live playback on a slow device draws fewer pixels rather than dropping frames; exports never do
  let scale = 1, lastT = 0, pace = 16;
  function live() {
    const now = performance.now(), d = now - lastT; lastT = now;
    if (d < 200) pace += (d - pace) * .04;
    if (pace > 25 && scale > .5) { scale -= .125; pace = 16; }
    return scale;
  }

  // one frame: the engine draws into the Pen, the shader lays it on paper, the result lands on ctx
  function frame(show, ctx, cwFull, chFull, style, isLive) {
    const g = gl0();
    if (!g) return show.draw(ctx, cwFull, chFull);
    const sc = isLive ? live() : 1, cw = Math.round(cwFull * sc), ch = Math.round(chFull * sc);
    const name = style.a ? style : { a: style }, A = look(name.a), B = name.b ? look(name.b) : A, S = layersFor(cw, ch), pen = S.pen, st = show.story;
    pen.lw = A.L.lw; pen.capFont = FONTS[A.L.font]; pen.capK = A.L.fontK; pen.wash = st.wash ?? A.L.wash;
    S.paint.setTransform(1, 0, 0, 1, 0, 0); S.line.setTransform(1, 0, 0, 1, 0, 0); S.line.clearRect(0, 0, cw, ch);
    const m = S.mask; m.globalCompositeOperation = 'source-over'; m.setTransform(1, 0, 0, 1, 0, 0); m.fillStyle = '#000'; m.fillRect(0, 0, m.canvas.width, m.canvas.height);
    const v0 = show.view = show.viewFor(cw, ch); st.view?.(v0, show);
    if (st.mix) { m.setTransform(v0.unit / 2, 0, 0, v0.unit / 2, v0.ox / 2, v0.oy / 2); m.fillStyle = '#0f0'; m.strokeStyle = '#0f0'; m.lineCap = 'round'; m.lineJoin = 'round'; st.mix(show, m, show.t, v0); }
    show.draw(pen, cw, ch);
    const gl = g.gl, cv = g.cv;
    if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; gl.viewport(0, 0, cw, ch); }
    const up = (unit, c, mips) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c); if (mips) gl.generateMipmap(gl.TEXTURE_2D); };
    up(0, S.paint.canvas, true); up(1, S.line.canvas, true); up(2, m.canvas, false);
    const v = show.view, k = Math.floor(show.t * 8);
    // the paper is pinned to the world, so the loop's jump back to the start would make the grain pop for a
    // frame. In the empty walk-off it slides a little instead, until it lines up with the opening frame
    const per = A.L.mode === 2 ? 8 * Math.max(1, Math.floor(v.unit * 1.7 + .5)) / v.unit : PERIOD, xT = show.startState?.char.x ?? 0, r = (((xT % per) + per * 1.5) % per) - per / 2, u = isFinite(show.T) ? Math.min(1, Math.max(0, (show.t - show.T + 5) / 5)) : 0;
    gl.uniform1f(g.U.pan, r * u * u * (3 - 2 * u));
    gl.uniform2f(g.U.res, cw, ch); gl.uniform3f(g.U.view, v.ox, v.oy, v.unit); gl.uniform2f(g.U.boil, hash(k + .1), hash(k + .7));
    gl.uniform1f(g.U.bg, hexL(st.paperAt ? st.paperAt(show.t, show) : st.paper || '#ffffff'));
    gl.uniform4fv(g.U.a, A.v); gl.uniform4fv(g.U.b, B.v);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(cv, 0, 0, cwFull, chFull);
  }

  // the letters: Kevin Serif and Kevin Sans, A. V. Hershey's 1967 letters written by a simulated pen (MIT, see fonts/)
  if (typeof FontFace === 'function') for (const [family, file] of [['Kevin Serif Bold', 'KevinSerif-Bold'], ['Kevin Sans', 'KevinSans-Regular']])
    new FontFace(family, `url(${BASE}fonts/${file}.woff2)`).load().then(f => document.fonts.add(f)).catch(() => {});

  // ---------------- helpers for stories ----------------
  // hand hatching inside a box (world units), for cast shadows: real strokes, so they sit on the line layer
  function hatch(ctx, x, y, w, h, o = {}) {
    const a = o.angle ?? -1, gap = o.gap ?? 9, c = Math.cos(a), s = Math.sin(a), L = Math.hypot(w, h);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.lineWidth = o.width ?? 3; ctx.beginPath();
    for (let d = -L, i = 0; d < L; d += gap, i++) {
      const j = (hash(i * 3.1 + x) - .5) * gap * .7, cx = x + w / 2 - s * (d + j), cy = y + h / 2 + c * (d + j), l = L * (.46 + .08 * hash(i + y));
      ctx.moveTo(cx - c * l, cy - s * l); ctx.lineTo(cx + c * l, cy + s * l);
    }
    ctx.stroke(); ctx.restore();
  }

  // a shape drawn by a hand, not a computer: corners a little off, edges that bow, and strokes that run past
  // each other at the corners (the kit's ruled lines). The same seed always draws the same shape, so it doesn't jitter.
  function hand(ctx, pts, o = {}) {
    const s = o.seed ?? 1, amt = o.wob ?? 2.2, over = o.over ?? 6, n = pts.length;
    const P = pts.map(([x, y], i) => [x + (hash(s + i * 1.7) - .5) * amt * 2, y + (hash(s + i * 2.9) - .5) * amt * 2]);
    if (o.fill) { ctx.fillStyle = o.fill; ctx.beginPath(); P.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); }
    if (o.line === false) return;
    ctx.beginPath();
    for (let i = 0, m = o.open ? n - 1 : n; i < m; i++) {
      const a = P[i], b = P[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
      const e0 = hash(s + i * 3.3) * over, e1 = hash(s + i * 5.9) * over, bow = (hash(s + i * 4.1) - .5) * Math.min(L * .035, 7);
      ctx.moveTo(a[0] - ux * e0, a[1] - uy * e0);
      ctx.quadraticCurveTo((a[0] + b[0]) / 2 - uy * bow, (a[1] + b[1]) / 2 + ux * bow, b[0] + ux * e1, b[1] + uy * e1);
    }
    ctx.stroke();
  }

  window.Sketch = { frame, hatch, hand, LOOKS, override: null, ready: () => Promise.all([document.fonts.load('40px "Kevin Serif Bold"'), document.fonts.load('40px "Kevin Sans"')]).catch(() => {}) };
})();
