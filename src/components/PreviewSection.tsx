export default function PreviewSection() {
  return (
    <section className="relative border-t border-gold-dim bg-mist/30 px-6 py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-20"
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl">
        <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          What your reading can cover
        </h2>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div className="rounded-sm border border-gold/25 bg-panel p-8 shadow-panel backdrop-blur-md transition-shadow hover:border-gold/40 hover:shadow-glow">
            <div
              className="mb-4 h-px w-12 bg-gradient-to-r from-cinnabar to-transparent"
              aria-hidden
            />
            <h4 className="font-display text-lg font-semibold text-ink">
              Personality Snapshot
            </h4>
            <p className="mt-3 font-body text-sm leading-relaxed text-ink-muted">
              You are naturally analytical and observant. You prefer depth over
              surface-level connections and feel energized when pursuing
              meaningful goals.
            </p>
          </div>

          <div className="rounded-sm border border-gold/25 bg-panel p-8 shadow-panel backdrop-blur-md transition-shadow hover:border-gold/40 hover:shadow-glow">
            <div
              className="mb-4 h-px w-12 bg-gradient-to-r from-jade to-transparent"
              aria-hidden
            />
            <h4 className="font-display text-lg font-semibold text-ink">
              Love Style Insight
            </h4>
            <p className="mt-3 font-body text-sm leading-relaxed text-ink-muted">
              You value loyalty and emotional safety. You open up slowly but
              form deep long-term bonds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
