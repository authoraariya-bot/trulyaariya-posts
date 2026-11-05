// Writing reel 02 — "I RATE MYSELF 10/10." · NEW FORMAT made for this quote (Aariya, 5 Nov)
// hero "10/10." + a small self-love figure (a person hugging herself, a red heart that beats softly);
// the drop shown as a score line 10 → 9 → 8 → 7 (numbers fade as they fall), each sentence beside its number;
// the ending framed in a soft card; signature centred underneath. Text is still from frame 0; only the figure animates.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ACCENT, BGS, easeOut, FPS, INK, seg, useFonts } from "./WritingReel";

const C = BGS.beige;
const s = (t: number) => t * FPS;
const RED = "#C9524A";

const Figure: React.FC<{ f: number }> = ({ f }) => {
  const draw = (a: number, b: number) => easeOut(seg(f, a, b));
  const A = s(0.6), B = s(2.4);
  const stroke = (d: string, a: number, b: number, w: number, color: string) => <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw(a, b)} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  const tube = (d: string, a: number, b: number, w: number) => <g>{stroke(d, a, b, w, INK)}{stroke(d, a + 3, b + 3, w - 6, C.bg)}</g>;
  const x = 100;
  const torso = `M${x - 26},120 C${x - 31},126 ${x - 32},150 ${x - 29},200 L${x + 29},200 C${x + 32},150 ${x + 31},126 ${x + 26},120 C${x + 15},113 ${x - 15},113 ${x - 26},120 Z`;
  const head = `M${x},52 C${x + 13},52 ${x + 22},63 ${x + 22},76 C${x + 22},90 ${x + 12},100 ${x},100 C${x - 12},100 ${x - 22},90 ${x - 22},76 C${x - 22},63 ${x - 13},52 ${x},52 Z`;
  const fill = easeOut(seg(f, s(2.4), s(3.1)));
  const beat = 1 + 0.08 * Math.max(0, Math.sin(((f - s(3.1)) / FPS) * Math.PI * 1.2)) * (f > s(3.1) ? 1 : 0);
  const heart = "M0,6 C-2,-2 -14,-4 -14,5 C-14,13 -5,18 0,23 C5,18 14,13 14,5 C14,-4 2,-2 0,6 Z";
  return (
    <svg viewBox="0 40 200 260" width={156} height={203} style={{ overflow: "visible" }}>
      {/* soft glow behind */}
      <circle cx={x} cy={150} r={92} fill="#F7DCCB" opacity={0.7 * fill} />
      {tube(`M${x - 11},198 L${x - 12},288`, A + 4, B, 19)}{tube(`M${x + 11},198 L${x + 12},288`, A + 4, B, 19)}
      {stroke(`M${x - 13},291 L${x - 23},292`, B - 4, B, 13, INK)}{stroke(`M${x + 13},291 L${x + 23},292`, B - 4, B, 13, INK)}
      {stroke(`M${x},98 L${x},112`, A + 2, B, 13, INK)}
      <path d={torso} fill={C.bg} opacity={draw(A, B)} />{stroke(torso, A, B, 3, INK)}
      <path d={head} fill={C.bg} opacity={draw(A, B)} />{stroke(head, A, B, 3, INK)}
      {/* arms wrapped around herself: each hand rests on the opposite shoulder/upper arm */}
      {tube(`M${x - 27},126 C${x - 40},150 ${x - 30},172 ${x - 8},166 C${x + 8},160 ${x + 18},146 ${x + 22},134`, A + 8, B, 14)}
      {tube(`M${x + 27},126 C${x + 40},152 ${x + 30},178 ${x + 8},174 C${x - 8},170 ${x - 18},156 ${x - 22},144`, A + 10, B, 14)}
      <g transform={`translate(${x},${131}) scale(${0.9 * beat})`}>
        <path d={heart} fill={RED} opacity={fill} stroke={INK} strokeWidth={2.5} strokeOpacity={fill} />
      </g>
    </svg>
  );
};

