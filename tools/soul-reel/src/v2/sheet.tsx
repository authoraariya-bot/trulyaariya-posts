import React from "react";
import { useCurrentFrame } from "remotion";
import { Frame2, Text2, Handle2 } from "./frame";
import { Soul2 } from "./Soul2";

const Cup = () => (<g transform="translate(-4 -30)"><path d="M-22,-40 L22,-40 L17,10 L-17,10 Z" fill="#FFFFFF" stroke="#3A2420" strokeWidth={2.5} /><rect x={-24} y={-48} width={48} height={10} rx={4} fill="#8B5E3C" stroke="#3A2420" strokeWidth={2.5} /><rect x={-18} y={-26} width={36} height={16} fill="#E5383B" /><path d={"M-6,-56 c-6,-10 6,-16 0,-26"} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.8} /></g>);

const PANELS = [
  { bg: "#8F7AE6", t: "hi, i'm the soul.\nhealing, but make it cute.", p: { armR: 150, elbowR: 10, mouth: "grin" as const, head: 4 } },
  { bg: "#5FAF8A", t: "soft heart.\nsharp boundaries.", p: { armL: 48, elbowL: 100, armR: 10, mouth: "smirk" as const, brow: 1, head: -5, lean: -2 } },
  { bg: "#5E9BE0", t: "shades up when it's real.", p: { armL: 30, elbowL: 120, mouth: "smile" as const, shades: 0, head: -3 } },
];

export const SoulSheet: React.FC = () => {
  const f = useCurrentFrame(); const P = PANELS[f % 3];
  return (
    <Frame2 bg={P.bg} overlay={<><Text2 top={360}>{P.t.split("\n").map((l, i) => <div key={i}>{l}</div>)}</Text2><Handle2 /></>}>
      <Soul2 x={540} y={1560} s={2.1} p={P.p} handL={f % 3 === 2 ? <Cup /> : undefined} />
    </Frame2>
  );
};
