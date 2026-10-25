# 4 Nov score: a dreamy night lullaby (felt piano + soft crickets); stars twinkle in as bells; the music dulls and
# drops when the moon hides; a curious peek note; then the moon comes out: a warm open swell and bright bells.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 450, 360, 378
STARS, HIDE0, HIDE1, PEEK, OUT0, OUT1 = 46, 92, 124, 168, 196, 222
S = QScore(END / 30, seed=1140)
for k in range(int(at(END) / 0.4)): S.sweep(k * 0.4, 0.05, 4200, 4400, 0.004)
S.bed([[69, 73, 76, 80], [66, 69, 73, 76]], 0.1, at(HIDE0) + 0.8, bar=2.4, amp=0.03)
for i in range(8): S.bell(STARS + i * 6, [88, 91, 93, 96][i % 4], 0.016)
S.sweep(at(HIDE0), 1.2, 400, 180, 0.03)
for k in range(3): S.felt(N(57 - k), at(HIDE1 + k * 14), 0.04, 2)
S.felt(N(81), at(PEEK + 6), 0.035, 1.2); S.felt(N(85), at(PEEK + 12), 0.03, 1.2)
S.riser(at(OUT0 - 10), at(OUT1) - at(OUT0 - 10), 0.04); S.chime(OUT1, 0.06)
S.bed([[69, 73, 76, 81], [66, 69, 73, 78], [62, 66, 69, 74], [64, 68, 71, 76]], at(OUT1), at(WIPE) + 0.6, bar=2.2, amp=0.034)
S.end_card(CARD, root=69)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1104.wav")); print("ok")
