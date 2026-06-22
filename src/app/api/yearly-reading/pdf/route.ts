import { NextResponse } from "next/server";
import { ZWDS_KNOWLEDGE } from "@/lib/zwdsKnowledge";
import { formatChartDetailed } from "@/lib/chartFormatter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

function buildPdfPrompt(chartSummary: string, year: number): { system: string; user: string } {
  return {
    system: `${ZWDS_KNOWLEDGE}\n\nWrite a comprehensive annual personal insight reading. Structure with ### section headings (Career & Work, Love & Relationships, Health & Wellbeing, Wealth & Finances, Key Months to Watch). Reference stars by their EXACT Pinyin · Alias names.`,
    user: `USER'S CHART:\n${chartSummary}\n\nWrite a comprehensive annual personal insight reading for ${year}.`,
  };
}

export async function POST() {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    // Use the shared guard so expired trials (status=trial but trial_ends_at
    // in the past) are rejected — the old hand-written check missed that.
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
    const { system, user: userPrompt } = buildPdfPrompt(chartSummary, year);

    const { callAiWithFallback } = await import("@/lib/aiProviders");
    let reading: string;
    try {
      const result = await callAiWithFallback({
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        maxTokens: 1500,
        temperature: 0.8,
        timeoutMs: 35_000,
      });
      reading = result.text;
    } catch {
      return NextResponse.json({ ok: false, error: "AI_UNAVAILABLE" }, { status: 503 });
    }

    if (!reading) {
      return NextResponse.json({ ok: false, error: "EMPTY_RESPONSE" }, { status: 500 });
    }

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
