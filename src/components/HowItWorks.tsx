export default function HowItWorks() {
  return (
    <section className="relative mx-auto max-w-5xl px-6 py-24">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/60 to-transparent"
        aria-hidden
      />
      <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        How your reading is created
      </h2>

      <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
        <div className="relative text-center">
          <div
            className="mx-auto h-3 w-3 rotate-45 border border-gold/50 bg-jade-dim shadow-[0_0_12px_rgba(61,155,132,0.35)]"
            aria-hidden
          />
          <h3 className="mt-6 font-display text-xl font-semibold text-ink">
            1. Enter birth details
          </h3>
          <p className="mt-2 font-body text-ink-muted">
            Takes less than 60 seconds.
          </p>
        </div>

        <div className="relative text-center">
          <div
            className="mx-auto h-3 w-3 rotate-45 border border-gold/50 bg-cinnabar/20 shadow-[0_0_12px_rgba(201,84,60,0.25)]"
            aria-hidden
          />
          <h3 className="mt-6 font-display text-xl font-semibold text-ink">
            2. AI maps your chart
          </h3>
          <p className="mt-2 font-body text-ink-muted">
            Uses classical Purple Star (Zi Wei) placement rules.
          </p>
        </div>

        <div className="relative text-center">
          <div
            className="mx-auto h-3 w-3 rotate-45 border border-gold/60 bg-gold-dim shadow-[0_0_12px_rgba(201,167,94,0.2)]"
            aria-hidden
          />
          <h3 className="mt-6 font-display text-xl font-semibold text-ink">
            3. Get your report
          </h3>
          <p className="mt-2 font-body text-ink-muted">
            See an instant preview; upgrade for the full report.
          </p>
        </div>
      </div>
    </section>
  );
}
