import Link from "next/link";

export default function AnnualSuccessPage() {
  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-xl flex-col items-stretch px-6 py-16 md:max-w-2xl md:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-25"
        aria-hidden
      />

      <div className="relative w-full space-y-8 overflow-hidden rounded-sm border border-jade/30 bg-panel p-8 shadow-panel backdrop-blur-sm sm:p-10">
        <header className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">
            Add-on confirmed
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink md:text-4xl">
            🔮 Annual Forecast purchased
          </h1>
          <p className="mt-3 font-body text-base text-ink-muted md:text-lg">
            Thank you — we&apos;re preparing your 12‑month luck forecast.
          </p>
        </header>

        <div className="space-y-3 rounded-sm border border-white/10 bg-void/40 p-6 font-body text-sm text-ink-muted">
          <p className="flex items-center gap-2">
            <span aria-hidden>🪐</span>
            <span>Reviewing your base Zi Wei chart</span>
          </p>
          <p className="flex items-center gap-2">
            <span aria-hidden>📅</span>
            <span>Generating a 12‑month timing forecast</span>
          </p>
          <p className="flex items-center gap-2">
            <span aria-hidden>📧</span>
            <span>Delivering to your email</span>
          </p>
        </div>

        <div className="rounded-sm border border-white/10 bg-void/50 p-6 text-left shadow-inner">
          <h3 className="font-display text-lg font-semibold text-ink">
            What happens now?
          </h3>
          <ul className="mt-4 space-y-2 font-body text-sm leading-relaxed text-ink-muted">
            <li>• Typical delivery time: 2–5 minutes.</li>
            <li>• If you don&apos;t receive it within 10 minutes, check spam.</li>
            <li>• Need help? Reply to the delivery email or contact support.</li>
          </ul>
        </div>

        <div className="space-y-2 text-center">
          <p className="font-body text-xs leading-relaxed text-ink-dim">
            You will receive a confirmation email from{" "}
            <strong className="text-ink-muted">DestinyBlueprint</strong> with
            delivery details shortly.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="btn-cta px-6 py-3.5 text-center text-sm sm:text-base"
          >
            Back to home →
          </Link>
          <Link
            href="/contact"
            className="rounded-sm border border-white/10 bg-void/40 px-6 py-3.5 text-center font-body text-sm text-ink-muted hover:bg-white/5 sm:text-base"
          >
            Contact support
          </Link>
        </div>

        <p className="text-center font-body text-[11px] leading-relaxed text-ink-dim">
          For personal insight and entertainment only.
        </p>
      </div>
    </main>
  );
}

