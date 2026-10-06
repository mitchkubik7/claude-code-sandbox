import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background, clamp, ease, Flash, BrandLogo, prog, useSpring, Words } from "../components";
import { BODY, C, DISPLAY } from "../theme";

// 0–180. Impact on 0, cursor click on 96.
export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const btn = useSpring(30, 12, 140);
  const CLICK = 96;
  const cursorP = interpolate(frame, [58, CLICK - 2], [0, 1], { ...clamp, easing: ease });
  const press = interpolate(frame, [CLICK - 2, CLICK, CLICK + 6], [1, 0.94, 1], clamp);
  const ripple = interpolate(frame, [CLICK, CLICK + 24], [0, 1], clamp);
  const clicked = frame >= CLICK;
  const shine = interpolate(frame, [40, 80], [-30, 130], clamp);
  const footer = prog(frame, 112, 24);

  return (
    <AbsoluteFill>
      <Background hue={C.cyan} hue2={C.orange} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 56, marginTop: -60 }}>
        <Words text="Ready to make your podcast effortless?" start={4} stagger={3} size={92} highlight={{ effortless: C.orange }} style={{ justifyContent: "center", maxWidth: 1500 }} />

        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: -20 - ripple * 60,
              borderRadius: 999,
              border: `3px solid ${C.orange}`,
              opacity: clicked ? 1 - ripple : 0,
            }}
          />
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              transform: `scale(${btn * press})`,
              padding: "40px 84px",
              borderRadius: 999,
              background: clicked ? "#FFB547" : C.orange,
              boxShadow: `0 30px 100px ${C.orange}${clicked ? "AA" : "66"}`,
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 60,
              letterSpacing: "-0.02em",
              color: C.blue,
              display: "flex",
              alignItems: "center",
              gap: 26,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: `${shine}%`,
                width: 120,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                transform: "skewX(-20deg)",
              }}
            />
            Book your discovery call
            <span style={{ fontSize: 60 }}>→</span>
          </div>

          {/* cursor */}
          <svg
            width={64}
            height={64}
            viewBox="0 0 24 24"
            style={{
              position: "absolute",
              left: interpolate(cursorP, [0, 1], [900, 560]),
              top: interpolate(cursorP, [0, 1], [380, 90]),
              opacity: interpolate(frame, [58, 66, 140, 150], [0, 1, 1, 0], clamp),
              transform: `scale(${clicked && frame < CLICK + 6 ? 0.85 : 1})`,
              filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.5))",
            }}
          >
            <path d="M4 2l16 9.5-7 1.6-3.6 6.6z" fill={C.ink} stroke={C.bg} strokeWidth={1.4} strokeLinejoin="round" />
          </svg>
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          bottom: 90,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 30,
          opacity: footer,
          transform: `translateY(${(1 - footer) * 30}px)`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <BrandLogo width={520} />
          <div style={{ fontFamily: BODY, fontSize: 38, color: C.ink, fontWeight: 600, letterSpacing: "0.02em" }}>authentiqmarketing.com</div>
        </div>
      </div>
      <Flash at={0} />
    </AbsoluteFill>
  );
};
