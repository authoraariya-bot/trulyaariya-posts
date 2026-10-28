// Reel 7: "Their opinion isn't your destiny. Turn back and enjoy your music."
// A grey soul rants in angry scribble-bubbles; our soul lifts its headphones on, turns its back and walks off to its own music.
import { lerp, seg01, smoother, sstep, solve, Pose, POSES } from "../master/pose";

export const END = 640;
export const STRIDE = 248;
export const T = {
  in0: 24, in1: 70, rant0: 76, rant1: 330, sink0: 110, sink1: 200,
  look0: 246, look1: 260, grab0: 262, grab1: 274, lift0: 274, lift1: 300, click: 300, settle1: 316,
  turn0: 312, turn1: 326, walk0: 326, walk1: 500, groove: 500,
  fade0: 330, fade1: 420,
  wipe: 548, card: 566,
};
export const AX0 = 380, AX1 = -640; // walks left, away; the camera travels with it
export const BX = 700;              // the ranting grey soul
export const camX = (f: number) => Math.min(0, soulX(f) - 300);

export const walkAmt = (f: number, a: number, b: number) => sstep(seg01(f, a, a + 12)) * (1 - sstep(seg01(f, b - 12, b)));
export const mix = (p: Pose, q: Pose, t: number): Pose => ({
  lean: lerp(p.lean, q.lean, t), head: lerp(p.head, q.head, t),
  th: [lerp(p.th[0], q.th[0], t), lerp(p.th[1], q.th[1], t)], sh: [lerp(p.sh[0], q.sh[0], t), lerp(p.sh[1], q.sh[1], t)],
  ua: [lerp(p.ua[0], q.ua[0], t), lerp(p.ua[1], q.ua[1], t)], fa: [lerp(p.fa[0], q.fa[0], t), lerp(p.fa[1], q.fa[1], t)],
});
const P = (lean: number, head: number, th: [number, number], sh: [number, number], ua: [number, number], fa: [number, number]): Pose => ({ lean, head, th, sh, ua, fa });
export const walking = (ph: number, base: Pose, amt: number, bounce = 0): Pose => {
  const leg = (o: number) => {
    const p = ph + o, swing = Math.max(0, -Math.sin(p)), stance = Math.max(0, Math.sin(p));
    const th = 23 * Math.cos(p) + bounce * 12 * Math.pow(swing, 1.2);
    return [th, th - ((48 + 16 * bounce) * Math.pow(swing, 1.3) + 7 * stance)];
  };
  const [tb, sb] = leg(Math.PI), [tf, sf] = leg(0);
  const ab = -0.75 * tb, af = -0.75 * tf;
  const w: Pose = { lean: base.lean + 2.5 + 1.2 * Math.cos(ph * 2), head: base.head - 1.2 * Math.cos(ph * 2) - 3 - 4 * bounce * Math.cos(ph * 2), th: [tb, tf], sh: [sb, sf],
    ua: [ab, af], fa: [ab + 14 + 10 * Math.max(0, Math.sin(ph + Math.PI)), af + 14 + 10 * Math.max(0, Math.sin(ph))] };
  return mix(base, w, amt);
};

// walk: a steady, unhurried pace (linear in the middle so the steps keep time with the music)
export const soulX = (f: number) => {
  const a = T.walk0, b = T.walk1, e = 16;
  if (f <= a) return AX0;
  const v = (AX1 - AX0) / (b - a - e);           // px per frame at full pace
  const pos = (g: number) => (g < a + e ? v * (g - a) * (g - a) / (2 * e) : g < b - e ? v * e / 2 + v * (g - a - e) : v * e / 2 + v * (b - 2 * e - a) + v * e / 2 - v * (b - g) * (b - g) / (2 * e));
  return AX0 + pos(Math.min(f, b));
};
export const soulDir = (f: number) => Math.cos(Math.PI * smoother(seg01(f, T.turn0, T.turn1))); // 1 faces the grey soul → −1 walks away

const S = POSES.stand;
const CALM = P(2, 4, [0, 0], [0, 0], [4, 6], [12, 14]);
const SINK = P(8, 24, [0, 1], [0, 0], [3, 4], [8, 10]);
const LOOK = P(-2, -6, [0, 0], [0, 0], [4, 6], [12, 14]);
const GROOVE = P(-3, -10, [0, 0], [0, 0], [10, 14], [22, 30]);

// headphones: 0 = resting round the neck, 1 = on the head
export const phonesAt = (f: number) => smoother(seg01(f, T.lift0, T.lift1));
// cup centre in the soul's local rig space (neck → over the ear)
export const cupLocal = (r: ReturnType<typeof solve>, u: number) => {
  const ha = (r.headAng * Math.PI) / 180;
  const ear = { x: r.head.x + (-12) * Math.cos(ha) - 4 * Math.sin(ha), y: r.head.y + (-12) * Math.sin(ha) + 4 * Math.cos(ha) };
  const neck = { x: r.neck.x + 14, y: r.neck.y + 4 };
  const mid = { x: lerp(neck.x, ear.x, u) + 26 * Math.sin(Math.PI * u), y: lerp(neck.y, ear.y, u) - 14 * Math.sin(Math.PI * u) };
  return { ...mid, rot: lerp(-20, r.headAng, u) };
};
const reachLocal = (pose: Pose, x: number, tl: { x: number; y: number }, arm: 0 | 1, amt: number): Pose => {
  if (amt <= 0) return pose;
  const r = solve(pose, x), sh = r.arms[arm].sh, L1 = 42, L2 = 40;
  const dx = tl.x - sh.x, dy = tl.y - sh.y, d = Math.max(8, Math.min(L1 + L2 - 0.5, Math.hypot(dx, dy)));
  const phi = (Math.atan2(dx, dy) * 180) / Math.PI;
  const a1 = (Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)))) * 180) / Math.PI;
  const a2 = (Math.acos(Math.max(-1, Math.min(1, (L2 * L2 + d * d - L1 * L1) / (2 * L2 * d)))) * 180) / Math.PI;
  const ua = [...pose.ua] as [number, number], fa = [...pose.fa] as [number, number];
  ua[arm] = lerp(pose.ua[arm], phi - a1, amt); fa[arm] = lerp(pose.fa[arm], phi + a2, amt);
  return { ...pose, ua, fa };
};

