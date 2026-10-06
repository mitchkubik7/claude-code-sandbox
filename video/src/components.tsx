import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BODY, C, DISPLAY } from "./theme";

export const ease = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 → 1 over [start, start + dur] with an expo-out curve. */
export const prog = (frame: number, start: number, dur: number, e = ease) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: e });

export const useSpring = (delay: number, damping = 14, stiffness = 120) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness, mass: 0.8 } });
};

/** Exit helper: 1 while visible, falls to 0 over [start, start + dur]. */
export const exitP = (frame: number, start: number, dur = 12) =>
  1 - interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing: easeIn });

/* ---------- Background ---------- */

export const Background: React.FC<{ hue?: string; hue2?: string }> = ({
  hue = C.violet,
  hue2 = C.amber,
}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const x1 = 30 + Math.sin(t * 0.35) * 12;
  const y1 = 30 + Math.cos(t * 0.27) * 10;
  const x2 = 72 + Math.cos(t * 0.31) * 10;
  const y2 = 74 + Math.sin(t * 0.22) * 8;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${x1}% ${y1}%, ${hue}55 0%, transparent 45%),
                       radial-gradient(circle at ${x2}% ${y2}%, ${hue2}30 0%, transparent 40%)`,
          filter: "blur(40px)",
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          backgroundPosition: `0px ${(frame * 0.4) % 80}px`,
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* ---------- Text ---------- */

type WordsProps = {
  text: string;
  start: number;
  stagger?: number;
  size?: number;
  weight?: number;
  color?: string;
  font?: string;
  highlight?: Record<string, string>;
  style?: React.CSSProperties;
  lineHeight?: number;
  letterSpacing?: number;
};

/** Masked, staggered word-by-word rise. */
export const Words: React.FC<WordsProps> = ({
  text,
  start,
  stagger = 3,
  size = 96,
  weight = 700,
  color = C.ink,
  font = DISPLAY,
  highlight = {},
  style,
  lineHeight = 1.08,
  letterSpacing = -0.03,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");
  return (
    <div
      style={{
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight,
        letterSpacing: `${letterSpacing}em`,
        display: "flex",
        flexWrap: "wrap",
        columnGap: size * 0.26,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = prog(frame, start + i * stagger, 22);
        const clean = w.replace(/[.,!?—]/g, "");
        return (
          <span
            key={i}
            style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.12, marginBottom: -size * 0.12 }}
          >
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${(1 - p) * 110}%) rotate(${(1 - p) * 6}deg)`,
                color: highlight[clean] ?? color,
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

export const Label: React.FC<{ children: React.ReactNode; start: number; color?: string }> = ({
  children,
  start,
  color = C.violetSoft,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, start, 20);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        fontFamily: BODY,
        fontWeight: 600,
        fontSize: 26,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        opacity: p,
        transform: `translateX(${(1 - p) * -30}px)`,
      }}
    >
      <span style={{ width: 40 * p, height: 3, background: color, borderRadius: 2 }} />
      {children}
    </div>
  );
};

/* ---------- Brand mark ---------- */

