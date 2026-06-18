import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
import { BRAND_NAME } from "@/lib/brand";

const site = getSiteUrl();

export const metadata: Metadata = {
  title: "Affiliate program",
  description:
    "Affiliate program for DestinyBlueprint—coming soon with competitive commissions for partners.",
  alternates: { canonical: new URL("/affiliate", site).toString() },
  openGraph: {
    type: "website",
    title: `Affiliate Program | ${BRAND_NAME}`,
    description:
      "Affiliate program for DestinyBlueprint—coming soon with competitive commissions for partners.",
    url: new URL("/affiliate", site),
    images: [
      {
        url: new URL("/opengraph-image", site).toString(),
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} — Affiliate Program`,
      },
    ],
  },
};

export default function AffiliatePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
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
    </main>
  );
}
