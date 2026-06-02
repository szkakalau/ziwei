"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, TrendingUp, Shield, ArrowRight, Sun, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import StickyUnlockBar from "@/components/landing/StickyUnlockBar";
import { buildPersonalitySnapshot, type PersonalitySnapshot } from "@/lib/personalitySnapshot";
import { startStripeCheckoutFromStored } from "@/lib/startStripeCheckoutFromStored";
import { EMAIL_READING_PRICE_LABEL } from "@/lib/brand";
import { track } from "@/lib/analytics";

type StoredBirth = {
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  location: string;
  allowFallback?: boolean;
};

type ConsultationFocus = "general" | "love" | "career" | "wealth" | "timing";

type StoredConsultation = {
  focusArea: ConsultationFocus;
  question: string;
};

const CONSULTATION_STORAGE_KEY = "db_consultation_v1";

const focusOptions: Array<{ value: ConsultationFocus; label: string; help: string }> = [
  {
    value: "general",
    label: "General reading",
    help: "Best if you want a broad overview of current patterns and next steps.",
  },
  {
    value: "love",
    label: "Love",
    help: "Focus on dating, long-term compatibility, emotional patterns, or marriage.",
  },
  {
    value: "career",
    label: "Career",
    help: "Focus on work direction, strengths, decision-making, and opportunities.",
  },
  {
    value: "wealth",
    label: "Wealth",
    help: "Focus on money habits, earning potential, and timing around finances.",
  },
  {
    value: "timing",
    label: "Timing",
    help: "Focus on current life phase, short-term momentum, and what to prioritize.",
  },
];

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

type ChartMeta = {
  timezone: string;
  latitude: number;
  longitude: number;
  placeLabel: string;
  apparentSolarDate: string;
  apparentSolarTime: string;
  isApproximate?: boolean;
};

function loadMeta(): ChartMeta | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("userChartMeta");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ChartMeta>;
    if (!parsed.apparentSolarDate || !parsed.apparentSolarTime) return null;
    return parsed as ChartMeta;
  } catch {
    return null;
  }
}

function loadConsultation(): StoredConsultation {
  if (typeof window === "undefined") {
    return { focusArea: "general", question: "" };
  }
  const raw = localStorage.getItem(CONSULTATION_STORAGE_KEY);
  if (!raw) {
    return { focusArea: "general", question: "" };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredConsultation>;
    return {
      focusArea:
        parsed.focusArea === "love" ||
        parsed.focusArea === "career" ||
        parsed.focusArea === "wealth" ||
        parsed.focusArea === "timing"
          ? parsed.focusArea
          : "general",
      question: typeof parsed.question === "string" ? parsed.question : "",
    };
  } catch {
    return { focusArea: "general", question: "" };
  }
}

