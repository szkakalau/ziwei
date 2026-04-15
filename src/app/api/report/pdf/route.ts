import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripeServer";
import { computeBirthChart } from "@/lib/computeBirthChart";
import { buildZhChartPlainForMeta } from "@/lib/chartZhForPaidPdf";
import { fetchPaidPalaceInterpretations } from "@/lib/paidPalaceInterpretationsOpenAi";
import { renderPaidDestinyPdf } from "@/lib/renderPaidDestinyPdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Paid PDF runs geocode + font fetch + OpenAI; increase on Vercel if needed. */
export const maxDuration = 120;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = (searchParams.get("session_id") ?? "").trim();
    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "MISSING_SESSION" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ ok: false, error: "NOT_PAID" }, { status: 403 });
    }

    const md = session.metadata ?? {};
    const birthDate = md.birthDate ?? "";
    const birthTime = md.birthTime ?? "12:00";
    const location = md.location ?? "";
    const gender = md.gender === "female" ? "female" : "male";
    const allowFallback = md.allowFallback === "true";

    const chartResult = await computeBirthChart({
      birthDate,
      birthTime,
      gender,
      location,
      allowFallback,
    });
    if (!chartResult.ok) {
      return NextResponse.json(
        { ok: false, error: chartResult.errorCode },
        { status: 500 },
      );
    }

    const meta = chartResult.meta;
    const chartZhPlain = buildZhChartPlainForMeta(meta, gender);

    /** Part II: DeepSeek/OpenAI English twelve-palace JSON (separate from post-checkout email long-form). */
    let interpretations;
    try {
      interpretations = await fetchPaidPalaceInterpretations({
        chart: chartResult.chart,
        meta,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[api/report/pdf] LLM", msg);
      if (msg.includes("API key") || msg.includes("DEEPSEEK") || msg.includes("OPENAI")) {
        return NextResponse.json(
          { ok: false, error: "LLM_NOT_CONFIGURED", detail: msg },
          { status: 503 },
        );
      }
      return NextResponse.json(
        { ok: false, error: "LLM_FAILED", detail: msg },
        { status: 502 },
      );
    }

    const generatedAt = new Date().toISOString();
    const coverLinesEn = [
      `Report generated (UTC): ${generatedAt}`,
      `Apparent solar used for the chart: ${meta.apparentSolarDate} ${meta.apparentSolarTime}`,
      `Place: ${meta.placeLabel}`,
      `Time zone: ${meta.timezone}${meta.isApproximate ? " · Approximate chart (see web report for notes)" : ""}`,
      "",
      "Disclaimer: For reflection and entertainment only — not medical, legal, or financial advice.",
    ];

    const bytes = await renderPaidDestinyPdf({
      coverLinesEn,
      chartZh: chartZhPlain,
      apparentMeta: {
        apparentSolarDate: meta.apparentSolarDate,
        apparentSolarTime: meta.apparentSolarTime,
        placeLabel: meta.placeLabel,
      },
      interpretations,
    });

    return new Response(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=\"destinyblueprint-destiny-report.pdf\"",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[api/report/pdf]", err);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
