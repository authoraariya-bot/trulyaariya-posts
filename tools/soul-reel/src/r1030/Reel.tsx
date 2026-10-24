// 30 Oct · Book promotion · "When you reach the last page… close it gently, text someone you miss…
// and go a little easier on yourself."
// Meaning: what she hopes the book leaves you with — gentleness, connection, and kindness to yourself.
// Beats: a rainy morning in a reading nook; the soul is curled in a big armchair under a blanket, turning the last page →
// it closes the book gently and holds it a moment → picks up its phone, types "miss you", a little heart floats up to the
// window → the blanket slides off as it stands; it walks to the window and opens it: the rain has stopped, dawn light and
// a breeze pour in; it rests a hand on its heart, eyes closed, smiling (on yourself).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { makeStory, seg01, smoother, sstep, lerp, Pose } from "../kit/choreo";
import { Soul, handOf, chestPt, Book } from "../kit/Land";
import { RoomShell, WindowSky, Curtain, Lamp, Plant, Rug, Frames, Defs, FLOOR, SEAT_Y } from "../kit/Room";
import { Rain, LightLeak, GodRays, ColorWash } from "../kit/fx";
import { Block, Word, Key, EndCard } from "../kit/Words";
import { Frame } from "../kit/Frame";

export const END = 600; const WIPE = 500, CARD = 518;
const T = { page1: 30, page2: 62, last: 84, close: 104, phone: 148, type: 164, sent: 196, stand: 236, walk: 250, open: 318, heart: 350, calm: 372 };
const CHAIR = 400, STAND_AT = 800, WIN = { x: 900, y: 700, w: 420, h: 520 }, Z = 1.3;
const readChair: Pose = { lean: -8, head: 22, th: [92, 96], sh: [4, 0], ua: [36, 44], fa: [110, 118] };
const holdChair: Pose = { lean: -4, head: 18, th: [92, 96], sh: [4, 0], ua: [40, 46], fa: [128, 136] };
const phoneChair: Pose = { lean: 0, head: 26, th: [92, 96], sh: [4, 0], ua: [30, 40], fa: [100, 112] };
const reachSide: Pose = { lean: 10, head: 10, th: [92, 96], sh: [4, 0], ua: [20, 72], fa: [30, 86] };
const openWin: Pose = { lean: 8, head: -6, th: [0, 0], sh: [0, 0], ua: [20, 120], fa: [30, 132] };
const handHeart: Pose = { lean: -4, head: -16, th: [0, 0], sh: [0, 0], ua: [8, 34], fa: [14, 150] };
const c = makeStory({
  end: END, x0: CHAIR,
  keys: [
    { f: 0, pose: readChair }, { f: T.close, pose: holdChair, blend: 20 }, { f: T.phone - 16, pose: reachSide, blend: 16 }, { f: T.phone, pose: phoneChair, blend: 16 },
    { f: T.stand, pose: "stand", blend: 26 }, { f: T.open - 18, pose: openWin, blend: 18 }, { f: T.open + 14, pose: "stand", blend: 18 }, { f: T.heart, pose: handHeart, blend: 26 },
  ],
  walks: [{ from: T.walk, to: T.open - 20, x0: CHAIR, x1: STAND_AT }],
  mood: [[0, 0.5], [T.last, 0.42], [T.close + 10, 0.55], [T.sent, 0.75], [T.open, 0.85], [T.heart, 1]],
  heal: [[0, 0.3], [T.sent, 0.45], [T.open, 0.6], [T.calm, 1]],
  mod: (f, p) => { const typing = f > T.type && f < T.sent ? 1 : 0; return { ...p, fa: [p.fa[0], p.fa[1] + 4 * Math.sin(f / 2.4) * typing] as [number, number] }; },
});
const focus = (f: number) => Math.max(620, Math.min(860, c.xAt(f) + 160));

const Armchair: React.FC<{ x: number }> = ({ x }) => (
  <g>
    <ellipse cx={x} cy={FLOOR + 6} rx={170} ry={14} fill="#6F5A4F" opacity={0.15} filter="url(#b8)" />
    <rect x={x - 150} y={SEAT_Y - 240} width={110} height={300} rx={50} fill="#C98A8F" />
    <rect x={x - 140} y={SEAT_Y - 4} width={290} height={70} rx={30} fill="#D9A0A4" />
    <rect x={x + 110} y={SEAT_Y - 70} width={70} height={140} rx={30} fill="#C98A8F" />
    <rect x={x - 130} y={SEAT_Y + 60} width={20} height={FLOOR - SEAT_Y - 60} fill="#8C6B58" /><rect x={x + 140} y={SEAT_Y + 60} width={20} height={FLOOR - SEAT_Y - 60} fill="#8C6B58" />
  </g>
);

