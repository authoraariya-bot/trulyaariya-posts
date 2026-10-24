#!/bin/bash
# qupload.sh <Comp> <date> <msgfile> : copy a finished quote reel to month/reels/q/<date>-*, mark its entry "scheduled", commit, push
set -e
C=$1; D=$2; M=$3; R=/home/claude/trulyaariya-posts; w=$(echo $C | tr 'Q' 'q')
cd $R && git stash -q 2>/dev/null || true; git pull -q --rebase; git stash pop -q 2>/dev/null || true
mkdir -p month/reels/q
cp tools/soul-reel/out/$C-fs.mp4 month/reels/q/$D-reel.mp4
cp tools/soul-reel/out/$C-cover.jpg month/reels/q/$D-cover.jpg
python3 - $D <<'PY'
import json,sys
d=sys.argv[1]; p='schedule.json'; s=json.load(open(p)); n=0
for e in s:
    if str(e['id']).startswith('q') and e['date']==d and e['status']=='rendering': e['status']='scheduled'; n+=1
json.dump(s,open(p,'w'),indent=4,ensure_ascii=False); open(p,'a').write('\n'); print('scheduled',n)
PY
git add schedule.json month/reels/q/$D-reel.mp4 month/reels/q/$D-cover.jpg tools/soul-reel/src tools/soul-reel/q_score.py tools/soul-reel/*.sh
[ -f tools/soul-reel/public/$w.wav ] && git add tools/soul-reel/public/$w.wav
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -q -F $M
git push -q && echo "UPLOADED $C → month/reels/q/$D-reel.mp4"
