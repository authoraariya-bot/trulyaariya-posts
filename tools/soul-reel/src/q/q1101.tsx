// 1 Nov · Savage · "Your life is a blackboard. Make sure only you hold the chalk."
// An old sunlit classroom, a cherry tree tossing outside the tall windows. Chalk sticks fly in by themselves and
// scribble everyone's rules across the board: "marry by 25", "be practical", "what will people say?"…
// A duster wipes it clean in one sweep, the other chalks snap, and one pink chalk rises and writes "my story".
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { QFrame, Words, W, KeyW, Motes, seg, sm, lerp, rnd } from "./kit";
import { EndCard } from "../kit/Words";
import { LightLeak } from "../kit/fx";

export const END = 420; const WIPE = 330, CARD = 348;
const T = { s0: 22, wipe0: 150, wipe1: 182, snap: 186, rise: 194, write0: 206, write1: 246, line2: 236, key: 262 };
const ACCENT = "#FF6FA0";
const B = { x0: 110, x1: 970, y0: 660, y1: 1290 };
const RULES = [
  { t: "marry by 25", x: 300, y: 760, s: 64, r: -6, c: "#FFFFFF" },
  { t: "be practical", x: 720, y: 790, s: 60, r: 4, c: "#FFF3A6" },
  { t: "what will people say?", x: 520, y: 900, s: 66, r: -2, c: "#FFFFFF" },
  { t: "too loud", x: 280, y: 1020, s: 58, r: 6, c: "#BFE6FF" },
  { t: "settle down", x: 740, y: 1040, s: 62, r: -5, c: "#FFFFFF" },
  { t: "become a doctor", x: 470, y: 1150, s: 60, r: 3, c: "#FFF3A6" },
  { t: "don't dream so big", x: 640, y: 1230, s: 52, r: -3, c: "#BFE6FF" },
];
const startOf = (i: number) => T.s0 + i * 17;
const wipeX = (f: number) => lerp(B.x0 - 120, B.x1 + 120, sm(seg(f, T.wipe0, T.wipe1)));

