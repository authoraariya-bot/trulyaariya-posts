# Reel 5: the road. Sound matched to the picture.
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at
END = 645
T = dict(coupleIn=30, coupleOut=200, promoIn=112, promoOut=282, race=214, droop0=236, in0=268, in1=300, out0=304, out1=336, road=318,
         look0=340, point0=352, point1=372, walk0=440, walk1=530, wipe=548, card=566)
sm = lambda x: (lambda y: y*y*y*(y*(y*6-15)+10))(min(1, max(0, x)))
def lin_steps(a, b, x0, x1, stride, off=0.0):
    out, k = [], 1
    for f in range(a, b + 1):
        ph = abs((x0 + (x1 - x0) * (f - a) / (b - a)) - x0) / stride * 2 * math.pi + off
        if ph >= k * math.pi - 0.6 + off: out.append(f); k += 1
    return out
def sm_steps(a, b, x0, x1):
    out, k = [], 1
    for f in range(a, b + 1):
        ph = abs((x0 + (x1 - x0) * sm((f - a) / (b - a))) - x0) / 248 * 2 * math.pi
        if ph >= k * math.pi - 0.6: out.append(f); k += 1
    return out
S = Score(END / 30, seed=505)
S.bed([[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]], 0.2, at(T['in0']) + 0.6, bar=3.0, amp=0.024)
S.bed([[60, 64, 67, 72], [65, 69, 72, 76], [57, 60, 64, 69], [67, 71, 74, 79]], at(T['in1']), at(T['wipe']) + 0.8, bar=2.4, amp=0.034)
S.wind(10, 0.03)
for k in range(5): S.chirp(0.6 + k * 1.7, 0.006)
# the passers-by: soft, a touch further away
for fr in lin_steps(T['coupleIn'], T['coupleOut'], -160, 1300, 248 * 1.24): S.soft_step(fr, 0.022)
for fr in lin_steps(T['coupleIn'], T['coupleOut'], -280, 1180, 248 * 1.24, 0.5): S.soft_step(fr, 0.018)
for fr in lin_steps(T['promoIn'], T['promoOut'], -120, 1300, 248 * 1.24, 1.2): S.soft_step(fr, 0.022)
for k in range(5): S.bell(T['coupleIn'] + 26 + k * 3, [93, 96, 98, 100, 103][k], 0.012)   # wedding tinkle as their tag appears
S.noise(at(T['promoIn'] + 30), 0.25, 0.02, 0.05, 2); S.bell(T['promoIn'] + 32, 91, 0.016)  # letter rustle + tiny ding
S.felt(N(62), at(T['race']), 0.03, 3); S.felt(N(57), at(T['droop0'] + 6), 0.026, 3.5)        # a little low
S.noise(at(T['in0']), (T['in1'] - T['in0']) / 30, 0.03, 0.4, 1.2)                           # breathe in
S.noise(at(T['out0']), (T['out1'] - T['out0']) / 30 + 0.3, 0.026, 0.05, 1.6)                # and out
S.felt(N(67), at(T['road']), 0.032, 3)
S.felt(N(72), at(T['look0'] + 4), 0.034, 3)
S.chime(T['point1'] - 6, 0.04)
S.strings([N(60), N(67), N(76)], at(T['point0']), at(T['wipe']), 0.03, 1.4, 1.5)
S.arp(T['point1'] + 30, [72, 76, 79, 84], 0.26, 0.04, 2.6)
for fr in sm_steps(T['walk0'], T['walk1'], 330, 560): S.soft_step(fr, 0.04); S.noise(at(fr) + 0.02, 0.1, 0.01, 0.35, 2)
for k in range(6): S.chirp(at(T['point1']) + k * 0.9, 0.007)
S.noise(at(T['wipe'] - 6), 1.4, 0.05, 0.05, 1.3)
S.end_card(T['card'], root=60)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "road.wav")); print("ok")
