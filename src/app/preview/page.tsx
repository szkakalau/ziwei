"use client";

import { useEffect, useState } from "react";

type ChartMeta = {
  timezone: string;
  latitude: number;
  longitude: number;
  placeLabel: string;
  apparentSolarDate: string;
  apparentSolarTime: string;
};

export default function PreviewPage() {
  const [chart, setChart] = useState<unknown>(null);
  const [meta, setMeta] = useState<ChartMeta | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("userChart");
    const rawMeta = sessionStorage.getItem("userChartMeta");
    if (stored) setChart(JSON.parse(stored));
    if (rawMeta) {
      try {
        setMeta(JSON.parse(rawMeta) as ChartMeta);
      } catch {
        setMeta(null);
      }
    }
  }, []);

  if (!chart) {
    return (
      <div className="flex h-screen items-center justify-center font-body text-ink-muted">
        Loading your chart…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-4 font-display text-3xl font-semibold text-ink md:text-4xl">
        Your chart preview
      </h1>
      <p className="mb-8 font-body leading-relaxed text-ink-muted">
        Raw chart data (English labels). This is a developer-style preview so
        you can verify the engine output before we layer AI copy on top.
      </p>

      {meta ? (
        <div className="mb-8 rounded-sm border border-gold/25 bg-panel p-5 font-body text-sm text-ink-muted shadow-panel backdrop-blur-sm">
          <p className="font-display font-semibold text-ink">
            How this was computed
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1">
            <li>
              <span className="font-medium text-ink">Birth place: </span>
              {meta.placeLabel}
            </li>
            <li>
              <span className="font-medium text-ink">Time zone used: </span>
              {meta.timezone}
            </li>
            <li>
              <span className="font-medium text-ink">Apparent solar date: </span>
              {meta.apparentSolarDate}
            </li>
            <li>
              <span className="font-medium text-ink">Apparent solar time: </span>
              {meta.apparentSolarTime}
              <span className="text-ink-dim">
                {" "}
                (longitude + equation of time, after your local clock time)
              </span>
            </li>
          </ul>
        </div>
      ) : null}

      <pre className="overflow-auto rounded-sm border border-white/10 bg-void/80 p-6 font-mono text-xs leading-relaxed text-ink-muted">
        {JSON.stringify(chart, null, 2)}
      </pre>
    </div>
  );
}
