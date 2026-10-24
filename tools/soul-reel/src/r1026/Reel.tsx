// 26 Oct · Behind the book · "Writing was never on my list. A kid at heart, a writer by the universe's choice."
// Meaning: she never planned to write; she's playful at heart, and life handed her the book anyway.
// Beats: a breezy morning; the soul writes its to-do list at its desk by an open window, reads it, tilts its head →
// grins, folds the list into a paper plane and throws it out of the window (kid at heart) → light cut: the plane loops over
// pastel rooftops and becomes a little book flapping its pages like wings → light cut: the book flies back in through the
// window and lands in its hands; it hugs it to its chest light (universe's choice).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { makeStory, seg01, smoother, sstep, lerp, clamp01, Pose } from "../kit/choreo";
import { Soul, handOf, chestPt, rnd, col, Book, Spark, blob } from "../kit/Land";
import { RoomShell, WindowSky, Curtain, Table, Chair, Plant, Rug, Shelf, Frames, Defs, TABLE_Y } from "../kit/Room";
import { LightLeak, GodRays, ColorWash, lightCut, Burn } from "../kit/fx";
import { Block, Word, Key, EndCard } from "../kit/Words";
import { Frame } from "../kit/Frame";

export const END = 620; const WIPE = 520, CARD = 538;
const T = { read: 70, fold: 112, stand: 176, throw: 200, cutOut: 228, loop: 262, book: 290, cutIn: 330, catch: 368, hug: 384, cheer: 440 };
const CHAIR = 430, DESK = 640, Z = 1.3;
const write: Pose = { lean: 22, head: 34, th: [88, 92], sh: [2, -2], ua: [44, 52], fa: [92, 100] };
const readP: Pose = { lean: 4, head: 14, th: [88, 92], sh: [2, -2], ua: [36, 44], fa: [100, 110] };
const foldP: Pose = { lean: 10, head: 24, th: [88, 92], sh: [2, -2], ua: [30, 40], fa: [110, 122] };
const throwP: Pose = { lean: -6, head: -10, th: [0, 0], sh: [0, 0], ua: [10, 150], fa: [20, 170] };
const catchP: Pose = { lean: 2, head: -8, th: [0, 0], sh: [0, 0], ua: [56, 66], fa: [96, 108] };
const c = makeStory({
  end: END, x0: CHAIR,
  keys: [
    { f: 0, pose: write }, { f: T.read, pose: readP, blend: 22 }, { f: T.fold, pose: foldP, blend: 18 }, { f: T.stand, pose: "stand", blend: 22 },
    { f: T.throw - 10, pose: throwP, blend: 12 }, { f: T.throw + 14, pose: "stand", blend: 20 },
    { f: T.catch - 16, pose: catchP, blend: 18 }, { f: T.hug, pose: "standHug", blend: 22 }, { f: T.cheer - 24, pose: write, blend: 30 },
  ],
  walks: [],
  mood: [[0, 0.5], [T.read, 0.45], [T.read + 24, 0.55], [T.fold, 0.8], [T.throw, 1], [T.catch - 20, 0.75], [T.catch, 0.95], [T.hug, 1]],
  heal: [[0, 0.5], [T.fold, 0.6], [T.cutIn, 0.8], [T.hug + 20, 1]],
  mod: (f, p) => {
    // pen moving while it writes; a head tilt while reading; fingers folding
    const wr = 1 - sstep(seg01(f, T.read - 8, T.read + 4)) + sstep(seg01(f, T.cheer, T.cheer + 10));
    const tilt = Math.sin(Math.PI * seg01(f, T.read + 10, T.fold - 4));
    const fold = Math.sin(Math.PI * seg01(f, T.fold, T.stand)) * Math.sin((f - T.fold) / 5);
    return { ...p, fa: [p.fa[0] + 8 * fold, p.fa[1] + 6 * Math.sin(f / 3) * wr - 8 * fold] as [number, number], head: p.head - 16 * tilt, lean: p.lean - 6 * tilt };
  },
});
const focus = (f: number) => 560;
const toScreen = (x: number, y: number) => ({ x: (x - focus(0)) * Z + 540, y: (y - 1540) * Z + 1600 });
// paper: list (rect) → plane
const morph = (t: number) => {
  const A = [[-18, -24], [18, -24], [18, 24], [-18, 24]], B = [[34, 0], [-24, -13], [-14, 1], [-24, 12]];
  const u = smoother(t); return A.map((p, i) => [lerp(p[0], B[i][0], u), lerp(p[1], B[i][1], u)]);
};
const Paper: React.FC<{ t: number; lines: number }> = ({ t, lines }) => (
  <g>
    <path d={`M${morph(t).map((p) => p.join(",")).join(" L")} Z`} fill="#FFFDF8" stroke="#E7D7C3" strokeWidth={1.4} strokeLinejoin="round" />
    {t < 0.3 && Array.from({ length: Math.floor(lines) }, (_, k) => <g key={k} opacity={1 - t * 3}><path d={`M-12,${-14 + k * 9} l3,3 l5,-5`} stroke="#9FB08A" strokeWidth={1.5} fill="none" /><path d={`M-1,${-12 + k * 9} l${12 - (k % 3) * 2},0`} stroke="#CDB9A6" strokeWidth={1.4} /></g>)}
    {t > 0.7 && <path d="M34,0 L-14,1" stroke="#E1CFB8" strokeWidth={1.2} opacity={(t - 0.7) * 3} />}
  </g>
);

