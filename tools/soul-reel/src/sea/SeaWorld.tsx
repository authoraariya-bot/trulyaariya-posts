// "Be the seashore" — a soft evening shore in the master Paper Boat style.
import React from "react";
import { interpolateColors } from "remotion";
import { Body } from "../master/World";
import { clamp01, lerp, SCALE, seg01, smoother, solve } from "../master/pose";
import { chop, healAt, lightAt, moodAt, SHORE, soulPose, SX, T, washY } from "./beats";

const W = 1080, H = 1920, GR = 1604; // the soul's ground on the sand
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const col = (h: number, a: string, b: string) => interpolateColors(clamp01(h), [0, 1], [a, b]);
const ridge = (base: number, amp: number, seed: number, x0: number, x1: number, step = 20, freq = 1) => {
  let d = `M${x0},${H + 10}`;
  for (let x = x0; x <= x1; x += step) d += ` L${x},${(base - amp * (0.55 * Math.sin((x / 300) * freq + seed) + 0.3 * Math.sin((x / 130) * freq + seed * 2) + 0.15 * Math.sin((x / 57) * freq + seed))).toFixed(1)}`;
  return d + ` L${x1},${H + 10} Z`;
};
const petal = "M0,-7 C5,-5 5,4 0,7 C-5,4 -5,-5 0,-7 Z";
const Flower: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <g transform={`scale(${s})`}>{[0, 72, 144, 216, 288].map((a) => <path key={a} d={petal} fill={c} transform={`rotate(${a}) translate(0,-7)`} />)}<circle r={2.6} fill="#EBC67F" /></g>
);

