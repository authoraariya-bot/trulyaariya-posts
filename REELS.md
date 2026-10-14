# Visual reels — creative brief (quotes *and* book teasers)

Every post for @trulyaariya is now a **visual reel**: the words (a quote or a book teaser) are
revealed over an original, moving visual metaphor that *means* the same thing. This file is the
prompt for whoever (usually Claude, on the daily schedule) makes the next reel. Read all of it first.

Only the visuals change. Dates, times, captions, hashtags and the every-other-day calendar in
`schedule.json` stay exactly as they are. **Never make a reel for an entry that is already `posted`,
and never reuse words, a concept or a music piece that has already gone out.**

The approved quality bar is `tools/reels/kintsugi_reference.py` (pastel silk surface → it cracks →
the cracks fill with flowing gold, revealing "Strength isn't about never breaking…"). Aariya loved
it. A first version (a drawn book with flipping pages on a dark background) was rejected as
"gimmicky, cartoonish, fake, weak". Every reel must feel like the first, never the second.

## 0. The Truly Aariya signature (brand identity)

Every reel must be recognisable as Truly Aariya within one second, so these never change:

- **Textured pastel ground, never flat.** The background is always a real-feeling surface with
  tooth: handmade paper with visible soft fibres and mottling (default, see
  `tools/reels/04_kintsugi_teaser.py` → `make_paper()`), or watercolour washes, linen, washi,
  frosted glass, or pearl. Pastel light drifts slowly *across* the texture as if a window is nearby.
- **The gold seam.** Gold is the brand's thread (the book is about a soul repairing itself). Each
  reel carries a gold element somewhere: mended cracks, a gold thread, gold light, gold dust, a
  gold rule on the end card.
- **Type:** Lora Italic in soft plum, key phrase in gold, small tracked Poppins Light labels.
- **End card:** thin gold rule → small tracked label → *A Self Repaired Soul* in gold Lora Italic.
  Quotes use `FROM THE BOOK`; teasers use `COMING SOON` (or the release date once announced).
- **Not the trend.** Avoid what the feed is full of: black screens with white text, stock sunsets,
  beige "aesthetic" templates, typewriter effects, AI-art faces. Truly Aariya feels handmade, quiet
  and luminous, like a precious object you hold.

## 1. Find the metaphor before touching code

Read the entry in `tools/content.json`: for quotes the `quote`, `heading` and caption; for teasers the
`beats` (the on-screen lines, in order), `cover` and caption. Ask: what *happens* in this
quote? Breaking → mending. Pressure → brilliance. Noise → stillness. Then choose a visual where that
same change happens physically, so the viewer *feels* the quote before finishing reading it.

- Prefer **materials and light** over objects: liquid gold, ink blooming in water, mist, glass,
  silk, light through leaves, ripples, iridescent film, frost melting, threads, embers, petals,
  dust in a sunbeam, soap-bubble sheen, dawn over water, paper unfolding.
- **Never draw literal objects out of simple shapes** (books, hands, hearts, faces, trees, people
  made of rectangles/circles). That is what looks cartoonish. If an object is needed, suggest it
  through light, silhouette, blur or texture, never outline it.
- No AI-generated imagery, no stock footage, no logos/characters: everything is rendered in code.
- Never reuse a concept already used (check `concept` fields in `schedule.json`; kintsugi is taken by
  post 04), and never reuse the same colour palette twice in a row.

## 2. Give it "moments", not a moving wallpaper

A plain drifting gradient is not enough. Every reel needs a small story with at least **two
visible moments** that land with the words:

| Time | Beat |
|---|---|
| 0–1 s | **Hook.** First words already readable by 0.4 s; the scene is already alive. |
| ~2–4 s | **Moment 1, the tension:** the break, the pressure, the noise, the storm. |
| ~5–10 s | **Moment 2, the turn:** the mending, the bloom, the settling, the light arriving. Second half of the quote appears here, its key phrase timed to the peak. |
| ~11–13 s | **Resolution:** the visual rests in its healed state; a slow glint or breath of light. |
| last 3–4 s | **End card** over the healed visual: thin gold rule, `FROM THE BOOK` (small, tracked), then *A Self Repaired Soul* (always this spelling, no hyphen). |

**Teasers** follow the same arc, but the `beats` are the text: show them in order, one or two at
a time, each landing on a visual moment. Teasers can run up to 20 s if there are many beats.

Length 14–18 s. Motion is slow, eased and organic (sine/ease-in-out, gentle domain-warping noise);
nothing snaps, bounces, spins or zooms fast. One accent moment (a glint, a ripple, a bloom of
light) is allowed per beat: subtle, never flashy.

## 3. Look and feel

- **Pastel, soothing, luminous.** Never black, near-black, dark or loud backgrounds. Base tones:
  cream, blush, peach, lavender, mint, sky, butter, rose. Choose 3–5 per reel to suit the mood.
- One **precious accent** that carries the emotion: gold (default), rose-gold, pearl, soft silver,
  or iridescent sheen.
