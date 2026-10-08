"""Original background music for the Truly Aariya reels — every note synthesised here, so no copyright issues.
Each reel gets its own instrument, key, tempo and mood."""
import sys, wave
import numpy as np
from scipy.signal import lfilter, butter

SR = 44100
rng = np.random.default_rng(7)

def hz(n):  # MIDI note -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)

def env_adsr(n, a, d, s, r, sr=SR):
    a, d, r = int(a*sr), int(d*sr), int(r*sr)
    e = np.ones(n) * s
    e[:a] = np.linspace(0, 1, a) if a else e[:a]
    e[a:a+d] = np.linspace(1, s, len(e[a:a+d]))
    if r: e[-r:] *= np.linspace(1, 0, len(e[-r:]))
    return e

def lowpass(x, fc):
    b, a = butter(2, fc/(SR/2)); return lfilter(b, a, x)

def reverb(x, wet=0.3, size=1.0):
    """Small Schroeder reverb: 4 combs + 2 allpasses."""
    out = np.zeros(len(x) + SR*3)
    xx = np.concatenate([x, np.zeros(SR*3)])
    for dl, g in ((0.0297, .80), (0.0371, .78), (0.0411, .76), (0.0437, .74)):
        k = int(dl*size*SR)
        b = np.zeros(k+1); b[0] = 1; a = np.zeros(k+1); a[0] = 1; a[k] = -g
        out += lfilter(b, a, xx)
    for dl, g in ((0.005, .7), (0.0017, .7)):
        k = int(dl*SR); b = np.zeros(k+1); b[0] = -g; b[k] = 1; a = np.zeros(k+1); a[0] = 1; a[k] = -g
        out = lfilter(b, a, out)
    out = lowpass(out, 6000) * 0.12
    return xx*(1-wet) + out*wet

# ---- instruments ----
def music_box(f, dur):
    n = int(dur*SR); t = np.arange(n)/SR
    y = sum(amp*np.sin(2*np.pi*f*m*t)*np.exp(-t*dec) for m, amp, dec in ((1, 1, 3.5), (3.01, .35, 7), (5.4, .12, 11), (8.9, .05, 16)))
    return y * env_adsr(n, .002, 0, 1, .05)

def piano(f, dur, vel=1.0):
    n = int(dur*SR); t = np.arange(n)/SR
    y = sum(amp*np.sin(2*np.pi*f*m*(1+0.0004*m*m)*t)*np.exp(-t*(1.2+m*0.9)) for m, amp in ((1, 1), (2, .5), (3, .25), (4, .12), (5, .06)))
    y = lowpass(y, min(9000, 1500 + 3000*vel))
    return vel * y * env_adsr(n, .004, 0, 1, .12)

def rhodes(f, dur):
    n = int(dur*SR); t = np.arange(n)/SR
    mod = 1.8*np.exp(-t*3) * np.sin(2*np.pi*f*t)
    y = np.sin(2*np.pi*f*t + mod) * np.exp(-t*0.9)
    y *= 1 + 0.08*np.sin(2*np.pi*4.5*t)  # tremolo
    return y * env_adsr(n, .006, 0, 1, .2)

def pluck(f, dur, bright=0.5):
    """Karplus-Strong nylon-guitar pluck."""
    n = int(dur*SR); p = int(SR/f)
    buf = rng.uniform(-1, 1, p); buf = lowpass(buf, 1500 + 5000*bright) if p > 12 else buf
    y = np.zeros(n); buf = list(buf)
    for i in range(n):
        y[i] = buf[i % p]
        buf[i % p] = 0.996 * 0.5*(buf[i % p] + buf[(i+1) % p])
    return y * env_adsr(n, .001, 0, 1, .08)

def pad(freqs, dur, bright=1200):
    n = int(dur*SR); t = np.arange(n)/SR
    y = sum(np.sin(2*np.pi*f*t + 0.3*np.sin(2*np.pi*0.2*t)) + 0.3*np.sin(2*np.pi*2*f*1.003*t) for f in freqs)
    return lowpass(y, bright) * env_adsr(n, min(1.5, dur/3), 0, 1, min(1.5, dur/3))

def soft_kick(dur=0.4):
    n = int(dur*SR); t = np.arange(n)/SR
    return np.sin(2*np.pi*(45 + 60*np.exp(-t*30))*t) * np.exp(-t*9)

def brush(dur=0.18):
    n = int(dur*SR); t = np.arange(n)/SR
    return lowpass(rng.normal(0, 1, n), 7000) * np.exp(-t*25) * 0.15

def crackle(total):
    y = np.zeros(int(total*SR)); idx = rng.integers(0, len(y), int(total*35))
    y[idx] = rng.uniform(-1, 1, len(idx)) * 0.25
    return lowpass(y, 3000) + lowpass(rng.normal(0, 0.004, len(y)), 1200)

def place(buf, sig, at, gain=1.0):
    i = int(at*SR); j = min(len(buf), i+len(sig))
    if i < len(buf): buf[i:j] += sig[:j-i]*gain

