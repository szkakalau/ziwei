import nodemailer from "nodemailer";

export type SendReportEmailArgs = {
  to: string;
  reportUrl: string;
  pdfUrl: string;
};

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

export async function sendReportEmail(args: SendReportEmailArgs) {
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
    subject: "Your Zi Wei Destiny Reading ✨",
    text: `Your Zi Wei destiny reading is ready.

This report is for personal insight and entertainment only — not medical, legal, or financial advice.

Open your report:
${args.reportUrl}

Download PDF:
${args.pdfUrl}

Support: ${from}
`,
    html: `
      <div style="font-family: ui-sans-serif, system-ui; line-height: 1.6;">
        <h2 style="margin: 0 0 12px;">Your Zi Wei Destiny Reading ✨</h2>
        <p style="margin: 0 0 10px; font-size: 14px; color:#444;">
          This report uses traditional Zi Wei Dou Shu and software interpretation.
          It is for <strong>personal insight and entertainment only</strong> — not medical, legal, or financial advice.
        </p>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:14px 0;" />
        <p style="margin: 0 0 10px;">Thanks for your purchase. Your reading links are below.</p>
        <p style="margin: 0 0 10px;">
          <a href="${args.reportUrl}" style="display:inline-block; padding:12px 16px; background:#c67b00; color:#0b0b0f; text-decoration:none; border-radius:6px; font-weight:600;">
            Open your report
          </a>
        </p>
        <p style="margin: 0 0 10px;">
          <a href="${args.pdfUrl}">Download PDF</a>
        </p>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:18px 0;" />
        <p style="margin: 0; font-size: 12px; color:#666;">For personal insight and entertainment only.</p>
        <p style="margin: 12px 0 0; color:#555; font-size: 12px;">Support: ${from}</p>
      </div>
    `,
  });
}

