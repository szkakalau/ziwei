import type { Config } from "tailwindcss";

/** Enables `bg-void/60` etc. when colors are CSS variables (OKLCH). */
function oklchVar(name: string) {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue === undefined) {
      return `var(${name})`;
    }
    const pct = Math.round(Number(opacityValue) * 100);
    return `color-mix(in oklch, var(${name}) ${pct}%, transparent)`;
  };
}

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
        void: oklchVar("--color-void"),
        mist: oklchVar("--color-mist"),
        panel: oklchVar("--color-panel"),
        ink: {
          DEFAULT: oklchVar("--color-ink"),
          muted: oklchVar("--color-ink-muted"),
          dim: oklchVar("--color-ink-dim"),
        },
        cinnabar: {
          DEFAULT: oklchVar("--color-cinnabar"),
          glow: "var(--color-cinnabar-glow)",
          deep: oklchVar("--color-cinnabar-deep"),
        },
        jade: {
          DEFAULT: oklchVar("--color-jade"),
          dim: "var(--color-jade-dim)",
        },
        gold: {
          DEFAULT: oklchVar("--color-gold"),
          dim: "var(--color-gold-dim)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      } as unknown as Record<string, string | Record<string, string>>,
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grid-fine":
          "linear-gradient(oklch(0.74 0.12 78 / 0.07) 1px, transparent 1px), linear-gradient(90deg, oklch(0.74 0.12 78 / 0.07) 1px, transparent 1px)",
        "radial-mist":
          "radial-gradient(ellipse 100% 70% at 50% -30%, oklch(0.62 0.1 168 / 0.16), transparent 55%), radial-gradient(ellipse 60% 45% at 100% 20%, oklch(0.58 0.19 32 / 0.12), transparent), radial-gradient(ellipse 50% 40% at 0% 80%, oklch(0.74 0.12 78 / 0.08), transparent)",
      },
      backgroundSize: {
        grid: "56px 56px",
      },
      animation: {
        "fade-up": "fadeUp 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-up-delayed": "fadeUp 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.12s forwards",
        "fade-up-slow": "fadeUp 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards",
        shimmer: "shimmer 8s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.85" },
        },
      },
      boxShadow: {
        glow: "0 0 60px -12px oklch(0.58 0.19 32 / 0.28), 0 0 80px -20px oklch(0.62 0.1 168 / 0.14)",
        panel:
          "0 24px 48px -24px oklch(0.13 0.032 258 / 0.65), inset 0 1px 0 oklch(0.74 0.12 78 / 0.1)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
