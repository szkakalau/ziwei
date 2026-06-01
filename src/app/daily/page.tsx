"use client";

import { useEffect, useState } from "react";
import { Share2, Eye } from "lucide-react";
import { StreakBadge } from "@/components/StreakBadge";
import { ChartCanvas } from "@/components/ChartCanvas";
import { ShareCard } from "@/components/ShareCard";
import { useRouter } from "next/navigation";

interface HoroscopeData {
  horoscope: string | null;
  highlightedStars: string[];
  source?: string;
  date?: string;
}

export default function DailyPage() {
  const router = useRouter();
  const [data, setData] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [chartPalaces, setChartPalaces] = useState<Array<{name?: string; majorStars?: Array<{name?: string}>; minorStars?: Array<{name?: string}>}>>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/generate-daily", { method: "POST" }),
      fetch("/api/chart"),
      fetch("/api/streak"),
    ])
      .then(async ([horoscopeRes, chartRes, streakRes]) => {
        if (horoscopeRes.status === 401) { router.push("/#free-personality-snapshot"); return; }
        const horoscopeData = horoscopeRes.ok ? await horoscopeRes.json() : null;
        const chartData = chartRes.ok ? await chartRes.json() : null;
        const streakData = streakRes.ok ? await streakRes.json() : null;

        if (horoscopeData?.ok) setData(horoscopeData);
        if (chartData?.ok) setChartPalaces(chartData.chart?.palaces ?? []);
        if (streakData?.ok) setStreak(streakData.streak ?? 0);

        if (!horoscopeData?.ok && !horoscopeRes.ok) throw new Error("Failed to load");
      })
      .catch(() => setError("Today's stars are taking longer than usual. Please try again."))
      .finally(() => setLoading(false));
  }, [router]);

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleShare = async () => {
    if (!data?.horoscope) return;
    if (navigator.share) {
      await navigator.share({
        title: "My Zi Wei Dou Shu Daily Horoscope",
        text: data.horoscope.slice(0, 200) + "...",
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(data.horoscope);
      alert("Horoscope copied to clipboard!");
    }
  };

  // LOADING: Skeleton screen with shimmer
  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-8 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="h-5 w-32 bg-white/5 rounded animate-pulse" />
          <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 space-y-4">
          <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-white/5 rounded w-full animate-pulse" />
          <div className="h-3 bg-white/5 rounded w-5/6 animate-pulse" />
          <div className="h-3 bg-white/5 rounded w-4/5 animate-pulse" />
          <div className="h-3 bg-white/5 rounded w-2/3 animate-pulse" />
        </div>
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-white/[0.02] rounded-xl animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  // ERROR state
  if (error) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-8 max-w-lg mx-auto">
        <p className="text-amber-200/60 text-sm mb-2">{dateLabel}</p>
        <div className="rounded-2xl bg-white/[0.03] border border-amber-500/10 p-8 text-center">
          <p className="text-white/60 text-base mb-4">{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
            className="px-5 py-2.5 rounded-xl bg-amber-500/15 text-amber-300 text-sm font-medium
                       hover:bg-amber-500/25 transition-colors"
          >
            Try again
          </button>
          <p className="text-white/30 text-xs mt-3">
            {data?.source === "template" ? "Using template fallback" : ""}
          </p>
        </div>
      </main>
    );
  }

  // EMPTY: No horoscope yet (new user, first day)
  if (!data?.horoscope) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-8 max-w-lg mx-auto">
        <p className="text-amber-200/60 text-sm mb-2">{dateLabel}</p>
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8 text-center">
          <p className="text-white/70 text-base mb-2">
            Your first horoscope is being written...
          </p>
          <p className="text-white/40 text-sm">
            While you wait, explore your birth chart to discover your stars.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 px-5 py-2.5 rounded-xl bg-white/5 text-white/50 text-sm
                       hover:bg-white/10 transition-colors"
          >
            Refresh
          </button>
        </div>
      </main>
    );
  }

  // SUCCESS: Content
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-8 max-w-lg mx-auto">
      {/* Header: Date + Streak */}
      <div className="flex items-center justify-between mb-8">
        <p className="text-amber-200/60 text-sm font-medium">{dateLabel}</p>
        <StreakBadge />
      </div>

      {/* Horoscope Card — THE main content */}
      <div className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01]
                      border border-amber-500/10 p-6 mb-8">
        <p className="text-white/90 text-[17px] leading-relaxed whitespace-pre-line">
          {data.horoscope}
        </p>
        {data.source && data.source !== "cached" && (
          <p className="text-white/20 text-[11px] mt-4">
            Generated via {data.source === "template" ? "template" : "AI"}
          </p>
        )}
      </div>

      {/* Today's Stars */}
      {data.highlightedStars.length > 0 && (
        <section className="mb-8">
          <h2 className="text-white/40 text-xs uppercase tracking-wider mb-3 font-medium">
            Today&apos;s Stars
          </h2>
          <div className="space-y-2">
            {data.highlightedStars.map((star) => (
              <div
                key={star}
                className="flex items-center gap-3 rounded-xl bg-white/[0.02] px-4 py-3
                           border border-white/[0.04]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
                <span className="text-white/70 text-sm">{star}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-5 py-3 rounded-xl
                     border border-white/[0.08] text-white/60 text-sm
                     hover:border-white/15 hover:text-white/80 transition-colors"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>

        <ShareCard
          horoscopeText={data.horoscope}
          highlightedStars={data.highlightedStars}
          date={dateLabel}
          streak={streak}
        />

        {chartPalaces.length > 0 && (
          <button
            onClick={() => setShowChart(!showChart)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl
                       border border-white/[0.08] text-white/60 text-sm
                       hover:border-white/15 hover:text-white/80 transition-colors"
          >
            <Eye className="h-4 w-4" />
            {showChart ? "Hide Chart" : "View Your Chart"}
          </button>
        )}
      </div>

      {/* Chart Visualization (toggle) */}
      {showChart && chartPalaces.length > 0 && (
        <section className="mb-8 rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
          <ChartCanvas palaces={chartPalaces} />
        </section>
      )}

      {/* Attribution */}
      <p className="text-white/15 text-[11px] mt-12 text-center">
        DestinyBlueprint — Zi Wei Dou Shu Daily
      </p>
    </main>
  );
}
