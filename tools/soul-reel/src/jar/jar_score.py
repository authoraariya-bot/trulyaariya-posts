# Reel 4: the jar. Sound matched to the picture.
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at
END = 615
T = dict(walk0=70, walk1=150, kneel0=176, tap=214, look0=238, stand0=262, reach0=292, twist0=306, pop=326, set1=352,
         air0=330, grow0=344, grow1=430, bloom0=410, back0=360, back1=392, breath0=430, wipe=518, card=536)
sm = lambda x: (lambda y: y*y*y*(y*(y*6-15)+10))(min(1, max(0, x)))
def steps(a, b, x0, x1):
    out, k = [], 1
    for f in range(a, b + 1):
        ph = abs((x0 + (x1 - x0) * sm((f - a) / (b - a))) - x0) / 248 * 2 * math.pi
        if ph >= k * math.pi - 0.6: out.append(f); k += 1
    return out
S = Score(END / 30, seed=404)
# muffled, closed-in pad until the lid comes off; then open and warm
S.bed([[57, 60, 64], [55, 59, 62]], 0.2, at(T['pop']) + 0.4, bar=3.2, amp=0.02)
S.bed([[64, 67, 71, 76], [60, 64, 67, 72], [62, 66, 69, 74], [64, 68, 71, 76]], at(T['pop']), at(T['wipe']) + 0.8, bar=2.4, amp=0.034)
S.wind(20, 0.03); for_ = None
for k in range(5): S.chirp(0.8 + k * 1.6, 0.006)
for fr in steps(T['walk0'], T['walk1'], 120, 412): S.soft_step(fr, 0.045); S.noise(at(fr) + 0.02, 0.1, 0.012, 0.35, 2)
S.felt(N(66), at(150), 0.03, 2)                                 # puzzled little note
S.noise(at(T['kneel0'] + 10), 0.4, 0.014, 0.05, 1.5)            # kneels on the grass
S.bell(T['tap'], 93, 0.03); S.bell(T['tap'] + 16, 93, 0.024)    # tink, tink on the glass
S.felt(N(71), at(T['look0'] + 4), 0.035, 2.5)                   # notices the lid
for k in range(4): S.noise(at(T['twist0'] + k * 5), 0.06, 0.02, 0.3, 2)   # twisting the lid
S.noise(at(T['pop']), 0.12, 0.05, 0.4, 2); S.bell(T['pop'], 86, 0.03)      # pop!
S.noise(at(T['set1'] - 4), 0.15, 0.015, 0.2, 2)                 # sets it down
S.noise(at(T['air0']), 1.8, 0.05, 0.03, 1.3); S.wind(T['air0'] + 6, 0.06)  # fresh air rushing in
S.strings([N(64), N(71), N(76)], at(T['grow0']), at(T['wipe']), 0.03, 1.4, 1.5)
S.arp(T['grow0'] + 6, [76, 79, 83, 88], 0.24, 0.05, 2.6)
for i in range(8): S.bell(T['bloom0'] + i * 6, [88, 91, 95, 93, 98, 100, 96, 103][i], 0.011)
for fr in steps(T['back0'], T['back1'], 412, 330): S.soft_step(fr, 0.035)
S.noise(at(T['breath0']), 1.4, 0.016, 0.03, 1.4)
for k in range(6): S.chirp(at(T['bloom0']) + k * 0.9, 0.007)
S.noise(at(T['wipe'] - 6), 1.4, 0.05, 0.05, 1.3)
S.end_card(T['card'], root=64)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "jar.wav")); print("ok")
