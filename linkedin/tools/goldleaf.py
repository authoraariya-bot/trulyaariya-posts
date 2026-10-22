"""Truly Aariya — LinkedIn "Gold Leaf Edition": all 27 days (posts + reels).

Pastel textured paper, Cormorant/Jost type, and ONE gold-foil hero per design that acts out the
message. Animated parts carry data-a / data-b (seconds) so the same markup renders as a still
(t = STILL) or as a reel frame by frame.

  python3 goldleaf.py stills [out_dir] [date ...]
"""
import json, math, random, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from luxe_base import *   # W, H, INK, DEFS, velvet, flecks, crack_shape, jag, CSS, page, T, ...

CAL = json.loads((ROOT / 'calendar.json').read_text())
STILL, END = 16.4, 17.4

def ani(a, b=99): return f'data-a="{a}" data-b="{b}"'
def eyebrow(x, y, text, a=-1, b=99, w=900):
    return T(x, y, w, f'<div class="cap gold" style="font-size:22px" {ani(a,b)}>{text}</div>')
def txt(x, y, w, inner, size, a=-1, b=99, italic=False, gold=False, weight=400, lh=1.0, extra=''):
    return T(x, y, w, f'<div class="{"gold" if gold else ""}" {ani(a,b)} style="font-size:{size}px;line-height:{lh};font-weight:{weight};'
                      f'{"font-style:italic;" if italic else ""}{extra}">{inner}</div>')
def swipe(n): return T(760, 1180, 300, f'<div class="cap" style="font-size:18px;opacity:.7">1 / {n} &nbsp; Swipe →</div>')
def foil(inner, a=None, b=99, extra=''):
    return f'<g filter="url(#foil)" {ani(a,b) if a is not None else ""} {extra}>{inner}</g>'
def halo(inner, op=.45):
    return f'<g filter="url(#glow)" opacity="{op}">{inner}</g>'
def drawp(d, a, b, w=6, grad='goldH', extra=''):
    return f'<path class="draw" data-a="{a}" data-b="{b}" d="{d}" stroke="url(#{grad})" stroke-width="{w}" fill="none" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def paper_card(x, y, w, h, rot=0, fill='#fbf7f0'):
    return (f'<g transform="rotate({rot} {x+w/2} {y+h/2})"><rect x="{x+6}" y="{y+14}" width="{w}" height="{h}" fill="#7a5a4e" opacity=".16" filter="url(#glowS)"/>'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}"/><rect x="{x}" y="{y}" width="{w}" height="{h}" filter="url(#grain)"/></g>')

# ------------------------------------------------------------------ 23 Oct · announcement (post)
def d1023(d):
    main = jag((830, -20), (790, 1370), 16, 60, 11)
    seam = crack_shape(main, 14, 3)
    br1 = crack_shape(jag(main[5], (1100, 360), 6, 30, 4), 7, 5)
    br2 = crack_shape(jag(main[10], (600, 960), 6, 30, 6), 6, 7)
    br3 = crack_shape(jag(main[3], (620, 120), 5, 22, 8), 4, 9)
    svg_ = (velvet(1, (.62, .4), 'blush') + halo(f'<path d="{seam}" fill="#f2c56a" stroke="#f2c56a" stroke-width="24"/>', .5) +
            foil(f'<path d="{seam}" fill="url(#gold)"/><path d="{br1}" fill="url(#gold)"/><path d="{br2}" fill="url(#gold)"/><path d="{br3}" fill="url(#gold)"/>') +
            flecks(21, 50, (640, 120, 1000, 1200), (2, 6), (.35, .9)))
    html = (eyebrow(84, 200, 'An announcement') +
            txt(84, 262, 680, 'Two years of writing.<br>One book.', 58, italic=True, lh=1.1) +
            txt(80, 470, 700, 'A Self<br>Repaired<br>Soul', 168, gold=True, weight=500, lh=.88, extra='letter-spacing:-.01em') +
            txt(88, 980, 640, 'Journey That Heals', 60, italic=True) +
            T(88, 1090, 680, '<div class="cap" style="font-size:26px;line-height:1.7">Publishing soon<br><span class="gold" style="font-size:20px">A debut by Aariya Sharma</span></div>'))
    return page(svg_, html, False, 'TRULY AARIYA', 'MY DEBUT BOOK')

# ------------------------------------------------------------------ 24 Oct · questionnaire (post)
def d1024(d):
    rows = [('A song', 'your 1 a.m. playlist'), ('A season', 'the first cool morning after summer'), ('A place', 'the warm corner of your bed')]
    y, h = 520, ''
    rules = ''
    for q, a in rows:
        rules += f'<line x1="84" y1="{y-24}" x2="996" y2="{y-24}" stroke="#a8792c" stroke-opacity=".45" stroke-width="1.2"/>'
        h += T(84, y, 260, f'<div class="cap" style="font-size:19px;opacity:.75">{q}</div>') + txt(330, y - 10, 660, a, 46, italic=True, lh=1.05)
        y += 130
    # hero: a gold telephone line that runs into the last answer like a call that stays on
    cord = f'M330 {y+150} L 980 {y+150}'
    svg_ = velvet(3, (.3, .2), 'cream') + rules + f'<line x1="84" y1="{y-24}" x2="996" y2="{y-24}" stroke="#a8792c" stroke-opacity=".45" stroke-width="1.2"/>' + \
        foil(f'<path d="{cord}" stroke="url(#goldH)" stroke-width="4" fill="none"/>')
    h += T(84, y, 260, '<div class="cap" style="font-size:19px;opacity:.75">A person</div>') + \
        txt(330, y - 10, 670, 'the friend who stays on the call till you fall asleep.', 64, italic=True, gold=True, weight=500, lh=1.02)
    html = eyebrow(84, 200, 'Four questions about my book') + txt(80, 250, 920, 'If my book were…', 120, lh=1) + h
    return page(svg_, html, False, "I'LL GO FIRST", 'NO. 01')

# ------------------------------------------------------------------ 25 Oct · song before work (reel)
def d1025(d):
    staff = ''
    for k in range(5):
        y0 = 820 + k * 22
        dd = f'M60 {y0+40} C 300 {y0-60}, 560 {y0+120}, 800 {y0}, S 1000 {y0-50}, 1040 {y0-20}'
        staff += drawp(dd, -0.8 + k * .12, 2.2 + k * .12, 4)
    notes = ''
    r = random.Random(4)
    for i in range(9):
        x = 140 + i * 95
        t = (x - 60) / 980
        y = 860 - 70 * math.sin(t * 5) + r.uniform(-12, 12)
        notes += (f'<g {ani(0.6 + i*0.9)}><g filter="url(#foil)"><path d="M{x} {y} l18 -13 l18 13 l-18 13 z" fill="url(#gold)"/>'
                  f'<rect x="{x+33}" y="{y-86}" width="5" height="86" fill="url(#goldV)"/></g></g>')
    svg_ = velvet(4, (.3, .25), 'peach') + f'<g {ani(2)}>' + halo('<path d="M60 900 C 300 800, 560 980, 800 860 S 1000 810, 1040 840" stroke="#f2c56a" stroke-width="80" fill="none"/>', .25) + '</g>' + \
        f'<g filter="url(#foil)">{staff}</g>' + notes
    html = (eyebrow(84, 200, 'The 9-to-5 Edition') +
            txt(80, 250, 920, 'The song you play in the parking lot before work', 92, lh=1.02) +
            txt(84, 1050, 900, 'counts as healing too.', 84, a=10.8, italic=True, gold=True, weight=500))
    return page(svg_, html, False, 'MONDAY MORNING', 'NO. 01')

# ------------------------------------------------------------------ 26 Oct · five-year plan (carousel cover)
def d1026(d):
    card = paper_card(170, 470, 740, 640, -2.5)
    items = ''
    r = random.Random(5)
    for k in range(5):
        y = 600 + k * 64
        items += f'<path d="M262 {y} L {300+r.uniform(220,420):.0f} {y}" stroke="#9c8a86" stroke-width="7" stroke-linecap="round" opacity=".55"/>'
        items += f'<path d="M210 {y-6} l10 12 l20 -24" stroke="#9c8a86" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>'
    tick = foil('<path d="M205 990 l34 40 l92 -120" stroke="url(#gold)" stroke-width="22" fill="none" stroke-linecap="round" stroke-linejoin="round"/>')
    svg_ = velvet(5, (.4, .3), 'sage') + f'<g transform="rotate(-2.5 540 790)">{card}{items}</g>' + tick
    html = (eyebrow(84, 200, 'Notes from a debut author') +
            txt(80, 250, 900, 'Writing a book was never in my five-year plan.', 84, lh=1.02) +
            T(250, 530, 600, '<div style="font-size:42px;font-style:italic;transform:rotate(-2.5deg);opacity:.8">My five-year plan</div>') +
            txt(350, 935, 600, 'Write a book.', 96, italic=True, gold=True, weight=500, extra='transform:rotate(-2.5deg)') + swipe(5))
    return page(svg_, html, False, 'MONDAY', 'NO. 02')

# ------------------------------------------------------------------ 27 Oct · Day 1 → Day 730 (reel)
def d1027(d):
    pages = ''
    for i, (dx, rot, a) in enumerate([(-40, -6, -1), (0, -2, 3.4), (40, 3, 6.8)]):
        pages += f'<g class="slide" {ani(a)}>{paper_card(280+dx, 560, 520, 620, rot)}</g>'
    leaf = 'M540 1080 C 420 990, 430 760, 600 660 C 700 790, 690 980, 540 1080 Z'
    veins = '<path d="M540 1080 C 560 950, 575 820, 600 660" stroke="#7d5518" stroke-width="3" fill="none"/>' + \
        ''.join(f'<path d="M{552+t*7} {1010-t*68} q 40 -22 66 -52" stroke="#7d5518" stroke-width="2" fill="none"/><path d="M{552+t*7} {1010-t*68} q -40 -16 -62 -46" stroke="#7d5518" stroke-width="2" fill="none"/>' for t in range(5))
    hero = f'<g id="leaf">{halo(f"<path d=\'{leaf}\' fill=\'#f2c56a\'/>", .4)}{foil(f"<path d=\'{leaf}\' fill=\'url(#gold)\'/>")}{veins}</g>'
    svg_ = velvet(6, (.35, .2), 'cream') + pages + hero
    html = (eyebrow(84, 200, 'Margin notes') +
            txt(80, 250, 900, 'Day 1.', 150, b=3.2) + txt(80, 250, 900, 'Day 300.', 150, a=3.4, b=6.6) + txt(80, 250, 900, 'Day 730.', 150, a=6.8, b=10.1) +
            txt(80, 250, 920, "I'm not the person who opened the first blank page.", 82, a=10.3, lh=1.02) +
            txt(600, 470, 440, 'two years, pressed in gold', 40, a=12.4, italic=True, gold=True, weight=500))
    return page(svg_, html, False, 'TWO YEARS', 'NO. 01')

# ------------------------------------------------------------------ 28 Oct · after midnight (post)
def d1028(d):
    nib = 'M0 -330 C 70 -250, 112 -120, 96 30 L 60 150 L 0 250 L -60 150 L -96 30 C -112 -120, -70 -250, 0 -330 Z'
    g = (f'<g transform="translate(840 560) rotate(38) scale(.92)">' + halo(f'<path d="{nib}" fill="#f2c56a"/>', .5) + foil(f'<path d="{nib}" fill="url(#gold)"/>') +
         '<path d="M -80 -160 C -40 -150, 40 -150, 80 -160" stroke="#7d5518" stroke-width="3" fill="none" opacity=".7"/>'
         '<path d="M0 -40 L0 250" stroke="#3b2410" stroke-width="5"/><path d="M0 -70 C 18 -70 22 -40 0 -18 C -22 -40 -18 -70 0 -70 Z" fill="#5a3d45"/></g>')
    trail = crack_shape([(700, 790), (600, 880), (440, 905), (260, 908), (88, 910)], 8, 13, taper=False)
    svg_ = velvet(2, (.72, .45), 'lilac') + g + foil(f'<path d="{trail}" fill="url(#goldH)"/>') + flecks(31, 26, (560, 380, 1000, 900), (2, 5), (.3, .8))
    html = (eyebrow(84, 220, 'Notes from a debut author') +
            txt(84, 290, 700, 'Most of this book was written', 96) +
            txt(84, 600, 700, 'after midnight.', 150, italic=True, gold=True, weight=500) +
            txt(88, 960, 640, 'Two years of late nights,<br>one gold line at a time.', 40, italic=True, lh=1.25, extra='opacity:.85'))
    return page(svg_, html, False, 'THE WRITING HOURS', 'NO. 03')

# ------------------------------------------------------------------ 29 Oct · sorry (reel)
def d1029(d):
    r = random.Random(7); words = ''
    phr = ['sorry,', 'so sorry', 'sorry!', 'sorry to bother', 'sorry again', 'sorry,', 'sorry, late!', 'sorry', 'sorry, quick one', 'sorry…', 'sorry,', 'so sorry']
    for i, w in enumerate(phr):
        x, y = 90 + (i % 3) * 310 + r.uniform(-6, 20), 560 + (i // 3) * 110
        words += T(x, y, 320, f'<div class="sw" {ani(-0.6 + i*0.55)} style="font-size:46px;font-style:italic;color:#8d7f80">{w}</div>')
    strike = drawp('M70 592 C 300 584, 700 600, 1010 590', 8.6, 9.6, 9) + drawp('M70 702 C 330 710, 720 694, 1010 704', 9.0, 10.0, 9) + \
        drawp('M70 812 C 320 806, 700 820, 1010 812', 9.4, 10.4, 9) + drawp('M70 922 C 330 930, 720 914, 1010 924', 9.8, 10.8, 9)
    svg_ = velvet(7, (.3, .3), 'rose') + f'<g filter="url(#foil)">{strike}</g>'
    html = (eyebrow(84, 200, 'The 9-to-5 Edition') +
            txt(80, 250, 920, 'How many did you send this week?', 92, b=11.2, lh=1.02) + words +
            txt(80, 230, 920, 'Your feelings were never an', 84, a=11.6, lh=1.02) +
            txt(80, 330, 920, 'inconvenience.', 140, a=12.2, italic=True, gold=True, weight=500))
    js = "window.custom=t=>{const k=1-0.5*ease(clamp((t-10)/1.2));document.querySelectorAll('.sw').forEach(w=>{w.style.opacity=Math.min(+w.style.opacity||0,k);});};"
    return page(svg_, html, False, 'INBOX', 'NO. 02'), js

# ------------------------------------------------------------------ 30 Oct · letter (post)
def d1030(d):
    sheet = paper_card(150, 300, 780, 860, -2)
    edge = foil('<rect x="150" y="300" width="780" height="860" fill="none" stroke="url(#gold)" stroke-width="6" transform="rotate(-2 540 730)"/>')
    svg_ = velvet(8, (.3, .25), 'peach') + sheet + edge
    html = (T(230, 400, 640, '<div style="transform:rotate(-2deg)"><div class="cap" style="font-size:22px;opacity:.75;margin-bottom:60px">Dear reader,</div>'
                       '<div style="font-size:66px;line-height:1.08">When you reach the last page, I hope you go a little</div>'
                       '<div class="gold" style="font-size:150px;font-style:italic;font-weight:500;line-height:1;margin-top:10px">easier</div>'
                       '<div style="font-size:66px;line-height:1.08">on yourself.</div>'
                       '<div class="gold" style="font-family:Caveat;font-size:80px;margin-top:40px;text-align:right">Aariya</div></div>'))
    return page(svg_, html, False, 'A NOTE TO MY READER', 'NO. 04')

# ------------------------------------------------------------------ 31 Oct · knot to gold thread (reel)
def d1031(d):
    r = random.Random(9); pts = []; cx, cy = 300, 840
    for t in range(240):
        a = t * .31; rad = 70 + 80 * math.sin(t * .07) + r.uniform(-12, 12)
        pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a) * .9))
    knot = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
    thread = f'M{pts[-1][0]:.0f} {pts[-1][1]:.0f} C 560 860, 700 980, 1000 980'
    svg_ = (velvet(9, (.3, .25), 'sage') + f'<path id="knot" d="{knot}" stroke="#9a9093" stroke-width="2.4" fill="none" opacity=".85"/>' +
            f'<g {ani(11)}>' + halo(f'<path d="{thread}" stroke="#f2c56a" stroke-width="30" fill="none"/>', .35) + '</g>' +
            f'<g filter="url(#foil)">{drawp(thread, 6.5, 11.5, 10)}</g>')
    html = (eyebrow(84, 200, 'The 9-to-5 Edition') +
            txt(80, 250, 920, "A no doesn't need three paragraphs.", 96, lh=1.02) +
            txt(84, 1070, 900, "You're allowed to choose you.", 74, a=11.8, italic=True, gold=True, weight=500))
    js = '''const K=document.getElementById('knot');const KL=K.getTotalLength();K.style.strokeDasharray=KL;
window.custom=t=>{const p=ease(clamp((t-6)/6));K.style.strokeDashoffset=-KL*p;K.style.opacity=.85*(1-ease(clamp((t-10.5)/1.5)));};'''
    return page(svg_, html, False, 'BOUNDARIES', 'NO. 03'), js

