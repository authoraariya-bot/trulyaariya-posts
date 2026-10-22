"""Render the LinkedIn reels in linkedin/calendar.json as MP4 (2160x2700, 30fps, H.264 + AAC).

Each reel is an HTML page in the Manuscript Edition look, animated frame by frame with a
render(t) function, captured with Playwright and encoded with ffmpeg. Music is original,
synthesised by tools/music.py.

Usage: python3 reels.py [date ...]     (no dates = all reels)
"""
import json, math, os, random, subprocess, sys, shutil, tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'tools'))
import previews as P
from previews import C, esc, svg, crack, hand_path

ROOT = P.ROOT
OUT = ROOT / 'reels'
OUT.mkdir(exist_ok=True)
FPS, DUR, END = 30, 20.0, 17.4
SCALE = float(os.environ.get('REEL_SCALE', '2'))

# ---------- building blocks ----------
def A(a, b=99):  # animation attributes
    return f'data-a="{a}" data-b="{b}"'

def line(text, a, b=99, size=72, italic=False, color=None, extra=''):
    return (f'<div class="ln" {A(a,b)} style="font-size:{size}px;{"font-style:italic;" if italic else ""}'
            f'{"color:"+color+";" if color else ""}{extra}">{text}</div>')

def stack(lines_html, x=88, y=190, w=900):
    return f'<div class="stack" style="left:{x}px;top:{y}px;width:{w}px">{lines_html}</div>'

def at(html, x, y, a, b=99, w=None, extra=''):
    return f'<div class="abs" {A(a,b)} style="left:{x}px;top:{y}px;{f"width:{w}px;" if w else ""}{extra}">{html}</div>'

def hand(text, size=60, color=None, rot=-3, wrap=False):
    return (f'<span class="hand" style="font-size:{size}px;color:{color or C["gold"]};display:inline-block;transform:rotate({rot}deg);'
            f'{"white-space:normal;" if wrap else ""}">{esc(text)}</span>')

def lbl(text, color=None, size=21):
    return f'<span class="lb" style="font-size:{size}px;{"color:"+color if color else ""}">{esc(text)}</span>'

def draw(d, a, b, col, w=3, extra=''):
    return f'<path class="draw" data-a="{a}" data-b="{b}" d="{d}" stroke="{col}" stroke-width="{w}" fill="none" stroke-linecap="round" stroke-linejoin="round" {extra}/>'

def gcrack(d, a, b, w=4):
    return (draw(d, a, b, C['goldlite'], w * 3, 'opacity=".25"') + draw(d, a, b, C['gold'], w))

END_CARD = f'''<div id="end" {A(END)} class="endcard">
<svg class="art" viewBox="0 0 1080 1350"><path class="draw" data-a="{END+.2}" data-b="{END+1.4}" d="M140 980 L330 1000 L420 965 L560 1010 L690 975 L940 1000" stroke="{C["gold"]}" stroke-width="4" fill="none" stroke-linecap="round"/></svg>
<div class="ec-l">A DEBUT BOOK BY AARIYA SHARMA</div>
<div class="ec-t">A Self<br>Repaired Soul</div>
<div class="ec-s">Journey That Heals</div>
<div class="ec-c">BOOK COMING SOON</div>
<div class="ec-h">@trulyaariya</div>
</div>'''

REEL_CSS = f'''
.stack{{position:absolute;z-index:3;display:flex;flex-direction:column;gap:6px}}
.ln{{line-height:1.04;font-weight:500;text-wrap:balance;letter-spacing:-.005em}}
.abs{{position:absolute;z-index:4}}
.hand{{font-family:Caveat;line-height:1;white-space:nowrap}}
.lb{{font-family:Jost;letter-spacing:.22em;opacity:.85}}
[data-a]{{will-change:opacity}}
.endcard{{position:absolute;inset:0;z-index:20;background:{C["plum"]};color:{C["cream"]}}}
.endcard .art{{position:absolute;inset:0}}
.ec-l{{position:absolute;left:92px;top:300px;font-family:Jost;letter-spacing:.26em;font-size:22px;color:{C["goldlite"]}}}
.ec-t{{position:absolute;left:88px;top:350px;font-size:150px;line-height:.98;font-weight:500}}
.ec-s{{position:absolute;left:92px;top:690px;font-size:64px;font-style:italic;color:{C["goldlite"]}}}
.ec-c{{position:absolute;left:92px;top:1080px;font-family:Jost;letter-spacing:.3em;font-size:30px;font-weight:500}}
.ec-h{{position:absolute;left:92px;top:1140px;font-family:Jost;letter-spacing:.12em;font-size:30px;color:{C["goldlite"]}}}
'''

