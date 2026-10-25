// 6 Nov · "Don't teach your soul to settle for what suffocates it. Let it breathe."
// A little plant sits sealed in a jar tagged "good enough". The glass fogs, drips run down, the plant droops, and the
// Soul's own heart-light fades with it. The Soul walks over, lifts its hand to the lid; the lid pops off, fresh air
// swirls in, the fog clears, the tag falls away. The plant unfurls past the rim and blooms while the Soul takes a
// deep breath and glows.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, LSoul, INK, LW, seg, sm, lerp, back, rnd } from "./line";
import { EndCard } from "../kit/Words";

export const END = 450; const WIPE = 360, CARD = 378;
const T = { fog0: 20, droop0: 40, droop1: 120, walk0: 112, walk1: 146, reach: 148, pop: 166, air1: 200, grow0: 176, grow1: 250, bloom: 236, breath: 184, happy: 226 };
const G = 1500, S0 = 250, S1 = 430, SS = 1.6;
const J = { x: S1 + 142, w: 156, top: 1322, lid: 26 };
const GREEN = "#7CC88E", ROSE = "#E2507F";

const bez = (p0: number[], c: number[], p1: number[], t: number) => [0, 1].map((k) => (1 - t) * (1 - t) * p0[k] + 2 * (1 - t) * t * c[k] + t * t * p1[k]);

const Leaf: React.FC<{ x: number; y: number; a: number; s: number }> = ({ x, y, a, s }) => (
  <path d="M0,0 C14,-18 46,-20 64,0 C46,20 14,18 0,0 Z" transform={`translate(${x} ${y}) rotate(${a}) scale(${s})`} fill={GREEN} stroke={INK} strokeWidth={4.5 / Math.max(0.4, s)} strokeLinejoin="round" />
);

