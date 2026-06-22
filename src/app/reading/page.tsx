"use client";

import { useEffect, useState } from "react";
import { Sparkles, Mail, Lock } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import Link from "next/link";

type ReadingData =
  | { status: "pending" }
  | { status: "locked"; message: string }
  | { status: "full"; content: string; deliveredAt: string };

export default function ReadingPage() {
  const [data, setData] = useState<ReadingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reading")
      .then(async (r) => {
        if (r.status === 401) {
          window.location.href = "/daily";
          return;
        }
        const d = await r.json();
        if (d.ok) {
          setData(d as ReadingData);
        } else {
          setError(d.message || "Could not load reading.");
        }
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-20 max-w-2xl mx-auto text-center">
        <Sparkles className="h-8 w-8 text-amber-400/50 mx-auto mb-4 animate-pulse" />
        <p className="text-white/60 text-base">Loading your reading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-20 max-w-2xl mx-auto text-center">
        <p className="text-red-400/70 text-sm mb-4">{error}</p>
        <Link href="/daily" className="text-amber-400/60 text-sm hover:text-amber-300">
          ← Back to daily horoscope
        </Link>
      </main>
    );
  }

  // ── Pending: reading not yet delivered ──
  if (!data || data.status === "pending") {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-16 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <Mail className="h-10 w-10 text-amber-400/40 mx-auto mb-4" />
          <h1 className="text-amber-200/90 text-xl md:text-2xl font-semibold">
            Your Email Reading
          </h1>
          <p className="text-white/40 text-sm mt-3 max-w-md mx-auto">
            Your personalized Zi Wei Dou Shu reading is being written by our
            astrologer. You&apos;ll receive it via email within 24–48 hours of
            subscribing.
          </p>
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500/30 animate-pulse" />
            <p className="text-white/50 text-sm">Reading in progress...</p>
          </div>
          <p className="text-white/25 text-xs leading-relaxed">
            Once delivered, you can view it here or check your inbox. Make sure
            to check your spam folder if you don&apos;t see it within the
            estimated window.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/daily"
            className="text-amber-400/50 text-sm hover:text-amber-300 transition-colors"
          >
            ← Back to daily horoscope
          </Link>
        </div>

        <AppNav />
      </main>
    );
  }

  // ── Locked (trial user, reading exists but not yet accessible) ──
  if (data.status === "locked") {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-16 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <Lock className="h-10 w-10 text-amber-400/40 mx-auto mb-4" />
          <h1 className="text-amber-200/90 text-xl md:text-2xl font-semibold">
            Your Email Reading
          </h1>
          <p className="text-white/50 text-sm mt-4 max-w-md mx-auto leading-relaxed">
            {data.message}
          </p>
        </div>

        <div className="rounded-xl border border-amber-500/10 bg-amber-500/[0.03] p-6 text-center">
          <p className="text-white/60 text-sm mb-5">
            Our astrologer has started working on your personalized Zi Wei Dou Shu reading. Subscribe now to receive the complete reading via email and unlock it here.
          </p>
          <Link
            href="/daily"
            className="inline-block px-6 py-3 rounded-xl bg-amber-500/15 text-amber-300 text-sm font-medium border border-amber-500/20 hover:bg-amber-500/25 transition-colors"
          >
            Upgrade now — $4.99/mo →
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/daily"
            className="text-amber-400/50 text-sm hover:text-amber-300 transition-colors"
          >
            ← Back to daily horoscope
          </Link>
        </div>

        <AppNav />
      </main>
    );
  }

  // ── Full reading (active subscriber) ──
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-16 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <Sparkles className="h-8 w-8 text-amber-400/50 mx-auto mb-3" />
        <h1 className="text-amber-200/90 text-xl md:text-2xl font-semibold">
          Your Email Reading
        </h1>
        <p className="text-white/40 text-sm mt-2">
          Delivered {data.deliveredAt ? new Date(data.deliveredAt).toLocaleDateString() : "recently"}
        </p>
      </div>

      <div className="rounded-xl bg-white/[0.02] border border-amber-500/10 p-6 md:p-8">
        <div className="prose prose-invert prose-sm max-w-none">
          <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
            {data.content}
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/daily"
          className="text-amber-400/50 text-sm hover:text-amber-300 transition-colors"
        >
          ← Back to daily horoscope
        </Link>
      </div>

      <AppNav />
    </main>
  );
}
