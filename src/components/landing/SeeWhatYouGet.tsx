import Image from "next/image";
import { Sparkles, Star, MessageCircle, Calendar, Bell } from "lucide-react";

const features = [
  {
    icon: Star,
    label: "Daily AI Horoscope",
    body: "Every morning, a personalized Zi Wei Dou Shu horoscope written by AI based on your chart and the day's transits.",
  },
  {
    icon: MessageCircle,
    label: "Ask Ziwei Chat",
    body: "Ask questions about your chart, life decisions, or specific stars — the AI understands your full birth chart.",
  },
  {
    icon: Calendar,
    label: "Yearly Forecast + PDF",
    body: "A comprehensive annual reading covering career, love, health, and wealth, downloadable as a PDF.",
  },
] as const;

export default function SeeWhatYouGet() {
  return (
    <section className="relative overflow-hidden px-5 py-20 sm:px-6 sm:py-24 md:py-32">
      {/* Background: subtle radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.74_0.12_78/0.06),transparent_60%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/10 bg-gold/[0.03] px-4 py-1.5 backdrop-blur-sm">
            <Bell className="h-3.5 w-3.5 text-gold/70" aria-hidden />
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-ink-dim">What You Get</span>
          </div>
          <h2 className="landing-headline mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            One subscription.
            <br />
            <span className="bg-gradient-to-r from-gold to-cinnabar bg-clip-text text-transparent">
              Everything you need
            </span>
            {" "}to know yourself.
          </h2>
          <p className="mt-4 mx-auto max-w-xl font-body text-base leading-relaxed text-ink-muted">
            No tiered plans. No locked features behind higher prices. One $4.99/month subscription includes every tool and reading we offer.
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-12 grid gap-5 sm:mt-16 sm:gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <article
              key={f.label}
              className="rounded-sm border border-gold/10 bg-panel/80 p-6 shadow-panel backdrop-blur-md transition-all duration-300 hover:border-gold/20"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-gold/20 bg-gold/[0.06]">
                <f.icon className="h-5 w-5 text-gold" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{f.label}</h3>
              <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">{f.body}</p>
            </article>
          ))}
        </div>

        {/* Chart preview */}
        <div className="mt-12 sm:mt-16">
          <article className="mx-auto max-w-2xl rounded-sm border border-gold/10 bg-panel/80 shadow-panel backdrop-blur-md">
            <div className="flex items-start gap-3 border-b border-gold/[0.08] px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-jade/25 bg-jade/[0.08]">
                <Sparkles className="h-5 w-5 text-jade" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold text-ink">
                  Your Zi Wei Birth Chart
                </h3>
                <p className="mt-0.5 font-body text-sm text-ink-muted">
                  The full 12-palace chart with 100+ stars — included free, no signup required
                </p>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <div className="overflow-hidden rounded-sm border border-gold/[0.06] bg-void/60">
                <Image
                  src="/images/destiny-chart-preview.jpg"
                  alt="Your personalized Zi Wei Dou Shu birth chart showing 12 palaces and 100+ stars"
                  width={1600}
                  height={1200}
                  className="block aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
