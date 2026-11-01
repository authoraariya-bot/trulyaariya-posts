// Sitting Soul 05 — "The right people give you wings…" · palette: Sky · action: throwing a paper plane that loops around and glides back
import React from "react";
import { clamp01, ease, lerp, LOOP, Mark, PALETTES, seg, SittingSoul, SoulState, TAU } from "./SittingSoul";

const P = PALETTES.sky, SIZE = 64;
const PAGE_TOP = 440, PAGE_BOTTOM = 1300, SOUL_X = 720;
type V = { x: number; y: number };
const REST: [V, V] = [{ x: -100, y: -12 }, { x: 100, y: -12 }];
const BLINKS = [36, 140, 330, 420];
const PLANE_REST: V = { x: 160, y: -20 };
const unshear = (v: V, lean: number): V => ({ x: v.x - v.y * Math.tan((-lean * Math.PI) / 180), y: v.y });
const arc = (a: V, b: V, t: number, lift: number): V => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) - lift * Math.sin(Math.PI * t) });
// flight path (soul-local), Catmull-Rom through these points
const PATH: V[] = [{ x: 60, y: -178 }, { x: -10, y: -330 }, { x: -200, y: -450 }, { x: -420, y: -390 }, { x: -470, y: -250 }, { x: -340, y: -185 },
  { x: -130, y: -290 }, { x: 60, y: -320 }, { x: 175, y: -190 }, { x: 166, y: -60 }, PLANE_REST];
