import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate program",
  description:
    "Affiliate program for Ziwei AI—coming soon with competitive commissions for partners.",
};

export default function AffiliatePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        Affiliate program
      </h1>
      <p className="mt-6 text-lg text-zinc-600">
        Affiliate program coming soon.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-zinc-500">
        We plan to offer partner-friendly terms for astrology and wellness
        creators—including{" "}
        <strong className="font-medium text-zinc-700">30% commission</strong>{" "}
        on qualifying referrals—subject to final program rules and regional
        eligibility.
      </p>
    </div>
  );
}
