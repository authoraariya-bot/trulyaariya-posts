// 29 Oct · Quote · "Read this if 'sorry' is your first word. Sorry for crying. Sorry for needing help.
// Your feelings were never an inconvenience."
// Meaning: people who apologise for simply having feelings deserve to hear that they were never a burden.
// Beats: a café; the soul hurries in, bumps a chair — a "sorry" sticky note pops onto it; sits, reaches for its tea and
// spills it — another note; a tear — another; it shrinks under the notes → its friend across the table leans over and peels
// them off one by one, they flutter away as butterflies; the friend slides over a fresh cup → it looks up and smiles, they
// clink cups (an inconvenience — never).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { makeStory, seg01, smoother, sstep, lerp, clamp01, Pose } from "../kit/choreo";
import { Soul, handOf, chestPt, headPt, rnd, col, Spark } from "../kit/Land";
import { RoomShell, WindowSky, Plant, Defs, Frames, FLOOR, SEAT_Y, TABLE_Y } from "../kit/Room";
import { LightLeak, ColorWash, GodRays } from "../kit/fx";
import { Block, Word, Key, EndCard } from "../kit/Words";
import { Frame } from "../kit/Frame";

export const END = 600; const WIPE = 500, CARD = 518;
const T = { bump: 34, sit: 70, reach: 104, spill: 122, tear: 170, help: 216, peel: 264, slide: 330, look: 344, hold: 360, clink: 404 };
const ME = 600, FRIEND = 880, TABLE = 740, Z = 1.3;
const sitP: Pose = { lean: 6, head: 10, th: [88, 92], sh: [2, -2], ua: [14, 20], fa: [30, 40] };
const reachCup: Pose = { lean: 18, head: 20, th: [88, 92], sh: [2, -2], ua: [44, 56], fa: [70, 84] };
const shrink: Pose = { lean: 28, head: 44, th: [96, 100], sh: [6, 2], ua: [10, 16], fa: [40, 50] };
const holdCup: Pose = { lean: 8, head: 4, th: [88, 92], sh: [2, -2], ua: [40, 52], fa: [96, 108] };
const raiseCup: Pose = { lean: 2, head: -4, th: [88, 92], sh: [2, -2], ua: [40, 74], fa: [100, 120] };
const peelP: Pose = { lean: 34, head: 18, th: [88, 92], sh: [2, -2], ua: [50, 78], fa: [70, 84] };
const me = makeStory({
  end: END, x0: 220,
  keys: [
    { f: 0, pose: "stand" }, { f: T.sit, pose: sitP, blend: 26 }, { f: T.reach, pose: reachCup, blend: 16 }, { f: T.spill + 6, pose: sitP, blend: 12 },
    { f: T.tear - 10, pose: shrink, blend: 30 }, { f: T.look, pose: sitP, blend: 20 }, { f: T.hold, pose: holdCup, blend: 18 }, { f: T.clink, pose: raiseCup, blend: 18 },
  ],
  walks: [{ from: 0, to: T.sit - 4, x0: 220, x1: ME }],
  mood: [[0, 0.42], [T.bump, 0.3], [T.spill, 0.22], [T.tear, 0.12], [T.help, 0.1], [T.peel + 20, 0.3], [T.look, 0.7], [T.clink, 1]],
  heal: [[0, 0.35], [T.help, 0.2], [T.peel + 40, 0.5], [T.clink, 1]],
  // a startled flinch at the bump
  mod: (f, p) => { const fl = Math.sin(Math.PI * seg01(f, T.bump, T.bump + 14)); return { ...p, lean: p.lean - 10 * fl, head: p.head - 14 * fl }; },
});
const friend = makeStory({
  end: END, x0: FRIEND,
  keys: [{ f: 0, pose: sitP }, { f: T.peel - 16, pose: peelP, blend: 18 }, { f: T.slide + 16, pose: sitP, blend: 18 }, { f: T.hold, pose: holdCup, blend: 18 }, { f: T.clink, pose: raiseCup, blend: 18 }],
  walks: [],
  mood: [[0, 0.6], [T.spill, 0.5], [T.peel, 0.75], [T.clink, 1]],
  heal: [[0, 0.5], [T.clink, 1]],
  // reaching across: each peel is a small pluck of the hand
  mod: (f, p) => { const pl = Math.max(0, Math.sin(Math.PI * ((f - T.peel) / 16))) * (f > T.peel && f < T.peel + 64 ? 1 : 0); return { ...p, fa: [p.fa[0], p.fa[1] - 18 * pl] as [number, number] }; },
});
const focus = () => 740;
const mirror = (x: number) => 2 * FRIEND - x; // the friend faces left

