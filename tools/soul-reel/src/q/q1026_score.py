# 26 Oct score: lo-fi groove in F; each squint a downward "zoop"; a pause on "nope."; riser → drop as it erupts.
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from q_score import QScore, N, at
END, WIPE, CARD = 420, 330, 348
SQ, STOP, ERUPT, KEY = [44, 84, 120], 148, 166, 250
S = QScore(END / 30, seed=26)
bpm = 92; b = 60 / bpm
chords = [[65, 69, 72, 76], [64, 67, 71, 74], [62, 65, 69, 72], [60, 64, 67, 71]]   # Fmaj7 Em7 Dm7 Cmaj7
def keys(t0, t1, amp=0.03):
    s = t0; k = 0
    while s < t1 - 0.2:
        ch = chords[k % 4]
        for i, m in enumerate(ch): S.felt(N(m), s + i * 0.025, amp, 3.0)
        S.bass(ch[0] - 24, s, b * 4 - 0.05, 0.10); s += b * 4; k += 1
keys(0.05, at(STOP)); S.beat(0.05, at(STOP), bpm, 0.8)
for a in SQ: S.sweep(at(a + 3), 0.4, 900, 380, 0.05); S.noise(at(a + 4), 0.12, 0.05, 0.4, 2)   # pen scratch on the tag
S.felt(N(77), at(STOP + 2), 0.05, 1.2); S.felt(N(72), at(STOP + 9), 0.05, 1.6)   # "nope."
S.riser(at(STOP + 4), at(ERUPT) - at(STOP + 4), 0.06)
S.kick(at(ERUPT), 0.6); S.noise(at(ERUPT), 0.9, 0.05, 0.04, 1)
keys(at(ERUPT), at(WIPE) + 0.4, 0.034); S.beat(at(ERUPT), at(WIPE), bpm, 1.0)
for i, m in enumerate([77, 81, 84, 89]): S.bell(KEY + 4 + i * 3, m, 0.03)
S.wind(WIPE - 6, 0.04)
S.end_card(CARD, root=65)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "q1026.wav")); print("ok")
