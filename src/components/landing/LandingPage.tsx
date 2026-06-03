"use client";

import { useEffect, useRef } from "react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Register entrance animation observer for sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const sections = document.querySelectorAll("[data-reveal-section]");
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="relative" ref={scrollRef}>
      {/* Persistent fine grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-grid-fine bg-grid opacity-[0.25]"
        aria-hidden
      />

      {/* Subtle ambient gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.74_0.12_78/0.04),transparent_50%),radial-gradient(ellipse_40%_40%_at_100%_50%,oklch(0.58_0.19_32/0.03),transparent_50%)]"
        aria-hidden
      />

      <div className="relative z-10">
        <LandingNavbar formAnchorId={FORM_ANCHOR_ID} />

        <Hero formAnchorId={FORM_ANCHOR_ID} />

        <div data-reveal-section>
          <WhyZiWeiBetter />
        </div>

        <div data-reveal-section>
          <FreeVsPaidTable readingHref={`#${FORM_ANCHOR_ID}`} />
        </div>

        <div data-reveal-section>
          <SeeWhatYouGet />
        </div>

        <div data-reveal-section>
          <Testimonials />
        </div>

        <div data-reveal-section>
          <BirthSnapshotSection />
        </div>

        <div data-reveal-section>
          <RiskFree />
        </div>

        <div data-reveal-section>
          <FAQ />
        </div>

        <LandingFooter />
      </div>
    </main>
  );
}
