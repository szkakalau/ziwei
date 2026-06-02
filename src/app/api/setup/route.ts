import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { initDatabase } = await import("@/lib/db");
    await initDatabase();
    return NextResponse.json({ ok: true, message: "Database tables created" });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
