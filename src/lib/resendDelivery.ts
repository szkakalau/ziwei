import { Resend } from "resend";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type SendPaidReportEmailArgs = {
  to: string;
  reportUrl: string;
  pdfUrl: string;
  /** Full AI report body (plain text). */
  aiReportText?: string | null;
};

/**
 * Sends the post-purchase email via Resend.
 * Requires RESEND_API_KEY and RESEND_FROM (verified sender in Resend).
 */
export async function sendPaidReportViaResend(args: SendPaidReportEmailArgs) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }
  if (!from) {
    throw new Error("Missing RESEND_FROM (e.g. Destiny <reports@yourdomain.com>)");
  }

  const resend = new Resend(apiKey);

  const intro =
    args.aiReportText && args.aiReportText.length > 0
      ? "<p>Thanks for your purchase. Your personalized reading is below. You can also open the report on the site or download the PDF.</p>"
      : "<p>Thanks for your purchase. Your report is ready on the site. We could not attach the AI-written reading this time (see support if needed).</p>";

  const bodyBlock =
    args.aiReportText && args.aiReportText.length > 0
      ? `<div style="margin:20px 0;padding:16px;background:#f7f7f8;border-radius:8px;border:1px solid #e5e5e5;">
           <p style="margin:0 0 8px;font-weight:600;">Your reading</p>
           <pre style="margin:0;white-space:pre-wrap;font-family:ui-sans-serif,system-ui,sans-serif;font-size:14px;line-height:1.6;color:#222;">${escapeHtml(
             args.aiReportText,
           )}</pre>
         </div>`
      : "";

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;line-height:1.6;color:#111;">
      <h2 style="margin:0 0 12px;">Your Zi Wei Destiny Report</h2>
      ${intro}
      ${bodyBlock}
      <p style="margin:16px 0 8px;">
        <a href="${escapeHtml(args.reportUrl)}" style="display:inline-block;padding:12px 16px;background:#c67b00;color:#0b0b0f;text-decoration:none;border-radius:6px;font-weight:600;">
          Open your report
        </a>
      </p>
      <p style="margin:0 0 16px;">
        <a href="${escapeHtml(args.pdfUrl)}">Download PDF</a>
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from,
    to: args.to,
    subject: "Your Zi Wei Destiny Report is ready ✨",
    html,
  });

  if (error) {
    throw new Error(typeof error === "string" ? error : JSON.stringify(error));
  }
}
