import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const { logoutUser } = await import("@/lib/auth");
    await logoutUser();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[logout]", err);
    return NextResponse.json({ ok: false, error: "LOGOUT_FAILED" }, { status: 500 });
  }
}
