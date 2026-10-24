# 29 Oct score: a tender felt-piano line in A-flat; each sticky note a soft paper slap; the flood of small notes a
# quick patter; then a warm breeze, paper flutters and rising bells as the notes become butterflies.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 420, 330, 348
NS, FLOOD, BREEZE, PEEL, SHINE, KEY = [34, 62, 90, 118], 146, 182, 190, 246, 268
S = QScore(END / 30, seed=29)
S.bed([[56, 60, 63, 67], [53, 56, 60, 63], [49, 53, 56, 60], [51, 55, 58, 63]], 0.1, at(WIPE) + 0.6, bar=2.8, amp=0.03)
for fr in NS: S.noise(at(fr), 0.07, 0.07, 0.3, 2); S.felt(N(51), at(fr), 0.05, 1.0)
for i in range(16): S.noise(at(FLOOD + i * 2.2), 0.05, 0.035, 0.35, 2)
S.wind(BREEZE - 14, 0.06); S.noise(at(BREEZE), 2.5, 0.025, 0.02, 1.5)
for i in range(20): S.noise(at(PEEL + i * 2.4), 0.12, 0.018, 0.4, 3)   # paper flutters
for i, m in enumerate([75, 79, 82, 87, 91]): S.bell(PEEL + 10 + i * 10, m, 0.026)
S.chime(SHINE + 6, 0.04)
for i, m in enumerate([80, 84, 87, 92]): S.bell(KEY + 6 + i * 4, m, 0.026)
S.end_card(CARD, root=68)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1029.wav")); print("ok")