const World: React.FC<{ f: number }> = ({ f }) => {
  const h = c.healAt(f), t = f / 30, fc = focus(f);
  const hand = handOf(c, f, 1), hand0 = handOf(c, f, 0), ch = chestPt(c, f);
  const mid = { x: (hand.x + hand0.x) / 2, y: (hand.y + hand0.y) / 2 };
  const openB = f < T.close ? 1 - smoother(seg01(f, T.close - 10, T.close + 6)) : 0;
  const flip = (a: number) => Math.sin(Math.PI * seg01(f, a, a + 14));
  const rain = 1 - sstep(seg01(f, T.walk, T.open + 10));
  const dawn = sstep(seg01(f, T.open - 10, T.calm));
  const casement = smoother(seg01(f, T.open - 4, T.open + 18));
  const blanketOff = smoother(seg01(f, T.stand - 4, T.stand + 22));
  // book: read in the lap → held → set on the side table when the phone comes out
  const toTable = smoother(seg01(f, T.phone - 20, T.phone - 6));
  const bookPos = { x: lerp(mid.x + 10, 620, toTable), y: lerp(mid.y - 6, FLOOR - 170, toTable) };
  // phone: on the side table → in its hands → back on the table
  const phoneIn = smoother(seg01(f, T.phone - 8, T.phone + 4)) * (1 - smoother(seg01(f, T.stand - 14, T.stand)));
  const phonePos = { x: lerp(660, mid.x + 8, phoneIn), y: lerp(FLOOR - 172, mid.y - 16, phoneIn) };
  const heartP = seg01(f, T.sent, T.sent + 70);
  return (
    <g>
      <Defs />
      <g transform={`translate(540 1600) scale(${Z}) translate(${-fc} -1540)`}>
        <RoomShell warm={0.3 + 0.7 * h} width={1700} wall={["#E3E6F4", "#FCE6DA"]} />
        <WindowSky id="w30" x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} warm={dawn} f={f} night={0.3 * (1 - dawn)}>
          <Rain f={f} amt={rain} wind={5} ground={WIN.y + WIN.h} count={120} />
        </WindowSky>
        {/* the window opens outward on the breeze */}
        <path d={`M${WIN.x + WIN.w / 2},${WIN.y} L${WIN.x + WIN.w / 2 + (WIN.w / 2) * (1 - 0.75 * casement)},${WIN.y - 20 * casement} L${WIN.x + WIN.w / 2 + (WIN.w / 2) * (1 - 0.75 * casement)},${WIN.y + WIN.h + 20 * casement} L${WIN.x + WIN.w / 2},${WIN.y + WIN.h} Z`}
          fill="#EEF4F8" stroke="#FBF5EC" strokeWidth={8} opacity={0.35 + 0.4 * casement} />
        <Curtain x={WIN.x} y={WIN.y - 30} h={WIN.h + 60} side={1} f={f} amp={0.2 + 0.9 * casement} color="#F4C9C1" />
        <Frames x={120} y={820} warm={h} />
        <Rug x={560} w={600} />
        <Lamp x={140} on={0.6 + 0.4 * (1 - dawn)} h={420} />
        {/* side table with a mug */}
        <rect x={600} y={FLOOR - 160} width={130} height={14} rx={6} fill="#D9B494" /><rect x={658} y={FLOOR - 148} width={14} height={148} fill="#C49E7E" />
        <rect x={694} y={FLOOR - 196} width={28} height={36} rx={6} fill="#C9D9EE" />
        <Armchair x={CHAIR} />
        <Plant x={1420} s={1.3} perk={0.5 + 0.5 * h} f={f} bloom={dawn} />
        <Soul c={c} f={f} light={0.3 + 0.7 * h} />
        {/* the blanket over its lap, sliding off as it stands */}
        {(() => { const hipY = SEAT_Y + 4; return <path d={`M${CHAIR - 70},${hipY - 30 + 80 * blanketOff} Q${CHAIR + 40},${hipY - 70 + 90 * blanketOff} ${CHAIR + 150},${hipY - 20 + 70 * blanketOff} L${CHAIR + 160},${hipY + 70} Q${CHAIR + 40},${hipY + 96} ${CHAIR - 80},${hipY + 70} Z`} fill="#B9A5D8" opacity={0.95} />; })()}
        {/* the book */}
        <g transform={`translate(${bookPos.x},${bookPos.y}) scale(${lerp(0.9, 0.7, toTable)})`}>
          <Book open={openB * (0.9 + 0.1 * Math.sin(f / 20))} glow={0.3 + 0.4 * Math.sin(Math.PI * seg01(f, T.last - 10, T.close + 20))} />
          {[T.page1, T.page2, T.last].map((a, i) => flip(a) > 0 && <path key={i} d={`M0,-26 Q${40 * (1 - 2 * seg01(f, a, a + 14))},-40 ${56 * (1 - 2 * seg01(f, a, a + 14))},-30 L${56 * (1 - 2 * seg01(f, a, a + 14))},26 L0,30 Z`} fill="#FFFBF2" stroke="#E7D7C3" strokeWidth={1} />)}
        </g>
        {/* the phone and the message */}
        <g transform={`translate(${phonePos.x},${phonePos.y}) rotate(${-12 * phoneIn})`}>
          <rect x={-16} y={-26} width={32} height={52} rx={6} fill="#3B3550" /><rect x={-13} y={-23} width={26} height={46} rx={3} fill="#FFF6E6" />
          {f > T.type && <rect x={-10} y={-4} width={20 * Math.min(1, (f - T.type) / 30)} height={10} rx={5} fill="#C98A8F" />}
        </g>
        {f > T.sent && heartP < 1 && <g transform={`translate(${lerp(mid.x + 30, WIN.x + 120, smoother(heartP))},${lerp(mid.y - 60, WIN.y + 160, smoother(heartP)) - 60 * Math.sin(heartP * Math.PI)}) scale(${1 + heartP})`} opacity={1 - Math.max(0, heartP - 0.8) * 5}>
          <rect x={-46} y={-20} width={92} height={36} rx={18} fill="#C98A8F" />
          <text x={0} y={6} textAnchor="middle" fontFamily="Caveat" fontWeight={700} fontSize={22} fill="#FFFFFF">miss you ♡</text>
        </g>}
        {f >= T.heart && <ellipse cx={ch.x} cy={ch.y} rx={60} ry={60} fill="#FFE2B0" opacity={0.5 * sstep(seg01(f, T.heart, T.calm))} filter="url(#b16)" />}
      </g>
      <GodRays f={f} amt={0.6 * dawn} x={(WIN.x + WIN.w * 0.6 - fc) * Z + 540} y={(WIN.y + 100 - 1540) * Z + 1600} angle={235} spread={60} />
    </g>
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <ColorWash f={f} amt={0.3} a="rgba(210,200,255,0.5)" b="rgba(255,205,190,0.5)" />
    <LightLeak f={f} amt={0.5 * sstep(seg01(f, T.open, T.calm)) * (1 - seg01(f, WIPE - 20, WIPE))} side="right" tint="warm" />
    <Block f={f} from={0} to={T.close - 8}>
      <div><Word f={f} at={1}>When</Word><Word f={f} at={8}>you</Word><Word f={f} at={15} last>reach</Word></div>
      <div><Word f={f} at={T.page2 - 6}>the</Word><Word f={f} at={T.page2}>last</Word><Word f={f} at={T.last} last><i>page,</i></Word></div>
    </Block>
    <Block f={f} from={T.close + 6} to={T.walk + 10}>
      <div><Word f={f} at={T.close + 10}>close</Word><Word f={f} at={T.close + 18}>it</Word><Word f={f} at={T.close + 26} last>gently,</Word></div>
      <div><Word f={f} at={T.type}>text</Word><Word f={f} at={T.type + 8}>someone</Word><Word f={f} at={T.type + 18}>you</Word><Word f={f} at={T.sent} last>miss,</Word></div>
    </Block>
    <Block f={f} from={T.walk + 30} to={WIPE - 4}>
      <div><Word f={f} at={T.walk + 34}>and</Word><Word f={f} at={T.walk + 44}>go</Word><Word f={f} at={T.walk + 52}>a</Word><Word f={f} at={T.walk + 60}>little</Word><Word f={f} at={T.open} last>easier</Word></div>
      <div><Key f={f} at={T.heart + 4}>on yourself.</Key></div>
    </Block>
    <EndCard f={f} wipe={WIPE} card={CARD} />
  </AbsoluteFill>
);

export const Soul1030: React.FC = () => { const f = useCurrentFrame(); return <Frame world={<World f={f} />} overlay={<Overlay f={f} />} audio="r1030.wav" />; };
export const BEATS = { ...T, END, WIPE, CARD };