export const SeaWorld: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30, h = healAt(f), c = chop(f);
  const rig = solve(soulPose(f), SX, GR);
  const mood = moodAt(f), light = lightAt(f);
  const wy = washY(f);

  const skyTop = col(h, "#D4D2DE", "#A9C4F2"), skyMid = col(h, "#E4DDDD", "#F6DCE6"), skyLow = col(h, "#E9E3DA", "#FFE6C6");
  const far = col(h, "#CFCFDA", "#BDB8E6");
  const seaFar = col(h, "#B9C2C9", "#9FD3E6"), seaNear = col(h, "#A8B5BE", "#6FC6D6");
  const sand1 = col(h, "#E3DACB", "#F6E4C8"), sand2 = col(h, "#D8CDBB", "#EFD6B2"), wet = col(h, "#CFC4B3", "#E2C9A6");
  const dune = col(h, "#C9C8B2", "#BFDDA3"), grassC = col(h, "#9EA996", "#7DB66A");
  const HOR = 1236;

  // wave rows between the horizon and the shore; choppy → long and glassy
  const rows = Array.from({ length: 9 }, (_, r) => {
    const k = r / 8, y0 = lerp(HOR + 24, SHORE - 34, Math.pow(k, 1.35));
    const amp = (2 + 12 * k) * (0.25 + 0.75 * c), len = lerp(70, 210, k) * (1 + 0.8 * (1 - c));
    const sp = (1.8 + 3.2 * c) * (0.5 + k);
    let d = `M-20,${y0}`;
    for (let x = -20; x <= W + 20; x += 18) d += ` L${x},${(y0 - amp * Math.max(0, Math.sin((x + f * sp + r * 90) / len * Math.PI * 2))).toFixed(1)}`;
    return { d, k, y0 };
  });

  return (
    <g>
      <defs>
        <linearGradient id="ssky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={skyTop} /><stop offset="0.5" stopColor={skyMid} /><stop offset="0.66" stopColor={skyLow} /></linearGradient>
        <linearGradient id="ssea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={seaFar} /><stop offset="1" stopColor={seaNear} /></linearGradient>
        <linearGradient id="ssand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sand1} /><stop offset="1" stopColor={sand2} /></linearGradient>
        <radialGradient id="ssun" cx="0.62" cy="0.64" r="0.5"><stop offset="0" stopColor="#FFF1D8" stopOpacity={0.4 + 0.55 * h} /><stop offset="1" stopColor="#FFF1D8" stopOpacity={0} /></radialGradient>
        <filter id="sb4" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id="sb8" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="sb16" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16" /></filter>
        <filter id="sb40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
      </defs>
      <rect width={W} height={H} fill="url(#ssky)" />
      <rect width={W} height={H} fill="url(#ssun)" />
      {/* soft evening sun sitting low over the sea */}
      <circle cx={670} cy={HOR - 40} r={70} fill="#FFF4DE" opacity={0.5 + 0.45 * h} filter="url(#sb8)" />
      <circle cx={670} cy={HOR - 40} r={260} fill="#FFE9CC" opacity={0.35 * h} filter="url(#sb40)" />
      {[[160, 250, 1.0], [640, 170, 0.8], [1150, 290, 1.1]].map(([x, y, s], i) => {
        const cx = ((x + t * (6 + 10 * c) + 400) % 1900) - 400;
        return <g key={i} transform={`translate(${cx},${y + 660}) scale(${s})`} filter="url(#sb8)" opacity={0.85}>
          <ellipse rx={120} ry={30} fill="#FFFFFF" /><ellipse cx={-40} cy={-20} rx={60} ry={34} fill="#FFFFFF" /><ellipse cx={35} cy={-26} rx={70} ry={40} fill="#FFFFFF" />
        </g>;
      })}
      {/* gulls: busy and flapping in the chop, gliding once it's calm */}
      {[0, 1, 2].map((i) => {
        const p = ((t * (0.07 + 0.05 * c) + i * 0.33) % 1);
        const x = lerp(-80, 1160, p), y = 900 + i * 60 + 30 * Math.sin(t * 0.8 + i);
        const w = (4 + 8 * c) * Math.sin(t * (6 + 8 * c) + i * 2);
        return <path key={i} d={`M${x - 14},${y - w} Q${x - 5},${y - 3} ${x},${y + 2} Q${x + 5},${y - 3} ${x + 14},${y - w}`} stroke="#9F938D" strokeWidth={2.8} fill="none" strokeLinecap="round" />;
      })}
      {/* distant headland with a little lighthouse */}
      <path d={ridge(HOR - 6, 60, 3, -40, 520, 20, 0.9)} fill={far} />
      <g transform={`translate(890 ${HOR - 4})`}>
        <path d="M-150,6 C-110,-26 -40,-40 30,-34 C90,-28 140,-6 170,6 Z" fill={far} />
        <path d="M-10,-30 L-6,-108 L6,-108 L10,-30 Z" fill="#F6EFE8" />
        <path d="M-8,-60 L8,-60 L8,-74 L-8,-74 Z" fill="#E5A79A" />
        <rect x={-9} y={-122} width={18} height={14} rx={3} fill="#FFDC8A" />
        <path d="M-12,-122 L0,-134 L12,-122 Z" fill="#C98F7E" />
        <circle cx={0} cy={-115} r={22 + 8 * Math.sin(t * 2)} fill="#FFDFA0" opacity={0.25 + 0.55 * h} filter="url(#sb8)" />
      </g>
      {/* the sea */}
      <path d={`M-20,${HOR} L${W + 20},${HOR} L${W + 20},${SHORE + 4} L-20,${SHORE + 4} Z`} fill="url(#ssea)" />
      <path d={`M-20,${HOR} L${W + 20},${HOR} L${W + 20},${HOR + 16} L-20,${HOR + 16} Z`} fill="#FFFFFF" opacity={0.18} />
      {/* sun glitter path on the water */}
      {Array.from({ length: 26 }, (_, i) => {
        const y = HOR + 14 + Math.pow(rnd(i), 1.4) * (SHORE - HOR - 40), w = 10 + (y - HOR) * 0.2;
        const x = 670 + (rnd(i + 3) - 0.5) * (40 + (y - HOR) * 0.9) + 6 * Math.sin(t * 2 + i);
        return <path key={i} d={`M${x - w / 2},${y} l${w},0`} stroke="#FFF6DE" strokeWidth={3} strokeLinecap="round" opacity={(0.25 + 0.6 * h) * (0.5 + 0.5 * Math.sin(t * 3 + i * 1.7))} />;
      })}
      {rows.map((r, i) => <path key={i} d={r.d} stroke="#FFFFFF" strokeWidth={2 + 3 * r.k} fill="none" strokeLinejoin="round" opacity={(0.35 + 0.4 * r.k) * (0.45 + 0.55 * c)} />)}
      {/* sand + the moving waterline */}
      <path d={`M-20,${SHORE} C300,${SHORE - 8} 760,${SHORE + 8} ${W + 20},${SHORE} L${W + 20},${H} L-20,${H} Z`} fill="url(#ssand)" />
      {(() => {
        const edge = (x: number) => wy + 10 * Math.sin(x / 120 + t * (1 + 2 * c)) + 6 * Math.sin(x / 47 - t * 1.7) * (0.4 + 0.6 * c);
        let d = `M-20,${SHORE - 4}`; for (let x = -20; x <= W + 20; x += 20) d += ` L${x},${SHORE - 4}`;
        let foam = ""; for (let x = W + 20; x >= -20; x -= 20) foam += ` L${x},${edge(x).toFixed(1)}`;
        let line = `M-20,${edge(-20)}`; for (let x = 0; x <= W + 20; x += 20) line += ` L${x},${edge(x).toFixed(1)}`;
        return <g>
          <path d={`M-20,${SHORE - 6} L${W + 20},${SHORE - 6} L${W + 20},${SHORE + 26} L-20,${SHORE + 26} Z`} fill={wet} opacity={0.7} />
          <path d={d + foam + " Z"} fill={seaNear} opacity={0.75} />
          <path d={line} stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.85} />
          <path d={line} stroke="#FFFFFF" strokeWidth={24} fill="none" opacity={0.25} filter="url(#sb4)" />
          {Array.from({ length: 30 }, (_, i) => { const x = rnd(i) * W; return <circle key={i} cx={x} cy={edge(x) - 6 - 8 * rnd(i + 2)} r={2 + 3 * rnd(i + 4)} fill="#FFFFFF" opacity={0.6} />; })}
        </g>;
      })()}
      {/* circles drawn in the sand */}
      {[0, 1, 2].map((i) => {
        const p = smoother(seg01(f, 10 + i * 34, 40 + i * 34));
        const wash = smoother(seg01(f, T.rush0 + 14, T.rush1));
        if (p <= 0) return null;
        return <ellipse key={i} cx={SX + 120 + i * 6} cy={GR + 10} rx={20 + i * 14} ry={(20 + i * 14) * 0.32} fill="none" stroke={wet} strokeWidth={3} strokeDasharray={`${p * 200} 400`} opacity={0.8 * (1 - wash)} />;
      })}
      {/* the soul */}
      <g transform={`translate(${SX} ${GR}) scale(${SCALE}) translate(${-SX} ${-GR})`}>
        <ellipse cx={(rig.legs[0].foot.x + rig.legs[1].foot.x) / 2} cy={GR + 6} rx={62} ry={9} fill="#9C8F7A" opacity={0.2} filter="url(#sb4)" />
        <g filter="url(#sb16)" opacity={0.3 + 0.6 * light}><Body r={rig} fill="#F8C9AE" back="#F8C9AE" /></g>
        <Body r={rig} fill="#FFFBF4" back="#F2E7DA" face={{ f, mood }} />
        <g transform={`translate(${rig.neck.x + (rig.hip.x - rig.neck.x) * 0.32 + 7} ${rig.neck.y + (rig.hip.y - rig.neck.y) * 0.32})`}>
          <path d="M0,-11 C7,-4 8,4 0,10 C-8,4 -7,-4 0,-11 Z" transform={`scale(${2 + 2.4 * light + 0.25 * Math.sin(t * 3)})`} fill="#FFC98F" opacity={0.2 + 0.55 * light} filter="url(#sb4)" />
          <path d="M0,-11 C7,-4 8,4 0,10 C-8,4 -7,-4 0,-11 Z" transform={`scale(${0.5 + 0.5 * light})`} fill="#FFD7A6" opacity={0.45 + 0.55 * light} />
        </g>
      </g>
      {/* the foam that reaches its toes, in front */}
      {f > T.touch - 30 && (() => {
        const reach = clamp01((wy - (GR - 10)) / 14);
        return <ellipse cx={SX + 10} cy={GR + 4} rx={110 * reach} ry={10 * reach} fill="#FFFFFF" opacity={0.7 * reach} />;
      })()}
      {/* dunes with sea grass and little flowers in the corners */}
      <path d={`M-40,1920 L-40,1690 C80,1640 220,1660 330,1760 C380,1810 400,1880 420,1920 Z`} fill={dune} />
      <path d={`M1120,1920 L1120,1700 C1000,1660 880,1690 790,1780 C750,1830 740,1890 730,1920 Z`} fill={dune} />
      {Array.from({ length: 70 }, (_, i) => {
        const left = i < 36, x = left ? -10 + rnd(i) * 360 : 760 + rnd(i) * 340;
        const y = left ? 1700 + rnd(i + 3) * 220 + (x > 250 ? (x - 250) * 0.6 : 0) : 1710 + rnd(i + 3) * 210 + (x < 860 ? (860 - x) * 0.5 : 0);
        const len = 30 + rnd(i + 5) * 50, b = (8 + 10 * c) * Math.sin(t * (1 + c) + x / 70) + 6;
        return <path key={i} d={`M${x},${y} q${b * 0.4},${-len * 0.55} ${b},${-len}`} stroke={i % 3 ? grassC : col(h, "#B3BBA6", "#A9D88E")} strokeWidth={3} fill="none" strokeLinecap="round" />;
      })}
      {Array.from({ length: 14 }, (_, i) => {
        const left = i % 2 === 0, x = left ? 30 + rnd(i) * 250 : 800 + rnd(i) * 240, y = 1760 + rnd(i + 2) * 120;
        const g = clamp01((h - 0.35 - rnd(i) * 0.3) / 0.2);
        return <g key={`fl${i}`} transform={`translate(${x},${y}) rotate(${4 * Math.sin(t + i)})`}>
          <path d="M0,0 q-1,-8 0,-18" stroke={grassC} strokeWidth={2.2} fill="none" />
          <g transform="translate(0,-18)">{g > 0.02 ? <Flower s={0.9 * g} c={["#F2866F", "#F6D46B", "#B9A5E3", "#FFF4E2"][i % 4]} /> : <ellipse rx={2.6} ry={4} fill="#D2C9B4" />}</g>
        </g>;
      })}
      {/* warm motes once it's calm */}
      {Array.from({ length: 16 }, (_, i) => {
        const per = 6 + rnd(i) * 4, p = ((t + rnd(i + 1) * per) % per) / per;
        return <circle key={`m${i}`} cx={100 + rnd(i + 2) * 880 + 30 * Math.sin(p * 6 + i)} cy={1560 - p * 480} r={3} fill="#FFF3D6" opacity={h * Math.sin(p * Math.PI) * 0.8} />;
      })}
    </g>
  );
};
