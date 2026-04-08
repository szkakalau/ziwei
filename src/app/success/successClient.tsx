"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Step = { t: string; d: number };

const steps: Step[] = [
  { t: "Verifying payment…", d: 2500 },
  { t: "Generating your complete reading…", d: 4500 },
  { t: "Preparing your PDF download…", d: 3500 },
];

export default function SuccessClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const sessionId = sp.get("session_id") ?? "";

  const [idx, setIdx] = useState(0);
  const totalMs = useMemo(() => steps.reduce((acc, s) => acc + s.d, 0), []);

  useEffect(() => {
    if (!sessionId) return;
    let alive = true;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const tick = (i: number) => {
      if (!alive) return;
      setIdx(i);
      if (i >= steps.length) {
        router.replace(`/report?session_id=${encodeURIComponent(sessionId)}`);
        return;
      }
      timeout = setTimeout(() => tick(i + 1), steps[i].d);
    };

    tick(0);
    return () => {
      alive = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [router, sessionId]);

  const isDone = idx >= steps.length;

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center px-6 py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-25"
        aria-hidden
      />

      <div className="relative w-full overflow-hidden rounded-sm border border-gold/25 bg-panel p-10 shadow-panel backdrop-blur-sm">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-jade/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cinnabar/10 blur-3xl"
          aria-hidden
        />

        <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">
          Your full destiny report is ready ✨
        </h1>
        <p className="mt-4 font-body text-lg text-ink-muted">
          We’re generating your complete reading now. This usually takes 10–20
          seconds.
        </p>

        <div className="mt-10 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-jade via-gold to-cinnabar"
            style={{
              width: `${Math.min(
                100,
                Math.round(
                  (Math.min(idx, steps.length) / steps.length) * 100,
                ),
              )}%`,
            }}
          />
        </div>

        <ol className="mt-10 space-y-4">
          {steps.map((s, i) => {
            const active = i === idx;
            const done = i < idx;
            return (
              <li key={s.t} className="flex items-start gap-3">
                <span
                  className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-sm border text-xs ${
                    done
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : active
                        ? "border-jade/50 bg-jade/10 text-jade"
                        : "border-white/10 bg-void/40 text-ink-dim"
                  }`}
                  aria-hidden
                >
                  {done ? "✓" : i + 1}
                </span>
                <p
                  className={`font-body text-sm leading-relaxed ${
                    done ? "text-ink-muted" : active ? "text-ink" : "text-ink-dim"
                  }`}
                >
                  {s.t}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-dim">
            Estimated time: {Math.round(totalMs / 1000)}s
          </p>
          {sessionId ? (
            <Link
              className="link-gold"
              href={`/report?session_id=${encodeURIComponent(sessionId)}`}
            >
              {isDone ? "Open report now →" : "Skip wait →"}
            </Link>
          ) : (
            <Link className="link-gold" href="/">
              Back to home →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

