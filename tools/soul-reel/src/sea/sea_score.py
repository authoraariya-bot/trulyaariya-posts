# "Be the seashore": sound matched to the picture.
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at
END = 615
T = dict(rush0=112, rush1=150, flinch=132, kneel0=176, stand0=196, stand1=228, breath0=236, breath1=286, calm0=270, calm1=390, touch=336, smile=400, wipe=518, card=536)
S = Score(END / 30, seed=202)
fr = 4.0
while fr < T['calm0'] + 30:
    S.noise(at(fr), 0.9, 0.07, 0.02, 1.2); S.noise(at(fr) + 0.05, 0.4, 0.03, 0.12, 2)
    fr += 22 + (fr * 7 % 9)
S.wind(0, 0.06); S.wind(70, 0.05); S.wind(150, 0.05)
for k in range(5): S.chirp(0.8 + k * 1.3, 0.008)
S.bed([[57, 60, 64], [56, 59, 64]], 0.2, at(T['breath1']), bar=3.0, amp=0.02)
S.bed([[62, 66, 69, 74], [59, 62, 66, 71], [55, 59, 62, 67], [57, 61, 64, 69]], at(T['breath1']) - 0.4, at(T['wipe']) + 0.8, bar=2.6, amp=0.032)
for k in range(8): S.noise(at(10 + k * 12), 0.25, 0.012, 0.35, 2)
S.noise(at(T['rush0']), 1.6, 0.11, 0.015, 1.1); S.noise(at(T['rush0'] + 16), 0.6, 0.05, 0.1, 2)
S.felt(N(50), at(T['flinch']), 0.04, 2)
S.noise(at(T['stand0']), 0.6, 0.016, 0.05, 1.5); S.soft_step(T['stand1'] - 4, 0.04)
S.noise(at(T['breath0']), 1.6, 0.02, 0.025, 1.4); S.piano(N(74), at(T['breath0'] + 20), 0.065, 3.2)
fr = T['calm0'] + 40
while fr < T['wipe']:
    S.noise(at(fr), 2.4, 0.045, 0.012, 1.6); fr += 102
S.noise(at(T['touch'] + 8), 0.5, 0.025, 0.2, 2); S.bell(T['touch'] + 8, 91, 0.012)
for i in range(4): S.bell(318 + i * 7, [86, 90, 93, 98][i], 0.012)
S.arp(418, [74, 78, 81, 86], 0.2, 0.045, 2.6)
for k in range(3): S.chirp(at(T['smile'] + 10 + k * 40), 0.005)
S.noise(at(T['wipe'] - 6), 1.4, 0.05, 0.05, 1.3)
S.end_card(T['card'], root=62)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "sea.wav")); print("ok")
