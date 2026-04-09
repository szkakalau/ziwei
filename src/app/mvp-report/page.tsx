"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { buildFullReport } from "@/lib/report";

type BirthInput = {
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  location: string;
  allowFallback?: boolean;
};

type ChartMeta = {
  placeLabel: string;
  apparentSolarDate: string;
  apparentSolarTime: string;
  isApproximate?: boolean;
};

export default function MvpReportPage() {
  const [birthInput, setBirthInput] = useState<BirthInput | null>(null);
  const [chart, setChart] = useState<unknown>(null);
  const [meta, setMeta] = useState<ChartMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rawBirth = sessionStorage.getItem("userBirthInput");
    if (!rawBirth) {
      setError("Missing birth data. Please return to the homepage and try again.");
      setLoading(false);
      return;
    }

    let parsed: BirthInput | null = null;
    try {
      parsed = JSON.parse(rawBirth) as BirthInput;
    } catch {
      parsed = null;
    }
    if (!parsed?.birthDate || !parsed?.location) {
      setError("Missing birth data. Please return to the homepage and try again.");
      setLoading(false);
      return;
    }
    setBirthInput(parsed);

    const run = async () => {
      try {
        const res = await fetch("/api/birth-chart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed),
        });
        const data = (await res.json()) as
          | { ok: true; chart: unknown; meta: ChartMeta }
          | { ok: false; error: string };
        if (!res.ok || !data.ok) {
          setError("We couldn't build your chart. Please try again in a moment.");
          setLoading(false);
          return;
        }
        setChart(data.chart);
        setMeta(data.meta);
        setLoading(false);
      } catch {
        setError("Network error. Please try again in a moment.");
        setLoading(false);
      }
    };

    void run();
  }, []);

  const report = useMemo(() => {
    if (!chart) return null;
    return buildFullReport({
      chart,
      meta: meta ?? undefined,
    });
  }, [chart, meta]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-20 font-body text-ink-muted">
        Generating your report…
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-sm border border-white/10 bg-panel p-8 shadow-panel backdrop-blur-sm">
          <h1 className="font-display text-3xl font-semibold text-ink">
            Couldn&apos;t generate report
          </h1>
          <p className="mt-3 font-body text-ink-muted">{error ?? "Unknown error."}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link className="btn-cta px-6 py-3 text-sm" href="/">
              Back to home
            </Link>
            <Link className="link-gold" href="/preview">
              See free preview →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const headerDate = meta?.apparentSolarDate ?? birthInput?.birthDate ?? "—";
  const headerTime = meta?.apparentSolarTime ?? birthInput?.birthTime ?? "—";
  const headerPlace = meta?.placeLabel ?? birthInput?.location ?? "—";

  return (
    <div className="relative mx-auto max-w-6xl px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-20"
        aria-hidden
      />

      <header className="relative mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          {report.title}
        </h1>
        <p className="mt-4 font-body text-ink-muted">
          Generated from your birth data:{" "}
          <span className="font-medium text-ink">{headerDate}</span> •{" "}
          <span className="font-medium text-ink">{headerTime}</span> •{" "}
          <span className="font-medium text-ink">{headerPlace}</span>
        </p>
        {meta?.isApproximate ? (
          <p className="mt-3 font-body text-sm text-ink-dim">
            Approximate chart: time-zone / true-solar corrections were skipped.
          </p>
        ) : null}
        <div className="mt-10">
          <Link className="link-gold" href="/contact">
            Need help?
          </Link>
        </div>
      </header>

      <section className="relative mt-14 grid gap-6 lg:grid-cols-2">
        {report.sections.map((s) => (
          <div
            key={s.id}
            className="rounded-sm border border-white/10 bg-panel p-8 shadow-panel backdrop-blur-sm"
          >
            <h2 className="font-display text-2xl font-semibold text-ink">{s.title}</h2>
            <div className="mt-4 space-y-3 font-body leading-relaxed text-ink-muted">
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="relative mt-14 rounded-sm border border-white/10 bg-panel p-10 shadow-panel backdrop-blur-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold text-ink">
              12 Life Palaces
            </h2>
            <p className="mt-3 font-body text-ink-muted">
              Each palace maps a major domain of life. Read them as patterns: what
              repeats, what unlocks you, and what costs you energy.
            </p>
          </div>
          <div className="rounded-sm border border-gold/20 bg-void/60 px-4 py-3 font-mono text-xs uppercase tracking-widest text-ink-dim">
            MVP report
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {report.palaceSections.map((s) => (
            <div key={s.id} className="rounded-sm border border-white/10 bg-void/55 p-5">
              <h3 className="font-display text-xl font-semibold text-ink">{s.title}</h3>
              <div className="mt-3 space-y-2 font-body text-sm leading-relaxed text-ink-muted">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mt-14 rounded-sm border border-gold/25 bg-void/55 shadow-panel">
        <div className="bg-grid-fine bg-grid px-8 py-10">
          <h2 className="font-display text-3xl font-semibold text-ink md:text-4xl">
            {report.timeline.title}
          </h2>
          <div className="mt-6 space-y-3 font-body leading-relaxed text-ink-muted">
            {report.timeline.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

