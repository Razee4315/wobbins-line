# 04 · Lessons learned

A running log. Newest at the top. When something breaks, write down what happened and the fix.

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

## Earlier seasons (from the first sessions)

- Story state must be fully reset in `init()` or the second loop behaves differently.
- Only the main character's landings should shake the camera.
- Old cached `engine2.js` caused "fixed" bugs to reappear; versioned script tags fixed it.
- Seams need a long enough tail after the last beat for the walk to settle.
- Shared module-level state (Bloom's flowers) must be copied per show, because the exporter runs its own simulations.
- In The Hill, the ball needed real head contact or it looked like it floated.
