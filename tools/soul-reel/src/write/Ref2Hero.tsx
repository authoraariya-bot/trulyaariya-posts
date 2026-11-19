// "Be the hero of your own story" (Aariya, 19 Nov) — with book line — with the book line under the signature — approved old-book-page look (same as Ref2Poem):
// wide sepia motion-blur header photo (slow push-in), EB Garamond, each "I have seen" pair as its own stanza,
// lines broken at natural pauses, red pen strokes on the contrasts, peach highlight on "And no, you are not alone."
import React from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";

const IMG = "img-hero.png";

const useFonts14 = () => {
  const [h] = React.useState(() => delayRender("ebg14"));
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
  [<>The day you stop portraying yourself as a <S>victim</S>,</>, <>your suffering finally gets its <S>justice</S>.</>],
  ["The loop of pain never ends", <>until you see <S>what it came to teach you</S>.</>],
  ["I spent half my life telling my story as a victim,", <>and the world started labelling me <S>weak</S>.</>],
  [<>But the day I started telling it as a <S>hero</S></>, <>who endured it all and <S>came out stronger</S>,</>, "I changed the way everyone saw me."],
  ["So before you change your perspective", <>towards anything, <S>change it towards yourself</S>.</>],
];

export const Ref2Hero: React.FC = () => {
  useFonts14();
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
      <div style={{ position: "absolute", left: 96, top: 284, width: 848, height: 280, overflow: "hidden" }}>
        <Img src={staticFile(IMG)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%", transform: `scale(${z})`, transformOrigin: "33% 40%" }} />
      </div>
      <div style={{ position: "absolute", left: 96, top: 614, width: 848, fontFamily: "EBG", fontSize: 43, lineHeight: 1.16, letterSpacing: -0.4, color: "#141414", whiteSpace: "nowrap" }}>
        {ST.map((st, i) => (
          <div key={i} style={{ marginTop: i ? 24 : 0 }}>{st.map((l, k) => <div key={k}>{l}</div>)}</div>
        ))}
        <div style={{ marginTop: 26, fontStyle: "italic", fontSize: 50 }}>
          <div><H>Be the hero of your own story.</H></div>
        </div>
        <div style={{ marginTop: 18, fontSize: 50, fontStyle: "italic", letterSpacing: 0 }}>truly yours, @trulyaariya</div>
        <div style={{ marginTop: 16, fontSize: 38, fontStyle: "italic", letterSpacing: 0, color: "#5a4a3e" }}>from my upcoming book, <span style={{ color: "#B3262E" }}>A Self Repaired Soul</span></div>
      </div>
    </AbsoluteFill>
  );
};
