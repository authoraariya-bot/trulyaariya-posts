// Shared kit for the Quote reels (Oct–Nov 2026): object-led motion design in living scenery.
// Pastel colours that pop, depth (blurred foreground / sharp hero / soft far layers), wind, light.
// The quote words reveal like the Soul reels; the end card is the same master end card (kit/Words EndCard).
import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { useFonts } from "../kit/Frame";
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

export const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const seg = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const sm = (x: number) => { x = clamp01(x); return x * x * x * (x * (x * 6 - 15) + 10); };
export const ss = (x: number) => { x = clamp01(x); return x * x * (3 - 2 * x); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// overshoot ease (for pops)
export const back = (x: number, k = 1.70158) => { x = clamp01(x); const c3 = k + 1; return 1 + c3 * Math.pow(x - 1, 3) + k * Math.pow(x - 1, 2); };
// a damped spring settle from 0 → 1
export const spring = (x: number, freq = 3.2, damp = 5) => { if (x <= 0) return 0; return 1 - Math.exp(-damp * x) * Math.cos(freq * Math.PI * x); };

// wind: smooth base sway + travelling gusts across the scene (x in px)
export const wind = (f: number, x: number, gust = 0) => {
  const t = f / 30;
  const base = Math.sin(t * 1.3 + x * 0.006) * 0.6 + Math.sin(t * 0.7 + x * 0.002 + 1.3) * 0.4;
  return base + gust * Math.sin(Math.PI * clamp01((f - x * 0.02) / 30));
};

export const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * clamp01(t))).join(",")})`;
};

export const QFrame: React.FC<{ world: React.ReactNode; overlay: React.ReactNode; audio?: string; bg?: string }> = ({ world, overlay, audio, bg = "#FFE9DC" }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: bg }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="qgrain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.4  0 0 0 0 0.45  0 0 0 0.45 0" />
          </filter>
          {[2, 4, 6, 10, 16, 24, 40].map((s) => <filter key={s} id={`qb${s}`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation={s} /></filter>)}
        </defs>
        {world}
        <rect width={1080} height={1920} filter="url(#qgrain)" opacity={0.06} style={{ mixBlendMode: "multiply" }} />
      </svg>
      {overlay}
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};

// ---- words
export const INK = "#3B2340";
const out = Easing.bezier(0.16, 1, 0.3, 1);
export const W: React.FC<{ f: number; at: number; children: React.ReactNode; last?: boolean; style?: React.CSSProperties }> = ({ f, at, children, last, style }) => {
  const p = interpolate(f, [at, at + 16], [0, 1], { ...cl, easing: out });
  return <span style={{ display: "inline-block", opacity: p, translate: `0px ${(1 - p) * 22}px`, filter: `blur(${(1 - p) * 8}px)`, marginRight: last ? 0 : "0.24em", ...style }}>{children}</span>;
};
export const Words: React.FC<{ f: number; from: number; to: number; top?: number; size?: number; color?: string; glow?: string; children: React.ReactNode }> = ({ f, from, to, top = 250, size = 88, color = INK, glow = "rgba(255,248,240,0.9)", children }) => {
  if (f < from || f > to + 20) return null;
  const o = 1 - sm(seg(f, to, to + 18));
  return (
    <div style={{ position: "absolute", top, left: 56, right: 56, textAlign: "center", fontFamily: "Cormorant", fontWeight: 500, fontSize: size, lineHeight: 1.12, color,
      opacity: o, translate: `0px ${-(1 - o) * 24}px`, filter: `blur(${(1 - o) * 8}px)`, textShadow: `0 0 28px ${glow}, 0 0 10px ${glow}`, letterSpacing: -0.5 }}>{children}</div>
  );
};
// handwritten key word, written left → right, in the reel's accent colour
export const KeyW: React.FC<{ f: number; at: number; children: React.ReactNode; color: string; size?: number }> = ({ f, at, children, color, size = 140 }) => {
  const w = interpolate(f, [at, at + 30], [0, 1], { ...cl, easing: Easing.bezier(0.4, 0, 0.3, 1) });
  return <span style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: size, color, display: "inline-block", clipPath: `inset(-30% ${(1 - w) * 100}% -30% -5%)`, textShadow: "none", lineHeight: 1 }}>{children}</span>;
};
// small handwritten aside (the savage wink)
export const Aside: React.FC<{ f: number; at: number; to: number; x: number; y: number; color: string; rot?: number; children: React.ReactNode; size?: number }> = ({ f, at, to, x, y, color, rot = -6, children, size = 72 }) => {
  const p = back(seg(f, at, at + 12), 2.2), o = Math.min(seg(f, at, at + 6), 1 - seg(f, to, to + 10));
  if (o <= 0) return null;
  return <div style={{ position: "absolute", left: x, top: y, fontFamily: "Caveat", fontWeight: 700, fontSize: size, color, rotate: `${rot}deg`, scale: `${0.6 + 0.4 * p}`, opacity: o, textShadow: "0 0 18px rgba(255,255,255,0.8)" }}>{children}</div>;
};

// ---- scenery pieces
// soft pollen / dust motes drifting with the wind
export const Motes: React.FC<{ f: number; n?: number; color?: string; y0?: number; y1?: number; speed?: number; size?: number; gust?: number }> = ({ f, n = 50, color = "#FFE9A8", y0 = 300, y1 = 1700, speed = 1, size = 1, gust = 0 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const t = f / 30, sp = (14 + 30 * rnd(i)) * speed * (1 + 2.5 * gust);
      const x = ((rnd(i + 1) * 1300 + t * sp * 6 + 40 * Math.sin(t * 0.8 + i)) % 1300) - 110;
      const y = y0 + rnd(i + 2) * (y1 - y0) + 30 * Math.sin(t * 0.6 + i * 1.7) - t * 6 * rnd(i + 3);
      const r = (2 + 4 * rnd(i + 4)) * size, o = 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2 + i));
      return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={o} filter={rnd(i + 5) > 0.6 ? "url(#qb2)" : undefined} />;
    })}
  </g>
);
