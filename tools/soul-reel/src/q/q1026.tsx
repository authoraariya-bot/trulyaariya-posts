// 26 Oct · "Don't shrink yourself because someone can't see your worth."
// Minimal line art on a soft dawn beach. An oyster sits closed on the sand. A crab strolls up, peers at it,
// says "meh." and strolls away. Then the Soul walks up, sits beside it and chooses to stay ("i'll stay."); only then
// does the oyster open, and its pearl glows for the one who stayed.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, Spark, LSoul, INK, LW, seg, sm, lerp, rnd, back } from "./line";
import { EndCard } from "../kit/Words";

export const END = 435; const WIPE = 345, CARD = 363;
const T = { cin: 8, cstop: 52, look: 56, meh: 70, cturn: 100, cout: 150, sIn: 120, sStop: 184, sLook: 186, sit: 196, stay: 226, open0: 258, open1: 286, glow: 278, happy: 290 };
const O = { x: 560, y: 1250 }; // oyster hinge-line centre
const ROSE = "#E2507F";

// crab x over time: walks in, pauses, walks back out
const crabX = (f: number) => {
  const inn = sm(seg(f, T.cin, T.cstop)), out = sm(seg(f, T.cturn, T.cout));
  return lerp(-240, 290, inn) - 620 * out;
};
const crabWalking = (f: number) => (f > T.cin && f < T.cstop) || (f > T.cturn && f < T.cout);

