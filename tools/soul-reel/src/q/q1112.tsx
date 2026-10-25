// 12 Nov · "Read this if everyone around you seems ahead. Promotions. Weddings. New cities. And you're still
// figuring out Tuesday. You're not behind. You were busy surviving."
// Up on a neat shelf, three tidy pots ("promotion", "wedding", "new city") burst into bloom one after another while
// the Soul looks up at them. It looks down at its own patch: cracked pavement and a tiny bent sprout, and wonders
// "tuesday?". Then the sprout pushes up through the crack, the concrete splits, and it grows tall into the biggest,
// brightest flower of all, tagged "you". The Soul kneels beside it, glowing.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, LSoul, Spark, INK, LW, seg, sm, lerp, back } from "./line";
import { EndCard } from "../kit/Words";

export const END = 450; const WIPE = 360, CARD = 378;
const POTS = [{ t: "promotion", x: 260, at: 32, c: "#FFB3C8" }, { t: "wedding", x: 540, at: 50, c: "#C9B6FF" }, { t: "new city", x: 820, at: 68, c: "#FFC27A" }];
const T = { tues: 92, notb: 152, push0: 158, push1: 230, bloom: 222, kneel: 188, surv: 196, happy: 236 };
const G = 1500, SX = 330, SS = 1.6, CX = 700, SHELF = 930;
const ROSE = "#E2507F";

