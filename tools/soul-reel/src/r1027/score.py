"""27 Oct score (soothing): a slow felt-piano bed in D minor that turns to D major as the seasons pass → rain, then
a hush of snow, blossom bells, warm summer strings → pages turning softly → the book closes → the shadow begins to dance:
a gentle waltz-like lift → payoff → end card."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at

END, WIPE, CARD = 600, 500, 518
T = dict(s1=70, s2=140, s3=210, s4=270, close=300, stand=316, hug=332, shadow=340, see=384, cheer=412)
S = Score(END / 30, seed=13)
S.bed([[50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 49, 52]], 0.1, at(T['s3']), bar=3.4, amp=0.026)        # minor, quiet
S.bed([[50, 54, 57], [55, 59, 62], [47, 50, 54], [52, 55, 59]], at(T['s3']), END / 30 - 1.0, bar=3.0, amp=0.028)  # turns major
S.noise(0, at(T['s1'] + 10), 0.016, 0.02, 0.6)                                     # rain
for k in range(6): S.bell(T['s1'] + 8 + k * 11, [88, 91, 86, 93, 89, 95][k], 0.012)  # snow
for k in range(6): S.bell(T['s2'] + 8 + k * 10, [84, 88, 91, 89, 93, 96][k], 0.018)  # blossom
S.strings([N(62), N(66), N(69)], at(T['s3']), at(T['close']), 0.016, 2.0, 1.5)     # summer light
for k in range(9): S.noise(at(20 + k * 30), 0.25, 0.01, 0.2, 2)                     # pages turning
S.noise(at(T['close']), 0.12, 0.04, 0.06); S.felt(N(50), at(T['close']), 0.05, 4.0)  # the book closes
for i, m in enumerate([74, 78, 81, 78, 83, 81, 86]): S.felt(N(m), at(T['shadow'] + 12) + i * 0.32, 0.045, 2.6)   # the shadow dances
S.felt(N(81), at(T['see'] - 4), 0.06, 4.0); S.felt(N(86), at(T['see'] + 6), 0.05, 4.0)  # payoff word
S.arp(T['cheer'] + 6, [74, 78, 81, 86], 0.14, 0.035, 3.0)
S.wind(WIPE - 6, 0.05)
S.end_card(CARD, root=62)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "r1027.wav"))
print("ok")
