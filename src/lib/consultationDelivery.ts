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

/** Deliver via Resend with automatic SMTP fallback.
 *  Shared pattern for operator alerts and customer confirmations — avoids
 *  duplicating the try-Resend-then-SMTP logic for each notification type. */
async function deliverWithFallback(
  label: string,
  hasResend: boolean,
  sendViaResend: () => Promise<void>,
  sendViaSmtp: () => Promise<void>,
): Promise<void> {
  if (hasResend) {
    try {
      await sendViaResend();
      return; // succeeded — done
    } catch (resendErr) {
      console.error(
        `[consultation] Resend ${label} failed, falling back to SMTP:`,
        resendErr instanceof Error ? resendErr.message : resendErr,
      );
    }
  }
  // SMTP fallback (or primary when Resend is not configured)
  try {
    await sendViaSmtp();
  } catch (smtpErr) {
    console.error(
      `[consultation] SMTP ${label} also failed:`,
      smtpErr instanceof Error ? smtpErr.message : smtpErr,
    );
  }
}

export async function notifyConsultationOrder(input: ConsultationInput): Promise<void> {
  const orderedAtIso = new Date().toISOString();
  const deliveryWindow = buildDeliveryWindow(orderedAtIso);
  const customerReplyMailto = buildCustomerReplyMailto({
    customerEmail: input.customerEmail,
    sessionId: input.sessionId,
  });

  const payload: OpsOrderPayload = {
    sessionId: input.sessionId,
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

  // ── Operator alert ──────────────────────────────────────────────────
  // Try Resend first; fall back to SMTP per-recipient on failure so a
  // single Resend outage doesn't silently drop operator notifications.

  const hasResend = Boolean(process.env.RESEND_API_KEY);

  for (const to of recipients) {
    tasks.push(
      deliverWithFallback(
        "alert",
        hasResend,
        async () => {
          const { sendConsultationOrderAlertViaResend } = await import("@/lib/resendDelivery");
          await sendConsultationOrderAlertViaResend({ to, ...payload });
        },
        async () => {
          const { sendConsultationOrderAlertEmail } = await import("@/lib/email");
          await sendConsultationOrderAlertEmail({ to, ...payload });
        },
      ),
    );
  }

  // ── Customer confirmation ───────────────────────────────────────────
  tasks.push(
    deliverWithFallback(
      "confirmation",
      hasResend,
      async () => {
        const { sendConsultationConfirmationViaResend } = await import("@/lib/resendDelivery");
        await sendConsultationConfirmationViaResend({
          to: input.customerEmail,
          focusArea: input.focusArea,
          question: input.question,
          deliveryWindow,
          birthDate: input.birthDate,
          birthTime: input.birthTime,
        });
      },
      async () => {
        const { sendConsultationConfirmationEmail } = await import("@/lib/email");
        await sendConsultationConfirmationEmail({
          to: input.customerEmail,
          focusArea: input.focusArea,
          question: input.question,
          deliveryWindow,
          birthDate: input.birthDate,
          birthTime: input.birthTime,
        });
      },
    ),
  );

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
