// Interior kit for Soul reels: a cosy room drawn in the master's soft flat style, sized to the soul
// (floor = GROUND; the soul stands ~360px tall; a chair seat sits at its hip height so sitting is grounded).
import React from "react";
import { col, blob, Flower, POPPIES, rnd } from "./Land";
import { GROUND } from "./choreo";

export const FLOOR = GROUND; // 1540
export const SEAT_Y = FLOOR - 92; // chair seat top for the sitChair pose
export const TABLE_Y = FLOOR - 190; // table top (waist height)

// sky seen through a window (dusk → golden), with optional rain inside the pane
export const WindowSky: React.FC<{ x: number; y: number; w: number; h: number; warm: number; f: number; id: string; children?: React.ReactNode; night?: number }> = ({ x, y, w, h, warm, f, id, children, night = 0 }) => {
  const t = f / 30;
  return (
    <g>
      <defs>
        <clipPath id={id}><rect x={x} y={y} width={w} height={h} rx={10} /></clipPath>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={col(warm, col(night, "#B9C3D9", "#3F466E"), "#F7B9A6")} />
          <stop offset="0.6" stopColor={col(warm, col(night, "#D8D0DA", "#6E6390"), "#FFD9A8")} />
          <stop offset="1" stopColor={col(warm, col(night, "#E6DCD6", "#9B86A6"), "#FFEBC4")} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={x} y={y} width={w} height={h} fill={`url(#${id}g)`} />
        {/* setting sun */}
        <circle cx={x + w * 0.62} cy={y + h * (0.86 - 0.12 * warm)} r={w * 0.16} fill="#FFE7B0" opacity={0.25 + 0.75 * warm} />
        <circle cx={x + w * 0.62} cy={y + h * (0.86 - 0.12 * warm)} r={w * 0.32} fill="#FFE7B0" opacity={0.25 * warm} filter="url(#b16)" />
        {/* far hills and a few rooftops */}
        <path d={`M${x - 10},${y + h * 0.82} Q${x + w * 0.3},${y + h * 0.7} ${x + w * 0.6},${y + h * 0.8} T${x + w + 10},${y + h * 0.76} L${x + w + 10},${y + h} L${x - 10},${y + h} Z`} fill={col(warm, "#B8BEC4", "#B9A5D8")} />
        {[0.12, 0.34, 0.72].map((k, i) => <g key={i}><rect x={x + w * k} y={y + h * 0.84} width={w * 0.13} height={h * 0.2} fill={col(warm, "#C9C2BE", "#E6B9A6")} /><path d={`M${x + w * k - 6},${y + h * 0.85} L${x + w * (k + 0.065)},${y + h * 0.78} L${x + w * (k + 0.13) + 6},${y + h * 0.85} Z`} fill={col(warm, "#B5AAA6", "#D9998B")} /></g>)}
        {[0, 1].map((i) => <ellipse key={i} cx={x + ((w * (0.2 + i * 0.5) + t * 6) % (w + 120)) - 60} cy={y + h * (0.2 + i * 0.16)} rx={70} ry={20} fill="#FFFFFF" opacity={0.6} filter="url(#b8)" />)}
        {children}
      </g>
      {/* frame + mullions + sill */}
      <rect x={x} y={y} width={w} height={h} rx={10} fill="none" stroke="#FBF5EC" strokeWidth={16} />
      <path d={`M${x + w / 2},${y} L${x + w / 2},${y + h} M${x},${y + h * 0.45} L${x + w},${y + h * 0.45}`} stroke="#FBF5EC" strokeWidth={10} />
      <rect x={x - 26} y={y + h + 4} width={w + 52} height={20} rx={6} fill="#EFE3D3" />
    </g>
  );
};

