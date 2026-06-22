import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";
import { createUser, getUserByEmail, getUserById } from "@/lib/db";

// ── Fallback session encryption (AES-256-GCM) ──
// Used when iron-session/getIronSession throws unexpectedly (e.g. iron-webcrypto
// decryption errors in Next.js 15).  AES-256-GCM provides authenticated encryption
// without needing a separate HMAC step.

const FALLBACK_IV_LEN = 16; // 128-bit IV for GCM
const FALLBACK_TAG_LEN = 16; // 128-bit auth tag

function deriveFallbackKey(password: string): Buffer {
  return createHash("sha256").update(password).digest(); // 32 bytes → AES-256
}

function encryptSessionPayload(data: SessionData, password: string): string {
  const key = deriveFallbackKey(password);
  const iv = randomBytes(FALLBACK_IV_LEN);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const json = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: iv (16) | tag (16) | ciphertext (rest)
  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function decryptSessionPayload(token: string, password: string): SessionData | null {
  try {
    const key = deriveFallbackKey(password);
    const combined = Buffer.from(token, "base64url");
    if (combined.length < FALLBACK_IV_LEN + FALLBACK_TAG_LEN) return null;
    const iv = combined.subarray(0, FALLBACK_IV_LEN);
    const tag = combined.subarray(FALLBACK_IV_LEN, FALLBACK_IV_LEN + FALLBACK_TAG_LEN);
    const encrypted = combined.subarray(FALLBACK_IV_LEN + FALLBACK_TAG_LEN);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8")) as SessionData;
  } catch {
    return null; // corrupted / tampered cookie → start fresh
  }
}

export interface SessionData {
  userId?: string;
}

function getSessionPassword(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new AuthError("SESSION_SECRET environment variable is required", "SESSION_MISCONFIGURED");
  }
  // iron-session requires the password to be at least 32 characters; it throws
  // at request time otherwise. Validate here so misconfiguration fails fast
  // with a clear error instead of a confusing runtime throw.
  if (secret.length < 32) {
    throw new AuthError("SESSION_SECRET must be at least 32 characters long", "SESSION_MISCONFIGURED");
  }
  return secret;
}

function getSessionOptions(): {
  password: string;
  cookieName: string;
  cookieOptions: {
    secure: boolean;
    httpOnly: boolean;
    sameSite: "lax";
    maxAge: number;
  };
} {
  return {
    password: getSessionPassword(),
  cookieName: "destinyblueprint-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};
}

/** Get the current session from cookies. */
async function getSession() {
  // Primary: use iron-session
  try {
    const cookieStore = await cookies();
    return await getIronSession<SessionData>(cookieStore, getSessionOptions());
  } catch (err) {
    if (err instanceof AuthError) throw err; // configuration errors → 503

    // iron-session failed (likely iron-webcrypto error in Next.js 15.5 / Vercel).
    // Log so Vercel runtime surfaces the root cause.
    console.error("[getSession] iron-session failed, using fallback:", err instanceof Error ? err.message : err);

    // Fallback: self-contained cookie session using Node.js crypto (AES-256-GCM).
    // This is functionally identical to iron-session for our use case (store userId
    // in an encrypted cookie) but doesn't depend on iron-webcrypto internals.
    try {
      const fallbackCookieStore = await cookies();
      const opts = getSessionOptions();

      let data: SessionData = {};
      const raw = fallbackCookieStore.get(opts.cookieName)?.value;
      if (raw) {
        const parsed = decryptSessionPayload(raw, opts.password);
        if (parsed) data = parsed;
      }

      return {
        get userId() {
          return data.userId;
        },
        set userId(v: string | undefined) {
          data.userId = v;
        },
        save: async () => {
          const token = encryptSessionPayload(data, opts.password);
          fallbackCookieStore.set(opts.cookieName, token, opts.cookieOptions as Record<string, unknown> & { sameSite?: "lax" | "strict" | "none" });
        },
        destroy: () => {
          data = {};
          fallbackCookieStore.set(opts.cookieName, "", { maxAge: 0 } as Record<string, unknown> & { sameSite?: "lax" | "strict" | "none" });
        },
      } as unknown as Awaited<ReturnType<typeof getIronSession<SessionData>>>;
    } catch (fallbackErr) {
      // Double-fault: even the fallback failed (e.g. build-time where cookies()
      // is unavailable). Return a no-op mock so the app doesn't crash.
      console.error("[getSession] fallback also failed:", fallbackErr instanceof Error ? fallbackErr.message : fallbackErr);
      return {
        userId: undefined,
        save: async () => {},
        destroy: () => {},
      } as unknown as Awaited<ReturnType<typeof getIronSession<SessionData>>>;
    }
  }
}

/** Get the current authenticated user (or null). */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) return null;
  return getUserById(session.userId);
}

/** Register a new user. Returns the user or throws on duplicate email. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function registerUser(email: string, password: string) {
  if (!EMAIL_RE.test(email) || email.length > 254) {
    throw new AuthError("Invalid email address", "INVALID_EMAIL");
  }
  if (password.length < 10) {
    throw new AuthError("Password must be at least 10 characters", "WEAK_PASSWORD");
  }
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new AuthError("Password must include uppercase, lowercase, and a number", "WEAK_PASSWORD");
  }

  // Strip + aliases to prevent trial abuse (user+1@mail.com, user+2@mail.com, etc.)
  const normalizedEmail = email.toLowerCase().trim().replace(/\+[^@]*@/, "@");
  const existing = await getUserByEmail(normalizedEmail);

  if (existing) {
    throw new AuthError("Email already registered", "DUPLICATE_EMAIL");
  }

  const hash = await bcrypt.hash(password, 12);
  const user = await createUser({
    email: normalizedEmail,
    passwordHash: hash,
  });
  const session = await getSession();
  session.userId = user.id;
  await session.save();

  return user;
}

/** Log in an existing user. Returns the user or throws on invalid credentials. */
export async function loginUser(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim().replace(/\+[^@]*@/, "@");
  const user = await getUserByEmail(normalizedEmail);
  if (!user) {
    // Constant-time defense: run bcrypt anyway to prevent timing-based email enumeration
    await bcrypt.compare(password, "$2a$12$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ12");
    throw new AuthError("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new AuthError("Invalid email or password", "INVALID_CREDENTIALS");
  }

  const session = await getSession();
  session.userId = user.id;
  await session.save();

  return { id: user.id, email: user.email };
}

/** Log out the current user. */
export async function logoutUser() {
  const session = await getSession();
  session.destroy();
}

export class AuthError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = "AuthError";
  }
}
