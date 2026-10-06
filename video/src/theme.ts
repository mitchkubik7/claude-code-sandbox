import { staticFile } from "remotion";

export const C = {
  bg: "#07070D",
  bg2: "#11101C",
  ink: "#F6F4FF",
  mute: "#9C98B8",
  violet: "#7C5CFF",
  violetSoft: "#A894FF",
  amber: "#FFB23F",
  coral: "#FF5E5B",
  mint: "#3DDC97",
  card: "rgba(255,255,255,0.06)",
  stroke: "rgba(255,255,255,0.12)",
};

export const DISPLAY = "'Space Grotesk', sans-serif";
export const BODY = "'Inter', sans-serif";

export const fontCss = `
@font-face { font-family: 'Space Grotesk'; src: url(${staticFile("fonts/SpaceGrotesk.woff2")}) format('woff2'); font-weight: 300 700; font-display: block; }
@font-face { font-family: 'Inter'; src: url(${staticFile("fonts/Inter.woff2")}) format('woff2'); font-weight: 100 900; font-display: block; }
`;
