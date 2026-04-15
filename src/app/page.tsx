import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";
import { DEFAULT_META_DESCRIPTION } from "@/lib/brand";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "DestinyBlueprint — Zi Wei Dou Shu AI Reading",
  description: DEFAULT_META_DESCRIPTION,
  metadataBase: getSiteUrl(),
  openGraph: {
    type: "website",
    title: "DestinyBlueprint — Zi Wei Dou Shu AI Reading",
    description: DEFAULT_META_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "DestinyBlueprint — Zi Wei Dou Shu AI Reading",
    description: DEFAULT_META_DESCRIPTION,
  },
};

export default function HomePage() {
  return <LandingPage />;
}
