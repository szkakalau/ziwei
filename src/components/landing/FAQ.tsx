import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is this real astrology, or just AI generated content?",
    a: "Both. We calculate your chart using the traditional, 1000-year-old Zi Wei Dou Shu system, then our AI translates the complex, ancient chart into clear, human-readable insights you can act on.",
  },
  {
    q: "Do I need my exact birth time?",
    a: "The more accurate your birth time, the more precise your chart will be. We recommend using your exact birth time for the most complete and accurate report.",
  },
  {
    q: "Is this scientifically proven?",
    a: "Zi Wei Dou Shu is a traditional Chinese metaphysical system that has been used for centuries. It is not a replacement for professional financial, legal, or mental health advice.",
  },
  {
    q: "How do I get my full report after purchase?",
    a: "After you complete your purchase, we'll send your full downloadable PDF report to the email you provide at checkout, within 2-5 minutes.",
  },
  {
    q: "What if I'm not happy with my report?",
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

