// "Every time you let someone mistreat you…" — six wings, four taken, two kept. Beats & poses (master rig).
import { lerp, seg01, smoother, sstep, Pose, POSES } from "../master/pose";

export const END = 640;
export const STRIDE = 248;
// the soul faces right, toward the path the takers come along
export const AX0 = 470, AX1 = 150;
// six wings fanned from its back: angle from straight up (− = back, + = front). Taken front-first.
// three wings on each side, spread left and right like real wings: [side, tilt°] (tilt − = up, + = down)
export const WINGS: [number, number][] = [[-1, -30], [-1, -4], [-1, 22], [1, -30], [1, -4], [1, 22]];
export const TAKEN = [5, 4, 2, 1]; // right-lower, right-middle, left-lower, left-middle → the top pair stays
export const FROM = [1, 1, -1, -1]; // takers 1–2 come from the right, 3–4 from the left
// takers: walk in from the right, reach, pull, turn, walk out
export const TK = [
  { in0: 54, in1: 104, grab: 120, out0: 136, out1: 190 },
  { in0: 168, in1: 204, grab: 214, out0: 226, out1: 266 },
  { in0: 236, in1: 266, grab: 274, out0: 284, out1: 320 },
  { in0: 292, in1: 318, grab: 324, out0: 332, out1: 366 },
];
export const T = {
  stretch0: 6, stretch1: 60,
  t5in0: 360, t5in1: 404, ask0: 404, ask1: 418, stop0: 418, stop1: 432, hold1: 452,
  turn0: 456, turn1: 468, walk0: 468, walk1: 548, open0: 474, open1: 520,
  t5fade0: 470, t5fade1: 520,
  wipe: 560, card: 578,
};
export const TAKER_STOP = (i: number) => (i < 4 && FROM[i] < 0 ? AX0 - 214 : AX0 + (i === 4 ? 250 : 214));

