import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time comparison of two secret strings (e.g. bearer tokens).
 * Returns false if lengths differ (after a length check, which itself does not
 * leak the secret). Avoids the byte-short-circuit timing side channel of `===`.
 */
export function safeSecretEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
