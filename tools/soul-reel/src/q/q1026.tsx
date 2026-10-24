// 26 Oct · Savage · "Don't shrink yourself because someone can't see your worth."
// A jewellery-shop window on a pastel street at dusk; the awning flaps, leaves blow past. A diamond sits on a velvet
// stand with its price tag. Outside, a pair of fogged-up glasses (someone who can't see clearly) squints at it, and
// each squint marks the price down: ₹1,00,000 → ₹1,000 → ₹10. With every markdown the diamond shrinks and dims.
// Then it stops ("nope."), blazes back to full size and floods the street with rainbow light, the tag flips to
// PRICELESS, and the foggy glasses slide off and drop out of frame.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { QFrame, Words, W, KeyW, Aside, Motes, seg, sm, lerp, rnd, back, spring, mix } from "./kit";
import { EndCard } from "../kit/Words";
import { LightLeak } from "../kit/fx";

export const END = 420; const WIPE = 330, CARD = 348;
const T = { in: 14, sq: [44, 84, 120], stop: 148, blaze: 166, flip: 180, drop: 196, line2: 214, key: 250 };
const ACCENT = "#E2376F";
const D = { x: 430, y: 1090 }; // diamond centre
const PRICES = ["₹ 1,00,000", "₹ 1,000", "₹ 10"];

const scaleAt = (f: number) => {
  let s = 1; T.sq.forEach((a) => { s -= 0.17 * sm(seg(f, a + 10, a + 22)); });
  return lerp(s, 1.22, spring(seg(f, T.blaze, T.blaze + 50), 2.2, 4.4));
};
const dimAt = (f: number) => { let d = 0; T.sq.forEach((a) => { d += 0.25 * sm(seg(f, a + 10, a + 22)); }); return d * (1 - sm(seg(f, T.blaze, T.blaze + 14))); };

const Diamond: React.FC<{ f: number; s: number; dim: number }> = ({ f, s, dim }) => {
  const g = (k: number) => ["#BFF3EA", "#D9C8FF", "#FFC6DA", "#A8E4FF", "#FFF1B8", "#C8F7DA"][k % 6];
  const grey = (c: string) => mix(c, "#B8B4C0", dim);
  const crownY = -78, Wd = 128, T2 = 66, tip = 176;
  const xs = [-Wd, -Wd * 0.5, 0, Wd * 0.5, Wd];
  return (
    <g transform={`translate(${D.x} ${D.y + 184 - 176 * s}) scale(${s})`}>
      <ellipse cx={0} cy={tip + 24} rx={110} ry={16} fill="#7A3D5A" opacity={0.25} filter="url(#qb6)" />
      <circle r={260} fill="#FFFFFF" opacity={0.25 * (1 - dim)} filter="url(#qb40)" />
      {xs.slice(0, 4).map((x, i) => <path key={i} d={`M${x},0 L${xs[i + 1]},0 L0,${tip} Z`} fill={grey(g(i + 1))} stroke="#FFFFFF" strokeWidth={2} strokeOpacity={0.7} />)}
      <path d={`M${-T2},${crownY} L${T2},${crownY} L${Wd * 0.5},0 L${-Wd * 0.5},0 Z`} fill={grey(g(4))} stroke="#FFFFFF" strokeWidth={2} strokeOpacity={0.8} />
      <path d={`M${-T2},${crownY} L${-Wd * 0.5},0 L${-Wd},0 Z`} fill={grey(g(0))} stroke="#FFFFFF" strokeWidth={2} strokeOpacity={0.8} />
      <path d={`M${T2},${crownY} L${Wd * 0.5},0 L${Wd},0 Z`} fill={grey(g(2))} stroke="#FFFFFF" strokeWidth={2} strokeOpacity={0.8} />
      <path d={`M${-T2},${crownY} L0,${crownY} L${-Wd * 0.5},0 Z`} fill="#FFFFFF" opacity={0.35 * (1 - dim)} />
      <path d={`M${-Wd * 0.5},0 L0,${tip} L${-Wd * 0.2},0 Z`} fill="#FFFFFF" opacity={0.3 * (1 - dim)} />
      {[[-T2, crownY], [Wd, 0], [0, tip * 0.5], [T2 * 0.5, crownY]].map(([x, y], i) => { const tw = Math.max(0, Math.sin(f / 6 + i * 1.7)) * (1 - dim);
        return <path key={i} d="M0,-22 L4,-4 L22,0 L4,4 L0,22 L-4,4 L-22,0 L-4,-4 Z" transform={`translate(${x} ${y}) scale(${tw})`} fill="#FFFFFF" />; })}
    </g>
  );
};

