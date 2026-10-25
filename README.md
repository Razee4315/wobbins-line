# Wobbin's Line

A tiny animated show drawn on one line. Wobbin walks onto the line, runs into something we all do, and walks off a little wiser. There are 23 looping episodes in 5 seasons, all simulated live in the browser.

## What's here

- `*.html` (root): the episodes. Each one opens on its own and can export an MP4. Season 1 (`the-cloud`, `the-seed`, `the-gap`) runs on `engine.js`; Seasons 2–5 run on `engine2.js`. Sound comes from `sfx.js`.
- `ideas.md`: the episode backlog and notes.
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
