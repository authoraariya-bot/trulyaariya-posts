# 27 Oct score: big surf crashes that soften each time; a slow breathing felt-piano bed in D; bells as the Soul smiles.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 405, 315, 333
WAVES = [(10, 1.0), (82, 1.0), (154, 0.8), (222, 0.4), (270, 0.25)]
OPEN = 262
S = QScore(END / 30, seed=2710)
for a, g in WAVES:
    S.noise(at(a + 30), 1.6, 0.07 * g, 0.03, 1.2)           # the crash
    S.noise(at(a + 50), 2.2, 0.025 * g, 0.012, 1.6)         # foam running up the sand
S.bed([[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 67], [57, 61, 64, 69]], 0.2, at(WIPE) + 0.6, bar=2.8, amp=0.028)
for i, m in enumerate([78, 81, 85, 90]): S.bell(OPEN + 4 + i * 6, m, 0.024)
S.end_card(CARD, root=62)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1027.wav")); print("ok")
