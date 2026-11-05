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

export const useFonts = () => {
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
  // long quotes: a second page of paragraphs that replaces the first with one soft cross-fade at `turnAt` (frames); header + signature never move
  page2?: React.ReactNode[];
  turnAt?: number;
  paraGap?: number;
  lineHeight?: number;
  gapA?: number; // header → divider
  gapB?: number; // divider → body
  sigGap?: number;
  noSig?: boolean; // the reel places the signature itself (e.g. beside the last line)
};

export const Highlight: React.FC<{ f?: number; mark: string; children: React.ReactNode }> = ({ mark, children }) => {
  const p = 1;
  return <span style={{ fontWeight: 600, backgroundImage: `linear-gradient(${mark}, ${mark})`, backgroundRepeat: "no-repeat", backgroundPosition: "0 88%", backgroundSize: `${p * 100}% 46%`, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{children}</span>;
};

export const WritingReel: React.FC<WritingProps> = ({ gapA = 48, gapB = 50, noSig = false, sigGap = 46, bg, title, titleSize = 82, paragraphs, bodySize, top = 296, sketch, sketchBox, page2, turnAt = 0, paraGap = 40, lineHeight = 1.45 }) => {
  useFonts();
  const f = useCurrentFrame();
  const C = BGS[bg];
  const t3 = Math.round(titleSize * 80 / 82);
  const draw = (a: number, b: number) => easeOut(seg(f, a, b));
  const sig = <span style={{ display: "inline-block", background: "rgba(154,94,82,0.14)", borderRadius: 10, padding: "12px 28px", fontFamily: "Jost", fontWeight: 400, fontSize: 32, lineHeight: 1.45, color: INK }}>words by — @trulyaariya</span>;
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
        <div style={{ marginTop: gapA, height: 2, width: 840, background: ACCENT, opacity: 0.28 }} />
        {/* body (one page, or two pages stacked in the same grid cell; on two-page reels the signature sits under each page's text) */}
        <div style={{ marginTop: gapB, display: "grid", fontFamily: "Jost", fontWeight: 450, fontSize: bodySize, lineHeight, color: INK, textAlign: "left" }}>
          {(page2 ? [paragraphs, page2] : [paragraphs]).map((set, k, all) => {
            const o = !page2 ? 1 : k === 0 ? 1 - easeOut(seg(f, turnAt - s(0.3), turnAt + s(0.2))) : easeOut(seg(f, turnAt, turnAt + s(0.5)));
            return <div key={k} style={{ gridArea: "1 / 1", opacity: o }}>
              {set.map((p, i) => <Fade key={i} f={f} a={0} b={1} style={{ marginTop: i ? paraGap : 0, ...(k === all.length - 1 && i === set.length - 1 ? { fontStyle: "italic", color: ACCENT } : {}) }}>{p}</Fade>)}
              {page2 && <div style={{ marginTop: 46, fontStyle: "normal" }}>{sig}</div>}
            </div>;
          })}
        </div>
        {!page2 && !noSig && <div style={{ marginTop: sigGap }}>{sig}</div>}
      </div>
    </AbsoluteFill>
  );
};
