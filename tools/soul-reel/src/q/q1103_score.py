# 3 Nov score: a busy lo-fi loop; each label drop a descending "power-down" blip; a low-battery beep at 1%;
# a tape-rewind warble; a plug click and a warm, slow charging chime; cosy felt piano as the blanket drapes.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 420, 330, 348
DRAIN, ONE, REW, PLUG, BLANKET, KEY = [74, 100, 126], 150, 214, 232, 246, 268
S = QScore(END / 30, seed=1103)
S.beat(at(4), at(REW), 104, 0.6)
for k in range(8): S.felt(N([60, 64, 67, 64][k % 4]), at(6 + k * 26), 0.035, 1.6)
for a in DRAIN: S.sweep(at(a + 6), 0.5, 700, 200, 0.05)
for k in range(5): S.sweep(at(ONE + k * 10), 0.12, 1900, 1900, 0.03)
S.sweep(at(REW), 0.55, 300, 1400, 0.05); S.sweep(at(REW + 6), 0.4, 1400, 500, 0.04)
S.snap(at(PLUG), 0.08); S.kick(at(PLUG), 0.2)
S.arp(PLUG + 8, [72, 76, 79, 84], 0.12, 0.04, 2.6)
S.bed([[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]], at(PLUG), at(WIPE) + 0.6, bar=2.6, amp=0.032)
S.noise(at(BLANKET), 0.6, 0.03, 0.05, 2)
for i, m in enumerate([76, 79, 83, 88]): S.bell(KEY + 6 + i * 4, m, 0.026)
S.end_card(CARD, root=60)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1103.wav")); print("ok")
