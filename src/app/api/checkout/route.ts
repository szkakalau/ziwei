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
  offerStartAt?: number;
  focusArea?: string;
  question?: string;
};

const VALID_FOCUS_AREAS = new Set([
  "general",
  "love",
  "career",
  "wealth",
  "timing",
]);

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
    const offerStartAt = typeof body.offerStartAt === "number" ? body.offerStartAt : null;
    const focusAreaRaw = typeof body.focusArea === "string" ? body.focusArea.trim().toLowerCase() : "";
    const focusArea = VALID_FOCUS_AREAS.has(focusAreaRaw) ? focusAreaRaw : "general";
    const question = typeof body.question === "string" ? body.question.trim() : "";

    if (!birthDate || !birthTime || !location) {
      return NextResponse.json(
        { ok: false, error: "MISSING_FIELDS" },
        { status: 400 },
      );
    }

    if (question.length < 10) {
      return NextResponse.json(
        { ok: false, error: "MISSING_CONSULTATION_DETAILS" },
        { status: 400 },
      );
    }

    const siteUrl = getSiteUrl().toString();
    const stripe = getStripe();

    const couponId = process.env.STRIPE_COUPON_50_OFF_ID;
    const now = Date.now();
    const offerActive =
      typeof offerStartAt === "number" &&
      Number.isFinite(offerStartAt) &&
      offerStartAt <= now + 30_000 &&
      now - offerStartAt < 15 * 60 * 1000;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#birth-form`,
      discounts: offerActive && couponId ? [{ coupon: couponId }] : undefined,
      metadata: {
        birthDate,
        birthTime,
        gender,
        location,
        allowFallback: allowFallback ? "true" : "false",
        offerActive: offerActive ? "true" : "false",
        focusArea,
        question: question.slice(0, 500),
      },
      custom_text: {
        submit: {
          message:
            "You’re booking a human-written Zi Wei Dou Shu email reading. We will send an order confirmation right away and deliver your reading within 24-48 hours.",
        },
      },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
