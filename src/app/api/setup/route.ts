import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Gate with CRON_SECRET bearer auth — initDatabase runs DDL against the
  // production DB and must not be callable by anonymous visitors.
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ ok: false, error: "NOT_CONFIGURED" }, { status: 500 });
  }
  const headerSecret = request.headers.get("authorization")?.replace("Bearer ", "") ?? "";
  if (headerSecret !== cronSecret) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { initDatabase } = await import("@/lib/db");
    await initDatabase();
    return NextResponse.json({ ok: true, message: "Database tables created" });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