const cr = (p0: number, p1: number, p2: number, p3: number, t: number) => 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
const along = (u: number): V => {
  const n = PATH.length - 1, s = clamp01(u) * n, i = Math.min(n - 1, Math.floor(s)), t = s - i;
  const g = (k: number) => PATH[Math.max(0, Math.min(n, k))];
  return { x: cr(g(i - 1).x, g(i).x, g(i + 1).x, g(i + 2).x, t), y: cr(g(i - 1).y, g(i).y, g(i + 1).y, g(i + 2).y, t) };
};
const Plane: React.FC<{ x: number; y: number; ang: number; flip: boolean }> = ({ x, y, ang, flip }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang}) scale(1.7 ${flip ? -1.7 : 1.7})`}>
    <path d="M28,0 L-26,-10 L-16,0 L-26,12 Z" fill="#FFFFFF" stroke={P.ink} strokeWidth={2} strokeLinejoin="round" />
    <path d="M28,0 L-16,0 L-22,5" stroke={P.ink} strokeWidth={1.6} fill="none" strokeLinejoin="round" opacity={0.7} />
    <path d="M28,0 L-26,-10 L-14,-2 Z" fill="#E8F1F8" />
  </g>
);

const scene = (f: number) => {
  const breath = Math.sin((TAU * f) / 150), legPh = (TAU * f) / 90;
  const blink = BLINKS.reduce((m, b) => { const d = f - b; return d >= 0 && d < 7 ? Math.min(m, Math.abs(d - 3) / 3.5) : m; }, 1);
  // the plane: resting → picked up → wound back → thrown → flight loop → lands back where it was
  const RELEASE = 138, LAND = 372;
  const pickHold: V = { x: 92, y: -150 }, windBack: V = { x: 124, y: -128 };
  let plane: V = PLANE_REST, ang = 0, flip = false, flying = false;
  if (f >= 94 && f < 120) plane = arc(PLANE_REST, pickHold, ease(seg(f, 94, 118)), 26);
  if (f >= 120 && f < 132) plane = { x: lerp(pickHold.x, windBack.x, ease(seg(f, 120, 132))), y: lerp(pickHold.y, windBack.y, ease(seg(f, 120, 132))) };
  if (f >= 132 && f < RELEASE) plane = { x: lerp(windBack.x, PATH[0].x, ease(seg(f, 132, RELEASE))), y: lerp(windBack.y, PATH[0].y, ease(seg(f, 132, RELEASE))) };
  if (f >= 94 && f < RELEASE) ang = lerp(0, -28, ease(seg(f, 94, 118))) + 10 * ease(seg(f, 120, 132)) * (1 - ease(seg(f, 132, RELEASE)));
  if (f >= RELEASE && f < LAND) {
    flying = true;
    const u = ease(seg(f, RELEASE, LAND)) * 0.85 + seg(f, RELEASE, LAND) * 0.15;
    plane = along(u);
    const b = along(Math.min(1, u + 0.004)), a = along(Math.max(0, u - 0.004));
    const dx = b.x - a.x, dy = b.y - a.y;
    ang = (Math.atan2(dy, dx) * 180) / Math.PI; flip = dx < 0;
    if (flip) ang = ang - 180 * Math.sign(ang || 1) * 0 ; // keep nose forward; the mirror handles the belly
    ang += 6 * Math.sin((TAU * f) / 40);
  }
  if (f >= LAND - 18 && f < LAND) ang = lerp(ang, 0, ease(seg(f, LAND - 18, LAND)));
  // body
  let lean = 2 * ease(seg(f, 60, 76)) * (1 - ease(seg(f, 110, 120)));
  if (f >= 120) lean = lerp(0, 5, ease(seg(f, 120, 132)));
  if (f >= 132) lean = lerp(5, -6, ease(seg(f, 132, 142)));
  if (f >= 142) lean = lerp(-6, 0, ease(seg(f, 142, 168)));
  // right hand (screen right) picks, holds, throws, then rests
  let h1: V = REST[1];
  if (f >= 78 && f < 94) h1 = arc(REST[1], { x: PLANE_REST.x - 16, y: PLANE_REST.y - 4 }, ease(seg(f, 78, 94)), 14);
  if (f >= 94 && f < RELEASE) h1 = { x: plane.x - 14, y: plane.y + 8 };
  if (f >= RELEASE && f < 168) h1 = arc({ x: PATH[0].x - 14, y: PATH[0].y + 8 }, REST[1], ease(seg(f, 146, 168)), 0);
  // a little wave when the plane comes home
  let h0: V = REST[0];
  const wave = ease(seg(f, 374, 386)) * (1 - ease(seg(f, 404, 418)));
  if (wave > 0) h0 = { x: lerp(REST[0].x, -112, wave), y: lerp(REST[0].y, -140, wave) + 10 * Math.sin((TAU * (f - 374)) / 12) * wave };
  const eyeY = -98;
  const tgt = f >= 66 && f < LAND + 10 ? plane : { x: 0, y: eyeY };
  const look = { x: Math.max(-6, Math.min(6, (tgt.x - 0) / 60)), y: Math.max(-4, Math.min(4, (tgt.y - eyeY) / 90)) };
  const soul: SoulState = { lean, breath, blink, legPh, look: f >= 66 && f < LAND + 10 ? look : { x: 0, y: 0 },
    joy: ease(seg(f, 372, 384)) * (1 - ease(seg(f, 410, 430))) + 0.6 * ease(seg(f, 140, 150)) * (1 - ease(seg(f, 160, 176))), hands: [unshear(h0, lean), unshear(h1, lean)] };
  const W2 = (v: V) => ({ x: SOUL_X + v.x, y: PAGE_BOTTOM + v.y });
  const pw = W2(plane);
  // a faint dotted trail while it flies
  const trail = flying ? Array.from({ length: 10 }, (_, i) => { const u0 = ease(seg(f - (i + 1) * 3, RELEASE, LAND)) * 0.85 + seg(f - (i + 1) * 3, RELEASE, LAND) * 0.15; const q = W2(along(u0));
    return <circle key={i} cx={q.x} cy={q.y} r={4.5 - i * 0.3} fill="#FFFFFF" opacity={0.85 * (1 - i / 10)} />; }) : null;
  const onEdge = f < 94 || f >= LAND;
  return {
    soul,
    onPage: onEdge ? <Plane x={W2(PLANE_REST).x} y={W2(PLANE_REST).y} ang={0} flip={false} /> : undefined,
    above: <g>{trail}{!onEdge && <Plane x={pw.x} y={pw.y} ang={flip ? ang + 180 : ang} flip={flip} />}</g>,
  };
};

export const SitSoul05: React.FC = () => (
  <SittingSoul palette={P} size={SIZE} pageTop={PAGE_TOP} pageBottom={PAGE_BOTTOM} soulX={SOUL_X} scene={scene}
    lines={[<>The right people<br />give you wings.</>, <>The wrong ones give you<br />lessons your soul<br />never asked for.</>, <>Choose <Mark p={P} size={SIZE}>truly.</Mark></>]} />
);
export const SIT05_END = LOOP;