# ------------------------------------------------------------------ 1 Nov · won't tell you (carousel cover)
def d1101(d):
    stroke = crack_shape([(70, 905), (300, 890), (560, 915), (820, 895), (1010, 905)], 22, 21, taper=False)
    svg_ = velvet(10, (.3, .25), 'cream') + halo(f'<path d="{stroke}" fill="#f2c56a"/>', .35) + foil(f'<path d="{stroke}" fill="url(#goldH)"/>')
    html = (eyebrow(84, 200, 'A list') +
            txt(80, 250, 920, "5 things my book <i>won't</i> tell you", 118, lh=.98) +
            txt(84, 820, 920, 'Just be positive.', 132, italic=True, extra='color:#9a8687') +
            txt(88, 1010, 900, 'It sits with you instead.', 52, italic=True, gold=True, weight=500) + swipe(6))
    return page(svg_, html, False, 'NOTES FROM A DEBUT AUTHOR', 'NO. 05')

# ------------------------------------------------------------------ 2 Nov · then / now (reel)
def d1102(d):
    r = random.Random(11)
    zig = 'M560 470 ' + ' '.join(f'L {580+i*22} {470 + (90 if i%2 else -90) * (0.5 + 0.5*abs(math.sin(i*1.7)))}' for i in range(20))
    scrib = f'<path d="{zig}" stroke="#8f8588" stroke-width="2.4" fill="none" stroke-linejoin="round" opacity=".75"/>'
    horizon = 'M560 1010 C 680 985, 820 1035, 1000 1010'
    svg_ = (velvet(11, (.3, .25), 'cream') + '<rect width="1080" height="675" fill="#ece4d8" opacity=".7"/>' + scrib +
            '<line x1="84" y1="675" x2="996" y2="675" stroke="#a8792c" stroke-opacity=".5"/>' +
            f'<g {ani(11)}>' + halo(f'<path d="{horizon}" stroke="#f2c56a" stroke-width="40" fill="none"/>', .3) + '</g>' + f'<g filter="url(#foil)">{drawp(horizon, 9.4, 11.6, 9)}</g>')
    html = (T(84, 210, 400, '<div class="cap" style="font-size:24px;opacity:.75">Then</div>') +
            txt(84, 260, 520, 'one message on "seen" ran my whole night.', 70, italic=True, lh=1.05) +
            T(84, 760, 400, f'<div class="cap gold" style="font-size:24px" {ani(6.6)}>Now</div>') +
            txt(84, 810, 520, 'Same message.', 80, a=7.6) + txt(84, 900, 560, 'Softer me.', 120, a=8.6, italic=True, gold=True, weight=500))
    return page(svg_, html, False, 'THEN / NOW', 'NO. 01')

