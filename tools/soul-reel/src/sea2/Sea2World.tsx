// Reel 2 (v2): restless beach → the camera travels with the soul → a calm cove where it lies back and rests.
import React from "react";
import { interpolateColors } from "remotion";
import { Body } from "../master/World";
import { clamp01, lerp, SCALE, seg01, solve } from "../master/pose";
import { camX, chopAt, healAt, hopAt, lightAt, moodAt, soulPose, soulX, T } from "./beats";

const W = 1080, H = 1920, GR = 1604, SHORE = 1530, HOR = 1236;
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

// the waterline on the sand at world x (restless surges on the left, slow laps in the cove)
const washAt = (x: number, f: number) => {
  const c = chopAt(x);
  const restless = 22 * Math.max(0, Math.sin(f / 8 + x / 140)) + 14 * Math.max(0, Math.sin(f / 4.6 + 1 + x / 90));
  const splash = (s: number, sx: number) => 96 * Math.sin(Math.PI * seg01(f, s - 12, s + 10)) * Math.exp(-(((x - sx) / 160) ** 2));
  const lap = 30 + 30 * Math.pow(Math.max(0, Math.sin(f / 30 * Math.PI * 2 / 3.6)), 1.6);
  return SHORE + lerp(lap, restless, c) + splash(T.splash1, 330) + splash(T.splash2, 460);
};

