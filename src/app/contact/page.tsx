import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Ziwei AI for support and privacy requests.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-4xl font-semibold text-ink md:text-5xl">
        Contact
      </h1>
      <p className="mt-6 font-body text-ink-muted">
        For support, privacy requests, or partnership inquiries, email{" "}
        <a
          className="font-medium text-gold underline decoration-gold/40 underline-offset-4 hover:text-gold/90"
          href="mailto:support@example.com"
        >
          support@example.com
        </a>
        . Replace with your production inbox before launch.
      </p>
    </div>
  );
}
