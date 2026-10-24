"""28 Oct score (soothing night): a hushed felt-piano bed in A minor with soft night air → tiny keyboard taps →
nights passing: a gentle music-box motif repeating, a low uneasy swell for the doubt that a breath releases →
dawn: strings rise, the bed turns to C major → ribbon tie, soft steps, the book slides into the box → payoff → end card."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at, footfalls

END, WIPE, CARD = 600, 500, 518
T = dict(nights=110, doubt=140, breath=200, n3=250, dawn=290, stand=318, tie=330, walk=348, place=410, look=432)
S = Score(END / 30, seed=14)
S.bed([[45, 48, 52], [41, 45, 48], [43, 47, 50], [40, 43, 47]], 0.1, at(T['dawn']), bar=3.4, amp=0.024)
S.bed([[48, 52, 55], [43, 47, 50], [45, 48, 52], [41, 45, 48]], at(T['dawn']), END / 30 - 1.0, bar=3.0, amp=0.028)
S.noise(0, at(T['dawn']), 0.006, 0.01, 0.5)                                       # night air
for k in range(26): S.noise(at(4 + k * 9), 0.02, 0.008, 0.6, 2)                    # taps on the phone
for k in range(9): S.bell(T['nights'] + k * 16, [81, 84, 88, 84, 81, 84, 88, 91, 88][k], 0.016)   # nights passing
S.strings([N(40), N(47)], at(T['doubt']), at(T['breath'] + 10), 0.018, 1.2, 0.6)  # the doubt
S.noise(at(T['breath']), 1.0, 0.03, 0.02, 1.5)                                     # a long breath
S.strings([N(60), N(64), N(67)], at(T['dawn']), END / 30 - 1.5, 0.016, 3.0, 2.0)   # dawn
S.noise(at(T['tie']), 0.3, 0.015, 0.2, 2)
for fr in footfalls([(T['walk'], T['place'] - 18, 420, 760, None)], END):
    if T['walk'] <= fr <= T['place']: S.soft_step(fr, 0.025)
S.noise(at(T['place']), 0.1, 0.03, 0.08)
S.felt(N(76), at(T['tie'] + 6), 0.06, 4.0); S.felt(N(84), at(T['tie'] + 14), 0.05, 4.0)   # payoff word
S.arp(T['look'] + 4, [72, 76, 79, 84], 0.15, 0.035, 3.0)
S.wind(WIPE - 6, 0.05)
S.end_card(CARD, root=60)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "r1028.wav"))
print("ok")
