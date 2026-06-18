import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
import { BRAND_NAME } from "@/lib/brand";

const site = getSiteUrl();

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How DestinyBlueprint handles personal and birth-related information.",
  alternates: { canonical: new URL("/privacy", site).toString() },
  openGraph: {
    type: "website",
    title: `Privacy Policy | ${BRAND_NAME}`,
    description: "How DestinyBlueprint handles personal and birth-related information.",
    url: new URL("/privacy", site),
    images: [
      {
        url: new URL("/opengraph-image", site).toString(),
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} — Privacy Policy`,
      },
    ],
  },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-20 sm:px-6">
      <h1 className="font-display text-4xl font-semibold text-ink md:text-5xl">
        Privacy Policy
      </h1>
      <p className="mt-6 font-mono text-sm text-ink-dim">
        Last updated: April 8, 2026
      </p>
      <div className="prose prose-invert mt-10 max-w-none text-sm prose-headings:font-display prose-headings:text-ink prose-p:text-ink-muted prose-li:text-ink-muted prose-strong:text-ink">
        <p>
          This placeholder summarizes our intent before legal review. Replace
          with counsel-approved text before running paid ads at scale.
        </p>
        <h2>What we collect</h2>
        <p>
          We may collect account, payment, and birth data needed to generate
          readings and deliver your purchase.
        </p>
        <h2>How we use data</h2>
        <p>
          Data is used to provide the service, improve product quality, comply
          with law, and communicate about your order.
        </p>
        <h2>Your choices</h2>
        <p>
          You may request access, correction, or deletion where applicable by
          contacting us via the Contact page.
        </p>
      </div>
    </main>
  );
}
