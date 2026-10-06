import React from "react";
import { Composition } from "remotion";
import { Promo } from "./Promo";
import timing from "./timing.json";

export const Root: React.FC = () => (
  <Composition
    id="AuthentIQPromo"
    component={Promo}
    durationInFrames={timing.totalFrames}
    fps={timing.fps}
    width={1920}
    height={1080}
  />
);
