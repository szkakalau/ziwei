import type { Metadata } from "next";
import FAQList from "@/components/FAQList";
import { getSiteUrl } from "@/lib/site";
import { BRAND_NAME } from "@/lib/brand";
import JsonLd from "@/components/JsonLd";

const site = getSiteUrl();

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about Chinese astrology readings, accuracy, purchases, and how we handle your birth data.",
  alternates: { canonical: new URL("/faq", site).toString() },
  openGraph: {
    type: "website",
    title: `FAQ | ${BRAND_NAME}`,
    description:
      "Answers about Chinese astrology readings, accuracy, purchases, and how we handle your birth data.",
    url: new URL("/faq", site),
    images: [
      {
        url: new URL("/opengraph-image", site).toString(),
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} — FAQ`,
      },
    ],
  },
};

const faqJsonLd = {
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is Chinese astrology?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Chinese astrology is a family of symbolic systems that map birth time and calendar cycles to personality traits and life themes. We present it as cultural wisdom for self-reflection and entertainment—not as scientific certainty.",
      },
    },
    {
      "@type": "Question",
      name: "Is this fortune telling?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We do not claim to predict fixed outcomes. Readings describe patterns and possibilities so you can reflect with more clarity. Treat insights as prompts, not commands.",
      },
    },
    {
      "@type": "Question",
      name: "Is it scientifically proven?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Astrology is not a substitute for professional advice in medicine, law, finance, or mental health. It is a reflective framework; use your judgment and seek experts when needed.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need birth time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Birth time improves precision for certain chart elements. If unknown, use your best estimate or skip time. Your reading can still highlight useful themes, with a narrower technical scope.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is the reading?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Quality depends on correct birth data and how you apply the insights. Readings are based on classical-style rules and human interpretation; they are best used as structured reflection, not literal prediction.",
      },
    },
    {
      "@type": "Question",
      name: "Should I use this for major life decisions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Use readings for reflection and planning conversations—not as the sole basis for medical, legal, financial, or safety decisions.",
      },
    },
    {
      "@type": "Question",
      name: "How do I receive my reading?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "After checkout, you receive an order confirmation right away, and your reading is delivered by email within the stated turnaround window. Exact steps are confirmed at purchase.",
      },
    },
    {
      "@type": "Question",
      name: "What is your refund policy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Refund terms depend on the product version and region. We publish the current policy on the checkout page and in your confirmation email. Contact support if delivery fails.",
      },
    },
    {
      "@type": "Question",
      name: "What currency are prices in?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Prices are shown in USD unless stated otherwise at checkout. Your bank may apply conversion fees for non-USD cards.",
      },
    },
    {
      "@type": "Question",
      name: "Do you store birth data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We collect only what is needed to generate your chart and deliver your order. Retention, deletion, and security measures are described in our Privacy Policy.",
      },
    },
    {
      "@type": "Question",
      name: "Who can access my information?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Access is limited to systems and people required to run the service (for example, delivery and support). We do not sell personal data.",
      },
    },
    {
      "@type": "Question",
      name: "Can I request deletion?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, where applicable by law and our internal policies. Use the contact options in our Privacy Policy to request deletion or export.",
      },
    },
  ],
};

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-20 sm:px-6">
      <JsonLd data={faqJsonLd} />

      <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        Frequently asked questions
      </h1>
      <p className="mt-4 font-body text-lg text-ink-muted">
        Transparency for ads, payments, and trust.
      </p>

      <FAQList />
    </main>
  );
}
