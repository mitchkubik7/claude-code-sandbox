import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background, clamp, exitP, Flash, BrandLogo, prog, useSpring, Words } from "../components";
import { BODY, C } from "../theme";

// 0–180. Impact on 0.
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const mark = useSpring(2, 10, 140);
  const word = prog(frame, 2, 30);
  const out = exitP(frame, 166, 14);
  const ring = (d: number) => interpolate(frame, [d, d + 40], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ opacity: out, transform: `scale(${1 + (1 - out) * 0.08})` }}>
      <Background />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {[0, 8, 16].map((d) => (
          <div
            key={d}
            style={{
              position: "absolute",
              width: 300 + ring(d) * 1400,
              height: 300 + ring(d) * 1400,
              borderRadius: "50%",
              border: `2px solid ${C.cyan}`,
              opacity: (1 - ring(d)) * 0.6,
            }}
          />
        ))}

        <div
          style={{
            marginTop: -90,
            transform: `scale(${0.85 + 0.15 * mark})`,
            clipPath: `inset(-10% ${(1 - word) * 100}% -10% 0)`,
            filter: `drop-shadow(0 20px 60px rgba(0,0,40,0.45))`,
          }}
        >
          <BrandLogo width={1150} />
        </div>

        <div style={{ position: "absolute", top: 650, display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
          <Words
            text="Done-for-you podcast production."
            start={40}
            size={64}
            weight={500}
            color={C.mute}
            style={{ justifyContent: "center" }}
          />
          <div
            style={{
              opacity: prog(frame, 90, 20),
              transform: `translateY(${(1 - prog(frame, 90, 20)) * 20}px)`,
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 40,
              color: C.ink,
              padding: "16px 36px",
              borderRadius: 999,
              background: "rgba(0,255,255,0.10)",
              border: `1.5px solid ${C.cyan}`,
            }}
          >
            You record. <span style={{ color: C.orange }}>We handle everything after.</span>
          </div>
        </div>
      </AbsoluteFill>
      <Flash at={0} />
    </AbsoluteFill>
  );
};
