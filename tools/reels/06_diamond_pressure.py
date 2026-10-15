"""06 quote - "Real self-love is like a diamond — formed under pressure, not comfort."
Pressure into light: pastel washes on handmade paper close in on one point, the pressure becomes a
faceted crystal of light, and it throws soft prism light across the sheet.
Palette: pearl, sky, aqua, periwinkle, butter; accents gold + prism.  1080x1920 @30fps."""
import math, random, subprocess, sys, os
import numpy as np
import cairo
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS, DUR = 1080, 1920, 30, 16.5
NF = int(FPS * DUR)
OUT = sys.argv[1] if len(sys.argv) > 1 else "06_silent.mp4"
PREVIEW = sys.argv[2:]

FONTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "fonts") + "/"
LORA = FONTS + "Lora-Italic-Variable.ttf"
POP_L = FONTS + "Poppins-Light.ttf"

def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def ease(x): x = clamp(x); return x * x * (3 - 2 * x)
def ease_out(x): x = clamp(x); return 1 - (1 - x) ** 3
def ease_io(x): x = clamp(x); return 0.5 - 0.5 * math.cos(math.pi * x)

CX, CY = 540.0, 1150.0          # where the pressure meets / the crystal forms

# ---------------- timeline ----------------
T_PRESS0, T_PRESS1 = 1.2, 4.7    # washes close in
T_FORM = 4.7                     # light point -> crystal
def press(t): return ease_io((t - T_PRESS0) / (T_PRESS1 - T_PRESS0))
def release(t): return ease_out((t - T_FORM) / 3.2)
def grow(t): return ease_out((t - T_FORM - 0.15) / 2.6)
def flash(t):
    x = (t - T_FORM) / 1.6
    return 0.0 if x < -0.25 or x > 1 else (ease((x + 0.25) / 0.25) if x < 0 else (1 - ease(x)))
def prism(t): return ease_io((t - 6.4) / 1.8)

# ---------------- pastel ground (low res) ----------------
SW, SH = 216, 384
yy, xx = np.mgrid[0:SH, 0:SW].astype(np.float32)
nx, ny = xx / SW, yy / SH * (H / W)
ccx, ccy = CX / W, CY / W
BASE = np.array([0.978, 0.974, 0.982], np.float32)        # pearl
WASH = [((0.80, 0.89, 0.98), 0.60, (0.10, 0.30, 0.08, 0.10, 0.17, 0.21, 0.4)),   # sky
        ((0.99, 0.95, 0.81), 0.45, (0.90, 0.40, 0.10, 0.08, 0.21, 0.15, 1.9)),   # butter (window light)
        ((0.80, 0.93, 0.93), 0.55, (0.15, 1.55, 0.12, 0.10, 0.13, 0.19, 3.1)),   # aqua
        ((0.86, 0.87, 0.99), 0.60, (0.85, 1.40, 0.10, 0.12, 0.19, 0.13, 4.6))]   # periwinkle
RINGS = [(0.78, 0.88, 0.99), (0.99, 0.93, 0.78), (0.79, 0.93, 0.92), (0.85, 0.85, 0.99), (0.98, 0.90, 0.86)]

