# Truly Aariya — Soul reels (master template)

The approved master is **"The Paper Boat"** (`src/master`). Every Soul reel starts as a copy of it.

- `src/master/pose.ts` — the Soul's rig, poses (joint angles), beats `T`, walk cycle tied to distance, camera, heal arc.
- `src/master/World.tsx` — the landscape (parallax sky, mountains, hills, meadow, water, tree, wind, flowers, birds, butterflies, petals) and the Soul's `Body`.
- `src/master/Overlay.tsx` — words (one block at a time, gold Caveat key word) and the end card (gold thread knot, @trulyaariya, A SELF REPAIRED SOUL · COMING SOON).
- `src/master/Reel2.tsx` — composition, fonts, static paper grain, audio.
- `make_score.py` — synced original score generator.

The Soul's shape, colours and scale, the visual style and the end card are locked. See the automation prompt for the rules.

Render (4K):
```
npm i
npx remotion render <CompositionId> out.mp4 --scale=2 --codec=h264 --crf=16 --x264-preset=veryfast
# if Chrome can't download: --browser-executable=$(find / -name chrome-headless-shell -type f | head -1)
```
