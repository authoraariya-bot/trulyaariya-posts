// 13 Nov · "I miss the version of me who… sang loudly in the car… ate cake for breakfast… laughed without checking
// who was watching. She's not gone. She's waiting for me to let her play again."
// An empty swing hangs still from a tree. The Soul stands beside it, and little memory bubbles float up: music notes,
// a slice of cake, a big "haha". On "she's not gone" the memories drift over to the swing and it starts to sway on
// its own. The Soul walks over, hops on, and swings higher and higher, laughing, with notes and confetti flying.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, LSoul, Spark, INK, LW, seg, sm, lerp, back, rnd } from "./line";
import { EndCard } from "../kit/Words";

export const END = 450; const WIPE = 360, CARD = 378;
const MEM = [{ at: 34, x: 200, y: 1010, k: "notes" }, { at: 64, x: 330, y: 860, k: "cake" }, { at: 94, x: 200, y: 720, k: "haha" }];
const T = { gone: 140, drift0: 144, drift1: 176, wait: 180, walk0: 184, walk1: 208, hop: 212, swing0: 220, happy: 220 };
const G = 1500, S0 = 250, SS = 1.6;
const P = { x: 520, y: 880, L: 440 };
const ROSE = "#E2507F";

const Mem: React.FC<{ k: string }> = ({ k }) => (
  <g>
    <circle r={74} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
    {k === "notes" && <g fill={INK}><ellipse cx={-22} cy={22} rx={14} ry={10} /><ellipse cx={22} cy={14} rx={14} ry={10} /><path d="M-10,22 L-10,-34 L34,-42 L34,14" stroke={INK} strokeWidth={6} fill="none" /><path d="M-10,-34 L34,-42 L34,-28 L-10,-20 Z" /></g>}
    {k === "cake" && <g><path d="M-44,26 L44,26 L44,-6 L-44,-26 Z" fill="#FFE3B8" stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M-44,-26 L44,-6 L44,4 L-44,-14 Z" fill="#FFB3C8" stroke={INK} strokeWidth={3} /><circle cx={0} cy={-34} r={10} fill={ROSE} stroke={INK} strokeWidth={3} /></g>}
    {k === "haha" && <text x={0} y={16} textAnchor="middle" fontFamily="Hand" fontSize={48} fill={ROSE}>haha!</text>}
  </g>
);

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const on = f >= T.hop + 8;
  const amp = f < T.gone ? 0 : f < T.hop ? lerp(0, 7, sm(seg(f, T.gone, T.gone + 20))) : lerp(4, 24, sm(seg(f, T.swing0, T.swing0 + 70)));
  const th = amp * Math.sin((f - T.gone) / 9);
  const walkP = sm(seg(f, T.walk0, T.walk1));
  const sx = lerp(S0, P.x - 4, walkP);
  const hop = seg(f, T.walk1, T.hop + 8);
  const seatY = P.y + P.L;
  const standY = G, sitY = seatY + 4 * SS;
  const memOut = sm(seg(f, T.drift0, T.drift1));
  const fill = sm(seg(f, T.gone, T.gone + 40));
  return (
    <g>
      <circle cx={P.x} cy={P.y + 200} r={420} fill="#FFE2C2" opacity={0.35 + 0.35 * fill} filter="url(#lb40)" />
      {/* hill */}
      <path d={`M-40,${G + 10} C260,${G - 70} 760,${G - 80} 1120,${G - 10} L1120,1920 L-40,1920 Z`} fill="#D6EEC8" stroke={INK} strokeWidth={LW} />
      {/* the tree */}
      <path d={`M820,${G - 50} C810,1200 820,1000 810,900`} stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d={`M820,${G - 50} C810,1200 820,1000 810,900`} stroke="#C9A27E" strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d={`M816,${P.y + 6} C760,${P.y - 6} 640,${P.y + 4} ${P.x - 90},${P.y + 8}`} stroke={INK} strokeWidth={24} fill="none" strokeLinecap="round" />
      <path d={`M816,${P.y + 6} C760,${P.y - 6} 640,${P.y + 4} ${P.x - 90},${P.y + 8}`} stroke="#C9A27E" strokeWidth={13} fill="none" strokeLinecap="round" />
      {[[800, 760, 140], [660, 800, 110], [900, 860, 90], [540, 830, 84]].map(([x, y, r], i) => <circle key={i} cx={x + 4 * Math.sin(t * 0.9 + i)} cy={y} r={r} fill={i % 2 ? "#BFE5B4" : "#A9DCA6"} stroke={INK} strokeWidth={LW} />)}
      {/* the swing (and the Soul on it) */}
      <g transform={`rotate(${th} ${P.x} ${P.y})`}>
        {[-70, 70].map((dx) => <line key={dx} x1={P.x + dx} y1={P.y + 6} x2={P.x + dx} y2={seatY} stroke={INK} strokeWidth={5} />)}
        <rect x={P.x - 96} y={seatY - 4} width={192} height={22} rx={8} fill={on ? "#FFB3C8" : `rgb(${lerp(214, 255, fill)},${lerp(208, 179, fill)},${lerp(220, 200, fill)})`} stroke={INK} strokeWidth={LW - 1} />
        {on && <LSoul x={P.x} y={sitY} s={SS} p={{ sit: 1, happy: 1, glow: 0.4 + 0.5 * sm(seg(f, T.swing0, T.swing0 + 40)), wave: -0.6 + 0.1 * Math.sin(f / 5), glance: 0 }} />}
      </g>
      {/* memories: float up one by one, then drift into the swing */}
      {MEM.map((m, i) => { const inn = back(seg(f, m.at - 6, m.at + 8), 2); if (inn <= 0.01) return null;
        const x = lerp(m.x, P.x, memOut), y = lerp(m.y + 6 * Math.sin(t * 1.3 + i), seatY - 40, memOut);
        return <g key={i} transform={`translate(${x} ${y}) scale(${inn * (1 - 0.8 * memOut)})`} opacity={1 - sm(seg(f, T.drift1 - 6, T.drift1))}><Mem k={m.k} /></g>; })}
      {/* the Soul, before it gets on */}
      {!on && <LSoul x={sx} y={lerp(standY, sitY, sm(hop)) - 120 * Math.sin(Math.PI * hop)} s={SS} p={{ walk: f > T.walk0 && f < T.walk1 ? 1 : 0, phase: (sx - S0) / 26, sit: sm(seg(f, T.hop, T.hop + 8)),
        look: f > 20 && f < T.gone ? 0.6 : 0, glance: f < T.gone ? -0.5 : 0.7, worry: f > 100 && f < T.gone ? 0.4 : 0, happy: f > T.gone + 10 ? 1 : 0, glow: 0.2 + 0.2 * fill, blink: [120].some((b) => f >= b && f < b + 4) }} />}
      {/* joy: notes + confetti off the swing */}
      {on && Array.from({ length: 8 }, (_, i) => { const p = ((f - T.swing0) / 40 + i / 8) % 1; const bx = P.x + Math.sin((th * Math.PI) / 180) * P.L;
        return i % 2 ? <text key={i} x={bx - 150 + 300 * rnd(i)} y={seatY - 120 - 260 * p} fontFamily="Hand" fontSize={50} fill={INK} opacity={Math.sin(Math.PI * p)}>♪</text>
          : <rect key={i} x={bx - 200 + 400 * rnd(i + 3)} y={seatY - 300 * p} width={14} height={8} rx={2} fill={["#FFB3C8", "#C9B6FF", "#FFD36E", "#8FD8C4"][i % 4]} opacity={Math.sin(Math.PI * p)} transform={`rotate(${f * 4 + i * 30} ${bx} ${seatY})`} />; })}
      {f > T.gone && f < T.gone + 30 && <Spark x={P.x} y={seatY - 60} s={0.6 * Math.sin(Math.PI * seg(f, T.gone, T.gone + 30))} c={ROSE} />}
    </g>
  );
};

export const Q1113: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#FFF3E6", "#FFE0EA"]} audio="q1113.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} ats={[2, MEM[0].at, MEM[1].at, MEM[2].at, T.gone, T.wait]} to={WIPE - 6} top={190} size={50}
          lines={[<>i miss the version of me who…</>, <>sang loudly in the car…</>, <>ate cake for breakfast…</>, <>laughed without checking who was watching.</>, <span style={{ fontSize: 58 }}>she's not gone.</span>, <>she's waiting for me to let her <Hl c={ROSE}>play again.</Hl></>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <Scene f={f} />
    </LFrame>
  );
};
export const BEATS = { ...T, END, WIPE, CARD };
