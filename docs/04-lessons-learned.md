# 04 · Lessons learned

A running log. Newest at the top. When something breaks, write down what happened and the fix.

## 2026-11-01 · Day 5, and the first post on Threads

- Threads posts fine from the website through Claude in Chrome. No cover step showed up, and the Instagram bio didn't carry over.
- Chrome dropped the whole tab group just before YouTube's Publish click. The upload was safe as a draft, so check the platform's own list before uploading again, or the video goes out twice.
- Facebook had fallen back to the personal profile again. The check in `11-posting.md` caught it before anything was uploaded.
- Pinterest's pencil on the video is the design editor, not the cover picker.
- A public group's own filter can decline every video. Wholesome memes did it within minutes, with "video not allowed", and its rules never say so. The group's video tab shows this before you post.
- Attaching a video moves Facebook's text box, so a click at the old spot missed and the typing went to the keyboard shortcuts. Type first, then attach.

## 2026-10-31 · Season 12: hard cuts and the new hooks

- **`overlap.js` only compares centre points, so it's a list of places to look, not a verdict.** Testing the real body outlines across all 57 episodes, most of its flags never touch, and it missed one that did (Small Talk). Six episodes had real contact, now fixed: Yes, Battery, Small Talk, Puddles, Power Cut and Say Hi. What's left are grazes of 2 units or less, thinner than a drawn line (Battery, Dance Break, Fine, Slow Walker).
- **Why bodies touched:**
  - Personal space ignores anyone in the air, so a friend hopping lets the next one walk into them (Yes).
  - Crouching widens a body, so two people crouching 180 apart overlap, and a jump's wind-up adds to it (Small Talk). Stand them about 205 apart.
  - A hop needs a run-up too. Don't let a small hop land beside the person a bigger hop is meant to clear (Puddles), and work out where a long hop comes down (Power Cut).
  - A hop keeps the speed it started with, so a runner who hops while still accelerating drops back and the group bunches up (Battery).
- **Heavy: a friend landed on another friend.** When the tower fell, blue slid through pink for about half a second. Blue now gets a stronger throw. Personal space was quietly setting where pink, and so Wobbin, ended up, so changing the throw alone let Wobbin walk onto the crate and away from the balloon tower. Pink's mark now says that spot outright. If you move one character, compare everyone's positions before and after, not just the seam. The 0.1 s flag left at 30.6 s is blue still in the air beside pink, with clear space between them.
- **The tools now read both line endings.** Git's `core.autocrlf` checks episodes out with Windows line endings, and six tools matched `<script>\n`, so 52 of the 57 episodes crashed them in a fresh worktree. They match `\r?\n` now, and the older notes below about CRLF breaking the tools no longer apply.
- **Hard cuts keep the seam at 0.00,** even with 24 in one episode. How to do them is in `10-hooks.md`.
- **Captions fade when the camera is close.** The shader picks its line blur from the zoom, so the thin letters go first. Thicken them for those shots (`bold()` in any Season 12 episode). It has to check it's the caption pass, or it stays on and repaints the next frame's lines in the caption's colour. We saw that as a red bus.
- **The mixed look gets blotchy past zoom 3.** Give close-ups a finer tooth: `style` can be a function of the camera, and `grain` and `hatchScale` go up in steps of .5.
- **Check `tools/out` full-size frames for what's behind each caption.** The contact sheet hid a moon, a marquee, an awning, a street clock and a row of windows, all in the worst possible place.
- **A lying character's eye turns with the body.** `flat` becomes two upright lines that read as "ID". Use `open` or `closed`, and remember that look directions turn too.
- **A slow camera can lose Wobbin at the seam.** After a big exit hop, the default spring lags so far that the last second is empty paper. Tighten `camGoal.kx` after `LEAVE`.
- **`drawFront` things show on the blank page.** A glass and a box of popcorn floated at the seam. Put props in `drawBack`, or check `S.pageEdge(v, t)` the way the engine does for friends.
- **Wheels and door shots.** The bus's rear wheel sat right behind Wobbin's legs in the key shot. Before drawing a big prop, work out where Wobbin stands against it.
- **`heart` is loud.** It measures −31 dB even at `g: .5`, above the chime. The stand-off in Not Hungry uses a soft `thump` instead.
- **The Sit Up seam** changes more pixels than ordinary neighbouring frames, the same amount as Small Wins. It comes from the mixed look, not from cuts. The Beep's seam is about the same as neighbouring frames.

## 2026-10-31 · Moved Seasons 10 and 11 up the queue

