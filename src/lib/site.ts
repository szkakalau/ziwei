export function getSiteUrl(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return new URL(raw.endsWith("/") ? raw.slice(0, -1) : raw);
}

/**
 * Navbar / pricing “Get reading” target.
 * Defaults to the Free Personality Snapshot section (primary conversion hook).
 * Override with NEXT_PUBLIC_READING_URL if you want a different path.
 */
export function getReadingUrl(): string {
  const raw = process.env.NEXT_PUBLIC_READING_URL?.trim();
  if (raw) return raw;
  return "/#free-personality-snapshot";
}
