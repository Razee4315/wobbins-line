# 03 · Sound

All sound is synthesized in code (`sfx.js`): soft sine and triangle tones, filtered noise, a little shared reverb and a gentle compressor. No sample files. The same code plays live in the browser and is mixed offline into the MP4 soundtrack.

## What the user wants

- **Soft, never harsh.** Pleasing, not noisy. "Like a cartoon," but gentle.
- **Very faint** footsteps and caption voice: they were too loud (feedback 2026-10-26).
- Every action has a sound, synced to the motion (cartoon "mickey-mousing").

## How it's kept soft

- The master bus has a **warm low-pass at 6.2 kHz** and a **−4 dB high shelf at 3.2 kHz**, so nothing is sharp or tiring.
- **No instant attacks**: every tone ramps in over at least 7 ms and every noise over at least 5 ms. Instant attacks are the clicks that make sound feel "digital".
- Bells keep their upper partials quiet and short, so they ring instead of ping.
- Master gain is **1.0**.
- MP4 exports are normalized to a peak of **0.5** (about −6 dB), not full scale, so posted videos are gentle too.

## Levels we settled on (offline RMS, 1.2 s window)

| Sound | Level | Notes |
|---|---|---|
| Caption voice (one sentence) | about −52 dB | a faint murmur under everything |
| Walking (8 steps) | about −42 dB | very faint |
| Landing thud | about −36 dB | |
| Chime | about −34 dB | the loudest "musical" accents sit here |
| Pop | about −43 dB | |
| Birds ambience bed | about −51 dB | barely there, adds air |

If a new sound feels loud, measure it the same way (`docs/07-workflow.md`) and keep it at or below the chime.

## The caption voice

When captions type out, Wobbin "speaks" in a soft murmur, like the voices in Animal Crossing: one syllable for every second letter, the vowel picked from the letter, a slight random wobble in pitch, a rise at the end of questions and a fall on the last syllable. Each speaker has a pitch: Wobbin 1.0, friends 1.15–1.45, the critic in Inner Voice 0.72. Set it per episode with `voice: { pitch }` or per caption as the 5th item (`false` makes a caption silent).

## Ambience beds

Long, quiet layers that run under a whole scene (they loop with the film):
`room` (indoor room tone), `birds` (soft air with distant tweets), `night` (far crickets), `rainbed`, `windbed`. Start them once with `S.once('amb', () => S.sfx('room', { d: LOOP }))`.

## Every sound, by job

- **Body:** `step`, `jump`, `land`, `skid` (automatic from the engine), `squish`, `boing`, `trip`, `slip` ("uh-oh"), `dizzy`, `thump`.
- **Voice and breath:** `voice`, `hum`, `laugh`, `gasp`, `yawn`, `snore`, `breathIn`, `breathOut`.
- **Feelings and music:** `chime`, `arp`, `twinkle`, `sparkle`, `ding`, `bulb` (an idea), `swell`, `pad` (long warm chord), `musicbox`, `pluck`, `charge`, `drain`, `powerDown`, `heart`.
- **Things:** `pop`, `poof`, `tock`, `tick`, `ring`, `tap`, `knock`, `door`, `jingle` (keys), `zip`, `rustle`, `creak`, `umbrella`, `bus`, `hiss`, `honk`, `toss`, `catch`, `crash`, `shatter`, `erase`, `scribble`, `brush`, `dab`, `flip`, `plane`, `typing`, `roll`.
- **Nature and weather:** `rain`, `drip`, `splash`, `stream`, `wind`, `whoosh`, `whistle`, `rumble`, `chirp`, `tweet`, `flap`, `baa`.
- **Beds:** `room`, `birds`, `night`, `rainbed`, `windbed`.
- **Old:** `blip` (the muted key click, only used if a story sets `voice: false`).

## What we learned from research

- Cartoon foley works when it's **heightened and layered**, and tightly synced to motion.
- Animal Crossing's "Animalese" is syllables sped up and pitched per character with a little melody. We do the same in code instead of with recordings.
- Free sample packs would sound out of place next to the synthesized sounds, so we stayed fully procedural.
