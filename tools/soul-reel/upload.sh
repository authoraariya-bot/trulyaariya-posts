#!/bin/bash
# upload.sh <Comp> <fileDate> <msgfile> : copy video+cover to the entry's paths, commit src + score, push
set -e
C=$1; D=$2; M=$3; R=/home/claude/trulyaariya-posts; id=$(echo $C | sed 's/Soul/r/')
cd $R && git stash -q 2>/dev/null || true; git pull -q --rebase; git stash pop -q 2>/dev/null || true
cp tools/soul-reel/out/$C-fs.mp4 month/reels/$D-reel.mp4
cp tools/soul-reel/out/$C-cover.jpg month/reels/$D-cover.jpg
git add month/reels/$D-reel.mp4 month/reels/$D-cover.jpg tools/soul-reel/src tools/soul-reel/soul_score.py tools/soul-reel/public/$id.wav tools/soul-reel/*.sh
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -q -F $M
git push -q && echo "UPLOADED $C → month/reels/$D-reel.mp4 (unpushed $(git log origin/main..main --oneline | wc -l))"
