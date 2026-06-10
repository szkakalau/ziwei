/**
 * Subscription guard — returns 402 if user doesn't have active subscription.
 * Used by all AI-powered endpoints to prevent free-tier abuse.
 */

interface UserLike {
  subscription_status: string | null;
  trial_ends_at: string | null;
}

export function checkSubscription(user: UserLike): { ok: false; error: string; status: number } | null {
  const status = user.subscription_status;

  // Require trial or active subscription
  if (!status || (status !== "trial" && status !== "active")) {
    return {
      ok: false,
      error: "SUBSCRIPTION_REQUIRED",
      status: 402,
    };
  }

  // If trial, check it hasn't expired (fail closed: missing end date = expired)
  if (status === "trial") {
    if (!user.trial_ends_at || new Date(user.trial_ends_at) < new Date()) {
      return {
        ok: false,
        error: "TRIAL_EXPIRED",
        status: 402,
      };
    }
  }

  return null; // OK
}
