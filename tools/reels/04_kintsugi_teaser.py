"""04 teaser - "Dear reader, when did you first notice your soul needed repair?"
Kintsugi on handmade paper - pastel silk surface cracks, then the cracks are mended with flowing gold.
1080x1920 @30fps."""
import math, random, subprocess, sys
import numpy as np
import cairo
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS, DUR = 1080, 1920, 30, 16.5
NF = int(FPS * DUR)
OUT = sys.argv[1] if len(sys.argv) > 1 else "04_silent.mp4"
PREVIEW = sys.argv[2:]

import os
FONTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "fonts") + "/"
LORA = FONTS + "Lora-Italic-Variable.ttf"
POP_L = FONTS + "Poppins-Light.ttf"

def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)
def ease_out(x): x = clamp(x); return 1 - (1 - x) ** 3
def ease_io(x): x = clamp(x); return 0.5 - 0.5 * math.cos(math.pi * x)

# ---------------- pastel silk background ----------------
SW, SH = 216, 384
yy, xx = np.mgrid[0:SH, 0:SW].astype(np.float32)
nx, ny = xx / SW, yy / SH * (H / W)          # aspect-correct units
BASE = np.array([0.988, 0.965, 0.945], np.float32)
BLOBS = [  # colour, radius, centre path params
    ((0.975, 0.80, 0.81), 0.55, (0.15, 0.35, 0.10, 0.12, 0.21, 0.17, 0.0)),   # blush
    ((0.99, 0.87, 0.75), 0.50, (0.85, 0.55, 0.12, 0.10, 0.17, 0.23, 1.3)),   # peach
    ((0.86, 0.83, 0.97), 0.62, (0.70, 1.25, 0.14, 0.12, 0.13, 0.19, 2.1)),   # lavender
    ((0.81, 0.93, 0.87), 0.48, (0.20, 1.45, 0.10, 0.13, 0.19, 0.15, 3.7)),   # mint
    ((0.96, 0.78, 0.86), 0.42, (0.55, 0.95, 0.15, 0.10, 0.23, 0.13, 5.0)),   # rose
    ((0.99, 0.94, 0.86), 0.40, (0.45, 0.25, 0.08, 0.08, 0.11, 0.27, 0.6)),   # warm light
]
def silk(t, heal):
    wx = nx + 0.05 * np.sin(3.1 * ny + t * 0.35) + 0.03 * np.sin(5.3 * ny - t * 0.22)
    wy = ny + 0.05 * np.sin(2.7 * nx - t * 0.30) + 0.03 * np.cos(4.1 * nx + t * 0.18)
    col = np.broadcast_to(BASE, (SH, SW, 3)).copy()
    for c, r, (cx, cy, ax, ay, fx, fy, ph) in BLOBS:
        px = cx + ax * math.sin(t * fx + ph)
        py = cy + ay * math.cos(t * fy + ph * 0.7)
        d2 = (wx - px) ** 2 + (wy - py) ** 2
        w = (np.exp(-d2 / (r * r)) * 0.85)[..., None]
        col = col * (1 - w) + np.array(c, np.float32) * w
    # slow diagonal sheen like light across glazed porcelain
    band = np.exp(-((nx * 0.8 + ny * 0.45 - (0.2 + (t * 0.045) % 1.6)) ** 2) / 0.02)
    col += (0.05 + 0.04 * heal) * band[..., None]
    col += 0.025 * heal
    return np.clip(col, 0, 1)

# ---------------- fracture network ----------------
R = random.Random(44)
ORIGIN = (500.0, 1260.0)
SEGS = []   # (x0,y0,x1,y1,dist0,dist1,width,level)
BID=[0]
def grow(x, y, ang, length, dist, level, width):
    BID[0]+=1; bid=BID[0]
    step = 9.0
    travelled = 0.0
    while travelled < length:
        ang += R.gauss(0, 0.035)
        if R.random() < 0.06: ang += R.choice([-1, 1]) * R.uniform(0.25, 0.55)  # sharp kink
        nx_ = x + step * math.cos(ang); ny_ = y + step * math.sin(ang)
        if not (-40 < nx_ < W + 40 and -40 < ny_ < H + 40): break
        SEGS.append((x, y, nx_, ny_, dist, dist + step, width * (1 - 0.55 * travelled / length), level, bid))
        x, y = nx_, ny_; dist += step; travelled += step
        if level < 2 and R.random() < (0.016 if level == 0 else 0.008):
            grow(x, y, ang + R.choice([-1, 1]) * R.uniform(0.5, 1.0),
                 length * R.uniform(0.25, 0.5), dist, level + 1, width * 0.6)

