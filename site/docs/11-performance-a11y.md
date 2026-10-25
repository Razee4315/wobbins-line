# 11 · Performance and accessibility

## Budgets
- LCP < 2.5s (mid-range phone): the LCP element is the h1 text, not a canvas.
- INP < 200ms, CLS < 0.1 (canvases have fixed aspect boxes; fonts swap with a metric-similar fallback).
- JS from CDN ≈ 120 KB gzip (GSAP + plugins + Lenis); engine + stories ≈ 120 KB.
- At most **three** live engines at once: band + hero (or band + Meet Wobbin) + one preview.
  Off-screen canvases stop rendering (IntersectionObserver). The player pauses everything else.
- Posters: each card renders one still frame once, lazily, when it nears the viewport.

## Accessibility
- Contrast: ink `#141210` on paper `#FBF8F2` ≈ 18:1; paper on blue `#3B7DD8` ≈ 4.0:1 → the CTA
  label is 18px bold (large-text threshold 3:1 met), and the blue is never used for body text.
  Ink-60 on paper ≈ 6.2:1.
- Keyboard: every card, arrow, CTA and player control is reachable; focus ring 3px blue + 3px
  paper gap; the player traps focus and restores it on close.
- Split text: `aria-label` set on the parent before SplitText runs.
- Canvases: `role="img"` with a descriptive `aria-label`; decorative ones `aria-hidden`.
- Motion: everything gated by `prefers-reduced-motion` (see 05). Lenis off, preloader skipped,
  pin off, band static, previews only on tap.
- Sound: never autoplays; starts only after a user gesture, toggle always visible in the player.
