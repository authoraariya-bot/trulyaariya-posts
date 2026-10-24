// Rig + choreography for "The Paper Boat" (v2). Frames @30fps, 1080x1920 design space.
export const FPS = 30;
export const END = 570; // 19s
export const GROUND = 1540;
export const SCALE = 1.45;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const sstep = (x: number) => { x = clamp01(x); return x * x * (3 - 2 * x); };
export const smoother = (x: number) => { x = clamp01(x); return x * x * x * (x * (x * 6 - 15) + 10); };
export const seg01 = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---------------- beats
export const T = {
  paperOut: 82, foldStart: 104, foldEnd: 140, kneel: 140, place: 165, wind: 172,
  standA: 186, standB: 214, walkA: 214, walkB: 392, kneel2: 418, bloom: 440, lookUp: 446,
  wipe: 470, card: 488,
};

// ---------------- the soul's journey (world x)
export const WALK_FROM = 330, WALK_TO = 1290;
export const STRIDE = 248; // world px per full gait cycle (two steps)
export const soulX = (f: number) => lerp(WALK_FROM, WALK_TO, smoother(seg01(f, T.walkA, T.walkB)));
// every footfall (half cycle) — used to sync words, flowers and notes
export const STEP_FRAMES: number[] = (() => {
  const out: number[] = [];
  let next = 1;
  for (let f = T.walkA; f <= T.walkB; f++) {
    const d = soulX(f) - WALK_FROM;
    if (d >= next * (STRIDE / 2) - 30) { out.push(f); next++; }
  }
  return out;
})();

// camera follows the soul like a side-scrolling story
export const camX = (f: number) => Math.max(0, soulX(f) - 360) + 60 * sstep(seg01(f, T.walkB, T.wipe));

// ---------------- the paper boat (world coords)
export const streamY = (x: number) => 1592 + 8 * Math.sin(x / 150) + 4 * Math.sin(x / 61);
export const boatPos = (f: number) => {
  if (f < T.place) return null;
  const p = smoother(seg01(f, T.place + 4, T.walkB - 6));
  const x = lerp(418, 1400, p) + 4 * Math.sin(f / 20) * (1 - p);
  const settle = seg01(f, T.walkB - 10, T.walkB + 50);
  const yIn = lerp(1566, streamY(x), smoother(seg01(f, T.place + 4, T.place + 50)));
  const y = yIn + 3 * Math.sin(f / 9);
  return { x, y: lerp(y, 1590 + 2 * Math.sin(f / 14), settle), rot: 4 * Math.sin(f / 13) + 3 * Math.sin(f / 7) * (1 - settle) };
};

// ---------------- poses
export type Pose = {
  lean: number; head: number;
  th: [number, number]; sh: [number, number]; // thigh / shin angles from straight down, + = forward  [back, front]
  ua: [number, number]; fa: [number, number]; // upper arm / forearm
};
const P = (lean: number, head: number, th: [number, number], sh: [number, number], ua: [number, number], fa: [number, number]): Pose => ({ lean, head, th, sh, ua, fa });

export const POSES = {
  sitHug: P(20, 34, [124, 128], [30, 26], [12, 18], [40, 46]),
  sitFold: P(14, 36, [120, 124], [26, 22], [22, 28], [112, 118]),
  kneelPlace: P(52, 30, [70, 74], [-100, -96], [6, 4], [16, 2]),
  stand: P(3, 8, [0, 0], [0, 0], [4, 6], [12, 14]),
  kneelLook: P(34, 40, [70, 74], [-100, -96], [22, 30], [60, 70]),
  lookUp: P(-5, -26, [-2, 3], [-2, 2], [10, 26], [18, 34]),
};

const mix = (a: Pose, b: Pose, t: number): Pose => ({
  lean: lerp(a.lean, b.lean, t), head: lerp(a.head, b.head, t),
  th: [lerp(a.th[0], b.th[0], t), lerp(a.th[1], b.th[1], t)],
  sh: [lerp(a.sh[0], b.sh[0], t), lerp(a.sh[1], b.sh[1], t)],
  ua: [lerp(a.ua[0], b.ua[0], t), lerp(a.ua[1], b.ua[1], t)],
  fa: [lerp(a.fa[0], b.fa[0], t), lerp(a.fa[1], b.fa[1], t)],
});

// smooth, natural gait (phase tied to distance so feet never slide)
const walkPose = (f: number, base: Pose, amt: number): Pose => {
  const ph = ((soulX(f) - WALK_FROM) / STRIDE) * Math.PI * 2;
  const leg = (o: number) => {
    const p = ph + o;
    const th = 23 * Math.cos(p);
    const swing = Math.max(0, -Math.sin(p)); // leg moving forward → knee lifts
    const stance = Math.max(0, Math.sin(p));
    const sh = th - (48 * Math.pow(swing, 1.3) + 7 * stance);
    return [th, sh];
  };
  const [tb, sb] = leg(Math.PI), [tf, sf] = leg(0);
  const armB = -0.75 * tb, armF = -0.75 * tf;
  const w: Pose = {
    lean: base.lean + 2.5 + 1.2 * Math.cos(ph * 2),
    head: base.head - 1.2 * Math.cos(ph * 2) - 3,
    th: [tb, tf], sh: [sb, sf],
    ua: [armB, armF], fa: [armB + 14 + 10 * Math.max(0, Math.sin(ph + Math.PI)), armF + 14 + 10 * Math.max(0, Math.sin(ph))],
  };
  return mix(base, w, amt);
};

