"""Render LinkedIn preview visuals (1080x1350) for every day in linkedin/calendar.json.

Look: "The Manuscript Edition" — editorial, left-aligned, running header + folio,
gold handwritten margin notes, plum full-bleed days. Every visual carries
@trulyaariya and "A Self Repaired Soul · Book coming soon".

Usage: python3 previews.py [out_dir]   (needs playwright + chromium)
"""
import json, os, random, sys, math, html
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]          # linkedin/
import base64
def _f(name, mime):
    return f"data:{mime};base64," + base64.b64encode((ROOT / 'fonts' / name).read_bytes()).decode()
FONT_URI = {k: _f(k, m) for k, m in [('CormorantGaramond[wght].ttf','font/ttf'),('CormorantGaramond-Italic[wght].ttf','font/ttf'),('Jost[wght].ttf','font/ttf'),('caveat-latin-600-normal.woff2','font/woff2')]}
CAL = json.loads((ROOT / 'calendar.json').read_text())
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'previews'
OUT.mkdir(parents=True, exist_ok=True)

C = dict(cream='#f3ece2', paper='#ebe2d4', rose='#d9bdb7', mauve='#b98f97', plum='#5a3d45',
         plumdeep='#3f2830', ink='#5a3d45', gold='#a8792c', goldlite='#d1a65a', sage='#b9c4ae',
         butter='#efdcae', blush='#ecc9c3', grey='#b7aeb0')

def esc(s): return html.escape(s)

# ---------- shared pieces ----------
def grain(seed, dark=False, fibres=60):
    r = random.Random(seed)
    col = '#f5ead8' if dark else '#7a5c52'
    fib = ''.join(
        f'<path d="M{x:.0f} {y:.0f} q{r.uniform(-9,9):.1f} {r.uniform(-9,9):.1f} {r.uniform(-22,22):.1f} {r.uniform(-14,14):.1f}" '
        f'stroke="{col}" stroke-opacity="{r.uniform(.08,.2):.2f}" stroke-width="1.2" fill="none"/>'
        for x, y in ((r.uniform(0,1080), r.uniform(0,1350)) for _ in range(fibres)))
    return f'''<svg class="grain" viewBox="0 0 1080 1350"><filter id="g{seed}"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="{seed}"/>
<feColorMatrix values="0 0 0 0 {'1' if dark else '0.35'}  0 0 0 0 {'0.95' if dark else '0.27'}  0 0 0 0 {'0.9' if dark else '0.24'}  0 0 0 .5 0"/></filter>
<rect width="1080" height="1350" filter="url(#g{seed})" opacity="{'.10' if dark else '.16'}"/>{fib}</svg>'''

def frame(d, n, theme, body, light='', header_right=None):
    dark = theme in ('plum', 'plumdeep')
    fg = C['cream'] if dark else C['ink']
    bg = C[theme]
    no = header_right or f"No. {n:02d}"
    return f'''<div class="c" style="background:{bg};color:{fg}">
<div class="light" style="{light or ('background:radial-gradient(70% 55% at 30% 18%, rgba(255,250,240,.55), transparent 70%)' if not dark else 'background:radial-gradient(60% 45% at 75% 30%, rgba(209,166,90,.18), transparent 70%)')}"></div>
{grain(n*7+3, dark)}
<div class="hdr"><span>{esc(d['series'].upper())}</span><span>{no}</span></div>
{body}
<div class="ftr" style="border-color:{'rgba(243,236,226,.35)' if dark else 'rgba(90,61,69,.28)'}"><span><b>A SELF REPAIRED SOUL</b> &nbsp;·&nbsp; BOOK COMING SOON</span><span>@trulyaariya</span></div>
</div>'''

def crack(d_path, w=4):
    return (f'<path d="{d_path}" stroke="{C["goldlite"]}" stroke-width="{w*3}" opacity=".25" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{d_path}" stroke="{C["gold"]}" stroke-width="{w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')

def note(text, x, y, size=58, rot=-4, color=None):
    return f'<div class="note" style="left:{x}px;top:{y}px;font-size:{size}px;transform:rotate({rot}deg);color:{color or C["gold"]}">{esc(text)}</div>'

def h(text, x, y, size=96, w=860, color=None, italic=False, weight=500, lh=1.02, extra=''):
    return (f'<div class="h" style="left:{x}px;top:{y}px;width:{w}px;font-size:{size}px;line-height:{lh};font-weight:{weight};'
            f'{"font-style:italic;" if italic else ""}{"color:"+color+";" if color else ""}{extra}">{text}</div>')

def label(text, x, y, color=None, size=21, extra=''):
    return f'<div class="lbl" style="left:{x}px;top:{y}px;font-size:{size}px;{"color:"+color+";" if color else ""}{extra}">{esc(text)}</div>'

def swipe(n, dark=False):
    col = C['cream'] if dark else C['ink']
    return label(f'1 / {n}   SWIPE  →', 760, 1180, col, 20)

def svg(inner, x=0, y=0, w=1080, hgt=1350, vb=None):
    return f'<svg class="art" style="left:{x}px;top:{y}px;width:{w}px;height:{hgt}px" viewBox="{vb or f"0 0 {w} {hgt}"}">{inner}</svg>'

def hand_path(points, r, j=3):
    pts = [(x + r.uniform(-j, j), y + r.uniform(-j, j)) for x, y in points]
    return 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)

