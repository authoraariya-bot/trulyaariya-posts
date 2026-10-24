// Shared choreography engine for Soul reels, built on the master's rig (src/master/pose.ts).
// The soul's proportions, scale, forward kinematics and gait maths are the master's; each reel only supplies its story.
import { Pose, POSES as MASTER_POSES, solve, Rig, SCALE, GROUND, FPS } from "../master/pose";

export { solve, SCALE, GROUND, FPS };
export type { Pose, Rig };
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const sstep = (x: number) => { x = clamp01(x); return x * x * (3 - 2 * x); };
export const smoother = (x: number) => { x = clamp01(x); return x * x * x * (x * (x * 6 - 15) + 10); };
export const seg01 = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const P = (lean: number, head: number, th: [number, number], sh: [number, number], ua: [number, number], fa: [number, number]): Pose => ({ lean, head, th, sh, ua, fa });
// master poses + new poses (joint angles only; degrees from straight down, + = forward)
export const POSES = {
  ...MASTER_POSES,
  sitHold: P(12, 24, [118, 122], [24, 20], [38, 46], [96, 104]),      // sitting, holding something in front of the chest
  sitRead: P(16, 40, [118, 122], [24, 20], [34, 42], [104, 112]),     // sitting, looking down at a book in the lap
  sitTall: P(2, 4, [112, 116], [20, 16], [10, 14], [20, 24]),         // sitting upright, calm
  sitLean: P(-8, -14, [116, 120], [22, 18], [-22, -18], [-30, -26]),  // sitting, leaning back on hands, face up
  standHold: P(4, 14, [0, 0], [0, 0], [34, 44], [100, 110]),           // standing, holding something at the chest
  standHug: P(6, 18, [0, 0], [0, 0], [40, 46], [128, 136]),            // standing, hugging itself / a book to the chest
  standOffer: P(8, 10, [0, 0], [0, 0], [62, 70], [78, 86]),            // standing, holding something out
  standWave: P(2, 4, [0, 0], [0, 0], [10, 150], [16, 176]),            // standing, front arm raised high
  armsOpen: P(-4, -12, [0, 0], [0, 0], [-28, 128], [-20, 150]),        // standing, arms open, face up
  cheer: P(-5, -16, [0, 0], [0, 0], [128, 166], [150, 184]),           // standing, both arms raised high in a V (joy)
  sing: P(-2, -12, [0, 0], [0, 0], [16, 34], [30, 158]),              // standing, front hand up at the mouth like a microphone
  tired: P(18, 30, [4, 2], [-4, -2], [2, 4], [6, 8]),                  // standing, slumped
  kneelHold: P(30, 30, [70, 74], [-100, -96], [36, 46], [96, 108]),   // kneeling, holding something in front
  kneelReach: P(40, 24, [70, 74], [-100, -96], [40, 58], [52, 66]),   // kneeling, reaching to the ground
  writeDesk: P(22, 34, [92, 96], [4, 2], [44, 52], [92, 100]),          // seated on a stool, writing at a desk
};
export type PoseName = keyof typeof POSES;
export const mix = (a: Pose, b: Pose, t: number): Pose => ({
  lean: lerp(a.lean, b.lean, t), head: lerp(a.head, b.head, t),
  th: [lerp(a.th[0], b.th[0], t), lerp(a.th[1], b.th[1], t)], sh: [lerp(a.sh[0], b.sh[0], t), lerp(a.sh[1], b.sh[1], t)],
  ua: [lerp(a.ua[0], b.ua[0], t), lerp(a.ua[1], b.ua[1], t)], fa: [lerp(a.fa[0], b.fa[0], t), lerp(a.fa[1], b.fa[1], t)],
});

export type Key = { f: number; pose: PoseName | Pose; blend?: number }; // pose reached at f + blend (blend 20–35)
export type Walk = { from: number; to: number; x0: number; x1: number; skip?: [number, number] }; // skip window inside the walk
export type Story = {
  end: number; x0: number; keys: Key[]; walks: Walk[];
  mood: [number, number][]; heal: [number, number][]; mod?: (f: number, p: Pose) => Pose; blinks?: number[];
};

const keyed = (arr: [number, number][], f: number) => {
  if (f <= arr[0][0]) return arr[0][1];
  for (let i = 1; i < arr.length; i++) if (f <= arr[i][0]) return lerp(arr[i - 1][1], arr[i][1], smoother(seg01(f, arr[i - 1][0], arr[i][0])));
  return arr[arr.length - 1][1];
};

