import { NextResponse } from "next/server";
import { ZWDS_KNOWLEDGE } from "@/lib/zwdsKnowledge";
import { formatChartDetailed } from "@/lib/chartFormatter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

const YEARLY_SYSTEM_PROMPT = `${ZWDS_KNOWLEDGE}

You are writing a comprehensive annual personal insight reading covering the next 12 months.
Structure your response in these sections. Use ### for section headings:

### Career & Work
### Love & Relationships
### Health & Wellbeing
### Wealth & Finances
### Key Months to Watch

For each section, write 80-120 words. Be specific — reference the user's actual stars by their
Pinyin · Alias names (e.g. "Zi Wei · Emperor Star") and which palaces they appear in.
End with an overall theme for the year.

Write in warm, conversational English. This is a premium reading — make it feel personal and valuable.
Use the EXACT star names provided in the chart data. Do not invent names.`;

function templateYearly(year: number): string {
  return `### Career & Work

This year, your professional path is shaped by the stars in your Career Palace. You may encounter new opportunities that call on your natural strengths — pay attention to projects that align with what you already do well. A mentor or colleague may offer guidance at a pivotal moment. Stay open to feedback and avoid overcommitting early in the year.

### Love & Relationships

Your relationship dynamics this year are influenced by the stars in your Spouse and Self palaces. Communication deepens when you lead with curiosity rather than assumption. For those in partnerships, small consistent gestures matter more than grand declarations. Single? Meaningful connection is more likely through shared interests than through chance encounters.

### Health & Wellbeing

Your energy ebbs and flows with the seasons. The first half of the year favors building routines; the second half rewards consistency over intensity. Pay extra attention to stress signals around major transitions — your body tells you what your mind tries to override. Regular rest is not laziness; it is maintenance.

### Wealth & Finances

Financial patterns this year reward patience and planning. Windfalls are unlikely, but steady growth is within reach if you avoid impulsive spending. Review subscriptions and recurring costs — small leaks add up. A significant purchase or investment is best made after thorough research, ideally mid-year when clarity peaks.

### Key Months to Watch

March–April bring momentum for career moves. July favors relationship conversations. September–October is your best window for financial decisions. December invites reflection — use it to set intentions for the year ahead.

${year} is a year of steady progress. Trust your patterns, stay curious, and let self-awareness guide your choices.`;
}

export async function POST() {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    // Rate limit: 3 yearly readings per user per hour
    const { checkRateLimit } = await import("@/lib/rateLimit");
    const rl = checkRateLimit(`yearly:${user.id}`, { windowMs: 3_600_000, maxRequests: 3 });
    if (!rl.allowed) {
      return NextResponse.json(
        { ok: false, error: "RATE_LIMITED", retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000) },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
      );
    }

    const { checkSubscription } = await import("@/lib/subscriptionGuard");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subError = checkSubscription(user as any);
    if (subError) {
      return NextResponse.json({ ok: false, error: subError.error }, { status: subError.status });
    }

    if (!user.chart_data) {
      return NextResponse.json({ ok: false, error: "CHART_NOT_FOUND" }, { status: 400 });
    }

    const chartSummary = formatChartDetailed(user.chart_data as Parameters<typeof formatChartDetailed>[0]);
    const year = new Date().getFullYear();

    // Cache check
    const cacheKey = `${year}-01-01`;
    const { getHoroscope } = await import("@/lib/db");
    let cached = null;
    try {
      cached = await getHoroscope(user.id, cacheKey);
    } catch {
      // Cache miss — generate fresh
    }
    if (cached && cached.horoscope_text) {
      return NextResponse.json({ ok: true, reading: cached.horoscope_text, year, cached: true });
    }

    // AI call with template fallback
    const { callAiWithFallback } = await import("@/lib/aiProviders");
    let reading: string;
    try {
      const result = await callAiWithFallback({
        messages: [
          { role: "system", content: YEARLY_SYSTEM_PROMPT },
          { role: "user", content: `Write a comprehensive annual personal insight reading for ${year}.\n\nUSER'S CHART:\n${chartSummary}` },
        ],
        maxTokens: 1500,
        temperature: 0.8,
        timeoutMs: 35_000,
      });
      reading = result.text || templateYearly(year);
    } catch {
      reading = templateYearly(year);
    }

    // Cache
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
