"use client";

import Link from "next/link";
import { Check, Sparkles, Star, MessageCircle, Heart, Calendar, Gift, Flame, Bell, Mail, ArrowRight } from "lucide-react";

interface Props {
  readingHref: string;
}

const freeFeatures = [
  { label: "Personalized birth chart (100+ stars, 12 palaces)", available: true },
  { label: "Core personality traits & hidden strengths", available: true },
  { label: "True solar time geocoding", available: true },
  { label: "No credit card. No signup. Instant.", available: true },
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
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 md:py-32">
      {/* Cosmic nebula background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,oklch(0.80_0.14_82/0.04),transparent_55%),radial-gradient(ellipse_40%_35%_at_80%_60%,oklch(0.28_0.08_310/0.06),transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/[0.12] bg-gold/[0.04] px-4 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-gold/70" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold/80">
              Simple Pricing
            </span>
          </div>
          <h2 className="landing-headline mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Free to start.
            <br />
            <span className="bg-gradient-to-r from-gold to-cinnabar bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-shift">
              $4.99/month
            </span>
            {" "}to go deeper.
          </h2>
          <p className="mt-4 mx-auto max-w-xl font-body text-base leading-relaxed text-ink-muted">
            One plan. Everything included. 7-day free trial — no charge until you decide to stay.
          </p>
        </div>

        {/* Two-column cards */}
        <div className="mt-10 grid gap-4 sm:mt-14 sm:gap-6 lg:grid-cols-2 lg:gap-8">
          {/* FREE */}
          <article className="flex flex-col rounded-sm border border-gold/[0.08] bg-gradient-to-b from-void/70 to-mist/50 backdrop-blur-sm">
            <div className="border-b border-gold/[0.06] px-5 py-5 sm:px-8 sm:py-6">
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
            <div className="flex-1 px-5 py-4 sm:px-8 sm:py-5">
              <ul className="space-y-2.5 sm:space-y-3">
                {freeFeatures.map((f) => (
                  <li key={f.label} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-jade" aria-hidden />
                    <span className="font-body text-sm leading-relaxed text-ink-muted">
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-gold/[0.06] pt-4">
                <p className="font-body text-xs text-ink-dim">
                  Everything below is{" "}
                  <span className="font-semibold text-gold">Premium only</span> —
                  daily horoscopes, AI chat, compatibility, yearly forecast PDF,
                  birthday surprises, streaks, and human-written email reading.
                </p>
              </div>
            </div>
            <div className="px-5 pb-5 sm:px-8 sm:pb-6">
              <a
                href={readingHref}
                className="flex w-full items-center justify-center gap-2 rounded-sm border border-gold/[0.12] bg-gold/[0.03] py-2.5 font-mono text-xs font-semibold uppercase tracking-wide text-ink-muted transition-all hover:border-gold/30 hover:bg-gold/[0.06] hover:text-ink sm:py-3 sm:text-sm"
              >
                Get Free Snapshot
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
          </article>

          {/* PREMIUM */}
          <article className="relative flex flex-col rounded-sm border border-gold/25 bg-gradient-to-br from-gold/[0.05] via-panel/80 to-star/[0.03] shadow-glow backdrop-blur-sm">
            {/* "Most Popular" badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-block rounded-full border border-gold/30 bg-gold/15 px-4 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                Most Popular
              </span>
            </div>

            <div className="border-b border-gold/[0.12] px-5 py-5 sm:px-8 sm:py-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold/80">
                DestinyBlueprint Premium
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-3xl font-semibold text-ink sm:text-4xl">
                  $4.99
                </span>
                <span className="font-body text-sm text-ink-muted sm:text-base">/month</span>
              </div>
              <p className="mt-1 font-body text-xs text-ink-muted sm:text-sm">
                7-day free trial. Cancel anytime.
              </p>
            </div>

            <div className="flex-1 px-5 py-4 sm:px-8 sm:py-5">
              <ul className="space-y-2.5 sm:space-y-3">
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

            <div className="px-5 pb-6 sm:px-8 sm:pb-8">
              <Link
                href="/daily"
                className="gold-leaf flex w-full items-center justify-center gap-2 rounded-sm py-3 font-mono text-xs font-semibold uppercase tracking-wide text-ink transition-all hover:brightness-110 sm:py-3.5 sm:text-sm"
              >
                Start 7-Day Free Trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <p className="mt-2 text-center font-body text-xs text-ink-dim sm:mt-3">
                No charge until your trial ends. Cancel with one click.
              </p>
            </div>
          </article>
        </div>

        {/* Bottom guarantee */}
        <div className="mt-10 flex items-center gap-3 rounded-sm border border-jade/[0.12] bg-jade/[0.03] px-5 py-4 backdrop-blur-sm md:mx-auto md:max-w-xl">
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
