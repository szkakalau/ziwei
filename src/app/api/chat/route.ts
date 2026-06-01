import { NextResponse } from "next/server";
import { ZWDS_KNOWLEDGE } from "@/lib/zwdsKnowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 25;

function buildChatPrompt(chartSummary: string, question: string): string {
  return `${ZWDS_KNOWLEDGE}

USER'S BIRTH CHART:
${chartSummary}

USER'S QUESTION:
${question}

Answer the user's question based on their chart. Be specific, warm, and conversational.`;
}

async function askDeepSeek(prompt: string): Promise<string> {
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.8,
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`DeepSeek: ${res.status}`);
  const json = await res.json();
  return (json.choices?.[0]?.message?.content ?? "").trim();
}

async function askOpenAI(prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.8,
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`OpenAI: ${res.status}`);
  const json = await res.json();
  return (json.choices?.[0]?.message?.content ?? "").trim();
}

export async function POST(request: Request) {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    if (!user.chart_data) {
      return NextResponse.json(
        { ok: false, error: "CHART_NOT_FOUND" },
        { status: 400 },
      );
    }

    let body: { question?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
    }

    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (!question || question.length < 3) {
      return NextResponse.json(
        { ok: false, error: "QUESTION_TOO_SHORT" },
        { status: 400 },
      );
    }

    // Build chart summary
    const chart = user.chart_data as {
      palaces?: Array<{
        name?: string;
        majorStars?: Array<{ name?: string }>;
        minorStars?: Array<{ name?: string }>;
      }>;
    };
    const chartSummary = (chart.palaces ?? [])
      .map((p) => {
        const stars = [
          ...(p.majorStars ?? []).map((s) => s?.name).filter(Boolean),
          ...(p.minorStars ?? []).map((s) => s?.name).filter(Boolean),
        ];
        return `${p.name ?? "Unknown"} Palace: ${stars.join(", ") || "empty"}`;
      })
      .join("\n");

    const prompt = buildChatPrompt(chartSummary, question);

    let answer: string;
    try {
      answer = await askDeepSeek(prompt);
    } catch {
      try {
        answer = await askOpenAI(prompt);
      } catch {
        return NextResponse.json(
          { ok: false, error: "AI_UNAVAILABLE", message: "The stars are not answering right now. Try again later." },
          { status: 503 },
        );
      }
    }

    return NextResponse.json({ ok: true, answer });
  } catch {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