// curtain that sways with a breeze (amp 0 → still)
export const Curtain: React.FC<{ x: number; y: number; h: number; side: 1 | -1; f: number; amp: number; color: string }> = ({ x, y, h, side, f, amp, color }) => {
  const t = f / 30; const pts: string[] = [];
  for (let k = 0; k <= 10; k++) { const yy = y + (h * k) / 10; const b = amp * (k / 10) * (12 * Math.sin(t * 1.6 + k * 0.6) + 6 * Math.sin(t * 2.7 + k)); pts.push(`${x + side * (70 + 10 * Math.sin(k)) + b},${yy}`); }
  return <path d={`M${x},${y} L${pts.join(" L")} L${x},${y + h} Z`} fill={color} opacity={0.9} />;
};

export const FairyLights: React.FC<{ x0: number; x1: number; y: number; sag?: number; on: number; f: number; n?: number }> = ({ x0, x1, y, sag = 60, on, f, n = 14 }) => {
  const t = f / 30; const P = (k: number) => { const u = k / (n - 1); return { x: x0 + (x1 - x0) * u, y: y + sag * Math.sin(Math.PI * u) }; };
  return (
    <g>
      <path d={`M${x0},${y} Q${(x0 + x1) / 2},${y + sag * 2} ${x1},${y}`} stroke="#9C8B80" strokeWidth={2} fill="none" />
      {Array.from({ length: n }, (_, k) => {
        const p = P(k); const lit = Math.min(1, Math.max(0, on * n - k)); const tw = 0.85 + 0.15 * Math.sin(t * 3 + k);
        const c = ["#FFE3A0", "#FFC8B8", "#FFF1C9", "#F9D59A"][k % 4];
        return <g key={k}>{lit > 0 && <circle cx={p.x} cy={p.y + 8} r={22} fill={c} opacity={0.55 * lit * tw} filter="url(#b8)" />}<ellipse cx={p.x} cy={p.y + 8} rx={6} ry={8} fill={lit > 0.5 ? c : "#E8DED5"} /></g>;
      })}
    </g>
  );
};

