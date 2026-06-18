import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site";

const site = getSiteUrl();

export const metadata: Metadata = {
  title: `Compatibility | ${BRAND_NAME}`,
  description:
    "Check your Zi Wei Dou Shu compatibility with a partner. Purple Star astrology love & relationship matching based on both birth charts.",
  alternates: { canonical: new URL("/compatibility", site).toString() },
  openGraph: {
    title: `Compatibility | ${BRAND_NAME}`,
    description:
      "Zi Wei Dou Shu love & relationship compatibility based on birth charts.",
    url: new URL("/compatibility", site),
    images: [
      {
        url: new URL("/opengraph-image", site).toString(),
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} — Compatibility`,
      },
    ],
  },
  robots: { index: false, follow: false },
};

export default function CompatibilityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
