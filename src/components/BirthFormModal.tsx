"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

export default function BirthFormModal() {
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
    setPending(true);

    try {
      const res = await fetch("/api/birth-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: form.birthDate,
          birthTime: form.birthTime || "12:00",
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
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded bg-black px-8 py-4 text-lg text-white"
      >
        Get my free reading
      </button>

      <Dialog
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          setError(null);
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogBackdrop className="fixed inset-0 bg-black/40" />

          <DialogPanel className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
            <DialogTitle className="mb-4 text-2xl font-bold">
              Get your free preview
            </DialogTitle>

            <p className="mb-4 text-sm text-gray-600">
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
                  type="date"
                  required
                  value={form.birthDate}
                  className="w-full rounded border p-3"
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
                  type="time"
                  value={form.birthTime}
                  className="w-full rounded border p-3"
                  onChange={(e) =>
                    setForm({ ...form, birthTime: e.target.value })
                  }
                />
                <p className="mt-1 text-xs text-gray-500">
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
                  className="w-full rounded border p-3"
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
                  className="w-full rounded border p-3"
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
                  className="w-full rounded border p-3"
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              {error ? (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded bg-black py-3 text-white disabled:opacity-60"
              >
                {pending ? "Building your chart…" : "Generate my reading"}
              </button>
            </form>

            <p className="mt-3 text-xs text-gray-400">
              We use your email to send your reading. We don&apos;t sell your
              data.
            </p>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
