// 8 Nov · "Life isn't a race. It's a road, and you deserve to walk it at your own pace."
// A race track. A big stopwatch ticks fast; running shoes whoosh past with speed lines while the Soul runs in place,
// worried and sweating. It stops, looks up, takes a breath. The stopwatch slows and softens into a warm sun, the
// straight track melts into a winding road with flowers, and the Soul walks along it slowly, smiling.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, LSoul, Spark, INK, LW, seg, sm, lerp, back, rnd } from "./line";
import { EndCard } from "../kit/Words";

export const END = 420; const WIPE = 330, CARD = 348;
const SHOES = [12, 28, 44, 60, 78, 96];
const T = { stop: 112, breath0: 124, breath1: 150, morph0: 140, morph1: 186, walk0: 196, walk1: 310, happy: 160 };
const G = 1480, S0 = 380, S1 = 650, SS = 1.6;
const W = { x: 720, y: 910, r: 104 };
const ROSE = "#E2507F";

const mixc = (a: string, b: string, t: number) => { const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * Math.min(1, Math.max(0, t)))).join(",")})`; };

const Shoe: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-60,0 C-60,-26 -40,-34 -20,-34 L0,-34 C10,-20 40,-16 58,-10 C68,-6 68,4 60,6 L-56,6 C-60,6 -62,4 -60,0 Z" fill="#FFFFFF" stroke={INK} strokeWidth={LW - 1} strokeLinejoin="round" />
    <path d="M-62,4 L64,4" stroke={ROSE} strokeWidth={8} strokeLinecap="round" />
    <path d="M-20,-28 l10,10 M-8,-30 l10,10" stroke={INK} strokeWidth={3} />
    {[0, 1, 2].map((i) => <line key={i} x1={-90 - 30 * i} x2={-150 - 50 * i} y1={-24 + 12 * i} y2={-24 + 12 * i} stroke={INK} strokeWidth={4} strokeLinecap="round" opacity={0.5} />)}
  </g>
);

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const m = sm(seg(f, T.morph0, T.morph1));
  const breath = Math.sin(Math.PI * seg(f, T.breath0, T.breath1));
  const walkP = seg(f, T.walk0, T.walk1);
  const sx = lerp(S0, S1, walkP);
  const walking = f < T.stop ? 1 : f > T.walk0 && f < T.walk1 ? 1 : 0;
  const phase = f < T.stop ? f / 2.4 : (sx - S0) / 26;
  const rush = 1 - sm(seg(f, T.stop - 4, T.stop + 10));
  // stopwatch hand: fast, then slows to a stop
  const handA = f < T.stop ? f * 18 : T.stop * 18 + 60 * (1 - Math.exp(-(f - T.stop) / 12));
  // the strip: a straight track that melts into a winding road
  const top = (x: number) => G - 6 + m * 26 * Math.sin(x / 140 + 0.6);
  const bot = (x: number) => G + 110 + m * 30 * Math.sin(x / 160 + 2.1);
  const xs = Array.from({ length: 23 }, (_, i) => -30 + i * 52);
  const strip = `M${xs.map((x) => `${x},${top(x)}`).join(" L")} L${[...xs].reverse().map((x) => `${x},${bot(x)}`).join(" L")} Z`;
  return (
    <g>
      {/* sky warmth arrives with the sun */}
      <circle cx={W.x} cy={W.y} r={420} fill="#FFD9A6" opacity={0.45 * m} filter="url(#lb40)" />
      {/* soft hills behind */}
      <path d={`M-40,${G - 30} C200,${G - 200} 420,${G - 170} 600,${G - 60} C760,${G - 200} 980,${G - 190} 1120,${G - 50} L1120,${G} L-40,${G} Z`} fill={mixc("#E9E6F2", "#CDEBC8", m)} stroke={INK} strokeWidth={4} strokeOpacity={0.35} />
      {/* the stopwatch → the sun */}
      <g transform={`translate(${W.x} ${W.y + 6 * Math.sin(f * 2.4) * rush})`}>
        {m > 0.4 && Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2 + t * 0.15, p = sm(seg(f, T.morph0 + 20, T.morph1 + 10));
          return <line key={i} x1={Math.cos(a) * (W.r + 22)} y1={Math.sin(a) * (W.r + 22)} x2={Math.cos(a) * (W.r + 22 + 40 * p)} y2={Math.sin(a) * (W.r + 22 + 40 * p)} stroke="#FFC46B" strokeWidth={6} strokeLinecap="round" />; })}
        <g opacity={1 - m}>
          <rect x={-18} y={-W.r - 34} width={36} height={26} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={LW - 1} />
          <rect x={-30} y={-W.r - 48} width={60} height={16} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={LW - 1} />
          <rect x={W.r * 0.62} y={-W.r * 0.92} width={30} height={20} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={LW - 1} transform={`rotate(45 ${W.r * 0.62} ${-W.r * 0.92})`} />
        </g>
        <circle r={W.r} fill={mixc("#FFFFFF", "#FFE2A8", m)} stroke={INK} strokeWidth={LW} />
        <g opacity={1 - m}>
          {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <line key={i} x1={Math.cos(a) * (W.r - 16)} y1={Math.sin(a) * (W.r - 16)} x2={Math.cos(a) * (W.r - 30)} y2={Math.sin(a) * (W.r - 30)} stroke={INK} strokeWidth={4} strokeLinecap="round" />; })}
          <line x1={0} y1={0} x2={Math.sin((handA * Math.PI) / 180) * (W.r - 30)} y2={-Math.cos((handA * Math.PI) / 180) * (W.r - 30)} stroke={ROSE} strokeWidth={7} strokeLinecap="round" />
          <circle r={8} fill={INK} />
        </g>
        {/* the sun's face */}
        <g opacity={sm(seg(f, T.morph1 - 16, T.morph1 + 6))}>
          <path d="M-36,-6 q10,-10 20,0 M16,-6 q10,-10 20,0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M-14,22 q14,12 28,0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          <ellipse cx={-48} cy={18} rx={13} ry={7} fill="#FFB3C4" /><ellipse cx={48} cy={18} rx={13} ry={7} fill="#FFB3C4" />
        </g>
        {f < T.stop && [0, 1].map((k) => <path key={k} d={`M${(k ? 1 : -1) * (W.r + 20)},-40 q${(k ? 1 : -1) * 16},20 0,40`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.5 * (Math.sin(f * 1.4) > 0 ? 1 : 0.2)} />)}
      </g>
      {/* the strip */}
      <path d={strip} fill={mixc("#F7B8B0", "#F6E6CC", m)} stroke={INK} strokeWidth={LW} strokeLinejoin="round" />
      {/* lane lines fade away; a soft dashed centre path appears */}
      <g opacity={1 - m}>
        <line x1={0} x2={1080} y1={G + 52} y2={G + 52} stroke="#FFFFFF" strokeWidth={6} />
        <line x1={170} x2={170} y1={G - 6} y2={G + 110} stroke="#FFFFFF" strokeWidth={14} />
      </g>
      <path d={`M${xs.map((x) => `${x},${(top(x) + bot(x)) / 2}`).join(" L")}`} stroke="#E8CFA6" strokeWidth={6} fill="none" strokeDasharray="20 26" opacity={m} />
      {/* flowers pop up along the road */}
      {Array.from({ length: 12 }, (_, i) => { const x = 70 + i * 86 + 20 * rnd(i), up = i % 2 === 0; const y = up ? top(x) - 6 : bot(x) + 46;
        const s = back(seg(f, T.morph0 + 10 + i * 3, T.morph0 + 26 + i * 3), 2); if (s <= 0.01) return null; const c = ["#FF9DB8", "#C9B6FF", "#FFC27A", "#8FD8C4"][i % 4];
        return <g key={i} transform={`translate(${x} ${y}) scale(${s}) rotate(${4 * Math.sin(t * 1.4 + i)})`}>
          <path d="M0,0 L0,-34" stroke="#4E9B62" strokeWidth={5} strokeLinecap="round" />
          {[0, 1, 2, 3, 4].map((k) => <ellipse key={k} cx={0} cy={-46} rx={8} ry={12} fill={c} stroke={INK} strokeWidth={3} transform={`rotate(${k * 72} 0 -34)`} />)}
          <circle cx={0} cy={-34} r={6} fill="#FFD36E" stroke={INK} strokeWidth={3} />
        </g>; })}
      {/* a butterfly once it's a road */}
      {f > T.walk0 && (() => { const p = (f - T.walk0) / 150; const bx = sx + 120 + 60 * Math.sin(p * 6), by = G - 300 - 40 * Math.sin(p * 9);
        const w = Math.abs(Math.sin(f / 3));
        return <g transform={`translate(${bx} ${by})`} opacity={sm(seg(f, T.walk0, T.walk0 + 12))}>
          <ellipse cx={-14 * w} cy={-6} rx={14 * w + 2} ry={16} fill="#FFB3C8" stroke={INK} strokeWidth={3} /><ellipse cx={14 * w} cy={-6} rx={14 * w + 2} ry={16} fill="#C9B6FF" stroke={INK} strokeWidth={3} />
          <line x1={0} y1={-16} x2={0} y2={8} stroke={INK} strokeWidth={4} strokeLinecap="round" /></g>; })()}
      {/* the Soul */}
      <LSoul x={sx + 5 * rush * Math.sin(f * 1.7)} y={G + 34} s={SS} p={{ walk: walking, phase, worry: rush, sweat: rush * seg(f, 20, 60), glance: f < T.stop ? (Math.sin(f / 6) > 0 ? -0.8 : 0.6) : lerp(0.8, 0.4, m),
        look: f >= T.stop && f < T.walk0 ? 1 - m : 0, inhale: breath, blink: breath > 0.4, happy: f > T.happy && breath < 0.3 ? 1 : 0, glow: 0.2 + 0.6 * m }} />
      {/* shoes rushing past */}
      {SHOES.map((a, i) => { const p = seg(f, a, a + 16); if (p <= 0 || p >= 1) return null;
        return <Shoe key={i} x={lerp(-260, 1360, p)} y={G + 60 + (i % 2) * 34} s={1.5} />; })}
      {f > T.stop && f < T.stop + 12 && <Spark x={sx + 70} y={G - 290} s={0.5 * Math.sin(Math.PI * seg(f, T.stop, T.stop + 12))} c={ROSE} />}
    </g>
  );
};

export const Q1108: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#F3F0FF", "#FFE9DC"]} audio="q1108.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} ats={[6, T.morph0 + 6, T.walk0, T.walk0 + 40]} to={WIPE - 6} top={250} size={68}
          lines={[<>life isn't a race.</>, <>it's a road,</>, <>and you deserve to walk it</>, <span style={{ fontSize: 82 }}>at your <Hl c={ROSE}>own pace.</Hl></span>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <g transform="translate(540 1480) scale(1.25) translate(-540 -1480)"><Scene f={f} /></g>
    </LFrame>
  );
};
export const BEATS = { ...T, END, WIPE, CARD };
