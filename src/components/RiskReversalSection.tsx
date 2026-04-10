import { getSupportEmail } from "@/lib/brand";

function IconShield({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M24 4L8 12v12c0 9.5 6.2 18.4 16 22 9.8-3.6 16-12.5 16-22V12L24 4z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
        className="text-jade"
      />
      <path
        d="M17 24l4.5 4.5L32 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gold"
      />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        cx="24"
        cy="24"
        r="17"
        stroke="currentColor"
        strokeWidth="1.25"
        className="text-gold/70"
      />
      <path
        d="M24 14v11l7 4"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ink"
      />
      <circle cx="24" cy="24" r="2" fill="currentColor" className="text-gold" />
    </svg>
  );
}

function IconStripe({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect
        x="8"
        y="14"
        width="32"
        height="22"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.25"
        className="text-gold/75"
      />
      <path
        d="M8 20h32"
        stroke="currentColor"
        strokeWidth="1"
        className="text-white/20"
      />
      <rect x="12" y="26" width="10" height="3" rx="1" fill="currentColor" className="text-jade/90" />
      <rect x="26" y="26" width="10" height="3" rx="1" fill="currentColor" className="text-ink-dim" />
      <circle cx="36" cy="17" r="2" fill="currentColor" className="text-cinnabar/90" />
    </svg>
  );
}

const CARDS = [
  {
    icon: IconShield,
    title: "30-day money-back guarantee",
    body: (
      <>
        If your reading doesn&apos;t feel accurate, email us and we will refund you.
        <span className="mt-3 block font-medium text-ink/95">No questions asked.</span>
      </>
    ),
  },
  {
    icon: IconClock,
    title: "Delivered in minutes",
    body: (
      <>
        No waiting weeks for a human astrologer.
        <span className="mt-3 block">
          Your report arrives in your inbox within 2–5 minutes.
        </span>
      </>
    ),
  },
  {
    icon: IconStripe,
    title: "Secure checkout",
    body: (
      <>
        Payments are processed by Stripe, one of the world&apos;s largest payment providers.
      </>
    ),
  },
] as const;

export default function RiskReversalSection() {
  const supportEmail = getSupportEmail();

  return (
    <section
      id="risk-reversal"
      className="relative scroll-mt-28 border-y border-jade/15 bg-gradient-to-b from-[#060a0e] via-mist/40 to-[#05080c] py-20 md:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_0%,rgba(61,155,132,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-[0.18]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-jade/85">
            Risk reversal
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Try it risk-free
          </h2>
          <p className="mt-3 font-body text-lg text-ink-muted md:text-xl">
            If it doesn&apos;t resonate, we refund you.
          </p>
        </header>

        <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-5 lg:gap-8">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-b from-void/90 to-mist/60 p-6 shadow-panel backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:border-jade/30 hover:shadow-[0_0_48px_-16px_rgba(61,155,132,0.2)] md:p-7"
              >
                <div
                  className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-jade/10 blur-3xl opacity-70 transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-lg border border-jade/25 bg-void/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                  <Icon className="h-10 w-10" />
                </div>
                <h3 className="relative mt-5 font-display text-lg font-semibold leading-snug text-ink md:text-xl">
                  {card.title}
                </h3>
                <div className="relative mt-3 flex-1 font-body text-[15px] leading-relaxed text-ink-muted">
                  {card.body}
                </div>
              </article>
            );
          })}
        </div>

        <p className="mx-auto mt-14 max-w-xl text-center font-body text-sm text-ink-muted md:text-base">
          Questions? Contact us anytime:{" "}
          <a
            href={`mailto:${supportEmail}`}
            className="font-medium text-gold underline-offset-4 transition-colors hover:text-gold/90 hover:underline"
          >
            {supportEmail}
          </a>
        </p>
      </div>
    </section>
  );
}
