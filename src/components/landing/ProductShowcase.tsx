"use client";

import {
  Sparkles,
  MessageCircle,
  Heart,
  Calendar,
  Mail,
  Star,
  Sun,
  Moon,
  ArrowRight,
} from "lucide-react";
import EmailReadingPreviewSample from "@/components/landing/EmailReadingPreviewSample";
import Link from "next/link";

/* ── Daily Horoscope Preview Card ── */
function DailyHoroscopePreview() {
  return (
    <div className="card-cosmic overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-gold/[0.08] px-5 py-3">
        <div className="flex items-center gap-2">
          <Sun className="h-4 w-4 text-gold/70" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-wider text-gold/70">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-sm border border-gold/[0.15] bg-gold/[0.05] px-2 py-0.5 font-mono text-[9px] text-gold/60">
          <Sparkles className="h-2.5 w-2.5" /> AI Generated
        </span>
      </div>
      {/* Horoscope text */}
      <div className="p-5">
        <p className="font-body text-[15px] leading-relaxed text-ink/85">
          Your <span className="font-semibold text-gold">Resources & Values</span>{" "}
          domain is activated today by a favorable pattern alignment. A
          conversation about money or direction may surface unexpectedly — pay
          attention to what people reveal, not just what they say. Your{" "}
          <span className="font-semibold text-star">Professional Life</span>{" "}
          domain suggests a window of opportunity within the next 72 hours. Trust
          your instinct on timing.
        </p>
        {/* Archetype tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {["Architect", "Stabilizer", "Executor"].map((archetype) => (
            <span
              key={archetype}
              className="inline-flex items-center gap-1 rounded-sm border border-gold/[0.10] bg-gold/[0.04] px-2 py-0.5 font-mono text-[10px] text-gold/70"
            >
              <Star className="h-2.5 w-2.5" />
              {archetype}
            </span>
          ))}
        </div>
      </div>
      {/* Footer label */}
      <div className="border-t border-gold/[0.06] bg-gold/[0.02] px-5 py-2.5">
        <p className="font-mono text-[9px] uppercase tracking-wider text-ink-dim">
          New insight every morning · based on your patterns
        </p>
      </div>
    </div>
  );
}

/* ── Ask Ziwei Chat Preview ── */
function AskZiweiChatPreview() {
  return (
    <div className="card-cosmic overflow-hidden">
      <div className="border-b border-gold/[0.08] px-5 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-star/70" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-wider text-star/70">
            Ask Ziwei · AI Chat
          </span>
        </div>
      </div>
      <div className="space-y-3 p-5">
        {/* User question */}
        <div className="ml-8 rounded-sm border border-star/[0.12] bg-star/[0.03] px-3 py-2">
          <p className="font-body text-sm text-ink-muted">
            Should I change jobs in the next 3 months based on my Professional Life
            domain?
          </p>
        </div>
        {/* AI response */}
        <div className="rounded-sm border border-gold/[0.08] bg-gold/[0.03] px-3 py-2">
          <p className="font-body text-sm leading-relaxed text-ink/80">
            Your Professional Life domain shows your Anchor pattern in a supportive
            position — stability is currently serving you well. However, a mobility
            indicator appears in your 3-month outlook, suggesting movement is on
            the horizon. Short answer: wait 6-8 weeks for a clearer signal, then
            decide.
          </p>
        </div>
      </div>
      <div className="border-t border-gold/[0.06] bg-gold/[0.02] px-5 py-2.5">
        <p className="font-mono text-[9px] uppercase tracking-wider text-ink-dim">
          Unlimited questions · understands your full birth chart
        </p>
      </div>
    </div>
  );
}