export const walkAmt = (f: number, a: number, b: number) => sstep(seg01(f, a, a + 14)) * (1 - sstep(seg01(f, b - 14, b)));
export const walkX = (f: number, a: number, b: number, x0: number, x1: number) => lerp(x0, x1, smoother(seg01(f, a, b)));
export const walkPh = (f: number, a: number, b: number, x0: number, x1: number) => (Math.abs(walkX(f, a, b, x0, x1) - x0) / STRIDE) * Math.PI * 2;
export const mix = (p: Pose, q: Pose, t: number): Pose => ({
  lean: lerp(p.lean, q.lean, t), head: lerp(p.head, q.head, t),
  th: [lerp(p.th[0], q.th[0], t), lerp(p.th[1], q.th[1], t)], sh: [lerp(p.sh[0], q.sh[0], t), lerp(p.sh[1], q.sh[1], t)],
  ua: [lerp(p.ua[0], q.ua[0], t), lerp(p.ua[1], q.ua[1], t)], fa: [lerp(p.fa[0], q.fa[0], t), lerp(p.fa[1], q.fa[1], t)],
});
const P = (lean: number, head: number, th: [number, number], sh: [number, number], ua: [number, number], fa: [number, number]): Pose => ({ lean, head, th, sh, ua, fa });
export const walking = (ph: number, base: Pose, amt: number): Pose => {
  const leg = (o: number) => {
    const p = ph + o, swing = Math.max(0, -Math.sin(p)), stance = Math.max(0, Math.sin(p));
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
const PROUD = P(-4, -10, [0, 0], [0, 0], [10, 14], [20, 24]);
const DROOP = P(12, 26, [0, 2], [0, 0], [2, 2], [6, 8]);
const STOP = P(-3, -6, [-2, 4], [-2, 2], [4, 70], [10, 158]); // front palm raised: "no"

// how many wings it has lost by frame f (smooth)
export const lost = (f: number) => TK.reduce((a, k) => a + smoother(seg01(f, k.grab, k.grab + 10)), 0);
export const aDir = (f: number) => Math.cos(Math.PI * smoother(seg01(f, T.turn0, T.turn1))); // 1 → −1 (turns to walk away left)
export const ax = (f: number) => walkX(f, T.walk0, T.walk1, AX0, AX1);
export const aPose = (f: number): Pose => {
  const breath = Math.sin((f / 30) * Math.PI * 2 / 3.8);
  const L = lost(f);
  let p = mix(S, PROUD, smoother(seg01(f, T.stretch0, T.stretch1)) * (1 - smoother(seg01(f, TK[0].grab, TK[0].grab + 20))));
  p = mix(p, DROOP, Math.min(1, L / 4));
  if (f >= T.stop0) p = mix(p, STOP, smoother(seg01(f, T.stop0, T.stop1)) * (1 - smoother(seg01(f, T.hold1, T.turn0 + 4))));
  if (f >= T.turn0) p = mix(p, S, smoother(seg01(f, T.turn0, T.turn1)));
  if (f >= T.walk0) p = walking(walkPh(f, T.walk0, T.walk1, AX0, AX1), mix(S, PROUD, smoother(seg01(f, T.open0, T.open1))), walkAmt(f, T.walk0, T.walk1));
  // a flinch each time a wing is pulled
  const fl = TK.reduce((a, k) => a + Math.sin(Math.PI * seg01(f, k.grab, k.grab + 14)), 0);
  return { ...p, lean: p.lean + 1.4 * breath - 7 * fl, head: p.head + 1.2 * breath + 8 * fl };
};
export const aMood = (f: number) => 0.7 - 0.13 * lost(f) + 0.2 * smoother(seg01(f, T.stop0, T.stop1)) + 0.45 * smoother(seg01(f, T.open0, T.open1));
export const aLight = (f: number) => 0.85 - 0.16 * lost(f) + 0.75 * smoother(seg01(f, T.open0, T.open1));
export const healAt = (f: number) => 0.32 - 0.05 * lost(f) + 0.06 * smoother(seg01(f, T.stop0, T.stop1)) + 0.75 * smoother(seg01(f, T.turn0, T.open1 + 20));

// takers (faces left while coming in, right while leaving)
const REACH = P(6, 0, [0, 0], [0, 0], [4, 80], [10, 92]);
const PULL = P(-10, -4, [-6, 8], [-6, 4], [4, 56], [10, 70]);
const ASK = P(4, 10, [0, 0], [0, 0], [4, 62], [10, 80]); // palm held out, asking
export const takerState = (i: number, f: number) => {
  if (i < 4) {
    const k = TK[i];
    if (f < k.in0 || f > k.out1) return null;
    const side = FROM[i], edge = side > 0 ? 1260 : -180;
    const stopX = TAKER_STOP(i), outX = edge;
    const x = f < k.out0 ? walkX(f, k.in0, k.in1, edge, stopX) : walkX(f, k.out0, k.out1, stopX, outX);
    const dir = -side * lerp(1, -1, smoother(seg01(f, k.out0 - 4, k.out0 + 4)));
    let p: Pose = f < k.out0 ? walking(walkPh(f, k.in0, k.in1, edge, stopX), S, walkAmt(f, k.in0, k.in1)) : walking(walkPh(f, k.out0, k.out1, stopX, outX), S, walkAmt(f, k.out0, k.out1));
    if (f >= k.in1 - 8 && f < k.out0) {
      const r = smoother(seg01(f, k.in1 - 8, k.grab)), pl = smoother(seg01(f, k.grab, k.grab + 10));
      p = mix(mix(S, REACH, r), PULL, pl);
    }
    if (f >= k.out0) p = { ...p, ua: [p.ua[0], lerp(PULL.ua[1], p.ua[1], smoother(seg01(f, k.out0, k.out0 + 16)))], fa: [p.fa[0], lerp(PULL.fa[1], p.fa[1], smoother(seg01(f, k.out0, k.out0 + 16)))] };
    return { x, dir, p, o: 1 };
  }
  // the fifth: walks in, holds out a hand, is refused, fades away
  if (f < T.t5in0) return null;
  const x = walkX(f, T.t5in0, T.t5in1, 1260, TAKER_STOP(4));
  let p: Pose = walking(walkPh(f, T.t5in0, T.t5in1, 1260, TAKER_STOP(4)), S, walkAmt(f, T.t5in0, T.t5in1));
  if (f >= T.ask0) p = mix(S, ASK, smoother(seg01(f, T.ask0, T.ask1)) * (1 - smoother(seg01(f, T.hold1, T.hold1 + 16))));
  return { x, dir: -1, p, o: 1 - smoother(seg01(f, T.t5fade0, T.t5fade1)) };
};
