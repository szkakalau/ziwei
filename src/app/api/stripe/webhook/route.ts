import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getStripe } from "@/lib/stripeServer";
import { getSiteUrl } from "@/lib/site";
import { sendReportEmail } from "@/lib/email";
import { sendPaidReportViaResend } from "@/lib/resendDelivery";
import { computeBirthChart } from "@/lib/computeBirthChart";
import { chartToAiPrompt } from "@/lib/chartToAiPrompt";
import { generateDeepSeekReport } from "@/lib/deepseekReport";

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

      const siteUrl = getSiteUrl().toString();
      const reportUrl = `${siteUrl}/report?session_id=${encodeURIComponent(session.id)}`;
      const pdfUrl = `${siteUrl}/api/report/pdf?session_id=${encodeURIComponent(session.id)}`;

      const md = session.metadata ?? {};
      const birthDate = md.birthDate ?? "";
      const birthTime = md.birthTime ?? "12:00";
      const location = md.location ?? "";
      const gender = md.gender === "female" ? "female" : "male";
      const allowFallback = md.allowFallback === "true";

      let aiReportText: string | null = null;

      if (birthDate && location) {
        const chartResult = await computeBirthChart({
          birthDate,
          birthTime,
          gender,
          location,
          allowFallback,
        });

        if (chartResult.ok) {
          const prompt = chartToAiPrompt({
            chart: chartResult.chart,
            meta: chartResult.meta,
          });
          try {
            aiReportText = await generateDeepSeekReport(prompt);
          } catch {
            aiReportText = null;
          }
        }
      }

      const useResend = Boolean(process.env.RESEND_API_KEY?.trim());
      if (useResend) {
        try {
          await sendPaidReportViaResend({
            to: email,
            reportUrl,
            pdfUrl,
            aiReportText,
          });
        } catch {
          await sendReportEmail({ to: email, reportUrl, pdfUrl });
        }
      } else {
        await sendReportEmail({ to: email, reportUrl, pdfUrl });
      }
    }
  } catch {
    return NextResponse.json({ ok: false, error: "WEBHOOK_HANDLER_ERROR" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
