"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Star, ShieldCheck, ArrowRight, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type Props = {
  formAnchorId: string;
};

type StarParticle = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
  duration: number;
};

function StarField() {
  const [stars, setStars] = useState<StarParticle[]>([]);

  useEffect(() => {
    const generated: StarParticle[] = [];
    for (let i = 0; i < 60; i++) {
      generated.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        delay: Math.random() * 4,
        duration: Math.random() * 3 + 2,
      });
    }
    setStars(generated);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-gold"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            opacity: s.opacity,
            animation: `starPulse ${s.duration}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function CircleMotif({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      fill="none"
      aria-hidden
    >
      {/* Outer ring */}
      <circle
        cx="200" cy="200" r="190"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.15"
      />
      {/* 12 sectors — the ZWDS palace divisions */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x2 = Math.round((200 + 185 * Math.cos(angle)) * 1e6) / 1e6;
        const y2 = Math.round((200 + 185 * Math.sin(angle)) * 1e6) / 1e6;
        return (
          <line
            key={i}
            x1="200" y1="200"
            x2={x2} y2={y2}
            stroke="currentColor"
            strokeWidth="0.4"
            opacity="0.08"
          />
        );
      })}
      {/* Inner ring */}
      <circle
        cx="200" cy="200" r="80"
        stroke="currentColor"
        strokeWidth="0.6"
        opacity="0.12"
      />
      {/* Center dot */}
      <circle
        cx="200" cy="200" r="4"
        fill="currentColor"
        opacity="0.3"
      />
    </svg>
  );
}

export default function Hero({ formAnchorId }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const motifScale = Math.max(0.85, 1 - scrollY * 0.0004);
  const motifOpacity = Math.max(0.08, 0.25 - scrollY * 0.0005);

  return (
    <section
      id="top"
      ref={scrollRef}
      className="relative isolate overflow-hidden border-b border-white/[0.07]"
    >
      {/* Star field background */}
      <StarField />

      {/* Massive celestial circle motif */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%]"
        style={{
          transform: `translate(-50%, -55%) scale(${motifScale})`,
          opacity: motifOpacity,
        }}
        aria-hidden
      >
        <CircleMotif className="h-[min(90vw,700px)] w-[min(90vw,700px)] text-gold" />
      </div>

      {/* Ambient light gradients */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute left-0 top-0 h-[60%] w-full bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,oklch(0.74_0.12_78/0.1),transparent_60%)]" />
        <div className="absolute bottom-0 right-0 h-[50%] w-[60%] bg-[radial-gradient(ellipse_60%_50%_at_100%_100%,oklch(0.58_0.19_32/0.06),transparent_60%)]" />
      </div>

      {/* Fine grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-[0.2]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-24 lg:min-h-[calc(100svh-4rem)] lg:flex lg:items-center lg:py-32">
        <div className="relative z-10 w-full">
          {/* Top label row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-gold backdrop-blur-sm animate-on-load sm:gap-2 sm:px-4 sm:py-1.5 sm:text-[11px] sm:tracking-[0.28em]">
              <Crosshair className="h-3 w-3" aria-hidden />
              Not Western Astrology
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-dim animate-on-load-delay-1 sm:text-[11px] sm:tracking-[0.22em]">
              Ancient Chinese Imperial System · 1,000+ Years
            </p>
          </div>

          {/* Main headline */}
          <h1
            ref={titleRef}
            className="landing-headline mt-8 max-w-4xl text-[clamp(2rem,7vw,4.75rem)] animate-on-load-delay-1"
          >
            Your destiny, mapped by the{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10 bg-gradient-to-r from-gold via-gold/90 to-cinnabar bg-clip-text text-transparent">
                same stars
              </span>
              <span
                className="absolute -inset-x-3 -bottom-1 -top-1 -z-0 rounded-sm bg-gold/8 blur-sm"
                aria-hidden
              />
            </span>
            {" "}that guided Chinese emperors.
          </h1>

          {/* Subheadline — key differentiation */}
          <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-ink-muted animate-on-load-delay-2 sm:text-lg md:text-xl">
            Zi Wei Dou Shu uses your{" "}
            <span className="font-semibold text-ink">exact birth time, location, and 100+ stars</span>
            {" "}— not just your sun sign. Get a{" "}
            <span className="font-semibold text-gold">free personality snapshot</span>
            {" "}in 30 seconds, then unlock everything with a{" "}
            <span className="font-semibold text-ink">7-day free trial</span>{" "}
            (<span className="text-ink-muted">$4.99/month after</span>).
          </p>

          {/* Three proof points — reimagined as horizontal pill badges */}
          <div className="mt-8 flex flex-wrap gap-3 animate-on-load-delay-3">
            {[
              { icon: Star, text: "100+ Celestial Stars Mapped" },
              { icon: Sparkles, text: "Free Snapshot · No Signup" },
              { icon: ShieldCheck, text: "7-Day Free Trial · Cancel Anytime" },
            ].map((item) => (
              <span
                key={item.text}
                className="inline-flex items-center gap-2 rounded-sm border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 backdrop-blur-sm"
              >
                <item.icon className="h-4 w-4 shrink-0 text-gold/70" aria-hidden />
                <span className="font-body text-sm text-ink-muted">{item.text}</span>
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col items-start gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4 animate-on-load-delay-3">
            <Button asChild variant="cta" size="lg" className="group w-full sm:w-auto">
              <a
                href={`#${formAnchorId}`}
                onClick={() => track("cta_hero_get_snapshot_click")}
              >
                Get My Free Snapshot
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </a>
            </Button>
            <p className="max-w-xs font-body text-sm text-ink-dim">
              Takes 30 seconds · 100% private · No signup required
            </p>
          </div>

          {/* Bottom stat strip */}
          <div className="mt-12 flex flex-wrap gap-x-6 gap-y-4 border-t border-white/[0.06] pt-6 animate-on-load-delay-3 sm:mt-16 sm:gap-x-10 sm:pt-8">
            {[
              { value: "100+", label: "Stars in your chart" },
              { value: "12", label: "Life palaces analyzed" },
              { value: "1,000+", label: "Years of refinement" },
              { value: "24-48h", label: "Human reading included" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl md:text-3xl">
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
