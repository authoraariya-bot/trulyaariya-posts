// Reel 8: the tired tree, its roots, and the soul's own roots.
import React from "react";
import { interpolateColors } from "remotion";
import { Body } from "../master/World";
import { clamp01, GROUND, SCALE, seg01, smoother, solve, sstep } from "../master/pose";
import { bloomAt, camY, canDown, canTilt, cutAt, flowSoul, flowTree, healAt, lightAt, moodAt, ownRoots, rootGrow, rootWet, soulPose, soulX, T, treeHealth, treeLean, TX, X2 } from "./beats";

const W = 1080, H = 1920;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const col = (h: number, a: string, b: string) => interpolateColors(clamp01(h), [0, 1], [a, b]);
const smooth = (pts: [number, number][], closed = true) => {
  const n = pts.length; let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`; const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const q0 = !closed && i === 0 ? p1 : p0, q3 = !closed && i === n - 2 ? p2 : p3;
    d += ` C${(p1[0] + (p2[0] - q0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - q0[1]) / 6).toFixed(1)} ${(p2[0] - (q3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (q3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return closed ? d + "Z" : d;
};
const blob = (cx: number, cy: number, r: number, seed: number, sq = 0.8, wob = 0) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2, rr = r * (1 + 0.12 * Math.sin(a * 3 + seed) + 0.07 * Math.sin(a * 5 + seed * 2.3) + wob * Math.sin(a * 4 + seed * 7));
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a) * sq]);
  }
  return smooth(pts);
};
const ridge = (base: number, amp: number, seed: number, x0: number, x1: number, step = 24, freq = 1) => {
  let d = `M${x0},${H + 10}`;
  for (let x = x0; x <= x1; x += step) d += ` L${x},${(base - amp * (0.55 * Math.sin((x / 300) * freq + seed) + 0.3 * Math.sin((x / 130) * freq + seed * 2) + 0.15 * Math.sin((x / 57) * freq + seed))).toFixed(1)}`;
  return d + ` L${x1},${H + 10} Z`;
};
const petal = "M0,-7 C5,-5 5,4 0,7 C-5,4 -5,-5 0,-7 Z";
const Flower: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <g transform={`scale(${s})`}>
    {[0, 72, 144, 216, 288].map((a) => <path key={a} d={petal} fill={c} transform={`rotate(${a}) translate(0,-7)`} />)}
    <circle r={2.6} fill="#EBC67F" />
  </g>
);

