import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let body: { email?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
    }

    const { registerUser } = await import("@/lib/auth");
    const user = await registerUser(email, password);
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "DUPLICATE_EMAIL") {
      return NextResponse.json({ ok: false, error: "DUPLICATE_EMAIL" }, { status: 409 });
    }
    if (err && typeof err === "object" && "code" in err) {
      return NextResponse.json({ ok: false, error: (err as { code: string }).code }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
