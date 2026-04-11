import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Serves a locally generated sample PDF in development only.
 * Avoids relying on static file caching / missing files under public/output.
 *
 * After: npx tsx scripts/gen-paid-pdf-sample.ts 1978-11-09 20:15 shenzhen male
 * Open:  /api/dev/sample-paid-pdf?date=1978-11-09
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const dateParam = (searchParams.get("date") ?? "1978-11-09").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json({ ok: false, error: "INVALID_DATE" }, { status: 400 });
  }

  const filename = `sample-paid-report-${dateParam}.pdf`;
  const absPath = join(process.cwd(), "public", "output", filename);

  if (!existsSync(absPath)) {
    return NextResponse.json(
      {
        ok: false,
        error: "PDF_NOT_FOUND",
        hint: "Run: npx tsx scripts/gen-paid-pdf-sample.ts " + dateParam + " 20:15 shenzhen male",
        expectedFile: `public/output/${filename}`,
      },
      { status: 404 },
    );
  }

  const buf = readFileSync(absPath);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