# ------------------------------------------------------------------ 3 Nov · the cover (post)
def d1103(d):
    blur = ('<div style="position:absolute;left:330px;top:470px;width:420px;height:600px;filter:blur(40px);z-index:2;'
            'background:linear-gradient(160deg,#ecc9c3,#c9a3ab 55%,#e8c376);opacity:.85"></div>'
            '<div style="position:absolute;left:250px;top:400px;width:580px;height:740px;z-index:3;'
            'background:linear-gradient(180deg,rgba(255,255,255,.42),rgba(255,255,255,.18));backdrop-filter:blur(8px)"></div>')
    frame_ = '<rect x="250" y="400" width="580" height="740" fill="none" stroke="url(#gold)" stroke-width="12"/>'
    svg_ = velvet(12, (.5, .35), 'blush') + halo('<rect x="240" y="390" width="600" height="760" fill="none" stroke="#f2c56a" stroke-width="40"/>', .5)
    top = f'<svg style="position:absolute;inset:0;z-index:4" viewBox="0 0 1080 1350">{DEFS}<g filter="url(#foil)">{frame_}</g></svg>'
    html = (blur + top + eyebrow(84, 200, 'Notes from a debut author') + txt(80, 250, 920, 'The cover is done.', 104) +
            T(250, 1160, 580, '<div class="cap gold" style="font-size:24px;text-align:center">Revealing soon</div>'))
    return page(svg_, html, False, 'BEHIND THE GLASS', 'NO. 06')

# ------------------------------------------------------------------ 4 Nov · rest (reel)
def d1104(d):
    cx, cy = 540, 900
    glass = 'M-150 -262 C -150 -110, -24 -60, -16 0 C -24 60, -150 110, -150 262 L 150 262 C 150 110, 24 60, 16 0 C 24 -60, 150 -110, 150 -262 Z'
    hg = (f'<g id="hg" style="transform-origin:{cx}px {cy}px"><g transform="translate({cx} {cy})">'
          f'<clipPath id="gl"><path d="{glass}"/></clipPath>'
          f'<g clip-path="url(#gl)" filter="url(#foil)"><rect id="sTop" x="-160" y="-262" width="320" height="262" fill="url(#gold)"/><rect id="sBot" x="-160" y="150" width="320" height="120" fill="url(#gold)"/></g>'
          f'<path d="{glass}" fill="#fff8ec" fill-opacity=".25" stroke="#fff8ec" stroke-opacity=".8" stroke-width="3"/>'
          f'<path d="M-118 -200 C -110 -120, -40 -70, -20 -30" stroke="#fff" stroke-opacity=".7" stroke-width="5" fill="none" stroke-linecap="round"/>'
          f'<g filter="url(#foil)"><rect x="-200" y="-300" width="400" height="34" rx="8" fill="url(#goldH)"/><rect x="-200" y="266" width="400" height="34" rx="8" fill="url(#goldH)"/>'
          f'<rect x="-186" y="-266" width="16" height="532" fill="url(#goldV)"/><rect x="170" y="-266" width="16" height="532" fill="url(#goldV)"/></g></g></g>')
    svg_ = velvet(13, (.3, .25), 'cream') + f'<ellipse cx="{cx}" cy="{cy+205}" rx="330" ry="22" fill="#5a3d30" opacity=".22" filter="url(#glowS)"/>' + hg
    html = (T(84, 220, 900, f'<div class="cap gold" style="font-size:22px" {ani(-1)}>Everyone says: rest when you\'re done</div>') +
            txt(80, 290, 940, 'Nobody says', 112, a=7.6, lh=.98) +
            txt(80, 400, 960, "rest before<br>you're empty.", 104, a=8.6, italic=True, gold=True, weight=500, lh=.98) +
            txt(80, 290, 940, 'The calendar fills.<br>The sand keeps falling.', 92, b=7.4, lh=1.02))
    js = f'''window.custom=t=>{{const g=document.getElementById('hg');const tilt=ease(clamp((t-9.4)/1.4));g.style.transform=`rotate(${{tilt*90}}deg)`;
 const p=clamp((t+1)/10.4);document.getElementById('sTop').setAttribute('y',-262+262*p*0.75);document.getElementById('sBot').setAttribute('y',150-130*p);}};'''
    return page(svg_, html, False, 'THE 9-TO-5 EDITION', 'NO. 04'), js

# ------------------------------------------------------------------ 5 Nov · sealed words (post)
def d1105(d):
    env = (paper_card(170, 560, 740, 500, -3, '#fbf5ec') +
           '<g transform="rotate(-3 540 810)"><path d="M170 560 L540 830 L910 560" fill="#f3eadf" stroke="#cdbdb0" stroke-width="2"/></g>')
    ribbon = ('<g transform="rotate(-3 540 810)"><rect x="170" y="800" width="740" height="26" fill="url(#goldH)"/><rect x="527" y="560" width="26" height="500" fill="url(#goldV)"/>'
              '<path d="M540 812 C 440 720, 410 690, 470 680 C 520 676, 540 740, 540 812 C 540 740, 560 676, 610 680 C 670 690, 640 720, 540 812 Z" fill="url(#gold)"/>'
              '<path d="M540 812 L 470 930 L 500 935 Z M540 812 L 610 930 L 580 935 Z" fill="url(#gold)"/></g>')
    svg_ = velvet(14, (.3, .25), 'lilac') + env + halo('<rect x="527" y="560" width="26" height="500" fill="#f2c56a"/>', .3) + foil(ribbon)
    html = (eyebrow(84, 200, 'Notes from a debut author') + txt(80, 250, 920, 'Some words take two years to get right.', 92, lh=1.02) +
            txt(84, 1100, 900, 'These stay sealed till launch.', 56, italic=True, gold=True, weight=500))
    return page(svg_, html, False, 'THE FIRST PAGE', 'NO. 07')

# ------------------------------------------------------------------ 6 Nov · feed (reel)
def d1106(d):
    feed = '<defs><clipPath id="fc"><rect x="600" y="470" width="420" height="700"/></clipPath></defs><g clip-path="url(#fc)"><g id="feed">'
    labels = ['New role', 'Promoted', 'Started a company', 'New role', 'Promoted', 'Launched', 'New role', 'Promoted', 'Started a company', 'New role']
    for i, t in enumerate(labels):
        y = 480 + i * 150
        feed += (f'<rect x="620" y="{y}" width="380" height="120" rx="12" fill="#fbf7f0" stroke="#d8cdc4"/>'
                 f'<rect x="644" y="{y+24}" width="54" height="54" rx="14" fill="#d9cfd0"/><text x="720" y="{y+56}" font-family="Jost" font-size="26" fill="#8d7f80">{t}</text>'
                 f'<rect x="720" y="{y+74}" width="{200-(i%4)*20}" height="10" rx="5" fill="#e3d9d6"/>')
    feed += '</g></g>'
    path = 'M180 1180 C 190 1040, 470 1010, 380 880 C 300 760, 520 700, 440 560'
    svg_ = (velvet(15, (.3, .25), 'cream') + feed + f'<g {ani(12.5)}>' + halo(f'<path d="{path}" stroke="#f2c56a" stroke-width="80" fill="none"/>', .3) + '</g>' +
            f'<g filter="url(#foil)">{drawp(path, -0.6, 13, 34, "goldV")}</g>' + flecks(51, 30, (150, 560, 560, 1180), (3, 8), (.5, 1)))
    html = (eyebrow(84, 200, 'Read this if everyone on your feed', b=7.8) + txt(80, 250, 520, 'seems ahead.', 110, b=7.8) +
            eyebrow(84, 200, 'For anyone who closes this app feeling behind', a=8.2) +
            txt(80, 250, 560, 'You were busy surviving.', 100, a=8.4, lh=1) +
            T(84, 470, 500, f'<div class="gold" {ani(11.4)} style="font-size:64px;font-style:italic;font-weight:500">That counts.</div>'))
    js = "window.custom=t=>{document.getElementById('feed').style.transform=`translateY(${-((t*95)%600)}px)`;};"
    return page(svg_, html, False, 'THE 9-TO-5 EDITION', 'NO. 05'), js

# ------------------------------------------------------------------ 7 Nov · roots (post)
def d1107(d):
    r = random.Random(16); roots = ''
    def root(x, y, ang, ln, depth, w):
        nonlocal roots
        if depth == 0: return
        x2, y2 = x + ln * math.cos(ang), y + ln * math.sin(ang)
        mx, my = (x + x2) / 2 + r.uniform(-14, 14), (y + y2) / 2
        roots += f'<path d="M{x:.0f} {y:.0f} Q {mx:.0f} {my:.0f} {x2:.0f} {y2:.0f}" stroke="url(#gold)" stroke-width="{w:.1f}" fill="none" stroke-linecap="round"/>'
        for k in (-1, 1): root(x2, y2, ang + k * r.uniform(.3, .65), ln * .74, depth - 1, w * .68)
    root(540, 860, math.pi / 2, 110, 7, 14)
    soil = '<rect x="0" y="860" width="1080" height="490" fill="#d9c8bb" opacity=".55"/><path d="M0 860 C 300 850, 700 872, 1080 858" stroke="#b9a08e" stroke-width="2" fill="none"/>'
    sprout = '<path d="M540 860 C 540 800, 530 770, 556 740" stroke="#8fa07f" stroke-width="6" fill="none"/><path d="M552 790 c 34 -34 80 -34 92 -10 c -34 24 -70 28 -92 10z" fill="#9db08c"/><path d="M546 820 c -34 -34 -80 -30 -88 -8 c 30 22 66 24 88 8z" fill="#9db08c"/>'
    svg_ = velvet(16, (.3, .2), 'sage') + soil + sprout + halo(f'<g>{roots}</g>', .45) + foil(roots)
    html = (eyebrow(84, 200, 'A line from my book') +
            txt(80, 250, 920, "We wonder why someone isn't quite themselves anymore…", 72, italic=True, lh=1.05) +
            txt(80, 520, 920, 'without ever seeing the roots behind it.', 72, italic=True, gold=True, weight=500, lh=1.05))
    return page(svg_, html, False, 'MARGIN NOTES', 'NO. 02')

