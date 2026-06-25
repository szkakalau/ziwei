import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Ensure the database schema is up to date before querying — initDatabase
    // uses IF NOT EXISTS / IF NOT EXISTS so it's idempotent and near-instant
    // when there's nothing to migrate.
    const [{ getCurrentUser }, { initDatabase, updateSubscription }] = await Promise.all([
      import("@/lib/auth"),
      import("@/lib/db"),
    ]);
    await initDatabase();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    // If the user has a Stripe customer ID but their local status is not
    // "trial" or "active" (webhook not yet received, webhook missed, or
    // status reverted), sync from Stripe so paying users aren't locked out.
    const localStatus = user.subscription_status;
    if (
      localStatus !== "trial" &&
      localStatus !== "active" &&
      typeof user.stripe_customer_id === "string" &&
      user.stripe_customer_id.length > 0
    ) {
      try {
        const { getStripe } = await import("@/lib/stripeServer");
        const stripe = getStripe();
        const subs = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          limit: 1,
          status: "all",
        });
        const activeSub = subs.data[0];
        if (activeSub) {
          const { mapStripeStatus } = await import("@/lib/stripeStatus");
          const mapped = mapStripeStatus(activeSub.status);
          // Only update if Stripe says they have an active/trialing subscription.
          // Don't overwrite if Stripe also says inactive — preserve "free" in that
          // case so we don't mask a real cancellation.
          if (mapped === "active" || mapped === "trial") {
            await updateSubscription(user.id, {
              status: mapped,
              trialEndsAt: activeSub.trial_end
                ? new Date(activeSub.trial_end * 1000).toISOString()
                : undefined,
            });
            // Re-read the user to get the updated value
            const { getCurrentUser: reGetUser } = await import("@/lib/auth");
            const refreshed = await reGetUser();
            if (refreshed) {
              return NextResponse.json({
                ok: true,
                user: {
                  id: refreshed.id,
                  email: refreshed.email,
                  birthDate: refreshed.birth_date,
                  subscriptionStatus: refreshed.subscription_status,
                  trialEndsAt: refreshed.trial_ends_at,
                  hasUsedTrial: refreshed.has_used_trial === true,
                  hasStripeId: true,
                },
              });
            }
          }
        }
      } catch {
        // Stripe sync failed — don't block the user. Return whatever is in the DB
        // and let the client show the appropriate UI. The async webhook may still
        // catch up later.
        console.warn("[me] Stripe sync failed for user", user.id);
      }
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
        hasStripeId: typeof user.stripe_customer_id === "string" && user.stripe_customer_id.length > 0,
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
