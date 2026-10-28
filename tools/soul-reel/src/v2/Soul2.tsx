// The new @trulyaariya Soul (v2): a full-colour character, softly shaded, a little taller and slimmer.
// Look: heart-shaped sunglasses, fitted red tee with a small "Self-love" name tag on its left chest, fitted black
// shorts with a little heart mark, white sneakers, a gold watch with a green dial on its left wrist.
// Origin = between the feet on the ground; ~560 units tall at s = 1. Smooth limbs: every arm and leg is one
// continuous stroke with rounded joints, so poses can be animated without seams.
import React from "react";

export const C = {
  skin: "#FFF0DD", skinSh: "#F3D6B6", line: "#3B2522",
  tee: "#E63946", teeSh: "#C22A37", teeHi: "#F25C67",
  shorts: "#23222B", shortsSh: "#15141B",
  shoe: "#FFFFFF", shoeSh: "#E4E2EA", sole: "#D7D3DE", sock: "#FFFFFF",
  heart: "#FF5C8A", glass: "#1A1420", lens: "#FF5A85", lens2: "#C2185B",
  gold: "#E8B64A", dial: "#1F7A4D", blush: "#FF9DB0",
};

export type Pose2 = {
  armL?: number; armR?: number;     // upper-arm angle from straight down, + = out to the side, 180 = straight up
  elbowL?: number; elbowR?: number; // forearm bend, + = toward the body / up
  legL?: number; legR?: number;     // leg swing in degrees (+ = foot outward)
  lean?: number; head?: number;     // body and head tilt in degrees
  mouth?: "smile" | "smirk" | "grin" | "open" | "chew" | "o" | "flat" | "sad";
  chew?: number; blink?: boolean;
  brow?: number;   // -1 worried .. 0 .. 1 one brow raised (sassy)
  shades?: number; // 1 on the eyes, 0 pushed up on the head
  bounce?: number; // body drop in units
  look?: number;   // eyes left/right (-1..1) when shades are up
};

const W = 3;
const rad = (d: number) => (d * Math.PI) / 180;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const heartPath = (s: number) => `M0,${-3 * s} C${2 * s},${-9 * s} ${11 * s},${-8 * s} ${10 * s},${-1 * s} C${9 * s},${4 * s} ${3 * s},${8 * s} 0,${10 * s} C${-3 * s},${8 * s} ${-9 * s},${4 * s} ${-10 * s},${-1 * s} C${-11 * s},${-8 * s} ${-2 * s},${-9 * s} 0,${-3 * s} Z`;

const arm = (side: number, sx: number, sy: number, a: number, e: number) => {
  const up = 72, fore = 70;
  const r1 = rad(a) * side, r2 = rad(a - e) * side;
  const ex = sx + Math.sin(r1) * up, ey = sy + Math.cos(r1) * up;
  const hx = ex + Math.sin(r2) * fore, hy = ey + Math.cos(r2) * fore;
  return { ex, ey, hx, hy, r1, r2 };
};

const Hand: React.FC<{ side: number; ang: number; children?: React.ReactNode }> = ({ side, ang, children }) => (
  <g transform={`rotate(${(-ang * 180) / Math.PI})`}>
    {children}
    <path d="M-13,-6 C-16,8 -11,25 0,26 C11,25 16,8 13,-6 Z" fill={C.skin} stroke={C.line} strokeWidth={W} strokeLinejoin="round" />
    <path d={`M${-side * 11},2 C${-side * 22},4 ${-side * 22},16 ${-side * 12},16`} fill={C.skin} stroke={C.line} strokeWidth={W} strokeLinecap="round" />
    <path d="M-5,18 l0,6 M3,19 l0,6" stroke={C.line} strokeWidth={1.6} strokeLinecap="round" opacity={0.5} />
  </g>
);

