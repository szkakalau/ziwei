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

async function callAI(system: string, user: string): Promise<string> {
  const providers = [
    { name: "DeepSeek", url: "https://api.deepseek.com/chat/completions", key: process.env.DEEPSEEK_API_KEY, model: "deepseek-chat" },
    { name: "OpenAI", url: "https://api.openai.com/v1/chat/completions", key: process.env.OPENAI_API_KEY, model: "gpt-4o-mini" },
  ];

  for (const p of providers) {
    if (!p.key) continue;
    try {
      const res = await fetch(p.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.key}` },
        body: JSON.stringify({ model: p.model, messages: [{ role: "system", content: system }, { role: "user", content: user }], max_tokens: 1500, temperature: 0.8 }),
        signal: AbortSignal.timeout(35_000),
      });
      if (res.ok) {
        const json = await res.json();
        return (json.choices?.[0]?.message?.content ?? "").trim();
      }
    } catch { continue; }
  }
  throw new Error("All AI providers unavailable");
}

export async function POST() {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    if (!user.subscription_status || (user.subscription_status !== "trial" && user.subscription_status !== "active")) {
      return NextResponse.json(
        { ok: false, error: "SUBSCRIPTION_REQUIRED", message: "Active subscription required for yearly reading" },
        { status: 402 },
      );
    }

    if (!user.chart_data) {
      return NextResponse.json({ ok: false, error: "CHART_NOT_FOUND" }, { status: 400 });
    }

    const chartSummary = summarizeChart(user.chart_data);
    const year = new Date().getFullYear();

    // Cache check: reuse today's cached yearly reading if already generated
    const { getHoroscope } = await import("@/lib/db");
    const cacheKey = `${year}-yearly`;
    const cached = await getHoroscope(user.id, cacheKey);
    if (cached) {
      return NextResponse.json({ ok: true, reading: cached.horoscope_text, year, cached: true });
    }

    const prompt = `Write a comprehensive annual Zi Wei Dou Shu reading for ${year}.

USER'S BIRTH CHART:
${chartSummary}`;

    const reading = await callAI(YEARLY_SYSTEM_PROMPT, prompt);

    // Cache the yearly reading for the rest of the year
    const { upsertHoroscope } = await import("@/lib/db");
    await upsertHoroscope({
      userId: user.id,
      date: cacheKey,
      horoscopeText: reading,
      transitSummary: `Annual reading for ${year}`,
      highlightedStars: [],
    }).catch(() => {}); // Non-critical cache write

    return NextResponse.json({ ok: true, reading, year });
  } catch {
    return NextResponse.json({ ok: false, error: "AI_UNAVAILABLE" }, { status: 503 });
  }
}
