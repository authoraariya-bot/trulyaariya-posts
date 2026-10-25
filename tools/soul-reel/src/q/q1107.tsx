// 7 Nov · "The right people give you wings. The wrong ones give you lessons your soul never asked for. Choose truly."
// A little pink gift floats up to the Soul, opens, and soft wings bloom on its back; it lifts off the ground, happy.
// Then a heavy grey backpack tagged "lessons" drops on it: the wings fold and grey, the Soul sinks down, sweating.
// It stands, shrugs the backpack off (thud), and the wings open again; it rises, glowing.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, LSoul, Spark, INK, LW, seg, sm, lerp, back } from "./line";
import { EndCard } from "../kit/Words";

export const END = 450; const WIPE = 360, CARD = 378;
const T = { gift: 6, open: 34, wings: 40, lift0: 56, drop0: 100, thud: 118, never: 150, stand: 168, shrug: 186, off: 206, choose: 214, rise0: 222, rise1: 262 };
const G = 1520, SX = 540, SS = 1.8;
const PINK = "#FFB3C8", ROSE = "#E2507F";

const Wing: React.FC<{ side: number; s: number; flap: number; c: string }> = ({ side, s, flap, c }) => s <= 0.01 ? null : (
  <g transform={`translate(${side * 36} -112) rotate(${side * (-flap)}) scale(${side * s} ${s})`}>
    <path d="M0,0 C30,-70 110,-110 150,-80 C170,-60 150,-30 120,-24 C150,-10 150,22 116,26 C130,44 110,64 80,52 C50,42 20,24 0,10 Z" fill={c} stroke={INK} strokeWidth={LW / Math.max(0.5, s)} strokeLinejoin="round" />
    <path d="M24,-6 C60,-40 100,-60 130,-62 M28,6 C60,-6 92,-12 118,-8" stroke={INK} strokeWidth={3} fill="none" opacity={0.35} strokeLinecap="round" />
  </g>
);

