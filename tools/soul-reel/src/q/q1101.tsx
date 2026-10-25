// 1 Nov · "Your life is a blackboard. Make sure only you hold the chalk."
// The Soul stands at a clean blackboard. Floating chalks drift in and scribble other people's rules on it while the
// Soul watches, uneasy. Then it raises a duster: one big swoosh wipes the board, the floating chalks drop. It picks up
// a pink chalk and writes "my story" itself, then turns to us, happy.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { LFrame, Caption, Hl, LSoul, INK, LW, seg, sm, lerp } from "./line";
import { EndCard } from "../kit/Words";

export const END = 435; const WIPE = 345, CARD = 363;
const RULES = [
  { t: "marry by 25", x: 330, y: 1080, r: -4, c: "#FFFFFF" },
  { t: "be practical", x: 720, y: 1060, r: 3, c: "#FFF2A6" },
  { t: "what will people say?", x: 540, y: 1160, r: -2, c: "#FFFFFF" },
  { t: "settle down", x: 330, y: 1250, r: 4, c: "#BFE6FF" },
  { t: "don't dream so big", x: 730, y: 1255, r: -3, c: "#FFFFFF" },
];
const at = (i: number) => 22 + i * 20;
const T = { duster: 128, wipe0: 140, wipe1: 172, drop: 150, pick: 182, write0: 196, write1: 250, step: 254, turn: 288 };
const TX = 310, TW = 400; // where "my story" starts and how wide it is
const B = { x0: 150, x1: 930, y0: 980, y1: 1420 };
const ROSE = "#E2507F";
const S = { s: 1.7, y: 1590 };
const handOf = (x: number) => ({ x: x + 75.6 * S.s, y: S.y - 118.5 * S.s });