export const soulPose = (f: number): Pose => {
  const breath = Math.sin((f / 30) * Math.PI * 2 / 3.8);
  const x = soulX(f);
  let p: Pose = mix(S, CALM, smoother(seg01(f, 0, 20)));
  if (f >= T.sink0) p = mix(CALM, SINK, smoother(seg01(f, T.sink0, T.sink1)));
  if (f >= T.look0) p = mix(SINK, LOOK, smoother(seg01(f, T.look0, T.look1)));
  // both hands take the headphones from the neck up onto the head
  if (f >= T.grab0 && f < T.settle1 + 6) {
    const r = solve(p, x), cup = cupLocal(r, phonesAt(f));
    const amt = smoother(seg01(f, T.grab0, T.grab1)) * (1 - smoother(seg01(f, T.click + 2, T.settle1 + 6)));
    p = reachLocal(p, x, { x: cup.x - 2, y: cup.y + 6 }, 1, amt);
    p = reachLocal(p, x, { x: cup.x - 18, y: cup.y + 2 }, 0, amt);
  }
  if (f >= T.turn0) p = mix(LOOK, GROOVE, smoother(seg01(f, T.turn0, T.walk0 + 20)));
  if (f >= T.walk0) p = walking((Math.abs(x - AX0) / STRIDE) * Math.PI * 2, GROOVE, walkAmt(f, T.walk0, T.walk1), 1);
  // grooving to the music once it stops
  if (f >= T.groove) { const g = smoother(seg01(f, T.groove, T.groove + 14)), b = Math.sin(((f - T.groove) / 22) * Math.PI * 2); p = { ...p, head: p.head + 7 * g * b, lean: p.lean + 3 * g * b, ua: [p.ua[0] + 10 * g * b, p.ua[1] - 10 * g * b] }; }
  return { ...p, lean: p.lean + 1.4 * breath, head: p.head + 1.2 * breath };
};
export const soulHop = (f: number) => (f > T.walk0 && f < T.walk1 ? 9 * walkAmt(f, T.walk0, T.walk1) * Math.abs(Math.sin((Math.abs(soulX(f) - AX0) / STRIDE) * Math.PI * 2)) : 0);
export const moodAt = (f: number) => 0.45 - 0.28 * smoother(seg01(f, T.sink0, T.sink1)) + 0.15 * smoother(seg01(f, T.look0, T.lift1)) + 0.65 * smoother(seg01(f, T.click, T.walk0 + 40));
export const healAt = (f: number) => 0.42 - 0.12 * smoother(seg01(f, T.sink0, T.sink1)) + 0.7 * smoother(seg01(f, T.click, T.walk1 - 40));
export const lightAt = (f: number) => 0.35 - 0.15 * smoother(seg01(f, T.sink0, T.sink1)) + 0.8 * smoother(seg01(f, T.click, T.walk1 - 40));
// muffle 0 → 1 once the headphones are on
export const muffle = (f: number) => smoother(seg01(f, T.click - 2, T.click + 10));

// the ranting grey soul: storms in from the right, waves its arms, stamps
const RANT_A = P(14, -4, [0, 0], [0, 0], [30, 110], [70, 150]);
const RANT_B = P(18, 10, [0, 0], [0, 0], [-14, 60], [10, 40]);
const POINT = P(16, 4, [0, 0], [0, 0], [6, 84], [14, 92]);
export const ranterX = (f: number) => lerp(1260, BX, smoother(seg01(f, T.in0, T.in1)));
export const ranterPose = (f: number): Pose => {
  const x = ranterX(f);
  let p: Pose = walking((Math.abs(1260 - x) / (STRIDE * 0.8)) * Math.PI * 2, P(10, 6, [0, 0], [0, 0], [4, 6], [12, 14]), walkAmt(f, T.in0, T.in1));
  if (f >= T.rant0) {
    const k = smoother(seg01(f, T.rant0, T.rant0 + 10));
    const w = 0.5 + 0.5 * Math.sin((f - T.rant0) / 4.2), pt = Math.max(0, Math.sin((f - T.rant0) / 17));
    let q = mix(mix(RANT_B, RANT_A, w), POINT, pt * 0.7);
    const stamp = Math.max(0, Math.sin((f - T.rant0) / 7.5)) ** 3; // a stamp every so often
    q = { ...q, th: [q.th[0], 26 * stamp], sh: [q.sh[0], -6 * stamp], head: q.head + 6 * Math.sin(f / 2.3) };
    p = mix(p, q, k);
  }
  return p;
};
export const ranterOpacity = (f: number) => 1 - 0.75 * smoother(seg01(f, T.fade0, T.fade1));
// speech bubbles: one every ~18 frames while ranting
export const BUBBLES = Array.from({ length: 15 }, (_, i) => ({ t0: T.rant0 + 6 + i * 17, kind: i % 4, sym: ["#@!%", "&*!?", "!!#", "%$#@"][i % 4] }));
