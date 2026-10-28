// Reel 6: "Your life is a blackboard. Make sure only you hold the chalk."
// The soul doodles; shadow figures scribble over it; it wipes the board clean, keeps its chalk, and draws its own world.
import { clamp01, GROUND, lerp, seg01, smoother, solve, sstep, Pose, POSES, SCALE } from "../master/pose";

export const END = 700;
export const STRIDE = 248;
export const T = {
  sun0: 10, sun1: 40, flo0: 44, flo1: 70, smi0: 74, smi1: 100,
  s1in0: 84, s1in1: 136, notice: 112, back0: 126, back1: 156,
  x1a: 144, x1b: 158, x2a: 160, x2b: 174, should0: 178, should1: 204, s1out0: 212, s1out1: 262,
  s2in0: 178, s2in1: 228, ne0: 234, nem: 263, ne1: 292, s2out0: 300, s2out1: 350,
  board: 212, breath0: 276, breath1: 300,
  go0: 298, go1: 324, grab: 330,
  w1a: 340, w1b: 362, m1a: 362, m1b: 378, w2a: 380, w2b: 402, m2a: 402, m2b: 418, w3a: 420, w3b: 442, drop: 446,
  s3in0: 428, s3in1: 468, ask0: 468, ask1: 482, keep0: 482, keep1: 496, shake0: 486, shake1: 512, s3fade0: 508, s3fade1: 540,
  heart0: 522, heart1: 548, magic0: 540, magic1: 600, chalk: 516,
  admire0: 596, admire1: 616,
  wipe: 608, card: 626,
};
// soul x: draws at 340, steps back to 190, walks to 345, 475, 605 while wiping
export const XD = 340, XB = 190, XW = [345, 475, 640];
export const S1X = 560, S2X = 760, S3X = 860;
export const BOARD = { x0: 110, x1: 970, y0: 960, y1: 1404 };
const G = GROUND;

export const walkAmt = (f: number, a: number, b: number) => sstep(seg01(f, a, a + 12)) * (1 - sstep(seg01(f, b - 12, b)));
export const walkX = (f: number, a: number, b: number, x0: number, x1: number) => lerp(x0, x1, smoother(seg01(f, a, b)));
export const mix = (p: Pose, q: Pose, t: number): Pose => ({
  lean: lerp(p.lean, q.lean, t), head: lerp(p.head, q.head, t),
  th: [lerp(p.th[0], q.th[0], t), lerp(p.th[1], q.th[1], t)], sh: [lerp(p.sh[0], q.sh[0], t), lerp(p.sh[1], q.sh[1], t)],
  ua: [lerp(p.ua[0], q.ua[0], t), lerp(p.ua[1], q.ua[1], t)], fa: [lerp(p.fa[0], q.fa[0], t), lerp(p.fa[1], q.fa[1], t)],
});
const P = (lean: number, head: number, th: [number, number], sh: [number, number], ua: [number, number], fa: [number, number]): Pose => ({ lean, head, th, sh, ua, fa });
export const walking = (ph: number, base: Pose, amt: number, back = false): Pose => {
  const leg = (o: number) => {
    const p = ph * (back ? -1 : 1) + o, swing = Math.max(0, -Math.sin(p)), stance = Math.max(0, Math.sin(p));
    const th = 23 * Math.cos(p);
    return [th, th - (48 * Math.pow(swing, 1.3) + 7 * stance)];
  };
  const [tb, sb] = leg(Math.PI), [tf, sf] = leg(0);
  const ab = -0.75 * tb, af = -0.75 * tf;
  const w: Pose = { lean: base.lean + 2.5 + 1.2 * Math.cos(ph * 2), head: base.head - 1.2 * Math.cos(ph * 2) - 3, th: [tb, tf], sh: [sb, sf],
    ua: [ab, af], fa: [ab + 14 + 10 * Math.max(0, Math.sin(ph + Math.PI)), af + 14 + 10 * Math.max(0, Math.sin(ph))] };
  return mix(base, w, amt);
};
const phOf = (dx: number) => (Math.abs(dx) / STRIDE) * Math.PI * 2;

