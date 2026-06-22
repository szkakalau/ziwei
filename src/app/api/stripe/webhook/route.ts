import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { getStripe } = await import("@/lib/stripeServer");
  const stripe = getStripe();
  const sig = (await headers()).get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json(
      { ok: false, error: "MISSING_STRIPE_WEBHOOK_SECRET" },
      { status: 400 },
    );
  }

  const raw = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_SIGNATURE" }, { status: 400 });
  }

  const { sql } = await import("@/lib/db");

  // Idempotency: check FIRST (read-only). If already processed, exit without
  // re-running side effects. We record the event AFTER processing succeeds —
  // recording before processing meant a handler failure permanently lost the
  // event (Stripe's retry would see the committed row and skip). Processing is
  // idempotent on its own (updateSubscription uses COALESCE), so re-processing
  // on retry is safe.
  const already = await sql`
    SELECT 1 FROM stripe_events WHERE event_id = ${event.id} LIMIT 1
  `;
  if (already.length > 0) {
    return NextResponse.json({ ok: true }); // Already processed
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = event.data.object as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const evt = event as any;
    const { mapStripeStatus } = await import("@/lib/stripeStatus");

    switch (evt.type) {
      case "checkout.session.completed": {
        if (obj.mode === "subscription") {
          const userId = obj.metadata?.userId ?? null;
          if (userId) {
            const customerId = typeof obj.customer === "string" ? obj.customer : null;
            const { updateSubscription } = await import("@/lib/db");
            // Only record the Stripe customer id here. Do NOT write status —
            // writing "trial" unconditionally locks out allowTrial=false
            // subscribers (their trial_ends_at is null/past, so the guard
            // fail-closes). Status is owned by customer.subscription.created/
            // updated below, which call mapStripeStatus to set trial/active
            // correctly based on the actual subscription state.
            await updateSubscription(userId, {
              stripeCustomerId: customerId ?? undefined,
            });
          }
        }
        break;
      }

      case "customer.subscription.created": {
        const userId = obj.metadata?.userId ?? null;
        if (userId && obj.status) {
          const { updateSubscription } = await import("@/lib/db");
          const trialEnd = obj.trial_end
            ? new Date((obj.trial_end as number) * 1000).toISOString()
            : undefined;
          await updateSubscription(userId, {
            status: mapStripeStatus(obj.status),
            trialEndsAt: trialEnd,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const VALID_STATUSES = new Set(["trial", "trialing", "active", "past_due", "unpaid", "canceled", "incomplete", "incomplete_expired"]);
        const userId = obj.metadata?.userId ?? null;
        if (userId && obj.status && VALID_STATUSES.has(obj.status)) {
          // Guard against stale events re-activating a canceled subscription:
          // if the DB already says canceled, an out-of-order .updated retry
          // must not flip it back to active/past_due. Only .deleted or a fresh
          // subscription lifecycle should move it out of canceled.
          const current = await sql`SELECT subscription_status FROM users WHERE id = ${userId} LIMIT 1`;
          if (current[0]?.subscription_status === "canceled" && obj.status !== "canceled") {
            break;
          }
          const { updateSubscription } = await import("@/lib/db");
          const trialEnd = obj.trial_end
            ? new Date((obj.trial_end as number) * 1000).toISOString()
            : undefined;
          const customerId = typeof obj.customer === "string" ? obj.customer : undefined;
          await updateSubscription(userId, {
            status: mapStripeStatus(obj.status),
            trialEndsAt: trialEnd,
            stripeCustomerId: customerId,
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const userId = obj.metadata?.userId ?? null;
        if (userId) {
          const { updateSubscription } = await import("@/lib/db");
          await updateSubscription(userId, { status: "canceled" });
        }
        break;
      }
    }

    // Record successful processing. A unique-violation here means a concurrent
    // instance already processed this event — treat as success, not an error.
    // Other DB errors propagate to the outer catch (500) so Stripe retries.
    await sql`
      INSERT INTO stripe_events (event_id, event_type, created_at)
      VALUES (${event.id}, ${event.type}, now())
      ON CONFLICT (event_id) DO NOTHING
    `;
  } catch (err) {
    console.error("[stripe-webhook]", err);
    return NextResponse.json({ ok: false, error: "WEBHOOK_HANDLER_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
