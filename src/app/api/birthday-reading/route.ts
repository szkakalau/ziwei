import { NextResponse } from "next/server";
import { ZWDS_KNOWLEDGE } from "@/lib/zwdsKnowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const BIRTHDAY_PROMPT = `${ZWDS_KNOWLEDGE}

You are writing a birthday annual Zi Wei Dou Shu reading for someone.
This is their special day. Write 200-300 words covering:
1. A warm birthday greeting
2. What their chart says about the year ahead (career, love, health, wealth)
3. Key transits to watch for
4. One piece of wisdom from the stars for their new year

Be warm, celebratory, and grounded in their actual chart. Make them feel seen.
End with: "May the stars guide your {age}th year."`;

function summarizeChart(chart: {
  palaces?: Array<{
    name?: string;
    majorStars?: Array<{ name?: string }>;
    minorStars?: Array<{ name?: string }>;
  }>;
}): string {
  return (chart.palaces ?? [])
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

    // Rate limit: 2 birthday readings per user per day
    const { checkRateLimit } = await import("@/lib/rateLimit");
    const rl = checkRateLimit(`birthday:${user.id}`, { windowMs: 86_400_000, maxRequests: 2 });
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

    if (!user.chart_data || !user.birth_date) {
      return NextResponse.json({ ok: false, error: "CHART_NOT_FOUND" }, { status: 400 });
    }

    const birthDate = new Date(user.birth_date as string);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const chart = user.chart_data as {
      palaces?: Array<{
        name?: string;
        majorStars?: Array<{ name?: string }>;
        minorStars?: Array<{ name?: string }>;
      }>;
    };

    const chartSummary = summarizeChart(chart);

    const { callAiWithFallback } = await import("@/lib/aiProviders");
    const { text: reading } = await callAiWithFallback({
      messages: [
        { role: "system", content: BIRTHDAY_PROMPT },
        { role: "user", content: `Today is this person's ${age}th birthday!\n\nTHEIR BIRTH CHART:\n${chartSummary}\n\nWrite a beautiful birthday annual reading for them.` },
      ],
      maxTokens: 800,
      temperature: 0.9,
    });

    return NextResponse.json({ ok: true, reading });
  } catch {
    return NextResponse.json(
      { ok: false, error: "AI_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
