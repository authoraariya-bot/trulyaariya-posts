import React from "react";
import { Composition } from "remotion";
import { Reel3 } from "./master/Reel2";
import { END } from "./master/pose";
import { Soul1025, END as E1025 } from "./r1025/Reel";
import { Soul1026, END as E1026 } from "./r1026/Reel";
import { Soul1027, END as E1027 } from "./r1027/Reel";
import { Soul1028, END as E1028 } from "./r1028/Reel";
import { Soul1029, END as E1029 } from "./r1029/Reel";
import { Q1026, END as Q26 } from "./q/q1026";
import { Q1027, END as Q27 } from "./q/q1027";
import { Q1028, END as Q28 } from "./q/q1028";
import { Q1029, END as Q29 } from "./q/q1029";
import { Q1031, END as Q31 } from "./q/q1031";
import { Q1101, END as Q1101E } from "./q/q1101";
import { Q1102, END as Q1102E } from "./q/q1102";
import { Q1103, END as Q1103E } from "./q/q1103";
import { Q1104, END as Q1104E } from "./q/q1104";
import { Q1106, END as Q1106E } from "./q/q1106";
import { Q1107, END as Q1107E } from "./q/q1107";
import { Q1108, END as Q1108E } from "./q/q1108";
import { Q1109, END as Q1109E } from "./q/q1109";

// "The Paper Boat" v2 — the approved master Soul reel (face, playful skip, golden river, fresh colours).
// Copy src/master to src/<reel-id>/ to make a new reel. The soul, face, style and end card are locked.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="PaperBoat" component={Reel3} durationInFrames={END} fps={30} width={1080} height={1920} />
    <Composition id="Soul1025" component={Soul1025} durationInFrames={E1025} fps={30} width={1080} height={1920} />
    <Composition id="Soul1026" component={Soul1026} durationInFrames={E1026} fps={30} width={1080} height={1920} />
    <Composition id="Soul1027" component={Soul1027} durationInFrames={E1027} fps={30} width={1080} height={1920} />
    <Composition id="Soul1028" component={Soul1028} durationInFrames={E1028} fps={30} width={1080} height={1920} />
    <Composition id="Soul1029" component={Soul1029} durationInFrames={E1029} fps={30} width={1080} height={1920} />
    <Composition id="Q1026" component={Q1026} durationInFrames={Q26} fps={30} width={1080} height={1920} />
    <Composition id="Q1027" component={Q1027} durationInFrames={Q27} fps={30} width={1080} height={1920} />
    <Composition id="Q1028" component={Q1028} durationInFrames={Q28} fps={30} width={1080} height={1920} />
    <Composition id="Q1029" component={Q1029} durationInFrames={Q29} fps={30} width={1080} height={1920} />
    <Composition id="Q1031" component={Q1031} durationInFrames={Q31} fps={30} width={1080} height={1920} />
    <Composition id="Q1101" component={Q1101} durationInFrames={Q1101E} fps={30} width={1080} height={1920} />
    <Composition id="Q1102" component={Q1102} durationInFrames={Q1102E} fps={30} width={1080} height={1920} />
    <Composition id="Q1103" component={Q1103} durationInFrames={Q1103E} fps={30} width={1080} height={1920} />
    <Composition id="Q1104" component={Q1104} durationInFrames={Q1104E} fps={30} width={1080} height={1920} />
    <Composition id="Q1106" component={Q1106} durationInFrames={Q1106E} fps={30} width={1080} height={1920} />
    <Composition id="Q1107" component={Q1107} durationInFrames={Q1107E} fps={30} width={1080} height={1920} />
    <Composition id="Q1108" component={Q1108} durationInFrames={Q1108E} fps={30} width={1080} height={1920} />
    <Composition id="Q1109" component={Q1109} durationInFrames={Q1109E} fps={30} width={1080} height={1920} />
  </>
);
