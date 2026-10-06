import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Background, clamp, exitP, prog, Waveform, Words } from "../components";
import { C, DISPLAY } from "../theme";

// 0–180: "You started a podcast to grow your business." → "Not to spend your weekends editing it."
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const out1 = exitP(frame, 88, 12);
  const out2 = exitP(frame, 166, 12);
  const strike = prog(frame, 140, 16);
  const waveIn = prog(frame, 0, 40);

  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", bottom: 120, opacity: 0.55 * waveIn * out2 }}>
          <Waveform width={1400} height={120} bars={70} color={C.violet} intensity={interpolate(frame, [0, 180], [0.4, 1])} />
        </div>

        {frame < 102 && (
          <div
            style={{
              opacity: out1,
              transform: `translateY(${(1 - out1) * -60}px) scale(${1 - (1 - out1) * 0.05})`,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Words text="You started a podcast" start={6} size={120} style={{ justifyContent: "center" }} />
            <Words
              text="to grow your business."
              start={22}
              size={120}
              highlight={{ grow: C.amber }}
              style={{ justifyContent: "center" }}
            />
          </div>
        )}

        {frame >= 98 && (
          <div
            style={{
              opacity: out2,
              transform: `scale(${1 + (1 - out2) * 0.15})`,
              filter: `blur(${(1 - out2) * 12}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Words text="Not to spend your weekends" start={100} size={110} color={C.mute} style={{ justifyContent: "center" }} />
            <div style={{ position: "relative", marginTop: 6 }}>
              <Words text="editing it." start={114} size={150} color={C.ink} style={{ justifyContent: "center" }} />
              <div
                style={{
                  position: "absolute",
                  left: -10,
                  top: "52%",
                  height: 12,
                  width: `calc(${strike * 100}% + 20px)`,
                  background: C.coral,
                  borderRadius: 6,
                  boxShadow: `0 0 30px ${C.coral}`,
                  transform: "rotate(-2deg)",
                }}
              />
            </div>
          </div>
        )}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 90,
          fontFamily: DISPLAY,
          fontSize: 30,
          color: C.mute,
          opacity: interpolate(frame, [0, 20, 160, 175], [0, 0.8, 0.8, 0], clamp),
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            background: C.coral,
            opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0.25,
            boxShadow: `0 0 18px ${C.coral}`,
          }}
        />
        REC
      </div>
    </AbsoluteFill>
  );
};
