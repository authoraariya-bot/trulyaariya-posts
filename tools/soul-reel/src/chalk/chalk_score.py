# Reel 6: the chalkboard. Sound matched to the picture.
import sys, os, math, random
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))
from soul_score import Score, N, at
END = 700
T = dict(sun0=10, sun1=40, flo0=44, flo1=70, smi0=74, smi1=100, s1in0=84, s1in1=136, back0=126, back1=156,
         x1a=144, x1b=158, x2a=160, x2b=174, should0=178, should1=204, s1out0=212, s1out1=262,
         s2in0=178, s2in1=228, ne0=234, ne1=292, s2out0=300, s2out1=350, board=212, breath0=276, breath1=300,
         go0=298, go1=324, grab=330, w1a=340, w1b=362, m1a=362, m1b=378, w2a=380, w2b=402, m2a=402, m2b=418, w3a=420, w3b=442, drop=446,
         s3in0=428, s3in1=468, ask0=468, keep0=482, shake0=486, shake1=512, s3fade0=508, heart0=522, heart1=548, magic0=540, magic1=600,
         admire0=596, admire1=616, wipe=608, card=626)
sm = lambda x: (lambda y: y*y*y*(y*(y*6-15)+10))(min(1, max(0, x)))
def steps(a, b, x0, x1):
    out, k = [], 1
    for f in range(a, b + 1):
        ph = abs((x0 + (x1 - x0) * sm((f - a) / (b - a))) - x0) / 248 * 2 * math.pi
        if ph >= k * math.pi - 0.6: out.append(f); k += 1
    return out
rng = random.Random(6)
S = Score(END / 30, seed=606)
def scratch(a, b, amp=0.012, soft=True):   # chalk on the board: little dry scratches
    f = a
    while f < b:
        S.noise(at(f), 0.05 + 0.04 * rng.random(), amp * (0.7 + 0.5 * rng.random()), 0.4 if soft else 0.6, 2); f += 3 + rng.random() * 3
S.bed([[64, 67, 71], [62, 65, 69], [60, 64, 67], [62, 65, 69]], 0.2, at(T['breath0']) + 0.6, bar=3.0, amp=0.024)
S.bed([[64, 67, 71, 76], [60, 64, 67, 72], [65, 69, 72, 76], [67, 71, 74, 79]], at(T['heart0']), at(T['wipe']) + 0.8, bar=2.4, amp=0.034)
S.wind(10, 0.03)
for k in range(5): S.chirp(0.6 + k * 1.8, 0.006)
# the soul doodles: taps + soft scratches + happy plinks
for a, b, m in [(T['sun0'], T['sun1'], 79), (T['flo0'], T['flo1'], 83), (T['smi0'], T['smi1'], 86)]:
    S.bell(a, 96, 0.012); scratch(a, b, 0.01); S.felt(N(m), at(b - 4), 0.022, 2)
# shadows walk in, scribble (a little harsher, still soft), write
for fr in steps(T['s1in0'], T['s1in1'], 1240, 560): S.soft_step(fr, 0.026)
S.felt(N(60), at(T['x1a']), 0.03, 3)
scratch(T['x1a'], T['x1b'], 0.02, False); scratch(T['x2a'], T['x2b'], 0.02, False); scratch(T['should0'], T['should1'], 0.016, False)
for fr in steps(T['back0'], T['back1'], 340, 190): S.soft_step(fr, 0.03)
for fr in steps(T['s1out0'], T['s1out1'], 560, 1260): S.soft_step(fr, 0.022)
for fr in steps(T['s2in0'], T['s2in1'], 1240, 760): S.soft_step(fr, 0.024)
scratch(T['ne0'], T['ne1'], 0.016, False); S.felt(N(57), at(T['ne1']), 0.026, 3.5)
for fr in steps(T['s2out0'], T['s2out1'], 760, 1260): S.soft_step(fr, 0.02)
S.noise(at(T['breath0']), 0.8, 0.026, 0.4, 1.2); S.noise(at(T['breath0'] + 26), 1.0, 0.022, 0.05, 1.6)   # breath in, out
for fr in steps(T['go0'], T['go1'], 190, 345): S.soft_step(fr, 0.035)
S.noise(at(T['grab']), 0.1, 0.02, 0.3, 2)                           # picks up the duster
for a, b in [(T['w1a'], T['w1b']), (T['w2a'], T['w2b']), (T['w3a'], T['w3b'])]:
    for k in range(3): S.noise(at(a + k * (b - a) / 3), 0.32, 0.03, 0.25, 1.4)   # swish, swish, swish
    S.noise(at(b - 4), 0.6, 0.012, 0.1, 1.2)                        # chalk dust settling
for fr in steps(T['m1a'], T['m1b'], 345, 475) + steps(T['m2a'], T['m2b'], 475, 640): S.soft_step(fr, 0.03)
S.noise(at(T['drop']), 0.1, 0.02, 0.3, 2); S.felt(N(72), at(T['drop'] + 4), 0.03, 3)
for fr in steps(T['s3in0'], T['s3in1'], 1240, 860): S.soft_step(fr, 0.024)
S.bell(T['keep0'] + 6, 88, 0.022); S.bell(T['shake0'] + 10, 84, 0.018)     # keeps it close; a gentle "no"
S.noise(at(T['s3fade0']), 1.2, 0.012, 0.1, 1.4)
scratch(T['heart0'], T['heart1'], 0.01)
S.strings([N(64), N(71), N(76)], at(T['heart0']), at(T['wipe']), 0.03, 1.4, 1.5)
S.arp(T['magic0'], [76, 79, 83, 88], 0.26, 0.045, 2.6)
for i in range(8): S.bell(T['magic0'] + 6 + i * 6, [88, 91, 95, 93, 98, 100, 96, 103][i], 0.011)
for fr in steps(T['admire0'], T['admire1'], 640, 540): S.soft_step(fr, 0.03)
for k in range(6): S.chirp(at(T['magic0']) + k * 0.9, 0.007)
S.noise(at(T['wipe'] - 6), 1.4, 0.05, 0.05, 1.3)
S.end_card(T['card'], root=64)
S.write(os.path.join(os.path.dirname(__file__), "..", "..", "public", "chalk.wav")); print("ok")
