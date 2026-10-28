// Reel 8: "A tree stands only as long as its roots are strong. Your roots are your soul. Heal them first."
// The soul waters the tired tree's leaves (nothing changes), looks underground, waters the roots,
// finds its own roots too, sends its light down — and the tree stands tall and blossoms.
import { GROUND, lerp, seg01, smoother, solve, sstep, Pose, SCALE } from "../master/pose";

export const END = 645;
export const STRIDE = 248;
export const T = {
  walk0: 8, walk1: 70, raise0: 76, raise1: 92, spray0: 92, spray1: 140, lower0: 140, lower1: 156, puzzle: 156,
  camDown0: 162, camDown1: 214, text1: 168,
  step0: 214, step1: 244, kneel0: 244, kneel1: 262, pour0: 264, pour1: 306, seep0: 270, seep1: 330, wet0: 296, wet1: 340,
  ownRoots0: 300, ownRoots1: 330, text2: 304, setCan0: 306, setCan1: 318, hands0: 318, hands1: 332,
  breath0: 334, breath1: 370, flowSoul0: 342, flowSoul1: 372, flowTree0: 366, flowTree1: 404, grow0: 368, grow1: 424,
  camUp0: 418, camUp1: 458, stand0: 436, stand1: 460, straighten0: 424, straighten1: 466, green0: 426, green1: 470,
  bloom0: 456, bloom1: 506, text3: 460,
  wipe: 548, card: 566,
};
export const TX = 700;                       // the tree
export const X0 = -80, X1 = 330, X2 = 520;   // walks in; then steps to the tree's foot
export const CAM = 380;                      // how far the camera slides down to see below the ground
export const camY = (f: number) => CAM * (smoother(seg01(f, T.camDown0, T.camDown1)) - smoother(seg01(f, T.camUp0, T.camUp1)));
export const cutAt = (f: number) => smoother(seg01(f, T.camDown0 - 10, T.camDown0 + 24)) * (1 - smoother(seg01(f, T.camUp1 - 8, T.camUp1 + 6)));

export const walkAmt = (f: number, a: number, b: number) => sstep(seg01(f, a, a + 12)) * (1 - sstep(seg01(f, b - 12, b)));
export const walkX = (f: number, a: number, b: number, x0: number, x1: number) => lerp(x0, x1, smoother(seg01(f, a, b)));
export const mix = (p: Pose, q: Pose, t: number): Pose => ({
  lean: lerp(p.lean, q.lean, t), head: lerp(p.head, q.head, t),
  th: [lerp(p.th[0], q.th[0], t), lerp(p.th[1], q.th[1], t)], sh: [lerp(p.sh[0], q.sh[0], t), lerp(p.sh[1], q.sh[1], t)],
  ua: [lerp(p.ua[0], q.ua[0], t), lerp(p.ua[1], q.ua[1], t)], fa: [lerp(p.fa[0], q.fa[0], t), lerp(p.fa[1], q.fa[1], t)],
});
const P = (lean: number, head: number, th: [number, number], sh: [number, number], ua: [number, number], fa: [number, number]): Pose => ({ lean, head, th, sh, ua, fa });
export const walking = (ph: number, base: Pose, amt: number, keepFront = true): Pose => {
  const leg = (o: number) => {
    const p = ph + o, swing = Math.max(0, -Math.sin(p)), stance = Math.max(0, Math.sin(p));
    const th = 23 * Math.cos(p);
    return [th, th - (48 * Math.pow(swing, 1.3) + 7 * stance)];
  };
  const [tb, sb] = leg(Math.PI), [tf, sf] = leg(0);
  const ab = -0.75 * tb, af = -0.75 * tf;
  const w: Pose = { lean: base.lean + 2.5 + 1.2 * Math.cos(ph * 2), head: base.head - 1.2 * Math.cos(ph * 2) - 3, th: [tb, tf], sh: [sb, sf],
    ua: [ab, keepFront ? base.ua[1] : af], fa: [ab + 14 + 10 * Math.max(0, Math.sin(ph + Math.PI)), keepFront ? base.fa[1] : af + 14] };
  return mix(base, w, amt);
};
type V = { x: number; y: number };
// two-bone IK for one arm, target in world space (soul faces right)
export const reach = (pose: Pose, x: number, target: V, arm: 0 | 1, amt = 1): Pose => {
  if (amt <= 0) return pose;
  const r = solve(pose, x), sh = r.arms[arm].sh;
  const tl = { x: x + (target.x - x) / SCALE, y: GROUND + (target.y - GROUND) / SCALE };
  const L1 = 42, L2 = 40, dx = tl.x - sh.x, dy = tl.y - sh.y, d = Math.max(8, Math.min(L1 + L2 - 0.5, Math.hypot(dx, dy)));
  const phi = (Math.atan2(dx, dy) * 180) / Math.PI;
  const a1 = (Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)))) * 180) / Math.PI;
  const a2 = (Math.acos(Math.max(-1, Math.min(1, (L2 * L2 + d * d - L1 * L1) / (2 * L2 * d)))) * 180) / Math.PI;
  const ua = [...pose.ua] as [number, number], fa = [...pose.fa] as [number, number];
  ua[arm] = lerp(pose.ua[arm], phi - a1, amt); fa[arm] = lerp(pose.fa[arm], phi + a2, amt);
  return { ...pose, ua, fa };
};

