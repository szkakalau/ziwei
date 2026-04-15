"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, TrendingUp, Shield, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StickyUnlockBar from "@/components/landing/StickyUnlockBar";
import { buildPersonalitySnapshot, type PersonalitySnapshot } from "@/lib/personalitySnapshot";
import { startStripeCheckoutFromStored } from "@/lib/startStripeCheckoutFromStored";
import { FULL_REPORT_PRICE_LABEL } from "@/lib/brand";
import { track } from "@/lib/analytics";

type StoredBirth = {
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  location: string;
  allowFallback?: boolean;
};

const OFFER_STORAGE_KEY = "db_offer_start_at_v1";
const OFFER_SHOWN_EXIT_KEY = "db_offer_exit_shown_v1";
const OFFER_DURATION_MS = 15 * 60 * 1000;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function loadBirthInput(): StoredBirth | null {
  if (typeof window === "undefined") return null;
  const raw =
    sessionStorage.getItem("userBirthInput") ?? localStorage.getItem("userBirthInput");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredBirth;
  } catch {
    return null;
  }
}

function loadChart(): unknown | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("userChart");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function loadMeta(): { isApproximate?: boolean } | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("userChartMeta");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { isApproximate?: boolean };
  } catch {
    return null;
  }
}

function formatMmSs(ms: number) {
  const clamped = Math.max(0, ms);
  const total = Math.floor(clamped / 1000);
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function getOfferStartAt(): number | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(OFFER_STORAGE_KEY);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function ensureOfferStartAt(): number {
  const existing = getOfferStartAt();
  if (existing) return existing;
  const now = Date.now();
  localStorage.setItem(OFFER_STORAGE_KEY, String(now));
  return now;
}

function offerIsActive(startAt: number, now: number) {
  if (!Number.isFinite(startAt)) return false;
  if (startAt > now + 30_000) return false;
  return now - startAt < OFFER_DURATION_MS;
}

function buildStructured(snapshot: PersonalitySnapshot) {
  const seed = `${snapshot.soulPalaceLabel} ${snapshot.highlightedStars.join(" ")} ${snapshot.personality}`;
  const h = hashString(seed);

  const coreTraitsPool = [
    {
      title: "Strategic & Analytical Thinker",
      body: "You are naturally wired to plan for the long term, rather than acting on impulse. You often find that your decisions pay off later in life, even if they don't get immediate recognition.",
    },
    {
      title: "Pattern Spotter",
      body: "You notice signals and themes other people miss, especially in people and timing. This gives you an edge when choosing who to trust and when to move.",
    },
    {
      title: "Quietly Competitive",
      body: "You set internal standards and improve steadily—even without external validation. When you commit, your consistency becomes your advantage.",
    },
    {
      title: "Independent & Selective",
      body: "You prefer a small circle and meaningful commitments over constant social noise. You value quality over quantity—especially with people.",
    },
    {
      title: "Practical Optimizer",
      body: "You instinctively refine systems, habits, and plans until results become predictable. You don't just work hard—you make things work better.",
    },
    {
      title: "High Standards",
      body: "You care about competence and fairness, and you get sharp when things feel sloppy. You often end up raising the bar for your environment.",
    },
  ];

  const strengthsPool = [
    { title: "Staying Power", icon: Shield, body: snapshot.hiddenStrength },
    { title: "Momentum", icon: TrendingUp, body: snapshot.careerHint },
    { title: "Self-Insight", icon: Sparkles, body: snapshot.personality },
  ];

  const growthAreasPool = [
    {
      title: "Avoid Overthinking Loops",
      body: "When options multiply, choose a simple next step and let action create clarity.",
    },
    {
      title: "Protect Your Energy",
      body: "Your insight works best with boundaries—limit noise, focus on environments that reward depth.",
    },
    {
      title: "Focus Beats Variety",
      body: "Your results compound when you commit to one lane long enough for mastery to show.",
    },
    {
      title: "Ask For Specific Outcomes",
      body: "You do best when expectations are explicit—define success early to avoid vague friction.",
    },
  ];

  const coreTraits = [
    coreTraitsPool[h % coreTraitsPool.length],
    coreTraitsPool[(h + 2) % coreTraitsPool.length],
    coreTraitsPool[(h + 4) % coreTraitsPool.length],
  ];
  const growthAreas = [
    growthAreasPool[h % growthAreasPool.length],
    growthAreasPool[(h + 1) % growthAreasPool.length],
  ];

  return { coreTraits, strengths: strengthsPool, growthAreas };
}

export default function SnapshotClient() {
  const router = useRouter();
  const [birthInput, setBirthInput] = useState<StoredBirth | null>(null);
  const [snapshot, setSnapshot] = useState<PersonalitySnapshot | null>(null);
  const [meta, setMeta] = useState<{ isApproximate?: boolean } | null>(null);

  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [offerStartAt, setOfferStartAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [exitOpen, setExitOpen] = useState(false);

  const structured = useMemo(() => (snapshot ? buildStructured(snapshot) : null), [snapshot]);

  const offer = useMemo(() => {
    if (!offerStartAt) return { active: false, remainingMs: 0 };
    const active = offerIsActive(offerStartAt, now);
    const remainingMs = active ? Math.max(0, OFFER_DURATION_MS - (now - offerStartAt)) : 0;
    return { active, remainingMs };
  }, [offerStartAt, now]);

  const shouldShowUnknownTimeModule = Boolean(
    birthInput?.allowFallback || meta?.isApproximate,
  );

  useEffect(() => {
    const b = loadBirthInput();
    const c = loadChart();
    const m = loadMeta();
    setBirthInput(b);
    setMeta(m);
    if (c) {
      setSnapshot(buildPersonalitySnapshot(c));
    }
    if (typeof window !== "undefined") {
      setOfferStartAt(ensureOfferStartAt());
    }
    track("snapshot_page_view");
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const startCheckout = useCallback(
    async (source: "main" | "sticky" | "discount" | "exit") => {
      setCheckoutError(null);
      setCheckoutPending(true);
      track("cta_unlock_full_report_click", {
        source,
        offer_active: offer.active,
      });
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("checkoutOffer", JSON.stringify({ offerStartAt }));
        }
        const result = await startStripeCheckoutFromStored({
          offerStartAt: offerStartAt ?? undefined,
        });
        if (!result.ok) {
          setCheckoutError(result.message);
          setCheckoutPending(false);
          return;
        }
        window.location.href = result.url;
      } catch {
        setCheckoutError("Network error. Please try again.");
        setCheckoutPending(false);
      }
    },
    [offer.active, offerStartAt],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shown = localStorage.getItem(OFFER_SHOWN_EXIT_KEY) === "true";
    if (shown) return;
    if (!offer.active) return;

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY > 0) return;
      localStorage.setItem(OFFER_SHOWN_EXIT_KEY, "true");
      track("exit_offer_shown", { trigger: "mouseleave" });
      setExitOpen(true);
    };
    const onVisibility = () => {
      if (document.visibilityState !== "hidden") return;
      if (localStorage.getItem(OFFER_SHOWN_EXIT_KEY) === "true") return;
      localStorage.setItem(OFFER_SHOWN_EXIT_KEY, "true");
      track("exit_offer_shown", { trigger: "visibilitychange" });
      setExitOpen(true);
    };

    window.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [offer.active]);

  if (!birthInput || !snapshot || !structured) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Your Free Snapshot
        </h1>
        <p className="mt-3 font-body text-base text-ink-muted">
          We couldn&apos;t find your chart data. Please generate your snapshot from the form first.
        </p>
        <div className="mt-8">
          <Button type="button" variant="cta" onClick={() => router.push("/#birth-form")}>
            Go to Birth Form <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </main>
    );
  }

  const discountedPriceLabel = "$4.99";

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-14 sm:px-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Your Personalized Zi Wei Dou Shu Personality Snapshot
          </h1>
          <p className="mt-3 font-body text-sm text-ink-muted md:text-base">
            Based on your birth data: {birthInput.birthDate} · {birthInput.birthTime} ·{" "}
            {birthInput.location}
          </p>
          <p className="mt-2 font-body text-sm text-ink-muted">
            Generated at: {new Date().toLocaleString()}
          </p>
        </div>

        <div className="mt-10 grid gap-6">
          <Card className="border-gold/20 bg-void/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Your Core Personality Traits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {structured.coreTraits.map((t) => (
                <div key={t.title} className="rounded-sm border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-display text-lg font-semibold text-ink">{t.title}</p>
                  <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">{t.body}</p>
                </div>
              ))}
              <p className="pt-1 font-body text-sm text-ink-muted">
                This is just a 10% preview of your full personality analysis. Unlock your complete
                strengths, blind spots, and hidden talents in your full report.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gold/20 bg-void/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Strengths Preview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {structured.strengths.map((s) => (
                <div key={s.title} className="rounded-sm border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2">
                    <s.icon className="h-4 w-4 text-gold" aria-hidden />
                    <p className="font-display text-base font-semibold text-ink">{s.title}</p>
                  </div>
                  <p className="mt-2 line-clamp-4 font-body text-sm leading-relaxed text-ink-muted">
                    {s.body}
                  </p>
                </div>
              ))}
              <p className="md:col-span-3 pt-1 font-body text-sm text-ink-muted">
                Your full report explains where these strengths come from in your chart—and how to
                use them in relationships, work, and timing.
              </p>
            </CardContent>
          </Card>

          <Card className="border-gold/20 bg-void/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Growth Areas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {structured.growthAreas.map((g) => (
                <div key={g.title} className="rounded-sm border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-display text-lg font-semibold text-ink">{g.title}</p>
                  <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">{g.body}</p>
                </div>
              ))}
              <p className="pt-1 font-body text-sm text-ink-muted">
                Unlock your full report to see your 12 life palaces line-by-line, plus your 10-year
                destiny cycles and relationship patterns.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 rounded-sm border border-white/10 bg-panel/60 p-5 backdrop-blur-sm">
          <h2 className="font-display text-2xl font-semibold text-ink">
            What You&apos;ll Unlock In Your Full Report
          </h2>
          <p className="mt-2 font-body text-sm text-ink-muted">
            Your free snapshot only covers the tip of your Zi Wei chart. Unlock the rest instantly.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-sm border border-white/10 bg-white/[0.03] p-4 font-body text-sm text-ink-muted">
              ✅ 3 Core Personality Traits
            </div>
            <div className="rounded-sm border border-gold/20 bg-white/[0.04] p-4 font-body text-sm text-ink">
              🔓 Full 12 Life Palaces Line-by-Line Analysis
            </div>

            <div className="rounded-sm border border-white/10 bg-white/[0.03] p-4 font-body text-sm text-ink-muted">
              ✅ Partial Strengths Preview
            </div>
            <div className="rounded-sm border border-gold/20 bg-white/[0.04] p-4 font-body text-sm text-ink">
              🔓 Complete Strengths + Blind Spots Deep Dive
            </div>

            <div className="rounded-sm border border-white/10 bg-white/[0.03] p-4 font-body text-sm text-ink-muted">
              ✅ Basic Personality Snapshot
            </div>
            <div className="rounded-sm border border-gold/20 bg-white/[0.04] p-4 font-body text-sm text-ink">
              🔓 Full 10-Year Destiny Cycle Forecast
            </div>

            <div className="rounded-sm border border-white/10 bg-white/[0.03] p-4 font-body text-sm text-ink-muted">
              ❌ No Relationship Insights
            </div>
            <div className="rounded-sm border border-gold/20 bg-white/[0.04] p-4 font-body text-sm text-ink">
              🔓 Love & Relationship Pattern Full Breakdown
            </div>

            <div className="rounded-sm border border-white/10 bg-white/[0.03] p-4 font-body text-sm text-ink-muted">
              ❌ No Career Guidance
            </div>
            <div className="rounded-sm border border-gold/20 bg-white/[0.04] p-4 font-body text-sm text-ink">
              🔓 Career & Wealth Potential Complete Analysis
            </div>

            <div className="rounded-sm border border-white/10 bg-white/[0.03] p-4 font-body text-sm text-ink-muted">
              ❌ No Downloadable Report
            </div>
            <div className="rounded-sm border border-gold/20 bg-white/[0.04] p-4 font-body text-sm text-ink">
              🔓 Downloadable Full PDF Report
            </div>
          </div>

          <div className="mt-6">
            <Button
              type="button"
              variant="cta"
              className="w-full"
              disabled={checkoutPending}
              onClick={() => void startCheckout("main")}
            >
              Unlock My Full Report Now — Only {FULL_REPORT_PRICE_LABEL}
            </Button>
            <p className="mt-3 font-body text-sm text-ink-muted">
              ✅ 30-Day No-Questions-Asked Money-Back Guarantee · If it doesn&apos;t resonate, we&apos;ll
              refund you 100%
            </p>
          </div>

          {checkoutError ? (
            <p className="mt-4 font-body text-sm text-cinnabar" role="alert">
              {checkoutError}
            </p>
          ) : null}
        </div>

        {shouldShowUnknownTimeModule ? (
          <div className="mt-10 rounded-sm border border-gold/20 bg-void/70 p-5">
            <h3 className="font-display text-xl font-semibold text-ink">We&apos;ve Got You Covered</h3>
            <p className="mt-2 font-body text-sm text-ink-muted">
              Your full report includes a complete guide to adjusting your chart for unknown birth
              times, plus a breakdown of the most likely patterns for your birth date and place.
              Unlock it now.
            </p>
            <div className="mt-4">
              <Button
                type="button"
                variant="cta"
                className="w-full"
                disabled={checkoutPending}
                onClick={() => void startCheckout("main")}
              >
                Unlock My Full Report
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-10 rounded-sm border border-white/10 bg-panel/60 p-5 backdrop-blur-sm">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Exclusive First-Time User Offer
          </h2>
          <p className="mt-2 font-body text-sm text-ink-muted">
            Unlock your full report within the next 15 minutes, and get 50% OFF — only {discountedPriceLabel}{" "}
            (regular {FULL_REPORT_PRICE_LABEL})
          </p>
          <div className="mt-4 flex items-center justify-between rounded-sm border border-white/10 bg-white/[0.03] p-4">
            <p className="font-mono text-sm uppercase tracking-widest text-ink-dim">
              Time left
            </p>
            <p className="font-mono text-2xl font-semibold text-ink">
              {offer.active ? formatMmSs(offer.remainingMs) : "00:00"}
            </p>
          </div>
          <div className="mt-4">
            <Button
              type="button"
              variant="cta"
              className="w-full"
              disabled={checkoutPending || !offer.active}
              onClick={() => void startCheckout("discount")}
            >
              {offer.active
                ? `Claim My 50% OFF Now · Only ${discountedPriceLabel}`
                : "Offer expired · Unlock full report"}
            </Button>
            <p className="mt-3 font-body text-sm text-ink-muted">
              *Offer expires when the timer hits zero. 30-day money-back guarantee still applies.*
            </p>
          </div>
        </div>

        {exitOpen ? (
          <div
            className="fixed inset-0 z-[60] grid place-items-center bg-black/60 px-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-full max-w-lg rounded-sm border border-gold/20 bg-void/95 p-6 shadow-panel">
              <h3 className="font-display text-2xl font-semibold text-ink">
                Wait! Don&apos;t Miss Your 50% OFF Offer
              </h3>
              <p className="mt-2 font-body text-sm text-ink-muted">
                Get your full personalized Zi Wei Dou Shu report for only {discountedPriceLabel} (regular{" "}
                {FULL_REPORT_PRICE_LABEL}) — 30-day money-back guarantee, no questions asked.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="cta"
                  disabled={checkoutPending || !offer.active}
                  onClick={() => {
                    track("exit_offer_primary_click");
                    void startCheckout("exit");
                  }}
                >
                  Claim My 50% OFF Now
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    track("exit_offer_secondary_click");
                    setExitOpen(false);
                  }}
                >
                  No Thanks, I&apos;ll Pass
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      <StickyUnlockBar
        pending={checkoutPending}
        onUnlock={() => void startCheckout("sticky")}
        priceLabel={FULL_REPORT_PRICE_LABEL}
      />
    </>
  );
}

