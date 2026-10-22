"""Truly Aariya — LinkedIn "Gold Leaf Edition" renderer (1080x1350).

Premium stationery look: deep plum velvet or heavy cotton linen paper, Cormorant display type,
and ONE gold-foil hero element per design that carries the message (lit with SVG specular
lighting so it reads as real foil). Every design carries @trulyaariya and
"A Self Repaired Soul · Book coming soon".
"""
import base64, json, math, random, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
def _f(name, mime): return f"data:{mime};base64," + base64.b64encode((ROOT / 'fonts' / name).read_bytes()).decode()
FONT = {k: _f(k, m) for k, m in [('CormorantGaramond[wght].ttf', 'font/ttf'), ('CormorantGaramond-Italic[wght].ttf', 'font/ttf'),
                                   ('Jost[wght].ttf', 'font/ttf'), ('caveat-latin-600-normal.woff2', 'font/woff2')]}

W, H = 1080, 1350
INK, CREAM, PLUM = '#3a2228', '#f4ead9', '#2b181e'
GOLD_STOPS = [(0, '#7d5518'), (.18, '#c8923a'), (.34, '#f6dd9c'), (.46, '#d8a548'), (.62, '#8f6420'), (.8, '#e8c376'), (1, '#9b6d25')]

def gold_grad(id_, x1=0, y1=0, x2=1, y2=1):
    st = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in GOLD_STOPS)
    return f'<linearGradient id="{id_}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{st}</linearGradient>'

DEFS = f'''<defs>
{gold_grad('gold')}{gold_grad('goldH', 0, 0, 1, 0)}{gold_grad('goldV', 0, 0, 0, 1)}
<filter id="foil" x="-20%" y="-20%" width="140%" height="140%">
  <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" seed="4" result="n"/>
  <feColorMatrix in="n" type="saturate" values="0" result="ng"/>
  <feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="b"/>
  <feComposite in="b" in2="ng" operator="arithmetic" k1="0" k2="1" k3=".18" k4="0" result="bump"/>
  <feSpecularLighting in="bump" surfaceScale="5" specularConstant="1.25" specularExponent="26" lighting-color="#fff4d2" result="s">
    <fePointLight x="250" y="-260" z="520"/></feSpecularLighting>
  <feComposite in="s" in2="SourceAlpha" operator="in" result="si"/>
  <feComposite in="SourceGraphic" in2="si" operator="arithmetic" k1="0" k2="1" k3=".85" k4="0" result="lit"/>
  <feDropShadow in="lit" dx="0" dy="3" stdDeviation="3" flood-color="#1a0d10" flood-opacity=".45"/>
</filter>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
<filter id="glowS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="velvet"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="2"/>
  <feColorMatrix values="0 0 0 0 1  0 0 0 0 .9  0 0 0 0 .85  0 0 0 .07 0"/></filter>
<filter id="linen"><feTurbulence type="fractalNoise" baseFrequency=".012 .9" numOctaves="2" seed="5" result="a"/>
  <feTurbulence type="fractalNoise" baseFrequency=".9 .012" numOctaves="2" seed="6" result="b"/>
  <feBlend in="a" in2="b" mode="multiply" result="c"/>
  <feDiffuseLighting in="c" surfaceScale="1.4" lighting-color="#fff" result="d"><feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting>
  <feColorMatrix in="d" values="0 0 0 0 .45  0 0 0 0 .36  0 0 0 0 .3  -1 0 0 0 1" /></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="9"/>
  <feColorMatrix values="0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .2  0 0 0 .09 0"/></filter>
</defs>'''

PASTEL = {'blush': '#f2ddd6', 'rose': '#ecd6d6', 'cream': '#f4ece0', 'sage': '#e1e5d7', 'lilac': '#e8dfe7', 'peach': '#f5e3d4', 'butter': '#f4ead2'}

