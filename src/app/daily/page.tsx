"use client";

import { useEffect, useState } from "react";
import { Share2, Eye, ArrowRight, Calendar } from "lucide-react";
import { StreakBadge } from "@/components/StreakBadge";
import { ChartCanvas } from "@/components/ChartCanvas";
import { ShareCard } from "@/components/ShareCard";
import { AskZiwei } from "@/components/AskZiwei";
import { CompatibilityCheck } from "@/components/CompatibilityCheck";
import { useOneSignal, PushPrompt } from "@/components/PushSetup";
import { BirthdaySurprise } from "@/components/BirthdaySurprise";
import { AppNav } from "@/components/AppNav";
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
  const [userBirthDate, setUserBirthDate] = useState<string | undefined>();

  const onesignalAppId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "";
  const { pushState, requestPush } = useOneSignal(onesignalAppId, userId);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (r) => {
        if (r.status === 401) { setAuthStatus("unauthenticated"); return; }
        const d = await r.json();
        if (!d.ok) { setAuthStatus("unauthenticated"); return; }

        if (d.user?.id) setUserId(d.user.id);
        if (d.user?.birthDate) setUserBirthDate(d.user.birthDate);

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

    fetchHoroscope();
  }, [authStatus]);

  const fetchHoroscope = async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await Promise.allSettled([
        fetch("/api/generate-daily", { method: "POST" }),
        fetch("/api/chart"),
        fetch("/api/streak"),
      ]);

      const [h, c, s] = results;
      if (h.status === "fulfilled") {
        if (h.value.status === 400) { setAuthStatus("no_chart"); setLoading(false); return; }
        if (h.value.ok) {
          const d = await h.value.json();
          if (d.ok && d.horoscope) setData(d);
          else if (d.ok && !d.horoscope) { /* horoscope is null — generation pending */ }
          else setError(d.message || "Could not generate today's reading.");
        } else {
          setError("The stars are taking longer than usual. Please try again.");
        }
      } else {
        setError("Network error. Check your connection and try again.");
      }

      if (c.status === "fulfilled" && c.value.ok) {
        const d = await c.value.json(); if (d.ok) setChartPalaces(d.chart?.palaces ?? []);
      }
      if (s.status === "fulfilled" && s.value.ok) {
        const d = await s.value.json(); if (d.ok) setStreak(d.streak ?? 0);
      }
      fetch("/api/streak", { method: "POST" }).catch(() => {});
    } catch {
      setError("Today's stars are taking longer than usual.");
    } finally {
      setLoading(false);
    }
  };

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

  const [trialError, setTrialError] = useState<string | null>(null);

  const handleStartTrial = async () => {
    setTrialError(null);
    try {
      const r = await fetch("/api/checkout", { method: "POST" });
      const d = await r.json();
      if (d.ok && d.url) {
        window.location.href = d.url;
      } else if (d.error === "NOT_AUTHENTICATED") {
        setAuthStatus("unauthenticated");
      } else {
        setTrialError("Could not start trial. Please try again.");
      }
    } catch {
      setTrialError("Network error. Please try again later.");
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

  // ── AUTH GATE: Not authenticated ──
  if (authStatus === "unauthenticated") {
    return (
      <main className="min-h-screen px-5 py-8 max-w-lg mx-auto">
        <p className="text-gold/60 text-sm mb-8 text-center">{dateLabel}</p>

        <div className="card-cosmic p-6 mb-4">
          <h2 className="text-ink/80 text-lg font-semibold mb-1">
            {authMode === "register" ? "Start your free trial" : "Welcome back"}
          </h2>
          <p className="text-ink-dim text-sm mb-6">
            {authMode === "register"
              ? "7 days free, then $4.99/month. Cancel anytime."
              : "Log in to see today's horoscope."}
          </p>

          <input
            type="email" placeholder="Email"
            value={authMode === "login" ? loginEmail : signupEmail}
            onChange={(e) => authMode === "login"
              ? setLoginEmail(e.target.value) : setSignupEmail(e.target.value)}
            className="input-ink mb-3"
          />
          <input
            type="password"
            placeholder={authMode === "login" ? "Password" : "Password (min 10 characters)"}
            value={authMode === "login" ? loginPassword : signupPassword}
            onChange={(e) => authMode === "login"
              ? setLoginPassword(e.target.value) : setSignupPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAuth(authMode); }}
            className="input-ink mb-4"
          />

          {authError && (
            <p className="text-cinnabar/80 text-xs mb-4">{authError}</p>
          )}

          <button
            onClick={() => handleAuth(authMode)}
            className="w-full py-3 rounded-sm bg-gold/[0.08] text-gold text-sm font-medium
                       border border-gold/15 hover:bg-gold/[0.14] transition-colors mb-3"
          >
            {authMode === "register" ? "Start 7-Day Free Trial" : "Log In"}
          </button>

          <button
            onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(null); }}
            className="w-full text-center text-ink-dim text-xs hover:text-ink-muted transition-colors"
          >
            {authMode === "register" ? "Already have an account? Log in" : "New here? Create an account"}
          </button>
        </div>

        <p className="text-ink-dim/30 text-[11px] text-center mt-8">
          DestinyBlueprint — Zi Wei Dou Shu Daily
        </p>
      </main>
    );
  }

  // ── NO CHART ──
  if (authStatus === "no_chart") {
    return (
      <main className="min-h-screen px-5 py-8 max-w-lg mx-auto">
        <p className="text-gold/60 text-sm mb-8 text-center">{dateLabel}</p>
        <div className="card-cosmic p-8 text-center">
          <h2 className="text-ink/80 text-lg font-semibold mb-2">Set up your birth chart</h2>
          <p className="text-ink-dim text-sm mb-6">
            Enter your birth details to generate your personalized Zi Wei Dou Shu chart.
          </p>
          <Link
            href="/#free-personality-snapshot"
            className="btn-cosmic inline-flex items-center gap-2"
          >
            Enter Birth Details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    );
  }

  // ── NO SUBSCRIPTION ──
  if (authStatus === "no_subscription") {
    return (
      <main className="min-h-screen px-5 py-8 max-w-lg mx-auto">
        <p className="text-gold/60 text-sm mb-8 text-center">{dateLabel}</p>
        <div className="card-cosmic-highlight p-8 text-center">
          <h2 className="text-ink/80 text-lg font-semibold mb-2">
            Get your daily horoscope
          </h2>
          <p className="text-ink-dim text-sm mb-2">
            Personalized Zi Wei Dou Shu horoscopes every morning
          </p>
          <ul className="text-left text-ink-muted text-sm space-y-1.5 mb-6 mx-auto max-w-xs">
            <li>✨ Daily AI-powered horoscopes</li>
            <li>🔮 Interactive birth chart</li>
            <li>📤 Share with friends</li>
            <li>🔥 Streak tracking</li>
          </ul>
          <button
            onClick={handleStartTrial}
            className="w-full py-3 rounded-sm bg-gold/[0.08] text-gold text-sm font-medium
                       border border-gold/15 hover:bg-gold/[0.14] transition-colors mb-2"
          >
            Start 7-Day Free Trial
          </button>
          <p className="text-ink-dim/40 text-xs">Then $4.99/month. Cancel anytime.</p>
          {trialError && (
            <p className="text-cinnabar/70 text-xs mt-3">{trialError}</p>
          )}
        </div>
      </main>
    );
  }

  // ── LOADING ──
  if (loading) {
    return (
      <main className="min-h-screen px-5 py-8 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="h-5 w-32 bg-gold/[0.06] rounded animate-pulse" />
          <div className="h-4 w-16 bg-gold/[0.04] rounded animate-pulse" />
        </div>
        <div className="card-cosmic p-6 space-y-4">
          <div className="h-4 bg-gold/[0.05] rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-gold/[0.04] rounded w-full animate-pulse" />
          <div className="h-3 bg-gold/[0.04] rounded w-5/6 animate-pulse" />
          <div className="h-3 bg-gold/[0.04] rounded w-4/5 animate-pulse" />
        </div>
      </main>
    );
  }

  // ── ERROR ──
  if (error) {
    return (
      <main className="min-h-screen px-5 py-8 max-w-lg mx-auto">
        <p className="text-gold/60 text-sm mb-2">{dateLabel}</p>
        <div className="card-cosmic p-8 text-center">
          <p className="text-ink-muted text-base mb-4">{error}</p>
          <button
            onClick={fetchHoroscope}
            disabled={loading}
            className="btn-cosmic"
          >
            {loading ? "Trying…" : "Try again"}
          </button>
        </div>
      </main>
    );
  }

  // ── EMPTY ──
  if (!data?.horoscope) {
    return (
      <main className="min-h-screen px-5 py-8 max-w-lg mx-auto">
        <p className="text-gold/60 text-sm mb-2">{dateLabel}</p>
        <div className="card-cosmic p-8 text-center">
          <p className="text-ink-muted text-base mb-2">
            Your first horoscope is being written...
          </p>
          <p className="text-ink-dim text-sm mb-5">
            While you wait, explore your birth chart.
          </p>
          <button
            onClick={fetchHoroscope}
            disabled={loading}
            className="btn-cosmic"
          >
            {loading ? "Generating…" : "Refresh"}
          </button>
          {error && (
            <p className="text-cinnabar/70 text-sm mt-4">{error}</p>
          )}
        </div>
      </main>
    );
  }

  // ── SUCCESS ──
  return (
    <main className="min-h-screen px-5 py-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gold/70 text-sm font-medium">{dateLabel}</p>
        <StreakBadge streak={streak} />
      </div>

      {/* Birthday Surprise */}
      {userBirthDate && (
        <BirthdaySurprise birthDate={userBirthDate} streak={streak} />
      )}

      {/* Push notification prompt */}
      {pushState !== "loading" && pushState !== "unsupported" && (
        <div className="mb-6">
          <PushPrompt pushState={pushState} onEnable={requestPush} />
        </div>
      )}

      {/* Horoscope card */}
      <div className="card-cosmic-highlight p-6 mb-8">
        <p className="text-ink/90 text-[17px] leading-relaxed whitespace-pre-line">
          {data.horoscope}
        </p>
        {data.source && data.source !== "cached" && (
          <p className="text-ink-dim/30 text-[11px] mt-4">
            Generated via {data.source === "template" ? "template" : "AI"}
          </p>
        )}
      </div>

      {/* Today's Stars */}
      {data.highlightedStars.length > 0 && (
        <section className="mb-8">
          <h2 className="text-ink-dim text-xs uppercase tracking-wider mb-3 font-medium">
            Today&apos;s Stars
          </h2>
          <div className="space-y-2">
            {data.highlightedStars.map((star) => (
              <div
                key={star}
                className="flex items-center gap-3 rounded-sm bg-gold/[0.03] px-4 py-3 border border-gold/[0.06]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold/60" />
                <span className="text-ink-muted text-sm">{star}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI Chat */}
      <AskZiwei />

      {/* Compatibility Check */}
      <CompatibilityCheck />

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          href="/yearly"
          className="btn-cosmic inline-flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Yearly Forecast
        </Link>

        <button
          onClick={handleShare}
          className="btn-cosmic inline-flex items-center gap-2"
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
            className="btn-cosmic inline-flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {showChart ? "Hide Chart" : "View Your Chart"}
          </button>
        )}
      </div>

      {showChart && chartPalaces.length > 0 && (
        <section className="mb-8 card-cosmic p-4">
          <ChartCanvas palaces={chartPalaces} />
        </section>
      )}

      <p className="text-ink-dim/20 text-[11px] mt-12 text-center mb-20">
        DestinyBlueprint — Zi Wei Dou Shu Daily
      </p>

      <AppNav />
    </main>
  );
}
