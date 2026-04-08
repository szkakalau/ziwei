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
  TIMEZONE_UNKNOWN:
    "We couldn't determine the time zone for that location. Try a more specific address.",
  INVALID_DATETIME:
    "That date or time doesn't look valid. Double-check and try again.",
  MISSING_FIELDS: "Please fill in your birth date, location, and email.",
  INVALID_JSON: "Something went wrong. Please try again.",
  INVALID_BODY: "Something went wrong. Please try again.",
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
  const [form, setForm] = useState({
    birthDate: "",
    birthTime: "",
    gender: "male",
    location: "",
    email: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const birthDateNorm = normalizeYyyyMmDd(form.birthDate);
    if (!birthDateNorm) {
      setError(ERROR_COPY.INVALID_DATETIME);
      return;
    }
    const timeRaw = form.birthTime.trim();
    if (!isValid24hTime(timeRaw)) {
      setError(ERROR_COPY.INVALID_DATETIME);
      return;
    }
    const birthTimeNorm = pad24hTime(timeRaw);

    setPending(true);

    try {
      const res = await fetch("/api/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: birthDateNorm,
          birthTime: birthTimeNorm,
          gender: form.gender,
          location: form.location,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        chart?: unknown;
        meta?: unknown;
      };

      if (!res.ok || !data.ok || data.chart == null) {
        const code = typeof data.error === "string" ? data.error : "";
        setError(
          ERROR_COPY[code] ??
            "Something went wrong. Please try again in a moment.",
        );
        setPending(false);
        return;
      }

      sessionStorage.setItem("userChart", JSON.stringify(data.chart));
      sessionStorage.setItem("userEmail", form.email);
      sessionStorage.setItem("userBirthLocation", form.location);
      if (data.meta != null) {
        sessionStorage.setItem("userChartMeta", JSON.stringify(data.meta));
      }

      setIsOpen(false);
      setPending(false);
      router.push("/preview");
    } catch {
      setError("Network error. Check your connection and try again.");
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
              Get your free preview
            </DialogTitle>

            <p className="mb-4 mt-2 font-body text-sm leading-relaxed text-ink-muted">
              Enter the date and time on the clock where you were born. We use
              your birth place to find the correct time zone, then adjust to
              apparent solar time for the chart.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="birthDate" className="sr-only">
                  Birth date
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
                  className="input-ink font-mono"
                  onChange={(e) =>
                    setForm({ ...form, birthDate: e.target.value })
                  }
                />
              </div>

              <div>
                <label htmlFor="birthTime" className="sr-only">
                  Birth time
                </label>
                <input
                  id="birthTime"
                  type="text"
                  inputMode="numeric"
                  placeholder="HH:MM"
                  title="24-hour local time at birth place, e.g. 14:30"
                  value={form.birthTime}
                  className="input-ink font-mono"
                  onChange={(e) =>
                    setForm({ ...form, birthTime: e.target.value })
                  }
                />
                <p className="mt-1 font-mono text-xs text-ink-dim">
                  Optional. If unknown, we use 12:00 PM (noon) local time.
                </p>
              </div>

              <div>
                <label htmlFor="gender" className="sr-only">
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

              <div>
                <label htmlFor="location" className="sr-only">
                  City and country of birth
                </label>
                <input
                  id="location"
                  type="text"
                  placeholder="City, state / province, country"
                  required
                  value={form.location}
                  className="input-ink"
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </div>

              <div>
                <label htmlFor="email" className="sr-only">
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

              {error ? (
                <p className="text-sm text-cinnabar" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="btn-cta w-full py-3.5 text-base disabled:opacity-60"
              >
                {pending ? "Building your chart…" : "Generate my reading"}
              </button>
            </form>

            <p className="mt-3 font-body text-xs text-ink-dim">
              We use your email to send your reading. We don&apos;t sell your
              data.
            </p>
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