export const Sea2World: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30, h = healAt(f), cam = camX(f);
  const sx = soulX(f);
  const rig = solve(soulPose(f), sx, GR, hopAt(f));
  const mood = moodAt(f), light = lightAt(f);
  const wx = (x: number, par = 1) => x - cam * par;

  const skyTop = col(h, "#D4D2DE", "#A9C4F2"), skyMid = col(h, "#E4DDDD", "#F6DCE6"), skyLow = col(h, "#E9E3DA", "#FFE6C6");
  const far = col(h, "#CFCFDA", "#BDB8E6");
  const sand1 = col(h, "#E3DACB", "#F6E4C8"), sand2 = col(h, "#D8CDBB", "#EFD6B2"), wet = col(h, "#CFC4B3", "#E2C9A6");
  const dune = col(h, "#C9C8B2", "#BFDDA3"), grassC = col(h, "#9EA996", "#7DB66A");
  // sea colour per world x: grey-blue chop → glowing turquoise cove
  const seaFarAt = (x: number) => col(1 - chopAt(x), "#B9C2C9", "#9FD8E8"), seaNearAt = (x: number) => col(1 - chopAt(x), "#A8B5BE", "#6FC9D8");

  return (
    <g>
      <defs>
        <linearGradient id="s2sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={skyTop} /><stop offset="0.5" stopColor={skyMid} /><stop offset="0.66" stopColor={skyLow} /></linearGradient>
        <linearGradient id="s2sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sand1} /><stop offset="1" stopColor={sand2} /></linearGradient>
        <linearGradient id="s2seaH" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={W} y2={0}>
          {[0, 0.25, 0.5, 0.75, 1].map((o) => <stop key={o} offset={o} stopColor={seaNearAt(cam + o * W)} />)}
        </linearGradient>
        <linearGradient id="s2seaF" gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={W} y2={0}>
          {[0, 0.25, 0.5, 0.75, 1].map((o) => <stop key={o} offset={o} stopColor={seaFarAt(cam + o * W)} />)}
        </linearGradient>
        <radialGradient id="s2sun" cx="0.62" cy="0.64" r="0.5"><stop offset="0" stopColor="#FFF1D8" stopOpacity={0.4 + 0.55 * h} /><stop offset="1" stopColor="#FFF1D8" stopOpacity={0} /></radialGradient>
        <filter id="s2b4" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id="s2b8" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="s2b16" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16" /></filter>
        <filter id="s2b40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
      </defs>
      <rect width={W} height={H} fill="url(#s2sky)" />
      <rect width={W} height={H} fill="url(#s2sun)" />
      <circle cx={wx(1700, 0.3)} cy={HOR - 40} r={70} fill="#FFF4DE" opacity={0.5 + 0.45 * h} filter="url(#s2b8)" />
      <circle cx={wx(1700, 0.3)} cy={HOR - 40} r={280} fill="#FFE9CC" opacity={0.4 * h} filter="url(#s2b40)" />
      {[[160, 250, 1.0], [640, 170, 0.8], [1150, 290, 1.1], [1700, 220, 0.9]].map(([x, y, s], i) => {
        const cx = ((x + t * 9 - cam * 0.1 + 400) % 2400) - 400;
        return <g key={i} transform={`translate(${cx},${y + 660}) scale(${s})`} filter="url(#s2b8)" opacity={0.85}>
          <ellipse rx={120} ry={30} fill="#FFFFFF" /><ellipse cx={-40} cy={-20} rx={60} ry={34} fill="#FFFFFF" /><ellipse cx={35} cy={-26} rx={70} ry={40} fill="#FFFFFF" />
        </g>;
      })}
      {[0, 1, 2].map((i) => {
        const c = chopAt(cam + 300);
        const p = ((t * (0.07 + 0.05 * c) + i * 0.33) % 1);
        const x = lerp(-80, 1160, p), y = 900 + i * 60 + 30 * Math.sin(t * 0.8 + i);
        const w = (4 + 8 * c) * Math.sin(t * (6 + 8 * c) + i * 2);
        return <path key={i} d={`M${x - 14},${y - w} Q${x - 5},${y - 3} ${x},${y + 2} Q${x + 5},${y - 3} ${x + 14},${y - w}`} stroke="#9F938D" strokeWidth={2.8} fill="none" strokeLinecap="round" />;
      })}
      {/* far shore + headland with the lighthouse in the cove */}
      <g transform={`translate(${-cam * 0.25} 0)`}>
        <path d={ridge(HOR - 6, 60, 3, -40, 1500, 20, 0.9)} fill={far} />
        <g transform={`translate(1240 ${HOR - 4})`}>
          <path d="M-150,6 C-110,-26 -40,-40 30,-34 C90,-28 140,-6 170,6 Z" fill={far} />
          <path d="M-10,-30 L-6,-108 L6,-108 L10,-30 Z" fill="#F6EFE8" />
          <path d="M-8,-60 L8,-60 L8,-74 L-8,-74 Z" fill="#E5A79A" />
          <rect x={-9} y={-122} width={18} height={14} rx={3} fill="#FFDC8A" />
          <path d="M-12,-122 L0,-134 L12,-122 Z" fill="#C98F7E" />
          <circle cx={0} cy={-115} r={22 + 8 * Math.sin(t * 2)} fill="#FFDFA0" opacity={0.25 + 0.55 * h} filter="url(#s2b8)" />
        </g>
      </g>
      {/* the sea */}
      <path d={`M-20,${HOR} L${W + 20},${HOR} L${W + 20},${SHORE + 4} L-20,${SHORE + 4} Z`} fill="url(#s2seaF)" />
      <path d={`M-20,${HOR + 120} L${W + 20},${HOR + 120} L${W + 20},${SHORE + 4} L-20,${SHORE + 4} Z`} fill="url(#s2seaH)" opacity={0.85} />
      <path d={`M-20,${HOR} L${W + 20},${HOR} L${W + 20},${HOR + 16} L-20,${HOR + 16} Z`} fill="#FFFFFF" opacity={0.18} />
      {Array.from({ length: 26 }, (_, i) => {
        const y = HOR + 14 + Math.pow(rnd(i), 1.4) * (SHORE - HOR - 40), w = 10 + (y - HOR) * 0.2;
        const x = wx(1700, 0.3) + (rnd(i + 3) - 0.5) * (40 + (y - HOR) * 0.9) + 6 * Math.sin(t * 2 + i);
        return <path key={i} d={`M${x - w / 2},${y} l${w},0`} stroke="#FFF6DE" strokeWidth={3} strokeLinecap="round" opacity={(0.2 + 0.6 * h) * (0.5 + 0.5 * Math.sin(t * 3 + i * 1.7))} />;
      })}
      {/* wave rows: choppy where the sea is restless, long and glassy in the cove */}
      {Array.from({ length: 9 }, (_, r) => {
        const k = r / 8, y0 = lerp(HOR + 24, SHORE - 34, Math.pow(k, 1.35));
        let d = `M-20,${y0}`;
        for (let x = -20; x <= W + 20; x += 18) {
          const c = chopAt(x + cam);
          const amp = (2 + 12 * k) * (0.2 + 0.8 * c), len = lerp(70, 210, k) * (1 + 0.9 * (1 - c)), sp = (1.6 + 3.4 * c) * (0.5 + k);
          d += ` L${x},${(y0 - amp * Math.max(0, Math.sin(((x + cam) + f * sp + r * 90) / len * Math.PI * 2))).toFixed(1)}`;
        }
        return <path key={r} d={d} stroke="#FFFFFF" strokeWidth={2 + 3 * k} fill="none" strokeLinejoin="round" opacity={(0.35 + 0.4 * k) * 0.8} />;
      })}
      {/* sand + moving waterline */}
      <path d={`M-20,${SHORE} L${W + 20},${SHORE} L${W + 20},${H} L-20,${H} Z`} fill="url(#s2sand)" />
      {(() => {
        const edge = (x: number) => washAt(x + cam, f) + 8 * Math.sin((x + cam) / 120 + t * 1.6) + 5 * Math.sin((x + cam) / 47 - t * 1.7) * (0.3 + 0.7 * chopAt(x + cam));
        let foam = ""; for (let x = W + 20; x >= -20; x -= 20) foam += ` L${x},${edge(x).toFixed(1)}`;
        let line = `M-20,${edge(-20)}`; for (let x = 0; x <= W + 20; x += 20) line += ` L${x},${edge(x).toFixed(1)}`;
        return <g>
          <path d={`M-20,${SHORE - 6} L${W + 20},${SHORE - 6} L${W + 20},${SHORE + 30} L-20,${SHORE + 30} Z`} fill={wet} opacity={0.7} />
          <path d={`M-20,${SHORE - 4} L${W + 20},${SHORE - 4}` + foam + " Z"} fill="url(#s2seaH)" opacity={0.78} />
          <path d={line} stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.85} />
          <path d={line} stroke="#FFFFFF" strokeWidth={24} fill="none" opacity={0.25} filter="url(#s2b4)" />
          {Array.from({ length: 30 }, (_, i) => { const x = rnd(i) * W; return <circle key={i} cx={x} cy={edge(x) - 6 - 8 * rnd(i + 2)} r={2 + 3 * rnd(i + 4)} fill="#FFFFFF" opacity={0.6} />; })}
        </g>;
      })()}
      {/* splash droplets when the waves catch it */}
      {[T.splash1, T.splash2].map((s, j) => Array.from({ length: 14 }, (_, i) => {
        const p = seg01(f, s - 2, s + 22); if (p <= 0 || p >= 1) return null;
        const x0 = wx(j ? 460 : 330) + 30, a = -Math.PI / 2 + (rnd(i + j * 20) - 0.5) * 2.2, v = 120 + 160 * rnd(i + 5);
        return <circle key={`sp${j}${i}`} cx={x0 + Math.cos(a) * v * p} cy={GR - 20 + Math.sin(a) * v * p + 260 * p * p} r={4 + 4 * rnd(i)} fill="#FFFFFF" opacity={0.85 * (1 - p)} />;
      }))}
      {/* sand details */}
      <g transform={`translate(${-cam} 0)`}>
        {[[160, 1690, 0], [700, 1730, 1], [380, 1820, 2], [930, 1700, 1], [1290, 1760, 0], [1720, 1840, 2], [1950, 1700, 0], [2080, 1800, 1]].map(([x, y, k], i) => (
          <g key={`sh${i}`} transform={`translate(${x},${y}) rotate(${i * 40})`}>
            {k === 0 && <g><path d="M-14,6 C-14,-10 14,-10 14,6 Z" fill={col(h, "#F1E7DD", "#FCE3DA")} /><path d="M-8,5 L-4,-5 M0,6 L0,-7 M8,5 L4,-5" stroke={col(h, "#D9CBBE", "#EDBFAF")} strokeWidth={1.6} /></g>}
            {k === 1 && <ellipse rx={9} ry={6} fill={col(h, "#D9D2C6", "#E6D8C7")} />}
            {k === 2 && <path d="M0,-12 L3,-3 L12,-3 L5,3 L8,12 L0,6 L-8,12 L-5,3 L-12,-3 L-3,-3 Z" fill={col(h, "#E8D3BF", "#F6B98E")} transform="scale(0.9)" />}
          </g>
        ))}
        {Array.from({ length: 12 }, (_, i) => <path key={`rp${i}`} d={`M${60 + i * 180},${1670 + (i % 3) * 70} q30,-8 60,0 q30,8 60,0`} stroke={col(h, "#D2C6B3", "#E8CDA7")} strokeWidth={2.4} fill="none" opacity={0.6} />)}
        {/* footprints along its walk */}
        {Array.from({ length: 14 }, (_, i) => {
          const x = 330 + i * 80; if (x > sx - 40) return null;
          return <ellipse key={`fp${i}`} cx={x} cy={GR + 14 + (i % 2) * 10} rx={10} ry={5} fill={wet} opacity={0.55} />;
        })}
      </g>
      {/* the soul */}
      <g transform={`translate(${wx(sx)} ${GR}) scale(${SCALE}) translate(${-sx} ${-GR})`}>
        <ellipse cx={f > T.lie0 ? (rig.hip.x + rig.neck.x) / 2 + 10 : (rig.legs[0].foot.x + rig.legs[1].foot.x) / 2} cy={GR + 6} rx={f > T.lie0 ? 110 : 62} ry={10} fill="#9C8F7A" opacity={0.2} filter="url(#s2b4)" />
        <g filter="url(#s2b16)" opacity={0.3 + 0.6 * light}><Body r={rig} fill="#F8C9AE" back="#F8C9AE" /></g>
        {/* lying back: arms folded behind the head, drawn with a soft edge so the elbows read */}
        {f > T.lie0 + 8 && [0, 1].map((i) => { const sh = rig.arms[i].sh, hc = rig.head; const o = Math.min(1, (f - T.lie0 - 8) / 14);
          const el = i ? { x: hc.x + 34, y: hc.y - 50 } : { x: hc.x - 50, y: hc.y - 26 }, hd = { x: hc.x - 22, y: hc.y - 2 };
          const d = `M${sh.x},${sh.y} L${el.x},${el.y} L${hd.x},${hd.y}`;
          return <g key={`la${i}`} opacity={o} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d={d} stroke="#E6D4C0" strokeWidth={23} />
            <path d={d} stroke={i ? "#FFFBF4" : "#F6ECE0"} strokeWidth={18} />
          </g>; })}
        <Body r={rig} fill="#FFFBF4" back="#F2E7DA" face={{ f, mood }} />
        <g transform={`translate(${rig.neck.x + (rig.hip.x - rig.neck.x) * 0.32 + 7} ${rig.neck.y + (rig.hip.y - rig.neck.y) * 0.32})`}>
          <path d="M0,-11 C7,-4 8,4 0,10 C-8,4 -7,-4 0,-11 Z" transform={`scale(${2 + 2.4 * light + 0.25 * Math.sin(t * 3)})`} fill="#FFC98F" opacity={0.2 + 0.55 * light} filter="url(#s2b4)" />
          <path d="M0,-11 C7,-4 8,4 0,10 C-8,4 -7,-4 0,-11 Z" transform={`scale(${0.5 + 0.5 * light})`} fill="#FFD7A6" opacity={0.45 + 0.55 * light} />
        </g>
      </g>
      {/* a happy little "z" once it's resting */}
      {f > T.wiggle + 30 && [0, 1, 2].map((i) => { const p = ((f - T.wiggle - 30) / 60 + i / 3) % 1;
        return <text key={i} x={wx(sx) - 120 + 30 * p} y={GR - 140 - 120 * p} fontFamily="Caveat" fontSize={40 + 10 * i} fill="#9A8A7E" opacity={Math.sin(Math.PI * p) * 0.6}>z</text>; })}
      {/* dunes with sea grass and flowers (drift with the camera) */}
      <g transform={`translate(${-cam} 0)`}>
        {[[-40, 1], [1000, -1], [1300, 1], [2120, -1]].map(([x0, d], k) => (
          <path key={k} d={`M${x0},1920 L${x0},1790 C${x0 + 100 * d},1762 ${x0 + 210 * d},1772 ${x0 + 290 * d},1830 C${x0 + 330 * d},1860 ${x0 + 350 * d},1895 ${x0 + 360 * d},1920 Z`} fill={dune} />
        ))}
        {Array.from({ length: 110 }, (_, i) => {
          const zones = [[-10, 280], [700, 990], [1310, 1600], [1830, 2120]], z = zones[i % 4];
          const x = z[0] + rnd(i) * (z[1] - z[0]), y = 1810 + rnd(i + 3) * 100;
          const c = chopAt(x), len = 24 + rnd(i + 5) * 40, b = (6 + 10 * c) * Math.sin(t * (1 + c) + x / 70) + 6;
          return <path key={i} d={`M${x},${y} q${b * 0.4},${-len * 0.55} ${b},${-len}`} stroke={i % 3 ? grassC : col(h, "#B3BBA6", "#A9D88E")} strokeWidth={3} fill="none" strokeLinecap="round" />;
        })}
        {Array.from({ length: 22 }, (_, i) => {
          const x = [40, 760, 1360, 1880][i % 4] + rnd(i) * 220, y = 1840 + rnd(i + 2) * 60;
          const g = clamp01((1 - chopAt(x)) * 1.2 - rnd(i) * 0.2);
          return <g key={`fl${i}`} transform={`translate(${x},${y}) rotate(${4 * Math.sin(t + i)})`}>
            <path d="M0,0 q-1,-8 0,-18" stroke={grassC} strokeWidth={2.2} fill="none" />
            <g transform="translate(0,-18)">{g > 0.05 ? <Flower s={0.95 * g} c={["#F2866F", "#F6D46B", "#B9A5E3", "#FFF4E2"][i % 4]} /> : <ellipse rx={2.6} ry={4} fill="#D2C9B4" />}</g>
          </g>;
        })}
      </g>
      {Array.from({ length: 16 }, (_, i) => {
        const per = 6 + rnd(i) * 4, p = ((t + rnd(i + 1) * per) % per) / per;
        return <circle key={`m${i}`} cx={100 + rnd(i + 2) * 880 + 30 * Math.sin(p * 6 + i)} cy={1560 - p * 480} r={3} fill="#FFF3D6" opacity={h * Math.sin(p * Math.PI) * 0.8} />;
      })}
    </g>
  );
};
