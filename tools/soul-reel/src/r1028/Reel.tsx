// 28 Oct · Behind the book · "Two years. One notes app. A lot of 2 a.m. doubts. Every night, one more page."
// Meaning: the book was written slowly, at night, on a phone, through doubt — one page at a time.
// Beats: a rooftop at night; the soul sits on a bench typing into a glowing phone (Notes · 2:00 AM) → nights pass: the moon
// arcs over the skyline again and again, a doubt-scribble swirls over its head until a breath blows it away; each night a
// glowing page joins the stack beside it → dawn: it gathers the pages, a ribbon ties them into a book, it walks to a little
// free-library box on the roof, places the book inside and looks up into the sunrise (one more page).
import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { makeStory, seg01, smoother, sstep, lerp, clamp01, Pose } from "../kit/choreo";
import { Soul, handOf, rnd, col, Book, Spark, Scribble, Flower, POPPIES } from "../kit/Land";
import { Defs, FLOOR, SEAT_Y, FairyLights, Plant } from "../kit/Room";
import { LightLeak, GodRays, ColorWash, Fireflies } from "../kit/fx";
import { Block, Word, Key, EndCard } from "../kit/Words";
import { Frame } from "../kit/Frame";

export const END = 600; const WIPE = 500, CARD = 518;
const T = { nights: 110, doubt: 140, breath: 200, n3: 250, dawn: 290, stand: 318, tie: 330, walk: 348, place: 410, look: 432 };
const BENCH = 420, BOX = 900, Z = 1.25;
const phoneP: Pose = { lean: 14, head: 32, th: [88, 92], sh: [2, -2], ua: [30, 38], fa: [104, 112] };
const sighP: Pose = { lean: -4, head: -14, th: [88, 92], sh: [2, -2], ua: [22, 30], fa: [60, 70] };
const placeP: Pose = { lean: 20, head: 18, th: [0, 0], sh: [0, 0], ua: [54, 62], fa: [80, 90] };
const c = makeStory({
  end: END, x0: BENCH,
  keys: [
    { f: 0, pose: phoneP }, { f: T.breath, pose: sighP, blend: 16 }, { f: T.breath + 26, pose: phoneP, blend: 20 },
    { f: T.stand, pose: "standHold", blend: 22 }, { f: T.place - 16, pose: placeP, blend: 18 }, { f: T.look, pose: "lookUp", blend: 28 },
  ],
  walks: [{ from: T.walk, to: T.place - 18, x0: BENCH, x1: BOX - 140 }],
  mood: [[0, 0.42], [T.doubt, 0.3], [T.breath + 10, 0.5], [T.n3, 0.55], [T.dawn, 0.7], [T.place, 0.85], [T.look + 10, 1]],
  heal: [[0, 0.3], [T.dawn, 0.4], [T.look, 1]],
  mod: (f, p) => { const typing = (1 - sstep(seg01(f, T.stand - 10, T.stand))) * (f < T.breath || f > T.breath + 30 ? 1 : 0); return { ...p, fa: [p.fa[0], p.fa[1] + 5 * Math.sin(f / 2.5) * typing] as [number, number] }; },
});
const focus = (f: number) => Math.max(560, Math.min(820, c.xAt(f) + 120));
// 1 = deep night, 0 = day; nights flicker past in the middle
const nightAt = (f: number) => {
  if (f < T.nights) return 1;
  if (f < T.dawn) { const p = (f - T.nights) / (T.dawn - T.nights); return 0.75 + 0.25 * Math.cos(p * Math.PI * 6); }
  return 1 - sstep(seg01(f, T.dawn, T.look + 10));
};

