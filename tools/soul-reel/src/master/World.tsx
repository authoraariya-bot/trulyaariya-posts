import React from "react";
import { interpolateColors } from "remotion";
import {
  boatPos, camX, clamp01, FPS, GROUND, healAt, innerLight, lerp, poseAt, Rig, SCALE, scaled, seg01, smoother,
  solve, soulWorldX, sstep, STEP_FRAMES, streamY, T,
} from "./pose";

const W = 1080, H = 1920;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const col = (h: number, a: string, b: string) => interpolateColors(h, [0, 1], [a, b]);

const smooth = (pts: [number, number][], closed = true) => {
  const n = pts.length;
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const q0 = !closed && i === 0 ? p1 : p0, q3 = !closed && i === n - 2 ? p2 : p3;
    const c1 = [p1[0] + (p2[0] - q0[0]) / 6, p1[1] + (p2[1] - q0[1]) / 6];
    const c2 = [p2[0] - (q3[0] - p1[0]) / 6, p2[1] - (q3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return closed ? d + "Z" : d;
};
const blob = (cx: number, cy: number, r: number, seed: number, sq = 0.8, wob = 0) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const rr = r * (1 + 0.12 * Math.sin(a * 3 + seed) + 0.07 * Math.sin(a * 5 + seed * 2.3) + wob * Math.sin(a * 4 + seed * 7));
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a) * sq]);
  }
  return smooth(pts);
};
const ridge = (base: number, amp: number, seed: number, x0: number, x1: number, step = 24, freq = 1) => {
  let d = `M${x0},${H + 10}`;
  for (let x = x0; x <= x1; x += step) {
    const y = base - amp * (0.55 * Math.sin((x / 300) * freq + seed) + 0.3 * Math.sin((x / 130) * freq + seed * 2) + 0.15 * Math.sin((x / 57) * freq + seed));
    d += ` L${x},${y.toFixed(1)}`;
  }
  return d + ` L${x1},${H + 10} Z`;
};

// ------------------------------------------------ wind
const GUSTS = [T.wind, 262, 352, T.bloom - 4, T.wipe - 6];
const gust = (xs: number, f: number) =>
  GUSTS.reduce((a, g) => {
    if (f < g) return a;
    const front = -260 + (f - g) * 30;
    return a + Math.exp(-(((xs - front) / 190) ** 2));
  }, 0);
const breeze = (xs: number, f: number, h: number) => h * (0.5 + 0.5 * Math.sin(f / 13 + xs / 95)) * 0.9 + gust(xs, f) * 2.6;

// ------------------------------------------------ small shapes
const leaf = "M0,-11 C6,-6 6,6 0,11 C-6,6 -6,-6 0,-11 Z";
const petal = "M0,-7 C5,-5 5,4 0,7 C-5,4 -5,-5 0,-7 Z";
const Flower: React.FC<{ s: number; c: string; core?: string }> = ({ s, c, core = "#EBC67F" }) => (
  <g transform={`scale(${s})`}>
    {[0, 72, 144, 216, 288].map((a) => <path key={a} d={petal} fill={c} transform={`rotate(${a}) translate(0,-7)`} />)}
    <path d="M-2.6,0 a2.6,2.6 0 1,0 5.2,0 a2.6,2.6 0 1,0 -5.2,0" fill={core} />
  </g>
);
const Spark: React.FC<{ s: number; o: number }> = ({ s, o }) => (
  <g opacity={o}>
    <path d="M0,-12 L2.4,-2.4 L12,0 L2.4,2.4 L0,12 L-2.4,2.4 L-12,0 L-2.4,-2.4Z" transform={`scale(${s * 2.2})`} fill="#FFE2B0" opacity={0.45} filter="url(#b4)" />
    <path d="M0,-12 L2.4,-2.4 L12,0 L2.4,2.4 L0,12 L-2.4,2.4 L-12,0 L-2.4,-2.4Z" transform={`scale(${s})`} fill="#FFF8EA" />
  </g>
);

