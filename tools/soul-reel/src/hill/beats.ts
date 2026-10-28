// Reel 9: "Some understand you in a moment. For others, a lifetime isn't enough."
// Seen from behind on a hill: our soul sits low; a friend comes from the left, sits, bumps its shoulder;
// a grey soul comes from the right, sits, rants, storms off; the friend stays, hand on the shoulder, both look ahead.
import { clamp01, lerp, seg01, smoother, sstep, Pose, POSES } from "../master/pose";

export const END = 640;
export const STRIDE = 248;
export const SEAT = 1556;              // the hilltop line they sit on / walk along
export const OX = 540, FX = 396, GX = 688;
export const T = {
  fIn0: 46, fIn1: 108, fTurn0: 108, fTurn1: 120, fSit0: 120, fSit1: 140,
  bump0: 150, bump1: 172, lift0: 158, lift1: 190, text1: 152,
  gIn0: 196, gIn1: 244, gTurn0: 244, gTurn1: 254, gSit0: 254, gSit1: 266,
  rant0: 270, rant1: 356, sink0: 282, sink1: 312, text2: 292,
  gUp0: 356, gUp1: 372, gTurnOut0: 372, gTurnOut1: 382, gOut0: 382, gOut1: 440,
  hand0: 398, hand1: 428, up0: 420, up1: 452, lean0: 432, lean1: 462,
  wipe: 548, card: 566,
};
export const walkAmt = (f: number, a: number, b: number) => sstep(seg01(f, a, a + 12)) * (1 - sstep(seg01(f, b - 12, b)));
export const walkX = (f: number, a: number, b: number, x0: number, x1: number) => lerp(x0, x1, smoother(seg01(f, a, b)));
export const mix = (p: Pose, q: Pose, t: number): Pose => ({
  lean: lerp(p.lean, q.lean, t), head: lerp(p.head, q.head, t),
  th: [lerp(p.th[0], q.th[0], t), lerp(p.th[1], q.th[1], t)], sh: [lerp(p.sh[0], q.sh[0], t), lerp(p.sh[1], q.sh[1], t)],
  ua: [lerp(p.ua[0], q.ua[0], t), lerp(p.ua[1], q.ua[1], t)], fa: [lerp(p.fa[0], q.fa[0], t), lerp(p.fa[1], q.fa[1], t)],
});
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
export const STAND = POSES.stand;
const STOMP = { ...POSES.stand, lean: 10, head: 6 };

// ---- how each soul is seen: side view while walking, back view while sitting (a quick squash-turn between)
type View = { back: boolean; sx: number; dir: number };
const turn = (f: number, a: number, b: number, fromBack: boolean, dir: number): View => {
  const u = smoother(seg01(f, a, b));
  if (u < 0.5) return { back: fromBack, sx: Math.cos(Math.PI * u), dir };
  return { back: !fromBack, sx: -Math.cos(Math.PI * u), dir };
};
export const friendView = (f: number): View => (f < T.fTurn0 ? { back: false, sx: 1, dir: 1 } : f < T.fTurn1 ? turn(f, T.fTurn0, T.fTurn1, false, 1) : { back: true, sx: 1, dir: 1 });
export const greyView = (f: number): View =>
  f < T.gTurn0 ? { back: false, sx: 1, dir: -1 } : f < T.gTurn1 ? turn(f, T.gTurn0, T.gTurn1, false, -1)
  : f < T.gTurnOut0 ? { back: true, sx: 1, dir: 1 } : f < T.gTurnOut1 ? turn(f, T.gTurnOut0, T.gTurnOut1, true, 1) : { back: false, sx: 1, dir: 1 };
export const friendX = (f: number) => walkX(f, T.fIn0, T.fIn1, -140, FX);
export const greyX = (f: number) => (f < T.gOut0 ? walkX(f, T.gIn0, T.gIn1, 1240, GX) : walkX(f, T.gOut0, T.gOut1, GX, 1280));
export const friendSide = (f: number): Pose => walking((Math.abs(friendX(f) + 140) / STRIDE) * Math.PI * 2, STAND, walkAmt(f, T.fIn0, T.fIn1));
export const greySide = (f: number): Pose => f < T.gOut0
  ? walking((Math.abs(1240 - greyX(f)) / (STRIDE * 0.85)) * Math.PI * 2, STOMP, walkAmt(f, T.gIn0, T.gIn1))
  : walking((Math.abs(greyX(f) - GX) / (STRIDE * 0.85)) * Math.PI * 2, STOMP, walkAmt(f, T.gOut0, T.gOut1));

