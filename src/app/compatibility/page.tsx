"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { CompatibilityCheck } from "@/components/CompatibilityCheck";
import { AppNav } from "@/components/AppNav";

export default function CompatibilityPage() {
  const [authOk, setAuthOk] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (r) => {
        if (r.status === 401) { window.location.href = "/daily"; return; }
        const d = await r.json();
        if (d.ok) setAuthOk(true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-void text-ink px-5 py-8 pb-20 max-w-3xl mx-auto">
        <div className="h-32 bg-black/[0.02] rounded-xl animate-pulse" />
      </main>
    );
  }

  if (!authOk) {
    return (
      <main className="min-h-screen bg-void text-ink px-5 py-8 pb-20 max-w-3xl mx-auto text-center">
        <p className="text-ink-dim text-sm">Please log in to use compatibility.</p>
        <a href="/daily" className="text-amber-600/60 text-sm mt-4 inline-block">← Go to daily</a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-void text-ink px-5 pt-8 pb-24 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-5 w-5 text-amber-600/60" />
        <h1 className="text-ink text-lg font-semibold">Compatibility</h1>
      </div>

      <p className="text-ink-dim text-sm mb-6">
        Compare your Zi Wei Dou Shu chart with anyone — romantic partner, friend,
        business partner, or family member.
      </p>

      <CompatibilityCheck />

      <AppNav />
    </main>
  );
}
