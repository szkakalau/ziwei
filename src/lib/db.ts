import { neon } from "@neondatabase/serverless";

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL environment variable is required for database operations",
    );
  }
  return neon(url);
}

// Every export calls getSql() internally, so the connection is only created
// when a DB function is actually invoked 鈥?not at import time.
// The target must be callable so the Proxy's apply trap fires for sql`...` syntax.
let _autoMigrated = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sql: any = new Proxy(
  (() => {}) as unknown as Record<string | symbol, unknown>,
  {
    get(_t, prop) {
      const client = getSql();
      return (client as unknown as Record<string | symbol, unknown>)[prop];
    },
    async apply(_t, _thisArg, args) {
      const client = getSql();
      if (!_autoMigrated) {
        _autoMigrated = true;
        try { await migrateSchema(client); } catch (e) {
          _autoMigrated = false;
          console.error("[db] auto-migration failed:", e);
        }
      }
      return (client as (...a: unknown[]) => unknown)(...args);
    },
  },
);

/** Initialize database tables (idempotent — uses IF NOT EXISTS).
 *  Public wrapper — calls migrateSchema with a fresh connection. */
export async function initDatabase(): Promise<void> {
  await migrateSchema(getSql());
}

/** Internal: run DDL against a pre-existing connection (for auto-migration). */
async function migrateSchema(c: ReturnType<typeof getSql>): Promise<void> {
  await c`
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

  await c`
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

  await c`
    CREATE TABLE IF NOT EXISTS push_tokens (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      onesignal_player_id TEXT NOT NULL,
      platform TEXT DEFAULT 'web',
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  // Backfill the UNIQUE constraint for deployments where the table already
  // exists without it. Dedupe first 鈥?CREATE UNIQUE INDEX throws if duplicate
  // (user_id, onesignal_player_id) rows already exist (they could have
  // accumulated before the constraint existed, since the old ON CONFLICT DO
  // NOTHING had no target and silently allowed dupes).
  await c`
    DELETE FROM push_tokens p1 USING push_tokens p2
    WHERE p1.user_id = p2.user_id
      AND p1.onesignal_player_id = p2.onesignal_player_id
      AND p1.id > p2.id
  `;
  await c`
    CREATE UNIQUE INDEX IF NOT EXISTS push_tokens_user_player_uniq
    ON push_tokens (user_id, onesignal_player_id)
  `;

  await c`
    CREATE TABLE IF NOT EXISTS stripe_events (
      event_id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await c`
    CREATE TABLE IF NOT EXISTS streaks (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_check_date DATE,
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  // Add columns to users for existing deployments (idempotent).
  // has_used_trial: prevents infinite-free-trial abuse 鈥?once a user has
  //   consumed a trial, /api/checkout rejects re-granting one.
  // consultation_focus / consultation_question: persisted from the snapshot
  //   consultation form so the human-written email reading can use them.
  await c`ALTER TABLE users ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT false`;
  await c`ALTER TABLE users ADD COLUMN IF NOT EXISTS consultation_focus TEXT`;
  await c`ALTER TABLE users ADD COLUMN IF NOT EXISTS consultation_question TEXT`;
  await c`ALTER TABLE users ADD COLUMN IF NOT EXISTS chat_count INTEGER DEFAULT 0`;
  // Backfill has_used_trial for existing users who already consumed a trial
  // before this column existed 鈥?otherwise they could grab another free trial.
  await c`
    UPDATE users SET has_used_trial = true
    WHERE has_used_trial = false
      AND (subscription_status IN ('trial', 'active') OR trial_ends_at IS NOT NULL)
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
           subscription_status, trial_ends_at, stripe_customer_id, has_used_trial,
           consultation_focus, consultation_question, chat_count, created_at
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

/** Update subscription status. `status` is optional 鈥?when omitted, the
 *  existing subscription_status is preserved (used by webhook handlers that
 *  only want to record the Stripe customer id without touching status). */
export async function updateSubscription(
  userId: string,
  params: { status?: string; trialEndsAt?: string; stripeCustomerId?: string; hasUsedTrial?: boolean },
): Promise<void> {
  await sql`
    UPDATE users SET
      subscription_status = COALESCE(${params.status ?? null}, subscription_status),
      trial_ends_at = COALESCE(${params.trialEndsAt ? new Date(params.trialEndsAt) : null}::timestamptz, trial_ends_at),
      stripe_customer_id = COALESCE(${params.stripeCustomerId ?? null}, stripe_customer_id),
      has_used_trial = COALESCE(${params.hasUsedTrial ?? null}, has_used_trial)
    WHERE id = ${userId}
  `;
}

/** Persist the snapshot consultation form (focus area + question). Overwrites
 *  prior values so a re-checkout reflects the latest submission. */
export async function updateConsultation(
  userId: string,
  params: { focusArea?: string; question?: string },
): Promise<void> {
  await sql`
    UPDATE users SET
      consultation_focus = ${params.focusArea ?? null},
      consultation_question = ${params.question ?? null}
    WHERE id = ${userId}
  `;
}

/** Atomically increment a trial user's chat count. Returns the new count and
 *  whether the user is still within the 5-message trial limit. Only meaningful
 *  for trial users; paid users skip this check entirely. */
export async function incrementChatCount(userId: string): Promise<{ allowed: boolean; used: number }> {
  const rows = await sql`
    UPDATE users SET chat_count = chat_count + 1
    WHERE id = ${userId}
    RETURNING chat_count
  `;
  const used = (rows[0]?.chat_count as number) ?? 0;
  return { allowed: used <= 5, used };
}

/** Get all active (trial or paid) users 鈥?for cron batch generation.
 *  Excludes expired trials (status='trial' but trial_ends_at in the past) so
 *  we don't burn LLM calls generating horoscopes for users who can't access them. */
export async function getActiveUsers(): Promise<Array<{ id: string; birth_date: string | null; birth_time: string | null; birth_place: unknown; chart_data: unknown }>> {
  return sql`
    SELECT id, birth_date, birth_time, birth_place, chart_data FROM users
    WHERE subscription_status = 'active'
       OR (subscription_status = 'trial' AND trial_ends_at > now())
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

  // The neon driver parses a DATE column (oid 1082) into a JS Date object,
  // not a string. Normalize to a YYYY-MM-DD string using LOCAL components 鈥?
  // toISOString().slice(0,10) would shift UTC+8 local-midnight back one day.
  const rawLast = row.last_check_date;
  const lastDate = rawLast instanceof Date
    ? `${rawLast.getFullYear()}-${String(rawLast.getMonth() + 1).padStart(2, "0")}-${String(rawLast.getDate()).padStart(2, "0")}`
    : rawLast ? String(rawLast).slice(0, 10) : null;

  // String-based yesterday calculation (avoids timezone bugs with Date objects)
  const todayDate = new Date(today + "T12:00:00");
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().slice(0, 10);

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

  // Streak broken 鈥?reset to 1 (checked today)
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




