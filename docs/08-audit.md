# 08 · Full audit before posting (2026-10-28)

We watched all 33 episodes frame by frame (contact sheets at 16 points each), measured every
sound, and read the engine, the sound code and every story. This is what holds the show back,
what's already fixed, and the order to fix the rest.

## The three big problems

1. **Every ending is lonely.** In almost every episode the friend leaves (the bus, the party, the
   bench), and the last 6–8 seconds are Wobbin walking alone into an empty white frame while a slow
   chord fades in and a "you don't have to..." line fades out. Each part is fine; together, 33 times,
   they feel sad. This is exactly what viewers noticed.
2. **The background sound.** Ten episodes ran a steady noise bed under the whole film (room tone,
   "birds" air, night, rain, wind). They measured 12–25 dB *louder* than the footsteps and caption
   voice, so the hiss was the loudest continuous thing you heard. MP4 export normalizes to the
   loudest peak, which can push it up further.
3. **The first 3–6 seconds are empty.** Every episode opens on Wobbin walking on a blank line; the
   first caption arrives at 5–7 s. On Reels and TikTok most people decide in the first second.

## Fixed now (engine-wide, all 33 episodes, seams still 0.00)

**Sound** (`sfx.js`)
- No more noise beds. `room` is silent; `birds` is only a few distant tweets; `night` is sparse
  crickets; `rainbed` is soft scattered plinks; `windbed` is a soft gust every few seconds. All
  15–20 dB quieter than before (−60 to −69 dB vs −40 to −52 dB).
- `swell` (in 28 episodes, at the turn) was a slow sine chord with a 1.1 s fade-in, the loudest
  sound in the show (about −26 dB). It's now a bright rolled marimba chord landing on a bell, at
  chime level (−33 dB). Same name, so every episode picked it up.
