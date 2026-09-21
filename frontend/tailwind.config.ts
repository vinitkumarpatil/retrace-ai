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
        cosmic: {
          bg: "#040714",
          panel: "#0A0F24",
          card: "#0E1630",
          cardElevated: "#131C3C",
          hover: "#18244D",
          border: "#1E2C54",
          borderLight: "#2B3F73",
        },
        neon: {
          cyan: "#00F2FE",
          cyanMuted: "#0284C7",
          violet: "#A855F7",
          violetGlow: "#8B5CF6",
          emerald: "#00DF89",
          emeraldMuted: "#059669",
          pink: "#FF007A",
          rose: "#F43F5E",
          amber: "#FBBF24",
          blue: "#38BDF8",
        },
        obsidian: {
          base: "#040714",
          panel: "#0A0F24",
          card: "#0E1630",
          hover: "#18244D",
          border: "#1E2C54",
          borderLight: "#2B3F73",
        },
        cyber: {
          amber: "#FBBF24",
          amberMuted: "#D97706",
          emerald: "#00DF89",
          emeraldMuted: "#059669",
          cyan: "#00F2FE",
          cyanMuted: "#0284C7",
          indigo: "#818CF8",
          rose: "#FF007A",
          violet: "#A855F7",
        },
        blueprint: {
          bg: "#040714",
          panel: "#0A0F24",
          subtle: "#0E1630",
          border: "#1E2C54",
          ink: "#F8FAFC",
          muted: "#94A3B8",
          grid: "rgba(0, 242, 254, 0.05)",
          ochre: {
            DEFAULT: "#FBBF24",
            light: "#FEF3C7",
            dark: "#D97706",
          },
          sage: {
            DEFAULT: "#00DF89",
            light: "#D1FAE5",
            dark: "#059669",
          },
          rust: {
            DEFAULT: "#FF007A",
            light: "#FFE4E6",
            dark: "#BE123C",
          },
          navy: {
            DEFAULT: "#0E1630",
            light: "#18244D",
            dark: "#040714",
          }
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "shimmer": "shimmer 2.5s linear infinite",
        "float": "float 3.5s ease-in-out infinite",
        "float-reverse": "floatReverse 4.5s ease-in-out infinite",
        "scan": "scan 3s ease-in-out infinite",
        "sonar": "sonar 2s cubic-bezier(0, 0.2, 0.8, 1) infinite",
        "beam": "beam 4s linear infinite",
        "wave-1": "wave 1s ease-in-out infinite",
        "wave-2": "wave 1s ease-in-out infinite 0.2s",
        "wave-3": "wave 1s ease-in-out infinite 0.4s",
        "gradient-x": "gradientX 6s ease infinite",
        "spin-slow": "spin 16s linear infinite",
        "spin-reverse": "spinReverse 20s linear infinite",
        "flow-down": "flowDown 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(0, 242, 254, 0.2)" },
          "100%": { boxShadow: "0 0 25px rgba(0, 242, 254, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        floatReverse: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
        },
        scan: {
          "0%": { top: "0%", opacity: "0.2" },
          "50%": { opacity: "0.8" },
          "100%": { top: "100%", opacity: "0.1" },
        },
        sonar: {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        wave: {
          "0%, 100%": { height: "4px" },
          "50%": { height: "16px" },
        },
        gradientX: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        spinReverse: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-360deg)" },
        },
        flowDown: {
          "0%": { top: "0%", opacity: "0" },
          "20%": { opacity: "1" },
          "80%": { opacity: "1" },
          "100%": { top: "100%", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