# ---------- 27 layouts ----------
def manuscript_page(d, n):
    r = random.Random(1)
    tallies = ''
    for row in range(14):
        for g in range(5):
            x0, y0 = 92 + g * 118, 690 + row * 30
            if row * 5 + g > 62: break
            for k in range(4):
                tallies += f'<path d="M{x0+k*16+r.uniform(-2,2):.1f} {y0} l{r.uniform(-3,3):.1f} 26" stroke="{C["ink"]}" stroke-opacity="{.25+.5*(row/14):.2f}" stroke-width="2.4" stroke-linecap="round"/>'
            tallies += f'<path d="M{x0-6} {y0+22} L{x0+60} {y0+4}" stroke="{C["ink"]}" stroke-opacity="{.25+.5*(row/14):.2f}" stroke-width="2.4" stroke-linecap="round"/>'
    art = svg(tallies + crack('M960 150 L930 330 L982 470 L940 640 L990 820 L950 1000 L980 1150'))
    return frame(d, n, 'cream', art +
        label('TWO YEARS AGO, THIS PAGE WAS BLANK.', 92, 200, C['ink']) +
        h('I wrote<br>a book.<span class="cursor"></span>', 88, 250, 168, 700, weight=500) +
        note('730 evenings, give or take', 560, 1150, 46, -3))

def questionnaire(d, n):
    rows = [('IF IT WERE A SONG', 'your 1 a.m. playlist'), ('A SEASON', 'the first cool morning after summer'),
            ('A PLACE', 'the warm corner of your bed'), ('A PERSON', None)]
    y, body = 560, ''
    for i, (q, a) in enumerate(rows):
        body += f'<div class="rule" style="top:{y-28}px"></div>' + label(q, 92, y, C['ink'], 19)
        if a: body += h(esc(a), 92, y + 34, 50, 900, italic=True, weight=500)
        else: body += '<div class="note" style="left:88px;top:'+str(y+30)+'px;font-size:54px;white-space:normal;width:880px;line-height:1.05;color:#a8792c">the friend who stays on the call till you fall asleep</div>'
        y += 150
    return frame(d, n, 'cream', label('FOUR QUESTIONS ABOUT MY BOOK', 92, 200) +
        h('The<br>Questionnaire', 88, 238, 120, 900) + body + f'<div class="rule" style="top:{y-28}px"></div>')

def planner_staff(d, n):
    days = ['MON', 'TUE', 'WED', 'THU', 'FRI']
    s = ''
    for i, dname in enumerate(days):
        x = 92 + i * 184
        s += f'<text x="{x+10}" y="640" font-family="Jost" font-size="20" letter-spacing="4" fill="{C["ink"]}" opacity=".7">{dname}</text>'
        s += f'<line x1="{x}" y1="610" x2="{x}" y2="1080" stroke="{C["ink"]}" stroke-opacity=".18"/>'
    for k in range(5):
        y = 760 + k * 26
        s += f'<path d="M92 {y} C 400 {y-30}, 640 {y+40}, 1000 {y-10}" stroke="{C["ink"]}" stroke-opacity=".5" stroke-width="1.6" fill="none"/>'
    r = random.Random(4)
    for i in range(14):
        x = 120 + i * 62
        fri = x > 830
        y = 770 + r.uniform(-10, 90) + (0 if not (300 < x < 700) else r.uniform(-30, 30))
        col = C['gold'] if fri else C['ink']
        s += f'<path d="M{x} {y} l14 -10 l14 10 l-14 10 z" fill="{col}"/><line x1="{x+28}" y1="{y}" x2="{x+28}" y2="{y-70}" stroke="{col}" stroke-width="2.4"/>'
    return frame(d, n, 'paper', svg(s) +
        h('The song you play in the parking lot before work', 88, 200, 92, 900) +
        note('counts as healing too.', 420, 1110, 64, -4))

def five_year_plan(d, n):
    r = random.Random(5)
    s = '<g transform="rotate(-3 540 760)">'
    s += f'<rect x="150" y="430" width="780" height="700" fill="#fbf7f0" stroke="{C["ink"]}" stroke-opacity=".12"/>'
    for k in range(12):
        s += f'<line x1="150" y1="{520+k*50}" x2="930" y2="{520+k*50}" stroke="#b9c4d6" stroke-opacity=".7"/>'
    s += f'<line x1="230" y1="430" x2="230" y2="1130" stroke="#d9a3a3" stroke-opacity=".8"/>'
    s += f'<text x="260" y="500" font-family="Cormorant Garamond" font-style="italic" font-size="44" fill="{C["ink"]}">My five-year plan</text>'
    for k in range(6):
        y = 560 + k * 50
        s += f'<path d="{hand_path([(260,y),(300+r.uniform(150,380),y)], r, 2)}" stroke="{C["ink"]}" stroke-opacity=".45" stroke-width="5" stroke-linecap="round"/>'
        s += f'<path d="M{190} {y-8} l10 12 l20 -26" stroke="{C["ink"]}" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
    s += f'<path d="M{190} {910} l10 12 l20 -26" stroke="{C["gold"]}" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
    s += '</g>'
    return frame(d, n, 'cream', svg(s) +
        h('Writing a book was not in my five-year plan.', 88, 190, 84, 900) +
        note('Write a book.', 300, 860, 78, -5) + swipe(5))

def folio_flip(d, n):
    s = ''
    for i, (dx, rot, lab) in enumerate([(-40, -7, 'DAY 1'), (10, -2, 'DAY 300'), (60, 3, 'DAY 730')]):
        s += f'<g transform="rotate({rot} 540 900)"><rect x="{250+dx}" y="560" width="560" height="660" fill="#fbf6ee" stroke="{C["ink"]}" stroke-opacity=".14"/>'
        s += f'<text x="{280+dx}" y="1190" font-family="Jost" font-size="20" letter-spacing="5" fill="{C["ink"]}" opacity=".6">{lab}</text></g>'
    leaf = 'M560 1010 C 470 940, 470 760, 610 690 C 690 790, 680 950, 560 1010 Z'
    s += f'<g transform="rotate(3 540 900)"><path d="{leaf}" fill="{C["blush"]}" stroke="{C["mauve"]}" stroke-width="2"/>'
    s += f'<path d="M560 1010 C 580 900, 590 800, 610 690" stroke="{C["gold"]}" stroke-width="2.5" fill="none"/>'
    for t in range(5):
        y = 960 - t * 55
        s += f'<path d="M{568+t*6} {y} q 30 -20 50 -40" stroke="{C["gold"]}" stroke-width="1.6" fill="none"/><path d="M{568+t*6} {y} q -30 -15 -48 -38" stroke="{C["gold"]}" stroke-width="1.6" fill="none"/>'
    s += '</g>'
    return frame(d, n, 'paper', svg(s) +
        h("I'm not the person who opened the first blank page.", 88, 190, 82, 900) +
        note('two years later', 760, 520, 50, -8))

