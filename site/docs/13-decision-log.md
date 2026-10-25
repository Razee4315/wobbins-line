# 13 · Decision log

| # | Decision | Why | Alternatives rejected |
|---|---|---|---|
| 1 | Character name **Wobbin** | User wanted a coined, uncommon name; from "wobble" (squash and stretch). No exact existing use found on 2026-10-25 | Quillby, Squiggo; Nibbo (taken by a family app) |
| 2 | Site/show name **Wobbin's Line** | "[Name]'s Line" pattern chosen by the user; the world is one line | "[Name] Walks", "[Name]" alone |
| 3 | Direction **Sketchbook Cinema** | Matches the shorts (ink on paper + pixel accents) so the site and the show feel like one object | Level Select (loses the hand-drawn charm), Riso Zine (drifts from the shorts' look) |
| 4 | Tier **Showpiece** | User asked for "amazing"/"best effort"; portfolio/launch site | Crafted |
| 5 | One page + hash player | Fast browsing, keeps the one-line signature continuous | Home + episode pages |
| 6 | Static, CDN libraries | User choice; trivial hosting | Vite/React |
| 7 | Stories extracted into IIFE files and rendered in site canvases | One engine runs previews, band, hero and player without iframes | 20+ iframes |
| 8 | Season 1 via iframe | Old engine has no embeddable API | Porting S1 to engine2 (worth doing later as a "remaster") |
| 9 | 4K export in the player | User wants 4K renders from the site | Separate studio-only rendering |
| 10 | Newest season first | Visitors arrive from the newest shorts | Chronological |
| 11 | Socials as marked placeholders | Accounts not created yet | Leaving them out |
| 12 | Blue `#3B7DD8` as the single site accent | The user's favourite colour from the shorts; reads well on paper | Rotating accents site-wide (would fight the episodes) |
| 13 | Removed "How an episode works" (pinned scroll scrub) | User disliked the scroll-pinned animation. Showpiece item 7 now met by the hero wordmark (interactive, scroll-driven exit) instead of a pin | Shorter pin; autoplaying stills |
| 14 | Fonts **Clash Display + Satoshi** (Fontshare, ITF Free Font License, free for commercial use) | User found Bricolage "not good"; Clash Display has sharper character at heading sizes and Satoshi is a calm, round text face that suits the round character | Bricolage Grotesque, Space Grotesk, Fraunces |
| 15 | Hero rebuilt around a **block wordmark** standing on Wobbin's line | User asked for a "wooow" hero. Blocks drop in, lift and light up near the pointer, jump when poked, ripple when Wobbin lands, jiggle under Wobbin's feet, and float off on scroll. Real h1 stays in the DOM (visually hidden) | Big typeset wordmark (previous version) |
| 16 | Smaller scale everywhere + strides capped (`story.maxLead`, site-only engine patch) | User: "very zoomed in" and "very big steps". Type scale down about a third; band walk speed capped at 220, foot lead at 30 | Leaving the engine alone and only slowing the walk |
| 17 | Season 1 rebuilt on engine 2 | It had no sound, exported only silent WebM, and played in an iframe on the site. Now all 23 episodes share one engine, sound, seamless loops and MP4/4K export. The original pages are kept in `legacy/season1/` | Converting the WebM files with ffmpeg (still silent) |
| 18 | Seasons 6 and 7 (EP 24–33) | User asked for 10 more relatable, "obvious at a glance" shorts that open on curiosity and reveal; topics chosen from everyday struggles research | More workplace or programmer-specific topics (too narrow) |
| 19 | Engine: line boil on by default, uneven blinks, breathing idle, sky colour ramps | User said the shorts felt "programmed"; hand-drawn boil at ~12 fps with smooth 60 fps motion is the classic hand-made look | Animating on twos (choppier, user wants smooth) |
| 20 | Sound: warm master (low-pass 6.2 kHz, −4 dB shelf), min attack 7 ms, softer bells/taps/chirps, ambience beds, murmured caption voice for every episode | User wants soft, non-harsh, "amazing" sound; research on cartoon foley and Animalese-style voices | Sample packs (clash with the synthesized style, need downloads) |
