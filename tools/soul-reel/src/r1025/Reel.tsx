// 25 Oct · "The song you play when no one's home… loud, off-key, a little teary… that's healing too."
// Meaning: singing your heart out alone, badly and through tears, is itself a way of healing.
// Beats: sits alone by its cottage (grey, sad) → hums: notes rise from its chest light → stands and sways, notes pour out,
// wobble off-key, a tear falls → notes become birds, colour floods back, it skips with arms open (healing).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { makeStory, seg01, smoother, sstep, lerp, clamp01, POSES, mix } from "../kit/choreo";
import { Land, makeWind, chestPt, headPt, rnd, col, blob } from "../kit/Land";
import { Block, Word, Key, EndCard } from "../kit/Words";
import { Frame } from "../kit/Frame";

export const END = 570; const WIPE = 470, CARD = 488;
const T = { lift: 60, hum: 78, stand: 120, loud: 160, offkey: 190, tear: 228, laugh: 268, walk: 300, birds: 330, open: 404 };
const c = makeStory({
  end: END, x0: 520,
  keys: [
    { f: 0, pose: "sitHug" }, { f: T.lift, pose: "sitTall", blend: 30 }, { f: T.stand, pose: "stand", blend: 32 }, { f: T.loud - 10, pose: "sing", blend: 24 }, { f: T.walk - 26, pose: "stand", blend: 24 },
    { f: T.open, pose: "cheer", blend: 30 },
  ],
  walks: [{ from: T.walk, to: T.open, x0: 520, x1: 900, skip: [T.walk + 22, T.open - 6] }],
  mood: [[0, 0.06], [T.lift, 0.12], [T.hum + 30, 0.4], [T.loud + 20, 0.62], [T.tear, 0.36], [T.laugh + 10, 0.7], [T.walk + 40, 0.92], [T.open + 20, 1]],
  heal: [[0, 0], [T.hum, 0.08], [T.loud + 30, 0.3], [T.laugh, 0.45], [T.birds + 30, 0.78], [T.open + 20, 1]],
  // swaying to its own song while it stands
  mod: (f, p) => {
    const dance = sstep(seg01(f, T.loud - 10, T.loud + 20)) * (1 - sstep(seg01(f, T.walk - 20, T.walk)));
    if (dance <= 0) return p;
    const s = Math.sin((f - T.loud) / 9);
    const sway = { ...p, lean: p.lean + 7 * s, head: p.head - 10 * s, ua: [p.ua[0] + 18 * s, p.ua[1] + 6 * s] as [number, number], fa: [p.fa[0] + 20 * s, p.fa[1]] as [number, number] };
    return mix(p, sway, dance);
  },
});
const wind = makeWind([T.laugh + 10, T.birds + 10, T.open + 10, WIPE - 6]);
const cam = (f: number) => Math.max(0, c.xAt(f) - 470);

// a small musical note
const Note: React.FC<{ x: number; y: number; s: number; r: number; o: number; fill: string }> = ({ x, y, s, r, o, fill }) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={14} ry={20} fill="#FFE2B0" opacity={0.55} filter="url(#b4)" />
    <ellipse cx={0} cy={0} rx={9} ry={6.5} fill={fill} transform="rotate(-22)" />
    <path d="M8,-2 L8,-32 Q16,-26 20,-18" stroke={fill} strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);
// note births: sparse while humming, many when it sings out loud
const NOTES = Array.from({ length: 24 }, (_, i) => (i < 6 ? T.hum + i * 14 : T.loud + (i - 6) * 9));

