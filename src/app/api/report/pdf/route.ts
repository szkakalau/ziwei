import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error: "LEGACY_REPORT_PDF_DISABLED",
      detail:
        "Legacy AI-generated PDF reports have been retired. Paid orders are now delivered as human-written email readings.",
    },
    { status: 410 },
  );
}
