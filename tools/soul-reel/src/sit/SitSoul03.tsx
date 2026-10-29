// Sitting Soul 03 — "POV: you finally chose yourself…" · palette: Lavender · action: watering a sprout in a tiny clay pot until it blooms
import React from "react";
import { clamp01, ease, lerp, LOOP, Mark, PALETTES, seg, SittingSoul, SoulState, TAU } from "./SittingSoul";

const P = PALETTES.lavender, SIZE = 60;
const PAGE_TOP = 420, PAGE_BOTTOM = 1330, SOUL_X = 770;
type V = { x: number; y: number };
const REST: [V, V] = [{ x: -100, y: -12 }, { x: 100, y: -12 }];
const BLINKS = [36, 128, 330, 410];
const POT: V = { x: -220, y: 0 }, CAN: V = { x: -128, y: 0 }; // soul-local, sitting on the page edge
const unshear = (v: V, lean: number): V => ({ x: v.x - v.y * Math.tan((-lean * Math.PI) / 180), y: v.y });
const arc = (a: V, b: V, t: number, lift: number): V => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) - lift * Math.sin(Math.PI * t) });

const Can: React.FC<{ x: number; y: number; tilt: number }> = ({ x, y, tilt }) => (
  <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
    <path d="M-12,-30 C-11,-44 9,-44 10,-30" stroke="#8C7FC0" strokeWidth={4} fill="none" strokeLinecap="round" />
    <path d="M-16,-12 L-34,-26 L-36,-22 L-18,-6 Z" fill="#9A8FCB" />
    <rect x={-17} y={-28} width={34} height={28} rx={7} fill="#A99DD6" />
    <rect x={-12} y={-23} width={7} height={17} rx={3} fill="#FFFFFF" opacity={0.35} />
  </g>
);
// can is drawn with its handle at the hand; spout tip in can space
const SPOUT: V = { x: -35, y: -25 }, HANDLE: V = { x: -1, y: -42 };
const rotV = (v: V, deg: number): V => { const a = (deg * Math.PI) / 180; return { x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a) }; };

const Plant: React.FC<{ x: number; y: number; grow: number; bloom: number; f: number }> = ({ x, y, grow, bloom, f }) => {
  const h = lerp(16, 58, grow), sway = 3 * Math.sin((TAU * f) / 150);
  const tip = { x: sway * 0.6, y: -40 - h };
  return (
    <g transform={`translate(${x} ${y}) scale(1.25)`}>
      <path d={`M0,-36 C2,${-36 - h * 0.4} ${tip.x - 2},${tip.y + h * 0.3} ${tip.x},${tip.y}`} stroke="#7FA86A" strokeWidth={4.5} fill="none" strokeLinecap="round" />
      {[0.45, 0.72].map((q, i) => { const ly = -36 - h * q, sd = i ? 1 : -1, s = clamp01(grow * 1.6 - i * 0.4) * (i ? 1 : 0.9) + 0.35 * (1 - i);
        return <path key={i} d="M0,0 C6,-10 18,-12 26,-4 C18,4 6,4 0,0 Z" transform={`translate(${sway * q * 0.6} ${ly}) scale(${sd * s} ${s}) rotate(-12)`} fill="#93C07B" />; })}
      {/* the flower: a closed bud that opens, then softly closes again */}
      <g transform={`translate(${tip.x} ${tip.y})`}>
        {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-9 * bloom - 4} rx={5 + 4 * bloom} ry={6 + 6 * bloom} fill="#F5B8C8" transform={`rotate(${a * bloom + (1 - bloom) * (a > 144 ? 10 : -10)})`} opacity={0.4 + 0.6 * clamp01(grow * 2)} />)}
        <circle r={4 + 3 * bloom} fill="#F3D27A" opacity={bloom} />
      </g>
      <path d="M-25,-38 L25,-38 L19,0 L-19,0 Z" fill="#D6906B" />
      <rect x={-28} y={-44} width={56} height={10} rx={4} fill="#E1A07C" />
      <path d="M-18,-30 L-15,-6" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.25} />
    </g>
  );
};

