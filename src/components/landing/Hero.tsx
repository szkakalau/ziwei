"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Star, Sun, ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type Props = {
  formAnchorId: string;
};

/* ── Multi-layer star field with parallax ── */
function CosmicStarField({ scrollY }: { scrollY: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    // Generate star layers
    const layers = [
      { stars: 120, speed: 0.15, size: 0.6, opacity: 0.8, color: "255 255 255" },
      { stars: 80, speed: 0.25, size: 1.0, opacity: 0.6, color: "212 175 55" },
      { stars: 40, speed: 0.10, size: 1.4, opacity: 0.7, color: "100 180 255" },
      { stars: 25, speed: 0.35, size: 1.8, opacity: 0.5, color: "255 255 255" },
    ];

    const allStars = layers.flatMap((layer) =>
      Array.from({ length: layer.stars }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        r: (Math.random() * 0.8 + 0.4) * layer.size,
        speed: layer.speed,
        color: layer.color,
        opacity: (Math.random() * 0.5 + 0.3) * layer.opacity,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      })),
    );

    let frame = 0;
    let raf: number;

    function draw() {
      frame++;
      ctx!.clearRect(0, 0, canvas!.offsetWidth, canvas!.offsetHeight);

      for (const star of allStars) {
        const parallaxY = star.y - scrollY * star.speed;
        const wrappedY = ((parallaxY % (canvas!.offsetHeight + 40)) + canvas!.offsetHeight + 40) % (canvas!.offsetHeight + 40) - 20;
        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinkleOffset) * 0.3 + 0.7;

        ctx!.beginPath();
        ctx!.arc(star.x, wrappedY, star.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgb(${star.color} / ${star.opacity * twinkle})`;
        ctx!.fill();

        // Brighter stars get a glow
        if (star.r > 1.2) {
          ctx!.beginPath();
          ctx!.arc(star.x, wrappedY, star.r * 2.5, 0, Math.PI * 2);
          ctx!.fillStyle = `rgb(${star.color} / ${star.opacity * twinkle * 0.12})`;
          ctx!.fill();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, [scrollY]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}

/* ── Orbital Ring ── */
function OrbitalRing({ scrollY }: { scrollY: number }) {
  const rotation = scrollY * 0.03;
  const scale = Math.max(0.75, 1 - scrollY * 0.0005);
  const opacity = Math.max(0.04, 0.14 - scrollY * 0.0003);

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%]"
      style={{ transform: `translate(-50%, -55%) scale(${scale}) rotate(${rotation}deg)`, opacity }}
      aria-hidden
    >
      <svg
        viewBox="0 0 500 500"
        className="h-[min(95vw,750px)] w-[min(95vw,750px)]"
        fill="none"
      >
        {/* Outer ring */}
        <circle cx="250" cy="250" r="235" stroke="oklch(0.80 0.14 82 / 0.25)" strokeWidth="0.4" />
        {/* Middle ring */}
        <circle cx="250" cy="250" r="185" stroke="oklch(0.52 0.18 250 / 0.18)" strokeWidth="0.3" />
        {/* Inner ring */}
        <circle cx="250" cy="250" r="120" stroke="oklch(0.80 0.14 82 / 0.2)" strokeWidth="0.5" />
        {/* 12 palace divisions */}
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x2 = Math.round((250 + 232 * Math.cos(angle)) * 1e4) / 1e4;
          const y2 = Math.round((250 + 232 * Math.sin(angle)) * 1e4) / 1e4;
          return (
            <line
              key={i}
              x1="250" y1="250"
              x2={x2} y2={y2}
              stroke="oklch(0.80 0.14 82 / 0.12)"
              strokeWidth="0.3"
            />
          );
        })}
        {/* Center star */}
        <circle cx="250" cy="250" r="5" fill="oklch(0.80 0.14 82 / 0.5)" />
        <circle cx="250" cy="250" r="12" fill="oklch(0.80 0.14 82 / 0.08)" />
        {/* Bright stars at cardinal points */}
        {[0, 90, 180, 270].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const cx = 250 + 185 * Math.cos(rad);
          const cy = 250 + 185 * Math.sin(rad);
          return (
            <circle key={deg} cx={cx} cy={cy} r="1.8" fill="oklch(0.94 0.024 90 / 0.6)">
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur="3s" repeatCount="indefinite" />
            </circle>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Constellation Lines ── */
function ConstellationLines() {
  const paths = [
    "M80,60 L140,90 L190,70 L240,100",
    "M60,140 L110,120 L160,150 L210,130",
    "M100,200 L150,180 L200,210 L250,190 L300,220",
  ];

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {paths.map((d, i) => (
        <path
          key={i}
          d={d}
          stroke="oklch(0.52 0.18 250 / 0.12)"
          strokeWidth="0.5"
          fill="none"
          strokeDasharray="1000"
          strokeDashoffset="1000"
          style={{ animation: `constellationDraw 2s ease-out ${1 + i * 0.4}s forwards` }}
        />
      ))}
      {/* Star nodes on path intersections */}
      {[[80,60],[140,90],[190,70],[240,100],[60,140],[110,120],[160,150],[210,130],[100,200],[150,180],[200,210],[250,190],[300,220]].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx} cy={cy}
          r="1.2"
          fill="oklch(0.52 0.18 250 / 0.5)"
          style={{ animation: `fadeUp 0.6s ease-out ${1.2 + i * 0.08}s both` }}
        />
      ))}
    </svg>
  );
}

export default function Hero({ formAnchorId }: Props) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden border-b border-white/[0.05]"
    >
      {/* Multi-layer cosmic background */}
      <CosmicStarField scrollY={scrollY} />

      {/* Orbital ring */}
      <OrbitalRing scrollY={scrollY} />

      {/* Constellation overlay */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden>
        <ConstellationLines />
      </div>

      {/* Nebula glow blobs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-0 h-[70%] w-[70%] bg-[radial-gradient(ellipse_60%_50%_at_40%_20%,oklch(0.52_0.18_250/0.09),transparent_60%)] animate-nebula-breathe" />
        <div className="absolute -right-20 bottom-0 h-[60%] w-[55%] bg-[radial-gradient(ellipse_50%_45%_at_70%_80%,oklch(0.28_0.08_310/0.10),transparent_55%)] animate-nebula-breathe" style={{ animationDelay: "-4s" }} />
        <div className="absolute left-1/3 top-1/2 h-[40%] w-[45%] bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,oklch(0.80_0.14_82/0.04),transparent_55%)] animate-nebula-breathe" style={{ animationDelay: "-6s" }} />
      </div>

      {/* Fine grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-[0.18]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-24 lg:min-h-[calc(100svh-4rem)] lg:flex lg:items-center lg:py-32">
        <div className="relative z-10 w-full">
          {/* Top label row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/[0.05] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-gold backdrop-blur-sm animate-on-load sm:gap-2 sm:px-4 sm:py-1.5 sm:text-[11px] sm:tracking-[0.28em]">
              <Compass className="h-3 w-3" aria-hidden />
              Not 1 of 12 Sun Signs
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim animate-on-load-delay-1 sm:text-[11px] sm:tracking-[0.22em]">
              100+ Stars · Exact Birth Time · True Solar Time
            </p>
          </div>

          {/* Main headline — value-first */}
          <h1 className="landing-headline mt-8 max-w-3xl text-[clamp(2rem,6vw,4.25rem)] animate-on-load-delay-1">
            A daily horoscope{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10 bg-gradient-to-r from-gold via-gold/90 to-cinnabar bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-shift">
                written for you
              </span>
              <span
                className="absolute -inset-x-3 -bottom-1 -top-1 -z-0 rounded-sm bg-gold/6 blur-md"
                aria-hidden
              />
            </span>
            ,<br />
            not 1/12th of the planet.
          </h1>

          {/* Subheadline — what makes it different */}
          <p className="mt-5 max-w-xl font-body text-base leading-relaxed text-ink-muted animate-on-load-delay-2 sm:text-lg">
            Zi Wei Dou Shu maps{" "}
            <span className="font-semibold text-ink">100+ stars to your exact birth time and location</span>
            . Every morning you get a personalized reading based on YOUR chart —
            not a generic paragraph written for millions of people who happen to
            share your birth month.
          </p>

          {/* CTA + Preview side by side */}
          <div className="mt-8 flex flex-col gap-6 animate-on-load-delay-3 lg:flex-row lg:items-start lg:gap-10">
            {/* CTA column */}
            <div className="shrink-0">
              <Button asChild variant="cta" size="lg" className="group w-full sm:w-auto">
                <a
                  href={`#${formAnchorId}`}
                  onClick={() => track("cta_hero_get_snapshot_click")}
                >
                  Get My Free Snapshot
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </a>
              </Button>
              <p className="mt-3 font-body text-sm text-ink-dim">
                30 seconds · No signup · 100% private
              </p>
            </div>

            {/* Preview card — shows what you get */}
            <div className="min-w-0 flex-1 max-w-md">
              <div className="card-cosmic overflow-hidden text-left">
                <div className="flex items-center gap-2 border-b border-gold/[0.08] px-4 py-2.5">
                  <Sparkles className="h-3.5 w-3.5 text-gold/60" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-gold/60">
                    Your Daily Horoscope
                  </span>
                  <span className="ml-auto font-mono text-[9px] text-ink-dim">
                    Sample Preview
                  </span>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sun className="h-3 w-3 text-gold/50" />
                    <span className="font-mono text-[10px] text-ink-dim">
                      Wednesday, June 10
                    </span>
                  </div>
                  <p className="font-body text-[13px] leading-relaxed text-ink-muted">
                    Your <span className="font-semibold text-gold/80">Career Palace</span> is
                    activated today. A conversation about direction or ambition may
                    surface — what people reveal matters more than what they say.
                    <span className="font-semibold text-star/80"> Tian Ji</span> in
                    your Travel Palace suggests movement within 72 hours.
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {["Zi Wei", "Tian Fu", "Wu Qu"].map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-0.5 rounded-sm border border-gold/[0.08] bg-gold/[0.03] px-1.5 py-0.5 font-mono text-[9px] text-gold/60"
                      >
                        <Star className="h-2 w-2" />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-4 border-t border-gold/[0.08] pt-6 animate-on-load-delay-3 sm:mt-14 sm:gap-x-10 sm:pt-8">
            {[
              { value: "100+", label: "Stars in your chart" },
              { value: "Daily", label: "AI horoscopes" },
              { value: "24-48h", label: "Human reading delivery" },
              { value: "$4.99", label: "Per month after trial" },
            ].map((stat) => (
              <div key={stat.label} className="group">
                <p className="font-display text-xl font-semibold tracking-tight text-ink transition-colors group-hover:text-gold sm:text-2xl md:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
