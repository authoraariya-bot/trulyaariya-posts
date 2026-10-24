// 2 Nov · Healing · "A tree stands only as long as its roots are strong. Your roots are your soul. Heal them first."
// A misty meadow at dawn with one drooping tree; wind strips its last pale leaves. The camera dives underground:
// grey, knotted roots around a faint glowing heart of light (the soul). The light swells and runs gold up every
// root, the knots loosen, and the camera rises as the tree bursts into pink blossom.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { QFrame, Words, W, KeyW, Motes, seg, sm, lerp, rnd, mix } from "./kit";
import { EndCard } from "../kit/Words";
import { LightLeak } from "../kit/fx";

export const END = 420; const WIPE = 330, CARD = 348;
const T = { dive0: 84, dive1: 126, glow: 130, flow0: 146, flow1: 206, rise0: 208, rise1: 240, bloom: 236, line2: 112, line3: 244, key: 268 };
const GY = 1380, BASE = { x: 540, y: GY };
const SOUL = { x: 540, y: 2260 };

// deterministic root system
type Seg = { d: string; w: number; depth: number; cx: number; cy: number };
const ROOTS: Seg[] = (() => {
  const out: Seg[] = []; let k = 0;
  const grow = (x: number, y: number, a: number, len: number, depth: number) => {
    if (depth > 4 || len < 40) return;
    const r = (n: number) => rnd(k * 7 + n);
    const a2 = a + (r(1) - 0.5) * 0.7, x2 = x + Math.sin(a2) * len, y2 = y + Math.cos(a2) * len;
    const cx = (x + x2) / 2 + (r(2) - 0.5) * len * 0.5, cy = (y + y2) / 2 + (r(3) - 0.5) * len * 0.3;
    out.push({ d: `M${x},${y} Q${cx},${cy} ${x2},${y2}`, w: Math.max(4, 26 - depth * 5.5), depth, cx, cy }); k++;
    const n = depth < 2 ? 3 : 2;
    for (let i = 0; i < n; i++) grow(x2, y2, a2 + (i - (n - 1) / 2) * (0.7 + 0.3 * r(4 + i)), len * (0.72 + 0.1 * r(6 + i)), depth + 1);
  };
  [-0.9, -0.3, 0.3, 0.9].forEach((a) => grow(BASE.x + a * 20, BASE.y, a, 260, 0));
  return out;
})();

