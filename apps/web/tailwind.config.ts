import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" }
    },
    extend: {
      fontFamily: {
        // Apple system stack: native SF Pro on Apple devices, Inter on others.
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          '"SF Pro Text"',
          "Inter",
          "system-ui",
          '"Helvetica Neue"',
          "sans-serif"
        ],
        mono: [
          '"SF Mono"',
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          '"Roboto Mono"',
          '"JetBrains Mono"',
          "ui-monospace",
          "monospace"
        ],
        "mono-data": [
          '"SF Mono"',
          "SFMono-Regular",
          "Menlo",
          '"Roboto Mono"',
          "monospace"
        ],
        "mono-label": [
          '"SF Mono"',
          "SFMono-Regular",
          "Menlo",
          '"Roboto Mono"',
          "monospace"
        ],
        "display-lg": [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          "Inter",
          "system-ui",
          "sans-serif"
        ],
        "headline-md": [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          "Inter",
          "system-ui",
          "sans-serif"
        ],
        "headline-sm": [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Display"',
          "Inter",
          "system-ui",
          "sans-serif"
        ],
        "body-md": [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          "Inter",
          "system-ui",
          "sans-serif"
        ],
        "body-sm": [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          "Inter",
          "system-ui",
          "sans-serif"
        ],
        // For serif moments (case file analyst summary etc.) — Apple's New York.
        serif: [
          '"New York"',
          "ui-serif",
          "Georgia",
          '"Times New Roman"',
          "serif"
        ]
      },
      fontSize: {
        "display-lg": [
          "48px",
          { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "700" }
        ],
        "headline-md": [
          "24px",
          { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "600" }
        ],
        "headline-sm": ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-md": ["14px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "1.5", fontWeight: "400" }],
        "mono-data": [
          "13px",
          { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "500" }
        ],
        "mono-label": ["11px", { lineHeight: "1.1", fontWeight: "600" }]
      },
      spacing: {
        base: "4px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        gutter: "16px",
        lg: "24px",
        "container-margin": "24px",
        xl: "40px"
      },
      colors: {
        // ── Emerald Sentinel theme (dark-green firewall) ──
        // Brand pivots from "red firewall" to "emerald shield":
        // the product is the green protection; traps remain red.
        background: "#050D09",
        "background-alt": "#0A150F",
        surface: "#0F1A14",
        "surface-dim": "#0F1A14",
        "surface-bright": "#3A4E42",
        "surface-variant": "#2A3D32",
        "surface-tint": "#10B981",
        "surface-container-lowest": "#070F0B",
        "surface-container-low": "#0F1A14",
        "surface-container": "#152119",
        "surface-container-high": "#1F2D24",
        "surface-container-highest": "#2A3D32",
        "surface-glass": "rgba(16, 185, 129, 0.06)",

        "on-background": "#E8F5E9",
        "on-surface": "#E8F5E9",
        "on-surface-variant": "#A7C3B0",

        // Primary = emerald (brand "firewall")
        primary: "#10B981",
        "on-primary": "#04130B",
        "primary-container": "#0EA37A",
        "on-primary-container": "#04130B",
        "primary-fixed": "#10B981",
        "primary-fixed-dim": "#34D399",
        "inverse-primary": "#065F46",

        // Secondary = mint-emerald accent
        secondary: "#34D399",
        "on-secondary": "#04130B",
        "secondary-container": "#059669",
        "on-secondary-container": "#022C1F",
        "secondary-fixed": "#34D399",
        "secondary-fixed-dim": "#6EE7B7",

        // Tertiary = lime accent (sharp pop against deep green)
        tertiary: "#84CC16",
        "on-tertiary": "#1A2E02",
        "tertiary-container": "#65A30D",
        "on-tertiary-container": "#0F1F02",
        "tertiary-fixed": "#A3E635",
        "tertiary-fixed-dim": "#84CC16",

        // Verdict palette — Clean stays green-family but uses a different
        // shade than brand primary so they read distinctly. Critical stays red.
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
        error: "#EF4444",
        "error-container": "#7F1D1D",
        "on-error": "#ffffff",
        "on-error-container": "#FECACA",

        // Outline / borders — emerald-tinted alpha
        outline: "rgba(167, 195, 176, 0.18)",
        "outline-variant": "rgba(167, 195, 176, 0.10)",

        inverse: "#E8F5E9",
        "inverse-surface": "#E8F5E9",
        "inverse-on-surface": "#0F1A14",

        "text-primary": "#E8F5E9",
        "text-muted": "#A7C3B0",

        // shadcn fallbacks
        border: "rgba(167, 195, 176, 0.10)",
        input: "rgba(167, 195, 176, 0.06)",
        ring: "#10B981",
        foreground: "#E8F5E9",
        muted: {
          DEFAULT: "#152119",
          foreground: "#A7C3B0"
        },
        accent: {
          DEFAULT: "#10B981",
          foreground: "#04130B"
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#ffffff"
        },
        card: {
          DEFAULT: "#152119",
          foreground: "#E8F5E9"
        },
        popover: {
          DEFAULT: "#0F1A14",
          foreground: "#E8F5E9"
        },
        verdict: {
          clean: "#22C55E",
          risky: "#F59E0B",
          warning: "#F97316",
          critical: "#EF4444"
        }
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px"
      },
      boxShadow: {
        "glow-critical": "0 0 15px rgba(239, 68, 68, 0.35)",
        "glow-warning": "0 0 15px rgba(245, 158, 11, 0.3)",
        "glow-safe": "0 0 15px rgba(34, 197, 94, 0.3)",
        "glow-primary": "0 0 24px rgba(16, 185, 129, 0.35)",
        "glow-tertiary": "0 0 15px rgba(132, 204, 22, 0.3)",
        "card-inset": "inset 0 1px 0 0 rgba(167, 195, 176, 0.05)"
      },
      keyframes: {
        "pulse-signal": {
          "0%": {
            transform: "scale(0.95)",
            boxShadow: "0 0 0 0 rgba(16, 185, 129, 0.7)"
          },
          "70%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 10px rgba(16, 185, 129, 0)"
          },
          "100%": {
            transform: "scale(0.95)",
            boxShadow: "0 0 0 0 rgba(16, 185, 129, 0)"
          }
        },
        "pulse-danger": {
          "0%, 100%": {
            boxShadow:
              "0 0 0 0 rgba(239, 68, 68, 0.45), 0 0 0 0 rgba(239, 68, 68, 0.15)"
          },
          "50%": {
            boxShadow:
              "0 0 0 6px rgba(239, 68, 68, 0), 0 0 24px 0 rgba(239, 68, 68, 0.35)"
          }
        },
        "scan-vertical": {
          "0%": { top: "0", opacity: "0" },
          "10%": { opacity: "0.5" },
          "90%": { opacity: "0.5" },
          "100%": { top: "100%", opacity: "0" }
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" }
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      },
      animation: {
        "pulse-signal": "pulse-signal 2s infinite",
        "pulse-danger": "pulse-danger 2.4s ease-in-out infinite",
        "scan-vertical": "scan-vertical 4s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      }
    }
  },
  plugins: [tailwindcssAnimate]
} satisfies Config;

export default config;
