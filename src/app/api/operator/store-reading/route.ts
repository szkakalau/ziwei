import { NextResponse } from "next/server";
import { safeSecretEqual } from "@/lib/secretCompare";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Bearer token auth — operator must know OPERATOR_API_SECRET.
  const secret = process.env.OPERATOR_API_SECRET;
  if (!secret || secret.length < 16) {
    return NextResponse.json(
      { ok: false, error: "OPERATOR_API_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!safeSecretEqual(token, secret)) {
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: { userId?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }

  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!userId) {
    return NextResponse.json(
      { ok: false, error: "MISSING_USER_ID" },
      { status: 400 },
    );
  }
  if (content.length < 20) {
    return NextResponse.json(
      { ok: false, error: "CONTENT_TOO_SHORT", message: "Reading must be at least 20 characters." },
      { status: 400 },
    );
  }

  try {
    const { storeConsultationReading } = await import("@/lib/db");
    await storeConsultationReading(userId, content);
  } catch (err) {
    console.error("[store-reading] DB write failed:", err);
    return NextResponse.json(
      { ok: false, error: "DB_WRITE_FAILED" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