function saveConsultation(next: StoredConsultation) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSULTATION_STORAGE_KEY, JSON.stringify(next));
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
      body: "You set internal standards and improve steadily even without external validation. When you commit, your consistency becomes your advantage.",
    },
    {
      title: "Independent & Selective",
      body: "You prefer a small circle and meaningful commitments over constant social noise. You value quality over quantity, especially with people.",
    },
    {
      title: "Practical Optimizer",
      body: "You instinctively refine systems, habits, and plans until results become predictable. You do not just work hard. You make things work better.",
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
      body: "Your insight works best with boundaries. Limit noise and focus on environments that reward depth.",
    },
    {
      title: "Focus Beats Variety",
      body: "Your results compound when you commit to one lane long enough for mastery to show.",
    },
    {
      title: "Ask For Specific Outcomes",
      body: "You do best when expectations are explicit. Define success early to avoid vague friction.",
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
  const [meta, setMeta] = useState<ChartMeta | null>(null);
  const [focusArea, setFocusArea] = useState<ConsultationFocus>("general");
  const [question, setQuestion] = useState("");
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const structured = useMemo(() => (snapshot ? buildStructured(snapshot) : null), [snapshot]);
  const shouldShowUnknownTimeModule = Boolean(
    birthInput?.allowFallback || meta?.isApproximate,
  );

  useEffect(() => {
    const b = loadBirthInput();
    const c = loadChart();
    const m = loadMeta();
    const consultation = loadConsultation();
    setBirthInput(b);
    setMeta(m);
    setFocusArea(consultation.focusArea);
    setQuestion(consultation.question);
    if (c) {
      setSnapshot(buildPersonalitySnapshot(c));
    }
    track("snapshot_page_view");
  }, []);

  useEffect(() => {
    saveConsultation({ focusArea, question });
  }, [focusArea, question]);

  const startCheckout = useCallback(
    async (source: "main" | "sticky") => {
      const trimmedQuestion = question.trim();
      if (trimmedQuestion.length < 10) {
        setCheckoutError("Please describe what you want help with in at least 10 characters.");
        return;
      }

      setCheckoutError(null);
      setCheckoutPending(true);
      track("cta_email_reading_checkout_click", {
        source,
        focus_area: focusArea,
      });

      try {
        const result = await startStripeCheckoutFromStored({
          focusArea,
          question: trimmedQuestion,
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
    [focusArea, question],
  );

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

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-14 sm:px-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Your Personalized Zi Wei Dou Shu Snapshot
          </h1>
          <p className="mt-3 font-body text-sm text-ink-muted md:text-base">
            Based on your birth data: {birthInput.birthDate} · {birthInput.birthTime} ·{" "}
            {birthInput.location}
          </p>
          {meta && !meta.isApproximate ? (
            <div className="mt-4 mx-auto inline-flex items-center gap-2 rounded-sm border border-gold/25 bg-gold/[0.04] px-4 py-2.5">
              <Clock className="h-4 w-4 shrink-0 text-gold/70" aria-hidden />
              <span className="font-body text-sm text-ink-muted">
                {birthInput.birthDate} {birthInput.birthTime} (local clock)
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gold/50" aria-hidden />
              <Sun className="h-4 w-4 shrink-0 text-gold" aria-hidden />
              <span className="font-body text-sm font-semibold text-ink">
                {meta.apparentSolarDate} {meta.apparentSolarTime} (true solar time)
              </span>
            </div>
          ) : null}
          {meta?.isApproximate ? (
            <div className="mt-4 mx-auto inline-flex items-center gap-2 rounded-sm border border-gold/20 bg-gold/[0.03] px-4 py-2.5">
              <Clock className="h-4 w-4 shrink-0 text-gold/50" aria-hidden />
              <span className="font-body text-sm text-ink-muted">
                {birthInput.birthDate} {birthInput.birthTime} (local clock · approximate chart, no true-solar correction)
              </span>
            </div>
          ) : null}
          <p className="mt-2 font-body text-sm text-ink-muted">
            This free preview is generated from your chart. Your email reading is delivered by email
            by a human within 24-48 hours.
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
            </CardContent>
          </Card>
        </div>

        <div className="mt-10 rounded-sm border border-gold/20 bg-panel/70 p-5 backdrop-blur-sm">
          <h2 className="font-display text-2xl font-semibold text-ink">
            Book Your Personal Email Reading
          </h2>
          <p className="mt-2 font-body text-sm text-ink-muted">
            Tell us what you want help with, then complete checkout. We collect your email securely
            during payment and send your reading within 24-48 hours.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <Label>What should we focus on?</Label>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {focusOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-sm border p-4 transition ${
                      focusArea === option.value
                        ? "border-gold/40 bg-white/[0.05]"
                        : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="focus-area"
                      className="sr-only"
                      checked={focusArea === option.value}
                      onChange={() => setFocusArea(option.value)}
                    />
                    <p className="font-display text-lg font-semibold text-ink">{option.label}</p>
                    <p className="mt-1 font-body text-sm text-ink-muted">{option.help}</p>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="consultation-question">What is your main question?</Label>
              <textarea
                id="consultation-question"
                className="mt-2 min-h-36 w-full rounded-sm border border-white/10 bg-white/[0.03] px-3 py-3 font-body text-sm text-ink outline-none transition placeholder:text-ink-dim focus:border-gold/35"
                maxLength={500}
                placeholder="Example: I want clarity on whether I should stay in my current job, and whether the next 6 months are better for changing direction."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <p className="mt-2 font-body text-xs text-ink-dim">
                Be as specific as you can. This helps us make the email reading more useful.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-sm border border-white/10 bg-white/[0.03] p-4 font-body text-sm text-ink-muted">
              Included: personalized reading by email, chart-based explanation, and focused advice
              around your chosen topic.
            </div>
            <div className="rounded-sm border border-white/10 bg-white/[0.03] p-4 font-body text-sm text-ink-muted">
              Delivery: order confirmation immediately after payment, full reading in 24-48 hours,
              plus 30-day money-back guarantee.
            </div>
          </div>

          {shouldShowUnknownTimeModule ? (
            <div className="mt-5 rounded-sm border border-gold/20 bg-void/50 p-4 font-body text-sm text-ink-muted">
              Unknown birth time is okay. We will note any approximation risk in the final reading.
            </div>
          ) : null}

          <div className="mt-6">
            <Button
              type="button"
              variant="cta"
              className="w-full"
              disabled={checkoutPending}
              onClick={() => void startCheckout("main")}
            >
              {checkoutPending
                ? "Opening secure checkout..."
                : `Continue To Checkout — ${EMAIL_READING_PRICE_LABEL}`}
            </Button>
            <p className="mt-3 font-body text-sm text-ink-muted">
              You&apos;ll enter your email securely at Stripe checkout. We use it to send your order
              confirmation and final reading.
            </p>
          </div>

          {checkoutError ? (
            <p className="mt-4 font-body text-sm text-cinnabar" role="alert">
              {checkoutError}
            </p>
          ) : null}
        </div>
      </main>

      <StickyUnlockBar
        pending={checkoutPending}
        onContinue={() => void startCheckout("sticky")}
        priceLabel={EMAIL_READING_PRICE_LABEL}
      />
    </>
  );
}
