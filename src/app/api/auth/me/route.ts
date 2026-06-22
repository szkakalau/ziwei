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
        hasUsedTrial: user.has_used_trial === true,
      },
    });
  } catch (err) {
    // Distinguish infrastructure failures from unknown errors.
    // AuthError with known codes → 503 (service misconfigured / unavailable).
    // Everything else → 500 (unexpected).
    const isAuthError =
      err != null &&
      typeof err === "object" &&
      "code" in err &&
      typeof (err as { code: unknown }).code === "string";
    if (isAuthError) {
      const code = (err as { code: string }).code;
      if (code === "SESSION_MISCONFIGURED") {
        return NextResponse.json(
          { ok: false, error: "AUTH_MISCONFIGURED" },
          { status: 503 },
        );
      }
    }
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
