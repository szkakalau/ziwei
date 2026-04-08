import Hero from "@/components/Hero";
import SocialProof from "@/components/SocialProof";
import HowItWorks from "@/components/HowItWorks";
import PreviewSection from "@/components/PreviewSection";
import FinalCTA from "@/components/FinalCTA";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Purple Star astrology reading—free preview",
  description:
    "See how AI translates classical Purple Star (Zi Wei) astrology into clear, practical insights about you.",
};

export default function HomePage() {
  return (
    <main>
      <Hero />
      <SocialProof />
      <HowItWorks />
      <PreviewSection />
      <FinalCTA />
    </main>
  );
}