def ground(t):
    wx = nx + 0.04 * np.sin(3.3 * ny + t * 0.31) + 0.025 * np.sin(6.1 * ny - t * 0.2)
    wy = ny + 0.04 * np.sin(2.9 * nx - t * 0.27) + 0.025 * np.cos(5.2 * nx + t * 0.17)
    col = np.broadcast_to(BASE, (SH, SW, 3)).copy()
    for c, r, (cx, cy, ax, ay, fx, fy, ph) in WASH:
        px = cx + ax * math.sin(t * fx + ph); py = cy + ay * math.cos(t * fy + ph * 0.7)
        w = (np.exp(-((wx - px) ** 2 + (wy - py) ** 2) / (r * r)) * 0.8)[..., None]
        col = col * (1 - w) + np.array(c, np.float32) * w
    # pressure: soft silk-like layers close in on one point, then relax into a halo
    p, rl = press(t), release(t)
    d = np.sqrt((wx - ccx) ** 2 + (wy - ccy) ** 2)
    an = np.arctan2(wy - ccy, wx - ccx)
    d = d * (1 + 0.045 * np.sin(2 * an + t * 0.3 + 3 * d) + 0.03 * np.sin(3 * an - t * 0.23 + 1.7) + 0.02 * np.sin(7 * d - t * 0.5))
    for k, c in enumerate(RINGS):
        r0 = 0.40 + 0.26 * k + 0.03 * math.sin(t * 0.6 + k)
        rp = 0.015 + 0.018 * k
        rr = 0.16 + 0.07 * k + 0.01 * math.sin(t * 0.5 + k)
        r = r0 + (rp - r0) * p
        r = r + (rr - rp) * rl if t > T_FORM else r
        wd = (0.11 - 0.06 * p + 0.06 * rl) * (1 + 0.15 * k)
        a = (0.55 + 0.15 * p) * (1 - 0.55 * rl)
        w = (np.exp(-((d - r) / wd) ** 2) * a)[..., None]
        col = col * (1 - w) + np.array(c, np.float32) * w
    glow = np.exp(-d ** 2 / (0.012 + 0.03 * p)) * (0.10 * p * (1 - 0.6 * rl))
    col += glow[..., None] * np.array([0.10, 0.08, 0.02], np.float32) * 6
    # slow sheen, like window light drifting across the sheet
    band = np.exp(-((nx * 0.75 - ny * 0.4 + 0.9 - (t * 0.05) % 1.8) ** 2) / 0.03)
    col += 0.035 * band[..., None]
    return np.clip(col, 0, 1)

