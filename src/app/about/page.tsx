import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Our mission: make classical Chinese astrology accessible with AI—for reflection and entertainment.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        Our mission: make ancient astrology accessible
      </h1>
      <div className="prose prose-invert prose-lg mt-10 max-w-none prose-headings:font-display prose-headings:text-ink prose-p:font-body prose-p:text-ink-muted prose-strong:text-ink prose-li:text-ink-muted">
        <p>
          Ziwei Dou Shu and related traditions are part of East Asian cultural
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
    </div>
  );
}
