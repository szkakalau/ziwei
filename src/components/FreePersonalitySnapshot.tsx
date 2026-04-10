"use client";

import BirthFormModal from "@/components/BirthFormModal";
import { FULL_REPORT_PRICE_LABEL } from "@/lib/brand";
import { buildPersonalitySnapshot, type PersonalitySnapshot } from "@/lib/personalitySnapshot";
import { startStripeCheckoutFromStored } from "@/lib/startStripeCheckoutFromStored";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const LOCKED_LINES = [
  "Love & Relationships",
  "Wealth & Financial Cycles",
  "Major Life Turning Points",
  "10-Year Luck Cycles",
  "Full Destiny Blueprint (20+ pages)",
] as const;

function loadChartFromStorage(): unknown | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("userChart");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export default function FreePersonalitySnapshot() {
  const resultRef = useRef<HTMLDivElement>(null);
  const [snapshot, setSnapshot] = useState<PersonalitySnapshot | null>(null);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    const chart = loadChartFromStorage();
    if (chart) {
      setSnapshot(buildPersonalitySnapshot(chart));
    }
  }, []);

  const onChartReady = useCallback(() => {
    const chart = loadChartFromStorage();
    if (chart) {
      setSnapshot(buildPersonalitySnapshot(chart));
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  }, []);

  async function handleUnlock() {
    setCheckoutError(null);
    setCheckoutPending(true);
    try {
      const result = await startStripeCheckoutFromStored();
      if (!result.ok) {
        setCheckoutError(result.message);
        setCheckoutPending(false);
        return;
      }
      window.location.href = result.url;
    } catch {
      setCheckoutError("Network error. Please try again.");
      setCheckoutPending(false);
    }
  }

  return (
    <section
      id="free-personality-snapshot"
      className="relative scroll-mt-28 border-y border-white/10 bg-gradient-to-b from-void/40 via-mist/25 to-void/30 py-20 md:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(201,84,60,0.12),transparent_50%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] mix-blend-overlay"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl px-6">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold/90">
            ✨ Free preview
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Get your FREE Personality Snapshot
          </h2>
          <p className="mt-3 font-body text-base text-ink-muted md:text-lg">
            No signup required • Takes 30 seconds
          </p>
        </div>

        {!snapshot ? (
          <div className="mx-auto mt-12 max-w-lg text-center">
            <p className="font-body text-sm text-ink-muted md:text-base">
              Enter your birth date to unlock your first insight
            </p>
            <div className="mt-6 flex justify-center">
              <BirthFormModal
                triggerText="Reveal My First Insight ✨"
                triggerClassName="btn-cta px-8 py-3.5 text-base shadow-[0_0_32px_-6px_rgba(201,84,60,0.55)]"
                successBehavior="callback"
                onChartReady={onChartReady}
              />
            </div>
            <p className="mt-5 font-mono text-[11px] text-ink-dim">
              Full birth time &amp; place give the most accurate Zi Wei chart — same as your paid report.
            </p>
          </div>
        ) : null}

        {snapshot ? (
          <div ref={resultRef} className="mt-14">
            <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-[#12141c] via-void to-[#0c0e14] p-1 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cinnabar/20 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-jade-dim/25 blur-3xl"
                aria-hidden
              />

              <div className="relative rounded-[0.9rem] border border-white/5 bg-void/90 px-5 py-8 sm:px-8 sm:py-10">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-gold/75">
                      🔮 Snapshot · {snapshot.soulPalaceLabel}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-semibold leading-snug text-ink sm:text-2xl">
                      Your Life Palace: Destiny &amp; Personality
                    </h3>
                    {snapshot.highlightedStars.length ? (
                      <p className="mt-2 font-mono text-[11px] text-ink-dim">
                        Highlighted stars: {snapshot.highlightedStars.join(" · ")}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className="shrink-0 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-gold"
                    aria-hidden
                  >
                    Sample · ~20% unlocked
                  </span>
                </div>

                <div className="mt-8 space-y-8">
                  <article>
                    <h4 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                      <span aria-hidden>✨</span> Personality
                    </h4>
                    <p className="mt-3 whitespace-pre-line font-body text-[15px] leading-relaxed text-ink-muted">
                      {snapshot.personality}
                    </p>
                  </article>

                  <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden />

                  <article>
                    <h4 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                      <span aria-hidden>✨</span> Hidden Strength
                    </h4>
                    <p className="mt-3 whitespace-pre-line font-body text-[15px] leading-relaxed text-ink-muted">
                      {snapshot.hiddenStrength}
                    </p>
                  </article>

                  <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden />

                  <article>
                    <h4 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
                      <span aria-hidden>✨</span> Career Hint
                    </h4>
                    <p className="mt-3 whitespace-pre-line font-body text-[15px] leading-relaxed text-ink-muted">
                      {snapshot.careerHint}
                    </p>
                  </article>
                </div>

                <div className="mt-10 rounded-xl border border-white/10 bg-black/40 p-5 sm:p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">
                    Locked in full report
                  </p>
                  <ul className="mt-4 space-y-2.5 font-body text-sm text-ink-muted">
                    {LOCKED_LINES.map((line) => (
                      <li key={line} className="flex items-center gap-2.5">
                        <span className="text-base" aria-hidden>
                          🔒
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      disabled={checkoutPending}
                      onClick={() => void handleUnlock()}
                      className="btn-cta w-full px-6 py-3.5 text-base disabled:opacity-60 sm:w-auto"
                    >
                      {checkoutPending
                        ? "Opening secure checkout…"
                        : `Unlock Full Reading – ${FULL_REPORT_PRICE_LABEL}`}
                    </button>
                    <Link
                      href="/preview"
                      className="text-center font-body text-sm text-gold/90 underline-offset-4 hover:text-gold hover:underline sm:text-left"
                    >
                      View full chart preview →
                    </Link>
                  </div>
                  {checkoutError ? (
                    <p className="mt-4 font-body text-sm text-cinnabar" role="alert">
                      {checkoutError}
                    </p>
                  ) : null}
                </div>

                <div className="mt-8 flex flex-col items-stretch gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-body text-sm text-ink-dim">
                    Want a different birth profile? Generate again — your snapshot updates instantly.
                  </p>
                  <BirthFormModal
                    triggerText="New birth details"
                    triggerClassName="rounded-sm border border-white/15 bg-white/5 px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-ink-muted transition-colors hover:border-gold/35 hover:text-ink"
                    successBehavior="callback"
                    onChartReady={onChartReady}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