const Crab: React.FC<{ f: number }> = ({ f }) => {
  const x = crabX(f), y = O.y + 6;
  const walk = crabWalking(f) ? 1 : 0;
  const ph = f * 0.55;
  const bob = walk * 3 * Math.abs(Math.sin(ph));
  const look = sm(seg(f, T.look, T.look + 14)) * (1 - sm(seg(f, T.cturn - 6, T.cturn + 4)));
  const shrug = Math.sin(Math.PI * seg(f, T.meh, T.meh + 26));
  const dir = f > T.cturn ? -1 : 1; // faces the way it walks
  return (
    <g transform={`translate(${x} ${y - bob}) scale(${dir} 1)`}>
      <ellipse cx={0} cy={6} rx={78} ry={10} fill={INK} opacity={0.08} />
      {/* legs */}
      {[-1, 1].map((side) => [0, 1, 2].map((k) => {
        const a = side * (24 + k * 16) + walk * 10 * Math.sin(ph + k * 1.6 + (side > 0 ? 0 : Math.PI));
        const lx = side * (30 + k * 10);
        return <path key={`${side}${k}`} d={`M${lx},-30 l${side * 26},${-6} l${side * 10},${34}`} stroke={INK} strokeWidth={LW - 1} fill="none" strokeLinecap="round" strokeLinejoin="round" transform={`rotate(${a * 0.25} ${lx} -30)`} />;
      }))}
      {/* body */}
      <path d="M-62,-30 C-62,-74 62,-74 62,-30 C62,-12 40,-4 0,-4 C-40,-4 -62,-12 -62,-30 Z" fill="#FF9C86" stroke={INK} strokeWidth={LW} strokeLinejoin="round" />
      {/* claws */}
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${side * 54} -54) rotate(${side * (28 - 60 * shrug)})`}>
          <path d={`M0,0 L${side * 22},-26`} stroke={INK} strokeWidth={LW - 1} strokeLinecap="round" />
          <path d={`M${side * 22},-26 c${side * -16},-14 ${side * -6},-40 ${side * 12},-36 c${side * 12},2 ${side * 12},16 ${side * 2},18 c${side * 12},-2 ${side * 16},10 ${side * 6},18 c${side * -6},6 ${side * -16},4 ${side * -20},0 Z`} fill="#FF9C86" stroke={INK} strokeWidth={LW - 1} strokeLinejoin="round" />
        </g>
      ))}
      {/* eyes on stalks: lean toward the oyster when it looks */}
      {[-14, 14].map((ex, i) => (
        <g key={i} transform={`rotate(${18 * look} ${ex} -64)`}>
          <path d={`M${ex},-64 L${ex},-92`} stroke={INK} strokeWidth={LW - 1} strokeLinecap="round" />
          <circle cx={ex} cy={-98} r={11} fill="#FFFFFF" stroke={INK} strokeWidth={LW - 2} />
          <circle cx={ex + 3 + 2 * look} cy={-97} r={4.5} fill={INK} />
        </g>
      ))}
      <path d="M-10,-40 Q0,-34 10,-40" stroke={INK} strokeWidth={LW - 2} fill="none" strokeLinecap="round" opacity={1 - shrug} />
      <path d="M-10,-36 L10,-36" stroke={INK} strokeWidth={LW - 2} strokeLinecap="round" opacity={shrug} />
    </g>
  );
};

const Oyster: React.FC<{ f: number }> = ({ f }) => {
  const open = back(seg(f, T.open0, T.open1), 1.2);
  const ang = -36 * open;
  const glow = sm(seg(f, T.glow, T.glow + 30));
  const pulse = 1 + 0.06 * Math.sin((f - T.glow) / 9) * glow;
  return (
    <g transform={`translate(${O.x} ${O.y})`}>
      <ellipse cx={0} cy={58} rx={190} ry={16} fill={INK} opacity={0.08} />
      {/* glow behind */}
      <circle cx={30} cy={-40} r={260 * pulse} fill="#FFF3C4" opacity={0.55 * glow} filter="url(#lb40)" />
      {/* bottom shell */}
      <path d="M-180,0 C-170,44 -90,70 0,70 C100,70 176,44 180,0 Z" fill="#F7E9DE" stroke={INK} strokeWidth={LW} strokeLinejoin="round" />
      {[-110, -55, 0, 55, 110].map((x, i) => <path key={i} d={`M${x * 0.9},8 Q${x},40 ${x * 0.85},62`} stroke={INK} strokeWidth={3} fill="none" opacity={0.35} />)}
      {/* inside: soft pink flesh and the pearl, seen when open */}
      {open > 0.02 && (
        <g opacity={Math.min(1, open * 1.6)}>
          <path d="M-160,0 C-120,-26 120,-26 166,0 Z" fill="#FFC9D6" stroke={INK} strokeWidth={LW - 2} />
          <circle cx={30} cy={-24} r={40 * pulse} fill="#FFFFFF" opacity={0.7 * glow} filter="url(#lb12)" />
          <circle cx={30} cy={-28} r={36} fill="url(#pearl26)" stroke={INK} strokeWidth={LW - 1} />
          <circle cx={18} cy={-40} r={9} fill="#FFFFFF" />
        </g>
      )}
      {/* top shell hinged at the left end */}
      <g transform={`rotate(${ang} -180 0)`}>
        <path d="M-180,0 C-176,-66 -80,-112 20,-104 C116,-96 178,-56 180,0 C120,-12 -120,-12 -180,0 Z" fill="#FBF1E8" stroke={INK} strokeWidth={LW} strokeLinejoin="round" />
        {[-100, -40, 30, 100].map((x, i) => <path key={i} d={`M${x},-10 Q${x + 10},-50 ${x + 4},${-84 + Math.abs(x) * 0.25}`} stroke={INK} strokeWidth={3} fill="none" opacity={0.35} />)}
      </g>
      {/* sparkles */}
      {[[-90, -150, T.glow + 6], [150, -170, T.glow + 16], [40, -230, T.glow + 26], [-170, -90, T.glow + 36]].map(([x, y, a], i) => (
        <Spark key={i} x={x} y={y} s={back(seg(f, a, a + 12), 2) * (0.75 + 0.15 * Math.sin((f - a) / 6))} c="#E8B04A" />
      ))}
    </g>
  );
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30, warm = sm(seg(f, T.open0 - 10, T.open1 + 40));
  return (
    <g>
      <defs>
        <radialGradient id="pearl26" cx="0.38" cy="0.35"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.6" stopColor="#FFF4EC" /><stop offset="1" stopColor="#F1DCE6" /></radialGradient>
        <linearGradient id="sea26" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A9E3E0" /><stop offset="1" stopColor="#CFF0E6" /></linearGradient>
        <linearGradient id="sand26" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE6D2" /><stop offset="1" stopColor="#FFD6C0" /></linearGradient>
      </defs>
      {/* subtle dawn: a soft blurred sun low on the sea, very gentle sea band, sand */}
      <circle cx={760} cy={880} r={170 + 40 * warm} fill="#FFE4B8" opacity={0.65 + 0.3 * warm} filter="url(#lb40)" />
      <rect x={0} y={910} width={1080} height={160} fill="url(#sea26)" opacity={0.8} />
      {Array.from({ length: 7 }, (_, i) => { const y = 932 + i * 20, x = ((i * 190 + t * (10 + i * 3)) % 1300) - 150;
        return <rect key={i} x={x} y={y} width={120 + 60 * rnd(i)} height={3} rx={2} fill="#FFFFFF" opacity={0.6} />; })}
      {/* the gentle foam edge, breathing in and out */}
      <path d={`M0,${1066 + 6 * Math.sin(t)} C270,${1056 + 8 * Math.sin(t + 1)} 540,${1076 + 6 * Math.sin(t + 2)} 810,${1062 + 8 * Math.sin(t + 3)} C900,${1058} 1000,${1066} 1080,${1062 + 6 * Math.sin(t)} L1080,1090 L0,1090 Z`} fill="#FFFFFF" opacity={0.75} />
      <rect x={0} y={1080} width={1080} height={840} fill="url(#sand26)" />
      {/* a few line-art pebbles and a tiny shell, nothing more */}
      <path d="M150,1560 q20,-16 40,0 q-20,10 -40,0 Z" fill="#F4DCCB" stroke={INK} strokeWidth={4} opacity={0.6} />
      <path d="M880,1600 q18,-14 36,0 q-18,9 -36,0 Z" fill="#F4DCCB" stroke={INK} strokeWidth={4} opacity={0.6} />
      <path d="M860,1420 l-14,22 l28,0 Z" fill="#FFD0DC" stroke={INK} strokeWidth={3} opacity={0.6} />
      {/* a gull drifting far away */}
      <path d={`M${200 + t * 12},${760 + 4 * Math.sin(t * 2)} q10,-8 20,0 q10,-8 20,0`} stroke={INK} strokeWidth={3} fill="none" opacity={0.35} />
      <g transform={`translate(540 ${O.y}) scale(1.2) translate(-540 ${-O.y})`}>
      <Oyster f={f} />
      <Crab f={f} />
      {/* the Soul: walks in from the right, looks, sits beside the oyster and stays */}
      {f > T.sIn - 2 && (() => {
        const x = lerp(1240, 820, sm(seg(f, T.sIn, T.sStop)));
        const walk = Math.min(sm(seg(f, T.sIn, T.sIn + 10)), 1 - sm(seg(f, T.sStop - 10, T.sStop)));
        const blink = [212, 300, 330].some((b) => f >= b && f < b + 4);
        return <LSoul x={x} y={O.y + 62} facing={-1} s={0.85} p={{ walk, phase: (1240 - x) / 34, sit: seg(f, T.sit, T.sit + 26), look: sm(seg(f, T.sLook, T.sLook + 10)) * (1 - sm(seg(f, T.happy - 10, T.happy))), happy: seg(f, T.happy, T.happy + 4), glow: sm(seg(f, T.glow, T.glow + 30)), blink }} />;
      })()}
      {f > T.stay && f < T.open0 + 14 && (() => { const p = back(seg(f, T.stay, T.stay + 10), 2), o = 1 - seg(f, T.open0, T.open0 + 14);
        return <g transform={`translate(${800} ${O.y - 250}) scale(${p})`} opacity={o}>
          <path d="M-90,-40 Q-90,-70 -60,-70 L60,-70 Q90,-70 90,-40 L90,-10 Q90,20 60,20 L-10,20 L-30,44 L-28,20 L-60,20 Q-90,20 -90,-10 Z" fill="#FFFFFF" stroke={INK} strokeWidth={LW - 1} strokeLinejoin="round" />
          <text x={0} y={-12} textAnchor="middle" fontFamily="Hand" fontSize={44} fill={INK}>i'll stay.</text>
        </g>; })()}
      {/* "meh." speech bubble */}
      {f > T.meh && f < T.cturn + 6 && (() => { const p = back(seg(f, T.meh, T.meh + 10), 2), o = 1 - seg(f, T.cturn - 4, T.cturn + 6), cx = crabX(f) - 10;
        return <g transform={`translate(${cx} ${O.y - 210}) scale(${p})`} opacity={o}>
          <path d="M-70,-40 Q-70,-70 -40,-70 L40,-70 Q70,-70 70,-40 L70,-10 Q70,20 40,20 L-6,20 L-26,44 L-24,20 L-40,20 Q-70,20 -70,-10 Z" fill="#FFFFFF" stroke={INK} strokeWidth={LW - 1} strokeLinejoin="round" />
          <text x={0} y={-12} textAnchor="middle" fontFamily="Hand" fontSize={46} fill={INK}>meh.</text>
        </g>; })()}
      </g>
    </g>
  );
};

export const Q1026: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#FFF1E6", "#FFD9CC"]} audio="q1026.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} ats={[2, T.meh, T.glow]} to={WIPE - 6} top={330} size={70} lines={[<>don't shrink yourself</>, <>because someone can't see</>, <>your <Hl c={ROSE}>worth.</Hl></>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <Scene f={f} />
    </LFrame>
  );
};
export const BEATS = { ...T, END, WIPE, CARD };
