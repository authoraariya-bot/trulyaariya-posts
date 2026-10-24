// 31 Oct · Healing · "POV: you finally chose yourself and felt guilty about it. That guilt isn't a sign you did wrong.
// It's a sign you're growing."
// A cosy room on a rainy autumn evening, maples tossing outside. Two invitations slide in; a gold stamp lands on
// "Night in with me" and the other blows away. A grey guilt cloud gathers over the armchair, drifts to a little pot
// and rains into it; a sprout pushes up and blooms while the rain outside clears to golden light.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { QFrame, Words, W, KeyW, Motes, seg, sm, lerp, rnd, back, mix } from "./kit";
import { EndCard } from "../kit/Words";
import { LightLeak } from "../kit/fx";

export const END = 420; const WIPE = 330, CARD = 348;
const T = { cards: 10, stamp: 58, away: 74, cloud: 96, drift: 140, rain: 160, sprout: 186, bloom: 236, line2: 168, line3: 236, key: 262 };
const ACCENT = "#E0567F";
const POT = { x: 330, y: 1590 };

const Card: React.FC<{ x: number; y: number; r: number; s: number; o: number; label: string; c: string; stamp?: number }> = ({ x, y, r, s, o, label, c, stamp = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={o}>
    <rect x={-170} y={-110} width={340} height={220} rx={16} fill="#5A3A3A" opacity={0.18} transform="translate(8 12)" filter="url(#qb6)" />
    <rect x={-170} y={-110} width={340} height={220} rx={16} fill={c} />
    <rect x={-150} y={-90} width={300} height={180} rx={10} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={0.7} />
    <text y={-30} textAnchor="middle" fontFamily="Jost" fontSize={20} letterSpacing={5} fill="#7A5468">YOU'RE INVITED</text>
    <text y={30} textAnchor="middle" fontFamily="Cormorant" fontStyle="italic" fontSize={46} fill="#3B2340">{label}</text>
    {stamp > 0 && (
      <g transform={`translate(110 70) rotate(-14) scale(${lerp(1.8, 1, back(stamp, 2))})`} opacity={Math.min(1, stamp * 3)}>
        <circle r={46} fill="#E2B04A" /><circle r={38} fill="none" stroke="#FFF1C2" strokeWidth={3} />
        <text y={10} textAnchor="middle" fontFamily="Jost" fontWeight={700} fontSize={28} fill="#FFF8E6">YES</text>
      </g>
    )}
  </g>
);

const World: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const clear = sm(seg(f, T.sprout, T.bloom + 30));
  const storm = 1 - clear;
  // the guilt cloud: gathers over the chair, drifts to the pot, rains, then lightens and dissolves into sparkles
  const cg = sm(seg(f, T.cloud, T.cloud + 30)), cd = sm(seg(f, T.drift, T.rain));
  const cx = lerp(760, POT.x + 10, cd), cy = lerp(1080, 1180, cd) + 8 * Math.sin(t * 2);
  const cfade = 1 - sm(seg(f, T.bloom - 10, T.bloom + 24));
  const grow = sm(seg(f, T.sprout, T.sprout + 50)), bloom = back(seg(f, T.bloom, T.bloom + 22), 1.8);
  return (
    <g>
      <defs>
        <linearGradient id="wall31" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#E7A98F", "#F6B49B", clear)} /><stop offset="1" stopColor={mix("#F2C2A6", "#FFD3B6", clear)} /></linearGradient>
        <linearGradient id="sky31" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#7F8FB2", "#FFC98A", clear)} /><stop offset="1" stopColor={mix("#B7B9CC", "#FFE3B0", clear)} /></linearGradient>
        <linearGradient id="chair31" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FC7A6" /><stop offset="1" stopColor="#6EAE8C" /></linearGradient>
        <clipPath id="win31"><rect x={90} y={520} width={520} height={700} rx={260} /></clipPath>
        <radialGradient id="lamp31"><stop offset="0" stopColor="#FFE6B0" stopOpacity={0.8} /><stop offset="1" stopColor="#FFE6B0" stopOpacity={0} /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#wall31)" />
      {/* arched window: autumn maples tossing in wind and rain */}
      <g clipPath="url(#win31)">
        <rect x={90} y={520} width={520} height={700} fill="url(#sky31)" />
        <circle cx={480} cy={720} r={60} fill="#FFF3D0" opacity={clear} />
        <path d="M90,1080 C200,1040 320,1070 420,1050 C500,1035 560,1060 610,1050 L610,1220 L90,1220 Z" fill={mix("#8E8AA8", "#E7A7B6", clear)} />
        {[[180, 1100, 1.1, "#E9744F"], [400, 1120, 1.3, "#F29A4A"], [560, 1090, 0.9, "#E25F5F"]].map(([x, y, s, c], i) => {
          const sw = (5 + 9 * storm) * Math.sin(t * (1.4 + storm * 1.6) + i);
          return <g key={i} transform={`translate(${x} ${y}) rotate(${sw}) scale(${s})`}>
            <path d="M0,0 L0,-120" stroke="#6E4A3A" strokeWidth={14} />
            {Array.from({ length: 7 }, (_, k) => <circle key={k} cx={-70 + 140 * rnd(k + i * 9) + 6 * Math.sin(t * 3 + k) * storm} cy={-150 - 90 * rnd(k + 3 + i)} r={46 + 20 * rnd(k + i)} fill={c as string} opacity={0.92} />)}
            {Array.from({ length: 4 }, (_, k) => <circle key={`h${k}`} cx={-40 + 80 * rnd(k + 20)} cy={-190 - 50 * rnd(k + 22)} r={24} fill="#FFC27A" opacity={0.6} />)}
          </g>; })}
        {storm > 0.02 && Array.from({ length: 60 }, (_, i) => { const x = 90 + rnd(i) * 560, y = 520 + ((rnd(i + 1) * 700 + f * (26 + 10 * rnd(i))) % 760);
          return <line key={i} x1={x} y1={y} x2={x - 12} y2={y + 30} stroke="#E8EEFF" strokeWidth={2.5} opacity={0.6 * storm} />; })}
        {/* leaves torn off by the wind */}
        {Array.from({ length: 12 }, (_, i) => { const p = ((f / (40 + 20 * rnd(i))) + rnd(i + 3)) % 1;
          return <ellipse key={i} cx={90 + p * 600} cy={700 + rnd(i + 5) * 400 + 60 * Math.sin(p * 7 + i)} rx={12} ry={7} transform={`rotate(${p * 500} ${90 + p * 600} ${700 + rnd(i + 5) * 400})`} fill={["#F29A4A", "#E9744F", "#FFC27A"][i % 3]} opacity={(0.4 + 0.6 * storm) * Math.sin(Math.PI * p)} />; })}
      </g>
      <rect x={90} y={520} width={520} height={700} rx={260} fill="none" stroke="#FFF4EA" strokeWidth={22} />
      <line x1={350} x2={350} y1={520} y2={1220} stroke="#FFF4EA" strokeWidth={12} /><line x1={90} x2={610} y1={900} y2={900} stroke="#FFF4EA" strokeWidth={12} />
      <rect x={70} y={1220} width={560} height={30} rx={8} fill="#FFF4EA" />
      {/* floor */}
      <rect x={0} y={1500} width={1080} height={420} fill={mix("#C98E78", "#D9A088", clear)} />
      <ellipse cx={640} cy={1700} rx={460} ry={90} fill="#F7D7C4" opacity={0.6} />
      {/* lamp glow */}
      <circle cx={980} cy={1060} r={340} fill="url(#lamp31)" />
      <rect x={972} y={1120} width={14} height={380} fill="#B98B6E" /><path d="M900,1130 L930,1010 L1030,1010 L1060,1130 Z" fill="#FFE2B0" />
      {/* armchair + blanket + tea */}
      <g transform="translate(740 1500)">
        <ellipse cx={0} cy={10} rx={260} ry={24} fill="#7A4A3A" opacity={0.25} filter="url(#qb10)" />
        <rect x={-220} y={-380} width={440} height={300} rx={90} fill="url(#chair31)" />
        <rect x={-260} y={-210} width={110} height={220} rx={50} fill="#7DBB98" /><rect x={150} y={-210} width={110} height={220} rx={50} fill="#7DBB98" />
        <rect x={-170} y={-150} width={340} height={120} rx={40} fill="#9ED3B2" />
        <path d="M-120,-330 C-60,-340 40,-300 90,-180 C110,-120 100,-60 70,-20 L-150,-20 C-170,-120 -170,-260 -120,-330 Z" fill="#C9B6FF" />
        {Array.from({ length: 6 }, (_, k) => <path key={k} d={`M${-140 + k * 36},-300 C${-130 + k * 36},-200 ${-140 + k * 36},-100 ${-130 + k * 36},-24`} stroke="#B49DF2" strokeWidth={6} fill="none" opacity={0.6} />)}
        <rect x={-210} y={-20} width={20} height={30} fill="#8A5E48" /><rect x={190} y={-20} width={20} height={30} fill="#8A5E48" />
      </g>
      <g transform="translate(1000 1500)"><rect x={-60} y={-150} width={120} height={150} rx={10} fill="#E7B58F" />
        <g transform="translate(0 -150)"><path d="M-34,-70 L34,-70 L28,0 L-28,0 Z" fill="#FFF6EE" /><path d="M34,-56 C60,-56 60,-20 30,-20" stroke="#FFF6EE" strokeWidth={9} fill="none" />
          {[0, 1].map((k) => <path key={k} d={`M${-8 + 18 * k},-80 C${-18 + 18 * k},-110 ${2 + 18 * k},-130 ${-8 + 18 * k},-160`} stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.5 * (0.5 + 0.5 * Math.sin(t * 2 + k))} strokeLinecap="round" />)}</g></g>
      {/* the pot + sprout */}
      <g transform={`translate(${POT.x} ${POT.y})`}>
        <ellipse cx={0} cy={6} rx={130} ry={16} fill="#7A4A3A" opacity={0.3} filter="url(#qb6)" />
        <path d="M-100,-150 L100,-150 L80,0 L-80,0 Z" fill="#F08A6C" /><rect x={-112} y={-170} width={224} height={34} rx={10} fill="#F79C80" /><ellipse cx={0} cy={-166} rx={98} ry={9} fill="#6E4A3A" />
        <path d="M-60,-130 L-50,-20" stroke="#FFFFFF" strokeWidth={8} opacity={0.25} strokeLinecap="round" />
        {grow > 0 && (
          <g transform="translate(0 -166)">
            <path d={`M0,0 C8,${-90 * grow} -10,${-180 * grow} 0,${-260 * grow}`} stroke="#5FAE6E" strokeWidth={10} fill="none" strokeLinecap="round" />
            {[0.4, 0.62].map((k, i) => { const d = i ? -1 : 1, L = 90 * sm(seg(grow, k, 1)) ;
              return <path key={i} d={`M0,${-260 * grow * k} C${d * L * 0.4},${-260 * grow * k - L * 0.5} ${d * L},${-260 * grow * k - L * 0.3} ${d * L},${-260 * grow * k + 4} C${d * L * 0.6},${-260 * grow * k + 8} ${d * L * 0.2},${-260 * grow * k + 4} 0,${-260 * grow * k} Z`} fill={i ? "#7CC48A" : "#6CB97C"} transform={`rotate(${3 * Math.sin(t * 1.5 + i)} 0 ${-260 * grow * k})`} />; })}
            {f >= T.bloom && (
              <g transform={`translate(0 ${-260 * grow}) scale(${bloom})`}>
                {Array.from({ length: 6 }, (_, k) => <ellipse key={k} cx={0} cy={-34} rx={22} ry={36} fill={k % 2 ? "#FF9DBA" : "#FFB8CC"} transform={`rotate(${k * 60 + 3 * Math.sin(t + k)})`} />)}
                <circle r={18} fill="#FFD46A" />
              </g>
            )}
          </g>
        )}
      </g>
      {/* the guilt cloud */}
      {cg > 0 && cfade > 0.01 && (
        <g transform={`translate(${cx} ${cy}) scale(${0.6 + 0.4 * cg})`} opacity={cg * cfade}>
          {[[-80, 10, 70], [0, -20, 90], [80, 8, 70], [-30, 30, 60], [40, 32, 62]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={mix("#8F8AA0", "#E9E2F2", sm(seg(f, T.rain + 30, T.bloom)))} />)}
          <text y={20} textAnchor="middle" fontFamily="Caveat" fontWeight={700} fontSize={50} fill="#FFFFFF" opacity={1 - seg(f, T.rain + 30, T.rain + 50)}>guilt</text>
        </g>
      )}
      {f > T.rain && f < T.bloom + 10 && Array.from({ length: 14 }, (_, i) => { const p = ((f - T.rain) / 14 + rnd(i)) % 1, x = POT.x - 70 + 140 * rnd(i + 2);
        return <path key={i} d="M0,-10 C5,-2 6,4 0,9 C-6,4 -5,-2 0,-10 Z" transform={`translate(${x} ${lerp(cy + 60, POT.y - 170, p)}) scale(1.4)`} fill="#9ED0F0" opacity={0.9 * (1 - seg(f, T.bloom - 10, T.bloom + 10))} />; })}
      {/* sparkles as the cloud dissolves */}
      {f > T.bloom - 10 && Array.from({ length: 22 }, (_, i) => { const p = seg(f, T.bloom - 10 + rnd(i) * 10, T.bloom + 40); if (p <= 0 || p >= 1) return null;
        return <circle key={i} cx={cx + (rnd(i) - 0.5) * 300 * p} cy={cy - 120 * p + (rnd(i + 1) - 0.5) * 100} r={4 + 3 * rnd(i + 2)} fill="#FFF0B0" opacity={Math.sin(Math.PI * p)} />; })}
      {/* invitations */}
      {(() => { const a = back(seg(f, T.cards, T.cards + 22), 1.3), away = sm(seg(f, T.away, T.away + 30)), stamp = seg(f, T.stamp, T.stamp + 10), fly = sm(seg(f, T.cloud - 10, T.cloud + 20));
        return <g>
          {away < 1 && <Card x={lerp(-260, 330, a) - 700 * away} y={1000 - 140 * away} r={lerp(-30, -6, a) - 40 * away} s={0.92} o={1 - away} label="Plans with them" c="#E3D6FF" />}
          {fly < 1 && <Card x={lerp(1340, 750, a) + lerp(0, -10, away)} y={1020 + 400 * fly} r={lerp(30, 5, a) * (1 - fly)} s={0.92 * (1 - 0.7 * fly)} o={1 - fly} label="Night in with me" c="#FFD6C2" stamp={stamp} />}
        </g>; })()}
      <Motes f={f} n={26} color="#FFE9C2" y0={700} y1={1600} speed={0.5} />
    </g>
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <LightLeak f={f} amt={0.45 * sm(seg(f, T.sprout, T.bloom + 30))} side="left" tint="gold" />
    <Words f={f} from={0} to={T.line2 - 8} top={190} size={72}>
      <div><W f={f} at={2}>POV:</W><W f={f} at={7}>you</W><W f={f} at={11}>finally</W><W f={f} at={16} last>chose</W></div>
      <div><W f={f} at={21} last><i>yourself</i></W></div>
      <div style={{ fontSize: 60, marginTop: 8 }}><W f={f} at={T.cloud + 10}>and</W><W f={f} at={T.cloud + 14}>felt</W><W f={f} at={T.cloud + 18}>guilty</W><W f={f} at={T.cloud + 24}>about</W><W f={f} at={T.cloud + 28} last>it.</W></div>
    </Words>
    <Words f={f} from={T.line2 - 4} to={T.line3 - 8} top={220} size={70}>
      <div><W f={f} at={T.line2}>That</W><W f={f} at={T.line2 + 5}>guilt</W><W f={f} at={T.line2 + 10} last>isn't</W></div>
      <div><W f={f} at={T.line2 + 16}>a</W><W f={f} at={T.line2 + 19}>sign</W><W f={f} at={T.line2 + 24}>you</W><W f={f} at={T.line2 + 28}>did</W><W f={f} at={T.line2 + 32} last>wrong.</W></div>
    </Words>
    <Words f={f} from={T.line3 - 4} to={WIPE - 4} top={210} size={76}>
      <div><W f={f} at={T.line3}>It's</W><W f={f} at={T.line3 + 5}>a</W><W f={f} at={T.line3 + 8}>sign</W><W f={f} at={T.line3 + 13} last>you're</W></div>
      <div style={{ marginTop: -8 }}><KeyW f={f} at={T.key} color={ACCENT} size={150}>growing.</KeyW></div>
    </Words>
    <EndCard f={f} wipe={WIPE} card={CARD} />
  </AbsoluteFill>
);

export const Q1031: React.FC = () => { const f = useCurrentFrame(); return <QFrame world={<World f={f} />} overlay={<Overlay f={f} />} audio="q1031.wav" />; };
export const BEATS = { ...T, END, WIPE, CARD };
