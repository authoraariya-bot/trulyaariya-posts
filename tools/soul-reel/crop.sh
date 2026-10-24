#!/bin/bash
# crop.sh <Comp> <frames...> : full-res stills, cropped to the lower 60% → sheet /tmp/claude-0/soul/crop-<Comp>.jpg
C=$1; shift; B=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell; D=/tmp/claude-0/soul/crop-$C; mkdir -p $D; rm -f $D/*.png
for fr in "$@"; do npx remotion still $C $D/$(printf %04d $fr).png --frame=$fr --browser-executable=$B 2>&1 | grep -iE "error" | head -3; done
python3 - "$D" "$C" <<'PY'
import sys,glob
from PIL import Image, ImageDraw
D,C=sys.argv[1:3]; fs=sorted(glob.glob(f'{D}/*.png'))
ims=[]
for f in fs:
    im=Image.open(f).convert('RGB').crop((0,900,1080,1920)); ImageDraw.Draw(im).text((10,10),f.split('/')[-1],fill='black'); ims.append(im)
w,h=ims[0].size; cols=4; rows=(len(ims)+cols-1)//cols
s=Image.new('RGB',(w*cols,h*rows),'white'); [s.paste(im,((i%cols)*w,(i//cols)*h)) for i,im in enumerate(ims)]
s.save(f'/tmp/claude-0/soul/crop-{C}.jpg',quality=85)
PY
