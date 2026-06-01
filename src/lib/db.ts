import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

/** Initialize database tables (idempotent — uses IF NOT EXISTS). */
export async function initDatabase(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      birth_date TEXT,
      birth_time TEXT,
      birth_place JSONB,
      chart_data JSONB,
      subscription_status TEXT DEFAULT 'free',
      trial_ends_at TIMESTAMPTZ,
      stripe_customer_id TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS daily_horoscopes (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      transit_summary TEXT,
      horoscope_text TEXT NOT NULL,
      highlighted_stars JSONB DEFAULT '[]'::jsonb,
      generated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE (user_id, date)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS push_tokens (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      onesignal_player_id TEXT NOT NULL,
      platform TEXT DEFAULT 'web',
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS stripe_events (
      event_id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS streaks (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_check_date DATE,
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `;
}

/** Get a users daily horoscope for a specific date. */
export async function getHoroscope(userId: string, date: string) {
  const rows = await sql`
    SELECT * FROM daily_horoscopes
    WHERE user_id = ${userId} AND date = ${date}::date
    LIMIT 1
  `;
  return rows[0] ?? null;
}

/** Upsert a daily horoscope (idempotent on user_id + date). */
export async function upsertHoroscope(params: {
  userId: string;
  date: string;
  horoscopeText: string;
  transitSummary?: string;
  highlightedStars?: string[];
}): Promise<void> {
  await sql`
    INSERT INTO daily_horoscopes (user_id, date, horoscope_text, transit_summary, highlighted_stars)
    VALUES (
      ${params.userId},
      ${params.date}::date,
      ${params.horoscopeText},
      ${params.transitSummary ?? null},
      ${JSON.stringify(params.highlightedStars ?? [])}::jsonb
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      horoscope_text = EXCLUDED.horoscope_text,
      transit_summary = EXCLUDED.transit_summary,
      highlighted_stars = EXCLUDED.highlighted_stars,
      generated_at = now()
  `;
}

/** Get user by email. */
export async function getUserByEmail(email: string) {
  const rows = await sql`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;
  return rows[0] ?? null;
}

/** Get user by id. */
export async function getUserById(id: string) {
  const rows = await sql`
    SELECT id, email, birth_date, birth_time, birth_place, chart_data,
           subscription_status, trial_ends_at, stripe_customer_id, created_at
    FROM users WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ?? null;
}

/** Create a new user. */
export async function createUser(params: {
  email: string;
  passwordHash: string;
}): Promise<{ id: string; email: string }> {
  const rows = await sql`
    INSERT INTO users (email, password_hash)
    VALUES (${params.email}, ${params.passwordHash})
    RETURNING id, email
  `;
  return rows[0] as { id: string; email: string };
}

/** Update user chart data (birth info + computed chart). */
export async function updateUserChart(
  userId: string,
  params: {
    birthDate: string;
    birthTime: string;
    birthPlace: { lat: number; lng: number; tz: string };
    chartData: unknown;
  },
): Promise<void> {
  await sql`
    UPDATE users SET
      birth_date = ${params.birthDate},
      birth_time = ${params.birthTime},
      birth_place = ${JSON.stringify(params.birthPlace)}::jsonb,
      chart_data = ${JSON.stringify(params.chartData)}::jsonb
    WHERE id = ${userId}
  `;
}

/** Update subscription status. */
export async function updateSubscription(
  userId: string,
  params: { status: string; trialEndsAt?: string; stripeCustomerId?: string },
): Promise<void> {
  await sql`
    UPDATE users SET
      subscription_status = ${params.status},
      trial_ends_at = ${params.trialEndsAt ? new Date(params.trialEndsAt) : null}::timestamptz,
      stripe_customer_id = COALESCE(${params.stripeCustomerId ?? null}, stripe_customer_id)
    WHERE id = ${userId}
  `;
}

/** Get all active (trial or paid) users — for cron batch generation. */
export async function getActiveUsers(): Promise<Array<{ id: string; birth_date: string | null; birth_time: string | null; birth_place: unknown; chart_data: unknown }>> {
  return sql`
    SELECT id, birth_date, birth_time, birth_place, chart_data FROM users
    WHERE subscription_status IN ('trial', 'active')
  ` as unknown as Promise<Array<{ id: string; birth_date: string | null; birth_time: string | null; birth_place: unknown; chart_data: unknown }>>;
}

/** Update (or create) a user's streak. Returns the new current_streak. */
export async function updateStreak(
  userId: string,
  today: string,
): Promise<number> {
  const existing = await sql`
    SELECT * FROM streaks WHERE user_id = ${userId}
  `;
  const row = existing[0];

  if (!row) {
    await sql`
      INSERT INTO streaks (user_id, current_streak, longest_streak, last_check_date)
      VALUES (${userId}, 1, 1, ${today}::date)
    `;
    return 1;
  }

  const lastDate = row.last_check_date as string;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (lastDate === today) {
    return row.current_streak as number;
  }

  if (lastDate === yesterdayStr) {
    const newStreak = (row.current_streak as number) + 1;
    const newLongest = Math.max(newStreak, row.longest_streak as number);
    await sql`
      UPDATE streaks SET
        current_streak = ${newStreak},
        longest_streak = ${newLongest},
        last_check_date = ${today}::date,
        updated_at = now()
      WHERE user_id = ${userId}
    `;
    return newStreak;
  }

  // Streak broken — reset to 1 (checked today)
  await sql`
    UPDATE streaks SET
      current_streak = 1,
      last_check_date = ${today}::date,
      updated_at = now()
    WHERE user_id = ${userId}
  `;
  return 1;
}

export { sql };