export const makeStory = (s: Story) => {
  const STRIDE = 248, SKIP_STRIDE = 330;
  const N = s.end + 40;
  const skipAt = (f: number) => {
    for (const w of s.walks) if (w.skip && f >= w.from && f <= w.to)
      return smoother(seg01(f, w.skip[0], w.skip[0] + 34)) * (1 - smoother(seg01(f, w.skip[1] - 34, w.skip[1])));
    return 0;
  };
  // integrate each walk so distance (and gait phase) follows an eased speed profile → feet never slide
  const XS: number[] = [], PH: number[] = [];
  let x = s.x0, ph = 0;
  for (let f = 0; f < N; f++) {
    const w = s.walks.find((w) => f >= w.from && f < w.to);
    if (w) {
      const speed = (g: number) => smoother(seg01(g, w.from, w.from + 30)) * (1 - smoother(seg01(g, w.to - 34, w.to))) * (1 + 1.55 * skipAt(g));
      let total = 0; for (let g = w.from; g < w.to; g++) total += speed(g);
      const dx = (speed(f) / total) * (w.x1 - w.x0);
      x += dx; ph += (dx / lerp(STRIDE, SKIP_STRIDE, skipAt(f))) * Math.PI * 2 * Math.sign(dx || 1);
    }
    XS.push(x); PH.push(ph);
  }
  const at = (arr: number[], f: number) => { const i = Math.max(0, Math.min(N - 2, Math.floor(f))); const u = f - i; return arr[i] * (1 - u) + arr[i + 1] * u; };
  const xAt = (f: number) => at(XS, f);
  const phase = (f: number) => at(PH, f);
  const walkAmt = (f: number) => {
    for (const w of s.walks) if (f >= w.from - 2 && f <= w.to + 2) return sstep(seg01(f, w.from, w.from + 22)) * (1 - sstep(seg01(f, w.to - 30, w.to)));
    return 0;
  };
  const facing = (f: number) => { const w = s.walks.find((w) => f >= w.from && f <= w.to + 60) ?? null; return w && w.x1 < w.x0 ? -1 : 1; };
  // footfalls (for sound + flowers)
  const steps: number[] = [];
  { let next = 1; for (let f = 0; f < N; f++) if (Math.abs(PH[f]) >= next * Math.PI - 0.6) { steps.push(f); next++; } }

  const walkPose = (f: number, base: Pose, amt: number): Pose => {
    const p0 = Math.abs(phase(f)); const sk = skipAt(f);
    const leg = (o: number) => {
      const p = p0 + o; const swing = Math.max(0, -Math.sin(p)), stance = Math.max(0, Math.sin(p));
      const th = lerp(23, 30, sk) * Math.cos(p) + sk * 58 * Math.pow(swing, 1.2);
      return [th, th - (lerp(48, 92, sk) * Math.pow(swing, 1.3) + 7 * stance)];
    };
    const [tb, sb] = leg(Math.PI), [tf, sf] = leg(0);
    const armB = -lerp(0.75, 1.9, sk) * tb + sk * 26, armF = -lerp(0.75, 1.9, sk) * tf + sk * 26;
    const w: Pose = {
      lean: base.lean + 2.5 + 1.2 * Math.cos(p0 * 2) - sk * 5, head: base.head - 1.2 * Math.cos(p0 * 2) - 3 - sk * 14,
      th: [tb, tf], sh: [sb, sf],
      ua: [armB, armF], fa: [armB + 14 + lerp(10, 40, sk) * Math.max(0, Math.sin(p0 + Math.PI)), armF + 14 + lerp(10, 40, sk) * Math.max(0, Math.sin(p0))],
    };
    return mix(base, w, amt);
  };
  const resolve = (k: Key) => (typeof k.pose === "string" ? POSES[k.pose] : k.pose);
  const basePose = (f: number): Pose => {
    const ks = s.keys;
    let p = resolve(ks[0]);
    for (let i = 1; i < ks.length; i++) {
      const k = ks[i], b = k.blend ?? 28;
      if (f < k.f) break;
      p = mix(p, resolve(k), smoother(seg01(f, k.f, k.f + b)));
    }
    return p;
  };
  const poseAt = (f: number): Pose => {
    let p = basePose(f);
    const amt = walkAmt(f);
    if (amt > 0) p = walkPose(f, p, amt);
    if (s.mod) p = s.mod(f, p);
    const breath = Math.sin((f / FPS) * Math.PI * 2 / 3.8);
    return { ...p, lean: p.lean + 1.4 * breath, head: p.head + 1.2 * breath };
  };
  const hopAt = (f: number) => 27 * skipAt(f) * Math.pow(Math.abs(Math.sin(phase(f))), 0.8);
  const moodAt = (f: number) => keyed(s.mood, f);
  const healAt = (f: number) => keyed(s.heal, f);
  const rigAt = (f: number) => solve(poseAt(f), xAt(f), GROUND, hopAt(f));
  return { ...s, xAt, poseAt, hopAt, moodAt, healAt, rigAt, steps, facing, walkAmt, blinks: s.blinks ?? [46, 128, 226, 300, 372, 452, 560] };
};
export type Choreo = ReturnType<typeof makeStory>;

// world-space point after the soul's scale (about its ground point)
export const scaledPt = (p: { x: number; y: number }, x: number, ground = GROUND) => ({ x: x + (p.x - x) * SCALE, y: ground + (p.y - ground) * SCALE });
export const chestOf = (r: Rig) => ({ x: r.neck.x + (r.hip.x - r.neck.x) * 0.32 + 7, y: r.neck.y + (r.hip.y - r.neck.y) * 0.32 });