const World: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const wx = wipeX(f);
  return (
    <g>
      <defs>
        <linearGradient id="wall1101" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE1C8" /><stop offset="1" stopColor="#FFC9B8" /></linearGradient>
        <linearGradient id="board1101" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2F7D72" /><stop offset="1" stopColor="#245F59" /></linearGradient>
        <linearGradient id="skyw1101" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A9DCFF" /><stop offset="1" stopColor="#FFE9D2" /></linearGradient>
        <filter id="chalk1101" x="-10%" y="-30%" width="120%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} /><feDisplacementMap in="SourceGraphic" scale="3" /></filter>
        <clipPath id="bc1101"><rect x={B.x0} y={B.y0} width={B.x1 - B.x0} height={B.y1 - B.y0} rx={8} /></clipPath>
      </defs>
      <rect width={1080} height={1920} fill="url(#wall1101)" />
      {/* tall windows at the sides with the cherry tree swaying outside */}
      {[[-90, 520], [1000, 520]].map(([x, y], k) => (
        <g key={k}>
          <rect x={x} y={y} width={170} height={760} rx={85} fill="url(#skyw1101)" />
          {Array.from({ length: 6 }, (_, i) => { const sw = 8 * Math.sin(t * 1.5 + i + k * 2);
            return <circle key={i} cx={x + 40 + 90 * rnd(i + k * 7) + sw} cy={y + 160 + 300 * rnd(i + 3 + k)} r={40 + 20 * rnd(i)} fill={["#FFB7CF", "#FFCFDF", "#FF9DBD"][i % 3]} opacity={0.95} />; })}
          <rect x={x} y={y} width={170} height={760} rx={85} fill="none" stroke="#FFF6EE" strokeWidth={16} />
        </g>
      ))}
      {/* sunbeams with dust */}
      <path d="M1000,560 L420,1700 L760,1700 L1080,700 Z" fill="#FFF4DA" opacity={0.35} filter="url(#qb24)" />
      {/* the board */}
      <rect x={B.x0 - 30} y={B.y0 - 30} width={B.x1 - B.x0 + 60} height={B.y1 - B.y0 + 60} rx={18} fill="#C98E62" />
      <rect x={B.x0} y={B.y0} width={B.x1 - B.x0} height={B.y1 - B.y0} rx={8} fill="url(#board1101)" />
      <g clipPath="url(#bc1101)">
        {/* old chalk haze */}
        {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={200 + 180 * i} cy={800 + 90 * (i % 3)} rx={160} ry={40} fill="#FFFFFF" opacity={0.04} filter="url(#qb16)" />)}
        {RULES.map((r, i) => {
          const a = startOf(i), w = seg(f, a, a + 22); if (w <= 0) return null;
          const wiped = r.x + 160 < wx ? 1 : r.x - 160 > wx ? 0 : (wx - (r.x - 160)) / 320;
          return <g key={i} transform={`translate(${r.x} ${r.y}) rotate(${r.r})`} opacity={1 - 0.985 * wiped}>
            <text textAnchor="middle" fontFamily="Caveat" fontWeight={700} fontSize={r.s} fill={r.c} filter="url(#chalk1101)" style={{ clipPath: `inset(-40% ${(1 - w) * 100}% -40% 0%)` }}>{r.t}</text>
            {i % 2 === 0 && <path d={`M${-r.t.length * r.s * 0.2},${r.s * 0.3} Q0,${r.s * 0.5} ${r.t.length * r.s * 0.2},${r.s * 0.28}`} stroke={r.c} strokeWidth={4} fill="none" opacity={0.8 * seg(f, a + 22, a + 28)} filter="url(#chalk1101)" />}
          </g>;
        })}
        {/* smudge left by the duster */}
        <rect x={B.x0} y={B.y0} width={Math.max(0, wx - B.x0)} height={B.y1 - B.y0} fill="#FFFFFF" opacity={0.06} filter="url(#qb10)" />
        {/* "my story" written by the pink chalk */}
        {f >= T.write0 && <text x={540} y={1040} textAnchor="middle" fontFamily="Caveat" fontWeight={700} fontSize={190} fill={ACCENT} filter="url(#chalk1101)" style={{ clipPath: `inset(-40% ${(1 - sm(seg(f, T.write0, T.write1))) * 100}% -40% 0%)` }}>my story</text>}
      </g>
      {/* the ledge + resting chalks */}
      <rect x={B.x0 - 40} y={B.y1 + 26} width={B.x1 - B.x0 + 80} height={30} rx={8} fill="#B87C52" />
      {[[260, "#FFFFFF"], [380, "#FFF3A6"], [700, "#BFE6FF"], [820, "#FFFFFF"]].map(([x, c], i) => {
        const sn = sm(seg(f, T.snap + i * 2, T.snap + i * 2 + 10));
        return <g key={i} transform={`translate(${x} ${B.y1 + 18})`}>
          <rect x={-40 - 14 * sn} y={-8} width={40} height={16} rx={7} fill={c as string} transform={`rotate(${-18 * sn} 0 0)`} />
          <rect x={0 + 14 * sn} y={-8} width={40} height={16} rx={7} fill={c as string} transform={`rotate(${18 * sn} 0 0)`} />
          {sn > 0 && sn < 1 && Array.from({ length: 5 }, (_, k) => <circle key={k} cx={(rnd(k + i) - 0.5) * 60 * sn} cy={-30 * sn * rnd(k + 2)} r={3} fill={c as string} opacity={1 - sn} />)}
        </g>;
      })}
      {/* duster */}
      {f > T.wipe0 - 12 && f < T.wipe1 + 16 && (() => { const y = 960 + 180 * Math.sin(seg(f, T.wipe0, T.wipe1) * Math.PI * 3);
        const o = Math.min(seg(f, T.wipe0 - 12, T.wipe0 - 2), 1 - seg(f, T.wipe1 + 4, T.wipe1 + 16));
        return <g transform={`translate(${wx} ${y}) rotate(-8)`} opacity={o}><rect x={-90} y={-46} width={180} height={60} rx={14} fill="#8A5A7A" /><rect x={-90} y={10} width={180} height={34} rx={8} fill="#F6EEE6" />
          {Array.from({ length: 12 }, (_, k) => <circle key={k} cx={-110 - 60 * rnd(k)} cy={-20 + 80 * rnd(k + 3)} r={6 + 6 * rnd(k)} fill="#FFFFFF" opacity={0.3} />)}</g>; })()}
      {/* flying chalks that write the rules */}
      {RULES.map((r, i) => { const a = startOf(i); if (f < a - 10 || f > a + 32) return null;
        const inn = sm(seg(f, a - 10, a)), w = seg(f, a, a + 22), out = sm(seg(f, a + 22, a + 32));
        const ex = r.x - r.t.length * r.s * 0.22 + r.t.length * r.s * 0.44 * w;
        const x = lerp(i % 2 ? 1200 : -120, ex, inn) + (out ? lerp(0, i % 2 ? 500 : -500, out) : 0), y = lerp(500, r.y - 10 + 8 * Math.sin(f * 2), inn) - 300 * out;
        return <g key={i} transform={`translate(${x} ${y}) rotate(${-40 + 10 * Math.sin(f)})`}><rect x={-10} y={-50} width={20} height={70} rx={8} fill={r.c} /><rect x={-10} y={10} width={20} height={14} rx={6} fill="#E6E0D8" /></g>; })}
      {/* the pink chalk */}
      {f >= T.rise && (() => { const up = sm(seg(f, T.rise, T.write0)), w = sm(seg(f, T.write0, T.write1)), done = sm(seg(f, T.write1, T.write1 + 16));
        const x = lerp(540, lerp(250, 830, w), up) + lerp(0, 120, done), y = lerp(B.y1 + 10, 1010 + 30 * Math.sin(w * 40), up) - lerp(0, 60, done);
        return <g transform={`translate(${x} ${y}) rotate(${lerp(90, -35, up)})`}>
          <circle r={70} fill="#FFC2DA" opacity={0.4} filter="url(#qb16)" />
          <rect x={-12} y={-60} width={24} height={84} rx={10} fill={ACCENT} /><rect x={-12} y={14} width={24} height={14} rx={6} fill="#FFE0EC" />
        </g>; })()}
      {/* teacher's desk in the foreground with a vase of blossoms */}
      <rect x={-20} y={1560} width={1120} height={50} rx={12} fill="#D7A27A" /><rect x={-20} y={1608} width={1120} height={320} fill="#C38E68" />
      <g transform="translate(860 1560)">
        <path d="M-50,0 L-40,-120 L40,-120 L50,0 Z" fill="#BFE6FF" opacity={0.85} />
        {Array.from({ length: 5 }, (_, k) => { const a = -40 + k * 20 + 4 * Math.sin(t * 1.6 + k);
          return <g key={k} transform={`rotate(${a}) translate(0 -120)`}><path d="M0,0 L0,-140" stroke="#8A6A5A" strokeWidth={4} />{Array.from({ length: 4 }, (_, j) => <circle key={j} cx={8 * Math.sin(j * 2)} cy={-60 - j * 24} r={14} fill={["#FFB7CF", "#FF9DBD"][j % 2]} />)}</g>; })}
      </g>
      <g transform="translate(220 1560)"><rect x={-110} y={-36} width={220} height={36} rx={6} fill="#FF9DBD" /><rect x={-96} y={-70} width={200} height={34} rx={6} fill="#9EE6CF" /><rect x={-80} y={-100} width={170} height={30} rx={6} fill="#FFE38A" /></g>
      {/* falling blossom petals across the room */}
      {Array.from({ length: 18 }, (_, i) => { const p = ((f / (70 + 40 * rnd(i))) + rnd(i + 1)) % 1, x = (i % 2 ? 1060 : 20) + (i % 2 ? -1 : 1) * p * 700, y = 560 + p * 1100 + 40 * Math.sin(p * 9 + i);
        return <path key={i} d="M0,-8 C5,-5 5,5 0,8 C-5,5 -5,-5 0,-8 Z" transform={`translate(${x} ${y}) rotate(${p * 600}) scale(1.6)`} fill="#FFB7CF" opacity={Math.sin(Math.PI * p) * 0.9} />; })}
      <Motes f={f} n={40} color="#FFF8DA" y0={600} y1={1600} speed={0.5} />
    </g>
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <LightLeak f={f} amt={0.35 + 0.25 * sm(seg(f, T.write0, WIPE))} side="right" tint="warm" />
    <Words f={f} from={0} to={T.line2 - 8} top={190} size={84}>
      <div><W f={f} at={2}>Your</W><W f={f} at={7}>life</W><W f={f} at={12} last>is</W></div>
      <div><W f={f} at={17}>a</W><W f={f} at={22} last><i>blackboard.</i></W></div>
    </Words>
    <Words f={f} from={T.line2 - 4} to={WIPE - 4} top={170} size={76}>
      <div><W f={f} at={T.line2}>Make</W><W f={f} at={T.line2 + 5}>sure</W><W f={f} at={T.line2 + 10} last>only</W></div>
      <div style={{ marginTop: -6 }}><KeyW f={f} at={T.key} color="#D63A6E" size={120}>you hold the chalk.</KeyW></div>
    </Words>
    <EndCard f={f} wipe={WIPE} card={CARD} />
  </AbsoluteFill>
);

export const Q1101: React.FC = () => { const f = useCurrentFrame(); return <QFrame world={<World f={f} />} overlay={<Overlay f={f} />} audio="q1101.wav" />; };
export const BEATS = { ...T, END, WIPE, CARD };
