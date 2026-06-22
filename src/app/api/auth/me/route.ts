import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Ensure the database schema is up to date before querying — initDatabase
    // uses IF NOT EXISTS / IF NOT EXISTS so it's idempotent and near-instant
    // when there's nothing to migrate.
    const [{ getCurrentUser }, { initDatabase }] = await Promise.all([
      import("@/lib/auth"),
      import("@/lib/db"),
    ]);
    await initDatabase();

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
    // Always log the raw error so Vercel runtime logs surface the real cause.
    // Without this, a 500 is a black box — the client only sees INTERNAL_ERROR.
    console.error("[me]", err instanceof Error ? err.stack : err);

    // TEMPORARY DIAGNOSTIC: include the actual error message in the response
    // so we can see what's really happening in production.
    const errMsg = err instanceof Error ? err.message : String(err);

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
          { ok: false, error: "AUTH_MISCONFIGURED", debug: errMsg },
          { status: 503 },
        );
      }
    }
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR", debug: errMsg }, { status: 500 });
  }
}