- `pad` (Inner Voice, Fine, Can't Sleep) was a 6–7 s droning chord; now a slow rolled pluck chord, twice.
- `heart` 4 dB softer, `rumble` 4 dB softer, `bus` engine 6 dB softer.

**Look** (`engine2.js`)
- **Warm paper:** every frame is multiplied by a cream sheet with faint fibres and a gentle
  vignette. Whites are never screen-white, which also gives the video an edge against Instagram's
  white UI. Stories can opt out with `paperFinish: false` (the site's own scenes do).
- **Ground tone:** a very light tone under the line, so the bottom third of a 9:16 frame reads as
  ground instead of blank paper. It follows hills.
- **Contact shadows** under every character; they shrink and fade on a jump. Characters now sit on
  the line instead of floating over it.
- **Eye catchlight:** a tiny highlight in every pupil.
- **Saccades:** when a character stands still, the eye makes tiny quick darts at uneven moments,
  the way real eyes do. Off while walking, so seams are untouched.

## Done

### 1 · New endings ✓ (2026-10-28, all 33)
Rule from now on: **the quote is not the last beat.** After the quote comes a 2–4 s *button*
(a small joke or a moment of company), then a happy hop and walk-off with a soft hum.
Wobbin rarely ends alone; friends who leave run ahead at about 2× speed so they're out of frame
by the seam. Every story has a `// Button:` comment at the top describing its ending.

| Episode | The button |
|---|---|
| The Cloud | A tiny smiling cloud drops in over Wobbin, who braces for rain; it waters the sprout instead and floats off. |
| The Seed | Wobbin plants the fruit, sits and stares at it, catches itself: "not watching. *nope.*" |
| The Gap | A tiny crack opens ahead. A flat look, "pfft. *easy.*", and a hop. |
| One More | The butterfly perches on the tuft; a heart; it flutters off ahead. |
| The Hill | Wobbin braces for one more huge push; the ball zips off at a touch and Wobbin lurches into air. |
| Bloom | A bee circles, perches on Wobbin's tuft flower, then carries the flower off. |
| Hurry | The snail zooms past Wobbin with speed lines. A stare, a laugh. |
| What If | The bird comes back, perches on the tuft, tweets, and flies on ahead. |
| Last Minute | The sign flips from ✓ back to 7. "...one whole *week.*" A laugh. |
| Yes | A friend with a moving box: "help me *move?*" "*no.*" "*ok!*" Both laugh. |
| Perfect | Wobbin paints a wobbly heart on purpose; the ladybug settles into its gap. |
| Battery | Two friends tiptoe over and sit with Wobbin: "*shh...*" "quiet party?" "*yes.*" |
| Seen | Wobbin replies with ten hearts; the overloaded plane sags, wobbles, and just makes it. |
| Tomorrow | A second flag springs up. Wobbin nearly sits, then "*today.*" and jogs past it. |
| Highlight Reel | Wobbin holds up a picture of its own muddy day; a friend cheers "*best one yet!*" |
| Small Steps | A frog rides a leaf down the stream, sits on Wobbin's head ("*ribbit.*"), splashes off. |
| Snooze | Next morning the alarm bird finds Wobbin already up: "*morning!*" The bird faints. |
| Reset | A new rock on the fresh line: "not today, *rock.*" A neat hop and a wink. |
| Monday Mountain | A tiny mountain with its own storm cloud: "oh. *tuesday.*" Hopped. |
| Imposter | A bow-off with the friends; Wobbin wins it with a front flip. |
| Decision | A new friend at a fork: "which way?" Wobbin, the expert now: "*this* way!" |
| Busy | The birthday cake bounces into Wobbin's face. Deadpan, then both laugh. |
| Rain Check | Wobbin dances terribly and loves it; "*nice moves!*"; everyone copies. |
| The Other Line | A kid stares at the giant cone: "*whoa...*" Wobbin shares the top scoops. "*yay!*" |
| Why Was I Here? | Wobbin forgets once more; the plant gets its own thought bubble. "oh, right! *thanks.*" |
| Lost | On the doorstep: "...where's my *phone?*" It buzzes by the plant. Wobbin looks up hopefully: just keys. |
| Small Talk | A new stranger; this time Wobbin speaks first: "hi! nice *weather?*" "*lovely!*" |
| Can't Sleep | A last sheep dozes on the bed and takes the warm spot: "sleep tight, *sheep.*" |
| Just in Case | Rain at the picnic; the one umbrella Wobbin kept pops open over everyone: "*just in case!*" |
| Heavy | A stranger can't reach a balloon in the tree. "need a *hand?*" Wobbin becomes the step. |
| Fine | A rainbow over the bench; a shoulder bump, hearts, both laugh. |
| Comfort Zone | A sky-high header; the ball drops back and balances on Wobbin's head. "*nice!*" |
| Inner Voice | The buddy tries a header and gets bonked: "*oops!*" "nice *try!*" |

**Quotes changed** (lighter, fewer "you don't have to..."): Battery "it's okay to need quiet.
*real friends get it.*", Tomorrow "ready or not... *just start.*", Imposter "you did earn it.
*you belong here.*", Can't Sleep "tomorrow is tomorrow's *problem.*", Just in Case "pack light.
keep *one umbrella.*", Fine "not fine? that's *fine* too."

**Lengths went up** by 2–7 s (most episodes are now 36–49 s; Last Minute 55 s, The Hill 59 s).
The walk-off tails are the easiest place to trim later.

## Still to do, in order

### 2 · Hook in the first second
- Show the odd thing in the first frame (the gap, the cloud, the line of people), and the first
  caption by 0.5–1 s. The empty walk-in should be under 1.5 s.
- Option that keeps the loop: export each MP4 **starting at the hook** (e.g. 5 s in) and wrapping
  around. The walk-off then flows into the opening, so the video ends where it begins and people
  watch it twice. Needs a `start` offset in `exportMP4` (video and the soundtrack buffer).

### 3 · More life in the acting (engine)
- **A brow.** One short line above the eye would roughly triple Wobbin's range (worried, cheeky,
  determined, sceptical) for almost no drawing cost.
- **Walk moods:** `cmd.mood` changes step lift, bob, cadence and lean: happy bounce, sad shuffle,
  sneak, hurry. Use the bounce for every walk-off.
- **Idle fidgets:** after ~2.5 s standing, small automatic actions: look around, tuft flick,
  weight shift, a foot tap.
- **Takes and holds:** a quick double-take (snap look, hold, squash) on reveals; a stretched hold
  before big moments. The motion is smooth but very even; comedy needs sharper contrast in timing.
- **Emotion marks** (manga-style): sweat drop, anger cross, sparkle, sigh puff, drawn in the same ink.

### 4 · Colour and objects
- The PICO-8 reds and yellows (`#ff004d`, `#ffec27`) are much louder than the pastel friends and
  the soft skies. Keep 8-bit, but tune a house palette: one signature blue (`#3B7DD8`), one warm
  accent per episode, pastels for friends, slightly softened red and yellow.
- Pixel props mix with ink-line props. Pixel works for icons (hearts, battery, notes, stars);
  big pixel blobs like Battery's tree read as placeholders. Draw scenery in ink, keep pixels for icons.
- Vary line weight: characters 6, props 5, far scenery 4 in a lighter ink, for depth.

### 5 · Built for each platform
- **Instagram Reels / TikTok / Shorts:** 9:16, keep text out of the top ~12% and the bottom ~25%
  and the right ~15%. Our ground at 64% and captions at 15% fit; don't go higher with captions.
  Make a cover frame for each episode (the funniest moment plus the title).
- **LinkedIn / Instagram feed:** add a **4:5** export (1080×1350). Most LinkedIn viewers watch
  muted, so the episodes that read without sound go there first (The Gap, Battery, Last Minute, Lost).
- Lengths: 30–45 s is fine for Reels; consider tighter 20–25 s cuts for TikTok.

## How we checked
- Contact sheets: `tools/out/sheets/<id>.png` (before) and `<id>-v3.png` (after), via `tools/sheet.js`.
- Loudness: `measure()` in `tools/sheet.js`, 1.2 s window (3–6 s for beds).
- Every episode's `seam error` is still 0.00 after these changes.
