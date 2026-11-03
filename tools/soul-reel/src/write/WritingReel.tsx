// "Daily writing reel" for @trulyaariya: header (3-line title + outline sketch), divider, 2–3 paragraphs, one highlight, signature tag.
// 15 s, silent. Everything appears in its final position; only opacity / a small rise / stroke drawing animate.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";

export const FPS = 30, DUR = 450;
export const INK = "#2F2624", ACCENT = "#9A5E52";
export const BGS = {
  sage: { bg: "#E7EFE2", mark: "#C3EBA4" },
  blush: { bg: "#F8EBE6", mark: "#FFC4B2" },
  butter: { bg: "#FAF1DA", mark: "#FFDF6E" },
  lavender: { bg: "#ECE6F3", mark: "#D0BEF7" },
  beige: { bg: "#F3EADB", mark: "#FFD27A" },
  offwhite: { bg: "#FAF7F1", mark: "#FFC9A8" },
};
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const seg = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const s = (t: number) => t * FPS;

const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("Playfair Display", `url(${staticFile("Playfair-800.woff2")})`, { weight: "800" }),
      new FontFace("Playfair Display", `url(${staticFile("Playfair-400i.woff2")})`, { weight: "400", style: "italic" }),
      new FontFace("Jost", `url(${staticFile("Jost.ttf")})`, { weight: "100 900" }),
    ];
    Promise.all(faces.map((ff) => ff.load())).then((l) => { l.forEach((ff) => document.fonts.add(ff)); continueRender(handle); });
  }, [handle]);
};

// Aariya (3 Nov): body text must read easily on a phone: big (~42 px), weight 450, tight spacing.
// Aariya (3 Nov): text stays completely still from the first frame — only the sketch may move.
const Fade: React.FC<{ f: number; a: number; b: number; children: React.ReactNode; style?: React.CSSProperties; rise?: number }> = ({ children, style }) => <div style={style}>{children}</div>;

export type WritingProps = {
  bg: keyof typeof BGS;
  title: [string, string, string];
  titleSize?: number;
  paragraphs: React.ReactNode[]; // last one is drawn italic in the accent colour
  highlight: string; // the sentence inside paragraph 2 that gets the marker (must match text exactly)
  bodySize: number;
  top?: number;
  sketch: (draw: (a: number, b: number) => number, f: number) => React.ReactNode; // returns an <svg> sized element
  sketchBox: { w: number; h: number };
};

export const Highlight: React.FC<{ f?: number; mark: string; children: React.ReactNode }> = ({ mark, children }) => {
  const p = 1;
  return <span style={{ fontWeight: 600, backgroundImage: `linear-gradient(${mark}, ${mark})`, backgroundRepeat: "no-repeat", backgroundPosition: "0 88%", backgroundSize: `${p * 100}% 46%`, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{children}</span>;
};

export const WritingReel: React.FC<WritingProps> = ({ bg, title, titleSize = 82, paragraphs, bodySize, top = 296, sketch, sketchBox }) => {
  useFonts();
  const f = useCurrentFrame();
  const C = BGS[bg];
  const t3 = Math.round(titleSize * 80 / 82);
  const draw = (a: number, b: number) => easeOut(seg(f, a, b));
  const n = paragraphs.length;
  const pTimes = n === 3 ? [[s(3.5), s(5.0)], [s(5.5), s(6.9)], [s(8.5), s(10.0)]] : [[s(3.5), s(5.0)], [s(8.5), s(10.0)]];
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* fine paper grain */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} stitchTiles="stitch" /><feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.28  0 0 0 0.5 0" /></filter>
        <rect width={1080} height={1920} filter="url(#grain)" opacity={0.1} />
      </svg>
      <div style={{ position: "absolute", left: 100, top, width: 840 }}>
        {/* header */}
        <div style={{ position: "relative", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "Playfair Display", color: INK }}>
            <Fade f={f} a={0} b={s(1.0)}>
              <div style={{ fontWeight: 800, fontSize: titleSize, letterSpacing: -2, lineHeight: 0.98, textTransform: "uppercase", whiteSpace: "nowrap" }}>{title[0]}</div>
              <div style={{ fontWeight: 800, fontSize: titleSize, letterSpacing: -2, lineHeight: 0.98, textTransform: "uppercase", whiteSpace: "nowrap" }}>{title[1]}</div>
            </Fade>
            <Fade f={f} a={s(1.0)} b={s(2.0)} style={{ marginTop: 12 }}>
              <div style={{ fontStyle: "italic", fontWeight: 400, fontSize: t3, lineHeight: 1.0, color: ACCENT, whiteSpace: "nowrap", paddingBottom: 6 }}>{title[2]}</div>
            </Fade>
          </div>
          <div style={{ width: sketchBox.w, height: sketchBox.h, flexShrink: 0 }}>{sketch(draw, f)}</div>
        </div>
        {/* divider */}
        <div style={{ marginTop: 48, height: 2, width: 840, background: ACCENT, opacity: 0.28 }} />
        {/* body */}
        <div style={{ marginTop: 50, fontFamily: "Jost", fontWeight: 450, fontSize: bodySize, lineHeight: 1.45, color: INK, textAlign: "left" }}>
          {paragraphs.map((p, i) => (
            <Fade key={i} f={f} a={pTimes[i][0]} b={pTimes[i][1]} style={{ marginTop: i ? 40 : 0, ...(i === n - 1 ? { fontStyle: "italic", color: ACCENT } : {}) }}>{p}</Fade>
          ))}
        </div>
        {/* signature tag */}
        <Fade f={f} a={s(10.5)} b={s(11.0)} rise={8} style={{ marginTop: 46 }}>
          <span style={{ display: "inline-block", background: "rgba(154,94,82,0.14)", borderRadius: 10, padding: "12px 28px", fontFamily: "Jost", fontSize: 32, color: INK }}>words by — @trulyaariya</span>
        </Fade>
      </div>
    </AbsoluteFill>
  );
};
