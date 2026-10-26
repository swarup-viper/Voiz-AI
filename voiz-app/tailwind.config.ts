import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        voiz: {
          midnight: "#17132B",
          card: "#201B3B",
          cardBorder: "#2E2854",
          cardHover: "#28224A",
          pink: "#FF4FA3",
          purple: "#9B5DE5",
          coral: "#FF8066",
          yellow: "#FFE66D",
          warmWhite: "#FFF9F5",
          lavender: "#F0E7FF",
          blush: "#FFE4F0",
          softWhite: "#FAF7FF",
          deepNavy: "#211B38",
          slate: "#77738A",
          border: "#2F2852",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
