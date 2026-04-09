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
        <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-4">
          <DialogBackdrop className="fixed inset-0 bg-void/85 backdrop-blur-sm" />

          <DialogPanel
            lang="en-US"
            className="relative flex max-h-[min(92dvh,40rem)] w-full max-w-md flex-col overflow-hidden border border-gold/25 bg-mist/95 shadow-panel backdrop-blur-xl"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-30"
              aria-hidden
            />
            <div className="relative flex min-h-0 flex-1 flex-col">
              <div className="shrink-0 border-b border-white/10 px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
                <DialogTitle className="font-display text-xl font-semibold leading-snug text-ink sm:text-2xl">
                  Create your chart
                </DialogTitle>
                <p className="mt-1.5 font-body text-xs leading-relaxed text-ink-muted sm:text-sm">
                  Birth data for Zi Wei only — not stored or shared. Gregorian
                  date; lunar used in the calculation.
                </p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-ink-dim sm:text-xs">
                  ~30 sec · private · free preview
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-ink-dim sm:text-xs">
                    Step 1 of 2
                  </p>
                  <div className="h-1 min-w-[5rem] flex-1 max-w-[7rem] overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-1/2 bg-gradient-to-r from-jade to-gold" />
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex min-h-0 flex-1 flex-col"
              >
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5">
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-sm border border-white/10 bg-void/40 p-3">
                        <label
                          htmlFor="birthDate"
                          className="block font-body text-xs font-semibold text-ink sm:text-sm"
                        >
                          Date of birth
                        </label>
                        <input
                          id="birthDate"
                          type="text"
                          inputMode="numeric"
                          autoComplete="bday"
                          placeholder="YYYY-MM-DD"
                          title="Gregorian date, format YYYY-MM-DD"
                          required
                          value={form.birthDate}
                          className="input-ink mt-1.5 font-mono text-sm"
                          onChange={(e) =>
                            setForm({ ...form, birthDate: e.target.value })
                          }
                        />
                      </div>
                      <div className="rounded-sm border border-white/10 bg-void/40 p-3">
                        <label
                          htmlFor="gender"
                          className="block font-body text-xs font-semibold text-ink sm:text-sm"
                        >
                          Gender
                        </label>
                        <select
                          id="gender"
                          value={form.gender}
                          className="input-ink mt-1.5 text-sm"
                          onChange={(e) =>
                            setForm({ ...form, gender: e.target.value })
                          }
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                    </div>

                    <div className="rounded-sm border border-white/10 bg-void/40 p-3">
                      <label
                        htmlFor="birthTime"
                        className="block font-body text-xs font-semibold text-ink sm:text-sm"
                      >
                        Birth time (24h, local)
                      </label>
                      <input
                        id="birthTime"
                        type="text"
                        inputMode="numeric"
                        placeholder="HH:MM"
                        title="24-hour local time at birth place, e.g. 14:30"
                        value={unknownTime ? "" : form.birthTime}
                        disabled={unknownTime}
                        className="input-ink mt-1.5 font-mono text-sm disabled:opacity-50"
                        onChange={(e) =>
                          setForm({ ...form, birthTime: e.target.value })
                        }
                      />
                      <div className="mt-2 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <label className="flex cursor-pointer items-center gap-2 font-body text-[11px] text-ink-muted sm:text-xs">
                          <input
                            type="checkbox"
                            className="h-3.5 w-3.5 shrink-0 accent-gold sm:h-4 sm:w-4"
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
                        <p className="font-mono text-[10px] text-ink-dim sm:text-xs">
                          If unknown → 12:00 noon
                        </p>
                      </div>
                    </div>

                    <div className="rounded-sm border border-white/10 bg-void/40 p-3">
                      <div className="relative">
                        <label
                          htmlFor="location"
                          className="block font-body text-xs font-semibold text-ink sm:text-sm"
                        >
                          Birth city
                        </label>
                        {geocodeDown ? (
                          <p className="mt-1 font-body text-[11px] text-ink-dim">
                            Autocomplete unavailable — you can still continue
                            with an approximate chart.
                          </p>
                        ) : null}
                        <input
                          id="location"
                          type="text"
                          placeholder="e.g. New York, London"
                          required
                          value={locationQuery}
                          className="input-ink mt-1.5 text-sm"
                          onChange={(e) => {
                            const next = e.target.value;
                            setLocationQuery(next);
                            setForm({ ...form, location: next });
                            void updateLocationSuggestions(next);
                          }}
                          onFocus={() =>
                            setLocationOpen(locationResults.length > 0)
                          }
                          onBlur={() => {
                            setTimeout(() => setLocationOpen(false), 120);
                          }}
                        />
                        {locationOpen && locationResults.length ? (
                          <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-sm border border-white/10 bg-void/95 shadow-panel">
                            <ul className="max-h-36 overflow-auto py-1 sm:max-h-40">
                              {locationResults.map((name) => (
                                <li key={name}>
                                  <button
                                    type="button"
                                    className="w-full px-3 py-1.5 text-left font-body text-xs text-ink-muted hover:bg-white/5 hover:text-ink sm:text-sm"
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

                    <div className="rounded-sm border border-white/10 bg-void/40 p-3">
                      <label
                        htmlFor="email"
                        className="block font-body text-xs font-semibold text-ink sm:text-sm"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="For your reading"
                        required
                        value={form.email}
                        autoComplete="email"
                        className="input-ink mt-1.5 text-sm"
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="shrink-0 space-y-2 border-t border-white/10 bg-mist/95 px-4 py-3 backdrop-blur-md sm:px-5">
                  {notice ? (
                    <p className="text-xs text-ink-muted sm:text-sm" role="status">
                      {notice}
                    </p>
                  ) : null}
                  {error ? (
                    <p className="text-xs text-cinnabar sm:text-sm" role="alert">
                      {error}
                    </p>
                  ) : null}
                  {allowFallback ? (
                    <p className="font-body text-[11px] leading-snug text-ink-dim">
                      Approximate chart: no full time-zone / true-solar
                      correction. You can upgrade later.
                    </p>
                  ) : null}
                  <p className="font-body text-[11px] text-ink-dim">
                    Free preview before payment · we don&apos;t sell your data.
                  </p>
                  <button
                    type="submit"
                    disabled={pending}
                    className="btn-cta w-full py-3 text-sm disabled:opacity-60 sm:py-3.5 sm:text-base"
                  >
                    {pending
                      ? "Building your chart…"
                      : "Generate My Free Chart →"}
                  </button>
                </div>
              </form>
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
