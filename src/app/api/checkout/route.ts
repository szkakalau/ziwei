import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { getStripe } from "@/lib/stripeServer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const priceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { ok: false, error: "MISSING_STRIPE_SUBSCRIPTION_PRICE_ID" },
        { status: 500 },
      );
    }

    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "NOT_AUTHENTICATED" },
        { status: 401 },
      );
    }

    // Guard against infinite-free-trial abuse: once a user has consumed a
    // trial (has_used_trial=true), they can't get another one unless they have
    // an active subscription. Also reject if already active or trial unexpired.
    const status = user.subscription_status;
    const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
    if (status === "active") {
      return NextResponse.json({ ok: false, error: "TRIAL_ACTIVE" }, { status: 400 });
    }
    if (status === "trial" && trialEndsAt && trialEndsAt > new Date()) {
      return NextResponse.json({ ok: false, error: "TRIAL_ACTIVE" }, { status: 400 });
    }
    if (user.has_used_trial === true) {
      return NextResponse.json({ ok: false, error: "TRIAL_USED" }, { status: 400 });
    }

    // Parse the consultation form (focusArea/question) sent from the snapshot
    // page so the human-written email reading can use them.
    let focusArea: string | undefined;
    let question: string | undefined;
    try {
      const body = await request.json();
      if (typeof body?.focusArea === "string") focusArea = body.focusArea.slice(0, 100);
      if (typeof body?.question === "string") question = body.question.slice(0, 1000);
    } catch {
      /* no body or invalid JSON — proceed without consultation data */
    }

    const siteUrl = getSiteUrl().toString();
    const stripe = getStripe();

    let customerId: string;
    if (user.stripe_customer_id) {
      customerId = user.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
    }

    // Grant trial access immediately — don't wait for the async webhook.
    // Mark has_used_trial=true so this user can never get another free trial.
    const { updateSubscription, updateConsultation } = await import("@/lib/db");
    await updateSubscription(user.id, {
      status: "trial",
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      stripeCustomerId: customerId,
      hasUsedTrial: true,
    });
    if (focusArea || question) {
      await updateConsultation(user.id, { focusArea, question });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId: user.id, focusArea: focusArea ?? "", question: question ?? "" },
      },
      success_url: `${siteUrl}/daily?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#free-personality-snapshot`,
      metadata: { userId: user.id },
      custom_text: {
        submit: {
          message:
            "7-day free trial, then $4.99/month. Cancel anytime. Your personalized Zi Wei Dou Shu horoscope will arrive every morning.",
        },
      },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
