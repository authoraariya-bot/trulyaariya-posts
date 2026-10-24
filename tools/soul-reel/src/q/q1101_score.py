# 1 Nov score: chalk scratches over a tense lo-fi loop as the rules pile up; a big duster swoosh, four chalk snaps,
# then the beat drops warm and confident as the pink chalk writes "my story".
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 420, 330, 348
S0, W0, W1, SNAP, RISE, WR0, WR1, KEY = 22, 150, 182, 186, 194, 206, 246, 262
S = QScore(END / 30, seed=1101)
for i in range(7):
    a = S0 + i * 17
    for k in range(6): S.noise(at(a + k * 3.5), 0.09, 0.03, 0.55, 3)      # chalk scratch
S.beat(at(4), at(W0), 96, 0.55)
for k in range(5): S.felt(N(57), at(6 + k * 28), 0.04, 1.6); S.felt(N(56), at(20 + k * 28), 0.035, 1.6)
for k in range(3): S.noise(at(W0 + k * 10), 0.35, 0.06, 0.06, 1.5)        # duster swooshes
for i in range(4): S.snap(at(SNAP + i * 2), 0.09); S.hat(at(SNAP + i * 2), 0.05)
S.riser(at(RISE - 4), at(WR0) - at(RISE - 4), 0.05); S.kick(at(WR0), 0.55)
chords = [[65, 69, 72, 76], [62, 65, 69, 72], [58, 62, 65, 69], [60, 64, 67, 72]]
s = at(WR0); k = 0
while s < at(WIPE):
    for i, m in enumerate(chords[k % 4]): S.felt(N(m), s + i * 0.025, 0.034, 3.2)
    S.bass(chords[k % 4][0] - 24, s, 2.5, 0.1); s += 2.6; k += 1
S.beat(at(WR0), at(WIPE), 96, 0.9)
for k in range(10): S.noise(at(WR0 + k * 4), 0.08, 0.025, 0.55, 3)
for i, m in enumerate([77, 81, 84, 89]): S.bell(KEY + 6 + i * 4, m, 0.028)
S.end_card(CARD, root=65)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1101.wav")); print("ok")
