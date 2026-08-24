import { PUBLIC_SITE_HOST } from "./brand";

/** Apex domain (no `www.`), derived from the canonical host. */
const APEX_HOST = PUBLIC_SITE_HOST.replace(/^www\./, "");

export function getSiteUrl(): URL {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = new URL(raw.endsWith("/") ? raw.slice(0, -1) : raw);

  // Canonicalize the production host. The site is served on `www.` and the
  // apex domain 301-redirects to it. If an env var points at the apex (or at
  // http://), every sitemap URL, canonical, and OG URL would target a host that
  // redirects — which Google then flags as "Page with redirect". Force the
  // canonical host here so localhost / preview deployments are untouched.
  if (url.hostname === APEX_HOST || url.hostname === PUBLIC_SITE_HOST) {
    url.hostname = PUBLIC_SITE_HOST;
    url.protocol = "https:";
  }
  return url;
}

/**
 * Navbar / pricing "Get reading" target.
 * Defaults to the birth form (primary conversion hook on the landing page).
 * Override with NEXT_PUBLIC_READING_URL if you want a different path.
 */
export function getReadingUrl(): string {
  const raw = process.env.NEXT_PUBLIC_READING_URL?.trim();
  if (raw) return raw;
  return "/#hero-form";
}