def plum_night(d, n):
    r = random.Random(6)
    rain = ''.join(f'<line x1="{x:.0f}" y1="{y:.0f}" x2="{x-6:.0f}" y2="{y+34:.0f}" stroke="{C["cream"]}" stroke-opacity=".28" stroke-width="1.4"/>'
                   for x, y in ((r.uniform(620, 960), r.uniform(330, 840)) for _ in range(70)))
    s = (f'<rect x="600" y="300" width="380" height="580" fill="#2f1d24" stroke="{C["goldlite"]}" stroke-opacity=".5" stroke-width="3"/>'
         f'<line x1="790" y1="300" x2="790" y2="880" stroke="{C["goldlite"]}" stroke-opacity=".5" stroke-width="3"/>'
         f'<line x1="600" y1="590" x2="980" y2="590" stroke="{C["goldlite"]}" stroke-opacity=".5" stroke-width="3"/>' + rain +
         f'<defs><linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{C["goldlite"]}" stop-opacity=".55"/><stop offset="1" stop-color="{C["goldlite"]}" stop-opacity="0"/></linearGradient></defs>'
         f'<path d="M260 760 L180 1120 L640 1120 L380 760 Z" fill="url(#cone)"/>'
         f'<path d="M250 700 L390 700 L420 770 L220 770 Z" fill="{C["gold"]}"/><line x1="320" y1="700" x2="320" y2="560" stroke="{C["goldlite"]}" stroke-width="5"/><line x1="320" y1="560" x2="140" y2="560" stroke="{C["goldlite"]}" stroke-width="5"/><line x1="140" y1="560" x2="140" y2="1130" stroke="{C["goldlite"]}" stroke-width="5"/>')
    for k in range(9):
        s += f'<rect x="{230+r.uniform(-8,8):.0f}" y="{1120-k*12}" width="360" height="10" fill="#f3ece2" fill-opacity="{.75-k*.04:.2f}" transform="rotate({r.uniform(-1.5,1.5):.1f} 410 {1120-k*12})"/>'
    s += f'<rect x="80" y="1140" width="920" height="6" fill="{C["goldlite"]}" opacity=".5"/>'
    return frame(d, n, 'plum', svg(s) + h('Most of this book was written after midnight.', 88, 190, 84, 500, color=C['cream']) +
                 note('2:07 a.m., again', 640, 925, 46, -4, C['goldlite']))

def sorry_notes(d, n):
    r = random.Random(7)
    notes = ''
    texts = ['sorry,', 'sorry!', 'so sorry', 'sorry :(', 'sorry,', 'sorry...', 'sorry again', 'sorry', 'sorry,']
    cols = [C['butter'], C['blush'], C['sage'], '#f3e6d0']
    for i, t in enumerate(texts):
        x, y, rot = 140 + (i % 3) * 270 + r.uniform(-30, 30), 560 + (i // 3) * 190 + r.uniform(-20, 20), r.uniform(-12, 12)
        notes += (f'<div class="sticky" style="left:{x:.0f}px;top:{y:.0f}px;background:{cols[i%4]};transform:rotate({rot:.1f}deg)">'
                  f'<span>{esc(t)}</span></div>')
    s = f'<path d="M120 1150 L960 1150 L1010 1190 L70 1190 Z" fill="none" stroke="{C["ink"]}" stroke-width="3"/><rect x="180" y="1060" width="720" height="90" fill="none" stroke="{C["ink"]}" stroke-opacity=".5" stroke-width="2"/>'
    return frame(d, n, 'rose', svg(s) + notes +
        h('Your feelings were never an inconvenience.', 88, 190, 88, 900))

def letter(d, n):
    body = ('<div class="sheet" style="left:150px;top:260px;width:760px;height:860px;transform:rotate(-2.5deg)">'
            '<p style="font-size:30px;letter-spacing:.18em;font-family:Jost;font-weight:400;margin:0 0 70px">DEAR READER,</p>'
            '<p style="font-size:70px;line-height:1.08;margin:0">When you reach the last page, I hope you go a little <i>easier</i> on yourself.</p>'
            '</div>')
    s = (f'<g transform="rotate(14 880 300)"><path d="M880 360 C 820 300, 840 210, 900 170 C 950 230, 940 320, 880 360 Z" fill="{C["sage"]}" stroke="#8d9a83" stroke-width="2"/>'
         f'<path d="M880 360 C 890 300, 895 230, 900 170" stroke="#8d9a83" stroke-width="2" fill="none"/></g>')
    return frame(d, n, 'rose', body + svg(s) + note('Aariya', 640, 960, 84, -6))

def knot_ribbon(d, n):
    r = random.Random(9)
    pts = []
    cx, cy = 300, 820
    for t in range(260):
        a = t * .31
        rad = 60 + 70 * math.sin(t * .07) + r.uniform(-12, 12)
        pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a) * .9))
    knot = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
    s = f'<path d="{knot}" stroke="#8f8588" stroke-width="2.2" fill="none" opacity=".85"/>'
    s += f'<path d="M{pts[-1][0]:.0f} {pts[-1][1]:.0f} C 520 860, 560 980, 980 980" stroke="{C["gold"]}" stroke-width="6" fill="none" stroke-linecap="round"/>'
    for i, (t, x, y) in enumerate([('can you just…', 110, 640), ('one more favour', 360, 690), ('quick call?', 150, 960)]):
        s += f'<g transform="rotate({[-8,6,-4][i]} {x} {y})"><rect x="{x}" y="{y}" width="{len(t)*15+40}" height="48" fill="#f7f1e8" stroke="#8f8588"/><text x="{x+20}" y="{y+32}" font-family="Jost" font-size="22" fill="#6f6467">{esc(t)}</text></g>'
    return frame(d, n, 'cream', svg(s) + h("A no doesn't need three paragraphs.", 88, 190, 88, 900) +
                 note("you're allowed to choose you.", 400, 1050, 56, -3))

