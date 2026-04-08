import type { Metadata } from "next";
import PricingTable from "@/components/PricingTable";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for AI Chinese astrology: free preview, full birth chart PDF, and more.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-ink-muted">
          No hidden tiers. Start free, upgrade when you want depth.
        </p>
      </header>

      <PricingTable />
    </div>
  );
}
