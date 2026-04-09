"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const REDIRECT_SECONDS = 10;
const EMAIL_SUBJECT_HINT = "Your Zi Wei Destiny Reading ✨";

function TrustBlock() {
  return (
    <div className="rounded-sm border border-white/10 bg-void/50 p-6 text-left shadow-inner">
      <h3 className="font-display text-lg font-semibold text-ink">
        What happens now?
      </h3>
      <ul className="mt-4 space-y-2 font-body text-sm leading-relaxed text-ink-muted">
        <li>• Your birth chart is being calculated from the data you entered.</li>
        <li>
          • AI is analyzing your Zi Wei palace structure and major stars (100+
          star placements in the engine).
        </li>
        <li>
          • A long-form personalized report is being composed and will be sent
          to your email.
        </li>
      </ul>
    </div>
  );
}

function ProgressSteps() {
  return (
    <div className="space-y-3 rounded-sm border border-gold/20 bg-void/40 p-6 font-body text-sm text-ink-muted">
      <p className="flex items-center gap-2">
        <span aria-hidden>🪐</span>
        <span>Calculating your destiny chart</span>
      </p>
      <p className="flex items-center gap-2">
        <span aria-hidden>📜</span>
        <span>Writing your personalized report</span>
      </p>
      <p className="flex items-center gap-2">
        <span aria-hidden>📧</span>
        <span>Delivering to your email</span>
      </p>
    </div>
  );
}

function UpsellBlock() {
  const upsellUrl = process.env.NEXT_PUBLIC_ANNUAL_FORECAST_PAYMENT_URL?.trim() ?? "";

  return (
    <div className="rounded-sm border border-jade/30 bg-gradient-to-br from-jade/10 via-void/40 to-gold/10 p-6">
      <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">
        🔮 Add your annual forecast
      </h2>
      <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
        Discover luck, career, and relationship themes for the next 12 months —
        best added while you&apos;re already in flow.
      </p>
      {upsellUrl ? (
        <a
          href={upsellUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-cta mt-4 inline-block px-6 py-3 text-sm"
        >
          Add forecast — $19
        </a>
      ) : (
        <div className="mt-4 space-y-2">
          <p className="font-body text-xs text-ink-dim">
            Set{" "}
            <span className="font-mono text-[11px]">
              NEXT_PUBLIC_ANNUAL_FORECAST_PAYMENT_URL
            </span>{" "}
            in Vercel to your $19 Stripe Payment Link or checkout URL.
          </p>
          <Link
            href="/contact"
            className="inline-block font-body text-sm text-gold underline-offset-2 hover:underline"
          >
            Request annual forecast →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SuccessClient() {
  const sp = useSearchParams();
  const sessionId = sp.get("session_id") ?? "";
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  const reportHref = useMemo(() => {
    return sessionId
      ? `/report?session_id=${encodeURIComponent(sessionId)}`
      : "/report";
  }, [sessionId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    const t = setTimeout(() => {
      window.location.href = reportHref;
    }, REDIRECT_SECONDS * 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(t);
    };
  }, [reportHref]);

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-xl flex-col items-stretch px-6 py-16 md:max-w-2xl md:py-20">
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
            ✨ Thank you — we&apos;re preparing your reading
          </h1>
          <p className="mt-3 font-body text-base text-ink-muted md:text-lg">
            Your Zi Wei destiny reading is being prepared. You can open your
            report below while we finalize your email delivery.
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

        <UpsellBlock />

        <div className="space-y-2 text-center">
          <p className="font-body text-sm text-ink-muted">
            Typical delivery: <strong className="text-ink">2–5 minutes</strong>{" "}
            to your inbox.
          </p>
          <p className="font-body text-sm text-ink-dim">
            If nothing arrives within 10 minutes, check your spam or promotions
            folder.
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
          <Link
            href={reportHref}
            className="btn-cta px-6 py-3.5 text-center text-sm sm:text-base"
          >
            View my report now →
          </Link>
        </div>

        <p className="text-center font-mono text-xs uppercase tracking-widest text-ink-dim">
          Auto-continue in {secondsLeft}s…
        </p>

        <footer className="border-t border-white/10 pt-6 text-center">
          <p className="font-body text-xs leading-relaxed text-ink-dim">
            You will receive an email titled:{" "}
            <strong className="text-ink-muted">{EMAIL_SUBJECT_HINT}</strong>
          </p>
          <p className="mt-3 font-body text-[11px] leading-relaxed text-ink-dim">
            The data you submitted at checkout is what we use for this order. If
            something looks wrong, contact us from the site before requesting a
            refund.
          </p>
        </footer>
      </div>
    </div>
  );
}
