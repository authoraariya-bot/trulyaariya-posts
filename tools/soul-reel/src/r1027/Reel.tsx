// 27 Oct · Quote · "I started this book as one person, and finished it as another."
// Meaning: writing the book changed her; she came out the other side a different, freer person.
// Beats: a writing nook; a lamp throws the soul's shadow onto the wall. It writes, quiet and a little slouched, and its
// shadow is hunched and small → outside the window rain turns to snow, to blossom, to summer light while the page stack
// grows → it closes the finished book and stands; its shadow on the wall stretches tall and starts to dance, arms up, a
// step ahead of it → the soul sees it, smiles, and raises its arms too (another).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { makeStory, seg01, smoother, sstep, lerp, Pose, GROUND, SCALE } from "../kit/choreo";
import { Soul, handOf, chestPt, rnd, col, Book, Flower } from "../kit/Land";
import { Body } from "../master/World";
import { RoomShell, WindowSky, Curtain, Table, Chair, Lamp, Plant, Rug, Frames, Defs, TABLE_Y } from "../kit/Room";
import { Rain, Snow, LightLeak, GodRays, ColorWash } from "../kit/fx";
import { Block, Word, Key, EndCard } from "../kit/Words";
import { Frame } from "../kit/Frame";

export const END = 600; const WIPE = 500, CARD = 518;
const T = { s1: 70, s2: 140, s3: 210, s4: 270, close: 300, stand: 316, hug: 332, shadow: 340, see: 384, cheer: 412 };
const CHAIR = 620, DESK = 830, LAMP = 470, Z = 1.32;
const writeP: Pose = { lean: 26, head: 38, th: [88, 92], sh: [2, -2], ua: [44, 52], fa: [92, 100] };
const writeTall: Pose = { lean: 14, head: 24, th: [88, 92], sh: [2, -2], ua: [44, 52], fa: [92, 100] };
const closeP: Pose = { lean: 12, head: 22, th: [88, 92], sh: [2, -2], ua: [40, 48], fa: [110, 120] };
const story = (dancer: boolean) => makeStory({
  end: END, x0: CHAIR,
  keys: dancer
    ? [{ f: 0, pose: writeP }, { f: 150, pose: writeTall, blend: 120 }, { f: T.close, pose: closeP, blend: 14 }, { f: T.stand, pose: "standHug", blend: 22 }, { f: T.shadow, pose: "cheer", blend: 26 }]
    : [{ f: 0, pose: writeP }, { f: 150, pose: writeTall, blend: 120 }, { f: T.close, pose: closeP, blend: 14 }, { f: T.stand, pose: "standHug", blend: 22 }, { f: T.cheer, pose: "cheer", blend: 26 }],
  walks: [],
  mood: [[0, 0.32], [T.s3, 0.5], [T.close, 0.6], [T.stand, 0.7], [T.see, 0.95], [T.cheer, 1]],
  heal: [[0, 0.15], [T.s2, 0.3], [T.s4, 0.6], [T.cheer + 20, 1]],
  mod: (f, p) => {
    const w = 1 - sstep(seg01(f, T.close - 8, T.close));
    let q = { ...p, fa: [p.fa[0], p.fa[1] + 6 * Math.sin(f / 3) * w] as [number, number] };
    const dance = dancer ? sstep(seg01(f, T.shadow + 10, T.shadow + 30)) : sstep(seg01(f, T.cheer + 20, T.cheer + 40));
    if (dance > 0) { const s = Math.sin(f / 9); q = { ...q, lean: q.lean + 8 * s * dance, head: q.head - 10 * s * dance, ua: [q.ua[0] - 14 * s * dance, q.ua[1] + 14 * s * dance] as [number, number] }; }
    return q;
  },
});
const c = story(false), shadow = story(true);
const focus = (f: number) => 840;
const toScreen = (x: number, y: number) => ({ x: (x - 840) * Z + 540, y: (y - 1540) * Z + 1600 });

