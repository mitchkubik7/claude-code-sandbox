import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, getStaticFiles, staticFile } from "remotion";
import timing from "./timing.json";
import { fontCss } from "./theme";
import { Hook } from "./scenes/Hook";
import { Pain } from "./scenes/Pain";
import { Reveal } from "./scenes/Reveal";
import { How } from "./scenes/How";
import { Deliverables } from "./scenes/Deliverables";
import { Outcome } from "./scenes/Outcome";
import { Roster } from "./scenes/Roster";
import { CTA } from "./scenes/CTA";

const S = timing.scenes;

const SCENES: [keyof typeof S, React.FC][] = [
  ["hook", Hook],
  ["pain", Pain],
  ["reveal", Reveal],
  ["how", How],
  ["deliverables", Deliverables],
  ["outcome", Outcome],
  ["roster", Roster],
  ["cta", CTA],
];

export const Promo: React.FC = () => {
  const hasAudio = getStaticFiles().some((f) => f.name === "soundtrack.wav");
  return (
    <AbsoluteFill style={{ backgroundColor: "#07070D" }}>
      <style>{fontCss}</style>
      {SCENES.map(([name, Scene]) => (
        <Sequence key={name} name={name} from={S[name].from} durationInFrames={S[name].duration}>
          <Scene />
        </Sequence>
      ))}
      {hasAudio && <Html5Audio src={staticFile("soundtrack.wav")} />}
    </AbsoluteFill>
  );
};
