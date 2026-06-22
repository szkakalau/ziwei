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

  // Idempotency: atomic check-and-insert. ON CONFLICT DO NOTHING RETURNING id
  // returns a row only on the first insert; concurrent retries (Stripe resends
  // or duplicate delivery to multiple instances) get no row and exit early.
  const { sql } = await import("@/lib/db");
  const inserted = await sql`
    INSERT INTO stripe_events (event_id, event_type, created_at)
    VALUES (${event.id}, ${event.type}, now())
    ON CONFLICT (event_id) DO NOTHING
    RETURNING id
  `.catch(() => [] as Array<{ id: string }>);
  if (inserted.length === 0) {
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
            // No trialEndsAt here — updateSubscription uses COALESCE, so the
            // trial_ends_at set by /api/checkout (now+7d) is preserved instead
            // of being nulled out.
            await updateSubscription(userId, {
              status: "trial",
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
  } catch (err) {
    console.error("[stripe-webhook]", err);
    return NextResponse.json({ ok: false, error: "WEBHOOK_HANDLER_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
