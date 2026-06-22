/**
 * Map a Stripe subscription status to our internal subscription_status.
 *
 * Stripe uses "trialing" for trial subscriptions, but our subscriptionGuard
 * (src/lib/subscriptionGuard.ts) only accepts "trial" or "active". Writing
 * Stripe's raw status to the DB caused paying trial users to be locked out
 * (402 SUBSCRIPTION_REQUIRED). All Stripe-facing code must map through here
 * before calling updateSubscription.
 *
 * Stripe status reference: https://docs.stripe.com/api/subscriptions/object#subscription_object-status
 */
export function mapStripeStatus(raw: string): string {
  if (raw === "trialing") return "trial";
  return raw;
}
