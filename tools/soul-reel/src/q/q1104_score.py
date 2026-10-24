# 4 Nov score: a night lake: crickets, a dreamy lo-fi loop; the slider drag pitches the music down and muffles it;
# the snap is a bright riser + drop; aurora shimmer bells; a confident groove to the end card.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 420, 330, 348
SLIDER, D0, D1, SNAP, AUR, KEY = 60, 96, 160, 172, 182, 222
S = QScore(END / 30, seed=1104)
for k in range(int(at(END) / 0.35)): S.sweep(k * 0.35, 0.05, 4200, 4400, 0.006)   # crickets
chords = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 64]]
s = 0.05; k = 0
while s < at(SNAP):
    drop = max(0, min(1, (s - at(D0)) / (at(D1) - at(D0))))
    for i, m in enumerate(chords[k % 4]): S.felt(N(m) * (1 - 0.12 * drop), s + i * 0.03, 0.03 * (1 - 0.5 * drop), 3)
    s += 2.2; k += 1
S.beat(at(4), at(D0), 88, 0.5)
S.noise(at(SLIDER), 0.15, 0.03, 0.4, 2)
S.sweep(at(D0), at(D1) - at(D0), 600, 180, 0.03)
S.riser(at(D1), at(SNAP) - at(D1), 0.07); S.kick(at(SNAP), 0.6); S.chime(SNAP + 1, 0.06)
for i in range(8): S.bell(AUR + i * 7, [81, 84, 88, 91][i % 4], 0.018)
s = at(SNAP); k = 0
while s < at(WIPE):
    for i, m in enumerate(chords[k % 4]): S.felt(N(m + 12 * 0), s + i * 0.025, 0.034, 3)
    S.bass(chords[k % 4][0] - 24, s, 2.0, 0.09); s += 2.1; k += 1
S.beat(at(SNAP), at(WIPE), 92, 0.9)
for i, m in enumerate([76, 79, 83, 88]): S.bell(KEY + 6 + i * 4, m, 0.026)
S.end_card(CARD, root=57)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1104.wav")); print("ok")
