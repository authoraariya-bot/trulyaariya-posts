"""Shared score builder for Soul reels — the master's instruments (make_score.py), driven by each reel's beats.
Usage from a reel's score.py:  from soul_score import *;  S = Score(seconds); ...; S.write('public/rXXXX.wav')"""
import numpy as np, wave, math

fps = 30; sr = 44100
N = lambda m: 440 * 2 ** ((m - 69) / 12)
at = lambda fr: fr / fps

def _lp(x, a):
    # one-pole low-pass (vectorised via scipy if present)
    try:
        from scipy.signal import lfilter
        return lfilter([a], [1, -(1 - a)], x)
    except Exception:
        y = np.zeros_like(x); acc = 0
        for i in range(len(x)): acc += a * (x[i] - acc); y[i] = acc
        return y

class Score:
    def __init__(self, seconds, seed=3):
        self.T = seconds; self.n = int(sr * seconds); self.t = np.arange(self.n) / sr
        self.out = np.zeros(self.n); self.rng = np.random.default_rng(seed)
    def piano(self, fq, s, amp, dec=2.2, cents=0):
        fq = fq * 2 ** (cents / 1200)
        i = int(s * sr); L = min(self.n - i, int(sr * 5))
        if L <= 0: return
        tt = np.arange(L) / sr; env = (1 - np.exp(-tt * 110)) * np.exp(-tt / dec)
        v = sum(np.sin(2 * np.pi * fq * h * np.sqrt(1 + 0.0004 * h * h) * tt) * (0.55 ** (h - 1)) for h in range(1, 6))
        self.out[i:i + L] += amp * env * v
    def noise(self, s, dur, amp, a=0.08, shape=1):
        i = int(s * sr); L = min(int(dur * sr), self.n - i)
        if L <= 0: return
        x = _lp(self.rng.normal(0, 1, L), a); tt = np.arange(L) / L
        self.out[i:i + L] += amp * x * np.sin(np.pi * tt) ** shape
    def pad(self, fs, a, b, amp, att=2.5):
        t = self.t; env = np.clip((t - a) / att, 0, 1) * np.clip((b - t) / 2, 0, 1)
        for fq in fs: self.out[:] += amp * env * (np.sin(2 * np.pi * fq * t) + 0.35 * np.sin(2 * np.pi * 2 * fq * t + 1)) * (1 + 0.08 * np.sin(2 * np.pi * 0.2 * t))
    def chirp(self, s, amp=0.03):
        # a tiny bird call: two quick rising blips
        for k in range(2):
            i = int((s + k * 0.09) * sr); L = min(int(0.07 * sr), self.n - i)
            if L <= 0: continue
            tt = np.arange(L) / sr; f0 = 2600 + 900 * tt / 0.07
            self.out[i:i + L] += amp * np.sin(2 * np.pi * np.cumsum(f0) / sr) * np.sin(np.pi * tt / 0.07)
    def wind(self, fr, amp=0.10): self.noise(at(fr), 2.2, amp, 0.012, 1.5)
    def step(self, fr, m, amp=0.10): self.piano(N(m), at(fr), amp, 1.6); self.piano(N(m - 12), at(fr), amp * 0.4, 1.6); self.noise(at(fr), 0.08, 0.03, 0.2, 2)
    def arp(self, fr, ms, gap=0.09, amp=0.07, dec=2.2):
        for i, m in enumerate(ms): self.piano(N(m), at(fr) + i * gap, amp, dec)
    def chime(self, fr, amp=0.08): self.arp(fr, [86, 90, 93, 98], 0.09, amp, 2.4)
    def end_card(self, card, root=62):
        # resolving chord as the end-card thread ties, then the handle
        self.arp(card + 8, [root + 12, root + 16, root + 19, root + 24], 0.18, 0.07, 2.6)
        for m in [root, root + 7, root + 12, root + 16]: self.piano(N(m), at(card + 34), 0.06, 3.5)
    def write(self, path):
        sr_ = sr; n = self.n; rng = self.rng; out = self.out; t = self.t
        ir = np.exp(-np.arange(int(sr_ * 2.2)) / (sr_ * 0.6)) * rng.normal(0, 1, int(sr_ * 2.2)) * 0.012
        y = out + np.convolve(out, ir)[:n]; y *= np.clip((self.T - t) / 0.6, 0, 1); y /= np.abs(y).max() / 0.7
        st = np.stack([y, np.roll(y, 240)], 1)
        with wave.open(path, "wb") as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr_); w.writeframes((st * 32767).astype(np.int16).tobytes())

def footfalls(walks, end):
    """Mirror of kit/choreo.ts makeStory: frames where a foot lands (half gait cycles). walks: [(from,to,x0,x1,(skipA,skipB) or None)]"""
    clamp = lambda x: min(1, max(0, x)); sm = lambda x: (lambda y: y * y * y * (y * (y * 6 - 15) + 10))(clamp(x))
    seg = lambda f, a, b: clamp((f - a) / (b - a))
    def skip(f):
        for (a, b, x0, x1, sk) in walks:
            if sk and a <= f <= b: return sm(seg(f, sk[0], sk[0] + 34)) * (1 - sm(seg(f, sk[1] - 34, sk[1])))
        return 0
    ph = 0; out = []; nxt = 1
    for f in range(end + 40):
        w = next((w for w in walks if w[0] <= f < w[1]), None)
        if w:
            a, b, x0, x1, sk = w
            sp = lambda g: sm(seg(g, a, a + 30)) * (1 - sm(seg(g, b - 34, b))) * (1 + 1.55 * skip(g))
            tot = sum(sp(g) for g in range(a, b)); dx = sp(f) / tot * (x1 - x0)
            ph += abs(dx) / (248 + (330 - 248) * skip(f)) * 2 * math.pi
        if ph >= nxt * math.pi - 0.6: out.append(f); nxt += 1
    return out
