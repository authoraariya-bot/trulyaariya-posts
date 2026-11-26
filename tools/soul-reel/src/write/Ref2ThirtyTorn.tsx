// "At 30" (Aariya, 26 Nov) — no book line — with the book line under the signature — approved old-book-page look (same as Ref2Poem):
// wide sepia motion-blur header photo (slow push-in), EB Garamond, each "I have seen" pair as its own stanza,
// lines broken at natural pauses, red pen strokes on the contrasts, peach highlight on "And no, you are not alone."
import React from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";

const IMG = "img-thirty.png";

const useFontsRef2ThirtyTorn = () => {
  const [h] = React.useState(() => delayRender("Ref2ThirtyTorn"));
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

const G = (n: React.ReactNode) => <div style={{ marginTop: 10 }}>{n}</div>;
const ST: React.ReactNode[][] = [
  ["If you’re 30 and not married,", <>society calls you <S>too old</S>.</>, "If you die at 30,", <>the same society calls you <S>too young</S>.</>],
  ["Married at 30? You’re happy,", <>even if you’re <S>suffocating</S> in that marriage.</>, G("A job at 30? You’re settled,"), <>even if it’s <S>draining you</S>.</>, G("Successful at 30? You’ve made it,"), <>even if it <S>cost your peace</S>.</>],
  ["But if you’re 30, single, still struggling,", <>and <S>truly happy from within</S>,</>, <>they’ll call you a <S>loser</S>.</>],
];

export const Ref2ThirtyTorn: React.FC = () => {
  useFontsRef2ThirtyTorn();
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
      <div style={{ position: "absolute", left: 90, top: 280, width: 860, height: 220, filter: "drop-shadow(0 6px 10px rgba(60,40,20,0.28))" }}>
        <div style={{ width: "100%", height: "100%", clipPath: "polygon(0.00% 0.52%, 1.67% 0.24%, 3.33% 1.04%, 5.00% 0.12%, 6.67% 0.86%, 8.33% 0.59%, 10.00% 0.09%, 11.67% 0.81%, 13.33% 0.06%, 15.00% 0.69%, 16.67% 0.11%, 18.33% 0.15%, 20.00% 0.68%, 21.67% 1.32%, 23.33% 0.20%, 25.00% 0.36%, 26.67% 1.00%, 28.33% 1.52%, 30.00% 0.92%, 31.67% 0.63%, 33.33% 1.56%, 35.00% 0.07%, 36.67% 1.37%, 38.33% 0.46%, 40.00% 0.23%, 41.67% 0.19%, 43.33% 0.49%, 45.00% 1.31%, 46.67% 0.29%, 48.33% 0.93%, 50.00% 1.02%, 51.67% 0.60%, 53.33% 0.88%, 55.00% 0.10%, 56.67% 0.10%, 58.33% 0.33%, 60.00% 1.09%, 61.67% 0.68%, 63.33% 0.50%, 65.00% 0.94%, 66.67% 0.73%, 68.33% 0.48%, 70.00% 1.27%, 71.67% 1.12%, 73.33% 0.39%, 75.00% 0.92%, 76.67% 0.84%, 78.33% 1.40%, 80.00% 1.17%, 81.67% 0.46%, 83.33% 1.57%, 85.00% 0.19%, 86.67% 0.67%, 88.33% 1.21%, 90.00% 0.24%, 91.67% 0.78%, 93.33% 0.06%, 95.00% 1.07%, 96.67% 1.22%, 98.33% 0.92%, 100.00% 1.40%, 100.00% 99.50%, 98.33% 98.89%, 96.67% 99.05%, 95.00% 99.07%, 93.33% 99.27%, 91.67% 98.66%, 90.00% 98.49%, 88.33% 99.24%, 86.67% 98.94%, 85.00% 99.90%, 83.33% 98.88%, 81.67% 98.96%, 80.00% 98.41%, 78.33% 98.68%, 76.67% 99.54%, 75.00% 99.38%, 73.33% 98.93%, 71.67% 99.96%, 70.00% 99.26%, 68.33% 99.73%, 66.67% 99.81%, 65.00% 99.91%, 63.33% 98.77%, 61.67% 99.79%, 60.00% 99.60%, 58.33% 99.37%, 56.67% 98.61%, 55.00% 99.87%, 53.33% 99.28%, 51.67% 99.12%, 50.00% 98.59%, 48.33% 98.69%, 46.67% 98.62%, 45.00% 99.55%, 43.33% 99.34%, 41.67% 99.43%, 40.00% 98.59%, 38.33% 98.47%, 36.67% 99.76%, 35.00% 99.72%, 33.33% 99.63%, 31.67% 99.63%, 30.00% 99.22%, 28.33% 99.06%, 26.67% 99.58%, 25.00% 99.99%, 23.33% 99.33%, 21.67% 99.41%, 20.00% 99.09%, 18.33% 98.48%, 16.67% 98.90%, 15.00% 99.18%, 13.33% 99.01%, 11.67% 98.92%, 10.00% 99.91%, 8.33% 98.56%, 6.67% 98.75%, 5.00% 98.60%, 3.33% 98.72%, 1.67% 99.37%, 0.00% 99.36%)" }}><Img src={staticFile(IMG)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 4%", transform: `scale(${z})`, transformOrigin: "50% 30%" }} /></div>
      </div>
      <div style={{ position: "absolute", left: 96, top: 544, width: 848, fontFamily: "EBG", fontSize: 40, lineHeight: 1.14, letterSpacing: -0.4, color: "#141414", whiteSpace: "nowrap" }}>
        {ST.map((st, i) => (
          <div key={i} style={{ marginTop: i ? 19 : 0 }}>{st.map((l, k) => <div key={k}>{l}</div>)}</div>
        ))}
        <div style={{ marginTop: 22, fontStyle: "italic", fontSize: 43 }}>
          <div>So don’t let society</div>
          <div>measure your life by your age.</div>
          <div style={{ marginTop: 6 }}><H>At 30, 40 or 50, the only thing that matters</H></div>
          <div><H>is whether you’re truly living.</H></div>
        </div>
        <div style={{ marginTop: 20, fontSize: 50, fontStyle: "italic", letterSpacing: 0 }}>truly yours, @trulyaariya</div>
      </div>
    </AbsoluteFill>
  );
};
