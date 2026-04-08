import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of use for Ziwei AI readings and website.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold text-zinc-900">Terms of Service</h1>
      <p className="mt-6 text-sm text-zinc-500">Last updated: April 8, 2026</p>
      <div className="prose prose-zinc mt-10 max-w-none text-sm">
        <p>
          This placeholder is not legal advice. Replace with counsel-approved
          terms before scaling paid acquisition.
        </p>
        <h2>Entertainment and reflection</h2>
        <p>
          Readings are for entertainment and self-reflection. Not medical,
          legal, or financial advice.
        </p>
        <h2>Acceptable use</h2>
        <p>
          You agree not to misuse the service, attempt unauthorized access, or
          use outputs to harm others.
        </p>
        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, we limit liability arising
          from use of the service.
        </p>
      </div>
    </div>
  );
}
