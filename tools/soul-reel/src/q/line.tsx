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

// ---------- the Soul, in clean line art ----------
// Drawn facing right (+x); origin = point on the ground between the feet. Every pose is a blend of two clean
// key poses (stand / sit) plus a distance-locked walk cycle, so there are no stray joints or wobbles.
const Limb: React.FC<{ x1: number; y1: number; x2: number; y2: number; w: number; fill?: string }> = ({ x1, y1, x2, y2, w, fill = "#FFFBF5" }) => (
  <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={w + LW * 2} strokeLinecap="round" />
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={fill} strokeWidth={w} strokeLinecap="round" />
  </g>
);

export type SoulPose = { walk?: number; phase?: number; sit?: number; happy?: number; look?: number; wave?: number; glow?: number; blink?: boolean };
// Front-facing Soul: round head, soft bean body, two stubby arms at the sides, two short legs. The face turns toward
// `facing`. Walking = small alternating steps + a gentle bob (distance-locked phase). Sitting = body lowers onto the
// ground and the feet rest in front. Nothing ever crosses the body, so the outline always stays clean.
export const LSoul: React.FC<{ x: number; y: number; facing?: 1 | -1; s?: number; p: SoulPose }> = ({ x, y, facing = 1, s = 1, p }) => {
  const walk = p.walk ?? 0, ph = p.phase ?? 0, sit = sm(p.sit ?? 0), happy = p.happy ?? 0, look = p.look ?? 0, glow = p.glow ?? 0, wave = p.wave ?? 0;
  const LEG = 30;
  const step = Math.sin(ph);
  const bob = walk * 4 * Math.abs(step);
  const hipY = lerp(-LEG, -4, sit) - bob;          // bottom of the body
  const top = hipY - 104;                          // top of the body / neck
  const headY = top - 30;
  const lean = facing * (walk * 3 + 0);
  const fx = facing * 9 * (1 - 0.3 * sit);         // face offset toward facing
  // legs: while standing, two short capsules; each lifts on its step. While sitting, two feet resting in front.
  const lift = (k: number) => walk * 9 * Math.max(0, k ? step : -step);
  const swing = (k: number) => walk * 8 * (k ? step : -step) * facing;
  const arm = (side: number) => {
    const base = { x: side * 52, y: top + 40 };
    const ang = side * (24 + 6 * Math.sin(ph + (side > 0 ? 0 : Math.PI)) * walk) - (side === facing ? 140 * wave : 0);
    const r = (ang * Math.PI) / 180; return { a: base, b: { x: base.x + Math.sin(r) * 34, y: base.y + Math.cos(r) * 34 } };
  };
  const eyeY = headY - 4 - 3 * look;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${lean} 0 ${hipY})`}>
      <ellipse cx={0} cy={4} rx={lerp(56, 70, sit)} ry={9} fill={INK} opacity={0.08} />
      {/* legs / feet */}
      {[0, 1].map((k) => {
        const lx = (k ? 22 : -22);
        if (sit > 0.5) return null;
        return <Limb key={k} x1={lx} y1={hipY - 8} x2={lx + swing(k)} y2={-12 - lift(k)} w={24} />;
      })}
      {/* arms behind the body edge */}
      {[-1, 1].map((side) => { const { a, b } = arm(side); return <Limb key={side} x1={a.x} y1={a.y} x2={b.x} y2={b.y} w={20} />; })}
      {/* body: a soft bean */}
      <path d={`M-58,${hipY - 16} C-62,${hipY - 70} -46,${top} 0,${top} C46,${top} 62,${hipY - 70} 58,${hipY - 16} C54,${hipY + 4} 30,${hipY + 8} 0,${hipY + 8} C-30,${hipY + 8} -54,${hipY + 4} -58,${hipY - 16} Z`}
        fill="#FFFBF5" stroke={INK} strokeWidth={LW} strokeLinejoin="round" />
      {/* feet resting in front while sitting */}
      {sit > 0.5 && [-1, 1].map((k) => <ellipse key={k} cx={k * 28 + facing * 4} cy={-4} rx={21} ry={13} fill="#FFFBF5" stroke={INK} strokeWidth={LW} />)}
      {/* chest heart-light */}
      <circle cx={0} cy={hipY - 50} r={16 + 26 * glow} fill="#FFD9A6" opacity={0.3 + 0.45 * glow} filter="url(#lb12)" />
      <path d="M0,-6 C3,-12 12,-10 10,-2 C8,4 2,8 0,10 C-2,8 -8,4 -10,-2 C-12,-10 -3,-12 0,-6 Z" transform={`translate(0 ${hipY - 50}) scale(${1.2 + 0.3 * glow})`} fill="#FF9DB0" />
      {/* head */}
      <circle cx={0} cy={headY} r={50} fill="#FFFBF5" stroke={INK} strokeWidth={LW} />
      {happy > 0.5 ? (
        <g stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round">
          <path d={`M${fx - 22},${eyeY + 3} q7,-9 14,0`} /><path d={`M${fx + 8},${eyeY + 3} q7,-9 14,0`} />
        </g>
      ) : p.blink ? (
        <g stroke={INK} strokeWidth={4.5} strokeLinecap="round"><path d={`M${fx - 21},${eyeY} h12`} /><path d={`M${fx + 9},${eyeY} h12`} /></g>
      ) : (
        <g fill={INK}><circle cx={fx - 15} cy={eyeY} r={5.5} /><circle cx={fx + 15} cy={eyeY} r={5.5} /></g>
      )}
      <ellipse cx={fx - 28} cy={eyeY + 16} rx={8} ry={5} fill="#FFB3C4" opacity={0.85} />
      <ellipse cx={fx + 28} cy={eyeY + 16} rx={8} ry={5} fill="#FFB3C4" opacity={0.85} />
      <path d={`M${fx - 7},${eyeY + 15} q7,${5 + 4 * happy} 14,0`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
};
