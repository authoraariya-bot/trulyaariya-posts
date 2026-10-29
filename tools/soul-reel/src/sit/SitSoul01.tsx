// Sitting Soul 01 — "Every time you let someone mistreat you…" · palette: Blush · action: hugging a tiny heart
import React from "react";
import { ease, lerp, LOOP, Mark, PALETTES, seg, SittingSoul, SoulState, TAU } from "./SittingSoul";

const P = PALETTES.blush, SIZE = 66;
const PAGE_TOP = 430, PAGE_BOTTOM = 1320, SOUL_X = 760;
type V = { x: number; y: number };
// the body leans by shearing (its flat bottom never leaves the page edge); undo that shear for hand targets
const unshear = (v: V, lean: number): V => ({ x: v.x - v.y * Math.tan((-lean * Math.PI) / 180), y: v.y });
const HC: V = { x: -158, y: -17 }, CHEST: V = { x: 0, y: -60 };
const REST: [V, V] = [{ x: -100, y: -12 }, { x: 100, y: -12 }];
const BLINKS = [40, 136, 300, 404];
const HEART = "M0,14 C-26,-4 -20,-24 -8,-24 C-2,-24 0,-18 0,-16 C0,-18 2,-24 8,-24 C20,-24 26,-4 0,14 Z";
const Heart: React.FC<{ x: number; y: number; s: number; glow: number }> = ({ x, y, s, glow }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {glow > 0.01 && <path d={HEART} fill="#FFD3C9" opacity={0.8 * glow} transform="scale(1.5)" filter="url(#soft4)" />}
    <path d={HEART} fill="#E9828A" />
    <path d="M-12,-14 C-16,-12 -17,-6 -15,-2" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" fill="none" opacity={0.55} />
  </g>
);
const arc = (a: V, b: V, t: number, lift: number): V => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) - lift * Math.sin(Math.PI * t) });

const scene = (f: number) => {
  const breath = Math.sin((TAU * f) / 150), legPh = (TAU * f) / 90;
  const blink = BLINKS.reduce((m, b) => { const d = f - b; return d >= 0 && d < 7 ? Math.min(m, Math.abs(d - 3) / 3.5) : m; }, 1);
  // body lean: notice → wind-up → lean to reach → upright (with a little follow-through) → hug sway → lean to put back → upright
  let lean = -3 * ease(seg(f, 60, 78));
  if (f >= 78) lean = lerp(-3, 3, ease(seg(f, 78, 90)));
  if (f >= 90) lean = lerp(3, -12, ease(seg(f, 90, 114)));
  if (f >= 124) lean = lerp(-12, 2, ease(seg(f, 124, 154)));
  if (f >= 154) lean = lerp(2, 0, ease(seg(f, 154, 168))) + 3 * Math.sin((TAU * (f - 168)) / 60) * ease(seg(f, 168, 186)) * (1 - ease(seg(f, 246, 264)));
  if (f >= 280) lean = lerp(0, -12, ease(seg(f, 280, 304)));
  if (f >= 342) lean = lerp(-12, 0, ease(seg(f, 342, 374)));
  // where the heart is (soul-local, unrotated)
  let heart: V = HC, carried = false;
  if (f >= 124 && f < 154) { heart = arc(HC, CHEST, ease(seg(f, 124, 154)), 30); carried = true; }
  else if (f >= 154 && f < 280) { heart = CHEST; carried = true; }
  else if (f >= 280 && f < 312) { heart = arc(CHEST, HC, ease(seg(f, 280, 310)), 26); carried = true; }
  const hug = ease(seg(f, 156, 172)) * (1 - ease(seg(f, 260, 278)));
  const pulse = 1 + 0.07 * Math.sin((TAU * (f - 160)) / 30) * hug;
  // hands (soul-local, unrotated) → body frame
  const hb = (v: V) => unshear(v, lean);
  let h0: V = REST[0], h1: V = REST[1];
  if (f >= 90 && f < 124) h0 = arc(REST[0], { x: HC.x + 22, y: HC.y + 2 }, ease(seg(f, 92, 116)), 22);
  if (carried) h0 = { x: heart.x - 24 - 8 * hug, y: heart.y + 2 - 6 * hug };
  if (f >= 312 && f < 342) { const pat = Math.abs(Math.sin((Math.PI * (f - 318)) / 12)) * (f >= 318 && f < 342 ? 1 : 0); h0 = { x: HC.x + 10, y: HC.y - 20 - 14 * pat }; }
  if (f >= 342) h0 = arc({ x: HC.x + 10, y: HC.y - 20 }, REST[0], ease(seg(f, 342, 370)), 10);
  if (f >= 132 && f < 290) {
    const inn = ease(seg(f, 132, 152)), out = ease(seg(f, 272, 290));
    const hold = { x: heart.x + 24 + 8 * hug, y: heart.y + 2 - 6 * hug };
    h1 = { x: lerp(lerp(REST[1].x, hold.x, inn), REST[1].x, out), y: lerp(lerp(REST[1].y, hold.y, inn), REST[1].y, out) - 16 * Math.sin(Math.PI * inn) * (1 - out) };
  }
  // eyes follow the heart
  const watch = ease(seg(f, 60, 76)) * (1 - ease(seg(f, 150, 162))) + ease(seg(f, 262, 276)) * (1 - ease(seg(f, 348, 372)));
  const look = { x: -5 * watch * (heart.x < -60 ? 1 : 0.2), y: 3 * watch + 2 * ease(seg(f, 262, 276)) * (1 - ease(seg(f, 280, 300))) };
  const soul: SoulState = { lean, breath, blink, look, joy: hug, legPh, hands: [hb(h0), hb(h1)] };
  const hbHeart = hb(heart);
  return {
    soul,
    inHands: carried ? <Heart x={hbHeart.x} y={hbHeart.y} s={1.15 * pulse} glow={hug} /> : undefined,
    onPage: !carried ? <Heart x={SOUL_X + HC.x} y={PAGE_BOTTOM + HC.y} s={1.15} glow={0} /> : undefined,
  };
};

export const SitSoul01: React.FC = () => (
  <SittingSoul palette={P} size={SIZE} pageTop={PAGE_TOP} pageBottom={PAGE_BOTTOM} soulX={SOUL_X} scene={scene}
    lines={[<>Every time you let someone mistreat you, you lose a piece of yourself.</>, <>Don’t lose <Mark p={P} size={SIZE}>all</Mark> of you to keep a little of them.</>]} />
);
export const SIT01_END = LOOP;
