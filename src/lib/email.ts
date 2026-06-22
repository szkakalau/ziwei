import nodemailer from "nodemailer";
import { getSupportEmail } from "@/lib/brand";
import type { DeliveryWindow, ChartSummary } from "@/lib/opsAutomation";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !portRaw || !user || !pass || !from) {
    throw new Error(
      "Missing SMTP config (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM)",
    );
  }

  const port = Number(portRaw);
  if (!Number.isFinite(port)) {
    throw new Error("Invalid SMTP_PORT");
  }

  return { host, port, user, pass, from };
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
  if (summary.chartText) return summary.chartText;
  return [
    `Chart place: ${summary.placeLabel || "—"}`,
    `Apparent solar date: ${summary.apparentSolarDate || "—"}`,
    `Apparent solar time: ${summary.apparentSolarTime || "—"}`,
    `Approximate chart: ${summary.isApproximate ? "Yes" : "No"}`,
  ].join("\n");
}

async function sendSmtpMail(args: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) {
  const { host, port, user, pass, from } = getSmtpConfig();
  const secure = port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html,
  });
}

function opsChecklistText(window: DeliveryWindow) {
  return [
    "Ops checklist:",
    `1. Confirm the order is queued before ${window.dueAtLabel}.`,
    "2. Review the customer's question and chart summary.",
    "3. Write and send the final email reading.",
    "4. Store the reading via API so the customer can view it in-app:",
    '   curl -X POST https://www.destinyblueprint.xyz/api/operator/store-reading \\',
    `     -H "Authorization: Bearer $OPERATOR_API_SECRET" \\`,
    `     -H "Content-Type: application/json" \\`,
    `     -d \'{"userId":"<USER_ID>","content":"<READING_CONTENT>"}\'`,
    "5. Mark the order done in your own tracker after storing.",
  ].join("\n");
}

export async function sendConsultationConfirmationEmail(args: {
  to: string;
  focusArea: string;
  question: string;
  deliveryWindow: DeliveryWindow;
  birthDate?: string;
  birthTime?: string;
}) {
  const supportEmail = getSupportEmail();
  const focusLabel = focusAreaLabel(args.focusArea);
  const birthLine = args.birthDate
    ? `\nBirth data on file: ${args.birthDate}${args.birthTime ? " " + args.birthTime : ""}\n`
    : "";
  const birthLineHtml = args.birthDate
    ? `<p style="margin: 0 0 8px;"><strong>Birth data on file:</strong> ${escapeHtml(args.birthDate)}${args.birthTime ? " " + escapeHtml(args.birthTime) : ""}</p>`
    : "";

  await sendSmtpMail({
    to: args.to,
    subject: "We received your Zi Wei reading order",
    text: `Thanks for your order.

We received your Zi Wei Dou Shu reading request.

Ordered at: ${args.deliveryWindow.orderedAtLabel}
Delivery deadline: ${args.deliveryWindow.dueAtLabel}

Focus area: ${focusLabel}
Your question:
${args.question}
${birthLine}
If you need to correct your birth data, reply to ${supportEmail} as soon as possible.

For personal insight and entertainment only.`,
    html: `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.6; color:#111;">
        <h2 style="margin: 0 0 12px;">We received your Zi Wei reading order</h2>
        <p style="margin: 0 0 12px;">Thanks for your purchase. Your personalized email reading is now queued.</p>
        <p style="margin: 0 0 8px;"><strong>Ordered at:</strong> ${escapeHtml(args.deliveryWindow.orderedAtLabel)}</p>
        <p style="margin: 0 0 12px;"><strong>Delivery deadline:</strong> ${escapeHtml(args.deliveryWindow.dueAtLabel)}</p>
        <p style="margin: 0 0 8px;"><strong>Focus area:</strong> ${escapeHtml(focusLabel)}</p>
        <p style="margin: 0 0 8px;"><strong>Your question:</strong></p>
        <div style="margin:0 0 16px;padding:12px 14px;border:1px solid #e5e5e5;border-radius:8px;background:#f7f7f8;white-space:pre-wrap;">${escapeHtml(args.question)}</div>
        ${birthLineHtml}
        <p style="margin: 0 0 12px;">If you need to correct your birth data, email us at <a href="mailto:${escapeHtml(supportEmail)}">${escapeHtml(supportEmail)}</a> as soon as possible.</p>
        <p style="margin: 0; font-size: 12px; color:#666;">For personal insight and entertainment only.</p>
      </div>
    `,
  });
}

