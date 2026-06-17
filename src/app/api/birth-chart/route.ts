import { NextResponse } from "next/server";
import { computeBirthChart } from "@/lib/computeBirthChart";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Rate limit: 10 chart computations per minute per IP (unauthenticated endpoint)
  const { checkRateLimit, getClientIp } = await import("@/lib/rateLimit");
  const ip = getClientIp(request);
  const rl = checkRateLimit(`birth-chart:${ip}`, { windowMs: 60_000, maxRequests: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "RATE_LIMITED", retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000) },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "INVALID_JSON" },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "INVALID_BODY" },
        { status: 400 },
      );
    }

    const o = body as Record<string, unknown>;
    const birthDate = typeof o.birthDate === "string" ? o.birthDate : "";
    const birthTime = typeof o.birthTime === "string" ? o.birthTime : "";
    const location = typeof o.location === "string" ? o.location : "";
    const gender = o.gender === "female" ? "female" : "male";
    const allowFallback = o.allowFallback === true;

    if (!birthDate || !location) {
      return NextResponse.json(
        { ok: false, error: "MISSING_FIELDS" },
        { status: 400 },
      );
    }

    const result = await computeBirthChart({
      birthDate,
      birthTime,
      gender,
      location,
      allowFallback,
    });

    if (!result.ok) {
      const status = result.errorCode === "LOCATION_NOT_FOUND" ? 404 : 422;
      return NextResponse.json({ ok: false, error: result.errorCode }, { status });
    }

    // If user is authenticated, persist chart data to their account so
    // /api/generate-daily can use it later without re-computing.
    const { getCurrentUser } = await import("@/lib/auth");
    const currentUser = await getCurrentUser().catch(() => null);
    if (currentUser) {
      const { updateUserChart } = await import("@/lib/db");
      updateUserChart(currentUser.id, {
        birthDate,
        birthTime,
        birthPlace: {
          lat: result.meta.latitude,
          lng: result.meta.longitude,
          tz: result.meta.timezone,
        },
        chartData: result.chart,
      }).catch(() => {}); // fire-and-forget — don't block the response
    }

    const payload = {
      ok: true,
      chart: result.chart,
      meta: result.meta,
    };
    return NextResponse.json(payload);
  } catch {
    // Ensure the client always receives JSON (avoids res.json() throwing).
    return NextResponse.json(
      { ok: false, error: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
