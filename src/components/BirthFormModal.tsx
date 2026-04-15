"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import {
  isValid24hTime,
  normalizeYyyyMmDd,
  pad24hTime,
} from "@/lib/birthFormParse";
import { dispatchChartSaved } from "@/lib/chartSavedEvent";

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
  /** Default: navigate to /calculating after chart is stored. Use `callback` for inline preview on the same page. */
  successBehavior?: "navigate" | "callback";
  /** Optional hook after save when `successBehavior` is `callback` (e.g. extra UI). Chart save also dispatches `CHART_SAVED_EVENT` on `window`. */
  onChartReady?: () => void;
  /**
   * `modal` (default): button opens a dialog.
   * `inline`: form is always visible on the page (e.g. homepage hero).
   */
  variant?: "modal" | "inline";
  /** Applied to the outer wrapper when `variant="inline"`. */
  className?: string;
};

export default function BirthFormModal({
  triggerText,
  triggerClassName,
  successBehavior = "navigate",
  onChartReady,
  variant = "modal",
  className,
}: Props) {
  const router = useRouter();
  const formDomId = useId().replace(/:/g, "");
  const fid = (suffix: string) => `bf-${formDomId}-${suffix}`;
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

    const location = (form.location || locationQuery).trim();
    const email = form.email.trim();
    if (!location || !email) {
      setError(ERROR_COPY.MISSING_FIELDS);
      return;
    }

    setPending(true);

    try {
      const params = {
        birthDate: birthDateNorm,
        birthTime: birthTimeNorm,
        gender: form.gender,
        location,
      };

      const first = await requestChart({
        ...params,
        allowFallback,
      });

      if (!first.ok) {
        if (first.errorCode === "GEOCODE_UNAVAILABLE" && !allowFallback) {
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
              location,
              allowFallback: true,
            }),
          );
          sessionStorage.setItem("userEmail", email);
          sessionStorage.setItem("userBirthLocation", location);
          localStorage.setItem(
            "userBirthInput",
            JSON.stringify({
              birthDate: birthDateNorm,
              birthTime: birthTimeNorm,
              gender: form.gender,
              location,
              allowFallback: true,
            }),
          );
          localStorage.setItem("userEmail", email);
          localStorage.setItem("userBirthLocation", location);
          dispatchChartSaved();
          if (variant === "modal") setIsOpen(false);
          setPending(false);
          if (successBehavior === "callback") {
            onChartReady?.();
            return;
          }
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
      sessionStorage.setItem("userEmail", email);
      sessionStorage.setItem("userBirthLocation", location);
      sessionStorage.setItem(
        "userBirthInput",
        JSON.stringify({
          birthDate: birthDateNorm,
          birthTime: birthTimeNorm,
          gender: form.gender,
          location,
          allowFallback,
        }),
      );
      localStorage.setItem(
        "userBirthInput",
        JSON.stringify({
          birthDate: birthDateNorm,
          birthTime: birthTimeNorm,
          gender: form.gender,
          location,
          allowFallback,
        }),
      );
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userBirthLocation", location);
      if (first.meta != null) {
        sessionStorage.setItem("userChartMeta", JSON.stringify(first.meta));
      }

      dispatchChartSaved();
      if (variant === "modal") setIsOpen(false);
      setPending(false);
      if (successBehavior === "callback") {
        onChartReady?.();
        return;
      }
      router.push("/calculating");
    } catch {
      setError(
        "Network error. If you're on a VPN or restricted network, try turning it off and retry.",
      );
      setPending(false);
    }
  }

  function renderChartForm(
    formClassName: string,
    scrollAreaClassName: string,
  ) {
    const fieldShell =
      variant === "inline"
        ? "rounded-sm border border-gold/15 bg-void/50 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition-[border-color,box-shadow] duration-300 focus-within:border-gold/40 focus-within:shadow-[0_0_0_1px_rgba(201,167,94,0.14),inset_0_1px_0_rgba(255,255,255,0.08)]"
        : "rounded-sm border border-white/10 bg-void/40 p-3";

    const footerShell =
      variant === "inline"
        ? "shrink-0 space-y-2 border-t border-gold/20 bg-gradient-to-b from-mist/90 via-void/95 to-[#06080c] px-4 py-4 backdrop-blur-md sm:px-5"
        : "shrink-0 space-y-2 border-t border-white/10 bg-mist/95 px-4 py-3 backdrop-blur-md sm:px-5";

    return (
      <form onSubmit={handleSubmit} className={formClassName}>
        <div className={scrollAreaClassName}>
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className={fieldShell}>
                        <label
                          htmlFor={fid("birthDate")}
                          className="block font-body text-xs font-semibold text-ink sm:text-sm"
                        >
                          Date of birth
                        </label>
                        <input
                          id={fid("birthDate")}
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
                      <div className={fieldShell}>
                        <label
                          htmlFor={fid("gender")}
                          className="block font-body text-xs font-semibold text-ink sm:text-sm"
                        >
                          Gender
                        </label>
                        <select
                          id={fid("gender")}
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

                    <div className={fieldShell}>
                      <label
                        htmlFor={fid("birthTime")}
                        className="block font-body text-xs font-semibold text-ink sm:text-sm"
                      >
                        Birth time (24h, local)
                      </label>
                      <input
                        id={fid("birthTime")}
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

                    <div className={fieldShell}>
                      <div className="relative">
                        <label
                          htmlFor={fid("location")}
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
                          id={fid("location")}
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
                          <div className="absolute left-0 right-0 top-full z-[45] mt-1 overflow-hidden rounded-sm border border-gold/20 bg-void/98 shadow-panel backdrop-blur-md">
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

                    <div className={fieldShell}>
                      <label
                        htmlFor={fid("email")}
                        className="block font-body text-xs font-semibold text-ink sm:text-sm"
                      >
                        Email
                      </label>
                      <input
                        id={fid("email")}
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

        <div className={footerShell}>
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
              Approximate chart: no full time-zone / true-solar correction. You
              can upgrade later.
            </p>
          ) : null}
          <p className="font-body text-[11px] text-ink-dim">
            Free preview first · pay only to unlock the full report · we
            don&apos;t sell your data.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="btn-cta w-full py-3 text-sm disabled:opacity-60 sm:py-3.5 sm:text-base"
          >
            {pending ? "Building your chart…" : "Generate My Free Chart →"}
          </button>
        </div>
      </form>
    );
  }

  const modalForm =
    variant === "modal"
      ? renderChartForm(
          "flex min-h-0 flex-1 flex-col",
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 sm:px-5",
        )
      : null;

  const inlineForm =
    variant === "inline"
      ? renderChartForm(
          "flex flex-col",
          "max-h-[min(58vh,30rem)] overflow-y-auto overscroll-contain px-4 py-4 sm:max-h-[min(62vh,34rem)] sm:px-5 sm:py-5",
        )
      : null;

  return (
    <>
      {variant === "modal" ? (
        <BirthFormTrigger
          onOpen={() => setIsOpen(true)}
          triggerText={triggerText}
          triggerClassName={triggerClassName}
        />
      ) : null}

      {variant === "inline" ? (
        <div
          lang="en-US"
          className={`group relative flex w-full flex-col overflow-hidden rounded-sm border border-gold/35 bg-[linear-gradient(168deg,rgba(20,28,36,0.96)_0%,rgba(8,11,15,0.92)_48%,rgba(14,18,24,0.96)_100%)] shadow-[0_32px_90px_-40px_rgba(0,0,0,0.78),0_0_0_1px_rgba(201,167,94,0.14),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl ring-1 ring-inset ring-white/[0.08] ${className ?? ""}`}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-radial-mist opacity-[0.55]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-[0.2]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute left-3 top-3 h-6 w-6 border-l border-t border-gold/45"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute right-3 top-3 h-6 w-6 border-r border-t border-gold/45"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 border-b border-l border-gold/30"
            aria-hidden
          />
          <span
            className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b border-r border-gold/30"
            aria-hidden
          />
          <div className="relative flex flex-col">
            <div className="shrink-0 border-b border-white/10 bg-gradient-to-r from-void/50 via-transparent to-jade-dim/20 px-5 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold/90">
                  命盘 · Chart registry
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">
                  Step 1 of 2
                </p>
              </div>
              <h2 className="mt-2 font-display text-xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-2xl">
                Create your chart
              </h2>
              <p className="mt-2 max-w-prose font-body text-xs leading-relaxed text-ink-muted sm:text-sm">
                Birth data for Zi Wei only — not stored or shared. Gregorian
                date; lunar used in the calculation.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-1 min-w-[4.5rem] flex-1 max-w-[9rem] overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-1/2 origin-left bg-gradient-to-r from-jade to-gold shadow-[0_0_12px_rgba(201,167,94,0.35)]" />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-dim sm:text-xs">
                  ~30 sec · private
                </p>
              </div>
            </div>
            {inlineForm}
          </div>
        </div>
      ) : null}

      {variant === "modal" ? (
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
                    <div className="h-1 min-w-[5rem] max-w-[7rem] flex-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-1/2 bg-gradient-to-r from-jade to-gold" />
                    </div>
                  </div>
                </div>

                {modalForm}
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      ) : null}
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
