import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextResponse } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ═══════════════════════════════════════════════════════════════════════
// API response helpers — lightweight factories so new routes don't
// diverge on error shape. Existing routes continue working as-is.
// ═══════════════════════════════════════════════════════════════════════

/** Build a success JSON response: `{ ok: true, ...data }` */
export function apiOk<T extends Record<string, unknown>>(
  data: T,
  init?: ResponseInit,
): NextResponse<{ ok: true } & T> {
  return NextResponse.json({ ok: true as const, ...data }, init);
}

/** Build an error JSON response: `{ ok: false, error: code }` */
export function apiErr(
  code: string,
  status: number,
  extra?: Record<string, unknown>,
): NextResponse<{ ok: false; error: string } & Record<string, unknown>> {
  return NextResponse.json(
    { ok: false as const, error: code, ...extra },
    { status },
  );
}
