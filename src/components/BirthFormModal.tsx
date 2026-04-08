"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  isValid24hTime,
  normalizeYyyyMmDd,
  pad24hTime,
} from "@/lib/birthFormParse";

const ERROR_COPY: Record<string, string> = {
  LOCATION_NOT_FOUND:
    "We couldn't find that place. Try adding the state or country (for example: Boston, MA, USA).",
  GEOCODE_UNAVAILABLE:
    "We couldn't reach the location service from your network. If you're on a VPN or restricted network, try turning it off and retry.",
  TIMEZONE_UNKNOWN:
    "We couldn't determine the time zone for that location. Try a more specific address.",
  INVALID_DATETIME:
    "That date or time doesn't look valid. Double-check and try again.",
  MISSING_FIELDS: "Please fill in your birth date, location, and email.",
  INVALID_JSON: "Something went wrong. Please try again.",
  INVALID_BODY: "Something went wrong. Please try again.",
  INTERNAL_ERROR:
    "Server error while building your chart. Please try again in a moment.",
};

type Props = {
  triggerText?: string;
  triggerClassName?: string;
};

export default function BirthFormModal({
  triggerText,
  triggerClassName,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationResults, setLocationResults] = useState<string[]>([]);
  const [locationOpen, setLocationOpen] = useState(false);
  const [form, setForm] = useState({
    birthDate: "",
    birthTime: "",
    gender: "male",
    location: "",
    email: "",
  });
  const [unknownTime, setUnknownTime] = useState(false);
  const [allowFallback, setAllowFallback] = useState(false);
  const [geocodeDown, setGeocodeDown] = useState(false);

  async function updateLocationSuggestions(nextQuery: string) {
    const q = nextQuery.trim();
    if (q.length < 2) {
      setLocationResults([]);
      setLocationOpen(false);
      return;
    }
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as
        | { ok: true; results: Array<{ displayName: string }> }
        | { ok: false; error: string };
      if (!res.ok || !data.ok) {
        if ((data as { ok: false; error: string }).error === "GEOCODE_UNAVAILABLE") {
          setGeocodeDown(true);
          setAllowFallback(true);
        }
        setLocationResults([]);
        setLocationOpen(false);
        return;
      }
      setGeocodeDown(false);
      const names = data.results.map((r) => r.displayName).slice(0, 6);
      setLocationResults(names);
      setLocationOpen(names.length > 0);
    } catch {
      setLocationResults([]);
      setLocationOpen(false);
    }
  }

  async function requestChart(params: {
    birthDate: string;
    birthTime: string;
    gender: string;
    location: string;
    allowFallback: boolean;
  }): Promise<
    | { ok: true; chart: unknown; meta?: unknown }
    | { ok: false; status: number; errorCode: string }
  > {
    const res = await fetch("/api/birth-chart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    let data:
      | {
          ok?: boolean;
          error?: string;
          chart?: unknown;
          meta?: unknown;
        }
      | null = null;
    try {
      data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        chart?: unknown;
        meta?: unknown;
      };
    } catch {
      data = null;
    }

    if (!res.ok || !data?.ok || data.chart == null) {
      const code = typeof data?.error === "string" ? data.error : "";
      return { ok: false, status: res.status, errorCode: code || "UNKNOWN" };
    }

    return { ok: true, chart: data.chart, meta: data.meta };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const birthDateNorm = normalizeYyyyMmDd(form.birthDate);
    if (!birthDateNorm) {
      setError(ERROR_COPY.INVALID_DATETIME);
      return;
    }
    const timeRaw = unknownTime ? "" : form.birthTime.trim();
    if (!isValid24hTime(timeRaw)) {
      setError(ERROR_COPY.INVALID_DATETIME);
      return;
    }
    const birthTimeNorm = pad24hTime(timeRaw);

    setPending(true);

    try {
      const params = {
        birthDate: birthDateNorm,
        birthTime: birthTimeNorm,
        gender: form.gender,
        location: form.location || locationQuery,
      };

      // First attempt: normal mode.
      const first = await requestChart({
        ...params,
        allowFallback,
      });

      if (!first.ok) {
        if (first.errorCode === "GEOCODE_UNAVAILABLE" && !allowFallback) {
          // Smooth fallback: auto-switch and retry once.
          setAllowFallback(true);
          setGeocodeDown(true);
          setNotice(
            "Location services are unavailable. Continuing with an approximate chart.",
          );
          const second = await requestChart({ ...params, allowFallback: true });
          if (!second.ok) {
            setError(
              ERROR_COPY[second.errorCode] ??
                `Request failed (${second.status}). Please try again in a moment.`,
            );
            setPending(false);
            return;
          }
          sessionStorage.setItem("userChart", JSON.stringify(second.chart));
          if (second.meta != null) {
            sessionStorage.setItem("userChartMeta", JSON.stringify(second.meta));
          }
          sessionStorage.setItem(
            "userBirthInput",
            JSON.stringify({
              birthDate: birthDateNorm,
              birthTime: birthTimeNorm,
              gender: form.gender,
              location: form.location || locationQuery,
              allowFallback: true,
            }),
          );
          sessionStorage.setItem("userEmail", form.email);
          sessionStorage.setItem("userBirthLocation", form.location || locationQuery);
          setIsOpen(false);
          setPending(false);
          router.push("/calculating");
          return;
        }

        setError(
          ERROR_COPY[first.errorCode] ??
            `Request failed (${first.status}). Please try again in a moment.`,
        );
        setPending(false);
        return;
      }

      sessionStorage.setItem("userChart", JSON.stringify(first.chart));
      sessionStorage.setItem("userEmail", form.email);
      sessionStorage.setItem("userBirthLocation", form.location || locationQuery);
      sessionStorage.setItem(
        "userBirthInput",
        JSON.stringify({
          birthDate: birthDateNorm,
          birthTime: birthTimeNorm,
          gender: form.gender,
          location: form.location || locationQuery,
          allowFallback,
        }),
      );
      if (first.meta != null) {
        sessionStorage.setItem("userChartMeta", JSON.stringify(first.meta));
      }

      setIsOpen(false);
      setPending(false);
      router.push("/calculating");
    } catch {
      setError(
        "Network error. If you're on a VPN or restricted network, try turning it off and retry.",
      );
      setPending(false);
    }
  }

  return (
    <>
      <BirthFormTrigger
        onOpen={() => setIsOpen(true)}
        triggerText={triggerText}
        triggerClassName={triggerClassName}
      />

      <Dialog
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setError(null);
          setLocationOpen(false);
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogBackdrop className="fixed inset-0 bg-void/85 backdrop-blur-sm" />

          <DialogPanel
            lang="en-US"
            className="relative w-full max-w-md border border-gold/25 bg-mist/95 p-8 shadow-panel backdrop-blur-xl"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-30"
              aria-hidden
            />
            <div className="relative">
            <DialogTitle className="font-display text-2xl font-semibold text-ink">
              Create your destiny chart in 30 seconds
            </DialogTitle>

            <p className="mt-2 font-body text-sm leading-relaxed text-ink-muted">
              We use your birth data to calculate your Zi Wei astrology chart.
              Your data is never stored or shared.
            </p>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-body text-sm text-ink-muted">
              <span>⏱ Takes 30 seconds</span>
              <span>🔒 Private &amp; secure</span>
              <span>✨ Instant free preview</span>
            </div>

            <div className="mt-6 flex items-center justify-between gap-4">
              <p className="font-mono text-xs uppercase tracking-widest text-ink-dim">
                Step 1 of 2 — Birth Details
              </p>
              <div className="h-1 w-28 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/2 bg-gradient-to-r from-jade to-gold" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-sm border border-white/10 bg-void/40 p-4">
                <div className="flex items-start gap-3">
                  <span aria-hidden className="mt-0.5 text-lg">
                    📅
                  </span>
                  <div className="flex-1">
                    <label
                      htmlFor="birthDate"
                      className="block font-body text-sm font-semibold text-ink"
                    >
                      Date of Birth
                    </label>
                    <p className="mt-1 font-body text-xs text-ink-dim">
                      We use the lunar calendar for calculation.
                    </p>
                <input
                  id="birthDate"
                  type="text"
                  inputMode="numeric"
                  autoComplete="bday"
                  placeholder="YYYY-MM-DD"
                  title="Gregorian date, format YYYY-MM-DD"
                  required
                  value={form.birthDate}
                  className="input-ink font-mono"
                  onChange={(e) =>
                    setForm({ ...form, birthDate: e.target.value })
                  }
                />
                  </div>
                </div>
              </div>

              <div className="rounded-sm border border-white/10 bg-void/40 p-4">
                <div className="flex items-start gap-3">
                  <span aria-hidden className="mt-0.5 text-lg">
                    ⏰
                  </span>
                  <div className="flex-1">
                    <label
                      htmlFor="birthTime"
                      className="block font-body text-sm font-semibold text-ink"
                    >
                      Birth Time (if known)
                    </label>
                <input
                  id="birthTime"
                  type="text"
                  inputMode="numeric"
                  placeholder="HH:MM"
                  title="24-hour local time at birth place, e.g. 14:30"
                  value={unknownTime ? "" : form.birthTime}
                  disabled={unknownTime}
                  className="input-ink font-mono disabled:opacity-50"
                  onChange={(e) =>
                    setForm({ ...form, birthTime: e.target.value })
                  }
                />
                    <div className="mt-2 flex items-center justify-between gap-4">
                      <label className="flex items-center gap-2 font-body text-xs text-ink-muted">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-gold"
                          checked={unknownTime}
                          onChange={(e) => {
                            setUnknownTime(e.target.checked);
                            if (e.target.checked) {
                              setForm({ ...form, birthTime: "" });
                            }
                          }}
                        />
                        I don&apos;t know my birth time
                      </label>
                      <p className="font-mono text-xs text-ink-dim">
                        If unknown, we use 12:00 PM (noon).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-sm border border-white/10 bg-void/40 p-4">
                <div className="flex items-start gap-3">
                  <span aria-hidden className="mt-0.5 text-lg">
                    🧭
                  </span>
                  <div className="flex-1">
                    <label
                      htmlFor="gender"
                      className="block font-body text-sm font-semibold text-ink"
                    >
                      Gender
                    </label>
                <select
                  id="gender"
                  value={form.gender}
                  className="input-ink"
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value })
                  }
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                  </div>
                </div>
              </div>

              <div className="rounded-sm border border-white/10 bg-void/40 p-4">
                <div className="flex items-start gap-3">
                  <span aria-hidden className="mt-0.5 text-lg">
                    🌍
                  </span>
                  <div className="relative flex-1">
                    <label
                      htmlFor="location"
                      className="block font-body text-sm font-semibold text-ink"
                    >
                      Birth City
                    </label>
                    {geocodeDown ? (
                      <p className="mt-1 font-body text-xs text-ink-dim">
                        Autocomplete is temporarily unavailable. You can still continue with an approximate chart.
                      </p>
                    ) : null}
                <input
                  id="location"
                  type="text"
                  placeholder="Search city (e.g. New York, London)"
                  required
                  value={locationQuery}
                  className="input-ink"
                  onChange={(e) => {
                    const next = e.target.value;
                    setLocationQuery(next);
                    setForm({ ...form, location: next });
                    void updateLocationSuggestions(next);
                  }}
                  onFocus={() => setLocationOpen(locationResults.length > 0)}
                  onBlur={() => {
                    // allow click selection
                    setTimeout(() => setLocationOpen(false), 120);
                  }}
                />
                    {locationOpen && locationResults.length ? (
                      <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-10 overflow-hidden rounded-sm border border-white/10 bg-void/95 shadow-panel">
                        <ul className="max-h-56 overflow-auto py-1">
                          {locationResults.map((name) => (
                            <li key={name}>
                              <button
                                type="button"
                                className="w-full px-3 py-2 text-left font-body text-sm text-ink-muted hover:bg-white/5 hover:text-ink"
                                onClick={() => {
                                  setLocationQuery(name);
                                  setForm({ ...form, location: name });
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
                </div>
              </div>

              <div className="rounded-sm border border-white/10 bg-void/40 p-4">
                <div className="flex items-start gap-3">
                  <span aria-hidden className="mt-0.5 text-lg">
                    ✉️
                  </span>
                  <div className="flex-1">
                    <label
                      htmlFor="email"
                      className="block font-body text-sm font-semibold text-ink"
                    >
                      Email address
                    </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  required
                  value={form.email}
                  autoComplete="email"
                  className="input-ink"
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
                  </div>
                </div>
              </div>

              {notice ? (
                <p className="text-sm text-ink-muted" role="status">
                  {notice}
                </p>
              ) : null}

              {error ? (
                <p className="text-sm text-cinnabar" role="alert">
                  {error}
                </p>
              ) : null}

              {allowFallback ? (
                <p className="font-body text-xs text-ink-dim">
                  You can continue with an approximate chart (no time-zone or
                  true-solar correction). You can still upgrade later for the
                  full report.
                </p>
              ) : null}

              <p className="font-body text-xs text-ink-dim">
                You’ll see a free preview before any payment.
              </p>

              <button
                type="submit"
                disabled={pending}
                className="btn-cta w-full py-3.5 text-base disabled:opacity-60"
              >
                {pending ? "Building your chart…" : "Generate My Free Chart →"}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between gap-4">
              <p className="font-body text-xs text-ink-dim">
                We use your email to send your reading. We don&apos;t sell your
                data.
              </p>
              <p className="font-body text-xs text-ink-dim">
                ★★★★★ Trusted by early readers worldwide
              </p>
            </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}

function BirthFormTrigger({
  onOpen,
  triggerText = "Get my free reading",
  triggerClassName = "btn-cta",
}: {
  onOpen: () => void;
  triggerText?: string;
  triggerClassName?: string;
}) {
  return (
    <button type="button" onClick={onOpen} className={triggerClassName}>
      {triggerText}
    </button>
  );
}
