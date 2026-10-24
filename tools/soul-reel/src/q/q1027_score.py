# 27 Oct score: big surf crashes that soften each time; a slow breathing felt-piano bed in D; bells as the Soul smiles.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 405, 315, 333
WAVES = [(4, 1.0), (60, 1.0), (150, 0.6), (220, 0.35), (262, 0.2)]
OPEN, BREATH = 268, 104
S = QScore(END / 30, seed=2710)
for a, g in WAVES:
    S.noise(at(a + 30), 1.6, 0.07 * g, 0.03, 1.2)           # the crash
    S.noise(at(a + 50), 2.2, 0.025 * g, 0.012, 1.6)         # foam running up the sand
S.noise(at(BREATH), 1.6, 0.03, 0.02, 1.2); S.noise(at(BREATH + 46), 2.2, 0.025, 0.015, 1.5)   # breath in, breath out
for k in range(6): S.felt(N([57, 58][k % 2]), at(6 + k * 16), 0.03, 1.2)   # restless pulse
S.bed([[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 67], [57, 61, 64, 69]], at(BREATH + 30), at(WIPE) + 0.6, bar=2.8, amp=0.03)
for i, m in enumerate([78, 81, 85, 90]): S.bell(OPEN + 4 + i * 6, m, 0.024)
S.end_card(CARD, root=62)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1027.wav")); print("ok")
