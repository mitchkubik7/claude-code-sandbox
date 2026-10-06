import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, exitP, prog, Words } from "../components";
import { BODY, C, DISPLAY } from "../theme";

// 0–120. Slots light at 20 + 7i.
export const Roster: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = exitP(frame, 108, 12);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Background hue={C.amber} hue2={C.violet} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 64 }}>
        <Words
          text="We only take on 10 shows at a time."
          start={0}
          stagger={2}
          size={96}
          highlight={{ "10": C.amber }}
          style={{ justifyContent: "center" }}
        />
        <div style={{ display: "flex", gap: 28 }}>
          {new Array(10).fill(0).map((_, i) => {
            const s = spring({ frame: frame - (18 + i * 7), fps, config: { damping: 10, stiffness: 200, mass: 0.6 } });
            return (
              <div
                key={i}
                style={{
                  width: 104,
                  height: 104,
                  borderRadius: 30,
                  border: `2.5px solid ${s > 0.5 ? C.amber : C.stroke}`,
                  background: s > 0.5 ? `${C.amber}22` : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${0.8 + 0.2 * s})`,
                  boxShadow: s > 0.5 ? `0 0 40px ${C.amber}55` : "none",
                  fontFamily: DISPLAY,
                  fontWeight: 700,
                  fontSize: 40,
                  color: s > 0.5 ? C.amber : C.mute,
                }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontSize: 42,
            color: C.mute,
            opacity: prog(frame, 70, 20),
            transform: `translateY(${(1 - prog(frame, 70, 20)) * 16}px)`,
          }}
        >
          So every show gets our <span style={{ color: C.ink, fontWeight: 600 }}>full attention.</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
