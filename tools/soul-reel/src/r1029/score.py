"""29 Oct score (soothing café): a warm felt-piano bed in E-flat with soft café murmur → quiet steps, a little chair
knock, each sticky note a small dull tap → the spill: a soft clink and drip → the tear: a low note → the friend peels the
notes: each one a light bell as it becomes a butterfly → the fresh cup slides over, a warm chord → cups clink → end card."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at, footfalls

END, WIPE, CARD = 600, 500, 518
T = dict(bump=34, sit=70, reach=104, spill=122, tear=170, help=216, peel=264, slide=330, look=344, hold=360, clink=404)
S = Score(END / 30, seed=15)
S.bed([[51, 55, 58], [48, 51, 55], [44, 48, 51], [46, 50, 53]], 0.1, END / 30 - 1.0, bar=3.3, amp=0.026)
S.noise(0, END / 30, 0.006, 0.006, 0.4)                                            # soft café murmur
for fr in footfalls([(0, T['sit'] - 4, 220, 600, None)], END):
    if fr < T['sit']: S.soft_step(fr, 0.025)
S.noise(at(T['bump']), 0.08, 0.04, 0.12); S.felt(N(58), at(T['bump']), 0.03, 1.5)  # chair knock
for fr in [T['bump'] + 2, T['spill'] + 4, T['tear'] + 6, T['help'] + 4]: S.noise(at(fr), 0.04, 0.02, 0.3, 2); S.felt(N(55), at(fr), 0.02, 1.0)   # notes stick
S.bell(T['spill'], 79, 0.03); S.noise(at(T['spill'] + 6), 0.4, 0.012, 0.1, 1)     # spill
S.felt(N(46), at(T['tear'] + 8), 0.05, 5.0)                                         # the tear
for i in range(4): S.bell(T['peel'] + i * 16 + 8, [84, 88, 91, 96][i], 0.022)      # notes become butterflies
S.noise(at(T['slide']), 0.4, 0.01, 0.05, 1); S.arp(T['slide'] + 10, [63, 67, 70, 75], 0.12, 0.03, 3.0)   # the fresh cup
S.felt(N(75), at(T['hold'] + 4), 0.06, 4.0); S.felt(N(82), at(T['hold'] + 14), 0.05, 4.0)   # payoff word
S.bell(T['clink'] + 16, 96, 0.04); S.bell(T['clink'] + 18, 100, 0.03)              # clink
S.wind(WIPE - 6, 0.05)
S.end_card(CARD, root=63)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "r1029.wav"))
print("ok")
