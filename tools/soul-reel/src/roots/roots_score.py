# Reel 8: the tree and its roots. Sound matched to the picture.
import sys, os, math
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at, sr
END = 645
T = dict(walk0=8, walk1=70, raise0=76, spray0=92, lower0=140, puzzle=156, camDown0=162, camDown1=214, step0=214, step1=244, kneel0=244,
         pour0=264, pour1=306, seep0=270, wet0=296, ownRoots0=300, setCan1=318, hands0=318, hands1=332, breath0=334, breath1=370,
         flowSoul0=342, flowTree0=366, grow0=368, grow1=424, camUp0=418, camUp1=458, stand0=436, green0=426, bloom0=456, wipe=548, card=566)
sm = lambda x: (lambda y: y*y*y*(y*(y*6-15)+10))(min(1, max(0, x)))
def steps(a, b, x0, x1):
    out, k = [], 1
    for f in range(a, b + 1):
        ph = abs((x0 + (x1 - x0) * sm((f - a) / (b - a))) - x0) / 248 * 2 * math.pi
        if ph >= k * math.pi - 0.6: out.append(f); k += 1
    return out
S = Score(END / 30, seed=808)
S.bed([[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]], 0.2, at(T['breath0']) + 0.6, bar=3.0, amp=0.022)
S.bed([[60, 64, 67, 72], [65, 69, 72, 76], [57, 60, 64, 69], [67, 71, 74, 79]], at(T['breath0']), at(T['wipe']) + 0.8, bar=2.6, amp=0.034)
S.wind(4, 0.04); S.wind(120, 0.03)
# a tired tree: a soft creak now and then, dry leaves dropping
def creak(fr, amp=0.02):
    i = int(at(fr) * sr); L = int(0.5 * sr); tt = np.arange(L) / sr
    f0 = 140 + 40 * np.sin(2 * np.pi * 3 * tt)
    S.out[i:i + L] += amp * np.sign(np.sin(2 * np.pi * np.cumsum(f0) / sr)) * 0.3 * np.sin(np.pi * tt / 0.5) ** 2 * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * tt))
creak(20); creak(130, 0.016)
for k in range(6): S.noise(at(10 + k * 22), 0.25, 0.008, 0.3, 2)
for fr in steps(T['walk0'], T['walk1'], -80, 330): S.soft_step(fr, 0.04)
for k in range(3): S.noise(at(T['walk0'] + 10 + k * 18), 0.08, 0.008, 0.4, 2)   # the can's water sloshing
S.noise(at(T['spray0']), (T['lower0'] - T['spray0']) / 30, 0.03, 0.5, 1.1)       # sprinkle on the leaves
for k in range(10): S.bell(T['spray0'] + 8 + k * 5, 100 + (k % 3), 0.006)         # drips
S.felt(N(62), at(T['puzzle']), 0.03, 2.5)                                          # …nothing
S.noise(at(T['camDown0']), 1.6, 0.03, 0.03, 1.3)                                   # sliding down below the ground
S.felt(N(55), at(T['camDown0'] + 20), 0.03, 4)
for fr in steps(T['step0'], T['step1'], 330, 520): S.soft_step(fr, 0.035)
S.noise(at(T['kneel0'] + 10), 0.4, 0.014, 0.05, 1.5)
S.noise(at(T['pour0'] + 8), (T['pour1'] - T['pour0'] - 10) / 30, 0.035, 0.25, 1.1)  # pouring on the soil
S.noise(at(T['seep0'] + 10), 1.6, 0.012, 0.02, 1.4)                                 # soaking in
S.noise(at(T['setCan1'] - 2), 0.1, 0.02, 0.3, 2)
S.noise(at(T['hands0'] + 10), 0.15, 0.016, 0.1, 2); S.noise(at(T['hands0'] + 13), 0.15, 0.014, 0.1, 2)  # palms on the soil
S.felt(N(64), at(T['ownRoots0']), 0.03, 3)
S.noise(at(T['breath0']), 1.0, 0.026, 0.4, 1.2); S.noise(at(T['breath0'] + 34), 1.1, 0.022, 0.05, 1.6)
S.pad([N(48), N(55)], at(T['flowSoul0']), at(T['grow1']) + 0.6, 0.016, 1.0)             # warm hum of the light
for k in range(16): S.noise(at(T['grow0'] + k * 3.4), 0.04, 0.008, 0.6, 2)              # roots growing: tiny crackles
S.strings([N(60), N(67), N(76)], at(T['flowTree0']), at(T['wipe']), 0.03, 1.4, 1.5)
S.noise(at(T['camUp0']), 1.4, 0.022, 0.03, 1.3)
S.arp(T['bloom0'], [72, 76, 79, 84], 0.24, 0.05, 2.6)
for i in range(8): S.bell(T['bloom0'] + 6 + i * 6, [88, 91, 95, 93, 98, 100, 96, 103][i], 0.011)
for k in range(6): S.chirp(at(T['bloom0']) + k * 0.9, 0.007)
S.noise(at(T['wipe'] - 6), 1.4, 0.05, 0.05, 1.3)
S.end_card(T['card'], root=60)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "roots.wav")); print("ok")
