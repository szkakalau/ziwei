import Link from "next/link";
import { getReadingUrl } from "@/lib/site";

const plans = [
  {
    name: "Free Preview",
    price: "$0",
    features: [
      "Personality snapshot",
      "Love style insight",
      "Strength & growth area",
    ],
    cta: "Get free preview",
    soon: false,
  },
  {
    name: "Full Birth Chart",
    price: "$9",
    features: [
      "15-page PDF report",
      "Career & money insights",
      "Love & relationship patterns",
      "Life challenges & strengths",
    ],
    cta: "Get full report",
    soon: false,
  },
  {
    name: "Compatibility Report",
    price: "$19",
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
    features: [
      "Themes for the year ahead",
      "Timing-friendly guidance",
      "Actionable reflection prompts",
    ],
    cta: "Coming soon",
    soon: true,
  },
];

export default function PricingTable() {
  const readingUrl = getReadingUrl();

  return (
    <div className="mt-14 grid gap-8 md:grid-cols-2">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`flex flex-col rounded-sm border p-8 shadow-panel backdrop-blur-sm ${
            plan.name === "Full Birth Chart"
              ? "border-gold/50 bg-jade-dim ring-1 ring-gold/30"
              : "border-white/10 bg-panel"
          }`}
        >
          <h2 className="font-display text-xl font-semibold text-ink">
            {plan.name}
          </h2>
          <p className="mt-4 font-display text-4xl font-bold text-ink">
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
              className="mt-8 w-full cursor-not-allowed rounded-sm border border-white/10 bg-void/60 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-ink-dim"
            >
              Coming soon
            </button>
          ) : (
            <Link
              href={readingUrl}
              className="mt-8 inline-flex w-full items-center justify-center rounded-sm border border-gold/35 bg-gradient-to-br from-cinnabar to-cinnabar-deep py-3 font-mono text-sm font-semibold uppercase tracking-wide text-ink transition hover:brightness-110"
            >
              {plan.cta}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
