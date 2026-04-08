export default function SocialProof() {
  return (
    <section className="relative border-y border-gold-dim bg-mist/40 py-20 backdrop-blur-sm">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-25"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-3 md:gap-10">
        <div className="group border-l-2 border-cinnabar/80 pl-6 text-left transition-colors hover:border-gold">
          <h3 className="font-display text-2xl font-semibold text-ink">
            Self-Discovery
          </h3>
          <p className="mt-3 font-body leading-relaxed text-ink-muted">
            Understand your personality and life patterns.
          </p>
        </div>

        <div className="group border-l-2 border-jade/60 pl-6 text-left transition-colors hover:border-gold">
          <h3 className="font-display text-2xl font-semibold text-ink">
            Relationships
          </h3>
          <p className="mt-3 font-body leading-relaxed text-ink-muted">
            Learn how you love and connect with others.
          </p>
        </div>

        <div className="group border-l-2 border-gold/50 pl-6 text-left transition-colors hover:border-gold">
          <h3 className="font-display text-2xl font-semibold text-ink">
            Life Direction
          </h3>
          <p className="mt-3 font-body leading-relaxed text-ink-muted">
            See your natural strengths and growth areas.
          </p>
        </div>
      </div>
    </section>
  );
}