// --- two-bone IK for the front arm: put the hand on a world point (dir 1 = faces right, −1 = faces left)
export const reach = (pose: Pose, x: number, target: { x: number; y: number }, dir = 1, amt = 1): Pose => {
  if (amt <= 0) return pose;
  const r = solve(pose, x), sh = r.arms[1].sh;
  const tl = { x: x + ((target.x - x) / SCALE) * dir, y: G + (target.y - G) / SCALE };
  const L1 = 42, L2 = 40;
  let dx = tl.x - sh.x, dy = tl.y - sh.y;
  let d = Math.hypot(dx, dy);
  const dc = Math.max(8, Math.min(L1 + L2 - 0.5, d));
  if (d < 1e-3) { dx = 0; dy = 1; d = 1; }
  const phi = (Math.atan2(dx, dy) * 180) / Math.PI;
  const a1 = (Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + dc * dc - L2 * L2) / (2 * L1 * dc)))) * 180) / Math.PI;
  const a2 = (Math.acos(Math.max(-1, Math.min(1, (L2 * L2 + dc * dc - L1 * L1) / (2 * L2 * dc)))) * 180) / Math.PI;
  const ua = phi - a1, fa = phi + a2; // elbow hangs below the line, like a real arm
  return { ...pose, ua: [pose.ua[0], lerp(pose.ua[1], ua, amt)], fa: [pose.fa[0], lerp(pose.fa[1], fa, amt)] };
};

// --- chalk strokes (world polylines). Each doodle reveals along its length.
type Pt = [number, number];
const circle = (cx: number, cy: number, r: number, n = 26, a0 = -Math.PI / 2, wob = 0): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (i / n) * Math.PI * 2; const rr = r * (1 + wob * Math.sin(i * 1.7)); return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)] as Pt; });
const len = (pts: Pt[]) => pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
export const partial = (pts: Pt[], p: number): Pt[] => {
  if (p <= 0) return [];
  const L = len(pts) * clamp01(p); let acc = 0; const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + s >= L) { const u = (L - acc) / s; out.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); return out; }
    acc += s; out.push(pts[i]);
  }
  return out;
};
// a doodle = list of strokes revealed one after another over [a, b]
export type Doodle = { strokes: Pt[][]; a: number; b: number; color: string; w: number };
export const progress = (d: Doodle, f: number) => {
  const total = d.strokes.reduce((s, k) => s + len(k), 0), L = total * smoother(seg01(f, d.a, d.b));
  let acc = 0; const shown: Pt[][] = []; let tip: Pt | null = null;
  for (const k of d.strokes) { const l = len(k); if (L <= acc) break; const q = clamp01((L - acc) / l); const part = partial(k, q); shown.push(part); tip = part[part.length - 1]; acc += l; }
  return { shown, tip, drawing: f > d.a && f < d.b };
};
const rays = (cx: number, cy: number, r0: number, r1: number, n: number): Pt[][] =>
  Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return [[cx + r0 * Math.cos(a), cy + r0 * Math.sin(a)], [cx + r1 * Math.cos(a), cy + r1 * Math.sin(a)]] as Pt[]; });
