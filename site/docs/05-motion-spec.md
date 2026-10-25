# 05 · Motion spec

Default ease `--ease-out-expo` (GSAP `expo.out`). Moves `power4.inOut`. Exits `power3.in` at 75%
duration. Scrubbed motion uses `ease: "none"` (the scroll supplies the pacing).
Everything below lives inside `gsap.matchMedia()` under `(prefers-reduced-motion: no-preference)`;
the reduced-motion column is what runs otherwise.

| # | Name | Trigger | What moves | Duration / ease / stagger | Reduced motion |
|---|---|---|---|---|---|
| 1 | `reveal-up` | element 85% into viewport, once | `y: 40 → 0`, `opacity 0 → 1` on cards, paragraphs | 900ms expo.out, 0.06s stagger | opacity only, 300ms |
| 2 | `card-hover` | pointer enter | card `y: −6`, ink outline re-boils every 120ms, preview starts | 280ms expo.out | outline static, preview on click only |
| 3 | `press` | pointerdown | buttons `y: +2`, ink offset shadow 4px → 0 | 120ms | same (no movement problem) |
| 4 | `underline-draw` | link hover/focus | hand-drawn SVG underline `stroke-dashoffset` 100% → 0 | 420ms expo.out; out 300ms in-quart | underline always shown |
| 5 | `lenis` | always (desktop, fine pointer) | smooth scroll, lerp 0.1, driven by `gsap.ticker` | — | disabled |
| 6 | `mask-lines` | load (hero), 70% in view (h2) | SplitText lines `yPercent 110 → 0`, mask lines | 1000ms expo.out, 0.1s stagger | instant |
| 7 | `block-mark` | hero wordmark | blocks drop in (0.42s each, bottom rows first, left to right); spring-lift + accent colour within 3.6 blocks of the pointer; poke = letter jumps; Wobbin's landings send a colour ripple, footsteps jiggle nearby blocks; on scroll the blocks float up and fade (scrub) | spring k 420, ζ 0.36 | static wordmark, no drop, no lift |
| 8 | `props-parallax` | hero → out | pixel props drift at depths 0.15–0.6; hero copy lifts 120px and fades by 60% of the hero | scrub, ease none | static |
| 9 | `hero-load` | after preloader | t=0 line already drawn; 0.1s wordmark lines; 0.5s Wobbin starts walking in; 0.9s kicker; 1.05s pill; 1.2s CTAs (`y 24 → 0`, `scale .96 → 1`) | overlapping, expo.out | everything visible, Wobbin standing |
| 10 | `walking-band` (signature) | scroll | band canvas: Wobbin's target speed = clamp(velocity × 26, −420, 420) px/s; reversing flips facing; idle after 0.6s still | engine springs (no CSS easing) | band static: Wobbin standing, blinking |
| 11 | `preloader-line` | page load | an ink line draws left→right with real progress (fonts, GSAP, Lenis, engine, story files), then becomes the hero line | ≥ 700ms min, exit 500ms in-quart | skipped |
| 12 | `ink-cursor` | fine pointer | 10px ink dot follows with lerp 0.22; blue pixel trail (6 squares) fades 400ms; grows to 44px ring over links/cards; hero Wobbin looks at it | per-frame | native cursor |
| 13 | `live-preview` (second signature) | card hover / centred on phone | the real episode plays muted inside the card from its poster moment; one at a time | engine time | plays only on tap |
| 14 | `rotating-pill` | every 2.2s | word rolls up out (`yPercent −100`) and the next rolls in; pill width animates; tint switches to that episode's accent | 600ms power4.inOut | swaps without movement |
| 15 | `player-open` | episode click | sheet `clip-path inset(100% 0 0 0) → inset(0)`, canvas fades in; band hides; Lenis stops | 700ms power4.inOut; close 500ms in-quart | instant |
| 16 | `divider-draw` | section enters | hand-drawn SVG divider strokes draw (`dashoffset`) | scrub 0.8 | drawn |

Rules: transforms and opacity only (plus `clip-path` on the player, `stroke-dashoffset` on SVG).
Exits are faster than entrances. Things that move as one (sheet + backdrop) share timing.