def strike_list(d, n):
    s = crack('M92 885 L560 870 L610 892 L990 878', 5)
    return frame(d, n, 'cream', label('A LIST', 92, 200) +
        h('5 things my book<br><i>won\'t</i> tell you', 88, 240, 118, 920) +
        h('Just be positive.', 92, 820, 104, 920, color=C['mauve'], italic=True) + svg(s) +
        note('it sits with you instead.', 520, 1010, 54, -3) + swipe(6))

def split_then_now(d, n):
    def phone(x, y, calm):
        s = f'<rect x="{x}" y="{y}" width="210" height="360" rx="26" fill="#fbf7f1" stroke="{C["ink"]}" stroke-width="3"/>'
        s += f'<rect x="{x+28}" y="{y+70}" width="140" height="56" rx="14" fill="{C["blush"] if calm else "#ddd6d6"}"/>'
        s += f'<text x="{x+120}" y="{y+150}" font-family="Jost" font-size="16" fill="{C["ink"]}" opacity=".7">Seen 11:47 pm</text>'
        return s
    r = random.Random(11)
    scrib = ''.join(f'<path d="{hand_path([(r.uniform(620,1000), r.uniform(330,620)) for _ in range(5)], r, 0)}" stroke="#7a6f72" stroke-width="2" fill="none" opacity=".55"/>' for _ in range(16))
    s = (f'<rect x="0" y="0" width="1080" height="675" fill="#d8d0cf" opacity=".55"/>' + phone(720, 250, False) + scrib +
         phone(720, 860, True) + f'<path d="M640 1060 C 700 1040, 760 1080, 1000 1050" stroke="{C["gold"]}" stroke-width="4" fill="none"/>' +
         f'<line x1="60" y1="675" x2="1020" y2="675" stroke="{C["ink"]}" stroke-opacity=".35"/>')
    return frame(d, n, 'cream', svg(s) +
        label('THEN', 92, 230, C['ink'], 24) + h('one message on "seen" ran my whole night.', 88, 280, 70, 560, italic=True) +
        label('NOW', 92, 760, C['gold'], 24) + h('same message.<br>Softer me.', 88, 810, 92, 560))

def frosted_cover(d, n):
    blur = (f'<div style="position:absolute;left:330px;top:420px;width:420px;height:600px;filter:blur(38px);'
            f'background:linear-gradient(160deg,{C["blush"]},{C["mauve"]} 55%,{C["goldlite"]});opacity:.9"></div>'
            f'<div style="position:absolute;left:250px;top:340px;width:580px;height:760px;border:2px solid rgba(243,236,226,.5);'
            f'background:linear-gradient(180deg,rgba(255,255,255,.16),rgba(255,255,255,.06));backdrop-filter:blur(6px)"></div>')
    r = random.Random(12)
    drops = ''.join(f'<path d="M{x:.0f} {y:.0f} q 6 12 0 18 q -6 -6 0 -18 z" fill="#f3ece2" opacity=".55"/>' for x, y in ((r.uniform(270, 810), r.uniform(360, 1080)) for _ in range(40)))
    return frame(d, n, 'plum', blur + svg(drops + f'<path d="M300 620 C 420 600, 520 660, 640 610" stroke="#f3ece2" stroke-opacity=".35" stroke-width="16" fill="none" stroke-linecap="round"/>') +
                 h('The cover is done.', 88, 180, 84, 900, color=C['cream']) +
                 label('REVEALING SOON', 410, 1130, C['goldlite'], 22) + note("you'll see it soon", 640, 250, 50, -5, C['goldlite']))

def hourglass_calendar(d, n):
    r = random.Random(13)
    s = ''
    for col in range(5):
        x = 92 + col * 120
        s += f'<text x="{x}" y="590" font-family="Jost" font-size="18" letter-spacing="3" fill="{C["ink"]}" opacity=".6">{"MTWTF"[col]}</text>'
        y = 620
        while y < 1080:
            hgt = r.choice([50, 70, 90])
            gold = (col == 4 and y > 900)
            s += f'<rect x="{x}" y="{y}" width="100" height="{hgt-8}" rx="6" fill="{C["gold"] if gold else C["mauve"]}" opacity="{1 if gold else r.uniform(.35,.7):.2f}"/>'
            if gold:
                s += f'<text x="{x+22}" y="{y+40}" font-family="Caveat" font-size="34" fill="#fff">Rest</text>'; break
            y += hgt
    s += f'<g transform="rotate(90 860 860)"><path d="M780 740 L940 740 L870 860 L940 980 L780 980 L850 860 Z" fill="none" stroke="{C["ink"]}" stroke-width="4"/>'
    s += f'<path d="M800 960 L920 960 L870 900 L850 900 Z" fill="{C["goldlite"]}"/><line x1="770" y1="740" x2="950" y2="740" stroke="{C["ink"]}" stroke-width="6"/><line x1="770" y1="980" x2="950" y2="980" stroke="{C["ink"]}" stroke-width="6"/></g>'
    return frame(d, n, 'cream', svg(s) + label('EVERYONE SAYS: REST WHEN YOU\'RE DONE.', 92, 200) +
                 h('Nobody says:<br><i>rest before you\'re empty.</i>', 88, 240, 92, 920))

