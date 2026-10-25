# Wobbin's Line — site rulebook

Current phase: **Phase 5 build**, revised after review (decision log 13–16).

## The site is separate
Never edit files outside `site/`. Episodes come in only through `scripts/sync-shorts.py`, which
copies `../engine2.js`, `../sfx.js`, extracts each episode's story into `shorts/stories/<id>.js`,
and copies Season 1 pages into `shorts/s1/`. Re-run it after changing an episode.

## Required
Palette: paper #FBF8F2 · ink #141210 · blue #3B7DD8 (+ per-episode accents on chips/cards only)
Type: Clash Display 600 (headings) · Satoshi 400/500/700 (text) · Silkscreen for labels · hero wordmark is drawn in blocks
Scale: h2 clamp(2.25rem,4.6vw,4.25rem) : body 17px · display tracking −0.03em, h2 −0.025em
Easing: --ease-out-expo default · power4.inOut for moves · in-quart exits at 75%
Radius: pill only (999px). Media frames are hand-drawn ink, never rounded.
Texture: paper grain 4%. Ink outlines use the #wobble SVG filter.
Signature: the one line — the block wordmark and Wobbin stand on it in the hero; then Wobbin walks it as you scroll.
No pinned/scrubbed sections (rejected by the user).
Every animation has a reduced-motion fallback (docs/05). Every interactive element has :focus-visible.
Split text only after document.fonts.ready, aria-label on the parent first.
Lenis runs on gsap.ticker; lenis.stop() while the player is open.

## Forbidden
No indigo or violet gradients (#6366F1, #8B5CF6). No gradient text. No Inter.
No three-card icon grids. No 1px grey borders. No soft drop shadows.
No centred hero. No bounce or elastic easing. No stock imagery. No lorem ipsum.
No border-radius other than 999px. No emoji as icons. No dark mode. No video files.
