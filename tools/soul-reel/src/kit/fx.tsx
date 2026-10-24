// Atmosphere + transitions for Soul reels, ported from HyperFrames (heygen-com/hyperframes, Apache-2.0):
// organic-light-leak-overlay, godrays, snow / falling-lines (depth-layered weather with Weyl spacing),
// transitions-light (light leak / overexposure burn), rack-focus. Re-implemented as frame-driven SVG/CSS for Remotion.
import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, seg01, smoother, sstep } from "./choreo";

const PHI = 0.6180339887498949, RT2 = 0.4142135623730951;
const frac = (x: number) => x - Math.floor(x);
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---- organic light leak (amber + rose + gold sweep), screen-blended, drifting
export const LightLeak: React.FC<{ f: number; amt: number; side?: "left" | "right"; tint?: "warm" | "rose" | "gold" }> = ({ f, amt, side = "left", tint = "warm" }) => {
  if (amt <= 0.005) return null;
  const t = f / 30; const s = side === "left" ? 1 : -1;
  const amber = tint === "rose" ? "rgba(255,170,190,0.85)" : "rgba(255,226,170,0.9)";
  const deep = tint === "gold" ? "rgba(255,190,90,0.7)" : tint === "rose" ? "rgba(255,120,150,0.55)" : "rgba(255,140,80,0.6)";
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: amt, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: "-20%", translate: `${s * (-12 + 18 * Math.sin(t * 0.35))}% ${4 * Math.sin(t * 0.5)}%`, rotate: `${-4 + 3 * Math.sin(t * 0.3)}deg`,
        background: `radial-gradient(ellipse 60% 70% at ${side === "left" ? 12 : 88}% 40%, ${amber}, transparent 55%), radial-gradient(ellipse 70% 90% at ${side === "left" ? 22 : 78}% 60%, ${deep}, transparent 66%)`, filter: "blur(40px)" }} />
      <div style={{ position: "absolute", inset: "-20%", translate: `${s * (20 - 24 * Math.sin(t * 0.28))}% 0%`, rotate: `${4 * Math.sin(t * 0.22)}deg`,
        background: "linear-gradient(104deg, transparent 26%, rgba(255,170,90,0.25) 40%, rgba(255,247,215,0.6) 51%, rgba(255,150,70,0.2) 62%, transparent 78%)", filter: "blur(30px)" }} />
    </AbsoluteFill>
  );
};

// ---- god rays: soft tapered beams from a light source that slowly breathe and turn
export const GodRays: React.FC<{ f: number; amt: number; x?: number; y?: number; angle?: number; spread?: number; color?: string }> = ({ f, amt, x = 900, y = -100, angle = 205, spread = 50, color = "#FFF4D6" }) => {
  if (amt <= 0.005) return null;
  const t = f / 30;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: amt, pointerEvents: "none" }}>
      <defs><filter id="rayblur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18" /></filter></defs>
      <g filter="url(#rayblur)">
        {Array.from({ length: 9 }, (_, i) => {
          const a = angle - spread / 2 + (i / 8) * spread + 3 * Math.sin(t * 0.4 + i);
          const w = 26 + 40 * rnd(i), len = 2300; const o = 0.18 + 0.22 * (0.5 + 0.5 * Math.sin(t * 0.7 + i * 1.7));
          const r = (a * Math.PI) / 180;
          const ex = x + Math.sin(r) * len, ey = y - Math.cos(r) * len;
          const nx = Math.cos(r) * w, ny = Math.sin(r) * w;
          return <path key={i} d={`M${x},${y} L${ex - nx},${ey - ny} L${ex + nx},${ey + ny} Z`} fill={color} opacity={o} />;
        })}
      </g>
    </svg>
  );
};

// ---- rain: three depth layers of slanted streaks + splashes on a ground line (or a window pane via clip)
export const Rain: React.FC<{ f: number; amt: number; wind?: number; ground?: number; count?: number; clip?: string; color?: string }> = ({ f, amt, wind = 8, ground = 1560, count = 160, clip, color = "rgba(214,226,240,0.75)" }) => {
  if (amt <= 0.01) return null;
  const n = Math.round(count * clamp01(amt + 0.2));
  const layers = [{ sp: 62, len: 46, w: 2.2, o: 0.75 }, { sp: 44, len: 32, w: 1.6, o: 0.55 }, { sp: 30, len: 20, w: 1.2, o: 0.4 }];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: amt, pointerEvents: "none" }}>
      <g clipPath={clip ? `url(#${clip})` : undefined}>
        {Array.from({ length: n }, (_, i) => {
          const L = layers[i % 3]; const x0 = frac(i * PHI) * 1300 - 110; const ph = frac(i * RT2 + (f * L.sp) / ground);
          const y = ph * (ground + 80) - 80; const x = x0 + (y / 1000) * wind * 10;
          return <path key={i} d={`M${x},${y} l${(wind * L.len) / 60},${L.len}`} stroke={color} strokeWidth={L.w} strokeLinecap="round" opacity={L.o} />;
        })}
        {Array.from({ length: Math.round(n / 4) }, (_, i) => {
          const p = frac(i * PHI * 3 + f / 18 + rnd(i)); const x = frac(i * RT2) * 1080; const r = 4 + 18 * p;
          return <ellipse key={`s${i}`} cx={x} cy={ground + (i % 5) * 60} rx={r} ry={r * 0.28} fill="none" stroke={color} strokeWidth={1.6} opacity={0.8 * (1 - p)} />;
        })}
      </g>
    </svg>
  );
};

