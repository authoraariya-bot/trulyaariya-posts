"""25 Oct score: near-silence → soft humming notes from the chest → a louder, slightly off-key sung line,
a low note for the tear → bouncy skip steps, bird chirps → payoff chime → resolving chord on the end card."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at, footfalls

END, WIPE, CARD = 570, 470, 488
T = dict(lift=60, hum=78, stand=120, loud=160, offkey=190, tear=228, laugh=268, walk=300, birds=330, open=404)
S = Score(END / 30)
S.pad([N(45), N(52)], 0, 5.6, 0.03, 1.5)                                   # alone, near silence
for s, m in [(0.2, 71), (1.7, 66), (3.1, 68)]: S.piano(N(m), s, 0.08, 2.8)
hum = [67, 69, 71, 69, 74, 71]
for i in range(6): S.piano(N(hum[i]), at(T['hum'] + i * 14), 0.06, 1.8)    # humming: the first notes rise
S.noise(at(T['stand']), 0.5, 0.03, 0.05)                                    # stands up
S.pad([N(50), N(57), N(62), N(66)], at(T['loud']), END / 30, 0.024, 3)     # warmth returns
sing = [74, 76, 78, 81, 79, 78, 76, 74, 76, 78, 83, 81]
for i in range(12):                                                          # singing out loud, a bit off-key in the middle
    fr = T['loud'] + i * 8
    off = 38 if T['offkey'] <= fr < T['tear'] else 0
    S.piano(N(sing[i]), at(fr), 0.09, 1.4, cents=off * (1 if i % 2 else -1))
S.piano(N(55), at(T['tear'] + 8), 0.07, 3.0)                                 # the tear
S.piano(N(62), at(T['tear'] + 8), 0.04, 3.0)
for i, m in enumerate([79, 83, 86]): S.piano(N(m), at(T['laugh'] + i * 6), 0.07, 1.2)   # a little laugh
S.wind(T['laugh'] + 10, 0.08); S.wind(T['birds'] + 10, 0.09)
for k in range(5): S.chirp(at(T['birds'] + 10 + k * 13), 0.025)              # notes become birds
mel = [74, 78, 81, 86, 83, 88]
for i, fr in enumerate(footfalls([(T['walk'], T['open'], 520, 900, (T['walk'] + 22, T['open'] - 6))], END)):
    if T['walk'] <= fr <= T['open']: S.step(fr, mel[i % len(mel)], 0.10)
S.piano(N(81), at(T['birds'] + 28), 0.10, 2.4); S.piano(N(86), at(T['birds'] + 34), 0.08, 2.4)   # payoff word
S.chime(T['open'] + 6, 0.08)
S.wind(WIPE - 6, 0.10)
S.end_card(CARD)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "r1025.wav"))
print("ok")
