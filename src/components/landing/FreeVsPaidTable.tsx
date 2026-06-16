"use client";

import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";

const freeFeatures = [
  "Personalized birth chart (100+ patterns, 12 life domains)",
  "Core personality traits & hidden strengths",
  "True solar time correction",
  "No credit card. No signup. Instant.",
];

const premiumFeatures = [
  "Everything in Free",
  "Daily AI-powered insight",
  "AI Chat — ask about your patterns",
  "Compatibility check (two-person)",
  "Yearly forecast + downloadable PDF",
  "Birthday surprise reading",
  "Streak tracking & achievements",
  "Human-written email reading (24-48h)",
];

export default function FreeVsPaidTable() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,oklch(0.80_0.14_82/0.03),transparent_55%)]" aria-hidden />

      <div className="relative mx-auto max-w-4xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/[0.10] bg-gold/[0.03] px-4 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-gold/70" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold/80">Pricing</span>
          </div>
          <h2 className="landing-headline mt-4 text-2xl sm:text-3xl md:text-4xl">
            Free to start. $4.99/month to go deeper.
          </h2>
          <p className="mt-3 mx-auto max-w-lg font-body text-base text-ink-muted">
            7-day free trial. Cancel anytime. No charge until you decide to stay.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {/* Free */}
          <div className="rounded-sm border border-white/[0.08] bg-panel/80 p-6 backdrop-blur-sm">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">Free Snapshot</p>
            <p className="mt-2 font-display text-3xl font-semibold text-ink">$0</p>
            <ul className="mt-5 space-y-2">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-jade" aria-hidden />
                  <span className="font-body text-sm text-ink-muted">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Premium */}
          <div className="relative rounded-sm border border-gold/25 bg-gradient-to-br from-gold/[0.05] to-panel/80 p-6 backdrop-blur-sm">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-block rounded-full border border-gold/30 bg-gold/15 px-4 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">Most Popular</span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/80">Premium</p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-semibold text-ink">$4.99</span>
              <span className="font-body text-sm text-ink-muted">/month</span>
            </div>
            <ul className="mt-5 space-y-2">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                  <span className="font-body text-sm text-ink">{f}</span>
                </li>
              ))}
            </ul>
            <Link href="/daily" className="gold-leaf mt-6 flex w-full items-center justify-center gap-2 rounded-sm py-3 font-mono text-sm font-semibold uppercase tracking-wide text-ink transition-all hover:brightness-110">
              Start 7-Day Free Trial
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <p className="mt-2 text-center font-body text-xs text-ink-dim">No charge until trial ends. Cancel with one click.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
