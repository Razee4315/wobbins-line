# 09 · Tech stack

| Layer | Choice | Why, for this project |
|---|---|---|
| Pages | One static `index.html` | Single scroll is the signature; no routing needed beyond a hash |
| Styles | Plain CSS + `tokens.css` custom properties | Small site, no build step (user decision) |
| Motion | GSAP 3.13 + ScrollTrigger + SplitText (CDN, jsDelivr) | Masked line reveals, the pinned scrubbed section and the hero timeline need them. SplitText is free since GSAP 3.13 |
| Smooth scroll | Lenis 1.x (CDN) on the GSAP ticker | Momentum scroll that keeps native scrolling, sticky and anchors working |
| Episodes | Copied `engine2.js` + `sfx.js`; each episode's story extracted into `shorts/stories/<id>.js` and wrapped in an IIFE | The site renders episodes directly in its own canvases (previews, band, player) with no iframes. One engine instance runs many shows |
| Season 1 | Copied original pages in `shorts/s1/`, played in an iframe | The older engine (engine.js) has no embeddable Show class; rewriting it isn't worth it |
| Export | `Shorts.exportMP4` (WebCodecs + mp4-muxer CDN), now with 2160×3840 and 3840×2160 | Same frame-exact pipeline as the episodes, so 4K comes straight from the site |
| Sync | `scripts/sync-shorts.py` copies + extracts from `../` into `site/shorts/` | Keeps the site separate from the working files and repeatable after edits |
| Hosting | Any static host | No server code |

**Rejected:** a Vite/React rebuild. It would add a toolchain and a build step for one page, and the
user picked static. **Rejected:** per-episode iframes for previews; 20 iframes each running their
own engine would multiply memory and start-up cost.
