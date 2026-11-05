// Writing reel 02 — "RATE MYSELF 10/10." · STORY FORMAT (Aariya, 5 Nov): the poem arrives one stanza at a time, like a message to the reader.
// Each stanza fades in, stays long enough to read, fades out. Warm beige background that slowly breathes; a faint score numeral behind
// the words drops 10 → 9 → 8 → 7 → 6 → 5 as the poem goes on, and comes back as a red 10 for the last stanza.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ACCENT, BGS, easeOut, FPS, INK, seg, useFonts } from "./WritingReel";

const C = BGS.beige;
const s = (t: number) => Math.round(t * FPS);
const RED = "#C9524A";
const HL = "#FFD27A";

type Beat = { lines: React.ReactNode[][]; dur: number; score: string; italic?: boolean };
// lines: groups = the poem's own lines (kept together); a long poem line is split at its natural pause into rows
const BEATS: Beat[] = [
  { lines: [["I was a ten to everyone I knew."], ["Their ratings dropped", "when my self-respect came through."]], dur: 4.6, score: "10" },
  { lines: [["The day I stood against their flaws,"], ["I dropped to a nine,", "but I never needed their applause."]], dur: 4.6, score: "9" },
  { lines: [["I chose my peace", "and stayed out of their fights,"], ["and suddenly,", "I was an eight overnight."]], dur: 4.6, score: "8" },
  { lines: [["The first time I said no", "and let it show,"], ["they labelled me a seven.", "But who cares, though?"]], dur: 4.6, score: "7" },
  { lines: [["Every time I picked me,", "their numbers fell,"], ["and if that’s the price,", "then you can go to hell."]], dur: 4.6, score: "6" },
  { lines: [["You won’t be a ten to everyone,", "and that’s fine."], ["HL:They count you by convenience,", "HL:every time."]], dur: 4.8, score: "5" },
  { lines: [["So I stopped taking", "the scores they handed me."], ["Daughter, sibling, friend,", "I’m a ten, and I will always be."]], dur: 7.0, score: "10", italic: true },
];
const TITLE = 3.4;
const starts: number[] = []; { let t = TITLE; for (const b of BEATS) { starts.push(t); t += b.dur; } }
export const WRITE02_DUR = s(starts[starts.length - 1] + BEATS[BEATS.length - 1].dur);

const Blob: React.FC<{ f: number; x: number; y: number; r: number; c: string; sp: number; ph: number }> = ({ f, x, y, r, c, sp, ph }) => {
  const a = f / FPS * sp + ph;
  return <div style={{ position: "absolute", left: x + Math.cos(a) * 90 - r, top: y + Math.sin(a * 0.8) * 120 - r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: `radial-gradient(circle, ${c} 0%, ${c}00 70%)` }} />;
};

