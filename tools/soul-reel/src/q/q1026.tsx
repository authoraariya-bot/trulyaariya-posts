// 26 Oct · Savage · "Don't shrink yourself because someone can't see your worth."
// Sunflower field at golden hour. A pair of designer glasses squints at one sunflower in a pot; each squint, the flower
// shrinks. Then it stops ("nope."), erupts out of its pot to fill the sky, the glasses fog up and slide off.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { QFrame, Words, W, KeyW, Aside, Motes, seg, sm, ss, lerp, rnd, back, spring, wind, mix } from "./kit";
import { EndCard } from "../kit/Words";
import { LightLeak } from "../kit/fx";

export const END = 420; const WIPE = 330, CARD = 348;
const T = { in: 12, sq: [52, 92, 128], stop: 150, erupt: 168, fog: 186, slide: 206, line2: 214, key: 250 };
const BASE = { x: 540, y: 1430 }; // pot rim (stem base)
const ACCENT = "#E2376F";

// hero flower scale over time: three squints shrink it, then it erupts with an overshoot
const scaleAt = (f: number) => {
  let s = 1;
  T.sq.forEach((a, i) => { s -= 0.17 * sm(seg(f, a + 4, a + 16)); });
  const e = spring(seg(f, T.erupt, T.erupt + 60), 2.2, 4.2);
  return lerp(s, 1.85, e);
};
const swayAt = (f: number) => 3.2 * wind(f, 540) + 9 * Math.sin(Math.PI * seg(f, T.erupt, T.erupt + 30)) * (1 - seg(f, T.erupt, T.erupt + 50));

