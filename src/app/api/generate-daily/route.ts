import { NextResponse } from "next/server";
import type { ChartLike } from "@/lib/personalitySnapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function buildLocationLabel(birthPlace: unknown): string {
  if (!birthPlace || typeof birthPlace !== "object") return "Unknown";
  const bp = birthPlace as Record<string, unknown>;
  const lat = typeof bp.lat === "number" ? bp.lat : typeof bp.lng === "number" ? (bp as Record<string, number>).lng : undefined;
  const lng = typeof bp.lng === "number" ? bp.lng : undefined;
  if (lat !== undefined && lng !== undefined) return `${lat},${lng}`;
  if (typeof bp.tz === "string") return bp.tz;
  return "Unknown";
}

function buildFallbackChart(user: Record<string, unknown>): ChartLike {
  // Try to salvage whatever chart data exists, even if incomplete
  if (user.chart_data && typeof user.chart_data === "object") {
    const cd = user.chart_data as Record<string, unknown>;
    if (Array.isArray(cd.palaces)) return cd as unknown as ChartLike;
  }
  // Minimal chart: no palaces, but generateHoroscope template fallback handles this
  return { palaces: [] };
}

export async function POST() {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    const { checkSubscription } = await import("@/lib/subscriptionGuard");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subError = checkSubscription(user as any);
    if (subError) {
      return NextResponse.json({ ok: false, error: subError.error }, { status: subError.status });
    }

    // Must have at least birth date to compute a chart
    const hasBirthData = Boolean(user.birth_date);
    const hasCachedChart = Boolean(user.chart_data);

    if (!hasBirthData && !hasCachedChart) {
      return NextResponse.json(
        { ok: false, error: "CHART_NOT_FOUND", message: "Please complete your birth chart first" },
        { status: 400 },
      );
    }

    const today = new Date().toISOString().slice(0, 10);

    // Check cache first
    const { getHoroscope } = await import("@/lib/db");
    const cached = await getHoroscope(user.id, today);
    if (cached) {
      return NextResponse.json({
        ok: true,
        horoscope: cached.horoscope_text,
        highlightedStars: cached.highlighted_stars,
        source: "cached",
      });
    }

    // Compute chart — gracefully degrade on failure
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
      // Chart computation failed — use whatever we have or an empty chart.
      // The template fallback in generateHoroscope handles empty charts.
      chart = buildFallbackChart(user as Record<string, unknown>);
    }

    // Generate horoscope — guaranteed to work (template fallback is code-only)
    const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
    const transitSummary = `Daily transit for ${today}`;
    const result = await generateHoroscope(chart, transitSummary);

    // Persist
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
      // Horoscope generated but cache save failed — user still gets their reading
    }

    // Push notification (fire-and-forget)
    const { sendDailyPush } = await import("@/lib/pushService");
    sendDailyPush({ userId: user.id, horoscopePreview: result.text.slice(0, 120), date: today }).catch(() => {});

    return NextResponse.json({
      ok: true,
      horoscope: result.text,
      highlightedStars: result.highlightedStars,
      source: result.source,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
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