BASE_JS = '''
const clamp=x=>Math.max(0,Math.min(1,x)), ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const lerp=(a,b,p)=>a+(b-a)*p;
const els=[...document.querySelectorAll('[data-a]:not(.draw)')];
const draws=[...document.querySelectorAll('.draw')];
draws.forEach(p=>{const L=p.getTotalLength();p._L=L;p.style.strokeDasharray=L;});
function base(t){
  for(const el of els){const a=+el.dataset.a,b=+el.dataset.b;
    const v=ease(clamp((t-a)/.55))*(1-ease(clamp((t-b)/.4)));
    el.style.opacity=v; el.style.translate=`0 ${(1-v)*22}px`;}
  for(const p of draws){const a=+p.dataset.a,b=+p.dataset.b;const v=clamp((t-a)/(b-a));p.style.strokeDashoffset=p._L*(1-v);}
}
window.render=t=>{base(t); if(window.custom) custom(t);};
'''

def rnd(seed): return random.Random(seed)

# ---------- the 14 reels ----------
def r_manuscript(d):
    r = rnd(1); s = ''; k = 0
    for row in range(13):
        for g in range(5):
            x0, y0 = 92 + g * 118, 700 + row * 30
            a = -0.6 + k * 0.165
            op = .3 + .5 * (row / 13)
            for j in range(4):
                s += f'<path class="draw" data-a="{a+j*.02:.2f}" data-b="{a+j*.02+.12:.2f}" d="M{x0+j*16+r.uniform(-2,2):.1f} {y0} l{r.uniform(-3,3):.1f} 24" stroke="{C["ink"]}" stroke-opacity="{op:.2f}" stroke-width="2.4" stroke-linecap="round" fill="none"/>'
            s += f'<path class="draw" data-a="{a+.1:.2f}" data-b="{a+.2:.2f}" d="M{x0-6} {y0+20} L{x0+60} {y0+3}" stroke="{C["ink"]}" stroke-opacity="{op:.2f}" stroke-width="2.4" stroke-linecap="round" fill="none"/>'
            k += 1
    s += gcrack('M960 150 L930 330 L982 470 L940 640 L990 820 L950 1000 L980 1150', 10.6, 12.6)
    body = svg(s) + stack(
        line('Two years ago, this page was blank.', -1, 10.2, 70) +
        line('Most evenings went to one thing.', 3.4, 10.2, 70) +
        line('Today I can finally say it.', 6.8, 10.2, 70, italic=True)) + \
        at(f'<div class="ln" style="font-size:168px">I wrote<br>a book.<span class="cursor"></span></div>', 88, 230, 10.5) + \
        at(hand('730 evenings, give or take', 46), 560, 1150, 13.2)
    js = 'window.custom=t=>{const c=document.querySelector(".cursor");if(c)c.style.opacity=(Math.floor(t*2)%2)?0.15:1;};'
    return 'cream', body, js, 'lullaby'

def r_planner(d):
    days = ['MON', 'TUE', 'WED', 'THU', 'FRI']; s = ''
    for i, dn in enumerate(days):
        x = 92 + i * 184
        s += f'<text x="{x+10}" y="640" font-family="Jost" font-size="20" letter-spacing="4" fill="{C["ink"]}" opacity=".7">{dn}</text>'
        s += f'<line x1="{x}" y1="610" x2="{x}" y2="1080" stroke="{C["ink"]}" stroke-opacity=".18"/>'
    for k in range(5):
        y = 760 + k * 26
        s += draw(f'M92 {y} C 400 {y-30}, 640 {y+40}, 1000 {y-10}', -0.8 + k * .1, 1.6 + k * .1, C['ink'], 1.6, 'stroke-opacity=".5"')
    r = rnd(4)
    for i in range(14):
        x = 120 + i * 62
        y = 770 + r.uniform(-10, 90)
        s += (f'<g class="nt" data-i="{i}" data-a="{0.4+i*0.62:.2f}" data-b="99"><g class="nw" style="transform-origin:{x+14}px {y}px">'
              f'<path class="hd" d="M{x} {y} l14 -10 l14 10 l-14 10 z" fill="{C["ink"]}"/><line class="st" x1="{x+28}" y1="{y}" x2="{x+28}" y2="{y-70}" stroke="{C["ink"]}" stroke-width="2.4"/></g></g>')
    body = svg(s) + stack(line('The song you play', -1, 99, 92) + line('in the parking lot before work…', 2.4, 99, 92, italic=True)) + \
        at(hand('counts as healing too.', 70), 380, 1110, 11.2)
    js = '''window.custom=t=>{document.querySelectorAll('.nt').forEach(g=>{const i=+g.dataset.i;const w=g.querySelector('.nw');
 const busy=i>2&&i<11; w.style.transform=`rotate(${busy&&t<10.5?Math.sin(t*6+i)*9:0}deg)`;
 const gold=t>10+i*0.07; const col=gold?'#a8792c':'#5a3d45'; g.querySelector('.hd').setAttribute('fill',col); g.querySelector('.st').setAttribute('stroke',col);});};'''
    return 'paper', body, js, 'lofi'

