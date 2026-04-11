import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getStripe } from "@/lib/stripeServer";
import { computeBirthChart } from "@/lib/computeBirthChart";
import { buildFullReport } from "@/lib/report";
import { toPdfStandardFontText } from "@/lib/pdfStandardFontText";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function wrapText(text: string, maxChars: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur: string[] = [];
  for (const w of words) {
    const next = [...cur, w].join(" ");
    if (next.length > maxChars && cur.length) {
      lines.push(cur.join(" "));
      cur = [w];
    } else {
      cur.push(w);
    }
  }
  if (cur.length) lines.push(cur.join(" "));
  return lines;
}

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

    const report = buildFullReport({
      chart: chartResult.chart,
      meta: {
        placeLabel: chartResult.meta.placeLabel,
        apparentSolarDate: chartResult.meta.apparentSolarDate,
        apparentSolarTime: chartResult.meta.apparentSolarTime,
        isApproximate: chartResult.meta.isApproximate,
      },
    });

    const m = chartResult.meta;
    const headerDate = m.apparentSolarDate ?? "—";
    const headerTime = m.apparentSolarTime ?? "—";
    const headerPlace = m.placeLabel ?? "—";
    const placeForPdf = Array.from(headerPlace).some((ch) => (ch.codePointAt(0) ?? 0) > 0xff)
      ? "Full place name on web report (non-Latin script)."
      : headerPlace;
    const approxLine = m.isApproximate
      ? "Note: This report is based on an approximate chart (time-zone and true-solar corrections were unavailable)."
      : "";
    const summaryLinesForPdf = [
      `Generated from your birth data: ${headerDate} • ${headerTime} • ${placeForPdf}`,
      approxLine,
    ].filter(Boolean);

    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const page = pdf.addPage([612, 792]); // US Letter
    const { height } = page.getSize();

    const marginX = 54;
    let y = height - 64;

    const drawLine = (s: string, size: number, bold = false) => {
      const line = toPdfStandardFontText(s);
      const f = bold ? fontBold : font;
      page.drawText(line, {
        x: marginX,
        y,
        size,
        font: f,
        color: rgb(0.1, 0.1, 0.12),
      });
      y -= size + 6;
    };

    drawLine(report.title, 20, true);
    drawLine(report.subtitle, 12);
    y -= 8;

    for (const l of summaryLinesForPdf) {
      for (const w of wrapText(l, 86)) drawLine(w, 10);
    }

    y -= 10;
    drawLine("—", 10);
    y -= 6;

    const blocks = [
      ...report.sections.map((s) => ({ h: s.title, b: s.body })),
      { h: "12 Life Palaces", b: ["See the web version for the full interactive layout."] },
      { h: report.timeline.title, b: report.timeline.body },
      { h: report.upsell.title, b: report.upsell.body },
    ];

    for (const b of blocks) {
      if (y < 120) break; // keep it simple: single page MVP
      drawLine(b.h, 14, true);
      for (const para of b.b) {
        const lines = wrapText(para, 92);
        for (const line of lines) {
          if (y < 90) break;
          drawLine(line, 10);
        }
        y -= 4;
      }
      y -= 8;
    }

    const bytes = await pdf.save();
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