export const poseAt = (f: number): Pose => {
  const S = POSES;
  const breath = Math.sin((f / FPS) * Math.PI * 2 / 3.8);
  let p: Pose;
  if (f < 72) p = S.sitHug;
  else if (f < T.foldStart) p = mix(S.sitHug, S.sitFold, smoother(seg01(f, 72, T.foldStart)));
  else if (f < T.kneel) {
    p = { ...S.sitFold };
    const w = Math.sin((f - T.foldStart) / 5.5) * 7; // fingers folding
    p = { ...p, fa: [p.fa[0] + w, p.fa[1] - w] };
  } else if (f < T.place) p = mix(S.sitFold, S.kneelPlace, smoother(seg01(f, T.kneel, T.place)));
  else if (f < T.standA) {
    const push = Math.sin(seg01(f, T.place, T.place + 16) * Math.PI) * 14;
    p = { ...S.kneelPlace, fa: [S.kneelPlace.fa[0], S.kneelPlace.fa[1] - push], ua: [S.kneelPlace.ua[0], S.kneelPlace.ua[1] + push * 0.5] };
  } else if (f < T.walkA) p = mix(S.kneelPlace, S.stand, smoother(seg01(f, T.standA, T.standB)));
  else if (f < T.walkB) {
    const amt = sstep(seg01(f, T.walkA, T.walkA + 22)) * (1 - sstep(seg01(f, T.walkB - 30, T.walkB)));
    p = walkPose(f, S.stand, amt);
  } else if (f < T.lookUp) p = mix(S.stand, S.kneelLook, smoother(seg01(f, T.walkB, T.kneel2)));
  else p = mix(S.kneelLook, S.lookUp, smoother(seg01(f, T.lookUp, T.lookUp + 34)));
  return { ...p, lean: p.lean + 1.4 * breath * (f < 72 ? 1.6 : 1), head: p.head + 1.2 * breath };
};

// ---------------- forward kinematics
const rad = (d: number) => (d * Math.PI) / 180;
type V = { x: number; y: number };
const go = (p: V, ang: number, len: number): V => ({ x: p.x + len * Math.sin(rad(ang)), y: p.y + len * Math.cos(rad(ang)) });
export type Rig = { hip: V; neck: V; head: V; headAng: number; lean: number; legs: { knee: V; foot: V; fa: number }[]; arms: { sh: V; el: V; hand: V }[] };

export const solve = (pose: Pose, x: number, ground = GROUND): Rig => {
  const L1 = 58, L2 = 56;
  const drops = [0, 1].flatMap((i) => {
    const k = L1 * Math.cos(rad(pose.th[i]));
    return [k + 9, k + L2 * Math.cos(rad(pose.sh[i])) + 7];
  });
  drops.push(22); // seat
  const hip = { x, y: ground - Math.max(...drops) };
  const legs = [0, 1].map((i) => {
    const knee = go(hip, pose.th[i], L1);
    return { knee, foot: go(knee, pose.sh[i], L2), fa: pose.sh[i] };
  });
  const neck = go(hip, 180 - pose.lean, 92);
  const ha = pose.lean + pose.head;
  const head = { x: neck.x + 33 * Math.sin(rad(ha)) + 3, y: neck.y - 33 * Math.cos(rad(ha)) };
  const arms = [0, 1].map((i) => {
    const sh = { x: neck.x - 5 * Math.sin(rad(pose.lean)) + (i ? 3 : -2), y: neck.y + 11 };
    const el = go(sh, pose.ua[i], 42);
    return { sh, el, hand: go(el, pose.fa[i], 40) };
  });
  return { hip, neck, head, headAng: ha, lean: pose.lean, legs, arms };
};

// world-space point after the soul's scale (about its ground point)
export const scaled = (p: V, x: number, ground = GROUND): V => ({ x: x + (p.x - x) * SCALE, y: ground + (p.y - ground) * SCALE });

// sitting / kneeling x positions
export const soulWorldX = (f: number) => (f < T.walkA ? WALK_FROM : soulX(f));

// how healed: drives colour, wind, light
export const healAt = (f: number) =>
  0.12 * sstep(seg01(f, T.paperOut, T.place)) + 0.35 * sstep(seg01(f, T.place, T.walkA + 40)) +
  0.38 * sstep(seg01(f, T.walkA + 40, T.walkB)) + 0.15 * sstep(seg01(f, T.walkB, T.bloom + 20));
export const innerLight = (f: number) => 0.25 + 0.75 * healAt(f) - 0.18 * Math.sin(Math.PI * seg01(f, T.paperOut - 8, T.foldStart));
