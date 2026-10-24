// 27 Oct · "In a world full of restless waves, be the seashore. Calm and steady."
// Minimal line art. The Soul sits at the water's edge, eyes closed, breathing slowly (its heart-light pulses with
// each breath). Big restless waves rise behind it and crash, but each reaches the Soul only as a soft line of foam
// that curls around it and slips back. The waves calm, the sky warms, and the Soul opens its eyes with a smile.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, LSoul, INK, LW, seg, sm, lerp } from "./line";
import { EndCard } from "../kit/Words";

export const END = 405; const WIPE = 315, CARD = 333;
const LAPS = [{ at: 24, g: 1 }, { at: 80, g: 1 }, { at: 170, g: 0.6 }, { at: 240, g: 0.35 }];
const T = { breath0: 104, breath1: 150, calm: 170, open: 268 };
const SHORE = 1330, SX = 540, SY = 1440;
const TEAL = "#2BA39A";

// foam lap: a soft white edge runs up the sand, wraps around the Soul, slips back
const Lap: React.FC<{ f: number; at: number; g: number; i: number }> = ({ f, at, g, i }) => {
  const L = 70, p = (f - at) / L; if (p < 0 || p > 1) return null;
  const run = sm(p / 0.45), back = sm((p - 0.55) / 0.45);
  const foamY = lerp(SHORE - 6, SHORE + (SY - SHORE) * g, run) - (SY - SHORE) * g * back;
  const foam = `M-40,${foamY} ${Array.from({ length: 12 }, (_, k) => { const x = k * 100; const near = Math.exp(-Math.pow((x + 50 - SX) / 130, 2)); return `Q${x + 50},${foamY - 14 + 7 * Math.sin(k + i) - near * 34 * g} ${x + 100},${foamY}`; }).join(" ")}`;
  return (
    <g opacity={1 - 0.6 * back}>
      <path d={`${foam} L1120,${SHORE - 20} L-40,${SHORE - 20} Z`} fill="#FFFFFF" opacity={0.92} />
      <path d={foam} fill="none" stroke={INK} strokeWidth={LW - 2} strokeLinecap="round" opacity={0.6} />
    </g>
  );
};
// the restless sea: rows of curling wave tips that bob and roll; they settle into flat glints as it calms
const Chop: React.FC<{ f: number; calm: number }> = ({ f, calm }) => {
  const t = f / 30, rows = 6, items: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const y0 = 935 + r * r * 9 + r * 40, sc = 0.45 + r * 0.16, n = 7 - Math.floor(r / 2);
    for (let k = 0; k < n; k++) {
      const x = ((k / n) * 1240 + (r % 2) * 90 + t * (40 - 34 * calm) * (r % 2 ? 1 : -1) * (0.6 + r * 0.1)) % 1240 - 80;
      const bob = (1 - calm) * 16 * sc * Math.sin(t * 5 + k * 1.9 + r);
      const tip = (1 - calm) * (0.6 + 0.4 * Math.sin(t * 4 + k + r * 2));
      items.push(
        <g key={`${r}-${k}`} transform={`translate(${x} ${y0 + bob}) scale(${sc})`}>
          {tip > 0.05 && <path d={`M-70,10 C-40,10 -20,-30 10,-40 C40,-48 56,-26 44,-10 C34,2 18,-8 22,-18`} fill="#FFFFFF" stroke={INK} strokeWidth={LW} strokeLinecap="round" strokeLinejoin="round" opacity={Math.min(1, tip * 1.4)} transform={`scale(1 ${0.4 + 0.6 * tip})`} />}
          <path d={`M-70,12 q35,${-10 * (1 - calm)} 70,0 q35,${10 * (1 - calm)} 70,0`} fill="none" stroke={INK} strokeWidth={LW - 1} strokeLinecap="round" opacity={0.55 - 0.35 * calm} />
        </g>
      );
    }
  }
  return <g>{items}</g>;
};

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30, calm = sm(seg(f, T.calm, T.calm + 70));
  const breath = 0.5 + 0.5 * Math.sin((f / 30) * Math.PI * 2 / 4.2);
  return (
    <g>
      <defs>
        <linearGradient id="wave27" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7FD8CF" /><stop offset="1" stopColor="#B5ECE3" /></linearGradient>
        <linearGradient id="sea27b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={calm > 0.5 ? "#A6E3DC" : "#8FCFD0"} /><stop offset="1" stopColor="#C8F0E8" /></linearGradient>
        <linearGradient id="sand27b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE7D4" /><stop offset="1" stopColor="#FFD5C2" /></linearGradient>
      </defs>
      {/* a soft sun that appears as the sea calms */}
      <circle cx={760} cy={860} r={180} fill="#FFE2B6" opacity={0.25 + 0.6 * calm} filter="url(#lb40)" />
      {/* far sea band */}
      <rect x={0} y={900} width={1080} height={SHORE - 900} fill="url(#sea27b)" />
            <line x1={0} x2={1080} y1={900} y2={900} stroke={INK} strokeWidth={3} opacity={0.25} />
      {/* storm clouds that thin out */}
      {Array.from({ length: 4 }, (_, i) => <ellipse key={i} cx={((i * 320 + t * (30 - 24 * calm)) % 1500) - 200} cy={760 + 40 * (i % 2)} rx={200} ry={40} fill={calm > 0.5 ? "#FFFFFF" : "#C9D6E6"} opacity={0.5 - 0.25 * calm} filter="url(#lb12)" />)}
      <Chop f={f} calm={calm} />
      {/* the sun's path on the water once it is calm */}
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={760 - 30 - i * 8 + 10 * Math.sin(t * 2 + i)} y={920 + i * 38} width={60 + i * 16} height={5} rx={3} fill="#FFF3D2" opacity={0.85 * calm} />)}
      {LAPS.map((w, i) => <Lap key={i} f={f} at={w.at} g={w.g} i={i} />)}
      {/* sand */}
      <path d={`M0,${SHORE} C300,${SHORE - 10} 780,${SHORE + 12} 1080,${SHORE} L1080,1920 L0,1920 Z`} fill="url(#sand27b)" />
      <path d={`M0,${SHORE} C300,${SHORE - 10} 780,${SHORE + 12} 1080,${SHORE}`} stroke={INK} strokeWidth={4} fill="none" opacity={0.5} />
      {/* wet sand sheen right after each wave */}
      {LAPS.map((w, i) => { const p = seg(f, w.at + 30, w.at + 80); return p > 0 && p < 1 ? <ellipse key={i} cx={SX} cy={SY + 20} rx={300} ry={40} fill="#FFFFFF" opacity={0.25 * (1 - p)} filter="url(#lb12)" /> : null; })}
      {/* a couple of shells */}
      <path d="M210,1520 l-16,26 l32,0 Z" fill="#FFD0DC" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M850,1560 q16,-14 32,0 q-16,9 -32,0 Z" fill="#E8DDF6" stroke={INK} strokeWidth={4} />
      {/* the Soul: seated, still, breathing */}
      {(() => {
        // restless → one deep breath → calm
        const restless = 1 - sm(seg(f, T.breath0, T.breath0 + 30));
        const inhale = Math.sin(Math.PI * seg(f, T.breath0, T.breath1));
        const closed = f > T.breath0 + 14 && f <= T.open;
        const glance = restless * (Math.sin(f / 6) > 0.3 ? 1 : Math.sin(f / 6) < -0.3 ? -1 : 0);
        const blinkAnx = f < T.breath0 && [34, 72].some((b) => f >= b && f < b + 4);
        return <LSoul x={SX} y={SY} s={1.55} p={{ sit: 1, worry: restless, glance, tremble: restless * 1.6 * Math.sin(f * 1.7), sweat: seg(f, 20, 96) * restless, inhale,
          blink: closed || blinkAnx, happy: f > T.open ? 1 : 0, glow: 0.2 + 0.8 * inhale + 0.35 * calm + 0.15 * breath * calm }} />;
      })()}
    </g>
  );
};

export const Q1027: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#EAF6F4", "#CDE8EC"]} audio="q1027.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} at={0} to={WIPE - 6} top={300} size={70} lines={[<>in a world full of</>, <>restless waves,</>, <>be the <Hl c={TEAL}>seashore.</Hl></>, <span style={{ fontSize: 56 }}>calm and steady.</span>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <Scene f={f} />
    </LFrame>
  );
};
export const BEATS = { ...T, END, WIPE, CARD };
