# 10 · Hooks and pace

The user posts these on Instagram, TikTok, Facebook, YouTube Shorts and Pinterest, where people decide in a moment whether to keep watching. Their note (2026-10-31): the old episodes start slowly, with Wobbin walking until something happens, and people don't have that much patience. **Every new episode opens inside the problem.**

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

Check these in each platform's analytics, and note what you find in `04-lessons-learned.md`:

- YouTube Studio: **viewed vs swiped away**, and the retention curve's first 3 seconds.
- Instagram: plays against reach, and average watch time. Also saves, shares and follows as a percentage of views.
- Compare the new episodes with the old ones, and change one thing at a time.

## Lessons from Digital Income Project (2026-10-31)

The user shared 12 video transcripts from Clay's channel. We took the method, not the tools: no image or video generation, everything goes into our own animation.

Be careful with his numbers. They are his own claims about his own accounts, most of these videos are sponsored by the tools they show, and he makes money from people following him. Everything below is something to test. Nothing is proven for us until our own stats say so.

### How he opens

| Move | What he does | For Wobbin |
|---|---|---|
| **A number first** | 9 of the 12 have a specific number in the first two sentences: "over 180,000 followers", "17 million views" | A count in frame one. Only Call Mum and Say Hi really do this so far |
| **A twist straight after** | "750,000 followers... but there's one thing you should know." "Not real." | Two steps: the claim at 0 s, something breaks it by 2 s |
| **A clock or a bet** | One hour, and his brother's flight leaves in 45 minutes. A first sale in 48 hours | A deadline on screen: "bus in 30 seconds." None of our episodes do this yet |
| **A loss** | "Instagram just deleted my account" | Open at the second it goes wrong: the drop, the crack, the last bar of battery |
| **Talking to you** | "Come a little closer because we need to talk" | Wobbin turns and looks straight at the viewer. Our eye can already do this, and the caption can talk to them |
| **The result first** | He plays the finished video, then explains it | Open on the funniest moment, then go back. The loop can make the end meet it |

His hit stories also have a second person in the conflict from the start: a girlfriend, a parent, a rival. Most of our openings are Wobbin alone. Hiding is the best example of how it could work.

### How he keeps people watching

- **He interrupts at the point people leave.** A heckler says "this is starting to get boring", and he admits "this is when a lot of you leave". For us: a bird or a friend who heckles Wobbin around 4 to 6 seconds, which is where our TikTok viewers go.
- **He shows the low point.** "6 and a half hours later": no sales. Then a jump to the win. A time card ("3 hours later") is a cheap new beat.
- **A second twist.** The clone video reveals itself, then says the footage is still not real.
- **Fast shots.** One reel he studied had 32 cuts in 47 seconds, a new shot every 1.5 seconds. We have a new beat every 3 to 4 seconds and no cuts at all, just one moving camera. This is our biggest gap. Try hard cuts to a close-up of the eye or a prop. The camera runs on springs, so a story would set `S.cam.x.x` and `S.cam.z.x` directly. No episode has tried it yet, so check the seam.
- **He still says the story matters more than the cuts.** Fast cuts on a weak idea won't save it.

### What gets a video pushed

- **Saves, shares and follows from strangers,** as a percentage of views. He says about 7% saves or 4% shares goes viral, on his carousels. We are nowhere near that: Battery had 0.19% saves and 0% shares, and The Chair had 0% and 0.23%.
- **Build the reason to save or send into the video.** One account he studied opens with "repeat these affirmations for 7 days", so people save it. For us the natural one is sending: "send this to your friend who always cancels."
- **The caption does three jobs:** repeats the hook, uses searchable words, and asks for something. Ours has the quote, a question and five hashtags, but the quote rarely repeats the hook and has few searchable words. Search brought 30% of Battery's YouTube views, which fits.

### Finding ideas

- **Look for outliers:** small, recent accounts with far more views than followers. Copy the formula, never the content.
- **Read the scripts of what's working** in relatable animation and pull out the hook structure.
- **When one works, make more like it.**
- **Expect slow results.** He says it took 17 uploads before one passed 2,000 views. We have posted 4.

### A format to try: carousels

He says Reels are crowded and carousels have more room, and that they work without sound. We can make them cheaply: `cover()` in `tools/export.js` already turns any moment of an episode into a PNG. His formula: a bold hook on slide 1, one point per slide, an ask on the last slide, 3:4 or 4:5, not square. Test one before building anything bigger.

### Not for us

- **Swapping our character into someone else's viral video,** or re-uploading anything. It's copying, and he says himself it risks a copyright flag.
- **Stories told as true when they aren't,** drama for its own sake, and rage bait. It isn't our tone.
- **Paying strangers to recover an account,** buying pages, or paying networks to reshare.
- **Trending music, unless the user decides otherwise.** He says every viral video he showed had a trending song. That goes against "no music". If it's ever tried, try it on Instagram only, on one post, and compare.

### Protecting the show

He says he lost 3 million followers to bans with no warning, and a Facebook business page was his only way to reach a person at Meta. So: link the Facebook Page to Instagram (it's on the user's list in `11-posting.md`), keep posting on all five platforms, and keep the website as the home nobody can delete.