const World: React.FC<{ f: number }> = ({ f }) => {
  const h = c.healAt(f); const cm = cam(f);
  const chest = chestPt(c, f), head = headPt(c, f);
  const notes = NOTES.map((b, i) => {
    const age = f - b; if (age < 0) return null;
    const life = 140; const p = age / life; if (p > 1.4) return null;
    const off = sstep(seg01(f, T.offkey, T.offkey + 14)) * (1 - sstep(seg01(f, T.tear + 10, T.tear + 30)));
    const toBird = smoother(seg01(f, T.birds + (i % 6) * 4, T.birds + 30 + (i % 6) * 4));
    const x0 = chest.x - cm, y0 = chest.y;
    const x = x0 + 40 + (rnd(i) - 0.25) * 520 * Math.min(p, 1.1) + 30 * Math.sin(age / 12 + i) + toBird * (f - T.birds) * 6;
    const y = y0 - 120 - 380 * Math.min(p, 1.2) - toBird * (f - T.birds) * 3.2;
    const wob = off * 22 * Math.sin(age / 2.2 + i);
    const o = Math.min(1, age / 10) * (1 - clamp01((p - 1) / 0.4)) * (1 - toBird);
    const yy = Math.max(780, y);
    return (
      <g key={i}>
        <Note x={x} y={yy} s={0.8 + 0.5 * rnd(i + 3)} r={-10 + 20 * rnd(i + 1) + wob} o={o} fill={col(off, "#C9973F", "#A9958A")} />
        {toBird > 0 && (() => { const w = 10 * Math.sin(f / 3 + i * 2); return <path d={`M${x - 16},${yy - w} Q${x - 6},${yy - 4} ${x},${yy + 2} Q${x + 6},${yy - 4} ${x + 16},${yy - w}`} stroke={col(h, "#A3948C", "#8C7C74")} strokeWidth={3} fill="none" strokeLinecap="round" opacity={toBird * (1 - clamp01((f - T.birds - 90) / 40))} />; })()}
      </g>
    );
  });
  // a single tear rolling down
  const tp = seg01(f, T.tear + 6, T.tear + 40);
  const tear = tp > 0 && tp < 1 ? <path d="M0,-7 C4,-2 5,3 0,7 C-5,3 -4,-2 0,-7 Z" transform={`translate(${head.x - cm - 2},${head.y + 8 + 60 * tp}) scale(1.6)`} fill="#9CCBE6" opacity={Math.sin(tp * Math.PI)} /> : null;
  // the cottage: a small home on the hill (its window glows warmer as the song grows)
  const glow = 0.2 + 0.8 * h;
  const cottage = (
    <g transform="translate(250,1530)">
      <ellipse cx={0} cy={6} rx={170} ry={14} fill="#6F8461" opacity={0.18} filter="url(#b8)" />
      <path d="M-120,0 L-120,-150 L120,-150 L120,0 Z" fill={col(h, "#E4DED6", "#FBEFE2")} />
      <path d="M-145,-142 L0,-250 L145,-142 Z" fill={col(h, "#C9B9B3", "#E7A99A")} />
      <rect x={-34} y={-96} width={58} height={96} rx={6} fill={col(h, "#C8BBAE", "#C99A7F")} />
      <rect x={52} y={-118} width={46} height={44} rx={5} fill={col(glow, "#D9D2C6", "#FFD98E")} />
      <rect x={-104} y={-118} width={46} height={44} rx={5} fill={col(glow, "#D9D2C6", "#FFD98E")} />
      <path d={blob(-150, -20, 40, 3, 0.7)} fill={col(h, "#AEBCA5", "#89C677")} />
      <path d={blob(150, -16, 34, 5, 0.7)} fill={col(h, "#AEBCA5", "#89C677")} />
      <path d="M78,-250 L78,-200 L100,-200 L100,-232 Z" fill={col(h, "#BDB0A8", "#D9998B")} />
      {/* chimney smoke drifts */}
      {[0, 1, 2].map((k) => <circle key={k} cx={88 + 18 * Math.sin(f / 20 + k) + k * 14} cy={-270 - k * 34 - ((f / 2) % 34)} r={10 + k * 5} fill="#FFFFFF" opacity={0.35 * h} filter="url(#b4)" />)}
    </g>
  );
  return (
    <Land f={f} cam={cm} h={h} c={c} wind={wind} trees={[{ x: 1180, s: 0.62, bloom: T.open - 6 }, { x: 1700, s: 0.5 }]}
      butterflies={T.birds + 20} petalsFrom={T.laugh} worldProps={cottage}
      front={<g>{notes}{tear}</g>} />
  );
};

const Overlay: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    <Block f={f} from={0} to={T.loud - 30}>
      <div><Word f={f} at={4}>The</Word><Word f={f} at={10}>song</Word><Word f={f} at={16}>you</Word><Word f={f} at={22} last>play</Word></div>
      <div><Word f={f} at={34}>when</Word><Word f={f} at={40}>no</Word><Word f={f} at={46}>one's</Word><Word f={f} at={52} last>home,</Word></div>
    </Block>
    <Block f={f} from={T.loud - 6} to={T.birds - 26}>
      <div><Word f={f} at={T.loud + 4} last>loud,</Word></div>
      <div><Word f={f} at={T.offkey + 4} last><span style={{ display: "inline-block", rotate: `${3 * Math.sin(f / 2.5) * (f < T.tear ? 1 : 0)}deg` }}>off-key,</span></Word></div>
      <div><Word f={f} at={T.tear + 2}>a</Word><Word f={f} at={T.tear + 8}>little</Word><Word f={f} at={T.tear + 16} last><i>teary…</i></Word></div>
    </Block>
    <Block f={f} from={T.birds - 4} to={WIPE - 4}>
      <div><Word f={f} at={T.birds + 4} last>that's</Word></div>
      <div><Key f={f} at={T.birds + 26}>healing</Key><Word f={f} at={T.birds + 60} last style={{ marginLeft: "0.2em" }}>too.</Word></div>
    </Block>
    <EndCard f={f} wipe={WIPE} card={CARD} />
  </AbsoluteFill>
);

export const Soul1025: React.FC = () => {
  const f = useCurrentFrame();
  return <Frame world={<World f={f} />} overlay={<Overlay f={f} />} audio="r1025.wav" />;
};
// beat frames for the score (printed by beats.mjs)
export const BEATS = { ...T, END, WIPE, CARD, steps: c.steps.filter((s) => s >= T.walk && s <= T.open), notes: NOTES };
void lerp; void POSES;
