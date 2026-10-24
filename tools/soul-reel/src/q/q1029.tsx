// 29 Oct · Healing · "Read this if 'sorry' is the first word you say. Sorry for crying. Sorry for replying late.
// Sorry for needing help. Sorry for taking up space. Your feelings were never an inconvenience."
// A sunlit vanity by an open window with wisteria swaying outside. Sticky notes slap onto the mirror, one per
// "sorry", then dozens more. A warm breeze carries petals in; every note peels off, folds into a paper butterfly and
// flutters out of the window. The clear mirror catches the light.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { QFrame, Words, W, KeyW, Motes, seg, sm, lerp, rnd, back, mix } from "./kit";
import { EndCard } from "../kit/Words";
import { LightLeak } from "../kit/fx";

export const END = 420; const WIPE = 330, CARD = 348;
const T = { n: [34, 62, 90, 118], flood: 146, breeze: 182, peel: 190, shine: 246, line2: 240, key: 268 };
const ACCENT = "#E2508A";
const M = { x: 540, y: 1030, w: 560, h: 760 }; // mirror (arched)
const BIG = ["Sorry for crying.", "Sorry for replying late.", "Sorry for needing help.", "Sorry for taking up space."];
const COLS = ["#FFE57A", "#FFB3CC", "#B9E8FF", "#C9F2C7", "#E1CCFF", "#FFC9A8"];
// every note: big ones first, then a flood of small "sorry" notes
const NOTES = [
  ...BIG.map((txt, i) => ({ at: T.n[i], x: M.x + [-110, 120, -90, 100][i], y: M.y + [-210, -60, 90, 230][i], s: 1, r: [-6, 5, -3, 7][i], txt, c: COLS[i] })),
  ...Array.from({ length: 16 }, (_, i) => ({ at: T.flood + i * 2.2, x: M.x - 230 + rnd(i + 3) * 460, y: M.y - 330 + rnd(i + 7) * 640, s: 0.62, r: -12 + 24 * rnd(i + 1), txt: "sorry", c: COLS[(i + 2) % 6] })),
];

const archPath = (x: number, y: number, w: number, h: number) => `M${x - w / 2},${y + h / 2} L${x - w / 2},${y - h / 2 + w / 2} A${w / 2},${w / 2} 0 0 1 ${x + w / 2},${y - h / 2 + w / 2} L${x + w / 2},${y + h / 2} Z`;

