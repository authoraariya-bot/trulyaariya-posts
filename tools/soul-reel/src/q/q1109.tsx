// 9 Nov · "Every time you let someone mistreat you, you lose a piece of yourself. Don't lose all of you to keep a
// little of them."
// The Soul holds its big puzzle heart. A grey, smirking cloud ("them") says things: "it was just a joke",
// "you're too sensitive", "calm down". Each line zaps the heart and a piece flies off to the cloud, greying, while
// the Soul shrinks into worry. On "don't lose all of you" the Soul looks up, the pieces fly home and click back,
// colour returns, the bubbles pop and the cloud drifts off; the Soul glows, whole.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, LSoul, Spark, INK, LW, seg, sm, lerp, back } from "./line";
import { EndCard } from "../kit/Words";

export const END = 450; const WIPE = 360, CARD = 378;
const HITS = [{ at: 30, t: "it was just a joke", y: 970, p: 1 }, { at: 70, t: "you're too sensitive", y: 880, p: 3 }, { at: 110, t: "calm down.", y: 790, p: 2 }];
const T = { reclaim: 156, back0: 166, gone: 214, keep: 214, happy: 222 };
const G = 1500, SX = 350, SS = 1.7;
const H = { x: SX, y: G - 122, s: 0.78 };
const C = { x: 745, y: 1120 };
const ROSE = "#E2507F", HEART = "#FF8FAE";
const HP = "M0,-60 C-20,-120 -130,-120 -130,-30 C-130,40 -50,90 0,130 C50,90 130,40 130,-30 C130,-120 20,-120 0,-60 Z";
// pieces: 0 TL, 1 TR, 2 BL, 3 BR, each with a knob on one edge
const PIECES = [{ cx: -1, cy: -1, k: [0, -40] }, { cx: 1, cy: -1, k: [40, 0] }, { cx: -1, cy: 1, k: [-40, 0] }, { cx: 1, cy: 1, k: [0, 40] }];

