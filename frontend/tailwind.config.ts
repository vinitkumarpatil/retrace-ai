import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Exact User-Specified Palette
        app: {
          bg: "#05070D",
          secondary: "#0B101A",
          surface: "#101722",
          elevated: "#151D29",
          border: "#243044",
          borderLight: "#334155",
          text: "#F8FAFC",
          muted: "#94A3B8",
          dim: "#64748B",
        },
        accent: {
          cyan: "#00F2FE",
          cyanMuted: "#0284C7",
          violet: "#8B5CF6",
          violetMuted: "#6D28D9",
          emerald: "#10B981",
          amber: "#F59E0B",
          red: "#EF4444",
        },
        // Semantic aliases
        cosmic: {
          bg: "#05070D",
          panel: "#0B101A",
          card: "#101722",
          elevated: "#151D29",
          border: "#243044",
          borderLight: "#334155",
        },
        cyber: {
          cyan: "#00F2FE",
          violet: "#8B5CF6",
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#EF4444",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "sonar": "sonar 2s cubic-bezier(0, 0.2, 0.8, 1) infinite",
        "fade-in": "fadeIn 0.2s ease-out forwards",
      },
      keyframes: {
        sonar: {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
