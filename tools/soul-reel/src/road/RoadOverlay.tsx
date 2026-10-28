import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { clamp01, seg01, smoother } from "../master/pose";
import { T } from "./beats";

const INK = "rgb(76,57,56)";
const GOLD = "rgb(145,116,51)";
const cl = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const out = Easing.bezier(0.16, 1, 0.3, 1);

const Word: React.FC<{ f: number; at: number; children: React.ReactNode; style?: React.CSSProperties; last?: boolean }> = ({ f, at, children, style, last }) => {
  const p = interpolate(f, [at, at + 18], [0, 1], { ...cl, easing: out });
  return (
    <span style={{ display: "inline-block", opacity: p, translate: `0px ${(1 - p) * 20}px`, filter: `blur(${(1 - p) * 9}px)`, marginRight: last ? 0 : "0.26em", ...style }}>
      {children}
    </span>
  );
};

const Block: React.FC<{ f: number; from: number; to: number; children: React.ReactNode; size?: number }> = ({ f, from, to, children, size = 86 }) => {
  if (f < from || f > to + 22) return null;
  const o = 1 - smoother(seg01(f, to, to + 20));
  return (
    <div style={{ position: "absolute", top: 360, left: 0, right: 0, textAlign: "center", fontFamily: "Cormorant", fontWeight: 400, fontSize: size, lineHeight: 1.18, color: INK,
      opacity: o, translate: `0px ${-(1 - o) * 26}px`, filter: `blur(${(1 - o) * 8}px)`, textShadow: "0 0 30px rgba(255,250,240,0.85)" }}>
      {children}
    </div>
  );
};

const Fibres: React.FC = () => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: 260 }, (_, i) => {
      const r = (k: number) => { const x = Math.sin((i + k * 97) * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
      const x = r(1) * 1080, y = r(2) * 1920, a = r(3) * 360, l = 8 + r(4) * 18;
      return <path key={i} d={`M0,0 q${l / 2},${(r(5) - 0.5) * 8} ${l},0`} transform={`translate(${x} ${y}) rotate(${a})`} stroke="rgb(170,160,148)" strokeWidth={0.9} fill="none" opacity={0.35 + 0.3 * r(6)} />;
    })}
  </svg>
);

export const RoadOverlay: React.FC<{ f: number }> = ({ f }) => {
  const write = interpolate(f, [410, 448], [0, 1], { ...cl, easing: Easing.bezier(0.4, 0, 0.3, 1) });
  const glowWord = 0.5 + 0.5 * Math.sin(f / 9);
  const card = smoother(seg01(f, T.wipe + 6, T.card + 6));
  const thread = interpolate(f, [T.card, T.card + 30], [0, 1], { ...cl, easing: Easing.bezier(0.45, 0, 0.25, 1) });
  const handle = interpolate(f, [T.card + 18, T.card + 40], [0, 1], { ...cl, easing: out });
  const label = interpolate(f, [T.card + 30, T.card + 52], [0, 1], { ...cl, easing: out });
  const wm = smoother(seg01(f, 10, 40)) * (1 - smoother(seg01(f, T.wipe - 12, T.wipe + 4)));
  return (
    <AbsoluteFill>
      <Block f={f} from={210} to={T.look0 + 4} size={84}>
        <div><Word f={f} at={T.race}>Life</Word><Word f={f} at={T.race + 7}>isn’t</Word><Word f={f} at={T.race + 14}>a</Word><Word f={f} at={T.race + 20} last>race.</Word></div>
        <div style={{ fontStyle: "italic" }}><Word f={f} at={T.road}>It’s</Word><Word f={f} at={T.road + 7}>a</Word><Word f={f} at={T.road + 13} last>road,</Word></div>
      </Block>

      <Block f={f} from={360} to={T.wipe - 4} size={80}>
        <div><Word f={f} at={364}>and</Word><Word f={f} at={370}>you</Word><Word f={f} at={376} last>deserve</Word></div>
        <div><Word f={f} at={384}>to</Word><Word f={f} at={390}>walk</Word><Word f={f} at={396} last>it</Word></div>
        <div><Word f={f} at={402}>at</Word><Word f={f} at={408} last>your</Word></div>
        <div style={{ position: "relative", display: "inline-block", marginTop: -4 }}>
          <span style={{ fontFamily: "Caveat", fontWeight: 700, fontSize: 128, color: GOLD, display: "inline-block", clipPath: `inset(-25% ${(1 - write) * 100}% -25% 0)`, textShadow: `0 0 ${18 + 10 * glowWord}px rgba(255,236,190,0.9)` }}>own pace.</span>
        </div>
      </Block>

      <div style={{ position: "absolute", top: 1800, left: 0, right: 0, textAlign: "center", fontFamily: "Jost", fontWeight: 300, fontSize: 30, letterSpacing: 2, color: INK, opacity: 0.35 * wm }}>@trulyaariya</div>

      {/* end card */}
      {f >= T.wipe && (
        <AbsoluteFill style={{ opacity: card, background: "radial-gradient(ellipse at 50% 45%, rgb(244,238,227) 0%, rgb(238,232,220) 60%, rgb(228,221,208) 100%)" }}>
          <Fibres />
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <defs>
              <linearGradient id="gold" x1="0" x2="1">
                <stop offset="0" stopColor="rgb(134,99,46)" /><stop offset="0.5" stopColor="rgb(205,168,92)" /><stop offset="1" stopColor="rgb(134,99,46)" />
              </linearGradient>
            </defs>
            <path d="M340,800 C410,801 470,800 522,798 C536,797 548,789 541,782 C533,775 520,786 530,794 C541,801 556,801 610,800 C670,799 705,801 740,800"
              fill="none" stroke="url(#gold)" strokeWidth={3.4} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - thread} />
          </svg>
          <div style={{ position: "absolute", top: 852, left: 0, right: 0, textAlign: "center", fontFamily: "Jost", fontWeight: 400, fontSize: 58, letterSpacing: 7, color: INK,
            opacity: handle, translate: `0px ${(1 - handle) * 14}px`, filter: `blur(${(1 - handle) * 6}px)` }}>
            @trulyaariya
          </div>
          <div style={{ position: "absolute", top: 955, left: 0, right: 0, textAlign: "center", fontFamily: "Jost", fontWeight: 400, fontSize: 27, letterSpacing: 5.5, color: GOLD,
            opacity: label, translate: `0px ${(1 - label) * 10}px` }}>
            A SELF REPAIRED SOUL · COMING SOON
          </div>
        </AbsoluteFill>
      )}

      {/* a gust of petals carries us to the end card */}
      {f >= T.wipe - 10 && f < T.card + 30 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 70 }, (_, i) => {
            const r = (k: number) => { const x = Math.sin((i + k * 53) * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };
            const p = clamp01((f - (T.wipe - 10) - r(1) * 14) / 34);
            if (p <= 0 || p >= 1) return null;
            const x = -120 + p * 1360 + 60 * Math.sin(p * 6 + i);
            const y = r(2) * 1920 - p * 160;
            return <path key={i} d="M0,-7 C5,-5 5,4 0,7 C-5,4 -5,-5 0,-7 Z" transform={`translate(${x} ${y}) rotate(${p * 500 + i * 40}) scale(${1.6 + r(3) * 1.6})`}
              fill={["#F6CFCB", "#FCE4DA", "#FFF3EA", "#EFC0C6"][i % 4]} opacity={Math.sin(p * Math.PI)} />;
          })}
        </svg>
      )}
    </AbsoluteFill>
  );
};
