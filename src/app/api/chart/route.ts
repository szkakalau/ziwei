import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    let body: {
      birthDate?: string;
      birthTime?: string;
      birthPlace?: { lat: number; lng: number; tz: string };
      chartData?: unknown;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
    }

    if (!body.chartData) {
      return NextResponse.json({ ok: false, error: "MISSING_CHART_DATA" }, { status: 400 });
    }

    // Validate chartData shape
    const cd = body.chartData as Record<string, unknown>;
    if (!cd || typeof cd !== "object" || !Array.isArray(cd.palaces)) {
      return NextResponse.json({ ok: false, error: "INVALID_CHART_DATA" }, { status: 400 });
    }

    const { updateUserChart } = await import("@/lib/db");
    await updateUserChart(user.id, {
      birthDate: body.birthDate ?? user.birth_date ?? "",
      birthTime: body.birthTime ?? user.birth_time ?? "12:00",
      birthPlace: body.birthPlace ?? (user.birth_place as { lat: number; lng: number; tz: string }) ?? { lat: 0, lng: 0, tz: "UTC" },
      chartData: body.chartData,
    });

    return NextResponse.json({ ok: true });
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

    if (!user.chart_data) {
      return NextResponse.json(
        { ok: false, error: "CHART_NOT_FOUND", message: "Complete your birth chart first" },
        { status: 400 },
      );
    }

    const chartData = user.chart_data as {
      palaces?: Array<{
        name?: string;
        majorStars?: Array<{ name?: string }>;
        minorStars?: Array<{ name?: string }>;
      }>;
    };

    return NextResponse.json({
      ok: true,
      chart: {
        palaces: chartData.palaces ?? [],
      },
      birthDate: user.birth_date,
      birthTime: user.birth_time,
      subscriptionStatus: user.subscription_status,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