def sealed_envelope(d, n):
    s = (f'<g transform="rotate(-4 540 820)"><rect x="170" y="560" width="740" height="480" fill="#f6efe4" stroke="{C["ink"]}" stroke-opacity=".2"/>'
         f'<path d="M170 560 L540 830 L910 560" fill="#efe5d6" stroke="{C["ink"]}" stroke-opacity=".25" stroke-width="2"/>'
         f'<rect x="170" y="790" width="740" height="16" fill="{C["gold"]}"/><rect x="532" y="560" width="16" height="480" fill="{C["gold"]}"/>'
         f'<path d="M540 800 C 470 740, 450 700, 500 690 C 530 690, 540 730, 540 800 C 540 730, 560 690, 590 690 C 630 700, 610 740, 540 800" fill="none" stroke="{C["gold"]}" stroke-width="10"/>'
         f'<line x1="560" y1="815" x2="700" y2="960" stroke="{C["ink"]}" stroke-width="2"/>'
         f'<g transform="rotate(10 760 1000)"><rect x="670" y="950" width="290" height="96" fill="#fbf6ee" stroke="{C["ink"]}" stroke-opacity=".4"/></g></g>')
    return frame(d, n, 'mauve', svg(s) + h('Some words take two years to get right.', 88, 190, 84, 900, color='#fff8ef') +
                 note('open on launch day', 690, 975, 38, 6, C['gold']))

def feed_lane(d, n):
    s = ''
    for i, t in enumerate(['New role', 'Promoted', 'Started a company', 'New role']):
        y = 470 + i * 150
        s += (f'<rect x="600" y="{y}" width="400" height="120" rx="10" fill="#fbf7f1" stroke="{C["ink"]}" stroke-opacity=".15"/>'
              f'<rect x="624" y="{y+24}" width="54" height="54" rx="14" fill="{C["grey"]}"/><text x="700" y="{y+56}" font-family="Jost" font-size="26" fill="{C["ink"]}">{t}</text>'
              f'<rect x="700" y="{y+74}" width="{200-i*20}" height="10" rx="5" fill="{C["grey"]}" opacity=".6"/>')
    path = 'M150 1180 C 160 1040, 420 1010, 330 880 C 260 780, 470 720, 420 600'
    s += f'<path d="{path}" stroke="{C["sage"]}" stroke-width="56" fill="none" stroke-linecap="round" opacity=".7"/><path d="{path}" stroke="#fff" stroke-width="2" stroke-dasharray="6 14" fill="none"/>'
    for x, y, rot in [(230, 1060, -30), (380, 950, 40), (290, 830, -20), (450, 740, 35), (360, 650, -25)]:
        s += f'<path d="M{x} {y} c 14 -26 40 -26 46 -8 c -16 18 -40 22 -46 8 z" fill="{C["goldlite"] if y < 700 else "#93a385"}" transform="rotate({rot} {x} {y})"/>'
    s += f'<g stroke="{C["ink"]}" stroke-width="4" stroke-linecap="round" fill="none"><path d="M418 588 l0 -46"/><path d="M418 556 l-16 18 M418 556 l16 18 M418 588 l-14 26 M418 588 l14 26"/><rect x="408" y="518" width="20" height="22" rx="9" fill="{C["ink"]}"/></g>'
    return frame(d, n, 'cream', svg(s) + label('FOR ANYONE WHO CLOSES THIS APP FEELING BEHIND', 92, 200) +
                 h('You were busy surviving.', 88, 240, 96, 900) + note('that counts.', 120, 440, 60, -4))

def roots_pullquote(d, n):
    r = random.Random(16)
    s = f'<rect x="0" y="930" width="1080" height="320" fill="#cdb9a3" opacity=".55"/><rect x="0" y="1060" width="1080" height="190" fill="#b79f88" opacity=".5"/>'
    s += f'<path d="M540 930 C 540 860, 530 820, 560 780" stroke="#7f9070" stroke-width="5" fill="none"/><path d="M548 840 c 30 -30 70 -30 80 -10 c -30 20 -60 25 -80 10z" fill="#93a385"/><path d="M545 870 c -30 -30 -70 -26 -76 -6 c 26 18 56 20 76 6z" fill="#93a385"/>'
    def root(x, y, ang, ln, depth):
        nonlocal s
        if depth == 0: return
        x2, y2 = x + ln * math.cos(ang), y + ln * math.sin(ang)
        s += f'<line x1="{x:.0f}" y1="{y:.0f}" x2="{x2:.0f}" y2="{y2:.0f}" stroke="{C["ink"]}" stroke-width="{depth*.9:.1f}" stroke-linecap="round" opacity=".8"/>'
        for k in (-1, 1): root(x2, y2, ang + k * r.uniform(.25, .6), ln * .72, depth - 1)
    root(540, 930, math.pi / 2, 90, 6)
    return frame(d, n, 'paper', svg(s) + label('A LINE FROM MY BOOK', 92, 200) +
        h('We wonder why someone isn\'t quite themselves anymore… <span class="hl">without ever seeing the roots behind it.</span>', 88, 240, 70, 920, italic=True))

