// Writing reel 02 — "I rate myself 10/10" · Instagram quote look (Aariya, 5 Nov: "should look like a quote format, not a presentation")
// two looks to choose from: "glow" (warm blush→peach light, centred serif) and "paper" (cream ruled notebook page on a warm desk)
// element: a red-pen circle + tick drawn around "10/10" (grading yourself) and a tiny self-hug figure with a beating heart.
import React from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { easeOut, FPS, INK, seg, useFonts } from "./WritingReel";

const s = (t: number) => t * FPS;
const RED = "#C8443A";
const ROSE = "#9A5E52";

const useExtraFonts = () => {
  const [h] = React.useState(() => delayRender("extra-fonts"));
  React.useEffect(() => {
    const faces = [
      new FontFace("Cormorant Garamond", `url(${staticFile("CormorantGaramond.ttf")})`, { weight: "300 700" }),
      new FontFace("Cormorant Garamond", `url(${staticFile("CormorantGaramond-Italic.ttf")})`, { weight: "300 700", style: "italic" }),
      new FontFace("Caveat", `url(${staticFile("Caveat.ttf")})`, { weight: "400 700" }),
    ];
    Promise.all(faces.map((ff) => ff.load())).then((l) => { l.forEach((ff) => document.fonts.add(ff)); continueRender(h); });
  }, [h]);
};

const Hug: React.FC<{ f: number; bg: string }> = ({ f, bg }) => {
  const draw = (a: number, b: number) => easeOut(seg(f, a, b));
  const A = s(0.4), B = s(2.0);
  const st = (d: string, a: number, b: number, w: number, c: string) => <path d={d} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw(a, b)} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  const tube = (d: string, a: number, b: number, w: number) => <g>{st(d, a, b, w, INK)}{st(d, a + 3, b + 3, w - 6, bg)}</g>;
  const x = 100;
  const torso = `M${x - 26},120 C${x - 31},126 ${x - 32},150 ${x - 29},200 L${x + 29},200 C${x + 32},150 ${x + 31},126 ${x + 26},120 C${x + 15},113 ${x - 15},113 ${x - 26},120 Z`;
  const head = `M${x},52 C${x + 13},52 ${x + 22},63 ${x + 22},76 C${x + 22},90 ${x + 12},100 ${x},100 C${x - 12},100 ${x - 22},90 ${x - 22},76 C${x - 22},63 ${x - 13},52 ${x},52 Z`;
  const fill = easeOut(seg(f, s(2.0), s(2.6)));
  const beat = f > s(2.6) ? 1 + 0.1 * Math.max(0, Math.sin(((f - s(2.6)) / FPS) * Math.PI * 1.2)) : 1;
  return (
    <svg viewBox="40 40 120 262" width={70} height={153} style={{ overflow: "visible" }}>
      {tube(`M${x - 11},198 L${x - 12},288`, A + 4, B, 19)}{tube(`M${x + 11},198 L${x + 12},288`, A + 4, B, 19)}
      {st(`M${x - 13},291 L${x - 23},292`, B - 4, B, 13, INK)}{st(`M${x + 13},291 L${x + 23},292`, B - 4, B, 13, INK)}
      {st(`M${x},98 L${x},112`, A + 2, B, 13, INK)}
      <path d={torso} fill={bg} opacity={draw(A, B)} />{st(torso, A, B, 3.5, INK)}
      <path d={head} fill={bg} opacity={draw(A, B)} />{st(head, A, B, 3.5, INK)}
      {tube(`M${x - 27},126 C${x - 40},150 ${x - 30},172 ${x - 8},166 C${x + 8},160 ${x + 18},146 ${x + 22},134`, A + 8, B, 15)}
      {tube(`M${x + 27},126 C${x + 40},152 ${x + 30},178 ${x + 8},174 C${x - 8},170 ${x - 18},156 ${x - 22},144`, A + 10, B, 15)}
      <g transform={`translate(${x},131) scale(${0.95 * beat})`}><path d="M0,6 C-2,-2 -14,-4 -14,5 C-14,13 -5,18 0,23 C5,18 14,13 14,5 C14,-4 2,-2 0,6 Z" fill={RED} opacity={fill} /></g>
    </svg>
  );
};

// a red-pen circle (and tick) drawn around a word, like a teacher marking a paper
const Circled: React.FC<{ f: number; a: number; children: React.ReactNode; tick?: boolean; w: number; h: number }> = ({ f, a, children, tick, w, h }) => {
  const p = easeOut(seg(f, a, a + s(0.9))), q = easeOut(seg(f, a + s(0.8), a + s(1.2)));
  return <span style={{ position: "relative", display: "inline-block" }}>
    {children}
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" width={w} height={h} style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", overflow: "visible" }}>
      <path d="M58,4 C86,3 99,16 97,31 C95,48 72,57 48,56 C22,55 3,46 3,30 C3,14 24,5 46,5 C58,5 66,7 70,10" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} stroke={RED} strokeWidth={3.2} fill="none" strokeLinecap="round" />
    </svg>
    {tick && <svg viewBox="0 0 40 30" width={46} height={36} style={{ position: "absolute", right: -66, top: -26, overflow: "visible" }}>
      <path d="M3,16 L14,27 L37,3" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - q} stroke={RED} strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>}
  </span>;
};

