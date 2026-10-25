// 3 Nov · "Everyone says: rest when you're done. Done with the emails, the chores, everyone else's needs.
// Nobody says: you're never 'done.' So rest before you're empty."
// A big battery stands beside the Soul. Each task (an envelope, a laundry basket, chat bubbles) lands on the battery
// and drains it while the Soul grows tired, down to a blinking 1%; then more tasks keep coming. Rewind to 30%: the
// Soul sits down with a blanket and tea, plugs the battery in and rests while it refills.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, LSoul, INK, LW, seg, sm, lerp, back, rnd } from "./line";
import { EndCard } from "../kit/Words";

export const END = 450; const WIPE = 360, CARD = 378;
const TASKS = [{ at: 40, k: "mail" }, { at: 72, k: "basket" }, { at: 104, k: "chat" }];
const T = { never: 146, more0: 150, rew0: 204, rew1: 222, sit: 226, plug: 240, empty: 262, happy: 270 };
const G = 1500, SX = 380, BX = 740;
const ROSE = "#E2507F";

const levelAt = (f: number) => {
  let l = 1;
  TASKS.forEach((t, i) => { l -= [0.3, 0.3, 0.38][i] * sm(seg(f, t.at + 14, t.at + 26)); });
  l = Math.max(0.01, l);
  l = lerp(l, 0.3, sm(seg(f, T.rew0, T.rew1)));
  return lerp(l, 1, sm(seg(f, T.plug + 8, T.plug + 90)));
};

