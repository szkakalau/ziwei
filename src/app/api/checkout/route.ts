import { NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/site";
import { getStripe } from "@/lib/stripeServer";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const priceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
    if (!priceId) {
      return NextResponse.json(
        { ok: false, error: "MISSING_STRIPE_SUBSCRIPTION_PRICE_ID" },
        { status: 500 },
      );
    }

    const { getCurrentUser } = await import("@/lib/auth");
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "NOT_AUTHENTICATED" },
        { status: 401 },
      );
    }

    // Guard against infinite-free-trial abuse: once a user has consumed a
    // trial (has_used_trial=true), they can't get another one. But a user who
    // has used their trial can still subscribe (pay) without a trial — allow
    // that when body.allowTrial === false. Also reject if already active or
    // trial unexpired.
    const status = user.subscription_status;
    const trialEndsAt = user.trial_ends_at ? new Date(user.trial_ends_at) : null;
    if (status === "active") {
      return NextResponse.json({ ok: false, error: "TRIAL_ACTIVE" }, { status: 400 });
    }
    if (status === "trial" && trialEndsAt && trialEndsAt > new Date()) {
      return NextResponse.json({ ok: false, error: "TRIAL_ACTIVE" }, { status: 400 });
    }

    // Cap body size before parsing — focusArea+question are tiny; reject oversized.
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (contentLength > 16_384) {
      return NextResponse.json({ ok: false, error: "BODY_TOO_LARGE" }, { status: 413 });
    }

    // Parse the consultation form (focusArea/question) sent from the snapshot
    // page so the human-written email reading can use them. Also read
    // birth data + allowTrial for delivery notification and trial gating.
    let focusArea: string | undefined;
    let question: string | undefined;
    let birthDate: string | undefined;
    let birthTime: string | undefined;
    let location: string | undefined;
    let gender: "male" | "female" | undefined;
    let allowFallback = false;
    let allowTrial = true;
    try {
      const body = await request.json() as Record<string, unknown>;
      // Defense against oversized payloads (Content-Length is client-controlled
      // and can be missing/understated). Cap the parsed JSON size.
      if (JSON.stringify(body).length > 16_384) {
        return NextResponse.json({ ok: false, error: "BODY_TOO_LARGE" }, { status: 413 });
      }
      if (typeof body?.focusArea === "string") focusArea = body.focusArea.slice(0, 100);
      // Stripe metadata values cap at 500 chars; slice to match.
      if (typeof body?.question === "string") question = body.question.slice(0, 500);
      if (typeof body?.birthDate === "string") birthDate = body.birthDate;
      if (typeof body?.birthTime === "string") birthTime = body.birthTime;
      if (typeof body?.location === "string") location = body.location.slice(0, 200);
      if (body?.gender === "male" || body?.gender === "female") gender = body.gender;
      if (body?.allowFallback === true) allowFallback = true;
      if (body?.allowTrial === false) allowTrial = false;
    } catch {
      /* no body or invalid JSON — proceed without consultation data */
    }

    // If the user already used a trial and this call wants a new trial, reject.
    // allowTrial=false means they're subscribing directly without a trial — allow.
    if (user.has_used_trial === true && allowTrial) {
      return NextResponse.json({ ok: false, error: "TRIAL_USED" }, { status: 400 });
    }

    // Server-side validation: a consultation order (focusArea/question) is
    // required on the trial path (snapshot form enforces it client-side, but
    // the server is the trust boundary). The allowTrial=false path (direct
    // subscribe from /daily) legitimately omits consultation data.
    const hasConsultation = !!(focusArea && question && question.trim().length >= 10);
    if (allowTrial && !hasConsultation) {
      return NextResponse.json(
        { ok: false, error: "CONSULTATION_REQUIRED", message: "Focus area and a 10+ char question are required." },
        { status: 400 },
      );
    }

    const siteUrl = getSiteUrl().toString();
    const stripe = getStripe();

    let customerId: string;
    if (user.stripe_customer_id) {
      customerId = user.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
    }

    // Grant trial access immediately — don't wait for the async webhook.
    // Mark has_used_trial=true so this user can never get another free trial.
    // Skip the trial grant when allowTrial=false (user already used a trial and
    // is now subscribing directly); Stripe subscription_data.trial_period_days
    // is also omitted in that case.
    const { updateSubscription, updateConsultation } = await import("@/lib/db");
    if (allowTrial) {
      await updateSubscription(user.id, {
        status: "trial",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        stripeCustomerId: customerId,
        hasUsedTrial: true,
      });
    } else {
      // Subscribing without trial — record the customer id; status flips to
      // active via the Stripe webhook once payment completes.
      await updateSubscription(user.id, {
        status: status ?? "free",
        stripeCustomerId: customerId,
      });
    }
    if (hasConsultation) {
      await updateConsultation(user.id, { focusArea: focusArea!, question: question! });
    }

    const subscriptionData: { trial_period_days?: number; metadata: Record<string, string> } = {
      metadata: { userId: user.id, focusArea: focusArea ?? "", question: question ?? "" },
    };
    if (allowTrial) subscriptionData.trial_period_days = 7;

    // Consultation orders land on /success (which explains the 24-48h human
    // reading). Pure subscription checkouts (allowTrial=false from /daily)
    // land on /daily so the user reaches their horoscope — /success would
    // falsely promise a human reading that won't come.
    const successPath = hasConsultation ? "/success" : "/daily";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: subscriptionData,
      success_url: `${siteUrl}${successPath}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#birth-form`,
      metadata: { userId: user.id },
      custom_text: {
        submit: {
          message: allowTrial
            ? "7-day free trial, then $4.99/month. Cancel anytime. Your personalized Zi Wei Dou Shu horoscope will arrive every morning."
            : "$4.99/month. Cancel anytime. Your personalized Zi Wei Dou Shu horoscope will arrive every morning.",
        },
      },
    });

    // Operator notification for the human-written email consultation. Await so
    // the emails actually send — Vercel serverless can kill un-awaited promises
    // after the response returns. Failure is caught so checkout still succeeds.
    if (hasConsultation) {
      const { notifyConsultationOrder } = await import("@/lib/consultationDelivery");
      const { formatChartCompact } = await import("@/lib/chartFormatter");
      const chartText = user.chart_data
        ? formatChartCompact(user.chart_data as Parameters<typeof formatChartCompact>[0])
        : undefined;
      try {
        await notifyConsultationOrder({
          sessionId: session.id,
          customerEmail: user.email,
          focusArea: focusArea!,
          question: question!,
          birthDate,
          birthTime,
          location,
          gender,
          allowFallback,
          chartText,
        });
      } catch (err) {
        console.error("[checkout] consultation notification failed:", err);
      }
    }

    return NextResponse.json({ ok: true, url: session.url });
  } catch {
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