def velvet(seed=0, light=(0.32, 0.22), tint='blush'):
    """Pastel textured paper (kept the old name so designs still call it)."""
    lx, ly = light
    c = PASTEL.get(tint, tint)
    return (f'<rect width="{W}" height="{H}" fill="{c}"/>'
            f'<radialGradient id="vl{seed}" cx="{lx}" cy="{ly}" r="1"><stop offset="0" stop-color="#fffaf2" stop-opacity=".85"/><stop offset=".55" stop-color="#fffaf2" stop-opacity=".15"/><stop offset="1" stop-color="#9b7a6e" stop-opacity=".18"/></radialGradient>'
            f'<rect width="{W}" height="{H}" filter="url(#linen)" opacity=".45"/><rect width="{W}" height="{H}" fill="url(#vl{seed})"/><rect width="{W}" height="{H}" filter="url(#grain)"/>')

def linen(tint='#efe4d2'):
    return (f'<rect width="{W}" height="{H}" fill="{tint}"/>'
            f'<radialGradient id="ll" cx=".35" cy=".2" r="1"><stop offset="0" stop-color="#fffaf0" stop-opacity=".9"/><stop offset=".6" stop-color="#fffaf0" stop-opacity="0"/><stop offset="1" stop-color="#8a6a52" stop-opacity=".22"/></radialGradient>'
            f'<rect width="{W}" height="{H}" filter="url(#linen)" opacity=".55"/><rect width="{W}" height="{H}" fill="url(#ll)"/><rect width="{W}" height="{H}" filter="url(#grain)"/>')

def flecks(seed, n, box, size=(3, 9), op=(.5, 1)):
    r = random.Random(seed); x0, y0, x1, y1 = box; s = ''
    for _ in range(n):
        x, y, k = r.uniform(x0, x1), r.uniform(y0, y1), r.uniform(*size)
        pts = ' '.join(f'{x + k*math.cos(a)*r.uniform(.4,1):.1f},{y + k*math.sin(a)*r.uniform(.4,1):.1f}' for a in [i * 2.1 + r.uniform(0, .6) for i in range(3)])
        s += f'<polygon points="{pts}" fill="url(#gold)" opacity="{r.uniform(*op):.2f}"/>'
    return s

def crack_shape(pts, width, seed, taper=True):
    """A tapered gold seam: polygon built from a polyline with varying width."""
    r = random.Random(seed); L, R = [], []
    n = len(pts)
    for i, (x, y) in enumerate(pts):
        (xa, ya), (xb, yb) = pts[max(0, i-1)], pts[min(n-1, i+1)]
        dx, dy = xb - xa, yb - ya; l = math.hypot(dx, dy) or 1
        nx, ny = -dy / l, dx / l
        w = width * (math.sin(math.pi * i / (n - 1)) * .75 + .25 if taper else 1) * r.uniform(.7, 1.25)
        L.append((x + nx * w / 2, y + ny * w / 2)); R.append((x - nx * w / 2, y - ny * w / 2))
    poly = L + R[::-1]
    return 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in poly) + ' Z'

def jag(p0, p1, steps, amp, seed):
    r = random.Random(seed); out = []
    for i in range(steps + 1):
        t = i / steps
        x = p0[0] + (p1[0] - p0[0]) * t + (r.uniform(-amp, amp) if 0 < i < steps else 0)
        y = p0[1] + (p1[1] - p0[1]) * t + (r.uniform(-amp * .3, amp * .3) if 0 < i < steps else 0)
        out.append((x, y))
    return out

