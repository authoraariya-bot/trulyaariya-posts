"""Shared base for luxe designs. Truly Aariya — LinkedIn "Gold Leaf Edition" renderer (1080x1350).

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
    <fePointLight class="fl" x="250" y="-260" z="520"/></feSpecularLighting>
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

OFFWHITE = '#f6f0e6'
PASTEL = {k: OFFWHITE for k in ('blush', 'rose', 'cream', 'sage', 'lilac', 'peach', 'butter')}

def ambient(seed=0):
    """Living background: flowing gold silk ribbons + drifting gold dust (animated by JS in goldleaf.BASE_JS)."""
    r = random.Random(seed + 500)
    ribs = ''
    for k, (y0, amp, f, sp, w, op) in enumerate([(1090, 34, .0042, .55, 70, .10), (1135, 26, .0055, -.42, 44, .13), (1175, 22, .0068, .7, 30, .16), (150, 18, .005, .35, 26, .06)]):
        ribs += (f'<path class="rib" data-y="{y0}" data-a="{amp}" data-f="{f}" data-s="{sp}" data-w="{w}" data-ph="{r.uniform(0, 6):.2f}" fill="url(#goldH)" opacity="{op}"/>'
                 f'<path class="ribe" data-k="{k}" stroke="url(#goldH)" stroke-width="1.3" fill="none" opacity="{op*3:.2f}"/>')
    dust = ''
    for i in range(38):
        x, y, k = r.uniform(60, 1020), r.uniform(120, 1250), r.uniform(1.5, 4.2)
        dust += (f'<path class="dust" data-x="{x:.0f}" data-y="{y:.0f}" data-s="{r.uniform(6, 22):.1f}" data-p="{r.uniform(0, 6):.2f}" '
                 f'd="M0 {-k:.1f} L{k*.7:.1f} 0 L0 {k:.1f} L{-k*.7:.1f} 0 Z" fill="url(#gold)"/>')
    return f'<g class="amb" filter="url(#glowS)" opacity=".9">{ribs}</g><g class="amb">{dust}</g>'

PASTEL_DEF = None

def velvet(seed=0, light=(0.32, 0.22), tint='blush'):
    """Cream off-white textured paper with the living gold background."""
    lx, ly = light
    c = PASTEL.get(tint, tint)
    return (f'<rect width="{W}" height="{H}" fill="{c}"/>'
            f'<radialGradient id="vl{seed}" cx="{lx}" cy="{ly}" r="1"><stop offset="0" stop-color="#fffaf2" stop-opacity=".85"/><stop offset=".55" stop-color="#fffaf2" stop-opacity=".15"/><stop offset="1" stop-color="#9b7a6e" stop-opacity=".18"/></radialGradient>'
            f'<rect width="{W}" height="{H}" filter="url(#linen)" opacity=".45"/><rect width="{W}" height="{H}" fill="url(#vl{seed})"/><rect width="{W}" height="{H}" filter="url(#grain)"/>'
            + ambient(seed))

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

