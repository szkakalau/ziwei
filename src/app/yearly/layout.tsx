import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site";

const site = getSiteUrl();

export const metadata: Metadata = {
  title: `Yearly Forecast | ${BRAND_NAME}`,
  description:
    "Your annual Zi Wei Dou Shu forecast based on your birth chart. Discover what the year ahead holds for career, relationships, and luck cycles.",
  alternates: { canonical: new URL("/yearly", site).toString() },
  openGraph: {
    title: `Yearly Forecast | ${BRAND_NAME}`,
    description:
      "Your annual Zi Wei Dou Shu forecast based on your birth chart.",
    url: new URL("/yearly", site),
    images: [
      {
        url: new URL("/opengraph-image", site).toString(),
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} — Yearly Forecast`,
      },
    ],
  },
  robots: { index: false, follow: false },
};

export default function YearlyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
