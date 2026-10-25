# Wobbin's Line

A tiny animated show drawn on one line. Wobbin walks onto the line, runs into something we all do, and walks off a little wiser. There are 33 looping episodes in 7 seasons, all simulated live in the browser.

**Start with [docs/README.md](docs/README.md)**: the handbook (the show, how to write episodes, sound, lessons learned, all episodes, preferences, workflow).

## What's here

- `*.html` (root): the episodes. Each one opens on its own and can export an MP4. All of them run on `engine2.js`, and sound comes from `sfx.js`.
- `legacy/season1/`: the original Season 1 pages on the first engine (`engine.js`), kept for reference.
- `ideas.md`: the episode backlog and notes.
- `docs/`: the project handbook.
- `tools/`: the dev server and contact-sheet helpers for checking episodes.
- `brand/instagram/`: profile pictures, highlight covers, bio and captions.
- `site/`: the website, which is static with no build step. See `site/CLAUDE.md` for its rules and `site/docs/` for the design docs.

## Working on it

Serve the folder and open the site:

```bash
python -m http.server 8123
```

Then go to http://localhost:8123/site/.

After you change an episode, copy it into the site:

```bash
python site/scripts/sync-shorts.py
```

After you change site files, run `sh site/scripts/bump.sh` to bump the cache version.

## Deploy

Every push to `main` publishes `site/` to GitHub Pages (`.github/workflows/pages.yml`).
