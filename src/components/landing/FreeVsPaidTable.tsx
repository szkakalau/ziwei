import { Check, X, ArrowRight, Sparkles, FileText, Sun, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import Link from "next/link";

type Props = {
  onBookClick?: () => void;
  readingHref?: string;
};

const emailReadingRows = [
  { label: "Core Personality Snapshot & Traits", free: "yes", paid: "yes" },
  { label: "Personality Strengths & Blind Spots", free: "partial", paid: "yes" },
  { label: "12 Life Palaces Full Breakdown", free: "no", paid: "yes-line" },
  { label: "10-Year Destiny Cycle Timeline", free: "no", paid: "yes-forecast" },
  { label: "Love & Relationship Pattern Insights", free: "no", paid: "yes" },
  { label: "Career & Wealth Potential Analysis", free: "no", paid: "yes" },
  { label: "Hidden Talents & Growth Opportunities", free: "no", paid: "yes" },
  { label: "Personalized Email Delivery", free: "no", paid: "yes-inbox" },
  { label: "30-Day Money-Back Guarantee", free: "dash", paid: "yes-coverage" },
] as const;

const subscriptionRows = [
  "Daily AI-powered Zi Wei horoscope",
  "Interactive birth chart with 12 palaces",
  "AI Chat — Ask Ziwei about your chart",
  "Compatibility check with another person",
  "Yearly forecast + downloadable PDF",
  "Birthday surprise reading",
  "Streak tracking & push notifications",
  "7-day free trial — cancel anytime",
] as const;

function FreeCell({ state }: { state: "yes" | "no" | "partial" | "dash" }) {
  if (state === "yes") {
    return (
      <span className="shrink-0 text-jade">
        <Check className="h-3.5 w-3.5" aria-label="Included" />
      </span>
    );
  }
  if (state === "partial") {
    return (
      <span className="shrink-0 font-body text-[11px] text-ink-dim">Partial</span>
    );
  }
  if (state === "dash") {
    return <span className="shrink-0 font-mono text-xs text-ink-dim">—</span>;
  }
  return (
    <span className="shrink-0 text-ink-dim">
      <X className="h-3.5 w-3.5" aria-label="Not included" />
    </span>
  );
}

function PaidValue({ state }: { state: "yes" | "yes-inbox" | "yes-line" | "yes-forecast" | "yes-coverage" }) {
  const label =
    state === "yes-inbox"
      ? "Email in 24–48h"
      : state === "yes-line"
        ? "Human-written"
        : state === "yes-forecast"
          ? "Timing advice"
          : state === "yes-coverage"
            ? "30-day"
            : "Included";
  return (
    <span className="inline-flex items-center gap-1 shrink-0 font-body text-[11px] text-jade">
      <Check className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}

export default function FreeVsPaidTable({ onBookClick, readingHref }: Props) {
  return (
    <section className="relative overflow-hidden border-y border-white/[0.07] bg-mist/40 py-24 backdrop-blur-sm md:py-32">
      {/* Background accent */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-96 w-96 translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10 bg-gold/[0.02]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-10 h-64 w-64 rounded-full border border-jade/10 bg-jade/[0.02]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <p className="landing-kicker">Pricing</p>
          <h2 className="landing-headline mt-3 text-3xl md:text-4xl lg:text-5xl">
            Start free. Go deeper with{" "}
            <span className="bg-gradient-to-r from-gold to-cinnabar bg-clip-text text-transparent">
              $99
            </span>
            .<br />
            <span className="text-ink-muted">Or subscribe for daily guidance.</span>
          </h2>
          <p className="mt-4 mx-auto max-w-xl font-body text-base leading-relaxed text-ink-muted">
            Three ways to use Zi Wei Dou Shu — from a free instant snapshot to daily AI horoscopes.
          </p>
        </div>

        {/* Three-column cards */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-5">
          {/* ===== FREE ===== */}
          <div className="group relative flex flex-col rounded-sm border border-white/[0.08] bg-panel/70 p-6 backdrop-blur-md transition-all duration-300 hover:border-white/[0.14] sm:p-7">
            <div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-white/[0.1] bg-white/[0.04]">
                <Sparkles className="h-5 w-5 text-ink-dim" aria-hidden />
              </span>
              <p className="mt-4 font-display text-xl font-semibold text-ink">Free Snapshot</p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink-dim">
                No signup · Instant
              </p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold text-ink">$0</span>
                <span className="font-body text-sm text-ink-dim">forever</span>
              </div>
            </div>

            <ul className="mt-7 flex-1 space-y-2.5 border-t border-white/[0.06] pt-5">
              {emailReadingRows.map((r) => (
                <li key={r.label} className="flex items-center justify-between gap-2">
                  <span className="font-body text-xs text-ink-muted">{r.label}</span>
                  <FreeCell state={r.free} />
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Button asChild variant="cta" size="lg" className="w-full">
                <a
                  href="#birth-form"
                  onClick={() => track("cta_pricing_free_snapshot_click")}
                >
                  Get Free Snapshot
                </a>
              </Button>
            </div>
          </div>

          {/* ===== $99 EMAIL READING ===== */}
          <div className="group relative flex flex-col rounded-sm border border-gold/30 bg-gradient-to-br from-gold/[0.06] via-panel/80 to-cinnabar/[0.04] p-6 shadow-glow backdrop-blur-md transition-all duration-300 hover:border-gold/40 sm:p-7 lg:-translate-y-3">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-gold/30 bg-void px-4 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-gold backdrop-blur-md">
              Most Popular
            </div>

            <div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-gold/30 bg-gold/[0.08]">
                <FileText className="h-5 w-5 text-gold" aria-hidden />
              </span>
              <p className="mt-4 font-display text-xl font-semibold text-ink">Email Reading</p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-gold">
                Human-written · 24–48h
              </p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold text-ink">$99</span>
                <span className="font-body text-sm text-ink-muted">one-time</span>
              </div>
            </div>

            <ul className="mt-7 flex-1 space-y-2.5 border-t border-gold/[0.1] pt-5">
              {emailReadingRows.map((r) => (
                <li key={r.label} className="flex items-center justify-between gap-2">
                  <span className="font-body text-xs text-ink">{r.label}</span>
                  <PaidValue state={r.paid} />
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-3">
              {readingHref ? (
                <Button asChild variant="cta" size="lg" className="w-full group/btn">
                  <a
                    href={readingHref}
                    onClick={() => track("cta_table_email_reading_click")}
                  >
                    Get My Email Reading
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden />
                  </a>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="cta"
                  size="lg"
                  className="w-full group/btn"
                  onClick={() => {
                    track("cta_table_email_reading_click");
                    onBookClick?.();
                  }}
                >
                  Get My Email Reading
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden />
                </Button>
              )}
              <div className="flex items-start gap-2 rounded-sm border border-gold/[0.1] bg-gold/[0.03] p-2.5">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold/70" aria-hidden />
                <p className="font-body text-[11px] leading-relaxed text-ink-muted">
                  30-day money-back guarantee. No questions asked.
                </p>
              </div>
            </div>
          </div>

          {/* ===== $4.99/MO SUBSCRIPTION ===== */}
          <div className="group relative flex flex-col rounded-sm border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] via-panel/70 to-amber-500/[0.02] p-6 backdrop-blur-md transition-all duration-300 hover:border-amber-500/30 sm:p-7">
            <div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-amber-500/25 bg-amber-500/[0.06]">
                <Sun className="h-5 w-5 text-amber-400" aria-hidden />
              </span>
              <p className="mt-4 font-display text-xl font-semibold text-ink">Daily Horoscope</p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-amber-400">
                AI-powered · Every morning
              </p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-4xl font-semibold text-ink">$4.99</span>
                <span className="font-body text-sm text-ink-dim">/month</span>
              </div>
              <p className="mt-1 font-body text-xs text-ink-dim">
                7-day free trial · Cancel anytime
              </p>
            </div>

            <ul className="mt-7 flex-1 space-y-2.5 border-t border-amber-500/[0.08] pt-5">
              {subscriptionRows.map((row) => (
                <li key={row} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />
                  <span className="font-body text-xs text-ink-muted">{row}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 space-y-3">
              <Link
                href="/daily"
                className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-amber-500/25 bg-amber-500/[0.1] px-6 py-3 font-body text-sm font-semibold text-amber-300 transition-all hover:bg-amber-500/[0.18] hover:border-amber-500/40"
                onClick={() => track("cta_pricing_subscription_click")}
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <div className="flex items-start gap-2 rounded-sm border border-amber-500/[0.08] bg-amber-500/[0.02] p-2.5">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/70" aria-hidden />
                <p className="font-body text-[11px] leading-relaxed text-ink-muted">
                  7-day free trial. Cancel anytime from the billing portal.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-10 flex items-center gap-3 rounded-sm border border-white/[0.06] bg-white/[0.02] px-5 py-4 backdrop-blur-sm md:mx-auto md:max-w-2xl">
          <Clock className="h-5 w-5 shrink-0 text-ink-dim" aria-hidden />
          <p className="font-body text-sm leading-relaxed text-ink-muted">
            <span className="font-semibold text-ink">After email reading purchase:</span>{" "}
            Order confirmation immediately. Human-written reading delivered by email within 24–48 hours.
          </p>
        </div>
      </div>
    </section>
  );
}
