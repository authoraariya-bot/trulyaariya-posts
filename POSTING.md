# Truly Aariya — daily posting runbook (content engine, from 19 Oct 2026)

Instagram @trulyaariya (account id `17841468564888977`, Windsor.ai connector `instagram`).
Book: *A Self Repaired Soul* · Journey That Heals · Aariya Sharma. Launch date and buy link: not announced yet.

One piece goes out **every day at 12:00 PM IST**, alternating reel and post. Every entry in `schedule.json`
with `"final": true` is finished and approved by Aariya: post it exactly as it is. Do not redesign, re-render,
re-caption or swap hashtags. (The older `REELS.md` process is retired and must not be used.)

## Each run

1. `git pull`. Open `schedule.json`. Today's date is Asia/Kolkata.
2. Find the entry with today's `date` and `status: "scheduled"`. If none, reply "Nothing due today." and stop.
   If an earlier `scheduled` entry was missed, post only today's and mention the missed one in the report.
3. URLs: `https://raw.githubusercontent.com/authoraariya-bot/trulyaariya-posts/main/<path>`. Check each returns HTTP 200.
4. Publish with Windsor `execute_action` (connector `instagram`, account `17841468564888977`), caption exactly as stored:
   - `format: reel` → `create_video_post` with `video_url`, `cover_url` (the `cover` path), `share_to_feed: true`.
   - `format: carousel` → `create_carousel_post` with `image_urls` in the stored order.
   - `format: image` → `create_image_post` with `image_url`.
   On failure retry once. If it still fails, set `status: "failed"` with `error`, and report. Never post a substitute.
   **Story:** right after the feed post succeeds, post the entry's `story` with `create_story`
   (`video_url` for a reel's video, or `image_url` for the 9:16 story image). Stories take no caption.
   If the story fails, retry once; a story failure never undoes or blocks the feed post. Record it as
   `story_status: "posted"` or `"failed"` (+ `story_error`).
5. Read back the newest media (Windsor `get_data`, fields `media_id, media_permalink, timestamp`, date_preset `last_3dT`),
   set `status: "posted"`, `media_id`, `permalink`. Keep the file's 4-space indentation.
6. Commit `schedule.json` as `Post <id>: <status>` and push to `main`.
7. Report to Aariya in one short line with the permalink, and whether the story went up.

## Hard rules

- Entries with `status: "hold"` (the full cover reveal and "The Cover" post) are **never** posted or rendered by a run.
  The cover is revealed only when Aariya explicitly says so, in conversation.
- Never post anything not in `schedule.json`. Never edit or delete existing posts.
- The original book cover file is private and must never be committed to this public repo. Only blurred renders live here.
- No spoilers: no illness, hospital, characters, places, plot, chapter titles, or the first-20-readers surprise.
