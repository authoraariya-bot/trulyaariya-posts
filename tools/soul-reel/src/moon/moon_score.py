# "You are the moon of your world": sound matched to the picture.
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at
END = 615
T = dict(bIn0=58, bIn1=150, glowOn=170, look1=250, crowd=250, pause=318, aWalk0=360, aWalk1=404, take=420, rise0=430, rise1=486, wipe=518, card=536)
sm = lambda x: (lambda y: y*y*y*(y*(y*6-15)+10))(min(1, max(0, x)))
def steps(a, b, x0, x1):
    out, k = [], 1
    for f in range(a, b + 1):
        ph = abs((x0 + (x1 - x0) * sm((f - a) / (b - a))) - x0) / 248 * 2 * math.pi
        if ph >= k * math.pi - 0.6: out.append(f); k += 1
    return out
S = Score(END / 30, seed=101)
# muted twilight bed, then warm and open once the moon rises
S.bed([[57, 60, 64, 67], [53, 57, 60, 64]], 0.2, at(T['take']) + 0.5, bar=3.4, amp=0.022)
S.bed([[60, 64, 67, 72], [65, 69, 72, 76], [57, 60, 64, 69], [62, 65, 69, 74]], at(T['take']), at(T['wipe']) + 0.8, bar=2.4, amp=0.034)
# evening air: a soft breeze and far crickets
S.wind(10, 0.05); S.wind(200, 0.04); S.wind(470, 0.05)
for k in range(14):
    s = 0.6 + k * 1.05
    if s < at(T['rise1']): S.chirp(s, 0.006)
# the friend's footsteps on grass
for fr in steps(T['bIn0'], T['bIn1'], 1260, 770): S.soft_step(fr, 0.05); S.noise(at(fr) + 0.02, 0.12, 0.012, 0.3, 2)
# the moon and the stars light up in its hands
S.felt(N(76), at(T['glowOn']), 0.05, 4); S.felt(N(83), at(T['glowOn']) + 0.12, 0.03, 4)
for i in range(5): S.bell(T['glowOn'] + 4 + i * 4, [88, 91, 95, 93, 96][i], 0.014)
# the stars crowd: tiny twinkles; the soul's light dims (a low, sinking note)
for i in range(10): S.bell(T['crowd'] + 2 + i * 5, [93, 96, 98, 95, 100, 97, 94, 99, 96, 101][i], 0.009)
S.felt(N(52), at(T['look1'] + 22), 0.045, 4); S.felt(N(50), at(T['look1'] + 40), 0.035, 4)
# the pause: one gentle piano note, a slow breath
S.piano(N(72), at(T['pause']), 0.07, 3.0); S.noise(at(T['pause'] + 4), 1.0, 0.012, 0.03, 1.5)
# two steps toward the moon
for fr in steps(T['aWalk0'], T['aWalk1'], 320, 480): S.soft_step(fr, 0.05); S.noise(at(fr) + 0.02, 0.12, 0.012, 0.3, 2)
# taking the moon: a soft touch and a bell
S.noise(at(T['take'] - 2), 0.12, 0.02, 0.15, 2); S.bell(T['take'], 88, 0.035)
# it floats up: a rising swell and an opening chord; shimmer as flowers bloom
S.strings([N(60), N(67), N(72)], at(T['rise0']), at(T['rise1']) + 1.5, 0.03, 1.4, 1.5)
S.arp(T['rise0'] + 6, [72, 76, 79, 84], 0.22, 0.05, 2.6)
for i in range(6): S.bell(T['rise1'] - 6 + i * 4, [91, 95, 98, 100, 103, 98][i], 0.011)
# the petal wave and the end card
S.noise(at(T['wipe'] - 6), 1.4, 0.05, 0.05, 1.3)
S.end_card(T['card'], root=60)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "moon.wav")); print("ok")
