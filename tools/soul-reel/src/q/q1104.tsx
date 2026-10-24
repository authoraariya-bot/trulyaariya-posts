// 4 Nov · Savage · "You are the moon of your world. Don't dim yourself to blend in with the stars."
// A lavender mountain lake at night, pines swaying, the moon's reflection rippling. A glassy brightness slider appears
// and drags the moon down until it is no bigger or brighter than the stars around it. Then the slider snaps back to
// max: the moon blooms with a halo, an aurora unfurls, the lake lights up and the stars drift in to look.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { QFrame, Words, W, KeyW, seg, sm, lerp, rnd, back, spring, mix } from "./kit";
import { EndCard } from "../kit/Words";

export const END = 420; const WIPE = 330, CARD = 348;
const T = { slider: 60, drag0: 96, drag1: 160, snap: 172, aur: 182, l2: 100, l3: 196, key: 222 };
const M = { x: 540, y: 760 };
const LAKE = 1210;

// brightness: 1 → 0.08 while dragged (with a hesitation), then snaps to 1.15 with overshoot
const brightAt = (f: number) => {
  const d = sm(seg(f, T.drag0, T.drag0 + 24)) * 0.5 + sm(seg(f, T.drag0 + 34, T.drag1)) * 0.42;
  return lerp(1 - d, 1.15, spring(seg(f, T.snap, T.snap + 40), 2, 4.5));
};

