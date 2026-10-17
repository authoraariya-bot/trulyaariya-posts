"""07 teaser - "Six phases, / Survival. Sacrifice. Failure. Breakdowns. Comebacks. Healing."
Six washes: on handmade paper, one watercolour bloom opens for each phase. At "Breakdowns" the wet
pigment runs in drips (the tension); at "Healing" a warm butter wash opens and gold flows into every
dried edge and down every drip, mending the whole sheet (the turn).
Palette: cream, lavender, blush, sky, mauve, peach, butter; accent gold.  1080x1920 @30fps.
Beats are timed to the bars of music.py piece '07' (rising_piano) at total = DUR."""
import math, random, subprocess, sys, os
import numpy as np
import cairo
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS, DUR = 1080, 1920, 30, 16.5
NF = int(FPS * DUR)
OUT = sys.argv[1] if len(sys.argv) > 1 else "07_silent.mp4"
PREVIEW = sys.argv[2:]

FONTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "fonts") + "/"
LORA = FONTS + "Lora-Italic-Variable.ttf"
POP_L = FONTS + "Poppins-Light.ttf"

def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)
def ease_out(x): x = clamp(x); return 1 - (1 - x) ** 3
def ease_io(x): x = clamp(x); return 0.5 - 0.5 * math.cos(math.pi * x)

BAR = DUR / 7.0                       # music bar length
BEAT_T = [0.3] + [k * BAR + 0.05 for k in range(1, 6)]   # word / bloom times
T_DRIP = BEAT_T[3] + 0.35             # tension: pigment runs
T_HEAL = BEAT_T[5]                    # turn: gold
T_END = 13.9

