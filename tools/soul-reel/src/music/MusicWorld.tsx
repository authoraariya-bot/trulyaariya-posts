// Reel 7: the meadow where a grey soul rants and ours walks off to its own music (camera follows).
import React from "react";
import { interpolateColors } from "remotion";
import { Body } from "../master/World";
import { clamp01, GROUND, lerp, SCALE, seg01, smoother, solve, sstep } from "../master/pose";
import { AX0, BUBBLES, BX, camX, healAt, lightAt, moodAt, frontRig, ranterOpacity, ranterPose, ranterX, soulDir, soulHop, soulPose, soulX, sideEar, T, view } from "./beats";

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

export const MusicWorld: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30, h = healAt(f);
  const xa = soulX(f);
  const ra = solve(soulPose(f), xa, GROUND, soulHop(f));
  const cam = camX(f);
  const mood = moodAt(f), light = lightAt(f);
  const gust = (x: number) => 0.6 * Math.sin(t * 0.9 + x / 140) + 0.4 * Math.sin(t * 1.7 + x / 60);
  // daylight palette of the Paper Boat: muted → warm and glowing
  const skyTop = col(h, "#E5E1E3", "#B9DDF2"), skyMid = col(h, "#E8E0DE", "#F9E2D6"), skyLow = col(h, "#E4E3DC", "#FFEFD2");
  const far = col(h, "#D6D6DF", "#C4C2E6"), far2 = col(h, "#D8DBD8", "#B9DCC2");
  const mid = col(h, "#CCD4C6", "#A6D597"), near = col(h, "#BCC7B2", "#8EC97E");
  const mead1 = col(h, "#B9C3AE", "#A9D893"), mead2 = col(h, "#A9B59F", "#7FBE6C");
  const grassC = col(h, "#9EA996", "#6FAE5E"), grassL = col(h, "#B0B9A6", "#9BD27F");
  const water = col(h, "#B4C0C4", "#8CCDE6");
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
      <g transform={`translate(${6 * Math.sin(t * 0.2) - cam * 0.25} 0)`}><path d={ridge(1150, 115, 2, -400, 1160, 20, 0.7)} fill={far} /></g>
      <g filter="url(#mb16)" opacity={0.75}><ellipse cx={420 + t * 14} cy={1212} rx={700} ry={42} fill={skyLow} /></g>
      <g transform={`translate(${10 * Math.sin(t * 0.25 + 1) - cam * 0.45} 0)`}>
        <path d={ridge(1262, 70, 5, -600, 1160, 20)} fill={far2} />
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
      <g transform={`translate(${14 * Math.sin(t * 0.3 + 2) - cam * 0.65} 0)`}>
        <path d={ridge(1340, 60, 8, -800, 1160, 20, 1.3)} fill={mid} />
        {[80, 420, 610, 900, -230, -560].map((x, i) => (
          <g key={i} transform={`translate(${x},${1302 + 8 * Math.sin(i * 2)}) rotate(${0.8 * gust(x)} 0 40)`}>
            <path d="M-3,44 L-2,0 L2,0 L3,44Z" fill="#AE9988" />
            <path d={blob(0, -14, 28, i + 1, 1.7)} fill={near} />
            <path d={blob(-7, -22, 15, i + 3, 1.6)} fill={col(h, "#C9D1BE", "#C7DDB6")} opacity={0.8} />
          </g>
        ))}
      </g>
      <g transform={`translate(${-cam * 0.85} 0)`}><path d={ridge(1430, 42, 11, -900, 1160, 20, 1.1)} fill={near} /></g>
      <g transform={`translate(${-cam} 0)`}>

      {/* hero tree on the right, layered sway */}
      {[[968, 0.6], [92, 0.42], [-430, 0.52], [-880, 0.44]].map(([tx, sc], ti) => {
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
                  const b = clamp01((f - T.click - 60 - i * 1.5) / 16);
                  return <g key={`b${i}`} transform={`translate(${Math.cos(a2) * 200 * d},${990 + Math.sin(a2) * 150 * d}) rotate(${i * 37 + t * 10})`}><Flower s={1.3 * Math.pow(b, 0.7) * (1 + 0.25 * Math.sin(Math.PI * b))} c={["#FCE4DA", "#FFF3EA", "#F6D8C6"][i % 3]} /></g>;
                })}
              </g>
            </g>
          </g>
        );
      })}

      {/* meadow */}
      <path d={ridge(1508, 14, 3, -1100, 1160, 30, 0.8)} fill="url(#mmead)" />
      <g filter="url(#mb40)" opacity={0.3 + 0.3 * h}>
        <ellipse cx={480 + t * 18} cy={1700} rx={420} ry={60} fill="#F6F0D2" />
      </g>
      {/* the stream in front, catching the moonlight */}
      {(() => {
        const sy = (x: number) => 1736 + 10 * Math.sin(x / 170 + 1) + 5 * Math.sin(x / 61);
        const top: [number, number][] = [], bot: [number, number][] = [];
        for (let x = -1100; x <= 1140; x += 30) { const w = 22 + 7 * Math.sin(x / 90); top.push([x, sy(x) - w]); bot.unshift([x, sy(x) + w]); }
        const d = smooth([...top, ...bot]);
        return (
          <g>
            <path d={d} fill={water} />
            <path d={d} fill="#FFFFFF" opacity={0.12} />
            {Array.from({ length: 60 }, (_, i) => {
              const x = ((i * 71 + f * (0.8 + 1.8 * h)) % 2240) - 1100;
              return <path key={i} d={`M${x},${sy(x) - 8 + (i % 3) * 7} l${20 + 16 * rnd(i)},0`} stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" opacity={(0.25 + 0.45 * h) * (0.6 + 0.4 * Math.sin(t * 2 + i))} />;
            })}
          </g>
        );
      })()}
      {/* stones */}
      {[[60, 1690, 18, 0.55], [430, 1776, 14, 0.6], [1010, 1690, 20, 0.5], [-380, 1690, 16, 0.55], [-760, 1776, 18, 0.5]].map(([x, y, r, q], i) => <path key={i} d={blob(x, y, r, i + 2, q)} fill={col(h, "#D2CEC6", "#DCD3C6")} />)}

      {/* wildflowers: closed buds in the dusk, opening as the moon rises */}
      {Array.from({ length: 220 }, (_, i) => {
        const patch = i % 12, cx = -1010 + patch * 180 + rnd(patch) * 60;
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

      {/* the ranting grey soul (faces left, toward ours) */}
      {(() => {
        const bx = ranterX(f), rr = solve(ranterPose(f), bx), op = ranterOpacity(f);
        const ha = rr.headAng, talk = f > T.rant0 ? 0.5 + 0.5 * Math.sin(f / 1.7) : 0.2;
        return <g opacity={op} transform={`translate(${bx} ${GROUND}) scale(${-SCALE} ${SCALE}) translate(${-bx} ${-GROUND})`}>
          <ellipse cx={(rr.legs[0].foot.x + rr.legs[1].foot.x) / 2} cy={GROUND + 6} rx={58} ry={8} fill="#6F7461" opacity={0.2} filter="url(#mb4)" />
          <Body r={rr} fill="#A9A3B6" back="#9A94A9" />
          <g transform={`translate(${rr.head.x} ${rr.head.y}) rotate(${ha})`}>
            <path d="M-6,-12 L6,-6 M12,-6 L24,-13" stroke="#5E566B" strokeWidth={3} strokeLinecap="round" />
            <ellipse cx={-1} cy={-1} rx={3} ry={3} fill="#5E566B" /><ellipse cx={17} cy={-1} rx={3} ry={3} fill="#5E566B" />
            <ellipse cx={10} cy={15} rx={5 + 2 * talk} ry={2 + 6 * talk} fill="#5E566B" />
          </g>
          {/* little puffs of steam when it stamps */}
          {f > T.rant0 && [0, 1].map((k) => { const p = (((f - T.rant0) / 26 + k * 0.5) % 1); return <circle key={k} cx={rr.head.x - 10 + 30 * k + 6 * p} cy={rr.head.y - 50 - 40 * p} r={6 + 8 * p} fill="#FFFFFF" opacity={0.5 * (1 - p)} />; })}
        </g>;
      })()}
      {/* angry scribble-bubbles drifting at our soul; once the music is on they shrink and pop */}
      {BUBBLES.map((b, i) => {
        const age = f - b.t0, life = 50; if (age < 0 || age > life + 10) return null;
        const u = age / life, popAt = T.click + (i % 4) * 3;
        const popped = b.t0 < T.click ? smoother(seg01(f, popAt, popAt + 8)) : 0;
        const late = b.t0 >= T.click ? 0.45 : 1;
        const s = 1.45 * late * Math.min(1, sstep(age / 8) * 1.08) * (1 - popped) * (1 - smoother(seg01(age, life, life + 10)));
        const x = lerp(BX - 110, AX0 + 170, u) + 20 * Math.sin(i * 2.3), y = 1030 - 30 * u + 30 * Math.sin(i * 1.7 + u * 3) - (i % 3) * 40;
        const pts = Array.from({ length: 18 }, (_, k) => { const a = (k / 18) * Math.PI * 2, r = k % 2 ? 56 : 70; return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a) * 0.72).toFixed(1)}`; }).join(" ");
        return <g key={`bb${i}`}>
          {s > 0.01 && <g transform={`translate(${x} ${y}) scale(${s}) rotate(${6 * Math.sin(f / 3 + i)})`} opacity={b.t0 >= T.click ? 0.5 : 1}>
            <polygon points={pts} fill="#FFF3EC" stroke={b.t0 >= T.click ? "#BDB6C6" : "#D99891"} strokeWidth={3.5} strokeLinejoin="round" />
            {b.kind === 3
              ? <g><path d="M-30,6 C-36,-14 -12,-22 -4,-12 C2,-26 30,-22 28,-4 C40,-2 38,14 26,14 L-24,14 C-36,14 -38,6 -30,6 Z" fill="#9C96A8" /><path d="M2,14 L-6,30 L4,28 L-2,44" stroke="#E7B54F" strokeWidth={4} fill="none" strokeLinejoin="round" /></g>
              : <text x={0} y={12} textAnchor="middle" fontFamily="Jost" fontWeight={800} fontSize={34} fill={b.t0 >= T.click ? "#9F98A8" : "#B65F58"}>{b.sym}</text>}
          </g>}
          {popped > 0 && popped < 1 && <circle cx={x} cy={y} r={30 + 50 * popped} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={1 - popped} />}
        </g>;
      })}
      {/* the soul, with its wired earphones */}
      {(() => {
        const v = view(f), P2 = (p: { x: number; y: number }) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        const sag = (a: { x: number; y: number }, b: { x: number; y: number }, s: number) => `M${P2(a)} Q${((a.x + b.x) / 2).toFixed(1)},${(Math.max(a.y, b.y) + s).toFixed(1)} ${P2(b)}`;
        const up = (a: { x: number; y: number }, b: { x: number; y: number }) => `M${P2(a)} C${a.x.toFixed(1)},${(a.y - 26).toFixed(1)} ${b.x.toFixed(1)},${(b.y + 34).toFixed(1)} ${P2(b)}`;
        const bud = (p: { x: number; y: number }, k: string) => <g key={k} transform={`translate(${p.x} ${p.y})`}><circle r={6} fill="#B9A3F2" /><circle cx={-1.6} cy={-1.6} r={2.2} fill="#F1EAFF" /></g>;
        const player = (p: { x: number; y: number }) => <g transform={`translate(${p.x} ${p.y}) rotate(-6)`}>
          <rect x={-11} y={-17} width={22} height={34} rx={6} fill="#9B86DE" />
          <rect x={-8} y={-14} width={16} height={18} rx={3} fill="#F4EEFF" />
          <circle cx={0} cy={10} r={4} fill="#F4EEFF" />
          {f > T.click && <path d="M-3,-9 L-3,-1 M-3,-9 L3,-11 L3,-3" stroke="#B9A3F2" strokeWidth={1.6} fill="none" />}
        </g>;
        const glow = (cx: number, cy: number) => <g transform={`translate(${cx} ${cy})`}>
          <path d="M0,-11 C7,-4 8,4 0,10 C-8,4 -7,-4 0,-11 Z" transform={`scale(${2 + 2.4 * light + 0.25 * Math.sin(t * 3)})`} fill="#FFC98F" opacity={0.2 + 0.55 * light} filter="url(#mb4)" />
          <path d="M0,-11 C7,-4 8,4 0,10 C-8,4 -7,-4 0,-11 Z" transform={`scale(${0.5 + 0.5 * light})`} fill="#FFD7A6" opacity={0.45 + 0.55 * light} />
        </g>;
        if (v.front) {
          const r = frontRig(f, xa), { hip, neck, head } = r;
          const torso = `M${hip.x - 24},${hip.y} C${hip.x - 32},${hip.y - 44} ${neck.x - 30},${neck.y + 34} ${neck.x - 20},${neck.y} Q${neck.x},${neck.y - 14} ${neck.x + 20},${neck.y} C${neck.x + 30},${neck.y + 34} ${hip.x + 32},${hip.y - 44} ${hip.x + 24},${hip.y} Q${hip.x},${hip.y + 20} ${hip.x - 24},${hip.y} Z`;
          const blink = [262, 330].reduce((a, b) => { const d = f - b; return d >= 0 && d < 6 ? Math.min(a, Math.abs(d - 2.5) / 3) : a; }, 1);
          const joy = sstep((mood - 0.55) / 0.4), sad = 1 - sstep(mood / 0.45), c = lerp(-5, 7, mood);
          const armP = (a: typeof r.aR) => `M${P2(a.sh)} L${P2(a.el)} L${P2(a.hand)}`;
          const body = (fill: string) => <g strokeLinecap="round" strokeLinejoin="round" fill="none">
            {[-1, 1].map((sd) => <path key={`lg${sd}`} d={`M${hip.x + 12 * sd},${hip.y + 6} L${hip.x + 14 * sd},${GROUND - 8}`} stroke={fill} strokeWidth={27} />)}
            {[-1, 1].map((sd) => <ellipse key={`ft${sd}`} cx={hip.x + 18 * sd} cy={GROUND - 4} rx={15} ry={9} fill={fill} />)}
            <path d={torso} fill={fill} />
            <ellipse cx={head.x} cy={head.y} rx={33} ry={36} fill={fill} />
          </g>;
          return <g transform={`translate(${xa} ${GROUND}) scale(${SCALE * v.sx} ${SCALE}) translate(${-xa} ${-GROUND})`}>
            <ellipse cx={xa} cy={GROUND + 6} rx={58} ry={9} fill="#6F8461" opacity={0.2} filter="url(#mb4)" />
            <g filter="url(#mb16)" opacity={0.3 + 0.6 * light}>{body("#F8C9AE")}</g>
            {body("#FFFBF4")}
            {glow(neck.x, neck.y + 30)}
            {/* face, looking at us */}
            <g transform={`translate(${head.x} ${head.y})`}>
              {[-1, 1].map((sd) => <ellipse key={`bl${sd}`} cx={19 * sd} cy={9} rx={6} ry={3.6} fill="#F4A8A0" opacity={0.45 * mood} />)}
              {[-1, 1].map((sd) => <g key={`ey${sd}`}>
                <ellipse cx={10 * sd} cy={-1 + 2.5 * sad} rx={3.4} ry={Math.max(0.5, 4.5 * (1 - 0.4 * sad) * blink)} fill="#5F4C48" opacity={1 - joy} />
                <path d={`M${10 * sd - 5},1 Q${10 * sd},-5 ${10 * sd + 5},1`} stroke="#5F4C48" strokeWidth={2.3} fill="none" strokeLinecap="round" opacity={joy} />
              </g>)}
              <path d={`M-6,15 Q0,${15 + c} 6,15`} stroke="#B97A6E" strokeWidth={2.4} fill={joy > 0.5 ? "#D99487" : "none"} fillOpacity={0.5 * joy} strokeLinecap="round" />
            </g>
            {/* wires go over the chest, up each side of the neck to the ears */}
            <g fill="none" stroke="#8F7BD6" strokeWidth={2.6} strokeLinecap="round">
              <path d={sag(r.jack, r.split, 8)} />
              <path d={up(r.split, r.budR)} /><path d={up(r.split, r.budL)} />
            </g>
            {bud(r.budR, "bR")}{bud(r.budL, "bL")}
            {/* arms, with a soft edge so hands never melt into the body */}
            {[r.aR, r.aL].map((a, i) => <g key={`fa${i}`} strokeLinecap="round" strokeLinejoin="round" fill="none"><path d={armP(a)} stroke="#E6D3C2" strokeWidth={23} /><path d={armP(a)} stroke="#FFFBF4" strokeWidth={18} /></g>)}
            {player(r.player)}
          </g>;
        }
        const e = sideEar(ra, f > T.lift1);
        return <g transform={`translate(${xa} ${GROUND}) scale(${SCALE * v.dir * v.sx} ${SCALE}) translate(${-xa} ${-GROUND})`}>
          <ellipse cx={(ra.legs[0].foot.x + ra.legs[1].foot.x) / 2} cy={GROUND + 6} rx={62} ry={9} fill="#6F8461" opacity={0.2} filter="url(#mb4)" />
          <g filter="url(#mb16)" opacity={0.3 + 0.6 * light}><Body r={ra} fill="#F8C9AE" back="#F8C9AE" /></g>
          <Body r={ra} fill="#FFFBF4" back="#F2E7DA" face={{ f, mood }} />
          {glow(ra.neck.x + (ra.hip.x - ra.neck.x) * 0.32 + 7, ra.neck.y + (ra.hip.y - ra.neck.y) * 0.32)}
          <g fill="none" stroke="#8F7BD6" strokeWidth={2.6} strokeLinecap="round">
            <path d={e.hide2 ? `M${P2(e.jack)} Q${(e.jack.x + 10).toFixed(1)},${(e.jack.y - 20).toFixed(1)} ${P2(e.split)}` : sag(e.jack, e.split, 6)} />
            <path d={e.hide2 ? up(e.split, e.bud1) : sag(e.split, e.bud1, 4)} />
            <path d={e.hide2 ? up(e.split, e.bud2) : sag(e.split, e.bud2, 4)} />
          </g>
          {!e.hide2 && bud(e.bud2, "s2")}
          {bud(e.bud1, "s1")}
          {player(e.player)}
        </g>;
      })()}
      {/* music notes floating up from the earphones */}
      {f > T.click && Array.from({ length: 22 }, (_, i) => {
        const st = T.click + 4 + i * 11; if (f < st) return null; const p = (f - st) / 60; if (p > 1) return null;
        const dir = soulDir(st), hx = soulX(st) + (ra.head.x - xa) * SCALE * dir, hy = GROUND + (ra.head.y - GROUND) * SCALE;
        const x = hx + (i % 2 ? 30 : -30) + 40 * Math.sin(p * 5 + i) + 60 * p * (i % 2 ? 1 : -1), y = hy - 30 - 230 * p;
        const c = ["#E8B64F", "#F2A2A8", "#B9A3F2", "#7FC8A6"][i % 4];
        return <g key={`nt${i}`} transform={`translate(${x} ${y}) rotate(${12 * Math.sin(p * 6 + i)}) scale(${0.9 + 0.5 * Math.sin(Math.PI * p)})`} opacity={Math.sin(Math.PI * p)}>
          <ellipse cx={0} cy={0} rx={9} ry={7} transform="rotate(-20)" fill={c} />
          <path d={i % 3 ? "M8,-2 L8,-34 Q20,-28 22,-16" : "M8,-2 L8,-34 L30,-38 L30,-6"} stroke={c} strokeWidth={3.5} fill="none" strokeLinecap="round" />
          {i % 3 === 0 && <ellipse cx={22} cy={-4} rx={9} ry={7} transform="rotate(-20 22 -4)" fill={c} />}
        </g>;
      })}
      {/* grass in front, moving with the wind */}
      {Array.from({ length: 980 }, (_, i) => {
        const x = rnd(i) * 2260 - 1100, y = 1532 + Math.pow(rnd(i + 3), 0.8) * 390;
        if (y > 1700 && y < 1772) return null;
        const len = (14 + rnd(i + 5) * 26) * (0.7 + (y - 1530) / 400);
        const b = (gust(x) + 0.6) * (5 + rnd(i + 7) * 5) + 1.5;
        return <path key={i} d={`M${x},${y} q${b * 0.4},${-len * 0.55} ${b},${-len}`} stroke={i % 3 ? grassC : grassL} strokeWidth={2.6 + rnd(i) * 1.4} fill="none" strokeLinecap="round" />;
      })}

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
