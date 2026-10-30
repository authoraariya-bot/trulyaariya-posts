# The Sitting Soul — daily reel series for @trulyaariya

Aariya approved this format on 29 Oct 2026. Every day at 11:00 IST she gets that day's reel and its caption in chat,
and the next day's reel is already built and saved. These reels are **sent to her, not posted** (she posts them herself).

## Files
- `calendar.json` — one entry per quote, in order: date, quote, status (`pending` → `ready` → `sent`), file, palette, action, highlight word, caption, hashtags.
- Finished MP4s live in this folder: `sitting-soul-NN-<slug>.mp4`.
- Source: `tools/soul-reel/src/sit/` — `SittingSoul.tsx` is the shared page/waves/soul; each reel is `SitSoulNN.tsx` (registered in `src/Root.tsx` as `SitSoulNN`, 450 frames, 30 fps, 1080×1920).
  Study `SitSoul01.tsx` (heart hug), `SitSoul02.tsx` (stretch) and `SitSoul03.tsx` (watering a pot) before writing a new one.

## The brief (Aariya's rules — follow all of them)
- 15 s (450 frames), 1080×1920, 30 fps, H.264, **no audio track**, seamless loop (frame 450 looks exactly like frame 0).
- Safe area: tag, page, quote, signature and soul inside x 80–920, y 290–1440. Only waves outside.
- Background: base colour + top wave band + 3 bottom bands + 2 thin white lines, all drifting and bobbing gently (already in `SittingSoul.tsx`, loop-safe). Grain 12%.
- Palette changes every reel and never repeats the previous one: rotate blush → sage → lavender → butter → sky → peach → blush …
- Page: cream, torn top edge, straight bottom, paper grain, soft shadow, completely still. Page height fits the text.
- Text: Cormorant Garamond SemiBold, #2B2622, left-aligned. Full quote visible from frame 0.
  **Aariya's rule (29 Oct): each sentence starts on its own line with breathing space** — pass `lines` as an array, one sentence per item;
  hand-break long sentences with `<br />` so no single word is left alone on a line.
  Size ~85–90 px for short quotes, down to ~55 px for long ones. Text must never touch or sit behind the soul.
- ONE highlight word (Caveat Bold, 1.3×, deep palette tone, highlighter under its lower half) via `<Mark>`.
- Signature "truly yours," / "Aariya" and the "@trulyaariya" tag are drawn by `SittingSoul.tsx`.
- The tiny soul sits on the page's bottom edge on the right, legs dangling, blinking, breathing, legs swinging. It leans by **shear**
  (flat bottom never leaves the edge). Hands are given in body space (use the `unshear` helper like the examples).
- ONE action per reel, matching the quote, never used before (see list). 0–2 s idle, 2–12 s the action, 12–15 s back to the exact start pose.
  Props must return to their start state before the loop. Smooth easing, anticipation, follow-through, eyes follow the action. No walking, no sliding.
- CAPTION (Aariya, 30 Oct). Three short parts, nothing more:
  1. Hook (the line seen while scrolling): tiny, punchy, creative. Her example for "Don't shrink yourself": **"their loss 💀"**. Usually 2–6 words,
     Hinglish or simple English, witty / savage-soft, one emoji with attitude; lands the quote's point in a fresh way.
  2. Book teaser, 1–2 short lines: a creative line tied to the quote's feeling, then exactly
     "A Self Repaired Soul: Journey That Heals, coming soon 📖". Never boring, never long, no plot/spoilers, no dates or invented details.
  3. Sign-off around "truly yours" + @trulyaariya, different and playful every day (e.g. "signed, sealed, truly yours 🤍 @trulyaariya",
     "from my heart to your feed, truly yours ✨ @trulyaariya"). NEVER "follow @trulyaariya for more soft words".
  No em dashes. Hashtags go separately below.
- 10–15 hashtags that are **trending right now** (Aariya, 30 Oct): every day, run an extended web search and open hashtag-stat pages
  (e.g. iqhashtags.com/hashtags/hashtag/<tag>, best-hashtags.com/hashtag/<tag>/, flick.social/learn/hashtags/<tag>) for the quote's themes, and pick by
  current daily post volume: 3–4 big active tags (e.g. #selflove, #selfcare, #mentalhealth), 5–6 mid tags (e.g. #poetrycommunity, #writersofinstagram, #shayari),
  3–4 niche Indian-writer tags (e.g. #writersofindia, #poetsofindia, #indianwriters). Always include #trulyaariya. No banned/spammy tags.
  Say in one line which are big / mid / niche and cite the stat pages used.
- Never: dark/black backgrounds, loud colours, a moving page, two actions, kintsugi/crack visuals, stock/AI imagery, icons after the signature, a box behind @trulyaariya, any audio.
- No book spoilers (no illness, hospital, characters, places, plot, chapter titles, ending). Never show the book cover. Don't invent facts about Aariya.

## Actions already used (never repeat)
1. hugging a tiny heart
2. a big proud stretch, arms open wide
3. watering a sprout in a tiny clay pot until it blooms

Ideas left: throwing a paper plane; blowing a dandelion; sipping chai from a tiny kulhad; hugging its knees; waving at the reader; pointing up at the quote;
releasing a tiny paper boat; catching a falling leaf; letting go of a small balloon; reading a tiny folded note and smiling; tying a small bow; holding a little lantern;
placing a pebble on a tiny stack; patting the page gently; humming with tiny music notes; folding a paper star; offering a small flower to the reader; peeking over the edge;
resting its head on a tiny pillow; planting a seed. Pick the one that fits the quote best.

## Build + render (in a fresh session)
```
cd tools/soul-reel && npm install --no-audit --no-fund
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell | head -1)
npx tsc --noEmit -p .                                     # must be clean
npx remotion still SitSoulNN /tmp/sNN.png --frame=0 --browser-executable=$B   # check frames 0, mid-action, 449 before rendering
npx remotion render SitSoulNN out/SitSoulNN-hd.mp4 --muted --codec=h264 --video-bitrate=12M --x264-preset=slow --concurrency=2 --browser-executable=$B
ffmpeg -y -i out/SitSoulNN-hd.mp4 -c:v copy -an -movflags +faststart ../../month/sitting-soul/sitting-soul-NN-<slug>.mp4
```
Look at the stills yourself (text fits the page, nothing overlaps the soul, hands natural, prop back in place at frame 449) before rendering.
Commit and push to main when done (pull --rebase first).
