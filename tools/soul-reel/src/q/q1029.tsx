// 29 Oct · "Read this if 'sorry' is the first word you say. Sorry for crying. Sorry for replying late. Sorry for needing
// help. Sorry for taking up space. Your feelings were never an inconvenience."
// The Soul holds a heart balloon. With each "sorry" a tag is tied onto it and the heart sinks lower while the Soul
// droops. Then "your feelings were never an inconvenience.": the tags fall away one by one, the heart floats up high
// and the Soul looks up, smiling, its own heart-light glowing.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, LSoul, INK, LW, seg, sm, back } from "./line";
import { EndCard } from "../kit/Words";

export const END = 435; const WIPE = 345, CARD = 363;
const TAGS = [
  { t: "sorry for crying", at: 54, drop: 262 },
  { t: "sorry for replying late", at: 88, drop: 246 },
  { t: "sorry for needing help", at: 122, drop: 230 },
  { t: "sorry for taking up space", at: 156, drop: 214 },
];
const T = { cap2: 200, never: 204, inconv: 244, up: 268, happy: 276 };
const ROSE = "#E2507F";
const S = { x: 330, y: 1600, s: 1.45 };
const HAND = { x: S.x + 75.6 * S.s, y: S.y - 118.5 * S.s }; // where the Soul's raised hand holds the string

const balloonY = (f: number) => {
  let y = 760;
  TAGS.forEach((g) => { y += 75 * back(seg(f, g.at, g.at + 14), 1.3); });
  TAGS.forEach((g) => { y -= 60 * sm(seg(f, g.drop, g.drop + 14)); });
  y -= 120 * sm(seg(f, T.up, T.up + 40));
  return y + 8 * Math.sin(f / 14);
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30, by = balloonY(f), bx = 720 + 10 * Math.sin(f / 20);
  const weight = TAGS.reduce((a, g) => a + seg(f, g.at, g.at + 14) - seg(f, g.drop, g.drop + 14), 0) / 4;
  const free = sm(seg(f, T.up, T.up + 30));
  return (
    <g>
      {/* soft sky: a few drifting clouds and a warm glow that grows as the heart rises */}
      <circle cx={760} cy={700} r={260} fill="#FFE6C2" opacity={0.35 + 0.45 * free} filter="url(#lb40)" />
      {[0, 1, 2].map((i) => <g key={i} transform={`translate(${((i * 420 + t * 14) % 1400) - 200} ${560 + 120 * i})`} opacity={0.75}>
        <path d="M-90,20 C-100,-10 -60,-30 -36,-14 C-26,-44 30,-46 40,-16 C70,-26 96,0 84,20 Z" fill="#FFFFFF" stroke={INK} strokeWidth={4} opacity={0.6} /></g>)}
      {/* ground */}
      <path d={`M0,${S.y} C300,${S.y - 8} 780,${S.y + 8} 1080,${S.y}`} stroke={INK} strokeWidth={4} fill="none" opacity={0.45} />
      <rect x={0} y={S.y} width={1080} height={400} fill="#FFFFFF" opacity={0.22} />
      {[[120, 0], [930, 6], [560, 4]].map(([x, d], i) => <path key={i} d={`M${x},${S.y + d} q6,-26 10,-30 M${x + 10},${S.y + d} q2,-30 0,-36 M${x + 18},${S.y + d} q-2,-22 8,-28`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.5} />)}
      {/* string from the hand to the balloon */}
      <path d={`M${HAND.x},${HAND.y} Q${(HAND.x + bx) / 2 + 20 * Math.sin(f / 18)},${(HAND.y + by + 120) / 2 + 40} ${bx},${by + 112}`} stroke={INK} strokeWidth={3.5} fill="none" />
      {/* the tags: a neat chain hanging under the heart, one below the other */}
      {TAGS.map((g, i) => {
        if (f < g.at) return null;
        const tie = back(seg(f, g.at, g.at + 12), 1.8);
        const d = seg(f, g.drop, g.drop + 40);
        const cy = by + 150 + i * 74;
        const sw = 3 * Math.sin(f / 16 + i * 0.7) * (1 + i * 0.4);
        const fallY = 900 * d * d, rot = sw + 90 * d * (i % 2 ? 1 : -1), fx = 60 * d * (i % 2 ? 1 : -1);
        const o = 1 - sm(seg(f, g.drop + 22, g.drop + 40));
        return (
          <g key={i} opacity={o}>
            {d === 0 && <line x1={bx} y1={i ? cy - 74 + 30 : by + 112} x2={bx} y2={cy - 30} stroke={INK} strokeWidth={3} />}
            <g transform={`translate(${bx + fx} ${cy + fallY}) rotate(${rot}) scale(${tie})`}>
              <path d="M-160,-30 L150,-30 L172,0 L150,30 L-160,30 Z" fill={["#FFFFFF", "#FFF3D6", "#E9F4FF", "#FFE8EE"][i]} stroke={INK} strokeWidth={LW - 2} strokeLinejoin="round" />
              <circle cx={152} cy={0} r={7} fill="none" stroke={INK} strokeWidth={3} />
              <text x={-6} y={11} textAnchor="middle" fontFamily="Hand" fontSize={34} fill={INK}>{g.t}</text>
            </g>
          </g>
        );
      })}
      {/* the heart balloon */}
      <g transform={`translate(${bx} ${by}) rotate(${4 * Math.sin(f / 22) + 8 * weight})`}>
        <circle r={150} fill="#FFC7D4" opacity={0.25 + 0.45 * free} filter="url(#lb24)" />
        <path d="M0,-40 C30,-120 150,-110 130,-20 C116,40 40,84 0,110 C-40,84 -116,40 -130,-20 C-150,-110 -30,-120 0,-40 Z" fill="#FF8FAB" stroke={INK} strokeWidth={LW} strokeLinejoin="round" />
        <path d="M-80,-60 C-70,-84 -40,-88 -30,-70" stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.8} />
        <path d="M-8,110 L8,110 L0,124 Z" fill="#FF8FAB" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
      {/* the Soul */}
      <LSoul x={S.x} y={S.y} s={S.s} p={{ wave: -0.8, worry: Math.min(1, weight * 1.4) * (1 - free), look: Math.min(1, weight * 1.2) * (1 - free) * 0.8,
        happy: f > T.happy ? 1 : 0, glance: 0.6 * free, glow: 0.2 + 0.7 * free, blink: [40, 300].some((b) => f >= b && f < b + 4) }} />
    </g>
  );
};

export const Q1029: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#FFF0F4", "#F3DDF0"]} audio="q1029.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} ats={[2, 8]} to={T.cap2 - 10} top={300} size={70} lines={[<>read this if “sorry”</>, <>is the first word you say.</>]} />
        <Caption f={f} ats={[T.never, T.inconv]} to={WIPE - 6} top={300} size={70} lines={[<>your feelings were never</>, <>an <Hl c={ROSE}>inconvenience.</Hl></>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <Scene f={f} />
    </LFrame>
  );
};
export const BEATS = { ...T, END, WIPE, CARD };
