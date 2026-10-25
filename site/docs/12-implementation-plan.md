# 12 · Implementation plan

| Phase | Work | Done when |
|---|---|---|
| 1 Foundation | `sync-shorts.py` (copy engine/sfx, extract stories, copy S1), tokens, fonts, reset, grain, wobble filter, reduced-motion guard, `episodes.js` metadata | `site/shorts/` has engine2, sfx, 20 story files, 3 S1 pages; page loads with fonts and no errors |
| 2 Static skeleton | every section with real copy, cards with posters, player sheet layout, no motion | looks good frozen at 390px, 1280px, 1920px (screenshots) |
| 3 Engine on the site | hero scene, walking band, Meet Wobbin idle, cast portraits, previews, player with export (incl. 4K) | each canvas renders; player plays all 25; 4K config reported supported/unsupported |
| 4 Scroll layer | Lenis on the GSAP ticker, reveals, parallax, dividers | smooth on desktop, native on touch, no double rAF |
| 5 Type motion | SplitText masked lines after fonts, rotating pill | h1/h2 reveal by line; `aria-label` present |
| 6 Signature | walking band velocity mapping, idle behaviour, hide in player | Wobbin walks with the scroll both ways and idles when it stops |
| 7 Showpiece extras | preloader with real progress, ink cursor, block wordmark (replaces the anatomy pin) | all three working, all gated for reduced motion |
| 8 Audit | ambition scorecard, runtime console, slop list, a11y keyboard pass, perf numbers | report with evidence |
