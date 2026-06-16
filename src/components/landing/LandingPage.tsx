"use client";

import Hero from "@/components/landing/Hero";
import LandingNavbar from "@/components/landing/LandingNavbar";
import ProductShowcase from "@/components/landing/ProductShowcase";
import FreeVsPaidTable from "@/components/landing/FreeVsPaidTable";
import FAQ from "@/components/landing/FAQ";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <main className="relative">
      {/* Persistent fine grid */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid-fine bg-grid opacity-[0.25]" aria-hidden />

      {/* Ambient gradients */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.74_0.12_78/0.04),transparent_50%),radial-gradient(ellipse_40%_40%_at_100%_50%,oklch(0.58_0.19_32/0.03),transparent_50%)]" aria-hidden />

      <div className="relative z-10">
        <LandingNavbar />

        {/* 1. Hero — headline + birth form inline */}
        <Hero />

        {/* 2. What You Get — 3 cards */}
        <ProductShowcase />

        {/* 3. Pricing */}
        <FreeVsPaidTable />

        {/* 4. FAQ */}
        <FAQ />

        <LandingFooter />
      </div>
    </main>
  );
}
