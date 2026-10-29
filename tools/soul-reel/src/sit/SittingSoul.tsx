// "The Sitting Soul" — a still paper page with the quote, a tiny soul sitting on its bottom edge doing ONE gentle action,
// soft pastel waves drifting behind. 15 s, silent, seamless loop (frame 450 = frame 0).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";

export const LOOP = 450;
const W = 1080, H = 1920;
export type Palette = { base: string; waves: [string, string, string, string]; ink: string; deep: string; mark: string };
export const PALETTES: Record<string, Palette> = {
  blush: { base: "#F6DFDC", waves: ["#FBEBE8", "#F1CDC9", "#EABDB9", "#E2AEAA"], ink: "#7E4548", deep: "#B4585F", mark: "#F3C6C3" },
  sage: { base: "#CFE0BF", waves: ["#DCE9D0", "#C3D9B0", "#B5CFA1", "#A8C693"], ink: "#3C5132", deep: "#5B7A49", mark: "#CFE3BE" },
  lavender: { base: "#E4DEF0", waves: ["#EEEAF6", "#D7CFE9", "#CBC1E1", "#BEB2D8"], ink: "#4F4372", deep: "#6E5FA0", mark: "#DCD3EE" },
  butter: { base: "#F6EDCC", waves: ["#FBF5DE", "#F0E2B2", "#E9D79E", "#E2CB8A"], ink: "#6B5622", deep: "#9A7A2C", mark: "#F3E3AE" },
  sky: { base: "#D9E7F1", waves: ["#E8F1F8", "#C9DCEA", "#BAD1E3", "#ABC6DB"], ink: "#35536B", deep: "#4F7896", mark: "#CFE0EE" },
  peach: { base: "#F8E1D0", waves: ["#FCECE0", "#F3D0B9", "#EDC2A6", "#E6B493"], ink: "#7E4B2C", deep: "#B16A3F", mark: "#F6D2BA" },
};

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const seg = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
const ease = (x: number) => { x = clamp01(x); return x * x * x * (x * (x * 6 - 15) + 10); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("Cormorant", `url(${staticFile("CormorantGaramond.ttf")})`, { weight: "300 700" }),
      new FontFace("Cormorant", `url(${staticFile("CormorantGaramond-Italic.ttf")})`, { weight: "300 700", style: "italic" }),
      new FontFace("Caveat", `url(${staticFile("Caveat.ttf")})`, { weight: "400 700" }),
    ];
    Promise.all(faces.map((ff) => ff.load())).then((l) => { l.forEach((ff) => document.fonts.add(ff)); continueRender(handle); });
  }, [handle]);
};

// ---------- background waves: every motion is periodic in the 15 s loop
const Waves: React.FC<{ f: number; p: Palette }> = ({ f, p }) => {
  const ph = (f / LOOP) * TAU;
  const band = (base: number, amp: number, len: number, cycles: number, dir: number, bob: number, bobPh: number, fill: string, top: boolean, k: string) => {
    const shift = dir * cycles * (f / LOOP) * len; // exactly one wavelength per loop, so frame 450 = frame 0
    const yo = 30 * bob * Math.sin(ph + bobPh);
    let d = top ? `M-20,-20 L-20,${base}` : `M-20,${H + 20} L-20,${base}`;
    for (let x = -20; x <= W + 20; x += 18) {
      const y = base + yo + amp * Math.sin(((x + shift) / len) * TAU) + amp * 0.35 * Math.sin(((x + shift) / (len / 2)) * TAU + 1.3);
      d += ` L${x},${y.toFixed(1)}`;
    }
    d += top ? ` L${W + 20},-20 Z` : ` L${W + 20},${H + 20} Z`;
    return <path key={k} d={d} fill={fill} />;
  };
  const line = (base: number, amp: number, len: number, dir: number, bobPh: number, k: string) => {
    const shift = dir * (f / LOOP) * len;
    let d = "";
    for (let x = -20; x <= W + 20; x += 16) {
      const y = base + 30 * Math.sin(ph + bobPh) * 0.6 + amp * Math.sin(((x + shift) / len) * TAU);
      d += `${x === -20 ? "M" : " L"}${x},${y.toFixed(1)}`;
    }
    return <path key={k} d={d} stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.58} strokeLinecap="round" />;
  };
  return (
    <g>
      <rect width={W} height={H} fill={p.base} />
      {band(210, 26, 620, 1, 1, 1, 0.4, p.waves[1], true, "t")}
      {line(760, 22, 540, -1, 1.1, "l1")}
      {line(860, 18, 700, 1, 2.3, "l2")}
      {band(1470, 30, 640, 1, -1, 1, 0, p.waves[0], false, "b1")}
      {band(1580, 28, 560, 1, 1, 1, 1.7, p.waves[1], false, "b2")}
      {band(1700, 24, 700, 1, -1, 1, 3.3, p.waves[2], false, "b3")}
      {band(1810, 20, 480, 1, 1, 1, 4.6, p.waves[3], false, "b4")}
    </g>
  );
};

