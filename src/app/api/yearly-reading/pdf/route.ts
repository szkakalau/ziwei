import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

async function callAI(prompt: string): Promise<string> {
  const { ZWDS_KNOWLEDGE } = await import("@/lib/zwdsKnowledge");
  const system = `${ZWDS_KNOWLEDGE}\n\nWrite a comprehensive Zi Wei Dou Shu annual reading. Structure with ### section headings.`;

  const providers = [
    { name: "deepseek", url: "https://api.deepseek.com/chat/completions", key: process.env.DEEPSEEK_API_KEY, model: "deepseek-chat" },
    { name: "openai", url: "https://api.openai.com/v1/chat/completions", key: process.env.OPENAI_API_KEY, model: "gpt-4o-mini" },
  ];

  for (const p of providers) {
    if (!p.key) continue;
    try {
      const res = await fetch(p.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.key}` },
        body: JSON.stringify({ model: p.model, messages: [{ role: "system", content: system }, { role: "user", content: prompt }], max_tokens: 1500, temperature: 0.8 }),
        signal: AbortSignal.timeout(35_000),
      });
      if (res.ok) {
        const json = await res.json();
        return (json.choices?.[0]?.message?.content ?? "").trim();
      }
    } catch { continue; }
  }
  throw new Error("All providers unavailable");
}

export async function POST() {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    if (!user.subscription_status || (user.subscription_status !== "trial" && user.subscription_status !== "active")) {
      return NextResponse.json({ ok: false, error: "SUBSCRIPTION_REQUIRED" }, { status: 402 });
    }

    if (!user.chart_data) {
      return NextResponse.json({ ok: false, error: "CHART_NOT_FOUND" }, { status: 400 });
    }

    const c = user.chart_data as { palaces?: Array<{ name?: string; majorStars?: Array<{ name?: string }>; minorStars?: Array<{ name?: string }> }> };
    const chartSummary = (c.palaces ?? []).map((p) => {
      const stars = [...(p.majorStars ?? []), ...(p.minorStars ?? [])].map((s) => s?.name).filter(Boolean);
      return `${p.name ?? "Unknown"}: ${stars.join(", ") || "empty"}`;
    }).join("\n");

    const year = new Date().getFullYear();
    const reading = await callAI(`USER'S BIRTH CHART:\n${chartSummary}\n\nWrite a comprehensive annual Zi Wei Dou Shu reading for ${year}.`);

    const { generateYearlyPdf } = await import("@/lib/generateYearlyPdf");
    const pdfBuffer = await generateYearlyPdf(year, reading);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="destinyblueprint-${year}-annual-reading.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "GENERATION_FAILED" }, { status: 500 });
  }
}
