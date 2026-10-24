// 6 Nov · Healing · "Don't teach your soul to settle for what suffocates it. Let it breathe."
// A sunlit glass greenhouse, ferns swaying. On the potting bench, a little plant is sealed inside a mason jar
// tagged "good enough": the glass fogs, drips run down, the leaves droop. The lid twists, pops off, fresh air
// swirls in with leaves and petals, the fog clears and the plant unfurls, grows past the rim and blooms.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { QFrame, Words, W, KeyW, Motes, seg, sm, lerp, rnd, back, mix } from "./kit";
import { EndCard } from "../kit/Words";
import { LightLeak } from "../kit/fx";

export const END = 420; const WIPE = 330, CARD = 348;
const T = { twist: [150, 162, 174], pop: 184, air: 190, grow0: 200, grow1: 262, bloom: 252, l2: 210, key: 236 };
const J = { x: 540, y: 1580, w: 420, h: 600 }; // jar: bottom centre, size

const World: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const fog = Math.min(0.6, sm(seg(f, 0, 140)) * 0.6) * (1 - sm(seg(f, T.air, T.air + 40)));
  const droop = 0.7 * sm(seg(f, 10, 140)) * (1 - sm(seg(f, T.grow0, T.grow0 + 40)));
  const grow = sm(seg(f, T.grow0, T.grow1));
  const twist = T.twist.reduce((a, s, i) => a + 18 * sm(seg(f, s, s + 6)), 0);
  const pop = seg(f, T.pop, T.pop + 30), lidY = -J.h + 22 - 900 * pop * pop + 500 * pop, lidR = twist + 260 * pop;
  const air = sm(seg(f, T.air, T.air + 20)) * (1 - sm(seg(f, T.air + 70, T.air + 100)));
  const bloom = back(seg(f, T.bloom, T.bloom + 20), 1.6);
  const stemH = lerp(340, 700, grow);
  const breeze = 0.4 + 0.6 * air + 0.3 * grow;
  const leaves = [0.3, 0.45, 0.6, 0.72, 0.84];
  return (
    <g>
      <defs>
        <linearGradient id="gh1106" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#BFE9F5" /><stop offset="0.6" stopColor="#E3F6E4" /><stop offset="1" stopColor="#FFF0D8" /></linearGradient>
        <linearGradient id="glass1106" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" stopOpacity={0.35} /><stop offset="0.3" stopColor="#E9F7FF" stopOpacity={0.08} /><stop offset="0.85" stopColor="#FFFFFF" stopOpacity={0.12} /><stop offset="1" stopColor="#FFFFFF" stopOpacity={0.4} /></linearGradient>
        <linearGradient id="bench1106" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E2B48C" /><stop offset="1" stopColor="#C9946C" /></linearGradient>
        <clipPath id="jar1106"><path d={`M${J.x - J.w / 2},${J.y - J.h + 60} Q${J.x - J.w / 2},${J.y - J.h + 30} ${J.x - J.w / 2 + 30},${J.y - J.h + 30} L${J.x + J.w / 2 - 30},${J.y - J.h + 30} Q${J.x + J.w / 2},${J.y - J.h + 30} ${J.x + J.w / 2},${J.y - J.h + 60} L${J.x + J.w / 2},${J.y - 30} Q${J.x + J.w / 2},${J.y} ${J.x + J.w / 2 - 30},${J.y} L${J.x - J.w / 2 + 30},${J.y} Q${J.x - J.w / 2},${J.y} ${J.x - J.w / 2},${J.y - 30} Z`} /></clipPath>
      </defs>
      <rect width={1080} height={1920} fill="url(#gh1106)" />
      {/* greenhouse frame: panes + an open window pane swinging */}
      {Array.from({ length: 6 }, (_, i) => <line key={`v${i}`} x1={i * 216} x2={i * 216} y1={0} y2={1500} stroke="#FFFFFF" strokeWidth={12} opacity={0.85} />)}
      {[380, 760, 1140].map((y, i) => <line key={`h${i}`} x1={0} x2={1080} y1={y} y2={y} stroke="#FFFFFF" strokeWidth={10} opacity={0.85} />)}
      <g transform={`translate(864 380) rotate(${-14 - 8 * Math.sin(t * 1.2) * breeze})`}><rect x={0} y={0} width={216} height={380} fill="#FFFFFF" opacity={0.25} stroke="#FFFFFF" strokeWidth={10} /></g>
      {/* outside: blurred trees through the glass */}
      {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={80 + i * 160} cy={1000 + 60 * rnd(i)} r={130 + 40 * rnd(i + 1)} fill={["#A8DDB0", "#BFE6C0", "#9AD4A6"][i % 3]} opacity={0.6} filter="url(#qb16)" />)}
      {/* sun shafts */}
      <path d="M760,0 L260,1500 L560,1500 L1080,0 Z" fill="#FFF6D8" opacity={0.45} filter="url(#qb24)" />
      {/* hanging ferns */}
      {[[90, 0], [990, 0]].map(([x, y], k) => (
        <g key={k} transform={`translate(${x} ${y})`}>
          <line x1={0} y1={0} x2={0} y2={560} stroke="#B39A86" strokeWidth={3} />
          <g transform={`translate(0 560) rotate(${4 * Math.sin(t * 1.3 + k) * breeze})`}>
            <path d="M-60,0 L60,0 L48,70 L-48,70 Z" fill="#F4A98C" />
            {Array.from({ length: 9 }, (_, i) => { const a = -80 + i * 20 + 6 * Math.sin(t * 1.6 + i) * breeze, L = 160 + 80 * rnd(i + k * 9);
              return <g key={i} transform={`rotate(${a})`}><path d={`M0,10 Q${L * 0.3},${L * 0.5} 0,${L}`} stroke="#5FAE6E" strokeWidth={4} fill="none" />
                {Array.from({ length: 6 }, (_, j) => <ellipse key={j} cx={4 + j * 2} cy={30 + j * L / 7} rx={14} ry={6} fill="#6CC07C" transform={`rotate(${30} ${4 + j * 2} ${30 + j * L / 7})`} />)}</g>; })}
          </g>
        </g>
      ))}
      {/* shelf of blurred pots in the back */}
      <rect x={0} y={1240} width={1080} height={20} fill="#D9B08C" opacity={0.7} />
      {Array.from({ length: 6 }, (_, i) => <g key={i} filter="url(#qb4)" opacity={0.85}><path d={`M${80 + i * 180},1240 L${120 + i * 180},1160 L${180 + i * 180},1160 L${220 + i * 180},1240 Z`} fill={["#F4A98C", "#FFC9A8", "#E8B4D8"][i % 3]} /><circle cx={150 + i * 180} cy={1120} r={50} fill="#86CC98" /></g>)}
      {/* potting bench */}
      <rect x={-20} y={J.y} width={1120} height={60} rx={12} fill="url(#bench1106)" /><rect x={-20} y={J.y + 58} width={1120} height={420} fill="#B9845E" />
      <g transform={`translate(150 ${J.y})`}><path d="M-60,0 L-50,-90 L50,-90 L60,0 Z" fill="#F4A98C" /><rect x={-66} y={-104} width={132} height={22} rx={6} fill="#F7B89F" /></g>
      <g transform={`translate(930 ${J.y})`}><path d="M-30,0 L-80,-130 M-10,0 L-20,-150 M10,0 L40,-140" stroke="#8A6A5A" strokeWidth={6} /><rect x={-70} y={-40} width={110} height={40} rx={8} fill="#E8D9C4" /><text x={-15} y={-12} textAnchor="middle" fontFamily="Caveat" fontWeight={700} fontSize={26} fill="#6A4A3A">seeds</text></g>
      {/* the plant (inside the jar) */}
      <g>
        <g transform={`translate(${J.x} ${J.y - 70})`}>
          <ellipse cx={0} cy={30} rx={J.w / 2 - 10} ry={30} fill="#7A5240" />
          <path d={`M0,20 C${-10 + 30 * droop},${-stemH * 0.35} ${10 + 60 * droop},${-stemH * 0.7} ${120 * droop},${-stemH + 140 * droop}`} stroke={mix("#5FAE6E", "#A8A070", droop)} strokeWidth={12} fill="none" strokeLinecap="round" transform={`rotate(${2 * Math.sin(t * 1.5) * breeze})`} />
          {leaves.map((k, i) => { const vis = i < 3 || grow > (i - 2) * 0.3; if (!vis) return null; const d = i % 2 ? -1 : 1, L = 110 * (i < 3 ? 1 : sm(seg(grow, (i - 2) * 0.3, (i - 2) * 0.3 + 0.3)));
            const y = -stemH * k + 140 * droop * k, x = 120 * droop * k * k;
            const ang = d * (30 + 60 * droop) + 6 * Math.sin(t * 2 + i) * breeze;
            return <path key={i} d={`M0,0 C${d * L * 0.4},${-L * 0.5} ${d * L},${-L * 0.3} ${d * L * 1.1},0 C${d * L * 0.7},${L * 0.08} ${d * L * 0.3},${L * 0.06} 0,0 Z`} fill={mix(i % 2 ? "#7CC48A" : "#62B672", "#C9BF7A", droop)} transform={`translate(${x} ${y}) rotate(${ang})`} />; })}
          {bloom > 0 && (
            <g transform={`translate(0 ${-stemH}) scale(${bloom})`}>
              {Array.from({ length: 8 }, (_, k) => <ellipse key={k} cx={0} cy={-40} rx={24} ry={42} fill={k % 2 ? "#FF9DBA" : "#FFB8CC"} transform={`rotate(${k * 45 + 3 * Math.sin(t + k)})`} />)}
              <circle r={22} fill="#FFD46A" />
            </g>
          )}
        </g>
        {/* the jar glass + fog + drips */}
        <g clipPath="url(#jar1106)">
          <rect x={J.x - J.w / 2} y={J.y - J.h} width={J.w} height={J.h} fill="#FFFFFF" opacity={0.75 * fog} filter="url(#qb6)" />
          {fog > 0.2 && Array.from({ length: 10 }, (_, i) => { const x = J.x - J.w / 2 + 30 + rnd(i) * (J.w - 60), p = (f / (40 + 20 * rnd(i + 1)) + rnd(i + 2)) % 1;
            return <path key={i} d={`M${x},${J.y - J.h + 60} L${x + 2},${J.y - J.h + 60 + p * 300}`} stroke="#FFFFFF" strokeWidth={5} opacity={fog} strokeLinecap="round" />; })}
          <rect x={J.x - J.w / 2} y={J.y - J.h} width={J.w} height={J.h} fill="url(#glass1106)" />
        </g>
        <path d={`M${J.x - J.w / 2},${J.y - J.h + 60} L${J.x - J.w / 2},${J.y - 30} Q${J.x - J.w / 2},${J.y} ${J.x - J.w / 2 + 30},${J.y} L${J.x + J.w / 2 - 30},${J.y} Q${J.x + J.w / 2},${J.y} ${J.x + J.w / 2},${J.y - 30} L${J.x + J.w / 2},${J.y - J.h + 60}`} fill="none" stroke="#FFFFFF" strokeWidth={6} opacity={0.9} />
        <rect x={J.x - J.w / 2 + 26} y={J.y - J.h + 80} width={14} height={J.h - 140} rx={7} fill="#FFFFFF" opacity={0.6} />
        {/* tag on twine */}
        <g transform={`translate(${J.x + J.w / 2 - 20} ${J.y - J.h + 110}) rotate(${10 + 4 * Math.sin(t * 1.5) * breeze})`} opacity={1 - sm(seg(f, T.pop, T.pop + 20))}>
          <path d="M0,0 L40,40" stroke="#B39A86" strokeWidth={3} /><rect x={30} y={36} width={150} height={74} rx={8} fill="#E8D2B4" transform="rotate(8 30 36)" />
          <text x={104} y={86} textAnchor="middle" fontFamily="Caveat" fontWeight={700} fontSize={34} fill="#6A4A3A" transform="rotate(8 30 36)">good enough</text>
        </g>
      </g>
      {/* the lid: twists, then pops off */}
      <g transform={`translate(${J.x + 120 * pop} ${J.y + lidY}) rotate(${lidR})`} opacity={1 - seg(f, T.pop + 18, T.pop + 30)}>
        <rect x={-J.w / 2 + 10} y={-36} width={J.w - 20} height={56} rx={12} fill="#E7C46A" />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-J.w / 2 + 26 + i * 25} x2={-J.w / 2 + 26 + i * 25} y1={-30} y2={14} stroke="#C9A04A" strokeWidth={4} />)}
      </g>
      {f > T.pop && f < T.pop + 20 && Array.from({ length: 14 }, (_, i) => { const p = seg(f, T.pop, T.pop + 20), a = -Math.PI / 2 + (rnd(i) - 0.5) * 2;
        return <circle key={i} cx={J.x + Math.cos(a) * 200 * p} cy={J.y - J.h - 20 + Math.sin(a) * 200 * p} r={6} fill="#FFF0A0" opacity={1 - p} />; })}
      {/* fresh air: swirling ribbons carrying leaves and petals into the jar */}
      {air > 0 && [0, 1, 2].map((k) => { const pts = Array.from({ length: 40 }, (_, i) => { const u = i / 39, a = u * Math.PI * 3 + t * 2 + k * 2; const r = lerp(380, 60, u);
        return `${J.x + Math.cos(a) * r},${J.y - J.h + 40 + lerp(-380, 120, u) + Math.sin(a) * r * 0.3}`; });
        return <polyline key={k} points={pts.join(" ")} fill="none" stroke="#FFFFFF" strokeWidth={6} opacity={0.6 * air} strokeLinecap="round" />; })}
      {air > 0 && Array.from({ length: 16 }, (_, i) => { const u = ((f - T.air) / 50 + rnd(i)) % 1, a = u * Math.PI * 3 + t * 2 + i, r = lerp(380, 60, u);
        return <path key={i} d="M0,-9 C6,-5 6,5 0,9 C-6,5 -6,-5 0,-9 Z" transform={`translate(${J.x + Math.cos(a) * r} ${J.y - J.h + 40 + lerp(-380, 120, u) + Math.sin(a) * r * 0.3}) rotate(${u * 700}) scale(1.6)`} fill={i % 2 ? "#FFB7CF" : "#8FD69A"} opacity={air} />; })}
      <Motes f={f} n={40} color="#FFF6D0" y0={300} y1={1450} gust={air} />
    </g>
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <LightLeak f={f} amt={0.45 * sm(seg(f, T.air, T.air + 40))} side="right" tint="gold" />
    <Words f={f} from={0} to={T.l2 - 8} top={190} size={72}>
      <div><W f={f} at={2}>Don't</W><W f={f} at={7}>teach</W><W f={f} at={12}>your</W><W f={f} at={17} last><i>soul</i></W></div>
      <div><W f={f} at={30}>to</W><W f={f} at={34}>settle</W><W f={f} at={40}>for</W><W f={f} at={44} last>what</W></div>
      <div><W f={f} at={60} last>suffocates it.</W></div>
    </Words>
    <Words f={f} from={T.l2 - 4} to={WIPE - 4} top={210} size={90}>
      <div><W f={f} at={T.l2}>Let</W><W f={f} at={T.l2 + 6} last>it</W></div>
      <div style={{ marginTop: -8 }}><KeyW f={f} at={T.key} color="#E0567F" size={160}>breathe.</KeyW></div>
    </Words>
    <EndCard f={f} wipe={WIPE} card={CARD} />
  </AbsoluteFill>
);

export const Q1106: React.FC = () => { const f = useCurrentFrame(); return <QFrame world={<World f={f} />} overlay={<Overlay f={f} />} audio="q1106.wav" />; };
export const BEATS = { ...T, END, WIPE, CARD };
