# 13 Nov score: a nostalgic music-box melody; each memory gets a little flourish (a sung "la" figure, a sweet
# bell, a giggly trill); the swing starts with a creak-like glide; then a bright, bouncy playground groove.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 450, 360, 378
MEM = [34, 64, 94]; GONE, HOP, SWING = 140, 212, 220
S = QScore(END / 30, seed=1130)
mel = [76, 79, 81, 79, 76, 74, 72, 74, 76, 72]
for i, m in enumerate(mel): S.bell(4 + i * 13, m + 12, 0.014)
S.bed([[64, 67, 72], [62, 65, 69]], 0.1, at(GONE), bar=2.6, amp=0.024)
for k, n in enumerate([84, 88, 91]): S.felt(N(n - 12), at(MEM[0] + k * 4), 0.03, 0.6)
S.chime(MEM[1], 0.04)
for k in range(5): S.bell(MEM[2] + k * 2, 91 + (k % 2) * 3, 0.014)
S.sweep(at(GONE), 1.2, 300, 700, 0.025)
S.snap(at(HOP + 6), 0.05); S.chime(SWING, 0.06)
S.bed([[72, 76, 79, 84], [69, 72, 76, 81], [65, 69, 72, 77], [67, 71, 74, 79]], at(GONE + 20), at(WIPE) + 0.6, bar=1.8, amp=0.034)
S.beat(at(SWING), at(WIPE), bpm=104, amp=0.5)
S.end_card(CARD, root=72)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1113.wav")); print("ok")
