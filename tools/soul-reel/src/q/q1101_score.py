# 1 Nov score: chalk scratches over a slightly tense, light lo-fi loop as the rules appear; one big duster swoosh;
# the chalks clatter down; then a warm confident groove while the Soul writes "my story".
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 435, 345, 363
WIPE0, DROP, PICK, WR0, WR1, TURN = 140, 150, 182, 196, 250, 262
S = QScore(END / 30, seed=1111)
for i in range(5):
    a = 22 + i * 20
    for k in range(5): S.noise(at(a + k * 3.6), 0.08, 0.025, 0.55, 3)
for k in range(4): S.felt(N(57), at(6 + k * 30), 0.03, 1.6); S.felt(N(56), at(20 + k * 30), 0.025, 1.6)
S.beat(at(10), at(WIPE0), 92, 0.35)
S.noise(at(WIPE0), 1.0, 0.07, 0.05, 1.3)
for i in range(5): S.hat(at(DROP + i * 3 + 20), 0.04); S.snap(at(DROP + i * 3 + 22), 0.04)
S.bell(PICK, 88, 0.03)
for k in range(9): S.noise(at(WR0 + k * 6), 0.08, 0.025, 0.55, 3)
chords = [[65, 69, 72, 76], [62, 65, 69, 72], [58, 62, 65, 69], [60, 64, 67, 72]]
s = at(WR0); k = 0
while s < at(WIPE):
    for i, m in enumerate(chords[k % 4]): S.felt(N(m), s + i * 0.025, 0.032, 3)
    S.bass(chords[k % 4][0] - 24, s, 2.0, 0.08); s += 2.1; k += 1
S.beat(at(WR0), at(WIPE), 92, 0.75)
S.chime(TURN, 0.04)
S.end_card(CARD, root=65)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1101.wav")); print("ok")
