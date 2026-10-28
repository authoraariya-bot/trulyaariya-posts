# Reel 9: on the hill. Sound matched to the picture.
import sys, os, math
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at, sr, _lp
END = 640
T = dict(fIn0=46, fIn1=108, fSit0=120, fSit1=140, bump0=150, text1=152, gIn0=196, gIn1=244, gSit0=254, gSit1=266, rant0=270, rant1=356,
         gUp0=356, gOut0=382, gOut1=440, hand0=398, hand1=428, up0=420, lean0=432, wipe=548, card=566)
sm = lambda x: (lambda y: y*y*y*(y*(y*6-15)+10))(min(1, max(0, x)))
def steps(a, b, x0, x1, stride=248):
    out, k = [], 1
    for f in range(a, b + 1):
        ph = abs((x0 + (x1 - x0) * sm((f - a) / (b - a))) - x0) / stride * 2 * math.pi
        if ph >= k * math.pi - 0.6: out.append(f); k += 1
    return out
S = Score(END / 30, seed=909)
S.bed([[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]], 0.2, at(T['hand0']) + 0.6, bar=3.2, amp=0.036)
S.bed([[60, 64, 67, 72], [65, 69, 72, 76], [57, 60, 64, 69], [67, 71, 74, 79]], at(T['hand0']), at(T['wipe']) + 0.8, bar=2.6, amp=0.034)
S.wind(2, 0.06); S.wind(90, 0.05); S.wind(300, 0.04)
for k in range(3): S.chirp(1.0 + k * 1.9, 0.005)
# the friend arrives
for fr in steps(T['fIn0'], T['fIn1'], -140, 396): S.soft_step(fr, 0.04)
S.noise(at(T['fSit1'] - 4), 0.18, 0.03, 0.08, 2)                   # soft thump of sitting down
S.bell(T['bump0'] + 8, 88, 0.03); S.bell(T['bump0'] + 12, 93, 0.018)  # boop — cheer up
S.felt(N(67), at(T['text1'] + 6), 0.03, 3)
# the grey soul: stomps in, plops down, rants, storms off
for fr in steps(T['gIn0'], T['gIn1'], 1240, 688, 248 * 0.85):
    i = int(at(fr) * sr); L = int(0.16 * sr); tt = np.arange(L) / sr
    S.out[i:i + L] += 0.05 * np.sin(2 * np.pi * (80 - 30 * tt / 0.16) * tt) * np.exp(-tt * 24)
S.noise(at(T['gSit1'] - 3), 0.2, 0.04, 0.1, 2)
rng = np.random.default_rng(9); rant = np.zeros(S.n)
VOW = [(750, 1200), (500, 900), (450, 1800), (650, 1500), (400, 1000)]
t = at(T['rant0']) + 0.05
while t < at(T['rant1']) - 0.1:
    dur = 0.08 + 0.1 * rng.random(); f0 = 200 + 70 * rng.random(); F1, F2 = VOW[rng.integers(len(VOW))]
    i = int(t * sr); L = min(int(dur * sr), S.n - i); tt = np.arange(L) / sr
    ph = 2 * np.pi * np.cumsum(f0 * (1 + 0.15 * tt / dur)) / sr
    v = sum((np.exp(-((h * f0 - F1) / 260) ** 2) + 0.6 * np.exp(-((h * f0 - F2) / 380) ** 2) + 0.15 / h) * np.sin(h * ph) for h in range(1, 14))
    rant[i:i + L] += 0.055 * v * np.sin(np.pi * tt / dur) ** 0.7
    t += dur + 0.02 + 0.05 * rng.random() + (0.22 if rng.random() < 0.12 else 0)
S.out += _lp(rant, 0.3)
S.felt(N(57), at(T['rant0'] + 30), 0.026, 4)
S.noise(at(T['gUp0']), 0.3, 0.02, 0.1, 2); S.noise(at(T['gUp0'] + 10), 0.35, 0.014, 0.2, 1.5)   # gets up with a huff
for fr in steps(T['gOut0'], T['gOut1'], 688, 1280, 248 * 0.85):
    i = int(at(fr) * sr); L = int(0.16 * sr); tt = np.arange(L) / sr
    S.out[i:i + L] += 0.03 * np.sin(2 * np.pi * (80 - 30 * tt / 0.16) * tt) * np.exp(-tt * 24)
# the friend stays: hand on the shoulder, both look ahead
S.bell(T['hand1'] - 4, 84, 0.026); S.felt(N(72), at(T['hand1']), 0.034, 3.5)
S.noise(at(T['up0']), 1.0, 0.018, 0.4, 1.2); S.noise(at(T['up0'] + 30), 1.1, 0.016, 0.05, 1.6)
S.strings([N(60), N(67), N(76)], at(T['hand0']), at(T['wipe']), 0.032, 1.4, 1.5)
S.arp(T['lean0'], [72, 76, 79, 84], 0.26, 0.045, 2.6)
for k in range(6): S.chirp(at(T['lean0']) + k * 0.9, 0.007)
S.noise(at(T['wipe'] - 6), 1.4, 0.05, 0.05, 1.3)
S.end_card(T['card'], root=60)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "hill.wav")); print("ok")