/** Logo mark: rounded square holding an animated waveform. */
export const LogoMark: React.FC<{ size?: number; live?: boolean }> = ({ size = 140, live = true }) => {
  const frame = useCurrentFrame();
  const bars = [0.35, 0.7, 1, 0.55, 0.85, 0.45];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: `linear-gradient(135deg, ${C.violet}, #4B2FE0)`,
        boxShadow: `0 ${size * 0.15}px ${size * 0.5}px ${C.violet}66, inset 0 1px 0 rgba(255,255,255,0.35)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: size * 0.05,
      }}
    >
      {bars.map((b, i) => {
        const wobble = live ? 0.75 + 0.25 * Math.sin(frame * 0.25 + i * 1.3) : 1;
        return (
          <div
            key={i}
            style={{
              width: size * 0.07,
              height: size * 0.55 * b * wobble,
              borderRadius: size,
              background: i === 2 ? C.amber : C.ink,
            }}
          />
        );
      })}
    </div>
  );
};

export const Wordmark: React.FC<{ size?: number }> = ({ size = 120 }) => (
  <div
    style={{
      fontFamily: DISPLAY,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: "-0.04em",
      color: C.ink,
      lineHeight: 1,
    }}
  >
    Authent<span style={{ color: C.amber }}>IQ</span>
  </div>
);

/* ---------- Waveform ---------- */

export const Waveform: React.FC<{
  bars?: number;
  width: number;
  height: number;
  color?: string;
  speed?: number;
  seed?: number;
  intensity?: number;
}> = ({ bars = 48, width, height, color = C.violet, speed = 1, seed = 0, intensity = 1 }) => {
  const frame = useCurrentFrame();
  const gap = width / bars;
  return (
    <div style={{ width, height, display: "flex", alignItems: "center", gap: gap * 0.35 }}>
      {new Array(bars).fill(0).map((_, i) => {
        const env = Math.sin((i / bars) * Math.PI);
        const v =
          0.5 +
          0.3 * Math.sin(frame * 0.21 * speed + i * 0.7 + seed) +
          0.2 * Math.sin(frame * 0.37 * speed + i * 1.9 + seed * 2);
        const h = Math.max(6, height * env * v * intensity);
        return (
          <div
            key={i}
            style={{ width: gap * 0.65, height: h, background: color, borderRadius: 999, opacity: 0.4 + 0.6 * env }}
          />
        );
      })}
    </div>
  );
};

/* ---------- Icons (simple line icons) ---------- */

const icon = (d: React.ReactNode) => (props: { size?: number; color?: string; stroke?: number }) => (
  <svg
    width={props.size ?? 64}
    height={props.size ?? 64}
    viewBox="0 0 24 24"
    fill="none"
    stroke={props.color ?? C.ink}
    strokeWidth={props.stroke ?? 1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d}
  </svg>
);

export const Icons = {
  mic: icon(
    <>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v4M8 22h8" />
    </>
  ),
  scissors: icon(
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" />
    </>
  ),
  phone: icon(
    <>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M11 18h2" />
      <path d="m10.5 8.5 4 2.5-4 2.5z" />
    </>
  ),
  captions: icon(
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M10 10.5a2 2 0 1 0 0 3M16.5 10.5a2 2 0 1 0 0 3" />
    </>
  ),
  notes: icon(
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </>
  ),
  broadcast: icon(
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19.1 4.9a10 10 0 0 1 0 14.2M4.9 19.1a10 10 0 0 1 0-14.2" />
    </>
  ),
  calendar: icon(
    <>
      <rect x="3" y="4" width="18" height="18" rx="2.5" />
      <path d="M16 2v4M8 2v4M3 10h18M8 15l2.5 2.5L16 13" />
    </>
  ),
  headphones: icon(
    <>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z" />
    </>
  ),
  play: icon(
    <>
      <rect x="2" y="4" width="20" height="16" rx="4" />
      <path d="m10 9 5 3-5 3z" />
    </>
  ),
  check: icon(<path d="M20 6 9 17l-5-5" />),
  clock: icon(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
};

/** Check mark that draws itself. */
export const DrawCheck: React.FC<{ p: number; size?: number; color?: string }> = ({ p, size = 40, color = C.mint }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="11" fill={color} opacity={Math.min(1, p * 2) * 0.18} />
    <path
      d="M7 12.5 10.5 16 17 8.5"
      stroke={color}
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={20}
      strokeDashoffset={20 * (1 - p)}
    />
  </svg>
);

/** Full-frame flash used on hard cuts. */
export const Flash: React.FC<{ at: number; color?: string }> = ({ at, color = "#fff" }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 2, at + 14], [0, 0.55, 0], clamp);
  return <AbsoluteFill style={{ background: color, opacity: o, pointerEvents: "none" }} />;
};