# ---------------- noise helpers ----------------
from scipy.ndimage import gaussian_filter, zoom
def blurred(rg, h, w, scale, rad):
    """smooth float noise (no 8-bit steps, so warped edges stay clean), zero mean, unit std"""
    sh, sw = max(2, h // scale), max(2, w // scale)
    n = gaussian_filter(rg.normal(0, 1, (sh, sw)).astype(np.float32), rad, mode="wrap")
    a = zoom(n, (h / sh, w / sw), order=3)[:h, :w] if (sh, sw) != (h, w) else n
    a = a - a.mean()
    return (a / (a.std() + 1e-6)).astype(np.float32)

# ---------------- paper ----------------
def make_paper():
    rg = np.random.default_rng(17)
    tex = 0.013 * blurred(rg, H, W, 24, 3) + 0.010 * blurred(rg, H, W, 6, 2) + 0.010 * blurred(rg, H, W, 1, 0.6)
    fib = Image.new("L", (W, H), 128); d = ImageDraw.Draw(fib); fr = random.Random(9)
    for _ in range(1800):
        x, y = fr.uniform(0, W), fr.uniform(0, H); a = fr.uniform(0, math.pi); L = fr.uniform(14, 70)
        pts = [(x, y)]
        for k in range(4):
            a += fr.gauss(0, 0.35); x += L / 4 * math.cos(a); y += L / 4 * math.sin(a); pts.append((x, y))
        d.line(pts, fill=fr.choice([205, 215, 196, 80]), width=1)
    fib = np.asarray(fib.filter(ImageFilter.GaussianBlur(0.7))).astype(np.float32)
    tex += (fib - 128) / 128 * 0.09
    return tex
TEX = make_paper()
PAPER = (1 + TEX)[..., None]
GRAN = np.clip(1 + 4.0 * TEX, 0.6, 1.5)           # pigment settles into the tooth (granulation)

# ---------------- cream ground with drifting window light (low res) ----------------
SW, SH = 216, 384
yy, xx = np.mgrid[0:SH, 0:SW].astype(np.float32)
nx, ny = xx / SW, yy / SH * (H / W)
BASE = np.array([0.990, 0.972, 0.950], np.float32)
LIGHT = [((1.0, 0.95, 0.88), 0.55, (0.85, 0.20, 0.10, 0.08, 0.17, 0.21, 0.3)),
         ((0.99, 0.93, 0.92), 0.60, (0.10, 1.50, 0.12, 0.10, 0.13, 0.19, 2.2))]
def ground(t, dim, heal):
    wx = nx + 0.04 * np.sin(3.3 * ny + t * 0.31); wy = ny + 0.04 * np.sin(2.9 * nx - t * 0.27)
    col = np.broadcast_to(BASE, (SH, SW, 3)).copy()
    for c, r, (cx, cy, ax, ay, fx, fy, ph) in LIGHT:
        px = cx + ax * math.sin(t * fx + ph); py = cy + ay * math.cos(t * fy + ph * 0.7)
        w = (np.exp(-((wx - px) ** 2 + (wy - py) ** 2) / (r * r)) * 0.7)[..., None]
        col = col * (1 - w) + np.array(c, np.float32) * w
    band = np.exp(-((nx * 0.7 + ny * 0.4 - (-0.3 + (t * 0.06) % 2.0)) ** 2) / 0.03)
    col += (0.035 + 0.03 * heal) * band[..., None]
    col *= (1 - 0.035 * dim); col += 0.02 * heal
    return np.clip(col, 0, 1)

# ---------------- watercolour blooms ----------------
Y, X = np.mgrid[0:H, 0:W].astype(np.float32)
#           centre        R     pigment colour            start
BLOOMS = [((300, 470), 330, (0.80, 0.77, 0.94), BEAT_T[0]),   # Survival   - lavender
          ((790, 640), 320, (0.96, 0.75, 0.80), BEAT_T[1]),   # Sacrifice  - blush
          ((275, 870), 340, (0.76, 0.85, 0.94), BEAT_T[2]),   # Failure    - sky
          ((790, 1010), 330, (0.85, 0.72, 0.87), BEAT_T[3]),  # Breakdowns - mauve
          ((320, 1270), 360, (1.00, 0.83, 0.70), BEAT_T[4]),  # Comebacks  - peach
          ((570, 1390), 560, (0.99, 0.91, 0.68), BEAT_T[5])]  # Healing    - butter
DFIELD, INNER = [], []
for i, ((cx, cy), R, c, t0) in enumerate(BLOOMS):
    rg = np.random.default_rng(100 + i)
    dx, dy = (X - cx) / R, (Y - cy) / R
    an = np.arctan2(dy, dx)
    warp = (0.16 * blurred(rg, H, W, 90, 2) + 0.06 * blurred(rg, H, W, 30, 2) + 0.02 * blurred(rg, H, W, 8, 1)
            + 0.05 * np.sin(3 * an + i) + 0.03 * np.sin(5 * an + 2 * i))
    dist = np.sqrt(dx * dx + dy * dy)
    DFIELD.append(np.maximum(dist * (1 + warp), dist * 0.72))   # no stray islands far from the bloom
    INNER.append(0.6 + 0.4 * blurred(rg, H, W, 40, 2).clip(-1.5, 1.5) / 1.5)
HC = (560.0, 1065.0)                      # gold spreads out from the word "Healing."
HDIST = np.sqrt((X - HC[0]) ** 2 + (Y - HC[1]) ** 2)

def growth(t, t0):
    return 1.0 * ease_out((t - t0) / 1.9) + 0.05 * ease_io((t - t0 - 1.9) / 7.0)

# ---------------- drips (from Failure and Breakdowns) ----------------
def bottom_edge(i, x):
    col = DFIELD[i][:, int(x)]
    idx = np.where(col < 1.0)[0]
    return float(idx.max()) if len(idx) else BLOOMS[i][0][1]
DR = random.Random(21)
DRIPS = []   # (bloom index, x, y0, length, width, start, phase)
for x in (650, 745, 800, 905):
    DRIPS.append((3, x + DR.uniform(-20, 20), 0, DR.uniform(120, 380), DR.uniform(6, 12), T_DRIP + DR.uniform(0, 0.7), DR.uniform(0, 6)))
for x in (215, 345):
    DRIPS.append((2, x + DR.uniform(-20, 20), 0, DR.uniform(90, 200), DR.uniform(5, 9), T_DRIP + 0.3 + DR.uniform(0, 0.6), DR.uniform(0, 6)))
DRIPS = [(i, x, bottom_edge(i, x) - 18, L, w, s, ph) for i, x, _, L, w, s, ph in DRIPS]

def drip_poly(cr, x, y0, L, w, ph, grow):
    if grow <= 0: return False
    n = 30; Lg = L * grow
    left, right = [], []
    for k in range(n + 1):
        q = k / n; y = y0 + Lg * q
        xc = x + 9 * math.sin(ph + y * 0.011) + 3.5 * math.sin(ph * 1.7 + y * 0.037)
        hw = w * (1 - 0.6 * q) * (0.85 + 0.15 * math.sin(ph + q * 9)) * 0.5 + 1.0
        left.append((xc - hw, y)); right.append((xc + hw, y))
    cr.move_to(*left[0])
    for p in left[1:]: cr.line_to(*p)
    bx, by = (left[-1][0] + right[-1][0]) / 2, left[-1][1]
    cr.arc_negative(bx, by + 2, w * 0.42 + 1.5, math.pi, 0)   # rounded bead, through the bottom
    for p in reversed(right): cr.line_to(*p)
    cr.close_path()
    return True

def drip_mask(t, gold=False):
    s = cairo.ImageSurface(cairo.FORMAT_A8, W, H); cr = cairo.Context(s)
    any_ = False
    for i, x, y0, L, w, st, ph in DRIPS:
        g = ease_out((t - st) / 3.2)
        if gold:
            # gold travels down the drip once the gold front has reached its top
            reach = clamp((gold - math.hypot(x - HC[0], y0 - HC[1])) / 380.0)
            if reach <= 0: continue
            if drip_poly(cr, x, y0, L * g * reach, w * 0.12, ph, 1.0):
                cr.set_source_rgba(0, 0, 0, 1); cr.fill(); any_ = True
        else:
            if drip_poly(cr, x, y0, L, w, ph, g):
                cr.set_source_rgba(0, 0, 0, 1); cr.fill(); any_ = True
    if not any_: return None
    s.flush()
    return np.ndarray((H, s.get_stride()), np.uint8, s.get_data())[:, :W].astype(np.float32) / 255

# ---------------- text ----------------
PLUM = (92, 64, 84, 255)
SOFT = (140, 104, 126, 255)
GOLDTXT = (170, 122, 52, 255)
def to_surface(rgba):
    a = rgba.astype(np.float32); al = a[..., 3:4] / 255.0
    rgb = a[..., :3] * al
    bgra = np.dstack([rgb[..., 2], rgb[..., 1], rgb[..., 0], a[..., 3]]).astype(np.uint8)
    h, w = bgra.shape[:2]
    stride = cairo.ImageSurface.format_stride_for_width(cairo.FORMAT_ARGB32, w)
    buf = np.zeros((h, stride // 4, 4), np.uint8); buf[:, :w] = bgra
    return cairo.ImageSurface.create_for_data(bytearray(buf.tobytes()), cairo.FORMAT_ARGB32, w, h, stride)
def text_sprite(txt, font_path, size, color, tracking=0.0, variation=b"Italic"):
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
    halo = img.split()[3].filter(ImageFilter.GaussianBlur(16)).point(lambda v: int(min(255, v * 1.25)))
    base = Image.new("RGBA", img.size, (255, 250, 242, 0)); base.putalpha(halo)
    base.alpha_composite(img)
    return to_surface(np.asarray(base)), base.size

BEATS = ["Survival.", "Sacrifice.", "Failure.", "Breakdowns.", "Comebacks.", "Healing."]
HEAD_S = text_sprite("Six phases,", LORA, 66, SOFT, 0.4)
BEAT_S = []
for k, w in enumerate(BEATS):
    if k == 5: BEAT_S.append((text_sprite(w, LORA, 94, GOLDTXT, 0.6), BEAT_T[k], 1065))
    else: BEAT_S.append((text_sprite(w, LORA, 76, PLUM, 0.4), BEAT_T[k], 490 + 112 * k))
FROM_S = text_sprite("COMING SOON", POP_L, 27, (120, 92, 108, 255), 10, None)
TITLE_S = text_sprite("A Self Repaired Soul", LORA, 66, GOLDTXT, 0.6)

G = np.random.default_rng(5)
GRAIN = [G.normal(0, 1, (H // 2, W // 2)).astype(np.float32) for _ in range(5)]
GOLD_LO = np.array([0.74, 0.54, 0.24], np.float32)
GOLD_HI = np.array([1.00, 0.91, 0.64], np.float32)
GVAR = blurred(np.random.default_rng(3), H, W, 20, 2)

def gold_front(t): return 1500.0 * ease_io((t - T_HEAL - 0.2) / 3.4)

# ---------------- frame ----------------
def render(f):
    t = f / FPS
    dim = ease((t - BEAT_T[3]) / 1.2) * (1 - ease((t - T_HEAL) / 1.5))
    heal = ease((t - T_HEAL) / 3.0)
    small = ground(t, dim, heal)
    col = np.asarray(Image.fromarray((small * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)).astype(np.float32) / 255
    col = col * PAPER

    gf = gold_front(t)
    gate = np.clip((gf - HDIST) / 90.0, 0, 1) if gf > 0 else None
    goldm = np.zeros((H, W), np.float32) if gf > 0 else None
    wet = 1.0 + 0.18 * dim                                  # heavier pigment during the breakdown
    for i, ((cx, cy), R, c, t0) in enumerate(BLOOMS):
        if t < t0: continue
        g = growth(t, t0)
        D = DFIELD[i]
        u = (g - D) * R                                     # px inside the edge (>0 inside)
        fill = np.clip(u / 3.0 + 0.5, 0, 1)
        rim = np.exp(-(np.maximum(u, 0) / 9.0) ** 2) * fill   # darker dried edge just inside
        op = 0.62 if i < 5 else 0.55
        a = op * wet * (fill * 0.55 * INNER[i] + rim * 0.55) * GRAN
        col *= (1 - np.clip(a, 0, 0.95)[..., None] * (1 - np.array(c, np.float32)))
        if goldm is not None:
            seam = np.exp(-((u - 1.5) / 2.2) ** 2)          # thin gold line along the edge
            goldm = np.maximum(goldm, seam * gate)
    # drips of pigment (running pigment, darker at the sides)
    dm = drip_mask(t)
    if dm is not None:
        dmb = gaussian_filter(dm, 1.6)
        c = np.array([0.84, 0.73, 0.88], np.float32)
        a = (dmb * 0.32 + (dmb - dmb ** 2) * 0.8) * GRAN * (1 - 0.5 * heal)
        col *= (1 - np.clip(a, 0, 0.9)[..., None] * (1 - c))
    if goldm is not None:
        gd = drip_mask(t, gold=gf)
        if gd is not None:
            goldm = np.maximum(goldm, gaussian_filter(gd, 0.7) * 0.85)
        # metallic: base gold with a moving sheen and a little variation along the seam
        ph = (t - T_HEAL) * 0.32 % 1.8 - 0.4
        sheen = np.exp(-(((X * 0.6 + Y * 0.35) / W) - ph * 1.6) ** 2 / 0.02)
        mix = np.clip(0.35 + 0.25 * GVAR + 0.6 * sheen, 0, 1)[..., None]
        gcol = GOLD_LO * (1 - mix) + GOLD_HI * mix
        gm = (goldm * 0.92)[..., None]
        # soft warm glow beneath the gold
        small_g = Image.fromarray((goldm[::4, ::4] * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(7)).resize((W, H), Image.BILINEAR)
        glow = np.asarray(small_g).astype(np.float32)[..., None] / 255
        shimmer = 0.8 + 0.2 * math.sin(t * 2.0)
        col = col + glow * np.array([0.30, 0.21, 0.07], np.float32) * 0.9 * shimmer
        col = col * (1 - gm) + gcol * gm
    gr = np.asarray(Image.fromarray(GRAIN[f % 5]).resize((W, H), Image.NEAREST))
    col = np.clip(col + gr[..., None] * 0.011, 0, 1)

    rgb = (col * 255).astype(np.uint8)
    bgra = np.dstack([rgb[..., 2], rgb[..., 1], rgb[..., 0], np.full((H, W), 255, np.uint8)])
    surf = cairo.ImageSurface.create_for_data(bytearray(bgra.tobytes()), cairo.FORMAT_ARGB32, W, H, W * 4)
    cr = cairo.Context(surf)

    # soft cream veil behind the text column
    veil = 0.50 * ease_out((t - 0.1) / 1.0)
    cr.save(); cr.translate(540, 800); cr.scale(1, 1.55)
    rg = cairo.RadialGradient(0, 0, 40, 0, 0, 430)
    rg.add_color_stop_rgba(0, 1, 0.985, 0.96, veil); rg.add_color_stop_rgba(0.6, 1, 0.985, 0.96, veil * 0.6)
    rg.add_color_stop_rgba(1, 1, 0.985, 0.96, 0)
    cr.set_source(rg); cr.arc(0, 0, 430, 0, 6.2832); cr.fill(); cr.restore()

    def put(sprite, t0, y, dur=1.0):
        (s, (sw, sh)) = sprite
        p = ease_out((t - t0) / dur)
        if p <= 0: return
        cr.set_source_surface(s, (W - sw) / 2, y - sh / 2 + 16 * (1 - min(1, (t - t0) / dur))); cr.paint_with_alpha(p)
    put(HEAD_S, 0.0, 360, 0.7)
    for sp, t0, y in BEAT_S: put(sp, t0, y)
    # end card below the six phases, over the healed sheet
    p = ease_out((t - T_END) / 1.0)
    if p > 0:
        cr.set_source_rgba(0.67, 0.48, 0.20, 0.85 * p); cr.set_line_width(1.6)
        cr.move_to(540 - 60 * p, 1205); cr.line_to(540 + 60 * p, 1205); cr.stroke()
    put(FROM_S, T_END + 0.3, 1262)
    put(TITLE_S, T_END + 0.7, 1345)

    fi = 1 - ease(t / 0.35)
    if fi > 0: cr.set_source_rgba(0.99, 0.97, 0.95, fi); cr.paint()
    surf.flush()
    return surf

if PREVIEW:
    for fn in PREVIEW: render(int(fn)).write_to_png(f"w_{int(fn):03d}.png")
    sys.exit()

proc = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgra",
                         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium",
                         "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
for f in range(NF):
    proc.stdin.write(bytes(render(f).get_data()))
    if f % 60 == 0: print("frame", f, flush=True)
proc.stdin.close(); proc.wait(); print("done")
