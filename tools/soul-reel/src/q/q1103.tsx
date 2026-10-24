// 3 Nov · Savage · "Everyone says: rest when you're done. Done with the emails, the chores, everyone else's needs.
// Nobody says: you're never 'done.' So rest before you're empty."
// A cosy loft at blue hour, snow falling past the window. A glossy power bank on the side table drains bar by bar as
// "emails", "the chores", "everyone else's needs" drop into it, down to a blinking red 1%. Beside it a to-do list
// ticks items off while new ones keep appending, forever. Rewind: back to 30%, a cable plugs itself in, a tiny knit
// blanket drapes over the battery and it refills mint.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { QFrame, Words, W, KeyW, seg, sm, lerp, rnd, back } from "./kit";
import { EndCard } from "../kit/Words";
import { LightLeak } from "../kit/fx";

export const END = 420; const WIPE = 330, CARD = 348;
const T = { l2: 56, drain: [74, 100, 126], one: 150, l3: 160, rewind: 214, plug: 232, blanket: 246, l4: 238, key: 268 };
const BAT = { x: 540, y: 1068, w: 560, h: 260 };
const LABELS = ["emails", "the chores", "everyone else's needs"];
const TODO = ["reply to emails", "laundry", "call mom back", "fix the slides", "groceries", "help with the move", "plan the party", "answer the group chat", "pay the bills", "be there for everyone"];

const levelAt = (f: number) => {
  let l = 1; const drops = [0.3, 0.32, 0.37];
  T.drain.forEach((a, i) => { l -= drops[i] * sm(seg(f, a + 6, a + 20)); });
  const rew = sm(seg(f, T.rewind, T.rewind + 16));
  l = lerp(l, 0.3, rew);
  return lerp(l, 1, sm(seg(f, T.plug + 10, T.plug + 80)));
};

