# 14 Nov score: a rising whistle that fizzles out ("pfft"); then soft single plucks for each small thing (water,
# moon, text, steps); the plucks speed up into a gentle shimmering run as the month fills; a warm glow chord.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 450, 360, 378
KEY = [44, 66, 96, 118]; R0, FIZZ, F0, F1, GLOW = 6, 30, 146, 222, 226
S = QScore(END / 30, seed=1140)
S.sweep(at(R0), at(FIZZ) - at(R0), 400, 2200, 0.03); S.sweep(at(FIZZ), 0.5, 900, 200, 0.03)
S.bed([[67, 71, 74], [64, 67, 71]], at(KEY[0]), at(F0), bar=2.2, amp=0.022)
for i, a in enumerate(KEY): S.bell(a, [79, 83, 86, 91][i], 0.022)
notes = [79, 81, 83, 86, 88, 91, 93, 95]
for i in range(31):
    fr = F0 + (F1 - F0) * ((i / 30) ** 0.8)
    S.bell(fr, notes[i % len(notes)], 0.012)
S.chime(GLOW, 0.07)
S.bed([[67, 71, 74, 79], [64, 67, 71, 76], [60, 64, 67, 72], [62, 66, 69, 74]], at(F0), at(WIPE) + 0.6, bar=2.0, amp=0.034)
S.end_card(CARD, root=67)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1114.wav")); print("ok")
