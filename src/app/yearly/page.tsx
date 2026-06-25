"use client";

import { useEffect, useState } from "react";
import { Calendar, Sparkles, ArrowLeft } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import Link from "next/link";

export default function YearlyPage() {
  const [reading, setReading] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [previewMessage, setPreviewMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetch("/api/yearly-reading", { method: "POST" })
      .then(async (r) => {
        if (r.status === 401) { window.location.href = "/daily"; return; }
        if (r.status === 402) {
          const d = await r.json().catch(() => ({}));
          setError(d.message || "Active subscription required for yearly reading.");
          return;
        }
        if (!r.ok) throw new Error("Failed");
        const d = await r.json();
        if (d.ok) {
          setReading(d.reading);
          setYear(d.year);
          if (d.preview) {
            setPreview(true);
            setPreviewMessage(d.previewMessage || null);
          }
        }
        else { setError(d.message || "Could not generate reading."); }
      })
      .catch(() => setError("The stars are taking longer than expected. Try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-void text-ink px-5 py-12 pb-20 max-w-2xl mx-auto text-center">
        <Sparkles className="h-8 w-8 text-gold/50 mx-auto mb-4 animate-pulse" />
        <p className="text-ink-muted text-base mb-2">Writing your annual reading...</p>
        <p className="text-ink-dim text-xs">This takes about 20 seconds. Worth the wait.</p>
        <div className="mt-8 space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-4 bg-black/[0.03] rounded animate-pulse" style={{ width: `${60 + i * 8}%` }} />
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-void text-ink px-5 py-8 pb-20 max-w-2xl mx-auto text-center">
        <p className="text-ink-muted text-base mb-4">{error}</p>
        {error.includes("Upgrade") && (
          <Link
            href="/daily"
            className="btn-cta px-6 py-3 text-sm mb-4"
          >
            Upgrade now →
          </Link>
        )}
        <div>
          <Link href="/daily" className="text-gold/60 text-sm hover:text-gold">
            ← Back to daily horoscope
          </Link>
        </div>
      </main>
    );
  }

  if (!reading) {
    return (
      <main className="min-h-screen bg-void text-ink px-5 py-8 pb-20 max-w-2xl mx-auto text-center">
        <p className="text-ink-dim text-sm">No reading available. Please try again.</p>
        <a href="/daily" className="text-gold/60 text-sm mt-4 inline-block">← Back to horoscope</a>
      </main>
    );
  }

  // Parse sections by ### headings
  const sections = reading.split("###").filter(Boolean).map((s) => {
    const [heading, ...body] = s.trim().split("\n");
    return { heading: heading.trim(), body: body.join("\n").trim() };
  });

  return (
    <main className="min-h-screen bg-void text-ink px-5 py-8 pb-20 md:px-8 md:py-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 md:mb-10">
        <Link href="/daily" className="text-ink-dim hover:text-ink-muted transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gold/50" />
          <span className="text-gold/60 text-sm font-medium">{year} Annual Reading</span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8 md:mb-10">
        <Sparkles className="h-6 w-6 text-gold/60 mx-auto mb-3" />
        <h1 className="text-gold text-xl md:text-2xl font-semibold">
          Your {year} Zi Wei Dou Shu Forecast
        </h1>
        <p className="text-ink-dim text-sm mt-2">
          A comprehensive reading based on your birth chart
        </p>
      </div>

      {/* Preview banner for trial users */}
      {preview && previewMessage && (
        <div className="mb-8 rounded-xl border border-gold/10 bg-gold/[0.03] p-5 text-center">
          <p className="text-gold/70 text-sm mb-4">{previewMessage}</p>
          <Link
            href="/daily"
            className="btn-cta px-6 py-3 text-sm"
          >
            Upgrade now — $4.99/mo →
          </Link>
        </div>
      )}

      {/* Sections — two-column grid on desktop for scanability */}
      <div className="md:grid md:grid-cols-2 md:gap-5 space-y-5 md:space-y-0">
        {sections.map((s) => (
          <section
            key={s.heading}
            className="rounded-xl bg-gold/[0.02] border border-gold/10 p-5 md:p-6"
          >
            <h2 className="text-gold/80 text-sm font-semibold mb-3 tracking-wide">
              {s.heading}
            </h2>
            <p className="text-ink text-base leading-relaxed whitespace-pre-line">
              {s.body}
            </p>
          </section>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-10 pt-6 border-t border-gold/10 text-center">
        <Link
          href="/daily"
          className="text-gold/50 text-xs hover:text-gold transition-colors"
        >
          ← Back to daily horoscope
        </Link>
        <p className="text-ink-dim text-[11px] mt-4">
          DestinyBlueprint — Zi Wei Dou Shu
        </p>
      </div>

      <AppNav />
    </main>
  );
}