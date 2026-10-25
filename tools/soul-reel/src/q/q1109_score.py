# 9 Nov score: a tender felt-piano line; each mean remark lands as a zap and a dull detuned drop as a piece flies
# away; silence; then a determined lift, three clicks as the pieces return, and a warm, whole chord with bells.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 450, 360, 378
HITS = [30, 70, 110]; RECLAIM, BACK0, KEEP = 156, 166, 214
S = QScore(END / 30, seed=1190)
S.bed([[65, 69, 72, 77], [62, 65, 69, 74]], 0.1, at(RECLAIM), bar=2.6, amp=0.026)
for k, a in enumerate(HITS):
    S.sweep(at(a + 2), 0.25, 2400, 900, 0.03); S.felt(N(53 - 2 * k), at(a + 8), 0.05, 1.4); S.sweep(at(a + 8), 0.6, 700, 160, 0.02)
S.riser(at(RECLAIM - 4), at(BACK0) - at(RECLAIM - 4), 0.035)
for i in range(3): S.snap(at(BACK0 + 16 + i * 10), 0.06); S.bell(BACK0 + 16 + i * 10, [84, 88, 91][i], 0.02)
S.chime(KEEP - 6, 0.06)
S.bed([[65, 69, 72, 77], [70, 74, 77, 82], [62, 65, 69, 74], [65, 69, 72, 77]], at(BACK0 + 40), at(WIPE) + 0.6, bar=2.2, amp=0.035)
S.end_card(CARD, root=65)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1109.wav")); print("ok")
