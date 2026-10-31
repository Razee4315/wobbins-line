# 11 · Posting

How the show goes out on social media. Read this before posting or checking stats. Every post is logged in `05-episodes.md` (Posting log), and results go in `04-lessons-learned.md`.

## The accounts

The show's name is **Wobbin's Line** and the handle is `wobbinsline` everywhere. All of them were set up on 2026-10-30.

| Platform | Account |
|---|---|
| Instagram (Creator, category Artist) | https://www.instagram.com/wobbinsline/ |
| Facebook Page | https://www.facebook.com/profile.php?id=61596027811565 |
| YouTube | https://www.youtube.com/@wobbinsline (channel `UCpmrIgPCgZBPcBU9VNG1CDw`) |
| TikTok | https://www.tiktok.com/@wobbinsline |
| Pinterest (business, board "Wobbin's Line episodes") | https://www.pinterest.com/wobbinsline/ |

Names, bios and settings for these and every optional platform are in `12-account-setup.md`. Where the two differ, this page wins. LinkedIn is out: the user said to ignore it.

**Still to do by the user** (last known 2026-10-31; ask or check before relying on it):
- Link Facebook to Instagram: it needs the Instagram login. Until then each platform gets its own upload.
- Add the website link on Instagram, and switch TikTok to a Business account. Both are phone-app only.
- Do YouTube's one-time phone verification. It unlocks custom thumbnails and clickable links.
- Decide whether the live bios should say Wobbin: the YouTube, Facebook and Pinterest ones say "Bo and friends", but Bo is only the name in the code.

## The plan

**Two sets of numbers:** folders, days and `exports/` use the posting order below. `05-episodes.md` uses EP numbers, the order episodes were made. The Gap is day 5 but EP 03.

- **One video a day at about 12 pm Pakistan time**, in the order at the end of this page.
- The user sometimes says "post now". Do it, and mention how close it is to the last post. A few hours apart is the guideline.
- Keep to the order until the user changes it.
- **Don't post on your own.** Each post needs the user to say so.
- **The older videos stay as they are.** After seeing the first stats the user chose not to re-cut them (2026-10-31).
- **The order:** `ORDER` in `tools/export.js` is the truth. If the table at the end of this page differs, trust `ORDER` and update the table. Episodes without a folder in `exports/` have to be exported first, and that's a render, so ask.

## What Claude can and can't do

Claude posts through Claude in Chrome, in the user's logged-in browser.

- Claude never signs up, logs in or types passwords, and never solves a CAPTCHA. Those are the user's.
- Nothing else needs asking once the user has said to post: captions and covers come from the episode's folder.

## Files

`exports/` is git-ignored (the videos are large), so it exists only on the user's computer.

- `exports/NN - Title/`: `NN Title 4K.mp4`, `NN Title cover.png`, `caption.txt`, and `NN Title 1080p.mp4` once made.
- `exports/00 - Brand kit/`: profile picture, banners, GIPHY stickers.
- `exports/POSTING-PLAN.md`: the user's own copy of the daily plan.
- To rebuild them: `tools/export.js` and `tools/brand.js` (see `07-workflow.md`). All 38 videos took about 2 hours in two tabs.

## Before each post

1. **Browser:** run `list_connected_browsers` and use the **Windows** one (`onThisComputer`). A Mac browser on the same account can be the default, and it's logged out of everything.
2. **Upload copy:** the extension's `file_upload` stops at 10 MB per call, so make a 1080p copy. Start at CRF 17 and raise it until the file is under 9.8 MB (Battery and Seen were fine at 17, The Chair needed 20, Water Yourself 17):

   ```bash
   ffmpeg -i "NN Title 4K.mp4" -vf "scale=1080:1920:flags=lanczos" -c:v libx264 -preset slow -crf 17 -profile:v high -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart "NN Title 1080p.mp4"
   ```

3. **Caption:** use `caption.txt` as it is, keeping the line breaks. From day 4 it has a short question under the quote (`ASK` in `tools/export.js`). TikTok gets it on one line.

## Platform by platform

Upload one thing at a time and look at the result before pressing the next button.

**Instagram** (Create → Post)
- Crop opens square: pick **Original** so the video is 9:16.
- Cover: find the file input right after "Select from computer". Wait until the cover shows before pressing Next.
- Share takes about 40 seconds. Wait for "Your reel has been shared."

**Facebook** (facebook.com/reels/create/)
- **Check who is posting first.** Facebook falls back to the user's personal profile. The box must say "What's on your mind, Wobbin's Line?". If it doesn't, open the Page and press Switch Now, or the reel lands on the personal account.
- Add the description, then Choose cover and upload the cover. Wait for "safe to publish", then Next, Post.
- It goes straight to the home page with no confirmation. Check the Page's reels tab.

**YouTube** (Studio → upload)
- Title: an episode name plus a searchable phrase, ending in `#shorts`. For example `Battery: when your social battery hits 0% #shorts`. Search brought 30% of Battery's views.
- Description: the quote and question, then "Wobbin's Line: a tiny animated show drawn on one line. A new short every day.", `All episodes: https://razee4315.github.io/wobbins-line/`, and the hashtags.
- "Suggested hashtags" appears after the title and pushes the description box down. Click the box by its reference and check the text landed.
- Next three times, Public, Publish. The audience is already "not made for kids". Custom thumbnails need the phone verification.

