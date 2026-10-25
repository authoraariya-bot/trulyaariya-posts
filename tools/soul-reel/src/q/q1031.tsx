// 31 Oct · "POV: you finally chose yourself and felt guilty about it. That guilt isn't a sign you did wrong.
// It's a sign you're growing."
// "plans tonight?" pops up; the Soul answers "not tonight. choosing me." and wraps itself in a cosy blanket cocoon.
// A small grey guilt cloud appears; the Soul looks worried and the cocoon trembles. The cocoon cracks with light,
// splits, and the Soul emerges with soft butterfly wings, fluttering up, happy.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, LSoul, Spark, INK, LW, seg, sm, lerp, back, rnd } from "./line";
import { EndCard } from "../kit/Words";

export const END = 450; const WIPE = 360, CARD = 378;
const T = { notif: 10, reply: 42, wrap0: 92, wrap1: 124, guilt: 136, crack: 214, burst: 252, wings: 258, rise: 280, happy: 268 };
const S = { x: 540, y: 1470, s: 1.75 };
const LILAC = "#9B7BE0";

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const wrap = sm(seg(f, T.wrap0, T.wrap1));
  const guilt = sm(seg(f, T.guilt, T.guilt + 20)) * (1 - sm(seg(f, T.crack + 10, T.burst)));
  const crack = sm(seg(f, T.crack, T.burst));
  const burst = seg(f, T.burst, T.burst + 34);
  const wings = back(seg(f, T.wings, T.wings + 22), 1.6);
  const rise = sm(seg(f, T.rise, T.rise + 50));
  const y = S.y - 70 * rise + 8 * Math.sin(f / 8) * rise;
  const tremble = guilt * 2.4 * Math.sin(f * 1.9) + crack * 3 * Math.sin(f * 2.6);
  const s = S.s;
  const neckY = y - 134 * s, bodyMid = y - 80 * s;
  const flap = Math.sin(f / 4.5);
  return (
    <g>
      {/* soft evening: a warm window-glow and a few drifting fireflies */}
      <circle cx={540} cy={1000} r={420} fill="#FFE8D2" opacity={0.55} filter="url(#lb40)" />
      {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={120 + rnd(i) * 840 + 30 * Math.sin(t + i)} cy={700 + rnd(i + 3) * 600 + 20 * Math.cos(t * 0.8 + i)} r={5} fill="#FFE59A" opacity={0.35 + 0.35 * Math.sin(t * 2 + i)} />)}
      <path d={`M0,${S.y} C300,${S.y - 8} 780,${S.y + 8} 1080,${S.y}`} stroke={INK} strokeWidth={4} fill="none" opacity={0.45} />
      <rect x={0} y={S.y} width={1080} height={400} fill="#FFFFFF" opacity={0.2} />
      {/* butterfly wings, behind the Soul */}
      {wings > 0.01 && [-1, 1].map((side) => (
        <g key={side} transform={`translate(${S.x + tremble} ${neckY + 70 * s}) scale(${side * wings * (0.75 + 0.25 * Math.abs(flap))} ${wings})`}>
          <path d="M0,-10 C40,-150 190,-170 210,-80 C224,-20 140,20 0,10 Z" fill="#FFC2D6" stroke={INK} strokeWidth={LW} strokeLinejoin="round" />
          <path d="M0,10 C90,30 170,60 150,130 C130,180 40,140 0,30 Z" fill="#C9B6FF" stroke={INK} strokeWidth={LW} strokeLinejoin="round" />
          <circle cx={130} cy={-80} r={22} fill="#FFFFFF" opacity={0.8} />
          <circle cx={100} cy={80} r={14} fill="#FFFFFF" opacity={0.7} />
        </g>
      ))}
      <LSoul x={S.x + tremble} y={y} s={s} p={{ worry: guilt, glance: 0.4 * guilt * Math.sign(Math.sin(f / 7)), sweat: guilt * seg(f, T.guilt + 20, T.crack),
        happy: f > T.happy ? 1 : 0, glow: 0.2 + 0.6 * crack * (1 - burst) + 0.6 * rise, blink: f > T.crack && f < T.happy, look: 0 }} />
      {/* the blanket cocoon: wraps up from the ground to the neck, cracks with light, then splits and falls */}
      {wrap > 0 && burst < 1 && (() => {
        const top = lerp(y, neckY + 10, wrap);
        const half = (dir: number) => {
          const ang = dir * 70 * burst * burst, dx = dir * 160 * burst, dy = 400 * burst * burst;
          return (
            <g transform={`translate(${dx} ${dy}) rotate(${ang} ${S.x + tremble} ${y})`} opacity={1 - burst}>
              <path d={`M${S.x + tremble},${top - 8} C${S.x + tremble + dir * 100 * s},${top - 10} ${S.x + tremble + dir * 92 * s},${y - 10} ${S.x + tremble + dir * 66 * s},${y + 4} L${S.x + tremble},${y + 8} Z`}
                fill="#D8C8FF" stroke={INK} strokeWidth={LW} strokeLinejoin="round" />
              {[0.25, 0.5, 0.75].map((k, i) => <path key={i} d={`M${S.x + tremble + dir * 10},${lerp(top, y, k)} q${dir * 40 * s},10 ${dir * 84 * s},0`} stroke={LILAC} strokeWidth={4} fill="none" opacity={0.7} />)}
            </g>
          );
        };
        return <g>{half(-1)}{half(1)}
          {/* light through the crack */}
          {crack > 0 && burst === 0 && <g>
            <path d={`M${S.x + tremble},${top} l-10,40 l14,30 l-12,36 l10,40 l-6,${Math.max(0, y - top - 150)}`} stroke="#FFE59A" strokeWidth={6 + 6 * crack} fill="none" strokeLinejoin="round" opacity={crack} />
            <circle cx={S.x} cy={bodyMid} r={80 + 120 * crack} fill="#FFF0B8" opacity={0.4 * crack} filter="url(#lb24)" />
          </g>}
        </g>;
      })()}
      {/* guilt cloud */}
      {guilt > 0.01 && <g transform={`translate(${S.x + 250} ${neckY - 170 + 6 * Math.sin(f / 9)}) scale(${guilt * 1.25})`}>
        <path d="M-80,20 C-96,-14 -56,-40 -30,-22 C-20,-58 40,-60 50,-24 C80,-34 104,0 86,22 Z" fill="#C9C4D2" stroke={INK} strokeWidth={LW - 1} strokeLinejoin="round" />
        <text x={4} y={8} textAnchor="middle" fontFamily="Hand" fontSize={34} fill={INK}>guilt</text>
        {[0, 1, 2].map((k) => { const p = ((f / 14) + k / 3) % 1; return <path key={k} d="M0,-6 C3,0 4,4 0,7 C-4,4 -3,0 0,-6 Z" transform={`translate(${-40 + k * 40} ${30 + 50 * p}) scale(1.6)`} fill="#A9D4F0" opacity={1 - p} />; })}
      </g>}
      {/* sparkles as it emerges */}
      {[[-220, -260, 0], [230, -300, 6], [-260, -60, 12], [250, -90, 18], [0, -420, 9]].map(([dx, dy, d], i) => (
        <Spark key={i} x={S.x + dx} y={neckY + dy} s={back(seg(f, T.wings + d, T.wings + d + 12), 2) * (0.8 + 0.2 * Math.sin(f / 6 + i))} c="#E8B04A" />
      ))}
      {/* "plans tonight?" notification + the Soul's reply */}
      {f > T.notif && f < T.wrap0 && (() => { const p = back(seg(f, T.notif, T.notif + 10), 2), o = 1 - seg(f, T.wrap0 - 12, T.wrap0);
        return <g transform={`translate(${S.x + 180} ${neckY - 420}) scale(${p})`} opacity={o}>
          <rect x={-170} y={-48} width={340} height={96} rx={28} fill="#FFFFFF" stroke={INK} strokeWidth={LW - 1} />
          <circle cx={-126} cy={0} r={22} fill="#FFC2D6" stroke={INK} strokeWidth={3} />
          <text x={18} y={13} textAnchor="middle" fontFamily="Hand" fontSize={42} fill={INK}>plans tonight?</text>
        </g>; })()}
      {f > T.reply && f < T.wrap0 + 10 && (() => { const p = back(seg(f, T.reply, T.reply + 10), 2), o = 1 - seg(f, T.wrap0, T.wrap0 + 10);
        return <g transform={`translate(${S.x - 110} ${neckY - 200}) scale(${p})`} opacity={o}>
          <path d="M-210,-50 Q-210,-80 -180,-80 L180,-80 Q210,-80 210,-50 L210,-4 Q210,26 180,26 L90,26 L118,56 L60,26 L-180,26 Q-210,26 -210,-4 Z" fill="#FFFFFF" stroke={INK} strokeWidth={LW - 1} strokeLinejoin="round" />
          <text x={0} y={-14} textAnchor="middle" fontFamily="Hand" fontSize={44} fill={INK}>not tonight. choosing me.</text>
        </g>; })()}
    </g>
  );
};

export const Q1031: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#FFF3EA", "#F1E2F7"]} audio="q1031.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} ats={[T.reply, T.guilt]} to={T.crack - 8} top={300} size={64} lines={[<>POV: you finally chose yourself</>, <>and felt guilty about it.</>]} />
        <Caption f={f} ats={[T.crack, T.wings + 8]} to={WIPE - 6} top={300} size={64} lines={[<>that guilt isn't a sign you did wrong.</>, <>it's a sign you're <Hl c={LILAC}>growing.</Hl></>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <Scene f={f} />
    </LFrame>
  );
};
export const BEATS = { ...T, END, WIPE, CARD };
