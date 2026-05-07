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
  "DestinyBlueprint — Zi Wei Dou Shu email readings by a human astrologer. Start with a free chart snapshot, then upgrade to a personalized email consultation.";

/** Display price for the email reading. */
export const EMAIL_READING_PRICE_LABEL = "$99";
