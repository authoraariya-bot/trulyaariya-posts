// 27 Oct · Healing · "In a world full of restless waves, be the seashore. Calm and steady."
// A cliffside cove. Restless teal waves race in under a stormy sky, their foam spelling "what if", "deadline",
// "they said". Each one reaches the shore and dissolves into the sand. The sea slows to glass, the sky turns
// to a peach sunset and the sun's path shimmers on calm water.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { QFrame, Words, W, KeyW, Motes, seg, sm, lerp, rnd, mix } from "./kit";
import { EndCard } from "../kit/Words";
import { LightLeak } from "../kit/fx";

export const END = 400; const WIPE = 310, CARD = 328;
const T = { calm0: 120, calm1: 220, line2: 196, key: 214, steady: 252 };
const HZ = 960; // horizon
const shoreY = (x: number) => 1430 + 46 * Math.sin(x / 260 + 0.6) + 18 * Math.sin(x / 90);
const ACCENT = "#E85A87";

// calm: 0 restless → 1 glassy
const calmAt = (f: number) => sm(seg(f, T.calm0, T.calm1));
// waves: a new wave every `period` frames; position p (0 at horizon → 1 at shore) eases with perspective
const WAVES = (() => {
  const out: { born: number; life: number; word?: string }[] = []; let f = -120, k = 0;
  const words: Record<number, string> = { 4: "what if", 6: "deadline", 8: "they said", 10: "not enough" };
  while (f < END) { const c = calmAt(Math.max(0, f)); const life = lerp(70, 150, c); out.push({ born: f, life, word: words[k] }); f += lerp(16, 46, c); k++; }
  return out;
})();

const Sea: React.FC<{ f: number }> = ({ f }) => {
  const c = calmAt(f);
  return (
    <g>
      {WAVES.map((w, i) => {
        const p = (f - w.born) / w.life; if (p < 0 || p > 1.12) return null;
        const pp = Math.pow(Math.min(p, 1), 1.7);
        const amp = lerp(26, 5, c) * (0.25 + pp) * (1 + 0.3 * rnd(i));
        const pts: string[] = []; const top: [number, number][] = [];
        for (let x = -60; x <= 1140; x += 15) {
          // peaked, uneven crests: amplitude varies along the wave, crests are sharp and troughs soft
          const env = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(x / (180 + 80 * rnd(i)) + i * 1.7 + f / 40), 1.4);
          const ph = x / lerp(70 + 30 * rnd(i + 1), 160, c) + f / lerp(5, 14, c) + i * 2.3;
          const crest = -Math.pow(0.5 + 0.5 * Math.sin(ph), 2.2) * 2 + 1;
          const sy = shoreY(x); const y = lerp(HZ + 6, sy, pp) + amp * env * crest * (p > 1 ? 0 : 1.4);
          top.push([x, y]);
        }
        top.forEach(([x, y]) => pts.push(`${x},${y}`));
        const thick = (6 + 34 * pp) * lerp(1, 0.4, c);
        const bottom = top.slice().reverse().map(([x, y]) => `${x},${y + thick}`);
        const o = (p > 1 ? 1 - (p - 1) / 0.12 : 1) * Math.min(1, p * 6) * lerp(0.95, 0.55, c);
        return (
          <g key={i} opacity={o}>
            <polygon points={[...pts, ...bottom].join(" ")} fill={mix("#E9FBFA", "#FFF4EA", c)} opacity={0.75} />
            <polyline points={pts.join(" ")} fill="none" stroke="#FFFFFF" strokeWidth={2 + 4 * pp} opacity={0.9} />
            {w.word && p < 1.1 && (() => {
              const x = 300 + 380 * rnd(i), y = lerp(HZ + 6, shoreY(x), pp) - 10;
              const dis = seg(p, 0.86, 1.08);
              return <text x={x} y={y} fontFamily="Caveat" fontWeight={700} fontSize={30 + 70 * pp} fill="#FFFFFF" textAnchor="middle" opacity={(1 - dis) * Math.min(1, p * 4)} style={{ letterSpacing: 2 * dis * 10 }} filter={dis > 0 ? "url(#qb2)" : undefined}>{w.word}</text>;
            })()}
            {p > 0.92 && p < 1.12 && Array.from({ length: 14 }, (_, k) => { const x = rnd(k + i * 3) * 1080, q = seg(p, 0.92, 1.12);
              return <circle key={k} cx={x} cy={shoreY(x) + 10 + 30 * q} r={2 + 3 * rnd(k)} fill="#FFFFFF" opacity={1 - q} />; })}
          </g>
        );
      })}
    </g>
  );
};

