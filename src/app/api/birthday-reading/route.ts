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

async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const providers = [
    {
      name: "DeepSeek",
      url: "https://api.deepseek.com/chat/completions",
      key: process.env.DEEPSEEK_API_KEY,
      model: "deepseek-chat",
    },
    {
      name: "OpenAI",
      url: "https://api.openai.com/v1/chat/completions",
      key: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
    },
  ];

  for (const p of providers) {
    if (!p.key) continue;
    try {
      const res = await fetch(p.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${p.key}`,
        },
        body: JSON.stringify({
          model: p.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 800,
          temperature: 0.9,
        }),
        signal: AbortSignal.timeout(25_000),
      });
      if (res.ok) {
        const json = await res.json();
        return (json.choices?.[0]?.message?.content ?? "").trim();
      }
    } catch {
      continue;
    }
  }
  throw new Error("All AI providers unavailable");
}

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
    const userPrompt = `Today is this person's ${age}th birthday!

THEIR BIRTH CHART:
${chartSummary}

Write a beautiful birthday annual reading for them.`;

    const reading = await callAI(BIRTHDAY_PROMPT, userPrompt);

    return NextResponse.json({ ok: true, reading });
  } catch {
    return NextResponse.json(
      { ok: false, error: "AI_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