CSS = f'''
@font-face{{font-family:"Cormorant Garamond";src:url("{FONT['CormorantGaramond[wght].ttf']}");font-weight:300 700}}
@font-face{{font-family:"Cormorant Garamond";font-style:italic;src:url("{FONT['CormorantGaramond-Italic[wght].ttf']}");font-weight:300 700}}
@font-face{{font-family:"Jost";src:url("{FONT['Jost[wght].ttf']}");font-weight:100 900}}
@font-face{{font-family:"Caveat";src:url("{FONT['caveat-latin-600-normal.woff2']}")}}
*{{box-sizing:border-box}} body{{margin:0}}
.c{{position:relative;width:{W}px;height:{H}px;overflow:hidden;font-family:"Cormorant Garamond",serif}}
.c>svg{{position:absolute;inset:0;width:{W}px;height:{H}px}}
.t{{position:absolute;z-index:5;text-wrap:balance}}
.cap{{font-family:Jost;font-weight:500;letter-spacing:.32em;text-transform:uppercase}}
.gold{{background:linear-gradient(104deg,#8a5f1c 0%,#d6a24c 20%,#fbe6a8 36%,#d9a649 50%,#946821 66%,#efcd85 84%,#a4762a 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 2px 1.5px rgba(26,13,16,.45))}}
.gold.flat{{filter:none}}
.lite .gold{{background:linear-gradient(104deg,#6b4512 0%,#a8792c 24%,#d6a856 40%,#9a6b22 58%,#7a5216 76%,#b98a3a 100%);-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 1px 0 rgba(255,250,235,.8))}}
.frame{{position:absolute;inset:40px;border:1.5px solid transparent;z-index:6;pointer-events:none;
  border-image:linear-gradient(135deg,#9b6d25,#f2d590 30%,#a8792c 55%,#e8c376 80%,#8a5f1c) 1;opacity:.75}}
.foot{{position:absolute;left:84px;right:84px;bottom:78px;z-index:6;display:flex;justify-content:space-between;align-items:center;font-family:Jost;font-size:19px;letter-spacing:.26em}}
.foot .dot{{display:inline-block;width:7px;height:7px;transform:rotate(45deg);margin:0 14px 2px;vertical-align:middle}}
.head{{position:absolute;left:84px;right:84px;top:82px;z-index:6;display:flex;justify-content:space-between;font-family:Jost;font-size:18px;letter-spacing:.3em}}
'''

def page(svg_inner, html, dark, head_l='', head_r=''):
    fg = CREAM if dark else INK
    sub = 'rgba(244,234,217,.78)' if dark else 'rgba(58,34,40,.72)'
    dot_bg = 'linear-gradient(135deg,#f2d590,#a8792c)'
    return f'''<div class="c{"" if dark else " lite"}" style="color:{fg}">
<svg viewBox="0 0 {W} {H}">{DEFS}{svg_inner}</svg>
<div class="frame"></div>
<div class="head" style="color:{sub}"><span>{head_l}</span><span>{head_r}</span></div>
{html}
<div class="foot" style="color:{fg}"><span><b style="font-weight:600">A SELF REPAIRED SOUL</b><span class="dot" style="background:{dot_bg}"></span>BOOK COMING SOON</span><span class="gold flat" style="font-weight:600;letter-spacing:.14em">@trulyaariya</span></div>
</div>'''

def T(x, y, w, inner, style=''):
    return f'<div class="t" style="left:{x}px;top:{y}px;width:{w}px;{style}">{inner}</div>'

# ======================= designs =======================
def announcement():
    # kintsugi: the velvet plane splits along a lit gold seam
    main = jag((760, -20), (690, 1370), 16, 70, 11)
    seam = crack_shape(main, 14, 3)
    br1 = crack_shape(jag((main[5][0], main[5][1]), (1100, 360), 6, 30, 4), 7, 5)
    br2 = crack_shape(jag((main[10][0], main[10][1]), (520, 980), 6, 30, 6), 6, 7)
    br3 = crack_shape(jag((main[3][0], main[3][1]), (560, 120), 5, 22, 8), 4, 9)
    glow = f'<g filter="url(#glow)" opacity=".55"><path d="{seam}" fill="#f2c56a" transform="translate(0 0) scale(1)"/><path d="{seam}" fill="#f2c56a" stroke="#f2c56a" stroke-width="24"/><path d="{br1}" fill="#f2c56a" stroke="#f2c56a" stroke-width="12"/></g>'
    beam = (f'<radialGradient id="bl" cx=".66" cy=".42" r=".55"><stop offset="0" stop-color="#f6d58e" stop-opacity=".22"/><stop offset="1" stop-color="#f6d58e" stop-opacity="0"/></radialGradient>'
            f'<rect width="{W}" height="{H}" fill="url(#bl)"/>')
    gold = f'<g filter="url(#foil)"><path d="{seam}" fill="url(#gold)"/><path d="{br1}" fill="url(#gold)"/><path d="{br2}" fill="url(#gold)"/><path d="{br3}" fill="url(#gold)"/></g>'
    svg_ = velvet(1, (.62, .4), 'blush') + beam + glow + gold + flecks(21, 60, (560, 120, 980, 1200), (2, 6), (.35, .9))
    html = (T(84, 200, 640, '<div class="cap gold" style="font-size:22px">An announcement</div>') +
            T(84, 262, 640, '<div style="font-size:58px;font-style:italic;font-weight:400;line-height:1.1">Two years of writing.<br>One book.</div>') +
            T(80, 470, 660, '<div class="gold" style="font-size:168px;line-height:.88;font-weight:500;letter-spacing:-.01em">A Self<br>Repaired<br>Soul</div>') +
            T(88, 980, 620, '<div style="font-size:60px;font-style:italic;font-weight:400">Journey That Heals</div>') +
            T(88, 1090, 640, '<div class="cap" style="font-size:26px;color:#f4ead9;line-height:1.7">Publishing soon<br><span class="gold flat" style="font-size:20px">A debut by Aariya Sharma</span></div>'))
    return page(svg_, html, False, 'TRULY AARIYA', 'MY DEBUT BOOK')

