# Reel 2 v2: restless beach → calm cove, lying back. Sound matched to the picture.
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at
END = 615
T = dict(sit1a=24, splash1=54, up1a=58, step0=78, step1=108, sit2a=112, splash2=140, up2a=144, shake0=160, walk0=190, walk1=300,
         look1=302, smile=318, sit3a=330, lie0=356, lie1=390, wiggle=396, wipe=518, card=536)
sm = lambda x: (lambda y: y*y*y*(y*(y*6-15)+10))(min(1, max(0, x)))
def steps(a, b, x0, x1):
    out, k = [], 1
    for f in range(a, b + 1):
        ph = abs((x0 + (x1 - x0) * sm((f - a) / (b - a))) - x0) / 248 * 2 * math.pi
        if ph >= k * math.pi - 0.6: out.append(f); k += 1
    return out
S = Score(END / 30, seed=212)
# restless surf, thinning out as the camera reaches the cove
fr = 4.0
while fr < T['walk1'] - 20:
    S.noise(at(fr), 0.9, 0.07 * (1 - 0.6 * max(0, (fr - T['walk0']) / 110)), 0.02, 1.2); fr += 20 + (fr * 7 % 9)
S.wind(0, 0.06); S.wind(90, 0.05)
for k in range(4): S.chirp(0.8 + k * 1.4, 0.008)
S.bed([[57, 60, 64], [56, 59, 64]], 0.2, at(T['walk1']), bar=3.0, amp=0.02)
S.bed([[62, 66, 69, 74], [59, 62, 66, 71], [55, 59, 62, 67], [57, 61, 64, 69]], at(T['walk1']) - 0.6, at(T['wipe']) + 0.8, bar=2.6, amp=0.032)
# sitting on the sand, two splashes, a hop, a little shake
for s in (T['sit1a'] + 16, T['sit2a'] + 16): S.noise(at(s), 0.3, 0.016, 0.05, 1.5)
for s in (T['splash1'], T['splash2']): S.noise(at(s - 6), 0.9, 0.09, 0.03, 1.1); S.noise(at(s), 0.35, 0.05, 0.25, 2); S.felt(N(52), at(s + 2), 0.035, 1.5)
for k in range(5): S.noise(at(T['shake0'] + k * 4), 0.08, 0.02, 0.4, 2)
# footsteps on sand
for fr2 in steps(T['step0'], T['step1'], 300, 430) + steps(T['walk0'], T['walk1'], 430, 1520): S.soft_step(fr2, 0.045); S.noise(at(fr2) + 0.02, 0.1, 0.012, 0.35, 2)
# the cove: slow, soft laps
fr = T['walk1'] - 40
while fr < T['wipe']:
    S.noise(at(fr), 2.4, 0.04, 0.012, 1.6); fr += 108
S.piano(N(74), at(T['smile']), 0.06, 3.0)
for i in range(4): S.bell(330 + i * 7, [86, 90, 93, 98][i], 0.012)
# sitting, a happy sigh as it lies back, then calm
S.noise(at(T['sit3a'] + 10), 0.4, 0.015, 0.05, 1.5); S.noise(at(T['lie0'] + 4), 1.2, 0.02, 0.03, 1.4)
S.arp(400, [74, 78, 81, 86], 0.2, 0.045, 2.6)
for k in range(3): S.bell(T['wiggle'] + 30 + k * 40, 98, 0.006)
S.noise(at(T['wipe'] - 6), 1.4, 0.05, 0.05, 1.3)
S.end_card(T['card'], root=62)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "sea2.wav")); print("ok")
