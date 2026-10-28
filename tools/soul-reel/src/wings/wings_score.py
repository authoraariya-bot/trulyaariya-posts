# Six wings: sound matched to the picture.
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at
END = 640
TK = [(54, 104, 120, 136, 190), (168, 204, 214, 226, 266), (236, 266, 274, 284, 320), (292, 318, 324, 332, 366)]
T = dict(t5in0=360, t5in1=404, ask0=404, stop0=418, turn0=456, walk0=468, walk1=548, open0=474, wipe=560, card=578)
sm = lambda x: (lambda y: y*y*y*(y*(y*6-15)+10))(min(1, max(0, x)))
def steps(a, b, x0, x1):
    out, k = [], 1
    for f in range(a, b + 1):
        ph = abs((x0 + (x1 - x0) * sm((f - a) / (b - a))) - x0) / 248 * 2 * math.pi
        if ph >= k * math.pi - 0.6: out.append(f); k += 1
    return out
S = Score(END / 30, seed=303)
# a warm opening, slowly emptying as the wings are taken; warm again when it walks on
S.bed([[64, 67, 71, 76], [60, 64, 67, 72]], 0.2, at(TK[0][2]) + 1.0, bar=2.8, amp=0.03)
S.bed([[57, 60, 64], [55, 59, 62], [53, 57, 60]], at(TK[0][2]) + 0.6, at(T['turn0']), bar=3.0, amp=0.02)
S.bed([[60, 64, 67, 72], [65, 69, 72, 76], [57, 60, 64, 69], [62, 65, 69, 74]], at(T['turn0']) - 0.3, at(T['wipe']) + 0.8, bar=2.4, amp=0.034)
for k in range(6): S.noise(at(4 + k * 70), 1.8, 0.025, 0.02, 1.4)   # autumn breeze, leaves
for k in range(4): S.noise(at(10 + k * 9), 0.18, 0.02, 0.4, 2)        # wings stretching: soft flutters
S.chime(14, 0.04)
for i, (a, b, g, o0, o1) in enumerate(TK):
    x0, stop = 1260, 470 + 214
    for fr in steps(a, b, x0, stop): S.soft_step(fr, 0.042)
    S.noise(at(g), 0.35, 0.05, 0.25, 2)                                  # the feather "whff" as a wing is pulled
    S.felt(N([67, 65, 64, 62][i]), at(g + 2), 0.04, 3)                   # a little falling note each time
    for fr in steps(o0, o1, stop, 1260): S.soft_step(fr, 0.03)
for fr in steps(T['t5in0'], T['t5in1'], 1260, 470 + 250): S.soft_step(fr, 0.042)
S.piano(N(69), at(T['stop0']), 0.07, 3.0); S.piano(N(57), at(T['stop0']), 0.04, 3.0)   # "no": one firm, soft note
for fr in steps(T['walk0'], T['walk1'], 470, 150): S.soft_step(fr, 0.045); S.noise(at(fr) + 0.02, 0.12, 0.014, 0.3, 2)  # footsteps on leaves
S.strings([N(60), N(67), N(72)], at(T['open0']), at(T['wipe']), 0.03, 1.4, 1.5)
S.arp(T['open0'] + 4, [72, 76, 79, 84], 0.22, 0.05, 2.6)
for i in range(4): S.bell(424 + i * 7, [86, 90, 93, 98][i], 0.012)
S.noise(at(T['wipe'] - 6), 1.4, 0.05, 0.05, 1.3)
S.end_card(T['card'], root=60)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "wings.wav")); print("ok")
