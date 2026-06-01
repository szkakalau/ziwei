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

async function callAI(prompt: string): Promise<string> {
  // Try DeepSeek first
  if (process.env.DEEPSEEK_API_KEY) {
    try {
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: COMPAT_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          max_tokens: 600,
          temperature: 0.8,
        }),
        signal: AbortSignal.timeout(25_000),
      });
      if (res.ok) {
        const json = await res.json();
        return (json.choices?.[0]?.message?.content ?? "").trim();
      }
    } catch { /* fall through */ }
  }

  // Try OpenAI
  if (process.env.OPENAI_API_KEY) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: COMPAT_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        max_tokens: 600,
        temperature: 0.8,
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (res.ok) {
      const json = await res.json();
      return (json.choices?.[0]?.message?.content ?? "").trim();
    }
  }

  throw new Error("All AI providers unavailable");
}

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

    const prompt = `PERSON A'S CHART:
${mySummary}

PERSON B'S CHART:
${otherSummary}

Analyze the compatibility between these two charts. Be specific and reference actual stars and palace placements.`;

    const analysis = await callAI(prompt);

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