const Flower: React.FC<{ x: number; y: number; s: number; c: string }> = ({ x, y, s, c }) => s <= 0.01 ? null : (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={0} cy={-26} rx={17} ry={26} fill={c} stroke={INK} strokeWidth={4} transform={`rotate(${i * 72})`} />)}
    <circle r={14} fill="#FFD36E" stroke={INK} strokeWidth={4} />
  </g>
);

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const opened = sm(seg(f, T.pop, T.pop + 6));
  const fog = sm(seg(f, T.fog0, T.droop1)) * (1 - sm(seg(f, T.pop + 4, T.air1)));
  const droop = sm(seg(f, T.droop0, T.droop1)) * (1 - sm(seg(f, T.grow0, T.grow0 + 30)));
  const grow = sm(seg(f, T.grow0, T.grow1));
  const sway = Math.sin(t * 1.6) * (2 + 4 * grow);
  const walkP = sm(seg(f, T.walk0, T.walk1));
  const sx = lerp(S0, S1, walkP);
  const walking = f > T.walk0 && f < T.walk1 ? 1 : 0;
  const reach = sm(seg(f, T.reach, T.reach + 10)) * (1 - sm(seg(f, T.pop + 8, T.pop + 22)));
  const sad = sm(seg(f, T.droop0 + 20, T.droop1)) * (1 - sm(seg(f, T.pop, T.pop + 10)));
  const breath = Math.sin(Math.PI * seg(f, T.breath, T.happy));
  // the plant
  const base = [J.x, G - 14];
  const h = lerp(150, 560, grow);
  const tip = [J.x + 70 * droop + sway, G - 14 - h * (1 - 0.42 * droop)];
  const ctl = [J.x - 6, G - 14 - h * 0.75];
  const leaves = [0.32, 0.52, 0.7, 0.86].map((q, i) => { const p = bez(base, ctl, tip, q); const side = i % 2 ? 1 : -1;
    return { x: p[0], y: p[1], a: side > 0 ? -30 + 70 * droop : 210 - 70 * droop, s: lerp(0.75, 1.15, grow) * (1 - 0.15 * droop) }; });
  // lid flight
  const lp = seg(f, T.pop, T.pop + 34);
  const lidX = J.x + lerp(0, 380, lp), lidY = J.top - J.lid / 2 - 520 * Math.sin(Math.PI * lp * 0.62) + 300 * lp * lp, lidR = 540 * lp + (f > T.pop - 10 && f < T.pop ? 8 * Math.sin(f * 2) : 0);
  // tag
  const tagFall = seg(f, T.pop + 10, T.pop + 34);
  return (
    <g>
      {/* soft room: a window with a curtain that lifts when the air comes in */}
      <rect x={700} y={420} width={260} height={330} rx={22} fill="#FFFFFF" opacity={0.55} stroke={INK} strokeWidth={4} strokeOpacity={0.3} />
      <line x1={830} x2={830} y1={420} y2={750} stroke={INK} strokeWidth={3} opacity={0.25} />
      <path d={`M700,410 C${700 + 40 + 60 * opened * (0.6 + 0.4 * Math.sin(t * 2))},560 ${700 + 10 + 40 * opened},680 ${700 + 30 + 90 * opened},780 L700,780 Z`} fill="#FFD6E2" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <circle cx={830} cy={585} r={210} fill="#FFF4D6" opacity={0.35 + 0.3 * opened} filter="url(#lb40)" />
      <path d={`M0,${G} C300,${G - 6} 780,${G + 6} 1080,${G}`} stroke={INK} strokeWidth={4} fill="none" opacity={0.45} />
      <rect x={0} y={G} width={1080} height={420} fill="#FFFFFF" opacity={0.22} />
      {/* jar back */}
      <rect x={J.x - J.w / 2} y={J.top} width={J.w} height={G - J.top} rx={26} fill="#EAF6FF" opacity={0.6} />
      {/* soil */}
      <path d={`M${J.x - J.w / 2 + 8},${G - 40} Q${J.x},${G - 54} ${J.x + J.w / 2 - 8},${G - 40} L${J.x + J.w / 2 - 8},${G - 14} Q${J.x},${G - 4} ${J.x - J.w / 2 + 8},${G - 14} Z`} fill="#B8875E" stroke={INK} strokeWidth={4} />
      {/* the plant */}
      <path d={`M${base[0]},${base[1]} Q${ctl[0]},${ctl[1]} ${tip[0]},${tip[1]}`} stroke="#4E9B62" strokeWidth={9} fill="none" strokeLinecap="round" />
      {leaves.map((l, i) => <Leaf key={i} {...l} />)}
      <Leaf x={tip[0]} y={tip[1]} a={-90 + 80 * droop + sway} s={lerp(0.6, 0.9, grow)} />
      {/* blooms */}
      <Flower x={tip[0]} y={tip[1] - 30} s={back(seg(f, T.bloom, T.bloom + 16), 2)} c="#FF9DB8" />
      {[[0.62, -1], [0.8, 1]].map(([q, side], i) => { const p = bez(base, ctl, tip, q); return <Flower key={i} x={p[0] + side * 70} y={p[1] - 24} s={0.7 * back(seg(f, T.bloom + 8 + i * 8, T.bloom + 24 + i * 8), 2)} c={i ? "#C9B6FF" : "#FFC27A"} />; })}
      {/* jar glass front + fog + drips */}
      <rect x={J.x - J.w / 2} y={J.top} width={J.w} height={G - J.top} rx={26} fill="#FFFFFF" opacity={0.12 + 0.5 * fog} stroke={INK} strokeWidth={LW} />
      {[0, 1, 2].map((i) => { const dx = J.x - 44 + 44 * i, len = 40 + 60 * rnd(i + 2), p = sm(seg(f, T.fog0 + 30 + i * 18, T.fog0 + 70 + i * 18));
        return <line key={i} x1={dx} x2={dx} y1={J.top + 30} y2={J.top + 30 + len * p} stroke="#9FC4DF" strokeWidth={6} strokeLinecap="round" opacity={fog} />; })}
      <path d={`M${J.x - J.w / 2 + 20},${J.top + 30} L${J.x - J.w / 2 + 20},${J.top + 110}`} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
      {/* the tag "good enough" */}
      <g transform={`translate(${J.x + J.w / 2 + 6 + 40 * tagFall} ${J.top + 40 + (G - J.top - 70) * tagFall * tagFall}) rotate(${12 + 70 * tagFall})`} opacity={1 - seg(f, T.pop + 30, T.pop + 46)}>
        <line x1={-10} y1={-10} x2={10} y2={8} stroke={INK} strokeWidth={3} opacity={1 - tagFall} />
        <rect x={0} y={0} width={150} height={52} rx={10} fill="#FFF6E2" stroke={INK} strokeWidth={4} />
        <text x={75} y={36} textAnchor="middle" fontFamily="Hand" fontSize={32} fill={INK}>good enough</text>
      </g>
      {/* the lid */}
      <g transform={`translate(${lidX} ${lidY}) rotate(${lidR})`} opacity={1 - seg(f, T.pop + 26, T.pop + 34)}>
        <rect x={-J.w / 2 - 8} y={-J.lid / 2} width={J.w + 16} height={J.lid} rx={9} fill="#C9B6FF" stroke={INK} strokeWidth={LW - 1} />
      </g>
      {f > T.pop && f < T.pop + 14 && <circle cx={J.x} cy={J.top} r={30 + 90 * seg(f, T.pop, T.pop + 14)} fill="none" stroke="#FFFFFF" strokeWidth={6} opacity={1 - seg(f, T.pop, T.pop + 14)} />}
      {/* fresh air: swirls from the window down into the jar */}
      {f > T.pop && [0, 1, 2].map((i) => { const p = seg(f, T.pop + i * 10, T.pop + 50 + i * 10); if (p <= 0 || p >= 1) return null;
        const x = lerp(820 - 60 * i, J.x + 10, p), y = lerp(640 + 40 * i, J.top - 40, p);
        return <path key={i} d={`M${x - 70},${y} c30,-30 60,-30 70,0 c6,20 -18,30 -26,14`} stroke="#8FD8C4" strokeWidth={6} fill="none" strokeLinecap="round" opacity={Math.sin(Math.PI * p)} />; })}
      {f > T.bloom && Array.from({ length: 7 }, (_, i) => { const p = ((f - T.bloom) / 90 + rnd(i)) % 1;
        return <ellipse key={i} cx={J.x - 260 + 520 * rnd(i + 4) + 40 * Math.sin(t + i)} cy={lerp(780, 1420, p)} rx={9} ry={6} fill={["#FF9DB8", "#C9B6FF", "#FFC27A"][i % 3]} opacity={0.8 * Math.sin(Math.PI * p)} transform={`rotate(${f * 3 + i * 40} ${J.x - 260 + 520 * rnd(i + 4)} ${lerp(780, 1420, p)})`} />; })}
      {/* the Soul: its own light fades with the plant, then it breathes in */}
      <LSoul x={sx} y={G} s={SS} p={{ walk: walking, phase: (sx - S0) / 30, worry: sad, glance: f < T.walk0 ? 0.8 : 0.6, wave: -0.8 * reach,
        inhale: breath, blink: breath > 0.3 || [70].some((b) => f >= b && f < b + 4), happy: f > T.happy ? 1 : 0,
        glow: lerp(0.45, 0.05, sm(seg(f, T.droop0, T.droop1))) * (1 - opened) + opened * (0.2 + 0.7 * sm(seg(f, T.breath, T.happy))) }} />
    </g>
  );
};

export const Q1106: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#EFFBF4", "#CFEFE0"]} audio="q1106.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} ats={[2, T.droop0 + 20, T.pop + 4]} to={WIPE - 6} top={250} size={70}
          lines={[<>don't teach your soul to settle</>, <>for what suffocates it.</>, <span style={{ fontSize: 88 }}>let it <Hl c={ROSE}>breathe.</Hl></span>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <Scene f={f} />
    </LFrame>
  );
};
export const BEATS = { ...T, END, WIPE, CARD };