const Room: React.FC<{ f: number }> = ({ f }) => {
  const h = c.healAt(f), t = f / 30;
  const back = f >= T.cutIn; // second visit: the book flies back in
  const hand = handOf(c, f, 1), hand0 = handOf(c, f, 0), ch = chestPt(c, f);
  // the list / plane in its hands, then thrown out of the window
  let paper: React.ReactNode = null;
  if (f < T.throw + 4) {
    const mid = f < T.read ? { x: DESK - 40, y: TABLE_Y - 4 } : { x: (hand.x + hand0.x) / 2 + 8, y: (hand.y + hand0.y) / 2 - 10 };
    const lift = smoother(seg01(f, T.read - 6, T.read + 12));
    const p = f < T.stand ? { x: lerp(DESK - 40, mid.x, lift), y: lerp(TABLE_Y - 4, mid.y, lift) } : { x: hand.x + 10, y: hand.y - 6 };
    paper = <g transform={`translate(${p.x},${p.y}) rotate(${f < T.read ? 0 : lerp(0, -18, seg01(f, T.stand, T.throw))}) scale(1.6)`}><Paper t={seg01(f, T.fold + 6, T.stand - 6)} lines={1 + 4 * seg01(f, 0, T.read)} /></g>;
  } else if (f < T.cutOut + 4) {
    const q = seg01(f, T.throw + 4, T.cutOut + 4);
    paper = <g transform={`translate(${lerp(hand.x + 10, 760, smoother(q))},${lerp(hand.y - 6, 1010, q) - 80 * Math.sin(q * Math.PI)}) rotate(${-14 + 6 * Math.sin(q * 9)}) scale(${1.6 - 0.9 * q})`}><Paper t={1} lines={0} /></g>;
  }
  // the book-bird coming home through the window
  let bird: React.ReactNode = null;
  if (back) {
    const q = seg01(f, T.cutIn, T.catch);
    const hug = smoother(seg01(f, T.hug, T.hug + 22));
    const target = { x: (hand.x + hand0.x) / 2 + 10, y: (hand.y + hand0.y) / 2 - 16 };
    const down = smoother(seg01(f, T.cheer - 24, T.cheer + 4));
    const x = f < T.catch ? lerp(780, target.x, smoother(q)) : lerp(lerp(target.x, ch.x + 20, hug), DESK - 30, down);
    const y = f < T.catch ? lerp(980, target.y, smoother(q)) - 60 * Math.sin(q * Math.PI) : lerp(lerp(target.y, ch.y + 8, hug), TABLE_Y - 30, down);
    const flap = f < T.catch ? 0.35 + 0.65 * Math.abs(Math.sin(f / 3)) : down;
    bird = <g transform={`translate(${x},${y}) scale(${lerp(0.6, 1.1, smoother(q))})`}><Book open={flap} glow={0.5 + 0.5 * h} /></g>;
  }
  const breeze = 0.6 + 0.4 * Math.sin(t * 0.7);
  return (
    <g transform={`translate(540 1600) scale(${Z}) translate(${-focus(f)} -1540)`}>
      <RoomShell warm={0.6 + 0.4 * h} width={1800} wall={["#BFDCEE", "#FBDFC6"]} />
      <WindowSky id="w26" x={600} y={720} w={420} h={520} warm={0.75} f={f} />
      {/* casement left open to the breeze */}
      <path d={`M1020,720 L${1090 + 10 * Math.sin(t)},700 L${1090 + 10 * Math.sin(t)},1260 L1020,1240 Z`} fill="#F3F7FA" stroke="#FBF5EC" strokeWidth={8} opacity={0.9} />
      <Curtain x={600} y={690} h={590} side={1} f={f} amp={breeze} color="#F6E3B4" />
      <Frames x={130} y={880} warm={h} />
      <Shelf x={1250} y={980} f={f} perk={h} />
      <Rug x={560} w={560} />
      {/* a little warm glow on the open book as it writes its first page */}
      <ellipse cx={DESK - 30} cy={TABLE_Y - 30} rx={140} ry={80} fill="#FFE0A8" opacity={0.6 * sstep(seg01(f, T.cheer, T.cheer + 30))} filter="url(#b16)" />
      <Table x={DESK} w={300} />
      {/* desk things: a mug, pencils */}
      <rect x={DESK + 70} y={TABLE_Y - 40} width={34} height={40} rx={6} fill="#C9D9EE" />
      {[0, 1, 2].map((k) => <rect key={k} x={DESK + 110 + k * 7} y={TABLE_Y - 58} width={5} height={58} rx={2} fill={["#F6D46B", "#F4A3B8", "#9FC48E"][k]} transform={`rotate(${(k - 1) * 6} ${DESK + 112} ${TABLE_Y})`} />)}
      <Chair x={CHAIR} back={-1} c="#9FC0D8" />
      <Plant x={1320} s={1.3} perk={h} f={f} bloom={sstep(seg01(f, T.hug, T.hug + 40))} />
      <Soul c={c} f={f} light={back ? 0.6 + 0.4 * smoother(seg01(f, T.hug, T.hug + 22)) + 0.1 * Math.sin(t * 3) : undefined} />
      {paper}
      {bird}
    </g>
  );
};

