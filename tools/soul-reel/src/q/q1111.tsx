// 11 Nov · "Their opinion isn't your destiny. Rise, and let your work speak."
// The Soul sits on the floor writing, a page on its lap. Opinion bubbles pop up around it ("be realistic",
// "who do you think you are?"...) and it shrinks into worry. It blinks, ignores them and keeps writing: page after
// page stacks up beneath it and lifts it higher and higher, past the bubbles, which droop, shrink and fade. At the
// top it sits glowing on its own tall stack of work while the pages sparkle.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, LSoul, Spark, INK, seg, sm, lerp, back, rnd } from "./line";
import { EndCard } from "../kit/Words";

export const END = 420; const WIPE = 330, CARD = 348;
const OPS = [
  { at: 10, t: "be realistic", x: 250, y: 1180 }, { at: 24, t: "who do you think you are?", x: 700, y: 1060 },
  { at: 38, t: "that won't work", x: 790, y: 1300 }, { at: 52, t: "so slow", x: 230, y: 1380 }, { at: 66, t: "give up already", x: 300, y: 980 },
];
const T = { ignore: 80, rise0: 94, rise1: 184, fade0: 100, fade1: 134, happy: 192 };
const G = 1560, SX = 540, SS = 1.7, PH = 14;
const ROSE = "#E2507F";

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const n = Math.floor(lerp(0, 3, seg(f, 20, T.ignore)) + lerp(0, 27, sm(seg(f, T.rise0, T.rise1))));
  const h = n * PH;
  const worry = sm(seg(f, OPS[1].at, OPS[3].at)) * (1 - sm(seg(f, T.ignore, T.ignore + 10)));
  const writing = f > T.ignore + 6 || f < OPS[0].at;
  const wave = -0.3 + (writing ? 0.12 * Math.sin(f / 2) : 0);
  const k = SS;
  const handX = SX + (52 + Math.sin(((24 - 140 * wave) * Math.PI) / 180) * 34) * k, handY = G - h + (-68 + Math.cos(((24 - 140 * wave) * Math.PI) / 180) * 34) * k;
  const glow = sm(seg(f, T.rise1 - 10, T.rise1 + 20));
  return (
    <g>
      <path d={`M0,${G} C300,${G - 6} 780,${G + 6} 1080,${G}`} stroke={INK} strokeWidth={4} fill="none" opacity={0.45} />
      <rect x={0} y={G} width={1080} height={420} fill="#FFFFFF" opacity={0.22} />
      <circle cx={SX} cy={G - h - 160} r={300} fill="#FFE9B8" opacity={0.5 * glow} filter="url(#lb40)" />
      {/* opinions */}
      {OPS.map((o, i) => { const inn = back(seg(f, o.at - 6, o.at + 4), 2); if (inn <= 0.01) return null;
        const fd = sm(seg(f, T.fade0 + i * 4, T.fade1 + i * 3)); const w = o.t.length * 21 + 60;
        const x = Math.min(990 - w / 2, Math.max(90 + w / 2, o.x));
        return <g key={i} transform={`translate(${x} ${o.y + 160 * fd + 6 * Math.sin(t * 1.6 + i)}) scale(${inn * (1 - 0.5 * fd)})`} opacity={1 - fd}>
          <rect x={-w / 2} y={-40} width={w} height={78} rx={34} fill={`rgb(${235 - 20 * fd},${232 - 20 * fd},${240 - 20 * fd})`} stroke={INK} strokeWidth={4} />
          <path d={`M${(x < SX ? 1 : -1) * (w / 2 - 40)},36 l${(x < SX ? 1 : -1) * 18},22 l${(x < SX ? -1 : 1) * 2},-24`} fill="#EBE8F0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <text x={0} y={10} textAnchor="middle" fontFamily="Hand" fontSize={44} fill={INK}>{o.t}</text>
        </g>; })}
      {/* the stack of its own pages */}
      {Array.from({ length: n }, (_, i) => { const y = G - (i + 1) * PH, dx = 8 * (rnd(i) - 0.5);
        return <rect key={i} x={SX - 130 + dx} y={y} width={260} height={PH} rx={3} fill={i % 2 ? "#FFFFFF" : "#FFF6E6"} stroke={INK} strokeWidth={3} />; })}
      {/* a fresh page flying onto the stack while it rises */}
      {f > T.rise0 && f < T.rise1 && (() => { const p = (f % 6) / 6; return <rect x={lerp(handX + 20, SX - 130, p)} y={lerp(handY - 40, G - h - 30, p)} width={120} height={80} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={3} transform={`rotate(${20 - 20 * p} ${handX} ${handY})`} opacity={0.9} />; })()}
      {/* the Soul, sitting on top, writing */}
      <LSoul x={SX} y={G - h} s={SS} p={{ sit: 1, worry, glance: worry > 0.3 ? (Math.sin(f / 7) > 0 ? -0.8 : 0.8) : 0.3, wave, happy: f > T.happy ? 1 : 0,
        glow: 0.15 + 0.7 * glow, blink: [T.ignore - 2, T.ignore + 2].some((b) => f >= b && f < b + 3) }} />
      {/* page on its lap + pencil */}
      <g transform={`translate(${SX - 60} ${G - h - 50 * k}) rotate(-6)`}><rect x={0} y={0} width={120} height={70} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
        {[0, 1, 2].map((r) => <line key={r} x1={14} x2={14 + (r === 2 ? 50 : 90) * (writing ? 0.5 + 0.5 * ((f / 20 + r) % 1) : 1)} y1={18 + r * 18} y2={18 + r * 18} stroke={INK} strokeWidth={3} opacity={0.5} />)}</g>
      <g transform={`translate(${handX} ${handY}) rotate(${-30 + 6 * Math.sin(f / 2)})`}><rect x={-8} y={-60} width={16} height={64} rx={4} fill="#FFD36E" stroke={INK} strokeWidth={4} /><path d="M-8,4 L0,20 L8,4 Z" fill={INK} /></g>
      {f > T.rise1 - 10 && [0, 1, 2, 3, 4].map((i) => { const p = ((f - T.rise1 + 10) / 46 + i / 5) % 1;
        return <Spark key={i} x={SX + [-190, 200, -170, 180, 0][i]} y={G - h * p - 40} s={0.55 * Math.sin(Math.PI * p)} c={["#FFD36E", "#FF8FAE", "#C9B6FF"][i % 3]} />; })}
    </g>
  );
};

export const Q1111: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#F4F1FF", "#FFEFD9"]} audio="q1111.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} ats={[4, T.rise0, T.rise0 + 50]} to={WIPE - 6} top={250} size={68}
          lines={[<>their opinion isn't your destiny.</>, <span style={{ fontSize: 88 }}><Hl c={ROSE}>rise,</Hl></span>, <>and let your work speak.</>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <Scene f={f} />
    </LFrame>
  );
};
export const BEATS = { ...T, END, WIPE, CARD };
