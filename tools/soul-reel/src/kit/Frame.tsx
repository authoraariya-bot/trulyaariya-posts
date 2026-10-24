// Composition shell shared by every Soul reel (fonts, static paper grain, audio) — as in src/master/Reel2.tsx.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile } from "remotion";
import { Audio } from "@remotion/media";

export const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("Cormorant", `url(${staticFile("CormorantGaramond.ttf")})`, { weight: "300 700" }),
      new FontFace("Cormorant", `url(${staticFile("CormorantGaramond-Italic.ttf")})`, { weight: "300 700", style: "italic" }),
      new FontFace("Caveat", `url(${staticFile("Caveat.ttf")})`, { weight: "400 700" }),
      new FontFace("Jost", `url(${staticFile("Jost.ttf")})`, { weight: "100 900" }),
    ];
    Promise.all(faces.map((ff) => ff.load())).then((l) => { l.forEach((ff) => document.fonts.add(ff)); continueRender(handle); });
  }, [handle]);
};

export const Frame: React.FC<{ world: React.ReactNode; overlay: React.ReactNode; audio?: string }> = ({ world, overlay, audio }) => {
  useFonts();
  return (
    <AbsoluteFill style={{ backgroundColor: "#F4EEE4" }}>
      <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="grain2" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={2} seed={9} stitchTiles="stitch" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.32  0 0 0 0.5 0" />
          </filter>
        </defs>
        {world}
        <rect width={1080} height={1920} filter="url(#grain2)" opacity={0.08} style={{ mixBlendMode: "multiply" }} />
      </svg>
      {overlay}
      {audio ? <Audio src={staticFile(audio)} /> : null}
    </AbsoluteFill>
  );
};