def r_folio(d):
    s = ''
    for i, (dx, rot, lab, a) in enumerate([(-40, -7, 'DAY 1', -1), (10, -2, 'DAY 300', 3.4), (60, 3, 'DAY 730', 6.8)]):
        s += (f'<g class="pg" data-a="{a}" data-b="99" data-rot="{rot}"><g transform="rotate({rot} 540 900)"><rect x="{250+dx}" y="560" width="560" height="660" fill="#fbf6ee" stroke="{C["ink"]}" stroke-opacity=".14"/>'
              f'<text x="{280+dx}" y="1190" font-family="Jost" font-size="20" letter-spacing="5" fill="{C["ink"]}" opacity=".6">{lab}</text></g></g>')
    leaf = 'M560 1010 C 470 940, 470 760, 610 690 C 690 790, 680 950, 560 1010 Z'
    veins = ''.join(f'<path d="M{568+t*6} {960-t*55} q 30 -20 50 -40" stroke="{C["gold"]}" stroke-width="1.6" fill="none"/><path d="M{568+t*6} {960-t*55} q -30 -15 -48 -38" stroke="{C["gold"]}" stroke-width="1.6" fill="none"/>' for t in range(5))
    s += (f'<g id="leaf" transform="rotate(3 540 900)"><path d="{leaf}" fill="{C["blush"]}" stroke="{C["mauve"]}" stroke-width="2"/>'
          f'<path d="M560 1010 C 580 900, 590 800, 610 690" stroke="{C["gold"]}" stroke-width="2.5" fill="none"/>{veins}</g>')
    body = svg(s) + at('<div class="ln" style="font-size:150px">Day 1.</div>', 88, 200, -1, 3.2) + \
        at('<div class="ln" style="font-size:150px">Day 300.</div>', 88, 200, 3.4, 6.6) + \
        at('<div class="ln" style="font-size:150px">Day 730.</div>', 88, 200, 6.8, 10) + \
        at('<div class="ln" style="font-size:82px">I\'m not the person who opened the first blank page.</div>', 88, 190, 10.3, w=900) + \
        at(hand('two years later', 52, rot=-8), 740, 520, 12.8)
    js = '''window.custom=t=>{const l=document.getElementById('leaf');const p=clamp((t-0.5)/9.5);
 l.style.filter=`grayscale(${1-p}) brightness(${0.92+0.08*p})`;
 document.querySelectorAll('.pg').forEach(g=>{const a=+g.dataset.a;const v=ease(clamp((t-a)/.8));g.style.translate=`${(1-v)*260}px ${(1-v)*-30}px`;});};'''
    return 'paper', body, js, 'rising_piano'

