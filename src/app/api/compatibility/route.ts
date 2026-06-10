import { NextResponse } from "next/server";
import { ZWDS_KNOWLEDGE } from "@/lib/zwdsKnowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const COMPAT_SYSTEM_PROMPT = `${ZWDS_KNOWLEDGE}

You are analyzing the compatibility between TWO people's Zi Wei Dou Shu charts.
Focus on how their stars and palaces interact. Be specific: name their stars and
what palace they're in. Cover:
1. Overall compatibility
2. Communication style match
3. Emotional connection
4. Potential challenges
5. Best dynamic (romantic, friendship, business partnership?)

Write 150-250 words. Be warm, honest, and grounded in their actual chart data.
End with one actionable insight.`;

function summarizePalace(p: {
  name?: string;
  majorStars?: Array<{ name?: string }>;
  minorStars?: Array<{ name?: string }>;
}): string {
  const stars = [
    ...(p.majorStars ?? []).map((s) => s?.name).filter(Boolean),
    ...(p.minorStars ?? []).map((s) => s?.name).filter(Boolean),
  ];
  return `${p.name ?? "Unknown"}: ${stars.join(", ") || "empty"}`;
}

export async function POST(request: Request) {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    // Rate limit: 5 compatibility checks per user per hour
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

    // Build chart summaries
    const myChart = user.chart_data as {
      palaces?: Array<{
        name?: string;
        majorStars?: Array<{ name?: string }>;
        minorStars?: Array<{ name?: string }>;
      }>;
    };
    const mySummary = (myChart.palaces ?? []).map(summarizePalace).join("\n");

    const otherChart = otherResult.chart as {
      palaces?: Array<{
        name?: string;
        majorStars?: Array<{ name?: string }>;
        minorStars?: Array<{ name?: string }>;
      }>;
    };
    const otherSummary = (otherChart.palaces ?? []).map(summarizePalace).join("\n");

    // Use shared AI provider with automatic fallback
    const { callAiWithFallback } = await import("@/lib/aiProviders");
    const { text: analysis } = await callAiWithFallback({
      messages: [
        { role: "system", content: COMPAT_SYSTEM_PROMPT },
        { role: "user", content: `PERSON A'S CHART:\n${mySummary}\n\nPERSON B'S CHART:\n${otherSummary}\n\nAnalyze the compatibility between these two charts. Be specific and reference actual stars and palace placements.` },
      ],
      maxTokens: 600,
      temperature: 0.8,
    });

    return NextResponse.json({
      ok: true,
      analysis,
      otherStars: (otherChart.palaces ?? [])
        .flatMap((p) => [
          ...(p.majorStars ?? []).map((s) => s?.name).filter(Boolean),
        ])
        .slice(0, 5),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