const petals = (cx: number, cy: number, r: number): Pt[] => {
  const pts: Pt[] = []; for (let i = 0; i <= 60; i++) { const a = (i / 60) * Math.PI * 2; const rr = r * (0.55 + 0.45 * Math.abs(Math.sin(a * 2.5))); pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]); } return pts;
};
const CH = "#F7F4EA";
// the soul's first little doodles (within its reach from x = 340)
export const DOODLES: Doodle[] = [
  { strokes: [circle(420, 1200, 22, 26, -Math.PI / 2, 0.04), ...rays(420, 1200, 30, 42, 8)], a: T.sun0, b: T.sun1, color: "#FBE7A6", w: 5 },
  { strokes: [[[416, 1330], [418, 1300], [416, 1276]], petals(416, 1266, 15)], a: T.flo0, b: T.flo1, color: CH, w: 5 },
  { strokes: [circle(452, 1260, 18), [[445, 1255], [445, 1256]], [[459, 1255], [459, 1256]], [[443, 1266], [452, 1272], [461, 1266]]], a: T.smi0, b: T.smi1, color: CH, w: 4.5 },
];
// the shadows' marks: a big cross over the doodles, "should", "not enough"
const zig = (x0: number, y0: number, x1: number, y1: number, n: number, amp: number): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [lerp(x0, x1, u) + amp * Math.sin(i * 2.1), lerp(y0, y1, u) + amp * Math.cos(i * 1.7)] as Pt; });
export const CROSS: Doodle[] = [
  { strokes: [zig(390, 1170, 480, 1320, 10, 4)], a: T.x1a, b: T.x1b, color: CH, w: 7 },
  { strokes: [zig(480, 1176, 392, 1322, 10, 4)], a: T.x2a, b: T.x2b, color: CH, w: 7 },
];
export const SHOULD = { x: 372, y: 1360, w: 250, a: T.should0, b: T.should1 };
export const NOTENOUGH = { x: 500, y: 1196, w: 380, a: T.ne0, b: T.nem };
export const NOTWORTH = { x: 500, y: 1262, w: 400, a: T.nem + 2, b: T.ne1 };
// the soul's own picture, redrawn big: a heart by its hand, then the whole board blooms
export const HEART: Doodle = {
  strokes: [[...Array.from({ length: 41 }, (_, i) => { const t = (i / 40) * Math.PI * 2; return [690 + 1.6 * 16 * Math.pow(Math.sin(t), 3), 1268 - 1.6 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))] as Pt; })]],
  a: T.heart0, b: T.heart1, color: "#F6B9B4", w: 6,
};
export const MAGIC: Doodle[] = [
  { strokes: [circle(250, 1060, 46, 30), ...rays(250, 1060, 60, 84, 10)], a: T.magic0, b: T.magic0 + 26, color: "#FBE29A", w: 6 },
  { strokes: [zig(140, 1250, 560, 1180, 16, 0).map(([x, y]) => [x, y + 26 * Math.sin((x - 140) / 70)] as Pt), zig(520, 1200, 950, 1240, 16, 0).map(([x, y]) => [x, y + 22 * Math.sin((x - 520) / 80 + 1)] as Pt)], a: T.magic0 + 8, b: T.magic0 + 40, color: "#C9EAB6", w: 6 },
  { strokes: [[[300, 1390], [380, 1330], [470, 1290], [560, 1262]], [[420, 1390], [470, 1340], [530, 1300], [580, 1266]]], a: T.magic0 + 16, b: T.magic0 + 44, color: CH, w: 5 },
  { strokes: [petals(170, 1340, 16), petals(860, 1320, 18), petals(780, 1110, 14), petals(150, 1150, 12), circle(600, 1060, 10, 12), circle(880, 1020, 7, 10)], a: T.magic0 + 24, b: T.magic0 + 58, color: "#F7B7C0", w: 5 },
  { strokes: [[[820, 1060], [835, 1052], [850, 1060], [865, 1052], [880, 1060]], [[700, 1000], [712, 993], [724, 1000], [736, 993], [748, 1000]]], a: T.magic0 + 30, b: T.magic0 + 56, color: CH, w: 4 },
];

// --- wiping: hand path (world) for each stroke k
export const WIPES = [[T.w1a, T.w1b], [T.w2a, T.w2b], [T.w3a, T.w3b]] as const;
export const wipeHand = (k: number, f: number) => {
  const u = seg01(f, WIPES[k][0], WIPES[k][1]), th = u * Math.PI * 3;
  return { x: XW[k] + (k === 2 ? 120 : 92) + 38 * Math.cos(th), y: 1230 + 70 * Math.sin(u * Math.PI * 2 - Math.PI / 2) + 14 * Math.sin(th * 2) };
};
export const DUSTER_REST = { x: 432, y: 1396 };

// --- soul
const S = POSES.stand;
const DRAW = P(6, 10, [0, 0], [0, 0], [4, 40], [12, 80]);
const DROOP = P(10, 30, [0, 2], [0, 0], [2, 3], [6, 8]);
const BREATH = P(-5, -8, [0, 0], [0, 0], [10, 14], [20, 26]);
const WIPE = P(8, 6, [0, 0], [0, 0], [4, 60], [12, 90]);
const KEEP = P(-2, 10, [0, 0], [0, 0], [6, 30], [14, 150]);
const ADMIRE = P(-4, -20, [0, 0], [0, 0], [10, 22], [20, 30]);

