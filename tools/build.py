import json, os, subprocess, wave, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import numpy as np
from PIL import Image, ImageDraw
from render import card, grain, sprig, spaced, wrap, SERIF, SCRIPT, SANS, ITAL, DARK, LIGHT

OUT = os.path.join(HERE, '..', 'posts')
os.makedirs(OUT, exist_ok=True)
items = json.load(open(os.path.join(HERE, 'content.json')))

# shared slide 2 for quote carousels
card({'n': 99, 'label': 'A SELF REPAIRED SOUL  ·  COMING SOON', 'heading': 'If this found you today,',
      'quote': 'send it to someone\nwho needs it too.', 'source_lines': ['save it for the days you forget']},
     f'{OUT}/share-slide.jpg')

def pad_audio(path, secs, sr=44100):
    """Soft original ambient pad (pure sine synthesis)."""
    t = np.arange(int(secs*sr))/sr
    chords = [[220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 246.94, 293.66], [164.81, 220.0, 261.63]]
    seg = secs/4
    y = np.zeros_like(t)
    for i, ch in enumerate(chords):
        s, e = i*seg, (i+1)*seg + 1.2
        m = (t >= s) & (t < e)
        tt = t[m]-s
        env = np.minimum(1, tt/1.5) * np.minimum(1, np.maximum(0, (e-s-tt))/1.5)
        for f in ch:
            y[m] += env*(np.sin(2*np.pi*f*tt) + 0.25*np.sin(2*np.pi*2*f*tt) + 0.5*np.sin(2*np.pi*f/2*tt))
    for dl, g in ((0.23, 0.35), (0.41, 0.22), (0.67, 0.12)):  # simple reverb
        k = int(dl*sr); y[k:] += g*y[:-k]
    y *= np.minimum(1, t/2) * np.minimum(1, (secs-t)/2)
    y = (y/np.abs(y).max()*0.22*32767).astype(np.int16)
    with wave.open(path, 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(y.tobytes())

def text_layer(W, H, text, pal, size=74, script=False):
    L = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(L)
    f = SCRIPT(size+30) if script else SERIF(size, 500)
    lines = []
    for p in text.split('\n'):
        lines += wrap(d, p, f, W-240)
    lh = (size+30)*1.25 if script else size*1.35
    y = H/2 - len(lines)*lh/2
    for ln in lines:
        d.text((W/2, y+lh/2), ln, font=f, fill=(pal['accent'] if script else pal['ink']) + (255,), anchor='mm')
        y += lh
    return L

def reel(item, path):
    W, H, FPS = 1080, 1920, 30
    pal = DARK
    bg = grain(Image.new('RGB', (W, H), pal['bg']), amt=4, seed=int(item['id'])).convert('RGBA')
    d = ImageDraw.Draw(bg)
    d.rounded_rectangle((90, 380, W-90, H-430), radius=60, fill=pal['card'])
    spaced(d, (W/2, 290), 'A SELF REPAIRED SOUL  ·  COMING SOON', SANS(24, 400), pal['soft'], track=5)
    spaced(d, (W/2, H-300), 'Truly Aariya  ·  @trulyaariya', SANS(30, 400), pal['soft'], track=4)
    sp = sprig((230, 360), pal, seed=int(item['id'])+3)
    bg.alpha_composite(sp, (50, H-760))
    layers = [text_layer(W, H, b, pal, 78 if len(b) < 14 else 66) for b in item['beats']]
    end = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ed = ImageDraw.Draw(end)
    ed.text((W/2, H/2-60), 'A Self Repaired Soul', font=SCRIPT(100), fill=pal['accent']+(255,), anchor='mm')
    ed.text((W/2, H/2+70), 'journey that heals', font=ITAL(44, 500), fill=pal['soft']+(255,), anchor='mm')
    spaced(ed, (W/2, H/2+150), 'PUBLISHING SOON', SANS(34, 400), pal['ink'], track=10)
    layers.append(end)
    beat = 2.6
    total = beat*len(layers) + 1.0
    nfr = int(total*FPS)
    pad_audio(os.path.join(HERE, 'pad.wav'), total)
    p = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                          '-i', os.path.join(HERE, 'pad.wav'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '20',
                          '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', path], stdin=subprocess.PIPE)
    base = bg.convert('RGB')
    for fi in range(nfr):
        t = fi/FPS
        k = min(int(t//beat), len(layers)-1)
        lt = t - k*beat
        last = k == len(layers)-1
        a = min(1, lt/0.7) * (1 if last else min(1, max(0, (beat-lt)/0.45)))
        fr = bg.copy()
        L = layers[k]
        if a < 1:
            L = L.copy(); L.putalpha(L.getchannel('A').point(lambda v: int(v*a)))
        fr.alpha_composite(L)
        p.stdin.write(fr.convert('RGB').tobytes())
    p.stdin.close(); p.wait()
    # 9:16 cover = end-card frame
    c = bg.copy(); c.alpha_composite(end); c.convert('RGB').save(path.replace('.mp4', '-cover.jpg'), quality=92)

for it in items:
    if it['type'] == 'quote':
        card({k: it[k] for k in ('n', 'heading', 'quote')}, f"{OUT}/{it['id']}-quote.jpg")
    else:
        cv = dict(it['cover']); st = cv.pop('source_text', None); cv['source_lines'] = [st] if st else []; cv.update(n=int(it['id']), dark=True, label='A SELF REPAIRED SOUL  ·  COMING SOON')
        card(cv, f"{OUT}/{it['id']}-teaser-still.jpg")
        reel(it, f"{OUT}/{it['id']}-teaser-reel.mp4")
    print('done', it['id'])