const Sky: React.FC<{ f: number; fc: number }> = ({ f, fc }) => {
  const n = nightAt(f), t = f / 30;
  const top = interpolateColors(n, [0, 1], ["#A9D6F2", "#2E3157"]), mid = interpolateColors(n, [0, 1], ["#FCDCC8", "#5A4E80"]), low = interpolateColors(n, [0, 1], ["#FFE9C4", "#9B7FA3"]);
  // the moon arcs across the sky once per night
  const cyc = f < T.nights ? f / T.nights * 0.4 : f < T.dawn ? 0.4 + ((f - T.nights) / (T.dawn - T.nights)) * 3 : 3.4 + seg01(f, T.dawn, T.look) * 0.6;
  const mp = cyc % 1; const mx = 100 + mp * 900, my = 980 - Math.sin(mp * Math.PI) * 240;
  const sun = sstep(seg01(f, T.dawn + 20, T.look + 20));
  return (
    <g>
      <defs><linearGradient id="sky28" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="0.55" stopColor={mid} /><stop offset="0.8" stopColor={low} /></linearGradient></defs>
      <rect width={1080} height={1920} fill="url(#sky28)" />
      {/* stars wheel slowly */}
      {Array.from({ length: 70 }, (_, i) => { const a = rnd(i) * 6.28 + cyc * 0.4, r = 200 + rnd(i + 2) * 900; const x = 540 + Math.cos(a) * r, y = 1500 - Math.abs(Math.sin(a)) * r * 0.9;
        return <circle key={i} cx={x} cy={y} r={1.6 + 2 * rnd(i + 5)} fill="#FFF6E0" opacity={n * (0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)))} />; })}
      <g opacity={n}><circle cx={mx} cy={my} r={46} fill="#FFF3D6" /><circle cx={mx + 16} cy={my - 10} r={42} fill={mid} opacity={0.9} /><circle cx={mx} cy={my} r={110} fill="#FFF3D6" opacity={0.18} filter="url(#b16)" /></g>
      <g opacity={sun}><circle cx={820} cy={1180 - 160 * sun} r={90} fill="#FFE7B0" /><circle cx={820} cy={1180 - 160 * sun} r={260} fill="#FFE2A0" opacity={0.5} filter="url(#b40)" /></g>
      {/* city skyline behind the roof, windows lit at night */}
      <g transform={`translate(${-(fc - 600) * 0.3} 0)`}>
        {Array.from({ length: 14 }, (_, i) => {
          const x = -120 + i * 110, hh = 260 + 260 * rnd(i + 9), w = 96;
          const c1 = interpolateColors(n, [0, 1], [["#C9C2E0", "#E7C9D6", "#C6D6E6"][i % 3], ["#4A4670", "#57507A", "#433F68"][i % 3]]);
          return <g key={i}><rect x={x} y={1380 - hh} width={w} height={hh} fill={c1} />
            {Array.from({ length: 12 }, (_, k) => { const lit = rnd(i * 13 + k) > 0.5; return <rect key={k} x={x + 14 + (k % 3) * 26} y={1380 - hh + 22 + Math.floor(k / 3) * 46} width={14} height={20} rx={2} fill={lit ? "#FFE3A0" : "#FFFFFF"} opacity={lit ? n * 0.9 : 0.15} />; })}</g>;
        })}
      </g>
    </g>
  );
};

