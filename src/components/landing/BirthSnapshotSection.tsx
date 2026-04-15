"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, TrendingUp, Shield, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  normalizeYyyyMmDd,
  pad24hTime,
} from "@/lib/birthFormParse";
import { dispatchChartSaved } from "@/lib/chartSavedEvent";
import {
  buildPersonalitySnapshot,
  type PersonalitySnapshot,
} from "@/lib/personalitySnapshot";
import StickyUnlockBar from "@/components/landing/StickyUnlockBar";
import { startStripeCheckoutFromStored } from "@/lib/startStripeCheckoutFromStored";
import { track } from "@/lib/analytics";

type StoredBirth = {
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  location: string;
  allowFallback?: boolean;
};

type Step = 1 | 2 | 3;

const STORAGE_KEY = "db_step_form_v1";

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function loadChartFromStorage(): unknown | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem("userChart");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function loadFormCache(): {
  step: Step;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  location: string;
} {
  if (typeof window === "undefined") {
    return {
      step: 1,
      year: "",
      month: "",
      day: "",
      hour: "",
      minute: "",
      location: "",
    };
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {
      step: 1,
      year: "",
      month: "",
      day: "",
      hour: "",
      minute: "",
      location: "",
    };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<ReturnType<typeof loadFormCache>>;
    const step: Step =
      parsed.step === 2 || parsed.step === 3 ? parsed.step : 1;
    return {
      step,
      year: typeof parsed.year === "string" ? parsed.year : "",
      month: typeof parsed.month === "string" ? parsed.month : "",
      day: typeof parsed.day === "string" ? parsed.day : "",
      hour: typeof parsed.hour === "string" ? parsed.hour : "",
      minute: typeof parsed.minute === "string" ? parsed.minute : "",
      location: typeof parsed.location === "string" ? parsed.location : "",
    };
  } catch {
    return {
      step: 1,
      year: "",
      month: "",
      day: "",
      hour: "",
      minute: "",
      location: "",
    };
  }
}

