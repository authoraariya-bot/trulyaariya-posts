// Line-art kit for the minimal quote reels (style reference: clean single-weight ink line, flat pastel fills,
// one soft pastel background, one handwritten caption at the top, small precise motion, a gentle hand-drawn "boil").
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, interpolate, Easing } from "remotion";
import { Audio } from "@remotion/media";

export const INK = "#2B2230";
export const LW = 6; // line weight
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const seg = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const sm = (x: number) => { x = clamp01(x); return x * x * x * (x * (x * 6 - 15) + 10); };
export const ss = (x: number) => { x = clamp01(x); return x * x * (3 - 2 * x); };
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const back = (x: number, k = 1.70158) => { x = clamp01(x); const c3 = k + 1; return 1 + c3 * Math.pow(x - 1, 3) + k * Math.pow(x - 1, 2); };
export const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const useLineFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("Hand", `url(${staticFile("PatrickHand.woff2")})`),
      new FontFace("Caveat", `url(${staticFile("Caveat.ttf")})`, { weight: "400 700" }),
      new FontFace("Cormorant", `url(${staticFile("CormorantGaramond.ttf")})`, { weight: "300 700" }),
      new FontFace("Jost", `url(${staticFile("Jost.ttf")})`, { weight: "100 900" }),
    ];
    Promise.all(faces.map((x) => x.load())).then((l) => { l.forEach((x) => document.fonts.add(x)); continueRender(h); });
  }, [h]);
};

// background: soft pastel gradient + paper grain; no line jitter (smooth, steady lines)
export const LFrame: React.FC<{ f: number; bg: [string, string]; children: React.ReactNode; overlay?: React.ReactNode; audio?: string }> = ({ f, bg, children, overlay, audio }) => {
  useLineFonts();
  const seed = Math.floor(f / 4) % 3;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 42%, ${bg[0]} 0%, ${bg[1]} 100%)` }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="boil" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={2} seed={seed + 1} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
          </filter>
          <filter id="lgrain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={5} stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0 0.35  0 0 0 0.35 0" />
          </filter>
          {[3, 6, 12, 24, 40].map((s) => <filter key={s} id={`lb${s}`} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation={s} /></filter>)}
        </defs>
        {children}
        <rect width={1080} height={1920} filter="url(#lgrain)" opacity={0.07} style={{ mixBlendMode: "multiply" }} />
      </svg>
      {overlay}
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};

// the handwritten caption at the top (fades in quickly, like a still caption on a post)
export const Caption: React.FC<{ f: number; lines: React.ReactNode[]; at?: number; top?: number; size?: number; to?: number }> = ({ f, lines, at = 0, top = 300, size = 66, to = 9999 }) => {
  const o = interpolate(f, [at, at + 10, to, to + 14], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.3, 0, 0.3, 1) });
  return (
    <div style={{ position: "absolute", top, left: 70, right: 70, textAlign: "center", fontFamily: "Hand", fontSize: size, lineHeight: 1.22, color: INK, opacity: o, translate: `0px ${(1 - o) * 10}px` }}>
      {lines.map((l, i) => <div key={i}>{l}</div>)}
    </div>
  );
};
export const Hl: React.FC<{ c: string; children: React.ReactNode }> = ({ c, children }) => <span style={{ color: c }}>{children}</span>;

// small sparkle
export const Spark: React.FC<{ x: number; y: number; s: number; c?: string }> = ({ x, y, s, c = INK }) => (
  s <= 0.01 ? null : <path d="M0,-18 L0,18 M-18,0 L18,0 M-11,-11 L-6,-6 M11,11 L6,6 M11,-11 L6,-6 M-11,11 L-6,6" stroke={c} strokeWidth={4} strokeLinecap="round" transform={`translate(${x} ${y}) scale(${s})`} />
);

export { Audio };
