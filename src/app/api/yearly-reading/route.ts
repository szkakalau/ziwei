import { NextResponse } from "next/server";
import { ZWDS_KNOWLEDGE } from "@/lib/zwdsKnowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

const YEARLY_SYSTEM_PROMPT = `${ZWDS_KNOWLEDGE}

You are writing a comprehensive annual Zi Wei Dou Shu reading covering the next 12 months.
Structure your response in these sections. Use ### for section headings:

### Career & Work
### Love & Relationships
### Health & Wellbeing
### Wealth & Finances
### Key Months to Watch

For each section, write 80-120 words. Be specific — reference the user's actual stars
and their palace placements. End with an overall theme for the year.

Write in warm, conversational English. This is a premium reading — make it feel worth paying for.`;

function summarizeChart(chart: unknown): string {
  const c = chart as {
    palaces?: Array<{
      name?: string;
      majorStars?: Array<{ name?: string }>;
      minorStars?: Array<{ name?: string }>;
    }>;
  };
  return (c.palaces ?? [])
    .map((p) => {
      const stars = [
        ...(p.majorStars ?? []).map((s) => s?.name).filter(Boolean),
        ...(p.minorStars ?? []).map((s) => s?.name).filter(Boolean),
      ];
      return `${p.name ?? "Unknown"}: ${stars.join(", ") || "empty"}`;
    })
    .join("\n");
}

export async function POST() {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    // Rate limit: 3 yearly readings per user per hour (expensive AI call)
    const { checkRateLimit } = await import("@/lib/rateLimit");
    const rl = checkRateLimit(`yearly:${user.id}`, { windowMs: 3_600_000, maxRequests: 3 });
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, error: "RATE_LIMITED", retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000) },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
      );
    }

    // Use shared subscription guard (includes trial expiry check)
    const { checkSubscription } = await import("@/lib/subscriptionGuard");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subError = checkSubscription(user as any);
    if (subError) {
      return NextResponse.json({ ok: false, error: subError.error }, { status: subError.status });
    }

    if (!user.chart_data) {
      return NextResponse.json({ ok: false, error: "CHART_NOT_FOUND" }, { status: 400 });
    }

    const chartSummary = summarizeChart(user.chart_data);
    const year = new Date().getFullYear();

    // Cache check: reuse cached yearly reading if already generated this year
    const { getHoroscope } = await import("@/lib/db");
    const cacheKey = `${year}-yearly`;
    const cached = await getHoroscope(user.id, cacheKey);
    if (cached) {
      return NextResponse.json({ ok: true, reading: cached.horoscope_text, year, cached: true });
    }

    // Use shared AI provider with automatic fallback
    const { callAiWithFallback } = await import("@/lib/aiProviders");
    const { text: reading } = await callAiWithFallback({
      messages: [
        { role: "system", content: YEARLY_SYSTEM_PROMPT },
        { role: "user", content: `Write a comprehensive annual Zi Wei Dou Shu reading for ${year}.\n\nUSER'S BIRTH CHART:\n${chartSummary}` },
      ],
      maxTokens: 1500,
      temperature: 0.8,
      timeoutMs: 35_000,
    });

    // Cache the yearly reading
    const { upsertHoroscope } = await import("@/lib/db");
    await upsertHoroscope({
      userId: user.id,
      date: cacheKey,
      horoscopeText: reading,
      transitSummary: `Annual reading for ${year}`,
      highlightedStars: [],
    }).catch(() => {});

    return NextResponse.json({ ok: true, reading, year });
  } catch {
    return NextResponse.json({ ok: false, error: "AI_UNAVAILABLE" }, { status: 503 });
  }
}
