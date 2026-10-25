# 29 Oct score: a tender felt piano in A-flat; each tag tied on is a soft low thump that pulls the melody down;
# as the tags fall away each is a light rising bell, and the heart floating up is a warm open chord.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 435, 345, 363
ATS, DROPS, UP = [54, 88, 122, 156], [214, 230, 246, 262], 268
S = QScore(END / 30, seed=2910)
for k, m in enumerate([68, 72, 75, 72]): S.felt(N(m), at(4 + k * 12), 0.03, 3)
for i, a in enumerate(ATS): S.felt(N(56 - i * 2), at(a), 0.05, 2.0); S.felt(N(63 - i * 2), at(a + 3), 0.03, 2.0); S.noise(at(a), 0.06, 0.02, 0.3, 2)
for i, d in enumerate(DROPS): S.bell(d + 2, [80, 84, 87, 92][i], 0.028)
S.bed([[68, 72, 75, 79], [65, 68, 72, 75], [61, 65, 68, 72], [63, 67, 70, 75]], at(200), at(WIPE) + 0.6, bar=2.4, amp=0.032)
S.chime(UP + 4, 0.05)
S.end_card(CARD, root=68)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1029.wav")); print("ok")
