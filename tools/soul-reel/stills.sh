#!/bin/bash
# stills.sh <Comp> <frames...> : half-size stills + a contact sheet at /tmp/claude-0/soul/<Comp>.jpg
C=$1; shift; B=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell; mkdir -p /tmp/claude-0/soul/$C; rm -f /tmp/claude-0/soul/$C/*.png
for fr in "$@"; do npx remotion still $C /tmp/claude-0/soul/$C/$(printf %04d $fr).png --frame=$fr --scale=0.5 --browser-executable=$B 2>&1 | grep -iE "error" | head -3; done
python3 - "$C" <<'PY'
import sys,glob
from PIL import Image
C=sys.argv[1]; fs=sorted(glob.glob(f'/tmp/claude-0/soul/{C}/*.png')); ims=[Image.open(f).convert('RGB') for f in fs]
w,h=ims[0].size; cols=6; rows=(len(ims)+cols-1)//cols
s=Image.new('RGB',(w*cols,h*rows),'white'); [s.paste(im,((i%cols)*w,(i//cols)*h)) for i,im in enumerate(ims)]
s.save(f'/tmp/claude-0/soul/{C}.jpg',quality=80)
PY
