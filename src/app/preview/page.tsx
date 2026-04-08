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
      <div className="flex h-screen items-center justify-center text-zinc-600">
        Loading your chart…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-4 text-3xl font-bold text-zinc-900">
        Your chart preview
      </h1>
      <p className="mb-8 text-zinc-600">
        Raw chart data (English labels). This is a developer-style preview so
        you can verify the engine output before we layer AI copy on top.
      </p>

      {meta ? (
        <div className="mb-8 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
          <p className="font-medium text-zinc-900">How this was computed</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <span className="font-medium">Birth place: </span>
              {meta.placeLabel}
            </li>
            <li>
              <span className="font-medium">Time zone used: </span>
              {meta.timezone}
            </li>
            <li>
              <span className="font-medium">Apparent solar date: </span>
              {meta.apparentSolarDate}
            </li>
            <li>
              <span className="font-medium">Apparent solar time: </span>
              {meta.apparentSolarTime}
              <span className="text-zinc-500">
                {" "}
                (longitude + equation of time, after your local clock time)
              </span>
            </li>
          </ul>
        </div>
      ) : null}

      <pre className="overflow-auto rounded-lg bg-zinc-100 p-6 text-xs text-zinc-800">
        {JSON.stringify(chart, null, 2)}
      </pre>
    </div>
  );
}
