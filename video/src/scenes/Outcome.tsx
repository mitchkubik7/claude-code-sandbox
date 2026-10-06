import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, clamp, DrawCheck, exitP, prog, Words } from "../components";
import { BODY, C } from "../theme";

const NOTES = [
  { t: "New episode is live", s: "YouTube · Audio platforms", x: 1230, y: 170 },
  { t: "3 clips scheduled", s: "This week’s social posts", x: 110, y: 730 },
  { t: "Captions + show notes added", s: "Ready for your audience", x: 1180, y: 790 },
];

// 0–180. Notifications land at 60 / 90 / 120.
export const Outcome: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = exitP(frame, 166, 14);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Background hue={C.cyan} hue2={C.orange} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {[0, 1, 2, 3].map((i) => {
          const p = ((frame + i * 22) % 88) / 88;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 400 + p * 1500,
                height: 400 + p * 1500,
                borderRadius: "50%",
                border: `1.5px solid ${C.cyan}`,
                opacity: (1 - p) * 0.35 * prog(frame, 0, 20),
              }}
            />
          );
        })}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <Words text="You focus on the conversation." start={4} size={100} style={{ justifyContent: "center" }} />
          <Words
            text="We make sure it gets heard."
            start={26}
            size={100}
            color={C.mute}
            highlight={{ heard: C.orange }}
            style={{ justifyContent: "center" }}
          />
        </div>
      </AbsoluteFill>

      {NOTES.map((n, i) => {
        const at = 60 + i * 30;
        const s = spring({ frame: frame - (at - 4), fps, config: { damping: 14, stiffness: 160 } });
        const fromRight = n.x > 900;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: n.x,
              top: n.y,
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "22px 30px",
              borderRadius: 24,
              background: "rgba(0,10,90,0.82)",
              border: `1.5px solid ${C.stroke}`,
              boxShadow: "0 24px 70px rgba(0,0,0,0.5)",
              opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
              transform: `translateX(${(1 - s) * (fromRight ? 200 : -200)}px)`,
            }}
          >
            <DrawCheck p={prog(frame, at, 14)} size={52} />
            <div>
              <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 30, color: C.ink }}>{n.t}</div>
              <div style={{ fontFamily: BODY, fontSize: 22, color: C.mute, marginTop: 4 }}>{n.s}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