export const Table: React.FC<{ x: number; w?: number; h?: number; top?: string }> = ({ x, w = 300, h = 190, top = "#D9B494" }) => (
  <g>
    <ellipse cx={x} cy={FLOOR + 4} rx={w * 0.6} ry={12} fill="#6F5A4F" opacity={0.15} filter="url(#b8)" />
    <rect x={x - w / 2} y={FLOOR - h} width={w} height={18} rx={6} fill={top} />
    <rect x={x - w / 2 + 16} y={FLOOR - h + 16} width={14} height={h - 16} rx={4} fill="#C49E7E" />
    <rect x={x + w / 2 - 30} y={FLOOR - h + 16} width={14} height={h - 16} rx={4} fill="#C49E7E" />
    <rect x={x - w / 2 + 20} y={FLOOR - h + 18} width={w - 40} height={34} rx={4} fill="#CFA889" />
  </g>
);
export const Chair: React.FC<{ x: number; back?: 1 | -1; c?: string }> = ({ x, back = -1, c = "#C9A385" }) => (
  <g>
    <rect x={x - 58} y={SEAT_Y} width={116} height={16} rx={6} fill={c} />
    <rect x={x - 52} y={SEAT_Y + 14} width={10} height={FLOOR - SEAT_Y - 14} rx={4} fill="#B58E70" />
    <rect x={x + 42} y={SEAT_Y + 14} width={10} height={FLOOR - SEAT_Y - 14} rx={4} fill="#B58E70" />
    <rect x={x + back * 52 - 5} y={SEAT_Y - 170} width={12} height={186} rx={5} fill="#B58E70" />
    <rect x={x + back * 52 - (back > 0 ? 34 : -8) - 6} y={SEAT_Y - 160} width={36} height={110} rx={10} fill={c} opacity={0.0} />
  </g>
);
export const Lamp: React.FC<{ x: number; on: number; h?: number }> = ({ x, on, h = 420 }) => (
  <g>
    <ellipse cx={x} cy={FLOOR - h + 40} rx={170} ry={150} fill="#FFE0A8" opacity={0.45 * on} filter="url(#b40)" />
    <rect x={x - 4} y={FLOOR - h + 60} width={8} height={h - 60} fill="#A88F80" />
    <ellipse cx={x} cy={FLOOR - 4} rx={46} ry={10} fill="#A88F80" />
    <path d={`M${x - 60},${FLOOR - h + 70} L${x - 34},${FLOOR - h} L${x + 34},${FLOOR - h} L${x + 60},${FLOOR - h + 70} Z`} fill={col(on, "#E9DCCF", "#FFE7BE")} />
  </g>
);
export const Plant: React.FC<{ x: number; y?: number; s?: number; perk: number; f: number; bloom?: number }> = ({ x, y = FLOOR, s = 1, perk, f, bloom = 0 }) => {
  const t = f / 30;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M-34,0 L-42,-70 L42,-70 L34,0 Z" fill="#D8A88E" />
      {[-1, -0.5, 0, 0.5, 1].map((k, i) => {
        const a = k * (40 - 22 * perk) + 2 * Math.sin(t * 1.2 + i); const L = 90 + 30 * (1 - Math.abs(k));
        return <g key={i} transform={`translate(0,-70) rotate(${a})`}><path d={`M0,0 Q${6},${-L / 2} 0,${-L}`} stroke="#7FA56E" strokeWidth={5} fill="none" /><path d={`M0,${-L} C14,${-L + 10} 18,${-L + 34} 0,${-L + 44} C-18,${-L + 34} -14,${-L + 10} 0,${-L} Z`} fill={col(perk, "#A6B39B", "#7FBE6C")} />
          {bloom > 0 && i % 2 === 0 && <g transform={`translate(0,${-L - 4})`}><Flower s={1.1 * bloom} c={POPPIES[i % 6]} /></g>}</g>;
      })}
    </g>
  );
};
export const Rug: React.FC<{ x: number; w?: number }> = ({ x, w = 520 }) => (
  <g><ellipse cx={x} cy={FLOOR + 70} rx={w / 2} ry={46} fill="#E7B9B0" opacity={0.75} /><ellipse cx={x} cy={FLOOR + 70} rx={w / 2 - 30} ry={32} fill="none" stroke="#F6DCD5" strokeWidth={6} strokeDasharray="14 10" /></g>
);
// a small cassette tape recorder; play = 0..1 (pressed → reels turn, light on)
export const TapeRecorder: React.FC<{ x: number; y: number; play: number; f: number }> = ({ x, y, play, f }) => {
  const spin = play > 0.5 ? (f * 9) % 360 : 0;
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx={0} cy={2} rx={100} ry={8} fill="#6F5A4F" opacity={0.18} filter="url(#b4)" />
      <rect x={-96} y={-96} width={192} height={96} rx={16} fill="#E8A9A0" />
      <rect x={-86} y={-86} width={172} height={50} rx={8} fill="#FBF3EA" />
      {[-40, 40].map((cx, i) => (
        <g key={i} transform={`translate(${cx},-61) rotate(${spin})`}>
          <circle r={17} fill="#F1E2D3" stroke="#C99A8E" strokeWidth={2} />
          {[0, 60, 120].map((a) => <rect key={a} x={-2} y={-14} width={4} height={10} fill="#C99A8E" transform={`rotate(${a})`} />)}
          <circle r={4} fill="#C99A8E" />
        </g>
      ))}
      <rect x={-30} y={-72} width={60} height={22} rx={4} fill="#E9D7C6" />
      {/* buttons */}
      {[-60, -30, 0, 30].map((bx, i) => <rect key={i} x={bx} y={-26 + (i === 1 ? 6 * play : 0)} width={24} height={14 - (i === 1 ? 6 * play : 0)} rx={3} fill={i === 1 ? "#F6D46B" : "#F4D6CC"} />)}
      <path d="M-50,-21 l10,5 l-10,5 Z" fill="#B97A6E" transform="translate(28,0)" />
      <circle cx={74} cy={-20} r={5} fill={play > 0.5 ? "#9BD27F" : "#D8C9BD"} />
      {play > 0.5 && <circle cx={74} cy={-20} r={12} fill="#C8F0A8" opacity={0.6} filter="url(#b4)" />}
      {/* handle */}
      <path d="M-60,-96 Q-60,-126 -30,-126 L30,-126 Q60,-126 60,-96" stroke="#C99A8E" strokeWidth={8} fill="none" />
    </g>
  );
};
export const Hairbrush: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x},${y}) rotate(${r})`}>
    <rect x={-6} y={-6} width={70} height={12} rx={6} fill="#C99A8E" />
    <ellipse cx={-26} cy={0} rx={30} ry={20} fill="#E8A9A0" />
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={-42 + (i % 4) * 11} cy={-8 + Math.floor(i / 4) * 14} r={2.4} fill="#FBF3EA" />)}
  </g>
);
export const Basket: React.FC<{ x: number; fill: number }> = ({ x, fill }) => (
  <g transform={`translate(${x},${FLOOR})`}>
    <path d="M-70,0 L-80,-90 L80,-90 L70,0 Z" fill="#D9BC93" />
    {[0, 1, 2, 3].map((k) => <path key={k} d={`M-78,${-80 + k * 20} L78,${-80 + k * 20}`} stroke="#C4A57B" strokeWidth={3} />)}
    <path d={`M-74,-90 Q-40,${-120 - 30 * fill} 0,-100 Q40,${-130 - 20 * fill} 74,-90 Z`} fill="#F4C9C1" opacity={fill} />
  </g>
);
// stack of folded clothes on a table/stool; n folded so far
export const FoldedStack: React.FC<{ x: number; y: number; n: number }> = ({ x, y, n }) => (
  <g>{Array.from({ length: Math.floor(n) }, (_, k) => <rect key={k} x={x - 46 + (k % 2) * 4} y={y - 16 - k * 15} width={92} height={15} rx={5} fill={["#F4C9C1", "#C9D9EE", "#F6E3B4", "#D9CDEB"][k % 4]} />)}</g>
);
// walls + floor + skirting; warm = 0 (cool dusk) → 1 (golden)
export const RoomShell: React.FC<{ warm: number; width?: number; wall?: [string, string] }> = ({ warm, width = 2400, wall = ["#E9E1EA", "#FBE7D8"] }) => (
  <g>
    <defs>
      <linearGradient id="wallg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col(warm, "#DCD8DE", wall[0])} /><stop offset="1" stopColor={col(warm, "#E6E0DE", wall[1])} /></linearGradient>
      <linearGradient id="floorg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={col(warm, "#CDBFB4", "#E2B994")} /><stop offset="1" stopColor={col(warm, "#BDAEA3", "#D4A580")} /></linearGradient>
    </defs>
    <rect x={-200} y={0} width={width + 400} height={FLOOR} fill="url(#wallg)" />
    {/* soft wallpaper dots */}
    {Array.from({ length: 120 }, (_, i) => <circle key={i} cx={-200 + (i % 15) * 190 + (Math.floor(i / 15) % 2) * 95} cy={120 + Math.floor(i / 15) * 180} r={5} fill="#FFFFFF" opacity={0.35} />)}
    <rect x={-200} y={FLOOR - 26} width={width + 400} height={26} fill={col(warm, "#E7E0DA", "#FFF4E8")} />
    <rect x={-200} y={FLOOR} width={width + 400} height={400} fill="url(#floorg)" />
    {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${-200 + i * 100},${FLOOR} L${-260 + i * 100 - 40},1920`} stroke="#C49E7E" strokeWidth={2} opacity={0.35} />)}
    {Array.from({ length: 6 }, (_, i) => <ellipse key={`g${i}`} cx={rnd(i) * width} cy={FLOOR + 160 + rnd(i + 3) * 160} rx={160} ry={14} fill="#FFFFFF" opacity={0.08} />)}
  </g>
);
export const Shelf: React.FC<{ x: number; y: number; f: number; perk: number }> = ({ x, y, f, perk }) => (
  <g>
    <rect x={x - 140} y={y} width={280} height={14} rx={5} fill="#D9B494" />
    {[["#C9D9EE", 34], ["#F4C9C1", 46], ["#F6E3B4", 40]].map(([c, hh], i) => <rect key={i} x={x - 120 + i * 30} y={y - (hh as number)} width={24} height={hh as number} rx={3} fill={c as string} />)}
    <g transform={`translate(${x + 70},${y}) scale(0.45)`}><Plant x={0} y={0} perk={perk} f={f} /></g>
    <path d={blob(x - 10, y - 20, 18, 3, 1)} fill="#E8A9A0" opacity={0} />
  </g>
);

