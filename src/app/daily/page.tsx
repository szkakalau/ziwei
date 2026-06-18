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
import { getStarBrief } from "@/lib/zwdsKnowledge";
import { formatStarName, getStarKeywords } from "@/lib/zwdsNaming";
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

        // Clean up Stripe session_id from URL (status was already set by checkout API)
        const params = new URLSearchParams(window.location.search);
        if (params.has("session_id")) {
          window.history.replaceState(null, "", "/daily");
        }

        const status = d.user?.subscriptionStatus;
        if (!status || status === "free" || status === "cancelled" || status === "expired") {
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

  const fetchHoroscope = async (skipSync = false) => {
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
        // SUBSCRIPTION_REQUIRED — user was marked "ok" but subscription lapsed
        if (h.value.status === 402) { setAuthStatus("no_subscription"); setLoading(false); return; }
        // CHART_NOT_FOUND — try to sync sessionStorage chart data to server before giving up
        if (h.value.status === 400 && !skipSync) {
          const synced = await syncChartFromStorage();
          if (synced) {
            fetchHoroscope(true);
            return;
          }
          setAuthStatus("no_chart"); setLoading(false); return;
        }
        if (h.value.ok) {
          const d = await h.value.json();
          if (d.ok && d.horoscope) setData(d);
          else if (d.ok && !d.horoscope) { /* horoscope is null — generation pending */ }
          else setError(d.message || "Could not generate today's reading.");
        } else {
          // Include server error detail if available
          try {
            const d = await h.value.json();
            setError(d.message || "The stars are taking longer than usual. Please try again.");
          } catch {
            setError("The stars are taking longer than usual. Please try again.");
          }
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

  // If the user filled the Hero form before registering, their chart data is
  // only in sessionStorage. Sync it to the server so /api/generate-daily can use it.
  const syncChartFromStorage = async (): Promise<boolean> => {
    try {
      const birthInput = JSON.parse(sessionStorage.getItem("userBirthInput") || "null");
      const chart = JSON.parse(sessionStorage.getItem("userChart") || "null");
      const meta = JSON.parse(sessionStorage.getItem("userChartMeta") || "null");
      if (!birthInput || !chart) return false;

      const r = await fetch("/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: birthInput.birthDate,
          birthTime: birthInput.birthTime,
          birthPlace: meta ? { lat: meta.latitude, lng: meta.longitude, tz: meta.timezone } : undefined,
          chartData: chart,
        }),
      });
      const d = await r.json();
      return d.ok === true;
    } catch {
      return false;
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
      <main className="min-h-screen px-5 py-8 pb-20 max-w-lg mx-auto">
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
      <main className="min-h-screen px-5 py-8 pb-20 max-w-lg mx-auto">
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
      <main className="min-h-screen px-5 py-8 pb-20 max-w-lg mx-auto">
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
      <main className="min-h-screen px-5 py-8 pb-20 max-w-lg mx-auto">
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
      <main className="min-h-screen px-5 py-8 pb-20 max-w-lg mx-auto">
        <p className="text-gold/60 text-sm mb-2">{dateLabel}</p>
        <div className="card-cosmic p-8 text-center">
          <p className="text-ink-muted text-base mb-4">{error}</p>
          <button
            onClick={() => fetchHoroscope()}
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
      <main className="min-h-screen px-5 py-8 pb-20 max-w-lg mx-auto">
        <p className="text-gold/60 text-sm mb-2">{dateLabel}</p>
        <div className="card-cosmic p-8 text-center">
          <p className="text-ink-muted text-base mb-2">
            Your first horoscope is being written...
          </p>
          <p className="text-ink-dim text-sm mb-5">
            While you wait, explore your birth chart.
          </p>
          <button
            onClick={() => fetchHoroscope()}
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
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const ritualPrompts = [
    "Take 3 minutes to journal: what opportunity is presenting itself today?",
    "Notice one moment where you felt fully present. What triggered it?",
    "Identify one decision you've been postponing. What's the smallest first step?",
    "Reach out to someone who energizes you — a text is enough.",
    "Write down one limiting belief. Then write one piece of evidence against it.",
    "Before bed, name three things that went better than expected today.",
    "Observe your energy levels. When did you feel most alive? Most drained?",
    "Ask yourself: if I trusted my instinct completely, what would I do differently?",
  ];
  const ritual = ritualPrompts[dayOfYear % ritualPrompts.length];
  return (
    <main className="min-h-screen px-4 py-4 pb-20 md:px-6 md:py-8 max-w-4xl mx-auto">
      {/* Top bar — compact */}
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <p className="text-gold/70 text-sm font-medium">{dateLabel}</p>
        <StreakBadge streak={streak} />
      </div>

      {/* Birthday + Push banner — compact */}
      {userBirthDate && (
        <BirthdaySurprise birthDate={userBirthDate} streak={streak} />
      )}
      {pushState !== "loading" && pushState !== "unsupported" && (
        <div className="mb-3 md:mb-4">
          <PushPrompt pushState={pushState} onEnable={requestPush} />
        </div>
      )}

      {/* Two-column: desktop only */}
      <div className="md:grid md:grid-cols-5 md:gap-6">
        {/* Left: Horoscope (3/5 on desktop) */}
        <div className="md:col-span-3">
          {/* Horoscope card — elevated dark card with gold accent */}
          <div className="relative rounded-sm border border-gold/[0.15] bg-[oklch(0.12_0.03_265/0.85)] shadow-[0_0_60px_-20px_oklch(0.74_0.12_78/0.06)] backdrop-blur-md overflow-hidden">
            {/* Subtle top accent line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" aria-hidden />
            <div className="p-5 md:p-7">
              <p className="text-ink text-[20px] md:text-[22px] leading-loose whitespace-pre-line">
                {data.horoscope}
              </p>
              {/* AI transparency label — visible, trustworthy */}
              {data.source && data.source !== "cached" && (
                <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center gap-2">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-gold/50" aria-hidden />
                  <p className="text-ink-dim/50 text-xs">
                    {data.source === "template"
                      ? "Generated from Zi Wei chart template"
                      : "AI-generated — powered by your Zi Wei chart data"}
                  </p>
                </div>
              )}

              {/* Daily Ritual — CHANI-style "prediction → action" loop */}
              <div className="mt-4 rounded-sm border border-jade/[0.12] bg-jade/[0.03] px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-jade/70 mb-1.5">Today&rsquo;s Practice</p>
                <p className="text-ink-muted text-sm leading-relaxed">{ritual}</p>
              </div>

              {/* Yesterday feedback — subtle 👍👎 */}
              <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-4">
                <span className="text-ink-dim/40 text-[11px]">Was yesterday&rsquo;s reading accurate?</span>
                <button
                  className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-ink-dim/50 hover:text-jade hover:bg-jade/[0.06] transition-colors"
                  onClick={() => {/* TODO: POST /api/feedback */}}
                  aria-label="Thumbs up — accurate"
                >👍</button>
                <button
                  className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-xs text-ink-dim/50 hover:text-cinnabar hover:bg-cinnabar/[0.06] transition-colors"
                  onClick={() => {/* TODO: POST /api/feedback */}}
                  aria-label="Thumbs down — not accurate"
                >👎</button>
              </div>
            </div>
          </div>

          {/* Action buttons — clean, unified style */}
          <div className="flex flex-wrap gap-2.5 mt-4">
            <button onClick={handleShare} className="inline-flex items-center gap-1.5 rounded-sm border border-gold/15 bg-gold/[0.04] px-4 py-2 text-xs text-gold/80 hover:bg-gold/[0.08] transition-colors">
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
            <ShareCard horoscopeText={data.horoscope} highlightedStars={data.highlightedStars} date={dateLabel} streak={streak} />
            {chartPalaces.length > 0 && (
              <button onClick={() => setShowChart(!showChart)} className="inline-flex items-center gap-1.5 rounded-sm border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-xs text-ink-dim hover:text-ink-muted hover:bg-white/[0.04] transition-colors">
                <Eye className="h-3.5 w-3.5" />
                {showChart ? "Hide Chart" : "View Chart"}
              </button>
            )}
          </div>

          {/* Highlighted stars — horizontal scrolling cards with brief meaning */}
          {data.highlightedStars && data.highlightedStars.length > 0 && (
            <div className="mt-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-dim/40 mb-1">Active Stars Today</p>
              <p className="text-ink-dim/30 text-[11px] mb-3">Your chart&rsquo;s dominant archetypes shaping today&rsquo;s reading</p>
              <div className="flex gap-3 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] scrollbar-none">
                {data.highlightedStars.map((star) => {
                  const brief = getStarBrief(star);
                  const displayName = formatStarName(star);
                  const keywords = getStarKeywords(star);
                  return (
                    <div
                      key={star}
                      className="shrink-0 rounded-sm border border-gold/[0.10] bg-gold/[0.02] px-4 py-3 min-w-[176px] max-w-[220px]"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold/50 shrink-0" aria-hidden />
                        <span className="font-mono text-[12px] text-gold/85 leading-tight">{displayName}</span>
                      </span>
                      {keywords.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {keywords.slice(0, 3).map((kw) => (
                            <span key={kw} className="inline-block rounded-full border border-gold/[0.08] bg-gold/[0.03] px-2 py-0.5 text-[10px] text-ink-dim/40 font-mono tracking-wider">
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                      {brief && (
                        <p className="mt-2 text-ink-dim/40 text-[10px] leading-relaxed">{brief}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chart (expandable) */}
          {showChart && chartPalaces.length > 0 && (
            <section className="mt-4 card-cosmic p-4">
              <ChartCanvas palaces={chartPalaces} />
            </section>
          )}
        </div>

        {/* Right: Tools (2/5 on desktop) */}
        <aside className="mt-6 md:mt-0 md:col-span-2 space-y-4">
          <Link href="/yearly" className="flex items-center gap-3 rounded-sm border border-white/[0.06] bg-panel/60 px-4 py-3.5 hover:border-gold/15 transition-colors">
            <Calendar className="h-5 w-5 text-gold/60 shrink-0" />
            <div>
              <p className="text-sm font-medium text-ink">Yearly Forecast</p>
              <p className="text-xs text-ink-dim">Career · Love · Wealth · Health</p>
            </div>
          </Link>

          <div className="rounded-sm border border-white/[0.06] bg-panel/60">
            <AskZiwei />
          </div>

          <div className="rounded-sm border border-white/[0.06] bg-panel/60">
            <CompatibilityCheck />
          </div>
        </aside>
      </div>

      <p className="text-ink-dim/20 text-[11px] mt-12 text-center mb-20">
        DestinyBlueprint — Zi Wei Dou Shu Daily
      </p>

      <AppNav />
    </main>
  );
}
