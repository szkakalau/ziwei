import { NextResponse } from "next/server";
import type { ChartLike } from "@/lib/personalitySnapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function buildLocationLabel(birthPlace: unknown): string {
  if (!birthPlace || typeof birthPlace !== "object") return "Unknown";
  const bp = birthPlace as Record<string, unknown>;
  const lat = typeof bp.lat === "number" ? bp.lat : undefined;
  const lng = typeof bp.lng === "number" ? bp.lng : undefined;
  if (lat !== undefined && lng !== undefined) return `${lat},${lng}`;
  if (typeof bp.tz === "string") return bp.tz;
  return "Unknown";
}

function buildFallbackChart(user: Record<string, unknown>): ChartLike {
  if (user.chart_data && typeof user.chart_data === "object") {
    const cd = user.chart_data as Record<string, unknown>;
    if (Array.isArray(cd.palaces)) return cd as unknown as ChartLike;
  }
  return { palaces: [] };
}

export async function POST() {
  // Step 1: Auth (required)
  const { getCurrentUser } = await import("@/lib/auth");
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
  }

  // Step 2: Subscription (required)
  const { checkSubscription } = await import("@/lib/subscriptionGuard");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subError = checkSubscription(user as any);
  if (subError) {
    return NextResponse.json({ ok: false, error: subError.error }, { status: subError.status });
  }

  const today = new Date().toISOString().slice(0, 10);

  // Compute today's transit summary for cache validation.
  // Old caches have generic "Daily transit for YYYY-MM-DD" — if the cached
  // transit_summary doesn't match today's actual 四化 summary, we regenerate.
  const { getDailyTransit } = await import("@/lib/dailyTransit");
  const daily = getDailyTransit();

  // Step 3: Check cache — return only if transit summary matches (prompt version check)
  try {
    const { getHoroscope } = await import("@/lib/db");
    const cached = await getHoroscope(user.id, today);
    if (cached && cached.transit_summary === daily.summary) {
      return NextResponse.json({
        ok: true,
        horoscope: cached.horoscope_text,
        highlightedStars: cached.highlighted_stars,
        source: "cached",
      });
    }
  } catch {
    // DB read failed — continue to generate fresh
  }

  // Step 4: Build the best chart we can.
  // Try cached chart first, then compute from birth data, then empty fallback.
  // generateHoroscope handles empty charts fine (template fallback).
  let chart: ChartLike;
  try {
    const { computeOrGetCachedChart } = await import("@/lib/chartCache");
    chart = await computeOrGetCachedChart({
      userId: user.id,
      birthDate: (user.birth_date as string) || "2000-01-01",
      birthTime: (user.birth_time as string) || "12:00",
      locationLabel: buildLocationLabel(user.birth_place),
      allowFallback: true,
    });
  } catch {
    chart = buildFallbackChart(user as Record<string, unknown>);
  }

  // Step 5: Generate the horoscope.
  // TEMPLATE FALLBACK IS CODE-ONLY — IT CANNOT FAIL.
  // DeepSeek → OpenAI → template (guaranteed)
  const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
  const result = await generateHoroscope(chart, daily.summary);

  // Step 6: Persist (best-effort — don't block the user on DB writes)
  try {
    const { upsertHoroscope } = await import("@/lib/db");
    await upsertHoroscope({
      userId: user.id,
      date: today,
      horoscopeText: result.text,
      transitSummary: result.transitSummary,
      highlightedStars: result.highlightedStars,
    });
  } catch {
    // Cache save failed — user still gets their reading
  }

  // Step 7: Push notification (fire-and-forget)
  try {
    const { sendDailyPush } = await import("@/lib/pushService");
    sendDailyPush({ userId: user.id, horoscopePreview: result.text.slice(0, 120), date: today }).catch(() => {});
  } catch {
    // Push service unavailable — non-critical
  }

  // Step 8: Return the horoscope — this ALWAYS succeeds
  return NextResponse.json({
    ok: true,
    horoscope: result.text,
    highlightedStars: result.highlightedStars,
    source: result.source,
  });
}

export async function GET() {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const { getHoroscope } = await import("@/lib/db");
    const horoscope = await getHoroscope(user.id, today);

    if (!horoscope) {
      return NextResponse.json({ ok: true, horoscope: null });
    }

    return NextResponse.json({
      ok: true,
      horoscope: horoscope.horoscope_text,
      highlightedStars: horoscope.highlighted_stars,
      date: horoscope.date,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
