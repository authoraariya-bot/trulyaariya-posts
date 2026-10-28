// "You are the moon of your world" — beats, choreography and poses. Frames @30fps, 1080x1920.
// Built on the master rig (src/master/pose.ts): same soul, same proportions, same gait maths.
import { lerp, seg01, smoother, sstep, Pose, POSES } from "../master/pose";

export const END = 615; // 20.5s
export const T = {
  bIn0: 58, bIn1: 150,          // the friend walks in
  lift0: 156, lift1: 182,       // raises both hands: moon (front) and stars (raised behind)
  glowOn: 170,                  // the moon and the stars light up in its hands
  look0: 228, look1: 250,       // the soul looks up at the stars, its light dims
  crowd: 250,                   // the stars multiply
  pause: 318,                   // a blink, one slow breath
  breath0: 322, breath1: 350,
  turn: 350,                    // looks back to the moon
  aWalk0: 360, aWalk1: 404,     // two steps forward
  reach0: 400, reach1: 418, take: 420,
  rise0: 430, rise1: 486,       // the moon floats up into the sky
  joy: 440,
  wipe: 518, card: 536,
};
export const A0 = 320, A1 = 480;  // the soul
export const B0 = 1260, B1 = 770; // the friend (faces left)
export const STRIDE = 248;

const walkAmt = (f: number, a: number, b: number) => sstep(seg01(f, a, a + 16)) * (1 - sstep(seg01(f, b - 16, b)));
export const walkX = (f: number, a: number, b: number, x0: number, x1: number) => lerp(x0, x1, smoother(seg01(f, a, b)));
export const walkPh = (f: number, a: number, b: number, x0: number, x1: number) => (Math.abs(walkX(f, a, b, x0, x1) - x0) / STRIDE) * Math.PI * 2;
export const footfalls = (a: number, b: number, x0: number, x1: number) => {
  const out: number[] = []; let k = 1;
  for (let f = a; f <= b; f++) if (walkPh(f, a, b, x0, x1) >= k * Math.PI - 0.6) { out.push(f); k++; }
  return out;
};

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
const GAZE = P(5, -30, [0, 0], [0, 0], [6, 12], [16, 22]);          // looking up at the stars, leaning toward them
const DIM = P(9, -18, [0, 2], [0, 0], [2, 4], [8, 10]);              // shoulders drop a little as its light dims
const REACH = P(9, 4, [-2, 6], [-2, 4], [4, 80], [12, 86]);           // front hand out to the moon
const LIFT = P(-4, -22, [0, 0], [0, 0], [8, 150], [20, 162]);         // lets the moon float up from its palm
const GLOW = P(-5, -26, [-2, 3], [-2, 2], [14, 30], [24, 40]);        // looking up at its moon, light on the face

// the soul
export const ax = (f: number) => walkX(f, T.aWalk0, T.aWalk1, A0, A1);
export const aPose = (f: number): Pose => {
  const breath = Math.sin((f / 30) * Math.PI * 2 / 3.8);
  const deep = Math.sin(Math.PI * seg01(f, T.breath0, T.breath1));
  let p: Pose = S;
  if (f >= T.look0) p = mix(S, GAZE, smoother(seg01(f, T.look0, T.look1)));
  if (f >= T.look1 + 20) p = mix(GAZE, DIM, smoother(seg01(f, T.look1 + 20, T.look1 + 50)));
  if (f >= T.turn - 6) p = mix(DIM, S, smoother(seg01(f, T.turn - 6, T.turn + 14)));
  if (f >= T.aWalk0) p = walking(walkPh(f, T.aWalk0, T.aWalk1, A0, A1), S, walkAmt(f, T.aWalk0, T.aWalk1));
  if (f >= T.reach0) p = mix(S, REACH, smoother(seg01(f, T.reach0, T.reach1)));
  if (f >= T.take + 6) p = mix(REACH, LIFT, smoother(seg01(f, T.take + 6, T.rise0 + 14)));
  if (f >= T.rise0 + 26) p = mix(LIFT, GLOW, smoother(seg01(f, T.rise0 + 26, T.rise1 + 6)));
  const anticip = f >= T.reach0 - 10 && f < T.reach0 ? -3 * Math.sin(Math.PI * seg01(f, T.reach0 - 10, T.reach0)) : 0;
  return { ...p, lean: p.lean + 1.4 * breath + anticip - 3 * deep, head: p.head + 1.2 * breath - 6 * deep };
};
// 0 sad → 1 joyful
export const aMood = (f: number) =>
  0.32 - 0.2 * smoother(seg01(f, T.look1, T.look1 + 50)) + 0.28 * smoother(seg01(f, T.turn, T.take)) + 0.6 * smoother(seg01(f, T.take, T.rise1));
// chest light: steady → dims while it gazes at the stars → blazes with the moon
export const aLight = (f: number) =>
  0.45 - 0.33 * smoother(seg01(f, T.look1, T.look1 + 46)) + 0.2 * smoother(seg01(f, T.breath0, T.reach0)) + 0.68 * smoother(seg01(f, T.take, T.rise1));

// the friend
const OFFER = P(4, 4, [0, 0], [0, 0], [-138, 74], [-150, 88]);     // back arm raised high (stars), front arm forward (moon)
const NOD = P(6, 18, [0, 0], [0, 0], [-4, 6], [8, 14]);
export const bx = (f: number) => walkX(f, T.bIn0, T.bIn1, B0, B1);
export const bPose = (f: number): Pose => {
  const breath = Math.sin((f / 30) * Math.PI * 2 / 4.2 + 1.3);
  let p: Pose = walking(walkPh(f, T.bIn0, T.bIn1, B0, B1), S, walkAmt(f, T.bIn0, T.bIn1));
  if (f >= T.lift0) {
    const u = smoother(seg01(f, T.lift0, T.lift1));
    p = mix(S, OFFER, u);
    p = { ...p, lean: p.lean - 3 * Math.sin(Math.PI * seg01(f, T.lift0 - 8, T.lift0 + 6)) };
  }
  if (f >= T.take) p = mix(OFFER, NOD, smoother(seg01(f, T.take + 2, T.take + 40)));
  if (f >= T.take + 40) p = { ...p, head: p.head + 10 * Math.sin(Math.PI * seg01(f, T.take + 40, T.take + 64)) };
  return { ...p, lean: p.lean + 1.2 * breath, head: p.head + 1 * breath };
};

// how awake the world is (muted twilight → glowing warm night)
export const healAt = (f: number) =>
  0.16 + 0.06 * smoother(seg01(f, T.glowOn, T.glowOn + 40)) - 0.08 * smoother(seg01(f, T.look1, T.pause)) + 0.08 * smoother(seg01(f, T.pause, T.take))
  + 0.78 * smoother(seg01(f, T.take, T.rise1 + 10));
// the moon: glows in the friend's hand → passes to the soul → rises into the sky
export const MOON_SKY = { x: 640, y: 800, r: 88 };
export const moonGrow = (f: number) => smoother(seg01(f, T.rise0, T.rise1));
export const starCrowd = (f: number) => smoother(seg01(f, T.crowd, T.crowd + 50));
export const starsUp = (f: number) => smoother(seg01(f, T.rise0 + 6, T.rise1 + 20));
