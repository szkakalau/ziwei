"use client";

import { MessageCircle, Mail, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

const cards = [
  {
    icon: Sparkles,
    label: "Daily AI Insight",
    body: "Every morning, a personalized reading based on your personality patterns. Here's what it looks like:",
    sample: (
      <div className="mt-3 rounded-sm border border-gold/[0.08] bg-gold/[0.03] px-4 py-3 font-body text-sm leading-relaxed text-ink/80">
        Your <span className="font-semibold text-gold">Resources & Values</span> domain is activated today. A conversation about money or direction may surface — pay attention to what people reveal. Your <span className="font-semibold text-star">Professional Life</span> domain suggests opportunity within 72 hours. Trust your instinct.
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Architect", "Stabilizer", "Executor"].map((a) => (
            <span key={a} className="inline-flex items-center gap-1 rounded-sm border border-gold/[0.10] bg-gold/[0.04] px-2 py-0.5 font-mono text-[11px] text-gold/70">{a}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: MessageCircle,
    label: "Ask Ziwei Chat",
    body: "Ask anything about your patterns or life direction. The AI has full context of your 12 life domains.",
    sample: (
      <div className="mt-3 space-y-2">
        <div className="ml-4 rounded-sm border border-star/[0.12] bg-star/[0.03] px-3 py-2 font-body text-sm text-ink-muted">
          Should I change jobs in the next 3 months?
        </div>
        <div className="rounded-sm border border-gold/[0.08] bg-gold/[0.03] px-3 py-2 font-body text-sm leading-relaxed text-ink/80">
          Your Professional Life domain shows your Anchor pattern in a supportive position — stability serves you now. A mobility indicator appears in your 3-month outlook. Wait 6-8 weeks for a clearer signal.
        </div>
      </div>
    ),
  },
  {
    icon: Mail,
    label: "Human Email Reading",
    body: "One-time deep analysis delivered within 24-48 hours. Choose your focus: love, career, wealth, or life timing.",
    sample: null,
    featured: true,
  },
];

export default function ProductShowcase() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_30%,oklch(0.80_0.14_82/0.03),transparent_55%)]" aria-hidden />

      <div className="relative mx-auto max-w-5xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/[0.10] bg-gold/[0.03] px-4 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-gold/70" aria-hidden />
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold/80">What You Get</span>
          </div>
          <h2 className="landing-headline mt-4 text-2xl sm:text-3xl md:text-4xl">
            Everything in one subscription.
          </h2>
          <p className="mt-3 mx-auto max-w-lg font-body text-base text-ink-muted">
            No tiers. No upsells. One $4.99/month plan includes every feature.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className={`rounded-sm border ${c.featured ? "border-gold/25" : "border-gold/10"} bg-panel/80 p-5 shadow-panel backdrop-blur-md`}>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-gold/20 bg-gold/[0.06]">
                <c.icon className="h-5 w-5 text-gold" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{c.label}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">{c.body}</p>
              {c.sample}
              {c.featured && (
                <div className="mt-3 rounded-sm border border-gold/[0.10] bg-gold/[0.03] px-3 py-2 font-body text-xs text-ink-dim">
                  24-48 hour delivery · Real practitioner · 30% sample shown on site
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/daily" className="btn-cta px-8 py-4">
            Start 7-Day Free Trial — $4.99/month
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <p className="mt-3 font-body text-sm text-ink-dim">Cancel anytime. No charge until trial ends.</p>
        </div>
      </div>
    </section>
  );
}