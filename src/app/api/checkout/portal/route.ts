import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: "NOT_AUTHENTICATED" }, { status: 401 });
    }

    if (!user.stripe_customer_id) {
      return NextResponse.json(
        { ok: false, error: "NO_STRIPE_CUSTOMER" },
        { status: 400 },
      );
    }

    const { getStripe } = await import("@/lib/stripeServer");
    const stripe = getStripe();
    const siteUrl = getSiteUrl().toString();

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${siteUrl}/account`,
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
