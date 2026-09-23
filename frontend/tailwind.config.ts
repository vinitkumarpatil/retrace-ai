import type { Config } from "tailwindcss";

/**
 * RETRACE — INTELLIGENCE WORKSPACE
 * A premium, dark-first design language. Neutral surfaces carry the interface;
 * violet + cyan accents are used strategically, never as wallpaper.
 */
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
        // Base backgrounds (deepest -> app canvas)
        base: {
          DEFAULT: "#08090B",
          900: "#08090B",
          800: "#0D0F13",
          700: "#111318",
        },
        // Elevated surfaces
        surface: {
          DEFAULT: "#15181E",
          1: "#15181E",
          2: "#191C23",
          3: "#20242C",
          4: "#262B34",
        },
        line: {
          DEFAULT: "#242832",
          soft: "#1E222A",
          strong: "#2F343F",
        },
        // Text ramp
        ink: {
          DEFAULT: "#F8FAFC",
          1: "#F8FAFC",
          2: "#CBD5E1",
          3: "#94A3B8",
          4: "#64748B",
        },
        // Accents
        iris: {
          DEFAULT: "#8B5CF6",
          soft: "#A78BFA",
          deep: "#7C3AED",
        },
        cyan: {
          DEFAULT: "#22D3EE",
          soft: "#67E8F9",
          deep: "#0891B2",
        },
        emerald: { DEFAULT: "#34D399", deep: "#059669" },
        amber: { DEFAULT: "#FBBF24", deep: "#D97706" },
        rose: { DEFAULT: "#F87171", deep: "#DC2626" },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "SF Mono",
          "ui-monospace",
          "Menlo",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 32px -18px rgba(0,0,0,0.75)",
        lift: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 22px 50px -24px rgba(0,0,0,0.9)",
        "glow-iris": "0 0 0 1px rgba(139,92,246,0.35), 0 0 32px -6px rgba(139,92,246,0.55)",
        "glow-cyan": "0 0 0 1px rgba(34,211,238,0.30), 0 0 30px -8px rgba(34,211,238,0.5)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "bar-fill": {
          from: { width: "0%" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        "fade-up": "fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in": "scale-in 0.2s cubic-bezier(0.16,1,0.3,1) both",
        "slide-in-right": "slide-in-right 0.3s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 1.6s infinite",
        "pulse-soft": "pulse-soft 1.8s ease-in-out infinite",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
