// Regression check for story beats: every gag makes a sound, so if a beat stops firing after an
// engine change, its sound event disappears from the list.
//   node tools/events.js save            (record every episode's events to tools/out/events.json)
//   node tools/events.js diff [ids...]   (compare against the record)
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'tools/out/events.json');
globalThis.window = globalThis;
for (const f of ['sfx.js', 'engine2.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
const { Show } = window.Shorts;
const SKIP = new Set(['step', 'voice', 'blip', 'skid', 'land', 'jump', 'wind', 'rain', 'roll', 'scribble', 'erase', 'stream']);

function load(id) {
  const html = fs.readFileSync(path.join(ROOT, id + '.html'), 'utf8');
  const m = html.match(/<script>\n([\s\S]*?)<\/script>/);
  let story = null;
  new Function('Shorts', m[1])(Object.assign(Object.create(window.Shorts), { play: s => { story = s; } }));
  return story;
}
function events(id) {
  const story = load(id), S0 = new Show(story), S = new Show(story, { loop: { T: S0.T, startState: S0.startState } });
  const ev = []; S.onSfx = e => { if (!SKIP.has(e.name)) ev.push([e.name, +e.t.toFixed(2)]); };
  for (let i = 0, n = Math.round(S0.T * 60); i < n; i++) S.advance(1 / 60);
  return ev;
}

const [mode, ...rest] = process.argv.slice(2);
const ids = rest.length ? rest : fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && !['index.html', 'pip-and-the-balloon.html'].includes(f)).map(f => f.slice(0, -5));
if (mode === 'save') {
  const all = {}; for (const id of ids) all[id] = events(id);
  fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(all));
  console.log('saved', ids.length);
} else {
  const old = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  for (const id of ids) {
    if (!old[id]) { console.log('new ', id); continue; }
    const a = old[id], b = events(id), count = l => l.reduce((m, [n]) => (m[n] = (m[n] || 0) + 1, m), {});
    const ca = count(a), cb = count(b), names = [...new Set([...Object.keys(ca), ...Object.keys(cb)])];
    const lost = names.filter(n => (cb[n] || 0) < (ca[n] || 0)).map(n => `${n} ${ca[n]}->${cb[n] || 0}`);
    const gained = names.filter(n => (cb[n] || 0) > (ca[n] || 0)).map(n => `${n} ${ca[n] || 0}->${cb[n]}`);
    // beats that moved by more than half a second
    const moved = []; const used = new Set();
    for (const [n, t] of a) { const j = b.findIndex(([m, u], k) => m === n && !used.has(k) && Math.abs(u - t) < .5); if (j >= 0) used.add(j); else moved.push(`${n}@${t}`); }
    const ok = !lost.length && !gained.length && !moved.length;
    console.log(`${ok ? 'same' : 'DIFF'} ${id.padEnd(16)}` + (lost.length ? ' lost: ' + lost.join(', ') : '') + (gained.length ? ' gained: ' + gained.join(', ') : '') + (moved.length ? ' moved: ' + moved.slice(0, 8).join(' ') : ''));
  }
}
