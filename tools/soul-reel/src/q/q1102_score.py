# 2 Nov score: gentle felt piano; a light sprinkle as the leaves are watered (nothing changes: a hollow note);
# a soft "hm?"; water seeping down; a deep warm swell as the roots turn gold; bells as the tree blooms.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 450, 360, 378
L0, L1, PUZ, BASE0, SEEP0, GOLD0, BLOOM = 16, 96, 104, 150, 162, 206, 262
S = QScore(END / 30, seed=1120)
for k, m in enumerate([67, 71, 74, 71, 69, 72]): S.felt(N(m), at(2 + k * 18), 0.028, 2.6)
for k in range(10): S.noise(at(L0 + k * 8), 0.2, 0.012, 0.5, 2)
S.felt(N(55), at(L1), 0.04, 1.4)
S.felt(N(69), at(PUZ), 0.035, 1); S.felt(N(72), at(PUZ + 5), 0.03, 1)
for k in range(8): S.noise(at(BASE0 + k * 7), 0.2, 0.012, 0.5, 2)
S.sweep(at(SEEP0), 1.6, 500, 160, 0.02)
S.strings([N(55), N(62), N(67)], at(GOLD0), at(WIPE) + 0.4, 0.016, 2, 1.5)
S.bed([[67, 71, 74, 78], [64, 67, 71, 74], [60, 64, 67, 71], [62, 66, 69, 74]], at(GOLD0), at(WIPE) + 0.6, bar=2.4, amp=0.03)
S.chime(BLOOM, 0.05)
S.end_card(CARD, root=67)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1102.wav")); print("ok")
