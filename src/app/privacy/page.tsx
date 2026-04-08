import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Ziwei AI handles personal and birth-related information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold text-zinc-900">Privacy Policy</h1>
      <p className="mt-6 text-sm text-zinc-500">Last updated: April 8, 2026</p>
      <div className="prose prose-zinc mt-10 max-w-none text-sm">
        <p>
          This placeholder summarizes our intent before legal review. Replace
          with counsel-approved text before running paid ads at scale.
        </p>
        <h2>What we collect</h2>
        <p>
          We may collect account, payment, and birth data needed to generate
          readings and deliver your purchase.
        </p>
        <h2>How we use data</h2>
        <p>
          Data is used to provide the service, improve product quality, comply
          with law, and communicate about your order.
        </p>
        <h2>Your choices</h2>
        <p>
          You may request access, correction, or deletion where applicable by
          contacting us via the Contact page.
        </p>
      </div>
    </div>
  );
}
