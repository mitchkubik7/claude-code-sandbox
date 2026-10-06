import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Background, clamp, ease, exitP, Icons, Label, prog, Waveform, Words } from "../components";
import { BODY, C, DISPLAY } from "../theme";

const STEPS = [
  {
    n: "01",
    title: "You hit record.",
    sub: "Show up and have a great conversation. That’s your whole job.",
  },
  {
    n: "02",
    title: "We handle everything after.",
    sub: "Editing, clips, captions, show notes and publishing — done for you.",
  },
  {
    n: "03",
    title: "Your show goes live. Everywhere.",
    sub: "Full episodes on YouTube and every audio platform, plus clips for social.",
  },
];

const STEP_LEN = 140;

/* ---- Illustrations ---- */

const RecordArt: React.FC<{ f: number }> = ({ f }) => {
  const pulse = 1 + 0.08 * Math.sin(f * 0.3);
  return (
    <div style={{ position: "relative", width: 640, height: 560, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {[0, 1, 2].map((i) => {
        const p = ((f + i * 20) % 60) / 60;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 220 + p * 380,
              height: 220 + p * 380,
              borderRadius: "50%",
              border: `2px solid ${C.violet}`,
              opacity: (1 - p) * 0.5,
            }}
          />
        );
      })}
      <div
        style={{
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.violet}, #4B2FE0)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${pulse})`,
          boxShadow: `0 30px 100px ${C.violet}88`,
        }}
      >
        <Icons.mic size={120} color={C.ink} stroke={1.6} />
      </div>
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 40,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 22px",
          borderRadius: 999,
          background: "rgba(255,94,91,0.15)",
          border: `1.5px solid ${C.coral}`,
          fontFamily: BODY,
          fontWeight: 700,
          fontSize: 28,
          color: C.coral,
        }}
      >
        <span style={{ width: 14, height: 14, borderRadius: 7, background: C.coral, opacity: Math.floor(f / 12) % 2 ? 0.3 : 1 }} />
        REC
      </div>
      <div style={{ position: "absolute", bottom: 10 }}>
        <Waveform width={560} height={90} bars={40} color={C.violetSoft} speed={1.4} />
      </div>
    </div>
  );
};

