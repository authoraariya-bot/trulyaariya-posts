// 25 Oct · "The song you play when no one's home… loud, off-key, a little teary… that's healing too."
// Meaning: singing your heart out alone at home, badly and through tears, is itself a way of healing.
// Beats: dusk, rain on the window; the soul sits on its chair folding laundry (a little flat, not sad) → stands, crosses
// the room, presses PLAY on a little tape recorder: reels spin, notes float out → picks up a hairbrush and sings into it,
// swaying; notes wobble off-key, a tear, then a laugh → the notes drift up and light the fairy lights one by one, the rain
// clears to a golden sunset, it twirls (healing).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { makeStory, seg01, smoother, sstep, lerp, Pose } from "../kit/choreo";
import { Soul, handOf, headPt, rnd, col } from "../kit/Land";
import { scaledPt } from "../kit/choreo";
import { RoomShell, WindowSky, Curtain, FairyLights, Table, Chair, Lamp, Plant, Rug, TapeRecorder, Hairbrush, Basket, FoldedStack, Shelf, Defs, Frames, TABLE_Y, FLOOR } from "../kit/Room";
import { Rain, LightLeak, GodRays, ColorWash } from "../kit/fx";
import { Block, Word, Key, EndCard } from "../kit/Words";
import { Frame } from "../kit/Frame";

export const END = 630; const WIPE = 530, CARD = 548;
const T = { stand: 96, walk: 110, arrive: 200, reach: 204, play: 222, brush: 250, sing: 272, offkey: 300, tear: 330, laugh: 360, lights: 390, spin: 404, cheer: 446 };
const CHAIR = 330, TX = 1420, SX = 1240, BRUSH = { x: 1322, y: TABLE_Y - 8 }; const Z = 1.32;
const sitFold: Pose = { lean: 10, head: 26, th: [88, 92], sh: [2, -2], ua: [30, 38], fa: [86, 96] };
const press: Pose = { lean: 18, head: 22, th: [0, 0], sh: [0, 0], ua: [20, 74], fa: [30, 104] };
const singBrush: Pose = { lean: -2, head: -10, th: [0, 0], sh: [0, 0], ua: [14, 38], fa: [26, 118] }; // grips the 'mic' at chest height
const cheerMic: Pose = { lean: -5, head: -16, th: [0, 0], sh: [0, 0], ua: [128, 112], fa: [150, 124] }; // mic raised up and forward
const c = makeStory({
  end: END, x0: CHAIR,
  keys: [
    { f: 0, pose: sitFold }, { f: T.stand, pose: "stand", blend: 28 }, { f: T.reach, pose: press, blend: 18 }, { f: T.play + 8, pose: "stand", blend: 16 },
    { f: T.brush, pose: press, blend: 14 }, { f: T.brush + 18, pose: singBrush, blend: 18 }, { f: T.spin, pose: "stand", blend: 14 }, { f: T.cheer, pose: cheerMic, blend: 24 },
  ],
  walks: [{ from: T.walk, to: T.arrive, x0: CHAIR, x1: SX }],
  mood: [[0, 0.34], [T.stand, 0.4], [T.play + 10, 0.62], [T.sing + 20, 0.86], [T.tear, 0.42], [T.tear + 26, 0.5], [T.laugh + 6, 0.92], [T.lights + 20, 1]],
  heal: [[0, 0.06], [T.play, 0.2], [T.sing + 30, 0.4], [T.lights, 0.55], [T.lights + 50, 1]],
  mod: (f, p) => {
    // folding laundry: hands meet and part
    const fold = 1 - sstep(seg01(f, T.stand - 10, T.stand + 6));
    const w = Math.sin(f / 7);
    let q = fold > 0 ? { ...p, ua: [p.ua[0] + 10 * w * fold, p.ua[1] - 10 * w * fold] as [number, number], fa: [p.fa[0] + 18 * w * fold, p.fa[1] - 18 * w * fold] as [number, number] } : p;
    // singing: swaying with the music
    const sway = sstep(seg01(f, T.sing, T.sing + 20)) * (1 - sstep(seg01(f, T.spin - 14, T.spin)));
    if (sway > 0) { const s = Math.sin((f - T.sing) / 10); q = { ...q, lean: q.lean + 7 * s * sway, head: q.head - 10 * s * sway, ua: [q.ua[0] + 16 * s * sway, q.ua[1] + 4 * s * sway] as [number, number] }; }
    return q;
  },
});
// camera: a closer, cosy framing that follows the soul (world x at screen centre)
const focus = (f: number) => Math.min(1500, Math.max(470, c.xAt(f) + 70));
const toScreen = (f: number, x: number, y: number) => ({ x: (x - focus(f)) * Z + 540, y: (y - 1540) * Z + 1600 });

