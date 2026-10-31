// Batch export for posting: one folder per video in exports/, numbered in posting order, each with the
// 4K vertical MP4, a cover image and a short caption. Served by tools/dev_server.py (POST /export/...).
//   await import('/tools/export.js'); exportAll();            // everything
//   exportAll({ from: 12, to: 20 });                          // just #12 to #20 (run halves in two tabs)
//   exportAll({ only: ['the-chair'], video: false });         // just redo a cover and caption
// Progress: window.EXP (current, pct, done, errors).

// posting order: strongest and most relatable first, the quieter early ones later
export const ORDER = ['battery', 'the-chair', 'seen', 'water-yourself', 'the-gap', 'last-minute', 'did-i-lock-it', 'yes', 'perfect',
  'two-minutes', 'what-if', 'rain-check', 'slow-walker', 'lost', 'why-was-i-here', 'snooze', 'small-talk', 'tomorrow', 'one-more',
  'monday-mountain', 'busy', 'cant-sleep', 'fine', 'imposter', 'highlight-reel', 'the-other-line', 'just-in-case', 'heavy',
  'comfort-zone', 'inner-voice', 'decision', 'small-steps', 'reset', 'bloom', 'the-hill', 'hurry', 'the-seed', 'the-cloud',
  'one-trip', 'call-mum', 'payday', 'say-hi', 'hiding', 'small-wins', 'the-mosquito', 'dance-break', 'the-angle', 'scribble',
  'power-cut', 'the-menu', 'puddles', 'new-pencil'];

const TAGS = {
  battery: 'socialbattery introvert', 'the-chair': 'laundry adulting', seen: 'overthinking texting', 'water-yourself': 'selfcare drinkwater',
  'the-gap': 'courage fear', 'last-minute': 'procrastination deadline', 'did-i-lock-it': 'anxiety overthinking', yes: 'peoplepleaser boundaries',
  perfect: 'perfectionism', 'two-minutes': 'procrastination adulting', 'what-if': 'overthinking anxiety', 'rain-check': 'introvert friends',
  'slow-walker': 'slowdown patience', lost: 'forgetful mondays', 'why-was-i-here': 'forgetful brainfog', snooze: 'morning snooze',
  'small-talk': 'awkward smalltalk', tomorrow: 'procrastination motivation', 'one-more': 'screentime doomscrolling', 'monday-mountain': 'monday mondaymood',
  busy: 'friendship busy', 'cant-sleep': 'insomnia cantsleep', fine: 'mentalhealth itsokay', imposter: 'impostersyndrome selfworth',
  'highlight-reel': 'comparison socialmedia', 'the-other-line': 'patience queue', 'just-in-case': 'overthinking packing', heavy: 'askforhelp friends',
  'comfort-zone': 'comfortzone growth', 'inner-voice': 'selftalk innercritic', decision: 'decisions choices', 'small-steps': 'consistency smallsteps',
  reset: 'baddays newday', bloom: 'kindness passiton', 'the-hill': 'keepgoing motivation', hurry: 'slowdown slowliving', 'the-seed': 'patience growth',
  'the-cloud': 'sadness feelings',
  'one-trip': 'groceries relatable', hiding: 'awkward introvert', 'the-angle': 'charger relatable', 'the-mosquito': 'mosquito cantsleep', payday: 'payday money',
  'small-wins': 'smallwins gratitude', 'say-hi': 'kindness strangers', 'dance-break': 'worklife joy', scribble: 'creativity art', 'call-mum': 'mum family',
  'power-cut': 'blackout stars', 'the-menu': 'food indecisive', puddles: 'innerchild play', 'new-pencil': 'trysomethingnew art',
};

// one short question under the quote, to invite comments (episodes 1-3 went out without one)
const ASK = {
  'water-yourself': 'when did you last drink water?', 'the-gap': 'what are you still standing at the edge of?', 'last-minute': "what's your best last-minute save?",
  'did-i-lock-it': 'how many times do you go back to check?', yes: "what did you say yes to that you wish you hadn't?", perfect: 'what have you redone way too many times?',
  'two-minutes': 'what tiny task have you been avoiding for weeks?', 'what-if': "what's your biggest what-if right now?", 'rain-check': "be honest, what's the last plan you cancelled?",
  'slow-walker': "what's the best thing you've noticed by slowing down?", lost: 'what do you lose the most?', 'why-was-i-here': 'how often does this happen to you?',
  snooze: 'how many alarms do you set?', 'small-talk': "what's your go-to line for awkward silences?", tomorrow: 'what have you been starting "tomorrow" for months?',
  'one-more': "what's your screen time today?", 'monday-mountain': "what's your mountain this week?", busy: 'who have you been meaning to call?',
  'cant-sleep': 'what keeps you up at night?', fine: "who's your person when you're not fine?", imposter: "what's one thing you earned and still doubt?",
  'highlight-reel': "what's one thing your feed never shows?", 'the-other-line': 'do you ever switch lines?', 'just-in-case': "what's the weirdest thing in your bag right now?",
  heavy: 'who do you ask when you need help?', 'comfort-zone': "what's one small step out you're thinking about?", 'inner-voice': 'what would you tell a friend but never tell yourself?',
  decision: 'what decision have you been putting off?', 'small-steps': 'what small thing are you doing every day?', reset: 'what helps you reset after a bad day?',
  bloom: "who's been kind to you lately?", 'the-hill': 'what hill are you pushing up right now?', hurry: 'what are you rushing through right now?',
  'the-seed': 'what are you waiting to see grow?', 'the-cloud': 'what helps on your rainy days?',
  'one-trip': 'how many bags before you admit defeat?', hiding: 'who was the last person you hid from?', 'the-angle': 'what small thing have you been meaning to fix?',
  'the-mosquito': 'who wins in your house?', payday: 'how long does yours last?', 'small-wins': "what's your small win today?", 'say-hi': 'when did a stranger last make your day?',
  'dance-break': 'what song gets your foot tapping?', scribble: 'what would you draw on the wall?', 'call-mum': 'when did you last call home?',
  'power-cut': 'what do you do when the power goes?', 'the-menu': "what's your usual?", puddles: 'what makes you feel like a kid again?', 'new-pencil': 'what new thing are you trying?',
};

