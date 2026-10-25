# 04 · Typography

## Faces
| Role | Face | Source / licence | Axes used |
|---|---|---|---|
| Display | **Clash Display** (Indian Type Foundry) | Fontshare, ITF Free Font License (free for commercial use) | 500, 600, 700 |
| Text | **Satoshi** (Indian Type Foundry) | Fontshare, ITF FFL | 400, 500, 700 |

> Revised (decision 14): Bricolage Grotesque was replaced. Notes below about Bricolage are historical.
| Labels / numbers | **Silkscreen** | Google Fonts, SIL OFL 1.1 | 400 |

Why: Bricolage is a characterful grotesque with ink-trap-like quirks at display size (it looks
"drawn" at 200px without being a handwriting font), and its optical-size axis lets one family do
both the 224px wordmark and 18px body. Silkscreen is already the voice of every episode's
captions, so the site and the show share a label face.

## Scale
| Step | Size | Weight / opsz | Tracking | Line-height | Use |
|---|---|---|---|---|---|
| Display | `clamp(5rem, 15vw, 14rem)` | 800 / 96 | −0.045em | 0.86 | hero wordmark, footer wordmark |
| H2 | `clamp(3rem, 7vw, 6.5rem)` | 750 / 96 | −0.035em | 0.92 | section titles |
| H3 | `clamp(1.5rem, 2.4vw, 2.25rem)` | 650 / 48 | −0.02em | 1.05 | card and player titles |
| Lead | `clamp(1.25rem, 1.8vw, 1.625rem)` | 380 / 24 | −0.01em | 1.4 | intro paragraphs |
| Body | 18px | 400 / 14 | 0 | 1.55 | copy |
| Label | 13px Silkscreen | 400 | +0.06em, uppercase | 1.2 | chips, EP numbers, meta |

Display-to-body ratio 12.4×. Weight contrast: 800 display against 380–400 text.

## Loading
- Google Fonts CSS2 with `display=swap`, preconnect to `fonts.googleapis.com` and
  `fonts.gstatic.com`.
- Text is split by SplitText only after `document.fonts.ready`, then `ScrollTrigger.refresh()`.
- Fallback stack: `"Arial Black"` for display (similar width, avoids a big reflow), `system-ui` for text.
