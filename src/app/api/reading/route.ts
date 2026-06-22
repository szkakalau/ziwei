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

    const { getConsultationReading } = await import("@/lib/db");
    const reading = await getConsultationReading(user.id);

    if (!reading) {
      return NextResponse.json({ ok: true, status: "pending" });
    }

    const isTrial = (user as Record<string, unknown>).subscription_status === "trial";

    // Trial users see a "locked" state — reading exists but requires subscription.
    if (isTrial) {
      return NextResponse.json({
        ok: true,
        status: "locked",
        message: "Your personalized reading is being written. Subscribe to unlock the full reading.",
      });
    }

    // Active (paid) user — full reading
    return NextResponse.json({
      ok: true,
      status: "full",
      content: reading.content,
      deliveredAt: reading.delivered_at,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
