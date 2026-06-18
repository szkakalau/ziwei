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
      name: "What is Zi Wei Dou Shu? Is it like Western astrology?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Zi Wei Dou Shu (Purple Star Astrology) is an ancient Chinese system that maps over 100 stars across 12 life palaces using your exact birth time and location. It's fundamentally more detailed than Western sun-sign astrology.",
      },
    },
    {
      "@type": "Question",
      name: "Is this AI or human-powered?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Both. Your subscription includes daily AI-generated horoscopes (personalized to your chart), plus a one-time human-written email reading delivered within 24-48 hours.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need my exact birth time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The more accurate your birth time, the more precise your chart. If you don't know at all, we can still generate a chart using noon, but the precision will be reduced.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between the free snapshot and the subscription?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The free snapshot gives you core personality traits, strengths, and growth areas. The $4.99/month subscription unlocks daily AI horoscopes, AI chat, compatibility checks, yearly forecast with PDF, birthday surprises, and a human-written email reading.",
      },
    },
    {
      "@type": "Question",
      name: "What if I'm not satisfied?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You have a 7-day free trial. Cancel before it ends and you're never charged. After that, cancel anytime from your account page. If the human-written reading doesn't resonate, email support for a refund.",
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
