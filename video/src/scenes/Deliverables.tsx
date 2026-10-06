import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, DrawCheck, exitP, Icons, Label, prog, Words } from "../components";
import { BODY, C, DISPLAY } from "../theme";

const ITEMS: { icon: keyof typeof Icons; title: string; sub: string; c: string }[] = [
  { icon: "scissors", title: "Video & audio editing", sub: "Tight, clean, professional", c: C.cyan },
  { icon: "phone", title: "Short-form clips", sub: "Made for social feeds", c: C.orange },
  { icon: "captions", title: "Captions", sub: "On every video", c: C.cyan },
  { icon: "notes", title: "Show notes", sub: "Written for you", c: C.cyan },
  { icon: "broadcast", title: "Publishing", sub: "YouTube + all audio platforms", c: C.orange },
  { icon: "calendar", title: "Scheduling", sub: "Consistent, on time", c: C.cyan },
];

// 0–300. Cards land at 42 + 18i.
export const Deliverables: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = exitP(frame, 286, 14);
  const tagIn = prog(frame, 196, 24);

  return (
    <AbsoluteFill style={{ opacity: out, transform: `scale(${1 + (1 - out) * 0.06})` }}>
      <Background hue={C.cyan} hue2={C.cyan} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
        <Label start={0}>What’s included</Label>
        <div style={{ height: 26 }} />
        <Words
          text="Everything after the recording. Handled."
          start={6}
          size={84}
          highlight={{ Handled: C.orange }}
          style={{ justifyContent: "center", maxWidth: 1600 }}
        />

        <div
          style={{
            marginTop: 72,
            display: "grid",
            gridTemplateColumns: "repeat(3, 540px)",
            gap: 32,
          }}
        >
          {ITEMS.map((it, i) => {
            const at = 42 + i * 18;
            const s = spring({ frame: frame - (at - 6), fps, config: { damping: 13, stiffness: 150, mass: 0.7 } });
            const check = prog(frame, at + 6, 16);
            const Ico = Icons[it.icon];
            return (
              <div
                key={it.title}
                style={{
                  height: 230,
                  borderRadius: 28,
                  padding: "0 34px",
                  display: "flex",
                  alignItems: "center",
                  gap: 26,
                  background: "rgba(0,10,90,0.82)",
                  border: `1.5px solid ${C.stroke}`,
                  boxShadow: "0 24px 70px rgba(0,0,0,0.45)",
                  transform: `translateY(${(1 - s) * 80}px) scale(${0.9 + 0.1 * s})`,
                  opacity: Math.min(1, s * 1.4),
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: 92,
                    height: 92,
                    flexShrink: 0,
                    borderRadius: 24,
                    background: `${it.c}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ico size={50} color={it.c} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: C.ink, letterSpacing: "-0.02em" }}>{it.title}</div>
                  <div style={{ fontFamily: BODY, fontSize: 27, color: C.mute }}>{it.sub}</div>
                </div>
                <div style={{ position: "absolute", top: 18, right: 18 }}>
                  <DrawCheck p={check} size={40} />
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 60,
            opacity: tagIn,
            transform: `translateY(${(1 - tagIn) * 20}px)`,
            fontFamily: DISPLAY,
            fontSize: 48,
            fontWeight: 500,
            color: C.mute,
          }}
        >
          One team. <span style={{ color: C.ink }}>Zero editing on your plate.</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
