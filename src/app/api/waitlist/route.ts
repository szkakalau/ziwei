import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Rate limit: 5 submissions per minute per IP
  const { checkRateLimit, getClientIp } = await import("@/lib/rateLimit");
  const ip = getClientIp(request);
  const rl = checkRateLimit(`waitlist:${ip}`, { windowMs: 60_000, maxRequests: 5 });
  if (!rl.allowed) {
    return Response.json(
      { ok: false, error: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  try {
    let body: { email?: string; source?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "INVALID_EMAIL" }, { status: 400 });
    }

    const { sql } = await import("@/lib/db/client");
    await sql`
      INSERT INTO waitlist_emails (email, source)
      VALUES (${email}, ${body.source ?? "landing"})
      ON CONFLICT (email) DO NOTHING
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    // Duplicate email (unique constraint) — treat as success to avoid leaking info
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "23505"
    ) {
      return NextResponse.json({ ok: true });
    }
    console.error("[waitlist] submission error:", err);
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
