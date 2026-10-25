# 01 · The show

## In one line

**Wobbin's Line** is a tiny animated show drawn on one line. Wobbin walks onto the line, runs into something we all do, and walks off a little wiser. Every episode is 30–50 seconds and loops seamlessly, made for Instagram Reels and YouTube Shorts.

## Where it came from

The starting point was the minimalist style of the "Nuggets" short: one line, one character, almost nothing else. We kept that simplicity but made our own world, with relatable everyday struggles instead of one heavy theme.

## The character

- **Wobbin** (called `Bo` in the code): a small round white body drawn in one ink line, three hairs on top (the "tuft"), one eye, two legs with little black feet. No arms and no mouth; everything is acting through the body, the eye, the hair and the timing.
- The name comes from "wobble" (squash and stretch). It was chosen to be unique.
- Wobbin is never "he" or "she" in captions or copy. Docs and captions just say Wobbin.
- **Friends** share the same body with different hair (curl, antenna, tuft), hair colours, blush and pastel fills (pink curl, blue antenna, orange tuft, green curl).
- **New characters** so far: the grumbly ink **Scribble** that becomes a lavender **Buddy** (Inner Voice), the stranger with the green antenna (Small Talk), ice-cream vendors (The Other Line).

## The world

- Everything happens on **one ink line**: the ground. The line can become a hill, break into a gap, or be erased.
- Props are simple: ink outlines, flat 8-bit colours, and pixel sprites (hearts, stars, clouds, keys, cones, sheep).
- Houses are shown cut open like a doll's house, so we can see inside and outside at once.
- Backgrounds stay light: paper white, a few drifting pixel clouds, sometimes a sun or moon.
- **Time of day** changes are a favourite: evening tints, night with stars, pink dawn. The colour at the end of an episode must match the start (see the loop rules).

## The look

- Palette: a PICO-8-style 8-bit palette (`PAL` in the engine): red, orange, yellow, green, lime, blue, sky, violet, pink, peach, lav, grey, dim, navy, plum, brown.
- Ink is `#111`, paper is white.
- **Hand-drawn feel**: the line "boils" (redrawn with a tiny jitter about 12 times a second), blinks come at uneven gaps, and standing characters breathe. Motion itself stays smooth at 60 fps.
- Captions are typed in a pixel font (Silkscreen), lowercase, with one or two words highlighted in the episode's accent colour.

## The tone

- Gentle, funny, kind. Never preachy. The joke comes first; the lesson is the last line.
- Every episode ends on a short **quote** that sums it up, for example "done is better than *perfect.*"
- Topics are **common, everyday and relatable**: things anyone gets at a glance without explanation (procrastination, saying yes too much, losing keys, awkward silence, can't sleep).

## The website

- https://razee4315.github.io/wobbins-line/ — every episode plays live in the browser, with sound, a 9:16 / 16:9 switch, and MP4 download up to 4K.
- The hero has a block-pixel wordmark that Wobbin walks past; the same line becomes a walking band at the bottom of the page.
- Design docs for the site are in `site/docs/`; rules in `site/CLAUDE.md`.
