// Finds moments where two characters' bodies overlap or their faces touch ("kissing"):
//   node tools/overlap.js                 (every episode)
//   node tools/overlap.js yes battery     (just these)
// Bodies are about 150 wide, so two characters side by side closer than MIN apart (centre to centre)
// are touching. Stacked characters (one on the other's head) are skipped. Prints each stretch of
// time two characters are too close, how close they got, and whether they were facing each other.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
globalThis.window = globalThis;
for (const f of ['sfx.js', 'engine2.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
const { Show } = window.Shorts;
const MIN = 158;

function load(id) {
  const html = fs.readFileSync(path.join(ROOT, id + '.html'), 'utf8');
  const m = html.match(/<script>\r?\n([\s\S]*?)<\/script>/);
  let story = null;
  new Function('Shorts', m[1])(Object.assign(Object.create(window.Shorts), { play: s => { story = s; } }));
  return story;
}

const WIDE = process.argv.includes('--wide'), args = process.argv.slice(2).filter(a => a !== '--wide');
const ids = args.length ? args
  : fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && !['index.html', 'pip-and-the-balloon.html'].includes(f)).map(f => f.slice(0, -5));
let bad = 0;
for (const id of ids) {
  const story = load(id), S0 = new Show(story), S = new Show(story, { loop: { T: S0.T, startState: S0.startState } });
  const open = {}, hits = [];
  for (let i = 0, n = Math.round(S0.T * 60); i <= n; i++) {
    const t = i / 60;
    for (let a = 0; a < S.chars.length; a++) for (let b = a + 1; b < S.chars.length; b++) {
      const A = S.chars[a], B = S.chars[b], key = a + '-' + b;
      const dx = Math.abs(A.x - B.x), dy = Math.abs(A.y - B.y);
      const stacked = dy > 95 || A.mode === 'held' || B.mode === 'held';
      const half = (WIDE ? 600 : 320) / S.cam.z.x + 60, seen = Math.abs(A.x - S.cam.x.x) < half && Math.abs(B.x - S.cam.x.x) < half;   // only what the frame shows (9:16, or 16:9 with --wide)
      const close = seen && !A.hidden && !B.hidden && !stacked && dx < MIN;
      const facing = (B.x - A.x) * A.dir > 0 && (A.x - B.x) * B.dir > 0;
      if (close) {
        const o = open[key] ??= { a, b, t0: t, min: dx, facing: false };
        o.min = Math.min(o.min, dx); o.facing ||= facing; o.t1 = t;
      } else if (open[key]) { hits.push(open[key]); delete open[key]; }
    }
    S.advance(1 / 60);
  }
  hits.push(...Object.values(open));
  const real = hits.filter(h => h.t1 - h.t0 > .05);
  if (real.length) bad++;
  console.log(`${real.length ? 'TOUCH' : 'ok   '} ${id.padEnd(16)}` + real.map(h => ` [${h.a}-${h.b} ${h.t0.toFixed(1)}-${h.t1.toFixed(1)}s min ${Math.round(h.min)}${h.facing ? ' FACING' : ''}]`).join(''));
}
process.exit(bad ? 1 : 0);
