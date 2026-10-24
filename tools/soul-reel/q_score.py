"""Score helpers for the Quote reels: soothing felt-piano beds (healing) and soft lo-fi beats (savage)."""
import numpy as np
from soul_score import Score, N, at, sr, _lp

class QScore(Score):
    def kick(self, s, amp=0.5):
        i = int(s * sr); L = min(self.n - i, int(0.35 * sr))
        if L <= 0: return
        tt = np.arange(L) / sr; f = 48 + 90 * np.exp(-tt * 28)
        self.out[i:i + L] += amp * np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-tt * 9)
    def snap(self, s, amp=0.12):
        i = int(s * sr); L = min(self.n - i, int(0.18 * sr))
        if L <= 0: return
        tt = np.arange(L) / sr; x = self.rng.normal(0, 1, L)
        x = x - _lp(x, 0.2)  # high-passed noise
        self.out[i:i + L] += amp * x * np.exp(-tt * 26)
    def hat(self, s, amp=0.03):
        i = int(s * sr); L = min(self.n - i, int(0.05 * sr))
        if L <= 0: return
        x = self.rng.normal(0, 1, L); x = x - _lp(x, 0.5); tt = np.arange(L) / sr
        self.out[i:i + L] += amp * x * np.exp(-tt * 90)
    def bass(self, m, s, dur, amp=0.12):
        i = int(s * sr); L = min(self.n - i, int(dur * sr))
        if L <= 0: return
        tt = np.arange(L) / sr; env = np.minimum(1, tt * 60) * np.exp(-tt * 1.2) * np.clip((dur - tt) / 0.05, 0, 1)
        self.out[i:i + L] += amp * env * (np.sin(2 * np.pi * N(m) * tt) + 0.25 * np.sin(4 * np.pi * N(m) * tt))
    def sweep(self, s, dur, f0, f1, amp=0.05):
        """a pitch swoop (down = squint/shrink, up = riser)"""
        i = int(s * sr); L = min(self.n - i, int(dur * sr))
        if L <= 0: return
        tt = np.arange(L) / sr; f = f0 * (f1 / f0) ** (tt / dur)
        self.out[i:i + L] += amp * np.sin(2 * np.pi * np.cumsum(f) / sr) * np.sin(np.pi * tt / dur)
    def riser(self, s, dur, amp=0.05):
        i = int(s * sr); L = min(self.n - i, int(dur * sr))
        if L <= 0: return
        tt = np.arange(L) / L; x = self.rng.normal(0, 1, L); x = _lp(x, 0.05 + 0.4 * tt.mean())
        self.out[i:i + L] += amp * x * tt ** 2
    def beat(self, start, end, bpm=92, amp=1.0, swing=0.08):
        """soft lo-fi groove: kick on 1 & the 'and' of 2, snap on 2 & 4, swung hats"""
        b = 60 / bpm; s = start; k = 0
        while s < end - 0.05:
            pos = k % 4
            if pos == 0: self.kick(s, 0.42 * amp)
            if pos == 1: self.snap(s, 0.10 * amp)
            if pos == 2: self.kick(s + b * 0.5, 0.30 * amp)
            if pos == 3: self.snap(s, 0.10 * amp)
            self.hat(s, 0.025 * amp); self.hat(s + b * (0.5 + swing), 0.018 * amp)
            s += b; k += 1
