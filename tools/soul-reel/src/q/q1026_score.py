# 26 Oct score (minimal): soft felt piano in F, the crab's tiny ticking steps, a low "meh" boop,
# then the shell opens: a warm chord, a shimmer and bells as the pearl glows.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 360, 270, 288
CIN, CSTOP, MEH, CTURN, COUT, OPEN0, GLOW = 12, 70, 100, 136, 196, 186, 206
S = QScore(END / 30, seed=2610)
for k in range(int(at(END) / 1.6)): S.noise(k * 1.6, 2.0, 0.008, 0.015, 1.5)   # faint sea
for k, m in enumerate([65, 69, 72, 69, 67, 70, 74, 70]): S.felt(N(m), at(4 + k * 22), 0.03, 2.8)
for fr in list(range(CIN, CSTOP, 7)) + list(range(CTURN, COUT, 7)): S.hat(at(fr), 0.012)
S.felt(N(48), at(MEH), 0.05, 0.8); S.felt(N(46), at(MEH + 6), 0.04, 0.9)
S.sweep(at(OPEN0), 0.5, 300, 600, 0.02)
S.bed([[65, 69, 72, 77], [62, 65, 69, 74], [58, 62, 65, 70], [60, 64, 67, 72]], at(OPEN0), at(WIPE) + 0.6, bar=2.2, amp=0.03)
S.chime(GLOW, 0.05)
for i, m in enumerate([81, 84, 89]): S.bell(GLOW + 10 + i * 10, m, 0.022)
S.end_card(CARD, root=65)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1026.wav")); print("ok")