// ---------- the tiny soul (local coords: origin = middle of its flat bottom, sitting on the page edge)
const BODY = "#F4C7B4", LIMB = "#E4A98F", EYE = "#3E2F2B";
type V = { x: number; y: number };
const ik = (sh: V, hand: V, L1: number, L2: number, bendSign: number) => {
  const dx = hand.x - sh.x, dy = hand.y - sh.y, d = Math.max(4, Math.min(L1 + L2 - 0.5, Math.hypot(dx, dy)));
  const a = Math.atan2(dy, dx), k = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const el = { x: sh.x + L1 * Math.cos(a + bendSign * k), y: sh.y + L1 * Math.sin(a + bendSign * k) };
  return { el, hd: { x: sh.x + d * Math.cos(a), y: sh.y + d * Math.sin(a) } };
};
export type SoulState = {
  lean: number; breath: number; blink: number; look: V; joy: number; legPh: number;
  hands: [V, V]; // [its right = screen left, its left = screen right]
  stretch?: number; // 0 = normal, + = taller and thinner (squash & stretch)
};
export const Soul: React.FC<{ s: SoulState; children?: React.ReactNode; front?: React.ReactNode }> = ({ s, children, front }) => {
  const st = s.stretch ?? 0, sy = (1 + 0.014 * s.breath) * (1 + st), sx = (1 - 0.008 * s.breath) * (1 - 0.45 * st);
  const legs = [-1, 1].map((sd, i) => {
    const sw = 13 * Math.sin(s.legPh + (i ? Math.PI * 0.85 : 0));
    const hip = { x: 40 * sd, y: -6 };
    const knee = { x: hip.x + 14 * Math.sin((sw * Math.PI) / 180) + 4 * sd, y: hip.y + 46 };
    const foot = { x: knee.x + 40 * Math.sin(((sw * 1.6) * Math.PI) / 180), y: knee.y + 40 * Math.cos(((sw * 1.6) * Math.PI) / 180) };
    return <g key={`lg${i}`}>
      <path d={`M${hip.x},${hip.y} Q${knee.x},${knee.y} ${foot.x},${foot.y}`} stroke={LIMB} strokeWidth={10} fill="none" strokeLinecap="round" />
      <ellipse cx={foot.x + 6 * sd} cy={foot.y + 3} rx={13} ry={8} fill={LIMB} transform={`rotate(${sw * 0.8} ${foot.x} ${foot.y})`} />
    </g>;
  });
  const shoulders: V[] = [{ x: -74, y: -86 }, { x: 74, y: -86 }];
  const arms = shoulders.map((sh, i) => {
    const { el, hd } = ik(sh, s.hands[i], 44, 40, i ? -1 : 1);
    return <g key={`ar${i}`}>
      <path d={`M${sh.x},${sh.y} Q${el.x},${el.y} ${hd.x},${hd.y}`} stroke={LIMB} strokeWidth={9} fill="none" strokeLinecap="round" />
      <circle cx={hd.x} cy={hd.y} r={7.5} fill={LIMB} />
    </g>;
  });
  const eye = (x: number) => <g key={`e${x}`}>
    <ellipse cx={x + s.look.x} cy={-98 + s.look.y} rx={8} ry={Math.max(0.6, 11 * s.blink * (1 - s.joy))} fill={EYE} />
    {s.joy > 0.02 && <path d={`M${x - 9},${-96} Q${x},${-106} ${x + 9},${-96}`} stroke={EYE} strokeWidth={4} fill="none" strokeLinecap="round" opacity={s.joy} />}
    {s.joy < 0.5 && s.blink > 0.6 && <circle cx={x + s.look.x + 2.5} cy={-102 + s.look.y} r={2.4} fill="#FFFFFF" opacity={0.85} />}
  </g>;
  return (
    <g>
      {legs}
      <g transform={`matrix(1 0 ${Math.tan((-s.lean * Math.PI) / 180).toFixed(4)} 1 0 0) scale(${sx} ${sy})`}>
        {children}
        <path d="M-95,0 C-100,-78 -72,-150 -30,-188 C-14,-201 14,-201 30,-188 C72,-150 100,-78 95,0 Z" fill={BODY} />
        <path d="M-60,-150 C-40,-176 -10,-186 12,-186" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" fill="none" opacity={0.28} />
        <path d="M0,-196 C-6,-222 12,-240 24,-228 C32,-219 22,-208 14,-214" stroke={LIMB} strokeWidth={6.5} fill="none" strokeLinecap="round" />
        {[-1, 1].map((sd) => <ellipse key={`bl${sd}`} cx={56 * sd} cy={-70} rx={17} ry={9} fill="#F29C97" opacity={0.45} />)}
        {eye(-32)}{eye(32)}
        <path d={`M-17,-66 Q0,${-55 + 4 * s.joy} 17,-66`} stroke={EYE} strokeWidth={4} fill="none" strokeLinecap="round" />
        {front}
        {arms}
      </g>
    </g>
  );
};