const World: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30;
  const cam = -1080 * sm(seg(f, T.dive0, T.dive1)) * (1 - sm(seg(f, T.rise0, T.rise1)));
  const heal = sm(seg(f, T.flow0, T.flow1));
  const bloom = sm(seg(f, T.bloom, T.bloom + 40));
  const glow = sm(seg(f, T.glow, T.glow + 20));
  const leafGust = Math.sin(Math.PI * seg(f, 20, 90));
  return (
    <g transform={`translate(0 ${cam})`}>
      <defs>
        <linearGradient id="sky1102" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#B9B3D9", "#BFD9FF", bloom)} /><stop offset="0.55" stopColor={mix("#F2C6CF", "#FFC9D9", bloom)} /><stop offset="1" stopColor={mix("#FBE0C4", "#FFE7B0", bloom)} /></linearGradient>
        <linearGradient id="soil1102" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8A5E58" /><stop offset="0.4" stopColor="#6A4656" /><stop offset="1" stopColor="#3E2A48" /></linearGradient>
        <radialGradient id="soul1102"><stop offset="0" stopColor="#FFF4C8" /><stop offset="0.35" stopColor="#FFD27A" stopOpacity={0.8} /><stop offset="1" stopColor="#FFB14A" stopOpacity={0} /></radialGradient>
        <linearGradient id="grass1102" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#A7C9A0", "#8FD69A", bloom)} /><stop offset="1" stopColor={mix("#86AE84", "#6CC07C", bloom)} /></linearGradient>
      </defs>
      {/* sky, sun, hills, mist */}
      <rect x={0} y={-200} width={1080} height={GY + 200} fill="url(#sky1102)" />
      <circle cx={760} cy={lerp(1180, 1040, bloom)} r={90} fill="#FFF3D2" opacity={0.6 + 0.4 * bloom} />
      <circle cx={760} cy={lerp(1180, 1040, bloom)} r={260} fill="#FFE6B0" opacity={0.35} filter="url(#qb40)" />
      <path d="M0,1180 C200,1110 380,1150 560,1120 C760,1090 900,1140 1080,1110 L1080,1400 L0,1400 Z" fill={mix("#C9B6D9", "#D7B9E6", bloom)} />
      <path d="M0,1260 C220,1210 420,1250 620,1230 C820,1210 940,1250 1080,1235 L1080,1400 L0,1400 Z" fill={mix("#B7C9B2", "#A8D9AE", bloom)} />
      {[0, 1, 2].map((i) => <rect key={i} x={((t * (14 + 6 * i) + i * 300) % 1600) - 500} y={1180 + i * 50} width={900} height={40} rx={20} fill="#FFFFFF" opacity={0.35} filter="url(#qb16)" />)}
      {/* ground + grass */}
      <rect x={0} y={GY - 20} width={1080} height={80} fill="url(#grass1102)" />
      {Array.from({ length: 70 }, (_, i) => { const x = i * 16 + 8 * rnd(i), h = 40 + 60 * rnd(i + 1), b = 14 * Math.sin(t * 1.8 + i * 0.3) + 10;
        return <path key={i} d={`M${x},${GY + 10} Q${x + b * 0.4},${GY - h * 0.6} ${x + b},${GY - h}`} stroke={i % 3 ? "#7DBB84" : "#A2D49A"} strokeWidth={5} fill="none" strokeLinecap="round" />; })}
      {/* tree */}
      <g transform={`translate(${BASE.x} ${BASE.y}) rotate(${2 * Math.sin(t * 0.9)})`}>
        <path d="M-40,0 C-30,-200 -20,-380 -10,-520 L10,-520 C20,-380 30,-200 40,0 Z" fill="#8A6050" />
        <path d="M-6,-420 C-80,-480 -150,-520 -210,-600 M6,-450 C80,-510 160,-540 220,-610 M0,-500 C-10,-580 10,-640 0,-700" stroke="#8A6050" strokeWidth={22} fill="none" strokeLinecap="round" />
        {/* crown: layered leaf clusters (shadow, mid, light), sparse and pale while wilted, full when healed */}
        {(() => { const full = sm(seg(f, T.rise1 - 30, T.rise1 + 10)); const items: React.ReactNode[] = [];
          for (let layer = 0; layer < 3; layer++) for (let i = 0; i < 26; i++) {
            const n = i + layer * 40; const a = rnd(n) * Math.PI * 2, d = 40 + 230 * Math.sqrt(rnd(n + 1)); const x = Math.cos(a) * d * 1.3, y = -650 + Math.sin(a) * d * 0.62 - layer * 18;
            const keep = rnd(n + 3) < lerp(0.38, 1, full); if (!keep) continue;
            const c = mix(["#A8AC8C", "#BFC2A2", "#D2D4B8"][layer], ["#5FB37A", "#7CCB8C", "#A6E0A8"][layer], heal);
            const r = (34 + 26 * rnd(n + 2)) * lerp(0.75, 1.15, full);
            items.push(<circle key={n} cx={x + (4 + layer * 2) * Math.sin(t * 1.4 + i)} cy={y + (1 - heal) * 36} r={r} fill={c} />);
          }
          return items; })()}
        {bloom > 0 && Array.from({ length: 40 }, (_, i) => { const a = rnd(i + 50) * Math.PI * 2, d = 50 + 230 * Math.sqrt(rnd(i + 51)), p = sm(seg(f, T.bloom + rnd(i) * 30, T.bloom + rnd(i) * 30 + 16));
          const x = Math.cos(a) * d * 1.3 + 6 * Math.sin(t * 1.4 + i), y = -680 + Math.sin(a) * d * 0.62;
          return <g key={`b${i}`} transform={`translate(${x} ${y}) scale(${p * (0.8 + 0.5 * rnd(i + 52))}) rotate(${i * 37})`}>
            {Array.from({ length: 5 }, (_, k) => <ellipse key={k} cx={0} cy={-11} rx={8} ry={12} fill={["#FFB7CF", "#FF9DBD", "#FFD3E1"][i % 3]} transform={`rotate(${k * 72})`} />)}
            <circle r={4} fill="#FFE38A" />
          </g>; })}
      </g>
      {/* pale leaves torn away by the wind at the start */}
      {Array.from({ length: 16 }, (_, i) => { const p = seg(f, 10 + i * 4, 70 + i * 4); if (p <= 0 || p >= 1) return null;
        const x0 = BASE.x - 200 + 400 * rnd(i), y0 = 700 + 200 * rnd(i + 1);
        return <ellipse key={i} cx={x0 + p * 700 * (0.6 + leafGust)} cy={y0 + p * 400 + 60 * Math.sin(p * 9)} rx={14} ry={8} transform={`rotate(${p * 600} ${x0 + p * 700} ${y0 + p * 400})`} fill="#C8C49A" opacity={Math.sin(Math.PI * p)} />; })}
      {/* underground */}
      <rect x={0} y={GY + 40} width={1080} height={1700} fill="url(#soil1102)" />
      {Array.from({ length: 30 }, (_, i) => <ellipse key={i} cx={rnd(i) * 1080} cy={GY + 120 + rnd(i + 1) * 1400} rx={20 + 30 * rnd(i + 2)} ry={10 + 12 * rnd(i + 3)} fill="#4A3048" opacity={0.5} />)}
      {[1520, 1700, 1980].map((y, i) => <path key={i} d={`M0,${y} C300,${y - 30} 700,${y + 30} 1080,${y}`} stroke="#7A5260" strokeWidth={3} opacity={0.5} fill="none" />)}
      <circle cx={SOUL.x} cy={SOUL.y} r={lerp(120, 520, glow) * (1 + 0.05 * Math.sin(t * 3))} fill="url(#soul1102)" opacity={0.35 + 0.65 * glow} />
      {ROOTS.map((r, i) => <path key={i} d={r.d} stroke={mix("#9A8A94", "#C8A070", heal)} strokeWidth={r.w} fill="none" strokeLinecap="round" />)}
      {/* knots that loosen */}
      {heal < 1 && ROOTS.filter((_, i) => i % 5 === 2).map((r, i) => { const x = r.cx, y = r.cy;
        const pts = Array.from({ length: 24 }, (_, k) => { const a = k * 0.9, rr = 18 + 10 * Math.sin(k * 1.7 + i); return `${x + rr * Math.cos(a) * (1 + 3 * heal)},${y + rr * Math.sin(a) * 0.6}`; });
        return <polyline key={i} points={pts.join(" ")} stroke="#8A7A86" strokeWidth={6} fill="none" opacity={1 - heal} />; })}
      {/* gold light running up every root */}
      {heal > 0 && ROOTS.map((r, i) => { const p = sm(seg(heal, r.depth * 0.08, 0.6 + r.depth * 0.08));
        return <path key={`g${i}`} d={r.d} stroke="#FFD67A" strokeWidth={r.w * 0.55} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} filter="url(#qb2)" />; })}
      {/* the soul light: a soft heart */}
      <path d="M0,-30 C30,-70 90,-40 60,10 C40,40 10,60 0,72 C-10,60 -40,40 -60,10 C-90,-40 -30,-70 0,-30 Z" transform={`translate(${SOUL.x} ${SOUL.y}) scale(${lerp(0.6, 1.1, glow) * (1 + 0.06 * Math.sin(t * 4))})`} fill="#FFE6A0" opacity={0.45 + 0.55 * glow} />
      {glow > 0 && Array.from({ length: 30 }, (_, i) => { const p = ((f - T.glow) / 50 + rnd(i)) % 1, a = rnd(i + 3) * Math.PI * 2;
        return <circle key={i} cx={SOUL.x + Math.cos(a) * 400 * p} cy={SOUL.y + Math.sin(a) * 300 * p - 200 * p} r={4} fill="#FFF0B0" opacity={Math.sin(Math.PI * p) * glow} />; })}
      {/* blossom petals drifting once healed */}
      {bloom > 0 && Array.from({ length: 30 }, (_, i) => { const p = ((f - T.bloom) / (70 + 30 * rnd(i)) + rnd(i + 2)) % 1, x = 300 + rnd(i) * 600 + p * 300, y = 700 + p * 800;
        return <path key={`p${i}`} d="M0,-8 C5,-5 5,5 0,8 C-5,5 -5,-5 0,-8 Z" transform={`translate(${x} ${y}) rotate(${p * 600}) scale(1.6)`} fill="#FFB7CF" opacity={bloom * Math.sin(Math.PI * p)} />; })}
      <Motes f={f} n={24} color="#FFF4DA" y0={700} y1={1350} speed={0.4} />
    </g>
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => {
  const under = sm(seg(f, T.dive0 + 10, T.dive1)) * (1 - sm(seg(f, T.rise0, T.rise1)));
  return (
    <AbsoluteFill>
      <LightLeak f={f} amt={0.4 * sm(seg(f, T.bloom, T.bloom + 40))} side="right" tint="rose" />
      <Words f={f} from={0} to={T.line2 - 10} top={180} size={72}>
        <div><W f={f} at={2}>A</W><W f={f} at={5}>tree</W><W f={f} at={9}>stands</W><W f={f} at={14}>only</W><W f={f} at={18}>as</W><W f={f} at={21}>long</W><W f={f} at={25} last>as</W></div>
        <div><W f={f} at={30}>its</W><W f={f} at={34}><i>roots</i></W><W f={f} at={39}>are</W><W f={f} at={43} last>strong.</W></div>
      </Words>
      <Words f={f} from={T.line2 - 4} to={T.rise0 - 4} top={300} size={84} color={under > 0.5 ? "#FFF6E6" : "#3B2340"} glow={under > 0.5 ? "rgba(40,20,50,0.7)" : "rgba(255,248,240,0.9)"}>
        <div><W f={f} at={T.line2}>Your</W><W f={f} at={T.line2 + 6} last>roots</W></div>
        <div><W f={f} at={T.line2 + 12}>are</W><W f={f} at={T.line2 + 17}>your</W><W f={f} at={T.line2 + 22} last><i>soul.</i></W></div>
      </Words>
      <Words f={f} from={T.line3 - 4} to={WIPE - 4} top={200} size={84}>
        <div><W f={f} at={T.line3}>Heal</W><W f={f} at={T.line3 + 6} last>them</W></div>
        <div style={{ marginTop: -8 }}><KeyW f={f} at={T.key} color="#E0567F" size={150}>first.</KeyW></div>
      </Words>
      <EndCard f={f} wipe={WIPE} card={CARD} />
    </AbsoluteFill>
  );
};

export const Q1102: React.FC = () => { const f = useCurrentFrame(); return <QFrame world={<World f={f} />} overlay={<Overlay f={f} />} audio="q1102.wav" />; };
export const BEATS = { ...T, END, WIPE, CARD };
