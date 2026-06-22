import { NextResponse } from "next/server";
import { geocodeSuggestions } from "@/lib/geocode";
import { checkRateLimit, getClientIp, LIMITS, rateLimitResponse } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  // Rate-limit upstream geocoder calls — Nominatim (OpenStreetMap) enforces a
  // strict usage policy and blocks abusers by IP. Unauthenticated unthrottled
  // access would get the whole app blocked.
  const rl = checkRateLimit(`geocode:${getClientIp(request)}`, LIMITS.general);
  if (!rl.allowed) {
    return NextResponse.json(rateLimitResponse(rl.resetAt), { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ ok: true, results: [] });

  try {
    const results = await geocodeSuggestions(q, 6);
    return NextResponse.json({ ok: true, results });
  } catch {
    return NextResponse.json(
      { ok: false, error: "GEOCODE_UNAVAILABLE" },
      { status: 503 },
    );
  }
}

