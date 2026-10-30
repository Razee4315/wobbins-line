# 05 · Episodes

All 38 episodes in release order. ★ = one of the user's favourites. Seasons on the site are listed newest first.

| EP | Season | Episode | Theme | Quote | Notes |
|---|---|---|---|---|---|
| 01 | 1 | [The Cloud](../the-cloud.html) | sadness | sit with it. something grows. |  |
| 02 | 1 | [The Seed](../the-seed.html) | patience | some things only grow when you stop watching. |  |
| 03 | 1 | [The Gap](../the-gap.html) | courage | jump before the ground decides for you. | ★ favourite |
| 04 | 2 | [One More](../one-more.html) | scrolling | life doesn’t send notifications. |  |
| 05 | 2 | [The Hill](../the-hill.html) | keep going | every hill has another side. |  |
| 06 | 2 | [Bloom](../bloom.html) | kindness | pass it on. |  |
| 07 | 2 | [Hurry](../hurry.html) | slowing down | you’ll still get there. |  |
| 08 | 2 | [What If](../what-if.html) | overthinking | let it go. | ★ favourite |
| 09 | 3 | [Last Minute](../last-minute.html) | procrastination | why is the last night always the most productive? | ★ favourite |
| 10 | 3 | [Yes](../yes.html) | people-pleasing | you can say no. they’ll be okay. | ★ favourite |
| 11 | 3 | [Perfect](../perfect.html) | perfectionism | done is better than perfect. | ★ favourite |
| 12 | 3 | [Battery](../battery.html) | the social battery | it’s okay to need quiet. real friends get it. | ★ favourite. New ending (2026-10-28): two friends sit with Bo; they skip off together |
| 13 | 3 | [Seen](../seen.html) | waiting for a reply | not every silence is about you. | ★ favourite |
| 14 | 4 | [Tomorrow](../tomorrow.html) | putting it off | ready or not... just start. |  |
| 15 | 4 | [Highlight Reel](../highlight-reel.html) | comparison | don’t compare your every day to their best day. |  |
| 16 | 4 | [Small Steps](../small-steps.html) | consistency | small steps, every day. they add up. |  |
| 17 | 4 | [Snooze](../snooze.html) | five more minutes | the day doesn’t wait. get up for it. |  |
| 18 | 4 | [Reset](../reset.html) | bad days | bad days end. tomorrow is a new line. |  |
| 19 | 5 | [Monday Mountain](../monday-mountain.html) | dread | it’s never as big up close. |  |
| 20 | 5 | [Imposter](../imposter.html) | imposter syndrome | you did earn it. you belong here. |  |
| 21 | 5 | [Decision](../decision.html) | too many choices | pick one. you can always turn. |  |
| 22 | 5 | [Busy](../busy.html) | rushing past | slow down for the ones who wait. |  |
| 23 | 5 | [Rain Check](../rain-check.html) | cancelling plans | not every plan needs a rain check. sometimes, go anyway. | ★ favourite |
| 24 | 6 | [The Other Line](../the-other-line.html) | impatience | the other line always looks faster. yours is moving too. |  |
| 25 | 6 | [Why Was I Here?](../why-was-i-here.html) | forgetting | it’s not just you. doorways really do make you forget. |  |
| 26 | 6 | [Lost](../lost.html) | losing things | slow down. it’s usually closer than you think. | New ending (2026-10-28): "...where's my phone?" |
| 27 | 6 | [Small Talk](../small-talk.html) | awkward silence | every friend was a stranger once. | New ending (2026-10-28): Bo says hi first to a new stranger |
| 28 | 6 | [Can’t Sleep](../cant-sleep.html) | night thoughts | tomorrow is tomorrow’s problem. |  |
| 29 | 7 | [Just in Case](../just-in-case.html) | overpacking life | pack light. keep one umbrella. |  |
| 30 | 7 | [Heavy](../heavy.html) | asking for help | asking for help isn’t weak. it’s how we reach higher. |  |
| 31 | 7 | [Fine](../fine.html) | pretending you’re okay | not fine? that’s fine too. |  |
| 32 | 7 | [Comfort Zone](../comfort-zone.html) | stepping out | comfort zones grow every time you step out. |  |
| 33 | 7 | [Inner Voice](../inner-voice.html) | the inner critic | talk to yourself the way you would talk to a friend. |  |
| 34 | 8 | [The Chair](../the-chair.html) | putting it away | put it away now. future you says thanks. | New 2026-10-30 |
| 35 | 8 | [Two Minutes](../two-minutes.html) | the tiny task you dread | it took two seconds. the dread took two weeks. | New 2026-10-30 |
| 36 | 8 | [Did I Lock It?](../did-i-lock-it.html) | checking again | you checked. you can let it go. | New 2026-10-30 |
| 37 | 8 | [Water Yourself](../water-yourself.html) | looking after yourself | you need watering too. | New 2026-10-30 |
| 38 | 8 | [Slow Walker](../slow-walker.html) | slowing down for others | some days, the slow lane has the best view. | New 2026-10-30 |

## Seasons

| Season | Title | Episodes |
|---|---|---|
| 1 | First lines | 01–03 (rebuilt on engine 2 with sound and MP4 export) |
| 2 | Loops | 04–08 |
| 3 | Everyday struggles | 09–13 |
| 4 | Getting unstuck | 14–18 |
| 5 | Small courage | 19–23 |
| 6 | Little things | 24–28 |
| 7 | Heavy things | 29–33 |
| 8 | Daily routine | 34–38 |

## Posting log

Track what has gone out here. Posting order and captions: `exports/POSTING-PLAN.md` (folder per day).

| Date | Platform | Episode | Notes |
|---|---|---|---|
| 2026-10-30 | Instagram, Facebook Page, YouTube Shorts, TikTok, Pinterest | 01 Battery | First post. Uploaded a 1080p copy (CRF 17, ~9.6 MB: the browser extension's upload limit is 10 MB). YouTube kept a video frame as thumbnail and TikTok went through a first-post review. |

## Adding an episode

1. Write `<id>.html` in the project root (copy a recent one as a template; follow `02-episode-guide.md`).
2. Add the id to `ENGINE2` in `site/scripts/sync-shorts.py` and an entry to `site/js/episodes.js` (title, theme, accent, poster time, line, quote).
3. Add a card to the root `index.html`, a row here, and a row in `../ideas.md`.
4. `python site/scripts/sync-shorts.py`, then `sh site/scripts/bump.sh`, test, commit, push.