export const soulX = (f: number) => {
  if (f < T.go0) return walkX(f, T.back0, T.back1, XD, XB);
  if (f < T.m1a) return walkX(f, T.go0, T.go1, XB, XW[0]);
  if (f < T.m2a) return walkX(f, T.m1a, T.m1b, XW[0], XW[1]);
  if (f < T.admire0) return walkX(f, T.m2a, T.m2b, XW[1], XW[2]);
  return walkX(f, T.admire0, T.admire1, XW[2], 540);
};
// what the front hand is doing
export const soulHand = (f: number): { x: number; y: number } | null => {
  for (const d of DOODLES) { const p = progress(d, f); if (p.drawing && p.tip) return { x: p.tip[0], y: p.tip[1] }; }
  if (f >= T.go1 && f < T.w1a) { const u = smoother(seg01(f, T.go1 + 2, T.grab)); const rest = DUSTER_REST; return u < 1 ? { x: lerp(XW[0] + 70, rest.x, u), y: lerp(1280, rest.y, u) } : { x: lerp(rest.x, wipeHand(0, T.w1a).x, seg01(f, T.grab, T.w1a)), y: lerp(rest.y, wipeHand(0, T.w1a).y, seg01(f, T.grab, T.w1a)) }; }
  for (let k = 0; k < 3; k++) if (f >= WIPES[k][0] && f < WIPES[k][1]) return wipeHand(k, f);
  const hp = progress(HEART, f); if (hp.drawing && hp.tip) return { x: hp.tip[0], y: hp.tip[1] };
  return null;
};
export const holdingDuster = (f: number) => f >= T.grab && f < T.drop;
export const soulPose = (f: number): Pose => {
  const breath = Math.sin((f / 30) * Math.PI * 2 / 3.8);
  const x = soulX(f);
  let p: Pose = mix(S, DRAW, smoother(seg01(f, 0, T.sun0)));
  if (f >= T.notice) p = mix(DRAW, S, smoother(seg01(f, T.notice, T.back0)));
  if (f >= T.back0) p = walking(phOf(x - XD), mix(S, DROOP, smoother(seg01(f, T.back0, T.back1 + 30))), walkAmt(f, T.back0, T.back1), true);
  if (f >= T.breath0) p = mix(DROOP, BREATH, Math.sin(Math.PI * seg01(f, T.breath0, T.breath1 + 6)));
  if (f >= T.go0) p = walking(phOf(x - XB), S, walkAmt(f, T.go0, T.go1));
  if (f >= T.go1) p = mix(S, WIPE, smoother(seg01(f, T.go1, T.grab)));
  if (f >= T.m1a && f < T.w2a) p = walking(phOf(x - XW[0]), WIPE, walkAmt(f, T.m1a, T.m1b));
  if (f >= T.m2a && f < T.w3a) p = walking(phOf(x - XW[1]), WIPE, walkAmt(f, T.m2a, T.m2b));
  if (f >= T.w3b) p = mix(WIPE, S, smoother(seg01(f, T.w3b, T.drop + 8)));
  const keep = smoother(seg01(f, T.keep0, T.keep1)) * (1 - smoother(seg01(f, T.chalk, T.heart0)));
  if (f >= T.keep0) p = reach(mix(S, KEEP, keep), x, { x: x + 34, y: 1318 }, 1, keep); // chalk pulled in close to the chest
  if (f >= T.shake0 && f < T.shake1) p = { ...p, head: p.head + 9 * Math.sin((f - T.shake0) / 2.6) * Math.sin(Math.PI * seg01(f, T.shake0, T.shake1)) };
  if (f >= T.heart0) p = mix(S, DRAW, smoother(seg01(f, T.chalk, T.heart0)) * (1 - smoother(seg01(f, T.heart1, T.admire0))));
  if (f >= T.admire0) p = walking(phOf(x - XW[2]), mix(S, ADMIRE, smoother(seg01(f, T.admire0, T.admire1 + 10))), walkAmt(f, T.admire0, T.admire1), true);
  // the front hand follows the chalk / duster
  const hand = soulHand(f);
  if (hand) {
    const into = f < T.notice ? smoother(seg01(f, 0, T.sun0)) : 1;
    p = reach(p, x, hand, 1, into);
  }
  // drop the duster onto the ledge
  if (f >= T.w3b && f < T.drop + 8) p = reach(p, x, { x: lerp(wipeHand(2, T.w3b).x, XW[2] + 80, seg01(f, T.w3b, T.drop)), y: lerp(wipeHand(2, T.w3b).y, 1392, seg01(f, T.w3b, T.drop)) }, 1, 1 - smoother(seg01(f, T.drop, T.drop + 8)));
  // breathing into the brush stroke
  return { ...p, lean: p.lean + 1.4 * breath, head: p.head + 1.2 * breath };
};
export const moodAt = (f: number) => 0.62 - 0.4 * smoother(seg01(f, T.x1a, T.ne1)) + 0.15 * smoother(seg01(f, T.breath0, T.w3b)) + 0.15 * smoother(seg01(f, T.keep0, T.shake1)) + 0.5 * smoother(seg01(f, T.heart0, T.magic1));
export const healAt = (f: number) => 0.5 - 0.16 * smoother(seg01(f, T.x1a, T.ne1)) + 0.12 * smoother(seg01(f, T.w1a, T.w3b)) + 0.54 * smoother(seg01(f, T.heart0, T.magic1));
export const lightAt = (f: number) => 0.4 - 0.2 * smoother(seg01(f, T.x1a, T.ne1)) + 0.2 * smoother(seg01(f, T.w1a, T.keep1)) + 0.6 * smoother(seg01(f, T.heart0, T.magic1));

