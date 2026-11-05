// Reference-2 look (Aariya, 5 Nov): plain letter on an old book page — faint bleed-through text, clean sans, generous paragraph breaks.
import React from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile } from "remotion";

const useInter = () => {
  const [h] = React.useState(() => delayRender("inter"));
  React.useEffect(() => {
    const ff = new FontFace("InterQ", `url(${staticFile("Inter-400.woff2")})`, { weight: "400" });
    ff.load().then((l) => { document.fonts.add(l); continueRender(h); });
  }, [h]);
};

const GHOST = "the evening was quiet and the lamps along the river were lit one by one as she walked home, thinking of letters she had never sent and of the small kindnesses that make a life feel like a home again. ".repeat(14);

export const Ref2: React.FC = () => {
  useInter();
  const P: React.CSSProperties = { marginTop: 50 };
  return (
    <AbsoluteFill style={{ background: "#EEE8D8" }}>
      {/* old page: bleed-through text, foxing, vignette */}
      <div style={{ position: "absolute", inset: "-40px", padding: "120px 70px", transform: "scaleX(-1)", fontFamily: "Georgia, serif", fontSize: 40, lineHeight: "62px", color: "#3a3226", opacity: 0.05, filter: "blur(1.3px)", textAlign: "justify" }}>{GHOST}</div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0) 55%, rgba(120,95,60,0.16) 100%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={3} /><feColorMatrix type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0.55 0" /></filter>
        <rect width={1080} height={1920} filter="url(#g)" opacity={0.14} />
      </svg>
      <div style={{ position: "absolute", left: 110, top: 290, width: 830, fontFamily: "InterQ", fontSize: 40, lineHeight: 1.24, color: "#141414", letterSpacing: -0.3 }}>
        <div>I rate myself 10/10.</div>
        <div style={P}>I was always a 10/10 friend.<br />People just rated me as per their situation.</div>
        <div style={P}>The moment I chose self-respect over selflessness, I became a 9.<br />When I chose my peace over taking sides, I became an 8.<br />The day I started saying no, I became a 7.</div>
        <div style={P}>With every choice I made for myself, my number dropped.</div>
        <div style={P}>But you can’t be a 10/10 for everyone — people will number you as per their convenience.</div>
        <div style={P}>What matters is whether you’re a 10/10 in your own eyes, as a friend, a sister, a daughter, a son.<br />And I still rate myself 10/10. &lt;3</div>
        <div style={P}>Truly yours, @trulyaariya</div>
      </div>
    </AbsoluteFill>
  );
};
