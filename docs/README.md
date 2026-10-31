# Wobbin's Line: the handbook

Everything we know about making this show, in one place. Read it before starting new episodes, and add to it whenever we learn something.

| File | What's in it |
|---|---|
| [01-the-show.md](01-the-show.md) | What we're making: the character, the world, the look, the tone |
| [02-episode-guide.md](02-episode-guide.md) | How to write an episode: story shape, loop rules, engine cheat sheet, checklist |
| [03-sound-guide.md](03-sound-guide.md) | How the sound works, the levels we settled on, every sound name |
| [04-lessons-learned.md](04-lessons-learned.md) | A running log of mistakes and fixes, so we don't repeat them |
| [05-episodes.md](05-episodes.md) | All 52 episodes: topic, quote, notes, plus the posting log and post links |
| [06-preferences.md](06-preferences.md) | What the user loves and dislikes, in their own words where possible |
| [07-workflow.md](07-workflow.md) | Tools and steps: testing, syncing the site, deploying, rendering, Instagram |
| [08-audit.md](08-audit.md) | The full audit before posting: what's wrong, what's fixed, what to fix next |
| [10-hooks.md](10-hooks.md) | **Hooks and pace:** the research, the rules, and how to open fast. Read before making an episode |
| [09-art-styles.md](09-art-styles.md) | The art styles (charcoal, coloured pencil, crayon, graphite, riso): how they work and how to tune them |
| [11-posting.md](11-posting.md) | **Posting:** the accounts, the schedule, step-by-step for each platform, stats, what's next |
| [12-account-setup.md](12-account-setup.md) | Name, bio and settings for every social platform |
| [../ideas.md](../ideas.md) | The idea bank: every season's plan, the backlog of future episodes, research notes |

## Where things live

- `*.html` in the project root: one page per episode. Each opens on its own and can export an MP4.
- `engine2.js`: the animation engine (characters, physics, camera, captions, loops, MP4 export).
- `sfx.js`: every sound, synthesized in code.
- `sketch.js`: the art styles. Only pages that use a style load it. `fonts/` holds the letters they use.
- `sketchbook/`: a page for comparing the Season 9 pilots and trying any look on any episode.
- `site/`: the website, deployed to https://razee4315.github.io/wobbins-line/ on every push to `main`. Its own design docs are in `site/docs/`.
- `brand/instagram/`: the first profile pictures and highlight covers. The live accounts use the brand kit in `exports/`.
- `exports/`: videos, covers and captions for posting. Git-ignored, so only on the user's computer; see `11-posting.md`.
- `pip-and-the-balloon.html`: the first draft, kept for reference. Not an episode.
- `legacy/season1/`: the original Season 1 pages on the first engine, kept for reference.
- `tools/`: the dev server and contact-sheet helper we use to check episodes.

## Keeping this up to date

After every working session, add anything new to:
- `04-lessons-learned.md` (what broke and how we fixed it),
- `06-preferences.md` (anything the user said they liked or disliked),
- `05-episodes.md` (new episodes, and every post with its links),
- `../ideas.md` (new ideas, and what we found out from research).
