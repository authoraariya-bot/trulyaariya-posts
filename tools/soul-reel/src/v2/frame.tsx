// v2 frame: one bold, saturated background colour per reel, soft vignette + paper grain, white text.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile } from "remotion";

const useFonts2 = () => {
  const [h] = useState(() => delayRender("fonts2"));
  useEffect(() => {
    const faces = [new FontFace("Gaegu", `url(${staticFile("Gaegu700.woff2")})`, { weight: "700" }), new FontFace("Hand", `url(${staticFile("PatrickHand.woff2")})`)];
    Promise.all(faces.map((x) => x.load())).then((l) => { l.forEach((x) => document.fonts.add(x)); continueRender(h); });
  }, [h]);
};

export const Frame2: React.FC<{ bg: string; children: React.ReactNode; overlay?: React.ReactNode }> = ({ bg, children, overlay }) => {
  useFonts2();
  return (
    <AbsoluteFill style={{ background: bg }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="vig2" cx="50%" cy="55%" r="75%"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.28" /></radialGradient>
          <filter id="grain2"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0" /></filter>
          <filter id="soft2"><feGaussianBlur stdDeviation="18" /></filter>
        </defs>
        <rect width={1080} height={1920} fill="url(#vig2)" />
        {children}
        <rect width={1080} height={1920} filter="url(#grain2)" opacity={0.5} />
      </svg>
      {overlay}
    </AbsoluteFill>
  );
};

export const Text2: React.FC<{ children: React.ReactNode; top?: number; size?: number; opacity?: number }> = ({ children, top = 360, size = 66, opacity = 1 }) => (
  <div style={{ position: "absolute", top, left: 110, right: 110, textAlign: "center", fontFamily: "Gaegu", fontWeight: 700, fontSize: size, lineHeight: 1.25, color: "#FFFFFF", opacity, textShadow: "0 2px 0 rgba(0,0,0,0.12)" }}>{children}</div>
);

export const Handle2: React.FC<{ y?: number; opacity?: number }> = ({ y = 1640, opacity = 1 }) => (
  <div style={{ position: "absolute", top: y, left: 0, right: 0, textAlign: "center", fontFamily: "Gaegu", fontWeight: 700, fontSize: 34, color: "#FFFFFF", opacity: 0.9 * opacity, letterSpacing: 1 }}>@trulyaariya</div>
);
