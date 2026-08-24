import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
import { BRAND_NAME } from "@/lib/brand";

const site = getSiteUrl();

export const metadata: Metadata = {
  title: "Zi Wei Dou Shu API",
  description:
    "Developer API for Zi Wei Dou Shu birth chart computation and horoscope generation. Free for non-commercial use.",
  alternates: { canonical: new URL("/api-docs", site).toString() },
  openGraph: {
    type: "website",
    title: `Zi Wei Dou Shu API | ${BRAND_NAME}`,
    description:
      "Developer API for Zi Wei Dou Shu birth chart computation and horoscope generation. Free for non-commercial use.",
    url: new URL("/api-docs", site),
    images: [
      {
        url: new URL("/opengraph-image", site).toString(),
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} — Zi Wei Dou Shu API`,
      },
    ],
  },
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
