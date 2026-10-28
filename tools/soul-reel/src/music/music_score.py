# Reel 7: the rant and the headphones. Sound matched to the picture.
import sys, os, math
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at, sr, _lp
END = 640
T = dict(in0=24, in1=70, rant0=76, rant1=330, sink0=110, look0=246, grab0=262, lift0=274, click=300, turn0=312, walk0=326, walk1=500, groove=500, fade0=330, fade1=420, wipe=548, card=566)
AX0, AX1 = 380, -640
def soulX(f):
    a, b, e = T['walk0'], T['walk1'], 16
    if f <= a: return AX0
    v = (AX1 - AX0) / (b - a - e); g = min(f, b)
    if g < a + e: p = v * (g - a) ** 2 / (2 * e)
    elif g < b - e: p = v * e / 2 + v * (g - a - e)
    else: p = v * e / 2 + v * (b - 2 * e - a) + v * e / 2 - v * (b - g) ** 2 / (2 * e)
    return AX0 + p
S = Score(END / 30, seed=707)
rng = np.random.default_rng(7)
# ---- the rant: garbled, mumbly "blah blah" (formant-shaped buzz, soft), muffled once the headphones go on
rant = np.zeros(S.n)
VOW = [(750, 1200), (500, 900), (450, 1800), (650, 1500), (400, 1000)]
t = T['rant0'] / 30 + 0.05
while t < T['rant1'] / 30 + 1.4:
    dur = 0.08 + 0.1 * rng.random(); f0 = 210 + 70 * rng.random(); F1, F2 = VOW[rng.integers(len(VOW))]
    i = int(t * sr); L = min(int(dur * sr), S.n - i)
    if L <= 0: break
    tt = np.arange(L) / sr; glide = f0 * (1 + (0.25 * rng.random() - 0.08) * tt / dur)
    ph = 2 * np.pi * np.cumsum(glide) / sr
    v = sum((np.exp(-((h * f0 - F1) / 260) ** 2) + 0.6 * np.exp(-((h * f0 - F2) / 380) ** 2) + 0.15 / h) * np.sin(h * ph) for h in range(1, 14))
    env = np.sin(np.pi * tt / dur) ** 0.7
    rant[i:i + L] += 0.03 * v * env
    t += dur + (0.02 + 0.05 * rng.random()) + (0.25 if rng.random() < 0.12 else 0)
m0 = int(at(T['click']) * sr); m1 = int(at(T['click'] + 10) * sr)
mute = np.ones(S.n); mute[m0:m1] = np.linspace(1, 0, m1 - m0); mute[m1:] = 0
fade = np.clip(1 - (np.arange(S.n) / sr - at(T['fade0'])) / ((T['fade1'] - T['fade0']) / 30), 0.0, 1.0)
muff = _lp(rant, 0.03) * 2.2
S.out += _lp(rant, 0.35) * mute + muff * (1 - mute) * 0.35 * fade
# ---- stomps (soft thuds) and its walk in
for k in range(14):
    fr = T['rant0'] + 7.5 * math.pi * (0.5 + 2 * k)
    if fr < T['rant1']: 
        i = int(at(fr) * sr); L = int(0.18 * sr); tt = np.arange(L) / sr
        S.out[i:i + L] += 0.06 * np.sin(2 * np.pi * (70 - 30 * tt / 0.18) * tt) * np.exp(-tt * 22) * (1 if fr < T['click'] else 0.25)
for fr in range(T['in0'] + 8, T['in1'], 12): S.soft_step(fr, 0.03)
# ---- the tense, low bed before the music
S.bed([[57, 60, 64], [55, 58, 62]], 0.2, at(T['click']) + 0.3, bar=3.2, amp=0.018)
S.wind(10, 0.025)
for k in range(3): S.chirp(0.5 + k * 1.4, 0.006)
S.felt(N(62), at(T['look0']), 0.03, 3)
S.noise(at(T['grab0'] + 4), 0.15, 0.015, 0.3, 2)                     # fingers find the headphones
S.noise(at(T['lift0']), 0.6, 0.012, 0.1, 1.5)                         # lifting them up
S.bell(T['click'], 98, 0.02); S.noise(at(T['click']), 0.05, 0.03, 0.5, 2)   # click
# ---- its music: a sweet lo-fi groove, beat every 0.64 s
beat = 0.64; s0 = at(T['click']) + 0.15
prog = [[60, 64, 67, 71], [57, 60, 64, 67], [65, 69, 72, 76], [67, 71, 74, 77]]
mel = [76, 79, 81, 79, 76, 74, 72, 74, 76, 79, 84, 83, 81, 79, 76, 79, 77, 76, 74, 72, 74, 76, 72, 0]
nb = int((at(T['wipe']) + 0.6 - s0) / beat)
for b in range(nb):
    tb = s0 + b * beat; ramp = min(1, b / 3)
    if b % 4 == 0:
        for m in prog[(b // 4) % 4]: S.felt(N(m - 12), tb, 0.04 * ramp, 3)
    i = int(tb * sr); L = int(0.25 * sr); tt = np.arange(L) / sr                 # soft kick
    if i + L < S.n: S.out[i:i + L] += 0.11 * ramp * np.sin(2 * np.pi * (90 - 40 * tt / 0.25) * tt) * np.exp(-tt * 16)
    S.noise(tb + beat / 2, 0.05, 0.014 * ramp, 0.6, 2)                          # brushy hat
    if b % 2 == 1: S.noise(tb, 0.12, 0.028 * ramp, 0.2, 1.5)                    # soft snare brush
    m = mel[b % len(mel)]
    if m: S.felt(N(m), tb + 0.02, 0.075 * ramp, 1.6)
    if b % 2 == 0 and mel[(b + 1) % len(mel)]: S.felt(N(mel[(b + 1) % len(mel)] + 12), tb + beat / 2, 0.025 * ramp, 1.2)
# its steps (soft, bouncy)
k = 1
for fr in range(T['walk0'], T['walk1'] + 1):
    if abs(soulX(fr) - AX0) / 248 * 2 * math.pi >= k * math.pi - 0.6: S.soft_step(fr, 0.05); k += 1
for k in range(8): S.chirp(at(T['walk0']) + 0.4 + k * 0.8, 0.007)
S.noise(at(T['wipe'] - 6), 1.4, 0.05, 0.05, 1.3)
S.end_card(T['card'], root=60)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "music.wav")); print("ok")
