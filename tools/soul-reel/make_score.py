"""Score generator used for the master reel "The Paper Boat".
Copy and edit the event list (frame numbers) to sync a new reel's score.
Run: python3 make_score.py  ->  public/music3.wav (20.5 s)."""
import numpy as np, wave
fps=30; sr=44100; T=20.5; n=int(sr*T); t=np.arange(n)/sr
rng=np.random.default_rng(3)
out=np.zeros(n)
at=lambda fr: fr/fps
N=lambda m:440*2**((m-69)/12)
def piano(fq,s,amp,dec=2.2):
    i=int(s*sr); L=min(n-i,int(sr*5)); tt=np.arange(L)/sr
    env=(1-np.exp(-tt*110))*np.exp(-tt/dec)
    v=sum(np.sin(2*np.pi*fq*h*np.sqrt(1+0.0004*h*h)*tt)*(0.55**(h-1)) for h in range(1,6))
    out[i:i+L]+=amp*env*v
def lp(x,a):
    y=np.zeros_like(x); acc=0
    for i in range(len(x)): acc+=a*(x[i]-acc); y[i]=acc
    return y
def noise(s,dur,amp,a=0.08,shape=1):
    i=int(s*sr); L=min(int(dur*sr),n-i); x=lp(rng.normal(0,1,L),a); tt=np.arange(L)/L
    out[i:i+L]+=amp*x*np.sin(np.pi*tt)**shape
def pad(fs,a,b,amp,att=2.5):
    env=np.clip((t-a)/att,0,1)*np.clip((b-t)/2,0,1)
    for fq in fs: out[:]+=amp*env*(np.sin(2*np.pi*fq*t)+0.35*np.sin(2*np.pi*2*fq*t+1))*(1+0.08*np.sin(2*np.pi*0.2*t))

# ---- events for The Paper Boat (edit per reel) ----
pad([N(45),N(52)],0,6.2,0.03,1.5)                          # silence
for s,m in [(0.2,72),(1.6,67),(3.0,69)]: piano(N(m),s,0.09,2.8)
for k in range(7): noise(at(84+k*8),0.12,0.05,0.35,2)       # paper folding
piano(N(84),at(82),0.05,1.5)                               # light leaves the chest
piano(N(67),at(168),0.08,0.8); noise(at(168),0.25,0.05,0.04) # boat touches water
for g in [172,262,352,436,464]: noise(at(g),2.2,0.10,0.012,1.5)  # wind swells
pad([N(50),N(57),N(62),N(66)],at(172),19,0.026,3)          # warmth returns
mel=[74,76,78,81,78,83,81,86,83]
for i,fr in enumerate([258,276,290,302,314,328,344]):       # footsteps
    piano(N(mel[i%len(mel)]),at(fr),0.11,1.6); piano(N(mel[i%len(mel)]-12),at(fr),0.04,1.6)
piano(N(81),at(418),0.10,2.4); piano(N(86),at(424),0.08,2.4)   # payoff word
for i,m in enumerate([86,90,93,98]): piano(N(m),at(440)+i*0.09,0.07,2.2)  # bloom
for i,m in enumerate([74,78,81,86]): piano(N(m),at(490)+i*0.18,0.07,2.6)  # thread ties
for m in [62,69,74,78]: piano(N(m),at(520),0.06,3.5)       # resolve

ir=np.exp(-np.arange(int(sr*2.2))/(sr*0.6))*rng.normal(0,1,int(sr*2.2))*0.012
y=out+np.convolve(out,ir)[:n]; y*=np.clip((T-t)/0.6,0,1); y/=np.abs(y).max()/0.7
st=np.stack([y,np.roll(y,240)],1)
with wave.open("public/music3.wav","wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((st*32767).astype(np.int16).tobytes())
