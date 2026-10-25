# 8 Nov score: a hurried, ticking beat with whooshes as the shoes rush past; everything stops on a breath;
# then a slow, sunny walking groove (soft felt piano, gentle bells) at an easy pace.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 420, 330, 348
SHOES = [12, 28, 44, 60, 78, 96]; STOP, B0, M0, M1, WALK = 112, 124, 140, 186, 196
S = QScore(END / 30, seed=1180)
k = 0.0
while k < at(STOP): S.hat(k, 0.03); k += 0.125
S.beat(0.1, at(STOP), bpm=128, amp=0.6)
for a in SHOES: S.sweep(at(a), 0.5, 600, 3000, 0.035)
S.snap(at(STOP), 0.06)
S.sweep(at(B0), at(B0 + 26) - at(B0), 400, 1200, 0.02)
for i in range(6): S.bell(M0 + 10 + i * 6, [79, 83, 86, 88, 91, 95][i], 0.015)
S.bed([[67, 71, 74, 79], [64, 67, 71, 76], [60, 64, 67, 72], [62, 66, 69, 74]], at(M0), at(WIPE) + 0.6, bar=2.4, amp=0.034)
for i in range(10): S.felt(N([67, 71, 74, 72, 71, 69, 67, 69, 71, 67][i]), at(WALK) + i * 0.5, 0.03, 1.0)
S.end_card(CARD, root=67)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1108.wav")); print("ok")