// ---------- a detailed sunflower head (petals in two rings, phyllotaxis seeds) ----------
const Head: React.FC<{ r: number; f: number; id: string; open?: number; detail?: boolean }> = ({ r, f, id, open = 1, detail = true }) => {
  const n = detail ? 26 : 16;
  const ring = (k: number, len: number, w: number, off: number, c1: string, c2: string) => Array.from({ length: n }, (_, i) => {
    const a = (i / n) * 360 + off + (detail ? 2 * Math.sin(f / 18 + i) : 0);
    const L = len * (0.9 + 0.18 * rnd(i + k * 31)) * open;
    return (
      <g key={`${k}-${i}`} transform={`rotate(${a})`}>
        <path d={`M0,${-r * 0.42} C${w},${-r * 0.5 - L * 0.35} ${w * 0.7},${-r * 0.5 - L * 0.85} 0,${-r * 0.48 - L} C${-w * 0.7},${-r * 0.5 - L * 0.85} ${-w},${-r * 0.5 - L * 0.35} 0,${-r * 0.42} Z`} fill={`url(#${id}${k ? "pb" : "pa"})`} />
        {detail && <path d={`M0,${-r * 0.5} L0,${-r * 0.48 - L * 0.85}`} stroke={c2} strokeWidth={1.4} opacity={0.35} />}
      </g>
    );
  });
  return (
    <g>
      <defs>
        <linearGradient id={`${id}pa`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#F59A1B" /><stop offset="0.55" stopColor="#FFC52E" /><stop offset="1" stopColor="#FFE27A" /></linearGradient>
        <linearGradient id={`${id}pb`} x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#E9801A" /><stop offset="1" stopColor="#FFB82A" /></linearGradient>
        <radialGradient id={`${id}c`} cx="0.42" cy="0.38"><stop offset="0" stopColor="#8A5236" /><stop offset="0.6" stopColor="#5E3424" /><stop offset="1" stopColor="#3E2018" /></radialGradient>
      </defs>
      <circle r={r * 1.25} fill="#FFD25A" opacity={0.25} filter="url(#qb16)" />
      {ring(1, r * 0.95, r * 0.2, 360 / n / 2, "#E9801A", "#B85F12")}
      {ring(0, r * 1.05, r * 0.22, 0, "#FFC52E", "#C9761A")}
      <circle r={r * 0.52} fill={`url(#${id}c)`} />
      {detail && Array.from({ length: 240 }, (_, i) => {
        const a = i * 137.508 * Math.PI / 180, d = Math.sqrt(i / 240) * r * 0.48;
        return <circle key={i} cx={d * Math.cos(a)} cy={d * Math.sin(a)} r={1.2 + 1.6 * (d / (r * 0.48))} fill={i % 3 ? "#7A4630" : "#A0663F"} opacity={0.9} />;
      })}
      <circle r={r * 0.52} fill="none" stroke="#2E160F" strokeWidth={r * 0.05} opacity={0.35} />
      <ellipse cx={-r * 0.16} cy={-r * 0.2} rx={r * 0.2} ry={r * 0.12} fill="#FFFFFF" opacity={0.12} />
    </g>
  );
};

// a background sunflower: stem + leaf + head, swaying from its base
const FieldFlower: React.FC<{ x: number; y: number; s: number; f: number; i: number; gust: number; blur?: number }> = ({ x, y, s, f, i, gust, blur }) => {
  const a = (4 + 3 * rnd(i)) * wind(f, x, gust * 2.4) + gust * 10;
  const h = 260 * s;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`} filter={blur ? `url(#qb${blur})` : undefined}>
      <path d={`M0,0 C${6 * s},${-h * 0.4} ${-4 * s},${-h * 0.7} 0,${-h}`} stroke="#5FAE6E" strokeWidth={9 * s} fill="none" strokeLinecap="round" />
      <path d={`M0,${-h * 0.45} C${30 * s},${-h * 0.55} ${60 * s},${-h * 0.5} ${70 * s},${-h * 0.42} C${50 * s},${-h * 0.4} ${20 * s},${-h * 0.4} 0,${-h * 0.45} Z`} fill="#6CC07C" />
      <g transform={`translate(0 ${-h}) rotate(${-10 + 20 * rnd(i + 3)}) scale(1 ${0.86 + 0.14 * rnd(i + 2)})`}><Head r={58 * s} f={f} id={`ff${i}`} detail={false} /></g>
    </g>
  );
};

const Glasses: React.FC<{ f: number; head: { x: number; y: number }; r: number }> = ({ f, head, r }) => {
  const enter = back(seg(f, T.in, T.in + 26), 1.4);
  if (f < T.in) return null;
  // squint: lean in, narrow the lenses, tilt
  const sq = T.sq.reduce((m, a) => Math.max(m, Math.sin(Math.PI * seg(f, a, a + 24))), 0);
  const fog = sm(seg(f, T.fog, T.fog + 18));
  const slide = seg(f, T.slide, T.slide + 34);
  const fall = slide * slide;
  // the observer: hovers up and to the right of the flower, peering down at it; each squint it leans a little closer
  const lean = T.sq.reduce((m, a) => m + sm(seg(f, a, a + 14)), 0) / 3;
  const push = sm(seg(f, T.erupt, T.erupt + 20)); // shoved back by the eruption
  const gx = lerp(1180, 800 - 70 * lean + 60 * push, enter) + 60 * fall + 4 * Math.sin(f / 19);
  const gy = lerp(420, 700 + 90 * lean - 60 * push, enter) + 1400 * fall + 6 * Math.sin(f / 14);
  const sc = (0.95 + 0.12 * sq + 0.08 * lean) * lerp(1, 1.05, fog), rot = -16 - 8 * sq - 6 * lean + 3 * Math.sin(f / 22) + 14 * push + 80 * fall;
  const lens = (cx: number) => (
    <g>
      <ellipse cx={cx} cy={0} rx={92} ry={lerp(70, 38, sq)} fill="url(#lensg)" />
      <ellipse cx={cx} cy={0} rx={92} ry={lerp(70, 38, sq)} fill="#FFFFFF" opacity={0.88 * fog} />
      {fog > 0.3 && Array.from({ length: 9 }, (_, k) => <circle key={k} cx={cx - 60 + 120 * rnd(k + cx)} cy={-30 + 60 * rnd(k + 7 + cx) + 14 * seg(f, T.fog + 10, T.slide + 30)} r={3 + 3 * rnd(k)} fill="#E6F1FA" opacity={fog} />)}
      <path d={`M${cx - 58},${-26 * lerp(1, 0.6, sq)} L${cx - 18},${-46 * lerp(1, 0.6, sq)}`} stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" opacity={0.75 * (1 - fog)} />
      <ellipse cx={cx} cy={0} rx={92} ry={lerp(70, 38, sq)} fill="none" stroke="url(#frameg)" strokeWidth={17} />
    </g>
  );
  return (
    <g transform={`translate(${gx} ${gy}) rotate(${rot}) scale(${sc * 0.92})`} opacity={1 - seg(f, T.slide + 26, T.slide + 34)}>
      <defs>
        <linearGradient id="frameg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#B08CFF" /><stop offset="0.5" stopColor="#7C5CE0" /><stop offset="1" stopColor="#C6A9FF" /></linearGradient>
        <radialGradient id="lensg" cx="0.35" cy="0.3"><stop offset="0" stopColor="#E9F6FF" stopOpacity={0.5} /><stop offset="1" stopColor="#8FC9F0" stopOpacity={0.35} /></radialGradient>
      </defs>
      <ellipse cx={0} cy={150} rx={200} ry={18} fill="#6B3A2A" opacity={0.0} />
      {lens(-110)}{lens(110)}
      <path d="M-22,-8 Q0,-30 22,-8" stroke="url(#frameg)" strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d="M-200,-14 L-232,-24" stroke="#7C5CE0" strokeWidth={12} strokeLinecap="round" /><path d="M200,-14 L232,-24" stroke="#7C5CE0" strokeWidth={12} strokeLinecap="round" />
    </g>
  );
};

const World: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const gust = Math.sin(Math.PI * seg(f, T.erupt - 4, T.erupt + 50));
  const glow = sm(seg(f, T.erupt, T.erupt + 50));
  const s = scaleAt(f), sway = swayAt(f);
  const shake = 6 * Math.sin(f * 2.1) * Math.sin(Math.PI * seg(f, T.erupt, T.erupt + 16));
  // camera: slow push-in, then pull back as the flower erupts
  const cam = lerp(1.0, 1.08, ss(seg(f, 0, T.stop))) * lerp(1, 0.94, sm(seg(f, T.erupt, T.erupt + 40)));
  const potBreak = seg(f, T.erupt, T.erupt + 40);
  const root = sm(seg(f, T.erupt, T.erupt + 24));          // once the pot is gone the stem reaches down into the soil
  const baseY = BASE.y + 168 * root;
  const stemH = 300 * s + 150 * root;
  const rad = (sway * Math.PI) / 180;
  const head = { x: BASE.x + Math.sin(rad) * stemH, y: baseY - Math.cos(rad) * stemH };
  const R = 110 * s;
  return (
    <g transform={`translate(${540 + shake} ${1100}) scale(${cam}) translate(-540 -1100)`}>
      <defs>
        <linearGradient id="sky26" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix("#FF8FB6", "#FF9DC0", glow)} /><stop offset="0.38" stopColor={mix("#FFB29A", "#FFC0A0", glow)} />
          <stop offset="0.62" stopColor={mix("#FFD49A", "#FFE3A3", glow)} /><stop offset="1" stopColor="#FFE9B8" />
        </linearGradient>
        <radialGradient id="sun26"><stop offset="0" stopColor="#FFFBE6" /><stop offset="0.35" stopColor="#FFE9A6" /><stop offset="1" stopColor="#FFC27A" stopOpacity={0} /></radialGradient>
        <linearGradient id="hillA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D6A6E8" /><stop offset="1" stopColor="#F2B9C9" /></linearGradient>
        <linearGradient id="hillB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F59EAF" /><stop offset="1" stopColor="#FFC0A6" /></linearGradient>
        <linearGradient id="fieldG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FD08C" /><stop offset="1" stopColor="#4FA26A" /></linearGradient>
        <linearGradient id="potG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#E86F5A" /><stop offset="0.45" stopColor="#FF9A7E" /><stop offset="1" stopColor="#D85C4C" /></linearGradient>
      </defs>
      <rect x={-200} y={-200} width={1480} height={2400} fill="url(#sky26)" />
      {/* sun + halo */}
      <circle cx={760} cy={1010 - 40 * glow} r={330 + 80 * glow} fill="url(#sun26)" />
      <circle cx={760} cy={1010 - 40 * glow} r={92} fill="#FFF6D8" />
      {/* drifting clouds */}
      {[0, 1, 2, 3].map((i) => { const x = ((i * 380 + t * (14 + 6 * i)) % 1600) - 300, y = 420 + 120 * i + 30 * Math.sin(i);
        return <g key={i} opacity={0.55} filter="url(#qb10)"><ellipse cx={x} cy={y} rx={170 + 40 * i} ry={34} fill="#FFF1E8" /><ellipse cx={x + 90} cy={y - 18} rx={110} ry={30} fill="#FFF6EE" /></g>; })}
      {/* birds */}
      {[0, 1, 2].map((i) => { const x = ((t * 60 + i * 140) % 1500) - 200, y = 640 + 40 * i + 12 * Math.sin(t * 2 + i), w = 9 * Math.sin(t * 9 + i);
        return <path key={i} d={`M${x - 16},${y - w} Q${x - 8},${y - 6} ${x},${y} Q${x + 8},${y - 6} ${x + 16},${y - w}`} stroke="#8A5A78" strokeWidth={3} fill="none" opacity={0.6} />; })}
      {/* hills */}
      <path d="M-200,1120 C80,1040 260,1080 470,1050 C700,1015 900,1070 1280,1020 L1280,1400 L-200,1400 Z" fill="url(#hillA)" opacity={0.9} />
      <path d="M-200,1180 C120,1120 360,1170 560,1140 C800,1100 980,1160 1280,1120 L1280,1400 L-200,1400 Z" fill="url(#hillB)" />
      {/* far field: tiny heads */}
      <rect x={-200} y={1170} width={1480} height={800} fill="url(#fieldG)" />
      {Array.from({ length: 60 }, (_, i) => { const x = -60 + (i % 30) * 42 + 16 * rnd(i), y = 1190 + Math.floor(i / 30) * 26 + 8 * rnd(i + 9);
        const a = 5 * wind(f, x, gust * 2);
        return <g key={i} transform={`translate(${x} ${y}) rotate(${a})`} filter="url(#qb2)"><circle cy={-10} r={9} fill="#FFC53A" /><circle cy={-10} r={3.5} fill="#6B3A26" /></g>; })}
      {/* mid field */}
      {Array.from({ length: 22 }, (_, i) => <FieldFlower key={i} x={-60 + i * 56 + 34 * rnd(i)} y={1250 + 70 * rnd(i + 4)} s={0.3 + 0.22 * rnd(i + 1)} f={f} i={i} gust={gust} />)}
      {Array.from({ length: 9 }, (_, i) => { const x = -40 + i * 140 + 50 * rnd(i + 20); if (Math.abs(x - 540) < 170) return null;
        return <FieldFlower key={`n${i}`} x={x} y={1380 + 90 * rnd(i + 21)} s={0.55 + 0.3 * rnd(i + 22)} f={f + 7} i={i + 40} gust={gust} />; })}
      <GodRaysSvg f={f} amt={0.5 + 0.4 * glow} />
      {/* the stone + pot */}
      <ellipse cx={BASE.x} cy={BASE.y + 185} rx={200} ry={30} fill="#2F5A3A" opacity={0.4} filter="url(#qb10)" />
      {/* hero stem + leaves */}
      <g transform={`translate(${BASE.x} ${baseY}) rotate(${sway})`}>
        <path d={`M0,10 C10,${-stemH * 0.35} -10,${-stemH * 0.7} 0,${-stemH}`} stroke="#4E9E5E" strokeWidth={14 * Math.sqrt(s)} fill="none" strokeLinecap="round" />
        {[0.38, 0.62].map((k, i) => { const d = i ? -1 : 1, L = 120 * Math.sqrt(s);
          return <path key={i} d={`M0,${-stemH * k} C${d * L * 0.4},${-stemH * k - L * 0.45} ${d * L},${-stemH * k - L * 0.2} ${d * L * 1.1},${-stemH * k + L * 0.05} C${d * L * 0.7},${-stemH * k + L * 0.05} ${d * L * 0.3},${-stemH * k + L * 0.02} 0,${-stemH * k} Z`}
            fill={i ? "#62B672" : "#57AA68"} transform={`rotate(${4 * Math.sin(f / 16 + i)} 0 ${-stemH * k})`} />; })}
      </g>
      <g transform={`translate(${head.x} ${head.y}) rotate(${sway * 0.6 + 4 * Math.sin(f / 30)})`}><Head r={R} f={f} id="hero" open={lerp(0.9, 1.05, sm(seg(f, T.erupt, T.erupt + 40)))} /></g>
      {/* pot: whole, then breaks into shards */}
      {[[-1, 0], [0, 1], [1, 2]].map(([d, k]) => {
        const p = potBreak, fx = d * 260 * p, fy = 900 * p * p - 120 * Math.sin(Math.PI * p), rot = d * 70 * p;
        const clip = k === 0 ? "M-120,0 L-30,0 L-50,170 L-95,170 Z" : k === 1 ? "M-30,0 L40,0 L25,170 L-50,170 Z" : "M40,0 L120,0 L95,170 L25,170 Z";
        return (
          <g key={k} transform={`translate(${BASE.x + fx} ${BASE.y + 6 + fy}) rotate(${rot})`} opacity={1 - seg(f, T.erupt + 24, T.erupt + 40)}>
            {p > 0 && <path d={clip} fill="url(#potG)" />}
            {p > 0 && k === 1 && <rect x={-128} y={-14} width={256} height={36} rx={10} fill="#F27E66" opacity={1 - p} />}
          </g>
        );
      })}
      {/* soil mound that stays when the pot is gone: the flower is rooted in the field */}
      <ellipse cx={BASE.x} cy={BASE.y + 176} rx={lerp(100, 150, potBreak)} ry={lerp(18, 30, potBreak)} fill="#6E4A3A" opacity={sm(potBreak)} />
      <ellipse cx={BASE.x - 30} cy={BASE.y + 170} rx={60} ry={10} fill="#8A5E48" opacity={sm(potBreak)} />
      {f < T.erupt && (
        <g transform={`translate(${BASE.x} ${BASE.y})`}>
          <path d="M-118,14 L118,14 L94,176 C90,186 -90,186 -94,176 Z" fill="url(#potG)" />
          <path d="M-70,30 L-56,166" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.25} />
          <rect x={-130} y={-10} width={260} height={38} rx={12} fill="#F58A70" />
          <rect x={-130} y={-10} width={260} height={12} rx={6} fill="#FFB49D" opacity={0.7} />
          <ellipse cx={0} cy={-4} rx={112} ry={8} fill="#6E4A3A" />
        </g>
      )}
      {/* burst of petals at the eruption */}
      {f >= T.erupt && f < T.erupt + 70 && Array.from({ length: 34 }, (_, i) => {
        const p = seg(f, T.erupt, T.erupt + 60 + 10 * rnd(i)), a = rnd(i) * Math.PI * 2, d = 200 + 700 * rnd(i + 3);
        return <path key={i} d="M0,-14 C7,-8 7,8 0,14 C-7,8 -7,-8 0,-14 Z" transform={`translate(${head.x + Math.cos(a) * d * sm(p)} ${head.y + Math.sin(a) * d * sm(p) + 300 * p * p}) rotate(${a * 57 + p * 400}) scale(${1.4 + rnd(i + 1)})`} fill={i % 3 ? "#FFC52E" : "#FF9DB8"} opacity={1 - p} />;
      })}
      <Glasses f={f} head={head} r={R} />
      <Motes f={f} n={60} color="#FFF0B0" y0={500} y1={1800} gust={gust} />
      {/* blurred foreground flowers for depth */}
      <FieldFlower x={60} y={2020} s={1.7} f={f + 13} i={90} gust={gust} blur={10} />
      <FieldFlower x={1040} y={2060} s={1.9} f={f + 29} i={91} gust={gust} blur={10} />
    </g>
  );
};
const GodRaysSvg: React.FC<{ f: number; amt: number }> = ({ f, amt }) => (
  <g opacity={amt} style={{ mixBlendMode: "screen" }} filter="url(#qb24)">
    {Array.from({ length: 7 }, (_, i) => { const a = (-60 + i * 20 + 4 * Math.sin(f / 40 + i)) * Math.PI / 180;
      return <path key={i} d={`M760,1010 L${760 + Math.cos(a - 0.05) * 1600},${1010 + Math.sin(a - 0.05) * 1600} L${760 + Math.cos(a + 0.05) * 1600},${1010 + Math.sin(a + 0.05) * 1600} Z`} fill="#FFF3CC" opacity={0.18 + 0.1 * Math.sin(f / 20 + i)} />; })}
  </g>
);

