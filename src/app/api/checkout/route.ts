import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { getStripe } from "@/lib/stripeServer";

export const runtime = "nodejs";

type Body = {
  birthDate?: string;
  birthTime?: string;
  gender?: "male" | "female";
  location?: string;
  allowFallback?: boolean;
  email?: string;
};

export async function POST(request: Request) {
  try {
    const priceId = process.env.STRIPE_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { ok: false, error: "MISSING_STRIPE_PRICE_ID" },
        { status: 500 },
      );
    }

    let body: Body;
    try {
      body = (await request.json()) as Body;
    } catch {
      return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
    }

    const birthDate = typeof body.birthDate === "string" ? body.birthDate : "";
    const birthTime = typeof body.birthTime === "string" ? body.birthTime : "";
    const location = typeof body.location === "string" ? body.location : "";
    const gender = body.gender === "female" ? "female" : "male";
    const allowFallback = body.allowFallback === true;
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!birthDate || !birthTime || !location) {
      return NextResponse.json(
        { ok: false, error: "MISSING_FIELDS" },
        { status: 400 },
      );
    }

    const siteUrl = getSiteUrl().toString();
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/preview`,
      customer_email: email || undefined,
      metadata: {
        birthDate,
        birthTime,
        gender,
        location,
        allowFallback: allowFallback ? "true" : "false",
      },
      custom_text: {
        submit: {
          message:
            "You’re purchasing a full Zi Wei Dou Shu destiny report (30+ pages). Instant access after payment.",
        },
      },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

