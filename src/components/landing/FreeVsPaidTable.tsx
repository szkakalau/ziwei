import Link from "next/link";
import { Check, Minus, Sparkles, Star, MessageCircle, Heart, Calendar, Gift, Flame, Bell, Mail, ArrowRight } from "lucide-react";

interface Props {
  readingHref: string;
}

const freeFeatures = [
  { label: "Interactive 12-Palace Birth Chart", available: true },
  { label: "Core Personality Traits & Strengths", available: true },
  { label: "Growth Areas & Blind Spots", available: true },
  { label: "True Solar Time Correction", available: true },
  { label: "No signup required", available: true },
  { label: "Daily AI Horoscope", available: false },
  { label: "AI Chat — Ask Ziwei About Your Chart", available: false },
  { label: "Compatibility Check (Two-Person)", available: false },
  { label: "Yearly Forecast + Downloadable PDF", available: false },
  { label: "Birthday Surprise Reading", available: false },
  { label: "Streak Tracking & Achievements", available: false },
  { label: "Human-Written Email Reading", available: false },
  { label: "Cancel Anytime", available: false },
] as const;

const premiumFeatures = [
  { label: "Interactive 12-Palace Birth Chart", icon: Star },
  { label: "Core Personality Traits & Strengths", icon: Sparkles },
  { label: "Growth Areas & Blind Spots", icon: Sparkles },
  { label: "True Solar Time Correction", icon: Star },
  { label: "No signup required for snapshot", icon: Star },
  { label: "Daily AI Horoscope", icon: Sparkles },
  { label: "AI Chat — Ask Ziwei About Your Chart", icon: MessageCircle },
  { label: "Compatibility Check (Two-Person)", icon: Heart },
  { label: "Yearly Forecast + Downloadable PDF", icon: Calendar },
  { label: "Birthday Surprise Reading", icon: Gift },
  { label: "Streak Tracking & Achievements", icon: Flame },
  { label: "Human-Written Email Reading", icon: Mail },
  { label: "Cancel Anytime", icon: Bell },
] as const;

export default function FreeVsPaidTable({ readingHref }: Props) {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 md:py-32">
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,oklch(0.74_0.12_78/0.04),transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/[0.15] bg-gold/[0.04] px-4 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-gold/70" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold/80">
              Simple Pricing
            </span>
          </div>
          <h2 className="landing-headline mt-5 text-3xl md:text-4xl lg:text-5xl">
            Free to start.
            <br />
            <span className="bg-gradient-to-r from-gold to-cinnabar bg-clip-text text-transparent">
              $4.99/month
            </span>
            {" "}to go deeper.
          </h2>
          <p className="mt-4 mx-auto max-w-xl font-body text-base leading-relaxed text-ink-muted">
            One plan. Everything included. 7-day free trial — no charge until you decide to stay.
          </p>
        </div>

        {/* Two-column cards */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* FREE */}
          <article className="flex flex-col rounded-sm border border-white/[0.08] bg-panel/70 shadow-panel backdrop-blur-sm">
            <div className="border-b border-white/[0.07] px-6 py-6 sm:px-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">
                Free Snapshot
              </p>
              <p className="mt-2 font-display text-4xl font-semibold text-ink">
                $0
              </p>
              <p className="mt-1 font-body text-sm text-ink-muted">
                No credit card. No signup. Instant.
              </p>
            </div>
            <div className="flex-1 px-6 py-5 sm:px-8">
              <ul className="space-y-3">
                {freeFeatures.map((f) => (
                  <li key={f.label} className="flex items-start gap-3">
                    {f.available ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-jade" aria-hidden />
                    ) : (
                      <Minus className="mt-0.5 h-4 w-4 shrink-0 text-ink-dim/40" aria-hidden />
                    )}
                    <span className={`font-body text-sm leading-relaxed ${f.available ? "text-ink-muted" : "text-ink-dim/40"}`}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-6 pb-6 sm:px-8">
              <a
                href={readingHref}
                className="flex w-full items-center justify-center gap-2 rounded-sm border border-white/[0.12] bg-white/[0.03] py-3 font-mono text-sm font-semibold uppercase tracking-wide text-ink-muted transition-all hover:border-gold/30 hover:text-ink"
              >
                Get Free Snapshot
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </article>

          {/* PREMIUM */}
          <article className="relative flex flex-col rounded-sm border border-gold/40 bg-gradient-to-br from-gold/[0.06] via-panel/90 to-cinnabar/[0.04] shadow-glow backdrop-blur-sm ring-1 ring-gold/20">
            {/* "Most Popular" badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-block rounded-full border border-gold/30 bg-gold/15 px-4 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                Most Popular
              </span>
            </div>

            <div className="border-b border-gold/[0.15] px-6 py-6 sm:px-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold/80">
                DestinyBlueprint Premium
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-4xl font-semibold text-ink">
                  $4.99
                </span>
                <span className="font-body text-base text-ink-muted">/month</span>
              </div>
              <p className="mt-1 font-body text-sm text-ink-muted">
                7-day free trial. Cancel anytime.
              </p>
            </div>

            <div className="flex-1 px-6 py-5 sm:px-8">
              <ul className="space-y-3">
                {premiumFeatures.map((f) => (
                  <li key={f.label} className="flex items-start gap-3">
                    <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                    <span className="font-body text-sm leading-relaxed text-ink">
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 pb-8 sm:px-8">
              <Link
                href="/daily"
                className="flex w-full items-center justify-center gap-2 rounded-sm bg-gradient-to-br from-cinnabar to-cinnabar-deep py-3.5 font-mono text-sm font-semibold uppercase tracking-wide text-ink shadow-[0_0_32px_-8px_rgba(201,84,60,0.45)] transition-all hover:brightness-110"
              >
                Start 7-Day Free Trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <p className="mt-3 text-center font-body text-xs text-ink-dim">
                No charge until your trial ends. Cancel with one click.
              </p>
            </div>
          </article>
        </div>

        {/* Bottom guarantee */}
        <div className="mt-10 flex items-center gap-3 rounded-sm border border-jade/[0.15] bg-jade/[0.03] px-5 py-4 backdrop-blur-sm md:mx-auto md:max-w-xl">
          <Check className="h-5 w-5 shrink-0 text-jade" aria-hidden />
          <p className="font-body text-sm leading-relaxed text-ink-muted">
            <span className="font-semibold text-ink">Everything in one plan.</span>{" "}
            Daily horoscopes, AI chat, compatibility, yearly forecast, birthday surprises, push notifications, streak tracking, and a human-written email reading — all included with your subscription. No upgrades. No add-ons.
          </p>
        </div>
      </div>
    </section>
  );
}
