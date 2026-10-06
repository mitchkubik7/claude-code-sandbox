import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background, clamp, exitP, Flash, LogoMark, prog, useSpring, Words } from "../components";
import { BODY, C } from "../theme";

// 0–180. Impact on 0.
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const mark = useSpring(2, 10, 140);
  const word = prog(frame, 14, 26);
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
              border: `2px solid ${C.violet}`,
              opacity: (1 - ring(d)) * 0.6,
            }}
          />
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: 44, marginTop: -60 }}>
          <div style={{ transform: `scale(${mark}) rotate(${(1 - mark) * -90}deg)` }}>
            <LogoMark size={190} />
          </div>
          <div style={{ overflow: "hidden", paddingBottom: 12 }}>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: 190,
                letterSpacing: "-0.045em",
                color: C.ink,
                lineHeight: 1,
                clipPath: `inset(0 ${(1 - word) * 100}% 0 0)`,
                transform: `translateX(${(1 - word) * -40}px)`,
              }}
            >
              Authent<span style={{ color: C.amber }}>IQ</span>
            </div>
          </div>
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
              background: "rgba(124,92,255,0.18)",
              border: `1.5px solid ${C.violet}`,
            }}
          >
            You record. <span style={{ color: C.amber }}>We handle everything after.</span>
          </div>
        </div>
      </AbsoluteFill>
      <Flash at={0} />
    </AbsoluteFill>
  );
};
