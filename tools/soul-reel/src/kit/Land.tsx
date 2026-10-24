// Shared landscape for Soul reels: the master's layers (sky, light, clouds, mountains, hills, trees in wind,
// meadow, grass, wildflowers, butterflies, birds, petals, motes) with options so each reel gets its own setting.
import React from "react";
import { interpolateColors } from "remotion";
import { Body } from "../master/World";
import { Choreo, chestOf, clamp01, GROUND, lerp, scaledPt, SCALE, seg01, smoother, sstep } from "./choreo";

export const W = 1080, H = 1920;
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const col = (h: number, a: string, b: string) => interpolateColors(clamp01(h), [0, 1], [a, b]);
export const smoothPath = (pts: [number, number][], closed = true) => {
  const n = pts.length; let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`; const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const q0 = !closed && i === 0 ? p1 : p0, q3 = !closed && i === n - 2 ? p2 : p3;
    const c1 = [p1[0] + (p2[0] - q0[0]) / 6, p1[1] + (p2[1] - q0[1]) / 6], c2 = [p2[0] - (q3[0] - p1[0]) / 6, p2[1] - (q3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return closed ? d + "Z" : d;
};
export const blob = (cx: number, cy: number, r: number, seed: number, sq = 0.8, wob = 0) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; const rr = r * (1 + 0.12 * Math.sin(a * 3 + seed) + 0.07 * Math.sin(a * 5 + seed * 2.3) + wob * Math.sin(a * 4 + seed * 7)); pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a) * sq]); }
  return smoothPath(pts);
};
export const ridge = (base: number, amp: number, seed: number, x0: number, x1: number, step = 24, freq = 1) => {
  let d = `M${x0},${H + 10}`;
  for (let x = x0; x <= x1; x += step) { const y = base - amp * (0.55 * Math.sin((x / 300) * freq + seed) + 0.3 * Math.sin((x / 130) * freq + seed * 2) + 0.15 * Math.sin((x / 57) * freq + seed)); d += ` L${x},${y.toFixed(1)}`; }
  return d + ` L${x1},${H + 10} Z`;
};
export const leaf = "M0,-11 C6,-6 6,6 0,11 C-6,6 -6,-6 0,-11 Z";
export const petal = "M0,-7 C5,-5 5,4 0,7 C-5,4 -5,-5 0,-7 Z";
export const Flower: React.FC<{ s: number; c: string; core?: string }> = ({ s, c, core = "#EBC67F" }) => (
  <g transform={`scale(${s})`}>
    {[0, 72, 144, 216, 288].map((a) => <path key={a} d={petal} fill={c} transform={`rotate(${a}) translate(0,-7)`} />)}
    <path d="M-2.6,0 a2.6,2.6 0 1,0 5.2,0 a2.6,2.6 0 1,0 -5.2,0" fill={core} />
  </g>
);
export const Spark: React.FC<{ s: number; o: number }> = ({ s, o }) => (
  <g opacity={o}>
    <path d="M0,-12 L2.4,-2.4 L12,0 L2.4,2.4 L0,12 L-2.4,2.4 L-12,0 L-2.4,-2.4Z" transform={`scale(${s * 2.2})`} fill="#FFE2B0" opacity={0.45} filter="url(#b4)" />
    <path d="M0,-12 L2.4,-2.4 L12,0 L2.4,2.4 L0,12 L-2.4,2.4 L-12,0 L-2.4,-2.4Z" transform={`scale(${s})`} fill="#FFF8EA" />
  </g>
);
export const POPPIES = ["#F2866F", "#F4A3B8", "#F6D46B", "#B9A5E3", "#FFF4E2", "#F7A072"];

// ---------- wind (gusts ripple through and settle)
export const makeWind = (gusts: number[]) => {
  const gust = (xs: number, f: number) => gusts.reduce((a, g) => { if (f < g) return a; const front = -260 + (f - g) * 30; return a + Math.exp(-(((xs - front) / 190) ** 2)); }, 0);
  const breeze = (xs: number, f: number, h: number) => h * (0.5 + 0.5 * Math.sin(f / 13 + xs / 95)) * 0.9 + gust(xs, f) * 2.6;
  return { gust, breeze, gusts };
};

// ---------- the soul, drawn exactly as in the master (glow, body, face, chest light)
export const Soul: React.FC<{ c: Choreo; f: number; x?: number; light?: number; mood?: number; heal?: number; shadow?: boolean; scale?: number }> = ({ c, f, x, light, mood, heal, shadow = true, scale = SCALE }) => {
  const sx = x ?? c.xAt(f); const rig = c.rigAt(f); const h = heal ?? c.healAt(f); const m = mood ?? c.moodAt(f);
  const li = light ?? 0.25 + 0.75 * h;
  const ch = chestOf(rig);
  return (
    <g transform={`translate(${sx} ${GROUND}) scale(${scale}) translate(${-sx} ${-GROUND})`}>
      {shadow && <ellipse cx={(rig.legs[0].foot.x + rig.legs[1].foot.x) / 2} cy={GROUND + 6} rx={62} ry={9} fill="#6F8461" opacity={0.2} filter="url(#b4)" />}
      <g filter="url(#b16)" opacity={0.5 + 0.35 * h}><Body r={rig} fill="#F8C9AE" back="#F8C9AE" /></g>
      <Body r={rig} fill="#FFFBF4" back="#F2E7DA" face={{ f, mood: m }} />
      <g transform={`translate(${ch.x} ${ch.y})`}>
        <path d="M0,-11 C7,-4 8,4 0,10 C-8,4 -7,-4 0,-11 Z" transform={`scale(${2.2 + 2 * li})`} fill="#FFC98F" opacity={0.25 + 0.5 * li} filter="url(#b4)" />
        <path d="M0,-11 C7,-4 8,4 0,10 C-8,4 -7,-4 0,-11 Z" transform={`scale(${0.55 + 0.45 * li})`} fill="#FFD7A6" opacity={0.55 + 0.45 * li} />
      </g>
    </g>
  );
};
// a hand / chest / head of the soul in world space
export const handOf = (c: Choreo, f: number, i: 0 | 1) => scaledPt(c.rigAt(f).arms[i].hand, c.xAt(f));
export const chestPt = (c: Choreo, f: number) => scaledPt(chestOf(c.rigAt(f)), c.xAt(f));
export const headPt = (c: Choreo, f: number) => scaledPt(c.rigAt(f).head, c.xAt(f));

// the master's overthinking scribble above the head, released by u (0 tangled → 1 unravelled and gone)
export const Scribble: React.FC<{ c: Choreo; f: number; amt: number; u: number }> = ({ c, f, amt, u }) => {
  if (amt <= 0.01) return null;
  const hd = headPt(c, f), t = f / 30; const pts: [number, number][] = [];
  for (let i = 0; i < 70; i++) {
    const a = i * 0.83 + t * 0.9, r = 30 + 18 * Math.sin(i * 1.7) + 8 * Math.sin(i * 0.37 + t), k = i / 70;
    pts.push([hd.x + 10 + r * Math.cos(a) * 1.5 + u * (k * 520 + 40), hd.y - 120 + r * Math.sin(a) * 0.8 - u * (k * 140) + u * 30 * Math.sin(k * 12)]);
  }
  return <path d={smoothPath(pts, false)} stroke="#8E8580" strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={amt * (0.8 * (1 - u) + 0.2 * Math.sin(Math.PI * u))} />;
};

export type LandOpts = {
  f: number; cam: number; h: number; c: Choreo; wind: ReturnType<typeof makeWind>;
  trees?: { x: number; s: number; hero?: boolean; bloom?: number; blossom?: string[] }[];
  water?: "none" | "lake" | "sea" | "brook"; waterX?: [number, number];
  sky?: "day" | "dusk" | "dawn"; ground?: "meadow" | "sand" | "garden";
  flowersFrom?: number; butterflies?: number; birdsAt?: number; petalsFrom?: number;
  behindSoul?: React.ReactNode; front?: React.ReactNode; worldProps?: React.ReactNode; hideSoul?: boolean;
  extraSouls?: React.ReactNode;
};

export const Land: React.FC<LandOpts> = (o) => {
  const { f, cam, h, c, wind } = o; const t = f / 30;
  const wx = (x: number, par = 1) => x - cam * par;
  const sky = o.sky ?? "day";
  // palette: muted at the start → the master's fresh colours as the soul heals
  const skyTopB = sky === "dusk" ? "#C9C2EA" : sky === "dawn" ? "#C7D6F2" : "#B9DDF2";
  const skyMidB = sky === "dusk" ? "#F6CDC8" : "#F9E2D6";
  const skyLowB = sky === "dusk" ? "#FFE0BC" : "#FFEFD2";
  const skyTop = col(h, "#E5E1E3", skyTopB), skyMid = col(h, "#E8E0DE", skyMidB), skyLow = col(h, "#E4E3DC", skyLowB);
  const far = col(h, "#D6D6DF", "#C4C2E6"), far2 = col(h, "#D8DBD8", "#B9DCC2");
  const mid = col(h, "#CCD4C6", "#A6D597"), near = col(h, "#BCC7B2", "#8EC97E");
  const sand = o.ground === "sand";
  const mead1 = sand ? col(h, "#D9D3C8", "#F4E2C2") : col(h, "#B9C3AE", "#A9D893");
  const mead2 = sand ? col(h, "#CFC8BC", "#EBD3AA") : col(h, "#A9B59F", "#7FBE6C");
  const water = col(h, "#B4C0C4", "#6FC0E0");
  const grassC = col(h, "#9EA996", "#6FAE5E"), grassL = col(h, "#B0B9A6", "#9BD27F");
  const trees = o.trees ?? [{ x: 1010, s: 0.5 }, { x: 1500, s: 0.58 }];
  const [wx0, wx1] = o.waterX ?? [-200, 3200];
  const { gust, breeze } = wind;

  return (
    <g>
      <defs>
        <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={skyTop} /><stop offset="0.5" stopColor={skyMid} /><stop offset="0.68" stopColor={skyLow} /></linearGradient>
        <radialGradient id="sun" cx="0.78" cy="0.58" r="0.55"><stop offset="0" stopColor="#FFF1D8" stopOpacity={0.95 * h} /><stop offset="0.45" stopColor="#FFE7CF" stopOpacity={0.35 * h} /><stop offset="1" stopColor="#FFE7CF" stopOpacity={0} /></radialGradient>
        <linearGradient id="mead2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mead1} /><stop offset="1" stopColor={mead2} /></linearGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col(h, "#C3CBCE", "#8FD0E6")} /><stop offset="1" stopColor={water} /></linearGradient>
        <linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#B39A86" /><stop offset="1" stopColor="#937B6A" /></linearGradient>
        <filter id="b4" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id="b8" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="b16" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16" /></filter>
        <filter id="b40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
      </defs>
      <rect width={W} height={H} fill="url(#sky2)" />
      <rect width={W} height={H} fill="url(#sun)" />
      <g filter="url(#b40)" opacity={0.55 * h}>
        {[0, 1, 2].map((i) => <path key={i} d={`M${1180 - i * 60},-60 L${1320 - i * 40},-60 L${520 - i * 230 + 20 * Math.sin(t * 0.5 + i)},1500 L${380 - i * 230 + 20 * Math.sin(t * 0.5 + i)},1500 Z`} fill="#FFFBF2" opacity={0.6 - i * 0.12} />)}
      </g>
      {[[160, 250, 1.0], [700, 180, 0.8], [1250, 300, 1.1], [1700, 220, 0.9], [2150, 270, 1]].map(([x, y, s], i) => {
        const cx = ((x + t * 9 - cam * 0.08 + 400) % 2600) - 400;
        return (
          <g key={i} transform={`translate(${cx},${y + 680}) scale(${s})`} filter="url(#b8)" opacity={0.85}>
            <ellipse cx={0} cy={0} rx={120} ry={30} fill="#FFFFFF" /><ellipse cx={-40} cy={-20} rx={60} ry={34} fill="#FFFFFF" /><ellipse cx={35} cy={-26} rx={70} ry={40} fill="#FFFFFF" />
          </g>
        );
      })}
      <g transform={`translate(${-cam * 0.15} 0)`}><path d={ridge(1150, 115, 2, -40, 3400, 20, 0.7)} fill={far} /></g>
      <g transform={`translate(${-cam * 0.2} 0)`} filter="url(#b16)" opacity={0.8}><ellipse cx={500 + t * 12} cy={1215} rx={700} ry={42} fill={skyLow} /></g>
      <g transform={`translate(${-cam * 0.28} 0)`}><path d={ridge(1260, 70, 5, -40, 3400, 20)} fill={far2} /></g>
      {o.water === "sea" ? (
        <g transform={`translate(${-cam * 0.42} 0)`}>
          <rect x={-40} y={1330} width={3600} height={300} fill="url(#sea)" />
          {Array.from({ length: 40 }, (_, i) => { const x = (i * 97 + f * (0.8 + 1.4 * h)) % 3500; const y = 1345 + (i % 6) * 22; return <path key={i} d={`M${x},${y} l${26 + 20 * rnd(i)},0`} stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" opacity={(0.25 + 0.45 * h) * (0.6 + 0.4 * Math.sin(t * 2 + i))} />; })}
        </g>
      ) : (
        <g transform={`translate(${-cam * 0.42} 0)`}>
          <path d={ridge(1340, 60, 8, -40, 3600, 20, 1.3)} fill={mid} />
          {[220, 640, 1040, 1520, 1960, 2400, 2900].map((x, i) => {
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
      )}
      {o.water !== "sea" && <g transform={`translate(${-cam * 0.65} 0)`}><path d={ridge(1430, 42, 11, -40, 3700, 20, 1.1)} fill={near} /></g>}

      {/* birds lifting off as the soul heals */}
      {o.birdsAt !== undefined && [0, 1, 2].map((i) => {
        const p = seg01(f, o.birdsAt! + i * 8, o.birdsAt! + 170 + i * 8); if (p <= 0 || p >= 1) return null;
        const bx = lerp(-60, 1150, p) + i * 40, by = 980 - 260 * p + i * 26 + 12 * Math.sin(t * 1.6 + i), w = 10 * Math.sin(t * 10 + i * 2);
        return <path key={i} d={`M${bx - 14},${by - w} Q${bx - 5},${by - 3} ${bx},${by + 2} Q${bx + 5},${by - 3} ${bx + 14},${by - w}`} stroke="#A3948C" strokeWidth={2.8} fill="none" strokeLinecap="round" />;
      })}

      {/* trees: layered sway, gusts ripple through and settle back */}
      {trees.map((tr, ti) => {
        const xs = wx(tr.x); if (xs < -400 || xs > W + 400) return null;
        const calm = (0.35 + 0.65 * h) * (0.8 * Math.sin(t * 0.8 + ti) + 0.35 * Math.sin(t * 1.7 + 1 + ti) + 0.15 * Math.sin(t * 3.1 + 2));
        const push = (lag: number) => 2.4 * gust(xs, f - lag) - 0.9 * gust(xs, f - lag - 16);
        const clusters = [[-10, 990, 160, 1, "d"], [-140, 1060, 118, 2, "d"], [130, 1050, 126, 3, "d"], [-80, 920, 118, 4, "m"], [70, 925, 122, 5, "m"], [0, 860, 100, 6, "l"],
          [-185, 985, 88, 7, "m"], [180, 975, 92, 8, "m"], [10, 1110, 112, 9, "d"], [-60, 1020, 70, 10, "l"], [90, 1000, 70, 11, "l"]] as const;
        const cc = { d: col(h, "#9DAE93", "#6DAE62"), m: col(h, "#AEBCA5", "#89C677"), l: col(h, "#C1CBB8", "#B3E09A") };
        const bl = (i: number) => tr.bloom === undefined ? 0 : clamp01(Math.pow(clamp01((f - tr.bloom - i * 1.2) / 18), 0.7)) * (1 + 0.25 * Math.sin(Math.PI * clamp01((f - tr.bloom - i * 1.2) / 18)));
        return (
          <g key={ti} transform={`translate(${xs} ${1550}) scale(${tr.s}) translate(0 -1550)`}>
            <ellipse cx={0} cy={1548} rx={260} ry={22} fill="#7F946F" opacity={0.18} filter="url(#b16)" />
            <g transform={`rotate(${0.35 * calm + 0.5 * push(4)} 0 1550)`}>
              <path d="M-16,1550 C-12,1440 -24,1320 -8,1170 L12,1170 C8,1320 22,1440 26,1550 Z" fill="url(#trunk)" />
              <path d="M-6,1300 C-50,1250 -95,1215 -140,1195 L-136,1186 C-88,1202 -40,1236 2,1282 Z" fill="#A58D7B" />
              <path d="M10,1255 C46,1205 92,1180 136,1166 L140,1175 C98,1190 58,1222 22,1268 Z" fill="#A58D7B" />
              <g transform={`rotate(${0.9 * calm + push(6)} 0 1290)`}>
                {clusters.map(([x, y, r, sd, k], i) => {
                  const lag = (1290 - y) / 60;
                  const flut = 2.5 * Math.sin(t * (2.2 + (i % 3) * 0.4) + i) * (0.4 + h) + 9 * gust(xs + x * tr.s, f - lag);
                  return <path key={i} d={blob(x + flut, y + Math.cos(t * 1.4 + i) * 2 - 2 * gust(xs, f - lag), r, sd + ti * 3, 0.82, 0.025 * Math.sin(t * 2.4 + i) + 0.02 * gust(xs, f))} fill={cc[k]} />;
                })}
                {tr.bloom !== undefined && Array.from({ length: 34 }, (_, i) => {
                  const a2 = rnd(i) * Math.PI * 2, d = Math.sqrt(rnd(i + 40)); const x = Math.cos(a2) * 215 * d, y = 990 + Math.sin(a2) * 160 * d;
                  return <g key={`f${i}`} transform={`translate(${x},${y}) rotate(${i * 37 + t * 10})`}><Flower s={(0.9 + rnd(i + 9) * 0.7) * bl(i)} c={(tr.blossom ?? ["#F6CFCB", "#FCE4DA", "#EFC0C6", "#FFF3EA"])[i % 4]} /></g>;
                })}
              </g>
            </g>
          </g>
        );
      })}
      {wind.gusts.flatMap((g, gi) => [0, 1, 2].map((i) => {
        const tr = trees[(gi + i) % trees.length]; if (!tr) return null; const xs0 = wx(tr.x);
        const arrive = g + (xs0 + 260) / 30; const p = (f - arrive - i * 4) / 80; if (p <= 0 || p >= 1) return null;
        const x = xs0 - 80 + rnd(gi * 7 + i) * 160 + p * 380 + 30 * Math.sin(p * 9 + i), y = 1000 + rnd(gi * 5 + i) * 160 + p * 420;
        return <path key={`lv${gi}${i}`} d={leaf} fill={col(h, "#AEBCA5", "#A9C996")} opacity={Math.sin(p * Math.PI)} transform={`translate(${x},${y}) rotate(${p * 600 + i * 40}) scale(0.8)`} />;
      }))}

      {/* ground (meadow / sand) */}
      <g transform={`translate(${-cam} 0)`}>
        <path d={ridge(1508, 14, 3, -40, 3800, 30, 0.8)} fill="url(#mead2)" />
        <g filter="url(#b40)" opacity={0.35 * h}>
          <ellipse cx={600 + t * 20} cy={1700} rx={420} ry={60} fill="#F6F0D2" /><ellipse cx={1500 + t * 15} cy={1820} rx={460} ry={70} fill="#F6F0D2" />
        </g>
        {o.water === "lake" && (
          <g>
            <path d={blob((wx0 + wx1) / 2, 1610, (wx1 - wx0) / 2, 4, 0.2)} fill={water} />
            {Array.from({ length: 30 }, (_, i) => { const span = wx1 - wx0 - 120, x = wx0 + 60 + ((i * 71 + f * (0.5 + 1.6 * h)) % span); const y = 1590 + (i % 5) * 10; return <path key={i} d={`M${x},${y} l${22 + 18 * rnd(i)},0`} stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" opacity={(0.25 + 0.45 * h) * (0.6 + 0.4 * Math.sin(t * 2 + i))} />; })}
          </g>
        )}
        {o.water === "brook" && (
          <g>
            <path d={`M${wx0},${1575} C${wx0 + 200},${1560} ${wx1 - 200},${1600} ${wx1},${1585} L${wx1},${1640} C${wx1 - 200},${1655} ${wx0 + 200},${1615} ${wx0},${1630} Z`} fill={water} />
            {Array.from({ length: 24 }, (_, i) => { const x = wx0 + ((i * 53 + f * (1 + 2 * h)) % (wx1 - wx0)); return <path key={i} d={`M${x},${1596 + (i % 4) * 9} l${20 + 14 * rnd(i)},0`} stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" opacity={(0.3 + 0.4 * h) * (0.6 + 0.4 * Math.sin(t * 2.4 + i))} />; })}
          </g>
        )}
        {o.worldProps}
        {/* wildflowers bloom across the ground as the soul heals */}
        {Array.from({ length: 170 }, (_, i) => {
          const patch = i % 9, cx = 260 + patch * 360 + rnd(patch) * 120;
          const x = cx + (rnd(i + 11) - 0.5) * 260, y = 1700 + rnd(patch + 3) * 150 + (rnd(i + 12) - 0.5) * 90;
          if (x - cam < -40 || x - cam > W + 40) return null;
          const g = sstep(clamp01((h - 0.25 - rnd(i) * 0.3) / 0.25)); if (g <= 0) return null;
          const sw = breeze(x - cam, f, h) * 2;
          return <g key={`wf${i}`} transform={`translate(${x},${y}) rotate(${sw})`}>
            <path d={`M0,0 q-1,-8 0,${-16 * g}`} stroke={sand ? "#9FB08A" : grassC} strokeWidth={2.2} fill="none" />
            <g transform={`translate(0,${-16 * g})`}><Flower s={(0.55 + 0.4 * rnd(i + 5)) * g} c={POPPIES[(i + patch) % 6]} /></g>
          </g>;
        })}
        {o.behindSoul}
        {o.extraSouls}
        {!o.hideSoul && <Soul c={c} f={f} />}
        {o.front}
        {/* grass, moving with the wind */}
        {Array.from({ length: sand ? 160 : 600 }, (_, i) => {
          const x = rnd(i) * 3800 - 40; const xs = x - cam; if (xs < -40 || xs > W + 40) return null;
          const y = 1530 + Math.pow(rnd(i + 3), 0.8) * 400;
          if (o.water && o.water !== "none" && o.water !== "sea" && x > wx0 - 20 && x < wx1 + 20 && y > 1550 && y < 1660) return null;
          if (Math.abs(x - c.xAt(f)) < 70 && y > 1530 && y < 1575) return null; // keep the soul's feet visible
          const len = (14 + rnd(i + 5) * 26) * (0.7 + (y - 1530) / 400) * (sand ? 0.6 : 1);
          const b = breeze(xs, f, h) * (6 + rnd(i + 7) * 5) + 1.5;
          return <path key={i} d={`M${x},${y} q${b * 0.4},${-len * 0.55} ${b},${-len}`} stroke={i % 3 ? grassC : grassL} strokeWidth={2.6 + rnd(i) * 1.4} fill="none" strokeLinecap="round" />;
        })}
      </g>
      {wind.gusts.map((g, i) => { if (f < g) return null; const front = -260 + (f - g) * 30; if (front > W + 300) return null; return <ellipse key={i} cx={front} cy={1640} rx={200} ry={260} fill="#FFFCEF" opacity={0.16} filter="url(#b40)" />; })}
      {/* butterflies find the soul as it heals */}
      {o.butterflies !== undefined && [0, 1].map((i) => {
        const a = seg01(f, o.butterflies! + i * 25, o.butterflies! + 60 + i * 25); if (a <= 0) return null;
        const hd = headPt(c, f);
        const tx = hd.x - cam + 70 + i * 50 + 40 * Math.sin(t * 1.3 + i * 2), ty = hd.y - 70 - i * 40 + 30 * Math.sin(t * 1.9 + i);
        const x = lerp(1150 + i * 60, tx, smoother(a)), y = lerp(900 + i * 80, ty, smoother(a)); const flap = Math.abs(Math.sin(t * 14 + i * 3)); const cc = i ? "#F2C4CC" : "#F7DCA9";
        return (
          <g key={i} transform={`translate(${x},${y}) rotate(${-15 + 10 * Math.sin(t * 3 + i)})`}>
            <path d="M0,0 C-14,-20 -26,-8 -16,4 C-10,10 -4,6 0,2Z" fill={cc} transform={`scale(${0.35 + 0.65 * flap},1)`} />
            <path d="M0,0 C14,-20 26,-8 16,4 C10,10 4,6 0,2Z" fill={cc} transform={`scale(${0.35 + 0.65 * flap},1)`} opacity={0.9} />
            <path d="M0,-6 L0,8" stroke="#9C8573" strokeWidth={2} strokeLinecap="round" />
          </g>
        );
      })}
      {/* seeds and petals riding the wind */}
      {o.petalsFrom !== undefined && Array.from({ length: 30 }, (_, i) => {
        const start = o.petalsFrom! + rnd(i) * 220; if (f < start) return null; const p = (f - start) / (120 + rnd(i + 2) * 80); if (p > 1) return null;
        const x = -40 + p * 1180 + 30 * Math.sin(p * 8 + i), y = 1250 + rnd(i + 4) * 520 - p * 240 + 26 * Math.sin(p * 5 + i * 2);
        return i % 3 === 0
          ? <g key={i} transform={`translate(${x},${y}) rotate(${p * 300})`} opacity={Math.sin(p * Math.PI)}><path d={petal} fill="#F7D3CE" transform="scale(1.3)" /></g>
          : <g key={i} transform={`translate(${x},${y}) rotate(${p * 120})`} opacity={0.8 * Math.sin(p * Math.PI)} stroke="#FFFFFF" strokeWidth={1.3}>{[0, 60, 120, 180, 240, 300].map((a) => <path key={a} d="M0,0 L0,-7" transform={`rotate(${a})`} />)}</g>;
      })}
      {/* warm motes in the light */}
      {Array.from({ length: 18 }, (_, i) => {
        const per = 6 + rnd(i) * 4, p = ((t + rnd(i + 1) * per) % per) / per; const x = 120 + rnd(i + 2) * 880 + 30 * Math.sin(p * 6 + i), y = 1500 - p * 520;
        return <g key={i} transform={`translate(${x},${y})`}><Spark s={0.28 + 0.2 * rnd(i + 3)} o={h * Math.sin(p * Math.PI) * 0.9} /></g>;
      })}
    </g>
  );
};

// a soft cream/blush closed book (front always veiled: spine/back towards camera, never the real cover)
export const Book: React.FC<{ glow?: number; open?: number; spine?: boolean }> = ({ glow = 0, open = 0, spine = true }) => (
  <g>
    <ellipse cx={0} cy={0} rx={70} ry={52} fill="#FFE2B0" opacity={0.6 * glow} filter="url(#b16)" />
    {open > 0.01 ? (
      <g>
        <path d={`M0,-26 L${-56 * open - 4},-30 L${-56 * open - 4},26 L0,30 Z`} fill="#FFFBF2" stroke="#E7D7C3" strokeWidth={1.4} />
        <path d={`M0,-26 L${56 * open + 4},-30 L${56 * open + 4},26 L0,30 Z`} fill="#FFF8EC" stroke="#E7D7C3" strokeWidth={1.4} />
        {[0, 1, 2, 3].map((k) => <path key={k} d={`M${8},${-16 + k * 10} l${40 * open},-2`} stroke="#E6D6C2" strokeWidth={1.4} />)}
      </g>
    ) : (
      <g>
        <rect x={-34} y={-44} width={68} height={88} rx={6} fill="#F6DCD6" />
        <rect x={-34} y={-44} width={14} height={88} rx={4} fill="#EBC4BD" />
        <rect x={-30} y={-40} width={62} height={80} rx={4} fill="#F9E6E0" />
        {spine && <path d="M-27,-30 L-27,30" stroke="#C49A62" strokeWidth={1.6} strokeDasharray="3 4" opacity={0.8} />}
        <rect x={-34} y={40} width={68} height={6} rx={2} fill="#FFF8EE" />
      </g>
    )}
  </g>
);
