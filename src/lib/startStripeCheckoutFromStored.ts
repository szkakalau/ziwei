/**
 * Start Stripe Checkout using stored birth data from the current email-reading flow.
 */

export type CheckoutStartResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export async function startStripeCheckoutFromStored(options?: {
  /** Unix ms when the timed offer started; defaults to checkout click so `/api/checkout` can apply `STRIPE_COUPON_50_OFF_ID`. */
  offerStartAt?: number;
  focusArea?: string;
  question?: string;
  /** When false, subscribe without a free trial (for users who already used one). Defaults true. */
  allowTrial?: boolean;
}): Promise<CheckoutStartResult> {
  const rawBirth =
    typeof window !== "undefined"
      ? localStorage.getItem("userBirthInput") ??
        sessionStorage.getItem("userBirthInput")
      : null;
  const rawMeta =
    typeof window !== "undefined"
      ? sessionStorage.getItem("userChartMeta")
      : null;

  if (!rawBirth) {
    return {
      ok: false,
      message:
        "Missing birth data. Please generate your chart again from the form above.",
    };
  }

  let birthInput: {
    birthDate: string;
    birthTime: string;
    gender: "male" | "female";
    location: string;
    allowFallback?: boolean;
  };
  try {
    birthInput = JSON.parse(rawBirth) as typeof birthInput;
  } catch {
    return { ok: false, message: "Invalid stored birth data. Please try again." };
  }

  let meta: { isApproximate?: boolean } | null = null;
  if (rawMeta) {
    try {
      meta = JSON.parse(rawMeta) as { isApproximate?: boolean };
    } catch {
      meta = null;
    }
  }

  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...birthInput,
      allowFallback:
        birthInput.allowFallback === true || meta?.isApproximate === true,
      offerStartAt: options?.offerStartAt ?? Date.now(),
      focusArea: options?.focusArea,
      question: options?.question,
      allowTrial: options?.allowTrial ?? true,
    }),
  });

  const data = (await res.json()) as
    | { ok: true; url: string | null }
    | { ok: false; error: string };

  // If the user already used a trial (race: hasUsedTrial hadn't resolved when
  // the caller set allowTrial=true), retry once with allowTrial=false so they
  // can still subscribe (and get the email reading) instead of hitting a dead
  // end. Only retry once to avoid a loop.
  if (data.ok === false && data.error === "TRIAL_USED" && options?.allowTrial !== false) {
    return startStripeCheckoutFromStored({ ...options, allowTrial: false });
  }

  if (!res.ok || !data.ok || !data.url) {
    // Surface the actual error from the API so the user knows what to fix
    // instead of seeing a generic "please try again" message.
    const apiError = (data as { error?: string; message?: string } | null);
    const code = apiError?.error;
    const detail = apiError?.message;
    if (code === "NOT_AUTHENTICATED") {
      return {
        ok: false,
        message: "You need to sign up or log in first. Please register or log in from the daily page, then come back.",
      };
    }
    if (code === "CONSULTATION_REQUIRED") {
      return {
        ok: false,
        message: detail || "Please select a focus area and describe your question (at least 10 characters).",
      };
    }
    if (code === "TRIAL_ACTIVE") {
      return {
        ok: false,
        message: "You already have an active trial or subscription. Check your account page for details.",
      };
    }
    if (code === "TRIAL_USED") {
      return {
        ok: false,
        message: "You've already used your free trial. Please subscribe directly — we'll still deliver your human reading.",
      };
    }
    return {
      ok: false,
      message: `Checkout failed (${code || res.status}). Please try again or contact support.`,
    };
  }

  return { ok: true, url: data.url };
}
