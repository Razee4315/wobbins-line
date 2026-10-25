# 01 · Brief

## What the site is
**Wobbin's Line**: the home of a tiny animated show. Wobbin, a small round ink-drawn character with
a three-strand tuft, walks onto a single line and runs into something everybody does
(procrastinating, people-pleasing, overthinking a reply), then walks off a little wiser. 25
episodes in 5 seasons, each a seamless loop made for Reels / Shorts / TikTok.

## Primary action
**Watch an episode.** Everything on the page leads to the player. The secondary action is
**download an MP4** (1080p or 4K) from the player, for the creator's own posting.

## Who visits, on what
- People arriving from a short on Instagram / YouTube / TikTok, **mostly on phones**, wanting more
  episodes → mobile-first, thumb-reachable controls, sound off until they tap.
- The creator, on a laptop, browsing and rendering 4K exports.

## Success criteria
1. From the hero, an episode is playing within one tap / click.
2. Every one of the 25 episodes can be found and played without a search.
3. The hero is recognisable in a screenshot: the live character on its line under a giant wordmark.
4. Lighthouse mobile: Performance ≥ 85, Accessibility ≥ 95; no console errors.
5. 4K MP4 export works from the player in Chrome/Edge on a laptop.

## Non-goals
- No accounts, comments, likes, CMS or analytics.
- No video files: episodes are rendered live by the same engine that makes them.
- No dark mode, no 3D, no stock imagery.
- Not an SEO-per-episode site (one page + a hash-linked player, decided in Phase 3).

## Constraints
- Lives in `site/`, fully separate from the working files. Episodes are **copied** in by
  `site/scripts/sync-shorts.py`; the site never edits the originals.
- Static, no build step. Opens via any static server; deploys to Netlify / GitHub Pages / Vercel as-is.
- Libraries from CDN: GSAP 3 (+ScrollTrigger, SplitText), Lenis 1.
