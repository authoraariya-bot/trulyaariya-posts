# 12 Nov score: polite "pop" blooms for the pots (one, two, three); a hesitant, quizzical figure for "tuesday?";
# a pause; then a low push, a crack, and a big warm bloom chord with bells for "you were busy surviving".
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 450, 360, 378
POTS = [32, 50, 68]; TUES, NOTB, PUSH0, BLOOM, SURV = 92, 152, 158, 222, 196
S = QScore(END / 30, seed=1120)
S.bed([[64, 67, 71, 76], [62, 66, 69, 74]], 0.1, at(NOTB), bar=2.4, amp=0.024)
for i, a in enumerate(POTS): S.snap(at(a), 0.04); S.bell(a, [84, 88, 91][i], 0.018)
S.felt(N(64), at(TUES + 4), 0.035, 0.6); S.felt(N(66), at(TUES + 12), 0.035, 0.6); S.felt(N(63), at(TUES + 22), 0.035, 1.2)
S.sweep(at(PUSH0 - 8), 1.0, 120, 260, 0.04); S.kick(at(PUSH0 + 2), 0.4)
S.riser(at(PUSH0), at(BLOOM) - at(PUSH0), 0.04)
S.chime(BLOOM, 0.07)
for i in range(5): S.bell(BLOOM + 4 + i * 6, [88, 91, 93, 96, 100][i], 0.016)
S.bed([[64, 68, 71, 76], [61, 64, 68, 73], [57, 61, 64, 69], [59, 63, 66, 71]], at(PUSH0), at(WIPE) + 0.6, bar=2.0, amp=0.036)
S.end_card(CARD, root=64)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1112.wav")); print("ok")
