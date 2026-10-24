# 28 Oct score: THEN = rain, a fast ticking clock and a pop for every theory bubble over a tense lo-fi loop;
# NOW = the rain stops, a slow warm groove, a lamp click, a soft chord on "Softer you."
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 420, 330, 348
TH, NOW, CALM, FLIP, LAMP, MASK, SAME, KEY = 34, 140, 172, 206, 222, 232, 252, 270
S = QScore(END / 30, seed=28)
for k in range(int(at(NOW) / 0.9)): S.noise(k * 0.9, 1.2, 0.025, 0.2, 1)        # rain hiss
for i in range(20): fr = TH + i * 4.6; S.sweep(at(fr), 0.07, 500 + 40 * i, 900 + 60 * i, 0.04)   # bubble pops
f = TH
while f < NOW - 6: S.hat(at(f), 0.05); f += 4 + 8 * max(0, 1 - (f - TH) / 80)     # clock tick speeds up
for k in range(4): S.felt(N(57), at(10 + k * 30), 0.04, 1.5); S.felt(N(60), at(25 + k * 30), 0.035, 1.5)
S.beat(at(TH), at(NOW - 6), 100, 0.6)
S.noise(at(NOW - 6), 0.5, 0.06, 0.05, 1)  # whoosh
chords = [[64, 67, 71, 74], [60, 64, 67, 71], [62, 65, 69, 72], [59, 62, 67, 71]]
s = at(NOW); k = 0
while s < at(WIPE):
    for i, m in enumerate(chords[k % 4]): S.felt(N(m), s + i * 0.03, 0.03, 4)
    S.bass(chords[k % 4][0] - 24, s, 2.2, 0.08); s += 2.4; k += 1
S.beat(at(NOW + 10), at(WIPE), 76, 0.5)
S.snap(at(LAMP), 0.08); S.felt(N(84), at(CALM + 4), 0.04, 2); S.noise(at(FLIP), 0.25, 0.03, 0.1, 2)
for i, m in enumerate([76, 79, 83, 88]): S.bell(KEY + 4 + i * 4, m, 0.03)
S.end_card(CARD, root=64)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1028.wav")); print("ok")
