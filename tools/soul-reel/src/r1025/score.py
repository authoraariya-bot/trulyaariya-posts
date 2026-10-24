"""25 Oct score (soothing): soft rain and a slow felt-piano bed in F → cloth folding, quiet steps → the recorder's
click and gentle tape hiss → 'the song': a tender felt-piano melody, a little detuned in the off-key moment →
a low note for the tear → music-box bells as each fairy light comes on → soft payoff chime → end card."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at, footfalls

END, WIPE, CARD = 630, 530, 548
T = dict(stand=96, walk=110, arrive=200, reach=204, play=222, brush=250, sing=272, offkey=300, tear=330, laugh=360, lights=390, spin=404, cheer=446)
S = Score(END / 30, seed=11)
S.noise(0, at(T['lights'] + 30), 0.018, 0.02, 0.6)                              # soft rain on the window
S.bed([[53, 57, 60], [50, 53, 57], [46, 50, 53], [48, 52, 55]], 0.2, END / 30 - 1.0, bar=3.4, amp=0.028)
for k in range(5): S.noise(at(8 + k * 18), 0.18, 0.012, 0.15, 2)                  # folding cloth
for fr in footfalls([(T['walk'], T['arrive'], 330, 1040, None)], END):
    if T['walk'] <= fr <= T['arrive']: S.soft_step(fr, 0.03)
S.noise(at(T['play']), 0.05, 0.05, 0.4, 1); S.noise(at(T['play'] + 2), at(T['lights']) - at(T['play']), 0.006, 0.3, 0.4)  # click + tape hiss
song = [72, 74, 76, 77, 76, 74, 72, 69, 72, 74, 77, 76, 74, 72]
for i, m in enumerate(song):                                                       # the song from the tape
    fr = T['play'] + 10 + i * 13
    off = 34 if T['offkey'] <= fr < T['tear'] else 0
    S.felt(N(m), at(fr), 0.06 if fr < T['sing'] else 0.075, 3.0, cents=off * (1 if i % 2 else -1))
S.felt(N(53), at(T['tear'] + 8), 0.06, 5.0)                                         # the tear
for i, m in enumerate([77, 81, 84]): S.felt(N(m), at(T['laugh']) + i * 0.12, 0.04, 2.0)   # a soft laugh
for k in range(10): S.bell(T['lights'] + k * 4, [84, 86, 88, 89, 91, 93, 96, 98, 100, 101][k], 0.025)   # fairy lights
S.felt(N(81), at(T['spin'] + 14), 0.06, 4.0); S.felt(N(84), at(T['spin'] + 22), 0.05, 4.0)  # payoff word
S.arp(T['cheer'] + 4, [84, 88, 91, 96], 0.14, 0.035, 3.0)
S.wind(WIPE - 6, 0.05)
S.end_card(CARD, root=65)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "r1025.wav"))
print("ok")
