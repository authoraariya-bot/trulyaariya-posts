// "Left it to the universe" (Aariya, 28 Nov) — long story piece, no image, no book line — with the book line under the signature — approved old-book-page look (same as Ref2Poem):
// wide sepia motion-blur header photo (slow push-in), EB Garamond, each "I have seen" pair as its own stanza,
// lines broken at natural pauses, red pen strokes on the contrasts, peach highlight on "And no, you are not alone."
import React from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile } from "remotion";



const useFonts18 = () => {
  const [h] = React.useState(() => delayRender("ebg18"));
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

// spacing exactly as Aariya grouped it (28 Nov)
const ST: React.ReactNode[][] = [
  ["You finally message them.", "And you write everything."],
  [<>The <S>storm inside you</S>. The words that hurt.</>, "The ignorance you felt every single second."],
  [<>You <S>cry while writing it</S>.</>, <>What you wanted was <S>never big</S>.</>],
  ["Just a silent stand. Their voice for you in the crowd.", <>A little love. A <S>special mention</S>.</>, "But you got ignorance. Jokes. Doubts. Blame."],
  [<>They made you feel <S>unwanted</S>.</>, "Not special enough to mention.", "Still, you kept tying the two ends of a rope", "that broke long ago,", <>not knowing the other end <S>never wanted to be tied</S>.</>],
  [<>Until one day, you felt <S>ashamed</S> of how much</>, "your soul had endured, just to keep them.", <>And it took <S>just a second</S> to end a bond,</>, "for someone who always found it so hard to end things."],
  ["With a pinch of salt in your heart,", "you almost wished they’d live the same pain you did.", <>But your soul couldn’t carry the weight of <S>revenge</S></>, <>for someone you once loved, so it <S>let that go</S> too.</>],
];

export const Ref2Universe: React.FC = () => {
  useFonts18();
  return (
    <AbsoluteFill style={{ background: "#EEE8D8" }}>
      <div style={{ position: "absolute", inset: "-40px", padding: "120px 70px", transform: "scaleX(-1)", fontFamily: "Georgia, serif", fontSize: 40, lineHeight: "62px", color: "#3a3226", opacity: 0.035, filter: "blur(1.6px)", textAlign: "justify" }}>{GHOST}</div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0) 55%, rgba(120,95,60,0.16) 100%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} /><feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0.55 0" /></filter>
        <rect width={1080} height={1920} filter="url(#g)" opacity={0.14} />
      </svg>
      <div style={{ position: "absolute", left: 96, top: 300, width: 848, fontFamily: "EBG", fontSize: 36, lineHeight: 1.16, letterSpacing: -0.4, color: "#141414", whiteSpace: "nowrap" }}>
        {ST.map((st, i) => (
          <div key={i} style={{ marginTop: i ? 21 : 0 }}>{st.map((l, k) => <div key={k}>{l}</div>)}</div>
        ))}
        <div style={{ marginTop: 22, fontStyle: "italic", fontSize: 44 }}>
          <div><H>So you left it to the universe.</H></div>
        </div>
        <div style={{ marginTop: 22, fontSize: 46, fontStyle: "italic", letterSpacing: 0 }}>truly yours, @trulyaariya</div>
      </div>
    </AbsoluteFill>
  );
};
