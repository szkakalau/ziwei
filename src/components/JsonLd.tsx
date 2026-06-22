import Script from "next/script";

type JsonLdObject = Record<string, unknown>;

/**
 * Injects a JSON-LD structured data script tag.
 * Uses default afterInteractive strategy — beforeInteractive is only valid
 * in pages/_document.js and is unnecessary for JSON-LD (crawlers render JS).
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
    />
  );
}
