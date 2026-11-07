// "True Diwali" (Aariya, 7 Nov) — approved old-book-page look (same as Ref2Poem):
// wide sepia motion-blur header photo (slow push-in), EB Garamond, each "I have seen" pair as its own stanza,
// lines broken at natural pauses, red pen strokes on the contrasts, peach highlight on "And no, you are not alone."
import React from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";

const IMG = "img-diwali.png";

const useFonts4 = () => {
  const [h] = React.useState(() => delayRender("ebg4"));
  React.useEffect(() => {
    const faces = [
      new FontFace("EBG", `url(${staticFile("EBG-400.woff2")})`, { weight: "400" }),
      new FontFace("EBG", `url(${staticFile("EBG-400i.woff2")})`, { weight: "400", style: "italic" }),
    ];
    Promise.all(faces.map((ff) => ff.load())).then((l) => { l.forEach((ff) => document.fonts.add(ff)); continueRender(h); });
  }, [h]);
};

const GHOST = "the evening was quiet and the lamps along the river were lit one by one as she walked home, thinking of letters she had never sent and of the small kindnesses that make a life feel like a home again. ".repeat(14);

// proper straight red underline (Aariya, 6 Nov: "underline should be proper and not a stroke")
const S: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ textDecorationLine: "underline", textDecorationColor: "#B8303A", textDecorationThickness: 3, textUnderlineOffset: 7, textDecorationSkipInk: "none" }}>{children}</span>
);
const H: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ background: "linear-gradient(transparent 12%, rgba(240,150,110,0.55) 12%, rgba(240,150,110,0.55) 92%, transparent 92%)", borderRadius: 6, padding: "0 6px", margin: "0 -6px" }}>{children}</span>
);

const ST: React.ReactNode[][] = [
  ["Every Diwali, we clean every corner of our house,", <>making sure <S>not a single speck</S></>, <><S>of dust</S> is left behind.</>],
  [<>But we never look into our <S>own soul</S></>, "to see what’s been bothering us.", "The pain we kept carrying.", "The words we never let go of.", <>Some dust never deserved to <S>crowd your soul</S>.</>],
  ["A true happy Diwali is when you", "finally clear it all out,", <>and <S>make space for yourself</S> again.</>],
];

export const Ref2Diwali: React.FC = () => {
  useFonts4();
  const f = useCurrentFrame();
  const z = 1 + 0.07 * (f / 449);
  return (
    <AbsoluteFill style={{ background: "#EEE8D8" }}>
      <div style={{ position: "absolute", inset: "-40px", padding: "120px 70px", transform: "scaleX(-1)", fontFamily: "Georgia, serif", fontSize: 40, lineHeight: "62px", color: "#3a3226", opacity: 0.035, filter: "blur(1.6px)", textAlign: "justify" }}>{GHOST}</div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0) 55%, rgba(120,95,60,0.16) 100%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} /><feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0.55 0" /></filter>
        <rect width={1080} height={1920} filter="url(#g)" opacity={0.14} />
      </svg>
      <div style={{ position: "absolute", left: 96, top: 284, width: 848, height: 270, overflow: "hidden" }}>
        <Img src={staticFile(IMG)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 44%", transform: `scale(${z})`, transformOrigin: "45% 55%" }} />
      </div>
      <div style={{ position: "absolute", left: 96, top: 604, width: 848, fontFamily: "EBG", fontSize: 44, lineHeight: 1.15, letterSpacing: -0.4, color: "#141414", whiteSpace: "nowrap" }}>
        {ST.map((st, i) => (
          <div key={i} style={{ marginTop: i ? 18 : 0 }}>{st.map((l, k) => <div key={k}>{l}</div>)}</div>
        ))}
        <div style={{ marginTop: 18, fontStyle: "italic" }}>
          <div>So even if you light one less diya</div>
          <div>at home this year,</div>
          <div>make sure you light <S>a thousand within your soul</S>.</div>
          <div><H>Because that is your true Diwali.</H></div>
        </div>
        <div style={{ marginTop: 22, fontSize: 46, fontStyle: "italic", letterSpacing: 0 }}>truly yours, @trulyaariya</div>
      </div>
    </AbsoluteFill>
  );
};
