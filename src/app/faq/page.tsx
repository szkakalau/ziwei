import type { Metadata } from "next";
import FAQList from "@/components/FAQList";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers about Chinese astrology readings, accuracy, purchases, and how we handle your birth data.",
};

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
        Frequently asked questions
      </h1>
      <p className="mt-4 font-body text-lg text-ink-muted">
        Transparency for ads, payments, and trust.
      </p>

      <FAQList />
    </div>
  );
}
