import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST() {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    if (!user.birth_place || !user.chart_data) {
      return NextResponse.json(
        { ok: false, error: "CHART_NOT_FOUND", message: "Please complete your birth chart first" },
        { status: 400 },
      );
    }

    const today = new Date().toISOString().slice(0, 10);

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

    const bp = user.birth_place as { lat: number; lng: number; tz: string };
    const { computeOrGetCachedChart } = await import("@/lib/chartCache");
    const chart = await computeOrGetCachedChart({
      userId: user.id,
      birthDate: user.birth_date as string,
      birthTime: user.birth_time as string,
      locationLabel: `${bp.lat},${bp.lng}`,
      allowFallback: true,
    });

    const { generateHoroscope } = await import("@/lib/horoscopeGenerator");
    const transitSummary = `Daily transit for ${today}`;
    const result = await generateHoroscope(chart, transitSummary);

    const { upsertHoroscope } = await import("@/lib/db");
    await upsertHoroscope({
      userId: user.id,
      date: today,
      horoscopeText: result.text,
      transitSummary: result.transitSummary,
      highlightedStars: result.highlightedStars,
    });

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
