// Reel 5: the road. Shadow figures walk past and ahead; the soul breathes, points up, and walks on at its own pace.
import React from "react";
import { interpolateColors } from "remotion";
import { Body } from "../master/World";
import { clamp01, GROUND, lerp, SCALE, seg01, solve, sstep } from "../master/pose";
import { breathAt, couple, healAt, lightAt, moodAt, promo, Shadow, SG, SSC, soulPose, soulX, T } from "./beats";

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

export const RoadWorld: React.FC<{ f: number }> = ({ f }) => {
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
  const breath = breathAt(f);
  const sw = (pt: { x: number; y: number }, x: number) => ({ x: x + (pt.x - x) * SSC, y: SG + (pt.y - SG) * SSC });
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
      {[[960, 0.52], [96, 0.38]].map(([tx, sc], ti) => {
        const sway = 0.8 * Math.sin(t * 0.8 + ti) + 0.35 * Math.sin(t * 1.7 + 1 + ti);
        const cc = { d: col(h, "#9DAE93", "#6DAE62"), m: col(h, "#AEBCA5", "#89C677"), l: col(h, "#C1CBB8", "#B3E09A") };
        const clusters = [[-10, 990, 160, 1, "d"], [-140, 1060, 118, 2, "d"], [130, 1050, 126, 3, "d"], [-80, 920, 118, 4, "m"], [70, 925, 122, 5, "m"], [0, 860, 100, 6, "l"],
          [-185, 985, 88, 7, "m"], [180, 975, 92, 8, "m"], [10, 1110, 112, 9, "d"], [-60, 1020, 70, 10, "l"], [90, 1000, 70, 11, "l"]] as const;
        return (
          <g key={ti} transform={`translate(${tx} 1462) scale(${sc}) translate(0 -1550)`}>
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
                  const b = clamp01((f - T.point1 - 10 - i * 1.5) / 16);
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
        const y = rnd(i + 12) > 0.45 ? 1622 + rnd(i + 13) * 70 : 1800 + rnd(i + 14) * 110;
        const g = sstep(clamp01((h - 0.3 - rnd(i) * 0.4) / 0.2));
        const c = ["#F2866F", "#F6D46B", "#B9A5E3", "#FFF4E2", "#F7A072"][(i + patch) % 5];
        const sw = 2.4 * gust(x);
        return <g key={`wf${i}`} transform={`translate(${x},${y}) rotate(${sw})`}>
          <path d={`M0,0 q-1,-8 0,-18`} stroke={grassC} strokeWidth={2.2} fill="none" />
          <g transform="translate(0,-18)">{g > 0.02 ? <Flower s={(0.6 + 0.4 * rnd(i + 5)) * g * (1 + 0.2 * Math.sin(Math.PI * g))} c={c} /> : <ellipse rx={2.6} ry={4} fill={col(h, "#C9C3B6", "#E9C9A6")} />}</g>
        </g>;
      })}

      {/* the road the soul stands on, and a little signpost pointing ahead */}
      {(() => {
        const top: [number, number][] = [], bot: [number, number][] = [];
        for (let x = -80; x <= 1160; x += 40) { top.push([x, 1458 + 8 * Math.sin(x / 210 + 1)]); bot.unshift([x, 1604 + 6 * Math.sin(x / 160)]); }
        const d = smooth([...top, ...bot]);
        return <g>
          <path d={d} fill={col(h, "#DCD4C7", "#F4E3C8")} />
          <path d={d} fill="url(#horizon)" opacity={0.4} />
          {Array.from({ length: 16 }, (_, i) => { const x = i * 72 + 20 * rnd(i); return <path key={`rt${i}`} d={`M${x},${1528 + 6 * Math.sin(i)} l${36 + 20 * rnd(i + 3)},0`} stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" opacity={0.28} />; })}
          {Array.from({ length: 22 }, (_, i) => <ellipse key={`pb${i}`} cx={rnd(i + 70) * 1100} cy={rnd(i + 71) > 0.5 ? 1466 + rnd(i + 72) * 16 : 1586 + rnd(i + 73) * 14} rx={5 + 5 * rnd(i + 74)} ry={3 + 2 * rnd(i + 75)} fill={col(h, "#C9C1B5", "#DCC8AE")} />)}
          <g transform="translate(990 1462)">
            <rect x={-5} y={-120} width={10} height={124} rx={4} fill="#A58D7B" />
            <path d="M-6,-112 L52,-112 L68,-98 L52,-84 L-6,-84 Z" fill={col(h, "#CDBBA8", "#E7C79E")} />
          </g>
        </g>;
      })()}
      {/* shadow figures passing by on the road, with their little tags */}
      {(() => {
        const draw = (s: Shadow, k: string) => {
          const r = solve(s.p, s.x, SG);
          return <g key={k} transform={`translate(${s.x} ${SG}) scale(${SSC}) translate(${-s.x} ${-SG})`}>
            <ellipse cx={(r.legs[0].foot.x + r.legs[1].foot.x) / 2} cy={SG + 6} rx={56} ry={8} fill="#6F7461" opacity={0.18} filter="url(#mb4)" />
            <Body r={r} fill="#ABA7BB" back="#9C98AE" />
          </g>;
        };
        const tag = (x: number, y: number, label: string, icon: "heart" | "star", k: string) => {
          const w = label.length * 22 + 84;
          return <g key={k} transform={`translate(${x} ${y + 4 * Math.sin(t * 3 + x / 90)})`}>
            <line x1={0} y1={33} x2={0} y2={60} stroke="#C9B48A" strokeWidth={2} opacity={0.7} />
            <rect x={-w / 2} y={-33} width={w} height={66} rx={33} fill="#FFF8EE" opacity={0.95} stroke="#E4CF9F" strokeWidth={2} />
            {icon === "heart"
              ? <path d="M0,4 C-12,-6 -10,-16 -3,-16 C0,-16 0,-13 0,-12 C0,-13 0,-16 3,-16 C10,-16 12,-6 0,4 Z" transform={`translate(${-w / 2 + 36} 4) scale(1.6)`} fill="#E8908A" />
              : <path d="M0,-12 L3,-3 L12,-3 L5,3 L8,12 L0,6 L-8,12 L-5,3 L-12,-3 L-3,-3 Z" transform={`translate(${-w / 2 + 36} 0) scale(1.3)`} fill="#E3B65A" />}
            <text x={18} y={14} textAnchor="middle" fontFamily="Caveat" fontWeight={700} fontSize={46} fill="#9A7A3A">{label}</text>
          </g>;
        };
        const out: React.ReactNode[] = [];
        const c = couple(f);
        if (c) {
          const [lead, part] = c, rl = solve(lead.p, lead.x, SG), rp = solve(part.p, part.x, SG);
          out.push(draw(part, "cp"), draw(lead, "cl"));
          const hl = sw(rl.arms[0].hand, lead.x), hp = sw(rp.arms[1].hand, part.x);
          out.push(<circle key="clasp" cx={(hl.x + hp.x) / 2} cy={(hl.y + hp.y) / 2} r={13} fill="#ABA7BB" />);
          const h1 = sw(rl.head, lead.x), h2 = sw(rp.head, part.x);
          for (let i = 0; i < 4; i++) { const q = ((f - T.coupleIn) / 50 + i / 4) % 1; out.push(<path key={`ht${i}`} d="M0,4 C-12,-6 -10,-16 -3,-16 C0,-16 0,-13 0,-12 C0,-13 0,-16 3,-16 C10,-16 12,-6 0,4 Z" transform={`translate(${(hl.x + hp.x) / 2 + 20 * Math.sin(q * 6 + i)} ${(hl.y + hp.y) / 2 - 30 - 160 * q}) scale(${1 + 0.4 * q})`} fill="#F0A39C" opacity={0.8 * Math.sin(Math.PI * q)} />); }
          out.push(tag((h1.x + h2.x) / 2, Math.min(h1.y, h2.y) - 110, "Just Married", "heart", "tc"));
        }
        const pr = promo(f);
        if (pr) {
          const r = solve(pr.p, pr.x, SG); out.push(draw(pr, "pr"));
          const hd = sw(r.arms[1].hand, pr.x);
          out.push(<g key="letter" transform={`translate(${hd.x + 18} ${hd.y - 6}) rotate(${-8 + 3 * Math.sin(t * 4)})`}>
            <rect x={-30} y={-21} width={60} height={42} rx={4} fill="#FFFDF6" stroke="#E4D8C2" strokeWidth={2} />
            <path d="M-30,-21 L0,3 L30,-21" stroke="#D9C9AE" strokeWidth={2.4} fill="none" />
            <circle cx={0} cy={3} r={6} fill="#D9A84E" />
          </g>);
          const h1 = sw(r.head, pr.x);
          out.push(tag(h1.x, h1.y - 110, "Promotion", "star", "tp"));
        }
        return <g opacity={0.92}>{out}</g>;
      })()}
      {/* the soul */}
      <g transform={`translate(${xa} ${GROUND}) scale(${SCALE}) translate(${-xa} ${-GROUND})`}>
        <ellipse cx={(ra.legs[0].foot.x + ra.legs[1].foot.x) / 2} cy={GROUND + 6} rx={62} ry={9} fill="#6F8461" opacity={0.2} filter="url(#mb4)" />
        <g filter="url(#mb16)" opacity={0.3 + 0.6 * light}><Body r={ra} fill="#F8C9AE" back="#F8C9AE" /></g>
        <Body r={ra} fill="#FFFBF4" back="#F2E7DA" face={{ f, mood }} />
        <g transform={`translate(${ra.neck.x + (ra.hip.x - ra.neck.x) * 0.32 + 7} ${ra.neck.y + (ra.hip.y - ra.neck.y) * 0.32})`}>
          <path d="M0,-11 C7,-4 8,4 0,10 C-8,4 -7,-4 0,-11 Z" transform={`scale(${2 + 2.4 * light + 1.6 * breath + 0.25 * Math.sin(t * 3)})`} fill="#FFC98F" opacity={0.2 + 0.55 * light} filter="url(#mb4)" />
          <path d="M0,-11 C7,-4 8,4 0,10 C-8,4 -7,-4 0,-11 Z" transform={`scale(${0.5 + 0.5 * light})`} fill="#FFD7A6" opacity={0.45 + 0.55 * light} />
        </g>
      </g>

      {/* breath out: a soft swirl of air leaves the soul */}
      {f > T.out0 && f < T.out1 + 20 && (() => { const p = seg01(f, T.out0, T.out1 + 20); const hd = { x: xa + (ra.head.x - xa) * SCALE, y: GROUND + (ra.head.y - GROUND) * SCALE };
        return <path d={`M${hd.x + 50 + 80 * p},${hd.y - 10 - 60 * p} c26,-24 54,-22 60,4 c4,18 -16,26 -24,12`} stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.75 * Math.sin(Math.PI * p)} />; })()}
      {/* while pointing: a little trail of light travels from the hand up to the words */}
      {f > T.point1 - 6 && f < T.pointEnd + 10 && (() => { const hd = { x: xa + (ra.arms[1].hand.x - xa) * SCALE, y: GROUND + (ra.arms[1].hand.y - GROUND) * SCALE };
        return Array.from({ length: 9 }, (_, i) => { const p = ((f - T.point1 + 6) / 34 + i / 9) % 1; const o = Math.sin(Math.PI * p) * (1 - seg01(f, T.pointEnd - 8, T.pointEnd + 10));
          return <g key={`sp${i}`} transform={`translate(${lerp(hd.x, 560, p) + 14 * Math.sin(p * 9 + i)},${lerp(hd.y - 10, 760, p)})`} opacity={o}><circle r={10} fill="#FFD27A" opacity={0.4} filter="url(#mb4)" /><circle r={3.2} fill="#FFF3D0" /></g>; }); })()}
      {/* grass in front, moving with the wind */}
      {Array.from({ length: 520 }, (_, i) => {
        const x = rnd(i) * 1160 - 40, y = 1612 + Math.pow(rnd(i + 3), 0.8) * 310;
        if (y > 1700 && y < 1772) return null;
        const len = (14 + rnd(i + 5) * 26) * (0.8 + (y - 1610) / 400);
        const b = (gust(x) + 0.6) * (5 + rnd(i + 7) * 5) + 1.5;
        return <path key={i} d={`M${x},${y} q${b * 0.4},${-len * 0.55} ${b},${-len}`} stroke={i % 3 ? grassC : grassL} strokeWidth={2.6 + rnd(i) * 1.4} fill="none" strokeLinecap="round" />;
      })}

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