const World: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30, b = brightAt(f);
  const full = sm(seg(f, T.snap, T.snap + 20)), aur = sm(seg(f, T.aur, T.aur + 50));
  const R = lerp(16, 130, Math.min(1, b));
  const flash = Math.sin(Math.PI * seg(f, T.snap, T.snap + 14));
  const drift = sm(seg(f, T.aur, T.aur + 80));
  return (
    <g>
      <defs>
        <linearGradient id="sky1104" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#2A2A63", "#3A2F78", full)} /><stop offset="0.6" stopColor={mix("#5A4A96", "#8A6BC2", full)} /><stop offset="1" stopColor={mix("#8E79B9", "#C8A0D8", full)} /></linearGradient>
        <radialGradient id="moonhalo"><stop offset="0" stopColor="#FFF6DE" stopOpacity={0.9} /><stop offset="0.4" stopColor="#FFE9C2" stopOpacity={0.35} /><stop offset="1" stopColor="#FFE9C2" stopOpacity={0} /></radialGradient>
        <radialGradient id="moonface" cx="0.4" cy="0.38"><stop offset="0" stopColor="#FFFDF4" /><stop offset="1" stopColor="#F2E2C4" /></radialGradient>
        <linearGradient id="lake1104" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#4A3F86", "#7A5FB0", full)} /><stop offset="1" stopColor="#2E2860" /></linearGradient>
        <linearGradient id="aur1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7FF0C8" stopOpacity={0} /><stop offset="0.4" stopColor="#7FF0C8" stopOpacity={0.55} /><stop offset="1" stopColor="#FF9DD0" stopOpacity={0} /></linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#sky1104)" />
      {/* aurora curtains */}
      {aur > 0 && [0, 1, 2].map((k) => { const pts = Array.from({ length: 24 }, (_, i) => { const x = -60 + i * 52; return [x, 420 + 60 * k + 50 * Math.sin(x / 140 + t * 0.9 + k) + 30 * Math.sin(x / 60 - t * 1.3)]; });
        const d = `M${pts.map((p) => p.join(",")).join(" L")} L1200,${900 + 40 * k} L-60,${900 + 40 * k} Z`;
        return <path key={k} d={d} fill="url(#aur1)" opacity={aur * (0.6 - 0.15 * k)} filter="url(#qb16)" />; })}
      {/* stars: drift in toward the moon once it shines */}
      {Array.from({ length: 90 }, (_, i) => { const x0 = rnd(i) * 1080, y0 = 120 + rnd(i + 1) * 950; const dx = M.x - x0, dy = M.y - y0, dist = Math.hypot(dx, dy) || 1;
        const pull = drift * Math.min(1, 160 / dist) * 0.25; const x = x0 + dx * pull, y = y0 + dy * pull;
        const tw = 0.5 + 0.5 * Math.sin(t * (2 + rnd(i + 3) * 3) + i), r = 1.6 + 3 * rnd(i + 2);
        return <g key={i}><circle cx={x} cy={y} r={r} fill="#FFF6E0" opacity={0.4 + 0.6 * tw} />{r > 4 && <path d={`M${x - 10},${y} L${x + 10},${y} M${x},${y - 10} L${x},${y + 10}`} stroke="#FFF6E0" strokeWidth={1.5} opacity={0.6 * tw} />}</g>; })}
      {/* the moon */}
      <circle cx={M.x} cy={M.y} r={R * (2.6 + 1.2 * full)} fill="url(#moonhalo)" opacity={Math.min(1, b) * (0.8 + 0.4 * flash)} />
      <circle cx={M.x} cy={M.y} r={R} fill="url(#moonface)" opacity={0.45 + 0.55 * Math.min(1, b)} />
      {R > 40 && [[-30, -20, 18], [26, 12, 12], [-8, 40, 9], [40, -36, 8]].map(([x, y, r], i) => <circle key={i} cx={M.x + x * R / 130} cy={M.y + y * R / 130} r={r * R / 130} fill="#E9D6B4" opacity={0.6} />)}
      {flash > 0 && Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2; return <line key={i} x1={M.x + Math.cos(a) * 150} y1={M.y + Math.sin(a) * 150} x2={M.x + Math.cos(a) * (150 + 260 * flash)} y2={M.y + Math.sin(a) * (150 + 260 * flash)} stroke="#FFF4D6" strokeWidth={6} opacity={flash} strokeLinecap="round" />; })}
      {/* mountains */}
      <path d="M-40,1210 L160,980 L300,1100 L470,900 L640,1110 L780,1000 L960,1150 L1120,1040 L1120,1220 L-40,1220 Z" fill={mix("#6E5AA6", "#9A7AC8", full)} />
      <path d="M470,900 L520,960 L500,980 L540,1010 L430,960 Z" fill="#FFFFFF" opacity={0.35} />
      <path d="M-40,1220 L120,1100 L260,1170 L420,1060 L580,1180 L760,1090 L900,1180 L1120,1110 L1120,1230 L-40,1230 Z" fill={mix("#4E3F86", "#6F55A8", full)} />
      {/* lake + reflection */}
      <rect x={0} y={LAKE} width={1080} height={460} fill="url(#lake1104)" />
      <g filter="url(#qb4)">
        {Array.from({ length: 26 }, (_, i) => { const y = LAKE + 10 + i * 15 + i * i * 0.2, ph = Math.floor(f / 6 + i * 3), w = (R * 1.5) * (0.4 + 0.9 * rnd(ph + i * 17)) * (1 + i * 0.03), x = M.x + 18 * Math.sin(t * 1.7 + i * 0.9);
          return <ellipse key={i} cx={x + 20 * (rnd(ph + i) - 0.5)} cy={y} rx={w / 2} ry={3 + i * 0.25} fill="#FFF0C8" opacity={(0.2 + 0.6 * Math.min(1, b)) * (1 - i * 0.03)} />; })}
      </g>
      {aur > 0 && <rect x={0} y={LAKE} width={1080} height={200} fill="#7FF0C8" opacity={0.08 * aur} />}
      {/* pines on both shores, swaying */}
      {Array.from({ length: 14 }, (_, i) => { const left = i < 7, x = left ? -30 + i * 40 : 830 + (i - 7) * 42, h = 220 + 160 * rnd(i), sw = 3 * Math.sin(t * 1.4 + i);
        return <g key={i} transform={`translate(${x} ${LAKE + 30}) rotate(${sw})`}>
          <rect x={-5} y={-30} width={10} height={40} fill="#231E44" />
          {[0, 1, 2, 3].map((k) => <path key={k} d={`M0,${-h + k * h * 0.22} L${-(30 + k * 14)},${-h * 0.62 + k * h * 0.22} L${30 + k * 14},${-h * 0.62 + k * h * 0.22} Z`} fill="#2B2552" />)}
        </g>; })}
      {/* foreground reeds */}
      <rect x={0} y={1660} width={1080} height={260} fill="#2A2350" />
      {Array.from({ length: 50 }, (_, i) => { const x = i * 22 + 8 * rnd(i), h = 120 + 140 * rnd(i + 1), bnd = 12 * Math.sin(t * 1.6 + i * 0.4) + 6;
        return <path key={i} d={`M${x},1700 Q${x + bnd * 0.4},${1700 - h * 0.6} ${x + bnd},${1700 - h}`} stroke={i % 3 ? "#3F3870" : "#544A8A"} strokeWidth={6} fill="none" strokeLinecap="round" />; })}
      {/* fireflies over the reeds */}
      {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={(rnd(i) * 1080 + 30 * Math.sin(t * 0.8 + i)) % 1080} cy={1540 + 120 * rnd(i + 1) + 20 * Math.sin(t + i)} r={4} fill="#FFF0A0" opacity={0.4 + 0.5 * Math.sin(t * 3 + i)} />)}
    </g>
  );
};

