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
    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        birthDate: user.birth_date,
        subscriptionStatus: user.subscription_status,
        trialEndsAt: user.trial_ends_at,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
