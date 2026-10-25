// 4 Nov · "You are the moon of your world. Don't dim yourself to blend in with the stars."
// A line-art moon with a sweet face lights a little hill where the Soul sits, happy. Tiny stars appear and twinkle;
// the moon glances at them and slides behind a cloud to blend in. The world goes dark, the Soul looks up, worried.
// The moon peeks out, sees the Soul in the dark, and comes out shining; the world lights up and the Soul stands,
// waving.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, LSoul, Spark, INK, LW, seg, sm, lerp, rnd } from "./line";
import { EndCard } from "../kit/Words";

export const END = 400; const WIPE = 310, CARD = 328;
const T = { stars: 18, glance: 38, hide0: 56, hide1: 86, peek: 124, out0: 148, out1: 172, stand: 176, wave: 190 };
const M = { x: 660, y: 860, r: 120 };
const G = 1470, SX = 330;
const GOLD = "#E3A93A";

const mixc = (a: string, b: string, t: number) => { const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * Math.min(1, Math.max(0, t)))).join(",")})`; };

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const hide = sm(seg(f, T.hide0, T.hide1)) * (1 - sm(seg(f, T.out0, T.out1)));
  const light = 1 - hide; // how lit the world is
  const peek = Math.sin(Math.PI * seg(f, T.peek, T.out0 + 4));
  const glance = sm(seg(f, T.glance, T.glance + 10)) * (1 - sm(seg(f, T.hide1, T.hide1 + 10)));
  const cloudX = lerp(1420, M.x + 10, sm(seg(f, T.hide0 - 6, T.hide1))) + lerp(0, 900, sm(seg(f, T.out0, T.out1 + 10)));
  const moonX = M.x + lerp(0, 30, hide) - 30 * peek * 0.4;
  const stand = sm(seg(f, T.stand, T.stand + 20));
  const waveA = f > T.wave ? -0.8 + 0.18 * Math.sin((f - T.wave) / 4) : 0;
  return (
    <g>
      {/* night that dims and brightens */}
      <rect width={1080} height={1920} fill={mixc("#20214F", "#3E3A7C", light)} opacity={0.55 + 0.15 * hide} />
      {/* stars: tiny, twinkling (they are lovely too) */}
      {Array.from({ length: 22 }, (_, i) => { const x = 80 + rnd(i) * 920, y = 620 + rnd(i + 1) * 560; if (Math.hypot(x - M.x, y - M.y) < 170) return null;
        const on = sm(seg(f, T.stars + i * 2, T.stars + i * 2 + 10)), tw = 0.6 + 0.4 * Math.sin(t * 3 + i * 1.7);
        return i % 3 ? <circle key={i} cx={x} cy={y} r={4} fill="#FFF3C4" opacity={on * tw} /> : <Spark key={i} x={x} y={y} s={on * 0.55 * tw} c="#FFF3C4" />; })}
      {/* moon glow + rays when shining */}
      <circle cx={moonX} cy={M.y} r={M.r * 2.6} fill="#FFF0C2" opacity={0.35 * light} filter="url(#lb40)" />
      {light > 0.6 && f > T.out1 - 6 && Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2 + t * 0.2, p = sm(seg(f, T.out1 - 6, T.out1 + 14));
        return <line key={i} x1={moonX + Math.cos(a) * (M.r + 24)} y1={M.y + Math.sin(a) * (M.r + 24)} x2={moonX + Math.cos(a) * (M.r + 24 + 46 * p)} y2={M.y + Math.sin(a) * (M.r + 24 + 46 * p)} stroke="#FFE59A" strokeWidth={6} strokeLinecap="round" opacity={0.8} />; })}
      {/* the moon with a face */}
      <g transform={`translate(${moonX} ${M.y})`}>
        <circle r={M.r} fill="#FFF6DC" stroke={INK} strokeWidth={LW} />
        <circle cx={-46} cy={-40} r={16} fill="#F2E3BE" /><circle cx={50} cy={46} r={12} fill="#F2E3BE" /><circle cx={58} cy={-20} r={8} fill="#F2E3BE" />
        {(() => { const ex = -12 * glance - 18 * peek; const shy = hide > 0.3 && peek < 0.3;
          return shy ? <g stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round"><path d={`M${ex - 34},-4 q10,8 20,0`} /><path d={`M${ex + 14},-4 q10,8 20,0`} /></g>
            : <g fill={INK}><circle cx={ex - 24} cy={-6} r={8} /><circle cx={ex + 24} cy={-6} r={8} /></g>; })()}
        <ellipse cx={-50} cy={22} rx={14} ry={8} fill="#FFB3C4" opacity={0.8} /><ellipse cx={50} cy={22} rx={14} ry={8} fill="#FFB3C4" opacity={0.8} />
        <path d={`M-14,26 q14,${10 + 6 * light} 28,0`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
      {/* the cloud it hides behind */}
      <g transform={`translate(${cloudX} ${M.y + 20})`}>
        <path d="M-190,60 C-230,20 -190,-40 -130,-30 C-120,-100 -20,-120 20,-60 C60,-110 170,-90 170,-20 C230,-20 240,60 190,70 Z" fill="#E8E6F6" stroke={INK} strokeWidth={LW} strokeLinejoin="round" />
      </g>
      {/* hill, a tiny tree, grass */}
      <path d={`M-40,${G + 60} C120,${G - 150} 560,${G - 140} 700,${G - 40} C820,${G + 40} 980,${G + 20} 1120,${G - 20} L1120,1920 L-40,1920 Z`} fill={mixc("#6E6A9E", "#C6E3C2", light)} stroke={INK} strokeWidth={LW} />
      <g transform={`translate(860 ${G - 10})`}><path d="M0,0 L0,-120" stroke={INK} strokeWidth={10} strokeLinecap="round" /><circle cx={0} cy={-150} r={56} fill={mixc("#5A5890", "#9ED6A2", light)} stroke={INK} strokeWidth={LW} /></g>
      {[[140, G - 20], [520, G - 110], [640, G - 80]].map(([x, y], i) => <path key={i} d={`M${x},${y} q6,-22 10,-26 M${x + 10},${y} q2,-26 0,-32 M${x + 18},${y} q-2,-20 8,-24`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />)}
      {/* the Soul on the hill, lit by the moon */}
      <LSoul x={SX} y={G - 112} s={1.35} facing={1} p={{ sit: 1 - stand, look: 0, glance: 0.8, worry: hide * (1 - sm(seg(f, T.out0, T.out0 + 10))), happy: light > 0.8 && (f < T.hide0 || f > T.out1) ? 1 : 0, wave: waveA,
        glow: 0.25 + 0.6 * sm(seg(f, T.out1, T.out1 + 30)), blink: [110].some((b) => f >= b && f < b + 4) }} />
      {/* moonlight wash over the hill */}
      <ellipse cx={M.x - 100} cy={G - 40} rx={520} ry={180} fill="#FFF3C4" opacity={0.18 * light} filter="url(#lb24)" />
    </g>
  );
};

export const Q1104: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#CFC6F2", "#9C95D6"]} audio="q1104.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} ats={[2, T.hide0, T.peek - 20]} to={WIPE - 6} top={300} size={68} lines={[<>you are the <Hl c={GOLD}>moon</Hl> of your world.</>, <>don't dim yourself</>, <>to blend in with the stars.</>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <g transform="translate(540 1470) scale(1.2) translate(-540 -1470)"><Scene f={f} /></g>
    </LFrame>
  );
};
export const BEATS = { ...T, END, WIPE, CARD };