- Depth and realism come from: soft light falling across the frame, gentle bloom/glow on the
  accent, slight film grain (~1%), smooth antialiased curves, a slow sheen sweeping like light on
  glazed porcelain. Flat vector look = fail.
- **Typography:** quote in Lora Italic (`tools/fonts/Lora-Italic-Variable.ttf`), ~74–80 px, soft
  plum ink (around rgb 92,64,84), never black. The key phrase of the quote can take the accent colour.
  Small labels in Poppins Light (`tools/fonts/Poppins-Light.ttf`), uppercase, wide tracking. A
  soft cream halo behind text keeps it legible over the visual.
- **All on-screen words are word for word from `tools/content.json`** (`quote`, `heading`, or the
  teaser `beats`). You may only choose the line breaks and how they split into beats. Never
  paraphrase, shorten or "improve" them.
- Safe area for all text: x 90–990, y 250–1450 (Instagram covers the bottom and right edges).

## 4. Concept library

Starting points, not templates. Invent new ones freely if they fit the quote better.

- **Kintsugi:** a surface cracks, gold flows into the cracks (used for post 04, *soul needed repair*).
- Teaser ideas: **pages of light** (no drawn book: luminous paper sheets drifting and settling
  into a stack), **six washes** (one watercolour bloom per phase, the last turning gold), **a
  door of light** (a thin gold seam widening into warm light), **a mirror pool** (a still
  pastel surface that clears to reflect light).
- **Pressure into light:** pastel layers press together; a faceted crystal forms and throws
  prism light across the frame (*self-love formed under pressure*).
- **Rain off a glow:** soft drops fall toward a luminous pearl sphere and slide off, leaving it
  whole and brighter (*not accepting insults*).
- **Noise to stillness:** hundreds of restless fine lines/particles slowly settle into one calm
  horizon over still water; a single ripple (*quiet heart, loud mind*).
- **Rebuilding, piece by piece:** translucent glass tiles drift in and assemble into a lit arch
  or window, one at a time (*shaken belief rebuilt*).
- **Iridescent bubbles:** bubbles rise and drift with rainbow sheen, light and playful (*inner child*).
- **Tides and skies:** the sky moves gently through dawn and dusk and dawn again; both are soft,
  both belong (*some days weakness wins, both are human*).
- **The lantern you carry:** a small warm light rises through pastel mist, lighting its own path
  (*nobody can heal you except you*).
- **The loop opens:** a glowing line circles the same orbit, then unwinds into an opening spiral
  that rises like a growing stem (*the loop of suffering ends when you learn*).
- Also: ink blooming in water, frost melting into dew, a thread tying itself into a bow, pressed
  petals unfolding, dust in a sunbeam, moon phases filling, a seed splitting into a sprout of light.

## 5. Sound

Original music only, from `tools/music.py`. Teasers that already have a piece in `PIECES` reuse
their own piece (it has not been heard with this post yet). Otherwise add a new function for this reel (new instrument
mix, key, tempo, mood), register it in `PIECES` under the post id, and never reuse a previous piece.
Soft and spacious; light sound accents may follow the visual moments (a delicate crack, a chime as
light arrives). Never commercial songs or samples.

## 6. Build, check, deliver

1. Write the renderer as `tools/reels/<id>_<concept>.py` (Cairo + numpy + PIL, piped into ffmpeg,
   as in the reference; `pip install --break-system-packages pycairo` if missing).
   1080×1920, 30 fps, H.264 `yuv420p`, AAC, `+faststart`.
2. **Check before you commit.** Render 6–8 key frames into one contact sheet and look at it; also
   view one 100% crop of the most detailed area. Fix and re-check if anything looks drawn/clip-art,
   dark, muddy, low-contrast, beaded/segmented (stroke each line as one continuous path), off-brand,
   or if any text is hard to read or outside the safe area. Spell-check the quote against
   content.json character by character.
3. Final video ≤ 22 MB (re-encode with `-crf 22 -tune grain` if larger), checked with ffprobe:
   1080×1920, 30 fps, h264 + aac. Cover = the most beautiful frame with the key words visible.
   - Quote: `posts/<id>-quote-reel.mp4` + `posts/<id>-quote-reel-cover.jpg`.
   - Teaser: `posts/<id>-teaser-reel-v2.mp4` + `posts/<id>-teaser-reel-v2-cover.jpg` (keep the old files).
4. Edit only that entry in `schedule.json` with a minimal text edit (don't reformat the file):
   - Quote: `format: "reel"`, `video`, `cover`, `fallback_image: posts/<id>-quote.jpg`, and
     `concept`. Keep the original `images` list: it is the fallback carousel.
   - Teaser: point `video`/`cover` to the v2 files and add `concept`.
   An entry with a `concept` field is done; an entry without one still needs its new reel.
   Never change the caption, date, time or status.
5. Validate `schedule.json` still parses, commit, push, and confirm the raw URLs return HTTP 200.