// --- shadow figures (same depth as the soul, in front of the board)
const ASK = P(4, 10, [0, 0], [0, 0], [4, 62], [10, 80]);
const SLUMP = P(8, 22, [0, 0], [0, 0], [2, 2], [6, 8]);
export type Shadow = { x: number; dir: number; p: Pose; o: number };
const inOut = (f: number, a: number, b: number, c: number, d: number, stop: number) => {
  if (f < a || f > d) return null;
  if (f < c) {
    const x = walkX(f, a, b, 1240, stop);
    return { x, dir: -1, p: walking(phOf(1240 - x), S, walkAmt(f, a, b)) };
  }
  const x = walkX(f, c, d, stop, 1260);
  return { x, dir: lerp(-1, 1, smoother(seg01(f, c - 4, c + 6))), p: walking(phOf(x - stop), S, walkAmt(f, c, d)) };
};
export const shadow1 = (f: number): Shadow | null => {
  const s = inOut(f, T.s1in0, T.s1in1, T.s1out0, T.s1out1, S1X); if (!s) return null;
  let p = s.p;
  let tip: Pt | null = null;
  for (const d of CROSS) { const q = progress(d, f); if (q.drawing) tip = q.tip; }
  if (f > SHOULD.a && f < SHOULD.b) tip = [SHOULD.x + SHOULD.w * smoother(seg01(f, SHOULD.a, SHOULD.b)), SHOULD.y - 14 + 10 * Math.sin(f * 1.3)];
  const into = smoother(seg01(f, T.s1in1 - 4, T.x1a)) * (1 - smoother(seg01(f, T.should1, T.s1out0)));
  if (tip || (f > T.s1in1 - 4 && f < T.s1out0)) p = reach(p, s.x, tip ? { x: tip[0], y: tip[1] } : { x: CROSS[0].strokes[0][0][0], y: CROSS[0].strokes[0][0][1] }, -1, into);
  return { ...s, p, o: 1 };
};
export const shadow2 = (f: number): Shadow | null => {
  const s = inOut(f, T.s2in0, T.s2in1, T.s2out0, T.s2out1, S2X); if (!s) return null;
  let p = s.p;
  const into = smoother(seg01(f, T.s2in1 - 4, T.ne0)) * (1 - smoother(seg01(f, T.ne1, T.s2out0)));
  const w = f < T.nem + 1 ? NOTENOUGH : NOTWORTH;
  if (into > 0) p = reach(p, s.x, { x: w.x + w.w * smoother(seg01(f, w.a, w.b)), y: w.y - 14 + 10 * Math.sin(f * 1.3) }, -1, into);
  return { ...s, p, o: 1 };
};
export const shadow3 = (f: number): Shadow | null => {
  if (f < T.s3in0 || f > T.s3fade1) return null;
  const x = walkX(f, T.s3in0, T.s3in1, 1240, S3X);
  let p: Pose = walking(phOf(1240 - x), S, walkAmt(f, T.s3in0, T.s3in1));
  if (f >= T.ask0) p = mix(S, ASK, smoother(seg01(f, T.ask0, T.ask1)) * (1 - smoother(seg01(f, T.shake1 - 6, T.shake1 + 8))));
  if (f >= T.shake1 - 6) p = mix(p, SLUMP, smoother(seg01(f, T.shake1 - 6, T.s3fade1)));
  return { x, dir: -1, p, o: 1 - smoother(seg01(f, T.s3fade0, T.s3fade1)) };
};