function saveFormCache(next: ReturnType<typeof loadFormCache>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

async function geocode(q: string): Promise<string[]> {
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
  const data = (await res.json()) as
    | { ok: true; results: Array<{ displayName: string }> }
    | { ok: false; error: string };
  if (!res.ok || !data.ok) return [];
  return data.results.map((r) => r.displayName).slice(0, 6);
}

async function requestChart(params: {
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  location: string;
  allowFallback: boolean;
}): Promise<
  | { ok: true; chart: unknown; meta?: unknown }
  | { ok: false; status: number; errorCode: string }
> {
  const response = await fetch("/api/birth-chart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  type ApiOk = { ok: true; chart: unknown; meta?: unknown };
  type ApiErr = { ok: false; error: string };
  type ApiUnknown = { ok?: boolean; error?: string; chart?: unknown; meta?: unknown };

  let data: ApiOk | ApiErr | ApiUnknown | null = null;
  try {
    data = (await response.json()) as ApiOk | ApiErr | ApiUnknown;
  } catch {
    data = null;
  }

  if (!response.ok || !data || data.ok !== true || data.chart == null) {
    const code =
      data && "error" in data && typeof data.error === "string" ? data.error : "";
    return { ok: false, status: response.status, errorCode: code || "UNKNOWN" };
  }

  return { ok: true, chart: data.chart, meta: data.meta };
}

function buildStructured(snapshot: PersonalitySnapshot) {
  const seed = `${snapshot.soulPalaceLabel} ${snapshot.highlightedStars.join(" ")} ${snapshot.personality}`;
  const h = hashString(seed);

  const coreTraitsPool = [
    {
      title: "Long-Range Thinker",
      body: "You naturally plan ahead and prefer clarity over chaos when making decisions.",
    },
    {
      title: "Pattern Spotter",
      body: "You notice signals and themes other people miss, especially in people and timing.",
    },
    {
      title: "Quietly Competitive",
      body: "You set internal standards and improve steadily—even without external validation.",
    },
    {
      title: "Independent & Selective",
      body: "You prefer a small circle and meaningful commitments over constant social noise.",
    },
    {
      title: "Practical Optimizer",
      body: "You instinctively refine systems, habits, and plans until results become predictable.",
    },
    {
      title: "High Standards",
      body: "You care about competence and fairness, and you get sharp when things feel sloppy.",
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

export default function BirthSnapshotSection() {
  const router = useRouter();
  const resultRef = useRef<HTMLDivElement>(null);
  const [snapshot, setSnapshot] = useState<PersonalitySnapshot | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>(1);
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [location, setLocation] = useState("");
  const [unknownTime, setUnknownTime] = useState(false);

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationResults, setLocationResults] = useState<string[]>([]);

  useEffect(() => {
    const cached = loadFormCache();
    setStep(cached.step);
    setYear(cached.year);
    setMonth(cached.month);
    setDay(cached.day);
    setHour(cached.hour);
    setMinute(cached.minute);
    setLocation(cached.location);
  }, []);

  useEffect(() => {
    saveFormCache({ step, year, month, day, hour, minute, location });
  }, [step, year, month, day, hour, minute, location]);

  useEffect(() => {
    track("form_step_view", { step });
  }, [step]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (year) return;
    const now = new Date().getFullYear();
    setYear(String(now - 18));
  }, [year]);

  const refreshSnapshotFromStorage = useCallback(() => {
    const chart = loadChartFromStorage();
    if (chart) {
      setSnapshot(buildPersonalitySnapshot(chart));
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  useEffect(() => {
    refreshSnapshotFromStorage();
  }, [refreshSnapshotFromStorage]);

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const arr: number[] = [];
    for (let y = now; y >= now - 100; y--) arr.push(y);
    return arr;
  }, []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const step1Complete = Boolean(year && month && day);
  const step2Complete = unknownTime || Boolean(hour !== "" && minute !== "");
  const step3Complete = Boolean(location.trim().length >= 2);

  async function updateLocation(next: string) {
    setLocation(next);
    const q = next.trim();
    if (q.length < 2) {
      setLocationResults([]);
      setLocationOpen(false);
      return;
    }
    try {
      const names = await geocode(q);
      setLocationResults(names);
      setLocationOpen(names.length > 0);
    } catch {
      setLocationResults([]);
      setLocationOpen(false);
    }
  }

  async function handleGenerate() {
    setError(null);
    setPending(true);
    track("form_generate_snapshot_click");

    const birthDate = normalizeYyyyMmDd(`${year}-${month}-${day}`);
    if (!birthDate) {
      setError("That date doesn't look valid. Double-check and try again.");
      track("form_generate_snapshot_error", { reason: "invalid_date" });
      setPending(false);
      return;
    }
    const safeHour = unknownTime ? "12" : hour;
    const safeMinute = unknownTime ? "0" : minute;
    const birthTime = pad24hTime(
      `${safeHour}:${String(safeMinute).padStart(2, "0")}`,
    );
    const loc = location.trim();
    if (!loc) {
      setError("Please enter your birth city & country.");
      track("form_generate_snapshot_error", { reason: "missing_location" });
      setPending(false);
      return;
    }

    try {
      const res = await requestChart({
        birthDate,
        birthTime,
        gender: "male",
        location: loc,
        allowFallback: unknownTime,
      });
      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        track("form_generate_snapshot_error", { reason: "api_error", status: res.status });
        setPending(false);
        return;
      }

      sessionStorage.setItem("userChart", JSON.stringify(res.chart));
      if (res.meta != null) {
        sessionStorage.setItem("userChartMeta", JSON.stringify(res.meta));
      }

      const birthInput: StoredBirth = {
        birthDate,
        birthTime,
        gender: "male",
        location: loc,
        allowFallback: unknownTime,
      };
      sessionStorage.setItem("userBirthInput", JSON.stringify(birthInput));
      localStorage.setItem("userBirthInput", JSON.stringify(birthInput));
      dispatchChartSaved();
      track("snapshot_generated");
      refreshSnapshotFromStorage();
      setPending(false);
      router.push("/snapshot");
    } catch {
      setError("Network error. Please try again.");
      track("form_generate_snapshot_error", { reason: "network_error" });
      setPending(false);
    }
  }

  const structured = snapshot ? buildStructured(snapshot) : null;

  async function handleUnlock() {
    setCheckoutError(null);
    setCheckoutPending(true);
    track("cta_unlock_full_report_click");
    try {
      const result = await startStripeCheckoutFromStored();
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
  }

  return (
    <section
      id="birth-form"
      className="relative scroll-mt-28 border-y border-white/10 bg-gradient-to-b from-void/40 via-mist/25 to-void/30 py-20 md:py-28"
    >
      <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        {!snapshot ? (
          <>
            <div className="text-center">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                Get Your Free Personality Snapshot — No Signup Required
              </h2>
              <p className="mt-3 font-body text-base text-ink-muted md:text-lg">
                Takes less than 60 seconds to generate your personalized Zi Wei chart
              </p>
            </div>

            <div className="sticky top-16 z-30 mt-8 rounded-sm border border-gold/20 bg-void/70 p-4 backdrop-blur-md sm:top-20">
              <p className="font-body text-sm text-ink-muted">
                ✅ Fill in 3 steps → Get your FREE personalized Zi Wei personality snapshot instantly
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div
                  className={`rounded-sm border px-3 py-2 text-xs font-mono uppercase tracking-widest ${
                    step === 1
                      ? "border-gold/40 bg-white/[0.04] text-ink"
                      : "border-white/10 text-ink-dim"
                  }`}
                >
                  Step 1: Birth Date
                </div>
                <div
                  className={`rounded-sm border px-3 py-2 text-xs font-mono uppercase tracking-widest ${
                    step === 2
                      ? "border-gold/40 bg-white/[0.04] text-ink"
                      : "border-white/10 text-ink-dim"
                  }`}
                >
                  Step 2: Birth Time
                </div>
                <div
                  className={`rounded-sm border px-3 py-2 text-xs font-mono uppercase tracking-widest ${
                    step === 3
                      ? "border-gold/40 bg-white/[0.04] text-ink"
                      : "border-white/10 text-ink-dim"
                  }`}
                >
                  Step 3: Birth Place
                </div>
              </div>
              <p className="mt-3 font-body text-sm text-ink-muted">
                🔒 100% Private · No signup required · We never share your birth data
              </p>
            </div>

            <Card className="mt-10 overflow-hidden border-gold/25 bg-void/60">
              <CardHeader className="border-b border-white/10 bg-gradient-to-r from-void/60 via-transparent to-jade-dim/20">
                <div className="flex items-end justify-between gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold/90">
                    Step {step} of 3
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">
                    ~60 sec · private
                  </p>
                </div>
                <CardTitle className="mt-2 text-2xl">
                  {step === 1
                    ? "Step 1: Enter Your Birth Date"
                    : step === 2
                      ? "Step 2: Enter Your Birth Time"
                      : "Step 3: Enter Your Birth Place"}
                </CardTitle>
                {step === 1 ? (
                  <p className="mt-2 font-body text-sm text-ink-muted">
                    Your birth date is the foundation of your Zi Wei chart
                  </p>
                ) : null}
                {step === 2 ? (
                  <p className="mt-2 font-body text-sm text-ink-muted">
                    Exact birth time gives you the most accurate chart, same as our paid report
                  </p>
                ) : null}
                {step === 3 ? (
                  <p className="mt-2 font-body text-sm text-ink-muted">
                    We use your birth place to calculate your exact apparent solar time for your chart
                  </p>
                ) : null}
              </CardHeader>
              <CardContent className="p-6">
                {step === 1 ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Label htmlFor="birth-year">Year</Label>
                        <select
                          id="birth-year"
                          className="input-ink mt-1.5"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                        >
                          <option value="">Select</option>
                          {years.map((y) => (
                            <option key={y} value={String(y)}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="birth-month">Month</Label>
                        <select
                          id="birth-month"
                          className="input-ink mt-1.5"
                          value={month}
                          onChange={(e) => setMonth(e.target.value)}
                        >
                          <option value="">Select</option>
                          {months.map((m) => (
                            <option key={m} value={String(m)}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="birth-day">Day</Label>
                        <select
                          id="birth-day"
                          className="input-ink mt-1.5"
                          value={day}
                          onChange={(e) => setDay(e.target.value)}
                        >
                          <option value="">Select</option>
                          {days.map((d) => (
                            <option key={d} value={String(d)}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="cta"
                      className="w-full"
                      disabled={!step1Complete}
                      onClick={() => {
                        track("form_step_next_click", { from: 1, to: 2 });
                        setStep(2);
                      }}
                    >
                      Next → Tell Me My Birth Time{" "}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 rounded-sm border border-white/10 bg-white/[0.03] p-4">
                      <input
                        id="unknown-birth-time"
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-gold"
                        checked={unknownTime}
                        onChange={(e) => {
                          const next = e.target.checked;
                          setUnknownTime(next);
                          track("form_birth_time_unknown_toggle", { checked: next });
                          if (next) {
                            setHour("12");
                            setMinute("0");
                          }
                        }}
                      />
                      <div>
                        <Label htmlFor="unknown-birth-time">
                          I don&apos;t know my exact birth time
                        </Label>
                        <p className="mt-1 font-body text-xs text-ink-muted">
                          We&apos;ll generate your chart with standard noon time, and note the full
                          adjustments in your paid report.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="birth-hour">Hour</Label>
                        <select
                          id="birth-hour"
                          className="input-ink mt-1.5"
                          value={hour}
                          onChange={(e) => setHour(e.target.value)}
                          disabled={unknownTime}
                        >
                          <option value="">Select</option>
                          {hours.map((h) => (
                            <option key={h} value={String(h)}>
                              {String(h).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="birth-minute">Minute</Label>
                        <select
                          id="birth-minute"
                          className="input-ink mt-1.5"
                          value={minute}
                          onChange={(e) => setMinute(e.target.value)}
                          disabled={unknownTime}
                        >
                          <option value="">Select</option>
                          {minutes.map((m) => (
                            <option key={m} value={String(m)}>
                              {String(m).padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="cta"
                      className="w-full"
                      disabled={!step2Complete}
                      onClick={() => {
                        track("form_step_next_click", { from: 2, to: 3, unknownTime });
                        setStep(3);
                      }}
                    >
                      Next → Enter My Birth Place{" "}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Button>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Label htmlFor="birth-location">Birth City &amp; Country</Label>
                      <Input
                        id="birth-location"
                        className="mt-1.5"
                        value={location}
                        onChange={(e) => void updateLocation(e.target.value)}
                        onFocus={() => setLocationOpen(locationResults.length > 0)}
                        onBlur={() => setTimeout(() => setLocationOpen(false), 120)}
                        placeholder="e.g. New York, USA"
                      />
                      {locationOpen && locationResults.length ? (
                        <div className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-sm border border-gold/20 bg-void/98 shadow-panel backdrop-blur-md">
                          <ul className="max-h-44 overflow-auto py-1">
                            {locationResults.map((name) => (
                              <li key={name}>
                                <button
                                  type="button"
                                  className="w-full px-3 py-2 text-left font-body text-sm text-ink-muted hover:bg-white/5 hover:text-ink"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setLocation(name);
                                    setLocationOpen(false);
                                  }}
                                >
                                  {name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                    </div>

                    {error ? (
                      <p className="font-body text-sm text-cinnabar" role="alert">
                        {error}
                      </p>
                    ) : null}

                    <Button
                      type="button"
                      variant="cta"
                      className="w-full"
                      disabled={!step3Complete || pending}
                      onClick={() => void handleGenerate()}
                    >
                      {pending
                        ? "Generating…"
                        : "Generate My FREE Snapshot Now · No Signup Required"}
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <div className="mt-6 rounded-sm border border-white/10 bg-void/60 p-4 backdrop-blur-sm">
              <p className="font-body text-sm text-ink-muted">
                ★★★★★ &quot;Took 30 seconds, and the free snapshot was scarily accurate&quot; — Early Reader
              </p>
              <p className="mt-2 font-body text-sm text-ink-muted">
                🛡️ 30-Day Money-Back Guarantee on all full reports
              </p>
            </div>
          </>
        ) : null}

        {snapshot && structured ? (
          <div ref={resultRef} className="mt-8">
            <div className="text-center">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
                Your Personalized Personality Snapshot
              </h2>
              <p className="mt-3 font-body text-base text-ink-muted md:text-lg">
                Based on your Zi Wei Dou Shu birth chart
              </p>
            </div>

            <div className="mt-10 grid gap-6">
              <Card className="border-gold/20 bg-void/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Core Traits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {structured.coreTraits.map((t) => (
                    <div key={t.title} className="rounded-sm border border-white/10 bg-white/[0.03] p-4">
                      <p className="font-display text-lg font-semibold text-ink">
                        {t.title}
                      </p>
                      <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
                        {t.body}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-gold/20 bg-void/70">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl">Your Key Strengths</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  {structured.strengths.map((s) => (
                    <div key={s.title} className="rounded-sm border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center gap-2">
                        <s.icon className="h-4 w-4 text-gold" aria-hidden />
                        <p className="font-display text-base font-semibold text-ink">
                          {s.title}
                        </p>
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
                  <CardTitle className="text-xl">Your Growth Areas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {structured.growthAreas.map((g) => (
                    <div key={g.title} className="rounded-sm border border-white/10 bg-white/[0.03] p-4">
                      <p className="font-display text-lg font-semibold text-ink">
                        {g.title}
                      </p>
                      <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
                        {g.body}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="mt-10 rounded-sm border border-white/10 bg-panel/60 p-5 backdrop-blur-sm">
              <p className="font-body text-sm text-ink-muted">
                Unlock your full 12-palace report, 10-year cycle forecast and more for just $9
              </p>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="cta"
                  className="w-full"
                  disabled={checkoutPending}
                  onClick={() => void handleUnlock()}
                >
                  Unlock Full Report Now · 30-Day Guarantee
                </Button>
              </div>
              {checkoutError ? (
                <p className="mt-4 font-body text-sm text-cinnabar" role="alert">
                  {checkoutError}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {snapshot ? (
        <StickyUnlockBar
          pending={checkoutPending}
          onUnlock={() => void handleUnlock()}
        />
      ) : null}
    </section>
  );
}