// blur filters shared with the landscape kit (needed when a scene has no <Land>)
export const Defs: React.FC = () => (
  <defs>
    <filter id="b4" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4" /></filter>
    <filter id="b8" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8" /></filter>
    <filter id="b16" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="16" /></filter>
    <filter id="b40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
  </defs>
);

// small framed pictures (soft abstract shapes) and a hanging plant, for life on the walls
export const Frames: React.FC<{ x: number; y: number; warm: number }> = ({ x, y, warm }) => (
  <g>
    <rect x={x} y={y} width={120} height={150} rx={6} fill="#FBF5EC" />
    <rect x={x + 12} y={y + 12} width={96} height={126} rx={3} fill={col(warm, "#DCD3DA", "#F6D9CF")} />
    <circle cx={x + 60} cy={y + 60} r={24} fill={col(warm, "#C9C1CB", "#F6B48F")} />
    <path d={`M${x + 12},${y + 138} Q${x + 50},${y + 90} ${x + 108},${y + 120} L${x + 108},${y + 138} Z`} fill={col(warm, "#BFC6BC", "#9FC48E")} />
    <rect x={x + 150} y={y + 40} width={100} height={100} rx={6} fill="#FBF5EC" />
    <rect x={x + 160} y={y + 50} width={80} height={80} rx={3} fill={col(warm, "#D8D6E0", "#D9CDEB")} />
    {[0, 1, 2].map((k) => <circle key={k} cx={x + 180 + k * 20} cy={y + 90 + (k % 2) * 10} r={8} fill={col(warm, "#C9C1CB", ["#F4A3B8", "#F6D46B", "#9FC48E"][k])} />)}
  </g>
);
export const HangingPlant: React.FC<{ x: number; y: number; f: number; perk: number }> = ({ x, y, f, perk }) => {
  const t = f / 30; const sw = 2 * Math.sin(t * 0.9);
  return (
    <g transform={`rotate(${sw} ${x} 0)`}>
      <path d={`M${x},0 L${x},${y - 60}`} stroke="#A88F80" strokeWidth={2} />
      <path d={`M${x - 44},${y - 60} L${x + 44},${y - 60} L${x + 30},${y} L${x - 30},${y} Z`} fill="#E8A9A0" />
      {[-1, -0.4, 0.3, 1].map((k, i) => (
        <path key={i} d={`M${x + k * 30},${y - 50} q${k * 20 + 4 * Math.sin(t + i)},${60} ${k * 10},${120 + i * 26}`} stroke={col(perk, "#A6B39B", "#7FBE6C")} strokeWidth={5} fill="none" strokeLinecap="round" />
      ))}
      {[-1, -0.4, 0.3, 1].map((k, i) => <circle key={`l${i}`} cx={x + k * 20} cy={y + 40 + i * 24} r={9} fill={col(perk, "#A6B39B", "#89C677")} />)}
    </g>
  );
};
