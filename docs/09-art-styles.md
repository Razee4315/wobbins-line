# 09 · Art styles

`sketch.js` draws an episode in a traditional medium. It's opt-in: an episode without `style` renders exactly as before.

Before making an episode in a style, read **Making it look hand-drawn** below. The texture alone doesn't do it.

```js
style: 'pencil',                            // pencil, crayon, graphite, sketch (lighter graphite), charcoal, riso
style: { a: 'sketch', b: 'crayon' },        // two media in one film, with mix(S, m, t, v) painting where b shows
style: t => t < 10 ? null : 'pencil',       // change over time; null is the classic flat line
style: { base: 'pencil', hatch: .3 },       // a look with some settings changed
```

Add `<script src="sketch.js?v=1"></script>` after the engine. Any page also takes `?style=charcoal`, which loads it on its own, so an old episode can be tried in a new look without touching it.

## Where it came from

We studied three repositories by Kevin Ngo (`github.com/kevintngo`). The code is MIT.

| Repo | What it is | What we took |
|---|---|---|
| **statechart-art** | Pen and coloured-pencil plates. `tools/kit/` simulates paper and media pixel by pixel in Node | The paper's tooth, and the rule that decides where pigment lands |
| **doodle-bot** | Group portraits in crayon and fineliner, made with the same kit | The crayon look: heavy wax, thin clean outline, colour a little off the line |
| **bot-house** | A live isometric house. `docs/js/press.js` prints every tint as a Bayer dither in overprinted riso inks | The riso press, and the iso box shading: tops lit, one face half shade, the other full shade |

None of the three has a charcoal medium. Ours uses the kit's graphite model with a rougher tooth, plus chalk and smudging.

The letters in `fonts/` are Kevin Serif and Kevin Sans (MIT, licence alongside them), A. V. Hershey's 1967 letters written by a simulated pen.

## How it works

1. **The Pen.** The engine draws as usual, but into a `Pen` that sends fills to one canvas and strokes to another. A fill also erases the lines behind it. Moving things and captions are marked on a third, half-size mask.
2. **The paper.** A tiling height field: blurred noise plus thousands of short fibres (a port of the kit's `paper.js`).
3. **The deposit.** A fragment shader treats how far a colour is from white as pressure. Light pressure only touches the crests of the tooth, hard pressure fills the valleys. A faint smooth film underneath keeps light shading soft instead of speckled.
4. **The hatch.** Fills are broken up by two crossing sets of pencil strokes, so the hand shows.
5. **Holds and boil.** The grain is pinned to the world, so the background holds still like a painted background. Things on the mask get a new grain 8 times a second, like redrawn cels. Motion itself stays at 60 fps.
6. **Riso.** Colours are split into blue, coral and yellow plates by solving how the inks multiply, then each plate is screened with a Bayer dither and printed a hair off register.
7. **Loops.** All texture lookups repeat every 1820 world units. During the empty walk-off the grain slides just enough to match the opening frame, so nothing pops at the seam.

The result is drawn back onto the normal canvas, so the player, contact sheets, the site and MP4 export need no changes.

## Designing for a medium

- **Charcoal:** set `paper` to about `#c8c4bc`, which is bare sheet. Darker is charcoal, lighter is chalk. **Keep it light:** night is about `#8a867f`, never near black, and the paper should show through (the user's note). Keep lines dark and use chalk for stars and highlights. Light is charcoal lifted off the page, so a glow just raises the tone. Strong colours survive as pastel; use one, once. Put a rubbed-out patch behind captions on a mid-tone (Power Cut's `drawOverlay`). If a scene really must be dark, use `c.ink`, `c.hairColor` and `capInk: t => ...` for chalk lines and words.
- **Coloured pencil:** pale sky colours become hand shading. Keep them pale: a mid-tone full-screen sky gets busy. Use `Sketch.hatch(ctx, x, y, w, h, { gap, width })` for cast shadows.
- **Crayon:** bright flat colours. Draw lumpy shapes with `stroke()` first and `fill()` after, at double line width, so they read as one outline.
- **Mix:** paint the whole scene in full colour; the pencil side greys it for free. Use `a: 'sketch'` so words stay readable. In `mix(S, m, t) { Sketch.reveal(m, S.sp, t); }`, each spot `{ x, y, R, t0, dur }` scribbles colour outward. Colour must come from something Wobbin does: a hop, a word, a dance. Change a spot's `R` each frame to make colour grow or snap back (Dance Break). Paint a surprise, like a mural, only after its spot starts, or it shows up in pencil early.
- **Riso:** white is bare paper. Keep to the three inks' range, and set `c.ink` to the key blue `#344a80`. Use it flat. The user didn't like the isometric 3D version (`legacy/pilots/midnight-snack.html`, with the engine's `view()` and `place()` hooks).

## Making it look hand-drawn

The user's test: does it look drawn, or does it look placed by a computer? These are what made the difference.

**Nothing floats.**
- Work out the ground as a function, like `hillY(x)`, and stand things on it.
- Draw the ground over the foot of what stands on it. A house sinks into its hill, a tree grows out of the slope.
- Hide the joins: grass at a trunk, a bush against a wall, a path from a door, a step, cracks where something lands.
- Everything is held up by something. No hovering signs or menus: give them a stand, a hook or a string.

**No computer shapes.**
- Use `Sketch.hand(ctx, pts, { fill, seed })` for anything with straight edges. Corners sit a little off, edges bow, and lines overrun each other at the corners. Avoid a bare `fillRect` for buildings and furniture.
- Draw lumpy shapes as one outline: stroke first at double width, then fill.
- Add a few marks that show a hand was there: some roof tiles, bark, a leaf or two. Suggest texture, don't fill it in.
- Add one small living thing to a still scene: chimney smoke, a swaying lamp, a bird.
- Use the helpers: `Sketch.hand`, `lump`, `grass`, `tiles`, `hatch`, `reveal`.

**Protect the acting.**
- Nothing crosses Wobbin's eye, ever. It's at about 132 above the ground, 32 forward of centre.
- What Wobbin is looking at goes beside the eye, and the eye actually looks at it.
- Check the first frame anything appears: where does it come from? A menu should already be on its stand, not pop out of the air.

**Check the frame like an artist.**
- Keep captions clear of roofs, suns and smoke. Make sure they read at phone size.
- Use the bottom third of a tall frame.
- Look at full size, not only the contact sheet.

## Tuning a look

Everything is in `LOOKS` at the top of `sketch.js`, with notes. The ones that matter most:

| Setting | What it does |
|---|---|
| `reach`, `reachK`, `soft` | How much pigment catches on the tooth |
| `hatch`, `cross`, `hatchScale` | How much the strokes show, and how big they are |
| `grain` | Tooth size. Keep to steps of .5 so the loop lines up (same for `hatchScale`) |
| `lineVar`, `lineB`, `lineK` | How much a line's weight wanders and breaks up |
| `warp`, `misreg` | How far edges wander, and how far colour sits off the line |
| `smudge` | Charcoal dust round the marks |
| `lw` | Line width, relative to the engine's |
| `truth` | 1 prints the exact colour, 0 its pure pigment |

## Limits

- It needs WebGL2. Without it the page falls back to the flat look.
- `sketch.js` can't run in the Node tools, so reference `Sketch` only inside draw functions: `const hatch = (...a) => Sketch.hatch(...a);`.
- A story's own `drawImage` goes to the paint layer only.