export const Soul2: React.FC<{ x: number; y: number; s?: number; p?: Pose2; handL?: React.ReactNode; handR?: React.ReactNode; flip?: boolean; headTop?: React.ReactNode }> = ({ x, y, s = 1, p = {}, handL, handR, flip, headTop }) => {
  const bounce = p.bounce ?? 0, lean = p.lean ?? 0, head = p.head ?? 0, shades = p.shades ?? 1, brow = p.brow ?? 0;
  const hipY = -170 + bounce, hem = -226 + bounce, shoulderY = -352 + bounce, headY = -446 + bounce;
  const A = [arm(-1, -60, shoulderY + 18, p.armL ?? 12, p.elbowL ?? 6), arm(1, 60, shoulderY + 18, p.armR ?? 12, p.elbowR ?? 6)];
  const leg = (side: number, ang: number) => {
    const hx = side * 30, hy = hipY - 20;
    return (
      <g transform={`rotate(${ang * side} ${hx} ${hy})`} key={side}>
        <path d={`M${hx},${hy} L${side * 31},${-40}`} stroke={C.line} strokeWidth={30 + 2 * W} strokeLinecap="round" />
        <path d={`M${hx},${hy} L${side * 31},${-40}`} stroke={C.skin} strokeWidth={30} strokeLinecap="round" />
        <path d={`M${side * 31 - 15},-44 L${side * 31 + 15},-44`} stroke={C.sock} strokeWidth={12} />
        <path d={`M${side * 31 - 17},-50 L${side * 31 + 17},-50 M${side * 31 - 17},-38 L${side * 31 + 17},-38`} stroke={C.line} strokeWidth={2} opacity={0.6} />
        <g transform={`translate(${side * 33} 0) scale(${side} 1)`}>
          <path d="M-24,-34 C-24,-44 -6,-46 4,-38 C16,-32 34,-30 42,-20 C48,-12 46,-4 40,-2 L-30,-2 C-34,-12 -32,-26 -24,-34 Z" fill={C.shoe} stroke={C.line} strokeWidth={W} strokeLinejoin="round" />
          <path d="M-31,-10 L46,-10 L44,-1 C20,2 -12,2 -30,-1 Z" fill={C.sole} stroke={C.line} strokeWidth={W} strokeLinejoin="round" />
          <path d="M-2,-38 l6,6 M5,-35 l6,6 M12,-32 l6,6" stroke={C.line} strokeWidth={2} strokeLinecap="round" />
          <path d={heartPath(0.75)} transform="translate(-14 -22)" fill={C.heart} />
          <path d="M26,-26 C34,-24 40,-20 42,-16" stroke={C.shoeSh} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <ellipse cx={0} cy={2} rx={92} ry={12} fill="#000000" opacity={0.14} />
      {leg(-1, p.legL ?? 0)}{leg(1, p.legR ?? 0)}
      <g transform={`rotate(${lean} 0 ${hipY})`}>
        <path d={`M-62,${hem + 4} C-62,${hem - 4} 62,${hem - 4} 62,${hem + 4} L66,${hipY + 4} C50,${hipY + 10} 18,${hipY + 10} 6,${hipY + 2} L0,${hipY - 14} L-6,${hipY + 2} C-18,${hipY + 10} -50,${hipY + 10} -66,${hipY + 4} Z`} fill={C.shorts} stroke={C.line} strokeWidth={W} strokeLinejoin="round" />
        <path d={`M44,${hem + 6} C54,${hem + 20} 60,${hipY - 20} 62,${hipY + 4} C56,${hipY + 7} 50,${hipY + 8} 44,${hipY + 8} C48,${hipY - 20} 48,${hem + 30} 44,${hem + 6} Z`} fill={C.shortsSh} opacity={0.8} />
        <path d={`M0,${hem + 8} L0,${hipY - 16}`} stroke="#3A3946" strokeWidth={2} />
        <path d={heartPath(0.85)} transform={`translate(42 ${hipY - 12})`} fill="#FFFFFF" />
        <path d={`M-58,${shoulderY + 4} C-50,${shoulderY - 6} -32,${shoulderY - 10} -22,${shoulderY - 10} C-12,${shoulderY + 2} 12,${shoulderY + 2} 22,${shoulderY - 10} C32,${shoulderY - 10} 50,${shoulderY - 6} 58,${shoulderY + 4} C64,${shoulderY + 40} 62,${hem - 40} 60,${hem + 6} C30,${hem + 14} -30,${hem + 14} -60,${hem + 6} C-62,${hem - 40} -64,${shoulderY + 40} -58,${shoulderY + 4} Z`} fill={C.tee} stroke={C.line} strokeWidth={W} strokeLinejoin="round" />
        <path d={`M30,${shoulderY - 6} C48,${shoulderY} 58,${shoulderY + 20} 60,${shoulderY + 50} C62,${hem - 30} 60,${hem} 58,${hem + 6} C50,${hem + 9} 44,${hem + 10} 38,${hem + 10} C46,${hem - 40} 48,${shoulderY + 40} 30,${shoulderY - 6} Z`} fill={C.teeSh} opacity={0.75} />
        <path d={`M-40,${shoulderY + 30} C-44,${shoulderY + 70} -44,${hem - 50} -40,${hem - 20}`} stroke={C.teeHi} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
        <path d={`M-22,${shoulderY - 10} C-12,${shoulderY + 4} 12,${shoulderY + 4} 22,${shoulderY - 10}`} stroke={C.teeSh} strokeWidth={6} fill="none" />
        <g transform={`translate(16 ${shoulderY + 34}) rotate(-3)`}>
          <rect x={0} y={0} width={38} height={18} rx={3} fill="#FFFFFF" stroke={C.line} strokeWidth={1.6} />
          <rect x={0} y={0} width={38} height={5} rx={2} fill={C.heart} />
          <text x={19} y={15} textAnchor="middle" fontFamily="Hand" fontSize={9} fontWeight={700} fill={C.line}>Self-love</text>
        </g>
        {A.map((a, i) => <path key={`o${i}`} d={`M${i ? 60 : -60},${shoulderY + 18} L${a.ex},${a.ey} L${a.hx},${a.hy}`} stroke={C.line} strokeWidth={26 + 2 * W} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
        {A.map((a, i) => <path key={`f${i}`} d={`M${i ? 60 : -60},${shoulderY + 18} L${a.ex},${a.ey} L${a.hx},${a.hy}`} stroke={C.skin} strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
        {(() => { const a = A[1]; const wx = lerp(a.ex, a.hx, 0.78), wy = lerp(a.ey, a.hy, 0.78);
          return <g transform={`translate(${wx} ${wy}) rotate(${(-a.r2 * 180) / Math.PI})`}>
            <rect x={-15} y={-6} width={30} height={12} rx={4} fill={C.gold} stroke={C.line} strokeWidth={2} />
            <circle cx={0} cy={0} r={10} fill={C.gold} stroke={C.line} strokeWidth={2} />
            <circle cx={0} cy={0} r={6.5} fill={C.dial} />
            <path d="M0,0 L0,-4.5 M0,0 L3,1.5" stroke="#FFFFFF" strokeWidth={1.4} strokeLinecap="round" />
          </g>; })()}
        {A.map((a, i) => <g key={`h${i}`} transform={`translate(${a.hx} ${a.hy})`}><Hand side={i ? 1 : -1} ang={a.r2}>{i ? handR : handL}</Hand></g>)}
        {A.map((a, i) => { const sd = i ? 1 : -1, sx = sd * 60, sy = shoulderY + 18; const L = 40;
          const dx = Math.sin(a.r1), dy = Math.cos(a.r1), nx = dy, ny = -dx;
          const p0 = [sx + nx * 22 - dx * 10, sy + ny * 22 - dy * 10], p1 = [sx - nx * 22 - dx * 10, sy - ny * 22 - dy * 10];
          const p2 = [sx - nx * 20 + dx * L, sy - ny * 20 + dy * L], p3 = [sx + nx * 20 + dx * L, sy + ny * 20 + dy * L];
          return <path key={`s${i}`} d={`M${p0} L${p1} L${p2} Q${sx + dx * (L + 6)},${sy + dy * (L + 6)} ${p3} Z`} fill={C.tee} stroke={C.line} strokeWidth={W} strokeLinejoin="round" />; })}
        <g transform={`translate(0 ${headY}) rotate(${head} 0 70)`}>
          <path d="M-14,62 L-14,84 L14,84 L14,62 Z" fill={C.skinSh} />
          <circle r={84} fill={C.skin} stroke={C.line} strokeWidth={W} />
          <path d="M36,-70 C74,-50 88,-8 76,30 C66,60 38,78 8,82 C48,60 66,24 62,-12 C60,-38 52,-58 36,-70 Z" fill={C.skinSh} opacity={0.6} />
          <ellipse cx={-34} cy={-50} rx={18} ry={9} fill="#FFFFFF" opacity={0.65} transform="rotate(-25 -34 -50)" />
          <ellipse cx={-50} cy={28} rx={14} ry={8} fill={C.blush} opacity={0.75} />
          <ellipse cx={50} cy={28} rx={14} ry={8} fill={C.blush} opacity={0.75} />
          {shades < 0.6 && (p.blink ? <path d="M-36,0 l18,0 M18,0 l18,0" stroke={C.line} strokeWidth={4.5} strokeLinecap="round" />
            : <g fill={C.line}><ellipse cx={-27 + 5 * (p.look ?? 0)} cy={-2} rx={7} ry={9} /><ellipse cx={27 + 5 * (p.look ?? 0)} cy={-2} rx={7} ry={9} />
              <circle cx={-25 + 5 * (p.look ?? 0)} cy={-6} r={2.4} fill="#FFF" /><circle cx={29 + 5 * (p.look ?? 0)} cy={-6} r={2.4} fill="#FFF" /></g>)}
          <path d={`M-50,${-34 + 6 * Math.max(0, -brow)} q14,${-8} 28,${-2 + 8 * Math.max(0, -brow)}`} stroke={C.line} strokeWidth={4.5} fill="none" strokeLinecap="round" />
          <path d={`M50,${-34 - 12 * Math.max(0, brow) + 6 * Math.max(0, -brow)} q-14,${-8} -28,${-2 + 8 * Math.max(0, -brow)}`} stroke={C.line} strokeWidth={4.5} fill="none" strokeLinecap="round" />
          {(() => { const m = p.mouth ?? "smile", ch = p.chew ?? 0;
            if (m === "smirk") return <path d="M-14,36 q18,10 32,-6" stroke={C.line} strokeWidth={5} fill="none" strokeLinecap="round" />;
            if (m === "grin") return <path d="M-20,30 q20,26 40,0 Z" fill="#FFFFFF" stroke={C.line} strokeWidth={4} strokeLinejoin="round" />;
            if (m === "open") return <path d="M-16,30 q16,28 32,0 Z" fill="#8A2C3B" stroke={C.line} strokeWidth={4} strokeLinejoin="round" />;
            if (m === "chew") return <ellipse cx={0} cy={38} rx={12 - 2 * ch} ry={3 + 8 * ch} fill="#8A2C3B" stroke={C.line} strokeWidth={4} />;
            if (m === "o") return <ellipse cx={0} cy={40} rx={7} ry={9} fill="#8A2C3B" stroke={C.line} strokeWidth={4} />;
            if (m === "flat") return <path d="M-12,38 l24,0" stroke={C.line} strokeWidth={5} strokeLinecap="round" />;
            if (m === "sad") return <path d="M-14,42 q14,-12 28,0" stroke={C.line} strokeWidth={5} fill="none" strokeLinecap="round" />;
            return <path d="M-16,32 q16,16 32,0" stroke={C.line} strokeWidth={5} fill="none" strokeLinecap="round" />; })()}
          {headTop}
          <g transform={`translate(0 ${lerp(-62, -4, shades)})`}>
            <path d="M-38,-6 L-82,-14 M38,-6 L82,-14" stroke={C.glass} strokeWidth={5} strokeLinecap="round" opacity={shades > 0.5 ? 1 : 0} />
            <path d="M-10,-3 Q0,-9 10,-3" stroke={C.glass} strokeWidth={5} fill="none" />
            {[-1, 1].map((k) => <g key={k} transform={`translate(${k * 31} 0)`}>
              <path d={heartPath(2.55)} fill={C.glass} />
              <path d={heartPath(2.1)} fill="url(#lens2)" />
              <ellipse cx={-8} cy={-7} rx={6.5} ry={3.2} fill="#FFFFFF" opacity={0.6} transform="rotate(-30 -8 -7)" />
            </g>)}
          </g>
        </g>
      </g>
      <defs><linearGradient id="lens2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.lens} /><stop offset="1" stopColor={C.lens2} /></linearGradient></defs>
    </g>
  );
};