def instant_photo(d, n):
    s = (f'<g transform="rotate(5 560 820)"><rect x="300" y="460" width="520" height="640" fill="#fbf8f3" stroke="{C["ink"]}" stroke-opacity=".15"/>'
         f'<defs><linearGradient id="dev" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9e979a"/><stop offset=".5" stop-color="#cbbdb0"/><stop offset="1" stop-color="{C["blush"]}"/></linearGradient></defs>'
         f'<rect x="330" y="490" width="460" height="460" fill="url(#dev)"/>'
         f'<path d="M330 560 C 450 540, 600 520, 790 560" stroke="#6f5d55" stroke-width="10" fill="none"/>'
         f'<line x1="520" y1="550" x2="510" y2="840" stroke="#6f5d55" stroke-width="3"/><line x1="620" y1="545" x2="630" y2="840" stroke="#6f5d55" stroke-width="3"/>'
         f'<rect x="495" y="836" width="150" height="16" fill="#6f5d55"/>'
         f'<rect x="330" y="900" width="460" height="50" fill="#a8b597" opacity=".7"/></g>')
    return frame(d, n, 'rose', svg(s) + h('I miss the version of me who…', 88, 190, 92, 900) +
                 note("she's waiting to play again", 330, 1080, 50, 3))

def one_word_blank(d, n):
    s = ''
    for i, (x, y, sc) in enumerate([(720, 520, 1), (800, 640, .8), (690, 760, .6), (760, 850, .45)]):
        s += f'<path transform="translate({x} {y}) scale({sc})" d="M0 -40 C 18 -10, 26 10, 0 26 C -26 10, -18 -10, 0 -40 Z" fill="#2f1d24" stroke="{C["goldlite"]}" stroke-opacity=".6" stroke-width="2"/>'
    s += f'<line x1="92" y1="1050" x2="990" y2="1050" stroke="{C["gold"]}" stroke-width="5"/>'
    return frame(d, n, 'plumdeep', svg(s) + label('ONE WORD. NO EXPLANATION.', 92, 200, C['goldlite']) +
                 h('Healing<br>feels like', 88, 300, 150, 900, color=C['cream']) + note('your word here', 640, 1080, 48, -3, C['goldlite']))

def crumpled_page(d, n):
    r = random.Random(19)
    pts = [(r.uniform(180, 900), r.uniform(560, 1120)) for _ in range(26)]
    s = f'<rect x="160" y="540" width="760" height="600" fill="#fbf6ee"/>'
    for a in pts:
        b = min(pts, key=lambda p: (p[0]-a[0])**2+(p[1]-a[1])**2 if p != a else 1e9)
        s += f'<line x1="{a[0]:.0f}" y1="{a[1]:.0f}" x2="{b[0]:.0f}" y2="{b[1]:.0f}" stroke="{C["ink"]}" stroke-opacity=".14" stroke-width="2"/>'
        s += f'<path d="M{a[0]:.0f} {a[1]:.0f} l{r.uniform(-120,120):.0f} {r.uniform(-90,90):.0f}" stroke="{C["ink"]}" stroke-opacity=".08" stroke-width="2"/>'
    s += crack('M160 760 L330 790 L420 740 L560 820 L700 780 L920 830', 4)
    return frame(d, n, 'paper', svg(s) + label('THEN', 92, 200) +
        h("I couldn't talk about it without crying.", 88, 236, 70, 920, italic=True, color=C['mauve']) +
        label('NOW', 92, 420, C['gold']) + h('I can tell the story.', 88, 452, 70, 920) +
        note("that's how I knew.", 560, 1150, 54, -3))

def team_photo(d, n):
    s = ''
    for i in range(3):
        x = 110 + i * 300
        s += f'<g transform="rotate({[-3,2,-1][i]} {x+130} 820)"><rect x="{x}" y="620" width="260" height="330" fill="#fbf7f1" stroke="{C["ink"]}" stroke-opacity=".2"/>'
        s += f'<rect x="{x+18}" y="638" width="224" height="250" fill="{[C["sage"],C["blush"],C["butter"]][i]}" opacity=".7"/>'
        s += f'<path d="M{x+92} 740 q 12 -10 24 0 M{x+144} 740 q 12 -10 24 0" stroke="{C["ink"]}" stroke-width="3" fill="none" stroke-linecap="round"/>'
        s += f'<path d="M{x+96} 790 q 34 30 68 0" stroke="{C["ink"]}" stroke-width="3.5" fill="none" stroke-linecap="round"/></g>'
    s += f'<path d="M560 1040 C 520 1000, 500 990, 480 960" stroke="{C["gold"]}" stroke-width="3" fill="none"/><path d="M472 978 l6 -22 l16 18" stroke="{C["gold"]}" stroke-width="3" fill="none"/>'
    return frame(d, n, 'paper', svg(s) + h("Read this if you've smiled in a team photo on your worst week.", 88, 190, 76, 920) +
                 note('the real week', 560, 1020, 50, -3))

def paper_boats(d, n):
    s = ''
    for k in range(7):
        y = 930 + k * 34
        amp = max(4, 24 - k * 3)
        s += f'<path d="M60 {y} ' + ' '.join(f'Q {90+i*120} {y-amp*(-1)**i} {150+i*120} {y}' for i in range(8)) + f'" stroke="{C["ink"]}" stroke-opacity="{.5-k*.05:.2f}" stroke-width="2" fill="none"/>'
    def boat(x, y, rot):
        return (f'<g transform="rotate({rot} {x} {y})"><path d="M{x-110} {y} L{x+110} {y} L{x+70} {y+50} L{x-70} {y+50} Z" fill="#fbf7f1" stroke="{C["ink"]}" stroke-width="3"/>'
                f'<path d="M{x-10} {y} L{x+10} {y-120} L{x+70} {y} Z" fill="#f3ece2" stroke="{C["ink"]}" stroke-width="3"/></g>')
    s += boat(330, 880, -6) + boat(760, 870, 5)
    s += f'<path d="M420 905 C 480 870, 470 960, 540 900 C 600 850, 590 950, 670 900" stroke="{C["gold"]}" stroke-width="4" fill="none"/>'
    return frame(d, n, 'cream', svg(s) + label('EVERYONE SAYS: FIX IT RIGHT NOW.', 92, 200) +
                 h('Sometimes a little space is what softens it.', 88, 240, 92, 920))

