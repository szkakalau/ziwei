"use client";

import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";

export function CompatibilityCheck() {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [location, setLocation] = useState("");
  const [gender, setGender] = useState("male");
  const [result, setResult] = useState<{ analysis: string; otherStars: string[] } | null>(null);
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
      <h2 className="text-white/40 text-xs uppercase tracking-wider mb-4 font-medium flex items-center gap-2">
        <Heart className="h-3.5 w-3.5" />
        Compatibility Check
      </h2>

      {!showForm && !result && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 rounded-xl bg-white/[0.02] border border-white/[0.06]
                     text-white/60 text-sm hover:text-white/80 hover:border-white/[0.1]
                     transition-colors text-center"
        >
          Check compatibility with someone →
        </button>
      )}

      {showForm && !result && (
        <form onSubmit={handleSubmit} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 space-y-4">
          <p className="text-white/40 text-xs">
            Enter the other person&apos;s birth details to see how your charts interact.
          </p>

          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                       text-white/80 text-sm [color-scheme:dark]
                       focus:outline-none focus:border-amber-500/20"
          />

          <input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                       text-white/80 text-sm [color-scheme:dark]
                       focus:outline-none focus:border-amber-500/20"
          />

          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Birth place (city, country)"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]
                       text-white/80 text-sm placeholder:text-white/20
                       focus:outline-none focus:border-amber-500/20"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setGender("male")}
              className={`flex-1 py-2.5 rounded-xl text-xs border transition-colors ${
                gender === "male"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  : "bg-white/[0.02] border-white/[0.06] text-white/40"
              }`}
            >
              Male
            </button>
            <button
              type="button"
              onClick={() => setGender("female")}
              className={`flex-1 py-2.5 rounded-xl text-xs border transition-colors ${
                gender === "female"
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  : "bg-white/[0.02] border-white/[0.06] text-white/40"
              }`}
            >
              Female
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !birthDate || !location}
              className="flex-1 py-3 rounded-xl bg-amber-500/15 text-amber-300 text-sm font-medium
                         border border-amber-500/20 hover:bg-amber-500/25
                         disabled:opacity-30 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
              {loading ? "Analyzing..." : "Check Compatibility"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06]
                         text-white/30 text-sm hover:text-white/50 transition-colors"
            >
              Cancel
            </button>
          </div>

          {error && <p className="text-red-400/70 text-xs">{error}</p>}
        </form>
      )}

      {result && (
        <div className="rounded-xl bg-white/[0.02] border border-amber-500/10 p-5 space-y-4">
          <p className="text-white/80 text-sm leading-relaxed whitespace-pre-line">
            {result.analysis}
          </p>

          {result.otherStars.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {result.otherStars.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-full text-[11px]
                                         bg-amber-500/8 text-amber-300/60
                                         border border-amber-500/10">
                  {s}
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => { setResult(null); setShowForm(true); }}
            className="w-full py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]
                       text-white/40 text-xs hover:text-white/60 transition-colors"
          >
            Check with someone else
          </button>
        </div>
      )}
    </section>
  );
}
