import { staticFile } from "remotion";

// AuthentIQ brand kit (Canva "Brand Kit"): orange for buttons/splash,
// deep blue + cyan combined as a gradient, white for text.
export const BRAND = {
  orange: "#FF9E18",
  blue: "#000B8C",
  cyan: "#00FFFF",
  white: "#FFFFFF",
};

export const C = {
  bg: "#00064A",
  bg2: "#000B8C",
  ink: BRAND.white,
  mute: "#AEB9EE",
  blue: BRAND.blue,
  cyan: BRAND.cyan,
  orange: BRAND.orange,
  card: "rgba(0,10,90,0.72)",
  stroke: "rgba(255,255,255,0.18)",
};

export const BRAND_GRADIENT = `linear-gradient(135deg, ${BRAND.blue} 0%, #0048D8 55%, ${BRAND.cyan} 130%)`;

// Montserrat for everything (brand kit: Messenger for headlines/logo — the
// logo PNG carries Messenger; Montserrat ExtraBold for body/captions).
export const DISPLAY = "'Montserrat', sans-serif";
export const BODY = "'Montserrat', sans-serif";

export const fontCss = `
@font-face { font-family: 'Montserrat'; src: url(${staticFile("fonts/Montserrat.woff2")}) format('woff2'); font-weight: 100 900; font-display: block; }
`;