const CARRY = P(3, 6, [0, 0], [0, 0], [4, 22], [12, 52]);             // can carried in the front hand
const SPRAY = P(-6, -26, [-2, 3], [-2, 2], [8, 128], [16, 146]);       // can raised up to the leaves
const PUZZLE = P(6, 26, [0, 0], [0, 0], [4, 22], [12, 52]);
const KNEEL = P(30, 22, [70, 74], [-100, -96], [12, 40], [24, 62]);    // kneels at the foot of the tree
const POUR = P(34, 26, [70, 74], [-100, -96], [12, 52], [24, 80]);
const HANDS = P(44, 26, [70, 74], [-100, -96], [30, 36], [40, 44]);    // both palms on the soil
const STILL = P(36, 8, [70, 74], [-100, -96], [30, 36], [40, 44]);     // eyes closed, breathing
const ADMIRE = P(-5, -28, [-2, 3], [-2, 2], [10, 26], [18, 34]);

export const soulX = (f: number) => (f < T.step0 ? walkX(f, T.walk0, T.walk1, X0, X1) : walkX(f, T.step0, T.step1, X1, X2));
export const soulPose = (f: number): Pose => {
  const breath = Math.sin((f / 30) * Math.PI * 2 / 3.8);
  const deep = Math.sin(Math.PI * seg01(f, T.breath0, T.breath1));
  const x = soulX(f);
  let p: Pose = walking((Math.abs(x - X0) / STRIDE) * Math.PI * 2, CARRY, walkAmt(f, T.walk0, T.walk1));
  if (f >= T.raise0) p = mix(CARRY, SPRAY, smoother(seg01(f, T.raise0, T.raise1)));
  if (f >= T.spray0) p = { ...p, fa: [p.fa[0], p.fa[1] + 6 * Math.sin((f - T.spray0) / 5)] };
  if (f >= T.lower0) p = mix(SPRAY, PUZZLE, smoother(seg01(f, T.lower0, T.lower1)));
  if (f >= T.step0) p = walking((Math.abs(x - X1) / STRIDE) * Math.PI * 2, PUZZLE, walkAmt(f, T.step0, T.step1));
  if (f >= T.kneel0) p = mix(PUZZLE, KNEEL, smoother(seg01(f, T.kneel0, T.kneel1)));
  if (f >= T.pour0) p = mix(KNEEL, POUR, smoother(seg01(f, T.pour0, T.pour0 + 10)) * (1 - smoother(seg01(f, T.pour1 - 4, T.setCan1))));
  if (f >= T.hands0) {
    p = mix(KNEEL, HANDS, smoother(seg01(f, T.hands0, T.hands1)));
    p = reach(p, x, { x: x + 92, y: GROUND - 2 }, 1, smoother(seg01(f, T.hands0, T.hands1)));
    p = reach(p, x, { x: x + 66, y: GROUND - 2 }, 0, smoother(seg01(f, T.hands0, T.hands1)));
  }
  if (f >= T.breath0) p = { ...mix(p, { ...p, lean: STILL.lean, head: STILL.head }, smoother(seg01(f, T.breath0, T.breath0 + 12))) };
  if (f >= T.stand0) p = mix(p, ADMIRE, smoother(seg01(f, T.stand0, T.stand1)));
  return { ...p, lean: p.lean + 1.4 * breath - 4 * deep, head: p.head + 1.2 * breath - 6 * deep };
};
// the watering can: in the front hand (world point given), tilt in degrees, and whether water flows
export const canTilt = (f: number) => (f < T.spray0 ? 0 : f < T.lower0 ? -38 * smoother(seg01(f, T.spray0, T.spray0 + 8)) * (1 - smoother(seg01(f, T.lower0 - 6, T.lower0)))
  : f < T.pour0 ? 0 : 42 * smoother(seg01(f, T.pour0, T.pour0 + 10)) * (1 - smoother(seg01(f, T.pour1 - 6, T.pour1))));
export const flowing = (f: number) => (f > T.spray0 + 6 && f < T.lower0 - 4) || (f > T.pour0 + 8 && f < T.pour1 - 4);
export const canDown = (f: number) => f >= T.setCan1;

export const moodAt = (f: number) => 0.5 - 0.15 * smoother(seg01(f, T.spray1 - 10, T.puzzle + 10)) - 0.1 * smoother(seg01(f, T.camDown0, T.camDown1)) + 0.15 * smoother(seg01(f, T.wet0, T.wet1)) + 0.55 * smoother(seg01(f, T.breath0, T.bloom0));
export const healAt = (f: number) => 0.34 + 0.1 * smoother(seg01(f, T.wet0, T.wet1)) + 0.56 * smoother(seg01(f, T.grow0, T.bloom1));
export const lightAt = (f: number) => 0.3 + 0.7 * smoother(seg01(f, T.breath0, T.flowSoul1)) * (1 - 0.3 * smoother(seg01(f, T.flowTree1, T.bloom1)));
// tree health 0 → 1, lean in degrees, blossoms
export const treeHealth = (f: number) => 0.12 * smoother(seg01(f, T.wet0, T.wet1)) + 0.88 * smoother(seg01(f, T.green0, T.green1));
export const treeLean = (f: number) => lerp(7, 0, smoother(seg01(f, T.straighten0, T.straighten1)));
export const bloomAt = (f: number) => smoother(seg01(f, T.bloom0, T.bloom1));
export const rootGrow = (f: number) => smoother(seg01(f, T.grow0, T.grow1));
export const rootWet = (f: number) => smoother(seg01(f, T.wet0, T.wet1));
export const ownRoots = (f: number) => smoother(seg01(f, T.ownRoots0, T.ownRoots1));
export const flowSoul = (f: number) => seg01(f, T.flowSoul0, T.flowSoul1);
export const flowTree = (f: number) => seg01(f, T.flowTree0, T.flowTree1);
