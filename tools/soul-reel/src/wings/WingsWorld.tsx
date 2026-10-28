// Six wings — an autumn path at golden hour, in the master Paper Boat style.
import React from "react";
import { interpolateColors } from "remotion";
import { Body } from "../master/World";
import { clamp01, GROUND, SCALE, seg01, smoother, solve } from "../master/pose";
import { aDir, aLight, aMood, aPose, ax, healAt, lost, T, takerState, TAKEN, TK, WINGS } from "./beats";

const W = 1080, H = 1920;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const col = (h: number, a: string, b: string) => interpolateColors(clamp01(h), [0, 1], [a, b]);
const smooth = (pts: [number, number][]) => {
  const n = pts.length; let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + "Z";
};
const blob = (cx: number, cy: number, r: number, seed: number, sq = 0.8, wob = 0) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, rr = r * (1 + 0.12 * Math.sin(a * 3 + seed) + 0.07 * Math.sin(a * 5 + seed * 2.3) + wob * Math.sin(a * 4 + seed * 7)); pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a) * sq]); }
  return smooth(pts);
};
const ridge = (base: number, amp: number, seed: number, x0: number, x1: number, step = 20, freq = 1) => {
  let d = `M${x0},${H + 10}`;
  for (let x = x0; x <= x1; x += step) d += ` L${x},${(base - amp * (0.55 * Math.sin((x / 300) * freq + seed) + 0.3 * Math.sin((x / 130) * freq + seed * 2) + 0.15 * Math.sin((x / 57) * freq + seed))).toFixed(1)}`;
  return d + ` L${x1},${H + 10} Z`;
};
const leafP = "M0,-11 C6,-6 6,6 0,11 C-6,6 -6,-6 0,-11 Z";

// one soft feathered wing, base at the origin, reaching out to the side (side 1 = right, −1 = left)
const WING = "M0,0 C36,-34 104,-54 168,-44 C150,-32 150,-24 160,-14 C138,-8 136,0 144,9 C120,11 114,18 118,27 C94,24 84,31 82,39 C58,29 28,20 0,10 Z";
const Wing: React.FC<{ side: number; tilt: number; s: number; glow: number }> = ({ side, tilt, s, glow }) => (
  <g transform={`scale(${side} 1) rotate(${tilt}) scale(${s} ${0.85 + 0.15 * s})`}>
    <path d={WING} fill="#FFE2B8" opacity={0.45 * glow} filter="url(#wb8)" transform="scale(1.12)" />
    <path d={WING} fill="#FFF8EC" />
    <path d="M10,-2 C50,-18 100,-30 150,-34 M30,6 C70,-2 110,-6 138,-4 M50,14 C78,12 98,16 112,20" stroke="#EADBC6" strokeWidth={2} fill="none" strokeLinecap="round" />
  </g>
);

