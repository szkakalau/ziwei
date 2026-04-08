import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#07090d",
        mist: "#0c1014",
        panel: "rgba(18, 26, 32, 0.78)",
        ink: {
          DEFAULT: "#e8e4dc",
          muted: "#a39e96",
          dim: "#6f6a62",
        },
        cinnabar: {
          DEFAULT: "#c9543c",
          glow: "rgba(201, 84, 60, 0.35)",
          deep: "#8f3a2a",
        },
        jade: {
          DEFAULT: "#3d9b84",
          dim: "rgba(61, 155, 132, 0.18)",
        },
        gold: {
          DEFAULT: "#c9a75e",
          dim: "rgba(201, 167, 94, 0.12)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grid-fine":
          "linear-gradient(rgba(201, 167, 94, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 167, 94, 0.06) 1px, transparent 1px)",
        "radial-mist":
          "radial-gradient(ellipse 100% 70% at 50% -30%, rgba(61, 155, 132, 0.14), transparent 55%), radial-gradient(ellipse 60% 45% at 100% 20%, rgba(201, 84, 60, 0.1), transparent), radial-gradient(ellipse 50% 40% at 0% 80%, rgba(201, 167, 94, 0.06), transparent)",
      },
      backgroundSize: {
        grid: "56px 56px",
      },
      animation: {
        "fade-up": "fadeUp 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-up-delayed": "fadeUp 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.12s forwards",
        "fade-up-slow": "fadeUp 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards",
        shimmer: "shimmer 8s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.85" },
        },
      },
      boxShadow: {
        glow: "0 0 60px -12px rgba(201, 84, 60, 0.25), 0 0 80px -20px rgba(61, 155, 132, 0.12)",
        panel: "0 24px 48px -24px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(201, 167, 94, 0.08)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
