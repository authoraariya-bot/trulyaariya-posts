# 27 Oct score: restless surf + uneasy low pulse → the sea calms: soft felt piano in D, shimmering bells, slow surf.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 400, 310, 328
C0, C1, KEY, STEADY = 120, 220, 214, 252
S = QScore(END / 30, seed=27)
# restless: quick surf crashes + a low uneasy pulse
f = 0
while f < C1:
    calm = max(0, min(1, (f - C0) / (C1 - C0)))
    S.noise(at(f), 1.0 + 1.6 * calm, 0.07 * (1 - 0.6 * calm), 0.03, 1.4); f += int(16 + 30 * calm)
for k in range(6): S.felt(N(38), at(8 + k * 19), 0.05, 1.2); S.felt(N(45), at(17 + k * 19), 0.03, 1.0)
S.strings([N(50), N(53), N(57)], 0.1, at(C0 + 30), 0.012, 1.0, 1.2)   # D minor tension
# calm: D major bed + slow surf
S.bed([[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 69]], at(C0 + 10), at(WIPE) + 0.6, bar=2.6, amp=0.032)
for f in range(C1, WIPE, 46): S.noise(at(f), 2.4, 0.03, 0.015, 1.5)
for i, m in enumerate([78, 81, 85, 90]): S.bell(KEY + 4 + i * 4, m, 0.03)
S.felt(N(74), at(STEADY), 0.04, 4); S.felt(N(78), at(STEADY + 12), 0.035, 4)
S.wind(WIPE - 6, 0.04)
S.end_card(CARD, root=62)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1027.wav")); print("ok")
