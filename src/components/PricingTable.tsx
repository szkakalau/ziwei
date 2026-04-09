import Link from "next/link";
import { getReadingUrl } from "@/lib/site";

const plans = [
  {
    name: "Full Destiny Report",
    price: "$19",
    highlight: true,
    features: [
      "Long-form Zi Wei reading (AI-assisted)",
      "PDF download + web report",
      "Career, wealth, love, and timing themes",
      "Delivered by email after secure checkout",
    ],
    cta: "Get my reading",
    soon: false,
  },
  {
    name: "Compatibility Report",
    price: "$19",
    highlight: false,
    features: [
      "Relationship dynamics",
      "Emotional compatibility",
      "Communication style",
    ],
    cta: "Coming soon",
    soon: true,
  },
  {
    name: "Yearly Forecast",
    price: "$19",
    highlight: false,
    features: [
      "Themes for the year ahead",
      "Timing-friendly guidance",
      "Actionable reflection prompts",
    ],
    cta: "Coming soon",
    soon: true,
  },
] as const;

export default function PricingTable() {
  const readingUrl = getReadingUrl();

  return (
    <div className="mt-14 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`flex min-h-0 flex-col rounded-sm border p-6 shadow-panel backdrop-blur-sm sm:p-8 ${
            plan.highlight
              ? "border-gold/50 bg-jade-dim ring-1 ring-gold/30"
              : "border-white/10 bg-panel"
          }`}
        >
          <h2 className="font-display text-xl font-semibold text-ink">
            {plan.name}
          </h2>
          <p className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">
            {plan.price}
          </p>
          <ul className="mt-6 flex-1 space-y-3 font-body text-sm text-ink-muted">
            {plan.features.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-gold" aria-hidden>
                  •
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          {plan.soon ? (
            <button
              type="button"
              disabled
              className="mt-8 min-h-11 w-full cursor-not-allowed rounded-sm border border-white/10 bg-void/60 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-ink-dim"
            >
              Coming soon
            </button>
          ) : (
            <Link
              href={readingUrl}
              className="mt-8 inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-gold/35 bg-gradient-to-br from-cinnabar to-cinnabar-deep py-3 font-mono text-sm font-semibold uppercase tracking-wide text-ink transition hover:brightness-110"
            >
              {plan.cta}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
