// Reference looks 1 and 4 (Aariya, 5 Nov) for "I rate myself 10/10".
// 1: warm taupe grain, vintage illustration block, white italic Garamond, red pen underlines, small sans signature.
// 4: pale paper with soft window-light shadows, sepia photo block, black Garamond, italic signature.
import React from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from "remotion";

const useGaramond = () => {
  const [h] = React.useState(() => delayRender("ebg"));
  React.useEffect(() => {
    const faces = [
      new FontFace("EBG", `url(${staticFile("EBG-400.woff2")})`, { weight: "400" }),
      new FontFace("EBG", `url(${staticFile("EBG-500.woff2")})`, { weight: "500" }),
      new FontFace("EBG", `url(${staticFile("EBG-400i.woff2")})`, { weight: "400", style: "italic" }),
      new FontFace("InterQ", `url(${staticFile("Inter-400.woff2")})`, { weight: "400" }),
    ];
    Promise.all(faces.map((ff) => ff.load())).then((l) => { l.forEach((ff) => document.fonts.add(ff)); continueRender(h); });
  }, [h]);
};

const Grain: React.FC<{ o: number; tint?: string }> = ({ o, tint = "0 0 0 0 0.2  0 0 0 0 0.17  0 0 0 0 0.14  0 0 0 0.6 0" }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves={2} seed={5} /><feColorMatrix type="matrix" values={tint} /></filter>
    <rect width={1080} height={1920} filter="url(#g)" opacity={o} />
  </svg>
);

// red pen underline (slightly loose, like the reference)
const U: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ textDecorationLine: "underline", textDecorationColor: "#B8333B", textDecorationThickness: 3, textUnderlineOffset: 9, textDecorationSkipInk: "none" }}>{children}</span>
);

export const Ref1: React.FC = () => {
  useGaramond();
  return (
    <AbsoluteFill style={{ background: "#6C5B51" }}>
      <Grain o={0.5} tint="0 0 0 0 0.85  0 0 0 0 0.8  0 0 0 0 0.75  0 0 0 0.35 0" />
      <Grain o={0.35} />
      <div style={{ position: "absolute", left: 100, top: 290, width: 460, height: 338, overflow: "hidden", boxShadow: "0 6px 20px rgba(0,0,0,0.25)" }}>
        <Img src={staticFile("img-hug.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 30%", filter: "sepia(0.15) saturate(0.9)" }} />
      </div>
      <div style={{ position: "absolute", left: 100, top: 664, width: 840, fontFamily: "EBG", fontStyle: "italic", fontSize: 42, lineHeight: 1.16, whiteSpace: "nowrap", color: "#FBF6EE" }}>
        <div>I was always a <U>10/10 friend.</U></div>
        <div>People just rated me as per their situation.</div>
        <div style={{ marginTop: 12 }}>The moment I chose <U>self-respect</U> over selflessness,</div>
        <div>I became a 9.</div>
        <div>When I chose <U>my peace</U> over taking sides,</div>
        <div>I became an 8.</div>
        <div>The day I started <U>saying no</U>, I became a 7.</div>
        <div>With every choice I made for myself,</div>
        <div>my number dropped.</div>
        <div style={{ marginTop: 12 }}>But you can’t be a 10/10 for everyone —</div>
        <div>people will number you as per their convenience.</div>
        <div>What matters is whether you’re a 10/10</div>
        <div><U>in your own eyes,</U></div>
        <div>as a friend, a sister, a daughter, a son.</div>
        <div style={{ marginTop: 12 }}>And I still rate myself <U>10/10.</U></div>
      </div>
      <div style={{ position: "absolute", right: 140, top: 1460, fontFamily: "InterQ", fontSize: 29, color: "#F3ECE2" }}>- trulyaariya</div>
    </AbsoluteFill>
  );
};

export const Ref4: React.FC = () => {
  useGaramond();
  return (
    <AbsoluteFill style={{ background: "#E9E6E1" }}>
      {/* soft window-light shadows */}
      <div style={{ position: "absolute", inset: "-300px", background: "repeating-linear-gradient(125deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0) 140px, rgba(255,252,245,0.75) 200px, rgba(255,252,245,0) 280px, rgba(120,105,90,0.10) 420px, rgba(120,105,90,0) 520px)", filter: "blur(28px)" }} />
      <Grain o={0.22} />
      <div style={{ position: "absolute", left: 100, top: 290, width: 840, height: 330, overflow: "hidden" }}>
        <Img src={staticFile("img-twirl.png")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "40% 14%" }} />
      </div>
      <div style={{ position: "absolute", left: 100, top: 660, width: 840, fontFamily: "EBG", fontSize: 42, lineHeight: 1.16, whiteSpace: "nowrap", color: "#141210" }}>
        <div>I was always a 10/10 friend.</div>
        <div>People just rated me as per their situation.</div>
        <div style={{ marginTop: 12 }}>The moment I chose self-respect over selflessness,</div>
        <div>I became a 9.</div>
        <div>When I chose my peace over taking sides,</div>
        <div>I became an 8.</div>
        <div>The day I started saying no, I became a 7.</div>
        <div>With every choice I made for myself,</div>
        <div>my number dropped.</div>
        <div style={{ marginTop: 12 }}>But you can’t be a 10/10 for everyone —</div>
        <div>people will number you as per their convenience.</div>
        <div>What matters is whether you’re a 10/10</div>
        <div>in your own eyes,</div>
        <div>as a friend, a sister, a daughter, a son.</div>
        <div style={{ marginTop: 12 }}>And I still rate myself 10/10.</div>
      </div>
      <div style={{ position: "absolute", right: 140, top: 1440, fontFamily: "EBG", fontStyle: "italic", fontSize: 40, color: "#141210" }}>- trulyaariya</div>
    </AbsoluteFill>
  );
};