def r_sorry(d):
    r = rnd(7); notes = ''
    texts = ['sorry,', 'sorry!', 'so sorry', 'sorry :(', 'sorry,', 'sorry...', 'sorry again', 'sorry', 'sorry,']
    cols = [C['butter'], C['blush'], C['sage'], '#f3e6d0']
    for i, t in enumerate(texts):
        x, y, rot = 140 + (i % 3) * 270 + r.uniform(-30, 30), 560 + (i // 3) * 190 + r.uniform(-20, 20), r.uniform(-12, 12)
        notes += (f'<div class="sticky sn" data-i="{i}" data-a="{-0.4 + i*0.85:.2f}" data-b="99" style="left:{x:.0f}px;top:{y:.0f}px;background:{cols[i%4]};transform:rotate({rot:.1f}deg)">'
                  f'<span>{esc(t)}</span></div>')
    s = f'<path d="M120 1150 L960 1150 L1010 1190 L70 1190 Z" fill="none" stroke="{C["ink"]}" stroke-width="3"/><rect x="180" y="1060" width="720" height="90" fill="none" stroke="{C["ink"]}" stroke-opacity=".5" stroke-width="2"/>'
    body = svg(s) + notes + stack(
        line('Sorry, quick question.', -1, 9.2, 66, italic=True) + line('Sorry for the late reply.', 2.2, 9.2, 66, italic=True) +
        line('Sorry to bother you.', 4.4, 9.2, 66, italic=True)) + \
        at('<div class="ln" style="font-size:92px">Your feelings were never an inconvenience.</div>', 88, 190, 12, w=900)
    js = '''window.custom=t=>{document.querySelectorAll('.sn').forEach(n=>{const i=+n.dataset.i;const p=ease(clamp((t-9.2-i*0.28)/0.9));
 if(p>0){n.style.opacity=1-p;n.style.translate=`${p*(i%2?160:-160)}px ${-p*420}px`;}});};'''
    return 'rose', body, js, 'lofi'

def r_knot(d):
    r = rnd(9); pts = []; cx, cy = 300, 820
    for t in range(260):
        a = t * .31; rad = 60 + 70 * math.sin(t * .07) + r.uniform(-12, 12)
        pts.append((cx + rad * math.cos(a), cy + rad * math.sin(a) * .9))
    knot = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
    s = f'<path id="knot" d="{knot}" stroke="#8f8588" stroke-width="2.2" fill="none" opacity=".85"/>'
    s += draw(f'M{pts[-1][0]:.0f} {pts[-1][1]:.0f} C 520 860, 560 980, 980 980', 7, 12, C['gold'], 6)
    for i, (t, x, y) in enumerate([('can you just…', 110, 640), ('one more favour', 360, 690), ('quick call?', 150, 960)]):
        s += f'<g class="tag" data-i="{i}"><g transform="rotate({[-8,6,-4][i]} {x} {y})"><rect x="{x}" y="{y}" width="{len(t)*15+40}" height="48" fill="#f7f1e8" stroke="#8f8588"/><text x="{x+20}" y="{y+32}" font-family="Jost" font-size="22" fill="#6f6467">{esc(t)}</text></g></g>'
    body = svg(s) + stack(line('A no', -1, 99, 110) + line("doesn't need three paragraphs.", 2, 99, 88, italic=True)) + \
        at(hand("You're allowed to choose you.", 64), 300, 1050, 12.4)
    js = '''const K=document.getElementById('knot');const KL=K.getTotalLength();K.style.strokeDasharray=KL;
window.custom=t=>{const p=ease(clamp((t-6)/6));K.style.strokeDashoffset=-KL*p;K.style.transform=`rotate(${t*4}deg)`;K.style.transformOrigin='300px 820px';
 document.querySelectorAll('.tag').forEach(g=>{const i=+g.dataset.i;const q=ease(clamp((t-6-i*.6)/1.5));g.style.opacity=1-q;g.style.translate=`${-q*120}px ${q*60}px`;});};'''
    return 'cream', body, js, 'acoustic_hope'

def r_split(d):
    def phone(x, y, calm):
        s = f'<rect x="{x}" y="{y}" width="210" height="360" rx="26" fill="#fbf7f1" stroke="{C["ink"]}" stroke-width="3"/>'
        s += f'<rect x="{x+28}" y="{y+70}" width="140" height="56" rx="14" fill="{C["blush"] if calm else "#ddd6d6"}"/>'
        s += f'<text x="{x+120}" y="{y+150}" font-family="Jost" font-size="16" fill="{C["ink"]}" opacity=".7">Seen 11:47 pm</text>'
        return s
    r = rnd(11)
    scrib = ''.join(draw(hand_path([(r.uniform(620, 1000), r.uniform(330, 620)) for _ in range(5)], r, 0), -0.6 + i * .35, 0.4 + i * .35, '#7a6f72', 2,
                         f'opacity=".55" data-i="{i}" class="draw sc"') for i in range(18))
    scrib = scrib.replace('class="draw" data-a', 'data-a')
    s = (f'<rect x="0" y="0" width="1080" height="675" fill="#d8d0cf" opacity=".55"/>' + phone(720, 250, False) + scrib +
         f'<g {A(6.6)} class="fade">' + phone(720, 860, True) + '</g>' + draw('M640 1060 C 700 1040, 760 1080, 1000 1050', 9.4, 11.4, C['gold'], 4) +
         f'<line x1="60" y1="675" x2="1020" y2="675" stroke="{C["ink"]}" stroke-opacity=".35"/>')
    body = svg(s) + at(lbl('THEN', C['ink'], 24), 92, 230, -1) + \
        at('<div class="ln" style="font-size:70px;font-style:italic">one message on "seen" ran my whole night.</div>', 88, 280, -1, w=560) + \
        at(lbl('NOW', C['gold'], 24), 92, 760, 6.6) + \
        at('<div class="ln" style="font-size:92px">same message.<br>Softer me.</div>', 88, 810, 8.4, w=560)
    js = '''window.custom=t=>{document.querySelectorAll('.sc').forEach(p=>{const i=+p.dataset.i;if(i%3)p.style.opacity=.55*(1-ease(clamp((t-7-i*.1)/2)));});};'''
    return 'cream', body, js, 'rising_piano'

def r_hourglass(d):
    r = rnd(13); s = ''; k = 0
    for col in range(5):
        x = 92 + col * 120
        s += f'<text x="{x}" y="590" font-family="Jost" font-size="18" letter-spacing="3" fill="{C["ink"]}" opacity=".6">{"MTWTF"[col]}</text>'
        y = 620
        while y < 1080:
            hgt = r.choice([50, 70, 90]); gold = (col == 4 and y > 900)
            a = 11.4 if gold else -0.8 + k * 0.33
            s += f'<g {A(a)}><rect x="{x}" y="{y}" width="100" height="{hgt-8}" rx="6" fill="{C["gold"] if gold else C["mauve"]}" opacity="{1 if gold else r.uniform(.35,.7):.2f}"/>'
            if gold: s += f'<text x="{x+22}" y="{y+40}" font-family="Caveat" font-size="34" fill="#fff">Rest</text></g>'; break
            s += '</g>'; y += hgt; k += 1
    s += (f'<g id="hg" style="transform-origin:860px 860px"><path d="M780 740 L940 740 L870 860 L940 980 L780 980 L850 860 Z" fill="none" stroke="{C["ink"]}" stroke-width="4"/>'
          f'<path id="top" d="M795 750 L925 750 L860 852 Z" fill="{C["goldlite"]}"/><path id="bot" d="M800 970 L920 970 L860 900 Z" fill="{C["goldlite"]}"/>'
          f'<line x1="770" y1="740" x2="950" y2="740" stroke="{C["ink"]}" stroke-width="6"/><line x1="770" y1="980" x2="950" y2="980" stroke="{C["ink"]}" stroke-width="6"/></g>')
    body = svg(s) + at(lbl("EVERYONE SAYS:"), 92, 200, -1, 7.8) + \
        at('<div class="ln" style="font-size:92px">rest when you\'re done.</div>', 88, 240, -1, 7.8, w=920) + \
        at(lbl('NOBODY SAYS:', C['gold']), 92, 200, 8.2) + \
        at('<div class="ln" style="font-size:92px;font-style:italic">rest before you\'re empty.</div>', 88, 240, 9.4, w=920)
    js = '''window.custom=t=>{const g=document.getElementById('hg');const tilt=ease(clamp((t-9)/1.4));g.style.transform=`rotate(${tilt*90}deg)`;
 const p=clamp(t/9);document.getElementById('top').style.transform=`scaleY(${1-p*.85})`;document.getElementById('top').style.transformOrigin='860px 852px';
 document.getElementById('bot').style.transform=`scaleY(${.25+p*.75})`;document.getElementById('bot').style.transformOrigin='860px 970px';};'''
    return 'cream', body, js, 'lullaby'

def r_feed(d):
    s = '<defs><clipPath id="fc"><rect x="580" y="460" width="460" height="690"/></clipPath></defs><g clip-path="url(#fc)"><g id="feed">'
    labels = ['New role', 'Promoted', 'Started a company', 'New role', 'Promoted', 'Launched!', 'New role', 'Promoted', 'Started a company', 'New role']
    for i, t in enumerate(labels):
        y = 470 + i * 150
        s += (f'<rect x="600" y="{y}" width="400" height="120" rx="10" fill="#fbf7f1" stroke="{C["ink"]}" stroke-opacity=".15"/>'
              f'<rect x="624" y="{y+24}" width="54" height="54" rx="14" fill="{C["grey"]}"/><text x="700" y="{y+56}" font-family="Jost" font-size="26" fill="{C["ink"]}">{t}</text>'
              f'<rect x="700" y="{y+74}" width="{200-(i%4)*20}" height="10" rx="5" fill="{C["grey"]}" opacity=".6"/>')
    s += '</g></g>'
    path = 'M150 1180 C 160 1040, 420 1010, 330 880 C 260 780, 470 720, 420 600'
    s += f'<path id="lane" d="{path}" stroke="{C["sage"]}" stroke-width="56" fill="none" stroke-linecap="round" opacity=".7"/><path d="{path}" stroke="#fff" stroke-width="2" stroke-dasharray="6 14" fill="none"/>'
    for i, (x, y, rot) in enumerate([(230, 1060, -30), (380, 950, 40), (290, 830, -20), (450, 740, 35), (360, 650, -25)]):
        s += f'<g {A(1.5 + i*2.2)}><path d="M{x} {y} c 14 -26 40 -26 46 -8 c -16 18 -40 22 -46 8 z" fill="{C["goldlite"] if y < 700 else "#93a385"}" transform="rotate({rot} {x} {y})"/></g>'
    s += f'<g id="walker" stroke="{C["ink"]}" stroke-width="4" stroke-linecap="round" fill="none"><path d="M0 0 l0 -46"/><path d="M0 -32 l-16 18 M0 -32 l16 18 M0 0 l-14 26 M0 0 l14 26"/><rect x="-10" y="-70" width="20" height="22" rx="9" fill="{C["ink"]}"/></g>'
    body = svg(s) + at(lbl('READ THIS IF EVERYONE ON YOUR FEED'), 92, 200, -1, 7.8) + \
        at('<div class="ln" style="font-size:110px">seems ahead.</div>', 88, 240, -1, 7.8, w=900) + \
        at(lbl('FOR ANYONE WHO CLOSES THIS APP FEELING BEHIND'), 92, 200, 8.2) + \
        at('<div class="ln" style="font-size:96px">You were busy surviving.</div>', 88, 240, 8.4, w=520) + at(hand('that counts.', 64), 640, 1170, 11.4)
    js = '''const lane=document.getElementById('lane'),LL=lane.getTotalLength();
window.custom=t=>{document.getElementById('feed').style.transform=`translateY(${-((t*95)%600)}px)`;
 const p=clamp(t/14);const pt=lane.getPointAtLength(LL*p);const w=document.getElementById('walker');
 w.setAttribute('transform',`translate(${pt.x} ${pt.y-14+Math.abs(Math.sin(t*5))*-4})`);};'''
    return 'cream', body, js, 'acoustic_hope'

def r_photo(d):
    s = (f'<g transform="rotate(5 560 820)"><rect x="300" y="460" width="520" height="640" fill="#fbf8f3" stroke="{C["ink"]}" stroke-opacity=".15"/>'
         f'<defs><linearGradient id="dev" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{C["butter"]}"/><stop offset=".55" stop-color="{C["blush"]}"/><stop offset="1" stop-color="#e4c1a6"/></linearGradient></defs>'
         f'<rect x="330" y="490" width="460" height="460" fill="url(#dev)"/>'
         f'<rect x="330" y="900" width="460" height="50" fill="#a8b597"/>'
         f'<path d="M330 560 C 450 540, 600 520, 790 560" stroke="#6f5d55" stroke-width="10" fill="none"/>'
         f'<g id="swing" style="transform-origin:570px 548px"><line x1="520" y1="550" x2="510" y2="840" stroke="#6f5d55" stroke-width="3"/><line x1="620" y1="545" x2="630" y2="840" stroke="#6f5d55" stroke-width="3"/>'
         f'<rect x="495" y="836" width="150" height="16" fill="#6f5d55"/></g>'
         f'<rect id="fog" x="330" y="490" width="460" height="460" fill="#8f898b"/></g>')
    body = svg(s) + stack(line('I miss the version of me who…', -1, 99, 92) + line('…played without a reason.', 3.6, 99, 70, italic=True)) + \
        at(f'<div class="hand" style="font-size:54px;white-space:normal;color:{C["gold"]};transform:rotate(3deg)">She\'s waiting for me to let her play again.</div>', 250, 1110, 10.6, w=640)
    js = '''window.custom=t=>{document.getElementById('fog').style.opacity=1-ease(clamp((t+0.6)/10));
 const sw=t>10?Math.sin((t-10)*2.6)*12*clamp((t-10)/1.5):0;document.getElementById('swing').style.transform=`rotate(${sw}deg)`;};'''
    return 'rose', body, js, 'lullaby'

def r_crumple(d):
    r = rnd(19)
    pts = [(r.uniform(180, 900), r.uniform(560, 1120)) for _ in range(30)]
    cre = ''
    for a in pts:
        b = min(pts, key=lambda p: (p[0]-a[0])**2+(p[1]-a[1])**2 if p != a else 1e9)
        cre += f'<line x1="{a[0]:.0f}" y1="{a[1]:.0f}" x2="{b[0]:.0f}" y2="{b[1]:.0f}" stroke="{C["ink"]}" stroke-width="2"/>'
        cre += f'<path d="M{a[0]:.0f} {a[1]:.0f} l{r.uniform(-120,120):.0f} {r.uniform(-90,90):.0f}" stroke="{C["ink"]}" stroke-width="2"/>'
    s = (f'<g id="pg" style="transform-origin:540px 840px"><rect x="160" y="540" width="760" height="600" fill="#fbf6ee" stroke="{C["ink"]}" stroke-opacity=".12"/>'
         f'<g id="cre">{cre}</g>' + gcrack('M160 760 L330 790 L420 740 L560 820 L700 780 L920 830', 10, 12) + '</g>')
    body = svg(s) + at(lbl('THEN'), 92, 200, -1) + \
        at(f'<div class="ln" style="font-size:72px;font-style:italic;color:{C["mauve"]}">I couldn\'t talk about it without crying.</div>', 88, 236, -1, w=920) + \
        at(lbl('NOW', C['gold']), 92, 420, 7.6) + at('<div class="ln" style="font-size:72px">I can tell the story.</div>', 88, 452, 8, w=920) + \
        at(hand("that's how I knew.", 60), 540, 1160, 12.4)
    js = '''window.custom=t=>{const p=ease(clamp((t+0.4)/9.5));const g=document.getElementById('pg');
 g.style.transform=`scale(${0.32+0.68*p}) rotate(${(1-p)*-24}deg)`;
 document.getElementById('cre').style.opacity=0.55-0.42*p;};'''
    return 'paper', body, js, 'rising_piano'

def r_boats(d):
    def boat(id_):
        return (f'<g id="{id_}"><path d="M-110 0 L110 0 L70 50 L-70 50 Z" fill="#fbf7f1" stroke="{C["ink"]}" stroke-width="3"/>'
                f'<path d="M-10 0 L10 -120 L70 0 Z" fill="#f3ece2" stroke="{C["ink"]}" stroke-width="3"/></g>')
    s = '<g id="waves">' + ''.join(f'<path class="wv" data-k="{k}" stroke="{C["ink"]}" stroke-opacity="{.5-k*.05:.2f}" stroke-width="2" fill="none"/>' for k in range(7)) + '</g>'
    s += boat('b1') + boat('b2')
    s += f'<path id="tangle" d="M420 905 C 480 840, 520 980, 470 900 C 430 840, 600 860, 560 930 C 520 990, 640 880, 670 900" stroke="#8f8588" stroke-width="4" fill="none"/>'
    s += f'<path id="rope" stroke="{C["gold"]}" stroke-width="4" fill="none" stroke-linecap="round"/>'
    body = svg(s) + at(lbl('EVERYONE SAYS:'), 92, 200, -1, 7) + \
        at('<div class="ln" style="font-size:96px">Fix it right now.</div>', 88, 240, -1, 7, w=920) + \
        stack(line('Sometimes a little space', 7.4, 99, 92) + line('is what softens it.', 9, 99, 92, italic=True), y=200) + \
        at(hand('take the day.', 58), 640, 1160, 12)
    js = '''window.custom=t=>{const calm=ease(clamp((t-7)/5));
 document.querySelectorAll('.wv').forEach(p=>{const k=+p.dataset.k;const y=930+k*34;const amp=Math.max(3,(24-k*3))*(1-calm*0.8);let d=`M40 ${y}`;
  for(let x=40;x<=1040;x+=20){d+=` L${x} ${y+Math.sin(x/38+t*2.2+k)*amp}`;}p.setAttribute('d',d);});
 const sep=ease(clamp((t-7.5)/4))*70;const bob=a=>Math.sin(t*2.4+a)*(8*(1-calm*0.7));
 document.getElementById('b1').setAttribute('transform',`translate(${330-sep} 880) rotate(${bob(0)})`);
 document.getElementById('b2').setAttribute('transform',`translate(${760+sep} 870) rotate(${bob(1.5)})`);
 document.getElementById('tangle').style.opacity=1-ease(clamp((t-7)/1.6));
 const r=document.getElementById('rope');const x1=420-sep,x2=670+sep;r.setAttribute('d',`M${x1} 905 Q ${(x1+x2)/2} ${960} ${x2} 900`);r.style.opacity=ease(clamp((t-8)/1.5));};'''
    return 'cream', body, js, 'acoustic_hope'

def r_crossed(d):
    r = rnd(23); s = ''
    for k in range(10):
        y = 560 + k * 56
        s += f'<line x1="92" y1="{y+22}" x2="990" y2="{y+22}" stroke="#b9c4d6" stroke-opacity=".6"/>'
        s += f'<path d="{hand_path([(110,y),(300+r.uniform(150,500),y)],r,2)}" stroke="{C["ink"]}" stroke-opacity=".45" stroke-width="5" stroke-linecap="round" fill="none"/>'
        if k < 9:
            s += draw(hand_path([(100, y + r.uniform(-8, 8)), (320 + r.uniform(150, 480), y + r.uniform(-8, 8))], r, 4), -0.5 + k * 1.0, 0.1 + k * 1.0, C['ink'], 3)
    s += '<g id="birds">' + ''.join(f'<path class="bird" data-i="{i}" d="M-40 0 Q -20 -24 0 0 Q 20 -24 40 0" stroke="{C["gold"]}" stroke-width="5" fill="none" stroke-linecap="round"/>' for i in range(5)) + '</g>'
    s += f'<path id="last" d="{hand_path([(110,1064),(640,1064)],r,2)}" stroke="{C["gold"]}" stroke-width="5" stroke-linecap="round" fill="none"/>'
    body = svg(s) + stack(line("Read this if you've forgiven everyone", -1, 99, 78) + line('except yourself.', 1.8, 99, 78, italic=True)) + \
        at(hand('start with her.', 70), 140, 1150, 12)
    js = '''window.custom=t=>{const p=clamp((t-9.6)/4.5);document.getElementById('last').style.opacity=1-ease(clamp((t-9.6)/1.2));
 document.querySelectorAll('.bird').forEach(b=>{const i=+b.dataset.i;const q=ease(clamp(p*1.3-i*.12));
 const x=200+i*90+q*(320+i*40), y=1064-q*(380+i*70);b.setAttribute('transform',`translate(${x} ${y}) scale(${1.1+0.5*(1-i/5)}) scale(1 ${1+Math.sin(t*10+i)*0.35})`);b.style.opacity=q>0?Math.min(1,q*3):0;});};'''
    return 'cream', body, js, 'lullaby'

def r_tracker(d):
    r = rnd(25); s = ''; cols = [C['sage'], C['blush'], C['butter'], C['rose'], '#e9dccb']
    for i in range(100):
        x, y = 140 + (i % 10) * 82, 470 + (i // 10) * 62
        s += f'<rect x="{x}" y="{y}" width="74" height="54" rx="4" fill="none" stroke="{C["ink"]}" stroke-opacity=".25"/>'
        s += f'<g {A(-1 + i*0.13)}><rect x="{x}" y="{y}" width="74" height="54" rx="4" fill="{r.choice(cols)}" stroke="{C["ink"]}" stroke-opacity=".12"/></g>'
    s += gcrack('M140 524 L384 586 L548 648 L712 710 L960 1062', 12.2, 14)
    body = svg(s) + stack(line("Healing isn't one big moment.", -1, 99, 74) + line("It's a hundred small,", 3.6, 99, 74, italic=True) + line('ordinary days.', 6.6, 99, 74, italic=True), y=180) + \
        at(f'<span class="hand" id="cnt" style="font-size:52px;color:{C["gold"]};display:inline-block;transform:rotate(-3deg)">day 1 of 100</span>', 690, 1110, -1)
    js = '''window.custom=t=>{const n=Math.max(1,Math.min(100,Math.floor((t+1)/0.13)+1));document.getElementById('cnt').textContent=`day ${n} of 100`;};'''
    return 'cream', body, js, 'lofi'

def r_calendar(d):
    r = rnd(27); s = ''
    for k in range(6):
        s += f'<rect x="{170+k*14}" y="{470+k*10}" width="640" height="660" fill="#fbf6ee" stroke="{C["ink"]}" stroke-opacity=".2"/>'
    x, y = 240, 520
    s += f'<g id="top"><rect x="{x}" y="{y}" width="640" height="660" fill="#fbf6ee" stroke="{C["ink"]}" stroke-opacity=".2"/>'
    s += f'<rect id="band" x="{x}" y="{y}" width="640" height="110" fill="{C["plum"]}"/>'
    s += f'<text id="mon" x="{x+40}" y="{y+75}" font-family="Jost" font-size="34" letter-spacing="8" fill="#fff">MONTH 1</text>'
    for i in range(35):
        cx, cy = x + 30 + (i % 7) * 86, y + 150 + (i // 7) * 92
        s += f'<rect x="{cx}" y="{cy}" width="78" height="84" fill="none" stroke="{C["ink"]}" stroke-opacity=".15"/>'
        s += f'<path class="nt" data-r="{r.random():.3f}" d="{hand_path([(cx+10,cy+30),(cx+64,cy+30)],r,3)}" stroke="{C["ink"]}" stroke-opacity=".5" stroke-width="2.5"/>'
        s += f'<path class="nt" data-r="{r.random():.3f}" d="{hand_path([(cx+10,cy+52),(cx+50,cy+52)],r,3)}" stroke="{C["ink"]}" stroke-opacity=".4" stroke-width="2.5"/>'
    s += '</g>'
    body = svg(s) + at('<div class="ln" style="font-size:120px">24 months.</div>', 88, 180, -1, w=900) + \
        at(lbl('MOST OF THEM LOOKED LIKE NOTHING'), 92, 336, 3.4) + at(lbl('FROM THE OUTSIDE.'), 92, 372, 5.4) + \
        at(hand('all of them are in this book.', 54), 450, 1160, 12.2)
    js = '''window.custom=t=>{const m=Math.min(24,1+Math.floor(Math.max(0,t+0.4)/0.5));document.getElementById('mon').textContent=`MONTH ${m}`;
 document.getElementById('band').setAttribute('fill',m===24?'#a8792c':'#5a3d45');
 const f=(Math.max(0,t+0.4)%0.5)/0.5;const g=document.getElementById('top');g.style.transformOrigin='560px 520px';
 g.style.transform=m<24&&f>0.75?`rotateX(${(f-.75)*4*80}deg)`:'none';
 document.querySelectorAll('.nt').forEach(p=>{p.style.opacity=(+p.dataset.r < 0.35+0.4*Math.abs(Math.sin(m*1.7)))?1:0;});};'''
    return 'cream', body, js, 'rising_piano'

REELS = {'manuscript-page': r_manuscript, 'planner-staff': r_planner, 'folio-flip': r_folio, 'sorry-notes': r_sorry,
         'knot-ribbon': r_knot, 'split-then-now': r_split, 'hourglass-calendar': r_hourglass, 'feed-lane': r_feed,
         'instant-photo': r_photo, 'crumpled-page': r_crumple, 'paper-boats': r_boats, 'crossed-lines': r_crossed,
         'tracker-grid': r_tracker, 'two-year-calendar': r_calendar}

def numbers():
    n, c = {}, {}
    for d in P.CAL['days']:
        c[d['series']] = c.get(d['series'], 0) + 1
        n[d['date']] = c[d['series']]
    return n

def build_html(d, no):
    theme, body, js, music = REELS[d['layout']](d)
    page = P.frame(d, no, theme, body + END_CARD)
    return f'<meta charset="utf-8"><style>{P.CSS}{REEL_CSS}</style>{page}<script>{BASE_JS}{js}</script>', music

def make_music(kind, path):
    import importlib
    m = importlib.import_module('music')
    getattr(m, kind)(DUR + 0.5, str(path))

def render_one(d, no):
    from playwright.sync_api import sync_playwright
    html, music = build_html(d, no)
    tmp = Path(tempfile.mkdtemp(prefix=f"reel-{d['date']}-"))
    (tmp / 'page.html').write_text(html)
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1080, 'height': 1350}, device_scale_factor=SCALE)
        pg.goto((tmp / 'page.html').as_uri(), wait_until='load')
        pg.evaluate('document.fonts.ready')
        pg.wait_for_timeout(300)
        frames = int(DUR * FPS)
        for f in range(frames):
            pg.evaluate(f'render({f / FPS})')
            pg.screenshot(path=str(tmp / f'f{f:04d}.jpg'), type='jpeg', quality=92)
        b.close()
    wav = tmp / 'music.wav'
    make_music(music, wav)
    w, h = int(1080 * SCALE), int(1350 * SCALE)
    out = OUT / f"{d['date']}.mp4"
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', str(tmp / 'f%04d.jpg'), '-i', str(wav),
                    '-vf', f'scale={w}:{h}:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
                    '-profile:v', 'high', '-c:a', 'aac', '-b:a', '160k', '-af', f'afade=t=out:st={DUR-1.5}:d=1.5',
                    '-t', str(DUR), '-movflags', '+faststart', str(out)], check=True)
    # cover: the payoff frame (just before the end card)
    shutil.copy(tmp / f'f{int((END - 0.6) * FPS):04d}.jpg', OUT / f"{d['date']}-cover.jpg")
    shutil.rmtree(tmp)
    print('ok', out.name, flush=True)

if __name__ == '__main__':
    want = set(sys.argv[1:])
    nos = numbers()
    for d in P.CAL['days']:
        if d['format'] == 'reel' and (not want or d['date'] in want):
            render_one(d, nos[d['date']])
