# 03 · Design tokens

The source of truth is `site/css/tokens.css`. Nothing in the CSS may use a colour, size, radius,
easing or duration that is not one of these.

| Group | Token | Value | Role |
|---|---|---|---|
| Colour | `--paper` | `#FBF8F2` | page ground |
| | `--ink` | `#141210` | type, lines, outlines |
| | `--ink-60` | `rgb(20 18 16 / .6)` | secondary text (ink at 60%, not a new colour) |
| | `--ink-12` | `rgb(20 18 16 / .12)` | pressed / selected washes |
| | `--blue` | `#3B7DD8` | site accent: CTA fill, links, focus ring, cursor trail |
| | `--on-blue` | `#FBF8F2` | text on blue |
| Episode accents | `--ep` (set per element) | from the shorts: `#ff004d #ffa300 #ffec27 #00b543 #00e436 #3b7dd8 #29adff #7b5cff #ff77a8` | chips and card tints only |
| Type | `--font-display` | `"Clash Display", "Arial Black", sans-serif` | |
| | `--font-text` | `Satoshi, system-ui, sans-serif` | |
| | `--font-pixel` | `Silkscreen, "Courier New", monospace` | labels, chips, numbers |
| | `--s-display` | `clamp(5rem, 15vw, 14rem)` | hero wordmark |
| | `--s-h2` | `clamp(3rem, 7vw, 6.5rem)` | section titles |
| | `--s-h3` | `clamp(1.5rem, 2.4vw, 2.25rem)` | card titles, player title |
| | `--s-lead` | `clamp(1.25rem, 1.8vw, 1.625rem)` | intro paragraphs |
| | `--s-body` | `1.125rem` (18px) | body |
| | `--s-label` | `0.8125rem` (13px) | pixel labels |
| Space | `--sp-1 … --sp-8` | 4, 8, 16, 24, 40, 64, 104, 168 px | |
| | `--section-pad` | `clamp(6rem, 14vh, 12rem)` | |
| | `--gutter` | `24px` | |
| | `--side` | `max(5vw, 16px)` | |
| | `--max` | `1440px` | |
| Radius | `--r-pill` | `999px` | every control and chip (the only radius) |
| Line | `--stroke` | `2.5px` | hand-drawn outlines |
| | `--band-h` | `112px` desktop / `84px` ≤ 700px | the walking band |
| Easing | `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | default for entrances |
| | `--ease-in-out-quart` | `cubic-bezier(0.77, 0, 0.175, 1)` | moves of on-screen things |
| | `--ease-in-quart` | `cubic-bezier(0.5, 0, 0.75, 0)` | exits |
| Duration | `--d-micro` | `180ms` | hover, press |
| | `--d-ui` | `280ms` | chips, menus |
| | `--d-enter` | `900ms` | reveals |
| | `--d-exit` | `660ms` | exits (≈75%) |
| Texture | `--grain` | 4% opacity | paper grain overlay |
| Shadow | none | — | the only "shadow" is a hard 4px ink offset on the primary CTA when pressed-out |
