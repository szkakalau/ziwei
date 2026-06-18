import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site";

const site = getSiteUrl();

export const metadata: Metadata = {
  title: `Daily Horoscope | ${BRAND_NAME}`,
  description:
    "Your personalized daily Zi Wei Dou Shu horoscope based on your birth chart. AI-powered Purple Star astrology readings every morning.",
  alternates: { canonical: new URL("/daily", site).toString() },
  openGraph: {
    title: `Daily Horoscope | ${BRAND_NAME}`,
    description:
      "Personalized daily Zi Wei Dou Shu horoscope based on your birth chart.",
    url: new URL("/daily", site),
    images: [
      {
        url: new URL("/opengraph-image", site).toString(),
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} — Daily Horoscope`,
      },
    ],
  },
  robots: { index: false, follow: false },
};

export default function DailyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