const Tag: React.FC<{ f: number }> = ({ f }) => {
  const sw = 6 * Math.sin(f / 18) + 10 * Math.sin(Math.PI * seg(f, T.blaze, T.blaze + 20));
  const flip = sm(seg(f, T.flip, T.flip + 14));
  const sx = Math.cos(flip * Math.PI);
  return (
    <g transform={`translate(800 860) rotate(${sw})`}>
      <path d="M0,0 L0,100" stroke="#C9A45C" strokeWidth={3} />
      <g transform={`translate(0 220) scale(${Math.abs(sx) + 0.001} 1)`}>
        <path d="M-120,-120 L120,-120 L120,120 L-120,120 L-150,0 Z" fill={sx > 0 ? "#FFF6EC" : "#FFE7A8"} stroke="#E8CFA0" strokeWidth={3} />
        <circle cx={-118} cy={0} r={10} fill="#E9D9C6" />
        {sx > 0 ? (
          <g>
            {PRICES.map((p, i) => {
              if (i > 0 && f < T.sq[i - 1] + 14) return null;
              const y = -60 + i * 56;
              const strike = i < 2 ? seg(f, T.sq[i] + 4, T.sq[i] + 12) : seg(f, T.sq[2] + 4, T.sq[2] + 12) * 0; // ₹10 stays until the flip
              return <g key={i} opacity={i === 0 ? 1 : seg(f, T.sq[i - 1] + 14, T.sq[i - 1] + 22)}>
                <text x={10} y={y + 14} textAnchor="middle" fontFamily={i ? "Caveat" : "Jost"} fontWeight={i ? 700 : 500} fontSize={i ? 52 : 36} fill={i ? "#C22E5C" : "#3B2340"}>{p}</text>
                <line x1={-80} x2={-80 + 180 * strike} y1={y + 2} y2={y + 2} stroke="#C22E5C" strokeWidth={5} strokeLinecap="round" />
              </g>;
            })}
          </g>
        ) : (
          <text y={14} textAnchor="middle" fontFamily="Jost" fontWeight={700} fontSize={40} letterSpacing={3} fill="#9A6A1A">PRICELESS</text>
        )}
      </g>
    </g>
  );
};

