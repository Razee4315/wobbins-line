# 08 · Assets

No photography exists and none will: the direction is photography-free by design. Every visual
is either the live engine or drawn in code.

| Asset | Purpose | Format / size | Source | Alt / label |
|---|---|---|---|---|
| Episode canvases | hero, band, previews, player, cast | `<canvas>`, devicePixelRatio ≤ 2 | engine2.js + story files | `aria-label="Episode: The Hill, playing"` etc. |
| Season 1 episodes | player | iframe of copied original page | `site/shorts/s1/*.html` | iframe `title="Episode: The Cloud"` |
| Pixel props | hero edges | inline sprite drawing (canvas) | engine2 `SPRITES` | decorative, `aria-hidden` |
| Hand-drawn icons | controls | inline SVG, viewBox 24 | drawn for this site | each button has a text label |
| Wobble filter | ink outlines | inline SVG `feTurbulence` + `feDisplacementMap` | code | — |
| Paper grain | texture | inline SVG noise as CSS background, 4% | code | — |
| Favicon | tab icon | `favicon.svg` (Wobbin's eye + tuft) | drawn for this site | — |
| Social card | link previews | `og.png` 1200×630 | **BLOCKER: to render** from the hero at launch | "Wobbin's Line: a tiny show drawn on one line" |

Treatment: everything is ink `#141210` on paper `#FBF8F2` with the episode's single accent.
