"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { formatStarName } from "@/lib/zwdsNaming";
import Link from "next/link";

export function CompatibilityCheck() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState("male");
  const [result, setResult] = useState<{ analysis: string; otherStars: string[]; preview?: boolean; previewMessage?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate || !location) return;

    setLoading(true);
    setError(null);

    try {
      const r = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, birthTime, location, gender }),
      });
      const d = await r.json();

      if (d.ok) {
        setResult(d);
      } else if (d.error === "UPGRADE_REQUIRED") {
        setError(d.message);
      } else {
        setError(d.message || "Could not analyze compatibility.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-8" data-testid="compat-check">
      <h2 className="text-ink-dim text-xs uppercase tracking-wider mb-4 font-medium flex items-center gap-2">
        <Heart className="h-3.5 w-3.5" />
        Compatibility Check
      </h2>

      {!showForm && !result && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 rounded-xl bg-black/[0.02] border border-black/5
                     text-ink-muted text-sm hover:text-ink hover:border-black/10
                     transition-colors text-center"
        >
          Check compatibility with someone →
        </button>
      )}

      {showForm && !result && (
        <form onSubmit={handleSubmit} className="rounded-xl bg-black/[0.02] border border-black/5 p-5 space-y-4">
          <p className="text-ink-dim text-xs">
            Enter the other person&apos;s birth details to see how your charts interact.
          </p>

          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-black/[0.05] border border-black/6
                       text-ink text-sm [color-scheme:light]
                       focus:outline-none focus:border-gold/15"
          />

          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-black/[0.05] border border-black/6
                       text-ink text-sm [color-scheme:light]
                       focus:outline-none focus:border-gold/15"
          />

          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Birth place (city, country)"
            required
            className="w-full px-4 py-3 rounded-xl bg-black/[0.05] border border-black/6
                       text-ink text-sm placeholder:text-ink-dim/60
                       focus:outline-none focus:border-gold/15"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGender("male")}
              className={`flex-1 py-2.5 rounded-xl text-xs border transition-colors ${
                gender === "male"
                  ? "bg-gold/[0.06] border-gold/15 text-gold"
                  : "bg-black/[0.02] border-black/5 text-ink-dim"
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => setGender("female")}
              className={`flex-1 py-2.5 rounded-xl text-xs border transition-colors ${
                gender === "female"
                  ? "bg-gold/[0.06] border-gold/15 text-gold"
                  : "bg-black/[0.02] border-black/5 text-ink-dim"
              }`}
            >
              Female
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !birthDate || !location}
              className="flex-1 py-3 rounded-xl bg-gold/[0.08] text-gold text-sm font-medium
                         border border-gold/15 hover:bg-gold/[0.14]
                         disabled:opacity-30 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
              {loading ? "Analyzing..." : "Check Compatibility"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-3 rounded-xl bg-black/[0.02] border border-black/5
                         text-ink-dim text-sm hover:text-ink-muted transition-colors"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="space-y-2">
              <p className="text-red-400/70 text-xs">{error}</p>
              {error.includes("Upgrade") && (
                <Link
                  href="/daily"
                  className="inline-block px-4 py-2 rounded-xl bg-gold/[0.08] text-gold text-xs font-medium border border-gold/15 hover:bg-gold/[0.14] transition-colors"
                >
                  Upgrade now →
                </Link>
              )}
            </div>
          )}
        </form>
      )}

      {result && (
        <div className="rounded-xl bg-black/[0.02] border border-gold/08 p-5 space-y-4">
          <p className="text-ink text-sm leading-relaxed whitespace-pre-line">
            {result.analysis}
          </p>

          {result.preview && result.previewMessage && (
            <div className="rounded-lg border border-gold/10 bg-gold/[0.03] p-4 text-center">
              <p className="text-amber-700/70 text-xs mb-3">{result.previewMessage}</p>
              <Link
                href="/daily"
                className="inline-block px-4 py-2 rounded-lg bg-gold/[0.08] text-gold text-xs font-medium border border-gold/15 hover:bg-gold/[0.14] transition-colors"
              >
                Upgrade now — $4.99/mo →
              </Link>
            </div>
          )}

          {result.otherStars.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {result.otherStars.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-full text-[11px]
                                         bg-amber-500/8 text-gold/60
                                         border border-gold/08">
                  {formatStarName(s)}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => { setResult(null); setShowForm(true); }}
            className="w-full py-2.5 rounded-xl bg-black/[0.02] border border-black/5
                       text-ink-dim text-xs hover:text-ink-muted transition-colors"
          >
            Check with someone else
          </button>
        </div>
      )}
    </section>
  );
}
