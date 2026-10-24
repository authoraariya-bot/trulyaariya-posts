import React from "react";
import { Composition } from "remotion";
import { Reel3 } from "./master/Reel2";
import { END } from "./master/pose";
import { Soul1025, END as E1025 } from "./r1025/Reel";

// "The Paper Boat" v2 — the approved master Soul reel (face, playful skip, golden river, fresh colours).
// Copy src/master to src/<reel-id>/ to make a new reel. The soul, face, style and end card are locked.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="PaperBoat" component={Reel3} durationInFrames={END} fps={30} width={1080} height={1920} />
    <Composition id="Soul1025" component={Soul1025} durationInFrames={E1025} fps={30} width={1080} height={1920} />
  </>
);
