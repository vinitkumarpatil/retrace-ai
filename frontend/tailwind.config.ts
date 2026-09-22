import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        console: {
          bg: "#0A0D13",
          s1: "#10141C",
          s2: "#161B26",
          s3: "#1D2432",
          border: "#232B3A",
          "border-strong": "#2E3849",
          ink: "#E7EBF3",
          dim: "#9AA5B8",
          mute: "#616C7E",
          cyan: {
            DEFAULT: "#2DD4E8",
            dim: "#1B94A6",
          },
          violet: {
            DEFAULT: "#A78BFA",
            dim: "#7C5CE0",
          },
          emerald: "#34D399",
          amber: "#FBBF24",
          rose: "#FB7185",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
