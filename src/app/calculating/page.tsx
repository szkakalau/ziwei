"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CalculatingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/snapshot");
  }, [router]);

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl items-center px-6 py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-25"
        aria-hidden
      />
      <div className="relative w-full rounded-sm border border-gold/10 bg-panel p-10 shadow-panel backdrop-blur-sm">
        <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">
          Redirecting to your email reading flow...
        </h1>
        <p className="mt-4 font-body text-lg text-ink-muted">
          The old AI-report loading screen has been retired.
        </p>
      </div>
    </div>
  );
}
