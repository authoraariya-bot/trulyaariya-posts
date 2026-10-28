// Reel 9: on the hill, seen from behind.
import React from "react";
import { interpolateColors } from "remotion";
import { Body } from "../master/World";
import { clamp01, lerp, SCALE, seg01, smoother, solve, sstep } from "../master/pose";
import { backRig, BackRig, BUBBLES, friendSide, friendStand, friendTilt, friendView, friendX, FX, GX, glowFriend, glowOur, greySide, greyStand, greyBounce, greyView, greyX, healAt, ourDroop, ourTilt, OX, ranting, SEAT, T } from "./beats";

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
export const HillWorld: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30, h = healAt(f);
  const gust = (x: number) => 0.6 * Math.sin(t * 0.9 + x / 140) + 0.4 * Math.sin(t * 1.7 + x / 60);
  const skyTop = col(h, "#E5E1E3", "#B9DDF2"), skyMid = col(h, "#E8E0DE", "#F9E2D6"), skyLow = col(h, "#E4E3DC", "#FFEFD2");
  const far = col(h, "#D6D6DF", "#C4C2E6"), far2 = col(h, "#D8DBD8", "#B9DCC2");
  const mid = col(h, "#CCD4C6", "#A6D597"), near = col(h, "#BCC7B2", "#8EC97E");
  const grassC = col(h, "#9EA996", "#6FAE5E"), grassL = col(h, "#B0B9A6", "#9BD27F");
  const mead1 = col(h, "#B9C3AE", "#A9D893"), mead2 = col(h, "#A9B59F", "#7FBE6C");
  void FX;
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
      {/* a low sunset sun between the hills, warming as the friend stays */}
      <g transform={`translate(560 ${1200 - 30 * h})`}>
        <circle r={150} fill="#FFD9A6" opacity={0.25 + 0.3 * h} filter="url(#mb40)" />
        <circle r={62} fill={col(h, "#FBE7CF", "#FFD38E")} opacity={0.85} />
      </g>
      {[[960, 0.42], [120, 0.36]].map(([tx, sc], ti) => {
        const sway = 0.8 * Math.sin(t * 0.8 + ti) + 0.35 * Math.sin(t * 1.7 + 1 + ti);
        const cc = { d: col(h, "#9DAE93", "#6DAE62"), m: col(h, "#AEBCA5", "#89C677"), l: col(h, "#C1CBB8", "#B3E09A") };
        const clusters = [[-10, 990, 160, 1, "d"], [-140, 1060, 118, 2, "d"], [130, 1050, 126, 3, "d"], [-80, 920, 118, 4, "m"], [70, 925, 122, 5, "m"], [0, 860, 100, 6, "l"], [10, 1110, 112, 9, "d"]] as const;
        return <g key={`tr${ti}`} transform={`translate(${tx} 1462) scale(${sc}) translate(0 -1550)`}>
          <g transform={`rotate(${0.4 * sway} 0 1550)`}>
            <path d="M-16,1550 C-12,1440 -24,1320 -8,1170 L12,1170 C8,1320 22,1440 26,1550 Z" fill="url(#mtrunk)" />
            <g transform={`rotate(${1.0 * sway} 0 1290)`}>{clusters.map(([x, y, r, sd, k], i) => <path key={i} d={blob(x + 2.5 * Math.sin(t * 2.2 + i), y, r, sd + ti * 3, 0.82)} fill={cc[k]} />)}</g>
          </g>
        </g>;
      })}
      {/* the hill they sit on */}
      {(() => {
        const hy = (x: number) => SEAT + 2 + Math.pow((x - 540) / 560, 2) * 70;
        const top: [number, number][] = []; for (let x = -80; x <= 1160; x += 40) top.push([x, hy(x)]);
        const d = `M-80,1940 L${top.map((p) => p.join(",")).join(" L")} L1160,1940 Z`;
        return <g>
          <defs><linearGradient id="hillg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col(h, "#B4C3A6", "#9FD487")} /><stop offset="1" stopColor={col(h, "#9DAD90", "#79BC66")} /></linearGradient></defs>
          <path d={d} fill="url(#hillg)" />
          <path d={d} fill="url(#horizon)" opacity={0.35} />
          {Array.from({ length: 110 }, (_, i) => {
            const x = rnd(i + 7) * 1160 - 40, y = hy(x) + 60 + rnd(i + 8) * 300; const g = sstep(clamp01((h - 0.35 - rnd(i) * 0.35) / 0.2));
            const c = ["#F2866F", "#F6D46B", "#B9A5E3", "#FFF4E2", "#F7A072"][i % 5];
            return <g key={`wf${i}`} transform={`translate(${x},${y}) rotate(${2.4 * gust(x)})`}>
              <path d="M0,0 q-1,-8 0,-18" stroke={grassC} strokeWidth={2.2} fill="none" />
              <g transform="translate(0,-18)">{g > 0.02 ? <Flower s={(0.6 + 0.4 * rnd(i + 5)) * g} c={c} /> : <ellipse rx={2.6} ry={4} fill={col(h, "#C9C3B6", "#E9C9A6")} />}</g>
            </g>;
          })}
        </g>;
      })()}
      {/* the three souls */}
      {(() => {
        const breath = (k: number) => Math.sin((f / 30) * Math.PI * 2 / 3.8 + k);
        const P2 = (p: { x: number; y: number }) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        const backBody = (r: BackRig, fill: string, edge: string, glow: number, key: string, warm = "#F8C9AE", skipArm = -1) => {
          const { hip, neck0, head0, G } = r;
          const torso = `M${hip.x - 24},${hip.y} C${hip.x - 32},${hip.y - 44} ${neck0.x - 30},${neck0.y + 34} ${neck0.x - 20},${neck0.y} Q${neck0.x},${neck0.y - 14} ${neck0.x + 20},${neck0.y} C${neck0.x + 30},${neck0.y + 34} ${hip.x + 32},${hip.y - 44} ${hip.x + 24},${hip.y} Q${hip.x},${hip.y + 20} ${hip.x - 24},${hip.y} Z`;
          const shape = (c: string, withArms: boolean) => <g>
            {r.stand > 0.02 && [-1, 1].map((sd) => <g key={`lg${sd}`}><path d={`M${hip.x + 12 * sd},${hip.y + 6} L${hip.x + 14 * sd},${G - 8}`} stroke={c} strokeWidth={27} strokeLinecap="round" /><ellipse cx={hip.x + 18 * sd} cy={G - 4} rx={15} ry={9} fill={c} /></g>)}
            <ellipse cx={hip.x} cy={G - 13} rx={42} ry={16} fill={c} opacity={clamp01((0.7 - r.stand) / 0.4)} />
            <g transform={`rotate(${r.tilt} ${hip.x} ${hip.y})`}>
              <path d={torso} fill={c} />
              <ellipse cx={head0.x} cy={head0.y} rx={33} ry={36} fill={c} />
            </g>
            {withArms && r.arms.map((a, i) => { if (i === skipArm) return null; const d = `M${P2(a.sh)} L${P2(a.el)} L${P2(a.hand)}`; return <g key={`a${i}`} fill="none" strokeLinecap="round" strokeLinejoin="round"><path d={d} stroke={edge} strokeWidth={23} /><path d={d} stroke={c} strokeWidth={18} /></g>; })}
          </g>;
          return <g key={key}>
            <ellipse cx={hip.x} cy={G + 2} rx={60} ry={9} fill="#6F8461" opacity={0.2} filter="url(#mb4)" />
            <g filter="url(#mb16)" opacity={glow}>{shape(warm, false)}</g>
            {shape(fill, true)}
            {/* a soft crease at the nape so the head reads as seen from behind */}
            <g transform={`rotate(${r.tilt} ${hip.x} ${hip.y})`}><path d={`M${head0.x - 14},${head0.y + 30} Q${head0.x},${head0.y + 36} ${head0.x + 14},${head0.y + 30}`} stroke={edge} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} /></g>
          </g>;
        };
        const at = (x: number, sx: number, inner: React.ReactNode, key: string, o = 1) => <g key={key} opacity={o} transform={`translate(${x} ${SEAT}) scale(${SCALE * sx} ${SCALE}) translate(${-x} ${-SEAT})`}>{inner}</g>;
        const out: React.ReactNode[] = [];
        // our soul
        const our = backRig(OX, SEAT, { stand: 0, droop: clamp01(ourDroop(f) + 0.3) - 0.3, tilt: ourTilt(f), breath: breath(0) });
        // the friend
        const fv = friendView(f), fx = friendX(f);
        let friendNode: React.ReactNode = null, friendArm: React.ReactNode = null;
        if (f >= T.fIn0 - 2) {
          if (!fv.back) { const r = solve(friendSide(f), fx, SEAT); friendNode = at(fx, fv.sx * fv.dir, <g><ellipse cx={(r.legs[0].foot.x + r.legs[1].foot.x) / 2} cy={SEAT + 6} rx={58} ry={9} fill="#6F8461" opacity={0.2} filter="url(#mb4)" /><Body r={r} fill="#FFF0E2" back="#F2DCCB" face={{ f, mood: 0.85 }} /></g>, "fs"); }
          else {
            const ourSh = { x: OX + (our.arms[0].sh.x - OX) * SCALE, y: SEAT + (our.arms[0].sh.y - SEAT) * SCALE };
            const handOn = smoother(seg01(f, T.hand0, T.hand1));
            const tgt = { x: fx + (ourSh.x + 18 - fx) / SCALE, y: SEAT + (ourSh.y - 12 - SEAT) / SCALE };
            const restR = { x: fx + 48, y: SEAT - 8 };
            const hand = handOn > 0 ? { x: lerp(restR.x, tgt.x, handOn), y: lerp(restR.y, tgt.y, handOn) - 30 * Math.sin(Math.PI * handOn) } : null;
            const r = backRig(fx, SEAT, { stand: friendStand(f), droop: -0.2, tilt: friendTilt(f), breath: breath(1), hands: [null, hand], across: handOn > 0 ? 1 : undefined });
            friendNode = at(fx, fv.sx, backBody(r, "#FFF0E2", "#E9D2BF", 0.3 + 0.5 * glowFriend(f), "fb", "#F8C9AE", handOn > 0 ? 1 : -1), "fbk");
            if (handOn > 0) { const a = r.arms[1]; const d = `M${P2(a.sh)} L${P2(a.el)} L${P2(a.hand)}`;
              friendArm = at(fx, fv.sx, <g fill="none" strokeLinecap="round" strokeLinejoin="round"><path d={d} stroke="#E9D2BF" strokeWidth={23} /><path d={d} stroke="#FFF0E2" strokeWidth={18} /></g>, "farm"); }
          }
        }
        // the grey soul
        const gv = greyView(f), gx = greyX(f);
        let greyNode: React.ReactNode = null;
        if (f >= T.gIn0 - 2 && f <= T.gOut1) {
          if (!gv.back) {
            const r = solve(greySide(f), gx, SEAT);
            greyNode = at(gx, gv.sx * gv.dir, <g><ellipse cx={(r.legs[0].foot.x + r.legs[1].foot.x) / 2} cy={SEAT + 6} rx={58} ry={9} fill="#6F7461" opacity={0.2} filter="url(#mb4)" /><Body r={r} fill="#A9A3B6" back="#9A94A9" />
              <g transform={`translate(${r.head.x} ${r.head.y}) rotate(${r.headAng})`}><path d="M-6,-12 L6,-6 M12,-6 L24,-13" stroke="#5E566B" strokeWidth={3} strokeLinecap="round" /><ellipse cx={-1} cy={-1} rx={3} ry={3} fill="#5E566B" /><ellipse cx={17} cy={-1} rx={3} ry={3} fill="#5E566B" /><path d="M5,16 Q10,12 15,16" stroke="#5E566B" strokeWidth={2.4} fill="none" /></g></g>, "gs");
          } else {
            const rn = ranting(f), w1 = Math.sin(f / 3.6), w2 = Math.cos(f / 4.3);
            const r0 = backRig(gx, SEAT, { stand: greyStand(f), droop: 0, tilt: 0, breath: 0 });
            const hands = rn > 0 ? [{ x: gx - 52 + 10 * w2, y: lerp(SEAT - 8, r0.head0.y + 26 + 26 * w1, rn) }, { x: gx + 52 - 10 * w1, y: lerp(SEAT - 8, r0.head0.y + 26 + 26 * w2, rn) }] : undefined;
            const r = backRig(gx, SEAT + greyBounce(f) * 0, { stand: greyStand(f), droop: -0.1 * rn, tilt: 5 * rn * Math.sin(f / 2.8), breath: 0, hands });
            greyNode = at(gx, gv.sx, backBody(r, "#A9A3B6", "#8F89A0", 0, "gb", "#A9A3B6"), "gbk");
          }
        }
        out.push(friendNode, at(OX, 1, backBody(our, "#FFFBF4", "#EADBCB", 0.25 + 0.65 * glowOur(f), "ob"), "obk"), friendArm, greyNode);
        return <g>{out}</g>;
      })()}
      {/* the grey soul's angry scribble-bubbles, flying at our soul */}
      {BUBBLES.map((b, i) => {
        const age = f - b.t0, life = 46; if (age < 0 || age > life + 10) return null;
        const u = age / life, s = 1.3 * Math.min(1, sstep(age / 8) * 1.08) * (1 - smoother(seg01(age, life, life + 10)));
        const x = lerp(GX - 30, OX + 40, u) + 30 * Math.sin(i * 2.1), y = 1170 - 50 * u - (i % 3) * 46 + 20 * Math.sin(i * 1.3 + u * 3);
        const pts = Array.from({ length: 18 }, (_, k) => { const a = (k / 18) * Math.PI * 2, r = k % 2 ? 56 : 70; return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a) * 0.72).toFixed(1)}`; }).join(" ");
        return <g key={`bb${i}`} transform={`translate(${x} ${y}) scale(${s}) rotate(${6 * Math.sin(f / 3 + i)})`}>
          <polygon points={pts} fill="#FFF3EC" stroke="#D99891" strokeWidth={3.5} strokeLinejoin="round" />
          {b.kind === 3
            ? <g><path d="M-30,6 C-36,-14 -12,-22 -4,-12 C2,-26 30,-22 28,-4 C40,-2 38,14 26,14 L-24,14 C-36,14 -38,6 -30,6 Z" fill="#9C96A8" /><path d="M2,14 L-6,30 L4,28 L-2,44" stroke="#E7B54F" strokeWidth={4} fill="none" strokeLinejoin="round" /></g>
            : <text x={0} y={12} textAnchor="middle" fontFamily="Jost" fontWeight={800} fontSize={34} fill="#B65F58">{b.sym}</text>}
        </g>;
      })}
      {/* grass along the hilltop, in front of where they sit */}
      {Array.from({ length: 420 }, (_, i) => {
        const x = rnd(i) * 1160 - 40, hy = SEAT + 2 + Math.pow((x - 540) / 560, 2) * 70, y = hy + 4 + Math.pow(rnd(i + 3), 1.6) * 120;
        const len = (14 + rnd(i + 5) * 26) * (0.8 + (y - hy) / 160);
        const b = (gust(x) + 0.6) * (5 + rnd(i + 7) * 5) + 1.5;
        return <path key={`g${i}`} d={`M${x},${y} q${b * 0.4},${-len * 0.55} ${b},${-len}`} stroke={i % 3 ? grassC : grassL} strokeWidth={2.6 + rnd(i) * 1.4} fill="none" strokeLinecap="round" />;
      })}

    </g>
  );
};