const mixc = (a: string, b: string, t: number) => { const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * Math.min(1, Math.max(0, t)))).join(",")})`; };

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const weighed = sm(seg(f, T.thud, T.thud + 8)) * (1 - sm(seg(f, T.shrug, T.off)));
  const sit = sm(seg(f, T.thud, T.thud + 10)) * (1 - sm(seg(f, T.stand, T.stand + 16)));
  const flying1 = sm(seg(f, T.lift0, T.lift0 + 24)) * (1 - sm(seg(f, T.thud - 4, T.thud + 2)));
  const flying2 = sm(seg(f, T.rise0, T.rise1));
  const hover = 60 * flying1 + 230 * flying2 + (flying1 + flying2 > 0.5 ? 10 * Math.sin(t * 3.2) : 0);
  const wingS = back(seg(f, T.wings, T.wings + 16), 2) * (1 - 0.65 * weighed) * (f > T.choose ? 1 : 1);
  const wingC = mixc(PINK, "#C9C4CF", weighed);
  const flap = (flying1 + flying2 > 0.3 ? 14 * Math.sin(t * 9) : 4 * Math.sin(t * 2)) - 30 * weighed;
  const reopen = back(seg(f, T.choose, T.choose + 14), 2);
  const ws = f > T.choose ? lerp(wingS, 1.1, reopen) : wingS;
  const sy = G - hover;
  // gift
  const gp = sm(seg(f, T.gift, T.gift + 26));
  const gx = lerp(-120, SX - 250, gp), gy = lerp(1300, G - 60, gp) - 30 * Math.sin(Math.PI * gp);
  const lidUp = seg(f, T.open, T.open + 14);
  // backpack: drops from above onto the back, then slides off to the right
  const dp = seg(f, T.drop0, T.thud);
  const off = seg(f, T.shrug, T.off);
  const bx = SX + lerp(0, 250, sm(off)), by0 = lerp(260, sy - 150 + 26 * sit * SS, dp * dp);
  const by = f < T.shrug ? by0 : lerp(sy - 150 + 26 * sit * SS, G - 90, off * off);
  const br = lerp(0, 74, sm(off));
  const showPack = f >= T.drop0;
  const packOnBack = f >= T.thud && f < T.shrug;
  const Pack = (front: boolean) => (
    <g transform={`translate(${bx} ${by}) rotate(${br}) scale(1.4)`}>
      {!front && <g><rect x={-104} y={-90} width={208} height={150} rx={30} fill="#9C97A8" stroke={INK} strokeWidth={LW} />
        <rect x={-60} y={-112} width={120} height={36} rx={14} fill="#8A8496" stroke={INK} strokeWidth={LW - 1} /></g>}
      {front && packOnBack && <g>
        {[-1, 1].map((k) => <path key={k} d={`M${k * 34},-60 C${k * 40},-20 ${k * 46},20 ${k * 44},44`} stroke="#7A7486" strokeWidth={14} fill="none" strokeLinecap="round" />)}
      </g>}
      {front && <g transform={`translate(${packOnBack ? 112 : 0} ${packOnBack ? 0 : 10}) rotate(${packOnBack ? 8 : 0})`}>
        <line x1={0} y1={-24} x2={0} y2={-4} stroke={INK} strokeWidth={3} />
        <rect x={-62} y={-4} width={124} height={50} rx={10} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
        <text x={0} y={32} textAnchor="middle" fontFamily="Hand" fontSize={34} fill={INK}>lessons</text>
      </g>}
    </g>
  );
  return (
    <g>
      {/* soft sky, a few clouds, a low horizon */}
      {[[200, 760, 1], [860, 900, 0.8]].map(([x, y, s], i) => <path key={i} d="M-90,30 C-110,0 -80,-30 -50,-24 C-40,-60 20,-64 40,-30 C70,-50 110,-30 100,0 C120,10 116,34 90,34 Z" transform={`translate(${x + 14 * Math.sin(t * 0.4 + i)} ${y}) scale(${s})`} fill="#FFFFFF" stroke={INK} strokeWidth={4} strokeOpacity={0.4} opacity={0.75} />)}
      <path d={`M0,${G} C300,${G - 6} 780,${G + 6} 1080,${G}`} stroke={INK} strokeWidth={4} fill="none" opacity={0.45} />
      <rect x={0} y={G} width={1080} height={420} fill="#FFFFFF" opacity={0.22} />
      {/* ground shadow that shrinks as the Soul rises */}
      <ellipse cx={SX} cy={G + 4} rx={90 - 0.15 * hover} ry={12} fill={INK} opacity={0.1} />
      {/* the gift */}
      {f > T.gift && f < T.wings + 30 && <g transform={`translate(${gx} ${gy})`} opacity={1 - seg(f, T.wings + 10, T.wings + 30)}>
        <rect x={-56} y={-90} width={112} height={90} rx={10} fill={PINK} stroke={INK} strokeWidth={LW} />
        <rect x={-10} y={-90} width={20} height={90} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
        <g transform={`translate(${-40 * lidUp} ${-90 - 120 * lidUp + 120 * lidUp * lidUp}) rotate(${-40 * lidUp})`}>
          <rect x={-64} y={-26} width={128} height={28} rx={8} fill={PINK} stroke={INK} strokeWidth={LW} />
          <path d="M0,-26 C-30,-60 -50,-30 0,-26 C50,-30 30,-60 0,-26 Z" fill="#FFFFFF" stroke={INK} strokeWidth={4} />
        </g>
        {lidUp > 0 && lidUp < 1 && [0, 1, 2, 3].map((i) => <Spark key={i} x={-30 + 20 * i} y={-110 - 60 * lidUp - 20 * (i % 2)} s={0.5 * Math.sin(Math.PI * lidUp)} c={ROSE} />)}
      </g>}
      {/* a soft trail of sparkle from gift to Soul as the wings arrive */}
      {f > T.open + 4 && f < T.wings + 18 && <path d={`M${SX - 250},${G - 160} Q${SX - 160},${G - 360} ${SX - 40},${sy - 220}`} stroke={PINK} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray="4 22" opacity={Math.sin(Math.PI * seg(f, T.open + 4, T.wings + 18))} />}
      {/* behind the Soul: the backpack body and wings */}
      {showPack && (f < T.thud || f >= T.shrug) && Pack(false)}
      <g transform={`translate(${SX} ${sy + 26 * sit * SS}) scale(${SS})`}>
        {[-1, 1].map((k) => <Wing key={k} side={k} s={ws} flap={flap} c={wingC} />)}
      </g>
      {packOnBack && Pack(false)}
      {/* the Soul */}
      <LSoul x={SX} y={sy} s={SS} p={{ sit, worry: weighed, sweat: weighed * seg(f, T.thud, T.never + 10), glance: 0, wave: f > T.shrug - 6 && f < T.off + 4 ? -0.5 * Math.sin(Math.PI * seg(f, T.shrug - 6, T.off + 4)) : 0,
        happy: (f > T.wings + 8 && f < T.thud) || f > T.rise0 ? 1 : 0, glow: 0.2 + 0.4 * flying1 + 0.6 * flying2, blink: [150, 160].some((b) => f >= b && f < b + 4) }} />
      {showPack && Pack(true)}
      {f > T.thud && f < T.thud + 12 && <g opacity={1 - seg(f, T.thud, T.thud + 12)}>{[-1, 1].map((k) => <path key={k} d={`M${SX + k * 120},${G - 10} l${k * 40},-20 M${SX + k * 130},${G + 6} l${k * 50},0`} stroke={INK} strokeWidth={5} strokeLinecap="round" />)}</g>}
      {f > T.off - 2 && f < T.off + 12 && <g opacity={1 - seg(f, T.off - 2, T.off + 12)}>{[-1, 1].map((k) => <path key={k} d={`M${SX + 250 + k * 110},${G - 10} l${k * 36},-18`} stroke={INK} strokeWidth={5} strokeLinecap="round" />)}</g>}
      {/* sparkles once free */}
      {f > T.rise0 && [0, 1, 2, 3, 4].map((i) => { const p = ((f - T.rise0) / 50 + i / 5) % 1;
        return <Spark key={i} x={SX + [-200, 210, -150, 170, 0][i]} y={sy - 200 + 120 * p - 60 * (i % 2)} s={0.6 * Math.sin(Math.PI * p)} c={["#FFB3C8", "#FFD36E", "#C9B6FF"][i % 3]} />; })}
    </g>
  );
};

export const Q1107: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#FFF1F5", "#E6E4FF"]} audio="q1107.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} ats={[2, T.drop0, T.never, T.choose]} to={WIPE - 6} top={250} size={64}
          lines={[<>the right people give you <Hl c={ROSE}>wings.</Hl></>, <>the wrong ones give you lessons</>, <>your soul never asked for.</>, <span style={{ fontSize: 84 }}>choose <Hl c={ROSE}>truly.</Hl></span>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <Scene f={f} />
    </LFrame>
  );
};
export const BEATS = { ...T, END, WIPE, CARD };
