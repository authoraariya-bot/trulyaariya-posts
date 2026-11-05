// Writing reel 02 — "I RATE MYSELF 10/10." · reel-01 format · background: off-white
// sketch: a person in front of a standing mirror; the mirror shows a red "10/10" (a 10 in your own eyes),
// while the cards others handed her (9, 8, 7) drop to the floor behind her.
import React from "react";
import { BGS, easeOut, FPS, Highlight, INK, seg, WritingReel } from "./WritingReel";

const BG = "offwhite" as const, C = BGS[BG];
const s = (t: number) => t * FPS;
const RED = "#C9524A";

const Sketch = (draw: (a: number, b: number) => number, f: number) => {
  const A = s(1.5), B = s(3.3);
  const t = (x: number) => A + (B - A) * x;
  const stroke = (d: string, a: number, b: number, w: number, color: string) => <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw(a, b)} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  const tube = (d: string, a: number, b: number, w: number) => <g>{stroke(d, a, b, w, INK)}{stroke(d, a + 3, b + 3, w - 6, C.bg)}</g>;
  // person, turned a little toward the mirror (head leans right)
  const x = 118, a = t(0), b = t(0.6);
  const torso = `M${x - 20},128 C${x - 24},132 ${x - 25},150 ${x - 23},192 L${x + 23},192 C${x + 25},150 ${x + 24},132 ${x + 20},128 C${x + 12},122 ${x - 12},122 ${x - 20},128 Z`;
  const hx = x + 4;
  const head = `M${hx},76 C${hx + 11},76 ${hx + 18},85 ${hx + 18},96 C${hx + 18},108 ${hx + 10},116 ${hx},116 C${hx - 10},116 ${hx - 18},108 ${hx - 18},96 C${hx - 18},85 ${hx - 11},76 ${hx},76 Z`;
  // mirror on a stand
  const mx = 262, my = 160, ma = t(0.35), mb = t(1);
  const glass = `M${mx},${my - 88} C${mx + 30},${my - 88} ${mx + 50},${my - 50} ${mx + 50},${my} C${mx + 50},${my + 50} ${mx + 30},${my + 88} ${mx},${my + 88} C${mx - 30},${my + 88} ${mx - 50},${my + 50} ${mx - 50},${my} C${mx - 50},${my - 50} ${mx - 30},${my - 88} ${mx},${my - 88} Z`;
  const inner = `M${mx},${my - 78} C${mx + 25},${my - 78} ${mx + 41},${my - 44} ${mx + 41},${my} C${mx + 41},${my + 44} ${mx + 25},${my + 78} ${mx},${my + 78} C${mx - 25},${my + 78} ${mx - 41},${my + 44} ${mx - 41},${my} C${mx - 41},${my - 44} ${mx - 25},${my - 78} ${mx},${my - 78} Z`;
  const glow = easeOut(seg(f, s(4.8), s(5.8)));
  // the scores they handed me: dropping one after another and landing behind her
  const cards: [number, number, number, string][] = [[30, 275, -14, "9"], [64, 280, 10, "8"], [176, 279, -8, "7"]];
  const card = ([cx, cy, r, n]: [number, number, number, string], k: number) => {
    const st = s(3.3) + k * s(0.45), p = easeOut(seg(f, st, st + s(0.9)));
    return <g key={n} transform={`translate(${cx},${cy - 150 * (1 - p)}) rotate(${r + (k % 2 ? -40 : 40) * (1 - p)})`} opacity={seg(f, st, st + s(0.2))}>
      <rect x={-18} y={-13} width={36} height={26} rx={2} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
      <text x={0} y={8} textAnchor="middle" fontFamily="Jost" fontWeight={600} fontSize={21} fill={INK}>{n}</text>
    </g>;
  };
  return (
    <svg viewBox="8 64 312 230" width="100%" height="100%" style={{ overflow: "visible" }}>
      {stroke("M10,290 L318,290", t(0), t(0.35), 3, INK)}
      {/* mirror */}
      {stroke(`M${mx},${my + 88} L${mx},${my + 104} M${mx},${my + 104} L${mx - 30},288 M${mx},${my + 104} L${mx + 30},288`, ma + 6, mb, 3, INK)}
      <path d={glass} fill={C.bg} opacity={draw(ma, mb)} />{stroke(glass, ma, mb, 3, INK)}
      <path d={inner} fill="#EEF1EF" opacity={draw(ma, mb)} />{stroke(inner, ma + 4, mb, 3, INK)}
      <g opacity={draw(ma + 8, mb) * 0.9}>{stroke(`M${mx - 24},${my - 44} L${mx - 8},${my - 62}`, ma + 8, mb, 3, "#FFFFFF")}{stroke(`M${mx - 28},${my - 26} L${mx - 4},${my - 54}`, ma + 8, mb, 3, "#FFFFFF")}</g>
      <g transform={`translate(${mx},${my + 9}) scale(${0.85 + 0.15 * glow})`} opacity={glow}>
        <text x={0} y={0} textAnchor="middle" fontFamily="Playfair Display" fontWeight={800} fontSize={25} fill={RED}>10/10</text>
      </g>
      {/* person */}
      {tube(`M${x - 9},190 L${x - 10},284`, a + 4, b, 17)}{tube(`M${x + 9},190 L${x + 10},284`, a + 4, b, 17)}
      {stroke(`M${x - 11},287 L${x - 20},288`, b - 4, b, 12, INK)}{stroke(`M${x + 11},287 L${x + 20},288`, b - 4, b, 12, INK)}
      {stroke(`M${x + 1},114 L${x},126`, a + 2, b, 12, INK)}
      <path d={torso} fill={C.bg} opacity={draw(a, b)} />{stroke(torso, a, b, 3, INK)}
      <path d={head} fill={C.bg} opacity={draw(a, b)} />{stroke(head, a, b, 3, INK)}
      {tube(`M${x - 21},134 Q${x - 29},166 ${x - 27},198`, a + 6, b, 13)}
      {/* hand on her heart, facing her own reflection */}
      {tube(`M${x + 21},134 C${x + 33},148 ${x + 35},170 ${x + 26},175 L${x + 9},160`, a + 6, b, 13)}
      {cards.map(card)}
    </svg>
  );
};

