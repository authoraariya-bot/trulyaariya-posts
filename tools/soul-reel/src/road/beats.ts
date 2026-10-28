// Reel 5: the soul stands on a road while shadow figures (a just-married couple, someone with a promotion letter)
// walk past and ahead. It takes a deep breath, looks up, points to the words, then walks on at its own pace.
import { lerp, seg01, smoother, sstep, Pose, POSES } from "../master/pose";

export const END = 645;
export const STRIDE = 248;
export const T = {
  coupleIn: 30, coupleOut: 200, promoIn: 112, promoOut: 282,
  race: 214, droop0: 236, droop1: 256,
  in0: 268, in1: 300, out0: 304, out1: 336, road: 318,
  look0: 340, look1: 356, point0: 352, point1: 372, pointEnd: 426,
  walk0: 440, walk1: 530,
  wipe: 548, card: 566,
};
export const X0 = 330, X1 = 560;
export const SG = 1486, SSC = 1.24; // shadow figures walk a little further back on the road

export const walkAmt = (f: number, a: number, b: number) => sstep(seg01(f, a, a + 14)) * (1 - sstep(seg01(f, b - 14, b)));
export const walkX = (f: number, a: number, b: number, x0: number, x1: number) => lerp(x0, x1, smoother(seg01(f, a, b)));
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
const WATCH = P(2, 2, [0, 0], [0, 0], [4, 6], [12, 14]);
const DROOP = P(10, 30, [0, 2], [0, 0], [2, 3], [6, 8]);             // watches them go ahead, a little low
const INHALE = P(-5, -10, [0, 0], [0, 0], [26, 32], [52, 60]);       // hands rise a little with the breath in
const LOOKUP = P(-5, -28, [-2, 3], [-2, 2], [8, 10], [16, 20]);
const POINT = P(-6, -30, [-2, 3], [-2, 2], [8, 156], [16, 166]);     // front arm points up to the words
const HAPPY = P(-2, -6, [0, 0], [0, 0], [6, 8], [14, 16]);

export const soulX = (f: number) => walkX(f, T.walk0, T.walk1, X0, X1);
export const soulPose = (f: number): Pose => {
  const breath = Math.sin((f / 30) * Math.PI * 2 / 3.8);
  let p: Pose = mix(S, WATCH, smoother(seg01(f, 0, 30)));
  if (f >= T.droop0) p = mix(WATCH, DROOP, smoother(seg01(f, T.droop0, T.droop1)));
  if (f >= T.in0) p = mix(DROOP, INHALE, smoother(seg01(f, T.in0, T.in1)));
  if (f >= T.out0) p = mix(INHALE, S, smoother(seg01(f, T.out0, T.out1)));
  if (f >= T.look0) p = mix(S, LOOKUP, smoother(seg01(f, T.look0, T.look1)));
  if (f >= T.point0) p = mix(LOOKUP, POINT, smoother(seg01(f, T.point0, T.point1)));
  if (f >= T.pointEnd) p = mix(POINT, HAPPY, smoother(seg01(f, T.pointEnd, T.walk0)));
  if (f >= T.walk0) p = walking((Math.abs(soulX(f) - X0) / STRIDE) * Math.PI * 2, HAPPY, walkAmt(f, T.walk0, T.walk1));
  const calm = f < T.in0 ? 1 : 0.6;
  return { ...p, lean: p.lean + 1.4 * breath * calm, head: p.head + 1.2 * breath * calm };
};
export const moodAt = (f: number) => 0.45 - 0.22 * smoother(seg01(f, T.promoIn + 60, T.droop1)) + 0.25 * smoother(seg01(f, T.in0, T.out1)) + 0.55 * smoother(seg01(f, T.point0, T.pointEnd));
export const lightAt = (f: number) => 0.3 - 0.1 * smoother(seg01(f, T.race, T.droop1)) + 0.3 * smoother(seg01(f, T.in0, T.out1)) + 0.5 * smoother(seg01(f, T.point0, T.walk1));
export const healAt = (f: number) => 0.42 - 0.08 * smoother(seg01(f, T.race, T.droop1)) + 0.2 * smoother(seg01(f, T.in0, T.out1)) + 0.46 * smoother(seg01(f, T.point0, T.walk1));
// deep breath: 0 → 1 (in) → 0 (out)
export const breathAt = (f: number) => smoother(seg01(f, T.in0, T.in1)) * (1 - smoother(seg01(f, T.out0, T.out1)));

// shadow figures, all walking left → right at an easy pace
export type Shadow = { x: number; p: Pose };
const shadowWalk = (f: number, a: number, b: number, x0: number, x1: number, phOff: number, hold?: (p: Pose) => Pose): Shadow | null => {
  if (f < a || f > b) return null;
  const x = lerp(x0, x1, seg01(f, a, b)); // constant, unhurried pace
  const ph = (Math.abs(x - x0) / (STRIDE * SSC)) * Math.PI * 2 + phOff;
  let p = walking(ph, S, 1);
  if (hold) p = hold(p);
  return { x, p };
};
// the couple: holding hands (lead's back hand ↔ partner's front hand)
export const couple = (f: number): [Shadow, Shadow] | null => {
  const lead = shadowWalk(f, T.coupleIn, T.coupleOut, -160, 1300, 0, (p) => ({ ...p, head: p.head - 4, ua: [-38, p.ua[1]], fa: [-30, p.fa[1]] }));
  const part = shadowWalk(f, T.coupleIn, T.coupleOut, -160 - 120, 1300 - 120, 0.5, (p) => ({ ...p, head: p.head - 8, ua: [p.ua[0], 38], fa: [p.fa[0], 30] }));
  return lead && part ? [lead, part] : null;
};
// someone proudly carrying a promotion letter in front
export const promo = (f: number): Shadow | null =>
  shadowWalk(f, T.promoIn, T.promoOut, -120, 1300, 1.2, (p) => ({ ...p, lean: p.lean - 3, head: p.head + 10, ua: [p.ua[0], 34], fa: [p.fa[0], 92] }));
