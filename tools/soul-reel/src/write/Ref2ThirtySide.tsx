// "At 30" (Aariya, 26 Nov) — no book line — with the book line under the signature — approved old-book-page look (same as Ref2Poem):
// wide sepia motion-blur header photo (slow push-in), EB Garamond, each "I have seen" pair as its own stanza,
// lines broken at natural pauses, red pen strokes on the contrasts, peach highlight on "And no, you are not alone."
import React from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";

const IMG = "img-thirty.png";

const useFontsRef2ThirtySide = () => {
  const [h] = React.useState(() => delayRender("Ref2ThirtySide"));
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
  ["Married at 30? You’re happy,", <>even if you’re <S>suffocating</S> in that marriage.</>, G("A job at 30? You’re settled,"), <>even if it’s <S>draining you</S>.</>, G("Successful at 30? You’ve made it,"), <>even if it <S>cost your peace</S>.</>],
  ["But if you’re 30, single, still struggling,", <>and <S>truly happy from within</S>,</>, <>they’ll call you a <S>loser</S>.</>],
];

export const Ref2ThirtySide: React.FC = () => {
  useFontsRef2ThirtySide();
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
      <div style={{ position: "absolute", left: 640, top: 284, width: 304, height: 356, filter: "drop-shadow(0 6px 10px rgba(60,40,20,0.28))", transform: "rotate(1.5deg)" }}>
        <div style={{ width: "100%", height: "100%", clipPath: "polygon(0.00% 0.23%, 2.50% 1.40%, 5.00% 0.14%, 7.50% 0.15%, 10.00% 0.46%, 12.50% 0.36%, 15.00% 0.75%, 17.50% 0.12%, 20.00% 0.00%, 22.50% 0.33%, 25.00% 0.22%, 27.50% 0.80%, 30.00% 0.06%, 32.50% 1.92%, 35.00% 1.35%, 37.50% 0.33%, 40.00% 0.55%, 42.50% 0.76%, 45.00% 0.80%, 47.50% 0.27%, 50.00% 1.87%, 52.50% 2.18%, 55.00% 1.03%, 57.50% 1.06%, 60.00% 0.19%, 62.50% 0.22%, 65.00% 0.75%, 67.50% 0.58%, 70.00% 1.82%, 72.50% 0.36%, 75.00% 0.05%, 77.50% 2.09%, 80.00% 1.16%, 82.50% 0.32%, 85.00% 1.19%, 87.50% 0.06%, 90.00% 1.16%, 92.50% 2.15%, 95.00% 1.90%, 97.50% 1.53%, 100.00% 0.57%, 99.19% 2.50%, 99.63% 5.00%, 98.30% 7.50%, 98.83% 10.00%, 98.29% 12.50%, 99.27% 15.00%, 99.51% 17.50%, 98.21% 20.00%, 97.83% 22.50%, 98.12% 25.00%, 98.23% 27.50%, 98.20% 30.00%, 98.37% 32.50%, 99.50% 35.00%, 98.86% 37.50%, 99.22% 40.00%, 99.94% 42.50%, 99.94% 45.00%, 99.39% 47.50%, 99.43% 50.00%, 98.48% 52.50%, 97.90% 55.00%, 99.02% 57.50%, 97.94% 60.00%, 97.83% 62.50%, 97.90% 65.00%, 99.20% 67.50%, 99.51% 70.00%, 99.50% 72.50%, 99.57% 75.00%, 99.55% 77.50%, 98.63% 80.00%, 98.02% 82.50%, 98.15% 85.00%, 98.95% 87.50%, 98.56% 90.00%, 98.24% 92.50%, 99.81% 95.00%, 98.55% 97.50%, 100.00% 98.00%, 97.50% 98.28%, 95.00% 98.35%, 92.50% 98.95%, 90.00% 99.61%, 87.50% 98.26%, 85.00% 99.27%, 82.50% 98.24%, 80.00% 97.86%, 77.50% 99.13%, 75.00% 99.12%, 72.50% 97.92%, 70.00% 98.41%, 67.50% 99.63%, 65.00% 99.72%, 62.50% 99.67%, 60.00% 98.01%, 57.50% 98.23%, 55.00% 99.68%, 52.50% 98.18%, 50.00% 97.84%, 47.50% 98.55%, 45.00% 99.23%, 42.50% 98.79%, 40.00% 99.71%, 37.50% 99.97%, 35.00% 97.86%, 32.50% 98.57%, 30.00% 98.84%, 27.50% 97.95%, 25.00% 99.05%, 22.50% 98.08%, 20.00% 98.18%, 17.50% 99.54%, 15.00% 99.45%, 12.50% 99.36%, 10.00% 99.47%, 7.50% 98.71%, 5.00% 99.43%, 2.50% 99.08%, 0.00% 99.71%, 2.00% 97.50%, 0.78% 95.00%, 1.01% 92.50%, 1.28% 90.00%, 1.99% 87.50%, 0.93% 85.00%, 2.02% 82.50%, 1.10% 80.00%, 1.17% 77.50%, 1.15% 75.00%, 0.04% 72.50%, 0.97% 70.00%, 0.40% 67.50%, 0.01% 65.00%, 1.76% 62.50%, 0.38% 60.00%, 1.04% 57.50%, 1.60% 55.00%, 1.22% 52.50%, 0.72% 50.00%, 1.14% 47.50%, 1.22% 45.00%, 1.73% 42.50%, 0.23% 40.00%, 1.23% 37.50%, 0.55% 35.00%, 0.61% 32.50%, 1.70% 30.00%, 1.12% 27.50%, 1.24% 25.00%, 1.67% 22.50%, 2.01% 20.00%, 0.98% 17.50%, 1.35% 15.00%, 1.11% 12.50%, 1.13% 10.00%, 1.52% 7.50%, 1.00% 5.00%, 1.17% 2.50%)" }}><Img src={staticFile(IMG)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "22% 30%", transform: `scale(${z})`, transformOrigin: "50% 30%" }} /></div>
      </div>
      <div style={{ position: "absolute", left: 96, top: 384, width: 520, fontFamily: "EBG", fontSize: 40, lineHeight: 1.14, letterSpacing: -0.4, color: "#141414", whiteSpace: "nowrap" }}>
        <div>If you’re 30 and not married,</div>
        <div>society calls you <S>too old</S>.</div>
        <div>If you die at 30,</div>
        <div>the same society calls you</div>
        <div><S>too young</S>.</div>
      </div>
      <div style={{ position: "absolute", left: 96, top: 668, width: 848, fontFamily: "EBG", fontSize: 40, lineHeight: 1.14, letterSpacing: -0.4, color: "#141414", whiteSpace: "nowrap" }}>
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