// ---------- page + text
export type SitProps = { lines: React.ReactNode[]; palette: Palette; size: number; pageTop: number; pageBottom: number; soulX: number;
  scene: (f: number) => { soul: SoulState; inHands?: React.ReactNode; onPage?: React.ReactNode; above?: React.ReactNode } };
const PX0 = 80, PX1 = 920;
export const SittingSoul: React.FC<SitProps> = ({ lines, palette: p, size, pageTop, pageBottom, soulX, scene }) => {
  useFonts();
  const f = useCurrentFrame() % LOOP;
  const sc = scene(f);
  const torn = (() => { let d = `M${PX0},${pageBottom} L${PX0},${pageTop + 6}`; for (let x = PX0; x <= PX1; x += 14) d += ` L${x},${(pageTop + 6 * Math.sin(x / 23) + 5 * rnd(x) - 2).toFixed(1)}`; return d + ` L${PX1},${pageBottom} Z`; })();
  return (
    <AbsoluteFill style={{ backgroundColor: p.base }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="ssgrain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} stitchTiles="stitch" /><feColorMatrix type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.35  0 0 0 0 0.32  0 0 0 0.55 0" /></filter>
          <filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={3} seed={11} /><feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.47  0 0 0 0 0.36  0 0 0 0.5 0" /></filter>
          <filter id="pshadow" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="14" stdDeviation="16" floodColor={p.ink} floodOpacity="0.16" /></filter>
          <filter id="soft4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter>
          <clipPath id="pclip"><path d={torn} /></clipPath>
        </defs>
        <Waves f={f} p={p} />
        <rect width={W} height={H} filter="url(#ssgrain)" opacity={0.12} />
        {/* the page — completely still */}
        <path d={torn} fill="#FCF8EF" filter="url(#pshadow)" />
        <g clipPath="url(#pclip)">
          <rect x={PX0} y={pageTop - 10} width={PX1 - PX0} height={pageBottom - pageTop + 20} filter="url(#paper)" opacity={0.09} />
          {Array.from({ length: 70 }, (_, i) => { const x = PX0 + rnd(i) * (PX1 - PX0), y = pageTop + rnd(i + 9) * (pageBottom - pageTop), a = rnd(i + 3) * 360, l = 10 + rnd(i + 4) * 22;
            return <path key={i} d={`M0,0 q${l / 2},${(rnd(i + 5) - 0.5) * 8} ${l},0`} transform={`translate(${x} ${y}) rotate(${a})`} stroke="#CDBFA9" strokeWidth={1} fill="none" opacity={0.45} />; })}
        </g>
        {sc.onPage}
      </svg>
      {/* handle tag above the page */}
      <div style={{ position: "absolute", top: pageTop - 48 - 62, left: PX0, width: PX1 - PX0, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
        <div style={{ width: 46, height: 1.6, background: p.ink, opacity: 0.6 }} />
        <div style={{ fontFamily: "Cormorant", fontStyle: "italic", fontWeight: 600, fontSize: 50, color: p.ink }}>@trulyaariya</div>
        <div style={{ width: 46, height: 1.6, background: p.ink, opacity: 0.6 }} />
      </div>
      {/* the quote, visible from the first frame */}
      <div style={{ position: "absolute", top: pageTop + 78, left: PX0 + 70, width: PX1 - PX0 - 140, fontFamily: "Cormorant", fontWeight: 600, fontSize: size, lineHeight: 1.38, color: "#2B2622", textAlign: "left" }}>
        {lines.map((l, i) => <div key={i} style={{ marginTop: i ? size * 0.62 : 0 }}>{l}</div>)}
        <div style={{ marginTop: size * 0.75, fontFamily: "Cormorant", fontStyle: "italic", lineHeight: 1.1 }}>
          <div style={{ fontWeight: 400, fontSize: 38, color: "#4A403A" }}>truly yours,</div>
          <div style={{ fontWeight: 600, fontSize: 58, color: "#2B2622", marginTop: 4 }}>Aariya</div>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${soulX} ${pageBottom})`}>
          <Soul s={sc.soul} front={sc.inHands} />
        </g>
        {sc.above}
      </svg>
    </AbsoluteFill>
  );
};
// the one meaningful word: Caveat Bold ~1.3×, deeper palette tone, soft highlighter behind its lower half
export const Mark: React.FC<{ p: Palette; size: number; children: React.ReactNode }> = ({ p, size, children }) => (
  <span style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: size * 1.3, color: p.deep, lineHeight: 1, padding: "0 4px", backgroundImage: `linear-gradient(transparent 52%, ${p.mark} 52%, ${p.mark} 90%, transparent 90%)` }}>{children}</span>
);
export { clamp01, seg, ease, lerp, TAU };
