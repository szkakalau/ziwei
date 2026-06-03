import { Check, X, ArrowRight, Sparkles, FileText, Clock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type Props = {
  onBookClick?: () => void;
  readingHref?: string;
};

type CellState = "yes" | "no" | "partial" | "dash";

const rows: Array<{
  label: string;
  free: CellState;
  paid: "yes" | "yes-inbox" | "yes-line" | "yes-forecast" | "yes-coverage";
}> = [
  { label: "Full Birth Chart with 100+ Stars", free: "partial", paid: "yes" },
  { label: "12 Life Palaces Breakdown", free: "no", paid: "yes-line" },
  { label: "10-Year Destiny Cycle Map", free: "no", paid: "yes-forecast" },
  { label: "Love & Relationship Analysis", free: "no", paid: "yes" },
  { label: "Career & Wealth Trajectory", free: "no", paid: "yes" },
  { label: "Hidden Strengths & Blind Spots", free: "partial", paid: "yes" },
  { label: "Personalized Human Email Delivery", free: "no", paid: "yes-inbox" },
  { label: "30-Day Money-Back Guarantee", free: "dash", paid: "yes-coverage" },
];

function FreeCell({ state }: { state: CellState }) {
  if (state === "yes") {
    return <Check className="h-4 w-4 text-jade" aria-label="Included" />;
  }
  if (state === "partial") {
    return (
      <span className="inline-flex items-center gap-1.5 font-body text-xs text-ink-dim">
        <span className="h-1.5 w-1.5 rounded-full bg-gold/60" aria-hidden />
        Preview
      </span>
    );
  }
  if (state === "dash") {
    return <span className="font-mono text-xs text-ink-dim">—</span>;
  }
  return <X className="h-4 w-4 text-ink-dim" aria-label="Not included" />;
}

function PaidValue({ state }: { state: "yes" | "yes-inbox" | "yes-line" | "yes-forecast" | "yes-coverage" }) {
  const label =
    state === "yes-inbox"
      ? "Email in 24-48h"
      : state === "yes-line"
        ? "Human-written"
        : state === "yes-forecast"
          ? "With timing advice"
          : state === "yes-coverage"
            ? "No questions asked"
            : "Included";
  return (
    <span className="inline-flex items-center gap-1.5 font-body text-xs text-jade">
      <Check className="h-3.5 w-3.5" aria-hidden />
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

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <p className="landing-kicker">Pricing</p>
          <h2 className="landing-headline mt-3 text-3xl md:text-4xl lg:text-5xl">
            Free snapshot.{" "}
            <span className="text-ink-muted">Then</span>{" "}
            <span className="bg-gradient-to-r from-gold to-cinnabar bg-clip-text text-transparent">
              $99
            </span>
            {" "}for the real thing.
          </h2>
          <p className="mt-4 mx-auto max-w-xl font-body text-base leading-relaxed text-ink-muted">
            Start with a free, AI-generated personality snapshot. Upgrade to a human-written
            reading delivered by email — backed by a 30-day guarantee.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Free column */}
          <div className="group relative rounded-sm border border-white/[0.08] bg-panel/70 p-6 backdrop-blur-md transition-all duration-300 hover:border-white/[0.14] sm:p-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-white/[0.1] bg-white/[0.04]">
                <Sparkles className="h-5 w-5 text-ink-dim" aria-hidden />
              </span>
              <div>
                <p className="font-display text-xl font-semibold text-ink">Free Snapshot</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-ink-dim">No signup · Instant</p>
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold text-ink">$0</span>
              <span className="font-body text-sm text-ink-dim">forever</span>
            </div>

            <ul className="mt-8 space-y-3.5">
              {rows.map((r) => (
                <li key={r.label} className="flex items-center justify-between gap-3">
                  <span className="font-body text-sm text-ink-muted">{r.label}</span>
                  <FreeCell state={r.free} />
                </li>
              ))}
            </ul>
          </div>

          {/* Paid column */}
          <div className="group relative rounded-sm border border-gold/30 bg-gradient-to-br from-gold/[0.06] via-panel/80 to-cinnabar/[0.04] p-6 shadow-glow backdrop-blur-md transition-all duration-300 hover:border-gold/40 sm:p-8 lg:-translate-y-4">
            {/* Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-gold/30 bg-void px-4 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-gold backdrop-blur-md">
              Most Popular
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-gold/30 bg-gold/[0.08]">
                <FileText className="h-5 w-5 text-gold" aria-hidden />
              </span>
              <div>
                <p className="font-display text-xl font-semibold text-ink">Email Reading</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">Human-written · 24-48h</p>
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-4xl font-semibold text-ink">$99</span>
              <span className="font-body text-sm text-ink-muted">one-time</span>
            </div>

            <ul className="mt-8 space-y-3.5">
              {rows.map((r) => (
                <li key={r.label} className="flex items-center justify-between gap-3">
                  <span className="font-body text-sm text-ink">{r.label}</span>
                  <PaidValue state={r.paid} />
                </li>
              ))}
            </ul>

            <div className="mt-8">
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
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-sm border border-gold/[0.12] bg-gold/[0.03] p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold/70" aria-hidden />
              <p className="font-body text-xs leading-relaxed text-ink-muted">
                <span className="font-semibold text-ink">30-day money-back guarantee.</span>{" "}
                If your reading doesn&apos;t resonate, email us for a full refund. No questions asked.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-10 flex items-center gap-3 rounded-sm border border-white/[0.06] bg-white/[0.02] px-5 py-4 backdrop-blur-sm md:mx-auto md:max-w-2xl">
          <Clock className="h-5 w-5 shrink-0 text-ink-dim" aria-hidden />
          <p className="font-body text-sm leading-relaxed text-ink-muted">
            <span className="font-semibold text-ink">What happens after purchase:</span>{" "}
            You&apos;ll receive an order confirmation immediately. Your human Zi Wei reader
            will analyze your chart and deliver a personalized email within 24-48 hours.
          </p>
        </div>
      </div>
    </section>
  );
}
