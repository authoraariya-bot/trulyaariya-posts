# 6 Nov score: a muffled, slightly airless felt piano (low-passed) while the jar fogs; three lid twists as creaks;
# a bright "pop"; a rush of fresh air; the music opens up: strings + a clear piano in G, bells as it blooms.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 420, 330, 348
TW, POP, AIR, GROW0, BLOOM, KEY = [150, 162, 174], 184, 190, 200, 252, 236
S = QScore(END / 30, seed=1106)
for k, m in enumerate([55, 59, 62, 59, 57, 60, 64, 60, 55]): S.felt(N(m), at(4 + k * 16), 0.035, 2.5)
S.noise(0, at(POP), 0.008, 0.01, 1)
for s in TW: S.sweep(at(s), 0.18, 220, 160, 0.04); S.noise(at(s), 0.15, 0.03, 0.3, 2)
S.sweep(at(POP), 0.08, 900, 2400, 0.06); S.kick(at(POP), 0.25)
S.noise(at(AIR), 2.2, 0.06, 0.03, 1.5)
S.bed([[67, 71, 74, 78], [64, 67, 71, 74], [60, 64, 67, 71], [62, 66, 69, 74]], at(AIR), at(WIPE) + 0.6, bar=2.4, amp=0.034)
S.strings([N(55), N(62), N(67), N(71)], at(GROW0), at(WIPE) + 0.4, 0.016, 2, 1.5)
S.chime(BLOOM, 0.05)
for i, m in enumerate([79, 83, 86, 91]): S.bell(KEY + 6 + i * 4, m, 0.026)
S.end_card(CARD, root=67)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1106.wav")); print("ok")
