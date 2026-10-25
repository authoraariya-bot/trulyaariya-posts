// 2 Nov · "A tree stands only as long as its roots are strong. Your roots are your soul. Heal them first."
// A diorama: a sapling above the ground, its roots visible in the soil below. The Soul waters the leaves; nothing
// changes, the sapling droops further and the Soul is puzzled. The thin grey roots wrap a faint heart. The Soul tips
// the can at the base instead; water seeps down, the roots turn gold, light climbs the trunk, and the tree stands up
// and blossoms.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, LSoul, Spark, INK, LW, seg, sm, lerp, back, rnd } from "./line";
import { EndCard } from "../kit/Words";

export const END = 450; const WIPE = 360, CARD = 378;
const T = { leaves0: 16, leaves1: 96, puzzle: 104, look: 128, base0: 150, seep0: 162, seep1: 214, gold0: 206, gold1: 246, up: 238, bloom: 262, happy: 274 };
const G = 1240; // ground
const TR = { x: 600 };
const S = { x: 300, s: 1.45 };
const ROSE = "#E2507F";

// roots (deterministic)
type R = { d: string; depth: number };
const ROOTS: R[] = (() => {
  const out: R[] = []; let k = 0;
  const grow = (x: number, y: number, a: number, len: number, depth: number) => {
    if (depth > 3 || len < 30) return;
    const r = (n: number) => rnd(k * 9 + n);
    const a2 = a + (r(1) - 0.5) * 0.5, x2 = x + Math.sin(a2) * len, y2 = y + Math.cos(a2) * len;
    out.push({ d: `M${x},${y} Q${(x + x2) / 2 + (r(2) - 0.5) * 40},${(y + y2) / 2} ${x2},${y2}`, depth }); k++;
    [-0.5, 0.5].forEach((da) => grow(x2, y2, a2 + da, len * 0.68, depth + 1));
  };
  [-1.0, -0.35, 0.35, 1.0].forEach((a) => grow(TR.x, G + 6, a, 120, 0));
  return out;
})();

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const droop = sm(seg(f, 0, T.leaves1)) * (1 - sm(seg(f, T.up, T.up + 30)));
  const gold = sm(seg(f, T.gold0, T.gold1));
  const climb = sm(seg(f, T.gold1 - 10, T.up + 10));
  const bloom = back(seg(f, T.bloom, T.bloom + 24), 1.4);
  const toBase = sm(seg(f, T.base0 - 16, T.base0));
  const pouringLeaves = f > T.leaves0 && f < T.leaves1, pouringBase = f > T.base0 && f < T.seep1;
  const lean = 26 * droop;
  const trunkTop = { x: TR.x + Math.sin((lean * Math.PI) / 180) * 210, y: G - Math.cos((lean * Math.PI) / 180) * 210 };
  // the Soul's hand (raised for the leaves, lowered for the base)
  const wave = -0.8 * (1 - toBase);
  const ang = 24 - 140 * wave, base = { x: 52, y: -94 };
  const hand = { x: S.x + (base.x + Math.sin((ang * Math.PI) / 180) * 34) * S.s, y: G + (base.y + Math.cos((ang * Math.PI) / 180) * 34) * S.s };
  const tilt = (pouringLeaves || pouringBase ? 34 : 0) + 30 * toBase;
  const spout = { x: hand.x + 70 + 20 * toBase, y: hand.y - 30 + 50 * toBase };
  const heartPulse = 0.5 + 0.5 * Math.sin(f / 7);
  const remind = sm(seg(f, T.look, T.look + 14));
  return (
    <g>
      {/* soft sky glow + ground + soil cross-section */}
      <circle cx={780} cy={820} r={240} fill="#FFE9C2" opacity={0.3 + 0.5 * gold} filter="url(#lb40)" />
      <rect x={0} y={G} width={1080} height={700} fill="#F2D9C8" />
      <path d={`M0,${G} C300,${G - 8} 780,${G + 8} 1080,${G}`} stroke={INK} strokeWidth={LW - 1} fill="none" />
      {[0, 1, 2].map((i) => <path key={i} d={`M0,${G + 130 + i * 120} C300,${G + 120 + i * 120} 760,${G + 140 + i * 120} 1080,${G + 128 + i * 120}`} stroke={INK} strokeWidth={3} fill="none" opacity={0.12} />)}
      {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx={60 + rnd(i) * 960} cy={G + 60 + rnd(i + 2) * 420} rx={10 + 10 * rnd(i + 3)} ry={6} fill={INK} opacity={0.06} />)}
      {/* roots: thin grey → golden */}
      {ROOTS.map((r, i) => <path key={i} d={r.d} stroke={INK} strokeWidth={Math.max(3, 9 - r.depth * 2) + 2} fill="none" strokeLinecap="round" />)}
      {ROOTS.map((r, i) => <path key={`f${i}`} d={r.d} stroke="#D9D2DC" strokeWidth={Math.max(1, 7 - r.depth * 2)} fill="none" strokeLinecap="round" />)}
      {gold > 0 && ROOTS.map((r, i) => { const p = sm(seg(gold, (3 - r.depth) * 0.15, (3 - r.depth) * 0.15 + 0.5));
        return <path key={`g${i}`} d={r.d} stroke="#FFC94A" strokeWidth={Math.max(2, 7 - r.depth * 2)} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />; })}
      {/* the heart the roots hold: faint, then glowing */}
      <g transform={`translate(${TR.x} ${G + 210}) scale(${1 + 0.08 * remind * heartPulse * (1 - gold) + 0.15 * gold})`}>
        <circle r={70} fill="#FFD27A" opacity={0.6 * gold} filter="url(#lb24)" />
        <path d="M0,-12 C8,-36 46,-34 40,-6 C36,14 12,28 0,36 C-12,28 -36,14 -40,-6 C-46,-34 -8,-36 0,-12 Z" fill={gold > 0.3 ? "#FF9DB0" : "#EADDE6"} stroke={INK} strokeWidth={4} opacity={0.6 + 0.4 * Math.max(remind, gold)} />
      </g>
      {/* water seeping down through the soil */}
      {f > T.seep0 && f < T.seep1 + 20 && Array.from({ length: 10 }, (_, i) => { const p = ((f - T.seep0) / 40 + i / 10) % 1;
        return <path key={i} d="M0,-8 C5,0 6,5 0,9 C-6,5 -5,0 0,-8 Z" transform={`translate(${TR.x - 50 + (i % 5) * 25} ${G + 10 + p * 200})`} fill="#8FCBEF" stroke={INK} strokeWidth={2} opacity={(1 - p) * (1 - seg(f, T.seep1, T.seep1 + 20))} />; })}
      {/* the tree */}
      <g>
        <path d={`M${TR.x - 14},${G + 4} Q${TR.x - 8},${G - 100} ${trunkTop.x - 6},${trunkTop.y} L${trunkTop.x + 6},${trunkTop.y} Q${TR.x + 8},${G - 100} ${TR.x + 14},${G + 4} Z`} fill="#C9A385" stroke={INK} strokeWidth={LW - 1} strokeLinejoin="round" />
        {climb > 0 && <path d={`M${TR.x},${G} Q${TR.x},${G - 100} ${trunkTop.x},${trunkTop.y}`} stroke="#FFC94A" strokeWidth={6} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - climb} />}
        {/* crown: drooping pale leaves → full green with blossoms */}
        {Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2, r0 = 70 + 20 * rnd(i);
          const x = trunkTop.x + Math.cos(a) * r0 * 1.2, y = trunkTop.y - 60 + Math.sin(a) * r0 * 0.8 + 50 * droop;
          return <circle key={i} cx={x} cy={y} r={(46 + 10 * rnd(i + 3)) * lerp(0.8, 1.1, 1 - droop)} fill={droop > 0.5 ? "#C9D3A8" : gold > 0.6 ? "#8FD69A" : "#B9D3A0"} stroke={INK} strokeWidth={LW - 1} />; })}
        <circle cx={trunkTop.x} cy={trunkTop.y - 60 + 50 * droop} r={60} fill={droop > 0.5 ? "#C9D3A8" : gold > 0.6 ? "#8FD69A" : "#B9D3A0"} />
        {bloom > 0 && Array.from({ length: 9 }, (_, i) => { const a = (i / 9) * Math.PI * 2 + 0.3, r0 = 55 + 40 * rnd(i + 20);
          return <g key={`b${i}`} transform={`translate(${trunkTop.x + Math.cos(a) * r0 * 1.2} ${trunkTop.y - 60 + Math.sin(a) * r0 * 0.8}) scale(${bloom * (0.8 + 0.3 * rnd(i))})`}>
            {Array.from({ length: 5 }, (_, k) => <ellipse key={k} cx={0} cy={-10} rx={7} ry={11} fill="#FFB7CF" stroke={INK} strokeWidth={2} transform={`rotate(${k * 72})`} />)}<circle r={4} fill="#FFE38A" />
          </g>; })}
        {/* a leaf falling while it droops */}
        {f > 40 && f < 120 && <ellipse cx={trunkTop.x + 80 + 20 * Math.sin(f / 8)} cy={trunkTop.y - 20 + (f - 40) * 2.4} rx={14} ry={8} fill="#C9D3A8" stroke={INK} strokeWidth={3} transform={`rotate(${f * 3} ${trunkTop.x + 80} ${trunkTop.y - 20 + (f - 40) * 2.4})`} />}
      </g>
      {/* water from the can onto the leaves (does nothing) or onto the base (reaches the roots) */}
      {(pouringLeaves || pouringBase) && Array.from({ length: 8 }, (_, i) => { const p = ((f / 10) + i / 8) % 1;
        const tx = pouringLeaves ? trunkTop.x - 80 : TR.x - 30, ty = pouringLeaves ? trunkTop.y - 40 + 50 * droop : G - 6;
        const x = lerp(spout.x, tx, p) + 6 * Math.sin(i), y = lerp(spout.y, ty, p) - 50 * Math.sin(Math.PI * p) * (pouringLeaves ? 1 : 0.3);
        return <path key={i} d="M0,-7 C4,0 5,4 0,7 C-5,4 -4,0 0,-7 Z" transform={`translate(${x} ${y}) scale(1.4)`} fill="#8FCBEF" stroke={INK} strokeWidth={2} />; })}
      {/* the Soul + watering can */}
      <LSoul x={S.x} y={G} s={S.s} p={{ wave, worry: sm(seg(f, T.puzzle - 10, T.puzzle + 6)) * (1 - sm(seg(f, T.base0, T.base0 + 10))) * 0.8, look: remind * (1 - sm(seg(f, T.gold1, T.gold1 + 10))),
        glance: 0.6, happy: f > T.happy ? 1 : 0, glow: 0.2 + 0.7 * gold, blink: [70, 310].some((b) => f >= b && f < b + 4) }} />
      <g transform={`translate(${hand.x + 10} ${hand.y - 14}) rotate(${tilt})`}>
        <path d="M-34,-30 L30,-30 L36,24 L-40,24 Z" fill="#9EE6CF" stroke={INK} strokeWidth={LW - 1} strokeLinejoin="round" />
        <path d="M30,-10 L86,-40" stroke={INK} strokeWidth={10} strokeLinecap="round" /><path d="M30,-10 L86,-40" stroke="#9EE6CF" strokeWidth={5} strokeLinecap="round" />
        <path d="M-34,-24 C-62,-24 -62,14 -38,14" stroke={INK} strokeWidth={6} fill="none" />
      </g>
      {/* "?" while puzzled */}
      {f > T.puzzle && f < T.base0 && <text x={S.x + 60} y={G - 330} fontFamily="Hand" fontSize={72} fill={INK} opacity={Math.min(1, seg(f, T.puzzle, T.puzzle + 8)) * (1 - seg(f, T.base0 - 10, T.base0))}>?</text>}
      {[[TR.x - 160, G - 380, 0], [TR.x + 170, G - 400, 8], [TR.x, G - 470, 14]].map(([x, y, d], i) => <Spark key={i} x={x} y={y} s={back(seg(f, T.bloom + d, T.bloom + d + 12), 2) * (0.8 + 0.2 * Math.sin(f / 6 + i))} c="#E8B04A" />)}
    </g>
  );
};

export const Q1102: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#F3FAF1", "#E3F1E4"]} audio="q1102.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} ats={[2, 2, T.look, T.gold1 + 4]} to={WIPE - 6} top={270} size={62} lines={[<>a tree stands only as long as</>, <>its roots are strong.</>, <>your roots are your soul.</>, <span style={{ fontSize: 80 }}><Hl c={ROSE}>heal them first.</Hl></span>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <Scene f={f} />
    </LFrame>
  );
};
export const BEATS = { ...T, END, WIPE, CARD };
