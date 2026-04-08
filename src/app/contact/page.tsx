import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Ziwei AI for support and privacy requests.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold text-zinc-900">Contact</h1>
      <p className="mt-6 text-zinc-600">
        For support, privacy requests, or partnership inquiries, email{" "}
        <a
          className="font-medium text-violet-800 underline"
          href="mailto:support@example.com"
        >
          support@example.com
        </a>
        . Replace with your production inbox before launch.
      </p>
    </div>
  );
}
