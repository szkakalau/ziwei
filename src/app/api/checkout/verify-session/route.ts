import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripeServer";

export const runtime = "nodejs";

/**
 * Verify a Stripe Checkout session and update the user's subscription status.
 * Called by the /daily page when returning from Stripe with ?session_id=...
 * This is the synchronous fallback for the async webhook.
 */
export async function POST(request: Request) {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    let body: { sessionId?: string };
    try { body = await request.json(); } catch {
      return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
    }
    const sessionId = body.sessionId;
    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "MISSING_SESSION_ID" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.status !== "complete") {
      return NextResponse.json({ ok: false, error: "SESSION_NOT_COMPLETE" }, { status: 400 });
    }

    // Verify this session belongs to this user
    const sessionUserId = session.metadata?.userId;
    if (sessionUserId !== user.id) {
      return NextResponse.json({ ok: false, error: "SESSION_USER_MISMATCH" }, { status: 403 });
    }

    // Update subscription status immediately (don't wait for webhook)
    const { updateSubscription } = await import("@/lib/db");
    const customerId = typeof session.customer === "string" ? session.customer : null;

    // Get subscription details
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
    let trialEnd: string | undefined;

    if (subscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        if (sub.trial_end) {
          trialEnd = new Date(sub.trial_end * 1000).toISOString();
        }
        const { mapStripeStatus } = await import("@/lib/stripeStatus");
        await updateSubscription(user.id, {
          status: mapStripeStatus(sub.status),
          stripeCustomerId: customerId ?? undefined,
          trialEndsAt: trialEnd,
        });
      } catch {
        // Fallback: at minimum set trial status
        await updateSubscription(user.id, {
          status: "trial",
          stripeCustomerId: customerId ?? undefined,
        });
      }
    } else {
      await updateSubscription(user.id, {
        status: "trial",
        stripeCustomerId: customerId ?? undefined,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
