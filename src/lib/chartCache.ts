import type { ChartLike } from "@/lib/personalitySnapshot";
import { getUserById, updateUserChart } from "@/lib/db";

/**
 * Compute a birth chart with caching.
 * First checks DB cache for the user. If cached, returns immediately.
 * If not cached or cache is stale, recomputes and stores.
 */
export async function computeOrGetCachedChart(params: {
  userId: string;
  birthDate: string;
  birthTime: string;
  gender?: "male" | "female";
  locationLabel: string;
  allowFallback?: boolean;
}): Promise<ChartLike> {
  // Check cache
  const user = await getUserById(params.userId);
  if (user?.chart_data) {
    // Verify chart data is a valid object with palaces
    const cached = user.chart_data as Record<string, unknown> | null;
    if (cached && typeof cached === "object" && Array.isArray(cached.palaces)) {
      return cached as unknown as ChartLike;
    }
    // Corrupted or invalid cache — recompute below
  }

  // Dynamically import computeBirthChart (heavy, node-only)
  const { computeBirthChart } = await import("@/lib/computeBirthChart");

  const result = await computeBirthChart({
    birthDate: params.birthDate,
    birthTime: params.birthTime,
    gender: params.gender ?? "male",
    location: params.locationLabel,
    allowFallback: params.allowFallback ?? true,
  });

  // Persist computed chart to DB
  if (result.ok) {
    await updateUserChart(params.userId, {
      birthDate: params.birthDate,
      birthTime: params.birthTime,
      birthPlace: {
        lat: result.meta.latitude,
        lng: result.meta.longitude,
        tz: result.meta.timezone,
      },
      chartData: result.chart,
    });

    return result.chart as unknown as ChartLike;
  }

  // If chart computation failed, return empty chart to avoid blocking
  return { palaces: [] } as unknown as ChartLike;
}

/**
 * For cron usage: compute chart from stored birth data.
 * Not cached — returns chart via existing computeBirthChart flow.
 */
export async function computeChartFromStored(params: {
  birthDate: string;
  birthTime: string;
  gender?: "male" | "female";
  location: string;
  allowFallback?: boolean;
}): Promise<ChartLike> {
  const { computeBirthChart } = await import("@/lib/computeBirthChart");

  const result = await computeBirthChart({
    birthDate: params.birthDate,
    birthTime: params.birthTime,
    gender: params.gender ?? "male",
    location: params.location,
    allowFallback: params.allowFallback ?? true,
  });

  if (result.ok) {
    return result.chart as unknown as ChartLike;
  }

  return { palaces: [] } as unknown as ChartLike;
}
