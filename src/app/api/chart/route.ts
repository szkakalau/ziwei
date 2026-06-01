import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
