"""Render the Gold Leaf reels to MP4 (2160x2700, 30fps, H.264 + AAC, 20s) with original music.

  python3 reels_gl.py [date ...]
"""
import os, shutil, subprocess, sys, tempfile, importlib
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / 'tools'))
import goldleaf as G
from luxe_base import DEFS, velvet, crack_shape, jag

OUT = G.ROOT / 'reels'; OUT.mkdir(exist_ok=True)
FPS, DUR, END = 30, 20.0, G.END
SCALE = float(os.environ.get('REEL_SCALE', '2'))
MUSIC = {'2026-10-25': 'lofi', '2026-10-27': 'rising_piano', '2026-10-29': 'lofi', '2026-10-31': 'acoustic_hope',
         '2026-11-02': 'rising_piano', '2026-11-04': 'lullaby', '2026-11-06': 'acoustic_hope', '2026-11-08': 'lullaby',
         '2026-11-10': 'rising_piano', '2026-11-12': 'acoustic_hope', '2026-11-14': 'lullaby', '2026-11-16': 'lofi', '2026-11-18': 'rising_piano'}

def end_card():
    seam = crack_shape(jag((84, 980), (996, 1000), 10, 40, 77), 9, 77)
    svg = (f'<svg viewBox="0 0 1080 1350" style="position:absolute;inset:0;width:1080px;height:1350px">{DEFS}{velvet(99, (.4, .3), "cream")}'
           f'<g class="wipe" data-a="{END+.3}" data-b="{END+1.5}"><g filter="url(#glow)" opacity=".45"><path d="{seam}" fill="#f2c56a"/></g>'
           f'<g filter="url(#foil)"><path d="{seam}" fill="url(#gold)"/></g></g></svg>')
    return (f'<div {G.ani(END)} style="position:absolute;inset:0;z-index:30;color:#3a2228">{svg}'
            '<div class="frame"></div>'
            '<div class="cap gold" style="position:absolute;left:92px;top:300px;font-size:22px">A debut book by Aariya Sharma</div>'
            '<div class="gold" style="position:absolute;left:84px;top:350px;font-size:156px;line-height:.9;font-weight:500">A Self<br>Repaired<br>Soul</div>'
            '<div style="position:absolute;left:92px;top:830px;font-size:62px;font-style:italic">Journey That Heals</div>'
            '<div class="cap" style="position:absolute;left:92px;top:1080px;font-size:28px">Book coming soon</div>'
            '<div class="gold" style="position:absolute;left:92px;top:1130px;font-family:Jost;font-weight:600;letter-spacing:.14em;font-size:30px">@trulyaariya</div></div>')

def html(date):
    h = G.html_for(date)
    i = h.rindex('</div>\n<script>') if '</div>\n<script>' in h else h.rindex('</div><script>')
    return h[:i] + end_card() + h[i:]

def render(date):
    from playwright.sync_api import sync_playwright
    tmp = Path(tempfile.mkdtemp(prefix=f'gl-{date}-'))
    (tmp / 'p.html').write_text(html(date))
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1080, 'height': 1350}, device_scale_factor=SCALE)
        pg.goto((tmp / 'p.html').as_uri(), wait_until='load'); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(300)
        for f in range(int(DUR * FPS)):
            pg.evaluate(f'render({f / FPS})')
            pg.screenshot(path=str(tmp / f'f{f:04d}.jpg'), type='jpeg', quality=90)
        b.close()
    m = importlib.import_module('music')
    getattr(m, MUSIC.get(date, 'lullaby'))(DUR + 0.5, str(tmp / 'm.wav'))
    w, h_ = int(1080 * SCALE), int(1350 * SCALE)
    out = OUT / f'{date}.mp4'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', str(tmp / 'f%04d.jpg'), '-i', str(tmp / 'm.wav'),
                    '-vf', f'scale={w}:{h_}:flags=lanczos,format=yuv420p', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-profile:v', 'high',
                    '-c:a', 'aac', '-b:a', '160k', '-af', f'afade=t=out:st={DUR-1.6}:d=1.6', '-t', str(DUR), '-movflags', '+faststart', str(out)], check=True)
    shutil.copy(tmp / f'f{int((END - 0.8) * FPS):04d}.jpg', OUT / f'{date}-cover.jpg')
    shutil.rmtree(tmp)
    print('ok', date, flush=True)

if __name__ == '__main__':
    dates = sys.argv[1:] or [d['date'] for d in G.CAL['days'] if d['format'] == 'reel']
    for d in dates: render(d)
