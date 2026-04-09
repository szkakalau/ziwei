"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MvpReportPage from "../mvp-report/page";

export default function ReportClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const sessionId = sp.get("session_id") ?? "";

  useEffect(() => {
    if (!sessionId) return;
    router.replace(`/report-paid?session_id=${encodeURIComponent(sessionId)}`);
  }, [router, sessionId]);

  if (sessionId) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-20 font-body text-ink-muted">
        Loading…
      </div>
    );
  }

  return <MvpReportPage />;
}