const World: React.FC<{ f: number }> = ({ f }) => {
  const h = c.healAt(f);
  const seasons = { rain: 1 - sstep(seg01(f, T.s1 - 10, T.s1 + 10)), snow: Math.sin(Math.PI * seg01(f, T.s1 - 10, T.s2 + 10)), petals: Math.sin(Math.PI * seg01(f, T.s2 - 10, T.s3 + 30)), sun: sstep(seg01(f, T.s3, T.s4 + 20)) };
  const pages = Math.floor(lerp(1, 16, seg01(f, 0, T.close)));
  const hp = { x: (handOf(c, f, 0).x + handOf(c, f, 1).x) / 2, y: (handOf(c, f, 0).y + handOf(c, f, 1).y) / 2 };
  const ch = chestPt(c, f);
  const hug = smoother(seg01(f, T.stand, T.hug));
  const closed = f >= T.close;
  // the shadow on the wall: hunched and small while writing, then taller and dancing
  const grow = smoother(seg01(f, T.shadow, T.shadow + 50));
  const sx = c.xAt(f), srig = shadow.rigAt(f);
  const shScale = lerp(1.05, 1.42, grow);
  const shX = lerp(CHAIR + 470, CHAIR + 520, grow);
  return (
    <g>
      <Defs />
      <g transform={`translate(540 1600) scale(${Z}) translate(${-focus(f)} -1540)`}>
        <RoomShell warm={0.35 + 0.65 * h} width={1900} wall={["#E6E2F2", "#FBEAD9"]} />
        <WindowSky id="w27" x={80} y={760} w={320} h={420} warm={seasons.sun} f={f} night={0.3 * (1 - seasons.sun)}>
          <Rain f={f} amt={seasons.rain} wind={3} ground={1190} count={70} />
          <Snow f={f} amt={seasons.snow} count={60} />
          {seasons.petals > 0.01 && Array.from({ length: 16 }, (_, i) => { const p = ((f / 90 + rnd(i)) % 1); return <g key={i} transform={`translate(${80 + rnd(i + 3) * 340 + 30 * Math.sin(p * 6 + i)},${760 + p * 440}) rotate(${p * 400})`} opacity={seasons.petals}><Flower s={0.9} c={i % 2 ? "#F6CFCB" : "#FCE4DA"} /></g>; })}
        </WindowSky>
        <Curtain x={80} y={730} h={480} side={1} f={f} amp={0.4} color="#D9CDEB" />
        <Frames x={1320} y={820} warm={h} />
        {/* the shadow, cast by the lamp onto the wall */}
        <g transform={`translate(${shX} ${GROUND}) scale(${shScale}) translate(${-sx} ${-GROUND})`} opacity={0.3 + 0.1 * grow} filter="url(#b4)">
          <g transform={`translate(${sx} ${GROUND}) scale(${SCALE}) translate(${-sx} ${-GROUND})`}><Body r={srig} fill="#7E6E9A" back="#7E6E9A" /></g>
        </g>
        {grow > 0.3 && Array.from({ length: 8 }, (_, i) => <circle key={i} cx={shX - 60 + rnd(i) * 300} cy={1100 - ((f * 1.2 + rnd(i + 2) * 300) % 360)} r={4} fill="#FFFFFF" opacity={0.5 * grow} />)}
        <Rug x={760} w={560} />
        <Lamp x={LAMP} on={1} h={380} />
        <Table x={DESK} w={300} />
        {/* the growing stack of written pages */}
        {Array.from({ length: closed ? 0 : pages }, (_, k) => <rect key={k} x={DESK + 30 + (k % 2) * 3} y={TABLE_Y - 6 - k * 4} width={80} height={5} rx={1} fill={k % 2 ? "#FFFDF8" : "#F6EEE2"} stroke="#E7D7C3" strokeWidth={0.6} />)}
        <rect x={DESK - 110} y={TABLE_Y - 4} width={90} height={6} rx={2} fill="#FFFDF8" opacity={closed ? 0 : 1} />
        <Chair x={CHAIR} back={-1} c="#C9B6DA" />
        <Plant x={1180} s={1.2} perk={h} f={f} bloom={seasons.sun} />
        <Soul c={c} f={f} light={0.3 + 0.7 * h} />
        {closed && <g transform={`translate(${lerp(hp.x + 10, ch.x + 20, hug)},${lerp(hp.y - 10, ch.y + 8, hug)}) scale(${lerp(0.9, 0.8, hug)})`}><Book glow={0.4 + 0.6 * h} /></g>}
      </g>
      {(() => { const l = toScreen(LAMP, 1180); return <GodRays f={f} amt={0.25} x={l.x} y={l.y} angle={100} spread={70} color="#FFE7BE" />; })()}
    </g>
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <ColorWash f={f} amt={0.4} a="rgba(220,200,255,0.45)" b="rgba(255,210,190,0.45)" />
    <LightLeak f={f} amt={0.4 * Math.sin(Math.PI * seg01(f, T.shadow, T.cheer + 70))} side="right" tint="rose" />
    <Block f={f} from={0} to={T.s4 - 30}>
      <div><Word f={f} at={1}>I</Word><Word f={f} at={8}>started</Word><Word f={f} at={16}>this</Word><Word f={f} at={24} last>book</Word></div>
      <div><Word f={f} at={T.s1 + 4}>as</Word><Word f={f} at={T.s1 + 14}>one</Word><Word f={f} at={T.s1 + 26} last>person,</Word></div>
    </Block>
    <Block f={f} from={T.s4 - 6} to={WIPE - 4}>
      <div><Word f={f} at={T.s4}>and</Word><Word f={f} at={T.close}>finished</Word><Word f={f} at={T.stand}>it</Word><Word f={f} at={T.hug} last>as</Word></div>
      <div><Key f={f} at={T.see - 6}>another.</Key></div>
    </Block>
    <EndCard f={f} wipe={WIPE} card={CARD} />
  </AbsoluteFill>
);

export const Soul1027: React.FC = () => { const f = useCurrentFrame(); return <Frame world={<World f={f} />} overlay={<Overlay f={f} />} audio="r1027.wav" />; };
export const BEATS = { ...T, END, WIPE, CARD };
void col;