const Glasses: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.in) return null;
  const enter = back(seg(f, T.in, T.in + 24), 1.4);
  const sq = T.sq.reduce((m, a) => Math.max(m, Math.sin(Math.PI * seg(f, a, a + 22))), 0);
  const lean = T.sq.reduce((m, a) => m + sm(seg(f, a, a + 12)), 0) / 3;
  const drop = seg(f, T.drop, T.drop + 30), fall = drop * drop;
  const shove = sm(seg(f, T.blaze, T.blaze + 14));
  const x = lerp(1300, 800 - 40 * lean, enter) + 80 * shove + 30 * fall, y = 1460 - 30 * lean + 1100 * fall + 6 * Math.sin(f / 13);
  const r = -12 - 6 * sq + 20 * shove + 90 * fall;
  const lens = (cx: number) => (
    <g>
      <ellipse cx={cx} cy={0} rx={96} ry={lerp(72, 40, sq)} fill="#F4F7FB" opacity={0.9} />
      <ellipse cx={cx} cy={0} rx={96} ry={lerp(72, 40, sq)} fill="url(#fog26)" />
      {Array.from({ length: 7 }, (_, k) => <circle key={k} cx={cx - 60 + 120 * rnd(k + cx)} cy={-26 + 52 * rnd(k + 9 + cx)} r={4 + 3 * rnd(k)} fill="#FFFFFF" opacity={0.9} />)}
      <ellipse cx={cx} cy={0} rx={96} ry={lerp(72, 40, sq)} fill="none" stroke="url(#frame26)" strokeWidth={18} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(1.05)`} opacity={1 - seg(f, T.drop + 22, T.drop + 30)}>
      {lens(-112)}{lens(112)}
      <path d="M-22,-10 Q0,-34 22,-10" stroke="url(#frame26)" strokeWidth={15} fill="none" strokeLinecap="round" />
      <path d="M-206,-16 L-240,-30 M206,-16 L240,-30" stroke="#6F55C9" strokeWidth={13} strokeLinecap="round" />
    </g>
  );
};

const World: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30, s = scaleAt(f), dim = dimAt(f);
  const blaze = sm(seg(f, T.blaze, T.blaze + 24));
  const shake = 5 * Math.sin(f * 2.3) * Math.sin(Math.PI * seg(f, T.blaze, T.blaze + 14));
  const wind = 1 + 0.6 * Math.sin(t * 0.8);
  return (
    <g transform={`translate(${shake} 0)`}>
      <defs>
        <linearGradient id="sky26" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF9EC0" /><stop offset="0.6" stopColor="#FFC3A6" /><stop offset="1" stopColor="#FFE0B0" /></linearGradient>
        <linearGradient id="facade26" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C9B2F2" /><stop offset="1" stopColor="#B49BE6" /></linearGradient>
        <linearGradient id="inside26" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#4A2C5C", "#6A3E78", blaze)} /><stop offset="1" stopColor={mix("#6E3E66", "#9A5A86", blaze)} /></linearGradient>
        <radialGradient id="spot26" cx="0.5" cy="0"><stop offset="0" stopColor="#FFF4D8" stopOpacity={0.85} /><stop offset="1" stopColor="#FFF4D8" stopOpacity={0} /></radialGradient>
        <linearGradient id="velvet26" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2789E" /><stop offset="1" stopColor="#C94C78" /></linearGradient>
        <linearGradient id="frame26" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#B08CFF" /><stop offset="0.5" stopColor="#7C5CE0" /><stop offset="1" stopColor="#C6A9FF" /></linearGradient>
        <radialGradient id="fog26"><stop offset="0" stopColor="#DDE6F2" stopOpacity={0.4} /><stop offset="1" stopColor="#FFFFFF" stopOpacity={0.9} /></radialGradient>
        <clipPath id="glass26"><rect x={110} y={640} width={860} height={720} rx={18} /></clipPath>
      </defs>
      <rect width={1080} height={1920} fill="url(#sky26)" />
      {[[40, 760], [1040, 700]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${(3 + 2 * i) * Math.sin(t * 1.3 + i) * wind})`}>
          <rect x={-10} y={0} width={20} height={600} fill="#8A6A5A" />
          {Array.from({ length: 6 }, (_, k) => <circle key={k} cx={-80 + 160 * rnd(k + i * 7)} cy={-60 - 120 * rnd(k + 2 + i)} r={70 + 30 * rnd(k + i)} fill={["#9ED9A8", "#86CC98", "#B8E6B0"][k % 3]} />)}
        </g>
      ))}
      <rect x={60} y={360} width={960} height={1200} rx={20} fill="url(#facade26)" />
      <rect x={300} y={390} width={480} height={90} rx={45} fill="#FFF4EA" />
      <text x={540} y={450} textAnchor="middle" fontFamily="Cormorant" fontStyle="italic" fontWeight={600} fontSize={52} fill="#7A4A8A">the little jewel shop</text>
      {Array.from({ length: 8 }, (_, i) => { const x = 80 + i * 115, flap = 10 * Math.sin(t * 4 + i * 0.8) * wind;
        return <path key={i} d={`M${x},500 L${x + 115},500 L${x + 115},${580 + flap} Q${x + 57},${612 + flap} ${x},${580 + flap} Z`} fill={i % 2 ? "#FFFFFF" : "#FF8FB1"} />; })}
      <g clipPath="url(#glass26)">
        <rect x={110} y={640} width={860} height={720} fill="url(#inside26)" />
        <path d="M300,640 L640,640 L800,1360 L140,1360 Z" fill="url(#spot26)" opacity={0.6 + 0.4 * blaze} />
        <rect x={D.x - 140} y={D.y + 190} width={280} height={260} rx={16} fill="url(#velvet26)" />
        <ellipse cx={D.x} cy={D.y + 190} rx={140} ry={26} fill="#FF9DBC" />
        {blaze > 0 && Array.from({ length: 10 }, (_, i) => { const a = (-150 + i * 30 + 6 * Math.sin(t + i)) * Math.PI / 180, L = 1400;
          return <path key={i} d={`M${D.x},${D.y} L${D.x + Math.cos(a - 0.06) * L},${D.y + Math.sin(a - 0.06) * L} L${D.x + Math.cos(a + 0.06) * L},${D.y + Math.sin(a + 0.06) * L} Z`}
            fill={["#FF9DBA", "#FFD27A", "#B8F0A0", "#9AD8FF", "#C9A6FF"][i % 5]} opacity={0.35 * blaze * (0.7 + 0.3 * Math.sin(t * 3 + i))} filter="url(#qb10)" />; })}
        <Diamond f={f} s={s} dim={dim} />
        <Tag f={f} />
        <path d={`M${200 + 30 * Math.sin(t / 2)},640 L${320 + 30 * Math.sin(t / 2)},640 L${180 + 30 * Math.sin(t / 2)},1360 L${60 + 30 * Math.sin(t / 2)},1360 Z`} fill="#FFFFFF" opacity={0.1} />
        <path d="M760,640 L800,640 L700,1360 L660,1360 Z" fill="#FFFFFF" opacity={0.08} />
      </g>
      <rect x={110} y={640} width={860} height={720} rx={18} fill="none" stroke="#FFF4EA" strokeWidth={22} />
      <rect x={90} y={1360} width={900} height={40} rx={10} fill="#FFF4EA" />
      {/* rainbow light spilling onto the street */}
      {blaze > 0 && Array.from({ length: 16 }, (_, i) => <circle key={i} cx={120 + rnd(i) * 860} cy={1420 + rnd(i + 3) * 460} r={10 + 14 * rnd(i + 5)} fill={["#FF9DBA", "#FFD27A", "#B8F0A0", "#9AD8FF", "#C9A6FF"][i % 5]} opacity={0.6 * blaze * (0.5 + 0.5 * Math.sin(t * 4 + i))} filter="url(#qb4)" />)}
      <rect x={0} y={1560} width={1080} height={360} fill="#F5C6B6" />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={i * 200} x2={i * 200 - 80} y1={1560} y2={1920} stroke="#E7A99A" strokeWidth={4} />)}
      {Array.from({ length: 14 }, (_, i) => { const p = ((f / (50 + 30 * rnd(i))) + rnd(i + 3)) % 1, x = -80 + p * 1260, y = 500 + rnd(i + 5) * 1200 + 70 * Math.sin(p * 6 + i);
        return <ellipse key={i} cx={x} cy={y} rx={14} ry={8} transform={`rotate(${p * 540} ${x} ${y})`} fill={["#9ED9A8", "#FFB7C9", "#FFD27A"][i % 3]} opacity={Math.sin(Math.PI * p)} />; })}
      <Glasses f={f} />
      <Motes f={f} n={30} color="#FFF4C8" y0={600} y1={1500} gust={blaze} />
    </g>
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <LightLeak f={f} amt={0.5 * Math.sin(Math.PI * seg(f, T.blaze - 6, WIPE))} side="left" tint="rose" />
    <Words f={f} from={0} to={T.blaze - 4} top={150} size={86}>
      <div><W f={f} at={2}>Don't</W><W f={f} at={8} last>shrink</W></div>
      <div><W f={f} at={14} last>yourself</W></div>
    </Words>
    <Aside f={f} at={T.stop} to={T.blaze + 4} x={300} y={820} color="#FFFFFF" rot={-8} size={110}>nope.</Aside>
    <Words f={f} from={T.line2 - 4} to={WIPE - 4} top={70} size={70}>
      <div><W f={f} at={T.line2}>because</W><W f={f} at={T.line2 + 6} last>someone</W></div>
      <div><W f={f} at={T.line2 + 14}>can't</W><W f={f} at={T.line2 + 20}>see</W><W f={f} at={T.line2 + 26} last>your</W></div>
      <div style={{ marginTop: -12 }}><KeyW f={f} at={T.key} color={ACCENT} size={120}>worth.</KeyW></div>
    </Words>
    <EndCard f={f} wipe={WIPE} card={CARD} />
  </AbsoluteFill>
);

export const Q1026: React.FC = () => { const f = useCurrentFrame(); return <QFrame world={<World f={f} />} overlay={<Overlay f={f} />} audio="q1026.wav" />; };
export const BEATS = { ...T, END, WIPE, CARD };
