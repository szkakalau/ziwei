"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function SuccessClient() {
  const sp = useSearchParams();
  const sessionId = sp.get("session_id") ?? "";

  useEffect(() => {
    const t = setTimeout(() => {
      const dest = sessionId
        ? `/report?session_id=${encodeURIComponent(sessionId)}`
        : "/report";
      window.location.href = dest;
    }, 3000);
    return () => clearTimeout(t);
  }, [sessionId]);

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center px-6 py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-25"
        aria-hidden
      />

      <div className="relative w-full overflow-hidden rounded-sm border border-gold/25 bg-panel p-10 shadow-panel backdrop-blur-sm">
        <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">
          🎉 Payment successful!
        </h1>
        <p className="mt-4 font-body text-lg text-ink-muted">
          We are generating your destiny report now. 我们正在生成你的命运报告。
        </p>
        <p className="mt-3 font-body text-lg text-ink-muted">
          Please wait a few seconds… 请稍等几秒......
        </p>
        <p className="mt-8 font-mono text-xs uppercase tracking-widest text-ink-dim">
          Redirecting in 3 seconds…
        </p>
      </div>
    </div>
  );
}

