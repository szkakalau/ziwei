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
          className={`flex flex-col rounded-2xl border p-8 shadow-sm ${
            plan.name === "Full Birth Chart"
              ? "border-violet-300 bg-violet-50/40 ring-2 ring-violet-200/60"
              : "border-zinc-200 bg-white"
          }`}
        >
          <h2 className="text-xl font-semibold text-zinc-900">{plan.name}</h2>
          <p className="mt-4 text-4xl font-bold text-zinc-900">{plan.price}</p>
          <ul className="mt-6 flex-1 space-y-3 text-sm text-zinc-600">
            {plan.features.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-violet-600" aria-hidden>
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
              className="mt-8 w-full cursor-not-allowed rounded-full border border-zinc-200 bg-zinc-100 py-3 text-sm font-semibold text-zinc-500"
            >
              Coming soon
            </button>
          ) : (
            <Link
              href={readingUrl}
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-violet-700 py-3 text-sm font-semibold text-white transition hover:bg-violet-800"
            >
              {plan.cta}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
