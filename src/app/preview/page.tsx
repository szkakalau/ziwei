"use client";

import { useEffect, useState } from "react";
import { FULL_REPORT_PRICE_LABEL } from "@/lib/brand";

type ChartMeta = {
  timezone: string;
  latitude: number;
  longitude: number;
  placeLabel: string;
  apparentSolarDate: string;
  apparentSolarTime: string;
  isApproximate?: boolean;
};

type ChartLike = {
  solarDate?: string;
  time?: string;
  palaces?: Array<{
    name?: string;
    majorStars?: Array<{ name?: string }>;
  }>;
};

type BirthInput = {
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  location: string;
  allowFallback?: boolean;
};

export default function PreviewPage() {
  const [chart, setChart] = useState<unknown>(null);
  const [meta, setMeta] = useState<ChartMeta | null>(null);
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const [email, setEmail] = useState<string>("");
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("userChart");
    const rawMeta = sessionStorage.getItem("userChartMeta");
    const rawBirth =
      localStorage.getItem("userBirthInput") ?? sessionStorage.getItem("userBirthInput");
    const rawEmail =
      localStorage.getItem("userEmail") ?? sessionStorage.getItem("userEmail");
    if (stored) setChart(JSON.parse(stored));
    if (rawMeta) {
      try {
        setMeta(JSON.parse(rawMeta) as ChartMeta);
      } catch {
        setMeta(null);
      }
    }
    if (rawBirth) {
      try {
        setBirthInput(JSON.parse(rawBirth) as BirthInput);
      } catch {
        setBirthInput(null);
      }
    }
    if (rawEmail) setEmail(rawEmail);
  }, []);

  if (!chart) {
    return (
      <div className="flex h-screen items-center justify-center font-body text-ink-muted">
        Loading your chart…
      </div>
    );
  }

  const c = chart as ChartLike;
  const palaces = Array.isArray(c?.palaces) ? c.palaces : [];

  async function startCheckout() {
    setCheckoutError(null);
    if (!birthInput) {
      setCheckoutError("Missing birth data. Please return to the homepage and generate your chart again.");
      return;
    }
    setCheckoutPending(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...birthInput,
          email,
          allowFallback: birthInput.allowFallback === true || meta?.isApproximate === true,
        }),
      });
      const data = (await res.json()) as
        | { ok: true; url: string | null }
        | { ok: false; error: string };

      if (!res.ok || !data.ok || !data.url) {
        setCheckoutError(
          "We couldn't start checkout. Please try again in a moment.",
        );
        setCheckoutPending(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setCheckoutError("Network error. Please try again in a moment.");
      setCheckoutPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* ① Hero summary */}
      <header className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Here is your Zi Wei destiny chart
        </h1>
        <p className="mt-4 font-body text-ink-muted">
          Based on your birth data:{" "}
          <span className="font-medium text-ink">
            {meta?.apparentSolarDate ?? c?.solarDate ?? "—"}
          </span>{" "}
          •{" "}
          <span className="font-medium text-ink">
            {meta?.apparentSolarTime ?? c?.time ?? "—"}
          </span>{" "}
          •{" "}
          <span className="font-medium text-ink">
            {meta?.placeLabel ?? "—"}
          </span>
        </p>
        {meta?.isApproximate ? (
          <p className="mt-3 font-body text-sm text-ink-dim">
            Approximate chart: location services were unavailable, so time-zone
            and true-solar corrections were skipped.
          </p>
        ) : null}
      </header>

      {/* ② Destiny chart */}
      <section className="mt-14 rounded-sm border border-white/10 bg-panel p-8 shadow-panel backdrop-blur-sm">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-2xl font-semibold text-ink">
              Your Destiny Chart
            </h2>
            <p className="mt-3 font-body leading-relaxed text-ink-muted">
              Your life is mapped across 12 Life Palaces.
              <br />
              Each palace represents a major area of life.
            </p>
          </div>
          <div className="rounded-sm border border-gold/20 bg-void/60 px-4 py-3 font-mono text-xs uppercase tracking-widest text-ink-dim">
            Free preview
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {palaces.slice(0, 12).map((p, i) => (
            <div
              key={`${p.name ?? "palace"}-${i}`}
              className="rounded-sm border border-white/10 bg-void/55 p-4"
            >
              <p className="font-mono text-xs uppercase tracking-widest text-ink-dim">
                {p.name ?? `Palace ${i + 1}`}
              </p>
              <p className="mt-2 font-body text-sm text-ink-muted">
                {(p.majorStars ?? [])
                  .slice(0, 3)
                  .map((s) => s.name)
                  .filter(Boolean)
                  .join(", ") || "—"}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample insight modules */}
      <section className="mt-14 grid gap-6 md:grid-cols-3">
        <div className="rounded-sm border border-white/10 bg-panel p-8 shadow-panel backdrop-blur-sm">
          <h3 className="font-display text-xl font-semibold text-ink">
            Your Core Personality
          </h3>
          <p className="mt-4 font-body leading-relaxed text-ink-muted">
            You are naturally analytical and strategic. You prefer long-term
            planning over short bursts of action. You may feel misunderstood
            early in life but gain recognition later.
          </p>
        </div>

        <div className="rounded-sm border border-white/10 bg-panel p-8 shadow-panel backdrop-blur-sm">
          <h3 className="font-display text-xl font-semibold text-ink">
            Your Life Theme
          </h3>
          <p className="mt-4 font-body leading-relaxed text-ink-muted">
            Your chart shows a “late bloomer” pattern. Major opportunities tend
            to appear after your early 30s. Your success grows steadily rather
            than suddenly.
          </p>
        </div>

        <div className="rounded-sm border border-gold/25 bg-panel p-8 shadow-panel backdrop-blur-sm">
          <h3 className="font-display text-xl font-semibold text-ink">
            Key Insight
          </h3>
          <p className="mt-4 font-body leading-relaxed text-ink-muted">
            Your chart shows strong career potential in roles involving
            strategy, analysis, or independent work. You perform best when you
            have autonomy.
          </p>
        </div>
      </section>

      {/* ④ Paywall */}
      <section className="mt-14 overflow-hidden rounded-sm border border-gold/25 bg-void/55 shadow-panel">
        <div className="bg-grid-fine bg-grid px-8 py-10">
          <h2 className="font-display text-3xl font-semibold text-ink md:text-4xl">
            Your full destiny report is ready
          </h2>
          <ul className="mt-8 grid gap-3 font-body text-ink-muted sm:grid-cols-2">
            {[
              "🔒 Love & relationship patterns",
              "🔒 Wealth & financial potential",
              "🔒 10-year life cycle timeline",
              "🔒 Major opportunities & risks",
              "🔒 Hidden talents & blind spots",
              "🔒 Full 12 palace breakdown",
            ].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-display text-2xl font-semibold text-ink">
              Unlock full report — {FULL_REPORT_PRICE_LABEL}
            </p>
            <button
              type="button"
              className="btn-cta px-7 py-3.5 text-base disabled:opacity-60"
              disabled={checkoutPending}
              onClick={() => void startCheckout()}
            >
              {checkoutPending ? "Opening checkout…" : "Unlock My Full Reading →"}
            </button>
          </div>

          {checkoutError ? (
            <p className="mt-4 font-body text-sm text-cinnabar" role="alert">
              {checkoutError}
            </p>
          ) : null}

          <p className="mt-6 font-body text-sm text-ink-dim">
            Instant access • One-time payment • 30+ page report
          </p>
        </div>
      </section>
    </div>
  );
}