const scene = (f: number) => {
  const breath = Math.sin((TAU * f) / 150), legPh = (TAU * f) / 90;
  const blink = BLINKS.reduce((m, b) => { const d = f - b; return d >= 0 && d < 7 ? Math.min(m, Math.abs(d - 3) / 3.5) : m; }, 1);
  let lean = -3 * ease(seg(f, 60, 74));
  if (f >= 74) lean = lerp(-3, 3, ease(seg(f, 74, 86)));
  if (f >= 86) lean = lerp(3, -11, ease(seg(f, 86, 108)));
  if (f >= 222) lean = lerp(-11, 1.5, ease(seg(f, 222, 246)));
  if (f >= 246) lean = lerp(1.5, 0, ease(seg(f, 246, 260)));
  // the can: rests → lifted (in the hand) → pours → set back down
  const held = f >= 106 && f < 224;
  const tilt = 38 * ease(seg(f, 130, 142)) * (1 - ease(seg(f, 186, 198)));
  const canAt = (): V => {
    const pourAt = { x: POT.x + 54, y: -84 };
    if (f < 128) return arc(CAN, pourAt, ease(seg(f, 108, 128)), 14);
    if (f < 200) return pourAt;
    return arc(pourAt, CAN, ease(seg(f, 200, 222)), 14);
  };
  const can = held ? canAt() : CAN;
  const handle = { x: can.x + rotV(HANDLE, tilt).x, y: can.y + rotV(HANDLE, tilt).y };
  let h0: V = REST[0];
  if (f >= 88 && f < 106) h0 = arc(REST[0], { x: CAN.x + HANDLE.x, y: HANDLE.y + 2 }, ease(seg(f, 88, 106)), 16);
  if (held) h0 = { x: handle.x, y: handle.y + 2 };
  if (f >= 224) h0 = arc({ x: CAN.x + HANDLE.x, y: HANDLE.y + 2 }, REST[0], ease(seg(f, 224, 248)), 14);
  const soul: SoulState = {
    lean, breath, blink, legPh,
    look: { x: -5 * ease(seg(f, 60, 74)) * (1 - ease(seg(f, 350, 380))), y: 3 * ease(seg(f, 60, 74)) * (1 - ease(seg(f, 250, 266))) },
    joy: ease(seg(f, 258, 272)) * (1 - ease(seg(f, 320, 338))),
    hands: [unshear(h0, lean), unshear(REST[1], lean)],
  };
  const grow = ease(seg(f, 146, 236)) * (1 - ease(seg(f, 330, 410)));
  const bloom = ease(seg(f, 232, 276)) * (1 - ease(seg(f, 316, 360)));
  const spout = { x: can.x + rotV(SPOUT, tilt).x, y: can.y + rotV(SPOUT, tilt).y };
  const drops = f > 140 && f < 196 ? Array.from({ length: 14 }, (_, i) => { const st = 140 + i * 4; if (f < st) return null; const p = (f - st) / 12; if (p > 1) return null;
    return <ellipse key={i} cx={SOUL_X + spout.x - 3 - 6 * p} cy={PAGE_BOTTOM + spout.y + 52 * p * p + 4} rx={2.4} ry={4} fill="#9FCBE6" opacity={0.9} />; }) : null;
  const W2 = (v: V) => ({ x: SOUL_X + v.x, y: PAGE_BOTTOM + v.y });
  return {
    soul,
    onPage: <g><Plant x={W2(POT).x} y={W2(POT).y} grow={grow} bloom={bloom} f={f} />{!held && <Can x={W2(CAN).x} y={W2(CAN).y} tilt={0} />}</g>,
    above: <g>{held && <Can x={W2(can).x} y={W2(can).y} tilt={tilt} />}{drops}</g>,
  };
};

export const SitSoul03: React.FC = () => (
  <SittingSoul palette={P} size={SIZE} pageTop={PAGE_TOP} pageBottom={PAGE_BOTTOM} soulX={SOUL_X} scene={scene}
    lines={[<>POV: you finally chose<br />yourself and felt guilty<br />about it.</>, <>That guilt isn’t a sign<br />you did wrong.</>, <>It’s a sign you’re <Mark p={P} size={SIZE}>growing.</Mark></>]} />
);
export const SIT03_END = LOOP;
