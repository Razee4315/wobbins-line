# 15 · Audit (2026-10-26)

Tested in the app's built-in Chromium browser at 1440×900 and 375×812. The pane ran in the background, so animation timing was driven by hand. Timing on a real device is not measured here.

## 0. Ambition (Showpiece, 13-item floor)
| # | Item | Status |
|---|---|---|
| 1 | Lenis smooth scroll on the GSAP ticker (fine pointers) | yes |
| 2 | Masked SplitText line reveals on every h2 | yes |
| 3 | Batch reveals (`.reveal`) | yes |
| 4 | Hero load choreography (blocks drop in, copy, Wobbin walks in) | yes |
| 5 | Signature: one line shared by hero and band, Wobbin follows the scroll | yes |
| 6 | Velocity-driven motion (Wobbin's walk speed = scroll velocity) | yes |
| 7 | Interactive block wordmark (replaces the rejected anatomy pin) | yes |
| 8 | Scroll-scrubbed hero exit (letters peel off, copy lifts) | yes |
| 9 | Prop parallax at depths | yes |
| 10 | Live card previews on hover / when centred | yes |
| 11 | Preloader with real progress | yes |
| 12 | Custom ink cursor with a pixel trail | yes |
| 13 | Player sheet transition + footer wordmark that drops in | yes |

**13 of 13.** Libraries loaded: gsap, ScrollTrigger, SplitText, Lenis, engine, 20 stories.

## 0b. Runtime
- Console: no errors on load, scroll, player open/close or export.
- Episodes: all 23 open in the player. All 20 engine-2 episodes compute a seamless loop with loop error 0.00 and render ink at 10/50/90% of their length. All 3 Season 1 iframes load their canvas.
- Player: play/pause, scrub, 9:16 ↔ 16:9, prev/next, arrow keys and Esc all work. With sound on (a real click), the step and roll sounds play.
- Export (in memory): *Decision* at 1080×1920 gives a valid 29.6 s, 27.5 MB MP4 in 52 s. 2160×3840 and 3840×2160 test clips (3 s) decode at full size. VideoEncoder and AudioEncoder (H.264 High 5.2, AAC) are supported.
- Fixed during the audit: the phone page was 1298px wide (season rows had no `min-width: 0`); in the stacked player the info panel overlapped the video and the chip stretched full width; after scrolling back to the top, Wobbin was left wherever he had walked.

## 1. Slop check
No indigo/violet gradients, gradient text, Inter, three-card icon grids, grey 1px borders, soft shadows, centred hero, bounce easing, stock images or lorem ipsum. Radius is pill only. Shadows are hard 4px offsets in ink.

## 2. Direction drift (all logged in 13-decision-log)
- The How section was removed (13). Fonts changed to Clash Display + Satoshi (14). The hero is a block wordmark (15). The scale is smaller and strides are capped (16).

## 3. Motion
Easing tokens (expo.out, power4.inOut, power3.in for exits) are used throughout; the only `ease: 'none'` uses are scroll scrubs. The wordmark uses spring physics (k 420, ζ 0.36).

## 4. Performance (not measured on a phone)
No images or video. Only one live episode preview runs at a time. The hero canvas stops drawing once it is off screen. Fonts load with `display=swap`.

## 5. Accessibility
A real `h1` and the footer wordmark text stay in the DOM, visually hidden. Canvases are `aria-hidden` or labelled. Split headings get `aria-label`. The player traps focus and closes with Esc. `:focus-visible` is on every control.

**Not verified:** the OS reduced-motion setting (the code paths exist but weren't toggled here), a full keyboard-only pass of the page, and WCAG contrast numbers for the 60% ink text.

## With another day
- Toggle reduced motion for real and do a keyboard-only pass.
- Port Season 1 to engine 2 so it gets sound and MP4 export.
- Measure LCP/INP on a mid-range Android phone.