# ------------------------------------------------------------------ 8 Nov · the swing (reel)
def d1108(d):
    photo = paper_card(300, 470, 500, 620, 4, '#fbf8f3')
    scene = ('<g transform="rotate(4 550 780)"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e6cf"/><stop offset="1" stop-color="#f1d3cc"/></linearGradient></defs>'
             '<rect x="330" y="500" width="440" height="440" fill="url(#sky)"/><rect x="330" y="880" width="440" height="60" fill="#c9d2bd"/>'
             '<path d="M330 560 C 450 540, 620 520, 770 556" stroke="#9c8676" stroke-width="12" fill="none"/>'
             '<rect id="fog" x="330" y="500" width="440" height="440" fill="#a49b9d"/></g>')
    swing = ('<g transform="rotate(4 550 780)"><g id="swing" style="transform-origin:560px 548px" filter="url(#foil)">'
             '<rect x="503" y="548" width="6" height="290" fill="url(#goldV)"/><rect x="613" y="544" width="6" height="294" fill="url(#goldV)"/>'
             '<rect x="490" y="834" width="142" height="16" rx="4" fill="url(#goldH)"/></g></g>')
    svg_ = velvet(17, (.3, .25), 'blush') + photo + scene + swing
    html = (eyebrow(84, 200, 'Margin notes') + txt(80, 250, 920, 'I miss the version of me who…', 92, lh=1.02) +
            txt(84, 1110, 900, "She's waiting for me to let her play again.", 52, a=10.6, italic=True, gold=True, weight=500))
    js = '''window.custom=t=>{document.getElementById('fog').style.opacity=1-ease(clamp((t+0.6)/10));
 const sw=t>10?Math.sin((t-10)*2.6)*12*clamp((t-10)/1.5):0;document.getElementById('swing').style.transform=`rotate(${sw}deg)`;};'''
    return page(svg_, html, False, 'A KID AT HEART', 'NO. 03'), js

# ------------------------------------------------------------------ 9 Nov · one word (post)
def d1109(d):
    r = random.Random(7)
    top = [(84 + i * 30, 900 + r.uniform(-7, 7)) for i in range(31)]
    bot = [(84 + i * 30, 1010 + r.uniform(-9, 9)) for i in range(31)][::-1]
    leaf = 'M' + ' L'.join(f'{x:.0f} {y:.0f}' for x, y in top + bot) + ' Z'
    creases = ''.join(f'<path d="M{r.uniform(100,980):.0f} {r.uniform(900,1010):.0f} l{r.uniform(-60,60):.0f} {r.uniform(-30,30):.0f}" stroke="#7d5518" stroke-width="1.4" opacity=".55"/>' for _ in range(40))
    svg_ = velvet(18, (.35, .2), 'cream') + halo(f'<path d="{leaf}" fill="#c8923a"/>', .3) + foil(f'<path d="{leaf}" fill="url(#goldH)"/>' + flecks(41, 34, (90, 860, 990, 1050), (4, 14), (.6, 1))) + creases
    html = (eyebrow(84, 220, 'One word · No explanation') +
            txt(80, 300, 920, 'Healing<br><i>feels like</i>', 178, lh=.9, extra='letter-spacing:-.015em') +
            txt(88, 720, 900, 'Fill the gold in the comments.', 40, italic=True, extra='opacity:.8'))
    return page(svg_, html, False, "I'LL GO FIRST", 'NO. 02')

# ------------------------------------------------------------------ 10 Nov · crumpled → mended (reel)
def d1110(d):
    r = random.Random(19)
    pts = [(r.uniform(190, 890), r.uniform(580, 1100)) for _ in range(30)]
    cre = ''
    for a in pts:
        b = min(pts, key=lambda p: (p[0]-a[0])**2 + (p[1]-a[1])**2 if p != a else 1e9)
        cre += f'<line x1="{a[0]:.0f}" y1="{a[1]:.0f}" x2="{b[0]:.0f}" y2="{b[1]:.0f}" stroke="#7a6460" stroke-width="2"/>'
    seams = crack_shape(jag((160, 780), (920, 830), 8, 40, 3), 9, 3)
    seam2 = crack_shape(jag((420, 760), (520, 1140), 6, 30, 5), 6, 5)
    sheet = f'<rect x="160" y="560" width="760" height="580" fill="#fbf6ee"/><rect x="160" y="560" width="760" height="580" filter="url(#grain)"/>'
    svg_ = (velvet(19, (.3, .25), 'peach') + f'<g id="pg" style="transform-origin:540px 850px">{sheet}<g id="cre" opacity=".4">{cre}</g>' +
            f'<g class="wipe" data-a="10" data-b="12">{halo(f"<path d=\'{seams}\' fill=\'#f2c56a\'/>", .4)}{foil(f"<path d=\'{seams}\' fill=\'url(#gold)\'/><path d=\'{seam2}\' fill=\'url(#gold)\'/>")}</g></g>')
    html = (T(84, 200, 400, '<div class="cap" style="font-size:22px;opacity:.75">Then</div>') +
            txt(80, 240, 920, "I couldn't talk about it without crying.", 72, italic=True, lh=1.02, extra='color:#9a8687') +
            T(84, 420, 400, f'<div class="cap gold" style="font-size:22px" {ani(7.6)}>Now</div>') +
            txt(80, 452, 920, 'I can tell the story.', 92, a=8, gold=True, italic=True, weight=500))
    js = '''window.custom=t=>{const p=ease(clamp((t+0.4)/9.5));const g=document.getElementById('pg');
 g.style.transform=`scale(${0.32+0.68*p}) rotate(${(1-p)*-24}deg)`;document.getElementById('cre').style.opacity=0.6-0.42*p;};'''
    return page(svg_, html, False, 'THEN / NOW', 'NO. 02'), js

# ------------------------------------------------------------------ 11 Nov · team photo (post)
def d1111(d):
    s = ''
    for i, (x, rot, col) in enumerate([(110, -3, '#ebe5dc'), (400, 1.5, '#efe3dc'), (690, -1.5, '#ebe5dc')]):
        s += f'<g transform="rotate({rot} {x+140} 830)">' + paper_card(x, 640, 280, 360, 0, '#fbf8f3') + f'<rect x="{x+18}" y="658" width="244" height="270" fill="{col}"/>'
        s += '</g>'
    gilt = foil('<g transform="rotate(1.5 540 830)"><rect x="400" y="640" width="280" height="360" fill="none" stroke="url(#gold)" stroke-width="14"/></g>')
    svg_ = velvet(20, (.3, .25), 'butter') + s + halo('<rect x="400" y="640" width="280" height="360" fill="none" stroke="#f2c56a" stroke-width="40"/>', .35) + gilt
    html = (eyebrow(84, 200, 'The 9-to-5 Edition') + txt(80, 250, 920, "Read this if you've smiled in a team photo on your worst week.", 80, lh=1.02) +
            txt(400, 1040, 600, 'the real week', 50, italic=True, gold=True, weight=500))
    return page(svg_, html, False, 'TEAM PHOTO', 'NO. 06')

# ------------------------------------------------------------------ 12 Nov · two boats (reel)
def d1112(d):
    def boat(id_):
        return (f'<g id="{id_}"><path d="M-110 0 L110 0 L70 50 L-70 50 Z" fill="#fbf7f1" stroke="#9c8a86" stroke-width="2.5"/>'
                f'<path d="M-10 0 L10 -120 L70 0 Z" fill="#f6efe6" stroke="#9c8a86" stroke-width="2.5"/></g>')
    s = '<g>' + ''.join(f'<path class="wv" data-k="{k}" stroke="#9c8a86" stroke-opacity="{.5-k*.05:.2f}" stroke-width="2" fill="none"/>' for k in range(7)) + '</g>'
    s += boat('b1') + boat('b2')
    s += '<path id="tangle" d="M420 905 C 480 840, 520 980, 470 900 C 430 840, 600 860, 560 930 C 520 990, 640 880, 670 900" stroke="#9a9093" stroke-width="4" fill="none"/>'
    s += '<g filter="url(#foil)"><path id="rope" stroke="url(#goldH)" stroke-width="8" fill="none" stroke-linecap="round"/></g>'
    svg_ = velvet(21, (.3, .25), 'lilac') + s
    html = (eyebrow(84, 200, 'Everyone says', b=7) + txt(80, 250, 920, 'Fix it right now.', 110, b=7) +
            txt(80, 230, 920, 'Sometimes a little space', 96, a=7.4, lh=1.02) +
            txt(80, 340, 920, 'is what softens it.', 110, a=9, italic=True, gold=True, weight=500))
    js = '''window.custom=t=>{const calm=ease(clamp((t-7)/5));
 document.querySelectorAll('.wv').forEach(p=>{const k=+p.dataset.k;const y=930+k*34;const amp=Math.max(3,(24-k*3))*(1-calm*0.8);let d=`M40 ${y}`;
  for(let x=40;x<=1040;x+=20){d+=` L${x} ${y+Math.sin(x/38+t*2.2+k)*amp}`;}p.setAttribute('d',d);});
 const sep=ease(clamp((t-7.5)/4))*70;const bob=a=>Math.sin(t*2.4+a)*(8*(1-calm*0.7));
 document.getElementById('b1').setAttribute('transform',`translate(${330-sep} 880) rotate(${bob(0)})`);
 document.getElementById('b2').setAttribute('transform',`translate(${760+sep} 870) rotate(${bob(1.5)})`);
 document.getElementById('tangle').style.opacity=1-ease(clamp((t-7)/1.6));
 const r=document.getElementById('rope');const x1=420-sep,x2=670+sep;r.setAttribute('d',`M${x1} 905 Q ${(x1+x2)/2} 965 ${x2} 900`);r.style.opacity=ease(clamp((t-8)/1.5));};'''
    return page(svg_, html, False, 'THE 9-TO-5 EDITION', 'NO. 07'), js