const Overlay: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <LightLeak f={f} amt={0.35 + 0.35 * Math.sin(Math.PI * seg(f, T.erupt - 10, WIPE))} side="right" tint="gold" />
    <Words f={f} from={0} to={T.erupt - 4} top={200}>
      <div><W f={f} at={2}>Don't</W><W f={f} at={8} last>shrink</W></div>
      <div><W f={f} at={14} last>yourself</W></div>
    </Words>
    <Aside f={f} at={T.stop} to={T.erupt + 6} x={640} y={1060} color={ACCENT} rot={-8} size={96}>nope.</Aside>
    <Words f={f} from={T.line2 - 4} to={WIPE - 4} top={150} size={78}>
      <div><W f={f} at={T.line2}>because</W><W f={f} at={T.line2 + 6} last>someone</W></div>
      <div><W f={f} at={T.line2 + 14}>can't</W><W f={f} at={T.line2 + 20}>see</W><W f={f} at={T.line2 + 26} last>your</W></div>
      <div style={{ marginTop: -10 }}><KeyW f={f} at={T.key} color={ACCENT} size={150}>worth.</KeyW></div>
    </Words>
    <EndCard f={f} wipe={WIPE} card={CARD} />
  </AbsoluteFill>
);

export const Q1026: React.FC = () => { const f = useCurrentFrame(); return <QFrame world={<World f={f} />} overlay={<Overlay f={f} />} audio="q1026.wav" />; };
export const BEATS = { ...T, END, WIPE, CARD };