export const Write02Quote: React.FC<{ look: "glow" | "paper" }> = ({ look }) => {
  useFonts(); useExtraFonts();
  const f = useCurrentFrame();
  const paper = look === "paper";
  const pageBg = paper ? "#FFFBF2" : "#FBE3D6";
  const mark = (t: React.ReactNode) => <span style={{ fontFamily: "Playfair Display", fontWeight: 800, color: RED, fontSize: "1.12em", lineHeight: 0 }}>{t}</span>;
  const LH = 52;
  const body: React.CSSProperties = { fontFamily: "Cormorant Garamond", fontWeight: 600, fontSize: 41, lineHeight: `${LH}px`, color: INK, textAlign: "center", fontVariantNumeric: "lining-nums" };
  const it: React.CSSProperties = { fontStyle: "italic", color: ROSE, fontWeight: 600 };
  const gap = (n = 1) => <div style={{ height: (LH * n) / 2 }} />;

  return (
    <AbsoluteFill style={{ background: paper ? "#E9D6BE" : "linear-gradient(172deg, #F8D3CB 0%, #FADFD0 38%, #FCEAD3 72%, #FDF1DC 100%)", overflow: "hidden" }}>
      {/* background life */}
      {!paper && <>
        {[[220, 360, 460, 0], [880, 1180, 520, 2.1], [380, 1640, 480, 4.2]].map(([x, y, r, ph], i) => {
          const a = f / FPS * 0.25 + ph;
          return <div key={i} style={{ position: "absolute", left: x + Math.cos(a) * 70 - r, top: y + Math.sin(a * 0.8) * 90 - r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0) 68%)" }} />;
        })}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 18 }, (_, i) => {
            const x = (i * 211) % 1000 + 40, y = 1920 - ((f / FPS * (12 + (i * 5) % 9) + i * 131) % 2000);
            const tw = 0.35 + 0.35 * Math.sin(f / 18 + i);
            return <path key={i} d={`M${x},${y - 7} L${x + 2},${y - 2} L${x + 7},${y} L${x + 2},${y + 2} L${x},${y + 7} L${x - 2},${y + 2} L${x - 7},${y} L${x - 2},${y - 2} Z`} fill="#FFFFFF" opacity={tw} />;
          })}
        </svg>
      </>}
      {paper && <div style={{ position: "absolute", left: 70, top: 236, width: 940, height: 1300, background: pageBg, borderRadius: 6, boxShadow: "0 18px 40px rgba(90,60,40,0.18)", transform: "rotate(-0.6deg)",
        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${LH - 2}px, rgba(120,150,190,0.22) ${LH - 2}px, rgba(120,150,190,0.22) ${LH}px)`, backgroundPosition: "0 22px" }}>
        <div style={{ position: "absolute", left: 30, top: 0, bottom: 0, width: 2, background: "rgba(200,68,58,0.35)" }} />
      </div>}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} stitchTiles="stitch" /><feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.3  0 0 0 0 0.28  0 0 0 0.5 0" /></filter>
        <rect width={1080} height={1920} filter="url(#grain)" opacity={0.12} />
      </svg>

      <div style={{ position: "absolute", left: 100, top: paper ? 262 : 282, width: 840 }}>
        {/* header: tiny self-hug + I rate myself 10/10 (circled in red pen) */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
          <Hug f={f} bg={pageBg} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 64, lineHeight: 1, color: INK }}>I rate myself</div>
            <div style={{ fontFamily: "Playfair Display", fontWeight: 800, fontSize: 104, lineHeight: 1.05, color: RED, marginLeft: 18, marginTop: 10 }}>
              <Circled f={f} a={s(1.0)} w={350} h={150} tick>10/10</Circled>
            </div>
          </div>
        </div>

        <div style={{ ...body, marginTop: 18 }}>
          <div>I was always a 10/10 friend.</div>
          <div>People just rated me as per their situation.</div>
          {gap()}
          <div>The moment I chose self-respect</div>
          <div>over selflessness, I became a {mark("9")}.</div>
          {gap(0.6)}
          <div>When I chose my peace over taking sides,</div>
          <div>I became an {mark("8")}.</div>
          {gap(0.6)}
          <div>The day I started saying no, I became a {mark("7")}.</div>
          {gap(0.6)}
          <div style={it}>With every choice I made for myself,</div>
          <div style={it}>my number dropped.</div>
          {/* small flourish */}
          <div style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center", color: RED, fontSize: 26, letterSpacing: 14, opacity: 0.8 }}>♥ ♥ ♥</div>
          <div>But you can’t be a 10/10 for everyone —</div>
          <div>people will number you as per their convenience.</div>
          {gap(0.6)}
          <div>What matters is whether you’re a 10/10</div>
          <div><span style={{ fontWeight: 700 }}>in your own eyes,</span></div>
          <div style={it}>as a friend, a sister, a daughter, a son.</div>
          {gap(0.8)}
          <div style={{ fontSize: 46 }}>And I still rate myself <span style={{ fontFamily: "Playfair Display", fontWeight: 800, color: RED, fontSize: 50, margin: "0 18px" }}><Circled f={f} a={s(2.6)} w={205} h={92}>10/10.</Circled></span></div>
        </div>

        <div style={{ marginTop: 34, textAlign: "center", fontFamily: "Caveat", fontWeight: 700, fontSize: 44, color: ROSE }}>words by — @trulyaariya</div>
      </div>
    </AbsoluteFill>
  );
};

export const Write02Glow: React.FC = () => <Write02Quote look="glow" />;
export const Write02Paper: React.FC = () => <Write02Quote look="paper" />;
