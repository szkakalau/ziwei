type JsonLdObject = Record<string, unknown>;

/**
 * Injects a JSON-LD structured data script tag.
 *
 * Uses a native <script> tag (not next/script) so the JSON-LD is server-rendered
 * into the initial HTML. Google, Bing, and AI crawlers (ChatGPT, Perplexity,
 * Claude) all parse structured data from static HTML — they do NOT execute
 * client-side JavaScript, so next/script's afterInteractive hydration was
 * invisible to them.
 */
export default function JsonLd({ data }: { data: JsonLdObject }) {
  const json = JSON.stringify({
    "@context": "https://schema.org",
    ...data,
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
