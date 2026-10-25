# 6 Nov score: a muffled, airless pad while the jar fogs (low, filtered, a slow drip), a little twist and a bright
# pop when the lid comes off, an airy whoosh, then an open, breathing bed with bloom bells.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 450, 360, 378
POP, BREATH, BLOOM = 166, 184, 236
S = QScore(END / 30, seed=1160)
S.bed([[57, 60, 64], [55, 59, 62]], 0.1, at(POP), bar=2.6, amp=0.026)
for k in range(4): S.bell(60 + k * 22, 84 - k, 0.012)
S.sweep(at(POP - 12), 0.3, 900, 1400, 0.02)
S.snap(at(POP), 0.07); S.chime(POP, 0.05)
S.sweep(at(POP + 2), 1.4, 300, 3200, 0.035)
S.sweep(at(BREATH), 1.2, 500, 1600, 0.02)
for i in range(5): S.bell(BLOOM + i * 6, [84, 88, 91, 93, 96][i], 0.018)
S.bed([[64, 67, 71, 76], [60, 64, 67, 72], [62, 66, 69, 74], [64, 68, 71, 76]], at(POP + 6), at(WIPE) + 0.6, bar=2.2, amp=0.034)
S.end_card(CARD, root=64)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1106.wav")); print("ok")
