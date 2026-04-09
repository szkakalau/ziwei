/** Product / site brand (single word). */
export const BRAND_NAME = "DestinyBlueprint";

/** Canonical public hostname (no protocol). */
export const PUBLIC_SITE_HOST = "www.destinyblueprint.xyz";

export const DEFAULT_SUPPORT_EMAIL = "support@destinyblueprint.xyz";

export function getSupportEmail(): string {
  return (
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL
  );
}

export const DEFAULT_META_DESCRIPTION =
  "DestinyBlueprint — AI-powered Purple Star (Zi Wei Dou Shu) readings: personality, relationships, and life themes. Pay once, full report by email.";
