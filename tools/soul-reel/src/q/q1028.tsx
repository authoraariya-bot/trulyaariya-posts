// 28 Oct · Savage · "Then: one text left on 'seen.' Twenty theories. Zero sleep. Now: one text left on 'seen.'
// 'They're probably busy.' Goodnight. Same text. Softer you."
// A phone on a nightstand by a city window at night. THEN: rain, the clock spins to 4 AM and twenty theory bubbles
// pop up around the phone. NOW: same "Seen", one calm bubble, the phone flips face down, the lamp clicks off,
// a silk sleep mask drops in and the sky clears to stars.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { QFrame, Words, W, KeyW, seg, sm, ss, lerp, rnd, back, mix } from "./kit";
import { EndCard } from "../kit/Words";

export const END = 420; const WIPE = 330, CARD = 348;
const T = { th: 34, sleep: 96, now: 140, calm: 172, flip: 206, lamp: 222, mask: 232, same: 252, key: 270 };
const ACCENT = "#FF7FA8";
const THEORIES = ["are they mad?", "was it the full stop?", "I'm too much", "they hate me", "double text?", "screenshot to bestie", "read it 14 times",
  "should've said less", "it's the vibe shift", "they're with someone", "delete the chat?", "was it the meme?", "I ruined it", "pretend I'm fine",
  "ask the group chat", "check their story", "draft a reply", "say sorry?", "online 2 mins ago", "why am I like this"];

const nowAmt = (f: number) => sm(seg(f, T.now - 6, T.now + 14));

const Phone: React.FC<{ f: number }> = ({ f }) => {
  const flip = sm(seg(f, T.flip, T.flip + 20));
  const glow = (1 - flip) * (0.6 + 0.2 * Math.sin(f / 6) * (1 - nowAmt(f)));
  const sy = Math.cos(flip * Math.PI);   // 1 → -1 : face up → face down
  const face = sy > 0;
  const hs = Math.max(0.06, Math.abs(sy) * lerp(1, 0.13, sm(seg(flip, 0.5, 1))));   // ends lying flat
  const lieY = (1440 - 310 * hs) - 1110;  // its bottom always rests on the nightstand
  const seenT = nowAmt(f) > 0.5 ? T.now + 6 : 8;
  return (
    <g transform={`translate(540 ${1110 + lieY}) scale(${lerp(1, 1.08, flip)} ${hs})`}>
      <ellipse cx={0} cy={310} rx={170} ry={18} fill="#0E0A1C" opacity={0.5} filter="url(#qb10)" />
      <circle r={380} fill="#B9A7FF" opacity={0.18 * glow} filter="url(#qb40)" />
      <rect x={-150} y={-310} width={300} height={620} rx={46} fill={face ? "#211B33" : "url(#case28)"} />
      {face ? (
        <g>
          <rect x={-138} y={-298} width={276} height={596} rx={36} fill="url(#scr28)" />
          <rect x={-40} y={-288} width={80} height={20} rx={10} fill="#211B33" />
          <circle cx={0} cy={-230} r={28} fill="#FFB7C9" /><text x={0} y={-220} textAnchor="middle" fontFamily="Jost" fontWeight={600} fontSize={26} fill="#5A2E48">J</text>
          <text x={0} y={-178} textAnchor="middle" fontFamily="Jost" fontSize={20} fill="#6B5A80">J ♡</text>
          <line x1={-138} x2={138} y1={-160} y2={-160} stroke="#E0D2F2" strokeWidth={2} />
          <g opacity={seg(f, 0, 6)}>
            <rect x={-30} y={60} width={150} height={0} />
            <rect x={-110} y={-60} width={170} height={58} rx={24} fill="#EDE6F8" /><text x={-25} y={-24} textAnchor="middle" fontFamily="Jost" fontSize={20} fill="#4A3A60">haha same</text>
            <rect x={-60} y={40} width={186} height={92} rx={26} fill="url(#bub28)" />
            <text x={33} y={78} textAnchor="middle" fontFamily="Jost" fontSize={20} fill="#FFFFFF">hey, are we</text><text x={33} y={106} textAnchor="middle" fontFamily="Jost" fontSize={20} fill="#FFFFFF">okay?</text>
            <text x={124} y={160} textAnchor="end" fontFamily="Jost" fontSize={17} fill="#8A7AA0" opacity={seg(f, seenT, seenT + 8)}>Seen 11:42 PM</text>
          </g>
          <rect x={-120} y={232} width={240} height={44} rx={22} fill="#FFFFFF" opacity={0.85} />
          <path d={`M-118,-296 L-40,-296 L-120,40 Z`} fill="#FFFFFF" opacity={0.06} />
        </g>
      ) : (
        <g><rect x={-110} y={-280} width={96} height={110} rx={28} fill="#9C86E8" /><circle cx={-82} cy={-250} r={20} fill="#2A2240" /><circle cx={-42} cy={-206} r={20} fill="#2A2240" />
          <path d="M-140,-200 L140,180" stroke="#FFFFFF" strokeWidth={30} opacity={0.08} /></g>
      )}
    </g>
  );
};