def finish(y, total, path, wet=0.35, size=1.0):
    y = reverb(y, wet, size)[:int(total*SR)]
    fade = int(1.5*SR); y[-fade:] *= np.linspace(1, 0, fade); y[:int(.05*SR)] *= np.linspace(0, 1, int(.05*SR))
    y = y / (np.abs(y).max() + 1e-9) * 0.8
    with wave.open(path, 'w') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y*32767).astype(np.int16).tobytes())

# ---- the four pieces ----
def lullaby(total, path):
    """04 'Dear reader' — music-box lullaby in F major, 76 bpm, tender and curious."""
    y = np.zeros(int(total*SR)); b = 60/76
    mel = [72, 77, 76, 72, 74, 69, 72, None, 70, 74, 72, 69, 67, 69, 65, None, 72, 77, 79, 81, 79, 77, 76, 77]
    for i, m in enumerate(mel):
        if m: place(y, music_box(hz(m), 2.0), i*b/2, 0.55)
    for i, ch in enumerate([[53, 57, 60], [50, 53, 57], [46, 50, 53], [48, 52, 55]] * 2):
        place(y, pad([hz(n) for n in ch], 4*b+1, 900), i*4*b/2*2, 0.10)
    finish(y, total, path, wet=0.45, size=1.3)

def rising_piano(total, path):
    """07 'Six phases' — piano arpeggios from D minor that lift into F major for 'Healing'; soft heartbeat."""
    y = np.zeros(int(total*SR)); bar = total/7
    prog = [[50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61], [46, 53, 58, 62], [48, 55, 60, 64], [41, 53, 57, 60, 65, 69]]
    for k, ch in enumerate(prog):
        t0 = k*bar; vel = 0.55 + 0.07*k
        step = bar/8
        for s in range(8):
            n = ch[[0, 1, 2, 3, 2, 1, 2, 3][s] % len(ch)] + (12 if s in (3, 7) else 0)
            place(y, piano(hz(n), 1.6, vel), t0 + s*step, 0.35)
        place(y, piano(hz(ch[0]-12), 2.5, vel), t0, 0.45)
        if k < 6:  # heartbeat lub-dub
            place(y, soft_kick(), t0, 0.35); place(y, soft_kick(), t0+0.28, 0.22)
    place(y, pad([hz(n) for n in (65, 69, 72, 77)], bar+1.5, 1600), 6*bar, 0.18)
    finish(y, total, path, wet=0.3)

def lofi(total, path):
    """10 'The chapters' — cozy lo-fi: Rhodes 7th chords, brushed hats, soft kick, vinyl crackle, 82 bpm."""
    y = np.zeros(int(total*SR)); b = 60/82
    prog = [[48, 52, 55, 59, 64], [45, 48, 52, 55, 60], [41, 45, 48, 52, 57], [43, 47, 50, 53, 59]]
    t = 0.0; k = 0
    while t < total:
        ch = prog[k % 4]
        for n in ch: place(y, rhodes(hz(n), 4*b+0.3), t + 0.012*(n % 3), 0.16)
        place(y, rhodes(hz(ch[0]-12), 4*b), t, 0.22)
        for beat in range(4):
            if beat in (0, 2): place(y, soft_kick(), t + beat*b + (0.03 if beat == 2 else 0), 0.45)
            place(y, brush(), t + beat*b + b/2 + 0.02, 1.0)
            if beat in (1, 3): place(y, brush(0.3), t + beat*b, 1.6)
        mel = [76, 74, 72, None] if k % 2 == 0 else [74, 72, 71, 67]
        for i, m in enumerate(mel):
            if m and t > 4*b: place(y, rhodes(hz(m), b*1.5), t + i*b + b*0.5, 0.12)
        t += 4*b; k += 1
    y += crackle(total)[:len(y)]
    y = lowpass(y, 5200)
    finish(y, total, path, wet=0.2)

def acoustic_hope(total, path):
    """13 'Almost here' — fingerpicked nylon guitar in G, warm string swell, ends resolved and bright."""
    y = np.zeros(int(total*SR)); b = 60/92
    prog = [[43, 50, 55, 59, 62], [40, 47, 52, 55, 59], [36, 43, 48, 52, 55], [38, 45, 50, 54, 57]]
    pattern = [0, 2, 3, 4, 3, 2, 3, 4]
    t = 0.0; k = 0
    while t < total - 2:
        ch = prog[k % 4]
        for s, idx in enumerate(pattern):
            place(y, pluck(hz(ch[idx]), 2.2, 0.5 + 0.1*(s == 0)), t + s*b/2, 0.5 if s else 0.65)
        place(y, pad([hz(n+12) for n in ch[1:4]], 4*b+1.2, 1400), t, 0.05 + 0.02*k)
        t += 4*b; k += 1
    for i, n in enumerate([43, 50, 55, 59, 62, 67]):  # final strum
        place(y, pluck(hz(n), 3.0, 0.7), t + i*0.03, 0.55)
    finish(y, total, path, wet=0.32)

PIECES = {'04': lullaby, '07': rising_piano, '10': lofi, '13': acoustic_hope}

if __name__ == '__main__':
    rid, total, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
    PIECES[rid](total, out)