// ---- back-view rig (local space, same scale as the side rig; x = centre of the body)
type V = { x: number; y: number };
export type BackRig = { hip: V; neck: V; head: V; neck0: V; head0: V; tilt: number; arms: { sh: V; el: V; hand: V }[]; stand: number; G: number };
const rotAbout = (p: V, c: V, deg: number): V => { const a = (deg * Math.PI) / 180, dx = p.x - c.x, dy = p.y - c.y; return { x: c.x + dx * Math.cos(a) - dy * Math.sin(a), y: c.y + dx * Math.sin(a) + dy * Math.cos(a) }; };
const arm = (sh: V, hand: V, side: number, preferDown = false) => {
  const L1 = 42, L2 = 40, dx = hand.x - sh.x, dy = hand.y - sh.y, d = Math.max(10, Math.min(L1 + L2 - 0.5, Math.hypot(dx, dy)));
  const a = Math.atan2(dy, dx), k = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const c1 = { x: sh.x + L1 * Math.cos(a + k), y: sh.y + L1 * Math.sin(a + k) }, c2 = { x: sh.x + L1 * Math.cos(a - k), y: sh.y + L1 * Math.sin(a - k) };
  const el = preferDown ? (c1.y > c2.y ? c1 : c2) : ((c1.x - sh.x) * side > (c2.x - sh.x) * side ? c1 : c2); // elbows out to the side (or down when reaching across)
  return { sh, el, hand: { x: sh.x + d * Math.cos(a), y: sh.y + d * Math.sin(a) } };
};
// hands: optional world-independent local targets [right side (−x), left side (+x)]; across = which arm reaches across
export const backRig = (x: number, G: number, o: { stand: number; droop: number; tilt: number; hands?: (V | null)[]; across?: number; breath: number }): BackRig => {
  const hip = { x, y: lerp(G - 20, G - 121, o.stand) };
  const neck0 = { x, y: hip.y - 92 + 6 * o.droop + 1.2 * o.breath };
  const head0 = { x, y: neck0.y - 33 + 26 * o.droop };
  const neck = rotAbout(neck0, hip, o.tilt), head = rotAbout(head0, hip, o.tilt * 1.15);
  const sh = [-1, 1].map((s) => rotAbout({ x: x + 27 * s, y: neck0.y + 13 + 3 * o.droop }, hip, o.tilt));
  const rest = [-1, 1].map((s) => (o.stand > 0.5 ? { x: x + 40 * s, y: hip.y + 34 } : { x: x + 48 * s, y: G - 8 }));
  const arms = [0, 1].map((i) => {
    const tgt = o.hands?.[i] ?? rest[i];
    return arm(sh[i], tgt, i ? 1 : -1, o.across === i);
  });
  return { hip, neck, head, neck0, head0, tilt: o.tilt, arms, stand: o.stand, G };
};

// ---- our soul (always sitting, seen from behind)
export const ourDroop = (f: number) => 1 - 0.45 * smoother(seg01(f, T.lift0, T.lift1)) + 0.45 * smoother(seg01(f, T.sink0, T.sink1)) - 1.25 * smoother(seg01(f, T.up0, T.up1));
export const ourTilt = (f: number) => 4 * Math.sin(Math.PI * seg01(f, T.bump0 + 6, T.bump1 + 8)) - 6 * smoother(seg01(f, T.lean0, T.lean1));
// ---- the friend
export const friendStand = (f: number) => 1 - smoother(seg01(f, T.fSit0, T.fSit1));
export const friendTilt = (f: number) => 10 * Math.sin(Math.PI * seg01(f, T.bump0, T.bump1)) + 3 * smoother(seg01(f, T.hand0, T.hand1));
// ---- the grey soul
export const greyStand = (f: number) => (f < T.gUp0 ? 1 - smoother(seg01(f, T.gSit0, T.gSit1)) : smoother(seg01(f, T.gUp0, T.gUp1)));
export const greyBounce = (f: number) => 8 * Math.sin(Math.PI * seg01(f, T.gSit1 - 2, T.gSit1 + 8));
export const ranting = (f: number) => smoother(seg01(f, T.rant0, T.rant0 + 10)) * (1 - smoother(seg01(f, T.rant1 - 8, T.rant1)));

export const healAt = (f: number) => 0.34 + 0.12 * smoother(seg01(f, T.lift0, T.lift1)) - 0.1 * smoother(seg01(f, T.sink0, T.sink1)) + 0.64 * smoother(seg01(f, T.hand0, T.lean1 + 20));
export const glowOur = (f: number) => clamp01(0.2 + 0.25 * smoother(seg01(f, T.lift0, T.lift1)) - 0.2 * smoother(seg01(f, T.sink0, T.sink1)) + 0.8 * smoother(seg01(f, T.hand0, T.lean1)));
export const glowFriend = (f: number) => 0.55 + 0.45 * smoother(seg01(f, T.hand0, T.lean1));
export const BUBBLES = Array.from({ length: 9 }, (_, i) => ({ t0: T.rant0 + 4 + i * 9, kind: i % 4, sym: ["#@!%", "&*!?", "!!#", "%$#@"][i % 4] }));