// the brightness slider: glassy pill with a sun icon, its fill tracks the moon's brightness
const Slider: React.FC<{ f: number }> = ({ f }) => {
  const app = back(seg(f, T.slider, T.slider + 14), 1.8), gone = sm(seg(f, T.aur + 30, T.aur + 50));
  if (f < T.slider || gone >= 1) return null;
  const b = Math.min(1, brightAt(f));
  const H = 420, x = 900, y = 560;
  return (
    <div style={{ position: "absolute", left: x - 60, top: y, width: 120, height: H, borderRadius: 60, overflow: "hidden", background: "rgba(255,255,255,0.22)", backdropFilter: "blur(14px)", border: "2px solid rgba(255,255,255,0.45)",
      scale: `${app}`, opacity: 1 - gone, boxShadow: "0 20px 60px rgba(20,10,60,0.35)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${b * 100}%`, background: "linear-gradient(180deg,#FFF6DE,#FFE2A8)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, textAlign: "center", fontSize: 44, color: "#6A4A8A" }}>☀</div>
    </div>
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <Slider f={f} />
    <Words f={f} from={0} to={T.l2 - 6} top={190} size={84} color="#FFFFFF" glow="rgba(30,20,70,0.6)">
      <div><W f={f} at={2}>You</W><W f={f} at={6}>are</W><W f={f} at={10}>the</W><W f={f} at={14} last><i>moon</i></W></div>
      <div><W f={f} at={22}>of</W><W f={f} at={26}>your</W><W f={f} at={31} last>world.</W></div>
    </Words>
    <Words f={f} from={T.l2} to={WIPE - 4} top={170} size={78} color="#FFFFFF" glow="rgba(30,20,70,0.6)">
      <div><W f={f} at={T.l2 + 2}>Don't</W><W f={f} at={T.l2 + 8}>dim</W><W f={f} at={T.l2 + 14} last>yourself</W></div>
      <div style={{ fontSize: 66 }}><W f={f} at={T.l3}>to</W><W f={f} at={T.l3 + 4}>blend</W><W f={f} at={T.l3 + 9}>in</W><W f={f} at={T.l3 + 12}>with</W><W f={f} at={T.l3 + 16} last>the</W></div>
      <div style={{ marginTop: -8 }}><KeyW f={f} at={T.key} color="#FFC2DA" size={140}>stars.</KeyW></div>
    </Words>
    <EndCard f={f} wipe={WIPE} card={CARD} />
  </AbsoluteFill>
);

export const Q1104: React.FC = () => { const f = useCurrentFrame(); return <QFrame world={<World f={f} />} overlay={<Overlay f={f} />} audio="q1104.wav" bg="#2A2A63" />; };
export const BEATS = { ...T, END, WIPE, CARD };
