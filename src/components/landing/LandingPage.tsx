"use client";

import { useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import Hero from "@/components/landing/Hero";
import LandingNavbar from "@/components/landing/LandingNavbar";
import TrustBar from "@/components/landing/TrustBar";
import WhyZiWeiBetter from "@/components/landing/WhyZiWeiBetter";
import ProductShowcase from "@/components/landing/ProductShowcase";
import SeeWhatYouGet from "@/components/landing/SeeWhatYouGet";
import FreeVsPaidTable from "@/components/landing/FreeVsPaidTable";
import Testimonials from "@/components/landing/Testimonials";
import RiskFree from "@/components/landing/RiskFree";
import FAQ from "@/components/landing/FAQ";
import LandingFooter from "@/components/landing/LandingFooter";
import StickyUnlockBar from "@/components/landing/StickyUnlockBar";

export default function LandingPage() {
  const pathname = usePathname();

  // Next.js App Router client-side navigation to /#hash does NOT auto-scroll
  // (Link navigation updates the URL but skips the native hash-scroll that a
  // full page load would do). Scroll to the hash target manually on mount,
  // on pathname change, and on hashchange.
  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      // Defer so the target element is painted after client navigation.
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      });
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, [pathname]);

  const scrollToHero = useCallback(() => {
    document.getElementById("hero-form")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <main className="relative">
      {/* Persistent fine grid — reduced opacity for darker feel */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-fine bg-grid opacity-[0.15]" aria-hidden />

      {/* Ambient gradients — deeper cosmic: dark void + subtle gold edge */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.34_0.13_282/0.04),transparent_50%),radial-gradient(ellipse_40%_40%_at_100%_50%,oklch(0.34_0.13_282/0.02),transparent_50%)]" aria-hidden />

      <div className="relative z-10">
        <LandingNavbar />

        {/* 1. Hero — headline + birth form inline */}
        <Hero />

        {/* 2. Trust bar — social proof stats */}
        <TrustBar />

        {/* 3. Why Zi Wei Dou Shu — problem agitation + differentiation */}
        <WhyZiWeiBetter />

        {/* 4. What You Get — 3 feature cards */}
        <ProductShowcase />

        {/* 5. Product preview — chart + feature grid */}
        <SeeWhatYouGet />

        {/* 6. Pricing comparison */}
        <FreeVsPaidTable />

        {/* 7. Testimonials — how it works + feature grid */}
        <Testimonials />

        {/* 8. Risk reversal — trial guarantee */}
        <RiskFree />

        {/* 9. FAQ — handle final objections */}
        <FAQ />

        <LandingFooter />

        {/* Sticky bottom CTA — scrolls back to hero form */}
        <StickyUnlockBar onContinue={scrollToHero} />
      </div>
    </main>
  );
}
