// "Rate myself" POEM on the reference-2 old book page (Aariya, 5 Nov): small twirling photo on top, bigger text,
// every poem line kept whole on one line (book serif so the long lines fit), stanzas with breathing space.
import React from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";

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

// red pen stroke under the numbers, peach highlighter on the closing lines (Aariya, 5 Nov)
const N: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  // a loose hand-drawn red pen stroke under the word, running a little past it (like the reference posts)
  <span style={{ position: "relative", display: "inline-block", color: "#B3262E" }}>
    {children}
    <svg viewBox="0 0 100 12" preserveAspectRatio="none" style={{ position: "absolute", left: "-8%", bottom: -9, width: "122%", height: 14, overflow: "visible" }}>
      <path d="M1,7.5 C14,5.6 30,8.8 48,6.6 C64,4.8 80,7.4 99,5" stroke="#B8303A" strokeWidth={3.2} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  </span>
);
const H: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ background: "linear-gradient(transparent 12%, rgba(240,150,110,0.55) 12%, rgba(240,150,110,0.55) 92%, transparent 92%)", borderRadius: 6, padding: "0 6px", margin: "0 -6px", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{children}</span>
);

const POEM: React.ReactNode[][] = [
  [<>I was a <N>ten</N> to everyone I knew.</>, "Their ratings dropped when my self-respect came through."],
  ["The day I stood against their flaws,", <>I dropped to a <N>nine</N>, but I never needed their applause.</>],
  ["I chose my peace and stayed out of their fights,", <>and suddenly, I was an <N>eight</N> overnight.</>],
  ["The first time I said no and let it show,", <>they labelled me a <N>seven</N>. But who cares, though?</>],
  ["Every time I picked me, their numbers fell,", "and if that’s the price, then you can go to hell."],
  ["You won’t be a ten to everyone, and that’s fine.", "They count you by convenience, every time."],
  [<H>So I stopped taking the scores they handed me.</H>, <>Daughter, sibling, friend, <H>I’m a ten, and I will always be.</H></>],
];

export const Ref2Poem: React.FC = () => {
  useFonts2();
  // only the photo moves: a slow, gentle push-in over the 15 s; all text stays still
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
      <div style={{ position: "absolute", left: 96, top: 290, width: 848, height: 262, overflow: "hidden" }}>
        <Img src={staticFile("img-twirl.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "45% 6%", transform: `scale(${z})`, transformOrigin: "45% 30%" }} />
      </div>
      <div style={{ position: "absolute", left: 96, top: 590, width: 860, fontFamily: "EBG", fontSize: 40, lineHeight: 1.19, letterSpacing: -0.5, color: "#141414", whiteSpace: "nowrap" }}>
        {POEM.map((st, i) => (
          <div key={i} style={{ marginTop: i ? 24 : 0, fontStyle: i === POEM.length - 1 ? "italic" : "normal" }}>
            {st.map((l, k) => <div key={k}>{l}</div>)}
          </div>
        ))}
        <div style={{ marginTop: 30, fontSize: 46, fontStyle: "italic", letterSpacing: 0 }}>truly yours, @trulyaariya</div>
      </div>
    </AbsoluteFill>
  );
};
