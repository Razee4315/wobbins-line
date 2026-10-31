// Is an episode fast enough for a feed?  node tools/pace.js one-trip hiding   (or no ids for every episode)
// Prints when the video opens, how long it is, whether words are already on screen in the first frame,
// how long the viewer waits at the end for the loop to come round, and the longest stretch with no new beat.
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
globalThis.window = globalThis;
for (const f of ['sfx.js', 'engine2.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
const { Show } = window.Shorts;
const QUIET = new Set(['step', 'voice', 'blip', 'skid', 'wind', 'rain', 'roll', 'night', 'birds', 'rainbed', 'windbed', 'room']);

function load(id) {
  const m = fs.readFileSync(path.join(ROOT, id + '.html'), 'utf8').match(/<script>\r?\n([\s\S]*?)<\/script>/);
  let story = null;
  new Function('Shorts', m[1])(Object.assign(Object.create(window.Shorts), { play: s => { story = s; } }));
  return story;
}

const ids = process.argv.slice(2).length ? process.argv.slice(2)
  : fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && !['index.html', 'pip-and-the-balloon.html'].includes(f)).map(f => f.slice(0, -5));
let bad = 0;
for (const id of ids) {
  const story = load(id), S0 = new Show(story), S = new Show(story, { loop: { T: S0.T, startState: S0.startState } });
  const beats = []; S.onSfx = e => { if (!QUIET.has(e.name)) beats.push(e.t); };
  for (let i = 0, n = Math.round(S0.T * 60); i < n; i++) S.advance(1 / 60);
  const caps = story.captions || [], hook = S0.hook, T = S0.T;
  for (const [a] of caps) beats.push(a);
  beats.sort((a, b) => a - b);
  // the longest gap between beats, from the hook to the last caption
  const end = Math.max(...caps.map(c => c[1])), list = [hook, ...beats.filter(t => t > hook && t < end), end];
  let gap = 0, at = 0; for (let i = 1; i < list.length; i++) if (list[i] - list[i - 1] > gap) { gap = list[i] - list[i - 1]; at = list[i - 1]; }
  const first = caps[0], typed = first ? first[0] + Math.min(1.3, first[2].replace(/\*/g, '').length * .055) : 1e9, wordsAtOnce = first && hook >= typed && hook <= first[1];
  // how long the viewer waits at the end: from the last thing that happens (a button counts) round to the opening frame
  const last = Math.max(end, ...beats.filter(t => t < (story.page ? story.page[1] : T)));
  const tail = T - last + hook;
  const ok = wordsAtOnce && gap <= 4.5 && tail <= 5.5 && T <= 34;
  if (!ok) bad++;
  console.log(`${ok ? 'ok ' : 'SLOW'} ${id.padEnd(17)} ${T.toFixed(1).padStart(4)}s  opens ${hook.toFixed(1)}  words in frame one: ${wordsAtOnce ? 'yes' : 'NO '}  longest gap ${gap.toFixed(1)}s at ${at.toFixed(1)}  wait at end ${tail.toFixed(1)}s`);
}
process.exit(bad ? 1 : 0);
