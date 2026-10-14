# Truly Aariya — auto-posting runbook

This repo holds the finished post images for Instagram @trulyaariya (account id `17841468564888977`,
Windsor.ai connector `instagram`) and the schedule in `schedule.json`.

Posts go out every other day at 12:00 PM IST. Book: *A Self Repaired Soul* by Aariya Sharma (coming soon).

## Each scheduled run

1. `git pull` this repo. Open `schedule.json`. Today's date is in Asia/Kolkata.
2. Pick the entry whose `date` is today and `status` is `scheduled`.
   If an earlier entry is still `scheduled` (a missed run), post only today's entry and note the missed one in the report.
   - **If nothing is due today:** this is a preparation day. Find the next `scheduled` entry with `type: quote`
     that has no `video` yet, make its visual quote reel by following `REELS.md`, commit and push it
     (message `Reel <id>: prepared`), and report with its raw GitHub link so Aariya can preview it a day early.
     If every upcoming quote already has a reel, stop and report "nothing due today".
   - **If today's entry is a quote with no `video` yet** (preparation was missed): make the reel per `REELS.md`
     first, then post it. If the reel cannot be made to the brief's quality checks, post the original carousel
     instead and say so in the report.
3. Media URLs: `https://raw.githubusercontent.com/authoraariya-bot/trulyaariya-posts/main/<path>`.
   Before posting, check each URL returns HTTP 200 (curl -sI).
4. Hashtag freshness: the caption keeps `#trulyaariya` and `#aselfrepairedsoul` always. You may swap ONE of the
   other three tags for a currently trending, on-theme tag (healing, self-love, mental wellness, Indian bookstagram)
   if a quick web search shows a clearly better current one. Keep exactly 5 hashtags. Do not change the rest of the caption.
5. Publish with Windsor `execute_action`, connector `instagram`, account `17841468564888977`:
   - `format: carousel` → action `create_carousel_post`, `image_urls` = the two image URLs in order, `caption`.
   - `format: reel` → action `create_video_post`, `video_url`, `cover_url`, `share_to_feed: true`, `caption`.
     If the reel fails, retry once; if it fails again, fall back: for a quote entry that still has `images`, post the
     original carousel with `create_carousel_post`; otherwise post `fallback_image` with `create_image_post`.
     Same caption either way.
6. After success, read back the newest media (Windsor `get_data`, fields `media_id, media_permalink, timestamp`,
   date_preset `last_3dT`) and set the entry's `status` to `posted`, plus `media_id` and `permalink`.
   On failure set `status` to `failed` and add `error`.
7. Commit `schedule.json` with message `Post <id>: <status>` and push to `main`.
8. Report to Aariya in one short message: what went out, the permalink, or what failed and why.

Never post anything that is not in `schedule.json`. Never edit or delete existing Instagram posts.

## Making new posts

`tools/content.json` holds every quote, teaser and caption. Add entries, then run `python3 tools/build.py`
(needs Pillow, numpy, ffmpeg) to render cards into `posts/`, and add matching entries to `schedule.json`.
Reels get original background music from `tools/music.py` (synthesised, copyright-free); every reel must use a different piece, never the same track twice. Never add commercial songs to the video file.
Quotes must come word for word from the manuscript. Images are pure typography plus a drawn sprig — no AI imagery.
Quote reels follow `REELS.md`: original code-rendered visuals, pastel, no AI imagery or stock footage.
