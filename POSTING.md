# Truly Aariya — auto-posting runbook

This repo holds the finished post images for Instagram @trulyaariya (account id `17841468564888977`,
Windsor.ai connector `instagram`) and the schedule in `schedule.json`.

Posts go out every other day at 12:00 PM IST. Book: *A Self Repaired Soul* by Aariya Sharma (coming soon).

## Each scheduled run

1. `git pull` this repo. Open `schedule.json`. Today's date is in Asia/Kolkata.
2. Pick the entry whose `date` is today and `status` is `scheduled`. If none, stop and report "nothing due today".
   If an earlier entry is still `scheduled` (a missed run), post only today's entry and note the missed one in the report.
3. Media URLs: `https://raw.githubusercontent.com/authoraariya-bot/trulyaariya-posts/main/<path>`.
   Before posting, check each URL returns HTTP 200 (curl -sI).
4. Hashtag freshness: the caption keeps `#trulyaariya` and `#aselfrepairedsoul` always. You may swap ONE of the
   other three tags for a currently trending, on-theme tag (healing, self-love, mental wellness, Indian bookstagram)
   if a quick web search shows a clearly better current one. Keep exactly 5 hashtags. Do not change the rest of the caption.
5. Publish with Windsor `execute_action`, connector `instagram`, account `17841468564888977`:
   - `format: carousel` → action `create_carousel_post`, `image_urls` = the two image URLs in order, `caption`.
   - `format: reel` → action `create_video_post`, `video_url`, `cover_url`, `share_to_feed: true`, `caption`.
     If the reel fails, retry once; if it fails again, post `fallback_image` with `create_image_post` and the same caption.
6. After success, read back the newest media (Windsor `get_data`, fields `media_id, media_permalink, timestamp`,
   date_preset `last_3dT`) and set the entry's `status` to `posted`, plus `media_id` and `permalink`.
   On failure set `status` to `failed` and add `error`.
7. Commit `schedule.json` with message `Post <id>: <status>` and push to `main`.
8. Report to Aariya in one short message: what went out, the permalink, or what failed and why.

Never post anything that is not in `schedule.json`. Never edit or delete existing Instagram posts.

## Making new posts

`tools/content.json` holds every quote, teaser and caption. Add entries, then run `python3 tools/build.py`
(needs Pillow, numpy, ffmpeg) to render cards into `posts/`, and add matching entries to `schedule.json`.
Quotes must come word for word from the manuscript. Images are pure typography plus a drawn sprig — no AI imagery.
