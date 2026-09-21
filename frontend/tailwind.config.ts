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
        blueprint: {
          bg: "#FAF8F5",
          panel: "#FFFFFF",
          subtle: "#F4EFEA",
          border: "#E2DDD5",
          ink: "#1C2430",
          muted: "#6B7280",
          grid: "rgba(100, 116, 139, 0.08)",
          ochre: {
            DEFAULT: "#D97706",
            light: "#FEF3C7",
            dark: "#B45309",
          },
          sage: {
            DEFAULT: "#059669",
            light: "#D1FAE5",
            dark: "#047857",
          },
          rust: {
            DEFAULT: "#C2410C",
            light: "#FEE2E2",
            dark: "#991B1B",
          },
          navy: {
            DEFAULT: "#1E293B",
            light: "#334155",
            dark: "#0F172A",
          }
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "Courier New", "monospace"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "sans-serif"],
      },
      backgroundImage: {
        "blueprint-grid": "radial-gradient(circle, #D1D5DB 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
