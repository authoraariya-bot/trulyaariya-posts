// 14 Nov · "Healing isn't one big moment. It's a glass of water, an early night, one honest text, a walk without
// your phone… a hundred small, ordinary days."
// The Soul waits for a big moment: a firework rocket climbs… and fizzles into a tiny "pfft". It shrugs. Then a wall
// calendar starts filling, one square at a time: a glass of water, a moon, a text with a heart, footsteps. The squares
// fill faster and faster with small things until the whole month glows, and so does the Soul.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, LSoul, Spark, INK, LW, seg, sm, lerp, back } from "./line";
import { EndCard } from "../kit/Words";

export const END = 450; const WIPE = 360, CARD = 378;
const C = { x0: 185, y0: 720, cw: 101, ch: 92, cols: 7, rows: 5 };
const KEY = [44, 66, 96, 118];
const T = { rocket0: 6, fizz: 30, shrug: 34, fast0: 146, fast1: 222, glow: 226, happy: 228 };
const G = 1560, SX = 540, SS = 1.45;
const ROSE = "#E2507F";
const N = C.cols * C.rows;
const cellAt = (i: number) => (i < 4 ? KEY[i] : lerp(T.fast0, T.fast1, Math.pow((i - 4) / (N - 5), 0.8)));

const Icon: React.FC<{ k: number }> = ({ k }) => {
  switch (k % 6) {
    case 0: return <g><path d="M-16,-24 L16,-24 L12,24 L-12,24 Z" fill="#E8F5FF" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" /><path d="M-14,-6 L14,-6 L12,22 L-12,22 Z" fill="#9FD3F5" /></g>;
    case 1: return <path d="M8,-24 A24,24 0 1 0 8,24 A18,18 0 1 1 8,-24 Z" fill="#FFE59A" stroke={INK} strokeWidth={3.5} />;
    case 2: return <g><rect x={-26} y={-20} width={52} height={36} rx={12} fill="#FFFFFF" stroke={INK} strokeWidth={3.5} /><path d="M-14,16 l-4,12 l12,-12" fill="#FFFFFF" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" /><path d="M0,-4 C2,-10 10,-9 9,-2 C8,3 2,7 0,9 C-2,7 -8,3 -9,-2 C-10,-9 -2,-10 0,-4 Z" fill="#FF8FAE" /></g>;
    case 3: return <g fill="#C9B6FF" stroke={INK} strokeWidth={3}><ellipse cx={-10} cy={8} rx={9} ry={14} /><ellipse cx={12} cy={-10} rx={9} ry={14} /></g>;
    case 4: return <g><circle r={18} fill="#FFD36E" stroke={INK} strokeWidth={3.5} /><path d="M-7,-2 q7,8 14,0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" /></g>;
    default: return <path d="M0,-6 C3,-16 18,-14 16,-3 C14,6 4,12 0,16 C-4,12 -14,6 -16,-3 C-18,-14 -3,-16 0,-6 Z" fill="#FF9DB8" stroke={INK} strokeWidth={3} />;
  }
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const filled = Array.from({ length: N }, (_, i) => f >= cellAt(i) ? 1 : 0).reduce((a: number, b: number) => a + b, 0);
  const glow = sm(seg(f, T.glow, T.glow + 24));
  const rp = seg(f, T.rocket0, T.fizz);
  const shrug = Math.sin(Math.PI * seg(f, T.shrug, T.shrug + 22));
  return (
    <g>
      {/* the calendar */}
      <circle cx={540} cy={C.y0 + 230} r={480} fill="#FFE9B8" opacity={0.55 * glow} filter="url(#lb40)" />
      <rect x={C.x0 - 26} y={C.y0 - 92} width={C.cw * C.cols + 52} height={C.ch * C.rows + 118} rx={24} fill="#FFFFFF" stroke={INK} strokeWidth={LW} />
      <rect x={C.x0 - 26} y={C.y0 - 92} width={C.cw * C.cols + 52} height={70} rx={24} fill="#FFB3C8" stroke={INK} strokeWidth={LW} />
      {[0, 1].map((k) => <circle key={k} cx={C.x0 + 140 + k * 420} cy={C.y0 - 92} r={12} fill="#FFFFFF" stroke={INK} strokeWidth={4} />)}
      {Array.from({ length: N }, (_, i) => { const c = i % C.cols, r = Math.floor(i / C.cols); const x = C.x0 + c * C.cw, y = C.y0 + r * C.ch;
        const a = cellAt(i), p = back(seg(f, a, a + 8), 2.2), lit = sm(seg(f, a, a + 6));
        return <g key={i}>
          <rect x={x + 4} y={y + 4} width={C.cw - 8} height={C.ch - 8} rx={12} fill={lit > 0 ? `rgba(255,${226 - 10 * glow},${190 - 30 * glow},${0.35 + 0.5 * lit * (0.6 + 0.4 * glow)})` : "#F6F2FA"} stroke={INK} strokeWidth={2.5} strokeOpacity={0.35} />
          {p > 0.01 && <g transform={`translate(${x + C.cw / 2} ${y + C.ch / 2}) scale(${p * (i < 4 ? 1.25 : 0.95)})`}><Icon k={i} /></g>}
          {i < 4 && f > a && f < a + 14 && <circle cx={x + C.cw / 2} cy={y + C.ch / 2} r={30 + 50 * seg(f, a, a + 14)} fill="none" stroke={ROSE} strokeWidth={4} opacity={1 - seg(f, a, a + 14)} />}
        </g>; })}
      {/* the "big moment" rocket that fizzles */}
      {f >= T.rocket0 && f < T.fizz + 26 && <g>
        {f < T.fizz && <g transform={`translate(${lerp(250, 262, rp)} ${lerp(1500, 1280, sm(rp))})`}>
          <path d="M0,-40 L14,-10 L14,26 L-14,26 L-14,-10 Z" fill="#FFB3C8" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          {[0, 1, 2].map((k) => <circle key={k} cx={6 * Math.sin(f + k)} cy={36 + 14 * k} r={7 - 2 * k} fill="#FFD36E" opacity={0.8} />)}</g>}
        {f >= T.fizz && <g transform={`translate(262 1280)`} opacity={1 - seg(f, T.fizz + 10, T.fizz + 26)}>
          <circle r={18 + 20 * seg(f, T.fizz, T.fizz + 10)} fill="#E9E6EF" stroke={INK} strokeWidth={3} />
          <text x={36} y={-24} fontFamily="Hand" fontSize={40} fill={INK}>pfft</text></g>}
      </g>}
      <path d={`M0,${G} C300,${G - 6} 780,${G + 6} 1080,${G}`} stroke={INK} strokeWidth={4} fill="none" opacity={0.45} />
      <rect x={0} y={G} width={1080} height={420} fill="#FFFFFF" opacity={0.22} />
      {/* the Soul */}
      <LSoul x={SX} y={G} s={SS} p={{ look: f < T.fizz + 6 ? 1 : f < T.fast1 ? 0.6 : 0, glance: f < T.fizz + 6 ? -0.8 : 0, worry: shrug * 0.6, wave: f > T.shrug && f < T.shrug + 22 ? -0.35 * shrug : 0,
        happy: f > T.happy || (f > KEY[0] + 2 && f < KEY[0] + 20) ? 1 : 0, glow: 0.1 + 0.8 * (filled / N), blink: [60, 140].some((b) => f >= b && f < b + 4) }} />
      {f > T.happy && [0, 1, 2, 3, 4].map((i) => { const p = ((f - T.happy) / 46 + i / 5) % 1;
        return <Spark key={i} x={[230, 850, 320, 760, 540][i]} y={C.y0 + 520 - 600 * p} s={0.55 * Math.sin(Math.PI * p)} c={["#FFD36E", "#FF8FAE", "#C9B6FF"][i % 3]} />; })}
    </g>
  );
};

export const Q1114: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#FFF6EC", "#EAF4FF"]} audio="q1114.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} ats={[2, KEY[0] - 4, KEY[2] - 4, T.fast0 + 10]} to={WIPE - 6} top={210} size={54}
          lines={[<>healing isn't one big moment.</>, <>it's a glass of water, an early night,</>, <>one honest text, a walk without your phone…</>, <span style={{ fontSize: 66 }}>a hundred <Hl c={ROSE}>small, ordinary days.</Hl></span>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <Scene f={f} />
    </LFrame>
  );
};
export const BEATS = { ...T, END, WIPE, CARD };