const Note: React.FC<{ x: number; y: number; s: number; r: number; o: number; fill: string }> = ({ x, y, s, r, o, fill }) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={16} ry={22} fill="#FFE2B0" opacity={0.55} filter="url(#b4)" />
    <ellipse cx={0} cy={0} rx={9} ry={6.5} fill={fill} transform="rotate(-22)" />
    <path d="M8,-2 L8,-32 Q16,-26 20,-18" stroke={fill} strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);
// notes leave the speaker; from the light-up beat each one flies to a fairy-light bulb
const NOTES = Array.from({ length: 26 }, (_, i) => (i < 6 ? T.play + 6 + i * 9 : T.sing + (i - 6) * 7));
const BULB = (k: number) => { const n = 16, x0 = 60, x1 = 1900, u = k / (n - 1); return { x: x0 + (x1 - x0) * u, y: 820 + 50 * Math.sin(Math.PI * u) + 8 }; };

const World: React.FC<{ f: number }> = ({ f }) => {
  const h = c.healAt(f); const fc = focus(f);
  const play = sstep(seg01(f, T.play - 2, T.play + 4));
  const warm = sstep(seg01(f, T.lights, T.lights + 60));
  const rain = 1 - sstep(seg01(f, T.laugh, T.lights + 30));
  const lightsOn = seg01(f, T.lights, T.lights + 40);
  const held = f >= T.brush + 10;
  const hand = handOf(c, f, 1), head = headPt(c, f);
  // held like a microphone, gripped by the handle: while singing the bristle head sits just in front of its mouth;
  // at the end it is raised up and forward along the arm (never over the face or head)
  const rig = c.rigAt(f), elbow = scaledPt(rig.arms[1].el, c.xAt(f));
  const fl = Math.hypot(hand.x - elbow.x, hand.y - elbow.y) || 1;
  const atMouth = { x: head.x + 100, y: head.y + 40 };
  const alongArm = { x: hand.x + ((hand.x - elbow.x) / fl) * 66, y: hand.y + ((hand.y - elbow.y) / fl) * 66 };
  const up = smoother(seg01(f, T.spin + 10, T.cheer + 10));
  const H = { x: lerp(atMouth.x, alongArm.x, up), y: lerp(atMouth.y, alongArm.y, up) };
  const th = Math.atan2(hand.y - H.y, hand.x - H.x);
  const brush = held ? { x: hand.x - 40 * Math.cos(th), y: hand.y - 40 * Math.sin(th), r: (th * 180) / Math.PI } : { ...BRUSH, r: 0 };
  // spin: the soul turns on the spot (horizontal squash through a full turn)
  const spin = seg01(f, T.spin, T.spin + 40); const sx = c.xAt(f);
  const turn = Math.cos(smoother(spin) * Math.PI * 2);
  const notes = NOTES.map((b, i) => {
    const age = f - b; if (age < 0) return null;
    const x0 = TX + 70, y0 = TABLE_Y - 90;
    const toBulb = smoother(seg01(f, T.lights + i * 1.4 - 6, T.lights + i * 1.4 + 24));
    const off = sstep(seg01(f, T.offkey, T.offkey + 10)) * (1 - sstep(seg01(f, T.tear - 6, T.tear + 10)));
    const fx = x0 - (40 + 420 * rnd(i)) * Math.min(1, age / 150) + 30 * Math.sin(age / 14 + i);
    const fy = y0 - (80 + 300 * rnd(i + 4)) * Math.min(1, age / 130);
    const bk = BULB((i * 5) % 16);
    const x = lerp(fx, bk.x, toBulb), y = lerp(fy, bk.y, toBulb);
    const o = Math.min(1, age / 10) * (1 - toBulb);
    return <Note key={i} x={x} y={y} s={0.9 + 0.4 * rnd(i + 2)} r={-12 + 24 * rnd(i + 1) + off * 26 * Math.sin(age / 2.2 + i)} o={o} fill={col(off, "#C9973F", "#A9958A")} />;
  });
  const tp = seg01(f, T.tear + 6, T.tear + 44);
  return (
    <g>
      <Defs />
      <g transform={`translate(540 1600) scale(${Z}) translate(${-fc} -1540)`}>
        <RoomShell warm={0.25 + 0.75 * h} width={2100} wall={["#F1DCE4", "#FCE9D9"]} />
        <Frames x={930} y={880} warm={0.3 + 0.7 * h} />

        <WindowSky id="w25a" x={80} y={800} w={330} h={400} warm={warm} f={f} night={0.25 * (1 - warm)}>
          <Rain f={f} amt={rain} wind={4} ground={1220} count={80} />
        </WindowSky>
        <WindowSky id="w25b" x={1290} y={720} w={470} h={500} warm={warm} f={f} night={0.25 * (1 - warm)}>
          <Rain f={f} amt={rain} wind={4} ground={1240} count={110} />
        </WindowSky>
        <Curtain x={1290} y={690} h={570} side={1} f={f} amp={0.3 + 0.7 * warm} color={col(h, "#D9CBD3", "#F4C9C1")} />
        <Curtain x={1760} y={690} h={570} side={-1} f={f + 20} amp={0.3 + 0.7 * warm} color={col(h, "#D9CBD3", "#F4C9C1")} />
        <FairyLights x0={60} x1={1900} y={820} sag={50} on={lightsOn} f={f} n={16} />
        <Shelf x={860} y={1060} f={f} perk={h} />
        <Rug x={800} w={620} />
        <Lamp x={700} on={0.3 + 0.7 * h} h={400} />
        <Basket x={150} fill={1 - 0.6 * seg01(f, 0, T.stand)} />
        <Table x={520} w={150} h={120} />
        <FoldedStack x={520} y={FLOOR - 120} n={2 + 3 * seg01(f, 0, T.stand)} />
        <Chair x={CHAIR} back={-1} />
        <Table x={TX} w={330} />
        <TapeRecorder x={TX + 20} y={TABLE_Y} play={play} f={f} />
        {!held && <Hairbrush x={brush.x} y={brush.y} r={brush.r} />}
        <Plant x={1880} s={1.4} perk={h} f={f} bloom={warm} />
        <g transform={`translate(${sx} 0) scale(${turn} 1) translate(${-sx} 0)`}>
          <Soul c={c} f={f} />
          {held && <Hairbrush x={brush.x} y={brush.y} r={brush.r} />}
        </g>
        {f < T.stand && (() => { const a = handOf(c, f, 0), b = handOf(c, f, 1); return <path d={`M${a.x},${a.y} Q${(a.x + b.x) / 2},${(a.y + b.y) / 2 + 26} ${b.x},${b.y} L${b.x},${b.y + 30} Q${(a.x + b.x) / 2},${(a.y + b.y) / 2 + 60} ${a.x},${a.y + 30} Z`} fill="#C9D9EE" />; })()}
        {tp > 0 && tp < 1 && <path d="M0,-7 C4,-2 5,3 0,7 C-5,3 -4,-2 0,-7 Z" transform={`translate(${head.x + 2},${head.y + 10 + 60 * tp}) scale(1.6)`} fill="#9CCBE6" opacity={Math.sin(tp * Math.PI)} />}
        {notes}
      </g>
      {(() => { const w = toScreen(f, 1560, 900); return <GodRays f={f} amt={0.6 * warm} x={w.x} y={w.y} angle={235} spread={50} color="#FFE7BE" />; })()}
    </g>
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => {
  const warm = sstep(seg01(f, T.lights, T.lights + 60));
  return (
    <AbsoluteFill>
      <ColorWash f={f} amt={0.35 + 0.4 * warm} />
      <LightLeak f={f} amt={0.5 * Math.sin(Math.PI * seg01(f, T.lights - 10, T.cheer + 40))} side="left" />
      <Block f={f} from={0} to={T.walk + 12}>
        <div><Word f={f} at={1}>The</Word><Word f={f} at={8}>song</Word><Word f={f} at={15}>you</Word><Word f={f} at={22} last>play</Word></div>
        <div><Word f={f} at={40}>when</Word><Word f={f} at={47}>no</Word><Word f={f} at={54}>one's</Word><Word f={f} at={62} last>home,</Word></div>
      </Block>
      <Block f={f} from={T.sing - 6} to={T.lights - 20}>
        <div><Word f={f} at={T.sing} last>loud,</Word></div>
        <div><Word f={f} at={T.offkey + 2} last><span style={{ display: "inline-block", rotate: `${3 * Math.sin(f / 2.5) * (f < T.tear ? 1 : 0)}deg` }}>off-key,</span></Word></div>
        <div><Word f={f} at={T.tear + 2}>a</Word><Word f={f} at={T.tear + 8}>little</Word><Word f={f} at={T.tear + 16} last><i>teary…</i></Word></div>
      </Block>
      <Block f={f} from={T.lights + 2} to={WIPE - 4}>
        <div><Word f={f} at={T.lights + 6} last>that's</Word></div>
        <div><Key f={f} at={T.spin + 10}>healing</Key><Word f={f} at={T.cheer} last style={{ marginLeft: "0.2em" }}>too.</Word></div>
      </Block>
      <EndCard f={f} wipe={WIPE} card={CARD} />
    </AbsoluteFill>
  );
};

export const Soul1025: React.FC = () => { const f = useCurrentFrame(); return <Frame world={<World f={f} />} overlay={<Overlay f={f} />} audio="r1025.wav" />; };
export const BEATS = { ...T, END, WIPE, CARD };
