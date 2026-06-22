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

    const u = user as Record<string, unknown>;
    const hasOrdered = typeof u.consultation_focus === "string" && u.consultation_focus.length > 0;
    const isTrial = u.subscription_status === "trial";
    const isActive = u.subscription_status === "active";

    if (!hasOrdered) {
      // No reading ordered yet
      return NextResponse.json({
        ok: true,
        status: "no_order",
        message: "You haven't ordered a reading yet. Subscribe to get a human-written email reading within 24-48 hours.",
      });
    }

    if (isTrial) {
      // Trial user — reading being written
      return NextResponse.json({
        ok: true,
        status: "writing",
        message: "Your personalized reading is being written. Once your subscription becomes active, you'll receive it via email within 24-48 hours.",
      });
    }

    if (isActive) {
      // Active subscriber — reading delivered via email
      return NextResponse.json({
        ok: true,
        status: "delivered",
        message: "Your personalized reading has been delivered to your email. Check your inbox (and spam folder). If you can't find it, contact support.",
      });
    }

    // Lapsed/canceled — used to have a reading
    return NextResponse.json({
      ok: true,
      status: "expired",
      message: "Your subscription has ended. Resubscribe to order a new reading.",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
