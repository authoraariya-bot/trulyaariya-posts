// "In a world full of restless waves, be the seashore. Calm and steady." — beats and poses (master rig).
import { lerp, seg01, smoother, Pose, POSES } from "../master/pose";

export const END = 615; // 20.5s
export const T = {
  draw1: 112,                 // sits drawing slow circles in the sand
  rush0: 112, rush1: 150,     // a big wave rushes up the sand
  flinch: 132,                // startled: pulls its knees in
  kneel0: 176, stand0: 196, stand1: 228, // gets up and plants its feet
  breath0: 236, breath1: 286, // one slow, deep breath
  calm0: 270, calm1: 390,     // the sea settles, wave by wave
  touch: 336,                 // the first gentle wave reaches its toes
  smile: 400,
  wipe: 518, card: 536,
};
export const SX = 470;
export const SHORE = 1530;   // where the sand meets the sea at rest

const mix = (p: Pose, q: Pose, t: number): Pose => ({
  lean: lerp(p.lean, q.lean, t), head: lerp(p.head, q.head, t),
  th: [lerp(p.th[0], q.th[0], t), lerp(p.th[1], q.th[1], t)], sh: [lerp(p.sh[0], q.sh[0], t), lerp(p.sh[1], q.sh[1], t)],
  ua: [lerp(p.ua[0], q.ua[0], t), lerp(p.ua[1], q.ua[1], t)], fa: [lerp(p.fa[0], q.fa[0], t), lerp(p.fa[1], q.fa[1], t)],
});
const P = (lean: number, head: number, th: [number, number], sh: [number, number], ua: [number, number], fa: [number, number]): Pose => ({ lean, head, th, sh, ua, fa });

const SIT_DRAW = P(24, 30, [118, 104], [26, 18], [10, 34], [30, 58]);   // sitting, knees up, front hand down at the sand
const SIT_HUG = POSES.sitHug;                                           // knees pulled in
const KNEEL = P(30, 10, [70, 74], [-100, -96], [10, 20], [30, 40]);
const S = POSES.stand;
const STEADY = P(-2, -6, [-3, 3], [-3, 3], [6, 8], [12, 14]);           // feet planted, chin up
const SMILE = P(-4, -14, [-3, 3], [-3, 3], [8, 12], [16, 20]);

export const soulPose = (f: number): Pose => {
  const breath = Math.sin((f / 30) * Math.PI * 2 / 3.8);
  const deep = Math.sin(Math.PI * seg01(f, T.breath0, T.breath1));
  // slow circles in the sand
  const c = (f / 30) * Math.PI * 2 / 2.2;
  let p: Pose = { ...SIT_DRAW, ua: [SIT_DRAW.ua[0], SIT_DRAW.ua[1] + 7 * Math.cos(c)], fa: [SIT_DRAW.fa[0], SIT_DRAW.fa[1] + 12 * Math.sin(c)] };
  if (f >= T.flinch) p = mix(p, SIT_HUG, smoother(seg01(f, T.flinch, T.flinch + 10)));
  if (f >= T.kneel0) p = mix(SIT_HUG, KNEEL, smoother(seg01(f, T.kneel0, T.stand0)));
  if (f >= T.stand0) p = mix(KNEEL, S, smoother(seg01(f, T.stand0, T.stand1)));
  if (f >= T.stand1) p = mix(S, STEADY, smoother(seg01(f, T.stand1, T.stand1 + 20)));
  if (f >= T.smile) p = mix(STEADY, SMILE, smoother(seg01(f, T.smile, T.smile + 30)));
  const startle = f >= T.flinch && f < T.flinch + 16 ? -6 * Math.sin(Math.PI * seg01(f, T.flinch, T.flinch + 16)) : 0;
  return { ...p, lean: p.lean + 1.4 * breath - 5 * deep + startle, head: p.head + 1.2 * breath - 10 * deep + startle * 1.5 };
};
// 0 uneasy → 1 calm joy
export const moodAt = (f: number) => 0.3 - 0.12 * smoother(seg01(f, T.flinch, T.flinch + 14)) + 0.22 * smoother(seg01(f, T.stand0, T.breath1)) + 0.6 * smoother(seg01(f, T.breath1, T.smile + 20));
export const lightAt = (f: number) => 0.3 + 0.35 * smoother(seg01(f, T.breath0, T.breath0 + 30)) - 0.05 * smoother(seg01(f, T.breath1 - 10, T.breath1)) + 0.4 * smoother(seg01(f, T.calm0, T.smile));
// how restless the sea is: 1 choppy → 0 glassy
export const chop = (f: number) => 1 - smoother(seg01(f, T.calm0, T.calm1)) * 0.92;
// how awake the colours are
export const healAt = (f: number) => 0.14 + 0.1 * smoother(seg01(f, T.breath0, T.breath1)) + 0.76 * smoother(seg01(f, T.calm0, T.smile + 30));
// the waterline on the sand (y), as waves run up and slide back
export const washY = (f: number) => {
  const restless = 26 * Math.max(0, Math.sin(f / 9)) + 14 * Math.max(0, Math.sin(f / 5.3 + 1));
  const rush = 92 * Math.sin(Math.PI * seg01(f, T.rush0, T.rush1));
  const lap = 64 * Math.pow(Math.max(0, Math.sin(((f - T.touch) / 30) * Math.PI * 2 / 3.4 + Math.PI / 2)), 1.6);
  const calm = smoother(seg01(f, T.calm0, T.touch));
  return SHORE + lerp(restless, f >= T.touch - 26 ? lap : 10, calm) + rush * (1 - calm);
};
