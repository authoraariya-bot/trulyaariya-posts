"""Truly Aariya post renderer — typography + hand-drawn-style sprig, no AI imagery."""
import math, random, json, sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

F = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonts/')
def font(name, size, wght=None):
    f = ImageFont.truetype(F + name, size)
    if wght:
        try: f.set_variation_by_axes([wght])
        except Exception: pass
    return f
SERIF = lambda s, w=500: font('CormorantGaramond[wght].ttf', s, w)
ITAL = lambda s, w=500: font('CormorantGaramond-Italic[wght].ttf', s, w)
SCRIPT = lambda s: font('GreatVibes-Regular.ttf', s)
SANS = lambda s, w=400: font('Jost[wght].ttf', s, w)

LIGHT = dict(bg=(255, 253, 250), card=(249, 237, 233), ink=(74, 62, 58), soft=(150, 128, 120),
             accent=(186, 136, 126), stem=(172, 150, 136), petal=(255, 255, 255), center=(236, 200, 150))
# teaser palette: soft sage on white (kept under the old name so callers using dark=True still work)
DARK = dict(bg=(253, 254, 252), card=(234, 242, 235), ink=(60, 72, 64), soft=(118, 138, 124),
            accent=(118, 152, 128), stem=(140, 160, 142), petal=(255, 255, 255), center=(240, 214, 160))

