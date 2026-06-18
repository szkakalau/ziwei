import { NextResponse } from "next/server";
import { ZWDS_KNOWLEDGE } from "@/lib/zwdsKnowledge";
import { formatChartDetailed } from "@/lib/chartFormatter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const BIRTHDAY_PROMPT = `${ZWDS_KNOWLEDGE}

You are writing a birthday personal insight reading for someone.
This is their special day. Write 200-300 words covering:
1. A warm birthday greeting
2. What their star configurations suggest about the year ahead (career, love, health, wealth)
3. Key life-phase dynamics to watch for
4. One piece of wisdom grounded in their actual stars for their new year

Be warm, celebratory, and grounded in their actual chart data. Make them feel seen.
Reference stars by their EXACT Pinyin · Alias names (e.g. "Zi Wei · Emperor Star").
End with: "May this year bring you deeper self-understanding and meaningful growth."`;

function templateBirthday(age: number): string {
  return `Happy ${age}th Birthday! 🎉

Today the stars celebrate another journey around the sun for you. This is a wonderful moment to reflect on how far you have come and look ahead to the year unfolding.

Your chart suggests this coming year holds meaningful growth across several life domains. In your career, the stars hint at new opportunities emerging — perhaps not as dramatic breakthroughs, but as steady doors opening when you are ready to walk through them. Stay curious and say yes to projects that stretch you just beyond your comfort zone.

In love and relationships, the year ahead favors depth over breadth. The connections you invest in — whether romantic, familial, or friendship — will return that investment with compound interest. A conversation you have around mid-year may shift a relationship in a positive direction.

Your health and wellbeing benefit from consistency more than intensity this year. Small daily habits — movement, rest, hydration — build resilience that trendy routines cannot match. Listen to your body's signals; they are more reliable than any external advice.

The key insight from your chart for this year: trust your patterns. The stars that appear in your Self Palace and Career Palace have been shaping your journey since birth — they are not obstacles to overcome but tools to wield with growing skill.

May this year bring you deeper self-understanding and meaningful growth.`;
}

export async function POST() {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

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
    const chartSummary = formatChartDetailed(user.chart_data as Parameters<typeof formatChartDetailed>[0]);

    // AI call with template fallback
    const { callAiWithFallback } = await import("@/lib/aiProviders");
    let reading: string;
    try {
      const result = await callAiWithFallback({
        messages: [
          { role: "system", content: BIRTHDAY_PROMPT },
          { role: "user", content: `Today is this person's ${age}th birthday!\n\nTHEIR CHART:\n${chartSummary}\n\nWrite a beautiful birthday personal insight reading for them.` },
        ],
        maxTokens: 800,
        temperature: 0.9,
      });
      reading = result.text || templateBirthday(age);
    } catch {
      reading = templateBirthday(age);
    }

    return NextResponse.json({ ok: true, reading });
  } catch {
    return NextResponse.json(
      { ok: false, error: "AI_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
