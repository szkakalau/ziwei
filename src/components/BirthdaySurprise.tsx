"use client";

import { useState } from "react";
import { Gift, Sparkles, Loader2 } from "lucide-react";
import { ShareCard } from "@/components/ShareCard";

interface BirthdaySurpriseProps {
  birthDate: string;
  streak: number;
}

export function BirthdaySurprise({ birthDate, streak }: BirthdaySurpriseProps) {
  const [showReading, setShowReading] = useState(false);
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  // Parse birthDate ('YYYY-MM-DD') as local calendar components, NOT via
  // new Date(birthDate) which treats it as UTC and shifts the day in UTC-X
  // timezones (the primary English-targeted audience).
  const [by, bm, bd] = birthDate.split("-").map(Number);
  const birthMonth = bm - 1; // Date months are 0-indexed
  const birthDay = bd;
  const isBirthday =
    today.getMonth() === birthMonth &&
    today.getDate() === birthDay;

  // Also show "birthday week" — 3 days before and after
  const thisYearBirthday = new Date(today.getFullYear(), birthMonth, birthDay);
  const diffMs = Math.abs(today.getTime() - thisYearBirthday.getTime());
  const dayDiff = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const isBirthdayWeek = dayDiff <= 3;

  if (!isBirthday && !isBirthdayWeek) return null;

  const age = today.getFullYear() - by;
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleGenerateReading = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/birthday-reading", { method: "POST" });
      const d = await r.json();
      if (d.ok) {
        setReading(d.reading);
        setShowReading(true);
      } else {
        setError("Could not load your birthday reading. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Birthday Week Teaser */}
      {isBirthdayWeek && !isBirthday && !showReading && (
        <div className="mb-6 rounded-2xl bg-gradient-to-b from-amber-500/[0.06] to-amber-500/[0.01]
                        border border-amber-500/15 p-5 text-center">
          <Gift className="h-5 w-5 text-amber-400/70 mx-auto mb-2" />
          <p className="text-amber-200/70 text-sm font-medium mb-1">
            {today.getTime() < thisYearBirthday.getTime()
              ? "Your birthday is coming up! 🎂"
              : "Hope you had a great birthday! 🎂"}
          </p>
          <p className="text-white/40 text-xs mb-3">
            {today.getTime() < thisYearBirthday.getTime()
              ? "Come back on your birthday for a special annual personal insight reading."
              : "Here's a special annual personal insight reading to close out your birthday week."}
          </p>
        </div>
      )}

      {/* Birthday Day — Prompt to generate */}
      {isBirthday && !showReading && !reading && (
        <div className="mb-6 rounded-2xl bg-gradient-to-b from-amber-500/[0.08] to-amber-500/[0.02]
                        border border-amber-500/20 p-6 text-center">
          <Sparkles className="h-6 w-6 text-amber-400 mx-auto mb-3" />
          <h2 className="text-amber-200 text-lg font-semibold mb-1">
            Happy Birthday! 🎉
          </h2>
          <p className="text-white/50 text-sm mb-5">
            You&apos;re turning {age}. Let your personality patterns reveal what your next year holds.
          </p>
          <button
            onClick={handleGenerateReading}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-amber-500/20 text-amber-300 text-sm font-medium
                       border border-amber-500/25 hover:bg-amber-500/30
                       disabled:opacity-50 transition-colors flex items-center gap-2 mx-auto"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
            {loading ? "Reading the stars..." : "Reveal Your Annual Reading"}
          </button>
          {error && (
            <p className="text-red-400/70 text-xs mt-3 text-center">{error}</p>
          )}
        </div>
      )}

      {/* Birthday Reading Result */}
      {reading && (
        <div className="mb-6 rounded-2xl bg-gradient-to-b from-amber-500/[0.06] to-transparent
                        border border-amber-500/15 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <h2 className="text-amber-200/90 text-sm font-semibold uppercase tracking-wider">
              Your {age}th Year — Annual Personal Insight Reading
            </h2>
          </div>

          <p className="text-white/85 text-[15px] leading-relaxed whitespace-pre-line mb-4">
            {reading}
          </p>

          <div className="flex flex-wrap gap-2">
            <ShareCard
              horoscopeText={reading}
              highlightedStars={[]}
              date={`My ${age}th Birthday — ${dateLabel}`}
              streak={streak}
            />
          </div>

          <p className="text-white/20 text-[11px] mt-4">
            This reading is based on your personality patterns and the current year&apos;s life-phase dynamics.
          </p>
        </div>
      )}
    </>
  );
}
