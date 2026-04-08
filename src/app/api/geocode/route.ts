import { NextResponse } from "next/server";
import { geocodeSuggestions } from "@/lib/geocode";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ ok: true, results: [] });

  try {
    const results = await geocodeSuggestions(q, 6);
    return NextResponse.json({ ok: true, results });
  } catch {
    return NextResponse.json(
      { ok: false, error: "GEOCODE_UNAVAILABLE" },
      { status: 503 },
    );
  }
}

