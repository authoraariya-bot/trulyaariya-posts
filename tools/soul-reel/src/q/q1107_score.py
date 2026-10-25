# 7 Nov score: a light, lifting pop melody when the wings arrive; a heavy thud and a dull low drone under the
# backpack; a shrug and thud as it falls off; then a bright rising swell and bells as the Soul flies.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 450, 360, 378
OPEN, WINGS, DROP, THUD, SHRUG, OFF, CHOOSE, RISE = 34, 40, 100, 118, 186, 206, 214, 222
S = QScore(END / 30, seed=1170)
S.bed([[72, 76, 79, 84], [69, 72, 76, 81]], 0.1, at(THUD), bar=2.0, amp=0.03)
S.snap(at(OPEN), 0.06); S.chime(WINGS, 0.05)
for i in range(4): S.bell(WINGS + 6 + i * 5, [84, 88, 91, 96][i], 0.016)
S.sweep(at(DROP), at(THUD) - at(DROP), 1400, 200, 0.03)
S.kick(at(THUD), 0.6); S.bass(N(36), at(THUD), 2.0, 0.1)
S.bed([[48, 55, 58], [46, 53, 58]], at(THUD), at(SHRUG), bar=2.0, amp=0.024)
S.sweep(at(SHRUG), 0.5, 300, 900, 0.025); S.kick(at(OFF), 0.4)
S.riser(at(CHOOSE - 6), at(RISE + 10) - at(CHOOSE - 6), 0.045); S.chime(CHOOSE + 2, 0.06)
S.bed([[72, 76, 79, 84], [74, 77, 81, 86], [76, 79, 83, 88], [72, 76, 79, 84]], at(CHOOSE), at(WIPE) + 0.6, bar=2.0, amp=0.036)
S.beat(at(RISE), at(WIPE), bpm=96, amp=0.5)
S.end_card(CARD, root=72)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1107.wav")); print("ok")
