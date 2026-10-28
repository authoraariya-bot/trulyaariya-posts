// Reel 4: a sapling shut in a lidded jar; the soul notices, lifts the lid, the tree grows and blossoms.
import { lerp, seg01, smoother, sstep, Pose, POSES } from "../master/pose";

export const END = 615;
export const STRIDE = 248;
export const T = {
  walk0: 70, walk1: 150, puzzle: 150, kneel0: 176, kneel1: 200, tap: 214,
  look0: 238, stand0: 262, stand1: 288, reach0: 292, twist0: 306, pop: 326, set0: 330, set1: 352,
  air0: 330, grow0: 344, grow1: 430, bloom0: 410, bloom1: 470, back0: 360, back1: 392, breath0: 430, breath1: 470,
  wipe: 518, card: 536,
};
export const X0 = 120, X1 = 412, X2 = 330; // walks in, then steps back to admire
export const JAR = { x: 610, w: 200, h: 256 };

const walkAmt = (f: number, a: number, b: number) => sstep(seg01(f, a, a + 14)) * (1 - sstep(seg01(f, b - 14, b)));
export const walkX = (f: number, a: number, b: number, x0: number, x1: number) => lerp(x0, x1, smoother(seg01(f, a, b)));
const walkPh = (f: number, a: number, b: number, x0: number, x1: number) => (Math.abs(walkX(f, a, b, x0, x1) - x0) / STRIDE) * Math.PI * 2;
const mix = (p: Pose, q: Pose, t: number): Pose => ({
  lean: lerp(p.lean, q.lean, t), head: lerp(p.head, q.head, t),
  th: [lerp(p.th[0], q.th[0], t), lerp(p.th[1], q.th[1], t)], sh: [lerp(p.sh[0], q.sh[0], t), lerp(p.sh[1], q.sh[1], t)],
  ua: [lerp(p.ua[0], q.ua[0], t), lerp(p.ua[1], q.ua[1], t)], fa: [lerp(p.fa[0], q.fa[0], t), lerp(p.fa[1], q.fa[1], t)],
});
const P = (lean: number, head: number, th: [number, number], sh: [number, number], ua: [number, number], fa: [number, number]): Pose => ({ lean, head, th, sh, ua, fa });
const walking = (ph: number, base: Pose, amt: number, back = false): Pose => {
  const leg = (o: number) => {
    const p = ph * (back ? -1 : 1) + o, swing = Math.max(0, -Math.sin(p)), stance = Math.max(0, Math.sin(p));
    const th = 23 * Math.cos(p);
    return [th, th - (48 * Math.pow(swing, 1.3) + 7 * stance)];
  };
  const [tb, sb] = leg(Math.PI), [tf, sf] = leg(0);
  const ab = -0.75 * tb, af = -0.75 * tf;
  const w: Pose = { lean: base.lean + 2.5 + 1.2 * Math.cos(ph * 2), head: base.head - 1.2 * Math.cos(ph * 2) - 3, th: [tb, tf], sh: [sb, sf],
    ua: [ab, af], fa: [ab + 14 + 10 * Math.max(0, Math.sin(ph + Math.PI)), af + 14 + 10 * Math.max(0, Math.sin(ph))] };
  return mix(base, w, amt);
};

const S = POSES.stand;
const PUZZLE = P(6, 26, [0, 0], [0, 0], [6, 10], [14, 18]);              // head tilted, looking at the jar
const KNEEL = P(30, 24, [70, 74], [-100, -96], [10, 30], [22, 52]);      // kneels to look closer
const TAP = P(30, 20, [70, 74], [-100, -96], [10, 62], [22, 74]);        // taps the glass
const KNEEL_UP = P(14, -22, [70, 74], [-100, -96], [10, 20], [20, 30]);  // notices the lid
const REACH = P(10, 14, [0, 0], [0, 0], [6, 56], [14, 92]);              // hand on the lid
const LIFT = P(4, -6, [0, 0], [0, 0], [6, 96], [14, 132]);               // lid lifted up
const SET = P(18, 22, [0, 6], [0, 0], [6, 30], [14, 40]);                // sets it down
const ADMIRE = P(-4, -24, [0, 0], [0, 0], [10, 22], [20, 30]);           // looks up at the blossoming tree

