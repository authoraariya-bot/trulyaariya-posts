// Reel 2 (v2): the soul looks for a quiet spot by the restless waves, gets splashed twice, walks on,
// finds the calm cove, and lies back with its hands behind its head, one foot wiggling happily.
import { lerp, seg01, smoother, sstep, Pose, POSES } from "../master/pose";

export const END = 615;
export const STRIDE = 248;
export const T = {
  look0: 4, sit1a: 24, sit1b: 46, splash1: 54, up1a: 58, up1b: 74,
  step0: 78, step1: 108, sit2a: 112, sit2b: 132, splash2: 140, up2a: 144, up2b: 160, shake0: 160, shake1: 184,
  walk0: 190, walk1: 300,     // walks on; the camera travels with it into the calm cove
  look1: 302, smile: 318,
  sit3a: 330, sit3b: 352, lie0: 356, lie1: 390, wiggle: 396,
  wipe: 518, card: 536,
};
export const X0 = 300, X1 = 430, X2 = 1520;
export const CALM_X0 = 760, CALM_X1 = 1320; // world x where the sea goes from restless to calm

export const walkAmt = (f: number, a: number, b: number) => sstep(seg01(f, a, a + 14)) * (1 - sstep(seg01(f, b - 14, b)));
export const walkX = (f: number, a: number, b: number, x0: number, x1: number) => lerp(x0, x1, smoother(seg01(f, a, b)));
export const walkPh = (f: number, a: number, b: number, x0: number, x1: number) => (Math.abs(walkX(f, a, b, x0, x1) - x0) / STRIDE) * Math.PI * 2;
const mix = (p: Pose, q: Pose, t: number): Pose => ({
  lean: lerp(p.lean, q.lean, t), head: lerp(p.head, q.head, t),
  th: [lerp(p.th[0], q.th[0], t), lerp(p.th[1], q.th[1], t)], sh: [lerp(p.sh[0], q.sh[0], t), lerp(p.sh[1], q.sh[1], t)],
  ua: [lerp(p.ua[0], q.ua[0], t), lerp(p.ua[1], q.ua[1], t)], fa: [lerp(p.fa[0], q.fa[0], t), lerp(p.fa[1], q.fa[1], t)],
});
const P = (lean: number, head: number, th: [number, number], sh: [number, number], ua: [number, number], fa: [number, number]): Pose => ({ lean, head, th, sh, ua, fa });
const walking = (ph: number, base: Pose, amt: number): Pose => {
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
const LOOK = P(2, 4, [0, 0], [0, 0], [4, 6], [12, 14]);
const SIT = P(20, 28, [124, 128], [30, 26], [12, 22], [40, 50]);
const SIT_HAPPY = P(14, 6, [118, 124], [24, 20], [14, 22], [30, 40]);
const LIE = P(-60, 44, [90, 86], [92, 88], [150, 170], [-110, -120]); // reclining on the sand, legs stretched out and crossed, hands behind its head

export const soulX = (f: number) => (f < T.step0 ? X0 : f < T.walk0 ? walkX(f, T.step0, T.step1, X0, X1) : walkX(f, T.walk0, T.walk1, X1, X2));
export const camX = (f: number) => Math.max(0, Math.min(1080, soulX(f) - X1));
export const soulPose = (f: number): Pose => {
  const breath = Math.sin((f / 30) * Math.PI * 2 / 3.8);
  // look left and right for a quiet spot
  let p: Pose = { ...LOOK, head: LOOK.head + 10 * Math.sin(Math.PI * 2 * seg01(f, T.look0, T.sit1a)) };
  if (f >= T.sit1a) p = mix(LOOK, SIT, smoother(seg01(f, T.sit1a, T.sit1b)));
  if (f >= T.up1a) p = mix(SIT, S, smoother(seg01(f, T.up1a, T.up1b)));
  if (f >= T.step0) p = walking(walkPh(f, T.step0, T.step1, X0, X1), S, walkAmt(f, T.step0, T.step1));
  if (f >= T.sit2a) p = mix(S, SIT, smoother(seg01(f, T.sit2a, T.sit2b)));
  if (f >= T.up2a) p = mix(SIT, S, smoother(seg01(f, T.up2a, T.up2b)));
  if (f >= T.shake0 && f < T.shake1) { const s = Math.sin(Math.PI * seg01(f, T.shake0, T.shake1)); p = { ...p, lean: p.lean + 6 * s * Math.sin(f * 1.6), head: p.head + 8 * s * Math.sin(f * 1.6 + 1) }; }
  if (f >= T.walk0) p = walking(walkPh(f, T.walk0, T.walk1, X1, X2), S, walkAmt(f, T.walk0, T.walk1));
  if (f >= T.look1) p = { ...LOOK, head: LOOK.head - 8 * Math.sin(Math.PI * seg01(f, T.look1, T.smile + 10)) };
  if (f >= T.sit3a) p = mix(LOOK, SIT_HAPPY, smoother(seg01(f, T.sit3a, T.sit3b)));
  if (f >= T.lie0) p = mix(SIT_HAPPY, LIE, smoother(seg01(f, T.lie0, T.lie1)));
  if (f >= T.wiggle) p = { ...p, sh: [p.sh[0], p.sh[1] - 9 * Math.abs(Math.sin((f - T.wiggle) / 6))] };
  const startle = (a: number) => (f >= a && f < a + 14 ? Math.sin(Math.PI * seg01(f, a, a + 14)) : 0);
  const st = startle(T.splash1) + startle(T.splash2);
  return { ...p, lean: p.lean + (f < T.lie0 ? 1.4 * breath : 0.6 * breath) - 6 * st, head: p.head + 1.2 * breath + 10 * st };
};
// a little hop when the splash hits
export const hopAt = (f: number) => 22 * (Math.sin(Math.PI * seg01(f, T.up1a, T.up1a + 12)) + Math.sin(Math.PI * seg01(f, T.up2a, T.up2a + 12)));
export const moodAt = (f: number) => 0.4 - 0.15 * smoother(seg01(f, T.splash1, T.up1b)) - 0.1 * smoother(seg01(f, T.splash2, T.shake1)) + 0.3 * smoother(seg01(f, T.walk1 - 20, T.smile)) + 0.55 * smoother(seg01(f, T.smile, T.lie1));
export const lightAt = (f: number) => 0.3 + 0.7 * smoother(seg01(f, T.walk1 - 30, T.lie1));
export const healAt = (f: number) => 0.14 + 0.66 * smoother(camX(f) / 1080) + 0.2 * smoother(seg01(f, T.smile, T.lie1));
export const chopAt = (x: number) => 1 - smoother((x - CALM_X0) / (CALM_X1 - CALM_X0));
