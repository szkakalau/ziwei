import Link from "next/link";
import { Check, Star, MessageCircle, Heart, Calendar, Gift, Flame, Bell, Mail } from "lucide-react";

const freePlan = [
  "Interactive 12-Palace Birth Chart",
  "Core Personality Traits & Strengths",
  "Growth Areas & Blind Spots",
  "True Solar Time Correction",
  "No signup required",
] as const;

const premiumPlan = [
  { label: "Everything in Free", icon: Check },
  { label: "Daily AI-Powered Zi Wei Horoscope", icon: Star },
  { label: "AI Chat — Ask Ziwei About Your Chart", icon: MessageCircle },
  { label: "Compatibility Check (Two-Person)", icon: Heart },
  { label: "Yearly Forecast + Downloadable PDF", icon: Calendar },
  { label: "Birthday Surprise Reading", icon: Gift },
  { label: "Streak Tracking & Achievements", icon: Flame },
  { label: "Push Notifications", icon: Bell },
  { label: "One-Time Human-Written Email Reading", icon: Mail },
] as const;

export default function PricingTable() {
  return (
    <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
      {/* Free */}
      <div className="flex min-h-0 flex-col rounded-sm border border-white/10 bg-panel p-6 shadow-panel backdrop-blur-sm sm:p-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">
          Free Snapshot
        </p>
        <p className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
          $0
        </p>
        <p className="mt-1 font-body text-sm text-ink-muted">
          No credit card. Instant access.
        </p>
        <ul className="mt-6 flex-1 space-y-3 font-body text-sm text-ink-muted">
          {freePlan.map((f) => (
            <li key={f} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-jade" aria-hidden />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/#free-personality-snapshot"
          className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-white/[0.12] bg-white/[0.03] py-3 font-mono text-sm font-semibold uppercase tracking-wide text-ink-muted transition-all hover:border-gold/30 hover:text-ink"
        >
          Get Free Snapshot
        </Link>
      </div>

      {/* Premium */}
      <div className="relative flex min-h-0 flex-col rounded-sm border border-gold/50 bg-gradient-to-br from-gold/[0.06] via-panel to-cinnabar/[0.04] p-6 shadow-glow backdrop-blur-sm ring-1 ring-gold/30 sm:p-8">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-block rounded-full border border-gold/30 bg-gold/15 px-4 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            Most Popular
          </span>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold/80">
          DestinyBlueprint Premium
        </p>
        <p className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
          $4.99<span className="text-xl text-ink-muted">/month</span>
        </p>
        <p className="mt-1 font-body text-sm text-ink-muted">
          7-day free trial. Cancel anytime.
        </p>
        <ul className="mt-6 flex-1 space-y-3 font-body text-sm text-ink">
          {premiumPlan.map((f) => (
            <li key={f.label} className="flex gap-2">
              <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
              <span>{f.label}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/daily"
          className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-sm bg-gradient-to-br from-cinnabar to-cinnabar-deep py-3 font-mono text-sm font-semibold uppercase tracking-wide text-ink shadow-[0_0_32px_-8px_rgba(201,84,60,0.45)] transition-all hover:brightness-110"
        >
          Start 7-Day Free Trial
        </Link>
        <p className="mt-3 text-center font-body text-xs text-ink-dim">
          No charge until trial ends. Cancel with one click.
        </p>
      </div>
    </div>
  );
}