- **Folder numbers follow `ORDER`,** so moving episodes means renaming the folders and the numbers in their file names. Work from the highest number down so nothing gets overwritten.
- **Pencil episodes compress much worse than the flat ones.** The grain needs CRF 29 to fit the 10 MB upload limit. Lines, colour and captions stay clean, and only the fine grain softens.
- **Read the captions after an export.** `TAGS` already adds `#relatable`, so One Trip and The Angle had it twice.
- **`overlap.js` flags the exit hop.** Wobbin's clean hop over a friend counts for about a tenth of a second at take-off (Say Hi, Hiding, Small Wins, Dance Break). Look at those frames before changing the story.

## 2026-10-31 · Studied Digital Income Project's videos

- 12 transcripts, method only, no generation tools. The full notes are at the end of `10-hooks.md`.
- **Our biggest gap is shots:** a reel he studied changed shot every 1.5 seconds, and ours never cut.
- **Hook types we haven't used:** a clock or bet, a loss, Wobbin looking at the viewer, showing the result first.
- **Our saves and shares are about 0.2% or less.** He aims for 7% saves or 4% shares on carousels, so give people a reason to send the video.
- **A new format to test:** carousels, built from `cover()` in `tools/export.js`.

## 2026-10-31 · First real numbers from the posts

Battery about 21 h old, The Chair about 8 h old. Small sample.

| | Instagram views / likes / saves / shares / follows | Facebook views | YouTube views | TikTok views / likes / avg watch / finished |
|---|---|---|---|---|
| Battery (40 s) | 1,549 / 23 / 3 / 0 / 4 | 223 | 50 (+4 subs) | 83 / 12 / 5.9 s / 3.3% |
| The Chair (49 s) | 1,304 / 11 / 0 / 3 / 0 | 280 | 6 | 94 / 3 / 4.3 s / 0% |

- **Reach isn't the problem, the opening is.** Instagram showed both to 1,100+ strangers (99%+ non-followers), but TikTok says most viewers leave at 0:01 and almost nobody finishes.
- Next to try: a clear hook in the first second (a bigger character and on-screen text), and shorter cuts.
- Battery's feelings topic beat The Chair's chore topic, on two videos only. YouTube search was 30% of Battery's views, so plain descriptive titles are worth keeping.

## 2026-10-31 · 4K exports for daily posting, and a clean-up of the early episodes

- **What "didn't make sense" in the early ones:** The Seed drew the tree's roots under the ground as
  thin lines that read as three arrows, the seed was a dot, and digging it up looked like it just popped
  out. Now: no roots, a big inked seed, dirt spraying when Bo digs. Heavy's kite tree was small and lumpy;
  it's a big shaded tree with a bigger kite. Snooze's friends walked through Bo's bed; they now walk on a
  path further back (drawn smaller) and stop beside the bed to wave. The last blocky pixel suns (One More,
  The Cloud, Last Minute) are the ink sun.
- **The overlap checker skips pairs more than 95 apart vertically** (to allow stacking), so it missed
  Snooze, where Bo lies raised on a bed. Look at contact sheets too.
- **Batch export** (`tools/export.js`): one folder per video in `exports/`, numbered in posting order,
  with the 4K MP4 (2160×3840, 60 fps, 24 Mbps target, ~90 MB for 40 s), a cover PNG and `caption.txt`.
  About 3 minutes per video; two tabs in parallel roughly halve the total.
- **Covers:** render without captions (a half-typed line looks broken), and put the title on a paper
  label below the ground line so it never sits on the scene.
