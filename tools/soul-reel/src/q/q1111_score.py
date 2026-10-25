# 11 Nov score: pencil scratches; each opinion pops with a dull blip over an uneasy pad; a breath of silence;
# then a steady, building beat with paper flicks as the stack rises, and a bright arrival chord at the top.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 420, 330, 348
OPS = [10, 24, 38, 52, 66]; IGNORE, RISE0, RISE1 = 80, 94, 184
S = QScore(END / 30, seed=1111)
for k in range(10): S.hat(0.1 + k * 0.33, 0.015)
S.bed([[57, 60, 64], [56, 59, 64]], 0.1, at(IGNORE), bar=2.4, amp=0.024)
for i, a in enumerate(OPS): S.sweep(at(a), 0.18, 900, 500, 0.03); S.felt(N(52 - i), at(a), 0.03, 0.8)
S.snap(at(IGNORE + 2), 0.05)
S.beat(at(RISE0), at(RISE1), bpm=100, amp=0.6)
k = at(RISE0)
while k < at(RISE1): S.sweep(k, 0.08, 3000, 4500, 0.012); k += 0.2
S.riser(at(RISE0), at(RISE1) - at(RISE0), 0.04)
S.chime(RISE1, 0.07)
S.bed([[60, 64, 67, 72], [65, 69, 72, 77], [67, 71, 74, 79], [60, 64, 67, 72]], at(RISE0), at(WIPE) + 0.6, bar=1.9, amp=0.034)
S.end_card(CARD, root=60)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1111.wav")); print("ok")
