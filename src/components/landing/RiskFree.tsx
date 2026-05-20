import { BadgeCheck, Clock, Lock } from "lucide-react";

const items = [
  {
    icon: BadgeCheck,
    title: "30-Day Money-Back Guarantee",
    body: "If your reading doesn't resonate with you, just email us and we'll refund you 100% — no questions asked.",
  },
  {
    icon: Clock,
    title: "Delivered In 24-48 Hours",
    body: "Your order confirmation arrives right after checkout, and your human-written Zi Wei reading is delivered by email within 24-48 hours.",
  },
  {
    icon: Lock,
    title: "Secure Checkout",
    body: "All payments are processed by Stripe, one of the world's largest and most secure payment providers. Your data is always protected.",
  },
] as const;

export default function RiskFree() {
  return (
    <section className="relative px-4 py-20 sm:px-6 md:py-28">
      <div className="relative mx-auto max-w-7xl">
        <p className="landing-kicker lg:pl-16">Risk-free</p>
        <h2 className="landing-headline mt-2 max-w-lg pl-0 text-3xl md:pl-16 md:text-4xl">
          Try It 100% Risk-Free
        </h2>

        <div className="relative mt-14 lg:pl-16">
          <div
            className="absolute left-5 top-0 hidden h-full w-px bg-gradient-to-b from-gold/50 via-cinnabar/30 to-transparent lg:block"
            aria-hidden
          />
          <ul className="flex flex-col gap-8 lg:gap-10">
            {items.map((i, idx) => (
              <li
                key={i.title}
                className={`relative flex flex-col gap-4 rounded-sm border border-white/10 bg-panel/90 p-6 shadow-panel backdrop-blur-md sm:flex-row sm:items-start sm:gap-6 ${
                  idx === 1 ? "lg:ml-12 lg:max-w-2xl" : idx === 2 ? "lg:ml-24 lg:max-w-xl" : "lg:max-w-2xl"
                }`}
              >
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-gold/30 bg-gold/10 lg:absolute lg:-left-7 lg:top-6">
                  <i.icon className="h-5 w-5 text-gold" aria-hidden />
                </span>
                <div className="lg:pl-4">
                  <h3 className="font-display text-xl font-semibold text-ink">{i.title}</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
                    {i.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
