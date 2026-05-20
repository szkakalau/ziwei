import { Check, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

type Props = {
  onBookClick?: () => void;
  readingHref?: string;
};

const rows = [
  ["Core Personality Snapshot & Traits", "yes", "yes"],
  ["Personality Strengths & Blind Spots", "partial", "yes"],
  ["12 Life Palaces Full Breakdown", "no", "yes-line"],
  ["10-Year Destiny Cycle Timeline", "no", "yes-forecast"],
  ["Love & Relationship Pattern Insights", "no", "yes"],
  ["Career & Wealth Potential Analysis", "no", "yes"],
  ["Hidden Talents & Growth Opportunities", "no", "yes"],
  ["Personalized Email Delivery", "no", "yes-inbox"],
  ["30-Day Money-Back Guarantee", "dash", "yes-coverage"],
] as const;

function CellIcon({ state }: { state: "yes" | "no" | "partial" | "dash" }) {
  if (state === "yes") {
    return (
      <span className="inline-flex items-center gap-2 text-jade">
        <Check className="h-4 w-4" aria-hidden />
        <span className="font-body text-sm text-ink-muted">Full Access</span>
      </span>
    );
  }
  if (state === "partial") {
    return (
      <span className="inline-flex items-center gap-2 text-ink-dim">
        <X className="h-4 w-4 text-ink-dim" aria-hidden />
        <span className="font-body text-sm text-ink-muted">Partial Preview</span>
      </span>
    );
  }
  if (state === "dash") {
    return <span className="font-body text-sm text-ink-dim">—</span>;
  }
  return (
    <span className="inline-flex items-center gap-2 text-ink-dim">
      <X className="h-4 w-4 text-ink-dim" aria-hidden />
    </span>
  );
}

function paidLabel(
  paidState:
    | "yes"
    | "yes-inbox"
    | "yes-line"
    | "yes-forecast"
    | "yes-coverage",
) {
  return paidState === "yes-inbox"
    ? "Delivered By Email In 24-48 Hours"
    : paidState === "yes-line"
      ? "Human-Written Reading"
      : paidState === "yes-forecast"
        ? "Focused Advice & Timing Guidance"
        : paidState === "yes-coverage"
          ? "30-Day Guarantee"
          : "Full Access";
}

export default function FreeVsPaidTable({ onBookClick, readingHref }: Props) {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-mist/50 py-20 backdrop-blur-sm md:py-28">
      <div
        className="pointer-events-none absolute right-0 top-1/4 h-40 w-40 translate-x-1/3 rotate-12 border border-gold/20 bg-gold/5"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl lg:pl-8">
            <p className="landing-kicker">Compare</p>
            <h2 className="landing-headline mt-2 text-3xl md:text-4xl">
              Free Snapshot VS Email Reading
            </h2>
          </div>
          <p className="max-w-sm font-body text-base text-ink-muted lg:text-right lg:pr-4">
            Start free, then upgrade to a human Zi Wei email reading for $99
          </p>
        </div>

        <div className="relative mt-12 lg:mt-16">
          <span
            className="absolute left-1/2 top-8 z-20 hidden -translate-x-1/2 rounded-full border border-gold/40 bg-void px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-gold lg:inline-flex"
            aria-hidden
          >
            VS
          </span>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-0">
            <div className="relative z-10 rounded-sm border border-white/10 bg-panel/80 p-5 backdrop-blur-md lg:mr-[-2rem] lg:rounded-r-none lg:pr-12 lg:pt-14">
              <p className="font-mono text-xs uppercase tracking-widest text-ink-dim">
                Free Snapshot
              </p>
              <ul className="mt-6 space-y-4">
                {rows.map(([label, freeState]) => (
                  <li
                    key={label}
                    className="flex flex-col gap-2 border-b border-white/5 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-body text-sm text-ink-muted">{label}</span>
                    <CellIcon
                      state={
                        freeState === "yes"
                          ? "yes"
                          : freeState === "partial"
                            ? "partial"
                            : freeState === "dash"
                              ? "dash"
                              : "no"
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative z-20 rounded-sm border border-gold/35 bg-gradient-to-br from-gold/10 via-panel to-cinnabar/10 p-5 shadow-glow backdrop-blur-md lg:ml-[-2rem] lg:translate-y-6 lg:rounded-l-none lg:pl-12 lg:pt-14">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gold" aria-hidden />
                <p className="font-mono text-xs uppercase tracking-widest text-gold">
                  $99 Email Reading
                </p>
              </div>
              <ul className="mt-6 space-y-4">
                {rows.map(([label, , paidState]) => (
                  <li
                    key={label}
                    className="flex flex-col gap-2 border-b border-gold/10 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="font-body text-sm text-ink">{label}</span>
                    <span className="inline-flex items-start gap-2 text-jade">
                      <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      <span className="font-body text-sm text-ink-muted">
                        {paidLabel(paidState)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-start lg:pl-8">
          {readingHref ? (
            <Button asChild variant="cta" size="lg" className="w-full max-w-xl">
              <a
                href={readingHref}
                onClick={() => track("cta_table_email_reading_click")}
              >
                Book My Email Reading
              </a>
            </Button>
          ) : (
            <Button
              type="button"
              variant="cta"
              size="lg"
              className="w-full max-w-xl"
              onClick={() => {
                track("cta_table_email_reading_click");
                onBookClick?.();
              }}
            >
              Book My Email Reading
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
