import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { logoutUser } = await import("@/lib/auth");
    await logoutUser();
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (process.env.NODE_ENV === "production" && String(err).includes("cookies")) {
      return NextResponse.json({ ok: true }); // Build-time, no cookies available
    }
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
