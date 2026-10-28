# "You are the moon of your world": sound matched to the picture.
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at
END = 660
T = dict(bIn0=70, bIn1=172, hear=96, stand0=124, offer0=178, glowOn=196, lookMoon=214, lookStars=240, lookBack=272, breath0=280,
         aWalk0=306, aWalk1=346, take=360, lift0=366, rise0=374, rise1=432, scatter0=450, scatter1=520, wipe=570, card=588)
sm = lambda x: (lambda y: y*y*y*(y*(y*6-15)+10))(min(1, max(0, x)))
def steps(a, b, x0, x1):
    out, k = [], 1
    for f in range(a, b + 1):
        ph = abs((x0 + (x1 - x0) * sm((f - a) / (b - a))) - x0) / 248 * 2 * math.pi
        if ph >= k * math.pi - 0.6: out.append(f); k += 1
    return out
S = Score(END / 30, seed=101)
# muted dusk bed, then warm and open once the moon rises
S.bed([[57, 60, 64, 67], [53, 57, 60, 64]], 0.2, at(T['take']) + 0.5, bar=3.4, amp=0.022)
S.bed([[60, 64, 67, 72], [65, 69, 72, 76], [57, 60, 64, 69], [62, 65, 69, 74]], at(T['take']), at(T['wipe']) + 0.8, bar=2.4, amp=0.034)
S.wind(10, 0.05); S.wind(230, 0.04); S.wind(500, 0.05)
for k in range(12): S.chirp(0.7 + k * 1.1, 0.006)
# picking at the grass: soft rustles
for k in range(5): S.noise(at(6 + k * 21), 0.22, 0.016, 0.25, 2)
# the friend's footsteps; the soul stands up
for fr in steps(T['bIn0'], T['bIn1'], 1270, 790): S.soft_step(fr, 0.05); S.noise(at(fr) + 0.02, 0.12, 0.012, 0.3, 2)
S.noise(at(T['stand0']), 0.7, 0.014, 0.04, 1.5)
# the moon and the stars light up in its hands
S.felt(N(76), at(T['glowOn']), 0.05, 4); S.felt(N(83), at(T['glowOn']) + 0.12, 0.03, 4)
for i in range(6): S.bell(T['glowOn'] + 4 + i * 3, [91, 95, 98, 96, 100, 103][i], 0.012)
# choosing: a soft note for the moon, twinkles for the stars, the moon again
S.felt(N(79), at(T['lookMoon']), 0.035, 3)
for i in range(5): S.bell(T['lookStars'] + 2 + i * 4, [96, 98, 100, 98, 103][i], 0.009)
S.felt(N(79), at(T['lookBack']), 0.035, 3)
# one slow breath, one piano note
S.piano(N(72), at(T['breath0']), 0.065, 3.0); S.noise(at(T['breath0'] + 4), 0.9, 0.012, 0.03, 1.5)
for fr in steps(T['aWalk0'], T['aWalk1'], 300, 520): S.soft_step(fr, 0.05); S.noise(at(fr) + 0.02, 0.12, 0.012, 0.3, 2)
# taking the moon, letting it float up
S.noise(at(T['take'] - 2), 0.12, 0.02, 0.15, 2); S.bell(T['take'], 88, 0.035)
S.strings([N(60), N(67), N(72)], at(T['rise0']), at(T['rise1']) + 1.5, 0.03, 1.4, 1.5)
S.arp(T['rise0'] + 6, [72, 76, 79, 84], 0.22, 0.05, 2.6)
# the stars drift up and settle around the moon
for i in range(8): S.bell(T['scatter0'] + 4 + i * 7, [96, 100, 103, 98, 101, 105, 99, 103][i], 0.009)
S.noise(at(T['wipe'] - 6), 1.4, 0.05, 0.05, 1.3)
S.end_card(T['card'], root=60)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "moon.wav")); print("ok")