const World: React.FC<{ f: number }> = ({ f }) => {
  const c = calmAt(f), t = f / 30;
  const sunY = lerp(1050, 905, sm(seg(f, T.calm0 - 20, T.calm1 + 40)));
  const windS = lerp(1.0, 0.25, c);
  return (
    <g>
      <defs>
        <linearGradient id="sky27" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix("#3F5D8C", "#F79AB8", c)} /><stop offset="0.45" stopColor={mix("#6E86B8", "#FFB79E", c)} />
          <stop offset="0.8" stopColor={mix("#9BB0D2", "#FFD7A2", c)} /><stop offset="1" stopColor={mix("#B9C6DE", "#FFE7B9", c)} />
        </linearGradient>
        <linearGradient id="sea27" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix("#2F6F8F", "#F2A7B6", c)} /><stop offset="0.3" stopColor={mix("#2E8C9A", "#9FD9D6", c)} /><stop offset="1" stopColor={mix("#43B4B4", "#7FD6CF", c)} />
        </linearGradient>
        <linearGradient id="sand27" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#E8CDB8", "#FFD9BC", c)} /><stop offset="1" stopColor={mix("#D6B49C", "#F7C3A4", c)} /></linearGradient>
        <radialGradient id="sun27"><stop offset="0" stopColor="#FFFBEA" /><stop offset="0.3" stopColor="#FFE6A8" /><stop offset="1" stopColor="#FFB98A" stopOpacity={0} /></radialGradient>
        <clipPath id="above27"><rect x={-100} y={-100} width={1300} height={HZ + 100} /></clipPath>
      </defs>
      <rect x={-100} y={-100} width={1300} height={2200} fill="url(#sky27)" />
      {/* storm clouds that thin out to soft sunset cloud */}
      {Array.from({ length: 7 }, (_, i) => { const x = ((i * 230 + t * lerp(70, 12, c) * (0.6 + 0.4 * rnd(i))) % 1500) - 250, y = 260 + 90 * i + 30 * rnd(i);
        return <g key={i} filter="url(#qb16)" opacity={lerp(0.85, 0.5, c)}>
          <ellipse cx={x} cy={y} rx={260 + 60 * rnd(i + 2)} ry={lerp(60, 26, c)} fill={mix("#55688F", "#FFE0D2", c)} />
          <ellipse cx={x + 120} cy={y - 30} rx={160} ry={lerp(50, 22, c)} fill={mix("#6C7FA6", "#FFEDE2", c)} />
        </g>; })}
      <g clipPath="url(#above27)"><circle cx={700} cy={sunY} r={340} fill="url(#sun27)" opacity={c} /><circle cx={700} cy={sunY} r={78} fill="#FFF4D6" opacity={c} /></g>
      {/* gulls */}
      {[0, 1, 2].map((i) => { const x = ((t * lerp(120, 50, c) + i * 260) % 1400) - 150, y = 520 + 70 * i + 20 * Math.sin(t * 1.5 + i), w = 12 * Math.sin(t * lerp(10, 4, c) + i);
        return <path key={i} d={`M${x - 22},${y - w} Q${x - 10},${y - 8} ${x},${y} Q${x + 10},${y - 8} ${x + 22},${y - w}`} stroke={mix("#2D3550", "#7A4A62", c)} strokeWidth={3.5} fill="none" opacity={0.75} />; })}
      {/* sea */}
      <rect x={-100} y={HZ} width={1300} height={700} fill="url(#sea27)" />
      {/* sun path on calm water */}
      {Array.from({ length: 26 }, (_, i) => { const y = HZ + 8 + i * 18 + i * i * 0.6, w = 30 + i * 12, x = 700 + 20 * Math.sin(f / 9 + i);
        return <rect key={i} x={x - w / 2 + 30 * Math.sin(f / 7 + i * 2)} y={y} width={w * (0.4 + 0.6 * rnd(i))} height={3 + i * 0.25} rx={2} fill="#FFF1C8" opacity={c * (0.75 - i * 0.02)} />; })}
      <Sea f={f} />
      {/* cliffs on the right, layered */}
      <path d={`M1080,620 C1010,640 960,720 930,800 C905,860 880,930 850,975 L1200,990 L1200,600 Z`} fill={mix("#4C4A72", "#C57FA8", c)} />
      <path d={`M1100,780 C1040,800 1000,880 980,960 C970,1010 960,1080 990,1140 L1200,1160 L1200,760 Z`} fill={mix("#3B3A5E", "#A86A92", c)} />
      <path d="M930,800 C960,790 990,760 1030,700" stroke="#FFFFFF" strokeWidth={3} opacity={0.15 * c} fill="none" />
      {/* sand */}
      <path d={`M-100,${shoreY(-100)} ${Array.from({ length: 45 }, (_, i) => { const x = -100 + i * 30; return `L${x},${shoreY(x)}`; }).join(" ")} L1300,2000 L-100,2000 Z`} fill="url(#sand27)" />
      <path d={`M-100,${shoreY(-100) + 8} ${Array.from({ length: 45 }, (_, i) => { const x = -100 + i * 30; return `L${x},${shoreY(x) + 8}`; }).join(" ")}`} stroke="#9C7A6A" strokeWidth={6} opacity={0.12} fill="none" />
      {/* shells + smooth stones on the sand */}
      {[[260, 1640, 1.0], [720, 1720, 1.3], [880, 1560, 0.8]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}><ellipse rx={34} ry={20} fill={i === 1 ? "#F4B6C2" : "#E8D9F2"} /><ellipse rx={34} ry={20} fill="#FFFFFF" opacity={0.25} transform="translate(-6 -6) scale(0.6)" /></g>
      ))}
      {/* sea grass in the foreground, bending in the wind */}
      {Array.from({ length: 34 }, (_, i) => { const x = -40 + i * 13 + 10 * rnd(i), y = 1960, h = 260 + 220 * rnd(i + 2);
        const bend = (60 + 40 * rnd(i)) * windS * (0.6 + 0.4 * Math.sin(t * lerp(3.2, 1.2, c) + i * 0.4)) + 20;
        return <path key={i} d={`M${x},${y} Q${x + bend * 0.3},${y - h * 0.6} ${x + bend},${y - h}`} stroke={i % 3 ? "#7FB88A" : "#A6D49A"} strokeWidth={7 - 3 * rnd(i)} fill="none" strokeLinecap="round" filter="url(#qb2)" />; })}
      {Array.from({ length: 22 }, (_, i) => { const x = 860 + i * 12 + 10 * rnd(i + 9), y = 1980, h = 200 + 180 * rnd(i + 5);
        const bend = (50 + 40 * rnd(i)) * windS * (0.6 + 0.4 * Math.sin(t * lerp(3.2, 1.2, c) + i * 0.5)) + 16;
        return <path key={i} d={`M${x},${y} Q${x + bend * 0.3},${y - h * 0.6} ${x + bend},${y - h}`} stroke={i % 2 ? "#8CC79A" : "#B3DCA4"} strokeWidth={6} fill="none" strokeLinecap="round" filter="url(#qb4)" />; })}
      <Motes f={f} n={30} color="#FFF4DA" y0={1000} y1={1800} speed={lerp(2, 0.6, c)} />
    </g>
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => {
  const c = calmAt(f);
  const ink = mix("#FFFFFF", "#3B2340", c);
  const glow = c > 0.5 ? "rgba(255,240,230,0.9)" : "rgba(30,40,70,0.55)";
  return (
    <AbsoluteFill>
      <LightLeak f={f} amt={0.5 * c} side="right" tint="rose" />
      <Words f={f} from={0} to={T.calm0 + 40} top={230} color="#FFFFFF" glow="rgba(30,40,70,0.55)">
        <div><W f={f} at={2}>In</W><W f={f} at={6}>a</W><W f={f} at={9}>world</W><W f={f} at={14}>full</W><W f={f} at={18} last>of</W></div>
        <div><W f={f} at={30}><i>restless</i></W><W f={f} at={38} last>waves,</W></div>
      </Words>
      <Words f={f} from={T.line2 - 4} to={WIPE - 4} top={220} color={ink} glow={glow}>
        <div><W f={f} at={T.line2}>be</W><W f={f} at={T.line2 + 6} last>the</W></div>
        <div style={{ marginTop: -6 }}><KeyW f={f} at={T.key} color={ACCENT} size={150}>seashore.</KeyW></div>
        <div style={{ fontSize: 64, marginTop: 4 }}><W f={f} at={T.steady}>Calm</W><W f={f} at={T.steady + 6}>and</W><W f={f} at={T.steady + 12} last>steady.</W></div>
      </Words>
      <EndCard f={f} wipe={WIPE} card={CARD} />
    </AbsoluteFill>
  );
};

export const Q1027: React.FC = () => { const f = useCurrentFrame(); return <QFrame world={<World f={f} />} overlay={<Overlay f={f} />} audio="q1027.wav" />; };
export const BEATS = { ...T, END, WIPE, CARD };