export const WingsWorld: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30, h = healAt(f);
  const xa = ax(f), dirA = aDir(f);
  const ra = solve(aPose(f), xa);
  const mood = aMood(f), light = aLight(f);
  const sway = (x: number) => 0.6 * Math.sin(t * 0.9 + x / 140) + 0.4 * Math.sin(t * 1.7 + x / 60);

  // autumn palette: muted → warm, glowing golden hour (pastel, never dark)
  const skyTop = col(h, "#D6D1DC", "#B9C9F2"), skyMid = col(h, "#E6DCD8", "#FBDCCF"), skyLow = col(h, "#EAE1D6", "#FFE6C2");
  const far = col(h, "#D3CFDA", "#C7BCE6"), far2 = col(h, "#D8D2C8", "#E9CFAE");
  const mid = col(h, "#CDCBBE", "#D9C79A"), near = col(h, "#C2C2B0", "#C9C489");
  const mead1 = col(h, "#C3C1AE", "#D7CF96"), mead2 = col(h, "#B2B19C", "#B9B86F");
  const path = col(h, "#E1D6C6", "#F4DDB8");
  const leafC = ["#E9A97A", "#F2C27D", "#E58E6B", "#F6D49A"];
  const treeC = { d: col(h, "#C7A98F", "#E59A5E"), m: col(h, "#D2B79D", "#F0B46B"), l: col(h, "#DDC8B2", "#F7D08A") };
  const grassC = col(h, "#A9A894", "#A6A963"), grassL = col(h, "#BAB8A4", "#CFC77E");

  // where a soul's rig point lands in the world (mirrored when facing left)
  const toWorld = (p: { x: number; y: number }, x: number, dir: number) => ({ x: x + (p.x - x) * SCALE * dir, y: GROUND + (p.y - GROUND) * SCALE });
  const wingBase = (r: typeof ra) => ({ x: r.neck.x - 14 * Math.cos((r.lean * Math.PI) / 180), y: r.neck.y + 16 });
  const baseW = toWorld(wingBase(ra), xa, dirA);
  const openAmt = smoother(seg01(f, T.stretch0, T.stretch1));
  const kept = smoother(seg01(f, T.open0, T.open1));

  // takers
  const takers = [0, 1, 2, 3, 4].map((i) => {
    const st = takerState(i, f); if (!st) return null;
    return { i, ...st, rig: solve(st.p, st.x) };
  });

  return (
    <g>
      <defs>
        <linearGradient id="wsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={skyTop} /><stop offset="0.48" stopColor={skyMid} /><stop offset="0.68" stopColor={skyLow} /></linearGradient>
        <linearGradient id="wmead" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mead1} /><stop offset="1" stopColor={mead2} /></linearGradient>
        <linearGradient id="wtrunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#B39A86" /><stop offset="1" stopColor="#937B6A" /></linearGradient>
        <radialGradient id="wlight" cx="0.12" cy="0.66" r="0.55"><stop offset="0" stopColor="#FFE9C4" stopOpacity={0.55 + 0.4 * h} /><stop offset="1" stopColor="#FFE9C4" stopOpacity={0} /></radialGradient>
        <filter id="wb4" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id="wb8" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="wb16" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16" /></filter>
        <filter id="wb40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
      </defs>
      <rect width={W} height={H} fill="url(#wsky)" />
      <rect width={W} height={H} fill="url(#wlight)" />
      {/* the warm light at the end of the path (left) */}
      <circle cx={130} cy={1240} r={90} fill="#FFF3DA" opacity={0.6 + 0.35 * h} filter="url(#wb16)" />
      {[[160, 230, 1.0], [700, 160, 0.8], [1180, 280, 1.1]].map(([x, y, s], i) => {
        const cx = ((x + t * 9 + 400) % 1900) - 400;
        return <g key={i} transform={`translate(${cx},${y + 660}) scale(${s})`} filter="url(#wb8)" opacity={0.85}>
          <ellipse rx={120} ry={30} fill="#FFFFFF" /><ellipse cx={-40} cy={-20} rx={60} ry={34} fill="#FFFFFF" /><ellipse cx={35} cy={-26} rx={70} ry={40} fill="#FFFFFF" />
        </g>;
      })}
      <g transform={`translate(${6 * Math.sin(t * 0.2)} 0)`}><path d={ridge(1150, 115, 2, -60, 1160, 20, 0.7)} fill={far} /></g>
      <g filter="url(#wb16)" opacity={0.7}><ellipse cx={420 + t * 14} cy={1212} rx={700} ry={42} fill={skyLow} /></g>
      <g transform={`translate(${10 * Math.sin(t * 0.25 + 1)} 0)`}><path d={ridge(1262, 70, 5, -60, 1160, 20)} fill={far2} /></g>
      <g transform={`translate(${14 * Math.sin(t * 0.3 + 2)} 0)`}>
        <path d={ridge(1340, 60, 8, -60, 1160, 20, 1.3)} fill={mid} />
        {[300, 560, 760].map((x, i) => (
          <g key={i} transform={`translate(${x},${1302 + 8 * Math.sin(i * 2)}) rotate(${0.8 * sway(x)} 0 40)`}>
            <path d="M-3,44 L-2,0 L2,0 L3,44Z" fill="#AE9988" />
            <path d={blob(0, -14, 28, i + 1, 1.7)} fill={treeC.d} />
            <path d={blob(-7, -22, 15, i + 3, 1.6)} fill={treeC.l} opacity={0.85} />
          </g>
        ))}
      </g>
      <path d={ridge(1430, 42, 11, -60, 1160, 20, 1.1)} fill={near} />
      {/* autumn trees, swaying */}
      {[[980, 0.62], [60, 0.48]].map(([tx, sc], ti) => {
        const sw = 0.8 * Math.sin(t * 0.8 + ti) + 0.35 * Math.sin(t * 1.7 + 1 + ti);
        const clusters = [[-10, 990, 160, 1, "d"], [-140, 1060, 118, 2, "d"], [130, 1050, 126, 3, "d"], [-80, 920, 118, 4, "m"], [70, 925, 122, 5, "m"], [0, 860, 100, 6, "l"],
          [-185, 985, 88, 7, "m"], [180, 975, 92, 8, "m"], [10, 1110, 112, 9, "d"], [-60, 1020, 70, 10, "l"], [90, 1000, 70, 11, "l"]] as const;
        return (
          <g key={ti} transform={`translate(${tx} 1550) scale(${sc}) translate(0 -1550)`}>
            <ellipse cx={0} cy={1548} rx={260} ry={22} fill="#8F7F62" opacity={0.18} filter="url(#wb16)" />
            <g transform={`rotate(${0.4 * sw} 0 1550)`}>
              <path d="M-16,1550 C-12,1440 -24,1320 -8,1170 L12,1170 C8,1320 22,1440 26,1550 Z" fill="url(#wtrunk)" />
              <path d="M-6,1300 C-50,1250 -95,1215 -140,1195 L-136,1186 C-88,1202 -40,1236 2,1282 Z" fill="#A58D7B" />
              <path d="M10,1255 C46,1205 92,1180 136,1166 L140,1175 C98,1190 58,1222 22,1268 Z" fill="#A58D7B" />
              <g transform={`rotate(${sw} 0 1290)`}>
                {clusters.map(([x, y, r, sd, k], i) => <path key={i} d={blob(x + 2.5 * Math.sin(t * (2.2 + (i % 3) * 0.4) + i), y + Math.cos(t * 1.4 + i) * 2, r, sd + ti * 3, 0.82, 0.02 * Math.sin(t * 2.4 + i))} fill={treeC[k]} />)}
              </g>
            </g>
          </g>
        );
      })}
      {/* meadow + the path toward the light */}
      <path d={ridge(1508, 14, 3, -60, 1160, 30, 0.8)} fill="url(#wmead)" />
      <path d={`M-40,1560 C200,1548 520,1556 1120,1572 L1120,1652 C620,1640 240,1626 -40,1640 Z`} fill={path} opacity={0.9} />
      <path d={`M-40,1560 C200,1548 520,1556 1120,1572 L1120,1652 C620,1640 240,1626 -40,1640 Z`} fill="#FFF6E2" opacity={0.25 * h} filter="url(#wb8)" />
      {/* a little wooden bench by the path */}
      <g transform="translate(800 1556)" opacity={0.95}>
        <rect x={-70} y={-46} width={140} height={10} rx={4} fill="#C49A78" />
        <rect x={-70} y={-74} width={140} height={9} rx={4} fill="#C49A78" />
        <rect x={-60} y={-46} width={8} height={44} fill="#A97F60" /><rect x={52} y={-46} width={8} height={44} fill="#A97F60" />
        <rect x={-62} y={-80} width={7} height={36} fill="#A97F60" /><rect x={55} y={-80} width={7} height={36} fill="#A97F60" />
      </g>
      {/* leaves on the ground */}
      {Array.from({ length: 40 }, (_, i) => <path key={`gl${i}`} d={leafP} fill={leafC[i % 4]} opacity={0.55 + 0.3 * h} transform={`translate(${rnd(i) * 1080},${1580 + rnd(i + 2) * 320}) rotate(${rnd(i + 4) * 180}) scale(0.9)`} />)}

      {/* takers (soft grey, faceless) */}
      {takers.map((tk) => tk && (
        <g key={`tk${tk.i}`} opacity={tk.o} transform={`translate(${tk.x} ${GROUND}) scale(${SCALE * tk.dir} ${SCALE}) translate(${-tk.x} ${-GROUND})`}>
          <ellipse cx={(tk.rig.legs[0].foot.x + tk.rig.legs[1].foot.x) / 2} cy={GROUND + 6} rx={62} ry={9} fill="#6F6A61" opacity={0.18} filter="url(#wb4)" />
          <Body r={tk.rig} fill="#CFCBD3" back="#BDB9C3" />
        </g>
      ))}

      {/* the soul's wings (behind its body) */}
      <g transform={`translate(${baseW.x} ${baseW.y}) scale(${SCALE * dirA} ${SCALE})`}>
        {WINGS.map(([side, tilt], wi) => {
          const ti = TAKEN.indexOf(wi);
          if (ti >= 0 && f >= TK[ti].grab) return null;
          const droop = 10 * Math.min(1, lost(f) / 4);
          const tl = tilt * (0.6 + 0.4 * openAmt) + droop + (ti < 0 ? kept * -16 : 0) + 4 * Math.sin(t * 3 + wi) * (0.4 + 0.6 * openAmt);
          const s = (0.5 + 0.5 * openAmt) * (ti < 0 ? 1 + 0.35 * kept : 1) * (1 - 0.12 * Math.min(1, lost(f) / 4));
          return <Wing key={wi} side={side} tilt={tl} s={s} glow={0.4 + 0.6 * light} />;
        })}
      </g>
      {/* wings being carried away by the takers */}
      {TK.map((k, ti) => {
        if (f < k.grab || f > k.out1) return null;
        const tk = takers[ti]; if (!tk) return null;
        const hand = toWorld(tk.rig.arms[1].hand, tk.x, tk.dir);
        const fade = 1 - smoother(seg01(f, k.out1 - 24, k.out1));
        return <g key={`cw${ti}`} transform={`translate(${hand.x} ${hand.y}) scale(${SCALE * 0.8 * tk.dir} ${SCALE * 0.8}) rotate(${-20 + 6 * Math.sin(t * 4)})`} opacity={fade}><Wing side={1} tilt={0} s={0.9} glow={0.4} /></g>;
      })}
      {/* loose feathers drifting down with the leaves when a wing is pulled */}
      {TK.flatMap((k, ti) => [0, 1, 2].map((j) => {
        const p = seg01(f, k.grab + j * 4, k.grab + 70 + j * 4); if (p <= 0 || p >= 1) return null;
        const x = baseW.x + 40 + j * 30 + 60 * p + 20 * Math.sin(p * 8 + j), y = baseW.y - 60 + p * 300;
        return <path key={`fe${ti}${j}`} d="M0,-12 C5,-6 5,6 0,12 C-3,6 -3,-6 0,-12 Z" fill="#FFF8EC" opacity={Math.sin(p * Math.PI)} transform={`translate(${x},${y}) rotate(${p * 300 + j * 60}) scale(1.4)`} />;
      }))}

      {/* the soul */}
      <g transform={`translate(${xa} ${GROUND}) scale(${SCALE * dirA} ${SCALE}) translate(${-xa} ${-GROUND})`}>
        <ellipse cx={(ra.legs[0].foot.x + ra.legs[1].foot.x) / 2} cy={GROUND + 6} rx={62} ry={9} fill="#6F6A61" opacity={0.2} filter="url(#wb4)" />
        <g filter="url(#wb16)" opacity={0.3 + 0.5 * light}><Body r={ra} fill="#F8C9AE" back="#F8C9AE" /></g>
        <Body r={ra} fill="#FFFBF4" back="#F2E7DA" face={{ f, mood }} />
        <g transform={`translate(${ra.neck.x + (ra.hip.x - ra.neck.x) * 0.32 + 7} ${ra.neck.y + (ra.hip.y - ra.neck.y) * 0.32})`}>
          <path d="M0,-11 C7,-4 8,4 0,10 C-8,4 -7,-4 0,-11 Z" transform={`scale(${1.6 + 2.2 * light + 0.25 * Math.sin(t * 3)})`} fill="#FFC98F" opacity={0.18 + 0.5 * light} filter="url(#wb4)" />
          <path d="M0,-11 C7,-4 8,4 0,10 C-8,4 -7,-4 0,-11 Z" transform={`scale(${0.45 + 0.45 * light})`} fill="#FFD7A6" opacity={0.4 + 0.5 * light} />
        </g>
      </g>

      {/* grass in front */}
      {Array.from({ length: 460 }, (_, i) => {
        const x = rnd(i) * 1160 - 40, y = 1532 + Math.pow(rnd(i + 3), 0.8) * 390;
        if (y > 1552 && y < 1650) return null;
        const len = (12 + rnd(i + 5) * 24) * (0.7 + (y - 1530) / 400);
        const b = (sway(x) + 0.6) * (5 + rnd(i + 7) * 5) + 1.5;
        return <path key={i} d={`M${x},${y} q${b * 0.4},${-len * 0.55} ${b},${-len}`} stroke={i % 3 ? grassC : grassL} strokeWidth={2.6 + rnd(i) * 1.4} fill="none" strokeLinecap="round" />;
      })}
      {/* falling leaves */}
      {Array.from({ length: 22 }, (_, i) => {
        const per = 5 + rnd(i) * 4, p = ((t + rnd(i + 1) * per) % per) / per;
        const x = rnd(i + 2) * 1100 + 60 * Math.sin(p * 6 + i) - 40 * p, y = 700 + p * 1200;
        return <path key={`fl${i}`} d={leafP} fill={leafC[i % 4]} opacity={Math.sin(p * Math.PI) * 0.9} transform={`translate(${x},${y}) rotate(${p * 540 + i * 30}) scale(1.1)`} />;
      })}
      {/* warm motes once it walks on */}
      {Array.from({ length: 16 }, (_, i) => {
        const per = 6 + rnd(i) * 4, p = ((t + rnd(i + 1) * per) % per) / per;
        return <circle key={`m${i}`} cx={80 + rnd(i + 2) * 900 + 30 * Math.sin(p * 6 + i)} cy={1520 - p * 480} r={3} fill="#FFF3D6" opacity={kept * Math.sin(p * Math.PI) * 0.9} />;
      })}
    </g>
  );
};
