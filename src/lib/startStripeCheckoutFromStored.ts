/**
 * Start Stripe Checkout using birth data + email already in storage (same contract as /preview).
 */

export type CheckoutStartResult =
  | { ok: true; url: string }
  | { ok: false; message: string };

export async function startStripeCheckoutFromStored(): Promise<CheckoutStartResult> {
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
    gender: string;
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
    }),
  });

  const data = (await res.json()) as
    | { ok: true; url: string | null }
    | { ok: false; error: string };

  if (!res.ok || !data.ok || !data.url) {
    return {
      ok: false,
      message: "We couldn't start checkout. Please try again in a moment.",
    };
  }

  return { ok: true, url: data.url };
}
