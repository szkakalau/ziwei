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
    // TODO: Add when content/ directory with MDX files is created
    // "./content/**/*.{md,mdx}",
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
        star: {
          DEFAULT: oklchVar("--color-star"),
          dim: "var(--color-star-dim)",
        },
        nebula: {
          DEFAULT: oklchVar("--color-nebula"),
          dim: "var(--color-nebula-dim)",
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
          "linear-gradient(oklch(0.34 0.13 282 / 0.05) 1px, transparent 1px), linear-gradient(90deg, oklch(0.34 0.13 282 / 0.05) 1px, transparent 1px)",
        "radial-mist":
          "radial-gradient(ellipse 100% 70% at 50% -30%, oklch(0.34 0.13 282 / 0.06), transparent 55%), radial-gradient(ellipse 60% 45% at 100% 20%, oklch(0.30 0.07 285 / 0.05), transparent)",
        "cosmic-gradient":
          "radial-gradient(ellipse 55% 35% at 12% 8%, oklch(0.34 0.13 282 / 0.04), transparent 55%), radial-gradient(ellipse 60% 45% at 92% 22%, oklch(0.30 0.07 285 / 0.06), transparent 50%), radial-gradient(ellipse 50% 40% at 15% 85%, oklch(0.34 0.13 282 / 0.03), transparent 50%)",
      },
      backgroundSize: {
        grid: "56px 56px",
      },
      animation: {
        "fade-up": "fadeUp 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "fade-up-delayed":
          "fadeUp 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.12s forwards",
        "fade-up-slow":
          "fadeUp 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards",
        shimmer: "shimmer 8s ease-in-out infinite",
        "star-drift": "starDrift 120s linear infinite",
        "star-pulse": "starPulse 4s ease-in-out infinite",
        "orbital-rotate": "orbitalRotate 60s linear infinite",
        "nebula-breathe": "nebulaBreathe 8s ease-in-out infinite",
        "cosmic-float": "cosmicFloat 12s ease-in-out infinite",
        "constellation-draw": "constellationDraw 2s ease-out forwards",
        "orbit-pulse": "orbitPulse 3s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-shift": "gradientShift 6s ease infinite",
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
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.9" },
        },
        starDrift: {
          "0%": { transform: "translate(0, 0) rotate(0deg)" },
          "25%": { transform: "translate(-0.5%, 0.3%) rotate(0.5deg)" },
          "50%": { transform: "translate(0.2%, -0.2%) rotate(0deg)" },
          "75%": { transform: "translate(0.5%, 0.1%) rotate(-0.5deg)" },
          "100%": { transform: "translate(0, 0) rotate(0deg)" },
        },
        starPulse: {
          "0%, 100%": { opacity: "0.15", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.6)" },
        },
        orbitalRotate: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        nebulaBreathe: {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        cosmicFloat: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "25%": { transform: "translateY(-8px) translateX(3px)" },
          "50%": { transform: "translateY(-2px) translateX(-2px)" },
          "75%": { transform: "translateY(-10px) translateX(-4px)" },
        },
        constellationDraw: {
          from: { strokeDashoffset: "1000" },
          to: { strokeDashoffset: "0" },
        },
        orbitPulse: {
          "0%, 100%": {
            boxShadow:
              "0 0 20px -5px oklch(0.52 0.18 250 / 0.3), 0 0 40px -10px oklch(0.80 0.14 82 / 0.15)",
          },
          "50%": {
            boxShadow:
              "0 0 30px -3px oklch(0.52 0.18 250 / 0.5), 0 0 60px -8px oklch(0.80 0.14 82 / 0.25)",
          },
        },
        gradientShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      boxShadow: {
        glow: "0 0 40px -8px oklch(0.34 0.13 282 / 0.12)",
        panel:
          "0 8px 32px -12px oklch(0.15 0.01 260 / 0.08), 0 1px 2px oklch(0.15 0.01 260 / 0.04)",
        cosmic:
          "0 0 40px -10px oklch(0.34 0.13 282 / 0.08)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
