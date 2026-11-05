# Daily writing reels (@trulyaariya) — on demand

Aariya's spec (3 Nov 2026): one silent 15 s reel per quote she sends in chat, layout = "ONE-SIDED BONDS? / not anymore." master
(3-line title + outline sketch, divider, 2–3 paragraphs, one highlight, "words by — @trulyaariya" tag). Background (Aariya, 3 Nov, replaces the pastel rotation): **beige `beige` #F3EADB or off-white `offwhite` #FAF7F1**, alternating.

Template: tools/soul-reel/src/write/WritingReel.tsx · each reel: src/write/WriteNN.tsx (composition WriteNN).

## Aariya's approved rules (3 Nov, reel 01 "perfect") — apply to every reel
- **Text never animates.** All text is fully visible and still from frame 0. Only the sketch moves (draws itself, then one meaningful colour/motion beat).
- **Text size stays as reel 01:** body Jost 42 px (41 only if it truly can't fit), weight 450, line-height 1.45, paragraph gap 40,
  divider 48 below header, body 50 below divider, signature 46 below body (32 px). Highlight weight 600, vivid marker
  (sage #C3EBA4, blush #FFC4B2, butter #FFDF6E, lavender #D0BEF7). Use `top` (≥ 270) to keep content inside y 280–1500.
- Clean line breaks: no single word alone on the last line; hand-break the closing paragraph with `<br />` at natural pauses if needed.
- **Sketch must be expressive, a visual metaphor of the message**, like reel 01: a row of five outline people, the middle one filled red =
  the one who stands apart. Simple bold idea, readable at phone size, one red/accent element carrying the meaning. Sketch box ~340×200, tightly cropped viewBox.
- **Caption = one single line** (the hook), then the 5 hashtags. Nothing else.
- **Hashtags:** #trulyaariya + 4 checked on hashtag-stat sites (iqhashtags.com etc.): 2 big active topic tags, 1 quote-type niche tag
  (e.g. #introvertquotes), 1 broad (e.g. #selflove). No generic tags like #relatable / #love / #viral.

| # | Title | Background | Sketch | File |
|---|---|---|---|---|
| 1 | BE A / PROUD / introvert. | sage | five people in a row, the middle one in red (odd one out) | writing-01-proud-introvert.mp4 |
| 2 | I RATE / MYSELF / 10/10. | off-white | person facing a standing mirror showing a red 10/10; cards 9, 8, 7 drop behind her (Write02Card) | writing-02-rate-myself.mp4 |
| 2b | RATE MYSELF 10/10. (poem) | beige | STORY FORMAT, not chosen (long poem): stanzas one at a time, breathing warm background, faint score 10→5, red 10/10 at the end | writing-02-rate-myself-story.mp4 |

Next background: beige.

**Framing (Aariya, 5 Nov):** every sentence starts on its own line; lists of steps get one line each (the punch, e.g. "I became a 9.", in weight 600);
long lines broken at natural pauses, never left to wrap; small gaps (8–12 px) between thoughts, 26–34 between paragraphs.
Long quotes still use this card format: go down to 37–40 px and tighten gaps. The signature ALWAYS stays on its own row under the text, never beside a line (Aariya, 5 Nov). See Write02Card.tsx.
Story format (tried 5 Nov, not chosen): title card, then each stanza alone on screen (its lines kept together, centred, 54 px, every row a clean line), fades in, stays to be read (~4.6 s), fades out; soft moving background; signature on the last stanza. See src/write/Write02.tsx.
