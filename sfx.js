/* sfx.js — synthesized sound effects for the line shorts.
   Everything is built from soft sine/triangle tones and filtered noise with gentle
   envelopes, a little shared reverb and a soft compressor, so it stays clean
   (no hiss, no harsh edges). The master bus is warmed with a low-pass and a high
   shelf cut, attacks never start instantly (no clicks), and quiet ambience beds
   (room, birds, night, rain) sit underneath. The same code plays live in an
   AudioContext and renders offline into an OfflineAudioContext for the MP4 soundtrack. */
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
    const master = ctx.createGain(); master.gain.value = 1.0;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 32;
    // warmth: nothing sharp above ~6 kHz, and a gentle dip in the bright, tiring range
    const warm = ctx.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 6200; warm.Q.value = .5;
    const shelf = ctx.createBiquadFilter(); shelf.type = 'highshelf'; shelf.frequency.value = 3200; shelf.gain.value = -4;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 14; comp.ratio.value = 2.6; comp.attack.value = .006; comp.release.value = .3;
    const verb = ctx.createConvolver(); verb.buffer = ir;
    const verbOut = ctx.createGain(); verbOut.gain.value = .55;
    master.connect(hp); verb.connect(verbOut).connect(hp); hp.connect(warm).connect(shelf).connect(comp).connect(ctx.destination);
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
    a = Math.max(a, .007);                       // never an instant attack: that's the click that sounds "digital"
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
    a = Math.max(a, .005);
    const B = bank(ctx), s = ctx.createBufferSource(); s.buffer = brown ? B.brown : B.white;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.Q.value = q;
    fl.frequency.setValueAtTime(f, t);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + a + d);
    const e = ctx.createGain(); env(e.gain, t, a, g, d);
    s.connect(fl).connect(e).connect(out);
    s.start(t, hash(seed + t) * 2, a + d + .05);
  }
  // a soft glass bell: the upper partials are kept quiet and short so it rings, not pings
  const bell = (ctx, out, t, f, g, d = 1.3) => {
    tone(ctx, out, { f, t, a: .012, d, g });
    tone(ctx, out, { f: f * 2.76, t, a: .01, d: d * .45, g: g * .2 });
    tone(ctx, out, { f: f * 4.2, t, a: .01, d: d * .18, g: g * .05 });
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
      noise(c, o, { t, d: .05 + .03 * v, g: (.07 + .13 * v) * .3, f: (380 + 700 * v) * wob, q: .5, seed: k });
      tone(c, o, { f: 115 * wob, f2: 60, t, d: .07, g: (.08 + .12 * v) * .3 });
    },
    jump: (c, o, t, p) => {                     // a little "fwip" up
      const v = p.v ?? .5;
      noise(c, o, { t, a: .02, d: .14, g: .04 + .07 * v, type: 'bandpass', f: 450, f2: 1900, q: 1.1 });
      tone(c, o, { f: 300, f2: 620, t, a: .01, d: .11, g: .04 + .03 * v });
    },
    land: (c, o, t, p) => {                     // round thud with a soft dust puff
      const v = Math.min(1, p.v ?? .5);
      tone(c, o, { f: 150, f2: 46, t, d: .22, g: (.2 + .35 * v) * .6 });
      noise(c, o, { t, d: .1 + .1 * v, g: (.05 + .12 * v) * .6, f: 800, f2: 220 });
      if (v > .55) S.boing(c, o, t + .05, { pitch: 170, g: .07 * v });
    },
    skid: (c, o, t) => noise(c, o, { t, a: .01, d: .12, g: .05, type: 'bandpass', f: 1500, f2: 600, q: .8 }),
    tap: (c, o, t, p) => {                      // soft screen tap
      const dull = p.dull ?? 0;
      tone(c, o, { f: 1500 - 600 * dull, f2: 1200 - 500 * dull, t, d: .05, g: .075 - .025 * dull });
      noise(c, o, { t, d: .02, g: .02, type: 'bandpass', f: 2200, q: 1.2 });
    },
    pop: (c, o, t, p) => {                      // bubbly blip
      const f = p.pitch ?? 620, dull = p.dull ?? 0;
      tone(c, o, { f: f * (1 - .35 * dull), f2: f * (2.1 - dull), t, d: .09, g: (p.g ?? .15) * (1 - .5 * dull), glide: .05 });
    },
    ding: (c, o, t, p) => bell(c, o, t, p.pitch ?? 1568, p.g ?? .13),
    twinkle: (c, o, t, p) => { const f = Math.min(p.pitch ?? 1568, 1760); bell(c, o, t, f, .045, .6); bell(c, o, t + .09, f * 1.5, .03, .6); },
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
    dizzy: (c, o, t) => { for (let i = 0; i < 4; i++) tone(c, o, { f: [1318.5, 1568, 1318.5, 1760][i], t: t + i * .1, a: .01, d: .14, g: .026, vib: 30, vibRate: 18 }); },
    chime: (c, o, t, p) => marimba(c, o, t, p.f ?? PENTA[p.n ?? 0], p.g ?? .12),
    arp: (c, o, t, p) => (p.notes ?? [0, 2, 4, 5, 7]).forEach((n, i) => marimba(c, o, t + i * (p.gap ?? .07), PENTA[n], p.g ?? .09)),
    sparkle: (c, o, t, p) => { for (let i = 0; i < (p.n ?? 6); i++) bell(c, o, t + hash(i + t) * .5, PENTA[5 + Math.floor(hash(i * 3 + t) * 6)], .025, .45); },
    whoosh: (c, o, t, p) => { const d = p.d ?? .5; noise(c, o, { t, a: d * .45, d: d * .55, g: .06 * (p.v ?? 1), type: 'bandpass', f: 300, f2: 1700, q: .9 }); },
    whistle: (c, o, t, p) => { const d = p.d ?? .8; tone(c, o, { f: p.f ?? 900, f2: p.f2 ?? 1800, t, a: d * .35, d: d * .65, g: .025, glide: d, vib: 6, vibRate: 6 }); },
    brush: (c, o, t) => noise(c, o, { t, a: .09, d: .26, g: .035, type: 'bandpass', f: 1900, f2: 900, q: .7 }),
    tick: (c, o, t, p) => {                     // a little wooden clock tick
      const f = p.tock ? 1300 : 1800;
      noise(c, o, { t, d: .02, g: .07, type: 'bandpass', f, q: 4 });
      tone(c, o, { f: f * .5, t, d: .02, g: .02 });
    },
    ring: (c, o, t) => tone(c, o, { f: 1760, t, a: .01, d: .26, g: .02, vib: 90, vibRate: 20 }),
    wind: (c, o, t, p) => noise(c, o, { t, a: .06, d: .14, g: .05 * Math.min(1, p.v ?? .5), type: 'bandpass', f: 500 + 800 * (p.v ?? .5), q: .5, seed: t }),
    trip: (c, o, t) => {
      noise(c, o, { t, a: .005, d: .1, g: .1, type: 'bandpass', f: 1300, f2: 400, q: .8 });
      tone(c, o, { f: 600, f2: 980, t: t + .03, a: .02, d: .25, g: .05, glide: .2 });
    },
    shatter: (c, o, t) => {
      for (let i = 0; i < 12; i++) tone(c, o, { f: 1700 + hash(i) * 1900, t: t + hash(i + .5) * .35, a: .004, d: .06 + hash(i + .2) * .22, g: .02 + hash(i + .7) * .022 });
      noise(c, o, { t, d: .2, g: .045, type: 'bandpass', f: 2800, q: .8 });
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
      tone(c, o, { f: 2000 * k, f2: 2900 * k, t, a: .01, d: .08, g: .032, glide: .06 });
      tone(c, o, { f: 2300 * k, f2: 3200 * k, t: t + .11, a: .01, d: .09, g: .028, glide: .06 });
    },
    flap: (c, o, t) => noise(c, o, { t, a: .01, d: .06, g: .03, type: 'bandpass', f: 900, q: 1 }),
    // caption typing: a muted typewriter key, never the same twice
    blip: (c, o, t, p) => { const k = p.k ?? 0; tone(c, o, { f: 760 + hash(k * 1.7) * 160, t, a: .006, d: .03, g: .005 }); noise(c, o, { t, d: .012, g: .006, type: 'bandpass', f: 1800 + hash(k) * 600, q: 1.5 }); },
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
    // ---- a voice: a soft murmured syllable, vowel from the letter, pitch per speaker ----
    voice: (c, o, t, p) => {
      const ch = (p.ch || 'a').toLowerCase(), k = p.k ?? 0;
      const vow = 'aeiou'.includes(ch) ? ch : 'aeiouaeo'[(ch.charCodeAt(0) || 0) % 8];
      const [f1, f2] = { a: [760, 1180], e: [470, 1700], i: [340, 2000], o: [500, 860], u: [370, 760] }[vow];
      const wob = 1 + (hash(k * 1.31) - .5) * .14, rise = p.rise ? 1 + .22 * Math.min(1, p.rise) : 1;
      const f0 = 236 * (p.pitch ?? 1) * wob * rise, d = p.last ? .13 : .075, g = .032 * (p.g ?? 1);
      const osc = c.createOscillator(); osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f0 * 1.05, t); osc.frequency.exponentialRampToValueAtTime(f0 * (p.last ? .86 : .97), t + d);
      const soft = c.createBiquadFilter(); soft.type = 'lowpass'; soft.frequency.value = 2400; soft.Q.value = .4;
      const e = c.createGain(); e.gain.setValueAtTime(.0001, t); e.gain.linearRampToValueAtTime(g, t + .016);
      e.gain.setValueAtTime(g * .8, t + d * .6); e.gain.exponentialRampToValueAtTime(.0001, t + d + .03);
      osc.connect(soft);
      for (const [f, q, gg] of [[f1, 5, .7], [f2, 7, .32]]) { const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; const bg = c.createGain(); bg.gain.value = gg; soft.connect(bp).connect(bg).connect(e); }
      e.connect(o); osc.start(t); osc.stop(t + d + .06);
    },
    // ---- season 6/7: ambience beds, voices and props ----
    // beds hold steady for p.d seconds (they loop with the film, so a bed can run the whole episode)
    room: (c, o, t, p) => bed(c, o, { t, d: p.d ?? 10, g: .022 * (p.g ?? 1), f: p.f ?? 420, brown: true }),
    birds: (c, o, t, p) => {                    // a soft morning: a far bed of air plus a few distant tweets
      const d = p.d ?? 10; bed(c, o, { t, d, g: .012 * (p.g ?? 1), f: 1400, type: 'bandpass', q: .4 });
      for (let i = 0, n = Math.floor(d / 1.9); i < n; i++) if (hash(i * 3.1 + t) > .45) S.tweet(c, o, t + i * 1.9 + hash(i + t) * 1.2, { k: .8 + hash(i * 5 + t) * .4, g: .5 * (p.g ?? 1) });
    },
    tweet: (c, o, t, p) => { const k = p.k ?? 1, g = .022 * (p.g ?? 1); tone(c, o, { f: 1900 * k, f2: 2500 * k, t, a: .015, d: .07, g, glide: .06 }); tone(c, o, { f: 2100 * k, f2: 1700 * k, t: t + .1, a: .015, d: .09, g: g * .8, glide: .08 }); },
    night: (c, o, t, p) => {                    // crickets far away over a dark room tone
      const d = p.d ?? 10; bed(c, o, { t, d, g: .03 * (p.g ?? 1), f: 300, brown: true });
      for (let x = .3; x < d - .4; x += .62 + hash(x * 7 + t) * .3) for (let j = 0; j < 3; j++) tone(c, o, { f: 3300 + hash(x) * 200, t: t + x + j * .055, a: .008, d: .03, g: .006 * (p.g ?? 1) });
    },
    rainbed: (c, o, t, p) => bed(c, o, { t, d: p.d ?? 10, g: .05 * (p.g ?? 1), f: p.f ?? 1700, type: 'bandpass', q: .5 }),
    windbed: (c, o, t, p) => bed(c, o, { t, d: p.d ?? 10, g: .04 * (p.g ?? 1), f: 520, type: 'bandpass', q: .6, brown: true, lfo: .18 }),
    pad: (c, o, t, p) => {                      // a long, warm chord for the quiet emotional turn
      const r = p.root ?? 261.63, d = p.d ?? 6, g = p.g ?? 1;
      for (const [m, gg, det] of [[1, .032, -2], [1.5, .022, 3], [2, .018, -3], [2.5, .01, 2], [.5, .02, 0]]) {
        const osc = c.createOscillator(), e = c.createGain(), lp = c.createBiquadFilter(); osc.type = 'triangle';
        osc.frequency.value = r * m; osc.detune.value = det; lp.type = 'lowpass'; lp.frequency.value = 1400;
        e.gain.setValueAtTime(.0001, t); e.gain.linearRampToValueAtTime(gg * g, t + Math.min(1.8, d * .3));
        e.gain.setValueAtTime(gg * g, t + d * .6); e.gain.linearRampToValueAtTime(.0001, t + d);
        osc.connect(lp).connect(e).connect(o); osc.start(t); osc.stop(t + d + .05);
      }
    },
    pluck: (c, o, t, p) => {                    // a soft nylon-string pluck
      const f = p.f ?? PENTA[p.n ?? 0] * (p.oct ?? .5), g = p.g ?? .1;
      tone(c, o, { type: 'triangle', f, t, a: .006, d: .55, g });
      tone(c, o, { f: f * 2, t, a: .006, d: .25, g: g * .3 });
      noise(c, o, { t, d: .015, g: g * .12, type: 'bandpass', f: f * 3, q: 2 });
    },
    musicbox: (c, o, t, p) => (p.notes ?? [0, 2, 4, 2, 7]).forEach((n, i) => bell(c, o, t + i * (p.gap ?? .28), PENTA[n] * (p.oct ?? 1), p.g ?? .035, 1.1)),
    hum: (c, o, t, p) => {                      // Bo humming a little tune: soft, breathy, sliding between notes
      const notes = p.notes ?? [2, 4, 5, 4, 2], gap = p.gap ?? .32, g = p.g ?? .05;
      notes.forEach((n, i) => {
        const f = PENTA[n] * .5, f0 = i ? PENTA[notes[i - 1]] * .5 : f;
        tone(c, o, { type: 'triangle', f: f0, f2: f, t: t + i * gap, a: .06, d: gap * 1.1, g, glide: .06, vib: 3, vibRate: 5.5 });
      });
    },
    laugh: (c, o, t, p) => { const k = p.k ?? 1; for (let i = 0; i < (p.n ?? 3); i++) tone(c, o, { type: 'triangle', f: (560 - i * 30) * k, f2: (480 - i * 30) * k, t: t + i * .15, a: .015, d: .1, g: .045 * (p.g ?? 1), vib: 14, vibRate: 30 }); },
    gasp: (c, o, t) => noise(c, o, { t, a: .06, d: .16, g: .06, type: 'bandpass', f: 900, f2: 1700, q: .7 }),
    knock: (c, o, t, p) => { for (let i = 0; i < (p.n ?? 3); i++) { tone(c, o, { f: 190, f2: 120, t: t + i * .17, a: .006, d: .09, g: .16 }); noise(c, o, { t: t + i * .17, d: .03, g: .05, type: 'bandpass', f: 700, q: 1.2 }); } },
    door: (c, o, t) => { tone(c, o, { f: 230, f2: 300, t, a: .2, d: .5, g: .025, vib: 20, vibRate: 11 }); S.knock(c, o, t + .6, { n: 1 }); },
    jingle: (c, o, t, p) => { for (let i = 0; i < (p.n ?? 6); i++) bell(c, o, t + hash(i + t) * .3, 2200 + hash(i * 3 + t) * 900, .012, .35); },
    zip: (c, o, t, p) => noise(c, o, { t, a: .02, d: p.d ?? .3, g: .045, type: 'bandpass', f: 900, f2: 2600, q: 2.2 }),
    rustle: (c, o, t, p) => { for (let i = 0; i < (p.n ?? 3); i++) noise(c, o, { t: t + i * .07 + hash(i + t) * .04, a: .01, d: .07, g: .03, type: 'bandpass', f: 1600 + hash(i * 2 + t) * 900, q: .8, seed: t + i }); },
    creak: (c, o, t) => tone(c, o, { type: 'triangle', f: 210, f2: 170, t, a: .08, d: .4, g: .02, vib: 25, vibRate: 14 }),
    baa: (c, o, t, p) => { const k = p.k ?? 1; tone(c, o, { type: 'triangle', f: 410 * k, f2: 350 * k, t, a: .04, d: .45, g: .04, vib: 22, vibRate: 8 }); tone(c, o, { f: 820 * k, f2: 700 * k, t, a: .04, d: .3, g: .01, vib: 22, vibRate: 8 }); },
    umbrella: (c, o, t) => { noise(c, o, { t, a: .02, d: .18, g: .08, f: 500, f2: 1800 }); tone(c, o, { f: 140, f2: 90, t, d: .12, g: .07 }); },
    bus: (c, o, t, p) => { bed(c, o, { t, d: p.d ?? 4, g: .06, f: 160, brown: true }); tone(c, o, { f: 55, t, a: .6, d: (p.d ?? 4) - .6, g: .03 }); },
    hiss: (c, o, t) => noise(c, o, { t, a: .02, d: .35, g: .04, type: 'bandpass', f: 2400, q: .7 }),
    honk: (c, o, t) => { tone(c, o, { type: 'triangle', f: 392, t, a: .02, d: .25, g: .05 }); tone(c, o, { type: 'triangle', f: 494, t, a: .02, d: .25, g: .035 }); },
    bulb: (c, o, t) => { bell(c, o, t, 1318.5, .04, .9); bell(c, o, t + .08, 1975.5, .025, .9); },
    toss: (c, o, t, p) => tone(c, o, { f: (p.pitch ?? 300), f2: (p.pitch ?? 300) * 1.6, t, a: .01, d: .1, g: .05, glide: .08 }),
    catch: (c, o, t, p) => { tone(c, o, { f: (p.pitch ?? 520), t, a: .006, d: .06, g: .07 }); noise(c, o, { t, d: .02, g: .02, type: 'bandpass', f: 1200, q: 1 }); },
  };
  // a held ambience bed: loops a noise buffer, fades in and out, optional slow wobble
  function bed(ctx, out, { t, d, g, f, type = 'lowpass', q = .7, brown = false, lfo = 0 }) {
    const B = bank(ctx), s = ctx.createBufferSource(); s.buffer = brown ? B.brown : B.white; s.loop = true;
    const fl = ctx.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const e = ctx.createGain(), fade = Math.min(1.2, d * .25);
    e.gain.setValueAtTime(.0001, t); e.gain.linearRampToValueAtTime(g, t + fade);
    e.gain.setValueAtTime(g, t + d - fade); e.gain.linearRampToValueAtTime(.0001, t + d);
    if (lfo) { const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = lfo; lg.gain.value = f * .45; l.connect(lg).connect(fl.frequency); l.start(t); l.stop(t + d + .05); }
    s.connect(fl).connect(e).connect(out); s.start(t, hash(t) * 2); s.stop(t + d + .05);
  }
  // reverb send per sound
  const SEND = { voice: .12, room: 0, birds: .3, tweet: .35, night: .2, rainbed: .1, windbed: .1, pad: .5, pluck: .3, musicbox: .45, hum: .25, laugh: .2, gasp: .1, knock: .12, door: .15, jingle: .3, zip: .05, rustle: .08, creak: .1, baa: .2, umbrella: .1, bus: .05, hiss: .1, honk: .2, bulb: .4, toss: .15, catch: .1, charge: .4, dab: .2, tock: .1, thump: .03, snore: .05, ding: .4, twinkle: .45, swell: .55, chime: .4, arp: .4, sparkle: .5, whistle: .45, chirp: .35, boing: .2, pop: .25, powerDown: .25, dizzy: .3, shatter: .3, blip: .1, step: .05, land: .07, roll: .03, heart: .02 };

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
