import { describe, it, expect } from "vitest";
import { checkSubscription } from "@/lib/subscriptionGuard";

describe("checkSubscription", () => {
  // ── Fail: no subscription at all ────────────────────────────────────

  it("returns 402 when status is null", () => {
    const result = checkSubscription({
      subscription_status: null,
      trial_ends_at: null,
    });
    expect(result).toEqual({ ok: false, error: "SUBSCRIPTION_REQUIRED", status: 402 });
  });

  it("returns 402 when status is 'free'", () => {
    const result = checkSubscription({
      subscription_status: "free",
      trial_ends_at: null,
    });
    expect(result).toEqual({ ok: false, error: "SUBSCRIPTION_REQUIRED", status: 402 });
  });

  it("returns 402 for unrecognized status values", () => {
    const result = checkSubscription({
      subscription_status: "cancelled",
      trial_ends_at: null,
    });
    expect(result).toEqual({ ok: false, error: "SUBSCRIPTION_REQUIRED", status: 402 });
  });

  // ── Pass: active subscriber ──────────────────────────────────────────

  it("returns null (pass) when status is 'active'", () => {
    const result = checkSubscription({
      subscription_status: "active",
      trial_ends_at: null,
    });
    expect(result).toBeNull();
  });

  // ── Trial logic ──────────────────────────────────────────────────────

  it("returns null (pass) when trial is still valid", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1); // 1 year from now
    const result = checkSubscription({
      subscription_status: "trial",
      trial_ends_at: future.toISOString(),
    });
    expect(result).toBeNull();
  });

  it("returns 402 TRIAL_EXPIRED when trial end date is in the past", () => {
    const past = new Date("2020-01-01T00:00:00Z");
    const result = checkSubscription({
      subscription_status: "trial",
      trial_ends_at: past.toISOString(),
    });
    expect(result).toEqual({ ok: false, error: "TRIAL_EXPIRED", status: 402 });
  });

  it('returns 402 TRIAL_EXPIRED (fail-closed) when trial_ends_at is null', () => {
    const result = checkSubscription({
      subscription_status: "trial",
      trial_ends_at: null,
    });
    expect(result).toEqual({ ok: false, error: "TRIAL_EXPIRED", status: 402 });
  });

  it('returns 402 TRIAL_EXPIRED (fail-closed) when trial_ends_at is empty string', () => {
    const result = checkSubscription({
      subscription_status: "trial",
      trial_ends_at: "",
    });
    // new Date("") → Invalid Date → NaN < now → true → expired
    expect(result).toEqual({ ok: false, error: "TRIAL_EXPIRED", status: 402 });
  });
});