export const RootsWorld: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30, h = healAt(f);
  const xa = soulX(f);
  const ra = solve(soulPose(f), xa);
  const mood = moodAt(f), light = lightAt(f);
  const gust = (x: number) => 0.6 * Math.sin(t * 0.9 + x / 140) + 0.4 * Math.sin(t * 1.7 + x / 60);
  // daylight palette of the Paper Boat: muted → warm and glowing
  const skyTop = col(h, "#E5E1E3", "#B9DDF2"), skyMid = col(h, "#E8E0DE", "#F9E2D6"), skyLow = col(h, "#E4E3DC", "#FFEFD2");
  const far = col(h, "#D6D6DF", "#C4C2E6"), far2 = col(h, "#D8DBD8", "#B9DCC2");
  const mid = col(h, "#CCD4C6", "#A6D597"), near = col(h, "#BCC7B2", "#8EC97E");
  const mead1 = col(h, "#B9C3AE", "#A9D893"), mead2 = col(h, "#A9B59F", "#7FBE6C");
  const grassC = col(h, "#9EA996", "#6FAE5E"), grassL = col(h, "#B0B9A6", "#9BD27F");
  const water = col(h, "#B4C0C4", "#8CCDE6");
  const cam = camY(f), cut = cutAt(f);
  return (
    <g>
      <defs>
        <linearGradient id="msky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={skyTop} /><stop offset="0.48" stopColor={skyMid} /><stop offset="0.68" stopColor={skyLow} /></linearGradient>
        <linearGradient id="mmead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mead1} /><stop offset="1" stopColor={mead2} /></linearGradient>
        <linearGradient id="mtrunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#B39A86" /><stop offset="1" stopColor="#937B6A" /></linearGradient>
        <radialGradient id="moonFace" cx="0.4" cy="0.38" r="0.7"><stop offset="0" stopColor="#FFFDF5" /><stop offset="0.7" stopColor="#FFF4DC" /><stop offset="1" stopColor="#F7E6C4" /></radialGradient>
        <radialGradient id="horizon" cx="0.5" cy="0.62" r="0.6"><stop offset="0" stopColor="#FFEBD0" stopOpacity={0.55 + 0.35 * h} /><stop offset="1" stopColor="#FFEBD0" stopOpacity={0} /></radialGradient>
        <filter id="mb4" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id="mb8" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="mb16" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16" /></filter>
        <filter id="mb40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
      </defs>

      {/* sky, warm horizon glow, faint first stars */}
      <rect width={W} height={H} fill="url(#msky)" />
      <rect width={W} height={H} fill="url(#horizon)" />
      <g transform={`translate(0 ${-cam})`}>
      {[[140, 210, 1.0], [640, 150, 0.8], [1150, 260, 1.1], [1600, 190, 0.9]].map(([x, y, s], i) => {
        const cx = ((x + t * 11 + 400) % 2000) - 400;
        return (
          <g key={i} transform={`translate(${cx},${y + 660}) scale(${s})`} filter="url(#mb8)" opacity={0.82}>
            <ellipse cx={0} cy={0} rx={120} ry={30} fill={col(h, "#F7F4F6", "#FFF8F0")} />
            <ellipse cx={-40} cy={-20} rx={60} ry={34} fill={col(h, "#F7F4F6", "#FFF8F0")} />
            <ellipse cx={35} cy={-26} rx={70} ry={40} fill={col(h, "#F7F4F6", "#FFF8F0")} />
          </g>
        );
      })}

      {/* layered hills (each layer breathes with the wind at its own pace) */}
      <g transform={`translate(${6 * Math.sin(t * 0.2)} 0)`}><path d={ridge(1150, 115, 2, -60, 1160, 20, 0.7)} fill={far} /></g>
      <g filter="url(#mb16)" opacity={0.75}><ellipse cx={420 + t * 14} cy={1212} rx={700} ry={42} fill={skyLow} /></g>
      <g transform={`translate(${10 * Math.sin(t * 0.25 + 1)} 0)`}>
        <path d={ridge(1262, 70, 5, -60, 1160, 20)} fill={far2} />
        {/* a little cottage with a warm window on the far hill */}
        <g transform="translate(190 1206)">
          <circle cx={6} cy={-14} r={36} fill="#FFD9A0" opacity={0.35 + 0.35 * h} filter="url(#mb8)" />
          <path d="M-26,0 L-26,-24 L0,-44 L26,-24 L26,0 Z" fill={col(h, "#E6DDD5", "#F7EADF")} />
          <path d="M-32,-22 L0,-48 L32,-22" stroke={col(h, "#B9A49A", "#C98F7E")} strokeWidth={7} fill="none" strokeLinejoin="round" />
          <rect x={-2} y={-22} width={13} height={12} rx={2} fill="#FFCF7D" opacity={0.85 + 0.15 * Math.sin(t * 2)} />
          <rect x={14} y={-56} width={7} height={14} fill={col(h, "#B9A49A", "#C98F7E")} />
          {[0, 1, 2].map((k) => { const p = ((t * 0.4 + k / 3) % 1); return <circle key={k} cx={18 + 8 * p + 3 * Math.sin(p * 6)} cy={-62 - 40 * p} r={4 + 6 * p} fill="#FFFFFF" opacity={0.35 * (1 - p)} />; })}
        </g>
      </g>
      <g transform={`translate(${14 * Math.sin(t * 0.3 + 2)} 0)`}>
        <path d={ridge(1340, 60, 8, -60, 1160, 20, 1.3)} fill={mid} />
        {[80, 420, 610, 900].map((x, i) => (
          <g key={i} transform={`translate(${x},${1302 + 8 * Math.sin(i * 2)}) rotate(${0.8 * gust(x)} 0 40)`}>
            <path d="M-3,44 L-2,0 L2,0 L3,44Z" fill="#AE9988" />
            <path d={blob(0, -14, 28, i + 1, 1.7)} fill={near} />
            <path d={blob(-7, -22, 15, i + 3, 1.6)} fill={col(h, "#C9D1BE", "#C7DDB6")} opacity={0.8} />
          </g>
        ))}
      </g>
      <path d={ridge(1430, 42, 11, -60, 1160, 20, 1.1)} fill={near} />

      {/* hero tree on the right, layered sway */}
      {[[92, 0.42]].map(([tx, sc], ti) => {
        const sway = 0.8 * Math.sin(t * 0.8 + ti) + 0.35 * Math.sin(t * 1.7 + 1 + ti);
        const cc = { d: col(h, "#9DAE93", "#6DAE62"), m: col(h, "#AEBCA5", "#89C677"), l: col(h, "#C1CBB8", "#B3E09A") };
        const clusters = [[-10, 990, 160, 1, "d"], [-140, 1060, 118, 2, "d"], [130, 1050, 126, 3, "d"], [-80, 920, 118, 4, "m"], [70, 925, 122, 5, "m"], [0, 860, 100, 6, "l"],
          [-185, 985, 88, 7, "m"], [180, 975, 92, 8, "m"], [10, 1110, 112, 9, "d"], [-60, 1020, 70, 10, "l"], [90, 1000, 70, 11, "l"]] as const;
        return (
          <g key={ti} transform={`translate(${tx} 1550) scale(${sc}) translate(0 -1550)`}>
            <ellipse cx={0} cy={1548} rx={260} ry={22} fill="#7F946F" opacity={0.18} filter="url(#mb16)" />
            <g transform={`rotate(${0.4 * sway} 0 1550)`}>
              <path d="M-16,1550 C-12,1440 -24,1320 -8,1170 L12,1170 C8,1320 22,1440 26,1550 Z" fill="url(#mtrunk)" />
              <path d="M-6,1300 C-50,1250 -95,1215 -140,1195 L-136,1186 C-88,1202 -40,1236 2,1282 Z" fill="#A58D7B" />
              <path d="M10,1255 C46,1205 92,1180 136,1166 L140,1175 C98,1190 58,1222 22,1268 Z" fill="#A58D7B" />
              <g transform={`rotate(${1.0 * sway} 0 1290)`}>
                {clusters.map(([x, y, r, sd, k], i) => (
                  <path key={i} d={blob(x + 2.5 * Math.sin(t * (2.2 + (i % 3) * 0.4) + i), y + Math.cos(t * 1.4 + i) * 2, r, sd + ti * 3, 0.82, 0.02 * Math.sin(t * 2.4 + i))} fill={cc[k]} />
                ))}
                {/* a few warm fairy-light blossoms that wake with the moon */}
                {ti === 0 && Array.from({ length: 22 }, (_, i) => {
                  const a2 = rnd(i) * Math.PI * 2, d = Math.sqrt(rnd(i + 40));
                  const b = clamp01((f - T.bloom0 - i * 1.5) / 16);
                  return <g key={`b${i}`} transform={`translate(${Math.cos(a2) * 200 * d},${990 + Math.sin(a2) * 150 * d}) rotate(${i * 37 + t * 10})`}><Flower s={1.3 * Math.pow(b, 0.7) * (1 + 0.25 * Math.sin(Math.PI * b))} c={["#FCE4DA", "#FFF3EA", "#F6D8C6"][i % 3]} /></g>;
                })}
              </g>
            </g>
          </g>
        );
      })}

      {/* meadow */}
      <path d={ridge(1508, 14, 3, -60, 1160, 30, 0.8)} fill="url(#mmead)" />
      <g filter="url(#mb40)" opacity={0.3 + 0.3 * h}>
        <ellipse cx={480 + t * 18} cy={1700} rx={420} ry={60} fill="#F6F0D2" />
      </g>
      {/* the stream in front, catching the moonlight */}
      {(() => {
        const sy = (x: number) => 1736 + 10 * Math.sin(x / 170 + 1) + 5 * Math.sin(x / 61);
        const top: [number, number][] = [], bot: [number, number][] = [];
        for (let x = -60; x <= 1140; x += 30) { const w = 22 + 7 * Math.sin(x / 90); top.push([x, sy(x) - w]); bot.unshift([x, sy(x) + w]); }
        const d = smooth([...top, ...bot]);
        return (
          <g>
            <path d={d} fill={water} />
            <path d={d} fill="#FFFFFF" opacity={0.12} />
            {Array.from({ length: 34 }, (_, i) => {
              const x = ((i * 71 + f * (0.8 + 1.8 * h)) % 1200) - 60;
              return <path key={i} d={`M${x},${sy(x) - 8 + (i % 3) * 7} l${20 + 16 * rnd(i)},0`} stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" opacity={(0.25 + 0.45 * h) * (0.6 + 0.4 * Math.sin(t * 2 + i))} />;
            })}
          </g>
        );
      })()}
      {/* stones */}
      {[[60, 1690, 18, 0.55], [430, 1776, 14, 0.6], [1010, 1690, 20, 0.5]].map(([x, y, r, q], i) => <path key={i} d={blob(x, y, r, i + 2, q)} fill={col(h, "#D2CEC6", "#DCD3C6")} />)}

      {/* wildflowers: closed buds in the dusk, opening as the moon rises */}
      {Array.from({ length: 120 }, (_, i) => {
        const patch = i % 6, cx = 90 + patch * 180 + rnd(patch) * 60;
        const x = cx + (rnd(i + 11) - 0.5) * 220;
        const y = rnd(i + 12) > 0.45 ? 1560 + rnd(i + 13) * 120 : 1800 + rnd(i + 14) * 110;
        const g = sstep(clamp01((h - 0.3 - rnd(i) * 0.4) / 0.2));
        const c = ["#F2866F", "#F6D46B", "#B9A5E3", "#FFF4E2", "#F7A072"][(i + patch) % 5];
        const sw = 2.4 * gust(x);
        return <g key={`wf${i}`} transform={`translate(${x},${y}) rotate(${sw})`}>
          <path d={`M0,0 q-1,-8 0,-18`} stroke={grassC} strokeWidth={2.2} fill="none" />
          <g transform="translate(0,-18)">{g > 0.02 ? <Flower s={(0.6 + 0.4 * rnd(i + 5)) * g * (1 + 0.2 * Math.sin(Math.PI * g))} c={c} /> : <ellipse rx={2.6} ry={4} fill={col(h, "#C9C3B6", "#E9C9A6")} />}</g>
        </g>;
      })}

      {/* the big tree: tired and leaning at first, standing tall and blossoming at the end */}
      {(() => {
        const th = treeHealth(f), lean = treeLean(f), bl = bloomAt(f);
        const sway = (0.8 * Math.sin(t * 0.8) + 0.35 * Math.sin(t * 1.7 + 1)) * (0.6 + 0.4 * th);
        const cc = { d: col(th, "#B3B29A", "#6DAE62"), m: col(th, "#C2C0A8", "#89C677"), l: col(th, "#D1CDB6", "#B3E09A") };
        const clusters = [[-10, 990, 160, 1, "d"], [-140, 1060, 118, 2, "d"], [130, 1050, 126, 3, "d"], [-80, 920, 118, 4, "m"], [70, 925, 122, 5, "m"], [0, 860, 100, 6, "l"],
          [-185, 985, 88, 7, "m"], [180, 975, 92, 8, "m"], [10, 1110, 112, 9, "d"], [-60, 1020, 70, 10, "l"], [90, 1000, 70, 11, "l"]] as const;
        const sc = 0.82, droop = 1 - th;
        return <g transform={`translate(${TX} 1550) scale(${sc}) translate(0 -1550)`}>
          <ellipse cx={0} cy={1548} rx={260} ry={22} fill="#7F946F" opacity={0.18} filter="url(#mb16)" />
          <g transform={`rotate(${lean + 0.4 * sway} 0 1550)`}>
            <path d="M-18,1550 C-14,1440 -26,1320 -10,1170 L14,1170 C10,1320 24,1440 28,1550 Z" fill="url(#mtrunk)" />
            <path d="M-6,1300 C-50,1250 -95,1215 -140,1195 L-136,1186 C-88,1202 -40,1236 2,1282 Z" fill="#A58D7B" />
            <path d="M10,1255 C46,1205 92,1180 136,1166 L140,1175 C98,1190 58,1222 22,1268 Z" fill="#A58D7B" />
            <g transform={`rotate(${1.0 * sway} 0 1290) translate(0 ${18 * droop}) translate(0 1290) scale(${1 - 0.1 * droop} ${1 - 0.14 * droop}) translate(0 -1290)`}>
              {clusters.map(([x, y, r, sd, k], i) => (
                <path key={i} d={blob(x + 2.5 * Math.sin(t * (2.2 + (i % 3) * 0.4) + i), y + Math.cos(t * 1.4 + i) * 2, r * (0.86 + 0.14 * th), sd + 3, 0.82, 0.02 * Math.sin(t * 2.4 + i))} fill={cc[k]} />
              ))}
              {Array.from({ length: 34 }, (_, i) => {
                const a2 = rnd(i) * Math.PI * 2, d = Math.sqrt(rnd(i + 40)), b = clamp01((bl * 50 - i * 1.1) / 8);
                return <g key={`b${i}`} transform={`translate(${Math.cos(a2) * 210 * d},${990 + Math.sin(a2) * 150 * d}) rotate(${i * 37 + t * 10})`}><Flower s={1.5 * Math.pow(b, 0.7) * (1 + 0.25 * Math.sin(Math.PI * b))} c={["#F6CFCB", "#FCE4DA", "#EFC0C6", "#FFF3EA"][i % 4]} /></g>;
              })}
            </g>
          </g>
        </g>;
      })()}
      {/* pale leaves dropping from the tired tree */}
      {Array.from({ length: 9 }, (_, i) => { const st = 4 + i * 22; if (f < st || f > T.green0) return null; const p = (f - st) / 90; if (p > 1) return null;
        return <path key={`lf${i}`} d="M0,0 C8,-8 20,-8 26,0 C20,8 8,8 0,0 Z" fill="#CFC9A6" opacity={Math.min(1, (1 - p) * 3)} transform={`translate(${TX - 160 + rnd(i + 3) * 320 + 40 * Math.sin(p * 6 + i)},${1040 + rnd(i + 5) * 120 + p * 500}) rotate(${p * 300 + i * 50})`} />; })}
      {/* petals once it blossoms */}
      {Array.from({ length: 22 }, (_, i) => { const st = T.bloom0 + 16 + i * 4; if (f < st) return null; const p = (f - st) / 130; if (p > 1) return null;
        return <path key={`pt${i}`} d="M0,-7 C5,-5 5,4 0,7 C-5,4 -5,-5 0,-7 Z" fill={i % 2 ? "#F6CFCB" : "#FCE4DA"} opacity={Math.min(1, (1 - p) * 2)} transform={`translate(${TX - 230 + rnd(i + 30) * 460 + p * 120 + 30 * Math.sin(p * 7 + i)},${980 + rnd(i + 50) * 200 + p * 520}) rotate(${p * 420 + i * 30}) scale(1.5)`} />; })}
      {/* the soul */}
      <g transform={`translate(${xa} ${GROUND}) scale(${SCALE}) translate(${-xa} ${-GROUND})`}>
        <ellipse cx={(ra.legs[0].foot.x + ra.legs[1].foot.x) / 2} cy={GROUND + 6} rx={62} ry={9} fill="#6F8461" opacity={0.2} filter="url(#mb4)" />
        <g filter="url(#mb16)" opacity={0.3 + 0.6 * light}><Body r={ra} fill="#F8C9AE" back="#F8C9AE" /></g>
        <Body r={ra} fill="#FFFBF4" back="#F2E7DA" face={{ f, mood }} />
        <g transform={`translate(${ra.neck.x + (ra.hip.x - ra.neck.x) * 0.32 + 7} ${ra.neck.y + (ra.hip.y - ra.neck.y) * 0.32})`}>
          <path d="M0,-11 C7,-4 8,4 0,10 C-8,4 -7,-4 0,-11 Z" transform={`scale(${2 + 2.4 * light + 0.25 * Math.sin(t * 3)})`} fill="#FFC98F" opacity={0.2 + 0.55 * light} filter="url(#mb4)" />
          <path d="M0,-11 C7,-4 8,4 0,10 C-8,4 -7,-4 0,-11 Z" transform={`scale(${0.5 + 0.5 * light})`} fill="#FFD7A6" opacity={0.45 + 0.55 * light} />
        </g>
      </g>

      {/* the watering can and its water */}
      {(() => {
        const hd = { x: xa + (ra.arms[1].hand.x - xa) * SCALE, y: GROUND + (ra.arms[1].hand.y - GROUND) * SCALE };
        const down = canDown(f), tilt = canTilt(f);
        const at = down ? { x: X2 + 128, y: GROUND - 14 } : { x: hd.x + 8, y: hd.y + 20 };
        const rad = (tilt * Math.PI) / 180, spout = { x: at.x + 40 * Math.cos(rad) + 14 * Math.sin(rad), y: at.y - 14 * Math.cos(rad) + 40 * Math.sin(rad) };
        const drops: React.ReactNode[] = [];
        if (f > T.spray0 && f < T.lower0 + 30) for (let i = 0; i < 64; i++) {
          const st = T.spray0 + 6 + i * 0.66; if (st > T.lower0 - 4 || f < st) continue; const p = (f - st) / 22;
          const E = { x: TX - 150 + 300 * rnd(i + 60), y: 1010 + 110 * rnd(i + 61) };
          if (p < 1) { const mx = (spout.x + E.x) / 2, my = Math.min(spout.y, E.y) - 130; const x = (1 - p) * (1 - p) * spout.x + 2 * p * (1 - p) * mx + p * p * E.x, y = (1 - p) * (1 - p) * spout.y + 2 * p * (1 - p) * my + p * p * E.y;
            drops.push(<ellipse key={`sd${i}`} cx={x} cy={y} rx={4.4} ry={6} fill="#9FD4EC" opacity={0.95} />); }
          else if (p < 2.2) { const q = (p - 1) / 1.2; drops.push(<ellipse key={`dr${i}`} cx={E.x} cy={E.y + 40 + 120 * q * q} rx={3} ry={5} fill="#9FD4EC" opacity={0.8 * (1 - q)} />); }
        }
        if (f > T.pour0 && f < T.pour1 + 20) for (let i = 0; i < 24; i++) {
          const st = T.pour0 + 8 + i * 1.6; if (st > T.pour1 - 4 || f < st) continue; const p = (f - st) / 12; if (p > 1) continue;
          drops.push(<ellipse key={`pd${i}`} cx={spout.x + 6 + 14 * p} cy={spout.y + (GROUND - spout.y) * p * p} rx={3.4} ry={6} fill="#9FD4EC" opacity={0.9} />);
          if (p > 0.85) drops.push(<circle key={`ps${i}`} cx={spout.x + 20} cy={GROUND - 2} r={6 + 14 * (p - 0.85) / 0.15} fill="none" stroke="#CFEAF6" strokeWidth={2} opacity={1 - (p - 0.85) / 0.15} />);
        }
        const pouring = f > T.pour0 + 8 && f < T.pour1 - 2 ? Math.min(1, (f - T.pour0 - 8) / 6, (T.pour1 - 2 - f) / 6) : 0;
        if (pouring > 0) drops.unshift(<path key="stream" d={`M${spout.x + 3},${spout.y + 2} Q${spout.x + 16},${spout.y + 20} ${spout.x + 18},${GROUND - 2}`} stroke="#A9DAF0" strokeWidth={7 * pouring} fill="none" strokeLinecap="round" opacity={0.85} />);
        return <g>
          <g transform={`translate(${at.x} ${at.y}) rotate(${tilt})`}>
            <path d="M-6,-18 C-4,-40 26,-40 28,-18" stroke="#6FB5AD" strokeWidth={6} fill="none" strokeLinecap="round" />
            <path d="M16,-4 L44,-18 L46,-13 L20,4 Z" fill="#79BDB5" />
            <ellipse cx={46} cy={-16} rx={6} ry={4} fill="#6FB5AD" transform="rotate(-28 46 -16)" />
            <rect x={-20} y={-20} width={44} height={40} rx={10} fill="#8CCFC7" />
            <rect x={-14} y={-12} width={10} height={24} rx={4} fill="#FFFFFF" opacity={0.3} />
          </g>
          {drops}
        </g>;
      })()}
      {/* grass in front, moving with the wind */}
      {Array.from({ length: 520 }, (_, i) => {
        const x = rnd(i) * 1160 - 40, y = 1532 + Math.pow(rnd(i + 3), 0.8) * 390;
        if (y > 1700 && y < 1772) return null;
        const len = (14 + rnd(i + 5) * 26) * (0.7 + (y - 1530) / 400);
        const b = (gust(x) + 0.6) * (5 + rnd(i + 7) * 5) + 1.5;
        return <path key={i} d={`M${x},${y} q${b * 0.4},${-len * 0.55} ${b},${-len}`} stroke={i % 3 ? grassC : grassL} strokeWidth={2.6 + rnd(i) * 1.4} fill="none" strokeLinecap="round" />;
      })}

      {/* the underground cut-away: soil, the tree's roots, and the soul's own roots */}
      {cut > 0.01 && (() => {
        const wet = rootWet(f), grow = rootGrow(f), own = ownRoots(f), fs = flowSoul(f), ft = flowTree(f);
        const fsOn = Math.sin(Math.PI * clamp01(fs * 1.2)) * (f < T.camUp0 ? 1 : 0.5), ftOn = clamp01(ft * 3) * (1 - smoother(seg01(f, T.bloom0, T.bloom1)) * 0.6);
        const TR = ["M0,0 C-30,60 -90,110 -170,170", "M0,0 C20,70 90,120 190,150", "M0,0 C-5,90 10,180 -10,290", "M-10,30 C-60,80 -120,90 -230,90",
          "M10,30 C60,70 140,80 250,70", "M-20,120 C-40,180 -80,220 -120,300", "M20,120 C50,190 90,230 110,320", "M-90,110 C-120,140 -150,190 -150,250", "M100,120 C140,150 180,200 200,250"];
        const SR = ["M0,0 C-6,50 -30,110 -60,180", "M0,0 C24,60 60,110 110,150", "M-6,10 C-40,40 -80,60 -120,70"];
        const rootC = col(grow, col(wet, "#B3AAA0", "#9C8E80"), "#8E6A4E");
        return <g opacity={cut}>
          <defs><linearGradient id="soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col(h, "#D6B796", "#DDB48C")} /><stop offset="1" stopColor={col(h, "#C2A080", "#C79A72")} /></linearGradient></defs>
          <path d={`M-80,1556 ${Array.from({ length: 31 }, (_, i) => `L${-80 + i * 42},${1556 + 4 * Math.sin(i * 1.7)}`).join(" ")} L1180,2600 L-80,2600 Z`} fill="url(#soil)" />
          {[1640, 1760, 1900, 2050].map((y, i) => <path key={`band${i}`} d={`M-80,${y} ${Array.from({ length: 13 }, (_, k) => `Q${-40 + k * 100},${y + 14 * Math.sin(k + i)} ${10 + k * 100},${y}`).join(" ")}`} stroke="#FFFFFF" strokeWidth={3} opacity={0.12} fill="none" />)}
          {Array.from({ length: 40 }, (_, i) => <ellipse key={`pe${i}`} cx={rnd(i + 200) * 1100} cy={1590 + rnd(i + 201) * 600} rx={5 + 8 * rnd(i + 202)} ry={4 + 5 * rnd(i + 203)} fill={col(h, "#C9B19A", "#D9BC98")} opacity={0.8} />)}
          {/* a grassy lip along the cut edge */}
          <path d={`M-80,1560 ${Array.from({ length: 60 }, (_, i) => `L${-80 + i * 21},${1552 - 10 * rnd(i + 300)} L${-70 + i * 21},${1560}`).join(" ")} L1180,1566 L-80,1566 Z`} fill={col(h, "#9EB28F", "#7FBE6C")} />
          {/* water seeping down to the roots */}
          {f > T.seep0 && [0, 1, 2, 3, 4].map((k) => { const p = smoother(seg01(f, T.seep0 + k * 4, T.seep1)); const x0 = 600 + k * 22;
            return <path key={`sp${k}`} d={`M${x0},1562 C${x0 + 10},${1562 + 60 * p} ${x0 - 12},${1562 + 110 * p} ${x0 + 4 + 6 * k},${1562 + 170 * p}`} stroke="#9FD4EC" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.65 * (1 - smoother(seg01(f, T.wet1, T.wet1 + 30)))} />; })}
          {/* the tree's roots: thin, grey and dry → thick, brown and spreading */}
          <g transform={`translate(${TX} 1560)`} fill="none" strokeLinecap="round">
            {TR.map((d, i) => { const rev = (i < 5 ? 0.6 : 0.2) + (i < 5 ? 0.4 : 0.8) * grow;
              return <g key={`tr${i}`}>
                <path d={d} pathLength={1} strokeDasharray={`${rev} 2`} stroke={rootC} strokeWidth={(i < 5 ? 5 : 3.5) + (i < 5 ? 9 : 5) * grow} />
                <path d={d} pathLength={1} strokeDasharray={`${rev * 0.92} 2`} stroke="#FFFFFF" strokeWidth={1.6 + 2 * grow} opacity={0.18} transform="translate(-2 -2)" />
                {grow < 0.5 && <path d={d} pathLength={1} strokeDasharray="0.012 0.09" stroke={col(h, "#E6DED4", "#E6DED4")} strokeWidth={2} opacity={0.8 * (1 - grow * 2)} />}
                {ftOn > 0.01 && <path d={d} pathLength={1} strokeDasharray="0.05 0.11" strokeDashoffset={-((f - T.flowTree0) / 40) - i * 0.07} stroke="#FFE6A6" strokeWidth={5} opacity={ftOn * clamp01(rev)} filter="url(#mb4)" />}
                {ftOn > 0.01 && <path d={d} pathLength={1} strokeDasharray="0.05 0.11" strokeDashoffset={-((f - T.flowTree0) / 40) - i * 0.07} stroke="#FFF6DA" strokeWidth={2.4} opacity={ftOn} />}
              </g>; })}
          </g>
          {/* the soul's own roots, under its knees */}
          <g transform={`translate(${X2 + 10} 1560)`} fill="none" strokeLinecap="round">
            {SR.map((d, i) => <g key={`sr${i}`}>
              <path d={d} pathLength={1} strokeDasharray={`${own} 2`} stroke={col(clamp01(fs * 2), "#E9DCCB", "#F3C98C")} strokeWidth={3 + 4 * clamp01(fs * 2)} opacity={0.55 + 0.45 * clamp01(fs * 2)} />
              {fsOn > 0.01 && <path d={d} pathLength={1} strokeDasharray="0.06 0.1" strokeDashoffset={-((f - T.flowSoul0) / 30) - i * 0.1} stroke="#FFE6A6" strokeWidth={7} opacity={fsOn} filter="url(#mb4)" />}
              {fsOn > 0.01 && <path d={d} pathLength={1} strokeDasharray="0.06 0.1" strokeDashoffset={-((f - T.flowSoul0) / 30) - i * 0.1} stroke="#FFF8E4" strokeWidth={2.6} opacity={fsOn} />}
            </g>)}
          </g>
          {/* light gathering where the roots meet */}
          {fsOn + ftOn > 0.05 && <circle cx={612} cy={1700} r={30 + 10 * Math.sin(t * 4)} fill="#FFE2A0" opacity={0.35 * Math.max(fsOn, ftOn)} filter="url(#mb16)" />}
        </g>;
      })()}
      </g>
      {/* fireflies: a few in the dusk, many once the moon is up */}
      {Array.from({ length: 26 }, (_, i) => {
        const per = 7 + rnd(i) * 5, p = ((t + rnd(i + 1) * per) % per) / per;
        const x = 60 + rnd(i + 2) * 960 + 40 * Math.sin(p * 6 + i), y = 1660 - p * 560 + 20 * Math.sin(p * 9 + i);
        const on = i < 6 ? 1 : clamp01((h - 0.4) * 3);
        return <g key={`ff${i}`} transform={`translate(${x},${y})`} opacity={on * Math.sin(p * Math.PI) * (0.6 + 0.4 * Math.sin(t * 5 + i))}>
          <circle r={9} fill="#FFD27A" opacity={0.45} filter="url(#mb4)" /><circle r={2.6} fill="#FFF3D0" />
        </g>;
      })}
    </g>
  );
};