/* ── Compatibility Preview ── */
function CompatibilityPreview() {
  return (
    <div className="card-cosmic overflow-hidden">
      <div className="border-b border-gold/[0.08] px-5 py-3">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-cinnabar/70" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-wider text-cinnabar/70">
            Compatibility Check
          </span>
        </div>
      </div>
      <div className="p-5">
        {/* Two names */}
        <div className="flex items-center justify-center gap-6">
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-gold/15 bg-gold/[0.05]">
              <Sun className="h-5 w-5 text-gold/60" />
            </div>
            <p className="mt-1.5 font-body text-xs text-ink-muted">You</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl">💫</span>
            <span className="font-display text-xl font-semibold text-gold">82%</span>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-gold/15 bg-gold/[0.05]">
              <Moon className="h-5 w-5 text-star/60" />
            </div>
            <p className="mt-1.5 font-body text-xs text-ink-muted">Partner</p>
          </div>
        </div>
        {/* Highlights */}
        <div className="mt-4 space-y-1.5">
          {[
            { label: "Emotional match", score: "Strong", color: "text-jade" },
            { label: "Career synergy", score: "High", color: "text-gold" },
            { label: "Communication", score: "Good", color: "text-star" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <span className="text-ink-dim">{item.label}</span>
              <span className={`font-semibold ${item.color}`}>{item.score}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-gold/[0.06] bg-gold/[0.02] px-5 py-2.5">
        <p className="font-mono text-[9px] uppercase tracking-wider text-ink-dim">
          Compare with anyone · based on both charts
        </p>
      </div>
    </div>
  );
}

/* ── Yearly Forecast Preview ── */
function YearlyForecastPreview() {
  return (
    <div className="card-cosmic overflow-hidden">
      <div className="border-b border-gold/[0.08] px-5 py-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-jade/70" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-wider text-jade/70">
            Yearly Forecast + PDF
          </span>
        </div>
      </div>
      <div className="p-5">
        {/* PDF thumbnail */}
        <div className="mx-auto max-w-[200px] rounded-sm border border-gold/[0.10] bg-void/60 p-4 text-center">
          <div className="text-3xl">📄</div>
          <p className="mt-2 font-display text-sm font-semibold text-ink">2026 Annual Reading</p>
          <p className="mt-1 font-mono text-[10px] text-ink-dim">
            Career · Love · Wealth · Health
          </p>
          <div className="mt-3 space-y-1">
            {[80, 60, 90, 40].map((w, i) => (
              <div
                key={i}
                className="h-1 rounded-full bg-gold/[0.12]"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-gold/[0.06] bg-gold/[0.02] px-5 py-2.5">
        <p className="font-mono text-[9px] uppercase tracking-wider text-ink-dim">
          Downloadable PDF · updated yearly
        </p>
      </div>
    </div>
  );
}

/* ── Email Reading Preview ── */
function EmailReadingPreview() {
  return (
    <div className="card-cosmic-highlight overflow-hidden">
      <div className="border-b border-gold/[0.12] px-5 py-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gold/70" aria-hidden />
          <span className="font-mono text-[10px] uppercase tracking-wider text-gold/70">
            Human-Written Email Reading
          </span>
          <span className="ml-auto inline-flex items-center rounded-sm border border-gold/20 bg-gold/[0.06] px-2 py-0.5 font-mono text-[9px] text-gold">
            Most Popular
          </span>
        </div>
      </div>
      <div className="p-5">
        <EmailReadingPreviewSample />
      </div>
      <div className="border-t border-gold/[0.08] bg-gold/[0.03] px-5 py-2.5">
        <p className="font-mono text-[9px] uppercase tracking-wider text-ink-dim">
          Delivered in 24-48 hours · written by a real Zi Wei practitioner
        </p>
      </div>
    </div>
  );
}

const showcases = [
  {
    title: "Daily AI Insight",
    description:
      "Every morning, a personalized reading based on your personality patterns and the day's dynamics.",
    preview: <DailyHoroscopePreview />,
  },
  {
    title: "Ask Ziwei Chat",
    description:
      "Ask anything about your patterns, life direction, or specific archetypes — the AI has full context of your 12 life domains.",
    preview: <AskZiweiChatPreview />,
  },
  {
    title: "Compatibility Check",
    description:
      "Compare your patterns with anyone. See how your archetypes interact across life domains.",
    preview: <CompatibilityPreview />,
  },
  {
    title: "Yearly Forecast + PDF",
    description:
      "A full annual reading covering career, love, health, and wealth.",
    preview: <YearlyForecastPreview />,
  },
  {
    title: "Human Email Reading",
    description:
      "One-time deep analysis by a real Zi Wei practitioner, delivered within 24-48 hours.",
    preview: <EmailReadingPreview />,
    featured: true,
  },
];

export default function ProductShowcase() {
  return (
    <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 md:py-32">
      {/* Background */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_30%,oklch(0.80_0.14_82/0.04),transparent_55%),radial-gradient(ellipse_40%_35%_at_20%_70%,oklch(0.52_0.18_250/0.05),transparent_50%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/[0.10] bg-gold/[0.03] px-4 py-1.5 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-gold/70" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold/80">
              What You Get Every Day
            </span>
          </div>
          <h2 className="landing-headline mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            This is what{" "}
            <span className="bg-gradient-to-r from-gold via-gold/90 to-cinnabar bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient-shift">
              $4.99/month
            </span>
            <br />
            actually looks like.
          </h2>
          <p className="mt-4 mx-auto max-w-xl font-body text-base leading-relaxed text-ink-muted">
            No vague promises. Here are real previews of every feature included
            in your subscription — all powered by your unique birth chart.
          </p>
        </div>

        {/* Showcase grid */}
        <div className="mt-12 grid gap-6 sm:mt-16 lg:grid-cols-2">
          {showcases.map((item) => (
            <div
              key={item.title}
              className={item.featured ? "lg:col-span-2" : ""}
            >
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 font-body text-sm text-ink-muted">
                    {item.description}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-ink-dim">
                  Included
                </span>
              </div>
              {item.preview}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/daily"
            className="gold-leaf inline-flex items-center gap-2 rounded-sm px-8 py-4 font-mono text-sm font-semibold uppercase tracking-wide text-ink transition-all hover:brightness-110"
          >
            Start 7-Day Free Trial — See Your Real Reading
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <p className="mt-3 font-body text-sm text-ink-dim">
            All previews above are samples. Your real chart produces unique results.
          </p>
        </div>
      </div>
    </section>
  );
}
