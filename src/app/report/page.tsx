import Link from "next/link";
import { getStripe } from "@/lib/stripeServer";
import { computeBirthChart } from "@/lib/computeBirthChart";
import { buildFullReport } from "@/lib/report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function firstParam(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export default async function ReportPage({ searchParams }: PageProps) {
  const sessionId = firstParam(searchParams?.session_id);
  if (!sessionId) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-sm border border-white/10 bg-panel p-8 shadow-panel backdrop-blur-sm">
          <h1 className="font-display text-3xl font-semibold text-ink">
            Missing session
          </h1>
          <p className="mt-3 font-body text-ink-muted">
            Please open your report link from the payment confirmation email.
          </p>
          <div className="mt-8">
            <Link className="link-gold" href="/">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-sm border border-white/10 bg-panel p-8 shadow-panel backdrop-blur-sm">
          <h1 className="font-display text-3xl font-semibold text-ink">
            Payment not completed
          </h1>
          <p className="mt-3 font-body text-ink-muted">
            We couldn&apos;t confirm a successful payment for this session.
          </p>
          <div className="mt-8">
            <Link className="btn-cta px-6 py-3 text-sm" href="/preview">
              Return to preview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const md = session.metadata ?? {};
  const birthDate = md.birthDate ?? "";
  const birthTime = md.birthTime ?? "12:00";
  const location = md.location ?? "";
  const gender = md.gender === "female" ? "female" : "male";
  const allowFallback = md.allowFallback === "true";

  const chartResult = await computeBirthChart({
    birthDate,
    birthTime,
    gender,
    location,
    allowFallback,
  });

  if (!chartResult.ok) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-sm border border-white/10 bg-panel p-8 shadow-panel backdrop-blur-sm">
          <h1 className="font-display text-3xl font-semibold text-ink">
            We couldn&apos;t build your chart
          </h1>
          <p className="mt-3 font-body text-ink-muted">
            Please contact support with your receipt email. Error code:{" "}
            <span className="font-mono text-ink">{chartResult.errorCode}</span>
          </p>
        </div>
      </div>
    );
  }

  const report = buildFullReport({
    chart: chartResult.chart,
    meta: {
      placeLabel: chartResult.meta.placeLabel,
      apparentSolarDate: chartResult.meta.apparentSolarDate,
      apparentSolarTime: chartResult.meta.apparentSolarTime,
      isApproximate: chartResult.meta.isApproximate,
    },
  });

  const pdfHref = `/api/report/pdf?session_id=${encodeURIComponent(sessionId)}`;

  return (
    <div className="relative mx-auto max-w-6xl px-6 py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-grid-fine bg-grid opacity-20"
        aria-hidden
      />

      <header className="relative mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          {report.title}
        </h1>
        <p className="mt-4 font-body text-ink-muted">{report.subtitle}</p>
        <div className="mt-6 space-y-2 font-body text-sm text-ink-dim">
          {report.summaryLines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a className="btn-cta px-7 py-3.5 text-base" href={pdfHref}>
            Download PDF Report
          </a>
          <Link className="link-gold" href="/contact">
            Need help?
          </Link>
        </div>
      </header>

      <section className="relative mt-14 grid gap-6 lg:grid-cols-2">
        {report.sections.map((s) => (
          <div
            key={s.id}
            className="rounded-sm border border-white/10 bg-panel p-8 shadow-panel backdrop-blur-sm"
          >
            <h2 className="font-display text-2xl font-semibold text-ink">
              {s.title}
            </h2>
            <div className="mt-4 space-y-3 font-body leading-relaxed text-ink-muted">
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="relative mt-14 rounded-sm border border-white/10 bg-panel p-10 shadow-panel backdrop-blur-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-semibold text-ink">
              12 Life Palaces
            </h2>
            <p className="mt-3 font-body text-ink-muted">
              Each palace maps a major domain of life. Read them as patterns: what
              repeats, what unlocks you, and what costs you energy.
            </p>
          </div>
          <div className="rounded-sm border border-gold/20 bg-void/60 px-4 py-3 font-mono text-xs uppercase tracking-widest text-ink-dim">
            Full report
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {report.palaceSections.map((s) => (
            <div
              key={s.id}
              className="rounded-sm border border-white/10 bg-void/55 p-5"
            >
              <h3 className="font-display text-xl font-semibold text-ink">
                {s.title}
              </h3>
              <div className="mt-3 space-y-2 font-body text-sm leading-relaxed text-ink-muted">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mt-14 rounded-sm border border-gold/25 bg-void/55 shadow-panel">
        <div className="bg-grid-fine bg-grid px-8 py-10">
          <h2 className="font-display text-3xl font-semibold text-ink md:text-4xl">
            {report.timeline.title}
          </h2>
          <div className="mt-6 space-y-3 font-body leading-relaxed text-ink-muted">
            {report.timeline.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mt-14 rounded-sm border border-white/10 bg-panel p-10 shadow-panel backdrop-blur-sm">
        <h2 className="font-display text-2xl font-semibold text-ink">
          {report.upsell.title}
        </h2>
        <ul className="mt-5 grid gap-2 font-body text-ink-muted sm:grid-cols-2">
          {report.upsell.body.map((t) => (
            <li key={t} className="rounded-sm border border-white/10 bg-void/55 px-4 py-3">
              {t}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

