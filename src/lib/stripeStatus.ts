/**
 * Map a Stripe subscription status to our internal subscription_status.
 *
 * subscriptionGuard (src/lib/subscriptionGuard.ts) only accepts "trial" or
 * "active". Writing Stripe's raw status to the DB caused paying users to be
 * locked out:
 *   - "trialing" (Stripe's trial state) → must map to "trial"
 *   - "past_due" (card failed, Stripe retrying) → map to "active": Stripe
 *     itself keeps the subscription active during the smart-retry grace
 *     window, so locking the user out here is stricter than Stripe and causes
 *     involuntary churn. Treat the dunning period as active.
 *
 * All Stripe-facing code must map through here before calling updateSubscription.
 *
 * Stripe status reference: https://docs.stripe.com/api/subscriptions/object#subscription_object-status
 */
export function mapStripeStatus(raw: string): string {
  if (raw === "trialing") return "trial";
  if (raw === "past_due") return "active";
  return raw;
}
