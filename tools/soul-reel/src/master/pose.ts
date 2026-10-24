// Rig + choreography for "The Paper Boat" (v2). Frames @30fps, 1080x1920 design space.
export const FPS = 30;
export const END = 615; // 20.5s
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
  standA: 186, standB: 214, walkA: 214, skipA: 318, skipB: 352, walkB: 440, kneel2: 466, bloom: 488, lookUp: 494,
  wipe: 518, card: 536,
};

// ---------------- the soul's journey (world x)
export const WALK_FROM = 330, WALK_TO = 1840;
export const STRIDE = 248; // walk: world px per gait cycle
export const SKIP_STRIDE = 330; // skip: longer, bouncier
// skipping amount (0 walk → 1 playful skip)
export const skipAmt = (f: number) => smoother(seg01(f, T.skipA, T.skipB)) * (1 - smoother(seg01(f, T.walkB - 34, T.walkB - 8)));
const speed = (f: number) => {
  const go = smoother(seg01(f, T.walkA, T.walkA + 30)) * (1 - smoother(seg01(f, T.walkB - 34, T.walkB)));
  return go * (1 + 1.55 * skipAmt(f));
};
const N = 700;
const XS: number[] = [], PH: number[] = [];
(() => {
  let x = 0, ph = 0;
  const raw: number[] = [];
  for (let f = 0; f < N; f++) { raw.push(f >= T.walkA ? speed(f) : 0); }
  const total = raw.reduce((a, v) => a + v, 0);
  const k = (WALK_TO - WALK_FROM) / total;
  for (let f = 0; f < N; f++) {
    const dx = raw[f] * k;
    const stride = lerp(STRIDE, SKIP_STRIDE, skipAmt(f));
    x += dx; ph += (dx / stride) * Math.PI * 2;
    XS.push(WALK_FROM + x); PH.push(ph);
  }
})();
const at = (arr: number[], f: number) => { const i = Math.max(0, Math.min(N - 2, Math.floor(f))); const u = f - i; return arr[i] * (1 - u) + arr[i + 1] * u; };
export const soulX = (f: number) => (f < T.walkA ? WALK_FROM : at(XS, f));
export const gaitPhase = (f: number) => (f < T.walkA ? 0 : at(PH, f));
// every footfall (each half cycle)
export const STEP_FRAMES: number[] = (() => {
  const out: number[] = [];
  let next = 1;
  for (let f = T.walkA; f <= T.walkB; f++) if (gaitPhase(f) >= next * Math.PI - 0.6) { out.push(f); next++; }
  return out;
})();

// camera follows the soul like a side-scrolling story
export const camX = (f: number) => Math.max(0, soulX(f) - 360) + 60 * sstep(seg01(f, T.walkB, T.wipe));

// ---------------- the paper boat (world coords)
export const streamY = (x: number) => 1590 + 9 * Math.sin(x / 170) + 4 * Math.sin(x / 61);
export const POOL_X = 2010, TREE_X = 2130;
export const boatPos = (f: number) => {
  if (f < T.place) return null;
  const p = smoother(seg01(f, T.place + 4, T.walkB - 6));
  const x = lerp(418, 1910, p) + 4 * Math.sin(f / 20) * (1 - p);
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
  const ph = gaitPhase(f);
  const sk = skipAmt(f);
  const leg = (o: number) => {
    const p = ph + o;
    const swing = Math.max(0, -Math.sin(p)); // leg moving forward → knee lifts
    const stance = Math.max(0, Math.sin(p));
    const th = lerp(23, 30, sk) * Math.cos(p) + sk * 58 * Math.pow(swing, 1.2);  // skipping: knee lifts high
    const sh = th - (lerp(48, 92, sk) * Math.pow(swing, 1.3) + 7 * stance);
    return [th, sh];
  };
  const [tb, sb] = leg(Math.PI), [tf, sf] = leg(0);
  const armB = -lerp(0.75, 1.9, sk) * tb + sk * 26, armF = -lerp(0.75, 1.9, sk) * tf + sk * 26;
  const w: Pose = {
    lean: base.lean + 2.5 + 1.2 * Math.cos(ph * 2) - sk * 5,
    head: base.head - 1.2 * Math.cos(ph * 2) - 3 - sk * 14,
    th: [tb, tf], sh: [sb, sf],
    ua: [armB, armF], fa: [armB + 14 + lerp(10, 40, sk) * Math.max(0, Math.sin(ph + Math.PI)), armF + 14 + lerp(10, 40, sk) * Math.max(0, Math.sin(ph))],
  };
  return mix(base, w, amt);
};
// little hop while skipping (local px, before SCALE)
export const hopAt = (f: number) => (f < T.walkA ? 0 : 27 * skipAmt(f) * Math.pow(Math.abs(Math.sin(gaitPhase(f))), 0.8));

// how the face feels: 0 sad → 0.5 hopeful → 1 joyful
export const moodAt = (f: number) =>
  0.22 * smoother(seg01(f, T.paperOut, T.foldEnd)) + 0.2 * smoother(seg01(f, T.place, T.standB)) +
  0.1 * smoother(seg01(f, T.walkA, T.skipA)) + 0.48 * smoother(seg01(f, T.skipA - 10, T.skipB));
// overthinking scribble above the head: present in the silence, unravels in the wind
export const thoughtAt = (f: number) => 1 - smoother(seg01(f, T.wind, T.wind + 40));

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

export const solve = (pose: Pose, x: number, ground = GROUND, hop = 0): Rig => {
  const L1 = 58, L2 = 56;
  const drops = [0, 1].flatMap((i) => {
    const k = L1 * Math.cos(rad(pose.th[i]));
    return [k + 9, k + L2 * Math.cos(rad(pose.sh[i])) + 7];
  });
  drops.push(22); // seat
  const hip = { x, y: ground - Math.max(...drops) - hop };
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
  0.12 * sstep(seg01(f, T.paperOut, T.place)) + 0.3 * sstep(seg01(f, T.place, T.walkA + 40)) +
  0.4 * sstep(seg01(f, T.walkA + 40, T.walkB)) + 0.18 * sstep(seg01(f, T.walkB, T.bloom + 20));
// the river turns from blue to glowing gold as the soul heals
export const goldAt = (f: number) => sstep(seg01(f, T.skipA - 30, T.walkB + 20));
export const innerLight = (f: number) => 0.25 + 0.75 * healAt(f) - 0.18 * Math.sin(Math.PI * seg01(f, T.paperOut - 8, T.foldStart));
