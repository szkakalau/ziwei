import { HelpCircle, MessageCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "What is Zi Wei Dou Shu? Is it like Western astrology?",
    a: "Zi Wei Dou Shu (Purple Star Astrology) is an ancient Chinese system that maps over 100 stars across 12 life palaces using your exact birth time and location. It's fundamentally more detailed than Western sun-sign astrology — instead of one reading for 1/12th of the population, your chart is unique to you.",
  },
  {
    q: "Is this a human reading or AI-generated?",
    a: "Your $99 email reading is written by a real human Zi Wei practitioner. We use software to compute your chart accurately (including apparent solar time correction), but the interpretation, writing, and delivery are all done by a person within 24-48 hours.",
  },
  {
    q: "Do I need my exact birth time?",
    a: "The more accurate your birth time, the more precise your chart. If you know your exact time, great. If you only know approximately (e.g., 'morning' or 'afternoon'), you can still order — we'll note the approximation. If you don't know at all, we can still generate a chart using noon, but the precision will be reduced.",
  },
  {
    q: "What's the difference between the free snapshot and the paid reading?",
    a: "The free snapshot gives you a preview of your personality based on your Zi Wei chart — core traits, strengths, and growth areas. The paid $99 email reading is a full human-written analysis covering your 12 life palaces, 10-year destiny cycles, love, career, wealth, and hidden talents, with personalized timing advice.",
  },
  {
    q: "What if I'm not satisfied with my reading?",
    a: "We offer a 30-day no-questions-asked money-back guarantee. If your reading doesn't resonate, email us at support@destinyblueprint.xyz and we'll refund 100% of your payment. We've built our reputation on this guarantee.",
  },
  {
    q: "Is this scientifically validated?",
    a: "Zi Wei Dou Shu is a traditional Chinese metaphysical system refined over 1,000+ years. It is not a replacement for professional medical, legal, or financial advice. Think of it as a framework for self-understanding — similar to personality tests like MBTI or Enneagram, but personalized to your birth chart.",
  },
  {
    q: "How long does the reading take to arrive?",
    a: "After checkout, you'll receive an order confirmation immediately. Your personalized email reading is delivered within 24-48 hours to the email address you provide at checkout.",
  },
  {
    q: "What's 'apparent solar time' and why does it matter?",
    a: "Most astrology uses your clock time, which can be off by up to 16 minutes from the sun's actual position. We geocode your birthplace, look up the timezone, and apply the equation of time to calculate your true solar birth time. This astronomical precision is what makes your chart genuinely personal — it's one of the things that sets Zi Wei apart.",
  },
] as const;

export default function FAQ() {
  return (
    <section className="relative overflow-hidden border-y border-white/[0.07] bg-mist/40 py-24 backdrop-blur-sm md:py-32">
      {/* Decorative elements */}
      <div
        className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full border border-jade/[0.06] bg-jade/[0.02]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-48 -translate-x-1/2 bg-gradient-to-r from-transparent via-gold/30 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-cinnabar/[0.15] bg-cinnabar/[0.06]">
            <HelpCircle className="h-6 w-6 text-cinnabar/80" aria-hidden />
          </span>
          <div>
            <p className="landing-kicker">FAQ</p>
            <h2 className="landing-headline mt-2 text-3xl md:text-4xl">
              Everything you want to ask
            </h2>
            <p className="mt-2 font-body text-base text-ink-muted">
              Don&apos;t see your question?{" "}
              <a href="mailto:support@destinyblueprint.xyz" className="link-gold">
                Email us
              </a>{" "}
              — we respond within a few hours.
            </p>
          </div>
        </div>

        {/* FAQ accordion */}
        <Accordion type="single" collapsible className="mt-12 space-y-3">
          {faqs.map((f, idx) => (
            <AccordionItem
              key={f.q}
              value={`item-${idx + 1}`}
              className="rounded-sm border border-white/[0.07] bg-panel/70 px-5 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] data-[state=open]:border-gold/[0.2] data-[state=open]:bg-panel/90"
            >
              <AccordionTrigger className="py-5 font-body text-sm font-semibold text-ink hover:no-underline data-[state=open]:text-gold md:text-base">
                <span className="mr-3 font-mono text-[10px] text-ink-dim">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 pl-9 font-body text-sm leading-relaxed text-ink-muted">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact prompt */}
        <div className="mt-12 flex items-center gap-4 rounded-sm border border-gold/[0.12] bg-gold/[0.03] px-6 py-5 backdrop-blur-sm">
          <MessageCircle className="h-5 w-5 shrink-0 text-gold/70" aria-hidden />
          <p className="font-body text-sm leading-relaxed text-ink-muted">
            <span className="font-semibold text-ink">Still have questions?</span>{" "}
            We&apos;re happy to help. Email{" "}
            <a href="mailto:support@destinyblueprint.xyz" className="link-gold">
              support@destinyblueprint.xyz
            </a>{" "}
            and we&apos;ll get back to you within a few hours.
          </p>
        </div>
      </div>
    </section>
  );
}