main_angles = [-1.85, -0.95, 0.05, 0.95, 1.75, 2.55, 3.4]
for a in main_angles:
    a += R.uniform(-0.15, 0.15)
    up = math.sin(a) < -0.3
    L = R.uniform(420, 620) if up else R.uniform(600, 950)
    grow(ORIGIN[0], ORIGIN[1], a, L, 0.0, 0, 5.2)
MAXD = max(s[5] for s in SEGS)
from collections import defaultdict
_br = defaultdict(list)
for sg in SEGS: _br[sg[8]].append(sg)
CHUNKS = []   # (segs, width, level)
for b, segs in _br.items():
    CHUNKS.append((segs, sum(p[6] for p in segs) / len(segs) * 0.9, segs[0][7]))
def chunk_path(cr, part, front, dx=0.0, dy=0.0):
    """add the revealed part of a chunk to the path; returns False if nothing shown"""
    if part[0][4] > front: return False
    cr.move_to(part[0][0] + dx, part[0][1] + dy)
    for x0, y0, x1, y1, d0, d1, *_ in part:
        if d0 > front: break
        fr = clamp((front - d0) / (d1 - d0))
        cr.line_to(x0 + (x1 - x0) * fr + dx, y0 + (y1 - y0) * fr + dy)
    return True

# ---------------- timeline ----------------
T_CRACK, CRACK_DUR = 3.6, 0.9
T_GOLD, GOLD_DUR = 5.6, 4.4
def crack_front(t): return MAXD * 1.05 * ease_out((t - T_CRACK) / CRACK_DUR)
def gold_front(t): return MAXD * 1.08 * ease_io((t - T_GOLD) / GOLD_DUR)

