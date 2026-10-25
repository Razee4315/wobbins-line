# Steal list

Reference mining for the Line Shorts website (Phase 1). Every site below was opened in a real
browser on 2026-10-25 and measured (computed fonts, colours, libraries, section order), not
described from memory. Cartoon Saloon (403) and PICO-8 / lexaloffle (DNS failure) could not be
fetched and were replaced.

## Sites examined

| # | Site | Stack | Type (measured) | Palette (measured) | Memorable thing |
|---|---|---|---|---|---|
| 1 | kurzgesagt.org | Next.js, inline SVG + 2 videos | Montserrat Medium h1 81px, tracking −3.25px (−0.04em); body Montserrat 18px | `#0A1439` navy, `#FFFFFF`, `#47CC5E` green, `#970CDA` violet, `#0C46DA` blue | The h1 is broken across lines ("We / are / Kurz / gesagt") at huge size over a live star field and animated rockets: the brand's world appears before the copy |
| 2 | notion.com | Next.js | NotionInter 600, h1 59px, −2.47px (−0.042em); Lyon Text serif for editorial | near-black at 90/95/75% alpha on `#FFFFFF`, warm grey `#A39E98` | A row of hand-drawn ink character faces in circles above the h1, and a rotating word inside a soft pill ("Create" → "Think"…) |
| 3 | pudding.cool | custom | Gooper SemiCondensed (display serif), Atlas Grotesk, Atlas Typewriter for meta | `#191919` / `#EFEFEF`, cards in saturated single colours | Hand-lettered wordmark and hand-drawn outline nav buttons; every story card carries an issue number chip (#228) and a date in typewriter |
| 4 | goose.game | custom | TransportNew 60px (road-sign face) | `#276EBD` blue field, `#FFFFFF`, `#00FF00` focus | Game props (radio, pumpkin, jam, rake) scattered around the hero edge; a one-line deadpan tagline does all the selling |
| 5 | giantant.ca | Squarespace | DM Sans h1 43px, default tracking | warm paper `#E9E6E2`, `#D8D1C6`, ink `#121212` | The work *is* the page: one project after another, full-width, with a warm paper ground instead of white |
| 6 | buck.co | custom | Mabry (single family), nav words 40px | `#000`, `#FFF`, `#DBE0EE`, one blue `#196EFA` | Extreme restraint: one typeface, huge nav words, two-column work list (title + one-line description + thumbnail) |
| 7 | Our own shorts (engine2.js) | canvas + Web Audio | Silkscreen captions | ink `#111`, paper `#FFF`, PICO-8-style accents | Everything is live-simulated, not video: the character can be rendered anywhere, at any size, reacting in real time |

## Moves extracted (9, of which 5 are motion/interaction)

| # | Move | Source | How it adapts here |
|---|---|---|---|
| 1 | Display headline broken into stacked lines at graphic scale, tight negative tracking | Kurzgesagt #1 | The wordmark stacks across 2–3 lines at ≥9rem, −0.04em, with the character standing *on* the baseline of the last line |
| 2 | **(motion)** The brand's world animates behind the headline on load | Kurzgesagt #1 | A live canvas running our real engine: the character walks in along a hand-drawn line and stops under the headline. Not a video, so it never loops visibly |
| 3 | Hand-drawn character row as a "cast" strip | Notion #2 | The cast (main character + 3 friends) rendered live by the engine in small circles, each reacting (blinks, look toward the cursor) |
| 4 | **(motion)** Rotating word inside a pill | Notion #2 | "tiny stories about *overthinking* / *procrastinating* / *saying yes*…": the word swaps with a masked vertical roll every 2.2s, the pill tinted with that short's accent colour |
| 5 | Hand-drawn outline buttons and a hand-lettered wordmark | Pudding #3 | Buttons and pills get a wobbly SVG ink outline (`feTurbulence` displacement) that re-boils every 120ms on hover, the same "line boil" the shorts use |
| 6 | Issue-number chip + date on every card | Pudding #3 | Every episode card carries `EP 07` in Silkscreen and its running time; seasons are numbered like volumes |
| 7 | Props scattered around the hero edge | Goose #4 | Pixel props from the episodes (clock, crown, balloon, heart, ball) drift at the hero edges with scroll parallax at different depths |
| 8 | **(motion)** Live previews instead of thumbnails | Pudding #3 + original | Episode cards play the real short muted in a small canvas on hover / when in view on mobile (only one at a time, to keep it cheap) |
| 9 | **(motion)** One continuous line through the whole page | original, from the shorts' ground line | The ground line never ends: it runs through every section as the page's divider, and the character walks it as you scroll (scroll velocity drives the walk speed, direction flips when you scroll up) |

## Table stakes (what every comparable site does)

- A watch-now grid of works with titles and short descriptions
- An about / "who made this" block
- Social / newsletter links in the footer
- A single strong hero statement

## Deliberate deviations

- **No video files.** Every preview is the live engine; the site and the shorts are the same code
- **No dark mode.** Paper and ink only, like the shorts
- **No stock imagery, no 3D, no gradients.** The only images are the shorts themselves and pixel sprites
- **No three-card feature grid.** Seasons are horizontal rows of episodes, the way a show is browsed

## Rejected moves

- Kurzgesagt's full-bleed night-sky hero: beautiful, but navy-on-colour fights our white-paper look
- Goose's saturated blue field: too loud for 25 small pieces that each have their own accent
- BUCK's grey placeholder-heavy loading state: our previews are live, so there is never an empty tile
- Notion's corporate blue CTA buttons: the CTA here is "watch", and it should look drawn, not shipped