# ------------------------------------------------------------------ 13 Nov · two cups (carousel cover)
def d1113(d):
    s = ''
    for x in (330, 590):
        s += (f'<path d="M{x} 880 L{x+160} 880 C {x+156} 950, {x+120} 990, {x+80} 990 C {x+40} 990, {x+4} 950, {x} 880 Z" fill="#fbf7f0" stroke="#5a3d45" stroke-width="2"/>'
              f'<path d="M{x+157} 900 C {x+196} 896, {x+196} 940, {x+146} 948" fill="none" stroke="#5a3d45" stroke-width="2"/>'
              f'<path d="M{x-30} 1004 C {x+40} 1016, {x+120} 1016, {x+190} 1004" stroke="#5a3d45" stroke-width="2" fill="none"/>'
              f'<path d="M{x+2} 892 L {x+158} 892" stroke="url(#goldH)" stroke-width="3"/>')
    steam = 'M410 860 C 390 740, 310 640, 390 575 C 450 530, 530 555, 540 615'
    steam2 = 'M670 860 C 690 740, 770 640, 690 575 C 630 530, 550 555, 540 615'
    svg_ = velvet(22, (.3, .25), 'rose') + s + halo(f'<path d="{steam}" stroke="#f2c56a" stroke-width="30" fill="none"/><path d="{steam2}" stroke="#f2c56a" stroke-width="30" fill="none"/>', .3) + \
        foil(f'<path d="{steam}" stroke="url(#goldV)" stroke-width="5" fill="none" stroke-linecap="round"/><path d="{steam2}" stroke="url(#goldV)" stroke-width="5" fill="none" stroke-linecap="round"/>')
    html = (eyebrow(84, 200, "I'll go first") + txt(80, 250, 920, 'Send this to the colleague who…', 100, lh=1.02) +
            txt(84, 1080, 700, "…asks if you've eaten.", 56, italic=True, gold=True, weight=500) + swipe(5))
    return page(svg_, html, False, 'TAG THEM', 'NO. 03')

# ------------------------------------------------------------------ 14 Nov · birds (reel)
def d1114(d):
    r = random.Random(23); s = ''
    for k in range(9):
        y = 560 + k * 56
        s += f'<line x1="92" y1="{y+22}" x2="990" y2="{y+22}" stroke="#c9bfd0" stroke-opacity=".7"/>'
        s += f'<path d="M110 {y} L {300+r.uniform(150,500):.0f} {y}" stroke="#a89a98" stroke-width="5" stroke-linecap="round" opacity=".55"/>'
        if k < 8:
            s += f'<path class="draw" data-a="{-0.5+k*1.05:.2f}" data-b="{0.1+k*1.05:.2f}" d="M100 {y+r.uniform(-6,6):.0f} L {320+r.uniform(150,480):.0f} {y+r.uniform(-6,6):.0f}" stroke="#7d6c6c" stroke-width="3" fill="none"/>'
    s += f'<path id="last" d="M110 1008 L 640 1008" stroke="url(#goldH)" stroke-width="6" stroke-linecap="round" filter="url(#foil)"/>'
    s += '<g filter="url(#foil)">' + ''.join(f'<path class="bird" data-i="{i}" d="M-46 4 Q -22 -16 0 0 Q 22 -16 46 4" stroke="url(#gold)" stroke-width="3.5" fill="none" stroke-linecap="round"/>' for i in range(6)) + '</g>'
    svg_ = velvet(23, (.3, .25), 'cream') + s
    html = (eyebrow(84, 200, 'Margin notes') + txt(80, 250, 920, "Read this if you've forgiven everyone except yourself.", 84, lh=1.02) +
            txt(84, 1100, 700, 'Start with her.', 70, a=12, italic=True, gold=True, weight=500))
    js = '''window.custom=t=>{const p=clamp((t-9.6)/4.5);document.getElementById('last').style.opacity=1-ease(clamp((t-9.6)/1.2));
 document.querySelectorAll('.bird').forEach(b=>{const i=+b.dataset.i;const q=ease(clamp(p*1.3-i*.12));
 const x=160+i*120+q*(180+i*10), y=1008-q*(250+i*48);b.setAttribute('transform',`translate(${x} ${y}) scale(${1.0+0.4*(1-i/6)}) scale(1 ${1+Math.sin(t*10+i)*0.35})`);b.style.opacity=q>0?Math.min(1,q*3):0;});};'''
    return page(svg_, html, False, 'SELF-FORGIVENESS', 'NO. 04'), js

# ------------------------------------------------------------------ 15 Nov · name tags (post)
def d1115(d):
    x, y, w, h = 250, 600, 580, 400
    tag = (paper_card(x, y, w, h, -2, '#fbf7f0') +
           f'<g transform="rotate(-2 {x+w/2} {y+h/2})"><rect x="{x+24}" y="{y+24}" width="{w-48}" height="{h-48}" fill="none" stroke="#5a3d45" stroke-opacity=".35" stroke-width="1.5"/>'
           f'<text x="{x+w/2}" y="{y+120}" text-anchor="middle" font-family="Jost" font-weight="500" font-size="30" letter-spacing="12" fill="#5a3d45">HELLO</text>'
           f'<text x="{x+w/2}" y="{y+160}" text-anchor="middle" font-family="Jost" font-size="16" letter-spacing="7" fill="#5a3d45" opacity=".7">MY NAME IS</text>'
           f'<line x1="{x+90}" y1="{y+300}" x2="{x+w-90}" y2="{y+300}" stroke="#5a3d45" stroke-opacity=".4" stroke-width="1.5"/></g>')
    seam = crack_shape(jag((x-10, y+230), (x+w+10, y+190), 9, 30, 15), 10, 15)
    svg_ = velvet(24, (.3, .25), 'lilac') + tag + halo(f'<path d="{seam}" fill="#f2c56a"/>', .45) + foil(f'<path d="{seam}" fill="url(#gold)"/>')
    html = (eyebrow(84, 200, 'Notes from a debut author') + txt(80, 250, 920, 'Every name in my book is made up.', 88, lh=1.02) +
            txt(84, 1060, 920, 'Every feeling in it is real.', 76, italic=True, gold=True, weight=500))
    return page(svg_, html, False, 'THE CHARACTERS', 'NO. 08')

