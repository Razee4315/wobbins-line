/* sfx.js — synthesized sound effects for the line shorts.
   Everything is built from soft sine/triangle tones and filtered noise with gentle
   envelopes, a little shared reverb and a soft compressor, so it stays clean
   (no hiss, no harsh edges). The same code plays live in an AudioContext and
   renders offline into an OfflineAudioContext for the MP4 soundtrack. */
(function () {
  const hash = n => { const s = Math.sin(n * 91.7 + 17.3) * 43758.5453; return s - Math.floor(s); };
  // C major pentatonic, C5 upwards
  const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760, 2093];

  const banks = new WeakMap();
  function bank(ctx) {
    let b = banks.get(ctx); if (b) return b;
    const sr = ctx.sampleRate;
    const mk = (sec, fill) => { const buf = ctx.createBuffer(1, Math.round(sr * sec), sr); fill(buf.getChannelData(0)); return buf; };
    let seed = 1; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const white = mk(3, d => { for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1; });
    const brown = mk(3, d => { let l = 0; for (let i = 0; i < d.length; i++) { l = (l + .02 * (rnd() * 2 - 1)) / 1.02; d[i] = l * 3.5; } });
    // a soft, dark plate-ish reverb tail
    const ir = ctx.createBuffer(2, Math.round(sr * 2.2), sr);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c); let lp = 0;
      for (let i = 0; i < d.length; i++) { lp += .25 * ((rnd() * 2 - 1) - lp); d[i] = lp * Math.pow(1 - i / d.length, 3.2); }
    }
    const master = ctx.createGain(); master.gain.value = 1.5;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 32;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.knee.value = 10; comp.ratio.value = 3; comp.attack.value = .004; comp.release.value = .25;
    const verb = ctx.createConvolver(); verb.buffer = ir;
    const verbOut = ctx.createGain(); verbOut.gain.value = .5;
    master.connect(hp); verb.connect(verbOut).connect(hp); hp.connect(comp).connect(ctx.destination);
    b = { master, verb, white, brown };
    banks.set(ctx, b); return b;
  }

  // one sound's output: gain -> pan -> (dry to master, a little to reverb)
  function voice(ctx, { pan = 0, send = .15, gain = 1 }) {
    const B = bank(ctx), g = ctx.createGain(); g.gain.value = gain;
    const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan));
    const s = ctx.createGain(); s.gain.value = send;
    g.connect(p); p.connect(B.master); p.connect(s).connect(B.verb);
    return g;
  }
  function env(param, t, a, peak, d) {
    param.setValueAtTime(.0001, t);
    param.linearRampToValueAtTime(peak, t + a);
    param.exponentialRampToValueAtTime(.0001, t + a + d);
  }
  function tone(ctx, out, { type = 'sine', f, f2, t, a = .003, d = .2, g = .3, glide, vib = 0, vibRate = 7 }) {
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + (glide ?? a + d));
    if (vib) {
      const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = vibRate; lg.gain.value = vib;
      l.connect(lg).connect(o.frequency); l.start(t); l.stop(t + a + d + .05);
    }
    const e = ctx.createGain(); env(e.gain, t, a, g, d);
    o.connect(e).connect(out); o.start(t); o.stop(t + a + d + .05);
  }
  function noise(ctx, out, { t, a = .002, d = .1, g = .2, type = 'lowpass', f = 1000, f2, q = .7, brown = false, seed = 0 }) {
    const B = bank(ctx), s = ctx.createBufferSource(); s.buffer = brown ? B.brown : B.white;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.Q.value = q;
    fl.frequency.setValueAtTime(f, t);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + a + d);
    const e = ctx.createGain(); env(e.gain, t, a, g, d);
    s.connect(fl).connect(e).connect(out);
    s.start(t, hash(seed + t) * 2, a + d + .05);
  }
  const bell = (ctx, out, t, f, g, d = 1.3) => {
    tone(ctx, out, { f, t, d, g });
    tone(ctx, out, { f: f * 2.76, t, d: d * .6, g: g * .32 });
    tone(ctx, out, { f: f * 5.4, t, d: d * .3, g: g * .12 });
  };
  const marimba = (ctx, out, t, f, g) => {
    tone(ctx, out, { f, t, d: .9, g });
    tone(ctx, out, { f: f * 4, t, d: .18, g: g * .25 });
    tone(ctx, out, { f: f * 2, t, d: .3, g: g * .12, type: 'triangle' });
  };

  // ---- the sounds ----
  const S = {
    step: (c, o, t, p) => {                     // soft, muffled footfall
      const v = p.v ?? .3, k = p.seed ?? 0, wob = 1 + (hash(k) - .5) * .18;
      noise(c, o, { t, d: .05 + .03 * v, g: .07 + .13 * v, f: (450 + 900 * v) * wob, q: .5, seed: k });
      tone(c, o, { f: 115 * wob, f2: 60, t, d: .07, g: .08 + .12 * v });
    },
    jump: (c, o, t, p) => {                     // a little "fwip" up
      const v = p.v ?? .5;
      noise(c, o, { t, a: .02, d: .14, g: .04 + .07 * v, type: 'bandpass', f: 450, f2: 1900, q: 1.1 });
      tone(c, o, { f: 300, f2: 620, t, a: .01, d: .11, g: .04 + .03 * v });
    },
    land: (c, o, t, p) => {                     // round thud with a soft dust puff
      const v = Math.min(1, p.v ?? .5);
      tone(c, o, { f: 150, f2: 46, t, d: .22, g: .2 + .35 * v });
      noise(c, o, { t, d: .1 + .1 * v, g: .05 + .12 * v, f: 800, f2: 220 });
      if (v > .55) S.boing(c, o, t + .05, { pitch: 170, g: .07 * v });
    },
    skid: (c, o, t) => noise(c, o, { t, a: .01, d: .12, g: .05, type: 'bandpass', f: 1500, f2: 600, q: .8 }),
    tap: (c, o, t, p) => {                      // glassy screen tap
      const dull = p.dull ?? 0;
      tone(c, o, { f: 2300 - 1000 * dull, f2: 1800 - 800 * dull, t, d: .045, g: .09 - .03 * dull });
      noise(c, o, { t, d: .015, g: .03, type: 'highpass', f: 3200 });
    },
    pop: (c, o, t, p) => {                      // bubbly blip
      const f = p.pitch ?? 620, dull = p.dull ?? 0;
      tone(c, o, { f: f * (1 - .35 * dull), f2: f * (2.1 - dull), t, d: .09, g: (p.g ?? .15) * (1 - .5 * dull), glide: .05 });
    },
    ding: (c, o, t, p) => bell(c, o, t, p.pitch ?? 1568, p.g ?? .13),
    twinkle: (c, o, t, p) => { const f = p.pitch ?? 2093; bell(c, o, t, f, .05, .5); bell(c, o, t + .08, f * 1.5, .04, .5); },
    beep: (c, o, t, p) => tone(c, o, { type: 'triangle', f: p.pitch ?? 880, t, a: .005, d: .13, g: .06 }),
    powerDown: (c, o, t) => {
      tone(c, o, { type: 'triangle', f: 720, f2: 60, t, a: .01, d: .95, g: .1, glide: .9 });
      tone(c, o, { f: 360, f2: 40, t, a: .01, d: .9, g: .08, glide: .9 });
    },
    swell: (c, o, t, p) => {                    // warm, slow-attack chord: an "oh..." moment
      const r = p.root ?? 392;
      for (const [m, g] of [[1, .05], [1.25, .035], [1.5, .035], [2, .02]]) {
        const osc = c.createOscillator(), e = c.createGain(); osc.frequency.value = r * m;
        e.gain.setValueAtTime(.0001, t); e.gain.linearRampToValueAtTime(g, t + 1.1); e.gain.exponentialRampToValueAtTime(.0001, t + 3.4);
        osc.connect(e).connect(o); osc.start(t); osc.stop(t + 3.5);
      }
    },
    roll: (c, o, t, p) => noise(c, o, { t, a: .045, d: .12, g: .06 * Math.min(1, p.v ?? .5), f: 160 + 320 * (p.v ?? .5), brown: true, seed: t }),
    squish: (c, o, t) => {
      noise(c, o, { t, a: .01, d: .26, g: .1, f: 900, f2: 220 });
      tone(c, o, { f: 320, f2: 110, t, d: .22, g: .1, vib: 25, vibRate: 18 });
    },
    boing: (c, o, t, p) => tone(c, o, { f: p.pitch ?? 220, f2: (p.pitch ?? 220) * 2.4, t, a: .005, d: .34, g: p.g ?? .11, glide: .2, vib: 18, vibRate: 13 }),
    slip: (c, o, t) => {                        // "uh-oh"
      tone(c, o, { f: 560, f2: 470, t, a: .01, d: .2, g: .06 });
      tone(c, o, { f: 420, f2: 300, t: t + .22, a: .01, d: .3, g: .06 });
    },
    rumble: (c, o, t, p) => noise(c, o, { t, a: .4, d: p.d ?? 1.3, g: .2, f: 120, f2: 70, brown: true }),
    dizzy: (c, o, t) => { for (let i = 0; i < 4; i++) tone(c, o, { f: [1760, 2093, 1760, 2349][i], t: t + i * .09, a: .005, d: .12, g: .03, vib: 40, vibRate: 22 }); },
    chime: (c, o, t, p) => marimba(c, o, t, p.f ?? PENTA[p.n ?? 0], p.g ?? .12),
    arp: (c, o, t, p) => (p.notes ?? [0, 2, 4, 5, 7]).forEach((n, i) => marimba(c, o, t + i * (p.gap ?? .07), PENTA[n], p.g ?? .09)),
    sparkle: (c, o, t, p) => { for (let i = 0; i < (p.n ?? 6); i++) bell(c, o, t + hash(i + t) * .5, PENTA[5 + Math.floor(hash(i * 3 + t) * 6)], .025, .45); },
    whoosh: (c, o, t, p) => { const d = p.d ?? .5; noise(c, o, { t, a: d * .45, d: d * .55, g: .06 * (p.v ?? 1), type: 'bandpass', f: 300, f2: 1700, q: .9 }); },
    whistle: (c, o, t, p) => { const d = p.d ?? .8; tone(c, o, { f: p.f ?? 900, f2: p.f2 ?? 1800, t, a: d * .35, d: d * .65, g: .025, glide: d, vib: 6, vibRate: 6 }); },
    brush: (c, o, t) => noise(c, o, { t, a: .09, d: .26, g: .035, type: 'bandpass', f: 1900, f2: 900, q: .7 }),
    tick: (c, o, t, p) => {
      const f = p.tock ? 2100 : 3100;
      noise(c, o, { t, d: .018, g: .1, type: 'bandpass', f, q: 7 });
      tone(c, o, { f, t, d: .014, g: .025 });
    },
    ring: (c, o, t) => tone(c, o, { f: 2637, t, a: .004, d: .22, g: .022, vib: 180, vibRate: 26 }),
    wind: (c, o, t, p) => noise(c, o, { t, a: .06, d: .14, g: .05 * Math.min(1, p.v ?? .5), type: 'bandpass', f: 500 + 800 * (p.v ?? .5), q: .5, seed: t }),
    trip: (c, o, t) => {
      noise(c, o, { t, a: .005, d: .1, g: .1, type: 'bandpass', f: 1300, f2: 400, q: .8 });
      tone(c, o, { f: 600, f2: 980, t: t + .03, a: .02, d: .25, g: .05, glide: .2 });
    },
    shatter: (c, o, t) => {
      for (let i = 0; i < 12; i++) tone(c, o, { f: 2400 + hash(i) * 2800, t: t + hash(i + .5) * .35, a: .002, d: .06 + hash(i + .2) * .22, g: .025 + hash(i + .7) * .03 });
      noise(c, o, { t, d: .2, g: .06, type: 'highpass', f: 3800 });
      tone(c, o, { f: 180, f2: 70, t, d: .15, g: .12 });
    },
    heart: (c, o, t, p) => {                    // lub-dub
      const g = p.g ?? .25;
      tone(c, o, { f: 64, f2: 46, t, d: .13, g });
      tone(c, o, { f: 58, f2: 42, t: t + .19, d: .15, g: g * .75 });
    },
    breathIn: (c, o, t, p) => { const d = p.d ?? 1.1; noise(c, o, { t, a: d * .75, d: d * .25 + .1, g: .075, type: 'bandpass', f: 650, f2: 1300, q: .6 }); },
    breathOut: (c, o, t, p) => { const d = p.d ?? 1.2; noise(c, o, { t, a: .12, d, g: .05, type: 'bandpass', f: 1100, f2: 420, q: .6 }); },
    scribble: (c, o, t, p) => noise(c, o, { t, a: .004, d: .045, g: .02 + .035 * (p.v ?? .5), type: 'bandpass', f: 2600 + hash(t * 13) * 2200, q: 2.4, seed: t }),
    poof: (c, o, t) => { noise(c, o, { t, d: .18, g: .05, f: 1600, f2: 400 }); tone(c, o, { f: 420, f2: 260, t, d: .1, g: .05 }); },
    chirp: (c, o, t, p) => {
      const k = p.k ?? 1;
      tone(c, o, { f: 2500 * k, f2: 3700 * k, t, a: .004, d: .07, g: .045, glide: .05 });
      tone(c, o, { f: 2900 * k, f2: 4200 * k, t: t + .1, a: .004, d: .08, g: .04, glide: .05 });
    },
    flap: (c, o, t) => noise(c, o, { t, a: .01, d: .06, g: .03, type: 'bandpass', f: 900, q: 1 }),
    blip: (c, o, t, p) => tone(c, o, { f: 1400 + (p.k ?? 0) % 5 * 60, t, a: .002, d: .028, g: .02 }),
    // ---- season 3 ----
    snore: (c, o, t) => { noise(c, o, { t, a: .5, d: .7, g: .05, type: 'bandpass', f: 320, f2: 190, q: .8, brown: true }); tone(c, o, { f: 92, f2: 80, t, a: .4, d: .6, g: .025 }); },
    dab: (c, o, t, p) => {                      // a soft paint dab: tiny pluck, a different note each time
      const f = PENTA[(p.k ?? 0) % 7] * (p.oct ?? .5);
      tone(c, o, { f, t, a: .002, d: .07, g: .045 * (p.g ?? 1) });
      noise(c, o, { t, d: .02, g: .012, type: 'highpass', f: 2500 });
    },
    erase: (c, o, t) => {
      noise(c, o, { t, a: .04, d: .5, g: .08, type: 'bandpass', f: 2400, f2: 300, q: .7 });
      tone(c, o, { f: 520, f2: 140, t, a: .01, d: .45, g: .05 });
    },
    charge: (c, o, t, p) => { const f = PENTA[p.n ?? 0]; tone(c, o, { f: f * .5, f2: f, t, a: .01, d: .35, g: .07, glide: .16 }); bell(c, o, t + .14, f * 2, .03, .6); },
    drain: (c, o, t) => { tone(c, o, { type: 'triangle', f: 660, f2: 300, t, a: .005, d: .32, g: .06, glide: .3 }); },
    thump: (c, o, t, p) => { const g = p.g ?? 1; tone(c, o, { f: 72, f2: 40, t, d: .17, g: .26 * g }); noise(c, o, { t, d: .05, g: .04 * g, f: 320 }); },
    plane: (c, o, t) => { noise(c, o, { t, a: .12, d: .6, g: .05, type: 'bandpass', f: 700, f2: 2600, q: .8 }); S.flap(c, o, t + .05); S.flap(c, o, t + .2); },
    typing: (c, o, t) => { for (let i = 0; i < 3; i++) tone(c, o, { f: 1900 + i * 140, t: t + i * .14, a: .002, d: .03, g: .02 }); },
    tock: (c, o, t, p) => {                     // wooden block / box set down
      const f = p.f ?? 780;
      tone(c, o, { f, t, a: .002, d: .06, g: .1 }); tone(c, o, { f: f * 2.3, t, a: .002, d: .03, g: .03 });
      noise(c, o, { t, d: .025, g: .03, type: 'bandpass', f: 1300, q: 1.5 });
    },
    crash: (c, o, t) => {
      for (let i = 0; i < 9; i++) S.tock(c, o, t + hash(i * 2) * .5, { f: 500 + hash(i) * 500 });
      tone(c, o, { f: 140, f2: 45, t, d: .3, g: .3 }); noise(c, o, { t, d: .3, g: .1, f: 900, f2: 200 });
    },
    // ---- season 4 ----
    drip: (c, o, t, p) => {                     // a water drop: falling pitch, then a tiny bubble
      const k = p.k ?? 1;
      tone(c, o, { f: 1400 * k, f2: 520 * k, t, a: .002, d: .1, g: .12, glide: .06 });
      tone(c, o, { f: 900 * k, f2: 1700 * k, t: t + .05, a: .002, d: .06, g: .05, glide: .05 });
    },
    rain: (c, o, t, p) => noise(c, o, { t, a: .002, d: .03, g: .018 * (p.v ?? 1), type: 'bandpass', f: 3200 + hash(t * 7) * 1800, q: .9, seed: t }),
    stream: (c, o, t, p) => noise(c, o, { t, a: .08, d: .18, g: .035 * (p.v ?? 1), type: 'bandpass', f: 650 + hash(t * 5) * 350, q: .7, seed: t }),
    yawn: (c, o, t) => {
      noise(c, o, { t, a: .5, d: .6, g: .05, type: 'bandpass', f: 480, f2: 880, q: .7 });
      tone(c, o, { type: 'triangle', f: 300, f2: 170, t: t + .1, a: .3, d: .7, g: .025, glide: .9 });
    },
    splash: (c, o, t) => { noise(c, o, { t, d: .26, g: .12, f: 2400, f2: 380 }); tone(c, o, { f: 620, f2: 200, t, d: .12, g: .06 }); },
    flip: (c, o, t) => { noise(c, o, { t, d: .03, g: .045, type: 'bandpass', f: 2600, q: 2 }); tone(c, o, { f: 1200, t: t + .03, d: .02, g: .02 }); },
  };
  // reverb send per sound
  const SEND = { charge: .4, dab: .2, tock: .1, thump: .03, snore: .05, ding: .4, twinkle: .45, swell: .55, chime: .4, arp: .4, sparkle: .5, whistle: .45, chirp: .35, boing: .2, pop: .25, powerDown: .25, dizzy: .3, shatter: .3, blip: .1, step: .05, land: .07, roll: .03, heart: .02 };

  function play(ctx, ev, when) {
    const fn = S[ev.name]; if (!fn) return;
    const out = voice(ctx, { pan: ev.pan ?? 0, send: SEND[ev.name] ?? .15, gain: ev.p.gain ?? 1 });
    fn(ctx, out, Math.max(when, ctx.currentTime ?? 0), ev.p || {});
  }

  // render a loop's events into one seamless buffer: tails past the end wrap to the start
  async function renderLoop(events, T, sr = 48000) {
    const N = Math.round(T * sr), tail = 3;
    const ctx = new OfflineAudioContext(2, N + Math.round(tail * sr), sr);
    for (const ev of events) play(ctx, ev, ev.t);
    const buf = await ctx.startRendering();
    const ch = [0, 1].map(c => {
      const src = buf.getChannelData(c), out = new Float32Array(N);
      for (let i = 0; i < src.length; i++) out[i % N] += src[i];
      return out;
    });
    return { ch, sr, N };
  }

  window.SFX = { play, renderLoop, PENTA, sounds: S };
})();
