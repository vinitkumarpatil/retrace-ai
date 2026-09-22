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
        // Case-file palette. Driven by CSS variables so light/dark swap cleanly.
        paper: 'rgb(var(--paper) / <alpha-value>)',        // sheet surface
        sheet: 'rgb(var(--sheet) / <alpha-value>)',        // raised surface
        desk: 'rgb(var(--desk) / <alpha-value>)',          // app background
        ink: 'rgb(var(--ink) / <alpha-value>)',            // primary text
        'ink-soft': 'rgb(var(--ink-soft) / <alpha-value>)',// secondary text
        'ink-faint': 'rgb(var(--ink-faint) / <alpha-value>)', // muted text
        rule: 'rgb(var(--rule) / <alpha-value>)',          // hairline dividers
        'rule-strong': 'rgb(var(--rule-strong) / <alpha-value>)',
        // The single forensic accent — an evidence stamp.
        stamp: {
          DEFAULT: 'rgb(var(--stamp) / <alpha-value>)',
          soft: 'rgb(var(--stamp-soft) / <alpha-value>)',
          ink: 'rgb(var(--stamp-ink) / <alpha-value>)',
        },
        // Semantic (confidence, verified, caution) — muted archival tones.
        verified: 'rgb(var(--verified) / <alpha-value>)',
        caution: 'rgb(var(--caution) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'IBM Plex Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'IBM Plex Serif', 'Georgia', 'ui-serif', 'serif'],
        mono: ['var(--font-mono)', 'IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // A deliberate type scale rather than text-xs everywhere.
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
      },
      borderRadius: {
        // Restrained radii — documents have crisp corners, not pill everything.
        sheet: '3px',
        card: '5px',
      },
      boxShadow: {
        'sheet': '0 1px 0 0 rgb(var(--rule) / 0.7), 0 1px 2px 0 rgb(35 33 27 / 0.04)',
        'lift': '0 2px 4px -1px rgb(35 33 27 / 0.07), 0 4px 12px -2px rgb(35 33 27 / 0.06)',
        'modal': '0 12px 40px -8px rgb(35 33 27 / 0.28)',
      },
      letterSpacing: {
        'label': '0.14em',
      },
      keyframes: {
        'stamp-in': {
          '0%': { opacity: '0', transform: 'scale(1.4) rotate(-8deg)' },
          '60%': { opacity: '1' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(-4deg)' },
        },
        'reveal-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'stamp-in': 'stamp-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'reveal-up': 'reveal-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
