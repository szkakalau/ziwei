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
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
        Frequently asked questions
      </h1>
      <p className="mt-4 text-lg text-zinc-600">
        Transparency for ads, payments, and trust.
      </p>

      <FAQList />
    </div>
  );
}
