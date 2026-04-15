import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, Clock, Lock } from "lucide-react";

const items = [
  {
    icon: BadgeCheck,
    title: "30-Day Money-Back Guarantee",
    body: "If your reading doesn't resonate with you, just email us and we'll refund you 100% — no questions asked.",
  },
  {
    icon: Clock,
    title: "Delivered In Minutes",
    body: "No waiting weeks for a human astrologer. Your full report arrives in your inbox within 2-5 minutes after purchase.",
  },
  {
    icon: Lock,
    title: "Secure Checkout",
    body: "All payments are processed by Stripe, one of the world's largest and most secure payment providers. Your data is always protected.",
  },
] as const;

export default function RiskFree() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
      <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
        Try It 100% Risk-Free
      </h2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {items.map((i) => (
          <Card key={i.title} className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-gold/25 bg-gold/10">
                  <i.icon className="h-5 w-5 text-gold" aria-hidden />
                </span>
                <CardTitle className="text-xl">{i.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-body text-sm leading-relaxed text-ink-muted">
                {i.body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

