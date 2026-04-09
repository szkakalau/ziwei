import type { Metadata } from "next";
import PricingTable from "@/components/PricingTable";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing for DestinyBlueprint — free chart preview, full Zi Wei report, and add-ons.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-ink-muted">
          Start with a free on-site preview, then unlock the full reading when
          you want depth. Optional add-ons ship when they&apos;re ready.
        </p>
      </header>

      <PricingTable />
    </div>
  );
}