def two_cups(d, n):
    s = ''
    for i, x in enumerate([340, 600]):
        s += (f'<path d="M{x} 760 L{x+150} 760 L{x+130} 1000 L{x+20} 1000 Z" fill="#fbf7f1" stroke="{C["ink"]}" stroke-width="3"/>'
              f'<rect x="{x-6}" y="740" width="162" height="26" rx="6" fill="{[C["sage"],C["blush"]][i]}" stroke="{C["ink"]}" stroke-width="3"/>'
              f'<rect x="{x+12}" y="840" width="126" height="60" fill="{[C["sage"],C["blush"]][i]}" opacity=".6"/>')
        for k in range(2):
            s += f'<path d="M{x+55+k*40} 700 c -20 -30 20 -50 0 -90" stroke="{C["ink"]}" stroke-opacity=".4" stroke-width="3" fill="none"/>'
    s += f'<line x1="200" y1="1002" x2="900" y2="1002" stroke="{C["ink"]}" stroke-opacity=".4" stroke-width="2"/>'
    return frame(d, n, 'rose', svg(s) + h('Send this to the colleague who…', 88, 200, 100, 920) +
                 note('…asks if you\'ve eaten.', 300, 1050, 58, -3) + swipe(5))

def crossed_lines(d, n):
    r = random.Random(23)
    s = ''
    for k in range(10):
        y = 560 + k * 56
        s += f'<line x1="92" y1="{y+22}" x2="990" y2="{y+22}" stroke="#b9c4d6" stroke-opacity=".6"/>'
        if k < 9:
            s += f'<path d="{hand_path([(110,y),(300+r.uniform(150,500),y)],r,2)}" stroke="{C["ink"]}" stroke-opacity=".45" stroke-width="5" stroke-linecap="round"/>'
            s += f'<path d="{hand_path([(100,y+r.uniform(-8,8)),(320+r.uniform(150,480),y+r.uniform(-8,8))],r,4)}" stroke="{C["ink"]}" stroke-width="3"/>'
    for i, (x, y, sc) in enumerate([(620, 1080, 1), (720, 980, .85), (820, 900, .7), (900, 820, .55)]):
        s += f'<path transform="translate({x} {y}) scale({sc})" d="M-40 0 Q -20 -24 0 0 Q 20 -24 40 0" stroke="{C["gold"]}" stroke-width="5" fill="none" stroke-linecap="round"/>'
    return frame(d, n, 'cream', svg(s) + h("Read this if you've forgiven everyone except yourself.", 88, 190, 78, 920) +
                 note('start with her.', 140, 1090, 64, -3))

def name_tags(d, n):
    s = ''
    for i, (x, y, rot) in enumerate([(120, 620, -6), (380, 700, 3), (650, 610, -2)]):
        s += (f'<g transform="rotate({rot} {x+150} {y+110})"><rect x="{x}" y="{y}" width="300" height="220" rx="14" fill="#fbf7f1" stroke="{C["ink"]}" stroke-opacity=".25"/>'
              f'<rect x="{x}" y="{y}" width="300" height="78" rx="14" fill="{C["mauve"]}"/><rect x="{x}" y="{y+56}" width="300" height="22" fill="{C["mauve"]}"/>'
              f'<text x="{x+150}" y="{y+40}" text-anchor="middle" font-family="Jost" font-weight="600" font-size="26" letter-spacing="4" fill="#fff">HELLO</text>'
              f'<text x="{x+150}" y="{y+66}" text-anchor="middle" font-family="Jost" font-size="15" letter-spacing="3" fill="#fff">MY NAME IS</text>'
              f'<line x1="{x+40}" y1="{y+170}" x2="{x+260}" y2="{y+170}" stroke="{C["ink"]}" stroke-opacity=".4" stroke-width="2"/></g>')
    s += crack('M400 830 L470 860 L520 835 L600 880 L690 850', 4)
    return frame(d, n, 'paper', svg(s) + h('Every name in my book is made up.', 88, 190, 80, 920) +
                 h('Every feeling in it is real.', 88, 1000, 80, 920, italic=True, color=C['gold']))

