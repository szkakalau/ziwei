import type { Metadata } from "next";
import PricingTable from "@/components/PricingTable";
import { getSiteUrl } from "@/lib/site";
import { BRAND_NAME } from "@/lib/brand";
import JsonLd from "@/components/JsonLd";

const site = getSiteUrl();

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple pricing for DestinyBlueprint — free chart snapshot and personalized Zi Wei email readings.",
  alternates: { canonical: new URL("/pricing", site).toString() },
  openGraph: {
    type: "website",
    title: `Pricing | ${BRAND_NAME}`,
    description:
      "Simple pricing for DestinyBlueprint — free chart snapshot and personalized Zi Wei email readings.",
    url: new URL("/pricing", site),
    images: [
      {
        url: new URL("/opengraph-image", site).toString(),
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} — Pricing`,
      },
    ],
  },
};

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-20 sm:px-6">
      <JsonLd
        data={{
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: site.toString() },
            { "@type": "ListItem", position: 2, name: "Pricing", item: new URL("/pricing", site).toString() },
          ],
        }}
      />
      <header className="text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-4 max-w-2xl font-body text-lg text-ink-muted">
          Start with a free chart snapshot, then upgrade to a personalized human
          reading by email when you want depth.
        </p>
      </header>

      <PricingTable />
    </main>
  );
}