// framing (Aariya, 5 Nov): every sentence on its own line, the drop in numbers easy to follow, breathing space between thoughts
const L: React.FC<{ gap?: number; strong?: boolean; children: React.ReactNode }> = ({ gap = 0, strong, children }) =>
  <div style={{ marginTop: gap, fontWeight: strong ? 600 : undefined }}>{children}</div>;

export const Write02Card: React.FC = () => (
  <WritingReel bg={BG} title={["I RATE", "MYSELF", "10/10."]} noSig gapA={40} gapB={42} titleSize={74} bodySize={37} top={266} paraGap={26} lineHeight={1.36} sketch={Sketch} sketchBox={{ w: 280, h: 206 }}
    highlight="With every choice I made for myself, my number dropped."
    paragraphs={[
      <>
        <L>I was always a 10/10 friend.</L>
        <L>People just rated me as per their situation.</L>
      </>,
      <>
        <L>The moment I chose self-respect over selflessness,</L>
        <L strong>I became a 9.</L>
        <L gap={8}>When I chose my peace over taking sides,</L>
        <L strong>I became an 8.</L>
        <L gap={8}>The day I started saying no,</L>
        <L strong>I became a 7.</L>
        <L gap={8}><Highlight mark={C.mark}>With every choice I made for myself,</Highlight></L>
        <L><Highlight mark={C.mark}>my number dropped.</Highlight></L>
      </>,
      <>
        <L>But you can’t be a 10/10 for everyone —</L>
        <L>people will number you as per their convenience.</L>
        <L gap={12}>What matters is whether you’re a 10/10</L>
        <L>in your own eyes,</L>
        <L>as a friend, a sister, a daughter, a son.</L>
        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>And I still rate myself 10/10.</span>
          <span style={{ fontStyle: "normal", background: "rgba(154,94,82,0.14)", borderRadius: 10, padding: "10px 24px", fontSize: 30, color: INK }}>words by — @trulyaariya</span>
        </div>
      </>,
    ]} />
);