// outside: the plane loops over pastel rooftops and turns into a book with page-wings
const Sky: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30; const q = seg01(f, T.cutOut, T.cutIn);
  const loop = seg01(f, T.loop - 14, T.loop + 26);
  const a = loop * Math.PI * 2;
  let x = lerp(140, 900, q), y = 1300 - 360 * q;
  if (loop > 0 && loop < 1) { x += 150 * Math.sin(a); y += -150 * (1 - Math.cos(a)); }
  const toBook = smoother(seg01(f, T.book - 6, T.book + 20));
  const rot = loop > 0 && loop < 1 ? -a * 57.3 : -18;
  return (
    <g>
      <defs><linearGradient id="sky26" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#A9D6F2" /><stop offset="0.6" stopColor="#FCE3D2" /><stop offset="1" stopColor="#FFF0D6" /></linearGradient></defs>
      <rect width={1080} height={1920} fill="url(#sky26)" />
      <circle cx={820} cy={980} r={120} fill="#FFF1C9" /><circle cx={820} cy={980} r={260} fill="#FFE7B0" opacity={0.5} filter="url(#b40)" />
      {[[100, 820, 1], [560, 760, 0.8], [900, 1180, 1.1]].map(([cx, cy, s], i) => (
        <g key={i} transform={`translate(${cx - t * (8 + i * 4)},${cy}) scale(${s})`} filter="url(#b8)"><ellipse rx={120} ry={30} fill="#FFFFFF" /><ellipse cx={-40} cy={-20} rx={60} ry={34} fill="#FFFFFF" /><ellipse cx={35} cy={-26} rx={70} ry={40} fill="#FFFFFF" /></g>
      ))}
      {/* a little pastel town below, with trees between the houses */}
      <path d={`M-40,1700 Q300,1640 540,1680 T1120,1660 L1120,1920 L-40,1920 Z`} fill="#A9D893" />
      {Array.from({ length: 10 }, (_, i) => {
        const hx = -60 + i * 125 - ((t * 10) % 125), hh = 90 + 50 * rnd(i), hw = 100;
        const wall = ["#FBE7D8", "#F6DCD6", "#E3EAD9", "#ECE1F0", "#FCEFD2"][i % 5], roof = ["#E7A99A", "#C98A8F", "#D9998B", "#B9A5D8", "#E8B47F"][i % 5];
        const by = 1710 + 14 * Math.sin(i * 1.7);
        return <g key={i}>
          {i % 3 === 1 && <g><rect x={hx - 16} y={by - 70} width={6} height={70} fill="#AE9988" /><path d={blob(hx - 13, by - 92, 34, i, 1.2)} fill="#8EC97E" /></g>}
          <rect x={hx} y={by - hh} width={hw} height={hh} fill={wall} />
          <path d={`M${hx - 12},${by - hh + 4} L${hx + hw / 2},${by - hh - 54} L${hx + hw + 12},${by - hh + 4} Z`} fill={roof} />
          <rect x={hx + 18} y={by - hh + 22} width={22} height={26} rx={4} fill="#FFE3A0" opacity={0.85} />
          <rect x={hx + 58} y={by - hh + 22} width={22} height={26} rx={4} fill="#FFE3A0" opacity={0.85} />
          <rect x={hx + 38} y={by - 40} width={24} height={40} rx={4} fill="#C99A7F" />
        </g>;
      })}
      <rect x={-40} y={1716} width={1160} height={220} fill="#9FCB86" />
      {[0, 1, 2, 3].map((i) => { const bx = (i * 260 + t * 60) % 1200 - 60, by = 700 + i * 60 + 12 * Math.sin(t * 2 + i), w = 9 * Math.sin(t * 10 + i * 2);
        return <path key={i} d={`M${bx - 14},${by - w} Q${bx - 5},${by - 3} ${bx},${by + 2} Q${bx + 5},${by - 3} ${bx + 14},${by - w}`} stroke="#A3948C" strokeWidth={2.8} fill="none" strokeLinecap="round" />; })}
      {/* sparkle trail */}
      {Array.from({ length: 8 }, (_, i) => <g key={i} transform={`translate(${x - (i + 1) * 26 * Math.cos(rot / 57.3)},${y - (i + 1) * 26 * Math.sin(rot / 57.3)})`}><Spark s={0.6 - i * 0.06} o={(1 - i / 8) * 0.9} /></g>)}
      <g transform={`translate(${x},${y}) rotate(${rot * (1 - toBook)}) scale(3.4)`}>
        <g opacity={1 - toBook}><Paper t={1} lines={0} /></g>
        <g opacity={toBook} transform="scale(0.7)"><Book open={0.35 + 0.65 * Math.abs(Math.sin(f / 3))} glow={1} /></g>
      </g>
    </g>
  );
};

