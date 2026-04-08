import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate program",
  description:
    "Affiliate program for Ziwei AI—coming soon with competitive commissions for partners.",
};

export default function AffiliatePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        Affiliate program
      </h1>
      <p className="mt-6 font-body text-lg text-ink-muted">
        Affiliate program coming soon.
      </p>
      <p className="mt-4 font-body text-sm leading-relaxed text-ink-dim">
        We plan to offer partner-friendly terms for astrology and wellness
        creators—including{" "}
        <strong className="font-medium text-gold">30% commission</strong>{" "}
        on qualifying referrals—subject to final program rules and regional
        eligibility.
      </p>
    </div>
  );
}
