/** Product / site brand (single word). */
export const BRAND_NAME = "DestinyBlueprint.xyz";

/** Canonical public hostname (no protocol). */
export const PUBLIC_SITE_HOST = "www.destinyblueprint.xyz";

export const DEFAULT_SUPPORT_EMAIL = "castro.liu@me.com";

export function getSupportEmail(): string {
  return (
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL
  );
}

export const DEFAULT_META_DESCRIPTION =
  "DestinyBlueprint — Daily Zi Wei Dou Shu horoscopes powered by AI. Start with a free birth chart snapshot, then unlock daily readings, compatibility, yearly forecasts, and a human-written email consultation with a 7-day free trial.";

/** Display price for the subscription (used in CTA buttons). */
export const SUBSCRIPTION_PRICE_LABEL = "$4.99/mo";
export const SUBSCRIPTION_TRIAL_LABEL = "7-day free trial";
