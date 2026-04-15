"use client";

import Hero from "@/components/landing/Hero";
import LandingNavbar from "@/components/landing/LandingNavbar";
import WhyZiWeiBetter from "@/components/landing/WhyZiWeiBetter";
import FreeVsPaidTable from "@/components/landing/FreeVsPaidTable";
import SeeWhatYouGet from "@/components/landing/SeeWhatYouGet";
import Testimonials from "@/components/landing/Testimonials";
import RiskFree from "@/components/landing/RiskFree";
import FAQ from "@/components/landing/FAQ";
import LandingFooter from "@/components/landing/LandingFooter";
import BirthSnapshotSection from "@/components/landing/BirthSnapshotSection";

const FORM_ANCHOR_ID = "birth-form";

export default function LandingPage() {
  return (
    <main>
      <LandingNavbar formAnchorId={FORM_ANCHOR_ID} />
      <Hero formAnchorId={FORM_ANCHOR_ID} />
      <WhyZiWeiBetter />
      <FreeVsPaidTable unlockHref={`#${FORM_ANCHOR_ID}`} />
      <SeeWhatYouGet />
      <Testimonials />
      <BirthSnapshotSection />

      <RiskFree />
      <FAQ />
      <LandingFooter />
    </main>
  );
}

