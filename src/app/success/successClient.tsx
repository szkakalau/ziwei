"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const EMAIL_SUBJECT_HINT = "We received your Zi Wei reading order";

function TrustBlock() {
  return (
    <div className="rounded-sm border border-white/10 bg-void/50 p-6 text-left shadow-inner">
      <h3 className="font-display text-lg font-semibold text-ink">
        What happens now?
      </h3>
      <ul className="mt-4 space-y-2 font-body text-sm leading-relaxed text-ink-muted">
        <li>• We&apos;ve received your order and your payment has been confirmed.</li>
        <li>• A human reader will review your chart and the question you submitted.</li>
        <li>• Your personalized reading will be delivered to your email within 24-48 hours.</li>
      </ul>
    </div>
  );
}

function ProgressSteps() {
  return (
    <div className="space-y-3 rounded-sm border border-gold/20 bg-void/40 p-6 font-body text-sm text-ink-muted">
      <p className="flex items-center gap-2">
        <span aria-hidden>🪐</span>
        <span>Reviewing your birth chart details</span>
      </p>
      <p className="flex items-center gap-2">
        <span aria-hidden>📜</span>
        <span>Preparing your personalized written reading</span>
      </p>
      <p className="flex items-center gap-2">
        <span aria-hidden>📧</span>
        <span>Sending your order confirmation and final reading by email</span>
      </p>
    </div>
  );
}

export default function SuccessClient() {
  const sp = useSearchParams();
  const sessionId = sp.get("session_id") ?? "";

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-xl flex-col items-stretch px-6 py-16 md:max-w-3xl md:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-25"
        aria-hidden
      />

      <div className="relative w-full space-y-8 overflow-hidden rounded-sm border border-gold/25 bg-panel p-8 shadow-panel backdrop-blur-sm sm:p-10">
        <header className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">
            Order confirmed
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink md:text-4xl">
            Thank you. Your order is confirmed.
          </h1>
          <p className="mt-3 font-body text-base text-ink-muted md:text-lg">
            Your Zi Wei email reading is now in our queue. We&apos;ll send a confirmation email
            right away and deliver the full reading within 24-48 hours.
          </p>
          {sessionId ? (
            <p className="mt-3 font-mono text-[11px] text-ink-dim">
              Reference:{" "}
              <span className="break-all text-ink-muted">{sessionId}</span>
            </p>
          ) : null}
        </header>

        <ProgressSteps />

        <TrustBlock />

        <div className="space-y-2 text-center">
          <p className="font-body text-sm text-ink-muted">
            Typical delivery: <strong className="text-ink">24-48 hours</strong>{" "}
            to your inbox.
          </p>
          <p className="font-body text-sm text-ink-dim">
            If you need to correct your birth data, contact us as soon as possible so we can update
            your order before delivery.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/contact"
            className="btn-cta px-6 py-3.5 text-center text-sm sm:text-base"
          >
            Contact support →
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-sm border border-white/10 px-6 py-3.5 text-center text-sm text-ink-muted transition hover:border-gold/20 hover:text-ink sm:text-base"
          >
            Back to home
          </Link>
        </div>

        <footer className="border-t border-white/10 pt-6 text-center">
          <p className="font-body text-xs leading-relaxed text-ink-dim">
            You will receive an email titled:{" "}
            <strong className="text-ink-muted">{EMAIL_SUBJECT_HINT}</strong>
          </p>
          <p className="mt-3 font-body text-[11px] leading-relaxed text-ink-dim">
            The birth data and question you submitted at checkout are what we use for this order.
            If something looks wrong, contact support before the reading is delivered.
          </p>
        </footer>
      </div>
    </div>
  );
}
