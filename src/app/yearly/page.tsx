"use client";

import { useEffect, useState } from "react";
import { Calendar, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function YearlyPage() {
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetch("/api/yearly-reading", { method: "POST" })
      .then(async (r) => {
        if (r.status === 401) { window.location.href = "/daily"; return; }
        if (r.status === 402) { setError("Active subscription required for yearly reading."); return; }
        if (!r.ok) throw new Error("Failed");
        const d = await r.json();
        if (d.ok) { setReading(d.reading); setYear(d.year); }
        else { setError(d.message || "Could not generate reading."); }
      })
      .catch(() => setError("The stars are taking longer than expected. Try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-12 max-w-lg mx-auto text-center">
        <Sparkles className="h-8 w-8 text-amber-400/50 mx-auto mb-4 animate-pulse" />
        <p className="text-white/60 text-base mb-2">Writing your annual reading...</p>
        <p className="text-white/25 text-xs">This takes about 20 seconds. Worth the wait.</p>
        <div className="mt-8 space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-4 bg-white/[0.03] rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-8 max-w-lg mx-auto text-center">
        <p className="text-white/60 text-base mb-4">{error}</p>
        <Link href="/daily" className="text-amber-400/60 text-sm hover:text-amber-300">
          ← Back to daily horoscope
        </Link>
      </main>
    );
  }

  if (!reading) return null;

  // Parse sections by ### headings
  const sections = reading.split("###").filter(Boolean).map((s) => {
    const [heading, ...body] = s.trim().split("\n");
    return { heading: heading.trim(), body: body.join("\n").trim() };
  });

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/daily" className="text-white/30 hover:text-white/50 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-amber-400/50" />
          <span className="text-amber-200/60 text-sm font-medium">{year} Annual Reading</span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <Sparkles className="h-6 w-6 text-amber-400/60 mx-auto mb-3" />
        <h1 className="text-amber-200/90 text-xl font-semibold">
          Your {year} Zi Wei Dou Shu Forecast
        </h1>
        <p className="text-white/30 text-sm mt-2">
          A comprehensive reading based on your birth chart
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((s) => (
          <section
            key={s.heading}
            className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-5"
          >
            <h2 className="text-amber-300/80 text-sm font-semibold mb-3 tracking-wide">
              {s.heading}
            </h2>
            <p className="text-white/75 text-[15px] leading-relaxed whitespace-pre-line">
              {s.body}
            </p>
          </section>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-white/[0.06] text-center">
        <Link
          href="/daily"
          className="text-amber-400/50 text-xs hover:text-amber-300 transition-colors"
        >
          ← Back to daily horoscope
        </Link>
        <p className="text-white/15 text-[10px] mt-4">
          DestinyBlueprint — Zi Wei Dou Shu
        </p>
      </div>
    </main>
  );
}
