// 10 Nov · "Some understand you in a moment. For others, a lifetime isn't enough."
// The Soul wears a little heart padlock on its chest. A golden key floats in, slides in and turns: click, the lock
// opens at once and the heart glows pink. It closes again. Then a big jangling keyring tries key after key while an
// hourglass flips over and over: each one jiggles, fails, and the Soul grows weary. It turns away; the golden key
// returns, one click, and the heart opens and glows again while the keyring droops off.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, LSoul, Spark, INK, LW, seg, sm, lerp } from "./line";
import { EndCard } from "../kit/Words";

export const END = 450; const WIPE = 360, CARD = 378;
const TRIES = [104, 128, 152, 176];
const T = { g1: 14, click1: 40, close: 80, ring0: 92, turn: 198, g2: 204, click2: 228, happy: 236 };
const G = 1500, SX = 540, SS = 1.9;
const L = { x: SX, y: G - 118 };
const ROSE = "#E2507F", GOLD = "#F2B33D";
const HP = "M0,-60 C-20,-120 -130,-120 -130,-30 C-130,40 -50,90 0,130 C50,90 130,40 130,-30 C130,-120 20,-120 0,-60 Z";

const mixc = (a: string, b: string, t: number) => { const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * Math.min(1, Math.max(0, t)))).join(",")})`; };

// a key whose tip is at the origin, pointing toward -x * dir (dir 1: bow to the right)
const Key: React.FC<{ c: string; dir: number; s?: number }> = ({ c, dir, s = 1 }) => (
  <g transform={`scale(${dir * s} ${s})`}>
    <path d="M0,-8 L110,-8 L110,8 L40,8 L40,22 L28,22 L28,8 L16,8 L16,18 L6,18 L6,8 L0,8 Z" fill={c} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={142} cy={0} r={34} fill={c} stroke={INK} strokeWidth={4.5} /><circle cx={142} cy={0} r={13} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
  </g>
);

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const open1 = sm(seg(f, T.click1, T.click1 + 6)) * (1 - sm(seg(f, T.close, T.close + 10)));
  const open2 = sm(seg(f, T.click2, T.click2 + 6));
  const open = Math.max(open1, open2);
  const tryIdx = TRIES.findIndex((a) => f >= a && f < a + 24);
  const weary = sm(seg(f, TRIES[1], TRIES[3] + 10)) * (1 - sm(seg(f, T.turn, T.turn + 16)));
  const ringOut = sm(seg(f, T.click2 + 4, T.click2 + 40));
  const ringIn = sm(seg(f, T.ring0 - 12, T.ring0 + 6));
  const RX = lerp(1250, 860, ringIn) + 500 * ringOut, RY = 1120 + 140 * ringOut;
  // golden key path: in from the left, into the keyhole, turn, back out
  const goldAt = (g: number, click: number) => {
    const inP = sm(seg(f, g, click - 8)), turn = sm(seg(f, click - 6, click)), out = sm(seg(f, click + 30, click + 48));
    return { x: lerp(-200, L.x - 4, inP) - 260 * out, y: lerp(L.y - 300, L.y + 30, inP) - 200 * out, r: 90 * turn * (1 - out), o: 1 - out };
  };
  const gk = f < T.close + 30 ? goldAt(T.g1, T.click1) : goldAt(T.g2, T.click2);
  const showGold = (f >= T.g1 && f < T.close + 40) || f >= T.g2;
  return (
    <g>
      {/* soft floor + room glow */}
      <circle cx={SX} cy={L.y} r={360} fill="#FFD9E2" opacity={0.5 * open} filter="url(#lb40)" />
      <path d={`M0,${G} C300,${G - 6} 780,${G + 6} 1080,${G}`} stroke={INK} strokeWidth={4} fill="none" opacity={0.45} />
      <rect x={0} y={G} width={1080} height={420} fill="#FFFFFF" opacity={0.22} />
      {/* the hourglass: flips with every failed key */}
      {f > T.ring0 - 6 && f < T.turn + 20 && (() => { const flips = TRIES.reduce((a, s) => a + sm(seg(f, s + 16, s + 24)), 0); const op = sm(seg(f, T.ring0 - 6, T.ring0 + 6)) * (1 - sm(seg(f, T.turn, T.turn + 20)));
        return <g transform={`translate(860 880) rotate(${180 * flips})`} opacity={op}>
          <rect x={-56} y={-96} width={112} height={16} rx={6} fill="#E7C3A2" stroke={INK} strokeWidth={4} /><rect x={-56} y={80} width={112} height={16} rx={6} fill="#E7C3A2" stroke={INK} strokeWidth={4} />
          <path d="M-44,-80 C-44,-20 -8,-14 -8,0 C-8,14 -44,20 -44,80 L44,80 C44,20 8,14 8,0 C8,-14 44,-20 44,-80 Z" fill="#FFFFFF" fillOpacity={0.7} stroke={INK} strokeWidth={4} />
          <path d={`M-30,${80 - 40 * ((f % 24) / 24)} L30,${80 - 40 * ((f % 24) / 24)} L36,76 L-36,76 Z`} fill="#FFD36E" />
        </g>; })()}
      {/* the Soul */}
      <LSoul x={SX} y={G} s={SS} p={{ worry: weary, sweat: weary * seg(f, TRIES[2], T.turn), glance: f > T.ring0 && f < T.turn ? 0.7 : f >= T.turn ? -0.7 : 0, look: 0,
        happy: (f > T.click1 + 4 && f < T.close) || f > T.happy ? 1 : 0, glow: 0.15 + 0.7 * open, blink: [94, 200].some((b) => f >= b && f < b + 4) }} />
      {/* the heart padlock on its chest */}
      <g transform={`translate(${L.x + (tryIdx >= 0 && f - TRIES[tryIdx] > 8 && f - TRIES[tryIdx] < 18 ? 4 * Math.sin(f * 3) : 0)} ${L.y})`}>
        <path d={`M-34,-50 L-34,${-72 - 14 * open} C-34,${-104 - 14 * open} 34,${-104 - 14 * open} 34,${-72 - 14 * open} L34,${-50 - 20 * open}`} transform={`rotate(${-18 * open} -34 -50)`} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
        <path d={`M-34,-50 L-34,${-72 - 14 * open} C-34,${-104 - 14 * open} 34,${-104 - 14 * open} 34,${-72 - 14 * open} L34,${-50 - 20 * open}`} transform={`rotate(${-18 * open} -34 -50)`} stroke="#D9D4DF" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d={HP} transform="scale(0.62)" fill={mixc("#D9D4DF", "#FF8FAE", open)} stroke={INK} strokeWidth={LW / 0.62} />
        <g opacity={1 - open}><circle cx={0} cy={0} r={11} fill={INK} /><path d="M-6,4 L6,4 L4,26 L-4,26 Z" fill={INK} /></g>
        {open > 0.5 && <path d="M-18,0 q18,18 36,0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" opacity={open} />}
      </g>
      {/* click rings */}
      {[T.click1, T.click2].map((c, i) => f > c && f < c + 16 && <circle key={i} cx={L.x} cy={L.y} r={40 + 120 * seg(f, c, c + 16)} fill="none" stroke={GOLD} strokeWidth={6} opacity={1 - seg(f, c, c + 16)} />)}
      {/* the golden key */}
      {showGold && <g transform={`translate(${gk.x} ${gk.y}) scale(1 ${Math.cos((gk.r / 90) * Math.PI)})`} opacity={gk.o}>
        <circle cx={-140} cy={0} r={60} fill="#FFE59A" opacity={0.5} filter="url(#lb12)" />
        <Key c={GOLD} dir={-1} />
      </g>}
      {/* the keyring and the key that's trying */}
      {f > T.ring0 - 12 && <g opacity={1 - sm(seg(f, T.click2 + 24, T.click2 + 40))}>
        <g transform={`translate(${RX} ${RY}) rotate(${6 * Math.sin(t * 5)})`}>
          {[-60, -35, -10, 15, 40, 65].map((a, i) => <g key={i} transform={`rotate(${a + 90}) translate(56 0)`}><Key c={["#BFC6D6", "#C9B6A6", "#B6C9B9", "#D6BFC9", "#C6C0D9", "#D0CDB6"][i]} dir={1} s={0.5} /></g>)}
          <circle r={56} fill="none" stroke={INK} strokeWidth={8} />
        </g>
        {tryIdx >= 0 && (() => { const a = TRIES[tryIdx], p = seg(f, a, a + 8), back_ = seg(f, a + 18, a + 24);
          const x = lerp(RX - 40, L.x + 6, sm(p) * (1 - sm(back_))), y = lerp(RY + 40, L.y + 30, sm(p) * (1 - sm(back_)));
          const jig = f > a + 8 && f < a + 18 ? 14 * Math.sin(f * 2.4) : 0;
          return <g><g transform={`translate(${x} ${y}) rotate(${jig})`}><Key c={["#BFC6D6", "#C9B6A6", "#B6C9B9", "#D6BFC9"][tryIdx]} dir={1} /></g>
            {f > a + 12 && f < a + 22 && <g transform={`translate(${L.x + 120} ${L.y - 150})`} opacity={Math.sin(Math.PI * seg(f, a + 12, a + 22))}><path d="M-18,-18 L18,18 M18,-18 L-18,18" stroke={ROSE} strokeWidth={9} strokeLinecap="round" /></g>}</g>; })()}
      </g>}
      {open > 0.6 && [0, 1, 2, 3].map((i) => { const p = ((f - T.click1) / 40 + i / 4) % 1;
        return <Spark key={i} x={L.x + [-210, 220, -160, 170][i]} y={L.y - 160 - 140 * p} s={0.55 * Math.sin(Math.PI * p) * open} c={[GOLD, "#FF8FAE"][i % 2]} />; })}
    </g>
  );
};

export const Q1110: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#FFF7E8", "#FFE6EE"]} audio="q1110.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} ats={[6, TRIES[0] - 6, TRIES[2] + 4]} to={WIPE - 6} top={260} size={68}
          lines={[<>some understand you <Hl c={GOLD}>in a moment.</Hl></>, <>for others,</>, <>a lifetime isn't enough.</>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <Scene f={f} />
    </LFrame>
  );
};
export const BEATS = { ...T, END, WIPE, CARD };
