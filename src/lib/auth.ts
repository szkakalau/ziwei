import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail, getUserById } from "@/lib/db";

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

let _buildSession: SessionData | null = null;

/** Get the current session from cookies. */
async function getSession() {
  try {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, getSessionOptions());
  } catch (err) {
    // Propagate configuration errors (e.g. SESSION_SECRET missing/too short)
    // so they surface as 503 instead of being silently swallowed as "logged out".
    if (err instanceof AuthError) throw err;
    // Build-time: cookies() not available. Return a mock.
    if (!_buildSession) _buildSession = {};
    return {
      get userId() { return _buildSession!.userId; },
      set userId(v: string | undefined) { _buildSession!.userId = v; },
      save: async () => {},
      destroy: () => { _buildSession = {}; },
    } as unknown as Awaited<ReturnType<typeof getIronSession<SessionData>>>;
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