export const Write02: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();
  const fadeIO = (a: number, b: number, inD = 0.7, outD = 0.6, last = false) =>
    easeOut(seg(f, s(a), s(a + inD))) * (last ? 1 : 1 - seg(f, s(b - outD), s(b)));
  const rise = (a: number) => 18 * (1 - easeOut(seg(f, s(a), s(a + 0.8))));

  // which beat we are in, for the score numeral
  const idx = starts.findIndex((st, i) => f >= s(st) && f < s(st + BEATS[i].dur));
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      {/* breathing warm light */}
      <Blob f={f} x={250} y={420} r={520} c="#F7D9C4" sp={0.22} ph={0} />
      <Blob f={f} x={860} y={980} r={560} c="#F8E4B4" sp={0.18} ph={2} />
      <Blob f={f} x={300} y={1500} r={500} c="#F3D2CB" sp={0.2} ph={4} />
      {/* tiny dust rising slowly */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 22 }, (_, i) => {
          const x = (i * 197) % 1000 + 40, sp = 14 + (i * 7) % 12, y = 1920 - ((f / FPS * sp + i * 113) % 2000);
          return <circle key={i} cx={x + Math.sin(f / 40 + i) * 12} cy={y} r={2 + (i % 3)} fill={ACCENT} opacity={0.16} />;
        })}
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} stitchTiles="stitch" /><feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.28  0 0 0 0.5 0" /></filter>
        <rect width={1080} height={1920} filter="url(#grain)" opacity={0.1} />
      </svg>

      {/* faint score numeral behind the words */}
      {BEATS.map((b, i) => {
        const last = i === BEATS.length - 1;
        const o = fadeIO(starts[i], starts[i] + b.dur, 0.9, 0.6, last) * (last ? 0.9 : 0.09);
        if (i !== idx && !(last && f >= s(starts[i]))) return null;
        return <div key={i} style={{ position: "absolute", top: last ? 300 : 430, width: 1080, textAlign: "center", fontFamily: "Playfair Display", fontWeight: 800, fontSize: last ? 150 : 520, lineHeight: 1, color: last ? RED : INK, opacity: o }}>
          {last ? <span>10<span style={{ fontSize: 80, color: ACCENT }}>/10</span></span> : b.score}
        </div>;
      })}

      {/* title card */}
      <div style={{ position: "absolute", top: 0, width: 1080, height: 1920, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingBottom: 120, opacity: fadeIO(0.2, TITLE) }}>
        <div style={{ transform: `translateY(${rise(0.2)}px)`, textAlign: "center", fontFamily: "Playfair Display", color: INK }}>
          <div style={{ fontWeight: 800, fontSize: 120, letterSpacing: -3, lineHeight: 0.98 }}>RATE</div>
          <div style={{ fontWeight: 800, fontSize: 120, letterSpacing: -3, lineHeight: 0.98 }}>MYSELF</div>
          <div style={{ fontStyle: "italic", fontWeight: 400, fontSize: 116, color: ACCENT, marginTop: 14 }}>10/10.</div>
        </div>
      </div>

      {/* the poem, one stanza at a time */}
      {BEATS.map((b, i) => {
        const a = starts[i], e = a + b.dur, last = i === BEATS.length - 1;
        if (f < s(a) - 1 || f > s(e) + 1) return null;
        return <div key={i} style={{ position: "absolute", left: 100, width: 840, top: last ? 560 : 0, height: last ? 760 : 1920, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", paddingBottom: last ? 0 : 120,
          fontFamily: "Jost", fontWeight: 450, fontSize: 54, lineHeight: 1.45, textAlign: "center", color: b.italic ? ACCENT : INK, fontStyle: b.italic ? "italic" : "normal" }}>
          {b.lines.map((g, gi) => (
            <div key={gi} style={{ marginTop: gi ? 30 : 0, opacity: fadeIO(a + gi * 0.9, e, 0.7, 0.6, last), transform: `translateY(${rise(a + gi * 0.9)}px)` }}>
              {g.map((ln, li) => {
                const hl = typeof ln === "string" && ln.startsWith("HL:");
                const txt = hl ? (ln as string).slice(3) : ln;
                return <div key={li} style={{ whiteSpace: "nowrap" }}>{hl ? <span style={{ fontWeight: 600, backgroundImage: `linear-gradient(${HL}, ${HL})`, backgroundRepeat: "no-repeat", backgroundPosition: "0 88%", backgroundSize: `${100 * easeOut(seg(f, s(a + 1.4), s(a + 2.4)))}% 46%` }}>{txt}</span> : txt}</div>;
              })}
            </div>
          ))}
          {last && <div style={{ marginTop: 60, fontStyle: "normal", opacity: easeOut(seg(f, s(a + 3.0), s(a + 3.6))) }}>
            <span style={{ display: "inline-block", background: "rgba(154,94,82,0.14)", borderRadius: 10, padding: "12px 28px", fontSize: 32, color: INK }}>words by — @trulyaariya</span>
          </div>}
        </div>;
      })}
    </AbsoluteFill>
  );
};
