// Sitting Soul 04 — "Then: one text left on seen…" · palette: Butter · action: resting its head on a tiny pillow (goodnight)
import React from "react";
import { ease, lerp, LOOP, Mark, PALETTES, seg, SittingSoul, SoulState, TAU } from "./SittingSoul";

const P = PALETTES.butter, SIZE = 52;
const PAGE_TOP = 410, PAGE_BOTTOM = 1330, SOUL_X = 700;
type V = { x: number; y: number };
const REST: [V, V] = [{ x: -100, y: -12 }, { x: 100, y: -12 }];
const BLINKS = [36, 120, 350, 420];
const PILLOW_REST: V = { x: 150, y: -21 }, PILLOW_UP: V = { x: 118, y: -126 }, PHONE: V = { x: -158, y: -7 };
const unshear = (v: V, lean: number): V => ({ x: v.x - v.y * Math.tan((-lean * Math.PI) / 180), y: v.y });
const arc = (a: V, b: V, t: number, lift: number): V => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) - lift * Math.sin(Math.PI * t) });

const Pillow: React.FC<{ x: number; y: number; r: number; squish: number }> = ({ x, y, r, squish }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${1 + 0.06 * squish} ${1 - 0.1 * squish})`}>
    <path d="M-42,-14 C-44,-24 -30,-26 0,-24 C30,-26 44,-24 42,-14 C46,0 46,8 42,16 C44,26 30,26 0,24 C-30,26 -44,26 -42,16 C-46,8 -46,0 -42,-14 Z" fill="#FFF8EC" />
    <path d="M-42,-14 C-44,-24 -30,-26 0,-24 C30,-26 44,-24 42,-14 C46,0 46,8 42,16 C44,26 30,26 0,24 C-30,26 -44,26 -42,16 C-46,8 -46,0 -42,-14 Z" fill="none" stroke="#E9D79E" strokeWidth={3} />
    <path d="M-30,4 C-12,10 12,10 30,4" stroke="#E9D79E" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.8} />
  </g>
);
const Phone: React.FC<{ x: number; y: number; glow: number }> = ({ x, y, glow }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-26} y={-7} width={52} height={14} rx={5} fill="#6B5622" opacity={0.85} />
    <rect x={-22} y={-4.5} width={44} height={9} rx={3} fill={glow > 0.05 ? "#FFF6D6" : "#8C7638"} opacity={0.4 + 0.6 * glow} />
    {glow > 0.05 && <g opacity={glow}><path d="M-6,0 L-2,3 L5,-4" stroke="#9A7A2C" strokeWidth={2} fill="none" strokeLinecap="round" /><path d="M1,0 L5,3 L12,-4" stroke="#9A7A2C" strokeWidth={2} fill="none" strokeLinecap="round" /></g>}
  </g>
);

const scene = (f: number) => {
  const breath = Math.sin((TAU * f) / 150), legPh = (TAU * f) / 90;
  const sleep = ease(seg(f, 176, 192)) * (1 - ease(seg(f, 300, 314)));
  const blink = BLINKS.reduce((m, b) => { const d = f - b; return d >= 0 && d < 7 ? Math.min(m, Math.abs(d - 3) / 3.5) : m; }, 1);
  // glance at the phone → calm smile → small wind-up → pillow up → lean onto it and sleep → wake, sit up → pillow back down
  let lean = -2 * ease(seg(f, 40, 60)) * (1 - ease(seg(f, 100, 112)));
  if (f >= 112) lean = lerp(0, -3, ease(seg(f, 112, 122)));
  if (f >= 122) lean = lerp(-3, 2, ease(seg(f, 122, 140)));
  if (f >= 150) lean = lerp(2, 15, ease(seg(f, 150, 180))) + 1.2 * Math.sin((TAU * (f - 180)) / 75) * sleep;
  if (f >= 304) lean = lerp(15, -1.5, ease(seg(f, 304, 330)));
  if (f >= 330) lean = lerp(-1.5, 0, ease(seg(f, 330, 344)));
  const up = ease(seg(f, 126, 158)) * (1 - ease(seg(f, 334, 362)));
  const pillow = arc(PILLOW_REST, PILLOW_UP, up, 24 * (f < 200 ? 1 : 0.4));
  const held = f >= 120 && f < 370;
  let h1: V = REST[1];
  if (f >= 112 && f < 126) h1 = arc(REST[1], { x: PILLOW_REST.x - 18, y: PILLOW_REST.y + 8 }, ease(seg(f, 112, 126)), 12);
  if (held) h1 = { x: pillow.x - 26 + 14 * up, y: pillow.y + 18 + 22 * up };
  if (f >= 362) h1 = arc({ x: PILLOW_REST.x - 18, y: PILLOW_REST.y + 8 }, REST[1], ease(seg(f, 362, 384)), 12);
  // the other hand comes up to rest under the cheek side while it sleeps
  const h0: V = { x: lerp(REST[0].x, -40, sleep), y: lerp(REST[0].y, -40, sleep) };
  const watch = ease(seg(f, 40, 56)) * (1 - ease(seg(f, 96, 112)));
  const soul: SoulState = {
    lean, breath: breath * (1 - 0.5 * sleep) + 1.6 * Math.sin((TAU * f) / 75) * sleep, legPh: legPh,
    blink: blink * (1 - sleep) + 0.02 * sleep, look: { x: -5 * watch + 3 * ease(seg(f, 118, 134)) * (1 - ease(seg(f, 150, 170))), y: 2 * watch },
    joy: Math.max(0.35 * ease(seg(f, 76, 92)) * (1 - ease(seg(f, 120, 140))), sleep * 0.0), hands: [unshear(h0, lean), unshear(h1, lean)],
  };
  const glow = Math.sin(Math.PI * seg(f, 26, 86));
  const W2 = (v: V) => ({ x: SOUL_X + v.x, y: PAGE_BOTTOM + v.y });
  const pw = W2(pillow);
  const zz = sleep > 0.02 ? [0, 1, 2].map((k) => { const p = (((f - 186) / 50 + k / 3) % 1 + 1) % 1; return (
    <text key={k} x={SOUL_X + 70 + 40 * p + 8 * k} y={PAGE_BOTTOM - 250 - 70 * p} fontFamily="Caveat" fontWeight={700} fontSize={30 + 14 * p} fill={P.deep} opacity={sleep * Math.sin(Math.PI * p)}>z</text>); }) : null;
  // eyes closed while asleep: draw soft closed-eye lines on top
  const sh = Math.tan((-lean * Math.PI) / 180);
  const eyes = sleep > 0.02 ? [-32, 32].map((x) => { const y = -96; const wx = SOUL_X + x - y * sh * -1 * -1; return (
    <path key={x} d={`M${wx - 9},${PAGE_BOTTOM + y} Q${wx},${PAGE_BOTTOM + y + 7} ${wx + 9},${PAGE_BOTTOM + y}`} stroke="#3E2F2B" strokeWidth={4} fill="none" strokeLinecap="round" opacity={sleep} />); }) : null;
  void eyes;
  return {
    soul,
    onPage: <g><Phone x={W2(PHONE).x} y={W2(PHONE).y} glow={glow} />{!held && <Pillow x={W2(PILLOW_REST).x} y={W2(PILLOW_REST).y} r={0} squish={0} />}</g>,
    above: <g>{held && <Pillow x={pw.x} y={pw.y} r={78 * up} squish={sleep} />}{zz}</g>,
  };
};

export const SitSoul04: React.FC = () => (
  <SittingSoul palette={P} size={SIZE} pageTop={PAGE_TOP} pageBottom={PAGE_BOTTOM} soulX={SOUL_X} scene={scene}
    lines={[<>Then: one text left on “seen.”<br />Twenty theories. Zero sleep.</>, <>Now: one text left on “seen.”<br />“They’re probably busy.” Goodnight.</>, <>Same text. <Mark p={P} size={SIZE}>Softer</Mark> you.</>]} />
);
export const SIT04_END = LOOP;