const World: React.FC<{ f: number }> = ({ f }) => {
  const t = f / 30, lvl = levelAt(f);
  const low = lvl < 0.1 && f < T.rewind;
  const blink = low ? (Math.sin(f / 2.5) > 0 ? 1 : 0.35) : 1;
  const col = lvl > 0.55 ? "#7FE0C2" : lvl > 0.25 ? "#FFD36E" : "#FF6F86";
  const rew = Math.sin(Math.PI * seg(f, T.rewind, T.rewind + 16));
  const charge = sm(seg(f, T.plug, T.plug + 10));
  const bl = sm(seg(f, T.blanket, T.blanket + 18));
  // to-do list: items tick off but new ones keep appending, the list scrolls up
  const added = Math.min(TODO.length, 3 + Math.floor(seg(f, 60, T.rewind) * 7.99));
  const scroll = Math.max(0, added - 5) * 52 * 0 + lerp(0, 52 * Math.max(0, added - 5), 1);
  return (
    <g>
      <defs>
        <linearGradient id="wall1103" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E9C7E8" /><stop offset="1" stopColor="#F6D6D2" /></linearGradient>
        <linearGradient id="night1103" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3D4A8C" /><stop offset="1" stopColor="#8E7BC4" /></linearGradient>
        <linearGradient id="bat1103" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#EDE6F6" /></linearGradient>
        <clipPath id="batc1103"><rect x={BAT.x - BAT.w / 2 + 22} y={BAT.y - BAT.h / 2 + 22} width={BAT.w - 44} height={BAT.h - 44} rx={26} /></clipPath>
        <clipPath id="win1103"><rect x={120} y={420} width={840} height={440} rx={22} /></clipPath>
        <clipPath id="todo1103"><rect x={590} y={1420} width={400} height={330} /></clipPath>
      </defs>
      <rect width={1080} height={1920} fill="url(#wall1103)" />
      {/* window: blue-hour city with snow */}
      <g clipPath="url(#win1103)">
        <rect x={120} y={420} width={840} height={440} fill="url(#night1103)" />
        {Array.from({ length: 12 }, (_, i) => { const x = 120 + i * 72, h = 120 + 180 * rnd(i + 3);
          return <g key={i}><rect x={x} y={860 - h} width={66} height={h} fill={i % 2 ? "#4D3F86" : "#5A4A96"} />
            {Array.from({ length: Math.floor(h / 30) * 2 }, (_, k) => rnd(i * 13 + k) > 0.5 ? <rect key={k} x={x + 10 + (k % 2) * 26} y={860 - h + 12 + Math.floor(k / 2) * 30} width={14} height={14} rx={2} fill={["#FFD6A0", "#FF9FC4", "#9FE3FF"][k % 3]} opacity={0.8} /> : null)}</g>; })}
        {Array.from({ length: 80 }, (_, i) => { const x = 120 + ((rnd(i) * 840 + 20 * Math.sin(t + i) + t * 10) % 840), y = 420 + ((rnd(i + 1) * 440 + f * (2 + 3 * rnd(i + 2))) % 440);
          return <circle key={i} cx={x} cy={y} r={2 + 3 * rnd(i + 3)} fill="#FFFFFF" opacity={0.85} />; })}
      </g>
      <rect x={120} y={420} width={840} height={440} rx={22} fill="none" stroke="#FFF4EE" strokeWidth={20} />
      <line x1={540} x2={540} y1={420} y2={860} stroke="#FFF4EE" strokeWidth={12} />
      {/* fairy lights along the window */}
      {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={140 + i * 61} cy={410 + 18 * Math.sin(i * 0.9)} r={9} fill={["#FFD36E", "#FF9DBD", "#9FE3FF"][i % 3]} opacity={0.6 + 0.4 * Math.sin(t * 3 + i)} />)}
      <rect x={0} y={1555} width={1080} height={370} fill="#E7B8B6" /><rect x={0} y={1555} width={1080} height={10} fill="#D9A4A6" />
      {/* side table */}
      <rect x={140} y={1200} width={800} height={40} rx={14} fill="#C98E78" /><rect x={180} y={1238} width={30} height={320} fill="#B47A66" /><rect x={870} y={1238} width={30} height={320} fill="#B47A66" />
      {/* wall socket + cable */}
      <rect x={60} y={1080} width={70} height={100} rx={14} fill="#FFF6F0" /><circle cx={84} cy={1130} r={6} fill="#B9A6C6" /><circle cx={106} cy={1130} r={6} fill="#B9A6C6" />
      {(() => { const endX = lerp(240, BAT.x - BAT.w / 2 - 6, charge), endY = lerp(1190, BAT.y, charge);
        return <g><path d={`M95,1150 C120,1240 ${endX - 120},${endY + 140} ${endX},${endY}`} stroke="#FFFFFF" strokeWidth={14} fill="none" strokeLinecap="round" />
          <rect x={endX - 34} y={endY - 22} width={40} height={44} rx={10} fill="#FFFFFF" transform={`rotate(${lerp(60, 0, charge)} ${endX} ${endY})`} /></g>; })()}
      {/* the battery */}
      <g transform={`translate(${6 * rew * Math.sin(f * 3)} 0)`}>
        <ellipse cx={BAT.x} cy={BAT.y + BAT.h / 2 + 14} rx={BAT.w / 2} ry={18} fill="#6A3A5A" opacity={0.2} filter="url(#qb10)" />
        <circle cx={BAT.x} cy={BAT.y} r={360} fill={col} opacity={0.18 + 0.12 * charge} filter="url(#qb40)" />
        <rect x={BAT.x - BAT.w / 2} y={BAT.y - BAT.h / 2} width={BAT.w} height={BAT.h} rx={48} fill="url(#bat1103)" stroke="#D9CCE8" strokeWidth={4} />
        <rect x={BAT.x + BAT.w / 2 + 6} y={BAT.y - 50} width={34} height={100} rx={14} fill="#E7DDF2" />
        <g clipPath="url(#batc1103)">
          <rect x={BAT.x - BAT.w / 2 + 22} y={BAT.y - BAT.h / 2 + 22} width={(BAT.w - 44) * lvl} height={BAT.h - 44} fill={col} opacity={blink} />
          <rect x={BAT.x - BAT.w / 2 + 22} y={BAT.y - BAT.h / 2 + 22} width={(BAT.w - 44) * lvl} height={40} fill="#FFFFFF" opacity={0.3 * blink} />
          {charge > 0 && Array.from({ length: 6 }, (_, k) => <circle key={k} cx={BAT.x - BAT.w / 2 + 40 + ((f * 4 + k * 90) % ((BAT.w - 60) * lvl + 1))} cy={BAT.y - 40 + 80 * rnd(k)} r={6} fill="#FFFFFF" opacity={0.5} />)}
        </g>
        <text x={BAT.x + 62} y={BAT.y + 32} textAnchor="middle" fontFamily="Jost" fontWeight={700} fontSize={86} fill="#3B2340" opacity={0.85}>{`${Math.max(1, Math.round(lvl * 100))}%`}</text>
        {charge > 0 && <path d="M0,-50 L-24,6 L-2,6 L-14,50 L26,-12 L4,-12 L16,-50 Z" transform={`translate(${BAT.x + 225} ${BAT.y}) scale(${back(seg(f, T.plug, T.plug + 12), 2)})`} fill="#FFD36E" stroke="#3B2340" strokeWidth={3} />}
        {/* the tiny knit blanket */}
        {f >= T.blanket && (() => { const y0 = lerp(520, BAT.y - BAT.h / 2 - 4, sm(bl)), x0 = BAT.x - BAT.w / 2 + 30, hang = lerp(30, 1, bl);
          return <g transform={`translate(${x0} ${y0}) scale(0.78 1)`}>
            <path d={`M0,-8 Q105,${-20 + hang} 210,-8 L214,${lerp(40, 118, bl)} Q160,${lerp(52, 138, bl)} 106,${lerp(44, 124, bl)} Q52,${lerp(52, 140, bl)} -4,${lerp(40, 120, bl)} Z`} fill="#C9B6FF" />
            <path d="M0,-8 Q105,-20 210,-8 L210,14 Q105,2 0,14 Z" fill="#D9CBFF" />
            {Array.from({ length: 7 }, (_, k) => <path key={k} d={`M${16 + k * 30},10 L${16 + k * 30},${lerp(40, 116, bl)}`} stroke="#B49DF2" strokeWidth={4} opacity={0.7} />)}
            {Array.from({ length: 9 }, (_, k) => <path key={`f${k}`} d={`M${4 + k * 25},${lerp(44, 124 + 10 * Math.sin(k), bl)} l0,18`} stroke="#FFB7CF" strokeWidth={6} strokeLinecap="round" />)}
          </g>; })()}
      </g>
      {/* labels that drop in and drain it */}
      {LABELS.map((l, i) => { const a = T.drain[i]; const p = seg(f, a - 8, a + 8); if (p <= 0 || f > a + 22) return null;
        const y = lerp(700, BAT.y - BAT.h / 2 + 10, sm(p)) + 60 * seg(f, a + 6, a + 22), s = 1 - 0.6 * seg(f, a + 6, a + 22), o = 1 - seg(f, a + 12, a + 22);
        const w = l.length * 25 + 70;
        return <g key={i} transform={`translate(${BAT.x + (i - 1) * 120} ${y}) scale(${s})`} opacity={o}><rect x={-w / 2} y={-38} width={w} height={76} rx={38} fill={["#FFB7CF", "#FFE38A", "#B9E8FF"][i]} /><text y={14} textAnchor="middle" fontFamily="Jost" fontWeight={600} fontSize={42} fill="#3B2340">{l}</text></g>; })}
      {/* the never-ending to-do list */}
      <g>
        <ellipse cx={800} cy={1790} rx={230} ry={16} fill="#8A4A5A" opacity={0.2} filter="url(#qb6)" /><rect x={570} y={1380} width={440} height={400} rx={16} fill="#FFFDF6" transform="rotate(3 790 1580)" /><rect x={730} y={1360} width={120} height={40} rx={10} fill="#C9A385" transform="rotate(3 790 1580)" />
        <g transform="rotate(3 790 1580)">
          <text x={600} y={1415} fontFamily="Caveat" fontWeight={700} fontSize={40} fill="#E0567F">to-do</text>
          <g clipPath="url(#todo1103)">
            <g transform={`translate(0 ${-lerp(0, scroll, sm(seg(f, 60, T.rewind)))})`}>
              {TODO.slice(0, added).map((it, i) => { const done = i < added - 2; const ap = sm(seg(f, 60 + i * 15, 70 + i * 15));
                return <g key={i} opacity={i < 3 ? 1 : ap} transform={`translate(0 ${1450 + i * 52})`}>
                  <rect x={600} y={-24} width={30} height={30} rx={6} fill="none" stroke="#B9A6C6" strokeWidth={3} />
                  {done && <path d="M606,-10 L614,-2 L628,-20" stroke="#5FAE6E" strokeWidth={5} fill="none" strokeLinecap="round" />}
                  <text x={646} y={0} fontFamily="Caveat" fontWeight={700} fontSize={36} fill="#3B2340" opacity={done ? 0.5 : 1}>{it}</text>
                  {done && <line x1={646} x2={646 + it.length * 15} y1={-10} y2={-10} stroke="#3B2340" strokeWidth={2} opacity={0.4} />}
                </g>; })}
            </g>
          </g>
        </g>
      </g>
      {/* a mug and a plant on the table to keep it homely */}
      <g transform="translate(900 1200)"><path d="M-46,-90 L46,-90 L40,0 L-40,0 Z" fill="#9EE6CF" /><path d="M46,-74 C76,-74 76,-30 42,-30" stroke="#9EE6CF" strokeWidth={10} fill="none" />
        {[0, 1].map((k) => <path key={k} d={`M${-10 + 20 * k},-100 C${-20 + 20 * k},-130 ${20 * k},-150 ${-10 + 20 * k},-180`} stroke="#FFFFFF" strokeWidth={5} fill="none" opacity={0.5 * (0.5 + 0.5 * Math.sin(t * 2 + k))} strokeLinecap="round" />)}</g>
      {/* rewind scanlines */}
      {rew > 0.02 && Array.from({ length: 14 }, (_, i) => <rect key={i} x={0} y={((i * 140 + f * 60) % 1920)} width={1080} height={8} fill="#FFFFFF" opacity={0.25 * rew} />)}
      {rew > 0.02 && <text x={90} y={1880} fontFamily="Jost" fontWeight={700} fontSize={54} fill="#FFFFFF" opacity={rew}>◀◀ REWIND</text>}
    </g>
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <LightLeak f={f} amt={0.4 * sm(seg(f, T.plug, T.plug + 40))} side="left" tint="warm" />
    <Words f={f} from={0} to={T.l2 - 6} top={160} size={74}>
      <div><W f={f} at={2}>Everyone</W><W f={f} at={8} last>says:</W></div>
      <div><W f={f} at={14}>rest</W><W f={f} at={19}>when</W><W f={f} at={24}>you're</W><W f={f} at={30} last><i>done.</i></W></div>
    </Words>
    <Words f={f} from={T.l2} to={T.l3 - 6} top={160} size={64}>
      <div><W f={f} at={T.l2 + 2}>Done</W><W f={f} at={T.l2 + 6}>with</W><W f={f} at={T.drain[0] - 4}>the</W><W f={f} at={T.drain[0]} last>emails,</W></div>
      <div><W f={f} at={T.drain[1]}>the</W><W f={f} at={T.drain[1] + 4} last>chores,</W></div>
      <div><W f={f} at={T.drain[2]}>everyone</W><W f={f} at={T.drain[2] + 5}>else's</W><W f={f} at={T.drain[2] + 10} last>needs.</W></div>
    </Words>
    <Words f={f} from={T.l3} to={T.l4 - 6} top={170} size={74}>
      <div><W f={f} at={T.l3 + 2}>Nobody</W><W f={f} at={T.l3 + 8} last>says:</W></div>
      <div><W f={f} at={T.l3 + 16}>you're</W><W f={f} at={T.l3 + 22}>never</W><W f={f} at={T.l3 + 28} last><i>“done.”</i></W></div>
    </Words>
    <Words f={f} from={T.l4} to={WIPE - 4} top={160} size={76}>
      <div><W f={f} at={T.l4 + 2}>So</W><W f={f} at={T.l4 + 6}>rest</W><W f={f} at={T.l4 + 11} last>before</W></div>
      <div><W f={f} at={T.l4 + 16}>you're</W><KeyW f={f} at={T.key} color="#E0567F" size={140}>empty.</KeyW></div>
    </Words>
    <EndCard f={f} wipe={WIPE} card={CARD} />
  </AbsoluteFill>
);

export const Q1103: React.FC = () => { const f = useCurrentFrame(); return <QFrame world={<World f={f} />} overlay={<Overlay f={f} />} audio="q1103.wav" />; };
export const BEATS = { ...T, END, WIPE, CARD };
