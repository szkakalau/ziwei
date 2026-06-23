"use client";

import { useState } from "react";
import { Mail, ArrowRight, Check } from "lucide-react";

export default function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitted">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    // Store locally — no backend endpoint for email capture yet.
    // In production, POST to /api/waitlist or similar.
    localStorage.setItem("db_email_capture", trimmed);
    setStatus("submitted");
    setError(null);
  };

  if (status === "submitted") {
    return (
      <section className="relative border-t border-gold/[0.06] bg-gold/[0.02] px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-jade/30 bg-jade/[0.08]">
            <Check className="h-5 w-5 text-jade" />
          </div>
          <h3 className="mt-4 font-display text-xl font-semibold text-ink">
            You&apos;re on the list
          </h3>
          <p className="mt-2 font-body text-sm text-ink-muted">
            We&apos;ll send you a free personality reading sample soon. No spam, unsubscribe anytime.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative border-t border-gold/[0.06] bg-gold/[0.02] px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold/20 bg-gold/[0.06]">
          <Mail className="h-5 w-5 text-gold/70" />
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold text-ink">
          Not ready to fill out your birth details?
        </h3>
        <p className="mt-2 font-body text-sm text-ink-muted">
          Drop your email and we&apos;ll send you a free sample personality reading
          — no birth data needed.
        </p>
        <form onSubmit={handleSubmit} className="mt-5 flex gap-2 max-w-sm mx-auto">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            className="input-ink flex-1"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-gold text-void px-4 py-3 font-mono text-xs font-medium uppercase tracking-wider hover:bg-gold/85 transition-colors"
          >
            Send <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>
        {error && (
          <p className="mt-2 font-body text-xs text-cinnabar/80">{error}</p>
        )}
        <p className="mt-3 font-body text-xs text-ink-dim">
          No spam. Unsubscribe anytime. We&apos;ll send one sample, then you decide.
        </p>
      </div>
    </section>
  );
}