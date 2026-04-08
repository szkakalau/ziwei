export function getSiteUrl(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return new URL(raw.endsWith("/") ? raw.slice(0, -1) : raw);
}

/**
 * Navbar / pricing “Get reading” target. Defaults to the homepage so we never
 * ship a fake example.com URL; set NEXT_PUBLIC_READING_URL to your checkout or app when ready.
 */
export function getReadingUrl(): string {
  const raw = process.env.NEXT_PUBLIC_READING_URL?.trim();
  if (raw) return raw;
  return "/";
}