// where the notes stick on the soul (relative to chest / head), and when
const NOTES = [{ at: T.bump + 2, on: "chest", dx: -10, dy: 6, r: -12 }, { at: T.spill + 4, on: "head", dx: 18, dy: -20, r: 10 }, { at: T.tear + 6, on: "chest", dx: 22, dy: 34, r: 8 }, { at: T.help + 4, on: "head", dx: -22, dy: 6, r: -16 }];
const Note: React.FC<{ x: number; y: number; r: number; s: number; o: number; c: string }> = ({ x, y, r, s, o, c }) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`} opacity={o}>
    <rect x={-26} y={-24} width={52} height={48} fill={c} /><rect x={-26} y={-24} width={52} height={8} fill="#000" opacity={0.06} />
    <text x={0} y={8} textAnchor="middle" fontFamily="Caveat" fontWeight={700} fontSize={20} fill="#6F5A5E">sorry</text>
  </g>
);

const Cup: React.FC<{ x: number; y: number; tip?: number; steam?: number; f: number }> = ({ x, y, tip = 0, steam = 0, f }) => (
  <g transform={`translate(${x},${y}) rotate(${-80 * tip})`}>
    {steam > 0 && [0, 1].map((k) => <path key={k} d={`M${-6 + k * 12},-34 q${6 * Math.sin(f / 9 + k)},-14 0,-28 q${-6 * Math.sin(f / 9 + k)},-14 0,-28`} stroke="#FFFFFF" strokeWidth={4} fill="none" opacity={0.6 * steam} strokeLinecap="round" />)}
    <path d="M-22,-34 L22,-34 L18,0 L-18,0 Z" fill="#F6D9C9" />
    <path d="M22,-26 q14,2 10,14 q-4,8 -12,6" stroke="#F6D9C9" strokeWidth={5} fill="none" />
    <ellipse cx={0} cy={-34} rx={22} ry={5} fill="#C99A7F" />
  </g>
);

const World: React.FC<{ f: number }> = ({ f }) => {
  const h = me.healAt(f), t = f / 30, fc = focus();
  const chest = chestPt(me, f), head = headPt(me, f);
  const fh = handOf(friend, f, 1); const friendHand = { x: mirror(fh.x), y: fh.y };
  // peel order and timing
  const peelAt = (i: number) => T.peel + i * 16;
  const notes = NOTES.map((n, i) => {
    if (f < n.at) return null;
    const base = n.on === "chest" ? chest : head;
    const stuck = { x: base.x + n.dx, y: base.y + n.dy };
    const pop = smoother(seg01(f, n.at, n.at + 8));
    const pl = seg01(f, peelAt(i), peelAt(i) + 40);
    if (pl >= 1) return null;
    // peeled: lifted by the friend's hand, then it flutters up as a butterfly
    const lift = smoother(seg01(f, peelAt(i), peelAt(i) + 10));
    const bx = lerp(stuck.x, friendHand.x, lift) - pl * 120 * (i % 2 ? -1 : 1), by = lerp(stuck.y, friendHand.y, lift) - pl * 300;
    const fly = sstep(seg01(f, peelAt(i) + 8, peelAt(i) + 20));
    const flap = Math.abs(Math.sin(t * 14 + i));
    const cc = ["#F6DFA8", "#F4C9C1", "#D9EAD3", "#D9CDEB"][i];
    return (
      <g key={i}>
        <Note x={bx} y={by} r={n.r + 30 * pl} s={(0.6 + 0.4 * pop) * (1 - fly)} o={1 - fly} c={cc} />
        {fly > 0 && <g transform={`translate(${bx},${by}) scale(${1.4 * fly})`} opacity={1 - Math.max(0, pl - 0.75) * 4}>
          <path d="M0,0 C-14,-20 -26,-8 -16,4 C-10,10 -4,6 0,2Z" fill={cc} transform={`scale(${0.35 + 0.65 * flap},1)`} />
          <path d="M0,0 C14,-20 26,-8 16,4 C10,10 4,6 0,2Z" fill={cc} transform={`scale(${0.35 + 0.65 * flap},1)`} />
          <path d="M0,-6 L0,8" stroke="#9C8573" strokeWidth={2} strokeLinecap="round" />
        </g>}
      </g>
    );
  });
  // cups: mine tips over at the spill; the friend's fresh cup slides across, then both are raised to clink
  const tip = smoother(seg01(f, T.spill, T.spill + 10));
  const puddle = smoother(seg01(f, T.spill + 4, T.spill + 30));
  const slide = smoother(seg01(f, T.slide, T.slide + 22));
  const myHand = handOf(me, f, 1);
  const raised = smoother(seg01(f, T.hold, T.hold + 14));
  const freshX = lerp(TABLE + 60, TABLE - 50, slide), freshY = TABLE_Y;
  const clinkGlow = Math.sin(Math.PI * seg01(f, T.clink + 14, T.clink + 40));
  const bumpChair = Math.sin(seg01(f, T.bump, T.bump + 24) * Math.PI * 4) * (1 - seg01(f, T.bump, T.bump + 24)) * 8;
  const chair = (x: number, back: 1 | -1, c: string, r = 0) => (
    <g transform={`rotate(${r} ${x} ${FLOOR})`}>
      <rect x={x - 58} y={SEAT_Y} width={116} height={16} rx={6} fill={c} />
      <rect x={x - 52} y={SEAT_Y + 14} width={10} height={FLOOR - SEAT_Y - 14} rx={4} fill="#B58E70" /><rect x={x + 42} y={SEAT_Y + 14} width={10} height={FLOOR - SEAT_Y - 14} rx={4} fill="#B58E70" />
      <rect x={x + back * 52 - 5} y={SEAT_Y - 170} width={12} height={186} rx={5} fill="#B58E70" />
    </g>
  );
  return (
    <g>
      <Defs />
      <g transform={`translate(540 1600) scale(${Z}) translate(${-fc} -1540)`}>
        <RoomShell warm={0.4 + 0.6 * h} width={1700} wall={["#D8EDE3", "#FCE7D6"]} />
        <WindowSky id="w29" x={360} y={740} w={760} h={460} warm={0.7 + 0.3 * h} f={f} />
        {/* café sign + chalkboard + pendant lamps */}
        <rect x={1180} y={860} width={200} height={260} rx={10} fill="#5F6B66" />
        {["tea", "coffee", "kindness"].map((w, i) => <text key={i} x={1280} y={930 + i * 60} textAnchor="middle" fontFamily="Caveat" fontSize={40} fill="#F6EFE5">{w}</text>)}
        {/* warm glow from the café lights (no cords crossing the words) */}
        {[560, 920].map((x, i) => <ellipse key={i} cx={x} cy={1260} rx={160} ry={90} fill="#FFE7B0" opacity={0.25} filter="url(#b16)" />)}
        <Frames x={140} y={860} warm={h} />
        <Plant x={300} s={1.2} perk={0.5 + 0.5 * h} f={f} bloom={sstep(seg01(f, T.clink, T.clink + 30))} />
        {chair(430, -1, "#E8A9A0", bumpChair)}
        {chair(ME, -1, "#9FC0D8")}
        {chair(FRIEND, 1, "#F6D46B")}
        {/* the souls */}
        <Soul c={me} f={f} light={0.25 + 0.75 * h} />
        <g transform={`translate(${2 * FRIEND} 0) scale(-1 1)`}><Soul c={friend} f={f} /></g>
        {/* table in front hides their legs */}
        <ellipse cx={TABLE} cy={FLOOR + 4} rx={160} ry={12} fill="#6F5A4F" opacity={0.15} filter="url(#b8)" />
        <rect x={TABLE - 8} y={TABLE_Y + 10} width={16} height={FLOOR - TABLE_Y - 10} fill="#C49E7E" />
        <ellipse cx={TABLE} cy={FLOOR - 4} rx={60} ry={10} fill="#C49E7E" />
        <rect x={TABLE - 150} y={TABLE_Y} width={300} height={16} rx={8} fill="#E2BE9C" />
        <ellipse cx={TABLE - 70 + 30 * puddle} cy={TABLE_Y + 1} rx={50 * puddle} ry={5 * puddle} fill="#C99A7F" opacity={0.7 * (1 - sstep(seg01(f, T.slide - 10, T.slide + 10)))} />
        {/* my first cup (spills) */}
        {f < T.slide && <Cup x={TABLE - 70} y={TABLE_Y} tip={tip} f={f} />}
        {/* the fresh cup slides over, then is lifted */}
        {f >= T.slide - 20 && <Cup x={f < T.hold ? freshX : lerp(freshX, myHand.x + 14, raised)} y={f < T.hold ? freshY : lerp(freshY, myHand.y + 20, raised)} steam={1} f={f} />}
        <Cup x={f < T.hold ? TABLE + 60 : lerp(TABLE + 60, friendHand.x - 14, raised)} y={f < T.hold ? TABLE_Y : lerp(TABLE_Y, friendHand.y + 20, raised)} steam={0.6} f={f} />
        {clinkGlow > 0 && <g transform={`translate(${TABLE},${(myHand.y + friendHand.y) / 2 - 10})`}><Spark s={1.6 * clinkGlow} o={clinkGlow} /></g>}
        {/* the tear */}
        {(() => { const tp = seg01(f, T.tear + 8, T.tear + 40); return tp > 0 && tp < 1 ? <path d="M0,-7 C4,-2 5,3 0,7 C-5,3 -4,-2 0,-7 Z" transform={`translate(${head.x + 4},${head.y + 10 + 56 * tp}) scale(1.5)`} fill="#9CCBE6" opacity={Math.sin(tp * Math.PI)} /> : null; })()}
        {notes}
      </g>
      <GodRays f={f} amt={0.3 + 0.3 * h} x={900} y={500} angle={215} spread={50} />
    </g>
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <ColorWash f={f} amt={0.32} a="rgba(255,200,190,0.5)" b="rgba(190,235,215,0.5)" />
    <LightLeak f={f} amt={0.45 * Math.sin(Math.PI * seg01(f, T.look - 10, WIPE))} side="left" tint="warm" />
    <Block f={f} from={0} to={T.tear - 26}>
      <div><Word f={f} at={1}>Read</Word><Word f={f} at={8}>this</Word><Word f={f} at={15} last>if</Word></div>
      <div><Word f={f} at={T.bump + 4}>“sorry”</Word><Word f={f} at={T.bump + 14}>is</Word><Word f={f} at={T.bump + 20}>your</Word><Word f={f} at={T.bump + 28}>first</Word><Word f={f} at={T.bump + 36} last>word.</Word></div>
    </Block>
    <Block f={f} from={T.tear - 6} to={T.peel + 40}>
      <div><Word f={f} at={T.tear}>Sorry</Word><Word f={f} at={T.tear + 6}>for</Word><Word f={f} at={T.tear + 12} last><i>crying.</i></Word></div>
      <div><Word f={f} at={T.help}>Sorry</Word><Word f={f} at={T.help + 6}>for</Word><Word f={f} at={T.help + 12}>needing</Word><Word f={f} at={T.help + 20} last><i>help.</i></Word></div>
    </Block>
    <Block f={f} from={T.peel + 64} to={WIPE - 4}>
      <div><Word f={f} at={T.slide - 2}>Your</Word><Word f={f} at={T.slide + 6}>feelings</Word><Word f={f} at={T.slide + 14}>were</Word><Word f={f} at={T.look} last>never</Word></div>
      <div><Key f={f} at={T.hold + 4} size={112}>an inconvenience.</Key></div>
    </Block>
    <EndCard f={f} wipe={WIPE} card={CARD} />
  </AbsoluteFill>
);

export const Soul1029: React.FC = () => { const f = useCurrentFrame(); return <Frame world={<World f={f} />} overlay={<Overlay f={f} />} audio="r1029.wav" />; };
export const BEATS = { ...T, END, WIPE, CARD };
void clamp01; void col; void rnd;
