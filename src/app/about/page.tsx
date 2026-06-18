import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";
import { BRAND_NAME } from "@/lib/brand";

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

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-20 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        Our mission: make ancient astrology accessible
      </h1>
      <div className="prose prose-invert prose-lg mt-10 max-w-none prose-headings:font-display prose-headings:text-ink prose-p:font-body prose-p:text-ink-muted prose-strong:text-ink prose-li:text-ink-muted">
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
      </div>
    </main>
  );
}
