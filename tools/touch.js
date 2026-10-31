// Finds moments where two characters' body outlines really overlap on screen:
//   node tools/touch.js                 (every episode)
//   node tools/touch.js yes battery     (just these)
// tools/overlap.js only compares centre points, so it flags clean hops and misses wide crouches. This one
// compares the drawn outlines, in the widest (16:9) frame. Stacked characters are skipped, and anything
// up to GRAZE deep is thinner than a drawn line. Prints each stretch, how deep it got, and each pair's modes.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
globalThis.window = globalThis;
for (const f of ['sfx.js', 'engine2.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
const { Show } = window.Shorts;
const GRAZE = 2.5;

function load(id) {
  const html = fs.readFileSync(path.join(ROOT, id + '.html'), 'utf8');
  const m = html.match(/<script>\r?\n([\s\S]*?)<\/script>/);
  let story = null;
  new Function('Shorts', m[1])(Object.assign(Object.create(window.Shorts), { play: s => { story = s; } }));
  return story;
}

const inside = (p, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
const distTo = (p, P) => { let d = 1e9; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const ax = P[j][0], ay = P[j][1], bx = P[i][0] - ax, by = P[i][1] - ay, u = Math.max(0, Math.min(1, ((p[0] - ax) * bx + (p[1] - ay) * by) / (bx * bx + by * by || 1))); d = Math.min(d, Math.hypot(p[0] - ax - u * bx, p[1] - ay - u * by)); } return d; };
const points = c => c.outline().map(q => [q.x, q.y]);

const args = process.argv.slice(2);
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
      const half = 660 / S.cam.z.x, seen = Math.abs(A.x - S.cam.x.x) < half && Math.abs(B.x - S.cam.x.x) < half;
      const stacked = A.mode === 'held' || B.mode === 'held';
      let depth = 0;
      if (seen && !A.hidden && !B.hidden && !stacked && Math.abs(A.x - B.x) < 190 && Math.abs(A.y - B.y) < 190) {
        const PA = points(A), PB = points(B);
        for (const p of PA) if (inside(p, PB)) depth = Math.max(depth, distTo(p, PB));
        for (const p of PB) if (inside(p, PA)) depth = Math.max(depth, distTo(p, PA));
      }
      if (depth > .5) {
        const o = open[key] ??= { a, b, t0: t, depth: 0, modes: `${A.mode}/${B.mode}` };
        o.t1 = t; o.depth = Math.max(o.depth, depth);
      } else if (open[key]) { hits.push(open[key]); delete open[key]; }
    }
    S.advance(1 / 60);
  }
  hits.push(...Object.values(open));
  const real = hits.filter(h => h.depth > GRAZE);
  if (real.length) bad++;
  console.log(`${real.length ? 'TOUCH' : 'ok   '} ${id.padEnd(16)}` + real.map(h => ` [${h.a}-${h.b} ${h.t0.toFixed(2)}-${h.t1.toFixed(2)}s depth ${h.depth.toFixed(0)} ${h.modes}]`).join(''));
}
process.exit(bad ? 1 : 0);