**TikTok** (tiktok.com/tiktokstudio/upload)
- Clear the default description first, then click the box again before typing.
- Edit cover → upload the cover → Save, then Post. If it asks "Continue to post?", press Post now.
- New posts show "Content under review" and "Only me" for a while, then go public by themselves.

**Pinterest** (pinterest.com/pin-creation-tool/)
- Title: a plain description. Description: the quote, the question, one line about the episode, three hashtags. Link: the website.
- The board is already picked. The cover can only be a frame: click the strip (dragging doesn't work), then Done.
- Publish stays grey while the video processes.

## After each post

Get each post's link: the profile pages list them. Add them to the Posting log and to Post links in `05-episodes.md`, then commit.

## Checking stats

| Platform | Where | What you get |
|---|---|---|
| Instagram | `/wobbinsline/reels/` for views; a reel's page → View insights | Views, viewers, likes, saves, shares, follows |
| TikTok | `tiktokstudio/content`; `tiktokstudio/analytics/<video id>` | Views, average watch time, finished %, where people leave |
| YouTube | `studio.youtube.com/video/<id>/analytics/tab-overview/period-default` | Views, subscribers, traffic sources; retention takes up to two days |
| Facebook | The Page's reels tab | Views |
| Pinterest | Not read yet: its analytics page opened another extension in the browser | |

Instagram's URL `/reel/<id>/` can roll on to someone else's reel, so use `/wobbinsline/reel/<id>/`. Chrome screenshots time out when the window is in the background: read the page text instead.

## The order

Days 1 to 4 have gone out. **Next is day 5, The Gap.**

| Day | Folder | About | Line |
|---|---|---|---|
| 1 | 01 - Battery | the social battery | it’s okay to need quiet. real friends get it. |
| 2 | 02 - The Chair | putting it away | put it away now. future you says thanks. |
| 3 | 03 - Seen | waiting for a reply | not every silence is about you. |
| 4 | 04 - Water Yourself | looking after yourself | you need watering too. |
| 5 | 05 - The Gap | courage | jump before the ground decides for you. |
| 6 | 06 - Last Minute | procrastination | why is the last night always the most productive? |
| 7 | 07 - Did I Lock It | checking again | you checked. you can let it go. |
| 8 | 08 - Yes | people-pleasing | you can say no. they’ll be okay. |
| 9 | 09 - Perfect | perfectionism | done is better than perfect. |
| 10 | 10 - Two Minutes | the tiny task you dread | it took two seconds. the dread took two weeks. |
| 11 | 11 - What If | overthinking | let it go. |
| 12 | 12 - Rain Check | cancelling plans | not every plan needs a rain check. sometimes, go anyway. |
| 13 | 13 - Slow Walker | slowing down for others | some days, the slow lane has the best view. |
| 14 | 14 - Lost | losing things | slow down. it’s usually closer than you think. |
| 15 | 15 - Why Was I Here | forgetting | it’s not just you. doorways really do make you forget. |
| 16 | 16 - Snooze | five more minutes | the day doesn’t wait. get up for it. |
| 17 | 17 - Small Talk | awkward silence | every friend was a stranger once. |
| 18 | 18 - Tomorrow | putting it off | ready or not... just start. |
| 19 | 19 - One More | scrolling | life doesn’t send notifications. |
| 20 | 20 - Monday Mountain | dread | it’s never as big up close. |
| 21 | 21 - Busy | rushing past | slow down for the ones who wait. |
| 22 | 22 - Can't Sleep | night thoughts | tomorrow is tomorrow’s problem. |
| 23 | 23 - Fine | pretending you’re okay | not fine? that’s fine too. |
| 24 | 24 - Imposter | imposter syndrome | you did earn it. you belong here. |
| 25 | 25 - Highlight Reel | comparison | don’t compare your every day to their best day. |
| 26 | 26 - The Other Line | impatience | the other line always looks faster. yours is moving too. |
| 27 | 27 - Just in Case | overpacking life | pack light. keep one umbrella. |
| 28 | 28 - Heavy | asking for help | asking for help isn’t weak. it’s how we reach higher. |
| 29 | 29 - Comfort Zone | stepping out | comfort zones grow every time you step out. |
| 30 | 30 - Inner Voice | the inner critic | talk to yourself the way you would talk to a friend. |
| 31 | 31 - Decision | too many choices | pick one. you can always turn. |
| 32 | 32 - Small Steps | consistency | small steps, every day. they add up. |
| 33 | 33 - Reset | bad days | bad days end. tomorrow is a new line. |
| 34 | 34 - Bloom | kindness | pass it on. |
| 35 | 35 - The Hill | keep going | every hill has another side. |
| 36 | 36 - Hurry | slowing down | you’ll still get there. |
| 37 | 37 - The Seed | patience | some things only grow when you stop watching. |
| 38 | 38 - The Cloud | sadness | sit with it. something grows. |
