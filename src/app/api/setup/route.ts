import { NextResponse } from "next/server";
import { initDatabase } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await initDatabase();
    return NextResponse.json({ ok: true, message: "Database tables created" });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