# ------------------------------------------------------------------ 16 Nov · 100 ordinary days (reel)
def d1116(d):
    r = random.Random(25); s = ''; cols = ['#dfe5d6', '#f1d8d2', '#f2e6c9', '#e6dce4', '#efe4d6']
    for i in range(100):
        x, y = 140 + (i % 10) * 82, 520 + (i // 10) * 60
        s += f'<rect x="{x}" y="{y}" width="74" height="52" rx="4" fill="none" stroke="#cbbdb6"/>'
        fill = 'url(#gold)' if i == 99 else r.choice(cols)
        s += f'<g {ani(-1 + i*0.12)} {"filter=" + chr(34) + "url(#foil)" + chr(34) if i == 99 else ""}><rect x="{x}" y="{y}" width="74" height="52" rx="4" fill="{fill}"/></g>'
    seam = crack_shape([(140, 548), (380, 640), (560, 760), (720, 900), (954, 1090)], 9, 25)
    svg_ = velvet(25, (.3, .25), 'sage') + s + f'<g class="wipe" data-a="11.6" data-b="13.4">{halo(f"<path d=\'{seam}\' fill=\'#f2c56a\'/>", .4)}{foil(f"<path d=\'{seam}\' fill=\'url(#gold)\'/>")}</g>'
    html = (eyebrow(84, 200, "Healing isn't one big moment") + txt(80, 250, 920, "It's a hundred small,", 96, a=-1, lh=1.02) +
            txt(80, 350, 920, 'ordinary days.', 110, a=4, italic=True, gold=True, weight=500) +
            T(700, 1140, 300, f'<div class="gold" id="cnt" style="font-family:Caveat;font-size:52px">day 100 of 100</div>'))
    js = "window.custom=t=>{const n=Math.max(1,Math.min(100,Math.floor((t+1)/0.12)+1));document.getElementById('cnt').textContent=`day ${n} of 100`;};"
    return page(svg_, html, False, 'THE 9-TO-5 EDITION', 'NO. 08'), js

# ------------------------------------------------------------------ 17 Nov · letterpress (post)
def d1117(d):
    words = ['A', 'SELF', 'REPAIRED', 'SOUL']; s = ''; y = 520
    for w in words:
        x = 110
        for ch in w:
            s += (f'<g filter="url(#foil)"><rect x="{x}" y="{y}" width="60" height="80" rx="5" fill="url(#gold)"/></g>'
                  f'<text x="{x+30}" y="{y+60}" text-anchor="middle" font-family="Cormorant Garamond" font-weight="600" font-size="56" fill="#6b4512" transform="scale(-1 1) translate({-2*(x+30)} 0)">{ch}</text>')
            x += 66
        y += 92
    card = paper_card(620, 860, 380, 300, 3)
    svg_ = velvet(26, (.3, .25), 'butter') + s + card
    html = (eyebrow(84, 200, 'Notes from a debut author') + txt(80, 250, 920, "Four words I've lived with for two years.", 84, lh=1.02) +
            T(660, 900, 320, '<div style="transform:rotate(3deg);font-size:60px;line-height:1">A Self Repaired <span class="gold" style="font-style:italic;font-weight:500">Soul</span></div>'))
    return page(svg_, html, False, 'REMEMBER THE NAME', 'NO. 09')

# ------------------------------------------------------------------ 18 Nov · 24 months (reel)
def d1118(d):
    r = random.Random(27); s = ''
    for k in range(6):
        s += paper_card(170 + k * 14, 480 + k * 10, 640, 660)
    x, y = 240, 530
    s += f'<g id="top" style="transform-origin:560px 530px">' + paper_card(x, y, 640, 660)
    s += f'<g filter="url(#foil)"><rect id="band" x="{x}" y="{y}" width="640" height="110" fill="url(#goldH)"/></g>'
    s += f'<text id="mon" x="{x+40}" y="{y+75}" font-family="Jost" font-size="34" letter-spacing="8" fill="#fff">MONTH 24</text>'
    for i in range(35):
        cx, cy = x + 30 + (i % 7) * 86, y + 150 + (i // 7) * 92
        s += f'<rect x="{cx}" y="{cy}" width="78" height="84" fill="none" stroke="#d6c9c0"/>'
        s += f'<path class="nt" data-r="{r.random():.3f}" d="M{cx+10} {cy+30} L {cx+64} {cy+31}" stroke="#9c8a86" stroke-width="2.5"/>'
        s += f'<path class="nt" data-r="{r.random():.3f}" d="M{cx+10} {cy+52} L {cx+48} {cy+52}" stroke="#9c8a86" stroke-width="2.5" opacity=".7"/>'
    s += '</g>'
    svg_ = velvet(27, (.3, .25), 'peach') + s
    html = (eyebrow(84, 200, 'Notes from a debut author') + txt(80, 250, 920, '24 months.', 130) +
            txt(84, 390, 920, 'Most of them looked like nothing from the outside.', 46, a=3.4, b=11.8, italic=True, lh=1.1) +
            txt(84, 385, 920, 'All of them are in this book.', 62, a=12.2, italic=True, gold=True, weight=500))
    js = '''window.custom=t=>{const m=Math.min(24,1+Math.floor(Math.max(0,t+0.4)/0.5));document.getElementById('mon').textContent=`MONTH ${m}`;
 document.getElementById('band').style.opacity=m===24?1:.35;
 const f=(Math.max(0,t+0.4)%0.5)/0.5;const g=document.getElementById('top');g.style.transform=m<24&&f>0.75?`rotateX(${(f-.75)*4*80}deg)`:'none';
 document.querySelectorAll('.nt').forEach(p=>{p.style.opacity=(+p.dataset.r < 0.35+0.4*Math.abs(Math.sin(m*1.7)))?1:0;});};'''
    return page(svg_, html, False, 'TWO YEARS', 'NO. 10'), js


# ====================== v3 heroes (stronger concepts) ======================
def _heart_pts(cx, cy, s, n=240, rot=0):
    pts = []
    for i in range(n + 1):
        t = 2 * math.pi * i / n
        x = 16 * math.sin(t) ** 3
        y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
        pts.append((cx + x * s, cy + y * s))
    return pts

def _path(pts, close=False):
    return 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts) + (' Z' if close else '')

# 24 Oct · the friend who stays on the call: a gold phone cord coiling into a heart
def d1024(d):
    base = _heart_pts(800, 650, 11.5, 600)
    coil = []
    for i, (x, y) in enumerate(base):
        (xa, ya), (xb, yb) = base[max(0, i - 1)], base[min(len(base) - 1, i + 1)]
        dx, dy = xb - xa, yb - ya; l = math.hypot(dx, dy) or 1
        tx, ty, nx, ny = dx / l, dy / l, -dy / l, dx / l
        a = i * .62
        coil.append((x + 16 * math.cos(a) * nx + 10 * math.sin(a) * tx, y + 16 * math.cos(a) * ny + 10 * math.sin(a) * ty))
    tail = [(800 + 0, 650 + 13 * 11.5 - 40 + k * 9, ) for k in range(0)]
    cord = _path(coil)
    lead = 'M800 806 C 790 900, 640 930, 560 1010'
    svg_ = (velvet(3, (.3, .2), 'cream') + halo(f'<path d="{cord}" stroke="#f2c56a" stroke-width="22" fill="none"/>', .35) +
            foil(f'<path d="{cord}" stroke="url(#gold)" stroke-width="4.2" fill="none" stroke-linejoin="round"/><path d="{lead}" stroke="url(#gold)" stroke-width="4.2" fill="none"/>'))
    rows = [('A song', 'your 1 a.m. playlist'), ('A season', 'the first cool morning after summer'), ('A place', 'the warm corner of your bed')]
    h, y = '', 470
    for q, a in rows:
        h += T(84, y, 520, f'<div class="cap" style="font-size:17px;opacity:.7">{q}</div>') + txt(84, y + 28, 540, a, 44, italic=True, lh=1.05)
        y += 140
    html = (eyebrow(84, 200, 'Four questions about my book') + txt(80, 250, 920, 'If my book were…', 116) + h +
            T(84, 1000, 300, '<div class="cap gold" style="font-size:18px">A person</div>') +
            txt(80, 1032, 920, 'the friend who stays on the call till you fall asleep.', 60, italic=True, gold=True, weight=500, lh=1.02))
    return page(svg_, html, False, "I'LL GO FIRST", 'NO. 01')

# 25 Oct · the song before work: a gold equaliser rising like a sunrise over the day
def d1025(d):
    bars = ''
    n = 29
    for i in range(n):
        u = (i - (n - 1) / 2) / ((n - 1) / 2)
        hmax = 330 * math.sqrt(max(0, 1 - u * u)) + 30
        x = 540 + u * 430 - 9
        bars += f'<rect class="eq" data-h="{hmax:.0f}" data-i="{i}" x="{x:.0f}" y="980" width="18" height="10" rx="9" fill="url(#goldV)"/>'
    svg_ = (velvet(4, (.5, .55), 'cream') +
            '<radialGradient id="sun" cx=".5" cy=".73" r=".42"><stop offset="0" stop-color="#f6d58e" stop-opacity=".55"/><stop offset="1" stop-color="#f6d58e" stop-opacity="0"/></radialGradient>'
            '<rect width="1080" height="1350" fill="url(#sun)"/>' +
            f'<g filter="url(#foil)">{bars}<rect x="84" y="990" width="912" height="5" fill="url(#goldH)"/></g>')
    html = (eyebrow(84, 200, 'The 9-to-5 Edition') +
            txt(80, 250, 920, 'The song you play in the parking lot before work', 92, lh=1.02) +
            txt(84, 1040, 900, 'counts as healing too.', 84, a=10.8, italic=True, gold=True, weight=500))
    js = '''window.custom=t=>{document.querySelectorAll('.eq').forEach(b=>{const i=+b.dataset.i,H=+b.dataset.h;
 const rise=ease(clamp((t+0.8)/6));const beat=.72+.28*Math.abs(Math.sin(t*3.1+i*.55))*Math.abs(Math.cos(t*1.7+i*.31));
 const h=Math.max(10,H*rise*beat);b.setAttribute('height',h.toFixed(0));b.setAttribute('y',(985-h).toFixed(0));});};'''
    return page(svg_, html, False, 'MONDAY MORNING', 'NO. 01'), js

# 26 Oct · five-year plan: the straight grey route vs the gold detour that mattered
def d1026(d):
    pins = ''.join(f'<path d="M{x} 700 l-9 -22 a 9 9 0 1 1 18 0 z" fill="#b3a7a3"/><text x="{x}" y="740" text-anchor="middle" font-family="Jost" font-size="15" letter-spacing="3" fill="#9c8e8a">{lab}</text>'
                   for x, lab in [(170, 'YEAR 1'), (390, 'YEAR 2'), (610, 'YEAR 3'), (830, 'YEAR 5')])
    route = '<path d="M120 700 L 960 700" stroke="#b3a7a3" stroke-width="4" stroke-dasharray="2 14" stroke-linecap="round"/>'
    detour = 'M390 700 C 420 820, 260 900, 330 990 C 400 1080, 620 1010, 700 1060 C 760 1100, 800 1080, 830 1050'
    svg_ = (velvet(5, (.4, .3), 'cream') + route + pins +
            f'<g {ani(1)}>' + halo(f'<path d="{detour}" stroke="#f2c56a" stroke-width="40" fill="none"/>', .35) + '</g>' +
            f'<g filter="url(#foil)">{drawp(detour, 0, 3, 9)}<path d="M830 1050 l-30 -8 l22 -22 z" fill="url(#gold)"/></g>')
    html = (eyebrow(84, 200, 'Notes from a debut author') +
            txt(80, 250, 900, 'Writing a book was never in my five-year plan.', 84, lh=1.02) +
            txt(640, 1090, 360, 'Write a book.', 64, italic=True, gold=True, weight=500) + swipe(5))
    return page(svg_, html, False, 'MONDAY', 'NO. 02')

# 27 Oct · it ends up rewriting you: a gold butterfly rising out of an open book
def d1027(d):
    wing_u = 'M0 0 C 20 -90, 150 -160, 190 -80 C 210 -30, 120 10, 0 0 Z'
    wing_l = 'M0 6 C 80 20, 150 70, 120 140 C 90 190, 20 110, 0 6 Z'
    veins = '<path d="M0 0 C 60 -40, 120 -80, 170 -80 M0 0 C 70 -10, 120 -20, 160 -40 M0 6 C 50 40, 90 80, 110 130" stroke="#7d5518" stroke-width="2" fill="none" opacity=".6"/>'
    wing = f'<g class="wingR">{halo(f"<path d={chr(39)}{wing_u}{chr(39)} fill={chr(39)}#f2c56a{chr(39)}/>", .35)}{foil(f"<path d={chr(39)}{wing_u}{chr(39)} fill={chr(39)}url(#gold){chr(39)}/><path d={chr(39)}{wing_l}{chr(39)} fill={chr(39)}url(#gold){chr(39)}/>")}{veins}</g>'
    bfly = (f'<g id="bfly"><g transform="scale(-1 1)"><g class="wingS">{wing}</g></g><g class="wingS">{wing}</g>'
            '<rect x="-7" y="-60" width="14" height="140" rx="7" fill="url(#goldV)" filter="url(#foil)"/>'
            '<path d="M-3 -58 C -20 -100, -40 -110, -52 -118 M3 -58 C 20 -100, 40 -110, 52 -118" stroke="url(#gold)" stroke-width="3" fill="none"/></g>')
    book = ''
    for k in range(6):
        o = k * 5
        book += (f'<path d="M540 {1092+o} C 440 {1046+o}, 290 {1046+o}, 160 {1074+o} L 160 {1086+o} C 290 {1058+o}, 440 {1058+o}, 540 {1104+o} Z" fill="#f4ede3" stroke="#d5c7ba" stroke-width="1"/>'
                 f'<path d="M540 {1092+o} C 640 {1046+o}, 790 {1046+o}, 920 {1074+o} L 920 {1086+o} C 790 {1058+o}, 640 {1058+o}, 540 {1104+o} Z" fill="#f4ede3" stroke="#d5c7ba" stroke-width="1"/>')
    book += ('<path d="M540 1088 C 440 1040, 290 1040, 160 1068 C 290 1050, 440 1052, 540 1096 Z" fill="#fbf8f2"/>'
             '<path d="M540 1088 C 640 1040, 790 1040, 920 1068 C 790 1050, 640 1052, 540 1096 Z" fill="#fbf8f2"/>'
             '<path d="M160 1068 L160 1112 M920 1068 L920 1112" stroke="url(#goldV)" stroke-width="5"/>'
             '<path d="M540 1088 L 540 1132" stroke="url(#goldV)" stroke-width="4"/>')
    book += ''.join(f'<path d="M{520-j*0} {1080-j*0} " />' for j in range(0))
    book += ''.join(f'<path d="M{200+i*28} {1066-math.sin(i/12*math.pi)*16:.0f} L {200+i*28+20} {1066-math.sin(i/12*math.pi)*16:.0f}" stroke="#cdbfb3" stroke-width="1.5"/>' for i in range(0))
    book = f'<g transform="translate(0 40)">{book}</g>'
    trail = ''.join(f'<path class="trail" data-k="{k}" d="M0 -3 L2 0 L0 3 L-2 0 Z" fill="url(#gold)"/>' for k in range(18))
    svg_ = velvet(6, (.5, .45), 'cream') + book + trail + bfly
    html = (eyebrow(84, 200, 'Margin notes') +
            txt(80, 250, 900, 'Day 1.', 150, b=3.2) + txt(80, 250, 900, 'Day 300.', 150, a=3.4, b=6.6) + txt(80, 250, 900, 'Day 730.', 150, a=6.8, b=10.1) +
            txt(80, 250, 920, 'I started writing a book.', 82, a=10.3, lh=1.02) +
            txt(80, 345, 920, 'It ended up rewriting me.', 82, a=11.2, italic=True, gold=True, weight=500, lh=1.02))
    js = '''window.custom=t=>{const p=ease(clamp((t+0.5)/11));const x=540+Math.sin(t*.7)*60*p, y=1060-p*420+Math.sin(t*1.3)*14;
 const flap=.35+.65*Math.abs(Math.cos(t*4.2));const sc=.55+.45*p;
 document.getElementById('bfly').setAttribute('transform',`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${sc.toFixed(3)}) rotate(${(Math.sin(t*.9)*8).toFixed(1)})`);
 document.querySelectorAll('.wingS').forEach(w=>w.setAttribute('transform',`scale(${flap.toFixed(3)} 1)`));
 document.querySelectorAll('.trail').forEach(d=>{const k=+d.dataset.k;const q=clamp(p-k*.03);const tx=540+Math.sin((t-k*.12)*.7)*60*q+Math.sin(k*2.1)*18,ty=1060-q*420+k*16;
  d.setAttribute('transform',`translate(${tx.toFixed(1)} ${ty.toFixed(1)}) scale(${(1.6-k*.05).toFixed(2)})`);d.style.opacity=(q>0?(1-k/18)*.9:0).toFixed(2);});};'''
    return page(svg_, html, False, 'TWO YEARS', 'NO. 01'), js

# 31 Oct · a no doesn't need three paragraphs: the paragraphs collapse into one gold word
def d1031(d):
    r = random.Random(31); paras = ''
    for k in range(3):
        y0 = 520 + k * 190
        lines = ''.join(f'<rect x="84" y="{y0 + j*34}" width="{r.uniform(520, 900) if j < 3 else r.uniform(260, 520):.0f}" height="12" rx="6" fill="#c9bdb6"/>' for j in range(4))
        paras += f'<g class="para" data-k="{k}" style="transform-origin:540px {y0+60}px">{lines}</g>'
    svg_ = velvet(9, (.3, .25), 'cream') + paras
    html = (eyebrow(84, 200, 'The 9-to-5 Edition') +
            txt(80, 250, 920, "A no doesn't need three paragraphs.", 88, lh=1.02) +
            T(70, 470, 960, f'<div class="gold" {ani(7.6)} style="font-size:420px;line-height:1;font-weight:500;letter-spacing:-.02em">No.</div>') +
            txt(84, 1020, 900, "You're allowed to choose you.", 70, a=10.4, italic=True, gold=True, weight=500))
    js = '''window.custom=t=>{document.querySelectorAll('.para').forEach(g=>{const k=+g.dataset.k;const p=ease(clamp((t-3.2-k*.9)/1.6));
 g.style.transform=`translateY(${p*(150-k*190)}px) scaleY(${1-p*.92}) scaleX(${1-p*.35})`;g.style.opacity=(1-p).toFixed(2);});};'''
    return page(svg_, html, False, 'BOUNDARIES', 'NO. 03'), js

# 2 Nov · then / now: an anxious grey signal that calms into one gold wave
def d1102(d):
    svg_ = (velvet(11, (.4, .4), 'cream') +
            '<path id="wGrey" stroke="#9a8f92" stroke-width="2.4" fill="none" stroke-linejoin="round"/>' +
            f'<g {ani(9.5)}><path id="wGlow" stroke="#f2c56a" stroke-width="40" fill="none" filter="url(#glow)" opacity=".4"/></g>' +
            '<g filter="url(#foil)"><path id="wGold" stroke="url(#goldH)" stroke-width="8" fill="none" stroke-linecap="round"/></g>')
    html = (T(84, 200, 400, '<div class="cap" style="font-size:22px;opacity:.75">Then</div>') +
            txt(80, 240, 920, 'One message on "seen" ran my whole night.', 76, italic=True, lh=1.02, extra='color:#8d7f80') +
            T(84, 940, 400, f'<div class="cap gold" style="font-size:22px" {ani(7.4)}>Now</div>') +
            txt(80, 980, 920, 'Same message.', 80, a=8.2) + txt(80, 1070, 920, 'Softer me.', 110, a=9.2, italic=True, gold=True, weight=500))
    js = '''const H=(i)=>{const s=Math.sin(i*12.9898)*43758.5453;return s-Math.floor(s);};
window.custom=t=>{const m=ease(clamp((t-5)/5.5));let d='';
 for(let x=60,i=0;x<=1020;x+=8,i++){const jag=(H(i+Math.floor(t*9))-.5)*2*150*(1-m)*(.6+.4*Math.sin(i*.3));
  const calm=46*Math.sin(x/120+t*1.4)*m;const y=720+jag+calm;d+=(i?' L':'M')+x+' '+y.toFixed(1);}
 const g=document.getElementById('wGrey');g.setAttribute('d',d);g.style.opacity=(1-m).toFixed(2);
 const go=document.getElementById('wGold');go.setAttribute('d',d);go.style.opacity=m.toFixed(2);document.getElementById('wGlow').setAttribute('d',d);};'''
    return page(svg_, html, False, 'THEN / NOW', 'NO. 01'), js

# 11 Nov · the smile in the team photo: a gold smile held over a softer, sadder line
def d1111(d):
    frame_ = paper_card(300, 520, 480, 560, -2, '#fbf8f3')
    inner = ('<g transform="rotate(-2 540 800)"><rect x="330" y="550" width="420" height="420" fill="#efe7df"/>'
             '<path d="M410 840 C 470 800, 610 800, 670 840" stroke="#a89a98" stroke-width="3" fill="none" opacity=".55"/></g>')
    smile = 'M395 760 C 460 830, 620 830, 685 760'
    gold_smile = (f'<g transform="rotate(-2 540 800)">' + halo(f'<path d="{smile}" stroke="#f2c56a" stroke-width="40" fill="none"/>', .45) +
                  foil(f'<path d="{smile}" stroke="url(#gold)" stroke-width="14" fill="none" stroke-linecap="round"/>') +
                  foil('<path d="M690 800 C 704 826, 712 846, 700 860 C 690 870, 674 866, 672 852 C 670 838, 682 822, 690 800 Z" fill="url(#gold)"/>') + '</g>')
    svg_ = velvet(20, (.3, .25), 'cream') + frame_ + inner + gold_smile
    html = (eyebrow(84, 200, 'The 9-to-5 Edition') + txt(80, 250, 920, "Read this if you've smiled in a team photo on your worst week.", 78, lh=1.02) +
            txt(560, 1100, 440, 'the real week, underneath', 44, italic=True, gold=True, weight=500))
    return page(svg_, html, False, 'TEAM PHOTO', 'NO. 06')

# 12 Nov · a little space softens it: two tangled gold ribbons loosen into two calm waves
def d1112(d):
    svg_ = (velvet(21, (.4, .45), 'cream') +
            '<g filter="url(#foil)"><path id="ra" stroke="url(#goldH)" stroke-width="10" fill="none" stroke-linecap="round"/>'
            '<path id="rb" stroke="url(#gold)" stroke-width="10" fill="none" stroke-linecap="round" opacity=".85"/></g>')
    html = (eyebrow(84, 200, 'Everyone says', b=7) + txt(80, 250, 920, 'Fix it right now.', 110, b=7) +
            txt(80, 230, 920, 'Sometimes a little space', 96, a=7.4, lh=1.02) +
            txt(80, 340, 920, 'is what softens it.', 110, a=9, italic=True, gold=True, weight=500))
    js = '''window.custom=t=>{const m=ease(clamp((t-6.5)/5));let a='',b='';
 for(let x=60,i=0;x<=1020;x+=10,i++){const tight=Math.sin(x/22+t*3)*70*(1-m), loose=Math.sin(x/150+t*1.2)*40*m, gap=110*m;
  a+=(i?' L':'M')+x+' '+(820+tight+loose-gap/2).toFixed(1); b+=(i?' L':'M')+x+' '+(820-tight+loose*.9+gap/2).toFixed(1);}
 document.getElementById('ra').setAttribute('d',a);document.getElementById('rb').setAttribute('d',b);};'''
    return page(svg_, html, False, 'THE 9-TO-5 EDITION', 'NO. 07'), js

# 14 Nov · start with her: a porcelain heart, broken and mended in gold
def d1114(d):
    heart = _path(_heart_pts(540, 760, 17), True)
    crack = crack_shape(jag((540, 560), (560, 1010), 9, 46, 14), 10, 14, taper=True)
    br = crack_shape(jag((520, 760), (370, 700), 4, 20, 15), 5, 15)
    svg_ = (velvet(23, (.4, .35), 'cream') +
            f'<path d="{heart}" fill="#7a5a4e" opacity=".18" filter="url(#glowS)" transform="translate(10 22)"/>'
            f'<path d="{heart}" fill="#fbf7f1" stroke="#d8cbc0" stroke-width="2"/>'
            '<radialGradient id="por" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#e9ddd3" stop-opacity=".6"/></radialGradient>'
            f'<path d="{heart}" fill="url(#por)"/>' +
            f'<g class="wipe" data-a="8" data-b="11">' + halo(f'<path d="{crack}" fill="#f2c56a"/>', .5) + foil(f'<path d="{crack}" fill="url(#gold)"/><path d="{br}" fill="url(#gold)"/>') + '</g>')
    html = (eyebrow(84, 200, 'Margin notes') + txt(80, 250, 920, "Read this if you've forgiven everyone except yourself.", 80, lh=1.02) +
            txt(84, 1100, 700, 'Start with her.', 74, a=11.6, italic=True, gold=True, weight=500))
    js = "window.custom=t=>{const h=document.querySelector('.wipe');if(h){const v=ease(clamp((t-8)/3));h.style.clipPath=`inset(0 0 ${100-v*100}% 0)`;}};"
    return page(svg_, html, False, 'SELF-FORGIVENESS', 'NO. 04'), js

# 15 Nov · every feeling is real: invented names fade, a gold fingerprint stays
def d1115(d):
    r = random.Random(115); ridges = ''
    cx, cy = 540, 760
    for k in range(22):
        rx, ry = 18 + k * 9.5, 28 + k * 11.5
        gap = r.uniform(0, 6.28); span = 6.28 - (0.5 if k % 3 else 1.1)
        pts = []
        for i in range(90):
            a = gap + span * i / 89
            wob = 1 + .035 * math.sin(3 * a + k) + .02 * math.sin(7 * a + k * 1.7)
            pts.append((cx + rx * wob * math.cos(a), cy + ry * wob * math.sin(a) - k * 1.5))
        ridges += f'<path class="draw" data-a="{2 + k*.26:.2f}" data-b="{3.2 + k*.26:.2f}" d="{_path(pts)}" stroke="url(#gold)" stroke-width="3.6" fill="none" stroke-linecap="round"/>'
    names = ''
    for i, (x, y, rot) in enumerate([(120, 560, -4), (700, 600, 3), (150, 980, 2), (720, 1010, -3), (430, 470, 1)]):
        names += T(x, y, 300, f'<div class="nm" {ani(-1, 7 + i*.4)} style="font-family:Caveat;font-size:48px;color:#a89a98;transform:rotate({rot}deg)">a made-up name</div>')
    svg_ = (velvet(24, (.45, .45), 'cream') + f'<g {ani(6)}>' + halo(f'<g>{ridges.replace("class=" + chr(34) + "draw" + chr(34), "")}</g>', .35) + '</g>' +
            f'<g filter="url(#foil)">{ridges}</g>')
    html = (eyebrow(84, 200, 'Notes from a debut author') + txt(80, 250, 920, 'Every name in my book is made up.', 86, lh=1.02) + names +
            txt(84, 1100, 920, 'Every feeling in it is real.', 76, a=8.6, italic=True, gold=True, weight=500))
    return page(svg_, html, False, 'THE CHARACTERS', 'NO. 08')

# 17 Nov · four words: the title itself, broken and mended in gold
def d1117(d):
    title = ('<text x="84" y="700" font-family="Cormorant Garamond" font-weight="500" font-size="170" fill="url(#goldH)" letter-spacing="-2">A Self</text>'
             '<text x="84" y="860" font-family="Cormorant Garamond" font-weight="500" font-size="170" fill="url(#goldH)" letter-spacing="-2">Repaired</text>'
             '<text x="84" y="1020" font-family="Cormorant Garamond" font-weight="500" font-style="italic" font-size="170" fill="url(#goldH)" letter-spacing="-2">Soul</text>')
    crack_pts = jag((60, 600), (760, 1030), 14, 60, 17)
    crack_line = _path(crack_pts)
    svg_ = (velvet(26, (.35, .3), 'cream') + f'<clipPath id="tc">{title}</clipPath>' + foil(title) +
            f'<g clip-path="url(#tc)"><path d="{crack_line}" stroke="#f6f0e6" stroke-width="16" fill="none" stroke-linejoin="round"/>'
            f'<path d="{crack_line}" stroke="#6b4512" stroke-width="3.2" fill="none" stroke-linejoin="round"/></g>')
    html = (eyebrow(84, 200, 'Notes from a debut author') + txt(80, 250, 920, "Four words I've lived with for two years.", 82, lh=1.02) +
            txt(84, 1090, 900, 'Broken in places. Mended in gold.', 50, italic=True, extra='opacity:.85'))
    return page(svg_, html, False, 'REMEMBER THE NAME', 'NO. 09')

DESIGNS = {k[1:5] and f"2026-{k[1:3]}-{k[3:5]}": v for k, v in globals().items() if k.startswith('d1') and callable(v)}

BASE_JS = '''
const clamp=x=>Math.max(0,Math.min(1,x)), ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const els=[...document.querySelectorAll('[data-a]:not(.draw):not(.wipe)')];
const draws=[...document.querySelectorAll('.draw')], wipes=[...document.querySelectorAll('.wipe')];
draws.forEach(p=>{const L=p.getTotalLength();p._L=L;p.style.strokeDasharray=L;});
function base(t){
  for(const el of els){const a=+el.dataset.a,b=+el.dataset.b;const v=ease(clamp((t-a)/.6))*(1-ease(clamp((t-b)/.45)));
    el.style.opacity=v; if(!(el instanceof SVGElement)) el.style.translate=`0 ${(1-v)*22}px`;}
  for(const p of draws){const a=+p.dataset.a,b=+p.dataset.b;const v=clamp((t-a)/(b-a));p.style.strokeDashoffset=p._L*(1-v);}
  for(const w of wipes){const a=+w.dataset.a,b=+w.dataset.b;const v=ease(clamp((t-a)/(b-a)));w.style.clipPath=`inset(0 ${100-v*100}% 0 0)`;}
}
const ribs=[...document.querySelectorAll('.rib')], ribe=[...document.querySelectorAll('.ribe')], dust=[...document.querySelectorAll('.dust')], fls=[...document.querySelectorAll('.fl')];
function amb(t){
  ribs.forEach((p,k)=>{const y0=+p.dataset.y,A=+p.dataset.a,f=+p.dataset.f,sp=+p.dataset.s,w=+p.dataset.w,ph=+p.dataset.ph;
    let up='',lo=[];for(let x=-40;x<=1120;x+=20){const y=y0+A*Math.sin(x*f+t*sp+ph)+.4*A*Math.sin(x*f*2.3-t*sp*.7);
      const ww=w*(.55+.45*Math.sin(x*f*.8+t*sp*.5+ph));up+=(x<-30?'M':' L')+x+' '+y.toFixed(1);lo.push(x+' '+(y+ww).toFixed(1));}
    p.setAttribute('d',up+' L'+lo.reverse().join(' L')+' Z'); if(ribe[k]) ribe[k].setAttribute('d',up);});
  dust.forEach(d=>{const x=+d.dataset.x,y0=+d.dataset.y,s=+d.dataset.s,p=+d.dataset.p;let y=y0-t*s;y=120+((y-120)%1130+1130)%1130;
    d.setAttribute('transform',`translate(${(x+Math.sin(t*.6+p)*14).toFixed(1)} ${y.toFixed(1)})`);d.style.opacity=(.25+.6*Math.abs(Math.sin(t*1.6+p))).toFixed(2);});
  fls.forEach(l=>l.setAttribute('x',(250+620*Math.sin(t*.42-1)).toFixed(0)));
}
window.render=t=>{base(t); amb(t); if(window.custom) custom(t);};
'''

def html_for(date):
    res = DESIGNS[date](next(x for x in CAL['days'] if x['date'] == date))
    body, js = (res if isinstance(res, tuple) else (res, ''))
    return f'<meta charset="utf-8"><style>{CSS}</style>{body}<script>{BASE_JS}{js}</script>'

def stills(out_dir, dates=None, scale=1):
    from playwright.sync_api import sync_playwright
    out = Path(out_dir); out.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=scale)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        for date in (dates or sorted(DESIGNS)):
            f = out / '_page.html'; f.write_text(html_for(date))
            pg.goto(f.as_uri(), wait_until='load'); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(120)
            pg.evaluate(f'render({STILL})')
            pg.screenshot(path=str(out / f'{date}.jpg'), type='jpeg', quality=93)
            print('ok', date, errs[-1] if errs else ''); errs.clear()
        b.close()

if __name__ == '__main__':
    if sys.argv[1] == 'stills':
        stills(sys.argv[2], sys.argv[3:] or None)
