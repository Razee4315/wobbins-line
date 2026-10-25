# 07 · Components

All controls are pills (`--r-pill`), outlined with the hand-drawn ink stroke (SVG filter `#wobble`
applied to a 2.5px border box), Bricolage 600 / 16px or Silkscreen 13px.

| Component | Default | Hover | Focus-visible | Active | Disabled | Loading |
|---|---|---|---|---|---|---|
| **Primary CTA** | blue fill, paper text, 4px hard ink offset (bottom-right) | offset grows to 6px, label shifts 1px | 3px blue ring outside a 3px paper gap | `y +2px`, offset 0 | 40% opacity, no offset | label replaced by pixel spinner |
| **Ghost button** | ink outline, ink text | outline re-boils (filter seed steps every 120ms), bg `--ink-12` | as above | `y +2px` | 40% | — |
| **Chip / EP tag** | Silkscreen 13px, accent fill at 100%, ink text (paper text on dark accents) | — | — | — | — | — |
| **Text link** | ink, hand-drawn underline hidden | underline draws (`underline-draw`) | underline drawn + blue ring | — | — | — |
| **Icon button** (player) | 48×48 pill, ink outline, hand-drawn SVG icon | outline boils | ring | `y +2` | 40% | spinner |
| **Episode card** | hand-drawn frame, poster frame on canvas, chip, title, logline | lifts 6px, preview plays, frame boils | ring around the frame | scale .99 | — | poster shimmer (pixel dots) |
| **Season row** | header + horizontal track + ◀ ▶ buttons | — | track focusable, arrow keys scroll | — | arrows disabled at ends | — |
| **Player sheet** | see 06-page-specs | — | focus trapped inside; first focus on play | — | — | `Rendering MP4 … 42%` meter (pixel bar) |
| **Nav** | transparent bar | links draw underline | ring | — | — | — |
| **Footer** | huge wordmark, CTA, socials | social icons wobble | ring | — | — | — |

Icons: hand-drawn SVG strokes made for this site (play, pause, sound on/off, download, arrow
left/right, close, aspect), 2.5px round-cap ink, viewBox 24. No icon library, no emoji.
