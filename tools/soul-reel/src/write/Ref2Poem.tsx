// "Rate myself" POEM on the reference-2 old book page (Aariya, 5 Nov): small twirling photo on top, bigger text,
// every poem line kept whole on one line (book serif so the long lines fit), stanzas with breathing space.
import React from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from "remotion";

const useFonts2 = () => {
  const [h] = React.useState(() => delayRender("ebg2"));
  React.useEffect(() => {
    const faces = [
      new FontFace("EBG", `url(${staticFile("EBG-400.woff2")})`, { weight: "400" }),
      new FontFace("EBG", `url(${staticFile("EBG-400i.woff2")})`, { weight: "400", style: "italic" }),
    ];
    Promise.all(faces.map((ff) => ff.load())).then((l) => { l.forEach((ff) => document.fonts.add(ff)); continueRender(h); });
  }, [h]);
};

const GHOST = "the evening was quiet and the lamps along the river were lit one by one as she walked home, thinking of letters she had never sent and of the small kindnesses that make a life feel like a home again. ".repeat(14);

const POEM = [
  ["I was a ten to everyone I knew.", "Their ratings dropped when my self-respect came through."],
  ["The day I stood against their flaws,", "I dropped to a nine, but I never needed their applause."],
  ["I chose my peace and stayed out of their fights,", "and suddenly, I was an eight overnight."],
  ["The first time I said no and let it show,", "they labelled me a seven. But who cares, though?"],
  ["Every time I picked me, their numbers fell,", "and if that’s the price, then you can go to hell."],
  ["You won’t be a ten to everyone, and that’s fine.", "They count you by convenience, every time."],
  ["So I stopped taking the scores they handed me.", "Daughter, sibling, friend, I’m a ten, and I will always be."],
];

export const Ref2Poem: React.FC = () => {
  useFonts2();
  return (
    <AbsoluteFill style={{ background: "#EEE8D8" }}>
      <div style={{ position: "absolute", inset: "-40px", padding: "120px 70px", transform: "scaleX(-1)", fontFamily: "Georgia, serif", fontSize: 40, lineHeight: "62px", color: "#3a3226", opacity: 0.035, filter: "blur(1.6px)", textAlign: "justify" }}>{GHOST}</div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0) 55%, rgba(120,95,60,0.16) 100%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} /><feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0.55 0" /></filter>
        <rect width={1080} height={1920} filter="url(#g)" opacity={0.14} />
      </svg>
      <div style={{ position: "absolute", left: 104, top: 290, width: 440, height: 242, overflow: "hidden" }}>
        <Img src={staticFile("img-twirl.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "42% 18%" }} />
      </div>
      <div style={{ position: "absolute", left: 104, top: 572, width: 836, fontFamily: "EBG", fontSize: 38, lineHeight: 1.22, letterSpacing: -0.2, color: "#141414", whiteSpace: "nowrap" }}>
        {POEM.map((st, i) => (
          <div key={i} style={{ marginTop: i ? 30 : 0, fontStyle: i === POEM.length - 1 ? "italic" : "normal" }}>
            {st.map((l, k) => <div key={k}>{l}</div>)}
          </div>
        ))}
        <div style={{ marginTop: 34 }}>truly yours, @trulyaariya</div>
      </div>
    </AbsoluteFill>
  );
};