def midnight():
    # gold fountain-pen nib, ink line becomes the gold underline under "midnight"
    nib = ('M0 -330 C 70 -250, 112 -120, 96 30 L 60 150 L 0 250 L -60 150 L -96 30 C -112 -120, -70 -250, 0 -330 Z')
    slit = 'M0 -40 L0 250'
    hole = 'M0 -70 C 18 -70 22 -40 0 -18 C -22 -40 -18 -70 0 -70 Z'
    g = (f'<g transform="translate(840 560) rotate(38) scale(.92)">'
         f'<g filter="url(#glow)" opacity=".55"><path d="{nib}" fill="#f2c56a"/></g>'
         f'<g filter="url(#foil)"><path d="{nib}" fill="url(#gold)"/></g>'
         f'<path d="M -80 -160 C -40 -150, 40 -150, 80 -160" stroke="#7d5518" stroke-width="3" fill="none" opacity=".7"/>'
         f'<path d="M -88 -60 C -40 -48, 40 -48, 88 -60" stroke="#7d5518" stroke-width="2" fill="none" opacity=".5"/>'
         f'<path d="{slit}" stroke="#3b2410" stroke-width="5"/><path d="{hole}" fill="#5a3d45"/></g>')
    trail = crack_shape([(700, 790), (600, 880), (440, 905), (260, 908), (88, 910)], 8, 13, taper=False)
    t = f'<g filter="url(#foil)"><path d="{trail}" fill="url(#goldH)"/></g>'
    svg_ = velvet(2, (.72, .45), 'lilac') + g + t + flecks(31, 26, (560, 380, 1000, 900), (2, 5), (.3, .8))
    html = (T(84, 220, 900, '<div class="cap gold" style="font-size:22px">Notes from a debut author</div>') +
            T(84, 290, 700, '<div style="font-size:96px;line-height:1;font-weight:400">Most of this book was written</div>') +
            T(84, 600, 700, '<div class="gold" style="font-size:150px;font-style:italic;line-height:1;font-weight:500">after midnight.</div>') +
            T(88, 960, 640, '<div style="font-size:40px;font-style:italic;opacity:.85">Two years of late nights,<br>one gold line at a time.</div>'))
    return page(svg_, html, False, 'NO. 03', 'THE WRITING HOURS')

def healing_word():
    # a strip of hand-laid gold leaf where the answer goes
    r = random.Random(7)
    top = [(84 + i * 30, 900 + r.uniform(-7, 7)) for i in range(31)]
    bot = [(84 + i * 30, 1010 + r.uniform(-9, 9)) for i in range(31)][::-1]
    leaf = 'M' + ' L'.join(f'{x:.0f} {y:.0f}' for x, y in top + bot) + ' Z'
    creases = ''.join(f'<path d="M{r.uniform(100,980):.0f} {r.uniform(900,1010):.0f} l{r.uniform(-60,60):.0f} {r.uniform(-30,30):.0f}" stroke="#7d5518" stroke-width="1.4" opacity=".55"/>' for _ in range(40))
    loose = flecks(41, 34, (90, 860, 990, 1050), (4, 14), (.6, 1))
    svg_ = linen() + f'<g filter="url(#glowS)" opacity=".35"><path d="{leaf}" fill="#c8923a"/></g><g filter="url(#foil)"><path d="{leaf}" fill="url(#goldH)"/>{loose}</g>' + creases
    html = (T(84, 220, 900, '<div class="cap" style="font-size:22px;color:#8a6a3a">One word · No explanation</div>') +
            T(80, 300, 920, '<div style="font-size:178px;line-height:.9;font-weight:400;letter-spacing:-.015em">Healing<br><i style="font-weight:400">feels like</i></div>') +
            T(88, 720, 900, '<div style="font-size:40px;font-style:italic;color:#6b4f50">Fill the gold in the comments.</div>') +
            T(150, 920, 800, '<div style="font-family:Caveat;font-size:66px;color:#4a2a12;opacity:.0">.</div>'))
    return page(svg_, html, False, "I'LL GO FIRST", 'NO. 02')

