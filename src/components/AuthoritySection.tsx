/**
 * Authority / trust module: positions Zi Wei as ancient, rigorous, and AI-assisted (not AI-invented).
 * Placed after Free Preview, before How it works.
 */

function IconBirthData({ className }: { className?: string }) {
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
        r="18"
        stroke="currentColor"
        strokeWidth="1.25"
        className="text-gold/50"
      />
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1.25" className="text-jade" />
      <path
        d="M24 8v6M24 34v6M8 24h6M34 24h6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        className="text-gold/70"
      />
      <circle cx="24" cy="11" r="1.5" fill="currentColor" className="text-gold" />
      <circle cx="37" cy="24" r="1.5" fill="currentColor" className="text-gold/80" />
    </svg>
  );
}

function IconStars({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M24 4l1.8 5.5h5.8l-4.7 3.4 1.8 5.5L24 15.4l-4.7 3.4 1.8-5.5-4.7-3.4h5.8L24 4z"
        fill="currentColor"
        className="text-gold/90"
      />
      <path
        d="M10 28l1.2 3.6h3.8l-3 2.2 1.2 3.6-3.1-2.2-3.1 2.2 1.2-3.6-3-2.2h3.8L10 28z"
        fill="currentColor"
        className="text-gold/50"
      />
      <path
        d="M38 26l1 3h3.2l-2.6 1.9 1 3L38 32l-2.6 1.9 1-3-2.6-1.9h3.2L38 26z"
        fill="currentColor"
        className="text-jade/80"
      />
      <circle cx="22" cy="38" r="1.2" fill="currentColor" className="text-ink-dim" />
      <circle cx="28" cy="40" r="0.9" fill="currentColor" className="text-ink-dim" />
      <circle cx="32" cy="36" r="0.7" fill="currentColor" className="text-ink-dim" />
    </svg>
  );
}

function IconCycles({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M24 8a16 16 0 1016 16"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        className="text-gold/75"
      />
      <path
        d="M24 14a10 10 0 1110 10"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="text-jade/70"
      />
      <path
        d="M32 8l4-2v6h-6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gold"
      />
      <circle cx="24" cy="24" r="2" fill="currentColor" className="text-gold/60" />
    </svg>
  );
}

const CARDS = [
  {
    icon: IconBirthData,
    title: "Uses your full birth data",
    body: (
      <>
        <p className="font-body leading-relaxed text-ink-muted">
          Western astrology often uses only your birth date.
        </p>
        <p className="mt-4 font-body font-medium text-ink/95">Zi Wei uses:</p>
        <ul className="mt-2 space-y-1.5 font-body text-ink-muted">
          <li className="flex gap-2">
            <span className="text-gold" aria-hidden>
              •
            </span>
            Birth date
          </li>
          <li className="flex gap-2">
            <span className="text-gold" aria-hidden>
              •
            </span>
            Exact birth time
          </li>
          <li className="flex gap-2">
            <span className="text-gold" aria-hidden>
              •
            </span>
            Lunar calendar conversion
          </li>
          <li className="flex gap-2">
            <span className="text-gold" aria-hidden>
              •
            </span>
            Star positioning
          </li>
        </ul>
        <p className="mt-4 font-body leading-relaxed text-ink-muted">
          This creates a far more detailed chart.
        </p>
      </>
    ),
  },
  {
    icon: IconStars,
    title: "Analyzes 100+ celestial stars",
    body: (
      <>
        <p className="font-body leading-relaxed text-ink-muted">
          Your chart includes over 100 stars placed across 12 life palaces.
        </p>
        <p className="mt-4 font-body font-medium text-ink/95">Each star influences:</p>
        <ul className="mt-2 space-y-1.5 font-body text-ink-muted">
          {["Career", "Wealth", "Relationships", "Life cycles"].map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-jade/90" aria-hidden>
                •
              </span>
              {t}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    icon: IconCycles,
    title: "Maps your 10-year destiny cycles",
    body: (
      <p className="font-body leading-relaxed text-ink-muted">
        Zi Wei focuses on life timing. It predicts how your luck shifts through major 10-year cycles.
      </p>
    ),
  },
] as const;

export default function AuthoritySection() {
  return (
    <section
      id="authority-zi-wei"
      className="relative scroll-mt-28 border-y border-white/10 bg-[#05070b] py-20 md:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-radial-mist opacity-90"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-[0.22]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <header className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-jade/90">
            Authority
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink md:text-[2.15rem] md:leading-tight">
            Why Zi Wei Is Different From Western Astrology
          </h2>
          <p className="mt-4 font-body text-lg leading-relaxed text-ink-muted md:text-xl">
            A 1,000-year-old system used by Chinese imperial courts
          </p>
        </header>

        <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-5 lg:gap-8">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.09] bg-gradient-to-b from-mist/80 to-void/95 p-6 shadow-panel backdrop-blur-sm transition-[border-color,box-shadow] duration-300 hover:border-gold/25 hover:shadow-[0_0_40px_-12px_rgba(201,167,94,0.15)] md:p-7"
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cinnabar/10 blur-2xl transition-opacity group-hover:opacity-100"
                  aria-hidden
                />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-lg border border-gold/20 bg-void/80 text-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <Icon className="h-10 w-10" />
                </div>
                <h3 className="relative mt-6 font-display text-xl font-semibold leading-snug text-ink">
                  {card.title}
                </h3>
                <div className="relative mt-4 flex-1 text-sm sm:text-[15px]">{card.body}</div>
              </article>
            );
          })}
        </div>

        <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-gold/20 bg-gradient-to-br from-void/95 via-mist/50 to-void/90 p-8 shadow-[0_32px_64px_-32px_rgba(0,0,0,0.75)] md:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 bg-gold/10 font-mono text-xs text-gold"
              aria-hidden
            >
              ◆
            </span>
            <h3 className="font-display text-xl font-semibold text-ink md:text-2xl">
              Trusted for over 1,000 years
            </h3>
          </div>
          <p className="mt-5 whitespace-pre-line font-body leading-relaxed text-ink-muted md:text-[17px]">
            Zi Wei Dou Shu was developed during ancient Chinese imperial dynasties.
            {"\n\n"}
            It was historically used to analyze leaders, generals and royal families.
            {"\n\n"}
            Today, we combine this ancient system with modern AI.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-white/10 bg-void/60 px-6 py-7 text-center md:px-10 md:py-8">
          <h3 className="font-display text-lg font-semibold tracking-tight text-ink md:text-xl">
            Ancient system <span className="text-gold/95">×</span> Modern AI
          </h3>
          <p className="mt-3 font-body leading-relaxed text-ink-muted md:text-[17px]">
            AI doesn&apos;t replace Zi Wei. It translates complex charts into clear, human-readable insights.
          </p>
        </div>
      </div>
    </section>
  );
}