const EditArt: React.FC<{ f: number }> = ({ f }) => {
  const playhead = interpolate(f, [10, 130], [0, 1], { ...clamp, easing: ease });
  const tracks = [
    { color: C.violet, label: "VIDEO", segs: [[0, 0.22], [0.26, 0.55], [0.6, 1]] },
    { color: C.amber, label: "AUDIO", segs: [[0, 0.4], [0.44, 0.78], [0.82, 1]] },
    { color: C.mint, label: "CAPTIONS", segs: [[0.02, 0.18], [0.2, 0.36], [0.4, 0.58], [0.62, 0.8], [0.83, 0.98]] },
    { color: C.coral, label: "CLIPS", segs: [[0.12, 0.3], [0.5, 0.66], [0.78, 0.94]] },
  ];
  const W = 600;
  return (
    <div
      style={{
        width: 680,
        padding: 36,
        borderRadius: 28,
        background: "rgba(20,18,32,0.9)",
        border: `1.5px solid ${C.stroke}`,
        boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
        {[C.coral, C.amber, C.mint].map((c) => (
          <span key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
        ))}
      </div>
      {tracks.map((t, ti) => (
        <div key={t.label} style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: BODY, fontSize: 18, fontWeight: 700, letterSpacing: "0.15em", color: C.mute, marginBottom: 8 }}>
            {t.label}
          </div>
          <div style={{ position: "relative", height: 46, width: W }}>
            {t.segs.map(([a, b], si) => {
              const p = prog(f, 8 + ti * 8 + si * 5, 20);
              const lit = playhead > a;
              return (
                <div
                  key={si}
                  style={{
                    position: "absolute",
                    left: a * W,
                    width: (b - a) * W * p - 4,
                    height: 46,
                    borderRadius: 10,
                    background: t.color,
                    opacity: lit ? 0.95 : 0.35,
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          top: 70,
          bottom: 20,
          left: 36 + playhead * W,
          width: 4,
          background: C.ink,
          borderRadius: 2,
          boxShadow: `0 0 20px ${C.ink}`,
        }}
      />
    </div>
  );
};

const PublishArt: React.FC<{ f: number }> = ({ f }) => {
  const { fps } = useVideoConfig();
  const nodes: { icon: keyof typeof Icons; x: number; y: number; label: string; c: string }[] = [
    { icon: "play", x: -230, y: -170, label: "YouTube", c: C.coral },
    { icon: "headphones", x: 230, y: -170, label: "Audio platforms", c: C.violetSoft },
    { icon: "phone", x: -230, y: 170, label: "Short clips", c: C.amber },
    { icon: "calendar", x: 230, y: 170, label: "Scheduled", c: C.mint },
  ];
  return (
    <div style={{ position: "relative", width: 700, height: 600 }}>
      <svg width={700} height={600} style={{ position: "absolute", inset: 0 }}>
        {nodes.map((n, i) => {
          const p = prog(f, 10 + i * 8, 24);
          return (
            <line
              key={i}
              x1={350}
              y1={300}
              x2={350 + n.x * p}
              y2={300 + n.y * p}
              stroke={n.c}
              strokeWidth={3}
              strokeDasharray="8 10"
              strokeDashoffset={-f * 2}
              opacity={0.7}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 350 - 90,
          top: 300 - 90,
          width: 180,
          height: 180,
          borderRadius: 48,
          background: `linear-gradient(135deg, ${C.violet}, #4B2FE0)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 30px 90px ${C.violet}88`,
        }}
      >
        <Icons.mic size={90} />
      </div>
      {nodes.map((n, i) => {
        const s = spring({ frame: f - (24 + i * 8), fps, config: { damping: 11, stiffness: 150 } });
        const Ico = Icons[n.icon];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 350 + n.x - 80,
              top: 300 + n.y - 70,
              width: 160,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              transform: `scale(${s})`,
            }}
          >
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: 30,
                background: "rgba(22,20,34,0.95)",
                border: `2px solid ${n.c}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ico size={56} color={n.c} />
            </div>
            <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 24, color: C.ink, whiteSpace: "nowrap" }}>{n.label}</div>
          </div>
        );
      })}
    </div>
  );
};

const ART = [RecordArt, EditArt, PublishArt];

// 0–420: three 140-frame steps.
export const How: React.FC = () => {
  const frame = useCurrentFrame();
  const out = exitP(frame, 406, 14);
  const idx = Math.min(2, Math.floor(frame / STEP_LEN));
  const local = frame - idx * STEP_LEN;
  const step = STEPS[idx];
  const Art = ART[idx];
  const isLast = idx === 2;
  const stepOut = isLast ? 1 : exitP(local, STEP_LEN - 12, 12);
  const artIn = prog(local, 4, 26);

  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Background hue={[C.violet, C.amber, C.mint][idx]} hue2={C.violet} />

      <div style={{ position: "absolute", top: 90, left: 140 }}>
        <Label start={2}>How it works</Label>
      </div>

      {/* progress rail */}
      <div style={{ position: "absolute", left: 140, top: 200, bottom: 200, width: 6, borderRadius: 3, background: C.stroke }}>
        <div
          style={{
            width: 6,
            borderRadius: 3,
            background: `linear-gradient(${C.violet}, ${C.amber})`,
            height: `${interpolate(frame, [0, 400], [8, 100], clamp)}%`,
          }}
        />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -9,
              top: `${i * 50}%`,
              width: 24,
              height: 24,
              borderRadius: 12,
              marginTop: -12,
              background: i <= idx ? C.amber : C.bg2,
              border: `3px solid ${i <= idx ? C.amber : C.stroke}`,
            }}
          />
        ))}
      </div>

      <AbsoluteFill
        key={idx}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: 230,
          paddingRight: 120,
          opacity: stepOut,
          transform: `translateY(${(1 - stepOut) * -40}px)`,
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 30 }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 150,
              lineHeight: 1,
              color: "transparent",
              WebkitTextStroke: `2px ${C.violetSoft}`,
              opacity: prog(local, 0, 20),
              transform: `translateX(${(1 - prog(local, 0, 20)) * -40}px)`,
            }}
          >
            {step.n}
          </div>
          <Words text={step.title} start={6} size={92} style={{ maxWidth: 900 }} highlight={{ everything: C.amber, Everywhere: C.amber }} />
          <div
            style={{
              fontFamily: BODY,
              fontSize: 38,
              lineHeight: 1.4,
              color: C.mute,
              maxWidth: 800,
              opacity: prog(local, 24, 20),
              transform: `translateY(${(1 - prog(local, 24, 20)) * 20}px)`,
            }}
          >
            {step.sub}
          </div>
        </div>
        <div style={{ width: 720, display: "flex", justifyContent: "center", opacity: artIn, transform: `scale(${0.85 + 0.15 * artIn})` }}>
          <Art f={local} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