def rest_hourglass():
    # metallic gold hourglass lying on its side, sand stilled
    cx, cy = 540, 900
    frame_ = (f'<g transform="translate({cx} {cy}) rotate(90)">'
              f'<g filter="url(#foil)"><rect x="-200" y="-300" width="400" height="34" rx="8" fill="url(#goldH)"/>'
              f'<rect x="-200" y="266" width="400" height="34" rx="8" fill="url(#goldH)"/>'
              f'<rect x="-186" y="-266" width="16" height="532" fill="url(#goldV)"/><rect x="170" y="-266" width="16" height="532" fill="url(#goldV)"/></g>'
              f'<path d="M-150 -262 C -150 -110, -24 -60, -16 0 C -24 60, -150 110, -150 262 L 150 262 C 150 110, 24 60, 16 0 C 24 -60, 150 -110, 150 -262 Z" fill="#fff8ec" fill-opacity=".28" stroke="#fff8ec" stroke-opacity=".75" stroke-width="3"/>'
              f'<path d="M-118 -200 C -110 -120, -40 -70, -20 -30" stroke="#fff" stroke-opacity=".7" stroke-width="5" fill="none" stroke-linecap="round"/>'
              f'</g>')
    glass = 'M-150 -262 C -150 -110, -24 -60, -16 0 C -24 60, -150 110, -150 262 L 150 262 C 150 110, 24 60, 16 0 C 24 -60, 150 -110, 150 -262 Z'
    sand_top = (f'<clipPath id="gl"><path d="{glass}" transform="translate({cx} {cy}) rotate(90)"/></clipPath>'
                f'<g clip-path="url(#gl)" filter="url(#foil)"><path d="M{cx-300} {cy+160} L {cx-300} {cy+60} C {cx-200} {cy+70}, {cx-60} {cy+110}, {cx-10} {cy+160} Z" fill="url(#gold)"/>')
    sand_bot = f'<path d="M{cx+10} {cy+160} C {cx+60} {cy+40}, {cx+200} {cy+10}, {cx+300} {cy+0} L {cx+300} {cy+160} Z" fill="url(#gold)"/></g>'
    shadow = f'<ellipse cx="{cx}" cy="{cy+205}" rx="330" ry="22" fill="#5a3d30" opacity=".25" filter="url(#glowS)"/>'
    svg_ = linen('#ece2d1') + shadow + frame_ + sand_top + sand_bot
    html = (T(84, 220, 900, '<div class="cap" style="font-size:22px;color:#8a6a3a">Everyone says: rest when you\'re done</div>') +
            T(80, 290, 940, '<div style="font-size:112px;line-height:.98;font-weight:400">Nobody says</div>') +
            T(80, 400, 960, '<div class="gold" style="font-size:104px;line-height:.98;font-style:italic;font-weight:500">rest before<br>you\'re empty.</div>'))
    return page(svg_, html, False, 'THE 9-TO-5 EDITION', 'NO. 04')

DESIGNS = {'announcement': announcement, 'midnight': midnight, 'healing-word': healing_word, 'rest-hourglass': rest_hourglass}

def render(names, out_dir, scale=1):
    from playwright.sync_api import sync_playwright
    out = Path(out_dir); out.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=scale)
        for n in names:
            pg.set_content(f'<meta charset="utf-8"><style>{CSS}</style>{DESIGNS[n]()}', wait_until='load')
            pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(150)
            pg.screenshot(path=str(out / f'{n}.jpg'), type='jpeg', quality=93)
            print('ok', n)
        b.close()

if __name__ == '__main__':
    render(sys.argv[2:] or list(DESIGNS), sys.argv[1] if len(sys.argv) > 1 else ROOT / 'luxe')
