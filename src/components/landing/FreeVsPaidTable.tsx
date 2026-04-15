import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";

type Props = {
  onUnlockClick?: () => void;
  unlockHref?: string;
};

const rows = [
  ["Core Personality Snapshot & Traits", "yes", "yes"],
  ["Personality Strengths & Blind Spots", "partial", "yes"],
  ["12 Life Palaces Full Breakdown", "no", "yes-line"],
  ["10-Year Destiny Cycle Timeline", "no", "yes-forecast"],
  ["Love & Relationship Pattern Insights", "no", "yes"],
  ["Career & Wealth Potential Analysis", "no", "yes"],
  ["Hidden Talents & Growth Opportunities", "no", "yes"],
  ["Downloadable Full PDF Report", "no", "yes-inbox"],
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

export default function FreeVsPaidTable({ onUnlockClick, unlockHref }: Props) {
  return (
    <section className="relative border-y border-white/10 bg-mist/35 py-20 backdrop-blur-sm md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          What You&apos;ll Get — Free Preview VS Full Report
        </h2>
        <p className="mt-3 text-center font-body text-base text-ink-muted md:text-lg">
          Get your free snapshot instantly, unlock the full destiny report anytime for just $9
        </p>

        <div className="mt-10 overflow-x-auto rounded-sm border border-white/10 bg-panel/60 backdrop-blur-sm">
          <table className="min-w-[860px] w-full border-collapse">
            <thead>
              <tr className="text-left">
                <th className="px-5 py-4 font-mono text-xs uppercase tracking-widest text-ink-dim">
                  Core Insights
                </th>
                <th className="px-5 py-4 font-mono text-xs uppercase tracking-widest text-ink-dim">
                  Free Snapshot
                </th>
                <th className="px-5 py-4 font-mono text-xs uppercase tracking-widest text-ink">
                  <span className="inline-flex rounded-sm bg-gold/10 px-2 py-1 text-gold">
                    Full $9 Report
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, freeState, paidState], idx) => (
                <tr
                  key={label}
                  className={cn(
                    "border-t border-white/10",
                    idx % 2 === 0 ? "bg-white/[0.02]" : "",
                  )}
                >
                  <td className="px-5 py-4 font-body text-sm text-ink-muted">
                    {label}
                  </td>
                  <td className="px-5 py-4">
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
                  </td>
                  <td className="px-5 py-4 bg-gold/5">
                    <span className="inline-flex items-center gap-2 text-jade">
                      <Check className="h-4 w-4" aria-hidden />
                      <span className="font-body text-sm text-ink-muted">
                        {paidState === "yes-inbox"
                          ? "Delivered To Your Inbox In 2 Minutes"
                          : paidState === "yes-line"
                            ? "Line-by-Line Analysis"
                            : paidState === "yes-forecast"
                              ? "Full Opportunities & Risks Forecast"
                              : paidState === "yes-coverage"
                                ? "Full Coverage"
                                : "Full Access"}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 flex justify-center">
          {unlockHref ? (
            <Button asChild variant="cta" size="lg" className="w-full max-w-xl">
              <a
                href={unlockHref}
                onClick={() => track("cta_table_unlock_click")}
              >
                Unlock My Full Report For $9
              </a>
            </Button>
          ) : (
            <Button
              type="button"
              variant="cta"
              size="lg"
              className="w-full max-w-xl"
              onClick={() => {
                track("cta_table_unlock_click");
                onUnlockClick?.();
              }}
            >
              Unlock My Full Report For $9
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