def grain(img, amt=7, seed=1):
    random.seed(seed)
    w, h = img.size
    n = Image.effect_noise((w // 2, h // 2), 40).resize((w, h)).convert('L')
    n = n.point(lambda v: 128 + (v - 128) * amt // 40)
    rgb = Image.merge('RGB', (n, n, n))
    return ImageChops.add(img, ImageChops.subtract(rgb, Image.new('RGB', (w, h), (128,) * 3)), 1, 0)

def spaced(d, xy, text, f, fill, track=6, anchor='center'):
    widths = [d.textlength(c, font=f) for c in text]
    total = sum(widths) + track * (len(text) - 1)
    x, y = xy
    if anchor == 'center': x -= total / 2
    elif anchor == 'right': x -= total
    for c, w in zip(text, widths):
        d.text((x, y), c, font=f, fill=fill)
        x += w + track
    return total

def bez(p0, p1, p2, t):
    return ((1-t)**2*p0[0]+2*(1-t)*t*p1[0]+t*t*p2[0], (1-t)**2*p0[1]+2*(1-t)*t*p1[1]+t*t*p2[1])

def sprig(size, pal, seed=3, flip=False):
    """Dried wildflower sprig, drawn stroke by stroke with slight hand jitter."""
    S = 3
    W, H = size
    im = Image.new('RGBA', (W*S, H*S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    rnd = random.Random(seed)
    base = (W*S*0.5, H*S*0.98)
    def stem(p0, p1, p2, width):
        pts = [bez(p0, p1, p2, t/60) for t in range(61)]
        pts = [(x + rnd.uniform(-0.6, 0.6)*S, y) for x, y in pts]
        d.line(pts, fill=pal['stem'] + (235,), width=int(width*S), joint='curve')
        return pts
    tips = []
    main = stem(base, (W*S*0.38, H*S*0.55), (W*S*0.56, H*S*0.08), 2.2)
    tips.append(main[-1])
    for k, (t, dx, dy) in enumerate([(0.35, -0.30, -0.25), (0.5, 0.32, -0.22), (0.65, -0.22, -0.18), (0.78, 0.2, -0.12)]):
        p = main[int(t*60)]
        end = (p[0] + dx*W*S, p[1] + dy*H*S)
        ctrl = ((p[0]+end[0])/2 + rnd.uniform(-10, 10)*S, (p[1]+end[1])/2 + 14*S)
        br = stem(p, ctrl, end, 1.5)
        tips.append(br[-1])
        for j in range(2, 50, 14):  # tiny leaves
            q = br[j]
            ang = rnd.uniform(-1.2, 1.2) + (0.6 if dx > 0 else -0.6) - math.pi/2
            L = rnd.uniform(9, 15)*S
            e = (q[0]+math.cos(ang)*L, q[1]+math.sin(ang)*L)
            d.line([q, e], fill=pal['stem'] + (200,), width=int(1.2*S))
    for (x, y) in tips:  # small 5-petal blossoms
        r = rnd.uniform(9, 13)*S
        rot = rnd.uniform(0, math.pi)
        for i in range(5):
            a = rot + i*2*math.pi/5
            cx, cy = x + math.cos(a)*r*0.75, y + math.sin(a)*r*0.75
            d.ellipse([cx-r*0.55, cy-r*0.55, cx+r*0.55, cy+r*0.55], fill=pal['petal'] + (240,),
                      outline=pal['stem'] + (150,), width=int(0.8*S))
        d.ellipse([x-r*0.32, y-r*0.32, x+r*0.32, y+r*0.32], fill=pal['center'] + (255,))
    im = im.resize((W, H), Image.LANCZOS)
    return im.transpose(Image.FLIP_LEFT_RIGHT) if flip else im

def wrap(d, text, f, maxw):
    lines = []
    for para in text.split('\n'):
        words, cur = para.split(), ''
        for w in words:
            t = (cur + ' ' + w).strip()
            if d.textlength(t, font=f) <= maxw: cur = t
            else: lines.append(cur); cur = w
        lines.append(cur)
    return lines

def watermark_ghost(img, box, pal, text='@trulyaariya'):
    """Faint diagonal mark across the card so the quote can't be cleanly cropped."""
    x0, y0, x1, y1 = box
    layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    t = Image.new('RGBA', (900, 120), (0, 0, 0, 0))
    ImageDraw.Draw(t).text((450, 60), text, font=SANS(64, 300), fill=pal['soft'] + (22,), anchor='mm')
    t = t.rotate(24, expand=True, resample=Image.BICUBIC)
    layer.alpha_composite(t, (int((x0+x1)/2 - t.width/2), int((y0+y1)/2 - t.height/2)))
    img.alpha_composite(layer)

def card(spec, out, W=1080, H=1350):
    pal = DARK if spec.get('dark') else LIGHT
    img = Image.new('RGB', (W, H), pal['bg'])
    img = grain(img, amt=4, seed=spec.get('n', 1)).convert('RGBA')
    d = ImageDraw.Draw(img)
    top = 150 if H == 1350 else 330
    bottom = H - 210 if H == 1350 else H - 400
    box = (90, top, W-90, bottom)
    d.rounded_rectangle(box, radius=46, fill=pal['card'])
    # series label
    label = spec.get('label') or f"TRULY AARIYA  ·  Nº {spec['n']:02d}"
    spaced(d, (W/2, top-70), label, SANS(22, 400), pal['soft'], track=5)
    # heading
    y = top + 95
    if spec.get('heading'):
        d.text((W/2, y), spec['heading'], font=SCRIPT(76), fill=pal['accent'], anchor='mm')
        y += 95
    # quote — auto-size to fit
    maxw = W - 2*90 - 150
    avail = (bottom - 290) - y
    for size in range(66, 34, -2):
        f = SERIF(size, 500)
        lines = wrap(d, spec['quote'], f, maxw)
        lh = size * 1.32
        if len(lines)*lh <= avail: break
    block = len(lines)*lh
    qy = y + (avail - block)/2
    for ln in lines:
        d.text((W/2, qy + lh/2), ln, font=f, fill=pal['ink'], anchor='mm')
        qy += lh
    # divider + source
    dy = qy + 34
    for i, dx in enumerate((-22, 0, 22)):
        r = 4 if dx == 0 else 2.5
        d.ellipse([W/2+dx-r, dy-r, W/2+dx+r, dy+r], fill=pal['accent'])
    if spec.get('source', True):
        lines = spec.get('source_lines', ['a quote from my upcoming book'])
        sy = dy + 44
        for ln in lines:
            d.text((W/2, sy), ln, font=ITAL(31, 500), fill=pal['soft'], anchor='mm'); sy += 44
        d.text((W/2, sy+6), 'A Self Repaired Soul', font=SERIF(40, 600), fill=pal['accent'], anchor='mm')
        if spec.get('after_title'):
            sy += 52
            d.text((W/2, sy), spec['after_title'], font=ITAL(31, 500), fill=pal['soft'], anchor='mm')
        spaced(d, (W/2, sy+42), 'PUBLISHING SOON', SANS(20, 500), pal['soft'], track=6)
    # dried-flower sprig, like the book's pages
    sp = sprig((210, 330), pal, seed=spec.get('n', 1) + 7)
    img.alpha_composite(sp, (box[0] - 40, box[3] - 300))
    # footer watermark
    d = ImageDraw.Draw(img)
    fy = bottom + (H - bottom)/2 - 14
    spaced(d, (W/2, fy), 'Truly Aariya  ·  @trulyaariya', SANS(28, 400), pal['soft'], track=4)
    if spec.get('footer_note'):
        d.text((W/2, fy+52), spec['footer_note'], font=ITAL(28, 500), fill=pal['soft'], anchor='mm')
    img.convert('RGB').save(out, quality=93)
    return out

if __name__ == '__main__':
    card({'n': 1, 'heading': 'Dear soul,', 'quote': 'Strength isn’t about never breaking — it’s about breaking and still choosing to return.'}, '/home/claude/book/test1.jpg')
    card({'n': 2, 'dark': True, 'label': 'A SELF REPAIRED SOUL  ·  COMING SOON', 'heading': 'Something is coming…', 'quote': 'You did not find this book;\nthis book found you.', 'after_title': 'journey that heals'}, '/home/claude/book/test2.jpg')