// ------------------------------------------------ the soul
const line = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) => `M${a.x},${a.y} Q${b.x},${b.y} ${c.x},${c.y}`;
export const Body: React.FC<{ r: Rig; fill: string; back: string }> = ({ r, fill, back }) => {
  const l = (r.lean * Math.PI) / 180, px = Math.cos(l), py = Math.sin(l);
  const torso = `M${r.hip.x - 24 * px},${r.hip.y - 24 * py}
    C${r.hip.x - 32 * px},${r.hip.y - 32 * py - 44} ${r.neck.x - 30 * px},${r.neck.y - 30 * py + 34} ${r.neck.x - 20 * px},${r.neck.y - 20 * py}
    Q${r.neck.x},${r.neck.y - 14} ${r.neck.x + 20 * px},${r.neck.y + 20 * py}
    C${r.neck.x + 30 * px},${r.neck.y + 30 * py + 34} ${r.hip.x + 32 * px},${r.hip.y + 32 * py - 44} ${r.hip.x + 24 * px},${r.hip.y + 24 * py}
    Q${r.hip.x},${r.hip.y + 20} ${r.hip.x - 24 * px},${r.hip.y - 24 * py} Z`;
  const foot = (i: number, c: string) => {
    const ft = r.legs[i].foot, a = Math.max(-25, Math.min(25, r.legs[i].fa * 0.5));
    return <ellipse cx={ft.x + 7} cy={ft.y + 1} rx={17} ry={9} fill={c} transform={`rotate(${-a} ${ft.x} ${ft.y})`} />;
  };
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={line(r.hip, r.legs[0].knee, r.legs[0].foot)} stroke={back} strokeWidth={27} />
      {foot(0, back)}
      <path d={line(r.arms[0].sh, r.arms[0].el, r.arms[0].hand)} stroke={back} strokeWidth={19} />
      <path d={torso} fill={fill} />
      <ellipse cx={r.head.x} cy={r.head.y} rx={33} ry={36} fill={fill} transform={`rotate(${r.headAng} ${r.head.x} ${r.head.y})`} />
      <path d={line(r.hip, r.legs[1].knee, r.legs[1].foot)} stroke={fill} strokeWidth={27} />
      {foot(1, fill)}
      <path d={line(r.arms[1].sh, r.arms[1].el, r.arms[1].hand)} stroke={fill} strokeWidth={19} />
    </g>
  );
};

