import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { getStripe } from "@/lib/stripeServer";

export const runtime = "nodejs";

export async function POST() {
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
    // If the user abandons checkout, they get 7 free days. Acceptable.
    const { updateSubscription } = await import("@/lib/db");
    await updateSubscription(user.id, {
      status: "trial",
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      stripeCustomerId: customerId,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
        metadata: { userId: user.id },
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