# ---------------- text ----------------
PLUM = (92, 64, 84, 255)
GOLDTXT = (170, 122, 52, 255)
def text_sprite(txt, font_path, size, color, tracking=0.0, variation=None):
    f = ImageFont.truetype(font_path, size)
    if variation:
        try: f.set_variation_by_name(variation)
        except Exception: pass
    widths = [f.getlength(c) for c in txt]
    tw = int(sum(widths) + tracking * (len(txt) - 1)) + 4
    asc, desc = f.getmetrics(); pad = 50
    img = Image.new("RGBA", (tw + 2 * pad, asc + desc + 2 * pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(img); x = pad
    for c, w in zip(txt, widths):
        d.text((x, pad), c, font=f, fill=color); x += w + tracking
    # soft luminous halo (cream) so text floats on the silk
    halo = img.split()[3].filter(ImageFilter.GaussianBlur(16)).point(lambda v: int(min(255, v * 1.1)))
    base = Image.new("RGBA", img.size, (255, 250, 242, 0)); base.putalpha(halo)
    base.alpha_composite(img)
    return to_surface(np.asarray(base)), base.size

def to_surface(rgba):
    a = rgba.astype(np.float32); al = a[..., 3:4] / 255.0
    rgb = a[..., :3] * al
    bgra = np.dstack([rgb[..., 2], rgb[..., 1], rgb[..., 0], a[..., 3]]).astype(np.uint8)
    h, w = bgra.shape[:2]
    stride = cairo.ImageSurface.format_stride_for_width(cairo.FORMAT_ARGB32, w)
    buf = np.zeros((h, stride // 4, 4), np.uint8); buf[:, :w] = bgra
    return cairo.ImageSurface.create_for_data(bytearray(buf.tobytes()), cairo.FORMAT_ARGB32, w, h, stride)

V = b"Italic"
A_LINES = [("Dear reader,", (150, 112, 132, 255), 0.25, 420, 60),
           ("When did you first notice", PLUM, 0.75, 525, 72), ("your soul needed repair?", GOLDTXT, 1.35, 620, 72)]
B_LINES = [("or…", PLUM, 9.3, 470, 72), ("maybe finish the book", PLUM, 9.9, 565, 72),
           ("and then answer.", GOLDTXT, 10.6, 660, 72)]
QS = 78
A_S = [(text_sprite(t, LORA, sz, c, 0.4, V), t0, y) for t, c, t0, y, sz in A_LINES]
B_S = [(text_sprite(t, LORA, sz, c, 0.4, V), t0, y) for t, c, t0, y, sz in B_LINES]
FROM_S = text_sprite("COMING SOON", POP_L, 27, (120, 92, 108, 255), 10)
TITLE_S = text_sprite("A Self Repaired Soul", LORA, 66, GOLDTXT, 0.6, V)

# handmade paper texture: mottling + fine tooth + scattered fibres (static, like a real sheet)
def make_paper():
    rg = np.random.default_rng(12)
    def blurred(scale, rad):
        n = rg.normal(0, 1, (H // scale, W // scale)).astype(np.float32)
        im = Image.fromarray(((n * 40) + 128).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(rad))
        a = np.asarray(im.resize((W, H), Image.BICUBIC)).astype(np.float32); a -= a.mean()
        return a / (a.std() + 1e-6)
    tex = 0.022 * blurred(24, 3) + 0.012 * blurred(6, 2) + 0.010 * blurred(1, 0.6)
    fib = Image.new("L", (W, H), 128); d = ImageDraw.Draw(fib); fr = random.Random(5)
    for _ in range(1800):
        x, y = fr.uniform(0, W), fr.uniform(0, H); a = fr.uniform(0, math.pi); L = fr.uniform(14, 70)
        pts = [(x, y)]
        for k in range(4):
            a += fr.gauss(0, 0.35); x += L / 4 * math.cos(a); y += L / 4 * math.sin(a); pts.append((x, y))
        d.line(pts, fill=fr.choice([205, 215, 196, 80]), width=1)
    fib = np.asarray(fib.filter(ImageFilter.GaussianBlur(0.7))).astype(np.float32)
    tex += (fib - 128) / 128 * 0.09
    return (1 + tex)[..., None]
PAPER = make_paper()

# grain
G = np.random.default_rng(5)
GRAIN = [G.normal(0, 1, (H // 2, W // 2)).astype(np.float32) for _ in range(5)]

# ---------------- frame ----------------
def render(f):
    t = f / FPS
    heal = ease((t - 9.8) / 3.0)
    small = silk(t, heal)
    big = np.asarray(Image.fromarray((small * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)).astype(np.float32) / 255
    big = big * PAPER

    cf, gf = crack_front(t), gold_front(t)
    # warm glow beneath gold
    if gf > 0:
        gs = cairo.ImageSurface(cairo.FORMAT_A8, W // 4, H // 4)
        g = cairo.Context(gs); g.scale(0.25, 0.25); g.set_line_cap(cairo.LINE_CAP_ROUND)
        for part, w, lv in CHUNKS:
            if chunk_path(g, part, gf):
                g.set_line_width(w * 5); g.set_source_rgba(0, 0, 0, 1); g.stroke()
        gs.flush()
        m = np.ndarray((H // 4, gs.get_stride()), np.uint8, gs.get_data())[:, :W // 4]
        mi = Image.fromarray(m.copy()).filter(ImageFilter.GaussianBlur(9)).resize((W, H), Image.BILINEAR)
        mg = np.asarray(mi).astype(np.float32)[..., None] / 255
        shimmer = 0.75 + 0.25 * math.sin(t * 2.1)
        big = big + mg * np.array([0.30, 0.20, 0.06], np.float32) * 0.55 * shimmer
        big = big * (1 - mg * 0.05)
    # grain
    gr = np.asarray(Image.fromarray(GRAIN[f % 5]).resize((W, H), Image.NEAREST))
    big = big + gr[..., None] * 0.012
    big = np.clip(big, 0, 1)

    rgb = (big * 255).astype(np.uint8)
    bgra = np.dstack([rgb[..., 2], rgb[..., 1], rgb[..., 0], np.full((H, W), 255, np.uint8)])
    surf = cairo.ImageSurface.create_for_data(bytearray(bgra.tobytes()), cairo.FORMAT_ARGB32, W, H, W * 4)
    cr = cairo.Context(surf); cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.set_line_join(cairo.LINE_JOIN_ROUND)

    # cracks (fine mauve hairlines with a light lip for depth)
    if cf > 0:
        for part, w, lv in CHUNKS:
            # only the part not yet covered by gold
            sub = [p for p in part if p[5] > gf]
            if not sub or sub[0][4] > cf: continue
            hw = max(0.9, w * 0.38)
            if chunk_path(cr, sub, cf, 0.8, 1.0):
                cr.set_source_rgba(1, 1, 1, 0.55); cr.set_line_width(hw + 1.4); cr.stroke()
            chunk_path(cr, sub, cf)
            cr.set_source_rgba(0.43, 0.33, 0.40, 0.78); cr.set_line_width(hw); cr.stroke()

    # gold seams
    if gf > 0:
        for part, w, lv in CHUNKS:
            if part[0][4] > gf: continue
            settle = ease((gf - part[0][4]) / 220)
            gw = w * (0.6 + 0.4 * settle)
            x0, y0 = part[0][0], part[0][1]; x1, y1 = part[-1][2], part[-1][3]
            def grad(base, hi, a=1.0):
                g = cairo.LinearGradient(x0, y0, x1, y1)
                ph = (t * 0.35 + part[0][4] / 900) % 1.6 - 0.3
                for k in range(9):
                    q = k / 8
                    m = math.exp(-((q - ph) ** 2) / 0.02)
                    g.add_color_stop_rgba(q, *[b + (h - b) * m for b, h in zip(base, hi)], a)
                return g
            chunk_path(cr, part, gf); cr.set_source_rgb(0.70, 0.51, 0.23); cr.set_line_width(gw + 1.1); cr.stroke()
            chunk_path(cr, part, gf); cr.set_source(grad((0.85, 0.66, 0.34), (0.98, 0.86, 0.55)))
            cr.set_line_width(gw * 0.72); cr.stroke()
            chunk_path(cr, part, gf, -0.6, -0.6); cr.set_source(grad((1.0, 0.92, 0.72), (1.0, 0.99, 0.92), 0.6))
            cr.set_line_width(max(0.7, gw * 0.22)); cr.stroke()
        # glint at the flowing front
        if gf < MAXD:
            for x0, y0, x1, y1, d0, d1, w, lv, _b in SEGS:
                if d0 <= gf < d1 and lv == 0:
                    frac = (gf - d0) / (d1 - d0)
                    px, py = x0 + (x1 - x0) * frac, y0 + (y1 - y0) * frac
                    rg = cairo.RadialGradient(px, py, 0, px, py, 26)
                    rg.add_color_stop_rgba(0, 1, 0.97, 0.85, 0.9); rg.add_color_stop_rgba(1, 1, 0.9, 0.7, 0)
                    cr.set_source(rg); cr.arc(px, py, 26, 0, 6.283); cr.fill()

    # soft veil behind the text area so lines stay legible over cracks
    veil = 0.55 * max(ease_out((t - 0.2) / 1.0), 0)
    rg = cairo.RadialGradient(540, 560, 60, 540, 560, 560)
    rg.add_color_stop_rgba(0, 1, 0.98, 0.95, veil); rg.add_color_stop_rgba(1, 1, 0.98, 0.95, 0)
    cr.save(); cr.scale(1, 0.62); cr.translate(0, 560 / 0.62 - 560)
    cr.set_source(rg); cr.paint(); cr.restore()

    def put(sprite, t0, y, t_out=None):
        (s, (sw, sh)) = sprite
        p = ease_out((t - t0) / 1.0)
        if p <= 0: return
        if t_out is not None: p *= 1 - ease((t - t_out) / 0.8)
        if p <= 0: return
        cr.set_source_surface(s, (W - sw) / 2, y - sh / 2 + 18 * (1 - min(1, (t - t0)))); cr.paint_with_alpha(p)

    for sp, t0, y in A_S: put(sp, t0, y, t_out=8.4)
    for sp, t0, y in B_S: put(sp, t0, y, t_out=12.2)
    # end card
    p = ease_out((t - 12.8) / 1.0)
    if p > 0:
        cr.set_source_rgba(0.67, 0.48, 0.20, 0.8 * p); cr.set_line_width(1.6)
        cr.move_to(540 - 60 * p, 455); cr.line_to(540 + 60 * p, 455); cr.stroke()
    put(FROM_S, 13.1, 515)
    put(TITLE_S, 13.5, 600)

    # fade in from cream
    fi = 1 - ease(t / 0.6)
    if fi > 0: cr.set_source_rgba(0.99, 0.97, 0.95, fi); cr.paint()
    surf.flush()
    return surf

if PREVIEW:
    for fn in PREVIEW: render(int(fn)).write_to_png(f"k_{int(fn):03d}.png")
    sys.exit()

proc = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgra",
                         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium",
                         "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
for f in range(NF):
    proc.stdin.write(bytes(render(f).get_data()))
    if f % 60 == 0: print("frame", f, flush=True)
proc.stdin.close(); proc.wait(); print("done")
