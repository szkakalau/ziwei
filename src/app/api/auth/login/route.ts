import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Rate limit: 5 attempts per minute per IP
  const { checkRateLimit, getClientIp, LIMITS, rateLimitResponse } = await import("@/lib/rateLimit");
  const ip = getClientIp(request);
  const rl = checkRateLimit(`login:${ip}`, LIMITS.auth);
  if (!rl.allowed) {
    const resp = rateLimitResponse(rl.resetAt);
    return Response.json({ ok: false, error: resp.error, message: resp.message, retryAfter: resp.retryAfter }, { status: 429, headers: { "Retry-After": String(resp.retryAfter) } });
  }

  try {
    let body: { email?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
    }

    const { loginUser } = await import("@/lib/auth");
    const user = await loginUser(email, password);
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err) {
      const code = (err as { code: string }).code;
      // Server misconfiguration is a 503, not an auth failure (401).
      if (code === "SESSION_MISCONFIGURED") {
        return NextResponse.json({ ok: false, error: code }, { status: 503 });
      }
      return NextResponse.json({ ok: false, error: code }, { status: 401 });
    }
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
