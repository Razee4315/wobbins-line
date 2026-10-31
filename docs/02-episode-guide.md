# 02 · Writing an episode

## The story shape

Every episode follows the same arc. It's what the favourites have in common.

1. **Hook (0–6 s): curiosity.** Open on something odd: why is Wobbin jumping under a tree? why is that circle glowing? what is that line of people for? Don't explain yet.
2. **Reveal (6–10 s).** Show what's going on, often with a camera pull-back or a short caption ("ice cream!", "where are my *keys?*").
3. **Escalate three times (10–22 s).** The same problem, bigger each time. The third time should be the funniest or saddest.
4. **The turn (22–28 s).** One small change of heart: Wobbin stops, breathes, asks, steps out, talks kindly.
5. **Payoff and quote (28–36 s).** The happy result, then the quote caption while Wobbin walks off.
6. **Walk-off (last 6–8 s).** Wobbin walks out of the scene, so the end joins the start.

Captions are short (2–6 words), lowercase, said by Wobbin (or a friend, with a different voice pitch). Highlight one or two words with `*stars*`.

## Picking a topic

- It must be **common** and readable **without words**: if you muted the captions, would people still get it?
- Find **one visual metaphor** that carries the feeling: a battery that drains, a doorway that pops your thought bubble, a dome that shrinks, a stack of "just in case" things on your head.
- Prefer topics from everyday life over niche ones (we skipped programmer-only jokes on purpose).
- Use research: see the research notes in `../ideas.md`.

## Loop rules (seamless loops)

The engine finds the loop automatically, but only if the episode follows these:

- **Start and end with Wobbin walking right at the same speed `V`.** Start with `S.addChar({ x: 0, walk: V })` and end with `[LEAVE, { x: 1e6, speed: V, accel: 450 }]`.
- **Nothing else on screen at the seam.** Props, friends and the house must be far enough away (about 650+ units from Wobbin at the start, so they're out of view even in 16:9).
- **Colours at the end must equal colours at the start.** If the sky turns to evening, bring it back, or start and end on the same colour (Can't Sleep starts at pink dusk and ends at pink dawn).
- **Things that ride along must come and go.** A mask, an umbrella or a cone on Wobbin's head at the end must also be there at the start, or be taken off before the walk-off. (Lost keeps the keys on the tuft the whole time; Heavy keeps the kite.)
- **Hop before the final walk-off.** A little jump resets the feet so the walk cycle matches. Without it, the feet keep a bit of history and the seam drifts (Inner Voice had a seam error of 63 until we added one).
- **Check it:** the page's console prints `seam error`, and `show.loopErr` should be `0.00`.
- `loopAfter` is the loop length; leave 6–8 s after `LEAVE`.

## Engine cheat sheet

```js
Shorts.play({
  title: 'Name', accent: PAL.orange,      // accent colours the *highlighted* caption words
  voice: { pitch: 1 },                     // the murmured caption voice (default on); false = old key clicks
  loopAfter: 40,
  captions: [[a, b, 'text with *accent*', colorOrNull, { pitch: 1.3 } /* or false */], ...],
  paperAt: t => ramp(t, [[0, '#fff'], [20, '#ffe7d3'], [34, '#fff']]),   // optional sky/paper colour over time
  ground: (x, t, S) => GROUND - height,    // optional terrain (hills, a crate to stand on)
  lineAt: () => GROUND,                    // optional: keep the drawn line flat even if ground isn't
  boil: true, boilAmt: 2.0,                // hand-drawn line boil (on by default)
  style: 'charcoal',                       // an art style (needs sketch.js on the page): see 09-art-styles.md
  init(S) { S.bo = S.addChar({ x: 0, walk: V }); },
  update(S, t, dt) { S.plan(S.bo, t, [[0, { x: 600, speed: V, accel: 450 }], ...]); },
  drawSky(S, ctx, t, v) {}, drawBack(S, ctx, t, v) {}, drawFront(S, ctx, t, v) {},
});
```

- **Characters:** `S.addChar({ x, face, hair: 'tuft'|'curl'|'antenna', hairColor, blush, fill, gain, walk })`.
- **Commands** (`c.cmd`): `x, speed, accel, face, crouch, sit, tilt, lookX, lookY, eye`.
- **Eyes:** `open, wide, sad, flat, blink, closed, happy, squeeze, heart, dizzy`.
- **Actions:** `c.jump(vx, vy, spin)`, `c.hold(x, y)` + `c.heldFeet = i => ({ x, y, rot })` (stand on someone's head), `c.release(vx, vy)`, `c.top()` (top of the head), `c.tuft` (hair tip, good for hanging things), `c.hidden`.
- **Show:** `S.plan(c, t, list)`, `S.once(key, fn)`, `S.sfx(name, params, x)`, `S.burst(x, y, n, colours, { speed, gravity, size, life, angle, spread })`, `S.shake(a)`, `S.camGoal = { x, y, z, kx, kz }`, `S.focus`, `S.J(i)` (boil jitter for your own drawings).
- **Acting is automatic:** a crouch before every jump (anticipation, from the loop pass), stretch in the air, squash on landing, every step and every turn, a "take" when the eye goes `wide`, an eye that overshoots its look, and a brow for every expression except `open`. Pass `c.jump(vx, vy, spin, false)` for a jump that shouldn't wind up (a trip).
- **Personal space is automatic:** nobody stops within 180 of anyone (`space: false` or `c.space = 0` to opt out). To get past someone, `S.leapfrog(a, b, key, vx)` (call every frame while it may happen). Lay out groups ~180 apart.
- **Ink side characters:** `sun(ctx, x, y, px, { X })`, `moon(...)`, `cloud(...)` take the same arguments as `sprite()`; `butterfly(ctx, x, y, px, { X }, alpha, rate)` (rate ~12 flying, ~1 resting) and `bird(ctx, x, y, px, { X, O }, alpha, rate, dir)` (rate 0 = perched, dir -1 faces left). They breathe, blink and flap on their own. Keep pixel sprites for icons.
- **Opening frame:** playback and MP4s start at `show.hook`, 0.7 s before the first caption. Set `hook: seconds` in the story if the odd thing appears at another moment.
- **Helpers:** `PAL`, `SPRITES` (heart, sparkle, dot, cloud, flyA/flyB, birdA/birdB, check, note, star, moon, sun, bang, ask, bulb, d0–d7), `sprite(ctx, rows, x, y, px, colours, alpha)`, `zzz()`, `ramp()`, `mix()`, `lerp, seg, sine, outBack, outCubic, inCubic, clamp, hash, spring`, `GROUND = 620`, `STAND`, `BODY_H`, `GRAV`, `INK`, `PAPER`.

## Rules that bit us (read these)

- **`S.plan` re-applies every past step, in list order, every frame.** Keep plan lists in time order (or `.sort((a, b) => a[0] - b[0])`). Setting `c.cmd.x` yourself after a plan step that sets `x` gets overwritten next frame; make the plan target the right place instead.
- **Never base sound-making things on `S.view`** (the rendered view) in `update`. The MP4 soundtrack pass doesn't render, so those sounds go missing. Use `S.cam.x.x` or world positions.
- **Characters have no hands.** Things ride on heads (stacks, masks, umbrellas, cones) or hang from the tuft.
- **Size props for a phone.** Pixel sprites at 4–6 px look like specks in 9:16; most items need 8–13 px.
- **Yellow text on white is unreadable.** Use orange as the accent on light backgrounds; at night use a light accent like `#fff2a8`.
- **Wide shots make characters tiny.** Prefer a camera that follows the action (`camGoal`) over one huge establishing shot.

## Small details (the user's rule: "the small details make the difference")

Go through the episode frame by frame and ask:

- Is anything covering Wobbin's eye, even for a moment? Does the eye look at what matters?
- Does everything touch the ground properly, and is everything held up by something?
- Does anything pop in from nowhere? Where did it come from, and where does it go?
- Is there a small true detail people will recognise from their own life (the upside-down cereal box, the key reached with a foot)?
- Does it look drawn, or placed? See **Making it look hand-drawn** in `09-art-styles.md`.
- Do captions read at phone size, clear of everything behind them?

## Checklist before calling it done

- [ ] Hook in the first 5 seconds; it reads with the sound off.
- [ ] Three escalations, a turn, a quote.
- [ ] `seam error 0.00`; contact sheet checked (see `07-workflow.md`).
- [ ] The small details above; key frames looked at full size.
- [ ] `node tools/overlap.js <id> --wide` says ok: nobody overlapping or face to face.
- [ ] Every field set in `update` is reset in `init` (or the second loop differs).
- [ ] No props or friends in view at the start or end; colours match.
- [ ] Every beat has a soft sound; ambience bed for the place (room, birds, night, rain).
- [ ] Captions readable on the background (accent colour contrast).
- [ ] Added to `site/js/episodes.js`, `site/scripts/sync-shorts.py`, the root `index.html`, `docs/05-episodes.md` and `ideas.md`.
