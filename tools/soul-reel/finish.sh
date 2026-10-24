#!/bin/bash
# finish.sh <Comp> <fileDate> <coverSec> : render 1080×1920 → faststart → cover → motion sheet (no upload)
set -e
C=$1; D=$2; CS=$3; B=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
cd /home/claude/trulyaariya-posts/tools/soul-reel
npx remotion render $C out/$C.mp4 --scale=1 --codec=h264 --crf=16 --x264-preset=veryfast --browser-executable=$B 2>&1 | tail -1
ffmpeg -loglevel error -y -i out/$C.mp4 -c copy -movflags +faststart out/$C-fs.mp4
ffmpeg -loglevel error -y -ss $CS -i out/$C-fs.mp4 -frames:v 1 -q:v 2 out/$C-cover.jpg
mkdir -p /tmp/claude-0/soul/mv-$C && rm -f /tmp/claude-0/soul/mv-$C/*
ffmpeg -loglevel error -i out/$C-fs.mp4 -vf "fps=2,scale=270:-1" /tmp/claude-0/soul/mv-$C/%03d.png
python3 - $C <<'PY'
import sys,glob
from PIL import Image
C=sys.argv[1]; fs=sorted(glob.glob(f'/tmp/claude-0/soul/mv-{C}/*.png')); ims=[Image.open(f) for f in fs]
w,h=ims[0].size; cols=10; rows=(len(ims)+cols-1)//cols
s=Image.new('RGB',(w*cols,h*rows),'white'); [s.paste(im,((i%cols)*w,(i//cols)*h)) for i,im in enumerate(ims)]; s.save(f'/tmp/claude-0/soul/mv-{C}.jpg',quality=80)
PY
ffprobe -v error -show_entries stream=codec_name,width,height,sample_rate:format=duration,size -of csv=p=0 out/$C-fs.mp4 | tr '\n' ' '; echo
echo "FINISHED $C"