const ROWS: { n: string; o: number; lines: React.ReactNode[] }[] = [
  { n: "10", o: 1, lines: ["I was always a 10/10 friend.", "People just rated me as per their situation."] },
  { n: "9", o: 0.78, lines: ["The moment I chose self-respect", "over selflessness, I became a 9."] },
  { n: "8", o: 0.6, lines: ["When I chose my peace over taking sides,", "I became an 8."] },
  { n: "7", o: 0.44, lines: ["The day I started saying no, I became a 7."] },
];

export const Write02Love: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} stitchTiles="stitch" /><feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.28  0 0 0 0.5 0" /></filter>
        <rect width={1080} height={1920} filter="url(#grain)" opacity={0.1} />
      </svg>
      <div style={{ position: "absolute", left: 100, top: 280, width: 840, fontFamily: "Jost", color: INK }}>
        {/* hero */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 34, letterSpacing: 9, lineHeight: 1 }}>I RATE MYSELF</div>
            <div style={{ fontFamily: "Playfair Display", fontWeight: 800, fontSize: 142, letterSpacing: -3, lineHeight: 0.95, color: RED, marginTop: 14 }}>10/10.</div>
          </div>
          <Figure f={f} />
        </div>

        {/* the score line */}
        <div style={{ marginTop: 34, position: "relative" }}>
          <div style={{ position: "absolute", left: 44, top: 30, bottom: 24, width: 2, background: ACCENT, opacity: 0.22 }} />
          {ROWS.map((r, i) => (
            <div key={r.n} style={{ display: "flex", alignItems: "flex-start", marginTop: i ? 16 : 0 }}>
              <div style={{ width: 90, flexShrink: 0, textAlign: "center", fontFamily: "Playfair Display", fontWeight: 800, fontSize: 52, lineHeight: 1, color: RED, opacity: r.o, background: C.bg, paddingBottom: 6, position: "relative" }}>{r.n}</div>
              <div style={{ marginLeft: 22, fontSize: 35, fontWeight: 450, lineHeight: 1.36 }}>{r.lines.map((l, k) => <div key={k}>{l}</div>)}</div>
            </div>
          ))}
          <div style={{ marginTop: 16, marginLeft: 112, fontSize: 35, fontWeight: 600, lineHeight: 1.36 }}>
            <span style={{ backgroundImage: `linear-gradient(${C.mark}, ${C.mark})`, backgroundRepeat: "no-repeat", backgroundPosition: "0 88%", backgroundSize: "100% 46%", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>With every choice I made for myself,</span><br />
            <span style={{ backgroundImage: `linear-gradient(${C.mark}, ${C.mark})`, backgroundRepeat: "no-repeat", backgroundPosition: "0 88%", backgroundSize: "100% 46%" }}>my number dropped.</span>
          </div>
        </div>

        {/* the ending, framed */}
        <div style={{ marginTop: 32, background: "#FFFBF4", border: `2px solid rgba(154,94,82,0.28)`, borderRadius: 26, padding: "26px 34px 28px", textAlign: "center", fontStyle: "italic", color: ACCENT, fontSize: 34, lineHeight: 1.38 }}>
          <div>But you can’t be a 10/10 for everyone —</div>
          <div>people will number you as per their convenience.</div>
          <div style={{ marginTop: 20 }}>What matters is whether you’re a 10/10</div>
          <div>in your own eyes,</div>
          <div>as a friend, a sister, a daughter, a son.</div>
          <div style={{ marginTop: 22, fontStyle: "normal", fontFamily: "Playfair Display", fontWeight: 800, fontSize: 44, color: RED, lineHeight: 1.15 }}>And I still rate myself 10/10.</div>
        </div>

        {/* signature */}
        <div style={{ marginTop: 26, textAlign: "center", fontSize: 30, color: INK, letterSpacing: 1 }}>
          words by — <span style={{ fontWeight: 600 }}>@trulyaariya</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