const Bloom: React.FC<{ s: number; c: string; r?: number }> = ({ s, c, r = 1 }) => s <= 0.01 ? null : (
  <g transform={`scale(${s * r})`}>
    {[0, 1, 2, 3, 4, 5].map((i) => <ellipse key={i} cx={0} cy={-30} rx={19} ry={30} fill={c} stroke={INK} strokeWidth={4 / r} transform={`rotate(${i * 60})`} />)}
    <circle r={16} fill="#FFD36E" stroke={INK} strokeWidth={4 / r} />
  </g>
);

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const push = sm(seg(f, T.push0, T.push1));
  const crack = sm(seg(f, T.push0, T.push0 + 20));
  const stemH = lerp(40, 420, push);
  const bend = (1 - sm(seg(f, T.push0, T.push0 + 30))) * 28;
  const tip = [CX + bend + 4 * Math.sin(t * 1.5) * push, G - stemH];
  const kneel = sm(seg(f, T.kneel, T.kneel + 16));
  const lookUp = f < T.tues - 6 ? sm(seg(f, 20, 30)) : 0;
  const thought = Math.min(sm(seg(f, T.tues, T.tues + 10)), 1 - sm(seg(f, T.notb - 6, T.notb + 4)));
  return (
    <g>
      {/* the shelf of other people's milestones */}
      <rect x={110} y={SHELF} width={860} height={18} rx={8} fill="#E7C3A2" stroke={INK} strokeWidth={4} />
      {POTS.map((p, i) => { const b = back(seg(f, p.at, p.at + 14), 2); const sw = 3 * Math.sin(t * 1.4 + i);
        return <g key={i} transform={`translate(${p.x} ${SHELF})`}>
          <path d={`M0,-90 L${sw},-170`} stroke="#4E9B62" strokeWidth={7} strokeLinecap="round" />
          <path d={`M0,-120 c-30,-6 -40,-26 -36,-34 c18,0 30,14 36,34 Z`} fill="#7CC88E" stroke={INK} strokeWidth={3.5} />
          <g transform={`translate(${sw} -175)`}><Bloom s={b} c={p.c} r={0.9} /></g>
          {f > p.at && f < p.at + 14 && <circle cx={sw} cy={-175} r={30 + 70 * seg(f, p.at, p.at + 14)} fill="none" stroke={p.c} strokeWidth={5} opacity={1 - seg(f, p.at, p.at + 14)} />}
          <path d="M-74,-96 L74,-96 L60,0 L-60,0 Z" fill="#FFFFFF" stroke={INK} strokeWidth={LW - 1} strokeLinejoin="round" />
          <rect x={-80} y={-108} width={160} height={22} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={LW - 1} />
          <text x={0} y={-36} textAnchor="middle" fontFamily="Hand" fontSize={32} fill={INK}>{p.t}</text>
        </g>; })}
      {/* pavement */}
      <rect x={0} y={G} width={1080} height={420} fill="#E9E6EF" />
      <path d={`M0,${G} L1080,${G}`} stroke={INK} strokeWidth={4} opacity={0.6} />
      {[180, 480, 900].map((x, i) => <line key={i} x1={x} y1={G} x2={x - 30} y2={1920} stroke={INK} strokeWidth={3} opacity={0.25} />)}
      {/* the crack + its sprout */}
      <path d={`M${CX - 70 - 30 * crack},${G} L${CX - 30},${G + 26 + 20 * crack} L${CX - 4},${G + 4} L${CX + 20},${G + 40 + 20 * crack} L${CX + 60 + 30 * crack},${G}`} fill="#C9C3D3" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {crack > 0.2 && [[-110, 0.4], [110, -0.3]].map(([dx, r], i) => <path key={i} d={`M${CX + dx * 0.6},${G} l${dx * 0.4},${-8 * crack}`} stroke={INK} strokeWidth={4} opacity={crack} transform={`rotate(${r} ${CX} ${G})`} />)}
      {f > T.push0 && f < T.push0 + 20 && [0, 1, 2, 3].map((i) => <rect key={i} x={CX - 40 + 26 * i + 50 * (i - 1.5) * seg(f, T.push0, T.push0 + 20)} y={G - 10 - 60 * Math.sin(Math.PI * seg(f, T.push0, T.push0 + 20))} width={14} height={10} rx={3} fill="#C9C3D3" stroke={INK} strokeWidth={3} />)}
      <circle cx={tip[0]} cy={tip[1]} r={180} fill="#FFE2A8" opacity={0.55 * sm(seg(f, T.bloom, T.bloom + 20))} filter="url(#lb40)" />
      <path d={`M${CX},${G + 10} Q${CX - 10},${G - stemH * 0.5} ${tip[0]},${tip[1]}`} stroke="#4E9B62" strokeWidth={lerp(6, 11, push)} fill="none" strokeLinecap="round" />
      {[0.35, 0.6].map((q, i) => { const y = G - stemH * q, s = lerp(0.5, 1.2, push); const side = i ? 1 : -1;
        return <path key={i} d="M0,0 C14,-18 46,-20 64,0 C46,20 14,18 0,0 Z" transform={`translate(${CX - 4} ${y}) rotate(${side > 0 ? -28 : 208}) scale(${s})`} fill="#7CC88E" stroke={INK} strokeWidth={4 / s} />; })}
      {f < T.push0 + 10 && <path d="M0,0 C8,-10 26,-10 34,0 C26,10 8,10 0,0 Z" transform={`translate(${tip[0]} ${tip[1]}) rotate(${60 - 60 * push})`} fill="#9ED6A2" stroke={INK} strokeWidth={3.5} />}
      <g transform={`translate(${tip[0]} ${tip[1]}) rotate(${6 * Math.sin(t * 1.2)})`}><Bloom s={back(seg(f, T.bloom, T.bloom + 18), 2)} c="#FF6F9A" r={1.5} /></g>
      {/* the "you" tag */}
      {f > T.bloom + 8 && <g transform={`translate(${CX + 30} ${G - stemH * 0.45}) rotate(${-6 + 3 * Math.sin(t * 1.6)})`} opacity={sm(seg(f, T.bloom + 8, T.bloom + 18))}>
        <line x1={-20} y1={-6} x2={0} y2={6} stroke={INK} strokeWidth={3} />
        <rect x={0} y={0} width={96} height={52} rx={10} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
        <text x={48} y={37} textAnchor="middle" fontFamily="Hand" fontSize={38} fill={ROSE}>you</text></g>}
      {/* the Soul */}
      <LSoul x={SX + lerp(0, 150, kneel)} y={G} s={SS} p={{ walk: f > T.kneel && f < T.kneel + 16 ? 1 : 0, phase: f / 4, sit: kneel, look: lookUp, glance: f >= T.tues - 6 ? 0.8 : 0.3, worry: thought * 0.8 + (f > 40 && f < T.tues ? 0.35 : 0),
        happy: f > T.happy ? 1 : 0, glow: 0.15 + 0.7 * sm(seg(f, T.bloom, T.bloom + 30)), blink: [140].some((b) => f >= b && f < b + 4) }} />
      {/* "tuesday?" thought */}
      {thought > 0.01 && <g transform={`translate(${SX + 40} ${G - 430}) scale(${thought})`}>
        <circle cx={-40} cy={70} r={8} fill="#FFFFFF" stroke={INK} strokeWidth={3} /><circle cx={-20} cy={46} r={12} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
        <rect x={-10} y={-50} width={190} height={76} rx={34} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
        <text x={85} y={0} textAnchor="middle" fontFamily="Hand" fontSize={40} fill={INK}>tuesday?</text></g>}
      {f > T.happy && [0, 1, 2, 3].map((i) => { const p = ((f - T.happy) / 50 + i / 4) % 1;
        return <Spark key={i} x={tip[0] + [-180, 170, -130, 140][i]} y={tip[1] + 80 - 160 * p} s={0.5 * Math.sin(Math.PI * p)} c={["#FF8FAE", "#FFD36E"][i % 2]} />; })}
    </g>
  );
};

export const Q1112: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#FFF4EC", "#EFEAFF"]} audio="q1112.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} ats={[2, POTS[0].at, T.tues, T.notb, T.surv]} to={WIPE - 6} top={220} size={54}
          lines={[<>read this if everyone around you seems ahead.</>, <>promotions. weddings. new cities.</>, <>and you're still figuring out tuesday.</>, <span style={{ fontSize: 70 }}>you're not behind.</span>, <span style={{ fontSize: 70 }}>you were busy <Hl c={ROSE}>surviving.</Hl></span>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <Scene f={f} />
    </LFrame>
  );
};
export const BEATS = { ...T, END, WIPE, CARD };
