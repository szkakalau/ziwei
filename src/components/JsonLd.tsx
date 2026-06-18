import Script from "next/script";

type JsonLdObject = Record<string, unknown>;

/**
 * Injects a JSON-LD structured data script tag.
 * Renders inside Next.js <Script> with strategy="beforeInteractive" for SEO.
 */
export default function JsonLd({ data }: { data: JsonLdObject }) {
  return (
    <Script
      id={`jsonld-${(data["@type"] as string)?.toLowerCase() ?? "generic"}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          ...data,
        }),
      }}
      strategy="beforeInteractive"
    />
  );
}
