// Reel 7: "Their opinion isn't your destiny. Turn back and enjoy your music."
// A grey soul rants in angry scribble-bubbles; our soul tucks its earphones in, turns its back and walks off to its own music.
import { lerp, seg01, smoother, sstep, solve, Pose, POSES } from "../master/pose";

export const END = 640;
export const STRIDE = 248;
export const T = {
  in0: 24, in1: 70, rant0: 76, rant1: 330, sink0: 110, sink1: 200,
  look0: 240, look1: 254, grab0: 256, grab1: 266, lift0: 266, lift1: 286, tuck: 290, click: 296, settle1: 312,
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
// how we see the soul: side (facing the grey soul) → turns to face us to put the earphones in → side, walking away
export const F0 = 242, F1 = 254;
export const view = (f: number) => {
  if (f < F0) return { front: false, sx: 1, dir: 1 };
  if (f < F1) { const u = smoother(seg01(f, F0, F1)); return u < 0.5 ? { front: false, sx: Math.cos(Math.PI * u), dir: 1 } : { front: true, sx: -Math.cos(Math.PI * u), dir: 1 }; }
  if (f < T.turn0) return { front: true, sx: 1, dir: 1 };
  if (f < T.turn1) { const u = smoother(seg01(f, T.turn0, T.turn1)); return u < 0.5 ? { front: true, sx: Math.cos(Math.PI * u), dir: 1 } : { front: false, sx: -Math.cos(Math.PI * u), dir: -1 }; }
  return { front: false, sx: 1, dir: -1 };
};
export const soulDir = (f: number) => view(f).dir * view(f).sx;

const S = POSES.stand;
// side view: the player rests in the front hand, arm relaxed down by its side
const CALM = P(2, 4, [0, 0], [0, 0], [4, 8], [12, 30]);
const SINK = P(8, 24, [0, 1], [0, 0], [3, 6], [8, 22]);
const LOOK = P(-2, -6, [0, 0], [0, 0], [4, 8], [12, 30]);
const GROOVE = P(-3, -10, [0, 0], [0, 0], [10, 10], [22, 30]);

type V = { x: number; y: number };
const rot = (v: V, deg: number): V => { const a = (deg * Math.PI) / 180; return { x: v.x * Math.cos(a) - v.y * Math.sin(a), y: v.x * Math.sin(a) + v.y * Math.cos(a) }; };
const add = (a: V, b: V): V => ({ x: a.x + b.x, y: a.y + b.y });
const lp = (a: V, b: V, t: number): V => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

export const soulBase = (f: number): Pose => {
  const breath = Math.sin((f / 30) * Math.PI * 2 / 3.8);
  const x = soulX(f);
  let p: Pose = mix(S, CALM, smoother(seg01(f, 0, 20)));
  if (f >= T.sink0) p = mix(CALM, SINK, smoother(seg01(f, T.sink0, T.sink1)));
  if (f >= T.look0) p = mix(SINK, LOOK, smoother(seg01(f, T.look0, T.look1)));
  if (f >= T.turn0) p = mix(LOOK, GROOVE, smoother(seg01(f, T.turn0, T.walk0 + 20)));
  if (f >= T.walk0) p = walking((Math.abs(x - AX0) / STRIDE) * Math.PI * 2, GROOVE, walkAmt(f, T.walk0, T.walk1), 1);
  if (f >= T.groove) { const g = smoother(seg01(f, T.groove, T.groove + 14)), b = Math.sin(((f - T.groove) / 22) * Math.PI * 2); p = { ...p, head: p.head + 7 * g * b, lean: p.lean + 3 * g * b, ua: [p.ua[0] - 10 * g * b, p.ua[1]] }; }
  // the front hand keeps the player low by its side (a gentle sway while walking)
  p = { ...p, ua: [p.ua[0], 8 + 4 * Math.sin(f / 10)], fa: [p.fa[0], 30 + 3 * Math.sin(f / 10)] };
  return { ...p, lean: p.lean + 1.4 * breath, head: p.head + 1.2 * breath };
};
export const soulPose = soulBase;
// side-view earphones: dangling from the player before, the near bud in the ear after
export const sideEar = (r: ReturnType<typeof solve>, worn: boolean) => {
  const player = add(r.arms[1].hand, { x: 3, y: 10 });
  const jack = add(player, { x: 0, y: -17 });
  if (!worn) { const split = add(jack, { x: 6, y: 24 }); return { player, jack, split, bud1: add(split, { x: 9, y: 18 }), bud2: add(split, { x: -3, y: 22 }), hide2: false }; }
  const ear = add(r.head, rot({ x: -10, y: 6 }, r.headAng));
  return { player, jack, split: add(r.neck, { x: 18, y: 50 }), bud1: ear, bud2: add(r.neck, { x: -20, y: 8 }), hide2: true };
};

// front view rig (local space, same scale as the side rig): both hands put a bud in each ear
export const frontRig = (f: number, x: number, G = 1540) => {
  const breath = Math.sin((f / 30) * Math.PI * 2 / 3.8);
  const hip = { x, y: G - 121 }, neck = { x, y: hip.y - 92 + 1.2 * breath }, head = { x, y: neck.y - 33 };
  const earR = { x: x - 33, y: head.y + 6 }, earL = { x: x + 33, y: head.y + 6 }; // R = its right (our left)
  const g0 = smoother(seg01(f, T.grab0, T.grab1)), l = smoother(seg01(f, T.lift0, T.lift1)), dn = smoother(seg01(f, T.click, T.settle1));
  const push = Math.sin(Math.PI * seg01(f, T.tuck - 4, T.tuck + 6));
  const restR = { x: x - 44, y: hip.y + 4 }, restL = { x: x + 44, y: hip.y + 4 };
  const gatherR = { x: x + 8, y: hip.y - 10 }, gatherL = { x: x + 26, y: hip.y - 4 };
  const atR = { x: earR.x - 6 + 3 * push, y: earR.y + 14 }, atL = { x: earL.x + 6 - 3 * push, y: earL.y + 14 };
  let hR = lp(lp(restR, gatherR, g0), atR, l), hL = lp(lp(restL, gatherL, g0), atL, l);
  hR = { x: hR.x - 14 * Math.sin(Math.PI * l), y: hR.y }; hL = { x: hL.x + 14 * Math.sin(Math.PI * l), y: hL.y }; // hands travel out and up, not across the face
  hR = lp(hR, restR, dn); hL = lp(hL, restL, dn);
  const shR = { x: x - 27, y: neck.y + 13 }, shL = { x: x + 27, y: neck.y + 13 };
  const arm = (sh: V, hand: V, out: number) => {
    const L1 = 42, L2 = 40, dx = hand.x - sh.x, dy = hand.y - sh.y, d = Math.max(10, Math.min(L1 + L2 - 0.5, Math.hypot(dx, dy)));
    const a = Math.atan2(dy, dx), k = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    // elbow bends outward, away from the body
    const c1 = { x: sh.x + L1 * Math.cos(a + k), y: sh.y + L1 * Math.sin(a + k) }, c2 = { x: sh.x + L1 * Math.cos(a - k), y: sh.y + L1 * Math.sin(a - k) };
    const el = (c1.x - x) * out > (c2.x - x) * out ? c1 : c2; // the elbow that sits further out from the body
    const hd = { x: sh.x + d * Math.cos(a), y: sh.y + d * Math.sin(a) };
    return { sh, el, hand: hd };
  };
  const aR = arm(shR, hR, -1), aL = arm(shL, hL, 1);
  // earphones: the player stays in its left hand; the buds go from the hands to the ears
  const player = add(aL.hand, { x: 4, y: 12 }), jack = add(player, { x: 0, y: -17 });
  const worn = smoother(seg01(f, T.lift1 - 2, T.tuck + 2));
  const budR = lp(f < T.grab1 - 4 ? add(jack, { x: -10, y: 40 }) : add(aR.hand, { x: 5, y: -12 }), earR, worn);
  const budL = lp(f < T.grab1 - 4 ? add(jack, { x: 6, y: 44 }) : add(aL.hand, { x: -5, y: -12 }), earL, worn);
  const split = lp(add(jack, { x: -2, y: 28 }), { x: x + 4, y: neck.y + 52 }, l);
  return { hip, neck, head, aR, aL, player, jack, split, budR, budL, earR, earL };
};
export const soulHop = (f: number) => (f > T.walk0 && f < T.walk1 ? 9 * walkAmt(f, T.walk0, T.walk1) * Math.abs(Math.sin((Math.abs(soulX(f) - AX0) / STRIDE) * Math.PI * 2)) : 0);
export const moodAt = (f: number) => 0.45 - 0.28 * smoother(seg01(f, T.sink0, T.sink1)) + 0.15 * smoother(seg01(f, T.look0, T.lift1)) + 0.65 * smoother(seg01(f, T.click, T.walk0 + 40));
export const healAt = (f: number) => 0.42 - 0.12 * smoother(seg01(f, T.sink0, T.sink1)) + 0.7 * smoother(seg01(f, T.click, T.walk1 - 40));
export const lightAt = (f: number) => 0.35 - 0.15 * smoother(seg01(f, T.sink0, T.sink1)) + 0.8 * smoother(seg01(f, T.click, T.walk1 - 40));
// muffle 0 → 1 once the earphones are in
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
