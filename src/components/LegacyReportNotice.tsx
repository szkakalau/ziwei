"use client";

import Link from "next/link";

type Props = {
  title: string;
  body: string;
};

export default function LegacyReportNotice({ title, body }: Props) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
      <div className="rounded-sm border border-gold/10 bg-panel p-6 shadow-panel backdrop-blur-sm sm:p-8">
        <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
        <p className="mt-3 font-body leading-relaxed text-ink-muted">{body}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link className="btn-cta px-6 py-3 text-sm" href="/snapshot">
            Go to email reading
          </Link>
          <Link className="link-gold" href="/contact">
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}