export async function sendConsultationOrderAlertEmail(args: {
  to: string;
  userId?: string;
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
  chartSummary?: {
    placeLabel?: string;
    apparentSolarDate?: string;
    apparentSolarTime?: string;
    isApproximate?: boolean;
    errorCode?: string | null;
  };
}) {
  const focusLabel = focusAreaLabel(args.focusArea);
  const chartSummary = chartSummaryText(args.chartSummary);
  const checklist = opsChecklistText(args.deliveryWindow);

  await sendSmtpMail({
    to: args.to,
    subject: `New Zi Wei consultation order · ${focusLabel}`,
    text: `A new Zi Wei consultation order has been received.

Session ID: ${args.sessionId}${args.userId ? `\nUser ID: ${args.userId}` : ""}
Customer email: ${args.customerEmail}
Ordered at: ${args.deliveryWindow.orderedAtLabel}
Due by: ${args.deliveryWindow.dueAtLabel}
Focus area: ${focusLabel}
Question:
${args.question}

Birth data:
- Date: ${args.birthDate}
- Time: ${args.birthTime}
- Gender: ${args.gender}
- Location: ${args.location}
- Approximate time allowed: ${args.allowFallback ? "Yes" : "No"}

${chartSummary}

Quick reply link:
${args.customerReplyMailto}

${checklist}
`,
    html: `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.6; color:#111;">
        <h2 style="margin: 0 0 12px;">New Zi Wei consultation order</h2>
        <p style="margin: 0 0 8px;"><strong>Session ID:</strong> ${escapeHtml(args.sessionId)}</p>
        <p style="margin: 0 0 8px;"><strong>Customer email:</strong> ${escapeHtml(args.customerEmail)}</p>
        <p style="margin: 0 0 8px;"><strong>Ordered at:</strong> ${escapeHtml(args.deliveryWindow.orderedAtLabel)}</p>
        <p style="margin: 0 0 16px;"><strong>Due by:</strong> ${escapeHtml(args.deliveryWindow.dueAtLabel)}</p>
        <p style="margin: 0 0 8px;"><strong>Focus area:</strong> ${escapeHtml(focusLabel)}</p>
        <p style="margin: 0 0 8px;"><strong>Question:</strong></p>
        <div style="margin:0 0 16px;padding:12px 14px;border:1px solid #e5e5e5;border-radius:8px;background:#f7f7f8;white-space:pre-wrap;">${escapeHtml(args.question)}</div>
        <p style="margin: 0 0 8px;"><strong>Birth date:</strong> ${escapeHtml(args.birthDate)}</p>
        <p style="margin: 0 0 8px;"><strong>Birth time:</strong> ${escapeHtml(args.birthTime)}</p>
        <p style="margin: 0 0 8px;"><strong>Gender:</strong> ${escapeHtml(args.gender)}</p>
        <p style="margin: 0 0 8px;"><strong>Location:</strong> ${escapeHtml(args.location)}</p>
        <p style="margin: 0 0 16px;"><strong>Approximate time allowed:</strong> ${args.allowFallback ? "Yes" : "No"}</p>
        <p style="margin: 0 0 12px;"><a href="${escapeHtml(args.customerReplyMailto)}">Open a prefilled reply to the customer</a></p>
        <pre style="margin:0;padding:12px 14px;border:1px solid #e5e5e5;border-radius:8px;background:#fff;font-family:ui-monospace, SFMono-Regular, monospace;font-size:13px;white-space:pre-wrap;">${escapeHtml(chartSummary)}</pre>
        <pre style="margin:12px 0 0;padding:12px 14px;border:1px solid #e5e5e5;border-radius:8px;background:#fff;font-family:ui-monospace, SFMono-Regular, monospace;font-size:13px;white-space:pre-wrap;">${escapeHtml(checklist)}</pre>
      </div>
    `,
  });
}
