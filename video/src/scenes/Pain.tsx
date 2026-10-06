import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, clamp, easeIn, Icons, Label, prog } from "../components";
import { BODY, C, DISPLAY } from "../theme";

const TASKS: { t: string; x: number; y: number; r: number; icon: keyof typeof Icons }[] = [
  { t: "Cut the audio", x: 180, y: 300, r: -6, icon: "scissors" },
  { t: "Sync the cameras", x: 1180, y: 250, r: 5, icon: "play" },
  { t: "Pull the best clips", x: 640, y: 420, r: -3, icon: "scissors" },
  { t: "Write captions", x: 1340, y: 520, r: -7, icon: "captions" },
  { t: "Draft show notes", x: 240, y: 600, r: 4, icon: "notes" },
  { t: "Design thumbnails", x: 860, y: 640, r: 7, icon: "play" },
  { t: "Upload to YouTube", x: 420, y: 820, r: -4, icon: "broadcast" },
  { t: "Publish the audio", x: 1180, y: 780, r: 3, icon: "headphones" },
  { t: "Schedule social posts", x: 760, y: 220, r: -2, icon: "calendar" },
];

// 0–240. Chips pop 32 + 14i. Slams at 175 / 190 / 205. Implode from 222.
export const Pain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const implode = interpolate(frame, [222, 240], [0, 1], { ...clamp, easing: easeIn });
  const stress = interpolate(frame, [30, 170], [0, 1], clamp);
  const shake = (seed: number) => Math.sin(frame * 1.7 + seed) * stress * 4;
  const dim = interpolate(frame, [165, 178], [1, 0.25], clamp);

  const slamWords = ["Every.", "Single.", "Episode."];

  return (
    <AbsoluteFill style={{ transform: `scale(${1 - implode * 0.6})`, opacity: 1 - implode, filter: `blur(${implode * 10}px)` }}>
      <Background hue={C.coral} hue2={C.violet} />

      <div style={{ position: "absolute", top: 90, left: 110, opacity: dim }}>
        <Label start={4} color={C.coral}>
          After every recording…
        </Label>
      </div>

      {/* clock */}
      <div
        style={{
          position: "absolute",
          top: 70,
          right: 110,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: prog(frame, 10, 20) * dim,
          fontFamily: DISPLAY,
          fontSize: 44,
          fontWeight: 700,
          color: C.ink,
        }}
      >
        <div style={{ transform: `rotate(${frame * 6}deg)` }}>
          <Icons.clock size={56} color={C.coral} />
        </div>
        {`${Math.floor(interpolate(frame, [20, 170], [0, 9], clamp))}h ${String(Math.floor(interpolate(frame, [20, 170], [0, 59], clamp) * 7) % 60).padStart(2, "0")}m`}
      </div>

      {TASKS.map((task, i) => {
        const s = spring({ frame: frame - (32 + i * 14), fps, config: { damping: 11, stiffness: 160, mass: 0.7 } });
        const Ico = Icons[task.icon];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: task.x + shake(i),
              top: task.y + shake(i + 3),
              transform: `scale(${s}) rotate(${task.r * s}deg)`,
              opacity: Math.min(1, s * 1.5) * dim,
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "22px 34px",
              borderRadius: 22,
              background: "rgba(22,20,34,0.92)",
              border: `1.5px solid ${C.stroke}`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              fontFamily: BODY,
              fontSize: 36,
              fontWeight: 600,
              color: C.ink,
              whiteSpace: "nowrap",
            }}
          >
            <Ico size={40} color={C.coral} />
            {task.t}
          </div>
        );
      })}

      {/* Every. Single. Episode. */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 0, flexDirection: "row" }}>
        {slamWords.map((w, i) => {
          const at = 175 + i * 15;
          const s = spring({ frame: frame - at, fps, config: { damping: 9, stiffness: 220, mass: 0.6 } });
          const visible = frame >= at;
          return (
            <span
              key={w}
              style={{
                display: "inline-block",
                margin: "0 20px",
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 150,
                letterSpacing: "-0.04em",
                color: i === 2 ? C.coral : C.ink,
                opacity: visible ? 1 : 0,
                transform: `scale(${interpolate(s, [0, 1], [2.4, 1])})`,
                textShadow: "0 20px 80px rgba(0,0,0,0.6)",
              }}
            >
              {w}
            </span>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
