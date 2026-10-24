"""26 Oct score (soothing, morning): a felt-piano bed in G with a light breeze → pencil on paper → paper folding
crinkles and a little giggle of notes → a soft whoosh as the plane leaves → airy flight: string pad and music-box bells,
a rising glide for the loop → pages flutter like wings → soft landing, payoff chime → end card."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at

END, WIPE, CARD = 620, 520, 538
T = dict(read=70, fold=112, stand=176, throw=200, cutOut=228, loop=262, book=290, cutIn=330, catch=368, hug=384, cheer=440)
S = Score(END / 30, seed=12)
S.bed([[55, 59, 62], [52, 55, 59], [48, 52, 55], [50, 54, 57]], 0.1, END / 30 - 1.0, bar=3.2, amp=0.026)
S.noise(0, END / 30, 0.008, 0.01, 0.5)                                            # a light breeze through the window
for k in range(8): S.noise(at(4 + k * 8), 0.06, 0.012, 0.5, 2)                    # pencil
for k in range(6): S.noise(at(T['fold'] + 6 + k * 9), 0.12, 0.02, 0.3, 2)         # paper folds
for i, m in enumerate([79, 83, 86]): S.felt(N(m), at(T['fold'] + 40) + i * 0.1, 0.035, 2.0)   # a grin
S.noise(at(T['throw']), 0.7, 0.04, 0.03, 2)                                         # whoosh
S.strings([N(67), N(71), N(74)], at(T['cutOut']), at(T['cutIn'] + 20), 0.02, 1.0, 1.0)
for k in range(8): S.bell(T['cutOut'] + 6 + k * 12, [86, 88, 91, 93, 91, 95, 98, 96][k], 0.022)   # flight
for i in range(12): S.bell(T['loop'] - 10 + i * 3, 84 + i, 0.012)                  # the loop glide
for k in range(6): S.noise(at(T['book'] + k * 7), 0.06, 0.018, 0.4, 2)             # page-wings
S.noise(at(T['catch']), 0.08, 0.03, 0.06); S.felt(N(55), at(T['catch']), 0.05, 4.0)
S.felt(N(83), at(T['catch'] - 2), 0.06, 4.0); S.felt(N(86), at(T['catch'] + 8), 0.05, 4.0)  # payoff word
S.arp(T['hug'] + 10, [79, 83, 86, 91], 0.14, 0.035, 3.0)
S.wind(WIPE - 6, 0.05)
S.end_card(CARD, root=67)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "r1026.wav"))
print("ok")
