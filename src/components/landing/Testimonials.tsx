import { ClipboardCheck, Sparkles, Zap, Star, MessageCircle, Heart, Calendar, Gift, Flame, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    step: "01",
    icon: ClipboardCheck,
    title: "Enter your birth details",
    body: "Date, time, and place. Takes 30 seconds. No signup required — we compute your Zi Wei Dou Shu chart with true solar time correction.",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "Get your free personality snapshot",
    body: "Instantly see your core traits, key strengths, and growth areas — deterministically mapped from your unique chart of 100+ stars across 12 life palaces.",
  },
  {
    step: "03",
    icon: Zap,
    title: "Unlock everything with a 7-day free trial",
    body: "Daily AI horoscopes, AI chat, compatibility checks, yearly forecasts, birthday surprises, push notifications, and a one-time human-written email reading — all for $4.99/month after the trial.",
  },
] as const;

const realFeatures = [
  {
    icon: Star,
    label: "Daily AI Horoscope",
    body: "Every morning, a personalized reading based on your chart and the day's transits. DeepSeek-powered with OpenAI fallback.",
  },
  {
    icon: MessageCircle,
    label: "Ask Ziwei Chat",
    body: "Ask anything about your chart, stars, or life direction. The AI has full context of your 12 palaces and star placements.",
  },
  {
    icon: Heart,
    label: "Compatibility Check",
    body: "Compare your chart with a partner, friend, or crush. See how your stars interact across palaces.",
  },
  {
    icon: Calendar,
    label: "Yearly Forecast + PDF",
    body: "A full annual reading covering career, love, health, and wealth. Download as PDF to reference anytime.",
  },
  {
    icon: Mail,
    label: "Human-Written Email Reading",
    body: "One-time deep analysis by a real Zi Wei practitioner. Delivered within 24-48 hours of subscribing.",
  },
  {
    icon: Flame,
    label: "Streaks & Achievements",
    body: "Track your daily check-ins. Earn achievements as you deepen your practice with the stars.",
  },
] as const;

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden px-5 py-20 sm:px-6 sm:py-24 md:py-32">
      {/* Background: subtle radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.74_0.12_78/0.05),transparent_55%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/10 bg-gold/[0.03] px-4 py-1.5 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5 text-gold/70" aria-hidden />
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-dim">How It Works</span>
          </div>
          <h2 className="landing-headline mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            From birth chart
            <br />
            <span className="bg-gradient-to-r from-gold to-cinnabar bg-clip-text text-transparent">
              to daily guidance
            </span>
            {" "}in 3 steps.
          </h2>
          <p className="mt-4 mx-auto max-w-xl font-body text-base leading-relaxed text-ink-muted">
            No AI generates your birth chart — we use iztro, an open-source Zi Wei Dou Shu computation library, with true solar time correction via the equation of time.
          </p>
        </div>

        {/* 3-step flow */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <article
              key={s.step}
              className="relative flex flex-col rounded-sm border border-gold/10 bg-panel/80 p-6 shadow-panel backdrop-blur-md transition-all duration-300 hover:border-gold/20"
            >
              <div className="flex items-start justify-between">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-sm border border-gold/20 bg-gold/[0.06]">
                  <s.icon className="h-5 w-5 text-gold" aria-hidden />
                </span>
                <span className="font-display text-2xl font-semibold text-ink-dim sm:text-3xl">{s.step}</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">{s.body}</p>
            </article>
          ))}
        </div>

        {/* Features grid */}
        <div className="mt-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/10 bg-gold/[0.03] px-4 py-1.5 backdrop-blur-sm">
              <Gift className="h-3.5 w-3.5 text-gold/70" aria-hidden />
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-dim">Everything Included</span>
            </div>
            <h3 className="mt-3 font-display text-xl font-semibold text-ink sm:text-2xl md:text-3xl">
              One subscription. Every feature.
            </h3>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {realFeatures.map((f) => (
              <div
                key={f.label}
                className="flex flex-col rounded-sm border border-gold/[0.08] bg-panel/60 p-5 backdrop-blur-sm transition-all duration-200 hover:border-gold/[0.15]"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-gold/[0.15] bg-gold/[0.04]">
                  <f.icon className="h-4 w-4 text-gold/80" aria-hidden />
                </span>
                <h4 className="mt-3 font-display text-base font-semibold text-ink">{f.label}</h4>
                <p className="mt-1.5 font-body text-sm leading-relaxed text-ink-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/daily"
            className="btn-cta px-8 py-4"
          >
            Start 7-Day Free Trial
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <p className="mt-3 font-body text-sm text-ink-dim">
            $4.99/month after trial. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}