# Wobbin's Line — project rules

A tiny animated show drawn on one line (33 episodes, 7 seasons) plus its website. Start with `docs/README.md`.

## Before making episodes
- Read `docs/02-episode-guide.md` (story shape, loop rules, engine cheat sheet) and `docs/06-preferences.md` (what the user likes).
- Topics: common, relatable, readable with the sound off. Open on curiosity, reveal, escalate three times, turn, end on a short quote.
- Every episode must loop with `seam error 0.00`. Check with `tools/sheet.js` (see `docs/07-workflow.md`).

## Sound
- Soft and faint. Keep new sounds at or below the chime level (`docs/03-sound-guide.md`). Caption voice and footsteps stay very faint.

## Housekeeping
- After changing episodes: `python site/scripts/sync-shorts.py`, `sh site/scripts/bump.sh`, and bump `?v=` on episode pages if `engine2.js`/`sfx.js` changed.
- New episodes also go in `site/js/episodes.js`, the sync script, root `index.html`, `docs/05-episodes.md` and `ideas.md`.
- Log what you learned in `docs/04-lessons-learned.md` and any feedback in `docs/06-preferences.md`.
- Pushing to `main` deploys the site. Commit messages: plain, no `Co-Authored-By` line.
- Don't bulk-render MP4s unless asked.
- The site has its own rules in `site/CLAUDE.md`.
