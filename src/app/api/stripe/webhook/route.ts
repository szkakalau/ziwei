import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripeServer";
import {
  sendConsultationConfirmationEmail,
  sendConsultationOrderAlertEmail,
} from "@/lib/email";
import {
  sendConsultationConfirmationViaResend,
  sendConsultationOrderAlertViaResend,
} from "@/lib/resendDelivery";
import { computeBirthChart } from "@/lib/computeBirthChart";
import { getSupportEmail } from "@/lib/brand";
import {
  buildCustomerReplyMailto,
  buildDeliveryWindow,
  getOrderNotificationRecipients,
  sendOpsWebhook,
} from "@/lib/opsAutomation";

export const runtime = "nodejs";

type CheckoutSessionLike = {
  id: string;
  customer_details?: { email?: string | null } | null;
  customer_email?: string | null;
  metadata?: Record<string, string> | null;
};

function sessionEmail(session: CheckoutSessionLike): string {
  const a = session.customer_details?.email?.trim();
  if (a) return a;
  const b = session.customer_email?.trim();
  return b ?? "";
}

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
      const session = event.data.object as CheckoutSessionLike;
      const email = sessionEmail(session);
      if (!email) {
        return NextResponse.json({ ok: true });
      }

      const md = session.metadata ?? {};
      const birthDate = md.birthDate ?? "";
      const birthTime = md.birthTime ?? "12:00";
      const location = md.location ?? "";
      const gender = md.gender === "female" ? "female" : "male";
      const allowFallback = md.allowFallback === "true";
      const focusArea = md.focusArea ?? "general";
      const question = md.question ?? "";
      const orderNotificationEmail = getOrderNotificationRecipients().join(", ");
      const orderedAtIso =
        typeof event.created === "number"
          ? new Date(event.created * 1000).toISOString()
          : new Date().toISOString();
      const deliveryWindow = buildDeliveryWindow(orderedAtIso);
      const customerReplyMailto = buildCustomerReplyMailto({
        customerEmail: email,
        sessionId: session.id,
      });

      let chartSummary:
        | {
            placeLabel?: string;
            apparentSolarDate?: string;
            apparentSolarTime?: string;
            isApproximate?: boolean;
            errorCode?: string | null;
          }
        | undefined;

      if (birthDate && location) {
        const chartResult = await computeBirthChart({
          birthDate,
          birthTime,
          gender,
          location,
          allowFallback,
        });

        if (chartResult.ok) {
          chartSummary = {
            placeLabel: chartResult.meta.placeLabel,
            apparentSolarDate: chartResult.meta.apparentSolarDate,
            apparentSolarTime: chartResult.meta.apparentSolarTime,
            isApproximate: chartResult.meta.isApproximate,
            errorCode: null,
          };
        } else {
          chartSummary = {
            errorCode: chartResult.errorCode,
          };
        }
      }

      const useResend = Boolean(process.env.RESEND_API_KEY?.trim());
      if (useResend) {
        try {
          await sendConsultationConfirmationViaResend({
            to: email,
            focusArea,
            question,
            deliveryWindow,
          });
          await sendConsultationOrderAlertViaResend({
            to: orderNotificationEmail,
            customerEmail: email,
            sessionId: session.id,
            focusArea,
            question,
            birthDate,
            birthTime,
            location,
            gender,
            allowFallback,
            chartSummary,
            deliveryWindow,
            customerReplyMailto,
          });
        } catch {
          await sendConsultationConfirmationEmail({
            to: email,
            focusArea,
            question,
            deliveryWindow,
          });
          await sendConsultationOrderAlertEmail({
            to: orderNotificationEmail,
            customerEmail: email,
            sessionId: session.id,
            focusArea,
            question,
            birthDate,
            birthTime,
            location,
            gender,
            allowFallback,
            chartSummary,
            deliveryWindow,
            customerReplyMailto,
          });
        }
      } else {
        await sendConsultationConfirmationEmail({
          to: email,
          focusArea,
          question,
          deliveryWindow,
        });
        await sendConsultationOrderAlertEmail({
          to: orderNotificationEmail,
          customerEmail: email,
          sessionId: session.id,
          focusArea,
          question,
          birthDate,
          birthTime,
          location,
          gender,
          allowFallback,
          chartSummary,
          deliveryWindow,
          customerReplyMailto,
        });
      }

      try {
        await sendOpsWebhook({
          sessionId: session.id,
          customerEmail: email,
          focusArea,
          question,
          birthDate,
          birthTime,
          location,
          gender,
          allowFallback,
          chartSummary,
          deliveryWindow,
          customerReplyMailto,
        });
      } catch (error) {
        console.error("[ops-webhook]", error);
      }
    }
  } catch {
    return NextResponse.json({ ok: false, error: "WEBHOOK_HANDLER_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