const Icon: React.FC<{ k: string; s?: number }> = ({ k, s = 1 }) => (
  <g transform={`scale(${s})`}>
    {k === "mail" && <g><rect x={-46} y={-32} width={92} height={64} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={LW - 1} /><path d="M-46,-30 L0,6 L46,-30" stroke={INK} strokeWidth={LW - 1} fill="none" strokeLinejoin="round" /></g>}
    {k === "basket" && <g><path d="M-50,-14 L50,-14 L40,34 L-40,34 Z" fill="#F4D7A8" stroke={INK} strokeWidth={LW - 1} strokeLinejoin="round" /><path d="M-30,-14 C-30,-50 30,-50 30,-14" stroke={INK} strokeWidth={LW - 1} fill="none" /><path d="M-36,-14 q16,-22 34,-6 q14,-16 32,4" fill="#C9E6FF" stroke={INK} strokeWidth={4} /></g>}
    {k === "chat" && <g><rect x={-54} y={-38} width={74} height={50} rx={18} fill="#FFE1EC" stroke={INK} strokeWidth={LW - 1} /><rect x={-10} y={-8} width={70} height={48} rx={18} fill="#E8F5FF" stroke={INK} strokeWidth={LW - 1} /><circle cx={10} cy={16} r={4} fill={INK} /><circle cx={26} cy={16} r={4} fill={INK} /><circle cx={42} cy={16} r={4} fill={INK} /></g>}
  </g>
);

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const lvl = levelAt(f);
  const low = lvl < 0.08 && f < T.rew0;
  const blink = low ? (Math.sin(f / 3) > 0 ? 1 : 0.3) : 1;
  const col = lvl > 0.55 ? "#7FE0C2" : lvl > 0.25 ? "#FFD36E" : "#FF7A8C";
  const tired = sm(seg(f, TASKS[1].at + 14, TASKS[2].at + 26)) * (1 - sm(seg(f, T.rew0, T.rew1)));
  const rew = Math.sin(Math.PI * seg(f, T.rew0, T.rew1));
  const sitting = sm(seg(f, T.sit, T.sit + 20));
  const plug = sm(seg(f, T.plug, T.plug + 12));
  const charging = f > T.plug + 8;
  const BH = 330, BW = 170;
  return (
    <g>
      {/* soft room: window glow + floor */}
      <rect x={120} y={640} width={300} height={360} rx={24} fill="#FFFFFF" opacity={0.45} stroke={INK} strokeWidth={4} strokeOpacity={0.25} />
      <line x1={270} x2={270} y1={640} y2={1000} stroke={INK} strokeWidth={3} opacity={0.2} />
      <circle cx={300} cy={820} r={200} fill="#FFE9C2" opacity={0.25 + 0.4 * sitting} filter="url(#lb40)" />
      <path d={`M0,${G} C300,${G - 8} 780,${G + 8} 1080,${G}`} stroke={INK} strokeWidth={4} fill="none" opacity={0.45} />
      <rect x={0} y={G} width={1080} height={420} fill="#FFFFFF" opacity={0.2} />
      {/* wall socket + cable */}
      <rect x={900} y={1380} width={70} height={90} rx={14} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
      <circle cx={924} cy={1424} r={6} fill={INK} /><circle cx={946} cy={1424} r={6} fill={INK} />
      {plug > 0 && <path d={`M935,1440 C935,${G + 40} ${lerp(900, BX + BW / 2 + 20, plug)},${G + 30} ${lerp(900, BX + BW / 2 + 6, plug)},${G - 120}`} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />}
      {/* the battery */}
      <g transform={`translate(${BX + 4 * rew * Math.sin(f * 3)} ${G})`}>
        <ellipse cx={0} cy={6} rx={BW * 0.7} ry={10} fill={INK} opacity={0.08} />
        <rect x={-BW / 2} y={-BH} width={BW} height={BH} rx={30} fill="#FFFFFF" stroke={INK} strokeWidth={LW} />
        <rect x={-30} y={-BH - 26} width={60} height={30} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={LW} />
        <rect x={-BW / 2 + 14} y={-14 - (BH - 28) * lvl} width={BW - 28} height={(BH - 28) * lvl} rx={18} fill={col} opacity={blink} />
        <text x={0} y={-BH / 2 + 16} textAnchor="middle" fontFamily="Hand" fontSize={58} fill={INK}>{`${Math.max(1, Math.round(lvl * 100))}%`}</text>
        {charging && <path d="M0,-34 L-18,6 L-2,6 L-10,36 L20,-8 L4,-8 L12,-34 Z" transform={`translate(${BW / 2 + 40} ${-BH + 40}) scale(${back(seg(f, T.plug + 8, T.plug + 18), 2)})`} fill="#FFD36E" stroke={INK} strokeWidth={4} strokeLinejoin="round" />}
      </g>
      {/* the tasks: fly in, land on the battery and drain it; then more keep coming until the rewind */}
      {TASKS.map((tk, i) => {
        const p = seg(f, tk.at, tk.at + 16), r = sm(seg(f, T.rew0, T.rew1)); if (p <= 0) return null;
        const x = lerp(i % 2 ? 1180 : -120, BX - 10 + (i - 1) * 40, sm(p)), y = lerp(700, G - BH - 70 - i * 64, sm(p)) - 40 * Math.sin(Math.PI * p);
        const ry = lerp(y, -300, r);
        return <g key={i} transform={`translate(${x} ${ry}) rotate(${(i - 1) * 8})`} opacity={1 - r}><Icon k={tk.k} /></g>;
      })}
      {f > T.more0 && f < T.rew1 && Array.from({ length: 10 }, (_, i) => {
        const a = T.more0 + i * 5, p = seg(f, a, a + 14), r = sm(seg(f, T.rew0, T.rew1)); if (p <= 0) return null;
        const x = lerp(rnd(i) > 0.5 ? 1160 : -80, BX - 150 + 300 * rnd(i + 3), sm(p)), y = lerp(760, G - BH - 70 - 26 * (i % 6), sm(p)) - 30 * Math.sin(Math.PI * p);
        return <g key={`m${i}`} transform={`translate(${x} ${lerp(y, -300, r)}) rotate(${-14 + 28 * rnd(i + 5)})`} opacity={1 - r}><Icon k={["mail", "basket", "chat"][i % 3]} s={0.8} /></g>;
      })}
      {/* rewind marks */}
      {rew > 0.05 && <g opacity={rew}><text x={560} y={960} textAnchor="middle" fontFamily="Hand" fontSize={90} fill={INK}>◀◀</text></g>}
      {/* the Soul: fine → tired → sitting, resting */}
      <LSoul x={SX} y={G} s={1.6} p={{ sit: sitting, worry: tired, sweat: tired * seg(f, TASKS[2].at, T.never + 20), glance: tired > 0.2 && f < T.rew0 ? 0.6 * Math.sign(Math.sin(f / 5)) : 0.5,
        blink: (f > T.happy) || [24, 60].some((b) => f >= b && f < b + 4), happy: 0, glow: 0.2 + 0.6 * sm(seg(f, T.plug + 8, T.plug + 60)) }} />
      {/* blanket + tea once it sits */}
      {sitting > 0.5 && <g opacity={sm(seg(f, T.sit + 10, T.sit + 22))}>
        <path d={`M${SX - 125},${G - 60} C${SX - 60},${G - 96} ${SX + 60},${G - 96} ${SX + 125},${G - 60} L${SX + 132},${G + 6} L${SX - 132},${G + 6} Z`} fill="#C9B6FF" stroke={INK} strokeWidth={LW} strokeLinejoin="round" />
        {[-70, -30, 10, 50, 90].map((dx, i) => <path key={i} d={`M${SX + dx},${G - 88 + Math.abs(dx) * 0.2} L${SX + dx + 6},${G}`} stroke="#A98CF0" strokeWidth={4} />)}
        <g transform={`translate(${SX + 190} ${G})`}><path d="M-30,-60 L30,-60 L26,0 L-26,0 Z" fill="#FFFFFF" stroke={INK} strokeWidth={LW - 1} /><path d="M30,-46 C54,-46 54,-16 28,-16" stroke={INK} strokeWidth={LW - 1} fill="none" />
          {[0, 1].map((k) => <path key={k} d={`M${-8 + 16 * k},-72 c-8,-14 8,-22 0,-38`} stroke={INK} strokeWidth={3} fill="none" opacity={0.4 + 0.3 * Math.sin(f / 8 + k)} />)}</g>
      </g>}
      {f > T.happy && <path d="M0,0 q10,-10 20,0" transform={`translate(${SX - 10} ${G - 4 - 166 * 1.6 + 70})`} stroke={INK} strokeWidth={0} fill="none" />}
      {/* "z" while resting */}
      {f > T.happy + 10 && [0, 1, 2].map((i) => { const p = ((f - T.happy - 10) / 40 + i / 3) % 1;
        return <text key={i} x={SX + 90 + 40 * p + 16 * i} y={G - 330 - 120 * p} fontFamily="Hand" fontSize={44 + 10 * i} fill={INK} opacity={Math.sin(Math.PI * p) * 0.7}>z</text>; })}
    </g>
  );
};

export const Q1103: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#F7F4FF", "#E9E4FA"]} audio="q1103.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} ats={[2, TASKS[0].at, TASKS[2].at, T.never, T.empty]} to={WIPE - 6} top={230} size={56}
          lines={[<>everyone says: rest when you're done.</>, <>done with the emails, the chores,</>, <>everyone else's needs.</>, <>nobody says: you're never “done.”</>, <span style={{ fontSize: 72 }}>so rest before you're <Hl c={ROSE}>empty.</Hl></span>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <Scene f={f} />
    </LFrame>
  );
};
export const BEATS = { ...T, END, WIPE, CARD };
