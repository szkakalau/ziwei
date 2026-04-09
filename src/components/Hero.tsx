import BirthFormModal from "@/components/BirthFormModal";

export default function Hero() {
  return (
    <section className="relative isolate mx-auto max-w-6xl overflow-hidden px-6 pb-24 pt-16 text-center md:pb-28 md:pt-20">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-72 w-72 rounded-full bg-jade-dim blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/3 h-64 w-64 rounded-full bg-cinnabar-glow blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-40 w-px -translate-x-1/2 bg-gradient-to-b from-gold via-gold/40 to-transparent"
        aria-hidden
      />

      <h1 className="animate-on-load font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl md:text-6xl lg:text-7xl">
        Purple Star Astrology,
        <br />
        <span className="bg-gradient-to-r from-gold via-ink to-jade bg-clip-text text-transparent">
          Explained by AI
        </span>
      </h1>

      <p className="animate-on-load-delay-1 mx-auto mt-8 max-w-2xl font-body text-xl leading-relaxed text-ink-muted">
        Get a clear read on your personality, recurring life themes, and
        relationship style—grounded in classical Zi Wei (Purple Star) logic.
      </p>

      <div className="animate-on-load-delay-2 mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-[0.2em] text-jade">
        <span>✓ Rooted in a 1,000+ year tradition</span>
        <span>✓ Personalized with AI</span>
        <span>✓ Under a minute to start</span>
      </div>

      <div className="animate-on-load-delay-3 mt-10 flex flex-col items-center">
        <BirthFormModal triggerText="Generate My Chart →" />
      </div>

      <p className="mt-4 max-w-md px-2 font-body text-sm text-ink-dim sm:mx-auto">
        Secure checkout. Full reading delivered by email—no account required.
      </p>
    </section>
  );
}
