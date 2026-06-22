/**
 * In-memory rate limiter. Uses a simple sliding window per key (IP or userId).
 *
 * **KNOWN LIMITATION — serverless ineffectiveness (accepted tech debt):**
 * On Vercel each function instance has its own isolated Map, so the effective
 * per-user/per-IP limit is multiplied by the number of warm instances. Global
 * enforcement is NOT reliable. This is acceptable as a first line of defense
 * (same-instance requests are still capped), but mission-critical gates must
 * not rely on it alone — e.g. /api/checkout uses a DB guard (reject if trial
 * already active) instead of this limiter to prevent infinite-free-trial abuse.
 *
 * TODO(serverless): replace with a distributed store (Upstash Redis or Vercel KV)
 * to get true global rate limiting. Until then, pair this limiter with a
 * server-side guard for any abuse-sensitive endpoint.
 *
 * @example Upstash Redis
 *   import { Redis } from "@upstash/redis";
 *   const redis = Redis.fromEnv();
 *   // Refactor checkRateLimit to use redis.get / redis.incr / redis.pexpire
 *
 * @example Vercel KV
 *   import { kv } from "@vercel/kv";
 *   // Refactor checkRateLimit to use kv.get / kv.incr / kv.expire
 */

const store = new Map<string, { count: number; resetAt: number }>();

// Auto-cleanup stale entries every 5 minutes (Node.js only)
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    store.forEach((entry, key) => {
      if (now > entry.resetAt) store.delete(key);
    });
  }, 5 * 60 * 1000);
  if (timer && typeof timer.unref === "function") timer.unref();
}

export interface RateLimitConfig {
  windowMs: number;   // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  entry.count++;
  if (entry.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

/** Get client IP from request headers */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

// Pre-configured limits
export const LIMITS = {
  auth: { windowMs: 60_000, maxRequests: 5 } as RateLimitConfig,       // 5 login/register per minute per IP
  ai: { windowMs: 60_000, maxRequests: 10 } as RateLimitConfig,         // 10 AI calls per minute per user
  general: { windowMs: 60_000, maxRequests: 60 } as RateLimitConfig,    // 60 general requests per minute
} as const;

export function rateLimitResponse(resetAt: number) {
  return {
    ok: false,
    error: "RATE_LIMITED",
    message: "Too many requests. Please try again later.",
    retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
  };
}
