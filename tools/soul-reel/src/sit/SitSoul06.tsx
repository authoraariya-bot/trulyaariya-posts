// Sitting Soul 06 — "Don't teach your soul to settle for what suffocates it. Let it breathe." · palette: Peach · action: blowing a dandelion
import React from "react";
import { clamp01, ease, lerp, LOOP, Mark, PALETTES, seg, SittingSoul, SoulState, TAU } from "./SittingSoul";

const P = PALETTES.peach, SIZE = 74;
const PAGE_TOP = 520, PAGE_BOTTOM = 1290, SOUL_X = 740;
type V = { x: number; y: number };
const REST: [V, V] = [{ x: -100, y: -12 }, { x: 100, y: -12 }];
const HOLD_LOW: V = { x: -106, y: -26 }, HOLD_UP: V = { x: -62, y: -14 };
const STEM = 84, BLINKS = [36, 300, 410];
const SEEDS = Array.from({ length: 18 }, (_, i) => ({ a: (i / 18) * TAU, t0: 134 + (i % 6) * 3 + Math.floor(i / 6), vx: -2.2 - ((i * 7) % 5) * 0.35, vy: -1.6 - ((i * 5) % 4) * 0.3, ph: i * 1.7 }));
const Seed: React.FC<{ x: number; y: number; r: number; o: number }> = ({ x, y, r, o }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(1.5)`} opacity={o}>
    <line x1={0} y1={0} x2={0} y2={-14} stroke="#C9A486" strokeWidth={1.3} />
    {[-50, -25, 0, 25, 50].map((a) => <line key={a} x1={0} y1={-14} x2={9 * Math.sin((a * Math.PI) / 180)} y2={-14 - 9 * Math.cos((a * Math.PI) / 180)} stroke="#D9A07C" strokeWidth={1.3} strokeLinecap="round" />)}
    <ellipse cx={0} cy={1} rx={1.6} ry={2.6} fill="#9C7A55" />
  </g>
);

const scene = (f: number) => {
  const breath = Math.sin((TAU * f) / 150), legPh = (TAU * f) / 90;
  const blink = BLINKS.reduce((m, b) => { const d = f - b; return d >= 0 && d < 7 ? Math.min(m, Math.abs(d - 3) / 3.5) : m; }, 1);
  const raise = ease(seg(f, 60, 90)) * (1 - ease(seg(f, 262, 296)));
  const inhale = ease(seg(f, 92, 126)) * (1 - ease(seg(f, 128, 136)));
  const blow = Math.sin(Math.PI * seg(f, 128, 160));
  const stretch = 0.065 * inhale - 0.045 * blow;
  let lean = 3 * inhale - 5 * blow + 2 * ease(seg(f, 168, 190)) * (1 - ease(seg(f, 262, 290)));
  const hand: V = { x: lerp(HOLD_LOW.x, HOLD_UP.x, raise), y: lerp(HOLD_LOW.y, HOLD_UP.y, raise) - 6 * blow };
  const head: V = { x: hand.x - 4, y: hand.y - STEM };
  // fluff: full → blown away → softly grows back before the loop
  const left = SEEDS.filter((s) => f < s.t0).length / SEEDS.length;
  const regrow = ease(seg(f, 330, 420));
  const fluff = f < 134 ? 1 : Math.max(left, regrow);
  const sy = 1 + stretch, k = Math.tan((-lean * Math.PI) / 180);
  const toBody = (v: V): V => ({ x: v.x - v.y * k, y: v.y / sy });
  // eyes: closed while breathing in and blowing, then follow the seeds up and away
  const joy = Math.max(ease(seg(f, 96, 110)) * (1 - ease(seg(f, 156, 168))), 0.55 * ease(seg(f, 200, 214)) * (1 - ease(seg(f, 270, 290))));
  const follow = ease(seg(f, 164, 186)) * (1 - ease(seg(f, 262, 286)));
  const soul: SoulState = { lean, breath, blink, legPh, joy, stretch, look: { x: -6 * follow - 3 * raise * (1 - follow), y: -4 * follow + 2 * raise * (1 - follow) },
    hands: [toBody(hand), toBody(REST[1])] };
  void lerp;
  const W2 = (v: V) => ({ x: SOUL_X + v.x, y: PAGE_BOTTOM + v.y });
  const hw = W2({ x: hand.x - hand.y * k, y: hand.y * sy }), hdw = W2({ x: head.x - head.y * k, y: head.y * sy });
  const dand = (
    <g>
      <path d={`M${hw.x},${hw.y} Q${hw.x - 6},${(hw.y + hdw.y) / 2} ${hdw.x},${hdw.y}`} stroke="#8DAF6E" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      {fluff > 0.02 && <circle cx={hdw.x} cy={hdw.y} r={36 * fluff} fill="#FFFFFF" opacity={0.75} stroke="#EDC2A6" strokeWidth={2} />}
      <circle cx={hdw.x} cy={hdw.y} r={6} fill="#B9946F" />
      {Array.from({ length: 22 }, (_, i) => { const a = (i / 22) * TAU, on = clamp01(fluff * 22 - i);
        return on > 0.01 && <line key={i} x1={hdw.x} y1={hdw.y} x2={hdw.x + 34 * Math.cos(a) * on} y2={hdw.y + 34 * Math.sin(a) * on} stroke="#E2A985" strokeWidth={2.2} strokeLinecap="round" opacity={0.95} />; })}
          </g>
  );
  const seeds = SEEDS.map((s, i) => {
    const age = f - s.t0; if (age < 0 || age > 170) return null;
    const x = hdw.x + 30 * Math.cos(s.a) + s.vx * age + 18 * Math.sin(age / 14 + s.ph);
    const y = hdw.y + 30 * Math.sin(s.a) + s.vy * age - 0.004 * age * age;
    return <Seed key={i} x={x} y={y} r={10 * Math.sin(age / 11 + s.ph)} o={Math.min(1, (170 - age) / 40)} />;
  });
  const mouth = W2({ x: 0 - (-60) * k, y: -60 * sy });
  const air = blow > 0.05 ? [0, 1, 2].map((j) => { const p = (((f - 128) / 12 + j / 3) % 1); return (
    <path key={j} d={`M${mouth.x - 26 - 30 * p},${mouth.y - 8 - 6 * j + 4 * p} q-10,-4 -20,0`} stroke="#FFFFFF" strokeWidth={3} fill="none" strokeLinecap="round" opacity={blow * (1 - p)} />); }) : null;
  return { soul, above: <g>{dand}{air}{seeds}</g> };
};

export const SitSoul06: React.FC = () => (
  <SittingSoul palette={P} size={SIZE} pageTop={PAGE_TOP} pageBottom={PAGE_BOTTOM} soulX={SOUL_X} scene={scene}
    lines={[<>Don’t teach your soul<br />to settle for what<br />suffocates it.</>, <>Let it <Mark p={P} size={SIZE}>breathe.</Mark></>]} />
);
export const SIT06_END = LOOP;
