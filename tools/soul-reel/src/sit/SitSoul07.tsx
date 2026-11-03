// Sitting Soul 07 — "Life isn't a race…" · palette: Blush · action: slowly sipping chai from a tiny kulhad
import React from "react";
import { ease, lerp, LOOP, Mark, PALETTES, seg, SittingSoul, SoulState, TAU } from "./SittingSoul";

const P = PALETTES.blush, SIZE = 62;
const PAGE_TOP = 560, PAGE_BOTTOM = 1300, SOUL_X = 740;
type V = { x: number; y: number };
const REST: [V, V] = [{ x: -100, y: -12 }, { x: 100, y: -12 }];
const BLINKS = [36, 110, 330, 410];
const CUP_REST: V = { x: -156, y: 0 }, CUP_SIP: V = { x: -44, y: -50 }, CUP_HOLD: V = { x: -30, y: -26 };
const unshear = (v: V, lean: number): V => ({ x: v.x - v.y * Math.tan((-lean * Math.PI) / 180), y: v.y });
const arc = (a: V, b: V, t: number, lift: number): V => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) - lift * Math.sin(Math.PI * t) });

// kulhad drawn with its base centre at (0,0)
const Kulhad: React.FC<{ x: number; y: number; tilt: number }> = ({ x, y, tilt }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt} 0 -18)`}>
    <path d="M-20,-40 L20,-40 L15,0 L-15,0 Z" fill="#C97B57" />
    <path d="M-20,-40 L20,-40 L19,-34 L-19,-34 Z" fill="#D9906B" />
    <ellipse cx={0} cy={-40} rx={20} ry={5} fill="#B9693F" />
    <ellipse cx={0} cy={-39} rx={16} ry={3.6} fill="#C8925E" />
    <path d="M-12,-28 L-10,-6" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.22} />
  </g>
);
const rotV = (v: V, deg: number): V => { const a = (deg * Math.PI) / 180; return { x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a) }; };

const scene = (f: number) => {
  const breath = Math.sin((TAU * f) / 150), legPh = (TAU * f) / 90;
  const blink = BLINKS.reduce((m, b) => { const d = f - b; return d >= 0 && d < 7 ? Math.min(m, Math.abs(d - 3) / 3.5) : m; }, 1);
  let lean = -2 * ease(seg(f, 60, 74));
  if (f >= 74) lean = lerp(-2, 2.5, ease(seg(f, 74, 86)));
  if (f >= 86) lean = lerp(2.5, -10, ease(seg(f, 86, 106)));
  if (f >= 106) lean = lerp(-10, 1.5, ease(seg(f, 106, 136)));
  if (f >= 136) lean = lerp(1.5, 0, ease(seg(f, 136, 150))) - 1.5 * Math.sin(Math.PI * seg(f, 172, 196));
  if (f >= 252) lean = lerp(0, -10, ease(seg(f, 252, 276)));
  if (f >= 292) lean = lerp(-10, 0, ease(seg(f, 292, 318)));
  // the cup: rest → sip → a little lower (sigh) → sip again → held close → set back down
  let cup: V = CUP_REST, held = false;
  if (f >= 106 && f < 136) { cup = arc(CUP_REST, CUP_SIP, ease(seg(f, 106, 136)), 30); held = true; }
  else if (f >= 136 && f < 252) {
    held = true;
    const down = ease(seg(f, 168, 182)) * (1 - ease(seg(f, 186, 198))) + ease(seg(f, 222, 236));
    cup = { x: lerp(CUP_SIP.x, CUP_HOLD.x, Math.min(1, down)), y: lerp(CUP_SIP.y, CUP_HOLD.y, Math.min(1, down)) };
  } else if (f >= 252 && f < 284) { cup = arc({ x: CUP_HOLD.x, y: CUP_HOLD.y }, CUP_REST, ease(seg(f, 252, 282)), 24); held = true; }
  const sip = Math.sin(Math.PI * seg(f, 140, 168)) + Math.sin(Math.PI * seg(f, 196, 220));
  const tilt = 28 * Math.min(1, sip);
  const grip = (c: V): V => { const g = rotV({ x: -14, y: -16 }, tilt); return { x: c.x + g.x, y: c.y + g.y + 6 }; };
  let h0: V = REST[0];
  if (f >= 88 && f < 106) h0 = arc(REST[0], grip(CUP_REST), ease(seg(f, 88, 106)), 14);
  if (held) h0 = grip(cup);
  if (f >= 284) h0 = arc(grip(CUP_REST), REST[0], ease(seg(f, 286, 312)), 12);
  // the other hand comes to cradle the cup while it's held close
  const cradle = ease(seg(f, 226, 240)) * (1 - ease(seg(f, 248, 258)));
  const h1: V = { x: lerp(REST[1].x, cup.x + 22, cradle), y: lerp(REST[1].y, cup.y - 10, cradle) };
  const savor = Math.max(ease(seg(f, 138, 148)) * (1 - ease(seg(f, 166, 176))), ease(seg(f, 194, 204)) * (1 - ease(seg(f, 218, 228))));
  const content = 0.55 * ease(seg(f, 176, 186)) * (1 - ease(seg(f, 190, 196))) + 0.6 * ease(seg(f, 230, 240)) * (1 - ease(seg(f, 262, 276)));
  const watch = ease(seg(f, 60, 72)) * (1 - ease(seg(f, 134, 142))) + ease(seg(f, 250, 258)) * (1 - ease(seg(f, 300, 320)));
  const soul: SoulState = { lean, breath, blink, legPh, stretch: -0.03 * Math.sin(Math.PI * seg(f, 172, 196)),
    joy: Math.max(savor, content), look: { x: -5 * watch, y: 3 * watch }, hands: [unshear(h0, lean), unshear(h1, lean)] };
  const k = Math.tan((-lean * Math.PI) / 180);
  const W2 = (v: V) => ({ x: SOUL_X + v.x, y: PAGE_BOTTOM + v.y });
  const cw = held ? W2({ x: cup.x - cup.y * k, y: cup.y }) : W2(CUP_REST);
  // steam: always rising softly, a little stronger while it's held close
  const steamOn = 0.55 + 0.45 * (held ? 1 : 0);
  const steam = [0, 1, 2].map((j) => { const p = ((f / 70 + j / 3) % 1);
    const x0 = cw.x - 8 + 8 * j, y0 = cw.y - 46 - 70 * p;
    return <path key={j} d={`M${x0},${y0 + 20} c-8,-8 8,-14 0,-22 c-6,-6 6,-12 0,-18`} stroke="#FFFFFF" strokeWidth={3.4} fill="none" strokeLinecap="round" opacity={steamOn * 0.85 * Math.sin(Math.PI * p) * (1 - 0.8 * Math.min(1, sip))} />; });
  return {
    soul,
    onPage: !held ? <Kulhad x={cw.x} y={cw.y} tilt={0} /> : undefined,
    above: <g>{held && <Kulhad x={cw.x} y={cw.y} tilt={tilt} />}{steam}</g>,
  };
};

export const SitSoul07: React.FC = () => (
  <SittingSoul palette={P} size={SIZE} pageTop={PAGE_TOP} pageBottom={PAGE_BOTTOM} soulX={SOUL_X} scene={scene}
    lines={[<>Life isn’t a race.</>, <>It’s a road,<br />and you deserve to walk it<br />at your <Mark p={P} size={SIZE}>own pace.</Mark></>]} />
);
export const SIT07_END = LOOP;
