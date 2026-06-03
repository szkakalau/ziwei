import { BadgeCheck, Clock, Lock, ShieldCheck } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "30-Day Money-Back Guarantee",
    body: "If your reading doesn't resonate with you, just email us and we'll refund 100% — no questions, no hoops, no hassle.",
  },
  {
    icon: Clock,
    title: "Delivered Within 24-48 Hours",
    body: "You'll receive an order confirmation immediately after checkout. Your human-written Zi Wei reading arrives by email within 24-48 hours.",
  },
  {
    icon: Lock,
    title: "Secure, Private Checkout",
    body: "All payments processed by Stripe. Your birth data is encrypted and never shared. We delete it on request.",
  },
] as const;

export default function RiskFree() {
  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 md:py-32">
      {/* Background: subtle diagonal accent */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-72 w-72 -translate-y-1/2 translate-x-1/3 rounded-full border border-jade/[0.08] bg-jade/[0.02]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-jade/[0.15] bg-jade/[0.04] px-4 py-1.5 backdrop-blur-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-jade/70" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-jade">Risk-Free Guarantee</span>
          </div>
          <h2 className="landing-headline mt-5 text-3xl md:text-4xl lg:text-5xl">
            You have nothing to lose.
            <br />
            <span className="text-ink-muted">Except maybe a{" "}</span>
            <span className="bg-gradient-to-r from-jade to-gold bg-clip-text text-transparent">
              wrong assumption
            </span>
            {" "}about yourself.
          </h2>
        </div>

        {/* Timeline-style cards */}
        <div className="relative mt-16">
          {/* Vertical connector line */}
          <div
            className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-gold/40 via-cinnabar/20 to-transparent md:block"
            aria-hidden
          />

          <div className="flex flex-col gap-8">
            {items.map((item, idx) => (
              <div
                key={item.title}
                className={`relative flex flex-col gap-5 rounded-sm border border-white/[0.08] bg-panel/80 p-6 shadow-panel backdrop-blur-md transition-all duration-300 hover:border-white/[0.14] md:flex-row md:items-start md:gap-6 md:p-7 ${
                  idx === 1 ? "md:ml-16 md:max-w-2xl" : idx === 2 ? "md:ml-32 md:max-w-xl" : "md:max-w-2xl"
                }`}
              >
                {/* Icon — positioned on the timeline on desktop */}
                <div className="relative md:absolute md:-left-8 md:top-7">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gold/25 bg-void shadow-[0_0_20px_-4px_oklch(0.74_0.12_78/0.15)]">
                    <item.icon className="h-5 w-5 text-gold" aria-hidden />
                  </span>
                </div>

                <div className="md:pl-6">
                  <h3 className="font-display text-xl font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom assurance */}
        <div className="mt-12 flex items-center gap-3 rounded-sm border border-gold/[0.12] bg-gold/[0.03] px-5 py-4 backdrop-blur-sm md:mx-auto md:max-w-xl">
          <BadgeCheck className="h-5 w-5 shrink-0 text-gold/70" aria-hidden />
          <p className="font-body text-sm leading-relaxed text-ink-muted">
            <span className="font-semibold text-ink">The guarantee is simple:</span>{" "}
            If you don&apos;t feel your reading was worth every dollar, we refund it.
            We&apos;ve done this for hundreds of readers.
          </p>
        </div>
      </div>
    </section>
  );
}
