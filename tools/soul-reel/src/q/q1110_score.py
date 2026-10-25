# 10 Nov score: a shimmering golden key and an instant, satisfying click with a warm chord; it closes; then a
# jangling keyring, jiggles and dull "nope" thuds as the hourglass flips; finally the golden click again and bloom.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 410, 320, 338
TRIES = [100, 124, 148]; G1, C1, CLOSE, RING, G2, C2 = 10, 34, 70, 84, 176, 198
S = QScore(END / 30, seed=1100)
S.sweep(at(G1), at(C1) - at(G1), 2000, 5000, 0.015)
S.snap(at(C1), 0.08); S.chime(C1, 0.06)
S.bed([[69, 73, 76, 81]], at(C1), at(CLOSE) + 0.3, bar=1.6, amp=0.03)
S.felt(N(57), at(CLOSE + 4), 0.035, 1.2)
for k in range(12): S.hat(at(RING) + k * 0.09, 0.02)
for a in TRIES:
    for j in range(5): S.hat(at(a + 8) + j * 0.06, 0.03)
    S.kick(at(a + 14), 0.25); S.felt(N(50), at(a + 14), 0.04, 0.8)
S.bed([[57, 60, 64], [55, 59, 62]], at(RING), at(G2), bar=2.4, amp=0.022)
S.sweep(at(G2), at(C2) - at(G2), 2000, 5000, 0.018)
S.snap(at(C2), 0.09); S.chime(C2, 0.07)
S.bed([[69, 73, 76, 81], [66, 69, 73, 78], [62, 66, 69, 74], [64, 68, 71, 76]], at(C2), at(WIPE) + 0.6, bar=2.0, amp=0.036)
S.end_card(CARD, root=69)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1110.wav")); print("ok")
