# 2 Nov score: dawn wind and a sparse, slightly hollow felt piano; a deep muffled whoosh down into the earth;
# a low heartbeat glow that swells into strings as gold light runs up the roots; a bright chord as the tree blooms.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 420, 330, 348
DIVE0, DIVE1, GLOW, FLOW0, FLOW1, RISE0, RISE1, BLOOM, KEY = 84, 126, 130, 146, 206, 208, 240, 236, 268
S = QScore(END / 30, seed=1102)
S.wind(0, 0.07); S.wind(40, 0.06)
for k, m in enumerate([62, 65, 69, 64, 62]): S.felt(N(m), at(4 + k * 16), 0.04, 3)
S.sweep(at(DIVE0), 1.3, 220, 70, 0.07); S.noise(at(DIVE0), 1.3, 0.04, 0.02, 1)
for k in range(8): S.kick(at(GLOW + k * 17), 0.18 * (0.6 + 0.4 * (k / 8)))   # heartbeat
S.strings([N(50), N(57), N(62), N(66)], at(FLOW0), at(WIPE) + 0.4, 0.016, 2.0, 1.5)
S.bed([[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 67], [57, 61, 64, 69]], at(FLOW0), at(WIPE) + 0.6, bar=2.4, amp=0.03)
S.sweep(at(RISE0), 1.0, 90, 300, 0.04)
S.chime(BLOOM + 2, 0.05); S.arp(BLOOM + 10, [74, 78, 81, 86, 90], 0.1, 0.035, 2.4)
for i, m in enumerate([78, 81, 85, 90]): S.bell(KEY + 6 + i * 4, m, 0.026)
S.end_card(CARD, root=62)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1102.wav")); print("ok")