const Scene: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const wipeX = lerp(B.x0 - 60, B.x1 + 80, sm(seg(f, T.wipe0, T.wipe1)));
  const write = sm(seg(f, T.write0, T.write1));
  // the Soul: stands left, steps right while writing
  // stands at the left, walks along with the chalk while writing, then steps aside to reveal the words
  const writeX = TX + TW * write - 75.6 * S.s;
  const sx = f < T.write0 ? 172 : f <= T.write1 ? writeX : lerp(TX + TW - 75.6 * S.s, 855, sm(seg(f, T.step, T.step + 30)));
  const walking = (f > T.write0 && f < T.write1) || (f > T.step && f < T.step + 30) ? 1 : 0;
  const raise = f > T.duster && f < T.turn ? sm(seg(f, T.duster, T.duster + 10)) : f >= T.turn ? 1 - sm(seg(f, T.turn, T.turn + 12)) : 0;
  const uneasy = sm(seg(f, at(1), at(3))) * (1 - sm(seg(f, T.duster - 6, T.duster + 6)));
  const hand = handOf(sx);
  return (
    <g>
      {/* soft classroom wall + window light */}
      <path d="M760,0 L1080,0 L1080,640 L560,900 Z" fill="#FFF6E2" opacity={0.6} filter="url(#lb24)" />
      {/* the board */}
      <rect x={B.x0 - 26} y={B.y0 - 26} width={B.x1 - B.x0 + 52} height={B.y1 - B.y0 + 52} rx={20} fill="#E7C3A2" stroke={INK} strokeWidth={LW} />
      <rect x={B.x0} y={B.y0} width={B.x1 - B.x0} height={B.y1 - B.y0} rx={10} fill="#3F7F73" stroke={INK} strokeWidth={LW - 2} />
      <defs><clipPath id="bd1101"><rect x={B.x0} y={B.y0} width={B.x1 - B.x0} height={B.y1 - B.y0} rx={10} /></clipPath></defs>
      <g clipPath="url(#bd1101)">
        {RULES.map((r, i) => {
          const w = seg(f, at(i), at(i) + 18); if (w <= 0) return null;
          const gone = r.x + 170 < wipeX ? 1 : r.x - 170 > wipeX ? 0 : (wipeX - (r.x - 170)) / 340;
          return <text key={i} x={r.x} y={r.y} textAnchor="middle" fontFamily="Hand" fontSize={52} fill={r.c} transform={`rotate(${r.r} ${r.x} ${r.y})`} opacity={1 - gone} style={{ clipPath: `inset(-40% ${(1 - w) * 100}% -40% 0%)` }}>{r.t}</text>;
        })}
        {/* chalk haze left behind by the wipe */}
        <rect x={B.x0} y={B.y0} width={Math.max(0, wipeX - B.x0)} height={B.y1 - B.y0} fill="#FFFFFF" opacity={0.05 * (1 - seg(f, T.wipe1, T.wipe1 + 40))} />
        {/* the swoosh */}
        {f > T.wipe0 && f < T.wipe1 + 6 && <path d={`M${wipeX - 140},${B.y0 + 30} Q${wipeX + 30},${(B.y0 + B.y1) / 2} ${wipeX - 140},${B.y1 - 30}`} stroke="#FFFFFF" strokeWidth={60} fill="none" strokeLinecap="round" opacity={0.35} />}
        {/* "my story", written by the Soul in pink */}
        {f >= T.write0 && <text x={TX} y={1372} fontFamily="Hand" fontSize={140} textLength={TW} lengthAdjust="spacingAndGlyphs" fill="#FF8FB1" style={{ clipPath: `inset(-40% ${(1 - write) * 100}% -40% 0%)` }}>my story</text>}
      </g>
      <rect x={B.x0 - 40} y={B.y1 + 26} width={B.x1 - B.x0 + 80} height={26} rx={8} fill="#D9AE88" stroke={INK} strokeWidth={4} />
      {/* the floating chalks: drift in, write, hover; drop when wiped */}
      {RULES.map((r, i) => {
        const a = at(i); if (f < a - 12) return null;
        const inn = sm(seg(f, a - 12, a)), w = seg(f, a, a + 18);
        const tx = r.x - 160 + 320 * w;
        const drop = seg(f, T.drop + i * 3, T.drop + i * 3 + 26);
        const hx = lerp(i % 2 ? 1180 : -100, tx, inn) + 10 * Math.sin(t * 2 + i) * (w >= 1 ? 1 : 0);
        const hy = lerp(700, r.y - 30, inn) - (w >= 1 ? 40 + 14 * Math.sin(t * 1.6 + i) : 0) + 700 * drop * drop;
        return <g key={i} transform={`translate(${hx} ${hy}) rotate(${-35 + 260 * drop})`} opacity={1 - seg(f, T.drop + 20, T.drop + 34)}>
          <rect x={-11} y={-56} width={22} height={70} rx={8} fill={r.c} stroke={INK} strokeWidth={4} />
        </g>;
      })}
      {/* the Soul */}
      <LSoul x={sx} y={S.y} s={S.s} p={{ walk: walking, phase: (sx - 190) / 30, wave: -0.8 * raise, worry: uneasy, glance: uneasy * (Math.sin(f / 9) > 0 ? 0.8 : -0.2), happy: f > T.turn + 6 ? 1 : 0, glow: 0.2 + 0.6 * sm(seg(f, T.turn, T.turn + 20)), blink: [96, 300].some((b) => f >= b && f < b + 4) }} />
      {/* what the Soul holds: the duster, then the pink chalk */}
      {raise > 0.3 && f < T.pick && <g transform={`translate(${hand.x + 6} ${hand.y - 18}) rotate(-12)`}><rect x={-46} y={-26} width={92} height={34} rx={10} fill="#B48CD8" stroke={INK} strokeWidth={4} /><rect x={-46} y={6} width={92} height={18} rx={6} fill="#F6EEE6" stroke={INK} strokeWidth={4} /></g>}
      {raise > 0.3 && f >= T.pick && <g transform={`translate(${hand.x + 4} ${hand.y - 26}) rotate(-28)`}><rect x={-11} y={-50} width={22} height={64} rx={8} fill="#FF8FB1" stroke={INK} strokeWidth={4} /></g>}
      {/* a little pink sparkle when the chalk is picked up */}
      {f > T.pick && f < T.pick + 16 && <circle cx={hand.x} cy={hand.y - 40} r={20 + 40 * seg(f, T.pick, T.pick + 16)} fill="none" stroke="#FF8FB1" strokeWidth={4} opacity={1 - seg(f, T.pick, T.pick + 16)} />}
    </g>
  );
};

export const Q1101: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <LFrame f={f} bg={["#FFF6EC", "#FFE3D3"]} audio="q1101.wav"
      overlay={<AbsoluteFill>
        <Caption f={f} ats={[2, T.wipe0, T.write1 - 6]} to={WIPE - 6} top={300} size={74} lines={[<>your life is a blackboard.</>, <>make sure only you</>, <><Hl c={ROSE}>hold the chalk.</Hl></>]} />
        <EndCard f={f} wipe={WIPE} card={CARD} />
      </AbsoluteFill>}>
      <Scene f={f} />
    </LFrame>
  );
};
export const BEATS = { ...T, END, WIPE, CARD };
