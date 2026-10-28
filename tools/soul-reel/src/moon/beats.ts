// "You are the moon of your world" (v2) — beats, choreography and poses. Frames @30fps, 1080x1920.
// Built on the master rig (src/master/pose.ts): same soul, same proportions, same gait maths.
import { lerp, seg01, smoother, sstep, Pose, POSES } from "../master/pose";

export const END = 660; // 22s
export const T = {
  pick0: 0, pick1: 92,          // the soul kneels in the grass, picking at a little flower
  bIn0: 70, bIn1: 172,          // the friend walks in
  hear: 96,                     // the soul hears the footsteps and looks up
  stand0: 124, stand1: 160,     // stands up to greet it
  offer0: 178, offer1: 202,     // the friend holds out both hands in front: the moon (higher) and the stars (lower)
  glowOn: 196,
  lookMoon: 214, lookStars: 240, lookBack: 272, // the soul looks from one to the other
  breath0: 280, breath1: 306,
  aWalk0: 306, aWalk1: 346,     // two steps forward
  reach0: 340, reach1: 358, take: 360,
  lift0: 366, rise0: 374, rise1: 432, // the moon floats up into the sky
  scatter0: 450, scatter1: 520, // the stars drift up and blend into the sky around the moon
  wipe: 570, card: 588,
};
export const A0 = 300, A1 = 520;  // the soul
export const B0 = 1270, B1 = 790; // the friend (faces left)
export const STRIDE = 248;

const walkAmt = (f: number, a: number, b: number) => sstep(seg01(f, a, a + 16)) * (1 - sstep(seg01(f, b - 16, b)));
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
const KNEEL_PICK = P(44, 30, [70, 74], [-100, -96], [8, 18], [16, 22]);   // kneeling, front hand in the grass
const KNEEL_LOOK = P(18, -14, [70, 74], [-100, -96], [10, 16], [30, 36]); // still kneeling, looks up toward the footsteps
const SEE_MOON = P(3, 2, [0, 0], [0, 0], [4, 6], [12, 14]);
const SEE_STARS = P(6, 22, [0, 0], [0, 0], [4, 6], [12, 14]);
const REACH = P(8, 6, [-2, 6], [-2, 4], [4, 82], [12, 92]);              // front hand out to the moon
const LIFT = P(-4, -22, [0, 0], [0, 0], [8, 150], [20, 162]);            // lets the moon float up from its palm
const GLOW = P(-5, -28, [-2, 3], [-2, 2], [14, 30], [24, 40]);           // looking up at its moon

// the soul
export const ax = (f: number) => walkX(f, T.aWalk0, T.aWalk1, A0, A1);
export const aPose = (f: number): Pose => {
  const breath = Math.sin((f / 30) * Math.PI * 2 / 3.8);
  const deep = Math.sin(Math.PI * seg01(f, T.breath0, T.breath1));
  const pluck = f < T.hear ? 8 * Math.sin((f / 30) * Math.PI * 2 / 1.4) : 0;
  let p: Pose = { ...KNEEL_PICK, fa: [KNEEL_PICK.fa[0], KNEEL_PICK.fa[1] + pluck], ua: [KNEEL_PICK.ua[0], KNEEL_PICK.ua[1] + pluck * 0.4] };
  if (f >= T.hear) p = mix(KNEEL_PICK, KNEEL_LOOK, smoother(seg01(f, T.hear, T.hear + 20)));
  if (f >= T.stand0) p = mix(KNEEL_LOOK, S, smoother(seg01(f, T.stand0, T.stand1)));
  if (f >= T.lookMoon) p = mix(S, SEE_MOON, smoother(seg01(f, T.lookMoon, T.lookMoon + 14)));
  if (f >= T.lookStars) p = mix(SEE_MOON, SEE_STARS, smoother(seg01(f, T.lookStars, T.lookStars + 14)));
  if (f >= T.lookBack) p = mix(SEE_STARS, SEE_MOON, smoother(seg01(f, T.lookBack, T.lookBack + 14)));
  if (f >= T.aWalk0) p = walking(walkPh(f, T.aWalk0, T.aWalk1, A0, A1), SEE_MOON, walkAmt(f, T.aWalk0, T.aWalk1));
  if (f >= T.reach0) p = mix(SEE_MOON, REACH, smoother(seg01(f, T.reach0, T.reach1)));
  if (f >= T.lift0) p = mix(REACH, LIFT, smoother(seg01(f, T.lift0, T.rise0 + 16)));
  if (f >= T.rise0 + 30) p = mix(LIFT, GLOW, smoother(seg01(f, T.rise0 + 30, T.rise1 + 10)));
  const anticip = f >= T.reach0 - 10 && f < T.reach0 ? -3 * Math.sin(Math.PI * seg01(f, T.reach0 - 10, T.reach0)) : 0;
  return { ...p, lean: p.lean + 1.4 * breath + anticip - 3 * deep, head: p.head + 1.2 * breath - 6 * deep };
};
export const aMood = (f: number) => 0.3 + 0.18 * smoother(seg01(f, T.hear, T.stand1)) + 0.52 * smoother(seg01(f, T.take, T.rise1));
export const aLight = (f: number) => 0.35 + 0.1 * smoother(seg01(f, T.glowOn, T.lookBack)) + 0.65 * smoother(seg01(f, T.take, T.rise1));

// the friend: both hands held out IN FRONT — the moon in the higher hand, the stars in the lower one
const OFFER = P(5, 8, [0, 0], [0, 0], [35, 70], [55, 80]);
const NOD = P(6, 16, [0, 0], [0, 0], [-4, 6], [8, 14]);
export const bx = (f: number) => walkX(f, T.bIn0, T.bIn1, B0, B1);
export const bPose = (f: number): Pose => {
  const breath = Math.sin((f / 30) * Math.PI * 2 / 4.2 + 1.3);
  let p: Pose = walking(walkPh(f, T.bIn0, T.bIn1, B0, B1), S, walkAmt(f, T.bIn0, T.bIn1));
  if (f >= T.offer0) {
    p = mix(S, OFFER, smoother(seg01(f, T.offer0, T.offer1)));
    p = { ...p, lean: p.lean - 3 * Math.sin(Math.PI * seg01(f, T.offer0 - 8, T.offer0 + 6)) };
  }
  if (f >= T.take) { const u = smoother(seg01(f, T.take + 2, T.take + 34)); p = { ...p, ua: [p.ua[0], lerp(OFFER.ua[1], NOD.ua[1], u)], fa: [p.fa[0], lerp(OFFER.fa[1], NOD.fa[1], u)] }; }
  if (f >= T.scatter0) p = mix(p, NOD, smoother(seg01(f, T.scatter0 + 4, T.scatter0 + 40)));
  if (f >= T.scatter0 + 40) p = { ...p, head: p.head + 10 * Math.sin(Math.PI * seg01(f, T.scatter0 + 40, T.scatter0 + 66)) };
  return { ...p, lean: p.lean + 1.2 * breath, head: p.head + 1 * breath };
};

export const healAt = (f: number) => 0.16 + 0.06 * smoother(seg01(f, T.glowOn, T.glowOn + 40)) + 0.78 * smoother(seg01(f, T.take, T.rise1 + 40));
export const MOON_SKY = { x: 620, y: 880, r: 86 };
export const moonGrow = (f: number) => smoother(seg01(f, T.rise0, T.rise1));
export const starsUp = (f: number) => smoother(seg01(f, T.scatter0, T.scatter1));
