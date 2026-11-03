// Writing reel 01 — "BE A PROUD introvert." · background: sage mist · sketch: five people in a row, the one in the middle in red
import React from "react";
import { BGS, easeOut, FPS, Highlight, INK, seg, WritingReel } from "./WritingReel";

const BG = "sage" as const, C = BGS[BG];
const s = (t: number) => t * FPS;

const RED = "#C9524A";
const Sketch = (draw: (a: number, b: number) => number, f: number) => {
  const A = s(1.5), B = s(3.5);
  const t = (x: number) => A + (B - A) * x;
  const stroke = (d: string, a: number, b: number, w: number, color: string) => <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw(a, b)} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  // after the outlines are drawn, the one in the middle fills with colour: the odd one out
  const pop = easeOut(seg(f, s(3.5), s(4.6)));
  const person = (x: number, k: number, odd: boolean) => {
    const a = t(0.12 * k), b = t(0.12 * k + 0.5);
    const core = odd ? RED : C.bg, coreO = odd ? pop : 1;
    const torso = `M${x - 20},128 C${x - 24},132 ${x - 25},150 ${x - 23},192 L${x + 23},192 C${x + 25},150 ${x + 24},132 ${x + 20},128 C${x + 12},122 ${x - 12},122 ${x - 20},128 Z`;
    const head = `M${x},76 C${x + 11},76 ${x + 18},85 ${x + 18},96 C${x + 18},108 ${x + 10},116 ${x},116 C${x - 10},116 ${x - 18},108 ${x - 18},96 C${x - 18},85 ${x - 11},76 ${x},76 Z`;
    const limbs = [`M${x - 9},190 L${x - 10},284`, `M${x + 9},190 L${x + 10},284`, `M${x - 21},134 Q${x - 29},166 ${x - 27},198`, `M${x + 21},134 Q${x + 29},166 ${x + 27},198`];
    const feet = [`M${x - 11},287 L${x - 19},288`, `M${x + 11},287 L${x + 19},288`];
    return <g key={x}>
      {limbs.map((d, i) => <g key={i}>{stroke(d, a + 4, b, i < 2 ? 17 : 13, INK)}<g opacity={coreO}>{stroke(d, a + 7, b + 3, i < 2 ? 11 : 7, core)}</g>{odd && <g opacity={1 - coreO}>{stroke(d, a + 7, b + 3, i < 2 ? 11 : 7, C.bg)}</g>}</g>)}
      {feet.map((d, i) => <g key={`f${i}`}>{stroke(d, b - 4, b, 12, INK)}</g>)}
      {stroke(`M${x},114 L${x},126`, a + 2, b, 12, INK)}
      <path d={torso} fill={C.bg} opacity={draw(a, b)} /><path d={torso} fill={RED} opacity={odd ? pop : 0} />
      {stroke(torso, a, b, 3, INK)}
      <path d={head} fill={C.bg} opacity={draw(a, b)} /><path d={head} fill={RED} opacity={odd ? pop : 0} />
      {stroke(head, a, b, 3, INK)}
    </g>;
  };
  return (
    <svg viewBox="0 0 380 300" width={380} height={300} style={{ overflow: "visible" }}>
      {stroke("M0,290 L380,290", t(0), t(0.35), 3, INK)}
      {[[38, 0], [110, 1], [190, 2], [270, 3], [342, 4]].map(([x, k]) => person(x, k, k === 2))}
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