def make_paper():
    rg = np.random.default_rng(16)
    def blurred(scale, rad):
        n = rg.normal(0, 1, (H // scale, W // scale)).astype(np.float32)
        im = Image.fromarray(((n * 40) + 128).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(rad))
        a = np.asarray(im.resize((W, H), Image.BICUBIC)).astype(np.float32); a -= a.mean()
        return a / (a.std() + 1e-6)
    tex = 0.020 * blurred(24, 3) + 0.011 * blurred(6, 2) + 0.009 * blurred(1, 0.6)
    fib = Image.new("L", (W, H), 128); dr = ImageDraw.Draw(fib); fr = random.Random(9)
    for _ in range(1700):
        x, y = fr.uniform(0, W), fr.uniform(0, H); a = fr.uniform(0, math.pi); L = fr.uniform(14, 70)
        pts = [(x, y)]
        for _k in range(4):
            a += fr.gauss(0, 0.35); x += L / 4 * math.cos(a); y += L / 4 * math.sin(a); pts.append((x, y))
        dr.line(pts, fill=fr.choice([205, 215, 196, 84]), width=1)
    fib = np.asarray(fib.filter(ImageFilter.GaussianBlur(0.7))).astype(np.float32)
    tex += (fib - 128) / 128 * 0.085
    return (1 + tex)[..., None]
PAPER = make_paper()
G = np.random.default_rng(6)
GRAIN = [G.normal(0, 1, (H // 2, W // 2)).astype(np.float32) for _ in range(5)]

# ---------------- crystal (round brilliant, true 3D, painter's order) ----------------
def build_gem():
    V, F = [], []
    def add(p): V.append(np.array(p, float)); return len(V) - 1
    T = [add((0.54 * math.cos(i * math.pi / 4), 0.34, 0.54 * math.sin(i * math.pi / 4))) for i in range(8)]
    Gd = [add((math.cos(j * math.pi / 8), 0.0, math.sin(j * math.pi / 8))) for j in range(16)]
    L = [add((0.50 * math.cos(i * math.pi / 4 + math.pi / 8), -0.46, 0.50 * math.sin(i * math.pi / 4 + math.pi / 8))) for i in range(8)]
    cul = add((0, -0.88, 0))
    F.append(T[:])                                             # table
    for i in range(8):
        a, b = T[i], T[(i + 1) % 8]
        g0, g1, g2 = Gd[2 * i], Gd[2 * i + 1], Gd[(2 * i + 2) % 16]
        F += [[a, b, g1], [a, g1, g0], [b, g2, g1]]               # star + upper girdle
        l = L[i]
        F += [[g0, g1, l], [g1, g2, l], [g0, l, L[(i - 1) % 8], ], [l, cul, L[(i - 1) % 8]]]
    # remove degenerate duplicates / fix: pavilion mains between lower-girdle points
    return np.array(V), F
GV, GF = build_gem()
CENT = GV.mean(0)

def hue_rgb(h, sat=0.32, lum=0.93):
    r = 0.5 + 0.5 * math.cos(2 * math.pi * (h + 0.00)); g = 0.5 + 0.5 * math.cos(2 * math.pi * (h - 0.33))
    b = 0.5 + 0.5 * math.cos(2 * math.pi * (h - 0.66))
    return tuple(lum + sat * (c - 0.5) for c in (r, g, b))

LIGHT = np.array([-0.45, 0.75, 0.55]); LIGHT /= np.linalg.norm(LIGHT)
ENV = [((-0.7, 0.5, 0.5), (1.00, 0.95, 0.80), 3.0),   # butter window light, upper left
       ((0.2, 1.0, 0.1), (0.80, 0.89, 0.99), 2.0),    # sky above
       ((0.6, -0.6, 0.4), (0.64, 0.66, 0.90), 2.0),   # periwinkle below right
       ((0.8, 0.3, 0.5), (0.80, 0.94, 0.93), 2.5)]    # aqua right
def env(r, k, t):
    acc = np.array([0.86, 0.86, 0.93]); wsum = 0.6
    for d_, c, p in ENV:
        d_ = np.array(d_) / np.linalg.norm(d_)
        w = max(0.0, float(np.dot(r, d_))) ** p * 2.2
        acc = acc + np.array(c) * w; wsum += w
    col = acc / wsum
    # alternating facet contrast, as in a real brilliant's light/dark pattern
    col = col * (0.76 + 0.24 * ((k * 5) % 3) / 2)
    return tuple(col)
def gem_faces(t, scale):
    th = 0.10 * t + 0.4; tilt = 1.02
    c, s = math.cos(th), math.sin(th)
    Ry = np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    ct, st = math.cos(tilt), math.sin(tilt)
    Rx = np.array([[1, 0, 0], [0, ct, -st], [0, st, ct]])
    P = (GV - [0, -0.1, 0]) @ Ry.T @ Rx.T
    out = []
    for k, f in enumerate(GF):
        pts = P[f]
        n = np.cross(pts[1] - pts[0], pts[2] - pts[0]); nn = np.linalg.norm(n)
        if nn < 1e-9: continue
        n /= nn
        if np.dot(n, pts.mean(0) - (CENT - [0, -0.1, 0]) @ Ry.T @ Rx.T) < 0: n = -n
        scr = [(CX + scale * p[0], CY - scale * p[1]) for p in pts]
        out.append((pts[:, 2].mean(), n, scr, k))
    out.sort(key=lambda o: o[0])
    return out

def draw_gem(cr, t, sc, alpha, edge_gold, mask_cr=None):
    if sc <= 1 or alpha <= 0: return
    faces = gem_faces(t, sc)
    for z, n, scr, k in faces:
        front = n[2] > 0
        refl = 2 * n[2] * n - np.array([0, 0, 1.0])
        spec = max(0.0, float(np.dot(refl, LIGHT))) ** 10
        tint = env(refl, k, t)
        h = (k * 0.137 + t * 0.02) % 1
        xs = [p[0] for p in scr]; ys = [p[1] for p in scr]
        lg = cairo.LinearGradient(min(xs), min(ys), max(xs), max(ys))
        hi = tuple(min(1, c + 0.08 + 0.6 * spec) for c in tint)
        disp = hue_rgb(h, 0.5, 0.86)
        lo = tuple((0.65 if front else 0.45) * c + (0.35 if front else 0.55) * d_ for c, d_ in zip(tint, disp))
        a_f = alpha * (((0.30 if k == 0 else 0.66) + 0.3 * spec) if front else 0.58)
        lg.add_color_stop_rgba(0, *hi, a_f); lg.add_color_stop_rgba(0.6, *tint, a_f)
        lg.add_color_stop_rgba(1, *lo, a_f)
        cr.move_to(*scr[0])
        for p in scr[1:]: cr.line_to(*p)
        cr.close_path(); cr.set_source(lg); cr.fill_preserve()
        # edges: pearl highlight, warmed by gold while the crystal is forming
        ea = alpha * (0.55 if front else 0.18)
        er, eg, eb = 1 - 0.14 * edge_gold, 0.99 - 0.22 * edge_gold, 0.97 - 0.48 * edge_gold
        cr.set_source_rgba(er, eg, eb, ea * (0.45 + 0.55 * edge_gold)); cr.set_line_width(1.0 if front else 0.6); cr.stroke()
        if mask_cr is not None and front and spec > 0.15:
            mask_cr.move_to(*scr[0])
            for p in scr[1:]: mask_cr.line_to(*p)
            mask_cr.close_path(); mask_cr.set_source_rgba(0, 0, 0, min(1, spec * 1.3 * alpha)); mask_cr.fill()
    return faces

# ---------------- text ----------------
PLUM = (92, 64, 84, 255)
GOLDTXT = (170, 122, 52, 255)
def to_surface(rgba):
    a = rgba.astype(np.float32); al = a[..., 3:4] / 255.0
    rgb = a[..., :3] * al
    bgra = np.dstack([rgb[..., 2], rgb[..., 1], rgb[..., 0], a[..., 3]]).astype(np.uint8)
    h, w = bgra.shape[:2]
    stride = cairo.ImageSurface.format_stride_for_width(cairo.FORMAT_ARGB32, w)
    buf = np.zeros((h, stride // 4, 4), np.uint8); buf[:, :w] = bgra
    return cairo.ImageSurface.create_for_data(bytearray(buf.tobytes()), cairo.FORMAT_ARGB32, w, h, stride)

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
    halo = img.split()[3].filter(ImageFilter.GaussianBlur(16)).point(lambda v: int(min(255, v * 1.1)))
    base = Image.new("RGBA", img.size, (255, 251, 244, 0)); base.putalpha(halo)
    base.alpha_composite(img)
    return to_surface(np.asarray(base)), base.size

V = b"Italic"
QS = 78
# word for word from tools/content.json (06): "Real self-love is like a diamond — formed under pressure, not comfort."
LINES = [("Real self-love", PLUM, 0.25, 400), ("is like a diamond —", PLUM, 0.8, 492),
         ("formed under pressure,", GOLDTXT, 5.5, 618), ("not comfort.", PLUM, 7.0, 710)]
SPR = [(text_sprite(s, LORA, QS, c, 0.4, V), t0, y) for s, c, t0, y in LINES]
FROM_S = text_sprite("FROM THE BOOK", POP_L, 27, (120, 92, 108, 255), 10)
TITLE_S = text_sprite("A Self Repaired Soul", LORA, 66, GOLDTXT, 0.6, V)

# prism caustics: soft spectral blobs thrown by the crystal onto the paper
CR_ = random.Random(21)
CAUSTICS = [(CR_.uniform(-1, 1), CR_.uniform(0.3, 1.0), CR_.uniform(0, 6.28), CR_.uniform(0.15, 0.35)) for _ in range(4)]
GLINTS = [(6.9, 0), (9.2, 1), (11.0, 2), (14.2, 3)]

def render(f):
    t = f / FPS
    small = ground(t)
    big = np.asarray(Image.fromarray((small * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)).astype(np.float32) / 255
    big = big * PAPER
    gr = np.asarray(Image.fromarray(GRAIN[f % 5]).resize((W, H), Image.NEAREST))
    big = np.clip(big + gr[..., None] * 0.011, 0, 1)
    rgb = (big * 255).astype(np.uint8)
    bgra = np.dstack([rgb[..., 2], rgb[..., 1], rgb[..., 0], np.full((H, W), 255, np.uint8)])
    surf = cairo.ImageSurface.create_for_data(bytearray(bgra.tobytes()), cairo.FORMAT_ARGB32, W, H, W * 4)
    cr = cairo.Context(surf); cr.set_line_join(cairo.LINE_JOIN_ROUND); cr.set_line_cap(cairo.LINE_CAP_ROUND)

    gsc = 285 * (0.12 + 0.88 * grow(t)) * (1 + 0.012 * math.sin(t * 1.3))
    galpha = ease((t - T_FORM) / 1.4)
    pr = prism(t)

    # prism rays: wide soft spectral fans from the crystal, slowly turning
    if pr > 0:
        for side, base_ang in ((1, -0.62), (-1, math.pi - 0.62)):
            ang = base_ang + 0.06 * math.sin(t * 0.35) * side
            L = 1250 * (0.4 + 0.6 * pr)
            for i in range(14):
                h = i / 14
                a0 = ang + (i - 7) * 0.016; a1 = a0 + 0.05
                rg = cairo.RadialGradient(CX, CY, 40, CX, CY, L)
                col = hue_rgb(h, 0.7, 0.84)
                rg.add_color_stop_rgba(0, *col, 0.0); rg.add_color_stop_rgba(0.15, *col, 0.075 * pr)
                rg.add_color_stop_rgba(1, *col, 0)
                cr.move_to(CX, CY); cr.arc(CX, CY, L, a0, a1); cr.close_path()
                cr.set_source(rg); cr.fill()
        for k, (u, v, ph, sz) in enumerate(CAUSTICS):
            px = CX + u * 420 + 30 * math.sin(t * 0.4 + ph); py = CY - 140 + v * 520 * (1 if k % 2 else -1) + 25 * math.cos(t * 0.33 + ph)
            if py < 780 and py > 300: py += 420
            r = 70 * sz * 4.0
            for i in range(5):
                col = hue_rgb(i / 5 + ph, 0.95, 0.80)
                rg = cairo.RadialGradient(px + (i - 2) * r * 0.22, py, 0, px + (i - 2) * r * 0.22, py, r * 0.6)
                rg.add_color_stop_rgba(0, *col, 0.09 * pr * (0.6 + 0.4 * math.sin(t * 0.9 + ph + i)))
                rg.add_color_stop_rgba(1, *col, 0)
                cr.set_source(rg); cr.arc(px + (i - 2) * r * 0.22, py, r * 0.6, 0, 6.283); cr.fill()

    # bright point at the moment pressure becomes light
    fl = flash(t)
    pre = ease((t - 3.2) / 1.5) * (1 - galpha)
    if fl > 0 or pre > 0:
        R = 60 + 260 * fl + 30 * pre
        rg = cairo.RadialGradient(CX, CY, 0, CX, CY, R)
        rg.add_color_stop_rgba(0, 1, 0.99, 0.94, min(1, 0.95 * fl + 0.7 * pre))
        rg.add_color_stop_rgba(0.35, 1, 0.94, 0.78, 0.45 * fl + 0.3 * pre)
        rg.add_color_stop_rgba(1, 1, 0.92, 0.75, 0)
        cr.set_source(rg); cr.arc(CX, CY, R, 0, 6.283); cr.fill()

    # crystal + its bloom
    if galpha > 0:
        ms = cairo.ImageSurface(cairo.FORMAT_A8, W // 4, H // 4)
        mc = cairo.Context(ms); mc.scale(0.25, 0.25)
        edge_gold = 1 - ease((t - 7.5) / 2.5)
        draw_gem(cr, t, gsc, galpha, edge_gold, mc)
        ms.flush()
        m = np.ndarray((H // 4, ms.get_stride()), np.uint8, ms.get_data())[:, :W // 4].copy()
        y0, y1 = int((CY - 400) / 4), int((CY + 400) / 4)
        sub = Image.fromarray(m[y0:y1]).filter(ImageFilter.GaussianBlur(7))
        mg = np.asarray(sub).astype(np.float32) / 255 * (0.55 + 0.15 * math.sin(t * 1.7))
        glow = np.zeros((y1 - y0, W // 4, 4), np.uint8)
        glow[..., 0] = (mg * 225).clip(0, 255); glow[..., 1] = (mg * 248).clip(0, 255)
        glow[..., 2] = (mg * 255).clip(0, 255); glow[..., 3] = (mg * 255).clip(0, 255)
        gsurf = cairo.ImageSurface.create_for_data(bytearray(glow.tobytes()), cairo.FORMAT_ARGB32, W // 4, y1 - y0, W)
        cr.save(); cr.translate(0, y0 * 4); cr.scale(4, 4); cr.set_source_surface(gsurf, 0, 0)
        cr.get_source().set_filter(cairo.FILTER_BILINEAR); cr.paint_with_alpha(0.75); cr.restore()
        # gentle glints at a vertex, one per beat
        for tg, vi in GLINTS:
            gp = (t - tg) / 1.4
            if 0 < gp < 1:
                a = math.sin(math.pi * gp)
                faces = gem_faces(t, gsc)
                fr = [o for o in faces if o[1][2] > 0]
                z, n, scr, k = fr[(vi * 7) % len(fr)]
                px, py = scr[0]
                rg = cairo.RadialGradient(px, py, 0, px, py, 46)
                rg.add_color_stop_rgba(0, 1, 1, 0.97, 0.9 * a); rg.add_color_stop_rgba(1, 1, 0.95, 0.85, 0)
                cr.set_source(rg); cr.arc(px, py, 46, 0, 6.283); cr.fill()
                for ang, ln in ((0, 52), (math.pi / 2, 40)):
                    lg = cairo.LinearGradient(px - ln * math.cos(ang), py - ln * math.sin(ang), px + ln * math.cos(ang), py + ln * math.sin(ang))
                    lg.add_color_stop_rgba(0, 1, 1, 1, 0); lg.add_color_stop_rgba(0.5, 1, 1, 0.98, 0.8 * a); lg.add_color_stop_rgba(1, 1, 1, 1, 0)
                    cr.set_source(lg); cr.set_line_width(1.6)
                    cr.move_to(px - ln * math.cos(ang), py - ln * math.sin(ang)); cr.line_to(px + ln * math.cos(ang), py + ln * math.sin(ang)); cr.stroke()

    # soft veil behind the text so words stay legible over washes and rays
    veil = 0.6 * ease_out((t - 0.1) / 1.0)
    rg = cairo.RadialGradient(540, 560, 60, 540, 560, 560)
    rg.add_color_stop_rgba(0, 1, 0.985, 0.96, veil); rg.add_color_stop_rgba(1, 1, 0.985, 0.96, 0)
    cr.save(); cr.translate(0, 560); cr.scale(1, 0.6); cr.translate(0, -560)
    cr.set_source(rg); cr.paint(); cr.restore()

    def put(sprite, t0, y, t_out=None):
        (s, (sw, sh)) = sprite
        p = ease_out((t - t0) / 1.0)
        if p <= 0: return
        if t_out is not None: p *= 1 - ease((t - t_out) / 0.8)
        if p <= 0: return
        cr.set_source_surface(s, (W - sw) / 2, y - sh / 2 + 18 * (1 - min(1, (t - t0)))); cr.paint_with_alpha(p)
    for sp, t0, y in SPR: put(sp, t0, y, t_out=12.1)

    p = ease_out((t - 12.8) / 1.0)
    if p > 0:
        cr.set_source_rgba(0.67, 0.48, 0.20, 0.8 * p); cr.set_line_width(1.6)
        cr.move_to(540 - 60 * p, 455); cr.line_to(540 + 60 * p, 455); cr.stroke()
    put(FROM_S, 13.1, 515)
    put(TITLE_S, 13.5, 600)

    fi = 1 - ease(t / 0.5)
    if fi > 0: cr.set_source_rgba(0.985, 0.98, 0.985, fi); cr.paint()
    surf.flush()
    return surf

if PREVIEW:
    for fn in PREVIEW: render(int(fn)).write_to_png(f"d_{int(fn):03d}.png")
    sys.exit()

proc = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgra",
                         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium",
                         "-crf", "17", "-pix_fmt", "yuv420p", "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
for f in range(NF):
    proc.stdin.write(bytes(render(f).get_data()))
    if f % 60 == 0: print("frame", f, flush=True)
proc.stdin.close(); proc.wait(); print("done")
