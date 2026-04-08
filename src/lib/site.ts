export function getSiteUrl(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return new URL(raw.endsWith("/") ? raw.slice(0, -1) : raw);
}

export function getReadingUrl(): string {
  return (
    process.env.NEXT_PUBLIC_READING_URL ??
    "https://example.com/get-reading"
  );
}