- **Big uploads from the browser pane fail after a long run:** an hour into the batch, every POST above
  ~32 MB gave "Failed to fetch" (reloading the tab didn't help; the server and curl were fine). The
  exporter now sends files in 8 MB pieces (`?append=1` on the dev server). Always check that every folder
  has its MP4 at the end, not just that the batch finished.
- **Hidden tabs throttle timers**, so the exporter now yields with a MessageChannel instead of
  `setTimeout`.
- **File names:** titles with `?` or curly apostrophes (`Can’t Sleep`) need cleaning for Windows paths.

## 2026-10-30 (night) · No touching, Season 8

- **"Characters look like they're kissing."** Many layouts had friends 100–150 apart (bodies are ~160
  wide), queues 140 apart, and endings where a friend walked straight through Bo. A checker now finds them
  (`node tools/overlap.js`, add `--wide` for the 16:9 frame), and the engine gives everyone **personal
  space**: a character never stops within 180 of another; two that start too close step apart. Stories
  that need closeness can opt out (`space: false`, or `c.space = 0`).
- **Personal space can break gags** that wait for someone to reach an exact spot. `node tools/events.js
  save` records every episode's sound beats; `diff` shows any beat that vanished or moved. Run it before
  and after engine changes.
- **Passing someone on one line looks like walking through them.** Use `S.leapfrog(a, b)`: `a` hops clean
  over `b` (who ducks). It became a little running joke: friends leapfrog Bo to lead the walk-off.
- **Restage instead of squeezing:** Battery (friends run in behind Bo), Busy (the friend waits by the desk,
  not on the path), The Other Line (vendors behind the counters, line B steps in out of shot), Just in Case
  (a wider hilltop and a bigger umbrella), Comfort Zone (headers aimed head to head).
- **Story state must be reset in `init()`.** A `S.stubT` set during the film survived into the next loop
  and broke the seam (Two Minutes). Every field a story sets in `update` needs a value in `init`.
- **Python edits on Windows:** open files with `newline='
'`, or the CRLF breaks `loopcheck.js`.
- **Palette softened** a touch: red `#f53b57`, yellow `#ffe03d`, green `#1fa84a`, lime `#3ad65c`.

## 2026-10-30 · Animation principles, a new caption voice, ink side characters

- **Anticipation without moving the beats.** A crouch before every jump would delay the jumps and
  break timed gags (headers, catches). Instead the engine logs each jump during the loop pass and,
  on later runs, crouches into it during the 0.14 s before. Timing stays the same; the crouch is
  free. A jump straight off a landing is skipped (no time to crouch, and it fed back on itself and
  made Hurry's seam flip between two answers). Trips pass `antic = false`: you don't wind up to trip.
- **The loop pass can need more than three runs** once jump times depend on the simulation; it now
  repeats (up to four more) until the seam is 0.00.
- **Squash and stretch, follow-through and takes are cheap in the springs.** Stronger stretch in the
  air, a firmer landing squash, a tiny squash on every footfall, a squash when turning round, a
  stretch-up "take" with three ink lines when the eye goes wide (and a small camera lean-in), and
  an eye that overshoots a little when it snaps to a new look. Seams stayed at 0.00 in all 33.
- **A brow that only shows for feelings.** Hidden on the calm face, it springs in for wide, sad,
  flat, happy, squeeze, closed, heart and dizzy. Reads at phone size and keeps the simple look.
- **The "do-do-do" caption voice.** A sawtooth through vowel formants every other letter sounded
  robotic. One soft sung note per word (a hum over a felt mallet, wandering the pentatonic scale)
  plays a sentence as a tiny tune and is much easier on the ear. Measure it: the first try was
  −40 dB; −48 to −50 dB is the faint level we want.
- **Repeats sound programmed.** Every foley sound (steps, lands, pops, tocks...) now drifts a few
  percent in pitch and level per event. Musical sounds stay in tune.
- **Open on the hook.** Players and MP4s now start just before the first caption (`show.hook`), so
  the first frame already has the odd thing in it; the walk-in plays at the end, into the loop.
- **Short phone screens cropped the scene.** A portrait frame shorter than 9:16 now keeps the full
  9:16 height and shows more at the sides. 9:16 itself is unchanged.
- **Python on Windows writes CRLF** in text mode, which breaks `loopcheck.js` (it looks for
  `<script>
`). Open files with `newline='
'` when editing them from Python.

## 2026-10-28 · Full audit (see 08-audit.md)

- **"Every ending feels sad."** The cause is the pattern, not one episode: the friend leaves, Wobbin
  walks alone into blank paper, a slow chord fades in, a consoling quote fades out. End on a button
  (a joke or company) after the quote, and walk off happy.
- **Noise beds were the loudest continuous sound.** Measured, the room/birds/night/rain beds sat
  12–25 dB above footsteps and the caption voice. Ambience is now sparse separate sounds only.
- **Measure, don't guess.** The `swell` "accent" was the loudest sound in the show at −26 dB.
- **Render-only polish keeps seams.** Paper, ground tone, shadows, catchlights and eye darts are
  drawn, not simulated, so all 33 seams stayed at 0.00. Anything that changes simulation (walk
  moods, fidgets) needs each episode re-checked.
- **The site's own scenes draw on a transparent canvas** (`clear: true`) or their own paper; the
  paper finish skips `clear` stories and any story with `paperFinish: false`.
- **Endings pilot (Lost, Small Talk, Battery).** A friend can leave with Wobbin if they run ahead
  at ~2× speed so they're out of frame at the seam. `c.jump(0, vy)` zeroes horizontal speed, so
  skipping hops while running must be `c.jump(c.vx, vy)`. A camera that sits on a fixed spot
  (Lost's clamp to the house) has to be released before Wobbin walks out of it. Sound-only jokes
  need a picture too (Lost's phone buzzes visibly as it rings).
- **All 33 endings (five helpers in parallel, six episodes each).** A headless checker
  (`node tools/loopcheck.js`) made loops checkable in seconds without the browser, so each
  helper could verify its own work. Visual review still caught what the checker can't: props too
  small for a phone (Reset's rock, the tiny mountain), a camera that cut Wobbin off (Perfect), and
  **scenery popping at the seam in 16:9/1:1**. The wide frames show about ±600 units around the
  camera, so a house, tree, bench or decoration within ~650 units behind Wobbin at the seam pops
  on loop even when 9:16 looks clean. Always compare the first and last frame in 16:9.
- **Background pane runs are slow.** Contact sheets for all 33 take a few minutes in the hidden
  pane; start them with the iframe loop and wait on the files.

## 2026-10-26 · Seasons 6 and 7, sound and feel

- **"It feels programmed."** Fixed with three engine changes: line boil on by default (a tiny redraw jitter about 12× a second), blinks at uneven gaps with the odd double blink, and a subtle breathing squash when a character stands still. Motion stays smooth; only the line wobbles.
- **Sound too loud and harsh.** Warm low-pass and high-shelf cut on the master, a minimum attack on every sound, quieter bells and taps, then (after feedback) footsteps and the caption voice turned down about 14 dB, the master by about 3.5 dB, and MP4 exports normalized to 0.5 instead of 0.89.
- **Typewriter clicks felt robotic.** Replaced with a soft murmured voice per speaker (Animalese-style), on by default in every episode.
- **`S.plan` order.** It re-applies every past step in list order each frame, so grouped lists (all looks, then all crouches) clash. Keep plans time-sorted. Also, setting `c.cmd.x` by hand after a plan step that sets `x` gets overwritten; aim the plan step at the right place instead (Why Was I Here? doorway stop).
- **Sounds tied to the rendered view go missing in MP4s.** The soundtrack pass simulates without rendering, so anything spawned from `S.view` (rain in Small Talk) or positions computed in a draw function (the buddy in Inner Voice) has no sound. Spawn from the camera (`S.cam.x.x`) or compute positions in `update`.
- **Seam drift from foot history.** After long standing scenes, the feet keep different positions and the loop doesn't match (seam error 63 in Inner Voice). A small hop before the walk-off resets them.
- **Things that follow Wobbin break the seam.** The buddy followed Wobbin off screen; anchor helpers in place once their part is done.
- **Colours must loop.** An evening sky that never returns jumps at the seam. Either bring it back, tint only an indoor room (off screen at the seam), or start and end on the same colour.
- **Props too small at phone size.** The "just in case" items at 6 px were specks; doubling to 12 px made the joke work.
- **Wide shots are tiny in 9:16.** A huge establishing shot pushed both carts to the frame edges (The Other Line). A camera that follows whichever line is moving reads far better.
- **Yellow captions are unreadable on white.** Use orange; at night, use a pale yellow accent on the dark sky.
- **People can't hold things.** Items ride on heads, keys hang from the tuft, kites tie to the tuft. Stacking characters uses `hold()` with `heldFeet` so feet plant on the head below.
- **Hidden-pane testing.** In the background browser pane, timers and animation frames are throttled; contact sheets rendered from a fresh `Show` are the reliable way to check an episode.
- **Bulk rendering is slow** (roughly a minute per episode in the background pane). The user asked to skip it unless they ask.

## 2026-10-26 · Season 1 rebuilt on engine 2

- Engine 2 always draws one unbroken line, so The Gap paints paper over the gap and the erased part, and adds round ink caps on the cut ends.
- Platforms (a crate to stand on) use `story.ground()`; `story.lineAt()` keeps the drawn line flat.
- The old Season 1 pages are in `legacy/season1/`.

## 2026-10-25/26 · The website

- The fixed band canvas covered the hero, so hero and band became one transparent canvas.
- The season rows made the phone page 1298px wide (grid items need `min-width: 0`), which zoomed the whole site out.
- After scrolling back up, Wobbin stayed wherever he'd walked; the camera now brings him back to his spot in the hero.
- Everything was "too zoomed in": the type scale and sizes came down about a third.
- The user didn't like the pinned scroll-scrubbed section; it was removed. They didn't like Bricolage Grotesque; the site now uses Clash Display and Satoshi.
- Cache busting: bump `?v=` (`sh site/scripts/bump.sh` for the site; the episode pages use `sfx.js?v=N` / `engine2.js?v=N`).

## GitHub and deploy

- GitHub Pages on a private repo needs a paid plan, and even then Actions artifact storage can run out (it did: about 1.2 GB of old build artifacts in other repos). Making the repo public fixed it, since public repos don't count toward the quota.
- Commits must not carry a `Co-Authored-By: Claude` line.

## Hooks and pace (2026-10-31)

- The slow starts were caused by the loop rule itself: 650 units of empty line at each end meant 4 seconds walking in and 7 walking out, so old episodes make viewers wait 11 to 16 seconds at the end. The fast open (`story.page`) replaces that with about a second of blank paper. See `10-hooks.md`.
- A caption has to start before the hook to be fully typed in frame one. `tools/pace.js` checks this.
- A wipe with big zigzag teeth looks like a computer made it. Small wobbling steps look like a pencil.
- Don't name a story field after an engine method. `S.warm = 0` overwrote `Show.warm()` and crashed the page.
- Heavy graphite swallows captions and looks dull at phone size. The `sketch` look is the same pencil with a lighter hand.
- A prop that stands in the way for the whole film (the ice cream cart) should arrive when it matters.
- Check who has to walk through whom before staging a crowd. The neighbour in Scribble walked through the kid, and Wobbin through the passenger at the bus door.
- `tools/export.js` used to run on any page, and a page without `sketch.js` would have exported a styled episode flat. It now loads it first.

## Art styles (2026-10-31)

- The art kit we studied draws one still over many seconds in Node, so it can't run in a player. Its idea can: pigment catches on the paper's tooth according to pressure, and that is one line in a fragment shader.
- Keep colour and line on separate layers, or a shader can only filter the picture. The `Pen` sends fills to one canvas and strokes to another, and a fill erases the lines behind it.
- A pure threshold turns light shading into hard black specks. The kit's "film", a faint smooth layer under the grain, is what makes a light touch look like pencil.
- Pulling pure pigment out of a colour oversaturates heavy media (the crayon grass went neon). `truth` blends back toward the colour that was asked for.
- A world-pinned paper makes the grain pop for one frame at the loop's jump, even at seam error 0.00. Every texture lookup now repeats exactly every 1820 world units, and the grain slides into line during the empty walk-off.
- Patterns near either end of the loop break the seam too. Sidewalk cracks, grass tufts and clouds must stay away from the first and last 650 units.
- The isometric pilot looked fine as a print but the user didn't like it, so it was dropped. If it ever returns (`legacy/pilots/`): a paper-doll flip is edge-on exactly at a corner, so never stop a character on one, and keep inner walls low.
- **The house that didn't belong.** New Pencil's house was a box set on top of a hill, and the tree trunk ended in mid-air above the slope. Both read as stickers, and the user called it AI-ish. The fix: work out the ground's height with a function (`hillY(x)`), draw the hill over the foot of what stands on it, then hide the joins with grass, bushes and a path.
- **Too dark.** Power Cut's first night was nearly black. It looked striking in a still frame, but the user preferred the lighter tone it passed through at dawn. Charcoal night is now about `#8a867f`, with the paper still showing.
- **Lines on a mid-tone.** With a lighter night, keep lines dark charcoal and save chalk for stars and highlights.
- **The menu over the eye.** Its top rail was exactly at eye height, because nobody checked where the eye is (about 132 above the ground). It also floated. It now has its own stand, beside Wobbin rather than in front. Anything Wobbin looks at goes beside the eye, and everything needs something holding it up.
- **Captions on a mid-tone** are hard to read in any colour, and orange worst of all. Rub a soft patch out of the charcoal behind them, like an eraser (see Power Cut's `drawOverlay`).
- `mix()` only takes six-digit colours. `INK` is `#111`, so `mix(INK, ...)` gives an invalid colour and the canvas silently keeps the previous one. Use `#111111`.
- Black lines vanish in the dark, so Wobbin had no legs at night. Use `c.ink` for a chalk outline.
- `sheet()` downscales by two, which made fake bands in the riso dither. Check dither at full size.
- On Windows, Python's text mode writes CRLF, and the tools' `<script>\n` match then fails with "no inline story script". Open files with `newline=''`.

## Earlier seasons (from the first sessions)

- Story state must be fully reset in `init()` or the second loop behaves differently.
- Only the main character's landings should shake the camera.
- Old cached `engine2.js` caused "fixed" bugs to reappear; versioned script tags fixed it.
- Seams need a long enough tail after the last beat for the walk to settle.
- Shared module-level state (Bloom's flowers) must be copied per show, because the exporter runs its own simulations.
- In The Hill, the ball needed real head contact or it looked like it floated.