// ---- snow: depth-sized flakes drifting side to side
export const Snow: React.FC<{ f: number; amt: number; count?: number }> = ({ f, amt, count = 120 }) => {
  if (amt <= 0.01) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: amt, pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const d = rnd(i + 7); const sp = 3 + 6 * d; const y = frac(i * RT2 + (f * sp) / 2000) * 2000 - 40;
        const x = frac(i * PHI) * 1080 + 26 * Math.sin(f / (40 + 30 * d) + i);
        return <circle key={i} cx={x} cy={y} r={2 + 5 * d} fill="#FFFFFF" opacity={0.45 + 0.5 * d} />;
      })}
    </svg>
  );
};

// ---- fireflies / bokeh motes
export const Fireflies: React.FC<{ f: number; amt: number; count?: number; y0?: number; y1?: number; color?: string }> = ({ f, amt, count = 26, y0 = 900, y1 = 1600, color = "#FFE7A6" }) => {
  if (amt <= 0.01) return null; const t = f / 30;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: amt, pointerEvents: "none", mixBlendMode: "screen" }}>
      <defs><filter id="ffb"><feGaussianBlur stdDeviation="5" /></filter></defs>
      {Array.from({ length: count }, (_, i) => {
        const x = frac(i * PHI) * 1080 + 40 * Math.sin(t * 0.6 + i), y = y0 + frac(i * RT2) * (y1 - y0) + 30 * Math.sin(t * 0.8 + i * 2);
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.4 + i * 1.3));
        return <g key={i} opacity={tw}><circle cx={x} cy={y} r={10} fill={color} filter="url(#ffb)" /><circle cx={x} cy={y} r={3} fill="#FFFBEA" /></g>;
      })}
    </svg>
  );
};

// ---- colour wash: a slow mesh-gradient of pastel light over the scene (adds colour, never flat)
export const ColorWash: React.FC<{ f: number; amt: number; a?: string; b?: string; c?: string }> = ({ f, amt, a = "rgba(255,190,200,0.5)", b = "rgba(190,210,255,0.45)", c = "rgba(255,226,160,0.5)" }) => {
  if (amt <= 0.01) return null; const t = f / 30;
  return (
    <AbsoluteFill style={{ mixBlendMode: "soft-light", opacity: amt, pointerEvents: "none",
      background: `radial-gradient(ellipse 70% 45% at ${30 + 12 * Math.sin(t * 0.3)}% ${25 + 8 * Math.cos(t * 0.25)}%, ${a}, transparent 70%),
                   radial-gradient(ellipse 60% 50% at ${75 + 10 * Math.cos(t * 0.28)}% ${55 + 10 * Math.sin(t * 0.2)}%, ${b}, transparent 70%),
                   radial-gradient(ellipse 80% 40% at 50% ${85 + 5 * Math.sin(t * 0.33)}%, ${c}, transparent 70%)` }} />
  );
};

// ---- scene transition: light-leak dissolve with an overexposure bloom at the cut (transitions-light)
// returns opacity for scene A / scene B and draws the burn on top
export const lightCut = (f: number, at: number, dur = 24) => {
  const p = seg01(f, at - dur / 2, at + dur / 2);
  return { a: 1 - smoother(seg01(f, at - 2, at + 4)), b: smoother(seg01(f, at - 4, at + 2)), burn: Math.sin(Math.PI * p), p };
};
export const Burn: React.FC<{ f: number; amt: number }> = ({ f, amt }) => (amt <= 0.01 ? null : (
  <>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 60% at 50% 45%, rgba(255,250,236,1), rgba(255,236,200,0.85) 50%, rgba(255,214,170,0.6))", opacity: 0.92 * amt }} />
    <LightLeak f={f} amt={amt} tint="gold" />
  </>
));
// rack focus: blur amount for a layer that is drifting out of / into focus
export const rack = (f: number, a: number, b: number, max = 14) => max * sstep(seg01(f, a, b));