const Note: React.FC<{ f: number; n: typeof NOTES[number]; i: number }> = ({ f, n, i }) => {
  if (f < n.at) return null;
  const slap = back(seg(f, n.at, n.at + 8), 2.6);
  const peelAt = T.peel + (NOTES.length - 1 - i) * 1.6 + rnd(i) * 6;   // the last ones stuck come off first
  const fold = sm(seg(f, peelAt, peelAt + 12));                        // note → butterfly
  const fly = seg(f, peelAt + 8, peelAt + 70);
  if (fly >= 1) return null;
  // flight: out toward the open window (right), fluttering up
  const fx = lerp(n.x, 1180 + 80 * rnd(i), sm(fly)) + 40 * Math.sin(fly * 9 + i), fy = lerp(n.y, 520 + 300 * rnd(i + 2), sm(fly)) - 60 * Math.sin(Math.PI * fly);
  const flap = Math.sin(f * 1.1 + i) * fold;
  const S = n.s * lerp(1, 0.55, fold) * lerp(1.25, 1, slap);
  return (
    <g transform={`translate(${fx} ${fy}) rotate(${lerp(n.r, -20 + 40 * rnd(i + 5), fold)}) scale(${S})`} opacity={slap > 0 ? 1 : 0}>
      {fold < 0.98 && (
        <g opacity={1 - fold} transform={`scale(${1 - 0.5 * fold} 1)`}>
          <rect x={-150} y={-120} width={300} height={240} rx={6} fill="#5A3A50" opacity={0.18} transform="translate(6 10)" filter="url(#qb4)" />
          <path d={`M-150,-120 L150,-120 L150,${120 - 26 * seg(f, peelAt - 10, peelAt)} L${150 - 30 * seg(f, peelAt - 10, peelAt)},120 L-150,120 Z`} fill={n.c} />
          <rect x={-150} y={-120} width={300} height={34} fill="#FFFFFF" opacity={0.25} />
          {n.txt.length > 6 ? (
            <foreignObject x={-140} y={-96} width={280} height={210}><div style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 46, lineHeight: 1.05, color: "#4A2E44", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>{n.txt}</div></foreignObject>
          ) : <text y={22} textAnchor="middle" fontFamily="Caveat" fontWeight={700} fontSize={70} fill="#4A2E44">{n.txt}</text>}
        </g>
      )}
      {fold > 0.02 && (
        <g opacity={fold}>
          {[-1, 1].map((d) => (
            <g key={d} transform={`scale(${d * (0.35 + 0.65 * Math.abs(Math.cos(flap * 1.6)))} 1)`}>
              <path d="M0,-6 L120,-110 L150,-20 L0,4 Z" fill={n.c} /><path d="M0,4 L120,30 L80,110 L0,10 Z" fill={n.c} />
              <path d="M0,-6 L120,-110 L150,-20 Z" fill="#FFFFFF" opacity={0.25} />
            </g>
          ))}
          <rect x={-6} y={-40} width={12} height={90} rx={6} fill="#6A4A60" opacity={0.5} />
        </g>
      )}
    </g>
  );
};