const World: React.FC<{ f: number }> = ({ f }) => {
  const inSky = f >= T.cutOut && f < T.cutIn;
  return (
    <g>
      <Defs />
      {!inSky ? <Room f={f} /> : <Sky f={f} />}
      {(() => { const w = toScreen(820, 760); return <GodRays f={f} amt={inSky ? 0.45 : 0.18} x={inSky ? 820 : w.x} y={inSky ? 980 : w.y} angle={inSky ? 250 : 235} spread={60} />; })()}
    </g>
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <ColorWash f={f} amt={0.3} a="rgba(255,190,170,0.5)" b="rgba(160,205,255,0.5)" />
    <Burn f={f} amt={Math.max(lightCut(f, T.cutOut).burn, lightCut(f, T.cutIn).burn)} />
    <LightLeak f={f} amt={0.35 * Math.sin(Math.PI * seg01(f, T.hug - 20, T.cheer + 60))} side="right" tint="gold" />
    <Block f={f} from={0} to={T.fold - 6}>
      <div><Word f={f} at={1}>Writing</Word><Word f={f} at={10} last>was</Word></div>
      <div><Word f={f} at={T.read + 6}>never</Word><Word f={f} at={T.read + 14}>on</Word><Word f={f} at={T.read + 20}>my</Word><Word f={f} at={T.read + 28} last>list.</Word></div>
    </Block>
    <Block f={f} from={T.fold + 14} to={T.cutIn - 50}>
      <div><Word f={f} at={T.fold + 18}>A</Word><Word f={f} at={T.fold + 26} last>kid</Word></div>
      <div><Word f={f} at={T.throw - 6}>at</Word><Word f={f} at={T.throw + 2} last><i>heart,</i></Word></div>
    </Block>
    <Block f={f} from={T.book - 6} to={WIPE - 4}>
      <div><Word f={f} at={T.book}>a</Word><Word f={f} at={T.book + 6}>writer</Word><Word f={f} at={T.book + 14}>by</Word><Word f={f} at={T.book + 20} last>the</Word></div>
      <div><Key f={f} at={T.catch - 4}>universe's</Key></div>
      <div><Word f={f} at={T.hug + 18} last>choice.</Word></div>
    </Block>
    <EndCard f={f} wipe={WIPE} card={CARD} />
  </AbsoluteFill>
);

export const Soul1026: React.FC = () => { const f = useCurrentFrame(); return <Frame world={<World f={f} />} overlay={<Overlay f={f} />} audio="r1026.wav" />; };
export const BEATS = { ...T, END, WIPE, CARD };
void clamp01; void col;
