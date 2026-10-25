# 02 · Art direction: Sketchbook Cinema

Approved at Stop Gate 1 (2026-10-25). Tier: **Showpiece**, confirmed by the user.

```
DIRECTION: Sketchbook Cinema

Reference   kurzgesagt.org (stacked giant headline over a live world), notion.com (hand-drawn
            cast row, rotating word pill), pudding.cool (hand-drawn buttons, issue chips)
Feeling     warm, hand-made, playful, quietly clever. "Someone drew this, and it's alive."
Palette     paper  #FBF8F2  page ground
            ink    #141210  all type, all lines, all outlines
            blue   #3B7DD8  the one site accent: links, focus, the CTA fill, the cursor trail
            (episode accents are not site colours: each episode chip/card uses its own
             accent from the shorts, documented as the single exception)
Type        Display + text: Bricolage Grotesque (Mathieu Triay, Google Fonts, OFL), variable
            wght 200–800 / opsz 12–96. Display at 800/opsz 96, text at 400/opsz 14.
            Labels: Silkscreen (Jason Kottke, Google Fonts, OFL) — the shorts' caption face.
Type scale  Display clamp(5rem, 15vw, 14rem) ≈ 224px  :  body 18px  →  ratio 12.4×
Grid        12 columns, 24px gutter, max 1440px, side padding max(5vw, 16px)
Density     Spacious: section padding clamp(6rem, 14vh, 12rem)
Corners     Pill (999px) for every control and chip. Media frames are hand-drawn, not rounded.
Borders     Hand-drawn ink outlines (2.5px, SVG displacement wobble). No hairline grey borders.
Texture     Paper grain, SVG feTurbulence, 4% opacity, multiply, pointer-events none.
Hero        "Stacked wordmark over a live scene": WOBBIN'S / LINE at display size, left-aligned,
            breaking the container to the right edge; the real engine renders Wobbin walking in
            on a hand-drawn line that runs under the wordmark and off both edges.
            Load: preloader line draws to 100% → it becomes the hero line → wordmark lines
            mask-reveal (0.1s stagger) → Wobbin walks in from the left and stops under "LINE",
            turns to look at the cursor → kicker, rotating pill and CTAs rise in.
Motion      Default ease: --ease-out-expo cubic-bezier(0.16, 1, 0.3, 1). Moves: in-out-quart.
            Exits: in-quart at 75% duration. Inventory: 13 items (see 05-motion-spec.md).
SIGNATURE   The page is one line. A hand-drawn ground line lives in a slim band at the bottom of
            the viewport for the whole page; Wobbin walks it as you scroll (scroll velocity sets
            the walking speed, scrolling up turns Wobbin round, stopping lets Wobbin idle,
            blink and look at the cursor). It is the same line the hero starts on, and the same
            engine as the episodes.
Second      Live previews: every episode card plays the real episode, muted, on hover (desktop)
            or when centred (phone), one at a time.
Sources     steal #1 (hero), #2 (live world), #3 (cast), #4 (pill), #5 (ink buttons),
            #6 (EP chips), #7 (props), #8 (previews), #9 (one line, original)
Anti-list   No indigo/violet gradients. No gradient text. No Inter. No three-card icon grid.
            No grey 1px borders. No soft drop shadows. No emoji icons. No stock. No dark mode.
            No bounce/elastic easing. No centred hero. No lorem ipsum.
Risk        The walking band must never cover content or controls: it is 112px tall on desktop,
            84px on phones, content gets matching bottom padding, and it hides while the player
            is open. Live canvases must not tank phones: only one live preview at a time.
```

## Names
- **Wobbin**: the character (from "wobble": every move squashes, stretches and wobbles).
  Coined; no existing character/brand with this exact name was found on 2026-10-25.
- **Wobbin's Line**: the show and the site.
- The friends (pink curl, blue antenna, orange tuft, green curl) stay unnamed on the site.
