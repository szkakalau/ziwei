import { NextResponse } from "next/server";
import { computeBirthChart } from "@/lib/computeBirthChart";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "INVALID_JSON" },
        { status: 400 },
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "INVALID_BODY" },
        { status: 400 },
      );
    }

    const o = body as Record<string, unknown>;
    const birthDate = typeof o.birthDate === "string" ? o.birthDate : "";
    const birthTime = typeof o.birthTime === "string" ? o.birthTime : "";
    const location = typeof o.location === "string" ? o.location : "";
    const gender = o.gender === "female" ? "female" : "male";

    if (!birthDate || !location) {
      return NextResponse.json(
        { ok: false, error: "MISSING_FIELDS" },
        { status: 400 },
      );
    }

    const result = await computeBirthChart({
      birthDate,
      birthTime,
      gender,
      location,
    });

    if (!result.ok) {
      const status = result.errorCode === "LOCATION_NOT_FOUND" ? 404 : 422;
      return NextResponse.json({ ok: false, error: result.errorCode }, { status });
    }

    return NextResponse.json({
      ok: true,
      chart: result.chart,
      meta: result.meta,
    });
  } catch {
    // Ensure the client always receives JSON (avoids res.json() throwing).
    return NextResponse.json(
      { ok: false, error: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
