"use client";

import { useEffect, useState } from "react";
import { Sparkles, Mail, Clock, CheckCircle } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import Link from "next/link";

type ReadingData = {
  status: "no_order" | "writing" | "delivered" | "expired";
  message: string;
};

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
          setError(d.message || "Could not load reading status.");
        }
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-void text-ink px-5 py-20 max-w-2xl mx-auto text-center">
        <Sparkles className="h-8 w-8 text-gold/50 mx-auto mb-4 animate-pulse" />
        <p className="text-ink-muted text-base">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-void text-ink px-5 py-20 max-w-2xl mx-auto text-center">
        <p className="text-cinnabar text-sm mb-4">{error}</p>
        <Link href="/daily" className="text-gold/60 text-sm hover:text-gold">
          Back to daily horoscope
        </Link>
      </main>
    );
  }

  const status = data?.status ?? "no_order";

  const icons: Record<string, React.ReactNode> = {
    no_order: <Mail className="h-10 w-10 text-gold/30 mx-auto mb-4" />,
    writing: <Clock className="h-10 w-10 text-gold/50 mx-auto mb-4" />,
    delivered: <CheckCircle className="h-10 w-10 text-green-400/50 mx-auto mb-4" />,
    expired: <Mail className="h-10 w-10 text-ink-dim mx-auto mb-4" />,
  };

  const titles: Record<string, string> = {
    no_order: "Your Email Reading",
    writing: "Your Reading Is Being Written",
    delivered: "Your Reading Has Been Delivered",
    expired: "Subscription Ended",
  };

  return (
    <main className="min-h-screen bg-void text-ink px-5 py-16 max-w-2xl mx-auto">
      <div className="text-center mb-10">
        {icons[status]}
        <h1 className="text-ink text-xl md:text-2xl font-semibold">
          {titles[status]}
        </h1>
        <p className="text-ink-muted text-sm mt-4 max-w-md mx-auto leading-relaxed">
          {data?.message}
        </p>
      </div>

      <div className="rounded-xl border border-gold/08 bg-gold/[0.02] p-6 text-center space-y-4">
        {(status === "no_order" || status === "expired") && (
          <>
            <p className="text-ink-muted text-sm">
              Our astrologer writes a personalized Zi Wei Dou Shu reading based on your birth chart and your specific question. Delivered via email within 24-48 hours of subscribing.
            </p>
            <Link
              href="/daily"
              className="btn-cta px-6 py-3 text-sm"
            >
              Subscribe now — $4.99/mo
            </Link>
          </>
        )}

        {status === "writing" && (
          <>
            <p className="text-ink-dim text-sm">
              We&rsquo;ve received your order and our astrologer is working on it. The reading will be sent to your email as soon as your subscription becomes active after the 7-day trial.
            </p>
            <Link
              href="/daily"
              className="btn-cta px-6 py-3 text-sm"
            >
              Go to daily horoscope
            </Link>
          </>
        )}

        {status === "delivered" && (
          <p className="text-ink-dim text-sm">
            Check your inbox and spam folder. If you still can&rsquo;t find it, email us at{" "}
            <a href="mailto:castro.liu@me.com" className="text-gold/70 hover:text-gold">
              castro.liu@me.com
            </a>.
          </p>
        )}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/daily"
          className="text-gold/50 text-sm hover:text-gold transition-colors"
        >
          Back to daily horoscope
        </Link>
      </div>

      <AppNav />
    </main>
  );
}