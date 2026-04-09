import type { Metadata } from "next";
import { BRAND_NAME, getSupportEmail } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${BRAND_NAME} for support and privacy requests.`,
};

export default function ContactPage() {
  const support = getSupportEmail();
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl md:text-5xl">
        Contact
      </h1>
      <p className="mt-6 font-body text-ink-muted">
        For support, privacy requests, or partnership inquiries, email{" "}
        <a
          className="font-medium text-gold underline decoration-gold/40 underline-offset-4 hover:text-gold/90"
          href={`mailto:${support}`}
        >
          {support}
        </a>
        .
      </p>
    </div>
  );
}
