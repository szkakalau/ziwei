/**
 * One-shot streak backfill for a single user.
 *
 * Bug context: updateStreak previously reset current_streak to 1 on every
 * visit because the neon driver returns DATE columns as JS Date objects (not
 * strings), so lastDate === today was always false. The fix is deployed, but
 * historical current_streak values are stuck at 1. This script recomputes a
 * user's streak from their daily_horoscopes history.
 *
 * Streak definition (scheme "i", anchored at today):
 *   - Anchor = the most recent UTC day that has a horoscope (today, else yesterday, ...)
 *   - Walk backwards day-by-day while consecutive days have horoscopes.
 *   - current_streak = count of that consecutive run including the anchor.
 *   - longest_streak = longest such run across the user's whole history.
 *   - last_check_date = anchor day.
 *
 * Usage:
 *   npx tsx scripts/streak-backfill.ts <email>           # dry-run (read-only, prints plan)
 *   npx tsx scripts/streak-backfill.ts <email> --apply   # writes to streaks table
 *
 * Loads DATABASE_URL from .env.
 */
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

async function loadEnv() {
  try {
    const raw = await readFile(resolve(process.cwd(), ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    /* .env optional if DATABASE_URL already in env */
  }
}

function toYMD(d: Date): string {
  // Neon's pg-types parseDate constructs DATE values via the LOCAL-midnight
  // constructor (new Date(y, m, d)), so to recover the stored calendar day we
  // must read LOCAL components — NOT getUTC*. Using getUTC* shifts the day
  // back by one in positive-offset timezones (e.g. UTC+8 China). This mirrors
  // src/lib/db.ts updateStreak's local-component normalization.
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function main() {
  await loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) { console.error("DATABASE_URL not set"); process.exit(1); }
  const email = process.argv[2];
  const apply = process.argv.includes("--apply");
  if (!email) { console.error("Usage: npx tsx scripts/streak-backfill.ts <email> [--apply]"); process.exit(1); }

  const sql = neon(url);

  const users = await sql`SELECT id, email FROM users WHERE email = ${email} LIMIT 1`;
  const user = users[0] as { id: string; email: string } | undefined;
  if (!user) { console.error(`No user found with email ${email}`); process.exit(1); }
  console.log(`User: ${user.email} (${user.id})`);

  // DATE column → JS Date objects. Normalize to YYYY-MM-DD (UTC components).
  const rows = await sql`
    SELECT date FROM daily_horoscopes WHERE user_id = ${user.id} ORDER BY date ASC
  ` as Array<{ date: Date | string }>;
  const dates: string[] = rows.map((r) =>
    r.date instanceof Date ? toYMD(r.date) : String(r.date).slice(0, 10)
  );
  if (dates.length === 0) {
    console.log("No daily_horoscope history. Nothing to backfill (would reset to 0).");
    process.exit(0);
  }

  const sorted = Array.from(new Set(dates)).sort();
  console.log(`Horoscope history: ${sorted.length} distinct days`);
  console.log(`  earliest: ${sorted[0]}`);
  console.log(`  latest:   ${sorted[sorted.length - 1]}`);

  // Compute longest consecutive run across history.
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T12:00:00Z");
    const cur = new Date(sorted[i] + "T12:00:00Z");
    const dayMs = 86400000;
    if (Math.round((cur.getTime() - prev.getTime()) / dayMs) === 1) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  // Current run: anchor at latest, walk backwards while consecutive.
  const anchor = sorted[sorted.length - 1];
  let current = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const cur = new Date(sorted[i] + "T12:00:00Z");
    const prev = new Date(sorted[i - 1] + "T12:00:00Z");
    const dayMs = 86400000;
    if (Math.round((cur.getTime() - prev.getTime()) / dayMs) === 1) {
      current++;
    } else {
      break;
    }
  }

  const existing = await sql`SELECT current_streak, longest_streak, last_check_date FROM streaks WHERE user_id = ${user.id}`;
  const cur = existing[0] as { current_streak: number; longest_streak: number; last_check_date: Date | string | null } | undefined;

  console.log("\n=== BACKFILL PLAN (dry-run) ===");
  console.log(`  current_streak:   ${cur?.current_streak ?? 0}  ->  ${current}`);
  console.log(`  longest_streak:   ${cur?.longest_streak ?? 0}  ->  ${Math.max(longest, cur?.longest_streak ?? 0)}`);
  console.log(`  last_check_date:  ${cur?.last_check_date instanceof Date ? toYMD(cur.last_check_date) : (cur?.last_check_date ?? "null")}  ->  ${anchor}`);

  if (!apply) {
    console.log("\n(dry-run only — no changes written. Re-run with --apply to write.)");
    return;
  }

  const newLongest = Math.max(longest, cur?.longest_streak ?? 0);
  if (cur) {
    await sql`
      UPDATE streaks SET
        current_streak = ${current},
        longest_streak = ${newLongest},
        last_check_date = ${anchor}::date,
        updated_at = now()
      WHERE user_id = ${user.id}
    `;
  } else {
    await sql`
      INSERT INTO streaks (user_id, current_streak, longest_streak, last_check_date)
      VALUES (${user.id}, ${current}, ${newLongest}, ${anchor}::date)
    `;
  }
  console.log("\n=== APPLIED ===");
  console.log(`  current_streak=${current}, longest_streak=${newLongest}, last_check_date=${anchor}`);
}

main().catch((e) => { console.error("ERROR:", e); process.exit(1); });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __keep = dirname(fileURLToPath(import.meta.url)); // keep import in use for tooling
