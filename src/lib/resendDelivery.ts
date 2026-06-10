import { Resend } from "resend";
import { getSupportEmail } from "@/lib/brand";
import type { DeliveryWindow, ChartSummary } from "@/lib/opsAutomation";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function focusAreaLabel(focusArea: string) {
  switch (focusArea) {
    case "love":
      return "Love & relationships";
    case "career":
      return "Career";
    case "wealth":
      return "Wealth";
    case "timing":
      return "Timing";
    default:
      return "General reading";
  }
}

function chartSummaryText(summary?: ChartSummary) {
  if (!summary) return "Chart summary unavailable.";
  if (summary.errorCode) {
    return `Chart could not be prepared automatically. Error: ${summary.errorCode}`;
  }
  return [
    `Chart place: ${summary.placeLabel || "—"}`,
    `Apparent solar date: ${summary.apparentSolarDate || "—"}`,
    `Apparent solar time: ${summary.apparentSolarTime || "—"}`,
    `Approximate chart: ${summary.isApproximate ? "Yes" : "No"}`,
  ].join("\n");
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }
  if (!from) {
    throw new Error(
      "Missing RESEND_FROM (e.g. DestinyBlueprint <reports@destinyblueprint.xyz>)",
    );
  }

  return { resend: new Resend(apiKey), from };
}

function opsChecklistText(window: DeliveryWindow) {
  return [
    "Ops checklist:",
    `1. Confirm the order is queued before ${window.dueAtLabel}.`,
    "2. Review the customer's question and chart summary.",
    "3. Write and send the final email reading.",
    "4. Mark the order done in your own tracker after sending.",
  ].join("\n");
}

export async function sendConsultationConfirmationViaResend(args: {
  to: string;
  focusArea: string;
  question: string;
  deliveryWindow: DeliveryWindow;
}) {
  const { resend, from } = getResendClient();
  const supportEmail = getSupportEmail();
  const focusLabel = focusAreaLabel(args.focusArea);
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6;color:#111;">
      <h2 style="margin:0 0 12px;">We received your Zi Wei reading order</h2>
      <p style="margin:0 0 12px;">Thanks for your purchase. Your personalized email reading is now queued.</p>
      <p style="margin:0 0 8px;"><strong>Ordered at:</strong> ${escapeHtml(args.deliveryWindow.orderedAtLabel)}</p>
      <p style="margin:0 0 12px;"><strong>Delivery deadline:</strong> ${escapeHtml(args.deliveryWindow.dueAtLabel)}</p>
      <p style="margin:0 0 8px;"><strong>Focus area:</strong> ${escapeHtml(focusLabel)}</p>
      <p style="margin:0 0 8px;"><strong>Your question:</strong></p>
      <div style="margin:0 0 16px;padding:12px 14px;border:1px solid #e5e5e5;border-radius:8px;background:#f7f7f8;white-space:pre-wrap;">${escapeHtml(args.question)}</div>
      <p style="margin:0 0 12px;">If you need to correct your birth data, email us at <a href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a> as soon as possible.</p>
      <p style="margin:0;font-size:12px;color:#666;">For personal insight and entertainment only.</p>
    </div>
  `;
  try {
    const { error } = await resend.emails.send({
      from,
      to: args.to,
      subject: "We received your Zi Wei reading order",
      html,
    });

    if (error) {
      throw new Error(typeof error === "string" ? error : JSON.stringify(error));
    }
  } catch (err) {
    throw new Error(
      `Failed to send confirmation email: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

export async function sendConsultationOrderAlertViaResend(args: {
  to: string;
  customerEmail: string;
  sessionId: string;
  focusArea: string;
  question: string;
  birthDate: string;
  birthTime: string;
  location: string;
  gender: "male" | "female";
  allowFallback: boolean;
  deliveryWindow: DeliveryWindow;
  customerReplyMailto: string;
  chartSummary?: ChartSummary;
}) {
  const { resend, from } = getResendClient();
  const focusLabel = focusAreaLabel(args.focusArea);
  const chartSummary = chartSummaryText(args.chartSummary);
  const checklist = opsChecklistText(args.deliveryWindow);
  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6;color:#111;">
      <h2 style="margin:0 0 12px;">New Zi Wei consultation order</h2>
      <p style="margin:0 0 8px;"><strong>Session ID:</strong> ${escapeHtml(args.sessionId)}</p>
      <p style="margin:0 0 8px;"><strong>Customer email:</strong> ${escapeHtml(args.customerEmail)}</p>
      <p style="margin:0 0 8px;"><strong>Ordered at:</strong> ${escapeHtml(args.deliveryWindow.orderedAtLabel)}</p>
      <p style="margin:0 0 16px;"><strong>Due by:</strong> ${escapeHtml(args.deliveryWindow.dueAtLabel)}</p>
      <p style="margin:0 0 8px;"><strong>Focus area:</strong> ${escapeHtml(focusLabel)}</p>
      <p style="margin:0 0 8px;"><strong>Question:</strong></p>
      <div style="margin:0 0 16px;padding:12px 14px;border:1px solid #e5e5e5;border-radius:8px;background:#f7f7f8;white-space:pre-wrap;">${escapeHtml(args.question)}</div>
      <p style="margin:0 0 8px;"><strong>Birth date:</strong> ${escapeHtml(args.birthDate)}</p>
      <p style="margin:0 0 8px;"><strong>Birth time:</strong> ${escapeHtml(args.birthTime)}</p>
      <p style="margin:0 0 8px;"><strong>Gender:</strong> ${escapeHtml(args.gender)}</p>
      <p style="margin:0 0 8px;"><strong>Location:</strong> ${escapeHtml(args.location)}</p>
      <p style="margin:0 0 16px;"><strong>Approximate time allowed:</strong> ${args.allowFallback ? "Yes" : "No"}</p>
      <p style="margin:0 0 12px;"><a href="${escapeHtml(args.customerReplyMailto)}">Open a prefilled reply to the customer</a></p>
      <pre style="margin:0;padding:12px 14px;border:1px solid #e5e5e5;border-radius:8px;background:#fff;font-family:ui-monospace, SFMono-Regular, monospace;font-size:13px;white-space:pre-wrap;">${escapeHtml(chartSummary)}</pre>
      <pre style="margin:12px 0 0;padding:12px 14px;border:1px solid #e5e5e5;border-radius:8px;background:#fff;font-family:ui-monospace, SFMono-Regular, monospace;font-size:13px;white-space:pre-wrap;">${escapeHtml(checklist)}</pre>
    </div>
  `;

  try {
    const { error } = await resend.emails.send({
      from,
      to: args.to,
      subject: `New Zi Wei consultation order · ${focusLabel}`,
      html,
    });

    if (error) {
      throw new Error(typeof error === "string" ? error : JSON.stringify(error));
    }
  } catch (err) {
    throw new Error(
      `Failed to send ops alert email: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}
