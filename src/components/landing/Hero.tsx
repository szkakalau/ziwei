"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Sparkles, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { normalizeYyyyMmDd, pad24hTime } from "@/lib/birthFormParse";
import { dispatchChartSaved } from "@/lib/chartSavedEvent";
import { track } from "@/lib/analytics";

type StoredBirth = {
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  location: string;
  allowFallback?: boolean;
};

const FORM_CACHE_KEY = "db_hero_form_v1";

function loadFormCache(): {
  year: string; month: string; day: string;
  hour: string; minute: string;
  location: string; gender: "male" | "female";
  unknownTime: boolean;
} {
  if (typeof window === "undefined") {
    return { year: "", month: "", day: "", hour: "", minute: "", location: "", gender: "female", unknownTime: false };
  }
  try {
    const raw = localStorage.getItem(FORM_CACHE_KEY);
    if (!raw) throw new Error("no cache");
    return JSON.parse(raw);
  } catch {
    return { year: "", month: "", day: "", hour: "", minute: "", location: "", gender: "female", unknownTime: false };
  }
}

function saveFormCache(s: ReturnType<typeof loadFormCache>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FORM_CACHE_KEY, JSON.stringify(s));
}

async function geocode(q: string, signal?: AbortSignal): Promise<string[]> {
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`, { signal });
  const data = (await res.json()) as { ok: true; results: Array<{ displayName: string }> } | { ok: false; error: string };
  if (!res.ok || !data.ok) return [];
  return data.results.map((r) => r.displayName).slice(0, 6);
}

async function requestChart(params: {
  birthDate: string; birthTime: string; gender: "male" | "female";
  location: string; allowFallback: boolean;
}): Promise<{ ok: true; chart: unknown; meta?: unknown } | { ok: false; status: number; errorCode: string }> {
  let response: Response;
  try {
    response = await fetch("/api/birth-chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  } catch {
    return { ok: false, status: 0, errorCode: "NETWORK" };
  }
  type ApiOk = { ok: true; chart: unknown; meta?: unknown };
  type ApiErr = { ok: false; error: string };
  let data: ApiOk | ApiErr | null = null;
  try { data = (await response.json()) as ApiOk | ApiErr; } catch { data = null; }
  if (!response.ok || !data || data.ok !== true || (data as ApiOk).chart == null) {
    return { ok: false, status: response.status, errorCode: data && "error" in data ? data.error : "UNKNOWN" };
  }
  return { ok: true, chart: (data as ApiOk).chart, meta: (data as ApiOk).meta };
}

export default function Hero() {
  const router = useRouter();
  const locationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationAbortRef = useRef<AbortController | null>(null);
  const locationCooldownRef = useRef(0);

  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [unknownTime, setUnknownTime] = useState(false);

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationResults, setLocationResults] = useState<string[]>([]);
  const [locationHint, setLocationHint] = useState<string | null>(null);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hydrate from cache
  useEffect(() => {
    const c = loadFormCache();
    setYear(c.year); setMonth(c.month); setDay(c.day);
    setHour(c.hour); setMinute(c.minute);
    setLocation(c.location); setGender(c.gender);
    setUnknownTime(c.unknownTime);
  }, []);

  // Persist to cache
  useEffect(() => {
    saveFormCache({ year, month, day, hour, minute, location, gender, unknownTime });
  }, [year, month, day, hour, minute, location, gender, unknownTime]);

  // Auto-fill year
  useEffect(() => {
    if (typeof window === "undefined" || year) return;
    setYear(String(new Date().getFullYear() - 18));
  }, [year]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (locationTimerRef.current) clearTimeout(locationTimerRef.current);
      locationAbortRef.current?.abort();
    };
  }, []);

  const years = useMemo(() => { const n = new Date().getFullYear(); return Array.from({ length: 100 }, (_, i) => n - i); }, []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const formComplete = Boolean(year && month && day) && (unknownTime || Boolean(hour !== "" && minute !== "")) && Boolean(location.trim().length >= 2);

  async function updateLocation(next: string) {
    setLocation(next);
    setLocationHint(null);
    if (locationTimerRef.current) { clearTimeout(locationTimerRef.current); locationTimerRef.current = null; }
    locationAbortRef.current?.abort();
    if (next.trim().length < 2) { setLocationResults([]); setLocationOpen(false); return; }
    if (Date.now() < locationCooldownRef.current) { setLocationResults([]); setLocationOpen(false); setLocationHint("Location suggestions temporarily unavailable. You can still type your city manually."); return; }
    locationTimerRef.current = setTimeout(async () => {
      const ctrl = new AbortController();
      locationAbortRef.current = ctrl;
      try {
        const names = await geocode(next, ctrl.signal);
        setLocationResults(names);
        setLocationOpen(names.length > 0);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        locationCooldownRef.current = Date.now() + 10000;
        setLocationResults([]); setLocationOpen(false);
        setLocationHint("Location suggestions temporarily unavailable. You can still type your city manually.");
      } finally {
        if (locationAbortRef.current === ctrl) locationAbortRef.current = null;
      }
    }, 250);
  }

  const handleSubmit = useCallback(async () => {
    setError(null);
    setPending(true);
    track("hero_form_submit");

    const birthDate = normalizeYyyyMmDd(`${year}-${month}-${day}`);
    if (!birthDate) { setError("That date doesn't look valid."); setPending(false); return; }
    const safeHour = unknownTime ? "12" : hour;
    const safeMinute = unknownTime ? "0" : minute;
    const birthTime = pad24hTime(`${safeHour}:${String(safeMinute).padStart(2, "0")}`);
    const loc = location.trim();
    if (!loc) { setError("Please enter your birth city & country."); setPending(false); return; }

    const res = await requestChart({ birthDate, birthTime, gender, location: loc, allowFallback: unknownTime });
    if (!res.ok) {
      setError(res.errorCode === "NETWORK" || res.status === 0 ? "Couldn't reach the chart service. Please try again." : "Something went wrong. Please try again.");
      setPending(false);
      return;
    }

    sessionStorage.setItem("userChart", JSON.stringify(res.chart));
    if (res.meta != null) sessionStorage.setItem("userChartMeta", JSON.stringify(res.meta));
    const input: StoredBirth = { birthDate, birthTime, gender, location: loc, allowFallback: unknownTime };
    sessionStorage.setItem("userBirthInput", JSON.stringify(input));
    localStorage.setItem("userBirthInput", JSON.stringify(input));
    dispatchChartSaved();
    track("snapshot_generated");
    router.push("/snapshot");
  }, [year, month, day, hour, minute, location, gender, unknownTime, router]);

  return (
    <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:px-6 sm:pt-24 sm:pb-28 md:pt-32 md:pb-36">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,oklch(0.74_0.12_78/0.04),transparent_50%)]" aria-hidden />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: headline + form */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/[0.10] bg-gold/[0.03] px-4 py-1.5 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-gold/70" aria-hidden />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold/80">Not 1 of 12 Sun Signs</span>
            </div>

            <h1 className="landing-headline mt-6 text-[clamp(1.75rem,5vw,3.25rem)]">
              A daily insight{" "}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10 bg-gradient-to-r from-gold via-gold/90 to-cinnabar bg-clip-text text-transparent">written for you</span>
              </span>,{" "}
              <br className="hidden sm:inline" />
              not 1/12th of the planet.
            </h1>

            <p className="mt-4 max-w-lg font-body text-base leading-relaxed text-ink-muted">
              DestinyBlueprint maps 100+ personality patterns to your exact birth time and location. Every morning you get a personalized reading based on YOUR profile — not a generic paragraph for millions of people.
            </p>

            {/* Social proof inline */}
            <div className="mt-4 flex items-center gap-3">
              <span className="inline-flex gap-0.5 text-gold" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-gold/70" />)}
              </span>
              <span className="font-body text-sm text-ink-dim">4.9 · 12,400+ charts generated</span>
            </div>

            {/* Birth form */}
            <form
              className="mt-8 rounded-sm border border-gold/20 bg-void/70 p-5 backdrop-blur-md sm:p-6"
              onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/70 mb-4">Get Your Free Snapshot · 30 seconds</p>

              {/* Date row */}
              <div className="grid gap-3 sm:grid-cols-4">
                <div>
                  <Label htmlFor="hero-year">Year</Label>
                  <select id="hero-year" className="input-ink mt-1" value={year} onChange={(e) => setYear(e.target.value)}>
                    <option value="">—</option>
                    {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="hero-month">Month</Label>
                  <select id="hero-month" className="input-ink mt-1" value={month} onChange={(e) => setMonth(e.target.value)}>
                    <option value="">—</option>
                    {months.map((m) => <option key={m} value={String(m)}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="hero-day">Day</Label>
                  <select id="hero-day" className="input-ink mt-1" value={day} onChange={(e) => setDay(e.target.value)}>
                    <option value="">—</option>
                    {days.map((d) => <option key={d} value={String(d)}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Gender</Label>
                  <div className="mt-1 flex rounded-sm border border-white/10 overflow-hidden">
                    <button type="button" className={`flex-1 py-1.5 text-xs font-medium transition ${gender === "female" ? "bg-gold/15 text-gold" : "text-ink-dim hover:text-ink"}`} onClick={() => setGender("female")}>♀</button>
                    <button type="button" className={`flex-1 py-1.5 text-xs font-medium transition ${gender === "male" ? "bg-gold/15 text-gold" : "text-ink-dim hover:text-ink"}`} onClick={() => setGender("male")}>♂</button>
                  </div>
                </div>
              </div>

              {/* Time + Location row */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hero-hour">Time</Label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" className="h-3 w-3 accent-gold" checked={unknownTime} onChange={(e) => { setUnknownTime(e.target.checked); if (e.target.checked) { setHour("12"); setMinute("0"); } }} />
                      <span className="font-body text-[10px] text-ink-dim">Unknown</span>
                    </label>
                  </div>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <select id="hero-hour" className="input-ink" value={hour} onChange={(e) => setHour(e.target.value)} disabled={unknownTime}>
                      <option value="">Hr</option>
                      {hours.map((h) => <option key={h} value={String(h)}>{String(h).padStart(2, "0")}</option>)}
                    </select>
                    <select className="input-ink" value={minute} onChange={(e) => setMinute(e.target.value)} disabled={unknownTime}>
                      <option value="">Min</option>
                      {minutes.map((m) => <option key={m} value={String(m)}>{String(m).padStart(2, "0")}</option>)}
                    </select>
                  </div>
                </div>
                <div className="relative">
                  <Label htmlFor="hero-location">Birth Place</Label>
                  <Input
                    id="hero-location"
                    className="mt-1"
                    value={location}
                    onChange={(e) => void updateLocation(e.target.value)}
                    onFocus={() => setLocationOpen(locationResults.length > 0)}
                    onBlur={() => setTimeout(() => setLocationOpen(false), 120)}
                    placeholder="City, Country"
                  />
                  {locationOpen && locationResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-40 mt-1 rounded-sm border border-gold/20 bg-void/98 shadow-panel backdrop-blur-md">
                      <ul className="max-h-44 overflow-auto py-1">
                        {locationResults.map((name) => (
                          <li key={name}>
                            <button type="button" className="w-full px-3 py-2 text-left font-body text-sm text-ink-muted hover:bg-white/5 hover:text-ink"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => { setLocation(name); setLocationOpen(false); }}>
                              {name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {locationHint && <p className="mt-2 font-body text-xs text-ink-dim" role="status">{locationHint}</p>}
              {error && <p className="mt-3 font-body text-sm text-cinnabar" role="alert">{error}</p>}

              <Button type="submit" variant="cta" className="w-full mt-5" disabled={!formComplete || pending}>
                {pending ? "Generating…" : "See My Free Snapshot →"}
              </Button>

              <p className="mt-3 flex items-center gap-1.5 justify-center font-body text-xs text-ink-dim">
                <Lock className="h-3 w-3" aria-hidden />
                100% private · No signup · No credit card
              </p>
            </form>
          </div>

          {/* Right: chart preview image */}
          <div className="hidden lg:flex lg:items-center lg:justify-center">
            <div className="overflow-hidden rounded-sm border border-white/[0.06] bg-void/60">
              <Image
                src="/images/destiny-chart-preview.jpg"
                alt="Zi Wei Dou Shu birth chart showing 12 palaces and 100+ stars"
                width={800}
                height={600}
                className="block w-full max-w-md object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
