// Headless loop check for episodes, no browser needed:
//   node tools/loopcheck.js lost small-talk battery      (or no ids for every episode)
// Prints each episode's loop length, seam error (should be 0.00), which parts of Bo's state
// differ at the seam, and any other character still within 650 units of Bo at the seam.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
globalThis.window = globalThis;
for (const f of ['sfx.js', 'engine2.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
const { Show } = window.Shorts;

function load(id) {
  const html = fs.readFileSync(path.join(ROOT, id + '.html'), 'utf8');
  const m = html.match(/<script>\r?\n([\s\S]*?)<\/script>/);
  if (!m) throw new Error('no inline story script');
  let story = null;
  const Shorts = Object.assign(Object.create(window.Shorts), { play: s => { story = s; } });
  new Function('Shorts', m[1])(Shorts);
  return story;
}

const NAMES = ['y', 'rot', 'q', 'vx', 'face', 'sit', 'lookX', 'lookY', 'camdx', 'camv', 'camz', 'camy', 'f0x', 'f0y', 'f0r', 'f1x', 'f1y', 'f1r', 'tx', 'ty'];
const near = S => S.chars.filter(c => c !== S.focus && !c.hidden && Math.abs(c.x - S.focus.x) < 650).map(c => Math.round(c.x - S.focus.x));

const ids = process.argv.slice(2).length ? process.argv.slice(2)
  : fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && !['index.html', 'pip-and-the-balloon.html'].includes(f)).map(f => f.slice(0, -5));
let bad = 0;
for (const id of ids) {
  try {
    const story = load(id), S0 = new Show(story);
    const S = new Show(story, { loop: { T: S0.T, startState: S0.startState } });
    const a = S.snapshot(), atStart = near(S); S.advance(S0.T); const b = S.snapshot(), atEnd = near(S);
    const diff = NAMES.map((n, i) => [n, +(b[i] - a[i]).toFixed(2)]).filter(([, d]) => Math.abs(d) > .05);
    const ok = S0.loopErr < .01 && !diff.length && !atStart.length && !atEnd.length;
    if (!ok) bad++;
    console.log(`${ok ? 'ok ' : 'BAD'} ${id.padEnd(16)} T=${S0.T.toFixed(2)}s seam ${S0.loopErr.toFixed(2)}`
      + (diff.length ? ` diff ${JSON.stringify(diff)}` : '')
      + (atStart.length || atEnd.length ? ` others near Bo at seam: start ${JSON.stringify(atStart)} end ${JSON.stringify(atEnd)}` : ''));
  } catch (e) { bad++; console.log(`ERR ${id}: ${e.stack.split('\n').slice(0, 3).join(' | ')}`); }
}
process.exit(bad ? 1 : 0);
