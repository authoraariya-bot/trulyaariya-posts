# 3 Nov score: a busy light loop; each task lands with a thud and a descending power-down blip; low-battery beeps;
# more tasks patter in; a tape-rewind warble; then a plug click, a charging chime and a slow cosy piano.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 450, 360, 378
TASKS, MORE, REW0, SIT, PLUG = [40, 72, 104], 150, 204, 226, 240
S = QScore(END / 30, seed=1130)
S.beat(at(4), at(REW0), 100, 0.45)
for k in range(6): S.felt(N([60, 64, 67, 64][k % 4]), at(6 + k * 30), 0.03, 1.6)
for a in TASKS: S.kick(at(a + 14), 0.2); S.sweep(at(a + 16), 0.45, 700, 220, 0.04)
for k in range(5): S.sweep(at(130 + k * 9), 0.1, 1900, 1900, 0.025)
for i in range(10): S.noise(at(MORE + i * 5 + 12), 0.06, 0.03, 0.4, 2)
S.sweep(at(REW0), 0.6, 300, 1500, 0.05)
S.noise(at(SIT), 0.6, 0.025, 0.05, 2)
S.snap(at(PLUG), 0.07); S.arp(PLUG + 8, [72, 76, 79, 84], 0.12, 0.035, 2.6)
S.bed([[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]], at(PLUG), at(WIPE) + 0.6, bar=2.6, amp=0.03)
S.end_card(CARD, root=60)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1103.wav")); print("ok")
