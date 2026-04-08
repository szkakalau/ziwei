import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripeServer";
import { getSiteUrl } from "@/lib/site";
import { sendReportEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const stripe = getStripe();
  const sig = (await headers()).get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json(
      { ok: false, error: "MISSING_STRIPE_WEBHOOK_SECRET" },
      { status: 400 },
    );
  }

  const raw = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_SIGNATURE" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as {
        id: string;
        customer_details?: { email?: string | null } | null;
      };

      const email = session.customer_details?.email ?? "";
      if (email) {
        const siteUrl = getSiteUrl().toString();
        const reportUrl = `${siteUrl}/report?session_id=${encodeURIComponent(session.id)}`;
        const pdfUrl = `${siteUrl}/api/report/pdf?session_id=${encodeURIComponent(session.id)}`;
        await sendReportEmail({ to: email, reportUrl, pdfUrl });
      }
    }
  } catch {
    // If email fails, return 500 so Stripe retries.
    return NextResponse.json({ ok: false, error: "WEBHOOK_HANDLER_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

