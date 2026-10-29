// Sitting Soul 02 — "Don't shrink yourself because someone can't see your worth." · palette: Sage · action: a big proud stretch, standing tall in its seat
import React from "react";
import { ease, lerp, LOOP, Mark, PALETTES, seg, SittingSoul, SoulState, TAU } from "./SittingSoul";

const P = PALETTES.sage, SIZE = 76;
const PAGE_TOP = 540, PAGE_BOTTOM = 1260, SOUL_X = 770;
type V = { x: number; y: number };
const REST: [V, V] = [{ x: -100, y: -12 }, { x: 100, y: -12 }];
const BLINKS = [40, 352, 410];
const UP: [V, V] = [{ x: -142, y: -136 }, { x: 142, y: -136 }]; // arms open wide and up, a proud big stretch
const Spark: React.FC<{ x: number; y: number; s: number; o: number; c: string }> = ({ x, y, s, o, c }) => (
  <path d="M0,-10 C1.5,-2 2,-1.5 10,0 C2,1.5 1.5,2 0,10 C-1.5,2 -2,1.5 -10,0 C-2,-1.5 -1.5,-2 0,-10 Z" transform={`translate(${x} ${y}) scale(${s})`} fill={c} opacity={o} />
);
const scene = (f: number) => {
  const breath = Math.sin((TAU * f) / 150), legPh = (TAU * f) / 90;
  const blink = BLINKS.reduce((m, b) => { const d = f - b; return d >= 0 && d < 7 ? Math.min(m, Math.abs(d - 3) / 3.5) : m; }, 1);
  // anticipation dip → big stretch up → hold (gentle sway) → a last little reach → arms come down with a soft overshoot
  const dip = Math.sin(Math.PI * seg(f, 62, 84));
  const up = ease(seg(f, 80, 116)) * (1 - ease(seg(f, 262, 300)));
  const extra = Math.sin(Math.PI * seg(f, 206, 236));
  const over = Math.sin(Math.PI * seg(f, 292, 318));
  const stretch = -0.05 * dip + 0.1 * up + 0.025 * extra - 0.03 * over;
  const sway = 2.5 * Math.sin((TAU * (f - 116)) / 70) * ease(seg(f, 116, 136)) * (1 - ease(seg(f, 246, 266)));
  const lean = sway;
  const sy = 1 + stretch, k = Math.tan((-lean * Math.PI) / 180);
  const toBody = (v: V): V => ({ x: v.x - v.y * k, y: v.y / sy }); // undo shear, then the stretch
  const lift = (i: number): V => {
    const r = REST[i], u = UP[i];
    const v = { x: lerp(r.x, u.x, up) + (i ? 1 : -1) * 8 * extra, y: lerp(r.y, u.y, up) - 10 * Math.sin(Math.PI * up) - 10 * extra };
    return { x: v.x - (i ? 1 : -1) * 6 * dip, y: v.y + 8 * dip };
  };
  const joy = ease(seg(f, 96, 112)) * (1 - ease(seg(f, 270, 290)));
  const smile = ease(seg(f, 290, 310)) * (1 - ease(seg(f, 360, 390))) * 0.4;
  const soul: SoulState = { lean, breath, blink, look: { x: 0, y: -3 * up }, joy: Math.max(joy, smile), legPh, hands: [toBody(lift(0)), toBody(lift(1))], stretch };
  const sp = ease(seg(f, 120, 140)) * (1 - ease(seg(f, 250, 272)));
  const sparks = sp > 0.01 ? [[-150, -230, 0], [160, -210, 1.7], [-90, -300, 3.1], [100, -296, 4.4], [0, -320, 5.3]].map(([x, y, ph], i) => (
    <Spark key={i} x={SOUL_X + x} y={PAGE_BOTTOM + y + 6 * Math.sin(f / 10 + ph)} s={0.8 + 0.5 * Math.abs(Math.sin(f / 14 + ph))} o={sp * (0.55 + 0.45 * Math.sin(f / 9 + ph))} c={i % 2 ? "#FFFFFF" : P.deep} />
  )) : null;
  return { soul, above: <g>{sparks}</g> };
};

export const SitSoul02: React.FC = () => (
  <SittingSoul palette={P} size={SIZE} pageTop={PAGE_TOP} pageBottom={PAGE_BOTTOM} soulX={SOUL_X} scene={scene}
    lines={[<>Don’t shrink yourself</>, <>because someone can’t see your <Mark p={P} size={SIZE}>worth.</Mark></>]} />
);
export const SIT02_END = LOOP;
