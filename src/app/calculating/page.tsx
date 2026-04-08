"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Step = { t: string; d: number };

const steps: Step[] = [
  { t: "Converting birth data to lunar calendar…", d: 2000 },
  { t: "Placing 100+ stars into your chart…", d: 2000 },
  { t: "Generating your personalized interpretation…", d: 2000 },
];

export default function CalculatingPage() {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const totalMs = useMemo(
    () => steps.reduce((acc, s) => acc + s.d, 0),
    [],
  );

  useEffect(() => {
    let alive = true;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    const tick = (i: number) => {
      if (!alive) return;
      setIdx(i);
      if (i >= steps.length) {
        router.replace("/preview");
        return;
      }
      timeout = setTimeout(() => tick(i + 1), steps[i].d);
    };

    tick(0);
    return () => {
      alive = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [router]);

  const isDone = idx >= steps.length;

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center px-6 py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-25"
        aria-hidden
      />
      <div className="relative w-full rounded-sm border border-white/10 bg-panel p-10 shadow-panel backdrop-blur-sm">
        <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">
          Calculating your Zi Wei destiny chart…
        </h1>
        <p className="mt-4 font-body text-lg text-ink-muted">
          Mapping stars across your 12 Life Palaces
        </p>

        <div className="mt-10 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-jade via-gold to-cinnabar"
            style={{
              width: `${Math.min(100, Math.round((Math.min(idx, steps.length) / steps.length) * 100))}%`,
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
                    done
                      ? "text-ink-muted"
                      : active
                        ? "text-ink"
                        : "text-ink-dim"
                  }`}
                >
                  {s.t}
                </p>
              </li>
            );
          })}
        </ol>

        <p className="mt-10 font-body text-sm text-ink-muted">
          {isDone ? "Your chart is ready ✨" : "\u00A0"}
        </p>

        <p className="mt-2 font-mono text-xs uppercase tracking-widest text-ink-dim">
          Estimated time: {Math.round(totalMs / 1000)}s
        </p>
      </div>
    </div>
  );
}

