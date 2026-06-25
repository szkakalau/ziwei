import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
import { BRAND_NAME } from "@/lib/brand";
import JsonLd from "@/components/JsonLd";

const site = getSiteUrl();

export const metadata: Metadata = {
  title: "About",
  description:
    "Our mission: make classical Chinese astrology accessible with AI—for reflection and entertainment.",
  alternates: { canonical: new URL("/about", site).toString() },
  openGraph: {
    type: "website",
    title: `About | ${BRAND_NAME}`,
    description:
      "Our mission: make classical Chinese astrology accessible with AI—for reflection and entertainment.",
    url: new URL("/about", site),
    images: [
      {
        url: new URL("/opengraph-image", site).toString(),
        width: 1200,
        height: 630,
        alt: `${BRAND_NAME} — About`,
      },
    ],
  },
};

const breadcrumbJsonLd = {
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: site.toString() },
    { "@type": "ListItem", position: 2, name: "About", item: new URL("/about", site).toString() },
  ],
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-20 sm:px-6">
      <JsonLd data={breadcrumbJsonLd} />
      <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        Our mission: make ancient astrology accessible
      </h1>
      <div className="prose prose-lg mt-10 max-w-none prose-headings:font-display prose-headings:text-ink prose-p:font-body prose-p:text-ink-muted prose-strong:text-ink prose-li:text-ink-muted">
        <p>
          Zi Wei Dou Shu and related traditions are part of East Asian cultural
          heritage. We treat them as <strong>cultural wisdom</strong>: symbolic
          language for describing personality patterns, relationships, and life
          phases—not a claim of supernatural authority.
        </p>
        <p>
          Our product is built for <strong>self-reflection</strong> and{" "}
          <strong>entertainment</strong>. We aim to reduce confusion, avoid
          fear-based messaging, and give you structured prompts you can use in
          real conversations—with yourself and people you trust.
        </p>
        <p>
          <strong>AI technology</strong> helps us translate complex chart logic
          into clear sections you can actually read. The model does not replace
          human judgment; it scales explanation so more people can benefit from
          the underlying framework.
        </p>
        <p className="font-body text-sm text-ink-dim">
          If you need professional help (health, legal, financial, or
          crisis support), please consult a qualified expert.
        </p>

        <h2>How the reading works</h2>
        <p>
          You submit your birth date, time, and location. Our system calculates
          your <strong>Zi Wei Dou Shu chart</strong> — a map of over 100 symbolic
          stars distributed across 12 life palaces covering self, career, wealth,
          relationships, health, and more. The chart is generated using classical
          rules refined over centuries.
        </p>
        <p>
          The AI then interprets your chart against over 100 documented personality
          patterns, highlighting the themes most relevant to your configuration.
          This is not generic: two people born on the same calendar day will receive
          different readings if their birth times or locations differ.
        </p>
        <p>
          With a subscription, each morning&rsquo;s <strong>daily horoscope</strong> is
          personalized to your chart — not a one-size-fits-all paragraph for
          millions of people. You also get a human-written email reading delivered
          by a trained astrologer, covering your core patterns in plain English.
        </p>

        <h2>Why Zi Wei Dou Shu instead of Western astrology?</h2>
        <p>
          Western sun-sign astrology maps one celestial body to your birth month.
          Zi Wei Dou Shu maps over 100 stars to your exact birth hour and location
          across 12 life palaces. The resulting profile is far more granular:
          it distinguishes career pressure points from relationship timing, and
          luck cycles from health windows — each with separate interpretive rules.
        </p>
        <p>
          Neither system is &ldquo;better&rdquo; in an absolute sense — they serve different
          purposes. Zi Wei Dou Shu is particularly suited for structured
          self-reflection because its output is chart-based and rule-driven rather
          than intuitive.
        </p>
      </div>
    </main>
  );
}
