import { NextResponse } from "next/server";
import { ZWDS_KNOWLEDGE } from "@/lib/zwdsKnowledge";
import { formatChartCompact } from "@/lib/chartFormatter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const COMPAT_SYSTEM_PROMPT = `${ZWDS_KNOWLEDGE}

You are analyzing the interpersonal dynamics between TWO people based on their Zi Wei Dou Shu charts.
Focus on how their star configurations interact. Be specific: reference stars by their EXACT
Pinyin · Alias names (e.g. "Zi Wei · Emperor Star") and which life palaces they appear in.

Cover:
1. Overall dynamic quality
2. Communication style match
3. Emotional connection
4. Potential challenges
5. Best relationship mode (romantic, friendship, business partnership?)

Write 150-250 words. Be warm, honest, and grounded in their actual chart data.
Frame as tendencies and dynamics, not deterministic predictions.
End with one actionable insight for navigating this relationship.`;

function templateCompat(): string {
  return `**Overall Dynamic:** These two charts suggest an interesting and layered connection. The interaction between their core stars creates both natural alignment and productive tension — the kind that can lead to growth when approached with awareness.

**Communication:** Their communication styles are shaped by different star configurations, which means they may process information at different speeds or through different lenses. Patience and explicit expression — saying what you mean rather than assuming — will bridge gaps that intuition alone cannot.

**Emotional Connection:** Emotional resonance between these two depends heavily on context. In calm, reflective moments, they may feel deeply understood. Under stress, their default responses can diverge. Building shared rituals — even small ones — helps anchor the emotional bond.

**Potential Challenges:** The main friction points come from differing approaches to decision-making and resource management. One may favor bold moves while the other prefers measured steps. Neither is wrong, but without compromise, resentment can build.

**Best Mode:** A partnership built on complementary skills — where each person leads in their strength zone — works best. Romantic potential is strong if communication is prioritized; as friends or collaborators, they can achieve more together than separately.

**Key Insight:** Pay attention to how you handle disagreement. The way you navigate conflict will determine whether this relationship deepens or drifts over time.`;

}

export async function POST(request: Request) {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const { checkRateLimit } = await import("@/lib/rateLimit");
    const rl = checkRateLimit(`compat:${user.id}`, { windowMs: 3_600_000, maxRequests: 5 });
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

    const isTrial = (user as Record<string, unknown>).subscription_status === "trial";

    if (!user.chart_data) {
      return NextResponse.json({ ok: false, error: "CHART_NOT_FOUND" }, { status: 400 });
    }

    let body: {
      birthDate?: string;
      birthTime?: string;
      gender?: string;
      location?: string;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
    }

    if (!body.birthDate || !body.birthTime || !body.location) {
      return NextResponse.json(
        { ok: false, error: "MISSING_FIELDS", message: "Birth date, time, and location are required" },
        { status: 400 },
      );
    }

    if (body.gender !== undefined && body.gender !== "male" && body.gender !== "female") {
      return NextResponse.json({ ok: false, error: "INVALID_GENDER" }, { status: 400 });
    }

    // Compute the other person's chart
    const { computeBirthChart } = await import("@/lib/computeBirthChart");
    const otherResult = await computeBirthChart({
      birthDate: body.birthDate,
      birthTime: body.birthTime,
      gender: (body.gender === "female" ? "female" : "male") as "male" | "female",
      location: body.location,
      allowFallback: true,
    });

    if (!otherResult.ok) {
      return NextResponse.json(
        { ok: false, error: "CHART_COMPUTE_FAILED", message: "Could not compute the other person's chart" },
        { status: 400 },
      );
    }

    // Build chart summaries using project naming
    const mySummary = formatChartCompact(user.chart_data as Parameters<typeof formatChartCompact>[0]);
    const otherSummary = formatChartCompact(otherResult.chart as Parameters<typeof formatChartCompact>[0]);

    // AI call with template fallback
    const { callAiWithFallback } = await import("@/lib/aiProviders");
    let analysis: string;
    try {
      const result = await callAiWithFallback({
        messages: [
          { role: "system", content: COMPAT_SYSTEM_PROMPT },
          { role: "user", content: `PERSON A'S CHART:\n${mySummary}\n\nPERSON B'S CHART:\n${otherSummary}\n\nAnalyze the interpersonal dynamics between these two people. Be specific and reference their actual star names and which life palaces they appear in.` },
        ],
        maxTokens: 800,
        temperature: 0.8,
      });
      analysis = result.text || templateCompat();
    } catch {
      analysis = templateCompat();
    }

    const stars = (otherResult.chart as { palaces?: Array<{ majorStars?: Array<{ name?: string }> }> }).palaces
      ?.flatMap((p) => (p.majorStars ?? []).map((s) => s?.name).filter(Boolean))
      .slice(0, 5) ?? [];

    if (isTrial) {
      const third = Math.floor(analysis.length / 3);
      const preview = analysis.slice(0, third).replace(/\s+\S*$/, "");
      return NextResponse.json({
        ok: true,
        analysis: preview,
        otherStars: stars,
        preview: true,
        previewMessage: "Upgrade to a paid subscription to unlock your full compatibility reading.",
      });
    }

    return NextResponse.json({ ok: true, analysis, otherStars: stars });
  } catch {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
