/**
 * Wire a paid consultation order to operator notification.
 *
 * The snapshot page collects focusArea + question; /api/checkout persists them
 * and stashes them in Stripe metadata. This module fires the operator-facing
 * notifications (Resend email, SMTP fallback, ops webhook) so a human-written
 * reading actually gets produced and delivered. Fire-and-forget — checkout
 * must not block or fail on delivery hiccups.
 */
import {
  buildDeliveryWindow,
  buildCustomerReplyMailto,
  getOrderNotificationRecipients,
  sendOpsWebhook,
  type OpsOrderPayload,
} from "@/lib/opsAutomation";

type ConsultationInput = {
  sessionId: string;
  userId?: string;
  customerEmail: string;
  focusArea: string;
  question: string;
  birthDate?: string;
  birthTime?: string;
  location?: string;
  gender?: "male" | "female";
  allowFallback?: boolean;
  chartText?: string;
};

export async function notifyConsultationOrder(input: ConsultationInput): Promise<void> {
  const orderedAtIso = new Date().toISOString();
  const deliveryWindow = buildDeliveryWindow(orderedAtIso);
  const customerReplyMailto = buildCustomerReplyMailto({
    customerEmail: input.customerEmail,
    sessionId: input.sessionId,
  });

  const payload: OpsOrderPayload = {
    sessionId: input.sessionId,
    userId: input.userId ?? "",
    customerEmail: input.customerEmail,
    focusArea: input.focusArea,
    question: input.question,
    birthDate: input.birthDate ?? "",
    birthTime: input.birthTime ?? "",
    location: input.location ?? "",
    gender: input.gender ?? "male",
    allowFallback: input.allowFallback ?? false,
    deliveryWindow,
    customerReplyMailto,
    chartSummary: input.chartText ? { chartText: input.chartText } : undefined,
  };

  const recipients = getOrderNotificationRecipients();
  const tasks: Promise<unknown>[] = [];

  // Operator-facing order alert. Prefer Resend if configured; fall back to SMTP.
  if (process.env.RESEND_API_KEY) {
    const { sendConsultationOrderAlertViaResend } = await import("@/lib/resendDelivery");
    for (const to of recipients) {
      tasks.push(
        sendConsultationOrderAlertViaResend({ to, ...payload }).catch((err) =>
          console.error("[consultation] Resend alert failed:", err),
        ),
      );
    }
    // Customer confirmation email (the success page promises this).
    tasks.push(
      (async () => {
        const { sendConsultationConfirmationViaResend } = await import("@/lib/resendDelivery");
        await sendConsultationConfirmationViaResend({
          to: input.customerEmail,
          focusArea: input.focusArea,
          question: input.question,
          deliveryWindow,
          birthDate: input.birthDate,
          birthTime: input.birthTime,
        });
      })().catch((err) => console.error("[consultation] Resend confirmation failed:", err)),
    );
  } else {
    const { sendConsultationOrderAlertEmail } = await import("@/lib/email");
    for (const to of recipients) {
      tasks.push(
        sendConsultationOrderAlertEmail({ to, ...payload }).catch((err) =>
          console.error("[consultation] SMTP alert failed:", err),
        ),
      );
    }
    // Customer confirmation via SMTP fallback.
    tasks.push(
      (async () => {
        const { sendConsultationConfirmationEmail } = await import("@/lib/email");
        await sendConsultationConfirmationEmail({
          to: input.customerEmail,
          focusArea: input.focusArea,
          question: input.question,
          deliveryWindow,
          birthDate: input.birthDate,
          birthTime: input.birthTime,
        });
      })().catch((err) => console.error("[consultation] SMTP confirmation failed:", err)),
    );
  }

  // Ops webhook (Slack/Discord/etc.) — only if configured. Send ONLY minimal
  // order metadata: no PII (birth data, question, chart, gender). The operator
  // email alert carries the full details; the webhook is just a ping.
  if (process.env.OPS_WEBHOOK_URL) {
    const webhookPayload: OpsOrderPayload = {
      sessionId: payload.sessionId,
      customerEmail: payload.customerEmail,
      focusArea: payload.focusArea,
      question: "", // redacted — see the alert email for the full question
      birthDate: "",
      birthTime: "",
      location: "",
      gender: "male",
      allowFallback: false,
      deliveryWindow: payload.deliveryWindow,
      customerReplyMailto: payload.customerReplyMailto,
    };
    tasks.push(
      sendOpsWebhook(webhookPayload).catch((err) => console.error("[consultation] ops webhook failed:", err)),
    );
  }

  // Await with a timeout guard so a slow email server can't block checkout
  // indefinitely (Vercel serverless function timeout). Tasks that don't
  // finish in time are abandoned but already-sent emails still deliver.
  await Promise.race([
    Promise.allSettled(tasks),
    new Promise<void>((resolve) => setTimeout(resolve, 8_000)),
  ]);
}
