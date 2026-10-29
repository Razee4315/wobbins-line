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

## Characters touching, and beats that went missing

```bash
node tools/overlap.js                  # characters overlapping in the 9:16 frame (add --wide for 16:9)
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

## Update the website after changing episodes

```bash
python site/scripts/sync-shorts.py   # copies engine2.js, sfx.js and every story into site/shorts/
sh site/scripts/bump.sh              # cache-busting version bump for the site's own files
```

If you change `engine2.js` or `sfx.js`, also bump the `?v=` on the episode pages (`sfx.js?v=N`, `engine2.js?v=N`) so browsers load the new version.

## Deploy

- Commit, then push to `main`. The GitHub Action in `.github/workflows/pages.yml` publishes `site/` to https://razee4315.github.io/wobbins-line/ in about a minute.
- Check a run: `gh run list --workflow pages.yml --limit 1`.
- Commit messages: plain, no co-author line.

## Render MP4s

- **One at a time:** open the episode on the website, then Download MP4 (1080×1920, 2160×3840 or 3840×2160). Or on the episode page itself, Export MP4.
- **In bulk:** possible with the dev server (each episode is about a minute at 1080×1920 in a background tab), but the user prefers not to unless asked.

## Instagram

Everything is in `brand/instagram/`:
- `dp-blue.png` (recommended profile picture), `dp-paper.png`, `dp-block.png`
- `hl-*.png` highlight covers (episodes, wobbin, quotes, making of, new)
- `profile.md`: name, username (`wobbinsline`), bio, link, category
- `captions.md`: captions, alt text and the posting order for the first posts

When posting, log it in `docs/05-episodes.md`.
