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
| Caption voice (one sentence) | −48 to −50 dB | one soft note per word, faint |
| Walking (8 steps) | about −42 dB | very faint |
| Landing thud | about −36 dB | |
| Chime | about −34 dB | the loudest "musical" accents sit here |
| Pop | about −43 dB | |
| Turn chord (`swell`) | about −33 dB | was −26 dB and slow; now a short bright rolled chord |
| Ambience (`birds`, `night`, `rainbed`, `windbed`) | −60 to −69 dB | sparse little sounds only |

**No held noise beds.** The steady hiss/rumble beds were the "disturbing background sound"
(feedback 2026-10-28). Ambience is now made of sparse, separate sounds; `room` is silent.
Never add a continuous noise layer under a whole episode.

If a new sound feels loud, measure it the same way (`docs/07-workflow.md`) and keep it at or below the chime.

## The caption voice

When captions type out, the speaker sings one soft note per word, like humming "mm" over a felt mallet. The notes wander the C pentatonic scale in small steps (picked from the caption and word number, so the same line always plays the same tune); a question lifts at the end, an exclamation brightens, a plain sentence settles on the home note and "..." trails off. The last word is longer with a touch of vibrato. Each speaker has a register: Wobbin 1.0, friends 1.15–1.45, the critic in Inner Voice 0.72. Set it per episode with `voice: { pitch }` or per caption as the 5th item (`false` makes a caption silent).

It replaced a murmured formant syllable every other letter (the "do-do-do" the user disliked, 2026-10-30).

**Foley drifts.** Body and prop sounds (`step`, `land`, `pop`, `tock`, `knock` and so on, the `FOLEY` list in `sfx.js`) get a small random change in pitch (±4%) and level (±12%) each time, so nothing repeats exactly. Musical sounds are never detuned.

**Softer replacements (2026-10-30):** `laugh` is now breathy little "he" notes at uneven gaps (was a 30 Hz vibrato buzz), `ring` a soft bell trill (was a 90 Hz warble), `beep` a round "boop", `typing` soft wooden clicks.

## Ambience

Sparse sounds that run for a whole scene (they loop with the film):
`room` (silent now), `birds` (a few distant tweets), `night` (far crickets now and then), `rainbed` (soft plinks), `windbed` (a gust every few seconds). Start them once with `S.once('amb', () => S.sfx('room', { d: LOOP }))`.

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