const W4 = 2160, H4 = 3840, FPS = 60, BITRATE = 24e6;
window.EXP = { current: null, pct: 0, done: [], errors: [] };

// sent in 8 MB pieces: the browser pane drops single uploads above ~32 MB after a long run
const post = async (path, body) => {
  const blob = body instanceof Blob ? body : new Blob([body]), url = '/export/' + path.split('/').map(encodeURIComponent).join('/'), CH = 8e6;
  for (let o = 0; o === 0 || o < blob.size; o += CH) {
    const r = await fetch(url + (o ? '?append=1' : ''), { method: 'POST', body: blob.slice(o, o + CH) });
    if (!r.ok) throw new Error('save failed: ' + path);
  }
};
const clean = s => s.replace(/[’‘]/g, "'").replace(/[?:/\\*"<>|]/g, '').trim();

async function episodes() {
  // styled episodes need sketch.js; without it they would quietly export in the flat look
  if (!window.Sketch) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = '/sketch.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  await Sketch.ready();
  if (!window.WL_EPISODES) { const src = await (await fetch('/site/js/episodes.js', { cache: 'no-store' })).text(); new Function(src)(); }
  return Object.fromEntries(window.WL_EPISODES.map(e => [e.id, e]));
}
async function story(id) {
  const html = await (await fetch('/' + id + '.html', { cache: 'no-store' })).text(); let st;
  new Function('Shorts', html.match(/<script>\n([\s\S]*?)<\/script>/)[1])(Object.assign(Object.create(Shorts), { play: s => { st = s; } }));
  return st;
}

// the cover: the episode's best moment, with the title on the ground below it (inside Instagram's 3:4 grid crop)
export async function cover(st, loop, ep, w = 1080, h = 1920) {
  await document.fonts.load('80px Silkscreen').catch(() => {});
  const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d');
  // no captions on the cover (a half-typed line looks broken); the title goes below the ground line
  const S = new Shorts.Show(Object.assign(Object.create(st), { captions: [] }), { loop }); S.advance(ep.poster); S.render(ctx, w, h);
  const k = w / 1080, title = ep.title.toUpperCase(), groundY = S.view.oy + Shorts.GROUND * S.view.unit;
  let fs = 112 * k; ctx.font = `${fs}px Silkscreen, monospace`;
  while (ctx.measureText(title).width > 860 * k) { fs -= 4 * k; ctx.font = `${fs}px Silkscreen, monospace`; }
  const y = Math.min(h * .84, Math.max(h * .74, groundY + 150 * k));
  // a paper label, so the title always reads, whatever is behind it
  ctx.save(); ctx.fillStyle = 'rgba(253,249,240,.94)'; ctx.strokeStyle = '#111'; ctx.lineWidth = 5 * k;
  ctx.beginPath(); ctx.roundRect(w * .05, y - fs * .95, w * .9, fs * 2.9, 28 * k); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = '#111'; ctx.fillText(title, w / 2, y);
  // a hand-drawn underline in the episode's colour
  const tw = ctx.measureText(title).width; ctx.strokeStyle = ep.accent; ctx.lineWidth = 12 * k; ctx.lineCap = 'round';
  ctx.beginPath(); for (let i = 0; i <= 20; i++) { const x = w / 2 - tw / 2 + tw * i / 20, yy = y + fs * .72 + Math.sin(i * 1.7) * 3 * k; i ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke();
  ctx.font = `${38 * k}px Silkscreen, monospace`; ctx.fillStyle = '#555'; ctx.fillText("WOBBIN'S LINE", w / 2, y + fs * .72 + 70 * k);
  return new Promise(r => c.toBlob(r, 'image/png'));
}

export async function exportAll({ from = 1, to = 99, only = null, video = true } = {}) {
  const eps = await episodes();
  for (const [i, id] of ORDER.entries()) {
    const n = i + 1; if (n < from || n > to || (only && !only.includes(id))) continue;
    const ep = eps[id], nn = String(n).padStart(2, '0'), folder = `${nn} - ${clean(ep.title)}`, base = `${nn} ${clean(ep.title)}`;
    EXP.current = folder; EXP.pct = 0;
    try {
      const st = await story(id), S0 = new Shorts.Show(st), loop = { T: S0.T, startState: S0.startState };
      await post(`${folder}/${base} cover.png`, await cover(st, loop, ep));
      const tags = ['wobbinsline', 'animation', 'relatable', ...TAGS[id].split(' ')].map(t => '#' + t).join(' ');
      await post(`${folder}/caption.txt`, `${ep.quote}\n${ASK[id] ? ASK[id] + '\n' : ''}\n${tags}\n`);
      if (video) {
        const blob = await Shorts.exportMP4(st, loop, { w: W4, h: H4, fps: FPS, loops: 1, bitrate: BITRATE }, p => EXP.pct = p);
        await post(`${folder}/${base} 4K.mp4`, blob);
        EXP.done.push(`${folder} ${(blob.size / 1e6).toFixed(0)} MB ${S0.T.toFixed(1)}s`);
      } else EXP.done.push(folder);
    } catch (e) { EXP.errors.push(`${folder}: ${e.message || e}`); }
  }
  EXP.current = 'finished';
  return EXP;
}
window.exportAll = exportAll;
