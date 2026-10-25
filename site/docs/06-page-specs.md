# 06 · Page specs

One page (`index.html`) plus a player sheet addressed by hash: `#ep/<episode-id>`.

## Navigation
Fixed top bar, transparent over paper, 72px: pixel wordmark "WOBBIN'S LINE" left; right: `Episodes`,
`Meet Wobbin`, `The cast`, and a pill CTA `▶ Play episode 1`. On ≤ 700px the three links
collapse into a single `Episodes` pill (the page is one scroll, so a menu would hide less than it costs).

## Sections, top to bottom
0. **Preloader**: paper, an ink line drawing with real load progress, pixel `%` counter at its tip.
1. **Hero** (`min-height: 100dvh`)
   - Kicker (Silkscreen): `A TINY SHOW, DRAWN ON ONE LINE`
   - Wordmark h1: `Wobbin's` / `Line`, left-aligned, the second line overflowing the right edge
   - Live canvas behind/below the wordmark: the hand-drawn line + Wobbin walking in
   - Pill line: `tiny stories about [procrastinating]` (rotating, 8 themes)
   - CTAs: primary `▶ Play episode 1` (blue fill, ink offset), secondary `See all 25 ↓` (ink outline)
   - Pixel props drifting at the edges (clock, crown, heart, balloon, ball, drop)
   - Scroll cue: Wobbin's line continues into the walking band
2. **Meet Wobbin** (two columns ≥ 960px, stacked below)
   - Left: h2 `Meet Wobbin.` + lead paragraph + four real facts as a numbered list
     (`25 episodes` · `5 seasons` · `0 video files` · `every one loops`)
   - Right: a large framed live canvas: Wobbin idling (blinks, looks at cursor, hops if clicked)
3. ~~How an episode works~~ (removed, decision 13). Original spec, kept for the record:
   `01 the setup` → `02 it gets worse` → `03 the turn` → `04 and it loops`
4. **Episodes**: section h2 `Every episode.` then five season rows, **newest first**:
   - Row header: pixel `SEASON 5`, title (`Small courage`), episode count
   - Horizontal track of cards (scroll-snap on touch, drag/scroll on desktop, arrow buttons)
   - Card: hand-drawn frame with live 9:16 preview canvas, `EP 21` chip tinted with the accent,
     title (H3), one-line logline, theme + running time
5. **The cast**: four friends + Wobbin, live portraits in hand-drawn circles, one line each
6. **Footer**: huge wordmark, `Start from episode 1` CTA, socials (placeholders, marked), credit
   line `Every frame is simulated in your browser. Nothing here is a video.`

## Player sheet (`#ep/<id>`)
Full-screen paper sheet. Left (≥ 960px) or top: the episode canvas in a hand-drawn frame,
9:16 by default with a `16:9` toggle. Right / below: EP chip, title, theme, the closing line as a
quote, controls, prev/next. Controls: play/pause, scrubber with time, sound toggle (on by default
once the user has tapped), aspect toggle, `Download MP4 ▾` (1080×1920, 2160×3840 4K, 3840×2160 4K),
close (×, Esc). Keyboard: Space play/pause, ←/→ prev/next episode, M sound, Esc close.
Season 1 episodes (older engine) play in an iframe of the copied original; their download menu
offers WebM recording only (documented limitation).

## Responsive
- ≤ 700px: hero wordmark at 15vw, CTAs full-width stacked; Meet Wobbin stacks canvas first;
  pinned section becomes 4 stacked stills with captions (no pin); cards 72vw wide.
- 701–1199px: two-column Meet Wobbin from 960px; cards 300px.
- ≥ 1200px: as specified; cards 320px.

## Empty / error states
- An episode that fails to start shows its pixel poster with `Couldn't start this one — reload?`.
- Export on browsers without WebCodecs: menu items disabled with `Export needs Chrome or Edge`.
- Unknown `#ep/` hash: opens nothing and scrolls to Episodes.
