import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
    <section className="relative border-y border-white/10 bg-mist/35 py-20 backdrop-blur-sm md:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="mt-12 space-y-4">
          {faqs.map((f, idx) => (
            <AccordionItem key={f.q} value={`item-${idx + 1}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
