import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is this a real human reading or an AI-generated message?",
    a: "Your email reading is delivered by a human after checkout. We still use software to calculate your Zi Wei chart accurately, but the interpretation itself is written and sent by email by a person.",
  },
  {
    q: "Do I need my exact birth time?",
    a: "The more accurate your birth time, the more precise your chart will be. We recommend using your exact birth time for the best reading, but you can still order if your time is approximate.",
  },
  {
    q: "Is this scientifically proven?",
    a: "Zi Wei Dou Shu is a traditional Chinese metaphysical system that has been used for centuries. It is not a replacement for professional financial, legal, or mental health advice.",
  },
  {
    q: "What do I get after purchase?",
    a: "After checkout, we email you an order confirmation right away. Your personalized reading is then delivered by email within 24-48 hours and focuses on the question you submitted before payment.",
  },
  {
    q: "What if I'm not happy with my reading?",
    a: "We offer a 30-day no-questions-asked money-back guarantee. If your reading doesn't resonate with you, just email us at support@destinyblueprint.xyz and we'll refund you 100%.",
  },
] as const;

export default function FAQ() {
  return (
    <section className="relative overflow-hidden border-y border-white/10 bg-mist/45 py-20 backdrop-blur-sm md:py-28">
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rotate-[-18deg] border border-jade/15 bg-jade-dim"
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:max-w-5xl">
        <div className="flex items-start gap-4 md:pl-8">
          <HelpCircle className="mt-1 h-8 w-8 shrink-0 text-cinnabar/80" aria-hidden />
          <div>
            <p className="landing-kicker">FAQ</p>
            <h2 className="landing-headline mt-2 text-3xl md:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
        </div>

        <Accordion type="single" collapsible className="mt-12 space-y-3 md:ml-12">
          {faqs.map((f, idx) => (
            <AccordionItem
              key={f.q}
              value={`item-${idx + 1}`}
              className="rounded-sm border border-white/10 bg-panel/80 px-1 backdrop-blur-sm"
            >
              <AccordionTrigger className="px-4 hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="px-4">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