// paper → boat morph (6-point outlines)
const SQ = [[-15, -15], [15, -15], [15, 0], [15, 15], [-15, 15], [-15, 0]];
const TRI = [[-2, -19], [2, -19], [18, 8], [13, 12], [-13, 12], [-18, 8]];
const BOAT = [[0, -24], [0, -24], [27, 0], [17, 12], [-17, 12], [-27, 0]];
const morph = (t: number) => {
  const a = t < 0.5 ? SQ : TRI, b = t < 0.5 ? TRI : BOAT, u = smoother(t < 0.5 ? t * 2 : t * 2 - 1);
  return a.map((p, i) => [lerp(p[0], b[i][0], u), lerp(p[1], b[i][1], u)]);
};
const Paper: React.FC<{ t: number; glow: number }> = ({ t, glow }) => {
  const pts = morph(t);
  return (
    <g>
      <path d={`M${pts.map((p) => p.join(",")).join(" L")} Z`} fill="#FFE6C4" opacity={0.6 * glow} filter="url(#b8)" transform="scale(1.4)" />
      <path d={`M${pts.map((p) => p.join(",")).join(" L")} Z`} fill="#FFFDF8" stroke="#E7D7C3" strokeWidth={1.2} strokeLinejoin="round" />
      {t > 0.75 && (
        <g opacity={(t - 0.75) * 4} stroke="#E1CFB8" strokeWidth={1.2} fill="none" strokeLinecap="round">
          <path d="M-27,0 L27,0" /><path d="M-13,0 L0,-24 L13,0" />
        </g>
      )}
      {t < 0.4 && (
        <g opacity={1 - t * 2.5} stroke="#CDB9A6" strokeWidth={1.4} strokeLinecap="round">
          <path d="M-9,-6 L9,-6" /><path d="M-9,-1 L7,-1" /><path d="M-9,4 L5,4" />
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------ the world
export const World: React.FC<{ f: number }> = ({ f }) => {
  const t = f / FPS;
  const h = healAt(f);
  const cam = camX(f);
  const sx = soulWorldX(f);
  const pose = poseAt(f);
  const rig = solve(pose, sx);
  const wx = (x: number, par = 1) => x - cam * par; // world → screen

  // palette: muted silence → warm healing
  const skyTop = col(h, "#E5E1E3", "#FCF5EC"), skyMid = col(h, "#E8E0DE", "#FAE5D7"), skyLow = col(h, "#E4E3DC", "#F6EAD3");
  const far = col(h, "#D6D6DF", "#E3D9E6"), far2 = col(h, "#D8DBD8", "#DCE3D6");
  const mid = col(h, "#CCD4C6", "#C9DDBC"), near = col(h, "#BCC7B2", "#B2CF9F");
  const mead1 = col(h, "#B9C3AE", "#B8D3A4"), mead2 = col(h, "#A9B59F", "#A0C08D");
  const water1 = col(h, "#CDD3D4", "#D7ECEA"), water2 = col(h, "#B9C2C4", "#B4D8D6");
  const grassC = col(h, "#9EA996", "#93B783"), grassL = col(h, "#B0B9A6", "#ABCB97");
  const bloom = (i: number) => clamp01(Math.pow(clamp01((f - T.bloom - i * 1.2) / 18), 0.7)) * (1 + 0.25 * Math.sin(Math.PI * clamp01((f - T.bloom - i * 1.2) / 18)));
  const boat = boatPos(f);
  const light = innerLight(f);

  // hand-held paper before it touches the water
  const hand = (i: number) => scaled(rig.arms[i].hand, sx);
  const chest = scaled({ x: rig.neck.x + (rig.hip.x - rig.neck.x) * 0.32 + 7, y: rig.neck.y + (rig.hip.y - rig.neck.y) * 0.32 }, sx);
  let paper: { x: number; y: number; t: number; s: number } | null = null;
  if (f >= T.paperOut && f < T.place) {
    const mid2 = { x: (hand(0).x + hand(1).x) / 2 + 10, y: (hand(0).y + hand(1).y) / 2 - 18 };
    const rise = smoother(seg01(f, T.paperOut, T.foldStart));
    let p = { x: lerp(chest.x, mid2.x, rise), y: lerp(chest.y, mid2.y, rise) - 30 * Math.sin(rise * Math.PI) };
    const toHand = smoother(seg01(f, T.kneel, T.place));
    p = { x: lerp(p.x, hand(1).x + 6, toHand), y: lerp(p.y, hand(1).y + 6, toHand) };
    paper = { ...p, t: smoother(seg01(f, T.foldStart, T.foldEnd)), s: lerp(0.5, 1.15, rise) + 0.35 * toHand };
  }

  // flowers along the bank wake as the soul walks past
  const bankFlowers = Array.from({ length: 34 }, (_, i) => {
    const x = 260 + i * 46 + rnd(i) * 30;
    const y = 1548 + rnd(i + 5) * 6 + (i % 4 === 0 ? 70 + rnd(i) * 40 : 0);
    const wake = x < 700 ? T.place + 20 + i * 2 : (STEP_FRAMES.find((sf) => soulWorldX(sf) > x - 60) ?? T.bloom);
    return { x, y, wake, c: ["#F5CDC9", "#FFF2E6", "#E6D3EC", "#F8DAC6", "#F3C2C9"][i % 5], s: 0.75 + rnd(i + 9) * 0.6 };
  });

  return (
    <g>
      <defs>
        <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={skyTop} /><stop offset="0.5" stopColor={skyMid} /><stop offset="0.68" stopColor={skyLow} />
        </linearGradient>
        <radialGradient id="sun" cx="0.78" cy="0.58" r="0.55">
          <stop offset="0" stopColor="#FFF1D8" stopOpacity={0.95 * h} /><stop offset="0.45" stopColor="#FFE7CF" stopOpacity={0.35 * h} /><stop offset="1" stopColor="#FFE7CF" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="mead2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mead1} /><stop offset="1" stopColor={mead2} /></linearGradient>
        <linearGradient id="water2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={water1} /><stop offset="1" stopColor={water2} /></linearGradient>
        <linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#B39A86" /><stop offset="1" stopColor="#937B6A" /></linearGradient>
        <filter id="b4" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id="b8" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="b16" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16" /></filter>
        <filter id="b40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
        <clipPath id="pool2"><path d={blob(wx(1500), 1600, 225, 4, 0.24)} /></clipPath>
      </defs>

      {/* sky, light, clouds */}
      <rect width={W} height={H} fill="url(#sky2)" />
      <rect width={W} height={H} fill="url(#sun)" />
      <g filter="url(#b40)" opacity={0.55 * h}>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${1180 - i * 60},-60 L${1320 - i * 40},-60 L${520 - i * 230 + 20 * Math.sin(t * 0.5 + i)},1500 L${380 - i * 230 + 20 * Math.sin(t * 0.5 + i)},1500 Z`} fill="#FFFBF2" opacity={0.6 - i * 0.12} />
        ))}
      </g>
      {[[160, 250, 1.0], [700, 180, 0.8], [1250, 300, 1.1], [1700, 220, 0.9], [2150, 270, 1]].map(([x, y, s], i) => {
        const cx = ((x + t * 9 - cam * 0.08 + 400) % 2600) - 400;
        return (
          <g key={i} transform={`translate(${cx},${y + 680}) scale(${s})`} filter="url(#b8)" opacity={0.85}>
            <ellipse cx={0} cy={0} rx={120} ry={30} fill="#FFFFFF" />
            <ellipse cx={-40} cy={-20} rx={60} ry={34} fill="#FFFFFF" />
            <ellipse cx={35} cy={-26} rx={70} ry={40} fill="#FFFFFF" />
          </g>
        );
      })}

      {/* distant mountains and hills (parallax) */}
      <g transform={`translate(${-cam * 0.15} 0)`}><path d={ridge(1150, 115, 2, -40, 2600, 20, 0.7)} fill={far} /></g>
      <g transform={`translate(${-cam * 0.2} 0)`} filter="url(#b16)" opacity={0.8}>
        <ellipse cx={500 + t * 12} cy={1215} rx={700} ry={42} fill={skyLow} />
      </g>
      <g transform={`translate(${-cam * 0.28} 0)`}><path d={ridge(1260, 70, 5, -40, 2600, 20)} fill={far2} /></g>
      <g transform={`translate(${-cam * 0.42} 0)`}>
        <path d={ridge(1340, 60, 8, -40, 2800, 20, 1.3)} fill={mid} />
        {[220, 640, 1040, 1520, 1960].map((x, i) => {
          const b = 0.6 * Math.sin(t * 1.2 + i) + 1.4 * gust(x - cam * 0.42, f);
          return (
            <g key={i} transform={`translate(${x},${1300 + 8 * Math.sin(i * 2)}) rotate(${b} 0 40)`}>
              <path d="M-3,44 L-2,0 L2,0 L3,44Z" fill="#AE9988" />
              <path d={blob(0, -14, 30, i + 1, 1.7)} fill={near} />
              <path d={blob(-7, -22, 17, i + 3, 1.6)} fill={col(h, "#C9D1BE", "#C7DDB6")} opacity={0.8} />
            </g>
          );
        })}
      </g>
      <g transform={`translate(${-cam * 0.65} 0)`}><path d={ridge(1430, 42, 11, -40, 2900, 20, 1.1)} fill={near} /></g>

      {/* birds lifting off as the soul heals */}
      {[0, 1, 2].map((i) => {
        const p = seg01(f, 230 + i * 8, 400 + i * 8);
        if (p <= 0 || p >= 1) return null;
        const bx = lerp(-60, 1150, p) + i * 40, by = 980 - 260 * p + i * 26 + 12 * Math.sin(t * 1.6 + i);
        const w = 10 * Math.sin(t * 10 + i * 2);
        return <path key={i} d={`M${bx - 14},${by - w} Q${bx - 5},${by - 3} ${bx},${by + 2} Q${bx + 5},${by - 3} ${bx + 14},${by - w}`} stroke="#A3948C" strokeWidth={2.8} fill="none" strokeLinecap="round" />;
      })}

      {/* the tree */}
      <g transform={`translate(${wx(1590)} 0)`}>
        {(() => {
          const g = 0.7 * Math.sin(t * 0.9) * (0.4 + h) + 2.2 * gust(wx(1590), f);
          const clusters = [
            [-10, 990, 160, 1, "d"], [-140, 1060, 118, 2, "d"], [130, 1050, 126, 3, "d"],
            [-80, 920, 118, 4, "m"], [70, 925, 122, 5, "m"], [0, 860, 100, 6, "l"],
            [-185, 985, 88, 7, "m"], [180, 975, 92, 8, "m"], [10, 1110, 112, 9, "d"], [-60, 1020, 70, 10, "l"], [90, 1000, 70, 11, "l"],
          ] as const;
          const cc = { d: col(h, "#9DAE93", "#8FB683"), m: col(h, "#AEBCA5", "#A6C998"), l: col(h, "#C1CBB8", "#C3DDB2") };
          return (
            <>
              <ellipse cx={0} cy={1548} rx={260} ry={22} fill="#7F946F" opacity={0.18} filter="url(#b16)" />
              <path d="M-16,1550 C-12,1440 -24,1320 -8,1170 L12,1170 C8,1320 22,1440 26,1550 Z" fill="url(#trunk)" />
              <path d="M-6,1300 C-50,1250 -95,1215 -140,1195 L-136,1186 C-88,1202 -40,1236 2,1282 Z" fill="#A58D7B" />
              <path d="M10,1255 C46,1205 92,1180 136,1166 L140,1175 C98,1190 58,1222 22,1268 Z" fill="#A58D7B" />
              <g transform={`rotate(${g} 0 1290)`}>
                {clusters.map(([x, y, r, s, k], i) => {
                  const rs = 3 * Math.sin(t * 1.3 + i) + 6 * gust(wx(1590 + x), f);
                  return <path key={i} d={blob(x + rs, y + Math.cos(t + i) * 2, r, s, 0.82, 0.02 * Math.sin(t * 2 + i))} fill={cc[k]} />;
                })}
                {Array.from({ length: 34 }, (_, i) => {
                  const a = rnd(i) * Math.PI * 2, d = Math.sqrt(rnd(i + 40));
                  const x = Math.cos(a) * 215 * d, y = 990 + Math.sin(a) * 160 * d;
                  return (
                    <g key={i} transform={`translate(${x},${y}) rotate(${i * 37 + t * 10})`}>
                      <Flower s={(0.9 + rnd(i + 9) * 0.7) * bloom(i)} c={["#F6CFCB", "#FCE4DA", "#EFC0C6", "#FFF3EA"][i % 4]} />
                    </g>
                  );
                })}
              </g>
            </>
          );
        })()}
      </g>

      {/* meadow */}
      <g transform={`translate(${-cam} 0)`}>
        <path d={ridge(1508, 14, 3, -40, 2700, 30, 0.8)} fill="url(#mead2)" />
        {/* soft light patches drifting over the grass */}
        <g filter="url(#b40)" opacity={0.35 * h}>
          <ellipse cx={600 + t * 20} cy={1700} rx={420} ry={60} fill="#F6F0D2" />
          <ellipse cx={1500 + t * 15} cy={1820} rx={460} ry={70} fill="#F6F0D2" />
        </g>
        {/* pond → stream → pool */}
        <path d={blob(590, 1594, 205, 1, 0.24)} fill="url(#water2)" />
        <path d={(() => {
          const top: [number, number][] = [], bot: [number, number][] = [];
          for (let x = 740; x <= 1330; x += 30) {
            const w = 18 + 6 * Math.sin(x / 90);
            top.push([x, streamY(x) - w]); bot.unshift([x, streamY(x) + w]);
          }
          return smooth([...top, ...bot]);
        })()} fill="url(#water2)" />
        <path d={blob(1500, 1600, 225, 4, 0.24)} fill="url(#water2)" />
        {/* flowing shimmer */}
        {Array.from({ length: 26 }, (_, i) => {
          const span = 1200, x = 380 + ((i * 97 + f * (0.6 + 1.6 * h)) % span);
          const y = x < 760 ? 1576 + (i % 4) * 9 : x < 1300 ? streamY(x) - 6 + (i % 3) * 6 : 1582 + (i % 5) * 9;
          return <path key={i} d={`M${x},${y} l${22 + 18 * rnd(i)},0`} stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" opacity={(0.25 + 0.45 * h) * (0.6 + 0.4 * Math.sin(t * 2 + i))} />;
        })}
        {/* ripples when the boat touches the water, and at the pool */}
        {[T.place + 4, T.walkB - 4].map((st, j) => {
          const x0 = j ? 1400 : 420, y0 = j ? 1592 : 1568;
          return [0, 1, 2].map((i) => {
            const p = seg01(f, st + i * 8, st + i * 8 + 50);
            if (p <= 0 || p >= 1) return null;
            return <ellipse key={`${j}${i}`} cx={x0} cy={y0} rx={14 + 120 * p} ry={4 + 20 * p} fill="none" stroke="#FFFFFF" strokeWidth={2.4} opacity={(1 - p) * 0.8} />;
          });
        })}
        {/* stones */}
        {[[392, 1612, 20, 0.55], [800, 1570, 15, 0.6], [1290, 1610, 18, 0.5], [1735, 1606, 28, 0.5], [1010, 1622, 13, 0.6]].map(([x, y, r, q], i) => (
          <path key={i} d={blob(x, y, r, i + 2, q)} fill={col(h, "#D2CEC6", "#DCD3C6")} />
        ))}
        {/* bank flowers */}
        {bankFlowers.map((b, i) => {
          const g = clamp01((f - b.wake) / 16);
          const s = Math.pow(g, 0.6) * (1 + 0.3 * Math.sin(Math.PI * g));
          const sway = breeze(wx(b.x), f, h) * 3;
          return (
            <g key={i} transform={`translate(${b.x},${b.y}) rotate(${sway} 0 0)`}>
              <path d={`M0,0 q-2,-12 0,${-24 * Math.max(0.35, g)}`} stroke={grassC} strokeWidth={2.6} fill="none" strokeLinecap="round" />
              <g transform={`translate(0,${-24 * Math.max(0.35, g)})`}>
                {g > 0 ? <Flower s={0.8 * b.s * s} c={b.c} /> : <path d={leaf} transform="scale(0.35)" fill={grassC} />}
              </g>
            </g>
          );
        })}

        {/* the soul's reflection, seen in the clear pool */}
        <g clipPath="url(#pool2)" transform={`translate(${cam} 0)`}>
          <g transform={`translate(${-cam} 0)`}>
            {f > T.walkB && (
              <g opacity={0.78 * sstep(seg01(f, T.walkB + 10, T.kneel2 + 10))} transform={`translate(40 ${2 * 1552}) scale(1,-1)`}>
                <g transform={`translate(${sx} ${GROUND}) scale(${SCALE}) translate(${-sx} ${-GROUND})`} filter="url(#b4)">
                  <Body r={rig} fill="#FFE5D2" back="#FFE5D2" />
                </g>
              </g>
            )}
          </g>
        </g>

        {/* the paper boat */}
        {boat && (
          <g transform={`translate(${boat.x},${boat.y}) rotate(${boat.rot}) scale(1.6)`}>
            <ellipse cx={0} cy={13} rx={30} ry={4} fill="#7F9A9A" opacity={0.25} />
            <Paper t={1} glow={0.4 + 0.6 * h} />
          </g>
        )}

        {/* the soul */}
        <g transform={`translate(${sx} ${GROUND}) scale(${SCALE}) translate(${-sx} ${-GROUND})`}>
          <ellipse cx={(rig.legs[0].foot.x + rig.legs[1].foot.x) / 2} cy={GROUND + 6} rx={62} ry={9} fill="#6F8461" opacity={0.2} filter="url(#b4)" />
          <g filter="url(#b16)" opacity={0.5 + 0.35 * h}><Body r={rig} fill="#F8C9AE" back="#F8C9AE" /></g>
          <Body r={rig} fill="#FFFBF4" back="#F2E7DA" />
          <g transform={`translate(${rig.neck.x + (rig.hip.x - rig.neck.x) * 0.32 + 7} ${rig.neck.y + (rig.hip.y - rig.neck.y) * 0.32})`}>
            <path d="M0,-11 C7,-4 8,4 0,10 C-8,4 -7,-4 0,-11 Z" transform={`scale(${2.2 + 2 * light})`} fill="#FFC98F" opacity={0.25 + 0.5 * light} filter="url(#b4)" />
            <path d="M0,-11 C7,-4 8,4 0,10 C-8,4 -7,-4 0,-11 Z" transform={`scale(${0.55 + 0.45 * light})`} fill="#FFD7A6" opacity={0.55 + 0.45 * light} />
          </g>
        </g>
        {paper && (
          <g transform={`translate(${paper.x},${paper.y}) scale(${paper.s})`}><Paper t={paper.t} glow={1} /></g>
        )}

        {/* grass, moving with the wind */}
        {Array.from({ length: 520 }, (_, i) => {
          const x = rnd(i) * 2700 - 40;
          const xs = x - cam;
          if (xs < -40 || xs > W + 40) return null;
          const y = 1530 + Math.pow(rnd(i + 3), 0.8) * 400;
          if (y > 1546 && y < 1660 && ((x > 380 && x < 800) || (x > 740 && x < 1340 && Math.abs(y - streamY(x)) < 30) || (x > 1270 && x < 1730))) return null;
          const len = (14 + rnd(i + 5) * 26) * (0.7 + (y - 1530) / 400);
          const b = breeze(xs, f, h) * (6 + rnd(i + 7) * 5) + 1.5;
          return <path key={i} d={`M${x},${y} q${b * 0.4},${-len * 0.55} ${b},${-len}`} stroke={i % 3 ? grassC : grassL} strokeWidth={2.6 + rnd(i) * 1.4} fill="none" strokeLinecap="round" />;
        })}
      </g>

      {/* the gust you can see: a soft bright band sweeping through */}
      {GUSTS.map((g, i) => {
        if (f < g) return null;
        const front = -260 + (f - g) * 30;
        if (front > W + 300) return null;
        return <ellipse key={i} cx={front} cy={1640} rx={200} ry={260} fill="#FFFCEF" opacity={0.16} filter="url(#b40)" />;
      })}

      {/* two butterflies find the soul as it heals */}
      {[0, 1].map((i) => {
        const a = seg01(f, T.walkA + 30 + i * 25, T.walkA + 90 + i * 25);
        if (a <= 0) return null;
        const head = scaled(rig.head, sx);
        const tx = head.x - cam + 70 + i * 50 + 40 * Math.sin(t * 1.3 + i * 2), ty = head.y - 70 - i * 40 + 30 * Math.sin(t * 1.9 + i);
        const x = lerp(1150 + i * 60, tx, smoother(a)), y = lerp(900 + i * 80, ty, smoother(a));
        const flap = Math.abs(Math.sin(t * 14 + i * 3));
        const c = i ? "#F2C4CC" : "#F7DCA9";
        return (
          <g key={i} transform={`translate(${x},${y}) rotate(${-15 + 10 * Math.sin(t * 3 + i)})`}>
            <path d="M0,0 C-14,-20 -26,-8 -16,4 C-10,10 -4,6 0,2Z" fill={c} transform={`scale(${0.35 + 0.65 * flap},1)`} />
            <path d="M0,0 C14,-20 26,-8 16,4 C10,10 4,6 0,2Z" fill={c} transform={`scale(${0.35 + 0.65 * flap},1)`} opacity={0.9} />
            <path d="M0,-6 L0,8" stroke="#9C8573" strokeWidth={2} strokeLinecap="round" />
          </g>
        );
      })}

      {/* seeds and petals riding the wind */}
      {Array.from({ length: 30 }, (_, i) => {
        const start = T.wind + rnd(i) * 220;
        if (f < start) return null;
        const p = (f - start) / (120 + rnd(i + 2) * 80);
        if (p > 1) return null;
        const x = -40 + p * 1180 + 30 * Math.sin(p * 8 + i);
        const y = 1250 + rnd(i + 4) * 520 - p * 240 + 26 * Math.sin(p * 5 + i * 2);
        return i % 3 === 0
          ? <g key={i} transform={`translate(${x},${y}) rotate(${p * 300})`} opacity={Math.sin(p * Math.PI)}><path d={petal} fill="#F7D3CE" transform="scale(1.3)" /></g>
          : <g key={i} transform={`translate(${x},${y}) rotate(${p * 120})`} opacity={0.8 * Math.sin(p * Math.PI)} stroke="#FFFFFF" strokeWidth={1.3}>
              {[0, 60, 120, 180, 240, 300].map((a) => <path key={a} d="M0,0 L0,-7" transform={`rotate(${a})`} />)}
            </g>;
      })}
      {/* blossom petals after the bloom */}
      {Array.from({ length: 22 }, (_, i) => {
        const st = T.bloom + 14 + i * 3;
        if (f < st) return null;
        const p = (f - st) / 140;
        if (p > 1) return null;
        const x = wx(1590) - 200 + rnd(i + 30) * 420 + p * 500 + 40 * Math.sin(p * 7 + i);
        const y = 900 + rnd(i + 50) * 260 + p * 560;
        return <path key={i} d={petal} fill={i % 2 ? "#F6CFCB" : "#FCE4DA"} opacity={Math.min(1, (1 - p) * 2)} transform={`translate(${x},${y}) rotate(${p * 420 + i * 30}) scale(1.5)`} />;
      })}
      {/* warm motes in the light */}
      {Array.from({ length: 18 }, (_, i) => {
        const per = 6 + rnd(i) * 4, p = ((t + rnd(i + 1) * per) % per) / per;
        const x = 120 + rnd(i + 2) * 880 + 30 * Math.sin(p * 6 + i), y = 1500 - p * 520;
        return <g key={i} transform={`translate(${x},${y})`}><Spark s={0.28 + 0.2 * rnd(i + 3)} o={h * Math.sin(p * Math.PI) * 0.9} /></g>;
      })}
    </g>
  );
};
