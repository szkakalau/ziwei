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
// when a DB function is actually invoked — not at import time.
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
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      onesignal_player_id TEXT NOT NULL,
      platform TEXT DEFAULT 'web',
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  // Backfill the UNIQUE constraint for deployments where the table already
  // exists without it. Dedupe first — CREATE UNIQUE INDEX throws if duplicate
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
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_check_date DATE,
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  await c`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Purple Star Astrology',
      topic_key TEXT,
      seo_keywords TEXT[] NOT NULL DEFAULT '{}',
      date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  // Index for isTopicKeyUsed() EXISTS lookup — stops at first match.
  await c`
    CREATE INDEX IF NOT EXISTS blog_posts_topic_key_idx ON blog_posts (topic_key)
  `;

  await c`
    CREATE TABLE IF NOT EXISTS waitlist_emails (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      source TEXT DEFAULT 'landing',
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;

  // Add columns to users for existing deployments (idempotent).
  // has_used_trial: prevents infinite-free-trial abuse — once a user has
  //   consumed a trial, /api/checkout rejects re-granting one.
  // consultation_focus / consultation_question: persisted from the snapshot
  //   consultation form so the human-written email reading can use them.
  await c`ALTER TABLE users ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT false`;
  await c`ALTER TABLE users ADD COLUMN IF NOT EXISTS consultation_focus TEXT`;
  await c`ALTER TABLE users ADD COLUMN IF NOT EXISTS consultation_question TEXT`;
  await c`ALTER TABLE users ADD COLUMN IF NOT EXISTS chat_count INTEGER DEFAULT 0`;
  // Backfill has_used_trial for existing users who already consumed a trial
  // before this column existed — otherwise they could grab another free trial.
  await c`
    UPDATE users SET has_used_trial = true
    WHERE has_used_trial = false
      AND (subscription_status IN ('trial', 'active') OR trial_ends_at IS NOT NULL)
  `;

  // ── UUID migration ─────────────────────────────────────────────────
  // Deployments created before 2026-07-03 have TEXT id columns (from
  // gen_random_uuid()::text). Convert them to native UUID for storage
  // efficiency and type safety. gen_random_uuid() always produces valid
  // UUIDs, so id::uuid is a safe cast.
  //
  // FK referencing columns must be converted before the referenced PK.
  // Each statement is wrapped in its own try/catch — if a table is already
  // UUID (re-deploy) or locked, we skip it rather than failing the whole
  // migration.
  const uuidMigrations = [
    // FK columns first
    `ALTER TABLE daily_horoscopes ALTER COLUMN user_id TYPE uuid USING user_id::uuid`,
    `ALTER TABLE push_tokens ALTER COLUMN user_id TYPE uuid USING user_id::uuid`,
    `ALTER TABLE streaks ALTER COLUMN user_id TYPE uuid USING user_id::uuid`,
    // PK / standalone columns
    `ALTER TABLE daily_horoscopes ALTER COLUMN id TYPE uuid USING id::uuid`,
    `ALTER TABLE push_tokens ALTER COLUMN id TYPE uuid USING id::uuid`,
    `ALTER TABLE blog_posts ALTER COLUMN id TYPE uuid USING id::uuid`,
    `ALTER TABLE users ALTER COLUMN id TYPE uuid USING id::uuid`,
  ];
  for (const stmt of uuidMigrations) {
    try { await c.unsafe(stmt); } catch (e) {
      // Expected: column already UUID (re-deploy) or table locked — these are
      // harmless. Unexpected: permission denied, disk full, connection drop
      // mid-ALTER — these leave the schema in an inconsistent state (some cols
      // UUID, some TEXT) and MUST be visible in logs.
      console.warn("[db] UUID migration skipped: %s — %s",
        stmt.slice(0, 60), e instanceof Error ? e.message : e);
    }
  }
}

export { sql };
