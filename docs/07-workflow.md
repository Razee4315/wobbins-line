# 07 · Workflow

## Run it locally

```bash
python -m http.server 8123
```

- Episodes: http://localhost:8123/the-gap.html (any episode page)
- Website: http://localhost:8123/site/

## Quick loop check (no browser)

```bash
node tools/loopcheck.js                 # every episode
node tools/loopcheck.js lost battery    # just these
```

Prints each loop's length and seam error, which parts of Wobbin's state differ at the seam, and
any other character still within 650 units of Wobbin at the seam. All 33 take about 17 seconds.
It checks the simulation only; use the contact sheets below to check how it looks.

## Is it fast enough?

```bash
node tools/pace.js one-trip hiding     # opening, words in frame one, longest gap, wait at the end
```

See `10-hooks.md`.

## Characters touching, and beats that went missing

```bash
node tools/overlap.js                  # characters too close in the 9:16 frame, by centre points (add --wide for 16:9)
node tools/touch.js                    # the final say: do the drawn outlines really overlap, in the 16:9 frame?
node tools/events.js save              # record every episode's sound beats (do this before an engine change)
node tools/events.js diff              # after: which beats vanished, appeared or moved
```

## Check an episode properly (the dev tools)

`tools/dev_server.py` serves the project and saves PNGs/MP4s that the page POSTs to it, so we can make contact sheets and renders without downloads.

```bash
python tools/dev_server.py . tools/out
```

Then open an episode at http://127.0.0.1:8124/<id>.html and, in the browser console:

```js
await import('/tools/sheet.js');
await sheet('my-episode', [0, 4, 8, 12, 16, 20, 24, 28, 32, 36]);   // saves tools/out/sheets/my-episode.png
seamDiff();                                                        // [] means the loop joins perfectly
```

- `sheet()` renders the episode at those times in a grid and returns `{ T, err }` (`err` is the seam error; it should be 0).
- `seamDiff()` lists which parts of Wobbin's state don't match at the seam (feet, eyes, camera).
- `measure()` (also in `sheet.js`) prints the loudness of sounds, so new sounds can be compared with the levels in `03-sound-guide.md`.

`tools/out/` is git-ignored.

Art styles: any episode page takes `?style=charcoal` (or pencil, crayon, graphite, riso). `looks('name', 20, ['pencil', 'riso'])` in `sheet.js` saves one moment in several styles side by side. `sheet()` halves its frames, which turns the riso dither into bands that aren't really there; judge riso at full size. `http://localhost:8123/sketchbook/` compares the pilots. The live site's Season 9 section is the easiest way to show them to someone else.

## Update the website after changing episodes

```bash
python site/scripts/sync-shorts.py   # copies engine2.js, sfx.js and every story into site/shorts/
sh site/scripts/bump.sh              # cache-busting version bump for the site's own files
```

If you change `engine2.js`, `sfx.js` or `sketch.js`, also bump the `?v=` on the episode pages (`sfx.js?v=N`, `engine2.js?v=N`) so browsers load the new version.

## Deploy

- Commit, then push to `main`. The GitHub Action in `.github/workflows/pages.yml` publishes `site/` to https://razee4315.github.io/wobbins-line/ in about a minute.
- Check a run: `gh run list --workflow pages.yml --limit 1`.
- Commit messages: plain, no co-author line.

## Export everything for posting

With `python tools/dev_server.py . tools/out` running, open any episode page and in the console:

```js
await import('/tools/export.js');
exportAll();                        // all 57 into exports/NN - Title/ (4K MP4, cover PNG, caption.txt): a bulk render, so only when asked
exportAll({ from: 39, to: 52 });    // a range (run halves in two tabs to go faster)
exportAll({ only: ['the-chair'], video: false });   // covers and captions only (seconds)
```

`exports/` is git-ignored. `11-posting.md` has the daily routine and the order.

### Brand kit (profile picture, banners, GIPHY stickers)

```js
await import('/tools/brand.js');
await brandAll();      // exports/00 - Brand kit/: profile picture + a banner per platform (sizes in BANNERS)
await stickers();      // numbered PNG frames per sticker, see-through background
```

Join each sticker's frames into a GIF with ffmpeg (palettegen with `reserve_transparent=1`, then
paletteuse), then delete the frames. `12-account-setup.md` has the name, bio and settings for every platform.

## Render MP4s

- **One at a time:** open the episode on the website, then Download MP4 (1080×1920, 2160×3840 or 3840×2160). Or on the episode page itself, Export MP4.
- **In bulk:** possible with the dev server (each episode is about a minute at 1080×1920 in a background tab), but the user prefers not to unless asked.

## Posting

Everything is in `11-posting.md`. `brand/instagram/` holds the first profile pictures and highlight covers; the live accounts use `exports/00 - Brand kit/`.