export const soulX = (f: number) => (f < T.back0 ? walkX(f, T.walk0, T.walk1, X0, X1) : walkX(f, T.back0, T.back1, X1, X2));
export const soulPose = (f: number): Pose => {
  const breath = Math.sin((f / 30) * Math.PI * 2 / 3.8);
  const deep = Math.sin(Math.PI * seg01(f, T.breath0, T.breath1));
  let p: Pose = walking(walkPh(f, T.walk0, T.walk1, X0, X1), S, walkAmt(f, T.walk0, T.walk1));
  if (f >= T.puzzle) p = mix(S, PUZZLE, smoother(seg01(f, T.puzzle, T.puzzle + 14)));
  if (f >= T.kneel0) p = mix(PUZZLE, KNEEL, smoother(seg01(f, T.kneel0, T.kneel1)));
  if (f >= T.tap - 6) p = mix(KNEEL, TAP, Math.sin(Math.PI * seg01(f, T.tap - 6, T.tap + 10)) + Math.sin(Math.PI * seg01(f, T.tap + 10, T.tap + 22)) * 0.8);
  if (f >= T.look0) p = mix(KNEEL, KNEEL_UP, smoother(seg01(f, T.look0, T.look0 + 14)));
  if (f >= T.stand0) p = mix(KNEEL_UP, S, smoother(seg01(f, T.stand0, T.stand1)));
  if (f >= T.reach0) p = mix(S, REACH, smoother(seg01(f, T.reach0, T.twist0)));
  if (f >= T.twist0) p = { ...p, fa: [p.fa[0], p.fa[1] + 8 * Math.sin((f - T.twist0) / 2.2) * (1 - seg01(f, T.pop - 6, T.pop))] };
  if (f >= T.pop) p = mix(REACH, LIFT, smoother(seg01(f, T.pop, T.pop + 8)));
  if (f >= T.set0) p = mix(LIFT, SET, smoother(seg01(f, T.set0 + 4, T.set1)));
  if (f >= T.back0) p = walking(walkPh(f, T.back0, T.back1, X1, X2), SET, walkAmt(f, T.back0, T.back1), true);
  if (f >= T.back1) p = mix(SET, ADMIRE, smoother(seg01(f, T.back1, T.back1 + 24)));
  return { ...p, lean: p.lean + 1.4 * breath - 4 * deep, head: p.head + 1.2 * breath - 8 * deep };
};
export const moodAt = (f: number) => 0.4 - 0.1 * smoother(seg01(f, T.puzzle, T.tap)) + 0.15 * smoother(seg01(f, T.look0, T.pop)) + 0.55 * smoother(seg01(f, T.grow0, T.bloom1));
export const lightAt = (f: number) => 0.3 + 0.7 * smoother(seg01(f, T.grow0, T.bloom1));
export const healAt = (f: number) => 0.14 + 0.08 * smoother(seg01(f, T.look0, T.pop)) + 0.78 * smoother(seg01(f, T.air0, T.bloom1));
// the plant: droop 1 → 0, growth 0 → 1, blossoms 0 → 1, fog 1 → 0
export const droopAt = (f: number) => 1 - smoother(seg01(f, T.air0, T.grow0 + 30));
export const growAt = (f: number) => smoother(seg01(f, T.grow0, T.grow1));
export const bloomAt = (f: number) => smoother(seg01(f, T.bloom0, T.bloom1));
export const fogAt = (f: number) => 1 - smoother(seg01(f, T.air0, T.air0 + 30));
