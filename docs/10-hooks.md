# 10 · Hooks and pace

The user posts these on Instagram, TikTok, Facebook and YouTube Shorts, where people decide in a moment whether to keep watching. Their note (2026-10-31): the old episodes start slowly, with Wobbin walking until something happens, and people don't have that much patience. **Every new episode opens inside the problem.**

## What the research says

Be honest about the evidence. Nothing here is peer-reviewed, and YouTube publishes no official benchmarks. Most of it comes from creator tools and marketing blogs, so use it for direction and trust our own numbers more. The sources do agree with each other on these points:

- **The decision is fast.** People talk about the first 1 to 3 seconds. One guide says closer to 2 on Shorts, without a source.
- **The hook is the gate.** If 30–40% or more swipe away instantly, the opening is failing, and nothing later can save it.
- **Motion in frame one, plus a text hook,** is described as the most universal opener for vertical video. Text matters more without a human voice, and we have no spoken voice.
- **A clear image straight away:** a finished result or fast action, not setup.
- **Start in the middle.** Open on the most engaging moment and let the story catch up (a cold open, in medias res).
- **Keep changing.** One case study got 85% viewed against 35% for a slow version of the same content, using a new beat every 5 to 7 seconds. It's a single anecdote, but it fits what the user asked for.
- **Change one thing at a time** and compare against your own videos. There's no universal target.

Rough targets people quote for YouTube Shorts: 70–80% "viewed" (not swiped away) is mid to strong. Treat these as a guide only.

Sources: [Emplifi on Reels](https://emplifi.io/?p=23678), [quso.ai benchmarks](https://quso.ai/research/video-retention-benchmarks), [Posteverywhere on hook rate](https://posteverywhere.ai/social-media-terms/hook-rate), [Eliro on hooks](https://eliro.pro/blog/short-form-video-hooks-script-guide-2026), [Bytecap on Shorts retention](https://www.bytecap.io/research/youtube-shorts-retention-benchmarks), [Creator Essentials on viewed vs swiped](https://www.creatoressentials.com/glossary/viewed-vs-swiped-away/), [CapCut on hook formulas](https://www.capcut.com/create/short-form-video-hooks), [Creator Essentials on the cold open](https://www.creatoressentials.com/glossary/cold-open/).

## Our rules

1. **Frame one has the problem in it.** No walking in. If you cover the caption, does the picture alone make you wonder what's going on?
2. **Something is moving in frame one,** mid-action, not about to start.
3. **The words are already on screen in frame one.** Lowercase, under 8 words, readable with the sound off.
4. **Open a question only the ending closes.** Why are there ten bags? Who is that? What happens when the boss turns round?
5. **A new beat every 3 to 4 seconds.** Never more than 4.5 seconds with nothing new.
6. **Three escalations, one turn, a quote, a button.** The same shape as before, in half the time. 24 to 28 seconds.
7. **Don't make them wait at the end.** The quote lands, the button lands, and we're gone. The loop comes round in about 4 seconds.
8. **The first caption says it, not explains it.** "don't. move." beats "my charger is broken".

## Six kinds of hook that suit Wobbin

| Kind | How it works | Example |
|---|---|---|
| **Already too far** | Open at the absurd stage, not the start | One Trip: ten bags raining onto a head |
| **Frozen in a strange pose** | Why is Wobbin like that? | The Angle: "don't. move." |
| **Instant recognition** | The feeling everyone has had, in four words | Hiding: "oh no. someone i know." |
| **A claim that will be broken** | Say it proudly, then take it apart | Payday: "i am rich!" |
| **A strange fact about the place** | Tell us something odd about this world | Say Hi: "nobody has spoken on this bus in six years." |
| **A number that hurts** | A small count we all recognise | Call Mum: "4 missed calls. mum." |

In the colour season the hook is also visual: one spot of colour in a grey world makes people look.

## The story clock

| Time in the video | What happens |
|---|---|
| 0 s | Frame one: problem, motion and words together |
| 0–2 s | The hook finishes landing |
| 2–5 s | Reveal: now we understand it |
| 5–14 s | Three escalations, about 3 seconds each |
| 14–18 s | The worst moment, then the turn |
| 18–23 s | The payoff and the quote |
| 23–25 s | The button, and out |

## How to build it: the fast open

The old loop needed Wobbin far from everything at the seam, which meant 4 seconds walking in and 7 walking out. Don't do that any more:

```js
const LEAVE = 23, OUT = LEAVE + 1.4, LOOP = OUT + 1;
Shorts.play({
  hook: 1.5,                        // when the video opens. The first caption must be fully typed by then
  page: [.8, OUT - 1.2, OUT],       // scene scribbles in by .8 s, rubs out between the last two
  paper: '#ffffff', wash: 0,        // the seam is blank paper: paint the sky and floor in the scene
  loopAfter: LOOP,
  captions: [[.2, 3, 'oh no. *someone i know.*', null, false]],   // starts early, so it's typed by the hook
  init(S) { S.bo = S.addChar({ x: 0, walk: V }); S.pal = S.addChar({ x: 800 }); S.pal.hidden = true; },
  update(S, t) { S.pal.hidden = t < 17 || t > OUT; /* ... */ },
});
```

- The scene can sit right next to Wobbin. The 650-unit rule doesn't apply, because nothing is on screen at the seam except Wobbin and the line.
- `S.bo` still starts and ends walking right at `V`. Reach the first mark by about 0.8 s.
- Friends must be `hidden` in `init` and after `OUT`. Anything drawn in `drawFront` needs the same care, since the page only covers what's behind the characters.
- Leave with one big clean hop over anyone in the way (`bo.jump(780, -1070)`) instead of walking through them.
- The opening caption usually has `voice` set to `false`. Its notes would land before the video's first frame.
- Check the camera returns to normal by `LEAVE`, or the seam won't close.

## Checking it

```bash
node tools/pace.js one-trip hiding
```

It prints the length, the opening time, whether words are on screen in frame one, the longest stretch with no new beat, and how long a viewer waits at the end. It marks anything too slow as `SLOW`. Old episodes all fail it, and that's expected.

Then look at frame one yourself, at full size.

## After posting

Check these in each platform's analytics, and note what you find in `05-episodes.md`:

- YouTube Studio: **viewed vs swiped away**, and the retention curve's first 3 seconds.
- Instagram: plays against reach, and average watch time.
- Compare the new episodes with the old ones, and change one thing at a time.