const World: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30, breeze = sm(seg(f, T.breeze - 10, T.breeze + 30));
  const shine = seg(f, T.shine, T.shine + 30);
  const warm = sm(seg(f, T.breeze, T.shine + 30));
  return (
    <g>
      <defs>
        <linearGradient id="wall29" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#F4D3E6", "#FFD9E6", warm)} /><stop offset="1" stopColor={mix("#E6C6EE", "#FFE3D2", warm)} /></linearGradient>
        <linearGradient id="sky29" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9FD8FF" /><stop offset="1" stopColor="#FFE6C9" /></linearGradient>
        <linearGradient id="gold29" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#E7BE6A" /><stop offset="0.5" stopColor="#FFE6A6" /><stop offset="1" stopColor="#C9973F" /></linearGradient>
        <linearGradient id="glass29" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#DCEEFF" /><stop offset="0.6" stopColor="#F6E9FF" /><stop offset="1" stopColor="#FFE3EC" /></linearGradient>
        <clipPath id="mir29"><path d={archPath(M.x, M.y, M.w - 36, M.h - 36)} /></clipPath>
        <clipPath id="win29"><rect x={900} y={420} width={300} height={820} /></clipPath>
      </defs>
      <rect width={1080} height={1920} fill="url(#wall29)" />
      {/* open window on the right: sky + wisteria */}
      <g clipPath="url(#win29)">
        <rect x={900} y={420} width={300} height={820} fill="url(#sky29)" />
        {[0, 1, 2].map((i) => <ellipse key={i} cx={((960 + i * 140 + t * 12) % 420) + 860} cy={520 + 70 * i} rx={90} ry={22} fill="#FFFFFF" opacity={0.7} filter="url(#qb6)" />)}
        {Array.from({ length: 9 }, (_, i) => { const x = 910 + i * 26, sw = (10 + 20 * breeze) * Math.sin(t * 1.4 + i * 0.7);
          return <g key={i} transform={`translate(${x} 420) rotate(${sw * 0.4})`}>
            <path d={`M0,0 Q${sw * 0.5},120 ${sw},${260 + 80 * rnd(i)}`} stroke="#7FA86F" strokeWidth={3} fill="none" />
            {Array.from({ length: 14 }, (_, k) => <circle key={k} cx={sw * (k / 14) + 8 * Math.sin(k)} cy={40 + k * 17 * (1 + 0.3 * rnd(i))} r={12 - k * 0.5} fill={["#C9A6FF", "#B48CF0", "#E2CCFF"][k % 3]} />)}
          </g>; })}
      </g>
      <rect x={900} y={420} width={300} height={820} fill="none" stroke="#FFF7F0" strokeWidth={20} />
      {/* sheer curtain billowing in the breeze */}
      <path d={`M880,400 C${860 - 60 * breeze + 14 * Math.sin(t * 2)},700 ${840 - 120 * breeze + 20 * Math.sin(t * 1.6)},1000 ${860 - 160 * breeze},1260 L930,1260 C${910 - 40 * breeze},1000 ${930 - 20 * breeze},700 920,400 Z`} fill="#FFFFFF" opacity={0.5} />
      {/* sunbeam across the wall */}
      <path d="M900,430 L280,1480 L640,1480 L1080,560 Z" fill="#FFF3D6" opacity={0.25 + 0.2 * warm} filter="url(#qb24)" />
      {/* mirror */}
      <path d={archPath(M.x, M.y, M.w + 20, M.h + 20)} fill="#B88A4E" opacity={0.25} transform="translate(10 16)" filter="url(#qb10)" />
      <path d={archPath(M.x, M.y, M.w, M.h)} fill="url(#gold29)" />
      <g clipPath="url(#mir29)">
        <rect x={M.x - M.w / 2} y={M.y - M.h / 2} width={M.w} height={M.h} fill="url(#glass29)" />
        {/* reflection: the window and wisteria, soft */}
        <rect x={M.x - 250} y={M.y - 260} width={170} height={480} fill="#BFE3FF" opacity={0.5} filter="url(#qb6)" />
        {Array.from({ length: 5 }, (_, i) => <ellipse key={i} cx={M.x - 230 + i * 30 + 6 * Math.sin(t + i)} cy={M.y - 180 + 40 * (i % 2)} rx={14} ry={70} fill="#D2B6FF" opacity={0.5} filter="url(#qb4)" />)}
        <path d={`M${M.x - 400 + 900 * shine},${M.y - 500} L${M.x - 300 + 900 * shine},${M.y - 500} L${M.x - 500 + 900 * shine},${M.y + 500} L${M.x - 600 + 900 * shine},${M.y + 500} Z`} fill="#FFFFFF" opacity={0.7 * Math.sin(Math.PI * shine)} />
        <path d={`M${M.x - 200},${M.y - 300} L${M.x - 150},${M.y - 300} L${M.x - 250},${M.y} Z`} fill="#FFFFFF" opacity={0.35} />
      </g>
      {/* vanity */}
      <rect x={-20} y={1440} width={1120} height={50} rx={12} fill="#FFF3EC" />
      <rect x={-20} y={1488} width={1120} height={440} fill="#F1C9C9" />
      <rect x={120} y={1540} width={360} height={150} rx={14} fill="#F7D9D6" /><rect x={600} y={1540} width={360} height={150} rx={14} fill="#F7D9D6" />
      <circle cx={300} cy={1615} r={10} fill="#E7BE6A" /><circle cx={780} cy={1615} r={10} fill="#E7BE6A" />
      {/* things on the vanity: perfume, tulips, tea */}
      <g transform="translate(200 1440)"><rect x={-40} y={-120} width={80} height={120} rx={22} fill="#FFB3CC" opacity={0.85} /><rect x={-14} y={-150} width={28} height={34} rx={6} fill="#E7BE6A" /><rect x={-30} y={-108} width={14} height={80} rx={7} fill="#FFFFFF" opacity={0.4} /></g>
      <g transform="translate(860 1440)">
        {[-1, 0, 1].map((k) => { const sw = 3 * Math.sin(t * 1.3 + k) + 6 * breeze * Math.sin(t * 3 + k);
          return <g key={k} transform={`rotate(${k * 12 + sw})`}><path d="M0,-90 L0,-250" stroke="#6FB07A" strokeWidth={6} /><path d="M-24,-250 C-26,-300 -10,-310 0,-290 C10,-310 26,-300 24,-250 C20,-232 -20,-232 -24,-250 Z" fill={["#FF8FB1", "#FFB86B", "#FF6F9A"][k + 1]} /></g>; })}
        <path d="M-56,0 L-46,-110 L46,-110 L56,0 Z" fill="#C6E9F7" opacity={0.85} />
      </g>
      <g transform="translate(560 1440)"><path d="M-60,-80 L60,-80 L50,0 L-50,0 Z" fill="#FFFFFF" /><path d="M60,-64 C92,-64 92,-24 56,-24" stroke="#FFFFFF" strokeWidth={10} fill="none" /><ellipse cx={0} cy={-80} rx={60} ry={10} fill="#C98E6A" />
        {[0, 1].map((k) => <path key={k} d={`M${-14 + 26 * k},-96 C${-24 + 26 * k},-130 ${-4 + 26 * k},-150 ${-14 + 26 * k},-186`} stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.5 * (0.5 + 0.5 * Math.sin(t * 2 + k))} strokeLinecap="round" />)}</g>
      {NOTES.map((n, i) => <Note key={i} f={f} n={n} i={i} />)}
      {/* petals blowing in through the window */}
      {breeze > 0.01 && Array.from({ length: 40 }, (_, i) => { const p = ((f - T.breeze) / (50 + 30 * rnd(i)) + rnd(i + 2)) % 1, x = 1100 - p * 1300, y = 500 + rnd(i + 4) * 900 + 80 * Math.sin(p * 8 + i);
        return <path key={i} d="M0,-8 C5,-5 5,5 0,8 C-5,5 -5,-5 0,-8 Z" transform={`translate(${x} ${y}) rotate(${p * 600 + i * 30}) scale(${1.4 + rnd(i)})`} fill={["#D8BFFF", "#F6CFE6", "#FFFFFF"][i % 3]} opacity={breeze * Math.sin(Math.PI * p)} />; })}
      <Motes f={f} n={36} color="#FFF6DA" y0={500} y1={1450} gust={breeze} />
    </g>
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <LightLeak f={f} amt={0.45 * sm(seg(f, T.breeze, T.shine + 20))} side="right" tint="warm" />
    <Words f={f} from={0} to={T.flood + 20} top={190} size={72}>
      <div><W f={f} at={2}>Read</W><W f={f} at={6}>this</W><W f={f} at={10}>if</W><W f={f} at={14} last><i>“sorry”</i></W></div>
      <div><W f={f} at={20}>is</W><W f={f} at={23}>the</W><W f={f} at={26}>first</W><W f={f} at={29}>word</W><W f={f} at={32}>you</W><W f={f} at={35} last>say.</W></div>
    </Words>
    <Words f={f} from={T.line2 - 4} to={WIPE - 4} top={190} size={76}>
      <div><W f={f} at={T.line2}>Your</W><W f={f} at={T.line2 + 5}>feelings</W><W f={f} at={T.line2 + 10}>were</W><W f={f} at={T.line2 + 14} last>never</W></div>
      <div><W f={f} at={T.line2 + 20} last>an</W></div>
      <div style={{ marginTop: -14 }}><KeyW f={f} at={T.key} color={ACCENT} size={128}>inconvenience.</KeyW></div>
    </Words>
    <EndCard f={f} wipe={WIPE} card={CARD} />
  </AbsoluteFill>
);

export const Q1029: React.FC = () => { const f = useCurrentFrame(); return <QFrame world={<World f={f} />} overlay={<Overlay f={f} />} audio="q1029.wav" />; };
export const BEATS = { ...T, END, WIPE, CARD };