const World: React.FC<{ f: number }> = ({ f }) => {
  const n = nowAmt(f), t = f / 30;
  const lampOff = sm(seg(f, T.lamp, T.lamp + 6));
  const rain = 1 - n;
  // the clock: spins 11:42 → 4:07 during THEN; NOW shows 11:43
  const mins = n > 0.5 ? 11 * 60 + 43 : Math.round(lerp(11 * 60 + 42, 28 * 60 + 7, ss(seg(f, T.th, T.now - 10))));
  const hh = Math.floor(mins / 60) % 12 || 12, mm = mins % 60;
  const clock = `${hh}:${String(mm).padStart(2, "0")}`;
  return (
    <g>
      <defs>
        <linearGradient id="wall28" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#3A2F63", "#2A2452", lampOff)} /><stop offset="1" stopColor={mix("#5A3F7A", "#352C5E", lampOff)} /></linearGradient>
        <linearGradient id="nsky28" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#2B3A68", "#1D2A5C", n)} /><stop offset="1" stopColor={mix("#6A5C94", "#7B5FA8", n)} /></linearGradient>
        <linearGradient id="scr28" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FBF7FF" /><stop offset="1" stopColor="#F1E9FB" /></linearGradient>
        <linearGradient id="bub28" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#B48CFF" /><stop offset="1" stopColor="#FF8FB8" /></linearGradient>
        <linearGradient id="case28" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#C9B6FF" /><stop offset="1" stopColor="#A58BF2" /></linearGradient>
        <linearGradient id="stand28" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F4C7B5" /><stop offset="1" stopColor="#D99C8C" /></linearGradient>
        <clipPath id="win28"><rect x={150} y={470} width={780} height={690} rx={14} /></clipPath>
      </defs>
      <rect width={1080} height={1920} fill="url(#wall28)" />
      {/* window: city at night */}
      <g clipPath="url(#win28)">
        <rect x={150} y={470} width={780} height={690} fill="url(#nsky28)" />
        {Array.from({ length: 60 }, (_, i) => <circle key={i} cx={160 + rnd(i) * 760} cy={480 + rnd(i + 1) * 380} r={1 + 2 * rnd(i + 2)} fill="#FFF6E0" opacity={n * (0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i)))} />)}
        <g opacity={n}><circle cx={790} cy={600} r={54} fill="#FFF2D9" /><circle cx={812} cy={588} r={50} fill="#22306A" /></g>
        {Array.from({ length: 11 }, (_, i) => { const x = 150 + i * 74, h = 160 + 200 * rnd(i + 7), w = 70;
          return <g key={i}><rect x={x} y={1160 - h} width={w} height={h} fill={i % 2 ? "#3D2F66" : "#47367A"} />
            {Array.from({ length: Math.floor(h / 34) * 2 }, (_, k) => { const lit = rnd(i * 31 + k) > 0.45; const flick = n > 0.5 ? 1 : 0.6 + 0.4 * Math.sin(t * 7 + k * 3 + i);
              return lit ? <rect key={k} x={x + 12 + (k % 2) * 28} y={1160 - h + 16 + Math.floor(k / 2) * 34} width={16} height={18} rx={2} fill={["#FFD6A0", "#FF9FC4", "#9FE3FF"][k % 3]} opacity={0.75 * flick} /> : null; })}
          </g>; })}
        {/* rain streaks on the glass */}
        {rain > 0.02 && Array.from({ length: 70 }, (_, i) => { const x = 150 + rnd(i) * 780, sp = 30 + 30 * rnd(i + 3), y = 470 + ((rnd(i + 1) * 690 + f * sp) % 760) - 40;
          return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 34 + 20 * rnd(i)} stroke="#CFE3FF" strokeWidth={2} opacity={0.5 * rain} />; })}
        {rain > 0.02 && Array.from({ length: 24 }, (_, i) => <circle key={`d${i}`} cx={160 + rnd(i + 50) * 760} cy={480 + rnd(i + 60) * 660 + (f * (0.4 + rnd(i)) % 40)} r={3 + 4 * rnd(i)} fill="#DCEBFF" opacity={0.45 * rain} />)}
      </g>
      <rect x={150} y={470} width={780} height={690} rx={14} fill="none" stroke="#F3E6FF" strokeWidth={18} opacity={0.9} />
      <line x1={540} x2={540} y1={470} y2={1160} stroke="#F3E6FF" strokeWidth={12} opacity={0.9} />
      {/* sheer curtains, breathing */}
      {[-1, 1].map((d) => { const x0 = d < 0 ? 120 : 960; const sw = 18 * Math.sin(t * 1.1 + d) + (n > 0.5 ? 10 * Math.sin(t * 0.7) : 0);
        return <path key={d} d={`M${x0},440 C${x0 - d * 40 + sw},700 ${x0 + d * 20 - sw},950 ${x0 - d * 30 + sw * 1.4},1240 L${x0 + d * 120},1240 C${x0 + d * 110},950 ${x0 + d * 150},700 ${x0 + d * 110},440 Z`} fill="#E7D6FF" opacity={0.35} />; })}
      {/* moonlight beam once the lamp is off */}
      <path d="M760,520 L360,1460 L860,1460 L940,560 Z" fill="#CFE0FF" opacity={0.12 * lampOff} filter="url(#qb24)" />
      {/* nightstand */}
      <rect x={-20} y={1440} width={1120} height={60} rx={14} fill="url(#stand28)" />
      <rect x={-20} y={1500} width={1120} height={420} fill="#B97F78" />
      <rect x={60} y={1560} width={420} height={140} rx={12} fill="#C98E86" /><rect x={600} y={1560} width={420} height={140} rx={12} fill="#C98E86" />
      <circle cx={270} cy={1630} r={10} fill="#F4D2B0" /><circle cx={810} cy={1630} r={10} fill="#F4D2B0" />
      {/* lamp */}
      <g>
        <ellipse cx={170} cy={1180} rx={260} ry={260} fill="#FFD9A0" opacity={0.35 * (1 - lampOff)} filter="url(#qb40)" />
        <rect x={160} y={1250} width={20} height={190} fill="#E8C6A8" /><ellipse cx={170} cy={1440} rx={70} ry={12} fill="#E8C6A8" />
        <path d="M80,1260 L110,1130 L230,1130 L260,1260 Z" fill={mix("#FFE7C2", "#B9A3D6", lampOff)} />
      </g>
      {/* alarm clock */}
      <g transform="translate(880 1360)">
        <rect x={-110} y={-70} width={220} height={140} rx={40} fill="#9EE6CF" /><rect x={-88} y={-48} width={176} height={84} rx={20} fill="#1F2A3A" />
        <text x={0} y={14} textAnchor="middle" fontFamily="Jost" fontWeight={600} fontSize={52} fill="#FF8FB1" opacity={1 - 0.6 * lampOff}>{clock}</text>
      </g>
      {/* theory bubbles */}
      {THEORIES.map((w, i) => {
        const at = T.th + i * 4.6, p = back(seg(f, at, at + 10), 2.4), out = sm(seg(f, T.now - 10 + rnd(i) * 6, T.now));
        if (f < at || out >= 1) return null;
        const a = (i / THEORIES.length) * Math.PI * 2 + rnd(i) * 0.6, rx = 330 + 70 * rnd(i + 2), ry = 430 + 80 * rnd(i + 3);
        const x = 540 + Math.cos(a) * rx, y = 1060 + Math.sin(a) * ry * 0.85 + 6 * Math.sin(t * 3 + i);
        const wd = w.length * 17 + 44;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${p * (1 + 0.6 * out)})`} opacity={1 - out}>
            <rect x={-wd / 2} y={-30} width={wd} height={60} rx={30} fill={["#FFFFFF", "#FFE3EE", "#E9E1FF", "#DDF7EE"][i % 4]} opacity={0.95} />
            <text y={9} textAnchor="middle" fontFamily="Jost" fontWeight={500} fontSize={30} fill="#4A2E5A">{w}</text>
          </g>
        );
      })}
      {/* the calm bubble */}
      {(() => { const p = back(seg(f, T.calm, T.calm + 12), 2), o = 1 - seg(f, T.flip + 4, T.flip + 16); if (f < T.calm || o <= 0) return null;
        return <g transform={`translate(540 700) scale(${p})`} opacity={o}><rect x={-230} y={-40} width={460} height={80} rx={40} fill="#FFFFFF" /><text y={12} textAnchor="middle" fontFamily="Caveat" fontWeight={700} fontSize={44} fill="#7A4FD0">they're probably busy.</text></g>; })()}
      <Phone f={f} />
      {/* silk sleep mask drops onto the nightstand */}
      {f >= T.mask && (() => { const p = seg(f, T.mask, T.mask + 14), y = lerp(820, 1408, p * p) - 22 * Math.sin(Math.PI * seg(f, T.mask + 16, T.mask + 26)), r = lerp(-30, -6, p);
        return <g transform={`translate(400 ${y}) rotate(${r})`} opacity={seg(f, T.mask, T.mask + 5)}>
          <path d="M-110,0 C-110,-50 -40,-56 0,-30 C40,-56 110,-50 110,0 C110,40 50,52 0,30 C-50,52 -110,40 -110,0 Z" fill="#C7B3FF" />
          <path d="M-60,4 Q-40,18 -20,4 M20,4 Q40,18 60,4" stroke="#7A5FC8" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M-110,-4 C-150,-10 -170,10 -190,30 M110,-4 C150,-10 170,10 190,30" stroke="#C7B3FF" strokeWidth={10} fill="none" strokeLinecap="round" />
        </g>; })()}
      {/* zzz once it's dark */}
      {f > T.mask + 20 && [0, 1, 2].map((i) => { const p = ((f - T.mask - 20) / 40 + i / 3) % 1;
        return <text key={i} x={620 + 60 * p + 20 * i} y={1380 - 160 * p} fontFamily="Caveat" fontWeight={700} fontSize={40 + 16 * i} fill="#E9DEFF" opacity={Math.sin(Math.PI * p) * 0.8}>z</text>; })}
      <rect width={1080} height={1920} fill="#0B0820" opacity={0.25 * lampOff} />
    </g>
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => {
  const g = "rgba(20,10,40,0.7)";
  const tag = (label: string, a: number, b: number, c: string) => { const o = Math.min(seg(f, a, a + 8), 1 - seg(f, b, b + 8)); if (o <= 0) return null;
    return <div style={{ position: "absolute", left: 76, top: 150, padding: "8px 26px", borderRadius: 40, background: c, fontFamily: "Jost", fontWeight: 600, fontSize: 34, letterSpacing: 4, color: "#2B1D3D", opacity: o, scale: `${0.8 + 0.2 * back(seg(f, a, a + 10), 2)}` }}>{label}</div>; };
  return (
    <AbsoluteFill>
      {tag("THEN", 0, T.now - 8, "#FFC2D6")}
      {tag("NOW", T.now, T.same - 6, "#BDF2DE")}
      <Words f={f} from={0} to={T.now - 8} top={200} size={66} color="#FFFFFF" glow={g}>
        <div><W f={f} at={2}>one</W><W f={f} at={6}>text</W><W f={f} at={10}>left</W><W f={f} at={14}>on</W><W f={f} at={18} last>“seen.”</W></div>
        <div style={{ marginTop: 14 }}><W f={f} at={T.th + 20}>Twenty</W><W f={f} at={T.th + 26} last>theories.</W></div>
        <div><W f={f} at={T.sleep}>Zero</W><W f={f} at={T.sleep + 6} last>sleep.</W></div>
      </Words>
      <Words f={f} from={T.now} to={T.same - 6} top={200} size={66} color="#FFFFFF" glow={g}>
        <div><W f={f} at={T.now + 4}>one</W><W f={f} at={T.now + 8}>text</W><W f={f} at={T.now + 12}>left</W><W f={f} at={T.now + 16}>on</W><W f={f} at={T.now + 20} last>“seen.”</W></div>
        <div style={{ marginTop: 14 }}><W f={f} at={T.lamp + 2} last>Goodnight.</W></div>
      </Words>
      <Words f={f} from={T.same - 4} to={WIPE - 4} top={300} size={92} color="#FFFFFF" glow={g}>
        <div><W f={f} at={T.same}>Same</W><W f={f} at={T.same + 6} last>text.</W></div>
        <div><KeyW f={f} at={T.key} color={ACCENT} size={150}>Softer you.</KeyW></div>
      </Words>
      <EndCard f={f} wipe={WIPE} card={CARD} />
    </AbsoluteFill>
  );
};

export const Q1028: React.FC = () => { const f = useCurrentFrame(); return <QFrame world={<World f={f} />} overlay={<Overlay f={f} />} audio="q1028.wav" bg="#2A2452" />; };
export const BEATS = { ...T, END, WIPE, CARD };
