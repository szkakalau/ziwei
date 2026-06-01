"use client";

import { useEffect, useState } from "react";
import { Share2, Eye, ArrowRight } from "lucide-react";
import { StreakBadge } from "@/components/StreakBadge";
import { ChartCanvas } from "@/components/ChartCanvas";
import { ShareCard } from "@/components/ShareCard";
import { AskZiwei } from "@/components/AskZiwei";
import { CompatibilityCheck } from "@/components/CompatibilityCheck";
import { useOneSignal, PushPrompt } from "@/components/PushSetup";
import Link from "next/link";

interface HoroscopeData {
  horoscope: string | null;
  highlightedStars: string[];
  source?: string;
  date?: string;
}

type AuthStatus = "checking" | "unauthenticated" | "no_chart" | "no_subscription" | "ok";

export default function DailyPage() {
  const [data, setData] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [chartPalaces, setChartPalaces] = useState<Array<{name?: string; majorStars?: Array<{name?: string}>; minorStars?: Array<{name?: string}>}>>([]);
  const [streak, setStreak] = useState(0);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [userId, setUserId] = useState<string | undefined>();

  const onesignalAppId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "";
  const { pushState, requestPush } = useOneSignal(onesignalAppId, userId);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (r) => {
        if (r.status === 401) { setAuthStatus("unauthenticated"); return; }
        const d = await r.json();
        if (!d.ok) { setAuthStatus("unauthenticated"); return; }

        if (d.user?.id) setUserId(d.user.id);

        const status = d.user?.subscriptionStatus;
        if (!status || status === "cancelled" || status === "expired") {
          setAuthStatus("no_subscription");
        } else {
          setAuthStatus("ok");
        }
      })
      .catch(() => setAuthStatus("unauthenticated"));
  }, []);

  useEffect(() => {
    if (authStatus !== "ok") { setLoading(false); return; }

    Promise.all([
      fetch("/api/generate-daily", { method: "POST" }),
      fetch("/api/chart"),
      fetch("/api/streak"),
    ])
      .then(async ([horoscopeRes, chartRes, streakRes]) => {
        if (horoscopeRes.status === 400) { setAuthStatus("no_chart"); return; }
        const horoscopeData = horoscopeRes.ok ? await horoscopeRes.json() : null;
        const chartData = chartRes.ok ? await chartRes.json() : null;
        const streakData = streakRes.ok ? await streakRes.json() : null;

        if (horoscopeData?.ok) setData(horoscopeData);
        if (chartData?.ok) setChartPalaces(chartData.chart?.palaces ?? []);
        if (streakData?.ok) setStreak(streakData.streak ?? 0);
      })
      .catch(() => setError("Today's stars are taking longer than usual."))
      .finally(() => setLoading(false));
  }, [authStatus]);

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

  const handleStartTrial = async () => {
    try {
      const r = await fetch("/api/checkout", { method: "POST" });
      const d = await r.json();
      if (d.ok && d.url) {
        window.location.href = d.url;
      }
    } catch {
      // Checkout failed silently
    }
  };

  const handleAuth = async (mode: "login" | "register") => {
    setAuthError(null);
    const email = mode === "login" ? loginEmail : signupEmail;
    const password = mode === "login" ? loginPassword : signupPassword;

    try {
      const r = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const d = await r.json();
      if (d.ok) {
        window.location.reload();
      } else {
        setAuthError(d.error === "DUPLICATE_EMAIL"
          ? "Email already registered. Try logging in."
          : d.message || "Authentication failed");
      }
    } catch {
      setAuthError("Network error. Please try again.");
    }
  };

  // AUTH GATE: Not authenticated
  if (authStatus === "unauthenticated") {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-8 max-w-lg mx-auto">
        <p className="text-amber-200/60 text-sm mb-8 text-center">{dateLabel}</p>

        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6 mb-4">
          <h2 className="text-white/80 text-lg font-semibold mb-1">
            {authMode === "register" ? "Start your free trial" : "Welcome back"}
          </h2>
          <p className="text-white/40 text-sm mb-6">
            {authMode === "register"
              ? "7 days free, then $4.99/month. Cancel anytime."
              : "Log in to see today's horoscope."}
          </p>

          <input
            type="email"
            placeholder="Email"
            value={authMode === "login" ? loginEmail : signupEmail}
            onChange={(e) => authMode === "login"
              ? setLoginEmail(e.target.value)
              : setSignupEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                       text-white/90 text-sm placeholder:text-white/20 mb-3
                       focus:outline-none focus:border-amber-500/30"
          />
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={authMode === "login" ? loginPassword : signupPassword}
            onChange={(e) => authMode === "login"
              ? setLoginPassword(e.target.value)
              : setSignupPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAuth(authMode); }}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                       text-white/90 text-sm placeholder:text-white/20 mb-4
                       focus:outline-none focus:border-amber-500/30"
          />

          {authError && (
            <p className="text-red-400/80 text-xs mb-4">{authError}</p>
          )}

          <button
            onClick={() => handleAuth(authMode)}
            className="w-full py-3 rounded-xl bg-amber-500/15 text-amber-300 text-sm font-medium
                       border border-amber-500/20 hover:bg-amber-500/25 transition-colors mb-3"
          >
            {authMode === "register" ? "Start Free Trial" : "Log In"}
          </button>

          <button
            onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(null); }}
            className="w-full text-center text-white/30 text-xs hover:text-white/50 transition-colors"
          >
            {authMode === "register" ? "Already have an account? Log in" : "New here? Create an account"}
          </button>
        </div>

        <p className="text-white/15 text-[11px] text-center mt-8">
          DestinyBlueprint — Zi Wei Dou Shu Daily
        </p>
      </main>
    );
  }

  // NO CHART: User authenticated but needs birth chart
  if (authStatus === "no_chart") {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-8 max-w-lg mx-auto">
        <p className="text-amber-200/60 text-sm mb-8 text-center">{dateLabel}</p>
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8 text-center">
          <h2 className="text-white/80 text-lg font-semibold mb-2">Set up your birth chart</h2>
          <p className="text-white/40 text-sm mb-6">
            Enter your birth details to generate your personalized Zi Wei Dou Shu chart.
          </p>
          <Link
            href="/#free-personality-snapshot"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                       bg-amber-500/15 text-amber-300 text-sm font-medium
                       border border-amber-500/20 hover:bg-amber-500/25 transition-colors"
          >
            Enter Birth Details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  // NO SUBSCRIPTION: Authenticated with chart, no active subscription
  if (authStatus === "no_subscription") {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-8 max-w-lg mx-auto">
        <p className="text-amber-200/60 text-sm mb-8 text-center">{dateLabel}</p>
        <div className="rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01]
                        border border-amber-500/10 p-8 text-center">
          <h2 className="text-white/80 text-lg font-semibold mb-2">
            Get your daily horoscope
          </h2>
          <p className="text-white/40 text-sm mb-2">
            Personalized Zi Wei Dou Shu horoscopes every morning
          </p>
          <ul className="text-left text-white/50 text-sm space-y-1.5 mb-6 mx-auto max-w-xs">
            <li>✨ Daily AI-powered horoscopes</li>
            <li>🔮 Interactive birth chart</li>
            <li>📤 Share with friends</li>
            <li>🔥 Streak tracking</li>
          </ul>
          <button
            onClick={handleStartTrial}
            className="w-full py-3 rounded-xl bg-amber-500/15 text-amber-300 text-sm font-medium
                       border border-amber-500/20 hover:bg-amber-500/25 transition-colors mb-2"
          >
            Start 7-Day Free Trial
          </button>
          <p className="text-white/25 text-xs">Then $4.99/month. Cancel anytime.</p>
        </div>
      </main>
    );
  }

  // LOADING
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
        </div>
      </main>
    );
  }

  // ERROR
  if (error) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-8 max-w-lg mx-auto">
        <p className="text-amber-200/60 text-sm mb-2">{dateLabel}</p>
        <div className="rounded-2xl bg-white/[0.03] border border-amber-500/10 p-8 text-center">
          <p className="text-white/60 text-base mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-xl bg-amber-500/15 text-amber-300 text-sm font-medium
                       hover:bg-amber-500/25 transition-colors"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  // EMPTY
  if (!data?.horoscope) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-8 max-w-lg mx-auto">
        <p className="text-amber-200/60 text-sm mb-2">{dateLabel}</p>
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-8 text-center">
          <p className="text-white/70 text-base mb-2">
            Your first horoscope is being written...
          </p>
          <p className="text-white/40 text-sm">
            While you wait, explore your birth chart.
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

  // SUCCESS
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-5 py-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="text-amber-200/60 text-sm font-medium">{dateLabel}</p>
        <StreakBadge />
      </div>

      {/* Push notification prompt */}
      {pushState !== "loading" && pushState !== "unsupported" && (
        <div className="mb-6">
          <PushPrompt pushState={pushState} onEnable={requestPush} />
        </div>
      )}

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

      {/* AI Chat */}
      <AskZiwei />

      {/* Compatibility Check */}
      <CompatibilityCheck />

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

      {showChart && chartPalaces.length > 0 && (
        <section className="mb-8 rounded-2xl bg-white/[0.02] border border-white/[0.04] p-4">
          <ChartCanvas palaces={chartPalaces} />
        </section>
      )}

      <p className="text-white/15 text-[11px] mt-12 text-center">
        DestinyBlueprint — Zi Wei Dou Shu Daily
      </p>
    </main>
  );
}