def tracker_grid(d, n):
    r = random.Random(25)
    s, cols = '', [C['sage'], C['blush'], C['butter'], C['rose'], '#e9dccb']
    for i in range(100):
        x, y = 140 + (i % 10) * 82, 470 + (i // 10) * 62
        filled = i < 64
        s += f'<rect x="{x}" y="{y}" width="74" height="54" rx="4" fill="{r.choice(cols) if filled else "none"}" stroke="{C["ink"]}" stroke-opacity="{.12 if filled else .25}"/>'
    s += crack('M140 524 L384 586 L548 648 L712 710 L960 772', 4)
    return frame(d, n, 'cream', svg(s) + label("HEALING ISN'T ONE BIG MOMENT. IT'S", 92, 200) +
                 h('a hundred small, ordinary days.', 88, 238, 88, 920) + note('day 64 of 100', 700, 1110, 48, -3))

def letterpress(d, n):
    words = ['A', 'SELF', 'REPAIRED', 'SOUL']
    s, y = '', 480
    for w in words:
        x = 110
        for ch in w:
            s += (f'<rect x="{x}" y="{y}" width="58" height="76" rx="4" fill="#c6a07c" stroke="#7e5d43" stroke-width="2"/>'
                  f'<text x="{x+29}" y="{y+56}" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="52" fill="#5c4130" transform="scale(-1 1) translate({-2*(x+29)} 0)">{ch}</text>')
            x += 62
        y += 88
    s += f'<rect x="600" y="820" width="420" height="330" fill="#fbf6ee" transform="rotate(3 810 985)"/>'
    return frame(d, n, 'plum', svg(s) + h("Four words I've lived with for two years.", 88, 190, 76, 900, color=C['cream']) +
                 h('A Self Repaired <span style="color:#a8792c">Soul</span>', 640, 870, 76, 340, color=C['plum'], extra='transform:rotate(3deg)'))

def two_year_calendar(d, n):
    r = random.Random(27)
    s = ''
    for k in range(6):
        x, y = 170 + k * 14, 470 + k * 10
        last = k == 5
        s += f'<rect x="{x}" y="{y}" width="640" height="660" fill="{"#fbf6ee" if not last else "#fbf6ee"}" stroke="{C["ink"]}" stroke-opacity=".2"/>'
    x, y = 240, 520
    s += f'<rect x="{x}" y="{y}" width="640" height="110" fill="{C["gold"]}"/>'
    s += f'<text x="{x+40}" y="{y+75}" font-family="Jost" font-size="34" letter-spacing="8" fill="#fff">MONTH 24</text>'
    for i in range(35):
        cx, cy = x + 30 + (i % 7) * 86, y + 150 + (i // 7) * 92
        s += f'<rect x="{cx}" y="{cy}" width="78" height="84" fill="none" stroke="{C["ink"]}" stroke-opacity=".15"/>'
        if r.random() < .7:
            s += f'<path d="{hand_path([(cx+10,cy+30),(cx+64,cy+30)],r,3)}" stroke="{C["ink"]}" stroke-opacity=".5" stroke-width="2.5"/>'
            if r.random() < .5: s += f'<path d="{hand_path([(cx+10,cy+52),(cx+50,cy+52)],r,3)}" stroke="{C["ink"]}" stroke-opacity=".4" stroke-width="2.5"/>'
    return frame(d, n, 'cream', svg(s) + h('24 months.', 88, 190, 120, 900) +
                 label('MOST OF THEM LOOKED LIKE NOTHING FROM THE OUTSIDE.', 92, 340) +
                 note('all of them are in this book.', 470, 1160, 50, -3))

LAYOUTS = {k.replace('_', '-'): v for k, v in globals().items() if callable(v) and k in {
    'manuscript_page', 'questionnaire', 'planner_staff', 'five_year_plan', 'folio_flip', 'plum_night', 'sorry_notes', 'letter',
    'knot_ribbon', 'strike_list', 'split_then_now', 'frosted_cover', 'hourglass_calendar', 'sealed_envelope', 'feed_lane',
    'roots_pullquote', 'instant_photo', 'one_word_blank', 'crumpled_page', 'team_photo', 'paper_boats', 'two_cups',
    'crossed_lines', 'name_tags', 'tracker_grid', 'letterpress', 'two_year_calendar'}}

CSS = f'''
@font-face{{font-family:"Cormorant Garamond";src:url("{FONT_URI['CormorantGaramond[wght].ttf']}");font-weight:300 700}}
@font-face{{font-family:"Cormorant Garamond";font-style:italic;src:url("{FONT_URI['CormorantGaramond-Italic[wght].ttf']}");font-weight:300 700}}
@font-face{{font-family:"Jost";src:url("{FONT_URI['Jost[wght].ttf']}");font-weight:100 900}}
@font-face{{font-family:"Caveat";src:url("{FONT_URI['caveat-latin-600-normal.woff2']}")}}
*{{box-sizing:border-box}} body{{margin:0}}
.c{{position:relative;width:1080px;height:1350px;overflow:hidden;font-family:"Cormorant Garamond",serif}}
.light,.grain,.art{{position:absolute;inset:0}} .grain{{width:1080px;height:1350px;pointer-events:none;z-index:5}}
.art{{z-index:1}}
.hdr,.ftr{{position:absolute;left:92px;right:92px;display:flex;justify-content:space-between;font-family:Jost;letter-spacing:.24em;font-size:19px;z-index:6}}
.hdr{{top:86px;opacity:.75}}
.ftr{{bottom:70px;padding-top:24px;border-top:1.5px solid;font-size:20px}} .ftr b{{font-weight:600}}
.h{{position:absolute;z-index:3;text-wrap:balance;letter-spacing:-.005em}}
.lbl{{position:absolute;z-index:3;font-family:Jost;letter-spacing:.22em;opacity:.8}}
.note{{position:absolute;z-index:4;font-family:Caveat;line-height:1;white-space:nowrap}}
.rule{{position:absolute;left:92px;right:92px;height:1.5px;background:rgba(90,61,69,.25);z-index:2}}
.cursor{{display:inline-block;width:10px;height:.8em;background:{C["gold"]};margin-left:14px;vertical-align:-.04em}}
.sticky{{position:absolute;z-index:2;width:220px;height:170px;box-shadow:0 10px 18px rgba(90,61,69,.18);display:flex;align-items:center;justify-content:center;font-family:Caveat;font-size:54px;color:{C["ink"]}}}
.sheet{{position:absolute;z-index:2;background:#fbf7f1;padding:90px 80px;box-shadow:0 30px 60px rgba(63,40,48,.22);color:{C["ink"]}}}
.hl{{background:linear-gradient(transparent 55%, rgba(209,166,90,.45) 55%)}}
'''

def render():
    from playwright.sync_api import sync_playwright
    counters = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1080, 'height': 1350})
        for i, d in enumerate(CAL['days']):
            counters[d['series']] = counters.get(d['series'], 0) + 1
            body = LAYOUTS[d['layout']](d, counters[d['series']])
            pg.set_content(f'<style>{CSS}</style>{body}', wait_until='load')
            pg.evaluate('document.fonts.ready')
            pg.wait_for_timeout(120)
            out = OUT / f"{d['date']}.jpg"
            pg.screenshot(path=str(out), type='jpeg', quality=90)
            print('ok', out.name, d['layout'])
        b.close()

if __name__ == '__main__':
    render()
