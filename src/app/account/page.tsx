"use client";

import { useEffect, useState } from "react";
import { User, CreditCard, Calendar, LogOut, AlertCircle } from "lucide-react";
import { AppNav } from "@/components/AppNav";
import Link from "next/link";

interface AccountInfo {
  email: string;
  birthDate: string | null;
  subscriptionStatus: string | null;
  trialEndsAt: string | null;
}

export default function AccountPage() {
  const [info, setInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [managingBilling, setManagingBilling] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (r) => {
        if (r.status === 401) {
          window.location.href = "/daily";
          return;
        }
        const d = await r.json();
        if (d.ok) {
          setInfo({
            email: d.user.email,
            birthDate: d.user.birthDate,
            subscriptionStatus: d.user.subscriptionStatus,
            trialEndsAt: d.user.trialEndsAt,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleManageBilling = async () => {
    setManagingBilling(true);
    try {
      const r = await fetch("/api/checkout/portal", { method: "POST" });
      const d = await r.json();
      if (d.ok && d.url) {
        window.location.href = d.url;
      }
    } catch {
      // Failed silently
    } finally {
      setManagingBilling(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const statusLabel = (s: string | null) => {
    switch (s) {
      case "trial": return { label: "Trial", color: "text-gold/80 bg-gold/[0.06] border-gold/10" };
      case "active": return { label: "Active", color: "text-emerald-300/80 bg-emerald-500/10 border-emerald-500/15" };
      case "canceled": return { label: "Canceled", color: "text-red-300/70 bg-red-500/10 border-red-500/15" };
      case "expired": return { label: "Expired", color: "text-ink-dim bg-gold/[0.03] border-gold/10" };
      default: return { label: "None", color: "text-ink-dim bg-gold/[0.03] border-gold/10" };
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-void text-ink px-5 py-8 pb-20 max-w-3xl mx-auto">
        <div className="space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/3 animate-pulse" />
          <div className="h-20 bg-black/[0.02] rounded-xl animate-pulse" />
          <div className="h-20 bg-black/[0.02] rounded-xl animate-pulse" />
        </div>
      </main>
    );
  }

  if (!info) {
    return (
      <main className="min-h-screen bg-void text-ink px-5 py-8 pb-20 max-w-3xl mx-auto text-center">
        <AlertCircle className="h-8 w-8 text-ink-dim mx-auto mb-3" />
        <p className="text-ink-muted">Could not load account info.</p>
        <Link href="/daily" className="text-gold/60 text-sm mt-4 inline-block">
          ← Back to daily
        </Link>
      </main>
    );
  }

  const status = statusLabel(info.subscriptionStatus);

  return (
    <main className="min-h-screen bg-void text-ink px-5 py-8 pb-20 md:px-8 max-w-3xl mx-auto">
      <h1 className="text-ink text-xl font-semibold mb-6">Account</h1>

      <div className="md:grid md:grid-cols-2 md:gap-4">
        {/* Email */}
        <div className="rounded-xl bg-gold/[0.02] border border-gold/10 p-4 mb-3 md:mb-0">
        <div className="flex items-center gap-3">
          <User className="h-4 w-4 text-ink-dim" />
          <div>
            <p className="text-ink-dim text-[11px] uppercase tracking-wider">Email</p>
            <p className="text-ink text-sm">{info.email}</p>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-xl bg-gold/[0.02] border border-gold/10 p-4 mb-3">
        <div className="flex items-center gap-3 mb-3">
          <CreditCard className="h-4 w-4 text-ink-dim" />
          <div>
            <p className="text-ink-dim text-[11px] uppercase tracking-wider">Subscription</p>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>

        {info.trialEndsAt && info.subscriptionStatus === "trial" && (
          <div className="flex items-center gap-3 ml-7">
            <Calendar className="h-4 w-4 text-amber-400/40" />
            <p className="text-ink-dim text-xs">
              Trial ends {new Date(info.trialEndsAt).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          </div>
        )}

        {info.subscriptionStatus === "trial" || info.subscriptionStatus === "active" ? (
          <button
            onClick={handleManageBilling}
            disabled={managingBilling}
            className="mt-3 ml-7 btn-cta px-3 py-1.5 text-xs"
          >
            {managingBilling ? "Loading..." : "Manage billing →"}
          </button>
        ) : null}

        {info.subscriptionStatus === "canceled" || info.subscriptionStatus === "expired" ? (
          <Link
            href="/daily"
            className="mt-3 ml-7 inline-block text-gold/60 text-xs hover:text-amber-700 transition-colors"
          >
            Reactivate subscription →
          </Link>
        ) : null}
      </div>

      {/* Birth Info */}
      {info.birthDate && (
        <div className="rounded-xl bg-gold/[0.02] border border-gold/10 p-4 mb-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-ink-dim" />
            <div>
              <p className="text-ink-dim text-[11px] uppercase tracking-wider">Birth Date</p>
              <p className="text-ink text-sm">{info.birthDate}</p>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gold/[0.02]
                   border border-gold/10 text-ink-dim text-sm
                   hover:text-red-300/70 hover:border-red-500/20 transition-colors mt-6"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>

      {/* Back link */}
      <Link
        href="/daily"
        className="block text-center text-ink-dim text-xs mt-8 hover:text-ink-dim transition-colors"
      >
        ← Back to daily
      </Link>

      <AppNav />
    </main>
  );
}