const mixc = (a: string, b: string, t: number) => { const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * Math.min(1, Math.max(0, t)))).join(",")})`; };

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const lost = HITS.map((h) => seg(f, h.at + 6, h.at + 24));
  const home = HITS.map((_, i) => sm(seg(f, T.back0 + i * 10, T.back0 + 18 + i * 10)));
  const nLost = lost.reduce((a, l, i) => a + (l > 0.5 ? 1 - home[i] : 0), 0);
  const sad = Math.min(1, nLost / 2);
  const gone = sm(seg(f, T.gone - 10, T.gone + 24));
  const whole = sm(seg(f, T.back0 + 38, T.back0 + 50));
  const mv = sm(seg(f, T.happy + 6, T.happy + 46)), hx = lerp(H.x, 540, mv), walking = f > T.happy + 6 && f < T.happy + 46 ? 1 : 0;
  const look = sm(seg(f, T.reclaim, T.reclaim + 8)) * (1 - sm(seg(f, T.happy, T.happy + 8)));
  return (
    <g transform="translate(540 1500) scale(1.2) translate(-540 -1500)">
      {/* "them": a grey cloud with a smirk */}
      <g transform={`translate(${C.x + 400 * gone} ${C.y + 6 * Math.sin(t * 1.4)})`} opacity={1 - gone}>
        <path transform="scale(0.8)" d="M-150,60 C-190,20 -160,-40 -100,-34 C-90,-100 0,-110 30,-56 C70,-100 160,-80 150,-10 C200,0 200,70 150,70 Z" fill="#CFCBD6" stroke={INK} strokeWidth={LW} strokeLinejoin="round" />
        <path transform="scale(0.8)" d="M-40,0 l22,4 M30,0 l-22,4" stroke={INK} strokeWidth={5} strokeLinecap="round" />
        <path transform="scale(0.8)" d="M-20,30 q20,12 44,-6" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
      {/* what they say */}
      {HITS.map((h, i) => { const inn = back(seg(f, h.at - 8, h.at + 2), 2); if (inn <= 0.01) return null; const pop = seg(f, T.reclaim + i * 6, T.reclaim + 10 + i * 6);
        const w = h.t.length * 17 + 50;
        return <g key={i} transform={`translate(${C.x - 60} ${h.y}) scale(${inn * (1 + 0.3 * pop)})`} opacity={1 - pop}>
          <rect x={-w / 2} y={-34} width={w} height={64} rx={28} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
          <path d={`M${w / 2 - 70},28 l16,24 l8,-26`} fill="#FFFFFF" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <text x={0} y={10} textAnchor="middle" fontFamily="Hand" fontSize={36} fill={INK}>{h.t}</text>
        </g>; })}
      {/* the zap from each line to the heart */}
      {HITS.map((h, i) => { const z = seg(f, h.at + 2, h.at + 10); if (z <= 0 || z >= 1) return null;
        const x0 = C.x - 200, y0 = h.y + 20, x1 = hx + 60, y1 = H.y;
        return <path key={i} d={`M${x0},${y0} L${lerp(x0, x1, z)},${lerp(y0, y1, z)}`} stroke={ROSE} strokeWidth={6} strokeDasharray="10 12" strokeLinecap="round" fill="none" />; })}
      {/* the Soul */}
      <LSoul x={hx + 4 * Math.sin(f * 1.5) * (sad > 0.6 && f < T.reclaim ? 1 : 0)} y={G} s={SS} p={{ walk: walking, phase: (hx - H.x) / 26, worry: sad, sweat: 0, glance: f < T.reclaim ? 0.7 : 0.4, look: look, happy: f > T.happy ? 1 : 0,
        glow: 0.15 + 0.7 * whole, blink: [96, 150].some((b) => f >= b && f < b + 4) }} />
      {/* the heart, held in front */}
      <g transform={`translate(${hx} ${H.y - (walking ? 4 * Math.abs(Math.sin((hx - H.x) / 26)) : 0)}) scale(${H.s * (1 + 0.04 * whole * Math.sin(t * 3))})`}>
        <circle r={150} fill="#FFD9E2" opacity={0.6 * whole} filter="url(#lb24)" />
        <path d={HP} fill="none" stroke={INK} strokeWidth={4} strokeDasharray="10 12" opacity={0.5} />
        <defs>{PIECES.map((p, i) => <clipPath key={i} id={`pz1109-${i}`}><rect x={p.cx < 0 ? -140 : 0} y={p.cy < 0 ? -140 : 0} width={140} height={150} /></clipPath>)}</defs>
        {PIECES.map((p, i) => {
          const hi = HITS.findIndex((h) => h.p === i); const l = hi >= 0 ? sm(lost[hi]) : 0, back_ = hi >= 0 ? home[hi] : 0;
          const away = l * (1 - back_);
          const tx = (C.x - 100 - H.x + 50 * i) / H.s, ty = (G - 40 - H.y) / H.s;
          const arc = -160 * Math.sin(Math.PI * away);
          const x = lerp(0, tx, away), y = lerp(0, ty, away) + arc;
          const col = mixc(HEART, "#BDB8C6", away > 0.5 ? 1 : away * 2);
          const clickRing = hi >= 0 && f > T.back0 + hi * 10 + 16 && f < T.back0 + hi * 10 + 28;
          return <g key={i} transform={`translate(${x} ${y}) rotate(${200 * away * (i % 2 ? 1 : -1)}) scale(${1 - 0.35 * away})`}>
            <g clipPath={`url(#pz1109-${i})`}><path d={HP} fill={col} stroke={INK} strokeWidth={LW / H.s} /></g>
            <path d={`M${p.cx < 0 ? -130 : 0},0 L${p.cx < 0 ? 0 : 130},0 M0,${p.cy < 0 ? -64 : 0} L0,${p.cy < 0 ? 0 : 130}`} stroke={INK} strokeWidth={4} opacity={0.4} />
            <circle cx={p.cx * 50 + p.k[0]} cy={p.cy * 46 + p.k[1]} r={16} fill={col} stroke={INK} strokeWidth={4} />
            {clickRing && <circle cx={p.cx * 60} cy={p.cy * 50} r={20 + 40 * seg(f, T.back0 + hi * 10 + 16, T.back0 + hi * 10 + 28)} fill="none" stroke="#FFFFFF" strokeWidth={6} opacity={1 - seg(f, T.back0 + hi * 10 + 16, T.back0 + hi * 10 + 28)} />}
          </g>;
        })}
      </g>
      {f > T.happy && [0, 1, 2, 3].map((i) => { const p = ((f - T.happy) / 50 + i / 4) % 1;
        return <Spark key={i} x={hx + [-170, 180, -120, 140][i]} y={H.y - 140 - 120 * p} s={0.55 * Math.sin(Math.PI * p)} c={["#FF8FAE", "#FFD36E"][i % 2]} />; })}
    </g>
  );
};

export const Q1109: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#FFF0F3", "#F3E6FF"]} audio="q1109.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} ats={[2, HITS[0].at + 14, T.reclaim, T.keep]} to={WIPE - 6} top={230} size={58}
          lines={[<>every time you let someone mistreat you,</>, <>you lose a piece of yourself.</>, <span style={{ fontSize: 76 }}>don't lose <Hl c={ROSE}>all of you</Hl></span>, <>to keep a little of them.</>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <Scene f={f} />
    </LFrame>
  );
};
export const BEATS = { ...HITS, ...T, END, WIPE, CARD };
