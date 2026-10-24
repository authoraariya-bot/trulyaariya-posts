import React from "react";
import { Composition } from "remotion";
import { Reel2 } from "./master/Reel2";
import { END } from "./master/pose";

// "The Paper Boat" — the approved master Soul reel. Copy src/master to make a new reel.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="PaperBoat" component={Reel2} durationInFrames={END} fps={30} width={1080} height={1920} />
  </>
);