const World: React.FC<{ f: number }> = ({ f }) => {
  const fc = focus(f), n = nightAt(f), t = f / 30, h = c.healAt(f);
  const hand = handOf(c, f, 1), hand0 = handOf(c, f, 0);
  const mid = { x: (hand.x + hand0.x) / 2, y: (hand.y + hand0.y) / 2 };
  const pages = Math.floor(lerp(2, 18, seg01(f, 0, T.dawn)));
  const tie = smoother(seg01(f, T.tie, T.tie + 18));
  const placed = smoother(seg01(f, T.place - 4, T.place + 14));
  const boxPos = { x: BOX, y: FLOOR - 200 };
  // where the bundle / book is
  let bundle: React.ReactNode = null;
  if (f < T.stand) bundle = null;
  else if (f < T.place) bundle = <g transform={`translate(${mid.x + 12},${mid.y - 10})`}><g opacity={1 - tie}>{Array.from({ length: 8 }, (_, k) => <rect key={k} x={-30} y={-k * 4} width={60} height={4} rx={1} fill={k % 2 ? "#FFFDF8" : "#F6EEE2"} stroke="#E7D7C3" strokeWidth={0.6} />)}</g><g opacity={tie} transform="scale(0.85)"><Book glow={0.6} /><path d="M-34,-6 L34,-6" stroke="#E8A9A0" strokeWidth={4} /><path d="M0,-6 l-10,-12 M0,-6 l10,-12" stroke="#E8A9A0" strokeWidth={3} /></g></g>;
  else bundle = <g transform={`translate(${lerp(mid.x + 12, boxPos.x, placed)},${lerp(mid.y - 10, boxPos.y + 44, placed)}) scale(0.6)`}><Book glow={0.8} /></g>;
  return (
    <g>
      <Defs />
      <Sky f={f} fc={fc} />
      <g transform={`translate(540 1600) scale(${Z}) translate(${-fc} -1540)`}>
        {/* the rooftop: parapet, water tank, plants, string lights */}
        <rect x={-300} y={FLOOR} width={2200} height={500} fill={interpolateColors(n, [0, 1], ["#E8C9B0", "#8E7C93"])} />
        <rect x={-300} y={FLOOR - 40} width={2200} height={40} fill={interpolateColors(n, [0, 1], ["#F3DCCB", "#A796AA"])} />
        {Array.from({ length: 22 }, (_, i) => <rect key={i} x={-300 + i * 100} y={FLOOR - 40} width={4} height={40} fill="#000" opacity={0.06} />)}
        <g transform="translate(170,0)"><rect x={-60} y={FLOOR - 300} width={120} height={200} rx={16} fill={interpolateColors(n, [0, 1], ["#D9C9D6", "#6F6585"])} /><rect x={-50} y={FLOOR - 100} width={10} height={60} fill="#6F6585" /><rect x={40} y={FLOOR - 100} width={10} height={60} fill="#6F6585" /></g>
        <path d={`M100,${FLOOR - 340} L100,${FLOOR - 40}`} stroke="#8C7C74" strokeWidth={6} />
        <path d={`M1180,${FLOOR - 340} L1180,${FLOOR - 40}`} stroke="#8C7C74" strokeWidth={6} />
        <FairyLights x0={100} x1={1180} y={FLOOR - 340} sag={70} on={0.4 + 0.6 * n} f={f} n={14} />
        {/* bench */}
        <rect x={BENCH - 110} y={SEAT_Y} width={300} height={16} rx={6} fill="#C9A385" />
        <rect x={BENCH - 100} y={SEAT_Y + 14} width={12} height={FLOOR - SEAT_Y - 14} fill="#B58E70" /><rect x={BENCH + 170} y={SEAT_Y + 14} width={12} height={FLOOR - SEAT_Y - 14} fill="#B58E70" />
        <rect x={BENCH - 110} y={SEAT_Y - 120} width={300} height={14} rx={6} fill="#C9A385" /><rect x={BENCH - 110} y={SEAT_Y - 70} width={300} height={14} rx={6} fill="#C9A385" />
        {/* the growing stack of glowing pages on the bench */}
        {f < T.stand && Array.from({ length: pages }, (_, k) => <rect key={k} x={BENCH + 110 + (k % 2) * 3} y={SEAT_Y - 4 - k * 5} width={60} height={5} rx={1} fill={k % 2 ? "#FFFDF8" : "#F6EEE2"} stroke="#E7D7C3" strokeWidth={0.6} />)}
        {f < T.stand && <ellipse cx={BENCH + 140} cy={SEAT_Y - pages * 2.5} rx={60} ry={40 + pages * 2} fill="#FFE2A0" opacity={0.25} filter="url(#b16)" />}
        {/* little free-library box on a post */}
        <g>
          <rect x={BOX - 6} y={boxPos.y + 90} width={12} height={FLOOR - boxPos.y - 90} fill="#B58E70" />
          <path d={`M${BOX - 80},${boxPos.y - 10} L${BOX},${boxPos.y - 60} L${BOX + 80},${boxPos.y - 10} Z`} fill="#E7A99A" />
          <rect x={BOX - 70} y={boxPos.y - 10} width={140} height={100} rx={6} fill="#F6D9C9" />
          <rect x={BOX - 58} y={boxPos.y + 2} width={116} height={76} rx={4} fill="#FFF3E2" opacity={0.6} />
          {[0, 1, 2].map((k) => <rect key={k} x={BOX - 48 + k * 22} y={boxPos.y + 30} width={16} height={46} rx={2} fill={["#C9D9EE", "#F4C9C1", "#D9CDEB"][k]} />)}
          <text x={BOX} y={boxPos.y + 104} textAnchor="middle" fontFamily="Jost" fontSize={12} letterSpacing={2} fill="#9C8B80">TAKE A BOOK</text>
        </g>
        <Plant x={-40} s={1.2} perk={0.5 + 0.5 * h} f={f} bloom={sstep(seg01(f, T.look, T.look + 30))} />
        <Plant x={1240} s={1.1} perk={0.5 + 0.5 * h} f={f} bloom={sstep(seg01(f, T.look, T.look + 30))} />
        <Soul c={c} f={f} light={0.35 + 0.65 * h} />
        {/* the phone */}
        {f < T.stand && <g transform={`translate(${mid.x + 8},${mid.y - 14}) rotate(-14)`}>
          <rect x={-18} y={-30} width={36} height={60} rx={7} fill="#3B3550" />
          <rect x={-15} y={-26} width={30} height={52} rx={4} fill="#FFF6E6" />
          <ellipse cx={0} cy={-50} rx={70} ry={60} fill="#FFF1D2" opacity={0.35 * n} filter="url(#b16)" />
          <text x={0} y={-12} textAnchor="middle" fontFamily="Jost" fontSize={7} fill="#A5762A">Notes</text>
          {[0, 1, 2, 3].map((k) => <rect key={k} x={-11} y={-6 + k * 6} width={16 + ((f / 6 + k) % 6)} height={2} fill="#CDB9A6" />)}
          <text x={0} y={22} textAnchor="middle" fontFamily="Jost" fontSize={6} fill="#6F5A5E">2:00 AM</text>
        </g>}
        {bundle}
        <Scribble c={c} f={f} amt={Math.sin(Math.PI * seg01(f, T.doubt - 10, T.breath + 30))} u={sstep(seg01(f, T.breath - 4, T.breath + 30))} />
      </g>
      <Fireflies f={f} amt={0.5 * n} count={18} y0={900} y1={1500} />
      <GodRays f={f} amt={0.6 * sstep(seg01(f, T.dawn + 30, T.look + 30))} x={820} y={980} angle={245} spread={70} />
    </g>
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <ColorWash f={f} amt={0.3} a="rgba(200,180,255,0.5)" b="rgba(255,200,180,0.45)" />
    <LightLeak f={f} amt={0.45 * sstep(seg01(f, T.dawn + 40, T.look + 20)) * (1 - seg01(f, WIPE - 20, WIPE))} side="right" tint="gold" />
    <Block f={f} from={0} to={T.nights + 10} night={1}>
      <div><Word f={f} at={1}>Two</Word><Word f={f} at={9} last>years.</Word></div>
      <div><Word f={f} at={40}>One</Word><Word f={f} at={48}>notes</Word><Word f={f} at={58} last>app.</Word></div>
    </Block>
    <Block f={f} from={T.nights + 30} to={T.n3 - 4} night={0.9}>
      <div><Word f={f} at={T.nights + 34}>A</Word><Word f={f} at={T.nights + 40}>lot</Word><Word f={f} at={T.nights + 46} last>of</Word></div>
      <div><Word f={f} at={T.doubt + 6}>2 a.m.</Word><Word f={f} at={T.doubt + 18} last><i>doubts.</i></Word></div>
    </Block>
    <Block f={f} from={T.n3 + 20} to={WIPE - 4} night={nightAt(f) * 0.9}>
      <div><Word f={f} at={T.n3 + 24}>Every</Word><Word f={f} at={T.n3 + 34} last>night,</Word></div>
      <div><Key f={f} at={T.tie + 4} size={124}>one more page.</Key></div>
    </Block>
    <EndCard f={f} wipe={WIPE} card={CARD} />
  </AbsoluteFill>
);

export const Soul1028: React.FC = () => { const f = useCurrentFrame(); return <Frame world={<World f={f} />} overlay={<Overlay f={f} />} audio="r1028.wav" />; };
export const BEATS = { ...T, END, WIPE, CARD };
void clamp01; void col; void Spark; void Flower; void POPPIES;
