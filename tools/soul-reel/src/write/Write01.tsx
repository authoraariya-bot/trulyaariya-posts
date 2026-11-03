// Writing reel 01 — "BE A PROUD introvert." · background: sage mist · sketch: a person walking toward a softly lit, half-open door
import React from "react";
import { BGS, easeOut, FPS, Highlight, INK, seg, WritingReel } from "./WritingReel";

const BG = "sage" as const, C = BGS[BG];
const s = (t: number) => t * FPS;

const Sketch = (draw: (a: number, b: number) => number, f: number) => {
  const line = (d: string, a: number, b: number, w = 3) => <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw(a, b)} stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  // an outlined limb: ink tube with a page-coloured core, drawn on together
  const tube = (d: string, a: number, b: number, w: number) => <g>
    <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw(a, b)} stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw(a + 3, b + 3)} stroke={C.bg} strokeWidth={w - 6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>;
  const shape = (d: string, a: number, b: number) => { const p = draw(a, b); return <g>
    <path d={d} fill={C.bg} opacity={p > 0.9 ? 1 : p} />
    <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>; };
  // the one small motion after drawing: the door eases a little more open and its light reaches further
  const open = easeOut(seg(f, s(3.6), s(5.2)));
  const glow = easeOut(seg(f, s(2.9), s(3.6)));
  const w = 26 + 16 * open; // how far the door panel has swung
  const A = s(1.5), B = s(3.5);
  const t = (x: number) => A + (B - A) * x;
  return (
    <svg viewBox="0 0 380 300" width={380} height={300} style={{ overflow: "visible" }}>
      {/* warm light inside the doorway and spilling on the floor (the accent detail) */}
      <path d={`M252,62 L${350 - w},${70} L${350 - w},${278} L252,282 Z`} fill="#F6D9C8" opacity={0.95 * glow} />
      <path d={`M252,282 L${350 - w},282 L${226 - 30 * open},300 L${150 - 34 * open},300 Z`} fill="#F6D9C8" opacity={0.7 * glow} />
      {/* door frame + the half-open door */}
      {line("M252,282 L252,60 L350,60 L350,282", t(0), t(0.3))}
      {shape(`M350,60 L${350 - w},70 L${350 - w},276 L350,282 Z`, t(0.15), t(0.42))}
      <circle cx={350 - w + 8} cy={176} r={3.2} fill={INK} opacity={draw(t(0.4), t(0.45))} />
      {line("M40,282 L372,282", t(0.05), t(0.4))}
      {/* the person, walking in, head up */}
      {tube("M142,134 Q130,164 124,194", t(0.35), t(0.55), 13)}
      {tube("M146,202 Q136,238 121,270", t(0.4), t(0.6), 17)}
      {tube("M118,275 L134,280", t(0.55), t(0.62), 13)}
      {shape("M140,124 C132,128 130,140 132,156 L136,204 L174,204 L172,176 C176,160 178,140 174,130 C170,124 164,122 158,122 C152,122 146,122 140,124 Z", t(0.45), t(0.7))}
      {tube("M157,113 L157,124", t(0.5), t(0.6), 12)}
      {shape("M158,76 C170,76 177,86 177,97 C177,109 169,117 158,117 C147,117 139,108 139,97 C139,86 147,76 158,76 Z", t(0.55), t(0.75))}
      {line("M141,92 C144,76 170,72 176,88", t(0.7), t(0.8), 3)}
      {tube("M164,202 Q178,238 186,272", t(0.62), t(0.82), 17)}
      {tube("M186,277 L204,281", t(0.78), t(0.85), 13)}
      {tube("M169,134 Q188,158 212,166", t(0.75), t(0.95), 13)}
    </svg>
  );
};

export const Write01: React.FC = () => (
  <WritingReel bg={BG} title={["BE A", "PROUD", "introvert."]} bodySize={36} top={282} sketch={Sketch} sketchBox={{ w: 380, h: 300 }}
    highlight="They simply don’t reveal their true self to the wrong room."
    paragraphs={[
      <>People often call introverts socially awkward. I see it differently. Introverts are extroverts too — they just choose the right place to be one.</>,
      <>They take time to open up because they want to build trust first. They want to feel sure that these are the right people, the ones who will understand them. <Highlight mark={C.mark}>They simply don’t reveal their true self to the wrong room.</Highlight></>,
      <>So be a proud introvert. Your true self is not for every room — only for the ones that have earned it.</>,
    ]} />
);
