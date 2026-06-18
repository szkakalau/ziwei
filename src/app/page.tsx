import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";
import { BRAND_NAME, DEFAULT_META_DESCRIPTION } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();
const homeTitle = `${BRAND_NAME} — Zi Wei Dou Shu Email Reading`;

export const metadata: Metadata = {
  title: homeTitle,
  description: DEFAULT_META_DESCRIPTION,
  metadataBase: siteUrl,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: homeTitle,
    description: DEFAULT_META_DESCRIPTION,
    url: "/",
    images: [
      {
        url: new URL("/opengraph-image", siteUrl).toString(),
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} — Daily Zi Wei Dou Shu Horoscopes`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: DEFAULT_META_DESCRIPTION,
    images: [
      {
        url: new URL("/opengraph-image", siteUrl).toString(),
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} — Daily Zi Wei Dou Shu Horoscopes`,
      },
    ],
  },
};

export default function HomePage() {
  return <LandingPage />;
}
